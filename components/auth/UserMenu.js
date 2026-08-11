"use client";

import { useEffect, useRef, useState } from "react";

// Signed-in header widget: avatar button + dropdown. Sign-out is a real form
// POST to /auth/signout so it works without JS and can't be prefetched.
export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const meta = user.user_metadata || {};
  const name = meta.full_name || meta.name || user.email || "Account";
  const avatar = meta.avatar_url || meta.picture || null;
  const initials = (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-line bg-surface text-xs font-semibold text-heading transition hover:border-brand-2"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          initials || "•"
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-heading">{name}</p>
            {user.email && (
              <p className="truncate text-xs text-muted">{user.email}</p>
            )}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-sm text-ink transition hover:bg-page"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
