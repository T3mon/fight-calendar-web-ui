import { useState } from "react";
import "./SettingsModal.css";

interface SettingsModalProps {
  onClose: () => void;
}

// Design/UX placeholder only - nothing here persists anywhere yet.
// TODO: theme needs a real CSS-variable token pass across every component
// (everything is hardcoded hex right now) before "Light" can actually work.
// TODO: language needs an i18n library wired in before this is more than
// a single option.
export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [language, setLanguage] = useState("en");

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal" role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <strong>Settings</strong>
          <button type="button" className="settings-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="settings-modal-section">
          <div className="settings-modal-section-title">Appearance</div>
          <div className="settings-modal-segmented">
            <button
              type="button"
              className={"settings-modal-segment" + (theme === "dark" ? " active" : "")}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
            <button
              type="button"
              className={"settings-modal-segment" + (theme === "light" ? " active" : "")}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
          </div>
          <p className="settings-modal-note">Coming soon - only Dark is actually implemented right now.</p>
        </div>

        <div className="settings-modal-section">
          <div className="settings-modal-section-title">Language</div>
          <select className="settings-modal-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
          </select>
          <p className="settings-modal-note">Coming soon - more languages later.</p>
        </div>
      </div>
    </div>
  );
}
