import { addMonths, endOfMonth, endOfYear, startOfMonth, startOfYear } from "date-fns";

export type ViewMode = "year" | "quarter" | "month";

export interface DateRange {
  start: Date;
  end: Date;
}

// Quarter mode shows the 3 months starting at viewDate's month, not a
// calendar-quarter (Jan-Mar etc.) - so "Today" always lands you in the
// first of the 3 visible months instead of possibly the last.
export function getVisibleRange(mode: ViewMode, viewDate: Date): DateRange {
  if (mode === "year") {
    return { start: startOfYear(viewDate), end: endOfYear(viewDate) };
  }
  if (mode === "quarter") {
    return { start: startOfMonth(viewDate), end: endOfMonth(addMonths(viewDate, 2)) };
  }
  return { start: startOfMonth(viewDate), end: endOfMonth(viewDate) };
}

export function shiftViewDate(mode: ViewMode, viewDate: Date, direction: 1 | -1): Date {
  if (mode === "year") {
    return new Date(viewDate.getFullYear() + direction, viewDate.getMonth(), 1);
  }
  if (mode === "quarter") {
    return addMonths(viewDate, 3 * direction);
  }
  return addMonths(viewDate, direction);
}

export function monthsInView(mode: ViewMode, viewDate: Date): Date[] {
  if (mode === "month") return [startOfMonth(viewDate)];
  if (mode === "quarter") return [0, 1, 2].map((i) => addMonths(startOfMonth(viewDate), i));
  return Array.from({ length: 12 }, (_, i) => new Date(viewDate.getFullYear(), i, 1));
}

// Whether today's actual date already falls inside the currently visible
// range - lets "Today" hide/de-emphasize itself instead of sitting there
// uselessly when it wouldn't change anything.
export function isViewingToday(mode: ViewMode, viewDate: Date): boolean {
  const { start, end } = getVisibleRange(mode, viewDate);
  const now = new Date();
  return now >= start && now <= end;
}
