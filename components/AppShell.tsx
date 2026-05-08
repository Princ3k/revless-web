"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, FileText, User, Plane, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/agreements", icon: FileText, label: "Agreements" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!user.tenant_id) router.replace("/onboarding");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg)]">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (!user || !user.tenant_id) return null;

  return (
    <div className="flex flex-col h-screen bg-[var(--bg)]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Plane size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm text-[var(--text)] tracking-tight">Revless</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-full px-3 py-1">
          <Coins size={12} className="text-indigo-400" />
          <span className="text-xs font-semibold text-[var(--text)]">{user.search_credits}</span>
          <span className="text-xs text-[var(--muted)]">credits</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Bottom nav */}
      <nav className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-indigo-400" : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
