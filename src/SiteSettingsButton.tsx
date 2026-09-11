import { useState } from "react";
import "./SiteSettingsButton.css";

// Theme and language are app-wide preferences, not account features -
// anyone can change them without signing in. Notifications, favorite
// fighters, and tracked promotions stay behind AccountOverlay instead,
// since those are genuinely per-user data.
//
// Design/UX placeholder only - nothing here persists anywhere yet.
// TODO: theme needs a real CSS-variable token pass across every component
// (everything is hardcoded hex right now) before "Light" can actually
// work. TODO: language needs an i18n library wired in before this is more
// than a single option.
export default function SiteSettingsButton() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [language, setLanguage] = useState("en");

  return (
    <div className="site-settings">
      <button type="button" className="site-settings-trigger" onClick={() => setOpen(true)} aria-label="Settings">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M12.9 8.8c.03-.26.05-.53.05-.8s-.02-.54-.05-.8l1.36-1.06a.32.32 0 0 0 .08-.42l-1.29-2.23a.32.32 0 0 0-.4-.14l-1.6.64c-.33-.26-.7-.47-1.09-.63L9.7 1.7a.32.32 0 0 0-.32-.27H6.62a.32.32 0 0 0-.32.27l-.26 1.65c-.4.16-.76.37-1.1.63l-1.59-.64a.32.32 0 0 0-.4.14L1.66 5.72a.32.32 0 0 0 .08.42L3.1 7.2c-.03.26-.05.53-.05.8s.02.54.05.8L1.74 9.86a.32.32 0 0 0-.08.42l1.29 2.23c.09.15.27.21.4.14l1.6-.64c.33.26.7.47 1.09.63l.26 1.65c.03.16.17.27.32.27h2.76c.16 0 .29-.11.32-.27l.26-1.65c.4-.16.76-.37 1.1-.63l1.59.64c.14.06.31 0 .4-.14l1.29-2.23a.32.32 0 0 0-.08-.42L12.9 8.8Z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="site-settings-backdrop" onClick={() => setOpen(false)}>
          <div className="site-settings-modal" role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
            <div className="site-settings-header">
              <strong>Settings</strong>
              <button type="button" className="site-settings-close" onClick={() => setOpen(false)} aria-label="Close">
                &times;
              </button>
            </div>

            <div className="site-settings-section">
              <div className="site-settings-section-title">Appearance</div>
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

            <div className="site-settings-section">
              <div className="site-settings-section-title">Language</div>
              <select className="site-settings-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
              </select>
              <p className="site-settings-note">Coming soon - more languages later.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
