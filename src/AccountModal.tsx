import { useState } from "react";
import "./AccountModal.css";
import { colorForPromotion } from "./promotionColors";
import type { Promotion } from "./types";

interface AccountModalProps {
  promotions: Promotion[];
  onClose: () => void;
}

const NOTIFICATION_OPTIONS = [
  { key: "new-events", label: "New events added" },
  { key: "card-updates", label: "Fight card updates" },
  { key: "starting-soon", label: "Event starting soon" },
];

// Design/UX placeholder only - none of this persists anywhere.
// TODO: needs JWT-bearer auth wired into FightCalendar.Web, plus endpoints
// extending the existing UserFollow entity (promotions) and a new
// favorite-fighters table, before any of this actually saves.
export default function AccountModal({ promotions, onClose }: AccountModalProps) {
  const [notifications, setNotifications] = useState<Set<string>>(new Set(["new-events"]));
  const [trackedPromotions, setTrackedPromotions] = useState<Set<number>>(new Set());
  const [fighterSearch, setFighterSearch] = useState("");

  function toggleNotification(key: string) {
    setNotifications((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function togglePromotion(id: number) {
    setTrackedPromotions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="account-modal-backdrop" onClick={onClose}>
      <div className="account-modal" role="dialog" aria-label="Account" onClick={(e) => e.stopPropagation()}>
        <div className="account-modal-header">
          <strong>Account</strong>
          <button type="button" className="account-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="account-modal-section">
          <div className="account-modal-section-title">
            Notifications <span className="account-modal-badge">Coming soon</span>
          </div>
          <div className="account-modal-list">
            {NOTIFICATION_OPTIONS.map((option) => (
              <label className="account-modal-toggle-row" key={option.key}>
                <span>{option.label}</span>
                <input type="checkbox" checked={notifications.has(option.key)} onChange={() => toggleNotification(option.key)} />
              </label>
            ))}
          </div>
        </div>

        <div className="account-modal-section">
          <div className="account-modal-section-title">
            Favorite Fighters <span className="account-modal-badge">Coming soon</span>
          </div>
          <input
            type="text"
            className="account-modal-search"
            placeholder="Search fighters…"
            value={fighterSearch}
            onChange={(e) => setFighterSearch(e.target.value)}
          />
          <p className="account-modal-empty">No favorites yet.</p>
        </div>

        <div className="account-modal-section">
          <div className="account-modal-section-title">
            Tracked Promotions <span className="account-modal-badge">Coming soon</span>
          </div>
          <div className="account-modal-list">
            {promotions.map((promotion) => (
              <label className="account-modal-toggle-row" key={promotion.id}>
                <span className="account-modal-promotion-label">
                  <span className="account-modal-dot" style={{ backgroundColor: colorForPromotion(promotion.code) }} />
                  {promotion.name}
                </span>
                <input type="checkbox" checked={trackedPromotions.has(promotion.id)} onChange={() => togglePromotion(promotion.id)} />
              </label>
            ))}
          </div>
        </div>

        <p className="account-modal-footnote">Nothing here is saved yet - this is a preview of what's coming.</p>
      </div>
    </div>
  );
}
