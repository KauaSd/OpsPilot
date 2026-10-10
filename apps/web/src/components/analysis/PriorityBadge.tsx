"use client";

import * as React from "react";
import { Flame, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "critica" | "alta" | "media" | "baixa" | string;
  sla?: string;
  className?: string;
}

export function PriorityBadge({
  priority,
  sla,
  className,
}: PriorityBadgeProps) {
  const norm = priority.toLowerCase();

  const isCritical = norm.includes("crit") || norm.includes("urgente");
  const isHigh = norm.includes("alta") || norm.includes("alto");
  const isMedium = norm.includes("med") || norm.includes("moder");

  if (isCritical) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold uppercase bg-error-container text-on-error-container",
          className
        )}
      >
        <Flame className="h-4 w-4 text-error shrink-0" strokeWidth={1.5} />
        <span>CRÍTICA {sla && `(${sla})`}</span>
      </span>
    );
  }

  if (isHigh) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold uppercase bg-tertiary-fixed text-on-tertiary-container",
          className
        )}
      >
        <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>ALTA {sla && `(${sla})`}</span>
      </span>
    );
  }

  if (isMedium) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold uppercase bg-[rgba(202,138,4,0.12)] text-[#CA8A04]",
          className
        )}
      >
        <Clock className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>MÉDIA {sla && `(${sla})`}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold uppercase bg-[rgba(22,163,74,0.12)] text-[#16A34A]",
        className
      )}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span>BAIXA {sla && `(${sla})`}</span>
    </span>
  );
}