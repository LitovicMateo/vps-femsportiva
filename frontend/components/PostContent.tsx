"use client";

import { useEffect } from "react";
import styles from "./PostContent.module.css";

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  useEffect(() => {
    // Add captions to images after component mounts
    const figures = document.querySelectorAll(".prose figure");

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
        caption.textContent = img.alt;
        figure.appendChild(caption);
      }
    });

    // Handle standalone images (not in figure tags)
    const standaloneImages = document.querySelectorAll(
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
        caption.textContent = imgElement.alt;
        imgElement.after(caption);
      }
    });
  }, []);

  return (
    <div
      className="prose prose-lg"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
