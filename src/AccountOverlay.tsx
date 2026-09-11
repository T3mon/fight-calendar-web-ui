import { useState } from "react";
import "./AccountOverlay.css";
import type { Session } from "./auth";
import { colorForPromotion } from "./promotionColors";
import type { Promotion } from "./types";

interface AccountOverlayProps {
  session: Session;
  promotions: Promotion[];
  onSignOut: () => void;
}

type Section = "notifications" | "fighters" | "promotions";

const NAV_ITEMS: { key: Section; label: string }[] = [
  { key: "notifications", label: "Notifications" },
  { key: "fighters", label: "Favorite Fighters" },
  { key: "promotions", label: "Tracked Promotions" },
];

const NOTIFICATION_OPTIONS = [
  { key: "new-events", label: "New events added" },
  { key: "card-updates", label: "Fight card updates" },
  { key: "starting-soon", label: "Event starting soon" },
];

// Concept 3: no dropdown step at all - clicking the trigger goes straight
// into one large settings-page-style overlay with a left sub-nav, the way
// a dedicated account page would look rather than a menu or a drawer.
//
// Appearance/Language live in SiteSettingsButton instead, not here - those
// are app-wide preferences anyone can change, signed in or not. Everything
// in this overlay is genuinely per-account, so it stays gated behind
// having a session.
//
// Design/UX placeholder only - nothing here persists anywhere yet.
// TODO: notifications/favorites/promotions need JWT-bearer auth wired into
// FightCalendar.Web plus endpoints extending UserFollow and a new
// favorite-fighters table before any of it saves.
export default function AccountOverlay({ session, promotions, onSignOut }: AccountOverlayProps) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>("notifications");
  const [notifications, setNotifications] = useState<Set<string>>(new Set(["new-events"]));
  const [trackedPromotions, setTrackedPromotions] = useState<Set<number>>(new Set());
  const [fighterSearch, setFighterSearch] = useState("");
  const initial = session.email.charAt(0).toUpperCase();

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
    <>
      <button type="button" className="account-overlay-trigger" onClick={() => setOpen(true)}>
        <span className="account-overlay-avatar">{initial}</span>
        <span className="account-overlay-trigger-email">{session.email}</span>
      </button>

      {open && (
        <div className="account-overlay-backdrop" onClick={() => setOpen(false)}>
          <div className="account-overlay" role="dialog" aria-label="Account settings" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="account-overlay-close" onClick={() => setOpen(false)} aria-label="Close">
              &times;
            </button>

            <nav className="account-overlay-nav">
              <div className="account-overlay-nav-profile">
                <span className="account-overlay-avatar account-overlay-avatar-lg">{initial}</span>
                <span className="account-overlay-nav-email">{session.email}</span>
              </div>
              <div className="account-overlay-nav-divider" />
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={"account-overlay-nav-item" + (section === item.key ? " active" : "")}
                  onClick={() => setSection(item.key)}
                >
                  {item.label}
                </button>
              ))}
              <div className="account-overlay-nav-divider" />
              <button
                type="button"
                className="account-overlay-nav-item account-overlay-nav-item-danger"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
              >
                Sign out
              </button>
            </nav>

            <div className="account-overlay-content">
              {section === "notifications" && (
                <div className="account-overlay-panel">
                  <h2 className="account-overlay-panel-title">
                    Notifications <span className="account-overlay-badge">Coming soon</span>
                  </h2>
                  <div className="account-overlay-list">
                    {NOTIFICATION_OPTIONS.map((option) => (
                      <label className="account-overlay-toggle-row" key={option.key}>
                        <span>{option.label}</span>
                        <input type="checkbox" checked={notifications.has(option.key)} onChange={() => toggleNotification(option.key)} />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {section === "fighters" && (
                <div className="account-overlay-panel">
                  <h2 className="account-overlay-panel-title">
                    Favorite Fighters <span className="account-overlay-badge">Coming soon</span>
                  </h2>
                  <input
                    type="text"
                    className="account-overlay-search"
                    placeholder="Search fighters…"
                    value={fighterSearch}
                    onChange={(e) => setFighterSearch(e.target.value)}
                  />
                  <p className="account-overlay-empty">No favorites yet.</p>
                </div>
              )}

              {section === "promotions" && (
                <div className="account-overlay-panel">
                  <h2 className="account-overlay-panel-title">
                    Tracked Promotions <span className="account-overlay-badge">Coming soon</span>
                  </h2>
                  <div className="account-overlay-list">
                    {promotions.map((promotion) => (
                      <label className="account-overlay-toggle-row" key={promotion.id}>
                        <span className="account-overlay-promotion-label">
                          <span className="account-overlay-dot" style={{ backgroundColor: colorForPromotion(promotion.code) }} />
                          {promotion.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={trackedPromotions.has(promotion.id)}
                          onChange={() => togglePromotion(promotion.id)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
