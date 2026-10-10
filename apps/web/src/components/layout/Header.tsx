"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Plus, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  user?: {
    nome?: string;
    email?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search-input");
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-space-lg flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant">
              <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Buscar comandos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface-variant placeholder:text-on-surface-variant w-32 focus:w-48 transition-all"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-label-sm font-code-sm text-on-surface-variant">
                ⌘K
              </kbd>
            </div>

            <Link
              href="/analises/nova"
              className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary-container text-on-primary-fixed font-label-md text-label-md font-semibold hover:bg-primary hover:text-on-primary transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden sm:inline">Novo Diagnóstico</span>
            </Link>

            <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-on-primary-container text-xs font-bold shrink-0">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "M"}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl flex flex-col z-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-3 p-1.5 rounded-lg text-inverse-on-surface hover:bg-surface-container-highest/20 z-20"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <Sidebar
              user={user}
              onNavigate={() => setMobileMenuOpen(false)}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
