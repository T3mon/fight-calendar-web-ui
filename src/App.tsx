import { useEffect, useMemo, useState } from "react";
import { format, isWithinInterval } from "date-fns";
import "./YearCalendar.css";
import "./MonthGrid.css";
import { fetchEvents, fetchPromotions } from "./api";
import YearCalendar from "./YearCalendar";
import MonthGrid from "./MonthGrid";
import PromotionSidebar from "./PromotionSidebar";
import GoogleSignInButton from "./GoogleSignInButton";
import { clearSession, loadSession, type Session } from "./auth";
import { getVisibleRange, monthsInView, shiftViewDate, type ViewMode } from "./calendarView";
import { computeSubSeriesByPromotion, filterKeyForEvent, leafKeysForPromotion } from "./eventSeries";
import { loadDeselectedKeys, saveDeselectedKeys } from "./filterStorage";
import type { EventListItem, Promotion } from "./types";

function formatViewLabel(mode: ViewMode, viewDate: Date): string {
  if (mode === "year") return String(viewDate.getFullYear());
  if (mode === "month") return format(viewDate, "MMMM yyyy");
  const months = monthsInView("quarter", viewDate);
  const first = months[0]!;
  const last = months[months.length - 1]!;
  return first.getFullYear() === last.getFullYear()
    ? `${format(first, "MMM")} – ${format(last, "MMM yyyy")}`
    : `${format(first, "MMM yyyy")} – ${format(last, "MMM yyyy")}`;
}

function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("year");
  const [viewDate, setViewDate] = useState(() => new Date());
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

  const visibleRange = useMemo(() => getVisibleRange(viewMode, viewDate), [viewMode, viewDate]);

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          selectedKeys.has(filterKeyForEvent(event, subSeriesByPromotion)) &&
          isWithinInterval(new Date(event.startsAt), visibleRange),
      ),
    [events, selectedKeys, subSeriesByPromotion, visibleRange],
  );

  return (
    <div className="d-flex flex-column p-3" data-bs-theme="dark" style={{ height: "100vh", boxSizing: "border-box" }}>
      <header className="d-flex align-items-center justify-content-between mb-2 flex-shrink-0">
        <h1 className="h4 mb-0">
          <span style={{ color: "#e63946" }}>Fight</span> <span style={{ color: "#e6c200" }}>Calendar</span>
        </h1>
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setViewDate((d) => shiftViewDate(viewMode, d, -1))}>
            &lsaquo;
          </button>
          <span className="fw-semibold" style={{ minWidth: 120, textAlign: "center" }}>
            {formatViewLabel(viewMode, viewDate)}
          </span>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setViewDate((d) => shiftViewDate(viewMode, d, 1))}>
            &rsaquo;
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setViewDate(new Date())}>
            Today
          </button>
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
          >
            <option value="year">Full Year</option>
            <option value="quarter">3 Months</option>
            <option value="month">1 Month</option>
          </select>
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
            {viewMode === "year" && <YearCalendar year={viewDate.getFullYear()} events={visibleEvents} />}
            {viewMode === "quarter" && (
              <div className="d-flex" style={{ height: "100%", gap: "10px" }}>
                {monthsInView("quarter", viewDate).map((month) => (
                  <MonthGrid key={month.toISOString()} month={month} events={visibleEvents} size="medium" />
                ))}
              </div>
            )}
            {viewMode === "month" && <MonthGrid month={viewDate} events={visibleEvents} size="large" />}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
