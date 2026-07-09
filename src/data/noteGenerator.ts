import type { AccentColor, IconName, NoteSection } from "../types";

interface Template {
  match: string[];
  icon: IconName;
  color: AccentColor;
  subjectName: string;
  sections: NoteSection[];
}

let uid = 0;
function id() {
  uid += 1;
  return `s${Date.now().toString(36)}${uid}`;
}

const section = (heading: string, bullets: string[]): NoteSection => ({ id: id(), heading, bullets });

const TEMPLATES: Template[] = [
  {
    match: ["biology", "anatomy", "physiology", "cell", "genetics", "ecology"],
    icon: "biology",
    color: "green",
    subjectName: "Biology",
    sections: [
      section("Key Concepts", [
        "Cells are the basic structural and functional unit of all living organisms.",
        "Homeostasis is the maintenance of a stable internal environment despite external change.",
        "Energy flows through living systems via photosynthesis and cellular respiration.",
        "Genetic information is stored in DNA and expressed through transcription and translation.",
      ]),
      section("Definitions", [
        "Mitosis — cell division producing two genetically identical daughter cells.",
        "Osmosis — movement of water across a semipermeable membrane toward higher solute concentration.",
        "Enzyme — a protein catalyst that speeds up biochemical reactions without being consumed.",
      ]),
      section("Important Formulas & Relationships", [
        "ATP yield: ~2 (glycolysis) + ~2 (Krebs cycle) + ~34 (oxidative phosphorylation) per glucose.",
        "Rate of diffusion is proportional to the concentration gradient (Fick's Law).",
      ]),
      section("Summary", [
        "Living systems maintain organization and function through interconnected cellular processes, energy transformation, and information flow encoded in DNA.",
      ]),
      section("Study Tips", [
        "Draw and label diagrams of the cell and major organelles from memory.",
        "Build a flowchart of cellular respiration stages before memorizing details.",
        "Use flashcards for vocabulary-heavy terms like enzyme names and processes.",
      ]),
    ],
  },
  {
    match: ["physics", "newton", "motion", "mechanics", "force", "energy", "electricity", "magnetism"],
    icon: "physics",
    color: "orange",
    subjectName: "Physics",
    sections: [
      section("Key Concepts", [
        "Newton's First Law: an object remains at rest or in uniform motion unless acted on by a net force.",
        "Newton's Second Law relates force, mass, and acceleration.",
        "Newton's Third Law: for every action there is an equal and opposite reaction.",
        "Energy is conserved — it changes form but the total remains constant in a closed system.",
      ]),
      section("Definitions", [
        "Inertia — an object's resistance to a change in its state of motion.",
        "Momentum — the product of an object's mass and velocity.",
        "Work — energy transferred when a force moves an object over a distance.",
      ]),
      section("Important Formulas", [
        "F = ma (force equals mass times acceleration)",
        "p = mv (momentum equals mass times velocity)",
        "W = Fd·cos(θ) (work equals force times distance times cosine of the angle)",
        "KE = ½mv² (kinetic energy)",
      ]),
      section("Summary", [
        "Classical mechanics describes how forces cause changes in motion, and how energy and momentum are conserved in interactions between objects.",
      ]),
      section("Study Tips", [
        "Practice free-body diagrams for every force problem before solving equations.",
        "Keep units consistent (SI) throughout every calculation.",
        "Work through past exam problems that mix multiple laws in one scenario.",
      ]),
    ],
  },
  {
    match: ["calculus", "math", "algebra", "derivative", "integral", "geometry", "statistics", "trigonometry"],
    icon: "calculus",
    color: "orange",
    subjectName: "Mathematics",
    sections: [
      section("Key Concepts", [
        "A derivative measures the instantaneous rate of change of a function.",
        "An integral represents accumulated area under a curve or the reverse of differentiation.",
        "Limits describe the behavior of a function as it approaches a particular input value.",
        "The Fundamental Theorem of Calculus connects derivatives and integrals.",
      ]),
      section("Definitions", [
        "Derivative — the slope of the tangent line to a function at a given point.",
        "Antiderivative — a function whose derivative is the original function.",
        "Convergence — the property of a sequence or series approaching a finite value.",
      ]),
      section("Important Formulas", [
        "Power Rule: d/dx[xⁿ] = n·xⁿ⁻¹",
        "Chain Rule: d/dx[f(g(x))] = f'(g(x))·g'(x)",
        "u-substitution: ∫f(g(x))g'(x)dx = ∫f(u)du",
      ]),
      section("Summary", [
        "Calculus provides the tools to analyze change and accumulation, forming the mathematical foundation for physics, engineering, and data analysis.",
      ]),
      section("Study Tips", [
        "Redo problem sets from scratch without looking at prior solutions.",
        "Memorize the core rules first, then practice recognizing which rule applies.",
        "Check answers by differentiating your integration results.",
      ]),
    ],
  },
  {
    match: ["history", "war", "revolution", "civilization", "empire", "society"],
    icon: "history",
    color: "green",
    subjectName: "History",
    sections: [
      section("Key Concepts", [
        "Historical events are shaped by overlapping political, economic, and social forces.",
        "Cause-and-effect chains often span decades before a major turning point occurs.",
        "Primary sources offer firsthand perspective; secondary sources provide analysis and context.",
      ]),
      section("Definitions", [
        "Nationalism — strong identification with and devotion to one's own nation.",
        "Treaty — a formally negotiated agreement between two or more parties, often nations.",
        "Revolution — a fundamental and often rapid change in political or social order.",
      ]),
      section("Timeline Approach", [
        "Organize events chronologically, then group them by underlying theme (political, economic, social).",
        "Identify key turning points and the immediate versus long-term causes for each.",
      ]),
      section("Summary", [
        "Understanding history requires tracing how political decisions, economic pressures, and social movements interact to produce lasting change.",
      ]),
      section("Study Tips", [
        "Build a timeline chart connecting dates, events, and key figures.",
        "Practice writing one-paragraph cause-and-effect summaries for major events.",
        "Compare multiple perspectives on the same event to strengthen essay arguments.",
      ]),
    ],
  },
  {
    match: ["english", "literature", "writing", "essay", "shakespeare", "poetry", "novel"],
    icon: "english",
    color: "tan",
    subjectName: "English",
    sections: [
      section("Key Concepts", [
        "Theme is the central idea or underlying message an author explores throughout a work.",
        "Literary devices (metaphor, symbolism, foreshadowing) deepen meaning beyond the literal text.",
        "Character development reveals motivation, conflict, and change over the course of a narrative.",
      ]),
      section("Definitions", [
        "Symbolism — using an object or image to represent a larger idea.",
        "Tone — the author's attitude toward the subject, conveyed through word choice.",
        "Motif — a recurring element that reinforces the central theme.",
      ]),
      section("Analysis Framework", [
        "Identify the claim, find supporting textual evidence, then explain the connection back to the theme.",
        "Consider historical and cultural context when interpreting meaning.",
      ]),
      section("Summary", [
        "Close reading combines attention to language, structure, and context to uncover how a text builds meaning and effect.",
      ]),
      section("Study Tips", [
        "Annotate while reading — mark shifts in tone, key quotes, and recurring images.",
        "Draft a one-sentence thesis before outlining any essay.",
        "Discuss differing interpretations with classmates to test the strength of your argument.",
      ]),
    ],
  },
];

