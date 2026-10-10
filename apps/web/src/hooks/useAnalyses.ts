"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analysisApi } from "@/lib/api/client";
import {
  AnalysisFilters,
  CreateAnalysisInput,
  AnalysisResult,
  PaginatedAnalyses,
} from "@/lib/schemas/analysis";
import { toast } from "sonner";

export function useAnalyses(filters?: AnalysisFilters) {
  return useQuery<PaginatedAnalyses, Error>({
    queryKey: ["analyses", filters],
    queryFn: () => analysisApi.getAnalyses(filters),
  });
}

export function useAnalysis(id: string) {
  return useQuery<AnalysisResult, Error>({
    queryKey: ["analysis", id],
    queryFn: () => analysisApi.getAnalysis(id),
    enabled: Boolean(id),
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<AnalysisResult, Error, CreateAnalysisInput>({
    mutationFn: (data) => analysisApi.createAnalysis(data),
    onSuccess: (newAnalysis) => {
      // Invalidate analyses list query
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Diagnóstico concluído com sucesso!");
    },
    onError: (error) => {
      toast.error(`Falha ao processar análise: ${error.message}`);
    },
  });
}
