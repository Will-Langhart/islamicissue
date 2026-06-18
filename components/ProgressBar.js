"use client";

import { useEffect, useState } from "react";

export default function ProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent">
      <div className="progress-fill h-full transition-[width] duration-100" style={{ width: `${pct}%` }} />
    </div>
  );
}
