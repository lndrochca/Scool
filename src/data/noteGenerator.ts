import type { AccentColor, IconName, NoteSection, NoteSectionKind } from "../types";

interface Template {
  match: string[];
  icon: IconName;
  color: AccentColor;
  subjectName: string;
  overview: string;
  objectives: string[];
  keyConcepts: string[];
  definitions: string[];
  importantPoints: string[];
  examples: string[];
  summary: string;
}

let uid = 0;
function id() {
  uid += 1;
  return `s${Date.now().toString(36)}${uid}`;
}

function makeSection(kind: NoteSectionKind, heading: string, bullets: string[]): NoteSection {
  return { id: id(), kind, heading, bullets };
}

const TEMPLATES: Template[] = [
  {
    match: ["biology", "anatomy", "physiology", "cell", "genetics", "ecology"],
    icon: "biology",
    color: "green",
    subjectName: "Biology",
    overview: "Biology is the study of living organisms, from the molecular processes inside a single cell to how whole ecosystems function.",
    objectives: [
      "Describe the structure and function of a cell.",
      "Explain how organisms maintain a stable internal environment.",
      "Identify the major levels of biological organization.",
    ],
    keyConcepts: [
      "Cells are the basic structural and functional unit of all living organisms.",
      "Homeostasis is the maintenance of a stable internal environment despite external change.",
      "Energy flows through living systems via photosynthesis and cellular respiration.",
      "Genetic information is stored in DNA and expressed through transcription and translation.",
    ],
    definitions: [
      "Mitosis — cell division producing two genetically identical daughter cells.",
      "Osmosis — movement of water across a semipermeable membrane toward higher solute concentration.",
      "Enzyme — a protein catalyst that speeds up biochemical reactions without being consumed.",
    ],
    importantPoints: [
      "There are four major tissue types: epithelial, connective, muscle, and nervous.",
      "Organ systems interact with and depend on one another to keep the body functioning.",
      "The cell is the smallest unit considered to be alive.",
    ],
    examples: [
      "A muscle cell relies on cellular respiration to generate the ATP needed for contraction.",
      "Sweating is a homeostatic response that helps the body cool down.",
    ],
    summary: "Living systems maintain organization and function through interconnected cellular processes, energy transformation, and information flow encoded in DNA.",
  },
  {
    match: ["physics", "newton", "motion", "mechanics", "force", "energy", "electricity", "magnetism"],
    icon: "physics",
    color: "orange",
    subjectName: "Physics",
    overview: "Classical mechanics explains how and why objects move the way they do, using the relationships between force, mass, and motion.",
    objectives: [
      "State Newton's three laws of motion.",
      "Apply F = ma to solve basic force problems.",
      "Explain how energy and momentum are conserved in a closed system.",
    ],
    keyConcepts: [
      "Newton's First Law: an object remains at rest or in uniform motion unless acted on by a net force.",
      "Newton's Second Law relates force, mass, and acceleration.",
      "Newton's Third Law: for every action there is an equal and opposite reaction.",
      "Energy is conserved — it changes form but the total remains constant in a closed system.",
    ],
    definitions: [
      "Inertia — an object's resistance to a change in its state of motion.",
      "Momentum — the product of an object's mass and velocity.",
      "Work — energy transferred when a force moves an object over a distance.",
    ],
    importantPoints: [
      "F = ma (force equals mass times acceleration).",
      "p = mv (momentum equals mass times velocity).",
      "KE = ½mv² (kinetic energy).",
    ],
    examples: [
      "A rocket accelerates forward because expelled exhaust pushes back on it (Third Law).",
      "A ball rolling on a frictionless surface keeps moving at constant velocity (First Law).",
    ],
    summary: "Classical mechanics describes how forces cause changes in motion, and how energy and momentum are conserved in interactions between objects.",
  },
  {
    match: ["calculus", "math", "algebra", "derivative", "integral", "geometry", "statistics", "trigonometry"],
    icon: "calculus",
    color: "orange",
    subjectName: "Mathematics",
    overview: "Calculus is the mathematical study of continuous change, built on the two connected ideas of the derivative and the integral.",
    objectives: [
      "Explain what a derivative and an integral each represent.",
      "Apply the power rule and chain rule to differentiate functions.",
      "Connect derivatives and integrals through the Fundamental Theorem of Calculus.",
    ],
    keyConcepts: [
      "A derivative measures the instantaneous rate of change of a function.",
      "An integral represents accumulated area under a curve or the reverse of differentiation.",
      "Limits describe the behavior of a function as it approaches a particular input value.",
      "The Fundamental Theorem of Calculus connects derivatives and integrals.",
    ],
    definitions: [
      "Derivative — the slope of the tangent line to a function at a given point.",
      "Antiderivative — a function whose derivative is the original function.",
      "Convergence — the property of a sequence or series approaching a finite value.",
    ],
    importantPoints: [
      "Power Rule: d/dx[xⁿ] = n·xⁿ⁻¹",
      "Chain Rule: d/dx[f(g(x))] = f'(g(x))·g'(x)",
      "u-substitution: ∫f(g(x))g'(x)dx = ∫f(u)du",
    ],
    examples: [
      "The derivative of position with respect to time gives velocity.",
      "The area under a velocity-time graph gives total distance traveled.",
    ],
    summary: "Calculus provides the tools to analyze change and accumulation, forming the mathematical foundation for physics, engineering, and data analysis.",
  },
  {
    match: ["history", "war", "revolution", "civilization", "empire", "society"],
    icon: "history",
    color: "green",
    subjectName: "History",
    overview: "Studying history means tracing how political, economic, and social forces combine over time to produce lasting change.",
    objectives: [
      "Distinguish between primary and secondary sources.",
      "Identify short-term and long-term causes of a major historical event.",
      "Organize events into a coherent timeline and thematic groups.",
    ],
    keyConcepts: [
      "Historical events are shaped by overlapping political, economic, and social forces.",
      "Cause-and-effect chains often span decades before a major turning point occurs.",
      "Primary sources offer firsthand perspective; secondary sources provide analysis and context.",
    ],
    definitions: [
      "Nationalism — strong identification with and devotion to one's own nation.",
      "Treaty — a formally negotiated agreement between two or more parties, often nations.",
      "Revolution — a fundamental and often rapid change in political or social order.",
    ],
    importantPoints: [
      "Organize events chronologically, then group them by underlying theme.",
      "Identify key turning points and both immediate and long-term causes for each.",
    ],
    examples: [
      "A treaty ending one conflict can create conditions that lead to a later one.",
      "Economic hardship has historically been a catalyst for political revolution.",
    ],
    summary: "Understanding history requires tracing how political decisions, economic pressures, and social movements interact to produce lasting change.",
  },
  {
    match: ["english", "literature", "writing", "essay", "shakespeare", "poetry", "novel"],
    icon: "english",
    color: "tan",
    subjectName: "English",
    overview: "Literary study is about close reading — paying attention to language, structure, and context to understand how a text builds meaning.",
    objectives: [
      "Identify the central theme of a literary work.",
      "Recognize common literary devices and explain their effect.",
      "Build a textual argument that connects evidence back to a thesis.",
    ],
    keyConcepts: [
      "Theme is the central idea or underlying message an author explores throughout a work.",
      "Literary devices (metaphor, symbolism, foreshadowing) deepen meaning beyond the literal text.",
      "Character development reveals motivation, conflict, and change over the course of a narrative.",
    ],
    definitions: [
      "Symbolism — using an object or image to represent a larger idea.",
      "Tone — the author's attitude toward the subject, conveyed through word choice.",
      "Motif — a recurring element that reinforces the central theme.",
    ],
    importantPoints: [
      "Identify the claim, find supporting textual evidence, then explain the connection back to the theme.",
      "Consider historical and cultural context when interpreting meaning.",
    ],
    examples: [
      "A recurring image of light and darkness can symbolize a conflict between good and evil.",
      "An author's word choice can reveal an ironic or critical tone toward a character.",
    ],
    summary: "Close reading combines attention to language, structure, and context to uncover how a text builds meaning and effect.",
  },
];

