import { useEffect, useState } from "react";
import "./FightCardDrawer.css";
import { fetchEventDetail } from "./api";
import type { EventDetail } from "./types";

interface FightCardDrawerProps {
  slug: string;
  onClose: () => void;
}

// Concept 3: a slide-in side panel, the most "new window" - like of the
// three - gives the full card its own dedicated space instead of layering
// on top of the day popover.
export default function FightCardDrawer({ slug, onClose }: FightCardDrawerProps) {
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    fetchEventDetail(slug)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      <div className="fight-card-drawer-backdrop" onClick={onClose} />
      <div className="fight-card-drawer" role="dialog" aria-label="Full fight card">
        <div className="fight-card-drawer-header">
          <div>
            <div className="fight-card-drawer-title">{detail?.title ?? "Fight card"}</div>
            {detail?.venue && (
              <div className="fight-card-drawer-venue">
                {detail.venue}
                {detail.location ? ` · ${detail.location}` : ""}
              </div>
            )}
          </div>
          <button type="button" className="fight-card-drawer-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {error && <p className="fight-card-drawer-status fight-card-drawer-error">Failed to load: {error}</p>}
        {!detail && !error && <p className="fight-card-drawer-status">Loading fight card…</p>}

        {detail && (
          <ol className="fight-card-drawer-list">
            {detail.bouts.length === 0 && <li className="fight-card-drawer-empty">No fight card details available yet.</li>}
            {detail.bouts.map((bout, i) => (
              <li key={i} className={i === 0 ? "fight-card-drawer-main-event" : undefined}>
                <span className="fight-card-drawer-order">{i === 0 ? "Main Event" : `Bout ${i + 1}`}</span>
                <span className="fight-card-drawer-matchup">
                  {bout.fighterA} vs {bout.fighterB}
                </span>
                {bout.weightClass && <span className="fight-card-drawer-weight">{bout.weightClass}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
