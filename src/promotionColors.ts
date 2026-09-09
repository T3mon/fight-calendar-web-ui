export type PromotionGroupName = "UFC" | "Boxing";

interface PromotionInfo {
  color?: string; // only set for standalone (ungrouped) promotions
  group: PromotionGroupName | null;
}

// Curated grouping (per product decision, not derived from the API - the
// backend has no concept of "family of promotions"). Grouped promotions all
// share their group's color; standalone ones get their own. Any promotion
// code not listed here falls back to a deterministic hash-based color, so
// newly added promotions never end up uncolored.
const PROMOTION_INFO: Record<string, PromotionInfo> = {
  UFC: { group: "UFC" },
  DWCS: { group: "UFC" },
  UFCBJJ: { group: "UFC" },
  MATCHROOM: { group: "Boxing" },
  "TOP RANK": { group: "Boxing" },
  MVP: { group: "Boxing" },
  ZUFFA: { group: "Boxing" },
  ONE: { color: "#14b8a6", group: null },
  PFL: { color: "#3b82f6", group: null },
  RIZIN: { color: "#39ff14", group: null },
  RAF: { color: "#f97316", group: null },
  BKFC: { color: "#f59e0b", group: null },
};

const GROUP_COLORS: Record<PromotionGroupName, string> = {
  UFC: "#e63946",
  Boxing: "#eab308",
};

export const GROUP_ORDER: PromotionGroupName[] = ["UFC", "Boxing"];

const FALLBACK_PALETTE = [
  "#e63946",
  "#f4a261",
  "#2a9d8f",
  "#264653",
  "#8338ec",
  "#3a86ff",
  "#ffb703",
  "#fb5607",
  "#06d6a0",
  "#ef476f",
  "#118ab2",
  "#9b5de5",
];

function hashCode(code: string): number {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function fallbackColor(code: string): string {
  return FALLBACK_PALETTE[hashCode(code) % FALLBACK_PALETTE.length];
}

export function colorForPromotion(code: string): string {
  const info = PROMOTION_INFO[code];
  if (!info) return fallbackColor(code);
  if (info.group) return GROUP_COLORS[info.group];
  return info.color ?? fallbackColor(code);
}

export function groupForPromotion(code: string): PromotionGroupName | null {
  return PROMOTION_INFO[code]?.group ?? null;
}

export function colorForGroup(group: PromotionGroupName): string {
  return GROUP_COLORS[group];
}
