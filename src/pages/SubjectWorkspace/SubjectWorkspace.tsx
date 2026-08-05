import { useEffect, useRef, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { GradeExplorer } from "../../components/GradeExplorer";
import { computeNodeStats, createEmptyRoot, toLetter } from "../../data/gradeTree";
import { NoteDetail } from "../../components/NoteDetail";
import { formatTimeAgo, formatDue } from "../../utils/time";
import type { AssignmentPriority, LibraryFile, ResourceKind, WorkspaceTabTarget } from "../../types";
import {
  SubjectIcon,
  BackIcon,
  PdfFileIcon,
  ImageFileIcon,
  GenericFileIcon,
  CheckIcon,
  SparkleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UploadQuickIcon,
} from "../../components/icons";
import "../shared/page.css";
import "../../components/NoteEditor.css";
import "../../components/NoteDetail.css";
import "./SubjectWorkspace.css";

const TABS: { key: WorkspaceTabTarget; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "notes", label: "Notes" },
  { key: "files", label: "Files" },
  { key: "assignments", label: "Assignments" },
  { key: "grades", label: "Grade Calculator" },
  { key: "assistant", label: "Study Buddy" },
  { key: "resources", label: "Resources" },
];

const FILE_ICONS = { pdf: PdfFileIcon, image: ImageFileIcon, file: GenericFileIcon };

function inferFileKind(name: string): LibraryFile["kind"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  return "file";
}

const PRIORITIES: AssignmentPriority[] = ["low", "medium", "high"];
const RESOURCE_KINDS: ResourceKind[] = ["link", "document", "video"];

interface Props {
  subjectId: string;
  onBack: () => void;
  onOpenFlashcards?: (setId: string) => void;
  initialTab?: WorkspaceTabTarget;
  onInitialTabConsumed?: () => void;
}

