import { useMemo } from "react";
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfToday, startOfWeek } from "date-fns";
import type { EventListItem } from "./types";
import { colorForPromotion } from "./promotionColors";
import FightCardExpander from "./FightCardExpander";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function matchupLabel(event: EventListItem): string {
  return event.mainEvent ? `${event.mainEvent.fighterA} vs ${event.mainEvent.fighterB}` : event.title;
}

function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function getMonthGridDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  return eachDayOfInterval({ start, end });
}

interface HeatmapMonthProps {
  month: Date;
  events: EventListItem[];
  size: "large" | "medium";
  selectedDay: string | null;
  onSelectDay: (key: string | null) => void;
}

const MAX_MATCHUP_LINES: Record<"large" | "medium", number> = { large: 4, medium: 2 };

function HeatmapMonth({ month, events, size, selectedDay, onSelectDay }: HeatmapMonthProps) {
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
      <div className="heatmap-days" style={{ gridTemplateRows: `repeat(${days.length / 7}, 1fr)` }}>
        {days.map((date) => {
          const key = dayKey(date);
          const dayEvents = eventsByDay.get(key) ?? [];
          const inMonth = isSameMonth(date, month);
          const today = isToday(date);
          const isPast = date < startOfToday();
          const maxLines = MAX_MATCHUP_LINES[size];
          // Most prominent first (bigger card = more bouts), not chronological -
          // the point of this line is "what's the headliner", not a schedule.
          const rankedEvents = dayEvents.slice().sort((a, b) => b.boutCount - a.boutCount);
          const shownEvents = rankedEvents.slice(0, maxLines);
          const hiddenCount = rankedEvents.length - shownEvents.length;
          return (
            <button
              key={key}
              type="button"
              className={
                "heatmap-day" +
                (inMonth ? "" : " heatmap-day-outside") +
                (today ? " heatmap-day-today" : "") +
                (isPast ? " heatmap-day-past" : "") +
                (dayEvents.length > 0 ? " heatmap-day-has-events" : "") +
                (selectedDay === key ? " heatmap-day-selected" : "")
              }
              onClick={() => (dayEvents.length > 0 ? onSelectDay(selectedDay === key ? null : key) : undefined)}
              disabled={dayEvents.length === 0}
            >
              <span className="heatmap-day-top">
                <span className="heatmap-day-number">{date.getDate()}</span>
              </span>
              {shownEvents.length > 0 && (
                <span className="heatmap-matchups">
                  {shownEvents.map((event) => (
                    <span key={event.id} className="heatmap-matchup-line">
                      <span className="heatmap-matchup-dot" style={{ backgroundColor: colorForPromotion(event.promotion.code) }} />
                      <span className="heatmap-matchup-text">{matchupLabel(event)}</span>
                    </span>
                  ))}
                  {hiddenCount > 0 && <span className="heatmap-matchup-more">+{hiddenCount} more</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDay && isSameMonth(new Date(selectedDay), month) && selectedEvents.length > 0 && (
        <div className="heatmap-popover" role="dialog" aria-label={`Events on ${selectedDay}`}>
          <div className="heatmap-popover-header">
            <strong>{format(new Date(selectedDay), "EEEE, MMMM d, yyyy")}</strong>
            <button type="button" className="heatmap-popover-close" onClick={() => onSelectDay(null)} aria-label="Close">
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
                      <a href={event.mainEvent.fighterALink} target="_blank" rel="noreferrer">
                        {event.mainEvent.fighterA}
                      </a>{" "}
                      vs{" "}
                      <a href={event.mainEvent.fighterBLink} target="_blank" rel="noreferrer">
                        {event.mainEvent.fighterB}
                      </a>
                    </div>
                  )}
                  <FightCardExpander slug={event.slug} />
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
  selectedDay: string | null;
  onSelectDay: (key: string | null) => void;
}

export default function HeatmapCalendar({ months, events, selectedDay, onSelectDay }: HeatmapCalendarProps) {
  const size = months.length === 1 ? "large" : "medium";
  return (
    <div className="heatmap-layout">
      {months.map((month) => (
        <HeatmapMonth
          key={month.toISOString()}
          month={month}
          events={events}
          size={size}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
        />
      ))}
    </div>
  );
}
