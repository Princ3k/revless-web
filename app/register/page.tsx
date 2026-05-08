"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/Spinner";

function strengthLabel(p: string): { label: string; color: string; width: string } {
  if (p.length === 0) return { label: "", color: "bg-[var(--border)]", width: "w-0" };
  if (p.length < 6) return { label: "Too short", color: "bg-red-500", width: "w-1/4" };
  if (p.length < 10) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
  if (!/[^a-zA-Z0-9]/.test(p)) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = strengthLabel(password);
  const passwordsMatch = password === confirm && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordsMatch) { setError("Passwords do not match"); return; }
    if (!agreed) { setError("Please accept the terms"); return; }
    setError("");
    setLoading(true);
    try {
      await register(email, password);
      router.replace("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4">
            <Plane size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Create account</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Use your airline work email</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@airline.com"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                </div>
                <span className="text-xs text-[var(--muted)]">{strength.label}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className={`w-full px-3.5 py-2.5 rounded-lg bg-[var(--surface)] border text-[var(--text)] placeholder-[var(--muted)] text-sm focus:outline-none transition-colors ${
                confirm.length > 0
                  ? passwordsMatch
                    ? "border-emerald-500"
                    : "border-red-500"
                  : "border-[var(--border)] focus:border-indigo-500"
              }`}
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <div
              onClick={() => setAgreed(!agreed)}
              className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                agreed ? "bg-indigo-600 border-indigo-600" : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {agreed && <Check size={10} className="text-white" />}
            </div>
            <span className="text-xs text-[var(--muted)]">
              I agree to the{" "}
              <span className="text-indigo-400">Terms of Service</span> and{" "}
              <span className="text-indigo-400">Privacy Policy</span>
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner className="w-4 h-4" /> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
