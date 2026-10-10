"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, LogOut } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user?: {
    nome?: string;
    email?: string;
  } | null;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ user, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Erro ao fazer logout", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full w-64 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] select-none",
        className
      )}
      aria-label="Menu principal"
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-space-lg flex items-center gap-space-sm bg-inverse-surface">
          <Link
            href="/analises/nova"
            onClick={onNavigate}
            className="flex items-center gap-space-sm min-w-0"
          >
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-fixed flex items-center justify-center shrink-0">
              <Terminal className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-inverse-on-surface">
              OpsPilot
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="px-space-md py-space-sm">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-colors",
                    active
                      ? "bg-primary-container text-on-primary-fixed font-semibold rounded-lg shadow-sm"
                      : "text-inverse-on-surface/70 hover:text-inverse-on-surface hover:bg-surface-container-highest/15"
                  )}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="font-label-md text-label-md">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer: profile, logout, theme */}
      <div className="p-space-md bg-inverse-surface/80">
        <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-highest/10">
          <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-fixed text-xs font-bold shrink-0">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : "M"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-md text-label-md text-inverse-on-surface truncate leading-tight">
              {user?.nome || "Alexandre Santos"}
            </p>
            <p className="font-label-sm text-label-sm text-inverse-on-surface/70 truncate">
              Líder de Operações
            </p>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1 text-inverse-on-surface/70 hover:text-inverse-on-surface hover:bg-surface-container-highest/20 rounded transition-colors disabled:opacity-50"
            title="Sair ou opções"
            aria-label="Encerrar sessão"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
