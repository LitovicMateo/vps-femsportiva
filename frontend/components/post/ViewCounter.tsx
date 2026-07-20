"use client";

import { useEffect, useRef } from "react";

interface ViewCounterProps {
  postId: number;
  slug: string;
}

/**
 * Client component that increments post view count on mount
 * Uses WordPress REST API endpoint from view-counter.php plugin
 */
export default function ViewCounter({ postId, slug }: ViewCounterProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per component mount. Set the guard BEFORE the async call
    // so React StrictMode's double-invoke (dev) can't fire two requests.
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackView = async () => {
      try {
        await fetch(`/api/views/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        // Silently fail - view tracking shouldn't break the page
        console.error("Failed to track view:", error);
      }
    };

    trackView();
  }, [postId, slug]);

  // This component doesn't render anything
  return null;
}
