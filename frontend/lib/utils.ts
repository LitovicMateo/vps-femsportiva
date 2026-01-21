/**
 * Utility functions for the blog application
 */

/**
 * Calculate reading time for an HTML content string
 * @param html HTML content string
 * @param wordsPerMinute Average reading speed (default: 200 WPM)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(
  html: string,
  wordsPerMinute: number = 200,
): number {
  // Strip HTML tags
  const plainText = html.replace(/<[^>]*>/g, "");

  // Count words (split by whitespace and filter empty strings)
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time in minutes, minimum 1 minute
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return Math.max(1, minutes);
}

/**
 * Format reading time for display
 * @param minutes Reading time in minutes
 * @returns Formatted string like "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Format number with commas for thousands
 * @param num Number to format
 * @returns Formatted string like "1,234"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format large numbers in compact form
 * @param num Number to format
 * @returns Formatted string like "1.2K" or "5.3M"
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
}
