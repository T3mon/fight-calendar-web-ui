import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";
import type { EventListItem } from "./types";
import { colorForPromotion } from "./promotionColors";
import FightCardModal from "./FightCardModal";

const MONTH_NAMES = Array.from({ length: 12 }, (_, m) => format(new Date(2000, m, 1), "MMMM"));
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MAX_DOTS_PER_DAY = 4;

interface YearCalendarProps {
  year: number;
  events: EventListItem[];
}

function getMonthGridDays(year: number, month: number): Date[] {
  const start = startOfWeek(startOfMonth(new Date(year, month, 1)));
  const end = endOfWeek(endOfMonth(new Date(year, month, 1)));
  return eachDayOfInterval({ start, end });
}

function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export default function YearCalendar({ year, events }: YearCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [fightCardSlug, setFightCardSlug] = useState<string | null>(null);

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

  const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];

  return (
    <div className="year-grid">
      {MONTH_NAMES.map((monthName, month) => {
        const days = getMonthGridDays(year, month);
        return (
          <div className="year-grid-month" key={monthName}>
            <div className="year-grid-month-title">{monthName}</div>
            <div className="year-grid-weekdays">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="year-grid-days">
              {days.map((date) => {
                const key = dayKey(date);
                const dayEvents = eventsByDay.get(key) ?? [];
                const inMonth = isSameMonth(date, new Date(year, month, 1));
                const today = isToday(date);
                const isPast = date < startOfToday();
                return (
                  <button
                    key={key}
                    type="button"
                    className={
                      "year-grid-day" +
                      (inMonth ? "" : " year-grid-day-outside") +
                      (today ? " year-grid-day-today" : "") +
                      (isPast ? " year-grid-day-past" : "") +
                      (dayEvents.length > 0 ? " year-grid-day-has-events" : "") +
                      (selectedDay === key ? " year-grid-day-selected" : "")
                    }
                    onClick={() => (dayEvents.length > 0 ? setSelectedDay(selectedDay === key ? null : key) : undefined)}
                    disabled={dayEvents.length === 0}
                  >
                    <span className="year-grid-day-number">{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <span className="year-grid-day-dots">
                        {dayEvents.slice(0, MAX_DOTS_PER_DAY).map((event) => (
                          <span
                            key={event.id}
                            className="year-grid-dot"
                            style={{ backgroundColor: colorForPromotion(event.promotion.code) }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedDay && selectedEvents.length > 0 && (
        <div className="year-grid-popover" role="dialog" aria-label={`Events on ${selectedDay}`}>
          <div className="year-grid-popover-header">
            <strong>{format(new Date(selectedDay), "EEEE, MMMM d, yyyy")}</strong>
            <button type="button" className="year-grid-popover-close" onClick={() => setSelectedDay(null)} aria-label="Close">
              &times;
            </button>
          </div>
          <ul className="year-grid-popover-list">
            {selectedEvents
              .slice()
              .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
              .map((event) => (
                <li key={event.id}>
                  <div className="year-grid-popover-row">
                    <a href={event.link} target="_blank" rel="noreferrer">
                      <span
                        className="year-grid-dot"
                        style={{ backgroundColor: colorForPromotion(event.promotion.code) }}
                      />
                      <span className="year-grid-popover-time">{format(new Date(event.startsAt), "h:mm a")}</span>
                      <span className="year-grid-popover-title">{event.title}</span>
                    </a>
                    <button
                      type="button"
                      className="fight-card-trigger"
                      onClick={() => setFightCardSlug(event.slug)}
                      aria-label={`View full fight card for ${event.title}`}
                    >
                      Card
                    </button>
                  </div>
                  {event.mainEvent && (
                    <div className="year-grid-popover-subtitle">
                      {event.mainEvent.fighterA} vs {event.mainEvent.fighterB}
                    </div>
                  )}
                </li>
              ))}
          </ul>
          <div className="year-grid-popover-footnote">Times shown in your local timezone. End times aren't tracked - fights don't have a fixed duration.</div>
        </div>
      )}

      {fightCardSlug && <FightCardModal slug={fightCardSlug} onClose={() => setFightCardSlug(null)} />}
    </div>
  );
}
