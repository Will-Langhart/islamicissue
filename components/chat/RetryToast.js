"use client";

import { useEffect, useState } from "react";

// A transient toast that counts down to `until` (a timestamp in ms) and
// auto-dismisses when it reaches zero.
export default function RetryToast({ until, onClose }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.ceil((until - Date.now()) / 1000))
  );

  useEffect(() => {
    const tick = () => {
      const r = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) onClose();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [until, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 px-4"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-ember/30 bg-surface px-4 py-3 shadow-lg">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-ember"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-heading">Slow down a moment</p>
          <p className="text-xs text-muted">
            You can send another message in {remaining}s.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded p-1 text-muted transition hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
