"use client";

import * as React from "react";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  confidence: number; // e.g. 0.968 or 96.8
  modelVersion?: string;
  className?: string;
}

export function ConfidenceMeter({
  confidence,
  modelVersion = "Modelo FinOps v3.2",
  className,
}: ConfidenceMeterProps) {
  // Normalize to percentage between 0 and 100
  const percentage =
    confidence <= 1
      ? Math.round(confidence * 1000) / 10
      : Math.round(confidence * 10) / 10;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Brain
          className="h-4 w-4 text-primary-container shrink-0"
          strokeWidth={1.5}
        />
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Confiança da IA:
        </span>
        <span className="font-label-md text-label-md font-semibold text-on-surface tabular-nums">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-container rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {modelVersion && (
        <span className="hidden sm:inline font-code-sm text-code-sm text-on-surface-variant">
          {modelVersion}
        </span>
      )}
    </div>
  );
}