import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event as CalendarEvent } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fetchEvents, fetchPromotions } from "./api";
import type { EventListItem, Promotion } from "./types";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

interface FightCalendarEvent extends CalendarEvent {
  source: EventListItem;
}

function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPromotions(), fetchEvents()])
      .then(([promotionsResult, eventsResult]) => {
        setPromotions(promotionsResult);
        setSelectedCodes(new Set(promotionsResult.map((p) => p.code)));
        setEvents(eventsResult);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function togglePromotion(code: string) {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  const calendarEvents = useMemo<FightCalendarEvent[]>(
    () =>
      events
        .filter((event) => selectedCodes.has(event.promotion.code))
        .map((event) => {
          const start = new Date(event.startsAt);
          return {
            title: `${event.promotion.code}: ${event.title}`,
            start,
            end: start,
            source: event,
          };
        }),
    [events, selectedCodes],
  );

  return (
    <div className="container-fluid p-3">
      <header className="mb-3">
        <h1 className="h3 mb-0">Fight Calendar</h1>
      </header>

      {error && <div className="alert alert-danger">Failed to load events: {error}</div>}
      {loading && <p className="text-muted">Loading…</p>}

      {!loading && !error && (
        <div className="row">
          <aside className="col-12 col-md-3 col-lg-2 mb-3">
            <h2 className="h6">Promotions</h2>
            {promotions.map((promotion) => (
              <div className="form-check" key={promotion.id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`promo-${promotion.code}`}
                  checked={selectedCodes.has(promotion.code)}
                  onChange={() => togglePromotion(promotion.code)}
                />
                <label className="form-check-label" htmlFor={`promo-${promotion.code}`}>
                  {promotion.name}
                </label>
              </div>
            ))}
          </aside>

          <main className="col-12 col-md-9 col-lg-10" style={{ height: "80vh" }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              popup
              onSelectEvent={(event) => window.open((event as FightCalendarEvent).source.link, "_blank")}
            />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
