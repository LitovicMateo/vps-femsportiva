"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ShareButtons.module.css";

interface ShareButtonsProps {
  title: string;
  url: string;
  /** 'inline': label + pill row (tablet/desktop). 'grid': 2x2 44px pills (mobile). */
  variant?: "inline" | "grid";
}

export default function ShareButtons({
  title,
  url,
  variant = "inline",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const facebook = {
    label: "Facebook",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    aria: "Podijeli na Facebooku",
  };
  const x = {
    label: "X",
    href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
    aria: "Podijeli na platformi X",
  };
  const whatsapp = {
    label: "WhatsApp",
    href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    aria: "Podijeli na WhatsAppu",
  };
  // Mockup order: inline = Facebook, X, WhatsApp; grid = Facebook, WhatsApp, X.
  const links =
    variant === "grid" ? [facebook, whatsapp, x] : [facebook, x, whatsapp];

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("copy failed");
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: leave the label unchanged */
    }
  };

  return (
    <div
      className={`${styles.root} ${variant === "grid" ? styles.grid : styles.inline}`}
    >
      {variant === "inline" && <span className={styles.label}>Podijeli:</span>}
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.pill}
          aria-label={l.aria}
        >
          {l.label}
        </a>
      ))}
      <button type="button" onClick={handleCopyLink} className={styles.pill}>
        <span aria-live="polite">
          {copied ? "Kopirano!" : "Kopiraj poveznicu"}
        </span>
      </button>
    </div>
  );
}
