import type { EventListItem, Promotion } from "./types";

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
  return getJson<EventListItem[]>("/api/events?take=500");
}
