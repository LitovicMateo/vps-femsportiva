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
    // Only track once per component mount
    if (hasTracked.current) return;

    const trackView = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
          "http://localhost:8080/wp-json";
        const response = await fetch(
          `${apiUrl}/custom/v1/post-view/${postId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.incremented) {
            console.log(
              `View tracked for post ${slug}: ${data.views} total views`,
            );
          }
        }
      } catch (error) {
        // Silently fail - view tracking shouldn't break the page
        console.error("Failed to track view:", error);
      }
    };

    trackView();
    hasTracked.current = true;
  }, [postId, slug]);

  // This component doesn't render anything
  return null;
}
