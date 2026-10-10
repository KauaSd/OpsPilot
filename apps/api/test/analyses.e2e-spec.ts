import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GroqClient } from "../src/ai/groq.client";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter";
import { PrismaService } from "../src/prisma/prisma.service";

const validResult = {
  resumo: "Cliente relata falha no login após atualização.",
  categoria: "suporte_tecnico",
  prioridade: "alta",
  justificativaPrioridade: "Bloqueia o acesso de usuários ao sistema.",
  sentimento: "negativo",
  riscos: ["Indisponibilidade para vários usuários"],
  acoesRecomendadas: [
    {
      acao: "Verificar serviço de autenticação",
      responsavelSugerido: "Time de Infra",
      prazoSugerido: "Hoje",
    },
  ],
  informacoesFaltantes: ["ID do usuário afetado"],
  respostaSugerida: "Olá, estamos verificando o problema de login.",
  confianca: 0.8,
  requerRevisaoHumana: false,
};

interface StoredUser {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  createdAt: Date;
}

interface StoredAnalysis {
  id: string;
  userId: string;
  relato: string;
  tom: string;
  canal: string;
  resultado: Record<string, unknown>;
  meta: Record<string, unknown>;
  categoria: string;
  prioridade: string;
  createdAt: Date;
}

function createFakePrisma() {
  const users: StoredUser[] = [];
  const analyses: StoredAnalysis[] = [];
  let seq = 0;

  const matches = (a: StoredAnalysis, where: any): boolean => {
    if (where.userId && a.userId !== where.userId) return false;
    if (where.categoria && a.categoria !== where.categoria) return false;
    if (where.prioridade && a.prioridade !== where.prioridade) return false;
    if (where.OR) {
      const ors = where.OR as Array<any>;
      const term = String(ors[0].relato?.contains ?? "").toLowerCase();
      const resumo = String(a.resultado?.resumo ?? "").toLowerCase();
      const ok =
        a.relato.toLowerCase().includes(term) ||
        a.categoria.toLowerCase().includes(term) ||
        resumo.includes(term);
      if (!ok) return false;
    }
    return true;
  };

  return {
    user: {
      create: async ({ data }: any): Promise<StoredUser> => {
        const user: StoredUser = {
          id: `u${++seq}`,
          createdAt: new Date(),
          ...data,
        };
        users.push(user);
        return user;
      },
      findUnique: async ({ where }: any): Promise<StoredUser | null> =>
        users.find(
          (u) =>
            (where.id && u.id === where.id) ||
            (where.email && u.email === where.email)
        ) ?? null,
    },
    analysis: {
      create: async ({ data }: any): Promise<StoredAnalysis> => {
        const analysis: StoredAnalysis = {
          id: `a${++seq}`,
          createdAt: new Date(),
          ...data,
        };
        analyses.push(analysis);
        return analysis;
      },
      findFirst: async ({ where }: any): Promise<StoredAnalysis | null> =>
        analyses.find(
          (a) => a.id === where.id && a.userId === where.userId
        ) ?? null,
      findMany: async ({ where, skip = 0, take = 100 }: any) =>
        analyses
          .filter((a) => matches(a, where))
          .sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime())
          .slice(skip, skip + take),
      count: async ({ where }: any): Promise<number> =>
        analyses.filter((a) => matches(a, where)).length,
    },
    $connect: async (): Promise<void> => undefined,
    $disconnect: async (): Promise<void> => undefined,
    $queryRaw: async (): Promise<unknown[]> => [{}],
    enableShutdownHooks: async (): Promise<void> => undefined,
  };
}

describe("OpsPilot API (e2e)", () => {
  let app: INestApplication;
  let http: request.SuperTest<request.Test>;

  const validTokenFor = async (): Promise<{ token: string; userId: string }> => {
    const email = `user${Date.now()}${Math.random()}@opspilot.dev`;
    const res = await http
      .post("/api/v1/auth/register")
      .send({ nome: "Analista Teste", email, senha: "segredo123" })
      .expect(201);
    return { token: res.body.token, userId: res.body.user.id };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createFakePrisma())
      .overrideProvider(GroqClient)
      .useValue({
        complete: async () => ({
          text: JSON.stringify(validResult),
          usage: { totalTokens: 10 },
          model: "llama-test",
        }),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    http = request(app.getHttpServer()) as unknown as request.SuperTest<
      request.Test
    >;
  });

  afterAll(async () => {
    await app.close();
  });

  it("registra, faz login e cria/lista/obtém uma análise", async () => {
    const email = `flow${Date.now()}@opspilot.dev`;
    const register = await http
      .post("/api/v1/auth/register")
      .send({ nome: "Mariana", email, senha: "segredo123" })
      .expect(201);
    expect(register.body.token).toBeDefined();

    const login = await http
      .post("/api/v1/auth/login")
      .send({ email, senha: "segredo123" })
      .expect(200);
    const token = login.body.token as string;

    const created = await http
      .post("/api/v1/analyses")
      .set("Authorization", `Bearer ${token}`)
      .send({ relato: "o sistema de login está fora do ar".padEnd(30, " "), canal: "ticket" })
      .expect(201);
    expect(created.body.id).toBeDefined();
    expect(created.body.resultado.categoria).toBe("suporte_tecnico");

    const list = await http
      .get("/api/v1/analyses")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0].id).toBe(created.body.id);

    const one = await http
      .get(`/api/v1/analyses/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(one.body.id).toBe(created.body.id);
  });

  it("rejeita requisição sem token (401)", async () => {
    await http.get("/api/v1/analyses").expect(401);
  });

  it("não vaza análise de outro usuário (404)", async () => {
    const a = await validTokenFor();
    const created = await http
      .post("/api/v1/analyses")
      .set("Authorization", `Bearer ${a.token}`)
      .send({ relato: "x".repeat(30) })
      .expect(201);

    const b = await validTokenFor();
    await http
      .get(`/api/v1/analyses/${created.body.id}`)
      .set("Authorization", `Bearer ${b.token}`)
      .expect(404);
  });

  it("bloqueia a 11ª criação no mesmo minuto (429) por usuário", async () => {
    const { token } = await validTokenFor();
    for (let i = 0; i < 10; i += 1) {
      await http
        .post("/api/v1/analyses")
        .set("Authorization", `Bearer ${token}`)
        .send({ relato: `relato de teste numero ${i}`.padEnd(30, " ") })
        .expect(201);
    }
    await http
      .post("/api/v1/analyses")
      .set("Authorization", `Bearer ${token}`)
      .send({ relato: "relato de teste numero extra".padEnd(30, " ") })
      .expect(429);
  });

  it("bloqueia a 6ª credencial no mesmo minuto (429) por e-mail", async () => {
    const email = `throttle${Date.now()}@opspilot.dev`;
    await http
      .post("/api/v1/auth/register")
      .send({ nome: "Throttle", email, senha: "segredo123" })
      .expect(201);

    for (let i = 0; i < 5; i += 1) {
      await http
        .post("/api/v1/auth/login")
        .send({ email, senha: "segredo123" })
        .expect(200);
    }

    await http
      .post("/api/v1/auth/login")
      .send({ email, senha: "segredo123" })
      .expect(429);
  });
});
