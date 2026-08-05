import type { AccentColor, Flashcard, IconName, NoteSection } from "../types";
import {
  generateFlashcardsWithGemini,
  generateFlashcardsFromSectionsWithGemini,
} from "../lib/gemini";

let uid = 0;
function id() {
  uid += 1;
  return `fc${Date.now().toString(36)}${uid}`;
}

// icon + color from topic
function inferMeta(query: string): { icon: IconName; color: AccentColor; subjectName: string } {
  const q = query.toLowerCase();
  if (/biology|anatomy|cell|genetics|ecology/.test(q))
    return { icon: "biology", color: "green", subjectName: "Biology" };
  if (/physics|newton|motion|force|electricity/.test(q))
    return { icon: "physics", color: "orange", subjectName: "Physics" };
  if (/calculus|math|algebra|derivative|integral|geometry|statistics/.test(q))
    return { icon: "calculus", color: "orange", subjectName: "Mathematics" };
  if (/history|war|revolution|civilization/.test(q))
    return { icon: "history", color: "green", subjectName: "History" };
  if (/english|literature|essay|poetry|novel/.test(q))
    return { icon: "english", color: "tan", subjectName: "English" };
  if (/chemistry|chemical|reaction|element/.test(q))
    return { icon: "chemistry", color: "orange", subjectName: "Chemistry" };
  if (/computer|programming|algorithm|software/.test(q))
    return { icon: "computer_science", color: "tan", subjectName: "Computer Science" };
  return { icon: "general", color: "tan", subjectName: "General Studies" };
}

export async function generateFlashcards(subjectOrTopic: string): Promise<{
  title: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  cards: Flashcard[];
}> {
  const trimmed = subjectOrTopic.trim() || "General Studies";
  const meta = inferMeta(trimmed);
  const rawCards = await generateFlashcardsWithGemini(trimmed, 8);

  return {
    title: trimmed,
    subjectName: meta.subjectName,
    icon: meta.icon,
    color: meta.color,
    cards: rawCards.map((c) => ({ id: id(), front: c.front, back: c.back })),
  };
}

export async function generateFlashcardsFromSections(
  sections: NoteSection[],
  opts: { limit?: number; noteTitle?: string } = {}
): Promise<Flashcard[]> {
  const noteTitle = opts.noteTitle ?? "Notes";
  const count = opts.limit ?? 12;

  const rawCards = await generateFlashcardsFromSectionsWithGemini(
    noteTitle,
    sections.map((s) => ({ heading: s.heading, bullets: s.bullets })),
    count
  );

  return rawCards.map((c) => ({ id: id(), front: c.front, back: c.back }));
}
