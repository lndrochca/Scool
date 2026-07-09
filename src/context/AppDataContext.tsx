import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  AssignmentItem,
  Deadline,
  Flashcard,
  FlashcardSet,
  GradeCategory,
  IconName,
  LibraryFile,
  Note,
  Profile,
  Subject,
} from "../types";
import {
  assignmentsBook,
  filesBook,
  gradeBook,
  recentNotes as initialNotes,
  seedDeadlines,
  subjects as initialSubjects,
} from "../data/mockData";
import { computeGrade } from "../data/gradeParser";

let uid = 0;
function makeId(prefix: string) {
  uid += 1;
  return `${prefix}${Date.now().toString(36)}${uid}`;
}

interface AppDataValue {
  subjects: Subject[];
  notes: Note[];
  gradesBySubject: Record<string, GradeCategory[]>;
  filesBySubject: Record<string, LibraryFile[]>;
  assignmentsBySubject: Record<string, AssignmentItem[]>;
  flashcardSets: FlashcardSet[];
  deadlines: Deadline[];
  profile: Profile;

  addSubject: (input: { name: string; code: string; icon: IconName; color: Subject["color"]; category?: string }) => string;
  renameSubject: (id: string, name: string) => void;
  deleteSubject: (id: string) => void;
  togglePin: (id: string) => void;

  addNote: (note: Omit<Note, "id" | "timeAgo">) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  setGradeCategories: (subjectId: string, categories: GradeCategory[]) => void;

  addFlashcardSet: (set: Omit<FlashcardSet, "id" | "createdAt">) => string;
  deleteFlashcardSet: (id: string) => void;
  updateFlashcardSetCards: (id: string, cards: Flashcard[]) => void;

  addDeadline: (input: Omit<Deadline, "id" | "completed">) => void;
  toggleDeadlineComplete: (id: string) => void;
  deleteDeadline: (id: string) => void;

  updateProfile: (patch: Partial<Profile>) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [gradesBySubject, setGradesBySubject] = useState<Record<string, GradeCategory[]>>(gradeBook);
  const [filesBySubject] = useState<Record<string, LibraryFile[]>>(filesBook);
  const [assignmentsBySubject] = useState<Record<string, AssignmentItem[]>>(assignmentsBook);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => seedDeadlines());
  const [profile, setProfile] = useState<Profile>({
    name: "Lean Dro",
    email: "kookoomilon@gmail.com",
    semester: "Fall 2026",
  });

  const recalcSubjectGrade = (subjectId: string, categories: GradeCategory[]) => {
    const { current, letter } = computeGrade(categories);
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, gradePercent: Math.round(current), letterGrade: letter } : s))
    );
  };

  const value = useMemo<AppDataValue>(
    () => ({
      subjects,
      notes,
      gradesBySubject,
      filesBySubject,
      assignmentsBySubject,
      flashcardSets,
      deadlines,
      profile,

      addSubject: ({ name, code, icon, color, category }) => {
        const id = makeId("subj");
        setSubjects((prev) => [
          ...prev,
          { id, name, code, icon, color, notesCount: 0, gradePercent: 0, letterGrade: "—", category, semester: "Fall 2026" },
        ]);
        return id;
      },
      renameSubject: (id, name) => {
        setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
      },
      deleteSubject: (id) => {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        setNotes((prev) => prev.filter((n) => n.subjectId !== id));
      },
      togglePin: (id) => {
        setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
      },

      addNote: (note) => {
        const id = makeId("note");
        setNotes((prev) => [{ ...note, id, timeAgo: "Just now" }, ...prev]);
        if (note.subjectId) {
          setSubjects((prev) =>
            prev.map((s) => (s.id === note.subjectId ? { ...s, notesCount: s.notesCount + 1 } : s))
          );
        }
        return id;
      },
      updateNote: (id, patch) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
      },
      deleteNote: (id) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      },

      setGradeCategories: (subjectId, categories) => {
        setGradesBySubject((prev) => ({ ...prev, [subjectId]: categories }));
        recalcSubjectGrade(subjectId, categories);
      },

      addFlashcardSet: (set) => {
        const setId = makeId("fcset");
        setFlashcardSets((prev) => [{ ...set, id: setId, createdAt: "Just now" }, ...prev]);
        return setId;
      },
      deleteFlashcardSet: (id) => {
        setFlashcardSets((prev) => prev.filter((s) => s.id !== id));
      },
      updateFlashcardSetCards: (id, cards) => {
        setFlashcardSets((prev) => prev.map((s) => (s.id === id ? { ...s, cards } : s)));
      },

      addDeadline: (input) => {
        setDeadlines((prev) => [...prev, { ...input, id: makeId("dl"), completed: false }]);
      },
      toggleDeadlineComplete: (id) => {
        setDeadlines((prev) => prev.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)));
      },
      deleteDeadline: (id) => {
        setDeadlines((prev) => prev.filter((d) => d.id !== id));
      },

      updateProfile: (patch) => {
        setProfile((prev) => ({ ...prev, ...patch }));
      },
    }),
    [subjects, notes, gradesBySubject, filesBySubject, assignmentsBySubject, flashcardSets, deadlines, profile]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
