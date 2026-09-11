import { useEffect, useState } from "react";
import "./FightCardModal.css";
import { fetchEventDetail } from "./api";
import type { EventDetail } from "./types";

interface FightCardModalProps {
  slug: string;
  onClose: () => void;
}

// Concept 1: a centered modal dialog layered on top of everything (including
// the day popover that triggered it) - the most conventional "click to see
// more detail" pattern.
export default function FightCardModal({ slug, onClose }: FightCardModalProps) {
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
    <div className="fight-card-modal-backdrop" onClick={onClose}>
      <div className="fight-card-modal" role="dialog" aria-label="Full fight card" onClick={(e) => e.stopPropagation()}>
        <div className="fight-card-modal-header">
          <strong>{detail?.title ?? "Fight card"}</strong>
          <button type="button" className="fight-card-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {error && <p className="fight-card-modal-error">Failed to load fight card: {error}</p>}
        {!detail && !error && <p className="fight-card-modal-loading">Loading fight card…</p>}

        {detail && (
          <ol className="fight-card-modal-list">
            {detail.bouts.length === 0 && <li className="fight-card-modal-empty">No fight card details available yet.</li>}
            {detail.bouts.map((bout, i) => (
              <li key={i} className={i === 0 ? "fight-card-modal-main-event" : undefined}>
                <span className="fight-card-modal-order">{i === 0 ? "Main Event" : `Bout ${i + 1}`}</span>
                <span className="fight-card-modal-matchup">
                  {bout.fighterA} vs {bout.fighterB}
                </span>
                {bout.weightClass && <span className="fight-card-modal-weight">{bout.weightClass}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
