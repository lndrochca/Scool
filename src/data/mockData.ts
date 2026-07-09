import type { AssignmentItem, Deadline, GradeCategory, LibraryFile, Note, Subject } from "../types";

export const subjects: Subject[] = [
  { id: "bio201", name: "Biology 201", code: "BIO 201", icon: "biology", color: "green", notesCount: 14, gradePercent: 91, letterGrade: "A-", pinned: true, semester: "Fall 2026", category: "Science" },
  { id: "calc2", name: "Calculus II", code: "MATH 142", icon: "calculus", color: "orange", notesCount: 9, gradePercent: 87, letterGrade: "B+", pinned: true, semester: "Fall 2026", category: "Math" },
  { id: "hist305", name: "World History", code: "HIST 305", icon: "history", color: "green", notesCount: 18, gradePercent: 94, letterGrade: "A", semester: "Fall 2026", category: "Humanities" },
  { id: "phys101", name: "Physics 101", code: "PHYS 101", icon: "physics", color: "orange", notesCount: 7, gradePercent: 83, letterGrade: "B", semester: "Fall 2026", category: "Science" },
  { id: "eng210", name: "English 210", code: "ENG 210", icon: "english", color: "green", notesCount: 11, gradePercent: 89, letterGrade: "B+", semester: "Fall 2026", category: "Humanities" },
];

export const gradeBook: Record<string, GradeCategory[]> = {
  bio201: [
    { id: "c1", name: "Exams", weightPercent: 35, assignments: [
      { id: "a1", name: "Midterm Exam", score: 88, maxScore: 100 },
      { id: "a2", name: "Final Exam", score: null, maxScore: 100 },
    ] },
    { id: "c2", name: "Lab Work", weightPercent: 30, assignments: [
      { id: "a3", name: "Enzyme Activity Lab", score: 92, maxScore: 100 },
      { id: "a4", name: "Osmosis Lab", score: 95, maxScore: 100 },
    ] },
    { id: "c3", name: "Homework", weightPercent: 20, assignments: [
      { id: "a5", name: "Problem Set 1", score: 100, maxScore: 100 },
      { id: "a6", name: "Problem Set 2", score: 90, maxScore: 100 },
    ] },
    { id: "c4", name: "Participation", weightPercent: 15, assignments: [
      { id: "a7", name: "Discussion Attendance", score: 98, maxScore: 100 },
    ] },
  ],
  calc2: [
    { id: "c1", name: "Exams", weightPercent: 40, assignments: [
      { id: "a1", name: "Midterm 1", score: 84, maxScore: 100 },
      { id: "a2", name: "Midterm 2", score: 89, maxScore: 100 },
    ] },
    { id: "c2", name: "Problem Sets", weightPercent: 30, assignments: [
      { id: "a3", name: "Problem Set 6", score: 95, maxScore: 100 },
      { id: "a4", name: "Problem Set 7", score: null, maxScore: 100 },
    ] },
    { id: "c3", name: "Quizzes", weightPercent: 15, assignments: [
      { id: "a5", name: "Quiz 4", score: 80, maxScore: 100 },
    ] },
    { id: "c4", name: "Final Exam", weightPercent: 15, assignments: [
      { id: "a6", name: "Final Exam", score: null, maxScore: 100 },
    ] },
  ],
};

export const filesBook: Record<string, LibraryFile[]> = {
  bio201: [
    { id: "f1", name: "Syllabus_Bio201.pdf", kind: "pdf", addedAt: "3 weeks ago" },
    { id: "f2", name: "Cell Diagram Scan.jpg", kind: "image", addedAt: "5 days ago" },
  ],
  calc2: [
    { id: "f1", name: "Series_Formulas.pdf", kind: "pdf", addedAt: "1 week ago" },
  ],
};

export const assignmentsBook: Record<string, AssignmentItem[]> = {
  bio201: [
    { id: "as1", title: "Lab Report: Enzyme Activity", due: "Today", weightPercent: 15, done: false },
    { id: "as2", title: "Chapter 9 Reading Quiz", due: "In 5 days", weightPercent: 5, done: false },
  ],
  calc2: [
    { id: "as1", title: "Problem Set 7: Series", due: "Tomorrow", weightPercent: 10, done: false },
  ],
};

export const recentNotes: Note[] = [
  {
    id: "n1",
    title: "Cellular Respiration Summary",
    subjectCode: "BIO 201",
    subjectName: "Biology",
    icon: "biology",
    color: "green",
    excerpt: "Cellular respiration converts glucose into ATP through glycolysis, the Krebs cycle, and oxidative phosphorylation…",
    timeAgo: "2 hours ago",
  },
  {
    id: "n2",
    title: "Derivatives & Integration Rules",
    subjectCode: "MATH 142",
    subjectName: "Calculus",
    icon: "calculus",
    color: "orange",
    excerpt: "Key formulas: power rule, chain rule, product rule for derivatives. Integration by parts and u-substitution techniques…",
    timeAgo: "Yesterday",
  },
  {
    id: "n3",
    title: "World War II Key Events",
    subjectCode: "HIST 305",
    subjectName: "History",
    icon: "history",
    color: "green",
    excerpt: "Timeline of major events from 1939–1945 including the invasion of Poland, Pearl Harbor, D-Day, and the atomic bombings…",
    timeAgo: "2 days ago",
  },
  {
    id: "n4",
    title: "Newton's Laws of Motion",
    subjectCode: "PHYS 101",
    subjectName: "Physics",
    icon: "physics",
    color: "orange",
    excerpt: "First law: inertia. Second law: F=ma. Third law: action-reaction pairs. Applications in real-world scenarios…",
    timeAgo: "3 days ago",
  },
  {
    id: "n5",
    title: "Shakespeare's Macbeth Analysis",
    subjectCode: "ENG 210",
    subjectName: "English",
    icon: "english",
    color: "tan",
    excerpt: "Themes of ambition, guilt, and fate. Analysis of Lady Macbeth's character arc and the symbolism of blood…",
    timeAgo: "4 days ago",
  },
];

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function seedDeadlines(): Deadline[] {
  return [
    {
      id: "u1",
      title: "Lab Report: Enzyme Activity",
      subjectId: "bio201",
      subjectName: "Biology 201",
      weightPercent: 15,
      icon: "biology",
      color: "green",
      dueDate: isoDaysFromNow(0),
      completed: false,
    },
    {
      id: "u2",
      title: "Problem Set 7: Series",
      subjectId: "calc2",
      subjectName: "Calculus II",
      weightPercent: 10,
      icon: "calculus",
      color: "orange",
      dueDate: isoDaysFromNow(1),
      completed: false,
    },
    {
      id: "u3",
      title: "Research Paper Outline",
      subjectId: "hist305",
      subjectName: "World History",
      weightPercent: 20,
      icon: "history",
      color: "green",
      dueDate: isoDaysFromNow(4),
      completed: false,
    },
    {
      id: "u4",
      title: "Midterm Exam",
      subjectId: "phys101",
      subjectName: "Physics 101",
      weightPercent: 25,
      icon: "physics",
      color: "orange",
      dueDate: isoDaysFromNow(12),
      completed: false,
    },
    {
      id: "u5",
      title: "Essay: Macbeth Themes",
      subjectId: "eng210",
      subjectName: "English 210",
      weightPercent: 15,
      icon: "english",
      color: "tan",
      dueDate: isoDaysFromNow(17),
      completed: false,
    },
  ];
}

export const activeSubjects: Subject[] = subjects.filter((s) => s.id !== "eng210");
