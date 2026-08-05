import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { useAuth } from "./AuthContext";
import { accountStorageKey, hasKey, readJSON, removeKey, writeJSON } from "../lib/storage";

let uid = 0;
function makeId(prefix: string) {
  uid += 1;
  return `${prefix}${Date.now().toString(36)}${uid}`;
}

const MAX_RECENTLY_VIEWED = 8;

export type NewNoteInput = Omit<Note, "id" | "createdAt" | "updatedAt" | "bookmarked" | "personalNotes"> & {
  personalNotes?: string;
};

interface PersistedAppData {
  subjects: Subject[];
  notes: Note[];
  recentlyViewedNoteIds: string[];
  gradesBySubject: Record<string, GradeNode>;
  filesBySubject: Record<string, LibraryFile[]>;
  assignmentsBySubject: Record<string, AssignmentItem[]>;
  resourcesBySubject: Record<string, LibraryResource[]>;
  flashcardSets: FlashcardSet[];
}

const EMPTY_DATA: PersistedAppData = {
  subjects: [],
  notes: [],
  recentlyViewedNoteIds: [],
  gradesBySubject: {},
  filesBySubject: {},
  assignmentsBySubject: {},
  resourcesBySubject: {},
  flashcardSets: [],
};

function dataKey(accountKey: string) {
  return accountStorageKey("data", accountKey);
}

function isEmptyData(data: PersistedAppData) {
  return (
    data.subjects.length === 0 &&
    data.notes.length === 0 &&
    data.flashcardSets.length === 0 &&
    Object.keys(data.gradesBySubject).length === 0 &&
    Object.keys(data.filesBySubject).length === 0 &&
    Object.keys(data.assignmentsBySubject).length === 0 &&
    Object.keys(data.resourcesBySubject).length === 0
  );
}

/** Loads data for `accountKey`, migrating local guest data in on first sign-in. */
function loadDataForAccount(accountKey: string): PersistedAppData {
  if (accountKey !== "guest" && !hasKey(dataKey(accountKey))) {
    const guestData = readJSON<PersistedAppData>(dataKey("guest"), EMPTY_DATA);
    if (!isEmptyData(guestData)) {
      writeJSON(dataKey(accountKey), guestData);
      removeKey(dataKey("guest"));
      return guestData;
    }
  }
  return readJSON<PersistedAppData>(dataKey(accountKey), EMPTY_DATA);
}

interface AppDataValue extends PersistedAppData {
  addSubject: (input: { name: string; code: string; icon: IconName; color: Subject["color"]; customColor?: string; category?: string; semester?: string }) => string;
  renameSubject: (id: string, name: string) => void;
  updateSubject: (id: string, patch: Partial<Pick<Subject, "name" | "description" | "category" | "semester" | "icon" | "color" | "customColor">>) => void;
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

  /** Wipes all locally persisted data for the current account. */
  clearAllData: () => void;

  /** True once local persisted data has finished loading for the active account. */
  hydrated: boolean;
}

const AppDataContext = createContext<AppDataValue | null>(null);

