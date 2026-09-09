import { useMemo, useState } from "react";
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import type { EventListItem } from "./types";
import { colorForPromotion } from "./promotionColors";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MAX_BAR_HEIGHT = 22;
const MIN_BAR_HEIGHT = 6;
const SATURATION_CAP = 6; // days with this many events or more show the tallest bar

function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function getMonthGridDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  return eachDayOfInterval({ start, end });
}

// Instead of one dot per event (illegible past 3-4), each day gets a single
// stacked bar: height says "how busy" (capped, not linear-to-infinity), and
// segment widths say "which promotions" - proportion, not a count you have
// to squint at and tally up yourself.
interface PromotionSegment {
  code: string;
  color: string;
  share: number;
}

function buildSegments(dayEvents: EventListItem[]): PromotionSegment[] {
  const counts = new Map<string, number>();
  for (const event of dayEvents) {
    counts.set(event.promotion.code, (counts.get(event.promotion.code) ?? 0) + 1);
  }
  const total = dayEvents.length;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, color: colorForPromotion(code), share: count / total }));
}

interface HeatmapMonthProps {
  month: Date;
  events: EventListItem[];
  size: "large" | "medium";
}

function HeatmapMonth({ month, events, size }: HeatmapMonthProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventListItem[]>();
    for (const event of events) {
      const key = dayKey(new Date(event.startsAt));
      const existing = map.get(key);
      if (existing) {
        existing.push(event);
      } else {
        map.set(key, [event]);
      }
    }
    return map;
  }, [events]);

  const days = getMonthGridDays(month);
  const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];

  return (
    <div className={"heatmap-month heatmap-month-" + size}>
      <div className="heatmap-month-title">{format(month, "MMMM yyyy")}</div>
      <div className="heatmap-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="heatmap-days">
        {days.map((date) => {
          const key = dayKey(date);
          const dayEvents = eventsByDay.get(key) ?? [];
          const inMonth = isSameMonth(date, month);
          const today = isToday(date);
          const segments = buildSegments(dayEvents);
          const barHeight =
            dayEvents.length === 0
              ? 0
              : MIN_BAR_HEIGHT + (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * Math.min(dayEvents.length, SATURATION_CAP) / SATURATION_CAP;
          return (
            <button
              key={key}
              type="button"
              className={
                "heatmap-day" +
                (inMonth ? "" : " heatmap-day-outside") +
                (today ? " heatmap-day-today" : "") +
                (dayEvents.length > 0 ? " heatmap-day-has-events" : "") +
                (selectedDay === key ? " heatmap-day-selected" : "")
              }
              onClick={() => (dayEvents.length > 0 ? setSelectedDay(selectedDay === key ? null : key) : undefined)}
              disabled={dayEvents.length === 0}
            >
              <span className="heatmap-day-top">
                <span className="heatmap-day-number">{date.getDate()}</span>
                {dayEvents.length > 0 && <span className="heatmap-day-count">{dayEvents.length}</span>}
              </span>
              {segments.length > 0 && (
                <span className="heatmap-bar" style={{ height: barHeight }}>
                  {segments.map((segment) => (
                    <span
                      key={segment.code}
                      className="heatmap-bar-segment"
                      style={{ backgroundColor: segment.color, width: `${segment.share * 100}%` }}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDay && selectedEvents.length > 0 && (
        <div className="heatmap-popover" role="dialog" aria-label={`Events on ${selectedDay}`}>
          <div className="heatmap-popover-header">
            <strong>{format(new Date(selectedDay), "EEEE, MMMM d, yyyy")}</strong>
            <button type="button" className="heatmap-popover-close" onClick={() => setSelectedDay(null)} aria-label="Close">
              &times;
            </button>
          </div>
          <ul className="heatmap-popover-list">
            {selectedEvents
              .slice()
              .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
              .map((event) => (
                <li key={event.id}>
                  <a href={event.link} target="_blank" rel="noreferrer">
                    <span className="heatmap-dot" style={{ backgroundColor: colorForPromotion(event.promotion.code) }} />
                    <span className="heatmap-popover-time">{format(new Date(event.startsAt), "h:mm a")}</span>
                    <span className="heatmap-popover-title">{event.title}</span>
                  </a>
                  {event.mainEvent && (
                    <div className="heatmap-popover-subtitle">
                      {event.mainEvent.fighterA} vs {event.mainEvent.fighterB}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface HeatmapCalendarProps {
  months: Date[];
  events: EventListItem[];
}

export default function HeatmapCalendar({ months, events }: HeatmapCalendarProps) {
  const size = months.length === 1 ? "large" : "medium";
  return (
    <div className="heatmap-layout">
      {months.map((month) => (
        <HeatmapMonth key={month.toISOString()} month={month} events={events} size={size} />
      ))}
    </div>
  );
}
