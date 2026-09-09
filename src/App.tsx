import { useEffect, useMemo, useState } from "react";
import "./YearCalendar.css";
import { fetchEvents, fetchPromotions } from "./api";
import YearCalendar from "./YearCalendar";
import PromotionSidebar from "./PromotionSidebar";
import type { EventListItem, Promotion } from "./types";

function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [year, setYear] = useState(() => new Date().getFullYear());
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

  function setManyPromotions(codes: string[], selected: boolean) {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      for (const code of codes) {
        if (selected) {
          next.add(code);
        } else {
          next.delete(code);
        }
      }
      return next;
    });
  }

  const visibleEvents = useMemo(
    () => events.filter((event) => selectedCodes.has(event.promotion.code) && new Date(event.startsAt).getFullYear() === year),
    [events, selectedCodes, year],
  );

  return (
    <div className="d-flex flex-column p-3" data-bs-theme="dark" style={{ height: "100vh", boxSizing: "border-box" }}>
      <header className="d-flex align-items-center justify-content-between mb-2 flex-shrink-0">
        <h1 className="h4 mb-0">
          <span style={{ color: "#e63946" }}>Fight</span> <span style={{ color: "#e6c200" }}>Calendar</span>
        </h1>
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setYear((y) => y - 1)}>
            &lsaquo;
          </button>
          <span className="fw-semibold" style={{ minWidth: 48, textAlign: "center" }}>
            {year}
          </span>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setYear((y) => y + 1)}>
            &rsaquo;
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setYear(new Date().getFullYear())}>
            Today
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger flex-shrink-0" role="alert">
          Failed to load events: {error}
        </div>
      )}
      {loading && <p className="text-muted flex-shrink-0">Loading…</p>}

      {!loading && !error && (
        <div className="d-flex flex-grow-1" style={{ minHeight: 0, gap: "1rem" }}>
          <aside style={{ width: 250, overflowY: "auto" }} className="flex-shrink-0">
            <PromotionSidebar
              promotions={promotions}
              selectedCodes={selectedCodes}
              onToggle={togglePromotion}
              onSetMany={setManyPromotions}
            />
          </aside>

          <main className="flex-grow-1" style={{ minHeight: 0 }}>
            <YearCalendar year={year} events={visibleEvents} />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
