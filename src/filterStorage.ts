const STORAGE_KEY = "fightcalendar.deselectedKeys";

// We persist what the user turned OFF, not what's on. That way a promotion
// or sub-series discovered after a visitor's last visit (e.g. a brand new
// "ONE Cowboys" series) still shows up checked by default for them, matching
// the same opt-out philosophy used for auto-discovering sub-series in the
// first place - only explicit unchecks are remembered.
export function loadDeselectedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function saveDeselectedKeys(deselectedKeys: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...deselectedKeys]));
  } catch {
    // Private browsing, storage disabled, quota exceeded, etc. - selection
    // just won't persist across reloads for this visitor.
  }
}
