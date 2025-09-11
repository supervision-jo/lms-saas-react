export function formatDateTimeSimple(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const absFormat = (d: Date) => {
    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = MONTHS[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
  };

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return absFormat(date);

  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  if (diffMs < MINUTE) {
    return "Now";
  }

  if (diffMs < HOUR) {
    const mins = Math.max(1, Math.floor(diffMs / MINUTE));
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }

  if (diffMs < DAY) {
    const hrs = Math.floor(diffMs / HOUR);
    return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }

  if (diffMs < WEEK) {
    const days = Math.floor(diffMs / DAY);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  if (diffMs < MONTH) {
    const weeks = Math.floor(diffMs / WEEK);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  if (diffMs < YEAR) {
    const months = Math.min(11, Math.max(1, Math.floor(diffMs / MONTH)));
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  return absFormat(date);
}
