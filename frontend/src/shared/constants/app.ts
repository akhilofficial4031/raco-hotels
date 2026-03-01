export const APP_LOCALE = "en-IN";

// Day.js compatible formats
export const DATE_FORMAT_DISPLAY = "DD/MM/YYYY"; // Indian common display format
export const DATE_FORMAT_API = "YYYY-MM-DD"; // ISO-like format for API payloads

// Intl.DateTimeFormat options for toLocaleDateString
export const LOCALE_DATE_OPTIONS_SHORT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export const LOCALE_DATE_OPTIONS_LONG: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const DEFAULT_CURRENCY = "INR";

export const CURRENCY_SYMBOL = "₹";

// Tax rates (as multipliers, e.g. 0.05 = 5%)
export const TAX_RATES = {
  ROOM_TAX: 0.05,
  EXTRA_ADULT_TAX: 0.05,
} as const;