export function SubjectWorkspace({ subjectId, onBack, onOpenFlashcards, initialTab, onInitialTabConsumed }: Props) {
  const {
    subjects,
    notes,
    gradesBySubject,
    filesBySubject,
    assignmentsBySubject,
    resourcesBySubject,
    setGradeTree,
    toggleNoteBookmark,
    updatePersonalNotes,
    deleteNote,
    touchNoteViewed,
    updateSubject,
    addFile,
    renameFile,
    deleteFile,
    addAssignment,
    updateAssignment,
    toggleAssignmentDone,
    deleteAssignment,
    addResource,
    deleteResource,
  } = useAppData();

  const [tab, setTab] = useState<WorkspaceTabTarget>(initialTab ?? "overview");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [aTitle, setATitle] = useState("");
  const [aDue, setADue] = useState("");
  const [aWeight, setAWeight] = useState("10");
  const [aPriority, setAPriority] = useState<AssignmentPriority>("medium");

  const [showResourceForm, setShowResourceForm] = useState(false);
  const [rTitle, setRTitle] = useState("");
  const [rUrl, setRUrl] = useState("");
  const [rKind, setRKind] = useState<ResourceKind>("link");
  const [rCategory, setRCategory] = useState("General");

  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
      onInitialTabConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab, subjectId]);

  const subject = subjects.find((s) => s.id === subjectId);

  useEffect(() => {
    setDescription(subject?.description ?? "");
  }, [subject?.description, subjectId]);

  const subjectNotes = notes.filter((n) => n.subjectId === subjectId);
  const gradeRoot = gradesBySubject[subjectId] ?? createEmptyRoot(subject?.name ?? "Grades");
  const gradeSummary = computeNodeStats(gradeRoot);
  const files = filesBySubject[subjectId] ?? [];
  const assignments = assignmentsBySubject[subjectId] ?? [];
  const resources = resourcesBySubject[subjectId] ?? [];

  if (!subject) {
    return (
      <section className="page">
        <button className="workspace-back" onClick={onBack}><BackIcon /> Back to Library</button>
        <p className="page-sub">This subject no longer exists.</p>
      </section>
    );
  }

  const handleFilesChosen = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => addFile(subjectId, { name: f.name, kind: inferFileKind(f.name) }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetAssignmentForm = () => {
    setATitle("");
    setADue("");
    setAWeight("10");
    setAPriority("medium");
    setEditingAssignmentId(null);
    setShowAssignmentForm(false);
  };

  const startEditAssignment = (id: string) => {
    const a = assignments.find((x) => x.id === id);
    if (!a) return;
    setEditingAssignmentId(id);
    setATitle(a.title);
    setADue(a.due);
    setAWeight(String(a.weightPercent));
    setAPriority(a.priority);
    setShowAssignmentForm(true);
  };

  const submitAssignment = () => {
    if (!aTitle.trim()) return;
    const weightPercent = Number(aWeight) || 0;
    if (editingAssignmentId) {
      updateAssignment(subjectId, editingAssignmentId, { title: aTitle.trim(), due: aDue, weightPercent, priority: aPriority });
    } else {
      addAssignment(subjectId, { title: aTitle.trim(), due: aDue, weightPercent, priority: aPriority });
    }
    resetAssignmentForm();
  };

  const submitResource = () => {
    if (!rTitle.trim() || !rUrl.trim()) return;
    addResource(subjectId, { title: rTitle.trim(), url: rUrl.trim(), kind: rKind, category: rCategory.trim() || "General" });
    setRTitle("");
    setRUrl("");
    setRKind("link");
    setRCategory("General");
    setShowResourceForm(false);
  };

  const resourcesByCategory = resources.reduce<Record<string, typeof resources>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const askAssistant = () => {
    if (!question.trim()) return;
    const q = question.toLowerCase();
    const hit = subjectNotes
      .flatMap((n) => n.sections)
      .flatMap((s) => s.bullets.map((b) => ({ heading: s.heading, bullet: b })))
      .find((entry) => entry.bullet.toLowerCase().includes(q.split(" ")[0] ?? ""));

    if (hit) {
      setAnswer(`From your "${hit.heading}" notes: ${hit.bullet}`);
    } else if (subjectNotes.length > 0) {
      setAnswer(
        `Based on ${subject.name}, here's a starting point: review your "${subjectNotes[0]?.title ?? "saved notes"}" for related concepts, and consider generating a fresh note on this exact question from the Notes page.`
      );
    } else {
      setAnswer(`You don't have any notes saved for ${subject.name} yet — generate some from the Notes page first, then ask again for answers grounded in them.`);
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
          <p className="page-sub" style={{ margin: 0 }}>{subject.code}{subject.semester ? ` · ${subject.semester}` : ""}</p>
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
            <span className="workspace-stat-value">{gradeSummary.percent !== null ? `${gradeSummary.percent}%` : "—"}</span>
          </div>
          <div className="card workspace-stat">
            <span className="workspace-stat-label">Letter</span>
            <span className="workspace-stat-value">{gradeSummary.percent !== null ? toLetter(gradeSummary.percent) : subject.letterGrade}</span>
          </div>
          <div className="card workspace-stat">
            <span className="workspace-stat-label">Open Tasks</span>
            <span className="workspace-stat-value">{assignments.filter((a) => !a.done).length}</span>
          </div>

          <div className="card workspace-overview-note" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Course description</h3>
            <textarea
              className="notes-textarea"
              rows={3}
              placeholder="Write a short description of this course — topics covered, instructor, goals…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => updateSubject(subjectId, { description })}
            />
          </div>

          <div className="card workspace-overview-note">
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Recent Notes</h3>
            {subjectNotes.slice(0, 3).map((n) => (
              <div key={n.id} className="workspace-overview-note-row" onClick={() => setTab("notes")}>
                <span className="note-title">{n.title}</span>
                <span className="note-meta">{formatTimeAgo(n.updatedAt)}</span>
              </div>
            ))}
            {subjectNotes.length === 0 && <p className="note-meta">No notes saved for this subject yet.</p>}
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="notebook-entries">
          {subjectNotes.map((n, i) => (
            <NoteDetail
              key={n.id}
              note={n}
              defaultOpen={i === 0}
              onToggleBookmark={toggleNoteBookmark}
              onPersonalNotesChange={updatePersonalNotes}
              onDelete={deleteNote}
              onOpen={touchNoteViewed}
              onFlashcardsCreated={onOpenFlashcards}
            />
          ))}
          {subjectNotes.length === 0 && (
            <p className="notes-empty">No notes yet. Generate one from the Notes page and save it to {subject.name}.</p>
          )}
        </div>
      )}

      {tab === "files" && (
        <>
          <div className="workspace-section-toolbar">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFilesChosen(e.target.files)}
            />
            <button className="btn-solid" onClick={() => fileInputRef.current?.click()}>
              <UploadQuickIcon /> Upload File
            </button>
          </div>
          <ul className="workspace-file-list card">
            {files.map((f) => {
              const Icon = FILE_ICONS[f.kind];
              return (
                <li key={f.id} className="workspace-file-row">
                  <Icon className="workspace-file-icon" />
                  <div className="workspace-file-info">
                    {renamingFileId === f.id ? (
                      <input
                        className="notes-text-input"
                        value={renameValue}
                        autoFocus
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && renameValue.trim()) {
                            renameFile(subjectId, f.id, renameValue.trim());
                            setRenamingFileId(null);
                          }
                          if (e.key === "Escape") setRenamingFileId(null);
                        }}
                        onBlur={() => setRenamingFileId(null)}
                      />
                    ) : (
                      <span className="note-title">{f.name}</span>
                    )}
                    <span className="note-meta">Added {formatTimeAgo(f.addedAt)}</span>
                  </div>
                  <div className="workspace-row-actions">
                    <button
                      className="icon-btn"
                      aria-label="Rename file"
                      onClick={() => { setRenamingFileId(f.id); setRenameValue(f.name); }}
                    >
                      <PencilIcon />
                    </button>
                    <button className="icon-btn" aria-label="Delete file" onClick={() => deleteFile(subjectId, f.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              );
            })}
            {files.length === 0 && <li className="notes-empty">No files uploaded. Upload a PDF, image, or document to get started.</li>}
          </ul>
        </>
      )}

      {tab === "assignments" && (
        <>
          <div className="workspace-section-toolbar">
            <button className="btn-solid" onClick={() => { resetAssignmentForm(); setShowAssignmentForm(true); }}>
              <PlusIcon /> Add Assignment
            </button>
          </div>

          {showAssignmentForm && (
            <div className="card workspace-form">
              <div className="workspace-form-row">
                <input
                  className="notes-text-input"
                  placeholder="Assignment title"
                  value={aTitle}
                  onChange={(e) => setATitle(e.target.value)}
                  autoFocus
                />
                <input
                  className="notes-text-input"
                  type="date"
                  value={aDue}
                  onChange={(e) => setADue(e.target.value)}
                />
              </div>
              <div className="workspace-form-row">
                <select className="notes-subject-select" value={aPriority} onChange={(e) => setAPriority(e.target.value as AssignmentPriority)}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)} priority</option>
                  ))}
                </select>
                <input
                  className="notes-text-input"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Weight %"
                  value={aWeight}
                  onChange={(e) => setAWeight(e.target.value)}
                />
                <button className="btn-ghost" onClick={resetAssignmentForm}>Cancel</button>
                <button className="btn-solid" onClick={submitAssignment}>
                  {editingAssignmentId ? "Save Changes" : "Add Assignment"}
                </button>
              </div>
            </div>
          )}

          <ul className="workspace-assignment-list card">
            {assignments.map((a) => {
              const due = formatDue(a.due);
              return (
                <li key={a.id} className="workspace-assignment-row">
                  <button className={`workspace-check ${a.done ? "is-done" : ""}`} onClick={() => toggleAssignmentDone(subjectId, a.id)}>
                    {a.done && <CheckIcon />}
                  </button>
                  <div className="workspace-assignment-info">
                    <span className={`note-title ${a.done ? "workspace-strike" : ""}`}>{a.title}</span>
                    <span className="note-meta">
                      {due.label} · {a.weightPercent}% of grade · {a.priority} priority
                    </span>
                  </div>
                  <div className="workspace-row-actions">
                    <button className="icon-btn" aria-label="Edit assignment" onClick={() => startEditAssignment(a.id)}>
                      <PencilIcon />
                    </button>
                    <button className="icon-btn" aria-label="Delete assignment" onClick={() => deleteAssignment(subjectId, a.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              );
            })}
            {assignments.length === 0 && <li className="notes-empty">No assignments added yet.</li>}
          </ul>
        </>
      )}

      {tab === "grades" && (
        <GradeExplorer
          root={gradeRoot}
          onChange={(next) => setGradeTree(subjectId, next)}
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
        <>
          <div className="workspace-section-toolbar">
            <button className="btn-solid" onClick={() => setShowResourceForm((v) => !v)}>
              <PlusIcon /> Add Resource
            </button>
          </div>

          {showResourceForm && (
            <div className="card workspace-form">
              <div className="workspace-form-row">
                <input
                  className="notes-text-input"
                  placeholder="Title"
                  value={rTitle}
                  onChange={(e) => setRTitle(e.target.value)}
                  autoFocus
                />
                <input
                  className="notes-text-input"
                  placeholder="URL or link"
                  value={rUrl}
                  onChange={(e) => setRUrl(e.target.value)}
                />
              </div>
              <div className="workspace-form-row">
                <select className="notes-subject-select" value={rKind} onChange={(e) => setRKind(e.target.value as ResourceKind)}>
                  {RESOURCE_KINDS.map((k) => (
                    <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>
                  ))}
                </select>
                <input
                  className="notes-text-input"
                  placeholder="Category (e.g. Readings)"
                  value={rCategory}
                  onChange={(e) => setRCategory(e.target.value)}
                />
                <button className="btn-ghost" onClick={() => setShowResourceForm(false)}>Cancel</button>
                <button className="btn-solid" onClick={submitResource}>Save Resource</button>
              </div>
            </div>
          )}

          {Object.keys(resourcesByCategory).length === 0 && (
            <div className="card workspace-resources">
              <p className="note-meta">No resources saved yet. Add links, documents, or videos to keep them organized by category.</p>
            </div>
          )}

          {Object.entries(resourcesByCategory).map(([category, items]) => (
            <div className="card workspace-resources" key={category} style={{ marginBottom: 14 }}>
              <h3 style={{ marginBottom: 8, fontSize: 15 }}>{category}</h3>
              <ul className="workspace-resource-list">
                {items.map((r) => (
                  <li key={r.id} className="workspace-resource-row">
                    <a href={r.url} target="_blank" rel="noreferrer" className="note-title">{r.title}</a>
                    <span className="chip">{r.kind}</span>
                    <button className="icon-btn" aria-label="Delete resource" onClick={() => deleteResource(subjectId, r.id)}>
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
