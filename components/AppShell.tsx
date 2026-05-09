"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, FileText, User, Plane, Coins, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: Home,     label: "Home" },
  { href: "/search",    icon: Search,   label: "Search" },
  { href: "/agreements",icon: FileText, label: "Agreements" },
  { href: "/profile",   icon: User,     label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!user.tenant_id) router.replace("/onboarding");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-solid)]">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (!user || !user.tenant_id) return null;

  const initials = user.email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-[var(--bg-solid)] overflow-hidden">

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Plane size={17} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-[var(--text)] tracking-tight leading-tight">Revless</p>
              <p className="text-[10px] text-[var(--muted)] leading-tight">ZED Flight Eligibility</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Credits widget */}
        <div className="px-3 pb-2">
          <div className="px-3 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
              <Coins size={14} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">Credits</p>
              <p className="text-lg font-bold text-[var(--text)] leading-tight">{user.search_credits}</p>
            </div>
          </div>
        </div>

        {/* User row */}
        <div className="px-3 pb-4 pt-2 border-t border-[var(--border)] mt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </div>
            <p className="text-xs text-[var(--muted)] truncate flex-1 min-w-0">{user.email}</p>
            <button
              onClick={() => { logout(); router.replace("/login"); }}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Plane size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm text-[var(--text)] tracking-tight">Revless</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-full px-3 py-1">
            <Coins size={11} className="text-indigo-400" />
            <span className="text-xs font-semibold text-[var(--text)]">{user.search_credits}</span>
            <span className="text-xs text-[var(--muted)]">credits</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden shrink-0 border-t border-[var(--border)] bg-[var(--surface)] flex">
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
    </div>
  );
}
