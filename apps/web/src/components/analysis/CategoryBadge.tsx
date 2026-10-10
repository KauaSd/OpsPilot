"use client";

import * as React from "react";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md",
        className
      )}
    >
      <Folder className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
      <span>{category}</span>
    </span>
  );
}