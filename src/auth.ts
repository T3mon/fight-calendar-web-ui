const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL ?? "http://localhost:5090";
const STORAGE_KEY = "fightcalendar.session";

export interface Session {
  token: string;
  expiresAt: string;
  email: string;
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing, storage disabled, etc. - nothing was persisted anyway.
  }
}

// Exchanges a Google ID token (from GoogleSignInButton) for our own session.
export async function signInWithGoogle(idToken: string): Promise<Session> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error(`Google sign-in failed: ${response.status}`);
  }

  const data = (await response.json()) as { token: string; expiresAt: string; email: string };
  const session: Session = { token: data.token, expiresAt: data.expiresAt, email: data.email };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Session still works for this page load, it just won't survive a reload.
  }

  return session;
}
