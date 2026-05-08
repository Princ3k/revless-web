"use client";

import { useEffect, useState } from "react";
import { LogOut, CheckCircle, XCircle, Coins, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { Spinner } from "@/components/Spinner";
import { useRouter } from "next/navigation";
import type { VerificationHistoryItem } from "@/lib/types";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [verifications, setVerifications] = useState<VerificationHistoryItem[]>([]);
  const [verifLoading, setVerifLoading] = useState(true);

  const initials = (user?.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();
  const domain = user?.email?.split("@")[1] ?? "";
  const displayName = user?.email?.split("@")[0] ?? "";

  useEffect(() => {
    api
      .getMyVerifications(10)
      .then(setVerifications)
      .catch(() => setVerifications([]))
      .finally(() => setVerifLoading(false));
  }, []);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text)]">Profile</h1>

      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>
        <div>
          <p className="text-lg font-bold text-[var(--text)] capitalize">{displayName}</p>
          <p className="text-sm text-[var(--muted)]">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Coins size={14} />
            <span className="text-xs font-medium uppercase tracking-wide">Credits</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text)]">{user?.search_credits ?? 0}</p>
        </div>
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Shield size={14} />
            <span className="text-xs font-medium uppercase tracking-wide">Verifications</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text)]">{verifications.length}</p>
        </div>
      </div>

      {/* Account card */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--border)]">
          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Account</p>
        </div>
        <div className="divide-y divide-[var(--border)]">
          <div className="px-4 py-3 flex justify-between text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <span className="text-[var(--text)] font-medium">{user?.email}</span>
          </div>
          <div className="px-4 py-3 flex justify-between text-sm">
            <span className="text-[var(--muted)]">Airline domain</span>
            <span className="text-[var(--text)] font-mono">@{domain}</span>
          </div>
          <div className="px-4 py-3 flex justify-between text-sm">
            <span className="text-[var(--muted)]">Member ID</span>
            <span className="text-[var(--text)] font-mono text-xs">{user?.id?.slice(0, 8)}…</span>
          </div>
        </div>
      </div>

      {/* Verification history */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Recent Verifications</h2>
        {verifLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : verifications.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-6">
            No verifications yet. Verify rules to earn credits.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {verifications.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {v.is_accurate ? (
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-red-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text)] truncate">{v.carrier_name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {v.is_accurate ? "Confirmed accurate" : "Flagged outdated"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[var(--muted)] shrink-0">
                  {formatRelativeTime(v.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
