export type AccentColor = "green" | "orange" | "tan" | "red" | "amber";

export type IconName = "biology" | "calculus" | "history" | "physics" | "english";

export interface Subject {
  id: string;
  name: string;
  code: string;
  icon: IconName;
  color: AccentColor;
  notesCount: number;
  gradePercent: number;
  letterGrade: string;
  pinned?: boolean;
  semester?: string;
  category?: string;
  description?: string;
}

export type NoteSectionKind =
  | "overview"
  | "objectives"
  | "key_concepts"
  | "definitions"
  | "important_points"
  | "examples"
  | "summary"
  | "source"
  | "custom";

export interface NoteSection {
  id: string;
  kind: NoteSectionKind;
  heading: string;
  bullets: string[];
}

export type NoteSourceType = "subject" | "paste" | "explain" | "upload";

export interface Note {
  id: string;
  title: string;
  subjectId?: string;
  subjectCode: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  excerpt: string;
  createdAt: number;
  updatedAt: number;
  sections: NoteSection[];
  personalNotes: string;
  sourceType: NoteSourceType;
  bookmarked?: boolean;
}

export type GradeNodeKind = "folder" | "item";

export interface GradeNode {
  id: string;
  kind: GradeNodeKind;
  name: string;
  weightPercent: number;
  collapsed?: boolean;
  notes?: string;
  date?: string;
  children?: GradeNode[];
  score?: number | null;
  maxScore?: number;
}

export interface LibraryFile {
  id: string;
  name: string;
  kind: "pdf" | "image" | "file";
  addedAt: number;
}

export type AssignmentPriority = "low" | "medium" | "high";

export interface AssignmentItem {
  id: string;
  title: string;
  due: string;
  weightPercent: number;
  priority: AssignmentPriority;
  done: boolean;
}

export type ResourceKind = "link" | "document" | "video";

export interface LibraryResource {
  id: string;
  title: string;
  kind: ResourceKind;
  url: string;
  category: string;
  addedAt: number;
}

export type DueUrgency = "overdue" | "today" | "tomorrow" | "upcoming";

export interface UpcomingItem {
  id: string;
  title: string;
  subjectName: string;
  weightPercent: number;
  icon: IconName;
  color: AccentColor;
  due: string;
  urgency: DueUrgency;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  subjectId?: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  cards: Flashcard[];
  createdAt: string;
}

export type WorkspaceTabTarget = "overview" | "notes" | "files" | "assignments" | "grades" | "assistant" | "resources";

export type PageName =
  | "dashboard"
  | "notes"
  | "grades"
  | "library"
  | "bookshelf"
  | "flashcards"
  | "profile"
  | "settings"
  | "subject";
