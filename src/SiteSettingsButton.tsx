import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SiteSettingsButton.css";
import { LANGUAGES, baseLanguageCode } from "./languages";
import { applyTheme, getInitialTheme, type Theme } from "./theme";
import {
  AUTO_TIMEZONE,
  getDeviceTimezone,
  getSupportedTimezones,
  setTimezone,
  useTimezone,
  useTimezoneSetting,
} from "./timezone";

// IANA ids are underscored ("America/New_York"); spaces read better in a list.
function timezoneLabel(id: string): string {
  return id.replace(/_/g, " ");
}

// Theme, language, and location are app-wide preferences, not account
// features - anyone can change them without signing in. Notifications,
// favorite fighters, and tracked promotions stay behind AccountOverlay
// instead, since those are genuinely per-user data.
//
// All three are real and cached in localStorage: theme swaps the CSS custom
// properties in index.css, language re-translates via i18next, and location
// re-formats every event date/time through @date-fns/tz. Location defaults
// to the device zone but can be pinned - useful when travelling, or when
// you want a card's times in the venue's local time.
export default function SiteSettingsButton() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [timezoneQuery, setTimezoneQuery] = useState("");
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  const timezoneSetting = useTimezoneSetting();
  const effectiveTimezone = useTimezone();
  const deviceTimezone = getDeviceTimezone();

  const filteredTimezones = useMemo(() => {
    const zones = getSupportedTimezones();
    const query = timezoneQuery.trim().toLowerCase().replace(/\s+/g, "_");
    if (!query) return zones;
    return zones.filter((zone) => zone.toLowerCase().includes(query));
  }, [timezoneQuery]);

  function changeTheme(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  function closeLocationMenu() {
    setLocationMenuOpen(false);
    setTimezoneQuery("");
  }

  function changeTimezone(next: string) {
    setTimezone(next);
    closeLocationMenu();
  }

  const currentLanguage = baseLanguageCode(i18n.language);
  const currentLanguageName = LANGUAGES.find((lang) => lang.code === currentLanguage)?.nativeName ?? i18n.language;

  return (
    <div className="site-settings">
      <button
        type="button"
        className="site-settings-trigger"
        onClick={() => {
          setOpen((o) => !o);
          setLanguageMenuOpen(false);
          closeLocationMenu();
        }}
        aria-label={t("settings.ariaLabel")}
      >
        <GearIcon />
        <span className="site-settings-trigger-lang">{currentLanguage.toUpperCase()}</span>
        <span className={"site-settings-chevron" + (open ? " open" : "")}>&#9662;</span>
      </button>

      {open && (
        <>
          <div
            className="site-settings-backdrop"
            onClick={() => {
              setOpen(false);
              setLanguageMenuOpen(false);
              closeLocationMenu();
            }}
          />
          <div className="site-settings-dropdown" role="menu" aria-label={t("settings.ariaLabel")}>
            <div className="site-settings-row">
              <button
                type="button"
                className="site-settings-row-header"
                onClick={() => {
                  setLanguageMenuOpen((o) => !o);
                  closeLocationMenu();
                }}
              >
                <LanguageIcon />
                <span className="site-settings-row-label">
                  {t("settings.language")}: <strong>{currentLanguageName}</strong>
                </span>
                <span className={"site-settings-chevron" + (languageMenuOpen ? " open" : "")}>&#9662;</span>
              </button>
              {languageMenuOpen && (
                <>
                  <div className="site-settings-submenu-backdrop" onClick={() => setLanguageMenuOpen(false)} />
                  <ul className="site-settings-submenu site-settings-submenu-list" role="listbox" aria-label={t("settings.language")}>
                    {LANGUAGES.map((lang) => (
                      <li key={lang.code}>
                        <button
                          type="button"
                          className={"site-settings-submenu-option" + (lang.code === currentLanguage ? " active" : "")}
                          role="option"
                          aria-selected={lang.code === currentLanguage}
                          onClick={() => {
                            i18n.changeLanguage(lang.code);
                            setLanguageMenuOpen(false);
                          }}
                        >
                          {lang.nativeName}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="site-settings-row">
              <button
                type="button"
                className="site-settings-row-header"
                onClick={() => {
                  setLanguageMenuOpen(false);
                  if (locationMenuOpen) closeLocationMenu();
                  else setLocationMenuOpen(true);
                }}
              >
                <LocationIcon />
                <span className="site-settings-row-label">
                  {t("settings.location")}: <strong>{timezoneLabel(effectiveTimezone)}</strong>
                </span>
                <span className={"site-settings-chevron" + (locationMenuOpen ? " open" : "")}>&#9662;</span>
              </button>
              {locationMenuOpen && (
                <>
                  <div className="site-settings-submenu-backdrop" onClick={closeLocationMenu} />
                  <div className="site-settings-submenu">
                    <input
                      type="text"
                      className="site-settings-submenu-search"
                      placeholder={t("settings.locationSearchPlaceholder")}
                      value={timezoneQuery}
                      onChange={(e) => setTimezoneQuery(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") closeLocationMenu();
                      }}
                    />
                    <ul className="site-settings-submenu-list" role="listbox" aria-label={t("settings.location")}>
                      <li>
                        <button
                          type="button"
                          className={
                            "site-settings-submenu-option" + (timezoneSetting === AUTO_TIMEZONE ? " active" : "")
                          }
                          role="option"
                          aria-selected={timezoneSetting === AUTO_TIMEZONE}
                          onClick={() => changeTimezone(AUTO_TIMEZONE)}
                        >
                          {t("settings.locationAuto", { zone: timezoneLabel(deviceTimezone) })}
                        </button>
                      </li>
                      {filteredTimezones.map((zone) => (
                        <li key={zone}>
                          <button
                            type="button"
                            className={"site-settings-submenu-option" + (timezoneSetting === zone ? " active" : "")}
                            role="option"
                            aria-selected={timezoneSetting === zone}
                            onClick={() => changeTimezone(zone)}
                          >
                            {timezoneLabel(zone)}
                          </button>
                        </li>
                      ))}
                      {filteredTimezones.length === 0 && (
                        <li className="site-settings-submenu-empty">{t("settings.locationNoResults")}</li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="site-settings-row">
              <div className="site-settings-row-header">
                <AppearanceIcon />
                <span className="site-settings-row-prefix">{t("settings.appearance")}:</span>
                <div className="site-settings-segmented">
                  <button
                    type="button"
                    className={"site-settings-segment" + (theme === "dark" ? " active" : "")}
                    onClick={() => changeTheme("dark")}
                  >
                    {t("settings.dark")}
                  </button>
                  <button
                    type="button"
                    className={"site-settings-segment" + (theme === "light" ? " active" : "")}
                    onClick={() => changeTheme("light")}
                  >
                    {t("settings.light")}
                  </button>
                </div>
              </div>
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