/** Wraps every function on `actions` so guest mutations trigger the sign-in nudge. */
function withGuestTracking<T extends Record<string, unknown>>(actions: T, onMutate: () => void): T {
  const wrapped = {} as T;
  for (const key of Object.keys(actions) as (keyof T)[]) {
    const fn = actions[key];
    if (typeof fn === "function") {
      wrapped[key] = ((...args: unknown[]) => {
        onMutate();
        return (fn as (...a: unknown[]) => unknown)(...args);
      }) as T[keyof T];
    } else {
      wrapped[key] = fn;
    }
  }
  return wrapped;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { accountKey, notifyGuestSave } = useAuth();
  const initial = useMemo(() => loadDataForAccount(accountKey), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [subjects, setSubjects] = useState<Subject[]>(initial.subjects);
  const [notes, setNotes] = useState<Note[]>(initial.notes);
  const [recentlyViewedNoteIds, setRecentlyViewedNoteIds] = useState<string[]>(initial.recentlyViewedNoteIds);
  const [gradesBySubject, setGradesBySubject] = useState<Record<string, GradeNode>>(initial.gradesBySubject);
  const [filesBySubject, setFilesBySubject] = useState<Record<string, LibraryFile[]>>(initial.filesBySubject);
  const [assignmentsBySubject, setAssignmentsBySubject] = useState<Record<string, AssignmentItem[]>>(initial.assignmentsBySubject);
  const [resourcesBySubject, setResourcesBySubject] = useState<Record<string, LibraryResource[]>>(initial.resourcesBySubject);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>(initial.flashcardSets);
  const [hydrated, setHydrated] = useState(true);

  const loadedAccountKey = useRef(accountKey);

  // When the active account changes (sign in / sign out), swap in that
  // account's persisted data. Guest -> account data is migrated once,
  // inside loadDataForAccount, so nothing created as a guest is lost.
  useEffect(() => {
    if (loadedAccountKey.current === accountKey) return;
    loadedAccountKey.current = accountKey;
    setHydrated(false);
    const data = loadDataForAccount(accountKey);
    setSubjects(data.subjects);
    setNotes(data.notes);
    setRecentlyViewedNoteIds(data.recentlyViewedNoteIds);
    setGradesBySubject(data.gradesBySubject);
    setFilesBySubject(data.filesBySubject);
    setAssignmentsBySubject(data.assignmentsBySubject);
    setResourcesBySubject(data.resourcesBySubject);
    setFlashcardSets(data.flashcardSets);
    setHydrated(true);
  }, [accountKey]);

  // Persist to localStorage whenever data changes, scoped to the active account.
  useEffect(() => {
    if (!hydrated) return;
    const snapshot: PersistedAppData = {
      subjects,
      notes,
      recentlyViewedNoteIds,
      gradesBySubject,
      filesBySubject,
      assignmentsBySubject,
      resourcesBySubject,
      flashcardSets,
    };
    const timeout = setTimeout(() => writeJSON(dataKey(accountKey), snapshot), 200);
    return () => clearTimeout(timeout);
  }, [
    accountKey,
    hydrated,
    subjects,
    notes,
    recentlyViewedNoteIds,
    gradesBySubject,
    filesBySubject,
    assignmentsBySubject,
    resourcesBySubject,
    flashcardSets,
  ]);

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

  const actions = useMemo(
    () => ({
      addSubject: ({ name, code, icon, color, customColor, category, semester }: { name: string; code: string; icon: IconName; color: Subject["color"]; customColor?: string; category?: string; semester?: string }) => {
        const id = makeId("subj");
        setSubjects((prev) => [
          ...prev,
          { id, name, code, icon, color, customColor, notesCount: 0, gradePercent: 0, letterGrade: "—", category, semester },
        ]);
        return id;
      },
      renameSubject: (id: string, name: string) => {
        setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
      },
      updateSubject: (id: string, patch: Partial<Pick<Subject, "name" | "description" | "category" | "semester" | "icon" | "color" | "customColor">>) => {
        setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
      },
      deleteSubject: (id: string) => {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        setNotes((prev) => prev.filter((n) => n.subjectId !== id));
        setGradesBySubject((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setFilesBySubject((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setAssignmentsBySubject((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setResourcesBySubject((prev) => { const next = { ...prev }; delete next[id]; return next; });
      },
      togglePin: (id: string) => {
        setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
      },

      addNote: (note: NewNoteInput) => {
        const id = makeId("note");
        const now = Date.now();
        setNotes((prev) => [
          { ...note, id, createdAt: now, updatedAt: now, bookmarked: false, personalNotes: note.personalNotes ?? "" },
          ...prev,
        ]);
        return id;
      },
      updateNote: (id: string, patch: Partial<Note>) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
      },
      deleteNote: (id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setRecentlyViewedNoteIds((prev) => prev.filter((nid) => nid !== id));
      },
      updatePersonalNotes: (id: string, personalNotes: string) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, personalNotes, updatedAt: Date.now() } : n)));
      },
      toggleNoteBookmark: (id: string) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, bookmarked: !n.bookmarked } : n)));
      },
      touchNoteViewed: (id: string) => {
        setRecentlyViewedNoteIds((prev) => [id, ...prev.filter((nid) => nid !== id)].slice(0, MAX_RECENTLY_VIEWED));
      },

      setGradeTree: (subjectId: string, root: GradeNode) => {
        setGradesBySubject((prev) => ({ ...prev, [subjectId]: root }));
        recalcSubjectGrade(subjectId, root);
      },

      addFile: (subjectId: string, file: { name: string; kind: LibraryFile["kind"] }) => {
        const newFile: LibraryFile = { id: makeId("file"), name: file.name, kind: file.kind, addedAt: Date.now() };
        setFilesBySubject((prev) => ({ ...prev, [subjectId]: [newFile, ...(prev[subjectId] ?? [])] }));
      },
      renameFile: (subjectId: string, fileId: string, name: string) => {
        setFilesBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).map((f) => (f.id === fileId ? { ...f, name } : f)),
        }));
      },
      deleteFile: (subjectId: string, fileId: string) => {
        setFilesBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).filter((f) => f.id !== fileId),
        }));
      },

      addAssignment: (subjectId: string, input: { title: string; due: string; weightPercent: number; priority: AssignmentPriority }) => {
        const newItem: AssignmentItem = { id: makeId("as"), done: false, ...input };
        setAssignmentsBySubject((prev) => ({ ...prev, [subjectId]: [...(prev[subjectId] ?? []), newItem] }));
      },
      updateAssignment: (subjectId: string, assignmentId: string, patch: Partial<AssignmentItem>) => {
        setAssignmentsBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).map((a) => (a.id === assignmentId ? { ...a, ...patch } : a)),
        }));
      },
      toggleAssignmentDone: (subjectId: string, assignmentId: string) => {
        setAssignmentsBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).map((a) => (a.id === assignmentId ? { ...a, done: !a.done } : a)),
        }));
      },
      deleteAssignment: (subjectId: string, assignmentId: string) => {
        setAssignmentsBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).filter((a) => a.id !== assignmentId),
        }));
      },

      addResource: (subjectId: string, input: { title: string; kind: ResourceKind; url: string; category: string }) => {
        const newResource: LibraryResource = { id: makeId("res"), addedAt: Date.now(), ...input };
        setResourcesBySubject((prev) => ({ ...prev, [subjectId]: [newResource, ...(prev[subjectId] ?? [])] }));
      },
      updateResource: (subjectId: string, resourceId: string, patch: Partial<LibraryResource>) => {
        setResourcesBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).map((r) => (r.id === resourceId ? { ...r, ...patch } : r)),
        }));
      },
      deleteResource: (subjectId: string, resourceId: string) => {
        setResourcesBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] ?? []).filter((r) => r.id !== resourceId),
        }));
      },

      addFlashcardSet: (set: Omit<FlashcardSet, "id" | "createdAt">) => {
        const setId = makeId("fcset");
        setFlashcardSets((prev) => [{ ...set, id: setId, createdAt: "Just now" }, ...prev]);
        return setId;
      },
      deleteFlashcardSet: (id: string) => {
        setFlashcardSets((prev) => prev.filter((s) => s.id !== id));
      },
      updateFlashcardSetCards: (id: string, cards: Flashcard[]) => {
        setFlashcardSets((prev) => prev.map((s) => (s.id === id ? { ...s, cards } : s)));
      },
    }),
    []
  );

  const trackedActions = useMemo(() => withGuestTracking(actions, notifyGuestSave), [actions, notifyGuestSave]);

  const clearAllData = () => {
    setSubjects([]);
    setNotes([]);
    setRecentlyViewedNoteIds([]);
    setGradesBySubject({});
    setFilesBySubject({});
    setAssignmentsBySubject({});
    setResourcesBySubject({});
    setFlashcardSets([]);
    removeKey(dataKey(accountKey));
  };

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
      hydrated,
      clearAllData,
      ...trackedActions,
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
      hydrated,
      trackedActions,
      accountKey,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
