import { useEffect, useMemo, useState } from "react";
import "./YearCalendar.css";
import { fetchEvents, fetchPromotions } from "./api";
import YearCalendar from "./YearCalendar";
import PromotionSidebar from "./PromotionSidebar";
import GoogleSignInButton from "./GoogleSignInButton";
import { clearSession, loadSession, type Session } from "./auth";
import { computeSubSeriesByPromotion, filterKeyForEvent, leafKeysForPromotion } from "./eventSeries";
import { loadDeselectedKeys, saveDeselectedKeys } from "./filterStorage";
import type { EventListItem, Promotion } from "./types";

function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(() => loadSession());

  useEffect(() => {
    Promise.all([fetchPromotions(), fetchEvents()])
      .then(([promotionsResult, eventsResult]) => {
        setPromotions(promotionsResult);
        const subSeriesByPromotion = computeSubSeriesByPromotion(eventsResult);
        const allKeys = promotionsResult.flatMap((p) => leafKeysForPromotion(p.code, subSeriesByPromotion));
        const deselected = loadDeselectedKeys();
        setSelectedKeys(new Set(allKeys.filter((key) => !deselected.has(key))));
        setEvents(eventsResult);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleKey(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function setManyKeys(keys: string[], selected: boolean) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const key of keys) {
        if (selected) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      return next;
    });
  }

  const subSeriesByPromotion = useMemo(() => computeSubSeriesByPromotion(events), [events]);

  // Persist only the user's explicit unchecks (see filterStorage.ts) once
  // real data has loaded - skip the initial empty-Set render before the
  // fetch above resolves, which would otherwise wipe a returning visitor's
  // saved selection.
  useEffect(() => {
    if (loading) return;
    const allKeys = promotions.flatMap((p) => leafKeysForPromotion(p.code, subSeriesByPromotion));
    saveDeselectedKeys(new Set(allKeys.filter((key) => !selectedKeys.has(key))));
  }, [loading, promotions, subSeriesByPromotion, selectedKeys]);

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) => selectedKeys.has(filterKeyForEvent(event, subSeriesByPromotion)) && new Date(event.startsAt).getFullYear() === year,
      ),
    [events, selectedKeys, subSeriesByPromotion, year],
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
          {session ? (
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">{session.email}</span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  clearSession();
                  setSession(null);
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <GoogleSignInButton onSignedIn={setSession} />
          )}
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
              events={events}
              selectedKeys={selectedKeys}
              onToggle={toggleKey}
              onSetMany={setManyKeys}
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
