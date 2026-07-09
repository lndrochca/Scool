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
}

export interface NoteSection {
  id: string;
  heading: string;
  bullets: string[];
}

export interface Note {
  id: string;
  title: string;
  subjectId?: string;
  subjectCode: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  excerpt: string;
  timeAgo: string;
  sections?: NoteSection[];
}

export interface GradeAssignment {
  id: string;
  name: string;
  score: number | null;
  maxScore: number;
}

export interface GradeCategory {
  id: string;
  name: string;
  weightPercent: number;
  assignments: GradeAssignment[];
}

export interface LibraryFile {
  id: string;
  name: string;
  kind: "pdf" | "image" | "file";
  addedAt: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  due: string;
  weightPercent: number;
  done: boolean;
}

export type DueUrgency = "overdue" | "today" | "tomorrow" | "upcoming";

export interface Deadline {
  id: string;
  title: string;
  subjectId?: string;
  subjectName: string;
  icon: IconName;
  color: AccentColor;
  weightPercent: number;
  dueDate: string; // iso date string
  completed: boolean;
}

export interface Profile {
  name: string;
  email: string;
  semester: string;
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

export type PageName =
  | "dashboard"
  | "notes"
  | "grades"
  | "library"
  | "bookshelf"
  | "flashcards"
  | "settings"
  | "profile"
  | "subject";
