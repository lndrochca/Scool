import type { AccentColor, Subject } from "../types";

export const BOOK_COLOR_PRESETS = [
  "#6366F1", // indigo
  "#3B82F6", // blue
  "#10B981", // emerald
  "#14B8A6", // teal
  "#F97316", // orange
  "#EF4444", // red
  "#EC4899", // pink
  "#8B5CF6", // violet
] as const;const LEGACY_PRESET_HEX: Record<AccentColor, string> = {
  green: "#2FA84F",
  orange: "#E8720C",
  tan: "#0071E3",
  red: "#E0342A",
  amber: "#C79000",
};

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(hex: string): string | null {
  if (!HEX_RE.test(hex.trim())) return null;
  let h = hex.trim();
  if (h.length === 4) h = "#" + [...h.slice(1)].map((c) => c + c).join("");
  return h.toLowerCase();
}

// custom hex if set, else legacy preset
export function subjectHex(subject: Pick<Subject, "color" | "customColor">): string {
  return subject.customColor || LEGACY_PRESET_HEX[subject.color] || LEGACY_PRESET_HEX.tan;
}

// black or white for contrast
export function readableTextColor(hex: string): string {
  const normalized = normalizeHex(hex) ?? "#0071e3";
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  // perceptual luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#14151A" : "#FFFFFF";
}

// css vars for subject color
export function subjectColorVars(hex: string): Record<string, string> {
  return {
    "--sc": hex,
    "--sc-text": readableTextColor(hex),
  };
}
