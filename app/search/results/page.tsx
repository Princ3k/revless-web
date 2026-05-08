"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { travelerTypeLabel } from "@/lib/utils";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Spinner } from "@/components/Spinner";
import type { RouteSearchResponse, TravelerType } from "@/lib/types";

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const origin = params.get("origin") ?? "";
  const destination = params.get("destination") ?? "";
  const date = params.get("date") ?? "";
  const travelerType = (params.get("traveler_type") ?? "employee") as TravelerType;

  const [results, setResults] = useState<RouteSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.searchRoutes(origin, destination, date, travelerType);
      setResults(data);
      await refreshUser();
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("402")) {
        setError("You're out of search credits. Verify rules to earn more.");
      } else {
        setError(e instanceof Error ? e.message : "Search failed");
      }
    } finally {
      setLoading(false);
    }
  }, [origin, destination, date, travelerType, refreshUser]);

  useEffect(() => {
    if (origin && destination && date) fetchRoutes();
  }, [fetchRoutes, origin, destination, date]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--text)]">
            {origin} → {destination}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {date} · {travelerTypeLabel(travelerType)}
          </p>
        </div>
        {results && (
          <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <Filter size={12} />
            <span>{results.total_filtered}/{results.total_raw}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Spinner className="w-8 h-8" />
            <p className="text-sm text-[var(--muted)]">Checking eligibility…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchRoutes}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && results && (
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-[var(--text)]">
                <span className="font-bold text-indigo-400">{results.total_filtered}</span> eligible routes
              </p>
              {results.total_raw > results.total_filtered && (
                <p className="text-xs text-[var(--muted)]">
                  {results.total_raw - results.total_filtered} filtered out
                </p>
              )}
            </div>

            {results.itineraries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <p className="text-4xl">✈️</p>
                <p className="text-sm font-medium text-[var(--text)]">No eligible routes found</p>
                <p className="text-xs text-[var(--muted)] max-w-xs">
                  Your employer&apos;s interline agreements don&apos;t cover this route for your traveler type.
                </p>
              </div>
            ) : (
              results.itineraries.map((itinerary, i) => (
                <ItineraryCard
                  key={i}
                  itinerary={itinerary}
                  onVerified={() => refreshUser()}
                />
              ))
            )}

            <p className="text-center text-xs text-[var(--muted)] py-4">
              Results are based on your employer&apos;s ZED agreement rules.
              Always confirm eligibility with your travel coordinator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