const GENERIC: Template = {
  match: [],
  icon: "english",
  color: "tan",
  subjectName: "General Studies",
  overview: "A starting point for organizing this topic — add source material (a PDF, image, or pasted text) for more specific notes.",
  objectives: [
    "Identify the major components of this topic.",
    "Explain how each component connects to the broader subject.",
  ],
  keyConcepts: [
    "Break the topic into its major components before studying details.",
    "Identify how each concept connects to the broader subject.",
    "Focus first on ideas that reappear across multiple sources or lectures.",
  ],
  definitions: [
    "Add key terms here as you encounter them in lectures or readings.",
  ],
  importantPoints: [
    "Summarize each section in your own words after reading.",
    "Space out review sessions instead of cramming.",
  ],
  examples: [
    "Add a worked example here once more source material is available.",
  ],
  summary: "A concise overview of the topic will go here once more source material is added.",
};

function pickTemplate(input: string): Template {
  const lower = input.toLowerCase();
  for (const t of TEMPLATES) {
    if (t.match.some((k) => lower.includes(k))) return t;
  }
  return GENERIC;
}

function buildSections(template: Template): NoteSection[] {
  return [
    makeSection("overview", "Overview", [template.overview]),
    makeSection("objectives", "Learning Objectives", template.objectives),
    makeSection("key_concepts", "Key Concepts", template.keyConcepts),
    makeSection("definitions", "Definitions", template.definitions),
    makeSection("important_points", "Important Points", template.importantPoints),
    makeSection("examples", "Examples", template.examples),
    makeSection("summary", "Summary", [template.summary]),
  ];
}

export interface GeneratedNote {
  title: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  sections: NoteSection[];
  excerpt: string;
}

export function generateNotes(input: string, sourceText?: string): GeneratedNote {
  const template = pickTemplate(input || sourceText || "");
  const sections = buildSections(template);

  if (sourceText && sourceText.trim().length > 0) {
    const sentences = sourceText
      .replace(/\s+/g, " ")
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 12)
      .slice(0, 5);
    if (sentences.length > 0) {
      sections.unshift(makeSection("source", "From Your Material", sentences));
    }
  }

  const title = input.trim().length > 0 ? toTitle(input) : `${template.subjectName} Notes`;

  return {
    title,
    subjectName: template.subjectName,
    icon: template.icon,
    color: template.color,
    sections,
    excerpt: sections.find((s) => s.kind === "overview")?.bullets[0] ?? sections[0]?.bullets[0] ?? "",
  };
}

function toTitle(input: string) {
  const clean = input.replace(/["?.]/g, "").trim();
  const words = clean.split(" ").slice(0, 8).join(" ");
  return words.length > 0 ? words.charAt(0).toUpperCase() + words.slice(1) : "Untitled Notes";
}
