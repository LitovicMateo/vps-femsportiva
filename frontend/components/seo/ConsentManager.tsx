"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ADSENSE_CLIENT,
  CONSENT_EVENT,
  CONSENT_KEY,
  hasConsentFeatures,
} from "@/lib/google";
import styles from "./ConsentManager.module.css";

type Choice = "granted" | "denied";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function loadAdSense() {
  if (!ADSENSE_CLIENT || document.getElementById("adsense-script")) return;
  const script = document.createElement("script");
  script.id = "adsense-script";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}

function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Cookie consent banner. Drives Google Consent Mode (analytics) and only loads
 * the AdSense script after the visitor accepts. Remember: serving ads to EEA
 * visitors additionally requires a Google-certified TCF CMP (see README/SEO notes).
 */
export default function ConsentManager() {
  const [open, setOpen] = useState(false);

  const apply = useCallback((choice: Choice) => {
    window.gtag?.("consent", "update", {
      ad_storage: choice,
      ad_user_data: choice,
      ad_personalization: choice,
      analytics_storage: choice,
    });
    if (choice === "granted") loadAdSense();
  }, []);

  useEffect(() => {
    const stored = readChoice();
    if (stored) apply(stored);
    // Defer so the banner decision is not a synchronous setState in the effect.
    const id = requestAnimationFrame(() => setOpen(stored === null));
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_EVENT, reopen);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener(CONSENT_EVENT, reopen);
    };
  }, [apply]);

  if (!hasConsentFeatures || !open) return null;

  const choose = (choice: Choice) => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // Storage blocked: the choice still applies for this page view.
    }
    apply(choice);
    setOpen(false);
  };

  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-live="polite"
      aria-label="Postavke kolačića"
    >
      <p className={styles.text}>
        Koristimo kolačiće za analitiku posjeta i prikaz oglasa. Svoj odabir
        možete promijeniti bilo kada u podnožju stranice.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => choose("denied")}
        >
          Odbij
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={() => choose("granted")}
        >
          Prihvati
        </button>
      </div>
    </div>
  );
}
