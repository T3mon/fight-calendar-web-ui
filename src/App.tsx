import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import { fetchEvents, fetchPromotions } from "./api";
import { colorForPromotion } from "./promotionColors";
import type { EventListItem, Promotion } from "./types";

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

  const calendarEvents = useMemo<EventInput[]>(
    () =>
      events
        .filter((event) => selectedCodes.has(event.promotion.code))
        .map((event) => {
          const color = colorForPromotion(event.promotion.code);
          return {
            id: String(event.id),
            title: event.promotion.code,
            start: event.startsAt,
            allDay: true,
            backgroundColor: color,
            borderColor: color,
            extendedProps: { source: event },
          };
        }),
    [events, selectedCodes],
  );

  function handleEventClick(clickInfo: EventClickArg) {
    const source = clickInfo.event.extendedProps.source as EventListItem;
    window.open(source.link, "_blank");
  }

  return (
    <div className="container-fluid p-3">
      <header className="mb-3">
        <h1 className="h3 mb-0">
          <span style={{ color: "red" }}>Fight</span> <span style={{ color: "#e6c200" }}>Calendar</span>
        </h1>
      </header>

      {error && <div className="alert alert-danger">Failed to load events: {error}</div>}
      {loading && <p className="text-muted">Loading…</p>}

      {!loading && !error && (
        <div className="row">
          <aside className="col-12 col-md-3 col-lg-2 mb-3">
            <h2 className="h6">Promotions</h2>
            {promotions.map((promotion) => (
              <div className="form-check d-flex align-items-center gap-2" key={promotion.id}>
                <input
                  className="form-check-input mt-0"
                  type="checkbox"
                  id={`promo-${promotion.code}`}
                  checked={selectedCodes.has(promotion.code)}
                  onChange={() => togglePromotion(promotion.code)}
                />
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: colorForPromotion(promotion.code),
                    flexShrink: 0,
                  }}
                />
                <label className="form-check-label" htmlFor={`promo-${promotion.code}`}>
                  {promotion.name}
                </label>
              </div>
            ))}
          </aside>

          <main className="col-12 col-md-9 col-lg-10">
            <FullCalendar
              plugins={[multiMonthPlugin, interactionPlugin]}
              initialView="multiMonthYear"
              multiMonthMaxColumns={4}
              headerToolbar={{ left: "prev", center: "title", right: "next today" }}
              events={calendarEvents}
              eventClick={handleEventClick}
              dayMaxEvents={2}
              height="auto"
            />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
