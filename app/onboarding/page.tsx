"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import type { TenantRequestRead } from "@/lib/types";

export default function OnboardingPage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();

  const [existing, setExisting] = useState<TenantRequestRead | null | undefined>(undefined);
  const [airlineName, setAirlineName] = useState("");
  const [airlineCode, setAirlineCode] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.tenant_id) {
      router.replace("/dashboard");
      return;
    }
    api
      .getMyTenantRequest()
      .then(setExisting)
      .catch(() => setExisting(null));
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const req = await api.createTenantRequest(
        airlineName,
        airlineCode,
        message || undefined
      );
      setExisting(req);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshUser();
      const req = await api.getMyTenantRequest();
      setExisting(req);
      if (user?.tenant_id) router.replace("/dashboard");
    } finally {
      setRefreshing(false);
    }
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  // Loading state while checking existing request
  if (existing === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4">
            <Plane size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] text-center">Airline Not Found</h1>
          <p className="text-sm text-[var(--muted)] text-center mt-1">
            We couldn&apos;t find <strong className="text-[var(--text)]">{user?.email?.split("@")[1]}</strong> in our system.
          </p>
        </div>

        {existing ? (
          /* Show status of existing request */
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {existing.status === "pending" && (
                <Clock size={20} className="text-amber-400 shrink-0" />
              )}
              {existing.status === "approved" && (
                <CheckCircle size={20} className="text-emerald-400 shrink-0" />
              )}
              {existing.status === "rejected" && (
                <XCircle size={20} className="text-red-400 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-[var(--text)] capitalize">{existing.status}</p>
                <p className="text-xs text-[var(--muted)]">{existing.airline_name} ({existing.airline_code})</p>
              </div>
            </div>

            {existing.status === "pending" && (
              <p className="text-sm text-[var(--muted)]">
                Your request is under review. We&apos;ll link your account automatically once approved.
              </p>
            )}

            {existing.status === "rejected" && existing.admin_note && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-xs text-red-400">{existing.admin_note}</p>
              </div>
            )}

            {existing.status === "approved" && (
              <p className="text-sm text-emerald-400">
                Your airline was approved! Refresh to access the app.
              </p>
            )}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full py-2.5 rounded-xl border border-[var(--border)] text-[var(--muted)] text-sm font-medium flex items-center justify-center gap-2 hover:text-[var(--text)] hover:border-indigo-500/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh Status
            </button>
          </div>
        ) : (
          /* Request form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
                Airline Name
              </label>
              <input
                value={airlineName}
                onChange={(e) => setAirlineName(e.target.value)}
                placeholder="Porter Airlines"
                required
                minLength={2}
                maxLength={120}
                className="px-3.5 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
                IATA Code
              </label>
              <input
                value={airlineCode}
                onChange={(e) => setAirlineCode(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="PD"
                required
                minLength={2}
                maxLength={3}
                className="px-3.5 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
                Note (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any additional info for our team…"
                maxLength={2000}
                rows={3}
                className="px-3.5 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner className="w-4 h-4" /> : "Request Access"}
            </button>
          </form>
        )}

        <button
          onClick={handleLogout}
          className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors text-center"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
