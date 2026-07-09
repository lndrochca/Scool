import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { GradeCalculator } from "../../components/GradeCalculator/GradeCalculator";
import { computeGrade } from "../../data/gradeParser";
import {
  SubjectIcon,
  BackIcon,
  PdfFileIcon,
  ImageFileIcon,
  GenericFileIcon,
  CheckIcon,
  SparkleIcon,
} from "../../components/icons";
import "../../components/NoteEditor/NoteEditor.css";
import "./SubjectWorkspace.css";

type Tab = "overview" | "notes" | "files" | "assignments" | "grades" | "assistant" | "resources";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "notes", label: "Notes" },
  { key: "files", label: "Files" },
  { key: "assignments", label: "Assignments" },
  { key: "grades", label: "Grade Calculator" },
  { key: "assistant", label: "AI Study Assistant" },
  { key: "resources", label: "Resources" },
];

const FILE_ICONS = { pdf: PdfFileIcon, image: ImageFileIcon, file: GenericFileIcon };

export function SubjectWorkspace({ subjectId, onBack }: { subjectId: string; onBack: () => void }) {
  const { subjects, notes, gradesBySubject, filesBySubject, assignmentsBySubject, setGradeCategories } = useAppData();
  const [tab, setTab] = useState<Tab>("overview");
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [assignmentsState, setAssignmentsState] = useState(assignmentsBySubject[subjectId] ?? []);

  const subject = subjects.find((s) => s.id === subjectId);
  const subjectNotes = notes.filter((n) => n.subjectId === subjectId);
  const categories = gradesBySubject[subjectId] ?? [];
  const files = filesBySubject[subjectId] ?? [];
  const summary = categories.length > 0 ? computeGrade(categories) : null;
  const openNote = subjectNotes.find((n) => n.id === openNoteId);

  if (!subject) {
    return (
      <section className="page">
        <button className="workspace-back" onClick={onBack}><BackIcon /> Back to Library</button>
        <p className="page-sub">This subject no longer exists.</p>
      </section>
    );
  }

  const toggleAssignment = (id: string) => {
    setAssignmentsState((prev) => prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));
  };

  const askAssistant = () => {
    if (!question.trim()) return;
    const q = question.toLowerCase();
    const hit = subjectNotes
      .flatMap((n) => n.sections ?? [])
      .flatMap((s) => s.bullets.map((b) => ({ heading: s.heading, bullet: b })))
      .find((entry) => entry.bullet.toLowerCase().includes(q.split(" ")[0] ?? ""));

    if (hit) {
      setAnswer(`From your "${hit.heading}" notes: ${hit.bullet}`);
    } else {
      setAnswer(
        `Based on ${subject.name}, here's a starting point: review your "${subjectNotes[0]?.title ?? "saved notes"}" for related concepts, and consider generating a fresh note on this exact question from the Notes page.`
      );
    }
    setQuestion("");
  };

  return (
    <section className="page">
      <button className="workspace-back" onClick={onBack}><BackIcon /> Back to Library</button>

      <div className="workspace-head">
        <span className={`lib-icon lib-icon--${subject.color}`}>
          <SubjectIcon name={subject.icon} />
        </span>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{subject.name}</h1>
          <p className="page-sub" style={{ margin: 0 }}>{subject.code} · {subject.semester ?? "This semester"}</p>
        </div>
      </div>

      <div className="workspace-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`workspace-tab ${tab === t.key ? "is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="workspace-overview-grid">
          <div className="card workspace-stat">
            <span className="workspace-stat-label">Notes</span>
            <span className="workspace-stat-value">{subjectNotes.length}</span>
          </div>
          <div className="card workspace-stat">
            <span className="workspace-stat-label">Current Grade</span>
            <span className="workspace-stat-value">{summary ? `${summary.current}%` : "—"}</span>
          </div>
          <div className="card workspace-stat">
            <span className="workspace-stat-label">Letter</span>
            <span className="workspace-stat-value">{summary ? summary.letter : subject.letterGrade}</span>
          </div>
          <div className="card workspace-stat">
            <span className="workspace-stat-label">Open Tasks</span>
            <span className="workspace-stat-value">{assignmentsState.filter((a) => !a.done).length}</span>
          </div>
          <div className="card workspace-overview-note">
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Recent Notes</h3>
            {subjectNotes.slice(0, 3).map((n) => (
              <div key={n.id} className="workspace-overview-note-row" onClick={() => { setTab("notes"); setOpenNoteId(n.id); }}>
                <span className="note-title">{n.title}</span>
                <span className="note-meta">{n.timeAgo}</span>
              </div>
            ))}
            {subjectNotes.length === 0 && <p className="note-meta">No notes saved for this subject yet.</p>}
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div>
          {openNote ? (
            <div>
              <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={() => setOpenNoteId(null)}>
                <BackIcon /> All Notes
              </button>
              <h2 style={{ marginBottom: 14 }}>{openNote.title}</h2>
              <div className="note-editor">
                {(openNote.sections ?? []).map((s) => (
                  <div className="card note-editor-section" key={s.id}>
                    <h4 style={{ fontSize: 16, margin: "0 0 10px" }}>{s.heading}</h4>
                    <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {s.bullets.map((b, i) => (
                        <li key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: "var(--text)" }}>
                          <span className="note-editor-dot" style={{ marginTop: 8 }} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ul className="note-list card">
              {subjectNotes.map((n) => (
                <li className="note-row" key={n.id} onClick={() => setOpenNoteId(n.id)} style={{ cursor: "pointer" }}>
                  <span className={`note-icon note-icon--${n.color}`}><SubjectIcon name={n.icon} /></span>
                  <div className="note-body">
                    <div className="note-title-row">
                      <span className="note-title">{n.title}</span>
                    </div>
                    <p className="note-excerpt">{n.excerpt}</p>
                    <div className="note-meta">{n.timeAgo}</div>
                  </div>
                </li>
              ))}
              {subjectNotes.length === 0 && <li className="notes-empty">No notes yet. Generate one from the Notes page and save it to {subject.name}.</li>}
            </ul>
          )}
        </div>
      )}

      {tab === "files" && (
        <ul className="workspace-file-list card">
          {files.map((f) => {
            const Icon = FILE_ICONS[f.kind];
            return (
              <li key={f.id} className="workspace-file-row">
                <Icon className="workspace-file-icon" />
                <div className="workspace-file-info">
                  <span className="note-title">{f.name}</span>
                  <span className="note-meta">Added {f.addedAt}</span>
                </div>
              </li>
            );
          })}
          {files.length === 0 && <li className="notes-empty">No files uploaded for this subject yet.</li>}
        </ul>
      )}

      {tab === "assignments" && (
        <ul className="workspace-assignment-list card">
          {assignmentsState.map((a) => (
            <li key={a.id} className="workspace-assignment-row">
              <button className={`workspace-check ${a.done ? "is-done" : ""}`} onClick={() => toggleAssignment(a.id)}>
                {a.done && <CheckIcon />}
              </button>
              <div className="workspace-assignment-info">
                <span className={`note-title ${a.done ? "workspace-strike" : ""}`}>{a.title}</span>
                <span className="note-meta">{a.due} · {a.weightPercent}% of grade</span>
              </div>
            </li>
          ))}
          {assignmentsState.length === 0 && <li className="notes-empty">Nothing due for this subject right now.</li>}
        </ul>
      )}

      {tab === "grades" && (
        <GradeCalculator
          categories={categories}
          onChange={(cats) => setGradeCategories(subjectId, cats)}
        />
      )}

      {tab === "assistant" && (
        <div className="card workspace-assistant">
          <div className="workspace-assistant-head">
            <SparkleIcon />
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Ask about {subject.name}</h3>
              <p className="note-meta" style={{ margin: "4px 0 0" }}>Answers pull from your saved notes for this subject.</p>
            </div>
          </div>
          <div className="workspace-assistant-input-row">
            <input
              placeholder="e.g. What's the formula for kinetic energy?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAssistant()}
            />
            <button className="btn-solid" onClick={askAssistant}>Ask</button>
          </div>
          {answer && <div className="workspace-assistant-answer">{answer}</div>}
        </div>
      )}

      {tab === "resources" && (
        <div className="card workspace-resources">
          <p className="note-meta" style={{ marginBottom: 10 }}>
            Curated study resources for {subject.name} will appear here as future AI features (flashcards, quizzes, and a study planner) become available.
          </p>
          <ul className="workspace-resource-list">
            <li>Generate flashcards from your saved notes (coming soon)</li>
            <li>Auto-build a practice quiz from key concepts (coming soon)</li>
            <li>Personalized study planner leading up to exams (coming soon)</li>
          </ul>
        </div>
      )}
    </section>
  );
}
