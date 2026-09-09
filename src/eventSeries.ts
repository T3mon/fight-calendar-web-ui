import type { EventListItem } from "./types";

// A promotion is "split" once its synced events show 2+ distinct SubSeries
// values (e.g. UFC has both null/flagship and "Fight Night" events). Split
// promotions get one filter key per sub-series instead of one for the whole
// promotion. This is entirely data-driven - no hardcoded list of which
// promotions have sub-series, so a newly-discovered one just starts working.
export function filterKey(promotionCode: string, subSeries: string | null): string {
  return subSeries === null ? promotionCode : `${promotionCode}::${subSeries}`;
}

export function computeSubSeriesByPromotion(events: EventListItem[]): Map<string, Set<string | null>> {
  const map = new Map<string, Set<string | null>>();
  for (const event of events) {
    const code = event.promotion.code;
    const existing = map.get(code);
    if (existing) {
      existing.add(event.subSeries);
    } else {
      map.set(code, new Set([event.subSeries]));
    }
  }
  return map;
}

// Sub-series values for a promotion, sorted alphabetically with the
// flagship/numbered bucket (null) last. Empty array means this promotion
// isn't split - render/filter it as a single unit instead.
export function subSeriesValuesFor(code: string, subSeriesByPromotion: Map<string, Set<string | null>>): (string | null)[] {
  const set = subSeriesByPromotion.get(code);
  if (!set || set.size < 2) return [];
  return [...set].sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return a.localeCompare(b);
  });
}

export function leafKeysForPromotion(code: string, subSeriesByPromotion: Map<string, Set<string | null>>): string[] {
  const values = subSeriesValuesFor(code, subSeriesByPromotion);
  return values.length === 0 ? [code] : values.map((v) => filterKey(code, v));
}

export function filterKeyForEvent(event: EventListItem, subSeriesByPromotion: Map<string, Set<string | null>>): string {
  const values = subSeriesValuesFor(event.promotion.code, subSeriesByPromotion);
  return values.length === 0 ? event.promotion.code : filterKey(event.promotion.code, event.subSeries);
}
