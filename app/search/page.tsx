"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Search, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TravelerType } from "@/lib/types";

const TRAVELER_TYPES: { value: TravelerType; label: string; desc: string }[] = [
  { value: "employee", label: "Employee",  desc: "You" },
  { value: "spouse",   label: "Spouse",    desc: "Partner" },
  { value: "companion",label: "Companion", desc: "Listed" },
  { value: "parent",   label: "Parent",    desc: "Family" },
];

export default function SearchPage() {
  const router = useRouter();
  const [origin, setOrigin]           = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate]               = useState("");
  const [travelerType, setTravelerType] = useState<TravelerType>("employee");

  const canSearch = origin.length === 3 && destination.length === 3 && date;

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    if (!canSearch) return;
    const params = new URLSearchParams({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      date,
      traveler_type: travelerType,
    });
    router.push(`/search/results?${params}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-full">
      {/* Hero banner */}
      <div className="relative border-b border-[var(--border)] bg-gradient-to-b from-indigo-950/40 to-transparent px-6 py-14 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
            <Plane size={11} /> ZED Eligibility Engine
          </div>
          <h1 className="text-4xl font-bold text-[var(--text)] tracking-tight">Find Your Routes</h1>
          <p className="text-[var(--muted)] mt-3 text-base max-w-sm mx-auto">
            Only itineraries your employee agreements allow are shown
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-10 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Route card */}
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Route</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide mb-1">From</p>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="YYZ"
                  maxLength={3}
                  className="font-mono text-3xl font-bold text-[var(--text)] bg-transparent outline-none placeholder-[var(--border)] w-full tracking-wider"
                />
              </div>
              <button
                type="button"
                onClick={swap}
                className="w-10 h-10 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-indigo-400 hover:border-indigo-500/40 transition-all shrink-0"
              >
                <ArrowLeftRight size={14} />
              </button>
              <div className="flex-1 text-right">
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide mb-1">To</p>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="KUL"
                  maxLength={3}
                  className="font-mono text-3xl font-bold text-[var(--text)] bg-transparent outline-none placeholder-[var(--border)] w-full text-right tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Departure Date</p>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="text-lg font-semibold text-[var(--text)] bg-transparent outline-none w-full"
            />
          </div>

          {/* Traveler type */}
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Traveler Type</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TRAVELER_TYPES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTravelerType(value)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-3 rounded-xl text-sm font-medium transition-all border",
                    travelerType === value
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--surface-3)]"
                  )}
                >
                  <span className="font-semibold">{label}</span>
                  <span className="text-[10px] opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSearch}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Search size={18} />
            Find Eligible Routes
          </button>

          <p className="text-center text-xs text-[var(--muted)]">
            1 search credit will be deducted
          </p>
        </form>
      </div>
    </div>
  );
}
