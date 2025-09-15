export function formatImagePath(input: string): string {
  const sanitizedInput = input.replace(/'/g, "").toLowerCase();

  if (sanitizedInput === "sail cloth") {
    return sanitizedInput.replace(/ /g, "_");
  }

  if (sanitizedInput.includes("cloth")) {
    return "cloths";
  }

  if (sanitizedInput.includes("paint")) {
    return "paints";
  }

  if (sanitizedInput.includes("sloop mark ii")) {
    return "sloop";
  }

  if (
    sanitizedInput.includes("enamel") ||
    sanitizedInput.includes("gem") ||
    sanitizedInput.includes("beard") ||
    sanitizedInput.includes("topazes") ||
    sanitizedInput.includes("navy dye")
  ) {
    return "enamels";
  }

  return sanitizedInput.replace(/ /g, "_");
}

/**
 * Formats a number by rounding it to one decimal place.
 * If the result is an integer, it returns the integer part only (truncates decimals).
 * Otherwise, returns the rounded value with one decimal.
 *
 * @param value - The number to format.
 * @returns The formatted number, either as an integer or rounded to one decimal place.
 */
export function formatNumber(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? Math.trunc(rounded) : rounded;
}

export function formatNumberWithCommas(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const parts = rounded.toString().split(".");

  const withCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts[1] ? `${withCommas}.${parts[1]}` : withCommas;
}

export function getLaborTimeLeft(isoDate: string): {
  days: number;
  hours: number;
  fullString: string;
} {
  const start = parseAsUtc(isoDate);
  const now = Date.now();

  const msInDay = 24 * 60 * 60 * 1000;
  const msInHour = 60 * 60 * 1000;

  const tenDaysMs = 10 * msInDay;
  const remainingMs = start + tenDaysMs - now;

  const days = Math.floor(remainingMs / msInDay);
  const hours = Math.floor((remainingMs % msInDay) / msInHour);

  return {
    days,
    hours,
    fullString: remainingMs <= 0 ? "expired" : `${days}d, ${hours}h`,
  };
}

export function getCalendarDaysLeft(
  startIsoDate: string,
  durationDays = 30
): string {
  const msInDay = 24 * 60 * 60 * 1000;

  const startUTC = Date.UTC(
    new Date(startIsoDate).getUTCFullYear(),
    new Date(startIsoDate).getUTCMonth(),
    new Date(startIsoDate).getUTCDate()
  );

  const now = new Date();
  const nowUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  const expiryUTC = startUTC + durationDays * msInDay;
  const remainingMs = expiryUTC - nowUTC;

  return remainingMs <= 0
    ? `0 days`
    : `${Math.ceil(remainingMs / msInDay)} days`;
}

export const getLaborColor = (laborValue: "Expert" | "Skilled" | "Basic") => {
  const value = laborValue.toLowerCase();
  if (value === "expert") return "#A8E6A3";
  if (value === "skilled") return "#79B96C";
  if (value === "basic") return "#dcdcdc";
  return "#dcdcdc";
};

function parseAsUtc(iso: string): number {
  const date = new Date(iso);
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

export function formatTimestamp(unixTimestamp: number): string {
  // Multiply by 1000 because Date expects milliseconds
  const date = new Date(unixTimestamp * 1000);

  // Format to local date/time string
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDaysAgo(unixTimestamp: number): string {
  const now = new Date();
  const date = new Date(unixTimestamp * 1000);

  // Difference in full days
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function toUtcMidnight(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

export function isoUtcMidnightToday(): string {
  return toUtcMidnight(new Date()).toISOString();
}
