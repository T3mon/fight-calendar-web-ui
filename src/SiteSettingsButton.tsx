import { useState } from "react";
import "./SiteSettingsButton.css";

type SettingKey = "language" | "location" | "appearance";

// Theme, language, and location are app-wide preferences, not account
// features - anyone can change them without signing in. Notifications,
// favorite fighters, and tracked promotions stay behind AccountOverlay
// instead, since those are genuinely per-user data.
//
// Design/UX placeholder only - nothing here persists anywhere yet.
// TODO: theme needs a real CSS-variable token pass across every component
// before "Light" can actually work. TODO: language needs an i18n library.
// TODO: location currently just shows the browser's own detected timezone
// - actually letting someone override it, and having the calendar use that
// override instead of the browser's local time, is not wired up yet.
export default function SiteSettingsButton() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<SettingKey | null>(null);
  const [language, setLanguage] = useState("en");
  const [location, setLocation] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  function toggleRow(key: SettingKey) {
    setExpanded((prev) => (prev === key ? null : key));
  }

  return (
    <div className="site-settings">
      <button
        type="button"
        className="site-settings-trigger"
        onClick={() => {
          setOpen((o) => !o);
          setExpanded(null);
        }}
        aria-label="Settings"
      >
        <GearIcon />
        <span className="site-settings-trigger-lang">{language.toUpperCase()}</span>
        <span className={"site-settings-chevron" + (open ? " open" : "")}>&#9662;</span>
      </button>

      {open && (
        <>
          <div className="site-settings-backdrop" onClick={() => setOpen(false)} />
          <div className="site-settings-dropdown" role="menu" aria-label="Settings">
            <div className="site-settings-row">
              <button type="button" className="site-settings-row-header" onClick={() => toggleRow("language")}>
                <LanguageIcon />
                <span className="site-settings-row-label">
                  Language: <strong>English</strong>
                </span>
                <span className={"site-settings-chevron" + (expanded === "language" ? " open" : "")}>&#9662;</span>
              </button>
              {expanded === "language" && (
                <div className="site-settings-row-body">
                  <select className="site-settings-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English</option>
                  </select>
                  <p className="site-settings-note">Coming soon - more languages later.</p>
                </div>
              )}
            </div>

            <div className="site-settings-row">
              <button type="button" className="site-settings-row-header" onClick={() => toggleRow("location")}>
                <LocationIcon />
                <span className="site-settings-row-label">
                  Location: <strong>{location}</strong>
                </span>
                <span className={"site-settings-chevron" + (expanded === "location" ? " open" : "")}>&#9662;</span>
              </button>
              {expanded === "location" && (
                <div className="site-settings-row-body">
                  <input
                    type="text"
                    className="site-settings-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p className="site-settings-note">
                    Auto-detected from your browser right now. Coming soon - override this and event times will show in your chosen
                    location's time instead.
                  </p>
                </div>
              )}
            </div>

            <div className="site-settings-row">
              <button type="button" className="site-settings-row-header" onClick={() => toggleRow("appearance")}>
                <AppearanceIcon />
                <span className="site-settings-row-label">
                  Appearance: <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
                </span>
                <span className={"site-settings-chevron" + (expanded === "appearance" ? " open" : "")}>&#9662;</span>
              </button>
              {expanded === "appearance" && (
                <div className="site-settings-row-body">
                  <div className="site-settings-segmented">
                    <button
                      type="button"
                      className={"site-settings-segment" + (theme === "dark" ? " active" : "")}
                      onClick={() => setTheme("dark")}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      className={"site-settings-segment" + (theme === "light" ? " active" : "")}
                      onClick={() => setTheme("light")}
                    >
                      Light
                    </button>
                  </div>
                  <p className="site-settings-note">Coming soon - only Dark is actually implemented right now.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M12.9 8.8c.03-.26.05-.53.05-.8s-.02-.54-.05-.8l1.36-1.06a.32.32 0 0 0 .08-.42l-1.29-2.23a.32.32 0 0 0-.4-.14l-1.6.64c-.33-.26-.7-.47-1.09-.63L9.7 1.7a.32.32 0 0 0-.32-.27H6.62a.32.32 0 0 0-.32.27l-.26 1.65c-.4.16-.76.37-1.1.63l-1.59-.64a.32.32 0 0 0-.4.14L1.66 5.72a.32.32 0 0 0 .08.42L3.1 7.2c-.03.26-.05.53-.05.8s.02.54.05.8L1.74 9.86a.32.32 0 0 0-.08.42l1.29 2.23c.09.15.27.21.4.14l1.6-.64c.33.26.7.47 1.09.63l.26 1.65c.03.16.17.27.32.27h2.76c.16 0 .29-.11.32-.27l.26-1.65c.4-.16.76-.37 1.1-.63l1.59.64c.14.06.31 0 .4-.14l1.29-2.23a.32.32 0 0 0-.08-.42L12.9 8.8Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 8h13M8 1.5c1.8 1.9 2.8 4.1 2.8 6.5s-1 4.6-2.8 6.5c-1.8-1.9-2.8-4.1-2.8-6.5S6.2 3.4 8 1.5Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 14.5s5-4.2 5-8.3A5 5 0 0 0 3 6.2c0 4.1 5 8.3 5 8.3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.2" r="1.8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function AppearanceIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 14h4M8 11v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
