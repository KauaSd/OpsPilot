import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { ConfidenceMeter } from "../ConfidenceMeter";
import { CategoryBadge } from "../CategoryBadge";
import { SentimentBadge } from "../SentimentBadge";
import { PriorityBadge } from "../PriorityBadge";

describe("Componentes Visuais do Stitch", () => {
  it("renderiza ConfidenceMeter com porcentagem calculada", () => {
    const html = renderToString(
      React.createElement(ConfidenceMeter, { confidence: 96.8, modelVersion: "Modelo FinOps v3.2" })
    );
    expect(html).toContain("Confiança da IA:");
    expect(html).toContain("96.8%");
    expect(html).toContain("Modelo FinOps v3.2");
  });

  it("renderiza CategoryBadge com nome correto", () => {
    const html = renderToString(
      React.createElement(CategoryBadge, { category: "Financeiro / Faturamento" })
    );
    expect(html).toContain("Financeiro / Faturamento");
  });

  it("renderiza SentimentBadge com estilo de frustração/evasão", () => {
    const html = renderToString(
      React.createElement(SentimentBadge, { sentiment: "negativo" })
    );
    expect(html).toContain("Negativo / Frustrado (Risco de Evasão)");
  });

  it("renderiza PriorityBadge com criticidade e SLA", () => {
    const html = renderToString(
      React.createElement(PriorityBadge, { priority: "critica", sla: "SLA &lt; 2H" })
    );
    expect(html).toContain("CRÍTICA");
  });

  it("PriorityBadge crítica usa tokens error-container", () => {
    const html = renderToString(
      React.createElement(PriorityBadge, { priority: "critica" })
    );
    expect(html).toContain("bg-error-container");
    expect(html).toContain("text-on-error-container");
  });
});
