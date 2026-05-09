"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Shield, Clock, ChevronRight, Coins, Plane, TrendingUp, FileText,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn, formatRelativeTime, travelerTypeLabel } from "@/lib/utils";
import { Spinner } from "@/components/Spinner";
import type { SearchHistoryItem } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const displayName = user?.email?.split("@")[0] ?? "Traveler";
  const totalEligible = history.reduce((s, h) => s + h.total_filtered, 0);

  useEffect(() => {
    api.getSearchHistory(20)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-[var(--muted)]">{greeting()},</p>
          <h1 className="text-3xl font-bold text-[var(--text)] capitalize mt-0.5">{displayName}</h1>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
        >
          <Search size={15} /> New Search
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 flex items-center justify-between shadow-xl shadow-indigo-500/10">
          <div>
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Search Credits</p>
            <p className="text-4xl font-bold text-white mt-1">{user?.search_credits ?? 0}</p>
            <p className="text-indigo-200/70 text-xs mt-1.5">+5 per verification</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <Coins size={26} className="text-white" />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 flex items-center justify-between">
          <div>
            <p className="text-[var(--muted)] text-xs font-medium uppercase tracking-wide">Searches</p>
            <p className="text-4xl font-bold text-[var(--text)] mt-1">{history.length}</p>
            <p className="text-[var(--muted)] text-xs mt-1.5">Recent history</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
            <Plane size={24} className="text-indigo-400" />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 flex items-center justify-between">
          <div>
            <p className="text-[var(--muted)] text-xs font-medium uppercase tracking-wide">Eligible Routes</p>
            <p className="text-4xl font-bold text-[var(--text)] mt-1">{totalEligible}</p>
            <p className="text-[var(--muted)] text-xs mt-1.5">Across all searches</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
            <TrendingUp size={24} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* ── Two-col: actions + history ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Quick Actions</h2>

          {[
            { href: "/search",     icon: Search,   title: "Find Routes",        sub: "1 credit per search" },
            { href: "/agreements", icon: Shield,    title: "Verify Agreements",  sub: "Earn +5 credits each" },
            { href: "/agreements", icon: FileText,  title: "Agreement Matrix",   sub: "View partner airlines" },
          ].map(({ href, icon: Icon, title, sub }) => (
            <Link
              key={title}
              href={href}
              className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/40 hover:bg-[var(--surface-2)] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] group-hover:bg-indigo-500/10 flex items-center justify-center transition-colors shrink-0">
                <Icon size={17} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
                <p className="text-xs text-[var(--muted)]">{sub}</p>
              </div>
              <ChevronRight size={14} className="text-[var(--muted)] shrink-0" />
            </Link>
          ))}
        </div>

        {/* Recent searches */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Recent Searches</h2>
            <Link href="/search" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              New search →
            </Link>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <Spinner />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
                <Clock size={24} className="text-[var(--muted)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text)]">No searches yet</p>
                <p className="text-xs text-[var(--muted)] mt-1">Your search history will appear here</p>
              </div>
              <Link href="/search" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Start your first search →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border)]">
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Route</p>
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Eligible</p>
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">When</p>
              </div>

              {history.slice(0, 10).map((item, i) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex sm:grid sm:grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-2)] transition-colors",
                    i !== 0 && "border-t border-[var(--border)]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center shrink-0">
                      <Plane size={13} className="text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {item.origin} → {item.destination}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{travelerTypeLabel(item.traveler_type)}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full shrink-0",
                    item.total_filtered > 0
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-[var(--muted)] bg-[var(--surface-2)]"
                  )}>
                    {item.total_filtered} routes
                  </span>
                  <span className="text-xs text-[var(--muted)] shrink-0">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
