"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    goatcounter?: { count?: (vars: { path: string }) => void };
  }
}

// count.js (loaded once in the root layout) records only full page loads. Client-side
// navigation between /help pages would be invisible, so count those here, with the same
// host-prefixed path the root layout uses. The very first view after a real page load is
// left to count.js, so nothing is counted twice.
export default function HelpTracker() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      // arrived by an in-app link rather than a fresh load: count.js did not see this view
      if (performance.now() < 4000) return;
    }
    try {
      window.goatcounter?.count?.({ path: location.host + pathname });
    } catch {
      /* analytics must never break the page */
    }
  }, [pathname]);
  return null;
}
