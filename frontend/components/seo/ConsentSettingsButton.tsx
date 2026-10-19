"use client";

import { CONSENT_EVENT, hasConsentFeatures } from "@/lib/google";

export default function ConsentSettingsButton({
  className,
}: {
  className?: string;
}) {
  if (!hasConsentFeatures) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(CONSENT_EVENT))}
    >
      Postavke kolačića
    </button>
  );
}
