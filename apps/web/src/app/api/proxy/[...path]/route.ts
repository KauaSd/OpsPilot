import { NextRequest, NextResponse } from "next/server";
import {
  getMockAnalyses,
  getMockAnalysisById,
  createMockAnalysis,
} from "@/lib/api/mockData";

const COOKIE_NAME = "auth_token";

async function handleProxy(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  const pathSegments = params.path || [];
  const targetPath = pathSegments.join("/");
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
  const apiUrl = process.env.API_URL || "http://localhost:3001";
  const token = request.cookies.get(COOKIE_NAME)?.value;

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
    const targetUrl = new URL(`${apiUrl}/${targetPath}`);
    // Forward query parameters
    const incomingUrl = new URL(request.url);
    incomingUrl.searchParams.forEach((val, key) => {
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
    const responseData = await backendRes.text();

    const forwardHeaders = new Headers();
    const contentType = backendRes.headers.get("content-type");
    if (contentType) {
      forwardHeaders.set("content-type", contentType);
    }

    return new NextResponse(responseData, {
      status: backendRes.status,
      headers: forwardHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Falha na comunicação com o backend OpsPilot",
        error: err.message,
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
