"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Plane } from "lucide-react";
import { ZedBadge } from "./ZedBadge";
import { VerificationModal } from "./VerificationModal";
import { formatDuration, boardingColor } from "@/lib/utils";
import type { Itinerary } from "@/lib/types";

interface Props {
  itinerary: Itinerary;
  onVerified?: (credits: number) => void;
}

export function ItineraryCard({ itinerary, onVerified }: Props) {
  const [showModal, setShowModal] = useState(false);
  const {
    legs,
    total_duration_minutes,
    total_zed_tier,
    requires_verification,
    stale_rules,
    boarding_probability,
  } = itinerary;

  const route = [
    legs[0]?.origin,
    ...legs.map((l) => l.destination),
  ].join(" → ");

  const pct = Math.round(boarding_probability * 100);

  return (
    <>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3 hover:border-indigo-500/40 transition-colors">
        {/* Route header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-[var(--text)]">{route}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[var(--muted)] text-xs">
              <Clock size={11} />
              <span>{formatDuration(total_duration_minutes)}</span>
              <span>·</span>
              <span>{legs.length} leg{legs.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <ZedBadge tier={total_zed_tier} />
        </div>

        {/* Leg timeline */}
        <div className="flex flex-col gap-1.5">
          {legs.map((leg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <Plane size={11} className="text-indigo-400 shrink-0" />
              <span className="font-mono text-[var(--muted)]">{leg.carrier_iata}</span>
              <span className="text-[var(--text)]">
                {leg.origin} → {leg.destination}
              </span>
              <span className="text-[var(--muted)] ml-auto">
                {formatDuration(leg.duration_minutes)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${boardingColor(boarding_probability)}`}>
              {pct}%
            </span>
            <span className="text-xs text-[var(--muted)]">boarding est.</span>
          </div>

          {requires_verification && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <AlertTriangle size={12} />
              Verify rules
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <VerificationModal
          staleRules={stale_rules}
          onClose={() => setShowModal(false)}
          onVerified={(credits) => {
            setShowModal(false);
            onVerified?.(credits);
          }}
        />
      )}
    </>
  );
}
