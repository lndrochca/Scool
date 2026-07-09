import type { GradeCategory } from "../types";

let uid = 0;
function id() {
  uid += 1;
  return `g${Date.now().toString(36)}${uid}`;
}

const DEFAULT_CATEGORIES: Omit<GradeCategory, "id" | "assignments">[] = [
  { name: "Exams", weightPercent: 30 },
  { name: "Quizzes", weightPercent: 20 },
  { name: "Assignments", weightPercent: 25 },
  { name: "Participation", weightPercent: 10 },
  { name: "Final Exam", weightPercent: 15 },
];

/** simple syllabus parsing */
export function parseSyllabus(text: string): GradeCategory[] {
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

  const base = useFound
    ? found.map((f) => ({ name: f.name, weightPercent: f.weight }))
    : DEFAULT_CATEGORIES;

  return base.map((c) => ({
    id: id(),
    name: c.name,
    weightPercent: c.weightPercent,
    assignments: [
      { id: id(), name: `${c.name} 1`, score: null, maxScore: 100 },
    ],
  }));
}

function toTitleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

export function computeGrade(categories: GradeCategory[]): { current: number; projected: number; letter: string } {
  let earnedWeightedSum = 0;
  let earnedWeightTotal = 0;
  let projectedWeightedSum = 0;
  let projectedWeightTotal = 0;

  for (const cat of categories) {
    const graded = cat.assignments.filter((a) => a.score !== null && a.maxScore > 0);
    const all = cat.assignments.filter((a) => a.maxScore > 0);
    if (all.length === 0) continue;

    if (graded.length > 0) {
      const avg = graded.reduce((sum, a) => sum + (a.score! / a.maxScore) * 100, 0) / graded.length;
      earnedWeightedSum += avg * cat.weightPercent;
      earnedWeightTotal += cat.weightPercent;
    }

    const projAvg =
      graded.length > 0
        ? graded.reduce((sum, a) => sum + (a.score! / a.maxScore) * 100, 0) / graded.length
        : 100;
    projectedWeightedSum += projAvg * cat.weightPercent;
    projectedWeightTotal += cat.weightPercent;
  }

  const current = earnedWeightTotal > 0 ? earnedWeightedSum / earnedWeightTotal : 0;
  const projected = projectedWeightTotal > 0 ? projectedWeightedSum / projectedWeightTotal : 0;

  return { current: round1(current), projected: round1(projected), letter: toLetter(current) };
}

export function computeCategoryPercent(cat: GradeCategory): number | null {
  const graded = cat.assignments.filter((a) => a.score !== null && a.maxScore > 0);
  if (graded.length === 0) return null;
  const avg = graded.reduce((sum, a) => sum + (a.score! / a.maxScore) * 100, 0) / graded.length;
  return round1(avg);
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function toLetter(pct: number): string {
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 60) return "D";
  if (pct <= 0) return "—";
  return "F";
}
