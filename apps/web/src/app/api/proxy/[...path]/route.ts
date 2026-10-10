import { NextRequest, NextResponse } from "next/server";
import {
  getMockAnalyses,
  getMockAnalysisById,
  createMockAnalysis,
} from "@/lib/api/mockData";
import {
  categoriaLabelToEnum,
  toFrontAnalysis,
} from "@/lib/api/adapters/analysis-adapter";
import { resolveApiBase } from "@/lib/api/backend-url";
import { clientKey, rateLimit } from "@/lib/api/rate-limit";

const COOKIE_NAME = "auth_token";

async function handleProxy(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  const pathSegments = params.path || [];
  const targetPath = pathSegments.join("/");
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
  const apiUrl = resolveApiBase(process.env.API_URL);
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // IA/análises sempre exige sessão (nem em mock mode) — sem bypass.
  const isAnalyses =
    pathSegments[0] === "analises" || pathSegments[0] === "analyses";
  if (isAnalyses && !token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  // POST de análise é a chamada cara de IA: limite mais rígido por IP.
  const costly = isAnalyses && method === "POST";
  const limit = rateLimit(
    clientKey(request.headers, costly ? "proxy:ai" : "proxy"),
    costly ? 10 : 60,
    60_000
  );
  if (!limit.ok) {
    return NextResponse.json(
      { message: "Muitas requisições. Aguarde um instante e tente novamente." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  // 1. MOCK SERVER-SIDE MODE
  if (useMocks) {
    const url = new URL(request.url);

    // Endpoint: /api/proxy/analises
    if (pathSegments[0] === "analises" || pathSegments[0] === "analyses") {
      // Sub-route: /api/proxy/analises/:id
      if (pathSegments.length > 1) {
        const id = pathSegments[1];
        if (method === "GET") {
          const item = getMockAnalysisById(id);
          if (!item) {
            return NextResponse.json(
              { message: `Análise com id '${id}' não encontrada` },
              { status: 404 }
            );
          }
          return NextResponse.json(item);
        }
      }

      // Route: /api/proxy/analises
      if (method === "GET") {
        const q = url.searchParams.get("q") || undefined;
        const prioridade = url.searchParams.get("prioridade") || undefined;
        const categoria = url.searchParams.get("categoria") || undefined;
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);

        const data = getMockAnalyses({ q, prioridade, categoria, page, limit });
        return NextResponse.json(data);
      }

      if (method === "POST") {
        try {
          const body = await request.json();
          const created = createMockAnalysis(body);
          return NextResponse.json(created, { status: 201 });
        } catch (err: any) {
          return NextResponse.json(
            { message: err.message || "Erro ao processar análise mock" },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.json(
      { message: `Rota mock '/${targetPath}' não configurada` },
      { status: 404 }
    );
  }

  // 2. REAL BACKEND API PROXY MODE
  try {
    const isAnalyses =
      pathSegments[0] === "analises" || pathSegments[0] === "analyses";

    // Rewrite front route (/analises) to back route (/analyses)
    const backSegments = isAnalyses
      ? ["analyses", ...pathSegments.slice(1)]
      : pathSegments;
    const backPath = backSegments.join("/");

    const targetUrl = new URL(`${apiUrl.replace(/\/$/, "")}/${backPath}`);
    const incomingUrl = new URL(request.url);
    incomingUrl.searchParams.forEach((val, key) => {
      if (isAnalyses && key === "categoria") {
        const enumValue = categoriaLabelToEnum(val);
        if (enumValue) {
          targetUrl.searchParams.set("categoria", enumValue);
        }
        return; // "todas"/desconhecido -> remove o parâmetro
      }
      targetUrl.searchParams.set(key, val);
    });

    const headers = new Headers();
    if (request.headers.get("content-type")) {
      headers.set("content-type", request.headers.get("content-type")!);
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const init: RequestInit = {
      method,
      headers,
    };

    if (method !== "GET" && method !== "HEAD") {
      const textBody = await request.text();
      if (textBody) {
        init.body = textBody;
      }
    }

    const backendRes = await fetch(targetUrl.toString(), init);
    const backendContentType = backendRes.headers.get("content-type") || "";
    const raw = await backendRes.text();

    // Adapt successful JSON analyses responses to the front contract
    if (
      isAnalyses &&
      backendRes.ok &&
      backendContentType.includes("application/json")
    ) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const isList = method === "GET" && pathSegments.length === 1;
        const body = isList
          ? {
              items: ((parsed.items as unknown[]) ?? []).map((item) =>
                toFrontAnalysis(item as never)
              ),
              total: parsed.total,
              page: parsed.page,
              limit: parsed.limit,
              totalPages: parsed.totalPages,
            }
          : toFrontAnalysis(parsed as never);
        return NextResponse.json(body, { status: backendRes.status });
      } catch {
        // cai no fallback abaixo (resposta crua)
      }
    }

    return new NextResponse(raw, {
      status: backendRes.status,
      headers: backendContentType
        ? { "content-type": backendContentType }
        : undefined,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json(
      {
        message: "Falha na comunicação com o backend OpsPilot",
        error: message,
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleProxy(request, params, "DELETE");
}
