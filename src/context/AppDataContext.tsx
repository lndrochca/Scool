import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  AssignmentItem,
  AssignmentPriority,
  Flashcard,
  FlashcardSet,
  GradeNode,
  IconName,
  LibraryFile,
  LibraryResource,
  Note,
  ResourceKind,
  Subject,
} from "../types";
import { computeNodeStats, toLetter } from "../data/gradeTree";

let uid = 0;
function makeId(prefix: string) {
  uid += 1;
  return `${prefix}${Date.now().toString(36)}${uid}`;
}

const MAX_RECENTLY_VIEWED = 8;

export type NewNoteInput = Omit<Note, "id" | "createdAt" | "updatedAt" | "bookmarked" | "personalNotes"> & {
  personalNotes?: string;
};

interface AppDataValue {
  subjects: Subject[];
  notes: Note[];
  recentlyViewedNoteIds: string[];
  gradesBySubject: Record<string, GradeNode>;
  filesBySubject: Record<string, LibraryFile[]>;
  assignmentsBySubject: Record<string, AssignmentItem[]>;
  resourcesBySubject: Record<string, LibraryResource[]>;
  flashcardSets: FlashcardSet[];

  addSubject: (input: { name: string; code: string; icon: IconName; color: Subject["color"]; category?: string }) => string;
  renameSubject: (id: string, name: string) => void;
  updateSubject: (id: string, patch: Partial<Pick<Subject, "name" | "description" | "category" | "semester">>) => void;
  deleteSubject: (id: string) => void;
  togglePin: (id: string) => void;

  addNote: (note: NewNoteInput) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  updatePersonalNotes: (id: string, personalNotes: string) => void;
  toggleNoteBookmark: (id: string) => void;
  touchNoteViewed: (id: string) => void;

  setGradeTree: (subjectId: string, root: GradeNode) => void;

  addFile: (subjectId: string, file: { name: string; kind: LibraryFile["kind"] }) => void;
  renameFile: (subjectId: string, fileId: string, name: string) => void;
  deleteFile: (subjectId: string, fileId: string) => void;

  addAssignment: (subjectId: string, input: { title: string; due: string; weightPercent: number; priority: AssignmentPriority }) => void;
  updateAssignment: (subjectId: string, assignmentId: string, patch: Partial<AssignmentItem>) => void;
  toggleAssignmentDone: (subjectId: string, assignmentId: string) => void;
  deleteAssignment: (subjectId: string, assignmentId: string) => void;

  addResource: (subjectId: string, input: { title: string; kind: ResourceKind; url: string; category: string }) => void;
  updateResource: (subjectId: string, resourceId: string, patch: Partial<LibraryResource>) => void;
  deleteResource: (subjectId: string, resourceId: string) => void;

