import type { DueUrgency } from "../types";

export function formatTimeAgo(timestamp: number, now: number = Date.now()): string {
  const diffMs = Math.max(0, now - timestamp);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) {
    const m = Math.floor(diffMs / minute);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diffMs < day) {
    const h = Math.floor(diffMs / hour);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (diffMs < 2 * day) return "Yesterday";
  if (diffMs < week) {
    const d = Math.floor(diffMs / day);
    return `${d} days ago`;
  }
  const w = Math.floor(diffMs / week);
  if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDue(iso: string, now: number = Date.now()): { label: string; urgency: DueUrgency } {
  if (!iso) return { label: "No due date", urgency: "upcoming" };

  const due = new Date(`${iso}T00:00:00`);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const dayMs = 86_400_000;
  const diffDays = Math.round((due.getTime() - today.getTime()) / dayMs);

  if (diffDays < 0) return { label: `${Math.abs(diffDays)} day${diffDays === -1 ? "" : "s"} overdue`, urgency: "overdue" };
  if (diffDays === 0) return { label: "Due Today", urgency: "today" };
  if (diffDays === 1) return { label: "Due Tomorrow", urgency: "tomorrow" };
  if (diffDays <= 30) return { label: `${diffDays} days left`, urgency: "upcoming" };
  return { label: due.toLocaleDateString(undefined, { month: "short", day: "numeric" }), urgency: "upcoming" };
}
