import { useEffect, useRef } from "react";
import { signInWithGoogle, type Session } from "./auth";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: { theme: string; size: string }) => void;
        };
      };
    };
  }
}

// Google's script self-registers as window.google once loaded - only fetch
// it once no matter how many times this component mounts.
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve) => existing.addEventListener("load", () => resolve()));
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In script"));
    document.head.appendChild(script);
  });
}

interface GoogleSignInButtonProps {
  onSignedIn: (session: Session) => void;
}

export default function GoogleSignInButton({ onSignedIn }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            signInWithGoogle(response.credential).then(onSignedIn).catch(console.error);
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "medium" });
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [onSignedIn]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <span className="text-muted small" title="Set VITE_GOOGLE_CLIENT_ID to enable sign-in">
        Sign-in not configured
      </span>
    );
  }

  return <div ref={buttonRef} />;
}
