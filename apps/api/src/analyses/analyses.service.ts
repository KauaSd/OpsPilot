import { Injectable, NotFoundException } from "@nestjs/common";
import { Analysis, Prisma } from "@prisma/client";
import { TriageAgent } from "../ai/triage.agent";
import { assertWithinLimits } from "../ai/guardrails";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";
import { ListAnalysesDto } from "./dto/list-analyses.dto";

export interface AnalysisReadDto {
  id: string;
  relato: string;
  tom: string;
  canal: string;
  resultado: Prisma.JsonValue;
  meta: Prisma.JsonValue;
  createdAt: Date;
  userId: string;
}

export interface PaginatedAnalyses {
  items: AnalysisReadDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AnalysesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agent: TriageAgent
  ) {}

  async create(
    userId: string,
    dto: CreateAnalysisDto
  ): Promise<AnalysisReadDto> {
    assertWithinLimits(dto.relato);

    const { resultado, meta } = await this.agent.run({
      relato: dto.relato,
      tom: dto.tom,
      canal: dto.canal,
      contextoAdicional: dto.contextoAdicional,
      urgenciaUsuario: dto.urgenciaUsuario,
    });

    const created = await this.prisma.analysis.create({
      data: {
        userId,
        relato: dto.relato,
        tom: dto.tom ?? "neutro",
        canal: dto.canal ?? "outro",
        resultado: resultado as unknown as Prisma.InputJsonValue,
        meta: meta as unknown as Prisma.InputJsonValue,
        categoria: resultado.categoria,
        prioridade: resultado.prioridade,
      },
    });

    return this.toDto(created);
  }

  async list(
    userId: string,
    query: ListAnalysesDto
  ): Promise<PaginatedAnalyses> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.AnalysisWhereInput = { userId };
    if (query.categoria) {
      where.categoria = query.categoria;
    }
    if (query.prioridade) {
      where.prioridade = query.prioridade;
    }
    if (query.q) {
      where.OR = [
        { relato: { contains: query.q, mode: "insensitive" } },
        { categoria: { contains: query.q, mode: "insensitive" } },
        {
          resultado: {
            path: ["resumo"],
            string_contains: query.q,
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.analysis.count({ where }),
      this.prisma.analysis.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map((item) => this.toDto(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async get(userId: string, id: string): Promise<AnalysisReadDto> {
    const found = await this.prisma.analysis.findFirst({
      where: { id, userId },
    });
    if (!found) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Análise não encontrada",
      });
    }
    return this.toDto(found);
  }

  private toDto(analysis: Analysis): AnalysisReadDto {
    return {
      id: analysis.id,
      relato: analysis.relato,
      tom: analysis.tom,
      canal: analysis.canal,
      resultado: analysis.resultado,
      meta: analysis.meta,
      createdAt: analysis.createdAt,
      userId: analysis.userId,
    };
  }
}
