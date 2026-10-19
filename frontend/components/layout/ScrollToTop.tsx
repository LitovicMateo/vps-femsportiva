"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Smooth-scrolls to the top after a client-side navigation to a new path or
 * query string (e.g. pagination).
 * Next's own scroll reset is unreliable here (it skips the jump in some cases),
 * so links such as tags and related articles would otherwise keep the old
 * scroll position. Back/forward navigation keeps the browser's restoration.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const url = `${pathname}?${search}`;
  const prevUrl = useRef(url);
  const isPopState = useRef(false);

  useEffect(() => {
    const onPop = () => {
      isPopState.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (prevUrl.current === url) return;
    prevUrl.current = url;
    if (isPopState.current) {
      isPopState.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [url]);

  return null;
}