const GENERIC: Template = {
  match: [],
  icon: "english",
  color: "tan",
  subjectName: "General Studies",
  sections: [
    section("Key Concepts", [
      "Break the topic into its major components before studying details.",
      "Identify how each concept connects to the broader subject.",
      "Focus first on ideas that reappear across multiple sources or lectures.",
    ]),
    section("Definitions", [
      "Add key terms here as you encounter them in lectures or readings.",
    ]),
    section("Summary", [
      "A concise overview of the topic will go here once more source material is added.",
    ]),
    section("Study Tips", [
      "Summarize each section in your own words after reading.",
      "Space out review sessions instead of cramming.",
      "Test recall with self-made practice questions.",
    ]),
  ],
};

function pickTemplate(input: string): Template {
  const lower = input.toLowerCase();
  for (const t of TEMPLATES) {
    if (t.match.some((k) => lower.includes(k))) return t;
  }
  return GENERIC;
}

export interface GeneratedNote {
  title: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  sections: NoteSection[];
  excerpt: string;
}

/** simple note generation from templates */
export function generateNotes(input: string, sourceText?: string): GeneratedNote {
  const template = pickTemplate(input || sourceText || "");
  const sections: NoteSection[] = template.sections.map((s) => ({ ...s, id: id(), bullets: [...s.bullets] }));

  if (sourceText && sourceText.trim().length > 0) {
    const sentences = sourceText
      .replace(/\s+/g, " ")
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 12)
      .slice(0, 5);
    if (sentences.length > 0) {
      sections.unshift(section("From Your Material", sentences));
    }
  }

  const title = input.trim().length > 0 ? toTitle(input) : `${template.subjectName} Notes`;

  return {
    title,
    subjectName: template.subjectName,
    icon: template.icon,
    color: template.color,
    sections,
    excerpt: sections[0]?.bullets[0] ?? "",
  };
}

function toTitle(input: string) {
  const clean = input.replace(/["?.]/g, "").trim();
  const words = clean.split(" ").slice(0, 8).join(" ");
  return words.length > 0 ? words.charAt(0).toUpperCase() + words.slice(1) : "Untitled Notes";
}