  addFlashcardSet: (set: Omit<FlashcardSet, "id" | "createdAt">) => string;
  deleteFlashcardSet: (id: string) => void;
  updateFlashcardSetCards: (id: string, cards: Flashcard[]) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [recentlyViewedNoteIds, setRecentlyViewedNoteIds] = useState<string[]>([]);
  const [gradesBySubject, setGradesBySubject] = useState<Record<string, GradeNode>>({});
  const [filesBySubject, setFilesBySubject] = useState<Record<string, LibraryFile[]>>({});
  const [assignmentsBySubject, setAssignmentsBySubject] = useState<Record<string, AssignmentItem[]>>({});
  const [resourcesBySubject, setResourcesBySubject] = useState<Record<string, LibraryResource[]>>({});
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);

  const recalcSubjectGrade = (subjectId: string, root: GradeNode) => {
    const { percent } = computeNodeStats(root);
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId ? { ...s, gradePercent: percent !== null ? Math.round(percent) : 0, letterGrade: toLetter(percent) } : s
      )
    );
  };

  const subjectsWithLiveCounts = useMemo(
    () =>
      subjects.map((s) => ({
        ...s,
        notesCount: notes.filter((n) => n.subjectId === s.id).length,
      })),
    [subjects, notes]
  );

  const value = useMemo<AppDataValue>(
    () => ({
      subjects: subjectsWithLiveCounts,
      notes,
      recentlyViewedNoteIds,
      gradesBySubject,
      filesBySubject,
      assignmentsBySubject,
      resourcesBySubject,
      flashcardSets,

      addSubject: ({ name, code, icon, color, category }) => {
        const id = makeId("subj");
        setSubjects((prev) => [
          ...prev,
          { id, name, code, icon, color, notesCount: 0, gradePercent: 0, letterGrade: "—", category },
        ]);
        return id;
      },
      renameSubject: (id, name) => {
        setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
      },
      updateSubject: (id, patch) => {
        setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
      },
      deleteSubject: (id) => {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        setNotes((prev) => prev.filter((n) => n.subjectId !== id));
        setGradesBySubject((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setFilesBySubject((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setAssignmentsBySubject((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setResourcesBySubject((prev) => { const next = { ...prev }; delete next[id]; return next; });
      },
      togglePin: (id) => {
        setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
      },

      addNote: (note) => {
        const id = makeId("note");
        const now = Date.now();
        setNotes((prev) => [
          { ...note, id, createdAt: now, updatedAt: now, bookmarked: false, personalNotes: note.personalNotes ?? "" },
          ...prev,
        ]);
        return id;
      },
      updateNote: (id, patch) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
      },
      deleteNote: (id) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setRecentlyViewedNoteIds((prev) => prev.filter((nid) => nid !== id));
      },
      updatePersonalNotes: (id, personalNotes) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, personalNotes, updatedAt: Date.now() } : n)));
      },
      toggleNoteBookmark: (id) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, bookmarked: !n.bookmarked } : n)));
      },
      touchNoteViewed: (id) => {
        setRecentlyViewedNoteIds((prev) => [id, ...prev.filter((nid) => nid !== id)].slice(0, MAX_RECENTLY_VIEWED));
      },

      setGradeTree: (subjectId, root) => {
        setGradesBySubject((prev) => ({ ...prev, [subjectId]: root }));
        recalcSubjectGrade(subjectId, root);
      },

      addFile: (subjectId, file) => {
        const newFile: LibraryFile = { id: makeId("file"), name: file.name, kind: file.kind, addedAt: Date.now() };
        setFilesBySubject((prev) => ({ ...prev, [subjectId]: [newFile, ...(prev[subjectId] ?? [])] }));
      },
      renameFile: (subjectId, fileId, name) => {
        setFilesBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).map((f) => (f.id === fileId ? { ...f, name } : f)),
        }));
      },
      deleteFile: (subjectId, fileId) => {
        setFilesBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).filter((f) => f.id !== fileId),
        }));
      },

      addAssignment: (subjectId, input) => {
        const newItem: AssignmentItem = { id: makeId("as"), done: false, ...input };
        setAssignmentsBySubject((prev) => ({ ...prev, [subjectId]: [...(prev[subjectId] ?? []), newItem] }));
      },
      updateAssignment: (subjectId, assignmentId, patch) => {
        setAssignmentsBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).map((a) => (a.id === assignmentId ? { ...a, ...patch } : a)),
        }));
      },
      toggleAssignmentDone: (subjectId, assignmentId) => {
        setAssignmentsBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).map((a) => (a.id === assignmentId ? { ...a, done: !a.done } : a)),
        }));
      },
      deleteAssignment: (subjectId, assignmentId) => {
        setAssignmentsBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).filter((a) => a.id !== assignmentId),
        }));
      },

      addResource: (subjectId, input) => {
        const newResource: LibraryResource = { id: makeId("res"), addedAt: Date.now(), ...input };
        setResourcesBySubject((prev) => ({ ...prev, [subjectId]: [newResource, ...(prev[subjectId] ?? [])] }));
      },
      updateResource: (subjectId, resourceId, patch) => {
        setResourcesBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).map((r) => (r.id === resourceId ? { ...r, ...patch } : r)),
        }));
      },
      deleteResource: (subjectId, resourceId) => {
        setResourcesBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).filter((r) => r.id !== resourceId),
        }));
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
    }),
    [
      subjectsWithLiveCounts,
      notes,
      recentlyViewedNoteIds,
      gradesBySubject,
      filesBySubject,
      assignmentsBySubject,
      resourcesBySubject,
      flashcardSets,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
