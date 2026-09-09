// Purely a visual aid for telling environments apart at a glance - the logo
// is colored differently depending on VITE_APP_ENV (set per Render service,
// defaults to "local" for plain `npm run dev`). Falls back to production
// colors if the value is ever missing or unrecognized, so a misconfigured
// deploy fails safe to the real look rather than a dev-looking one.
type AppEnv = "local" | "staging" | "production";

function resolveAppEnv(): AppEnv {
  const raw = import.meta.env.VITE_APP_ENV;
  if (raw === "staging" || raw === "local") return raw;
  return "production";
}

const LOGO_COLORS: Record<AppEnv, { fight: string; calendar: string }> = {
  production: { fight: "#e63946", calendar: "#e6c200" },
  staging: { fight: "#ffd60a", calendar: "#f4a300" },
  local: { fight: "#4cc9f0", calendar: "#3a86ff" },
};

export const appEnv = resolveAppEnv();
export const logoColors = LOGO_COLORS[appEnv];
