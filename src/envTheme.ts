// Purely a visual aid for telling environments apart at a glance in the
// browser tab - the favicon (same lightning bolt shape, recolored) is
// swapped per VITE_APP_ENV (set per Render service, defaults to "local"
// for plain `npm run dev`). Falls back to the production favicon if the
// value is ever missing or unrecognized, so a misconfigured deploy fails
// safe to the real look rather than a dev-looking one.
type AppEnv = "local" | "staging" | "production";

function resolveAppEnv(): AppEnv {
  const raw = import.meta.env.VITE_APP_ENV;
  if (raw === "staging" || raw === "local") return raw;
  return "production";
}

const FAVICON_HREF: Record<AppEnv, string> = {
  production: "/favicon.svg",
  staging: "/favicon-staging.svg",
  local: "/favicon-local.svg",
};

export const appEnv = resolveAppEnv();
export const faviconHref = FAVICON_HREF[appEnv];
