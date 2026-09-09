// Mirrors FightCalendar.Web's Models/Api DTOs (fight-calendar-api repo).

export interface Promotion {
  id: number;
  code: string;
  name: string;
}

export interface Bout {
  fighterA: string;
  fighterB: string;
  weightClass: string | null;
}

export interface EventListItem {
  id: number;
  slug: string;
  title: string;
  promotion: Promotion;
  startsAt: string; // ISO 8601, UTC
  venue: string | null;
  location: string | null;
  link: string;
  mainEvent: Bout | null;
  boutCount: number;
}
