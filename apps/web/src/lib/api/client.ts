import {
  AnalysisResult,
  CreateAnalysisInput,
  AnalysisFilters,
  PaginatedAnalyses,
} from "../schemas/analysis";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function fetchFromProxy<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `/api/proxy/${cleanEndpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.message || `Erro na requisição (${res.status})`,
      res.status,
      data
    );
  }

  return data as T;
}

export const analysisApi = {
  async getAnalyses(filters?: AnalysisFilters): Promise<PaginatedAnalyses> {
    const params = new URLSearchParams();
    if (filters?.q) params.set("q", filters.q);
    if (filters?.prioridade && filters.prioridade !== "todas") {
      params.set("prioridade", filters.prioridade);
    }
    if (filters?.categoria && filters.categoria !== "todas") {
      params.set("categoria", filters.categoria);
    }
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return fetchFromProxy<PaginatedAnalyses>(`analises${queryString}`, {
      method: "GET",
    });
  },

  async getAnalysis(id: string): Promise<AnalysisResult> {
    return fetchFromProxy<AnalysisResult>(`analises/${id}`, {
      method: "GET",
    });
  },

  async createAnalysis(data: CreateAnalysisInput): Promise<AnalysisResult> {
    return fetchFromProxy<AnalysisResult>("analises", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
