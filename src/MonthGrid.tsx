import { useMemo, useState } from "react";
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import type { EventListItem } from "./types";
import { colorForPromotion } from "./promotionColors";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function getMonthGridDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  return eachDayOfInterval({ start, end });
}

interface MonthGridProps {
  month: Date;
  events: EventListItem[];
  size: "large" | "medium";
}

export default function MonthGrid({ month, events, size }: MonthGridProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const maxDots = size === "large" ? 10 : 6;

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
    <div className={"month-grid month-grid-" + size}>
      <div className="month-grid-title">{format(month, "MMMM yyyy")}</div>
      <div className="month-grid-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="month-grid-days">
        {days.map((date) => {
          const key = dayKey(date);
          const dayEvents = eventsByDay.get(key) ?? [];
          const inMonth = isSameMonth(date, month);
          const today = isToday(date);
          const overflow = dayEvents.length - maxDots;
          return (
            <button
              key={key}
              type="button"
              className={
                "month-grid-day" +
                (inMonth ? "" : " month-grid-day-outside") +
                (today ? " month-grid-day-today" : "") +
                (dayEvents.length > 0 ? " month-grid-day-has-events" : "") +
                (selectedDay === key ? " month-grid-day-selected" : "")
              }
              onClick={() => (dayEvents.length > 0 ? setSelectedDay(selectedDay === key ? null : key) : undefined)}
              disabled={dayEvents.length === 0}
            >
              <span className="month-grid-day-number">{date.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="month-grid-day-dots">
                  {dayEvents.slice(0, maxDots).map((event) => (
                    <span key={event.id} className="month-grid-dot" style={{ backgroundColor: colorForPromotion(event.promotion.code) }} />
                  ))}
                  {overflow > 0 && <span className="month-grid-dot-overflow">+{overflow}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDay && selectedEvents.length > 0 && (
        <div className="month-grid-popover" role="dialog" aria-label={`Events on ${selectedDay}`}>
          <div className="month-grid-popover-header">
            <strong>{format(new Date(selectedDay), "EEEE, MMMM d, yyyy")}</strong>
            <button type="button" className="month-grid-popover-close" onClick={() => setSelectedDay(null)} aria-label="Close">
              &times;
            </button>
          </div>
          <ul className="month-grid-popover-list">
            {selectedEvents
              .slice()
              .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
              .map((event) => (
                <li key={event.id}>
                  <a href={event.link} target="_blank" rel="noreferrer">
                    <span className="month-grid-dot" style={{ backgroundColor: colorForPromotion(event.promotion.code) }} />
                    <span className="month-grid-popover-time">{format(new Date(event.startsAt), "h:mm a")}</span>
                    <span className="month-grid-popover-title">{event.title}</span>
                  </a>
                  {event.mainEvent && (
                    <div className="month-grid-popover-subtitle">
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
