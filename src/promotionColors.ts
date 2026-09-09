export type PromotionGroupName = "UFC" | "Boxing";

interface PromotionInfo {
  color: string;
  group: PromotionGroupName | null;
}

// Curated palette + grouping (per product decision, not derived from the API -
// the backend has no concept of "family of promotions"). Any promotion code
// not listed here falls back to a deterministic hash-based color, so newly
// added promotions never end up uncolored.
const PROMOTION_INFO: Record<string, PromotionInfo> = {
  UFC: { color: "#e63946", group: "UFC" },
  DWCS: { color: "#d4af37", group: "UFC" },
  UFCBJJ: { color: "#8338ec", group: "UFC" },
  MATCHROOM: { color: "#22d3ee", group: "Boxing" },
  "TOP RANK": { color: "#1e3a8a", group: "Boxing" },
  MVP: { color: "#fbbf24", group: "Boxing" },
  BKFC: { color: "#f59e0b", group: "Boxing" },
  ZUFFA: { color: "#991b1b", group: "Boxing" },
  ONE: { color: "#14b8a6", group: null },
  PFL: { color: "#3b82f6", group: null },
  RIZIN: { color: "#39ff14", group: null },
  RAF: { color: "#f97316", group: null },
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

export function colorForPromotion(code: string): string {
  const info = PROMOTION_INFO[code];
  if (info) return info.color;
  return FALLBACK_PALETTE[hashCode(code) % FALLBACK_PALETTE.length];
}

export function groupForPromotion(code: string): PromotionGroupName | null {
  return PROMOTION_INFO[code]?.group ?? null;
}

export function colorForGroup(group: PromotionGroupName): string {
  return GROUP_COLORS[group];
}
