"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Spinner } from "./Spinner";
import type { StaleRule } from "@/lib/types";

interface Props {
  staleRules: StaleRule[];
  onClose: () => void;
  onVerified: (credits: number) => void;
}

export function VerificationModal({ staleRules, onClose, onVerified }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [latestCredits, setLatestCredits] = useState<number | null>(null);

  async function vote(ruleId: string, isAccurate: boolean) {
    setLoading(true);
    setError("");
    try {
      const res = await api.verifyRule(ruleId, isAccurate);
      setLatestCredits(res.user_search_credits);
      setDone(true);
      onVerified(res.user_search_credits);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text)]">Verify Agreement Rules</h3>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[var(--muted)]">
          These rules haven&apos;t been verified recently. Help the community by confirming
          whether they&apos;re still accurate. You&apos;ll earn +5 credits per vote.
        </p>

        {done ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle size={32} className="text-emerald-400" />
            <p className="text-sm font-medium text-[var(--text)]">Thanks for verifying!</p>
            {latestCredits !== null && (
              <p className="text-xs text-[var(--muted)]">{latestCredits} credits remaining</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {staleRules.map((rule) => (
              <div
                key={rule.rule_id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">
                    {rule.carrier_name}{" "}
                    <span className="font-mono text-[var(--muted)] text-xs">({rule.carrier_iata})</span>
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Confidence: {rule.confidence_score}/5
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => vote(rule.rule_id, true)}
                    disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={12} /> Still valid
                  </button>
                  <button
                    onClick={() => vote(rule.rule_id, false)}
                    disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={12} /> Outdated
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}

        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
}
