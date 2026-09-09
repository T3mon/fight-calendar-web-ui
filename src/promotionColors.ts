// Deterministic color per promotion code, so the same promotion always gets
// the same color regardless of fetch order - and new promotions the backend
// adds later still get a stable color with no code change here.
const PALETTE = [
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

export function colorForPromotion(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
