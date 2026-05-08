import { type ClassValue, clsx } from "clsx";
import type { TravelerType, ZedTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function boardingColor(p: number): string {
  if (p >= 0.7) return "text-emerald-400";
  if (p >= 0.4) return "text-amber-400";
  return "text-red-400";
}

export function zedTierColor(tier: ZedTier): string {
  return {
    high: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    low: "bg-red-500/20 text-red-300 border-red-500/30",
  }[tier];
}

export function travelerTypeLabel(t: TravelerType): string {
  return {
    employee: "Employee",
    spouse: "Spouse",
    companion: "Companion",
    parent: "Parent",
  }[t];
}

export function resultSummary(raw: number, filtered: number): string {
  if (raw === 0) return "No routes returned";
  const dropped = raw - filtered;
  if (dropped === 0)
    return `${filtered} route${filtered === 1 ? "" : "s"} eligible`;
  return `${filtered} of ${raw} eligible · ${dropped} filtered`;
}
