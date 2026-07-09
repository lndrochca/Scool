import type { DueUrgency } from "../types";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getDueMeta(dueDateISO: string): { label: string; urgency: DueUrgency; daysLeft: number } {
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(`${dueDateISO}T00:00:00`));
  const daysLeft = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (daysLeft < 0) {
    const n = Math.abs(daysLeft);
    return { label: `${n} day${n === 1 ? "" : "s"} overdue`, urgency: "overdue", daysLeft };
  }
  if (daysLeft === 0) return { label: "Due Today", urgency: "today", daysLeft };
  if (daysLeft === 1) return { label: "Due Tomorrow", urgency: "tomorrow", daysLeft };
  return { label: `${daysLeft} days left`, urgency: "upcoming", daysLeft };
}
