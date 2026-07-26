import type { GradeNode } from "../types";
import { createFolder, createItem } from "./gradeTree";

const DEFAULT_CATEGORIES: { name: string; weight: number }[] = [
  { name: "Exams", weight: 30 },
  { name: "Quizzes", weight: 20 },
  { name: "Assignments", weight: 25 },
  { name: "Participation", weight: 10 },
  { name: "Final Exam", weight: 15 },
];

export function parseSyllabus(text: string): GradeNode[] {
  const lines = text
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);

  const found: { name: string; weight: number }[] = [];
  const pattern = /^([A-Za-z][A-Za-z0-9 &/'-]{1,40}?)[\s:\-–—]*[:\-–—]?\s*(\d{1,3})\s*%/;

  for (const line of lines) {
    const m = line.match(pattern);
    if (m) {
      const name = m[1].trim().replace(/[-–—:]+$/, "").trim();
      const weight = Math.min(100, parseInt(m[2], 10));
      if (name.length > 1 && weight > 0) {
        found.push({ name: toTitleCase(name), weight });
      }
    }
  }

  const totalFound = found.reduce((sum, f) => sum + f.weight, 0);
  const useFound = found.length >= 2 && totalFound <= 100 && totalFound >= 60;
  const base = useFound ? found : DEFAULT_CATEGORIES;

  return base.map((c) => {
    const folder = createFolder(c.name, c.weight);
    folder.children = [createItem(`${c.name} 1`, 0, 100)];
    return folder;
  });
}

function toTitleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}
