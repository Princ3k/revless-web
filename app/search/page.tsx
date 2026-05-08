"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TravelerType } from "@/lib/types";

const TRAVELER_TYPES: { value: TravelerType; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "spouse", label: "Spouse" },
  { value: "companion", label: "Companion" },
  { value: "parent", label: "Parent" },
];

export default function SearchPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelerType, setTravelerType] = useState<TravelerType>("employee");

  const canSearch = origin.length === 3 && destination.length === 3 && date;

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSubmit(e: React.FormEvent) {
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
    <div className="px-4 py-6 flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Find Routes</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Only eligible itineraries are shown</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Route block */}
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col gap-3">
          <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Route</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px] text-[var(--muted)] uppercase">From</span>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="YYZ"
                maxLength={3}
                className="font-mono text-2xl font-bold text-[var(--text)] bg-transparent outline-none placeholder-[var(--border)] w-full"
              />
            </div>

            <button
              type="button"
              onClick={swap}
              className="w-9 h-9 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-indigo-400 hover:border-indigo-500/40 transition-colors shrink-0"
            >
              <ArrowLeftRight size={14} />
            </button>

            <div className="flex-1 flex flex-col gap-1 items-end">
              <span className="text-[10px] text-[var(--muted)] uppercase">To</span>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="KUL"
                maxLength={3}
                className="font-mono text-2xl font-bold text-[var(--text)] bg-transparent outline-none placeholder-[var(--border)] w-full text-right"
              />
            </div>
          </div>
        </div>

        {/* Date block */}
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Departure Date</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="text-base font-semibold text-[var(--text)] bg-transparent outline-none w-full"
          />
        </div>

        {/* Traveler type */}
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col gap-3">
          <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Traveler Type</label>
          <div className="grid grid-cols-2 gap-2">
            {TRAVELER_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTravelerType(value)}
                className={cn(
                  "py-2 rounded-lg text-sm font-medium transition-colors border",
                  travelerType === value
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSearch}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={18} />
          Find Routes
        </button>
      </form>
    </div>
  );
}
