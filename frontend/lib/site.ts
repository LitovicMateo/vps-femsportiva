export const SITE_NAME = "Femsportiva";

/** Fallback site description (used when the WordPress tagline is empty or still the WP default). */
export const SITE_DESCRIPTION =
  "Femsportiva donosi vijesti, priče i analize iz ženskog sporta: od lokalnih terena do velikih međunarodnih natjecanja. Pratimo sportašice, klubove i rezultate koji zaslužuju više pažnje.";

export const SITE_KEYWORDS = [
  "ženski sport",
  "sportašice",
  "ženska košarka",
  "ženski nogomet",
  "odbojka",
  "rukomet",
  "Hrvatska",
  "sportske vijesti",
];

export const SITE_TAGLINE =
  "Priče, analize i vijesti iz ženskog sporta — od lokalnih terena do velikih natjecanja.";

export const SOCIAL_LINKS = [
  { label: "Instagram", url: "https://instagram.com" },
  { label: "Facebook", url: "https://facebook.com" },
  { label: "YouTube", url: "https://youtube.com" },
] as const;

export const RSS_URL = "/feed.xml";

/**
 * Empty on purpose: the app has no route rendering WordPress pages
 * (only app/api/pages/[slug]); /o-nama etc. would hit the [category] route and 404.
 * Populate ({ label, href }) once a pages route exists.
 */
export const FOOTER_PAGES: ReadonlyArray<{ label: string; href: string }> = [];
