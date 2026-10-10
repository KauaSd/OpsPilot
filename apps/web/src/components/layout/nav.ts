import {
  Sparkles,
  Clock,
  BarChart3,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Nova Análise",
    href: "/analises/nova",
    icon: Sparkles,
    match: (p) => p.startsWith("/analises/nova"),
  },
  {
    title: "Histórico",
    href: "/historico",
    icon: Clock,
    match: (p) =>
      p.startsWith("/historico") ||
      (/^\/analises\/[^/]+$/.test(p) && !p.startsWith("/analises/nova")),
  },
  {
    title: "Relatórios / Métricas",
    href: "/relatorios",
    icon: BarChart3,
    match: (p) => p.startsWith("/relatorios"),
  },
  {
    title: "Configurações da Empresa",
    href: "/configuracoes",
    icon: SlidersHorizontal,
    match: (p) => p.startsWith("/configuracoes"),
  },
];
