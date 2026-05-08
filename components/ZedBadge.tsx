import { cn, zedTierColor } from "@/lib/utils";
import type { ZedTier } from "@/lib/types";

export function ZedBadge({ tier }: { tier: ZedTier }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border",
        zedTierColor(tier)
      )}
    >
      ZED {tier.toUpperCase()}
    </span>
  );
}
