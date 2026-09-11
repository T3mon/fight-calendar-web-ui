import { useEffect, useMemo, useState } from "react";
import { format, isWithinInterval } from "date-fns";
import "./App.css";
import "./YearCalendar.css";
import "./HeatmapCalendar.css";
import { fetchEvents, fetchPromotions } from "./api";
import YearCalendar from "./YearCalendar";
import HeatmapCalendar from "./HeatmapCalendar";
import PromotionSidebar from "./PromotionSidebar";
import GoogleSignInButton from "./GoogleSignInButton";
import AccountOverlay from "./AccountOverlay";
import SiteSettingsButton from "./SiteSettingsButton";
import { clearSession, loadSession, type Session } from "./auth";
import { getVisibleRange, isViewingToday, monthsInView, shiftViewDate, type ViewMode } from "./calendarView";
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
  // Full year's 12-up grid is unreadable on a phone screen, so start narrow
  // viewports on month view instead - the dropdown still lets anyone switch.
  const [viewMode, setViewMode] = useState<ViewMode>(() => (window.innerWidth < 768 ? "month" : "year"));
  const [viewDate, setViewDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="d-flex flex-column p-3 app-shell" data-bs-theme="dark" style={{ boxSizing: "border-box" }}>
      <header className="d-flex align-items-center justify-content-between mb-2 flex-shrink-0 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-md-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show promotion filters"
          >
            &#9776;
          </button>
          <h1 className="h4 mb-0">
            <span style={{ color: "#e63946" }}>Fight</span> <span style={{ color: "#e6c200" }}>Calendar</span>
          </h1>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="nav-toolbar">
            <div className="nav-stepper">
              <button
                type="button"
                className="nav-step-btn"
                onClick={() => setViewDate((d) => shiftViewDate(viewMode, d, -1))}
                aria-label="Previous"
              >
                &lsaquo;
              </button>
              <span className="nav-date-label">{formatViewLabel(viewMode, viewDate)}</span>
              <button
                type="button"
                className="nav-step-btn"
                onClick={() => setViewDate((d) => shiftViewDate(viewMode, d, 1))}
                aria-label="Next"
              >
                &rsaquo;
              </button>
            </div>

            {!isViewingToday(viewMode, viewDate) && (
              <button type="button" className="nav-today-chip" onClick={() => setViewDate(new Date())}>
                Today
              </button>
            )}

            <div className="view-switcher" role="tablist">
              {([
                ["year", "Year"],
                ["quarter", "Quarter"],
                ["month", "Month"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === mode}
                  className={"view-switcher-btn" + (viewMode === mode ? " active" : "")}
                  onClick={() => setViewMode(mode)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <SiteSettingsButton />
          {session ? (
            <AccountOverlay
              session={session}
              promotions={promotions}
              onSignOut={() => {
                clearSession();
                setSession(null);
              }}
            />
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
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
          <aside className={"flex-shrink-0 sidebar" + (sidebarOpen ? " sidebar-open" : "")}>
            <PromotionSidebar
              promotions={promotions}
              events={events}
              selectedKeys={selectedKeys}
              onToggle={toggleKey}
              onSetMany={setManyKeys}
            />
          </aside>

          <main className="flex-grow-1 calendar-main" style={{ minHeight: 0 }}>
            {viewMode === "year" ? (
              <YearCalendar year={viewDate.getFullYear()} events={visibleEvents} />
            ) : (
              <HeatmapCalendar months={monthsInView(viewMode, viewDate)} events={visibleEvents} />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
