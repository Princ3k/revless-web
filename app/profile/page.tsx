"use client";

import { useEffect, useState } from "react";
import { LogOut, CheckCircle, XCircle, Coins, Shield, Mail, Globe, Hash } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Spinner } from "@/components/Spinner";
import { useRouter } from "next/navigation";
import type { VerificationHistoryItem } from "@/lib/types";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [verifications, setVerifications] = useState<VerificationHistoryItem[]>([]);
  const [verifLoading, setVerifLoading] = useState(true);

  const initials    = (user?.email ?? "?").split("@")[0].slice(0, 2).toUpperCase();
  const domain      = user?.email?.split("@")[1] ?? "";
  const displayName = user?.email?.split("@")[0] ?? "";

  useEffect(() => {
    api.getMyVerifications(20)
      .then(setVerifications)
      .catch(() => setVerifications([]))
      .finally(() => setVerifLoading(false));
  }, []);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column: identity + account ── */}
        <div className="flex flex-col gap-4">

          {/* Avatar card */}
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text)] capitalize">{displayName}</p>
              <p className="text-sm text-[var(--muted)]">{user?.email}</p>
            </div>

            {/* Stats row */}
            <div className="w-full grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-indigo-400">
                  <Coins size={13} />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Credits</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text)]">{user?.search_credits ?? 0}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Shield size={13} />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Verifications</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text)]">{verifications.length}</p>
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)]">
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Account Details</p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              <div className="px-4 py-3.5 flex items-center gap-3">
                <Mail size={14} className="text-[var(--muted)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--muted)]">Email</p>
                  <p className="text-sm text-[var(--text)] truncate">{user?.email}</p>
                </div>
              </div>
              <div className="px-4 py-3.5 flex items-center gap-3">
                <Globe size={14} className="text-[var(--muted)] shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--muted)]">Airline Domain</p>
                  <p className="text-sm text-[var(--text)] font-mono">@{domain}</p>
                </div>
              </div>
              <div className="px-4 py-3.5 flex items-center gap-3">
                <Hash size={14} className="text-[var(--muted)] shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--muted)]">Member ID</p>
                  <p className="text-sm text-[var(--text)] font-mono">{user?.id?.slice(0, 8)}…</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* ── Right column: verification history ── */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Verification History
          </h2>

          {verifLoading ? (
            <div className="flex justify-center py-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <Spinner />
            </div>
          ) : verifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
                <Shield size={24} className="text-[var(--muted)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">No verifications yet</p>
                <p className="text-xs text-[var(--muted)] mt-1">Verify agreement rules to earn +5 credits each</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border)]">
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Carrier</p>
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Result</p>
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">When</p>
              </div>
              {verifications.map((v, i) => (
                <div
                  key={v.id}
                  className={cn(
                    "flex sm:grid sm:grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-2)] transition-colors",
                    i !== 0 && "border-t border-[var(--border)]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {v.is_accurate ? (
                      <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={15} className="text-red-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">{v.carrier_name}</p>
                      <p className="text-xs text-[var(--muted)] font-mono">{v.carrier_iata}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full shrink-0",
                    v.is_accurate
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-red-400 bg-red-500/10"
                  )}>
                    {v.is_accurate ? "Accurate" : "Outdated"}
                  </span>
                  <span className="text-xs text-[var(--muted)] shrink-0">
                    {formatRelativeTime(v.created_at)}
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
