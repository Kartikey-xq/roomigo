/**
 * Indian Standard Time (IST - Asia/Kolkata) date and time formatting utilities.
 * Uses Intl.DateTimeFormat with Asia/Kolkata timezone to prevent server/browser
 * timezone mismatches (UTC servers vs IST client devices).
 */

const istTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const istDateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Format a Date, ISO string, or timestamp into IST 12-hour chat time format (e.g. "12:54 PM").
 * Safely handles invalid inputs and existing formatted strings.
 */
export function formatChatTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "";

  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (!isNaN(d.getTime())) {
    return istTimeFormatter.format(d);
  }

  // If already a pre-formatted string (e.g. "Just now" or "12:54 PM")
  if (typeof dateInput === "string") {
    return dateInput;
  }

  return "";
}

/**
 * Format a Date, ISO string, or timestamp into an IST date string (e.g. "15 Nov 2026").
 */
export function formatDateIST(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "";

  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (!isNaN(d.getTime())) {
    return istDateFormatter.format(d);
  }

  if (typeof dateInput === "string") {
    return dateInput;
  }

  return "";
}
