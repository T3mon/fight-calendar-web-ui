import { useState } from "react";
import "./UserPanel.css";
import type { Session } from "./auth";
import { colorForPromotion } from "./promotionColors";
import type { Promotion } from "./types";

interface UserPanelProps {
  session: Session;
  promotions: Promotion[];
  onSignOut: () => void;
}

const NOTIFICATION_OPTIONS = [
  { key: "new-events", label: "New events added" },
  { key: "card-updates", label: "Fight card updates" },
  { key: "starting-soon", label: "Event starting soon" },
];

// Concept 2: one unified slide-in panel instead of a dropdown-then-modal
// flow - Settings and Account are tabs inside the same surface, with Sign
// out as a persistent footer action rather than a menu item.
//
// Design/UX placeholder only - nothing here persists anywhere yet.
// TODO: theme needs a real CSS-variable token pass across every component
// before "Light" can actually work. TODO: language needs an i18n library.
// TODO: notifications/favorites/promotions need JWT-bearer auth wired into
// FightCalendar.Web plus endpoints extending UserFollow and a new
// favorite-fighters table before any of it saves.
export default function UserPanel({ session, promotions, onSignOut }: UserPanelProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"settings" | "account">("settings");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [language, setLanguage] = useState("en");
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
    <div className="user-panel">
      <button type="button" className="user-panel-trigger" onClick={() => setOpen(true)} aria-label="Open account menu">
        <span className="user-panel-avatar">{initial}</span>
      </button>

      {open && (
        <>
          <div className="user-panel-backdrop" onClick={() => setOpen(false)} />
          <div className="user-panel-drawer" role="dialog" aria-label="Account">
            <div className="user-panel-header">
              <span className="user-panel-avatar user-panel-avatar-lg">{initial}</span>
              <span className="user-panel-email">{session.email}</span>
              <button type="button" className="user-panel-close" onClick={() => setOpen(false)} aria-label="Close">
                &times;
              </button>
            </div>

            <div className="user-panel-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "settings"}
                className={"user-panel-tab" + (tab === "settings" ? " active" : "")}
                onClick={() => setTab("settings")}
              >
                Settings
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "account"}
                className={"user-panel-tab" + (tab === "account" ? " active" : "")}
                onClick={() => setTab("account")}
              >
                Account
              </button>
            </div>

            <div className="user-panel-body">
              {tab === "settings" ? (
                <>
                  <div className="user-panel-section">
                    <div className="user-panel-section-title">Appearance</div>
                    <div className="user-panel-segmented">
                      <button
                        type="button"
                        className={"user-panel-segment" + (theme === "dark" ? " active" : "")}
                        onClick={() => setTheme("dark")}
                      >
                        Dark
                      </button>
                      <button
                        type="button"
                        className={"user-panel-segment" + (theme === "light" ? " active" : "")}
                        onClick={() => setTheme("light")}
                      >
                        Light
                      </button>
                    </div>
                    <p className="user-panel-note">Coming soon - only Dark is actually implemented right now.</p>
                  </div>

                  <div className="user-panel-section">
                    <div className="user-panel-section-title">Language</div>
                    <select className="user-panel-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="en">English</option>
                    </select>
                    <p className="user-panel-note">Coming soon - more languages later.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="user-panel-section">
                    <div className="user-panel-section-title">
                      Notifications <span className="user-panel-badge">Coming soon</span>
                    </div>
                    <div className="user-panel-list">
                      {NOTIFICATION_OPTIONS.map((option) => (
                        <label className="user-panel-toggle-row" key={option.key}>
                          <span>{option.label}</span>
                          <input type="checkbox" checked={notifications.has(option.key)} onChange={() => toggleNotification(option.key)} />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="user-panel-section">
                    <div className="user-panel-section-title">
                      Favorite Fighters <span className="user-panel-badge">Coming soon</span>
                    </div>
                    <input
                      type="text"
                      className="user-panel-search"
                      placeholder="Search fighters…"
                      value={fighterSearch}
                      onChange={(e) => setFighterSearch(e.target.value)}
                    />
                    <p className="user-panel-empty">No favorites yet.</p>
                  </div>

                  <div className="user-panel-section">
                    <div className="user-panel-section-title">
                      Tracked Promotions <span className="user-panel-badge">Coming soon</span>
                    </div>
                    <div className="user-panel-list">
                      {promotions.map((promotion) => (
                        <label className="user-panel-toggle-row" key={promotion.id}>
                          <span className="user-panel-promotion-label">
                            <span className="user-panel-dot" style={{ backgroundColor: colorForPromotion(promotion.code) }} />
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

                  <p className="user-panel-footnote">Nothing here is saved yet - this is a preview of what's coming.</p>
                </>
              )}
            </div>

            <button
              type="button"
              className="user-panel-signout"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
