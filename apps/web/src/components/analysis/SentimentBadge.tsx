"use client";

import * as React from "react";
import { Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  sentiment: "positivo" | "neutro" | "negativo" | string;
  detail?: string;
  className?: string;
}

export function SentimentBadge({
  sentiment,
  detail,
  className,
}: SentimentBadgeProps) {
  const norm = sentiment.toLowerCase();

  let isNegative = norm.includes("negativo") || norm.includes("frustrado");
  let isPositive = norm.includes("positivo") || norm.includes("satisfeito");

  const label = detail
    ? detail
    : isNegative
    ? "Negativo / Frustrado (Risco de Evasão)"
    : isPositive
    ? "Positivo / Cooperativo"
    : "Neutro / Operacional";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold",
        isNegative
          ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
          : isPositive
          ? "bg-primary-container/15 text-primary"
          : "bg-surface-container text-on-surface-variant",
        className
      )}
    >
      {isNegative ? (
        <Frown className="h-4 w-4 text-tertiary shrink-0" strokeWidth={1.5} />
      ) : isPositive ? (
        <Smile className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      ) : (
        <Meh className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      )}
      <span>{label}</span>
    </span>
  );
}