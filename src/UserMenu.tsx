import { useState } from "react";
import "./UserMenu.css";
import type { Session } from "./auth";
import SettingsModal from "./SettingsModal";
import AccountModal from "./AccountModal";
import type { Promotion } from "./types";

interface UserMenuProps {
  session: Session;
  promotions: Promotion[];
  onSignOut: () => void;
}

export default function UserMenu({ session, promotions, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"settings" | "account" | null>(null);
  const initial = session.email.charAt(0).toUpperCase();

  return (
    <div className="user-menu">
      <button type="button" className="user-menu-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="user-menu-avatar">{initial}</span>
        <span className="user-menu-email">{session.email}</span>
        <span className={"user-menu-chevron" + (open ? " open" : "")}>&#9662;</span>
      </button>

      {open && (
        <>
          <div className="user-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="user-menu-dropdown">
            <div className="user-menu-header">
              <span className="user-menu-avatar user-menu-avatar-lg">{initial}</span>
              <span className="user-menu-header-email">{session.email}</span>
            </div>
            <div className="user-menu-divider" />
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                setActivePanel("settings");
                setOpen(false);
              }}
            >
              Settings
            </button>
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                setActivePanel("account");
                setOpen(false);
              }}
            >
              Account
            </button>
            <div className="user-menu-divider" />
            <button
              type="button"
              className="user-menu-item user-menu-item-danger"
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

      {activePanel === "settings" && <SettingsModal onClose={() => setActivePanel(null)} />}
      {activePanel === "account" && <AccountModal promotions={promotions} onClose={() => setActivePanel(null)} />}
    </div>
  );
}
