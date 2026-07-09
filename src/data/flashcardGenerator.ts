import type { AccentColor, Flashcard, IconName } from "../types";

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
