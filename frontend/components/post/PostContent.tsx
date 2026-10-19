"use client";

import { useEffect, useMemo, useRef } from "react";
import styles from "./PostContent.module.css";

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  // Transform all WordPress internal URLs in the content to external URLs
  const transformedContent = useMemo(() => {
    // Use NEXT_PUBLIC_WORDPRESS_URL which is available on both server and client
    const externalUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const pathPrefix = process.env.NEXT_PUBLIC_WORDPRESS_PATH_PREFIX || "";
    if (!externalUrl) {
      console.error("NEXT_PUBLIC_WORDPRESS_URL is not defined");
      return content;
    }
    // Transform URLs with environment-specific path prefix
    return content
      .replace(/http:\/\/wordpress\/wp\//g, `${externalUrl}${pathPrefix}/`)
      .replace(/http:\/\/wordpress\//g, `${externalUrl}${pathPrefix}/`);
  }, [content]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Add captions to images after component mounts
    const figures = root.querySelectorAll(".prose figure");

    figures.forEach((figure) => {
      const img = figure.querySelector("img");
      const figcaption = figure.querySelector("figcaption");

      if (img && figcaption) {
        // WordPress already includes figcaption, just ensure styling
        figcaption.classList.add(styles.caption);
      } else if (img && img.alt && !figcaption) {
        // If there's an alt text but no figcaption, create one
        const caption = document.createElement("figcaption");
        caption.className = styles.caption;
        caption.setAttribute("aria-hidden", "true");
        caption.textContent = img.alt;
        figure.appendChild(caption);
      }
    });

    // Handle standalone images (not in figure tags)
    const standaloneImages = root.querySelectorAll(
      ".prose img:not(figure img)",
    );

    standaloneImages.forEach((img: Element) => {
      const imgElement = img as HTMLImageElement;
      if (
        imgElement.alt &&
        !img.nextElementSibling?.classList.contains(styles.caption)
      ) {
        const caption = document.createElement("p");
        caption.className = styles.caption;
        caption.setAttribute("aria-hidden", "true");
        caption.textContent = imgElement.alt;
        imgElement.after(caption);
      }
    });
  }, [transformedContent]);

  return (
    <div
      ref={ref}
      className={`prose ${styles.root}`}
      dangerouslySetInnerHTML={{ __html: transformedContent }}
    />
  );
}
