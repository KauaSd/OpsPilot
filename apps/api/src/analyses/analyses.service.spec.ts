import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TriageAgent } from "../ai/triage.agent";
import { PrismaService } from "../prisma/prisma.service";
import { AnalysesService } from "./analyses.service";

const resultado = {
  resumo: "Falha recorrente no login",
  categoria: "suporte_tecnico",
  prioridade: "alta",
  justificativaPrioridade: "Bloqueia o acesso",
  sentimento: "negativo",
  riscos: [],
  acoesRecomendadas: [],
  informacoesFaltantes: [],
  respostaSugerida: "Verificando",
  confianca: 0.9,
  requerRevisaoHumana: false,
};
const meta = {
  modelo: "llama-test",
  latenciaMs: 10,
  tokens: 42,
  versaoPrompt: "v1",
};

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: "a1",
    userId: "u1",
    relato: "x".repeat(30),
    tom: "neutro",
    canal: "outro",
    resultado,
    meta,
    categoria: resultado.categoria,
    prioridade: resultado.prioridade,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("AnalysesService", () => {
  let service: AnalysesService;
  const prisma = {
    analysis: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const agent = { run: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnalysesService,
        { provide: PrismaService, useValue: prisma },
        { provide: TriageAgent, useValue: agent },
      ],
    }).compile();
    service = moduleRef.get(AnalysesService);
  });

  describe("create", () => {
    it("persiste a análise e devolve o DTO canônico", async () => {
      agent.run.mockResolvedValue({ resultado, meta });
      prisma.analysis.create.mockResolvedValue(record());

      const dto = await service.create("u1", {
        relato: "x".repeat(30),
      } as never);

      expect(agent.run).toHaveBeenCalledWith(
        expect.objectContaining({ relato: "x".repeat(30) })
      );
      expect(prisma.analysis.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "u1",
            tom: "neutro",
            canal: "outro",
            categoria: "suporte_tecnico",
            prioridade: "alta",
          }),
        })
      );
      expect(dto).toEqual(
        expect.objectContaining({
          id: "a1",
          userId: "u1",
          relato: "x".repeat(30),
          resultado,
          meta,
        })
      );
    });

    it("respeita tom e canal informados", async () => {
      agent.run.mockResolvedValue({ resultado, meta });
      prisma.analysis.create.mockResolvedValue(
        record({ tom: "formal", canal: "email" })
      );

      await service.create("u1", {
        relato: "x".repeat(30),
        tom: "formal",
        canal: "email",
      } as never);

      expect(prisma.analysis.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tom: "formal", canal: "email" }),
        })
      );
    });
  });

  describe("get", () => {
    it("devolve a análise do próprio usuário", async () => {
      prisma.analysis.findFirst.mockResolvedValue(record());
      const dto = await service.get("u1", "a1");
      expect(prisma.analysis.findFirst).toHaveBeenCalledWith({
        where: { id: "a1", userId: "u1" },
      });
      expect(dto.id).toBe("a1");
    });

    it("lança NotFoundException para análise de outro usuário", async () => {
      prisma.analysis.findFirst.mockResolvedValue(null);
      await expect(service.get("u2", "a1")).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });

  describe("list", () => {
    it("filtra por usuário e pagina", async () => {
      prisma.analysis.count.mockResolvedValue(1);
      prisma.analysis.findMany.mockResolvedValue([record()]);

      const page = await service.list("u1", {
        page: 1,
        limit: 20,
      } as never);

      expect(prisma.analysis.count).toHaveBeenCalledWith({
        where: { userId: "u1" },
      });
      expect(prisma.analysis.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "u1" },
          skip: 0,
          take: 20,
        })
      );
      expect(page).toEqual({
        items: [expect.objectContaining({ id: "a1" })],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it("aplica filtros de categoria, prioridade e busca", async () => {
      prisma.analysis.count.mockResolvedValue(0);
      prisma.analysis.findMany.mockResolvedValue([]);

      await service.list("u1", {
        q: "login",
        categoria: "suporte_tecnico",
        prioridade: "alta",
        page: 2,
        limit: 10,
      } as never);

      expect(prisma.analysis.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          where: expect.objectContaining({
            userId: "u1",
            categoria: "suporte_tecnico",
            prioridade: "alta",
            OR: expect.any(Array),
          }),
        })
      );
    });
  });
});
