"use client";

import { useEffect, useState, useRef } from "react";
import {
  Upload, CheckCircle, XCircle, AlertTriangle, FileText,
  Plus, Pencil, X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { travelerTypeLabel, formatDate } from "@/lib/utils";
import { ZedBadge } from "@/components/ZedBadge";
import { Spinner } from "@/components/Spinner";
import { cn } from "@/lib/utils";
import type { AgreementMatrixResponse, MatrixRuleRow, TravelerType, ZedTier } from "@/lib/types";

const TRAVELER_TYPES: TravelerType[] = ["employee", "spouse", "parent", "companion"];
const ZED_TIERS: ZedTier[] = ["low", "medium", "high"];

export default function AgreementsPage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<AgreementMatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  // Upload
  const [uploadCarrier, setUploadCarrier] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Cancel
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Approve
  const [approving, setApproving] = useState<string | null>(null);

  // Add rule modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    carrier_iata: "",
    traveler_type: "employee" as TravelerType,
    zed_tier: "medium" as ZedTier,
    is_unaccompanied_allowed: true,
    confidence_score: 3,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit rule modal
  const [editingRule, setEditingRule] = useState<MatrixRuleRow | null>(null);
  const [editForm, setEditForm] = useState<{
    zed_tier: ZedTier;
    is_unaccompanied_allowed: boolean;
    confidence_score: number;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  async function loadMatrix() {
    setLoading(true);
    try {
      setData(await api.getAgreementMatrix());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMatrix(); }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadCarrier.trim()) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      await api.uploadDocument(uploadCarrier.toUpperCase(), file);
      setUploadMsg({ type: "ok", text: `Uploaded for ${uploadCarrier.toUpperCase()}. Awaiting peer review.` });
      setUploadCarrier("");
      await loadMatrix();
    } catch (err: unknown) {
      setUploadMsg({ type: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleApprove(documentId: string) {
    setApproving(documentId);
    try {
      await api.approveDocument(documentId);
      await refreshUser();
      await loadMatrix();
    } catch (err: unknown) {
      setUploadMsg({ type: "err", text: err instanceof Error ? err.message : "Approval failed" });
    } finally {
      setApproving(null);
    }
  }

  async function handleCancel(documentId: string) {
    setCancelling(documentId);
    try {
      await api.cancelDocument(documentId);
      await loadMatrix();
    } catch (err: unknown) {
      setUploadMsg({ type: "err", text: err instanceof Error ? err.message : "Cancel failed" });
    } finally {
      setCancelling(null);
    }
  }

  async function handleAddRule(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      await api.createRule(
        addForm.carrier_iata,
        addForm.traveler_type,
        addForm.is_unaccompanied_allowed,
        addForm.zed_tier,
        addForm.confidence_score,
      );
      setShowAdd(false);
      setAddForm({ carrier_iata: "", traveler_type: "employee", zed_tier: "medium", is_unaccompanied_allowed: true, confidence_score: 3 });
      await loadMatrix();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to create rule");
    } finally {
      setAddLoading(false);
    }
  }

  function openEdit(rule: MatrixRuleRow) {
    setEditingRule(rule);
    setEditForm({
      zed_tier: rule.zed_tier,
      is_unaccompanied_allowed: rule.is_unaccompanied_allowed,
      confidence_score: rule.confidence_score,
    });
    setEditError("");
  }

  async function handleEditRule(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    if (!editingRule || !editForm) return;
    setEditLoading(true);
    setEditError("");
    try {
      await api.updateRule(editingRule.rule_id, editForm);
      setEditingRule(null);
      setEditForm(null);
      await loadMatrix();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update rule");
    } finally {
      setEditLoading(false);
    }
  }

  const filteredRules = data?.rules.filter(
    (r) =>
      filter === "" ||
      r.carrier_iata.toLowerCase().includes(filter.toLowerCase()) ||
      r.carrier_name.toLowerCase().includes(filter.toLowerCase())
  ) ?? [];

  const grouped = filteredRules.reduce<Record<string, typeof filteredRules>>((acc, rule) => {
    if (!acc[rule.carrier_iata]) acc[rule.carrier_iata] = [];
    acc[rule.carrier_iata].push(rule);
    return acc;
  }, {});

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
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
        {uploadMsg && (
          <p className={cn("text-xs flex items-center gap-1", uploadMsg.type === "ok" ? "text-emerald-400" : "text-red-400")}>
            {uploadMsg.type === "ok" ? <CheckCircle size={12} /> : null}
            {uploadMsg.text}
          </p>
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
                  <p className="text-xs text-[var(--muted)] shrink-0">
                    {doc.approval_count}/{doc.required_approvals} approvals
                  </p>
                </div>

                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(doc.approval_count / doc.required_approvals) * 100}%` }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(doc.id)}
                    disabled={approving === doc.id || cancelling === doc.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {approving === doc.id ? <Spinner className="w-3 h-3" /> : <CheckCircle size={12} />}
                    Approve (+5 credits)
                  </button>
                  {doc.uploader_email === user?.email && (
                    <button
                      onClick={() => handleCancel(doc.id)}
                      disabled={cancelling === doc.id || approving === doc.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {cancelling === doc.id ? <Spinner className="w-3 h-3" /> : <X size={12} />}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agreement matrix */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold text-[var(--text)] shrink-0">Agreement Rules</h2>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by carrier…"
            className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] text-xs focus:outline-none focus:border-indigo-500 transition-colors min-w-0"
          />
          <button
            onClick={() => { setAddError(""); setShowAdd(true); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <Plus size={12} /> Add Rule
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
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
                        <button
                          onClick={() => openEdit(rule)}
                          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                          title="Edit rule"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}
        >
          <form
            onSubmit={handleAddRule}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text)]">Add Agreement Rule</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-[var(--muted)] hover:text-[var(--text)]">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Carrier IATA</label>
                <input
                  value={addForm.carrier_iata}
                  onChange={(e) => setAddForm(f => ({ ...f, carrier_iata: e.target.value.toUpperCase().slice(0, 3) }))}
                  placeholder="e.g. TK"
                  maxLength={3}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Traveler Type</label>
                <select
                  value={addForm.traveler_type}
                  onChange={(e) => setAddForm(f => ({ ...f, traveler_type: e.target.value as TravelerType }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-indigo-500"
                >
                  {TRAVELER_TYPES.map(t => (
                    <option key={t} value={t}>{travelerTypeLabel(t)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">ZED Tier</label>
                <select
                  value={addForm.zed_tier}
                  onChange={(e) => setAddForm(f => ({ ...f, zed_tier: e.target.value as ZedTier }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-indigo-500 capitalize"
                >
                  {ZED_TIERS.map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
                <span className="text-sm text-[var(--text)]">Unaccompanied allowed</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={addForm.is_unaccompanied_allowed}
                  onClick={() => setAddForm(f => ({ ...f, is_unaccompanied_allowed: !f.is_unaccompanied_allowed }))}
                  className={cn(
                    "relative w-10 h-6 rounded-full transition-colors",
                    addForm.is_unaccompanied_allowed ? "bg-indigo-600" : "bg-[var(--border)]"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    addForm.is_unaccompanied_allowed ? "translate-x-5" : "translate-x-1"
                  )} />
                </button>
              </label>
            </div>

            {addError && <p className="text-xs text-red-400">{addError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-sm hover:text-[var(--text)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addLoading || addForm.carrier_iata.length < 2}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {addLoading ? <Spinner className="w-4 h-4" /> : "Add Rule"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && editForm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setEditingRule(null); setEditForm(null); } }}
        >
          <form
            onSubmit={handleEditRule}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--text)]">Edit Rule</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  <span className="font-mono">{editingRule.carrier_iata}</span> · {travelerTypeLabel(editingRule.traveler_type)}
                </p>
              </div>
              <button type="button" onClick={() => { setEditingRule(null); setEditForm(null); }} className="text-[var(--muted)] hover:text-[var(--text)]">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">ZED Tier</label>
                <select
                  value={editForm.zed_tier}
                  onChange={(e) => setEditForm(f => f ? { ...f, zed_tier: e.target.value as ZedTier } : f)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-indigo-500"
                >
                  {ZED_TIERS.map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Confidence Score (0–99)</label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={editForm.confidence_score}
                  onChange={(e) => setEditForm(f => f ? { ...f, confidence_score: Number(e.target.value) } : f)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
                <span className="text-sm text-[var(--text)]">Unaccompanied allowed</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editForm.is_unaccompanied_allowed}
                  onClick={() => setEditForm(f => f ? { ...f, is_unaccompanied_allowed: !f.is_unaccompanied_allowed } : f)}
                  className={cn(
                    "relative w-10 h-6 rounded-full transition-colors",
                    editForm.is_unaccompanied_allowed ? "bg-indigo-600" : "bg-[var(--border)]"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    editForm.is_unaccompanied_allowed ? "translate-x-5" : "translate-x-1"
                  )} />
                </button>
              </label>
            </div>

            {editError && <p className="text-xs text-red-400">{editError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setEditingRule(null); setEditForm(null); }}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-sm hover:text-[var(--text)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {editLoading ? <Spinner className="w-4 h-4" /> : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
