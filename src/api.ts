import { addYears, subYears } from "date-fns";
import type { EventDetail, EventListItem, Promotion } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchPromotions(): Promise<Promotion[]> {
  return getJson<Promotion[]>("/api/promotions");
}

export function fetchEvents(): Promise<EventListItem[]> {
  // The API defaults to "now onward" when from/to are omitted, which would
  // silently hide events after they happen - pass an explicit range so
  // already-past events (which the calendar still shows, just dimmed)
  // come back too.
  const now = new Date();
  const from = subYears(now, 1).toISOString();
  const to = addYears(now, 1).toISOString();
  return getJson<EventListItem[]>(`/api/events?from=${from}&to=${to}&take=500`);
}

export function fetchEventDetail(slug: string): Promise<EventDetail> {
  return getJson<EventDetail>(`/api/events/${slug}`);
}
