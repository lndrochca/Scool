import type { AccentColor, Flashcard, IconName, NoteSection, NoteSectionKind } from "../types";

interface Template {
  match: string[];
  icon: IconName;
  color: AccentColor;
  subjectName: string;
  cards: Array<{ front: string; back: string }>;
}

let uid = 0;
function id() {
  uid += 1;
  return `fc${Date.now().toString(36)}${uid}`;
}

const card = (front: string, back: string) => ({ front, back });

const TEMPLATES: Template[] = [
  {
    match: ["biology", "anatomy", "physiology", "cell", "genetics", "ecology"],
    icon: "biology",
    color: "green",
    subjectName: "Biology",
    cards: [
      card("What is the basic unit of life?", "The cell — the smallest structural and functional unit of all living organisms."),
      card("Define homeostasis.", "The maintenance of a stable internal environment despite changes in the external environment."),
      card("What is mitosis?", "Cell division that produces two genetically identical daughter cells."),
      card("What is osmosis?", "The movement of water across a semipermeable membrane toward a region of higher solute concentration."),
      card("What is an enzyme?", "A protein catalyst that speeds up biochemical reactions without being consumed."),
      card("Roughly how much ATP is produced per glucose molecule?", "About 36–38 ATP: ~2 from glycolysis, ~2 from the Krebs cycle, ~34 from oxidative phosphorylation."),
    ],
  },
  {
    match: ["calculus", "math", "algebra", "derivative", "integral", "geometry", "statistics", "trigonometry"],
    icon: "calculus",
    color: "orange",
    subjectName: "Mathematics",
    cards: [
      card("What does a derivative measure?", "The instantaneous rate of change of a function at a given point."),
      card("What does an integral represent?", "Accumulated area under a curve — the reverse operation of differentiation."),
      card("State the Power Rule.", "d/dx[xⁿ] = n·xⁿ⁻¹"),
      card("State the Chain Rule.", "d/dx[f(g(x))] = f'(g(x)) · g'(x)"),
      card("What is an antiderivative?", "A function whose derivative is the original function."),
      card("What does the Fundamental Theorem of Calculus connect?", "It links derivatives and integrals, showing they are inverse operations."),
    ],
  },
  {
    match: ["history", "war", "revolution", "civilization", "empire", "society"],
    icon: "history",
    color: "green",
    subjectName: "History",
    cards: [
      card("What is nationalism?", "Strong identification with and devotion to one's own nation."),
      card("What is a treaty?", "A formally negotiated agreement between two or more parties, often nations."),
      card("What is a primary source?", "A firsthand account or original document from the time period being studied."),
      card("What is a secondary source?", "A source that analyzes or interprets primary sources, written after the fact."),
      card("Why organize events chronologically first?", "It reveals cause-and-effect chains before grouping events by theme."),
    ],
  },
  {
    match: ["english", "literature", "writing", "essay", "shakespeare", "poetry", "novel"],
    icon: "english",
    color: "tan",
    subjectName: "English",
    cards: [
      card("What is theme?", "The central idea or underlying message an author explores throughout a work."),
      card("Define symbolism.", "Using an object or image to represent a larger idea."),
      card("Define tone.", "The author's attitude toward the subject, conveyed through word choice."),
      card("What is a motif?", "A recurring element that reinforces a work's central theme."),
      card("What's the first step in analysis?", "Identify the claim, find supporting textual evidence, then connect it back to the theme."),
    ],
  },
];

const GENERIC: Template = {
  match: [],
  icon: "english",
  color: "tan",
  subjectName: "General Studies",
  cards: [
    card("What's the first step when studying a new topic?", "Break it into its major components before studying the details."),
    card("How should you space out review sessions?", "Spread them over time instead of cramming — spaced repetition improves recall."),
    card("What's a good way to test recall?", "Write your own practice questions and answer them without looking at notes."),
  ],
};

function findTemplate(query: string): Template {
  const q = query.toLowerCase();
  return TEMPLATES.find((t) => t.match.some((m) => q.includes(m))) ?? GENERIC;
}

export function generateFlashcards(subjectOrTopic: string): {
  title: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  cards: Flashcard[];
} {
  const trimmed = subjectOrTopic.trim() || "General Studies";
  const template = findTemplate(trimmed);
  return {
    title: trimmed,
    subjectName: template.subjectName,
    icon: template.icon,
    color: template.color,
    cards: template.cards.map((c) => ({ id: id(), front: c.front, back: c.back })),
  };
}

const STOPWORDS = new Set([
  "the", "and", "that", "with", "from", "this", "into", "your", "their", "which", "these",
  "have", "will", "each", "than", "then", "when", "what", "such", "over", "also", "used",
  "using", "about", "through", "across", "toward", "before", "after", "while", "where",
  "there", "being", "were", "does", "often", "most", "some", "into", "onto", "upon",
]);

function pickBlankWord(sentence: string): string | null {
  const words = sentence.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]{2,}/g) ?? [];
  const candidates = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
  if (candidates.length === 0) return null;
  return candidates.reduce((best, w) => (w.length > best.length ? w : best), candidates[0]);
}

function makeClozeCard(sentence: string, sectionLabel: string): { front: string; back: string } | null {
  const blankWord = pickBlankWord(sentence);
  if (!blankWord) return null;
  const pattern = new RegExp(`\\b${blankWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  const redacted = sentence.replace(pattern, "_____");
  if (redacted === sentence) return null;
  return { front: `(${sectionLabel}) Fill in the blank: ${redacted}`, back: blankWord };
}

function parseDefinitionBullet(bullet: string): { front: string; back: string } | null {
  const parts = bullet.split(/\s+[—–-]\s+/);
  if (parts.length < 2) return null;
  const [term, ...rest] = parts;
  const definition = rest.join(" — ").trim();
  if (!term.trim() || !definition) return null;
  return { front: `What is ${term.trim()}?`, back: definition };
}

const FLASHCARD_SOURCE_KINDS: NoteSectionKind[] = [
  "definitions",
  "key_concepts",
  "important_points",
  "examples",
  "objectives",
];

export function generateFlashcardsFromSections(
  sections: NoteSection[],
  opts: { limit?: number } = {}
): Flashcard[] {
  const limit = opts.limit ?? 14;
  const cards: { front: string; back: string }[] = [];

  for (const section of sections) {
    if (!FLASHCARD_SOURCE_KINDS.includes(section.kind)) continue;

    for (const bullet of section.bullets) {
      if (cards.length >= limit) break;
      const clean = bullet.trim();
      if (!clean) continue;

      if (section.kind === "definitions") {
        const parsed = parseDefinitionBullet(clean);
        if (parsed) {
          cards.push(parsed);
          continue;
        }
      }

      const cloze = makeClozeCard(clean, section.heading);
      if (cloze) cards.push(cloze);
    }
  }

  return cards.map((c) => ({ id: id(), front: c.front, back: c.back }));
}
