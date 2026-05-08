"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { zedTierColor, travelerTypeLabel, formatDate } from "@/lib/utils";
import { ZedBadge } from "@/components/ZedBadge";
import { Spinner } from "@/components/Spinner";
import { cn } from "@/lib/utils";
import type { AgreementMatrixResponse } from "@/lib/types";

export default function AgreementsPage() {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<AgreementMatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadCarrier, setUploadCarrier] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [approving, setApproving] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  async function loadMatrix() {
    setLoading(true);
    try {
      const res = await api.getAgreementMatrix();
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load agreements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMatrix(); }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadCarrier.trim()) return;
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      await api.uploadDocument(uploadCarrier.toUpperCase(), file);
      setUploadSuccess(`Document uploaded for ${uploadCarrier.toUpperCase()}. Awaiting peer review.`);
      setUploadCarrier("");
      await loadMatrix();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleApprove(documentId: string) {
    setApproving(documentId);
    try {
      const res = await api.approveDocument(documentId);
      if (res.document_now_official) {
        setUploadSuccess("Document approved! Rules have been updated.");
      }
      await refreshUser();
      await loadMatrix();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setApproving(null);
    }
  }

  const filteredRules = data?.rules.filter(
    (r) =>
      filter === "" ||
      r.carrier_iata.toLowerCase().includes(filter.toLowerCase()) ||
      r.carrier_name.toLowerCase().includes(filter.toLowerCase())
  ) ?? [];

  const grouped = filteredRules.reduce<Record<string, typeof filteredRules>>(
    (acc, rule) => {
      const key = rule.carrier_iata;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rule);
      return acc;
    },
    {}
  );

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Agreements</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Your employer&apos;s interline rule matrix</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
        >
          <Upload size={13} /> Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.heic,.webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Upload flow */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col gap-3">
        <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Upload Agreement Document</p>
        <div className="flex gap-2">
          <input
            value={uploadCarrier}
            onChange={(e) => setUploadCarrier(e.target.value.toUpperCase().slice(0, 3))}
            placeholder="Carrier IATA (e.g. TK)"
            maxLength={3}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadCarrier.length < 2 || uploading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            {uploading ? <Spinner className="w-4 h-4" /> : <><FileText size={14} /> Choose file</>}
          </button>
        </div>
        {uploadSuccess && (
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle size={12} /> {uploadSuccess}
          </p>
        )}
        {uploadError && (
          <p className="text-xs text-red-400">{uploadError}</p>
        )}
      </div>

      {/* Pending documents */}
      {data && data.pending_documents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)] mb-3">
            Pending Peer Review ({data.pending_documents.length})
          </h2>
          <div className="flex flex-col gap-2">
            {data.pending_documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl bg-[var(--surface)] border border-amber-500/20 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={13} className="text-amber-400" />
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {doc.carrier_name}{" "}
                        <span className="font-mono text-[var(--muted)] text-xs">({doc.carrier_iata})</span>
                      </p>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      By {doc.uploader_email} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[var(--muted)]">
                      {doc.approval_count}/{doc.required_approvals} approvals
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(doc.approval_count / doc.required_approvals) * 100}%` }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(doc.id)}
                    disabled={approving === doc.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {approving === doc.id ? (
                      <Spinner className="w-3 h-3" />
                    ) : (
                      <CheckCircle size={12} />
                    )}
                    Approve (+5 credits)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agreement matrix */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-3">
          <h2 className="text-sm font-semibold text-[var(--text)] shrink-0">Agreement Rules</h2>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by carrier…"
            className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] text-xs focus:outline-none focus:border-indigo-500 transition-colors min-w-0"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 text-center">{error}</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-8">No rules found</p>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.entries(grouped).map(([carrierIata, rules]) => (
              <div key={carrierIata} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{carrierIata}</span>
                  <span className="text-xs text-[var(--muted)]">{rules[0]?.carrier_name}</span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {rules.map((rule) => (
                    <div key={rule.rule_id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-[var(--text)]">{travelerTypeLabel(rule.traveler_type)}</p>
                        <div className="flex items-center gap-1.5 text-xs">
                          {rule.is_unaccompanied_allowed ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle size={10} /> Unaccompanied OK
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle size={10} /> Must accompany
                            </span>
                          )}
                          {rule.is_stale && (
                            <span className="flex items-center gap-1 text-amber-400">
                              <AlertTriangle size={10} /> Stale
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <ZedBadge tier={rule.zed_tier} />
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            rule.is_verified
                              ? "text-emerald-400 bg-emerald-500/10"
                              : "text-amber-400 bg-amber-500/10"
                          )}
                        >
                          {rule.confidence_score}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
