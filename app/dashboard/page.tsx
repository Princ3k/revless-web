"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Shield, Clock, ChevronRight, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatRelativeTime, travelerTypeLabel, resultSummary } from "@/lib/utils";
import { Spinner } from "@/components/Spinner";
import type { SearchHistoryItem } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
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

  useEffect(() => {
    api
      .getSearchHistory(5)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Greeting */}
      <div>
        <p className="text-[var(--muted)] text-sm">{greeting()}</p>
        <h1 className="text-2xl font-bold text-[var(--text)] capitalize">{displayName}</h1>
      </div>

      {/* Credits card */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 flex items-center justify-between">
        <div>
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Search Credits</p>
          <p className="text-4xl font-bold text-white mt-1">{user?.search_credits ?? 0}</p>
          <p className="text-indigo-200 text-xs mt-1">Verify rules to earn more</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
          <Coins size={28} className="text-white" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/search"
          className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Search size={16} className="text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">New Search</p>
          <p className="text-xs text-[var(--muted)]">Find eligible routes</p>
        </Link>
        <Link
          href="/agreements"
          className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Shield size={16} className="text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">Verify Rules</p>
          <p className="text-xs text-[var(--muted)]">Earn +5 credits each</p>
        </Link>
      </div>

      {/* Recent searches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">Recent Searches</h2>
          <Link href="/search" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            New search
          </Link>
        </div>

        {historyLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <Clock size={32} className="text-[var(--border)]" />
            <p className="text-sm text-[var(--muted)]">No searches yet</p>
            <Link href="/search" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Start your first search →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">
                    {item.origin} → {item.destination}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span>{travelerTypeLabel(item.traveler_type)}</span>
                    <span>·</span>
                    <span>{resultSummary(item.total_raw, item.total_filtered)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] shrink-0">
                  <span>{formatRelativeTime(item.created_at)}</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
