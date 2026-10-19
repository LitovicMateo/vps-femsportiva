"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Facebook, Link as LinkIcon, MessageCircle } from "lucide-react";
import styles from "./ShareButtons.module.css";

// lucide has no X logo (and no WhatsApp logo), so X is drawn inline.
const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareButtonsProps {
  title: string;
  url: string;
  /** 'inline': label + pill row (tablet/desktop). 'grid': row of 44px icon pills (mobile). */
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
    icon: <Facebook size={18} aria-hidden="true" />,
  };
  const x = {
    label: "X",
    href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
    aria: "Podijeli na platformi X",
    icon: <XIcon />,
  };
  const whatsapp = {
    label: "WhatsApp",
    href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    aria: "Podijeli na WhatsAppu",
    icon: <MessageCircle size={18} aria-hidden="true" />,
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
          {l.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopyLink}
        className={styles.pill}
        aria-label="Kopiraj poveznicu"
      >
        {copied ? (
          <Check size={18} aria-hidden="true" />
        ) : (
          <LinkIcon size={18} aria-hidden="true" />
        )}
        <span className={styles.srOnly} aria-live="polite">
          {copied ? "Kopirano!" : ""}
        </span>
      </button>
    </div>
  );
}
