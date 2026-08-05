import type { AccentColor, IconName, NoteSection, NoteSectionKind } from "../types";
import { generateNoteWithGemini } from "../lib/gemini";

let uid = 0;
function id() {
  uid += 1;
  return `s${Date.now().toString(36)}${uid}`;
}

function makeSection(kind: NoteSectionKind, heading: string, bullets: string[]): NoteSection {
  return { id: id(), kind, heading, bullets };
}

export interface GeneratedNote {
  title: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  sections: NoteSection[];
  excerpt: string;
}

// icon + color from topic keywords
function inferMeta(input: string): { icon: IconName; color: AccentColor; subjectName: string } {
  const lower = input.toLowerCase();
  if (/biology|anatomy|physiology|cell|genetics|ecology/.test(lower))
    return { icon: "biology", color: "green", subjectName: "Biology" };
  if (/physics|newton|motion|mechanic|force|electricity|magnetism/.test(lower))
    return { icon: "physics", color: "orange", subjectName: "Physics" };
  if (/calculus|math|algebra|derivative|integral|geometry|statistics|trig/.test(lower))
    return { icon: "calculus", color: "orange", subjectName: "Mathematics" };
  if (/history|war|revolution|civilization|empire|society/.test(lower))
    return { icon: "history", color: "green", subjectName: "History" };
  if (/english|literature|essay|shakespeare|poetry|novel/.test(lower))
    return { icon: "english", color: "tan", subjectName: "English" };
  if (/chemistry|chemical|reaction|element|compound/.test(lower))
    return { icon: "chemistry", color: "orange", subjectName: "Chemistry" };
  if (/computer|programming|algorithm|software|code/.test(lower))
    return { icon: "computer_science", color: "tan", subjectName: "Computer Science" };
  if (/economics|market|supply|demand|finance/.test(lower))
    return { icon: "economics", color: "amber", subjectName: "Economics" };
  if (/psychology|behavior|cognitive|mental/.test(lower))
    return { icon: "psychology", color: "tan", subjectName: "Psychology" };
  return { icon: "general", color: "tan", subjectName: "General Studies" };
}

function toTitle(input: string) {
  const clean = input.replace(/["?.]/g, "").trim();
  const words = clean.split(" ").slice(0, 8).join(" ");
  return words.length > 0 ? words.charAt(0).toUpperCase() + words.slice(1) : "Untitled Notes";
}

export async function generateNotes(input: string, sourceText?: string): Promise<GeneratedNote> {
  const meta = inferMeta(input || sourceText || "");
  const topic = input.trim() || "General Studies";

  const gemini = await generateNoteWithGemini(topic, sourceText);

  const sections: NoteSection[] = [
    makeSection("overview", "Overview", [gemini.overview]),
    makeSection("objectives", "Learning Objectives", gemini.objectives),
    makeSection("key_concepts", "Key Concepts", gemini.keyConcepts),
    makeSection("definitions", "Definitions", gemini.definitions),
    makeSection("important_points", "Important Points", gemini.importantPoints),
    makeSection("examples", "Examples", gemini.examples),
    makeSection("summary", "Summary", [gemini.summary]),
  ];

  const title = gemini.title?.trim() || toTitle(topic);

  return {
    title,
    subjectName: meta.subjectName,
    icon: meta.icon,
    color: meta.color,
    sections,
    excerpt: gemini.overview,
  };
}
