import { useRef, useState, type ReactElement } from "react";
import { useAppData } from "../../context/AppDataContext";
import { generateNotes } from "../../data/noteGenerator";
import { NoteEditor } from "../../components/NoteEditor/NoteEditor";
import { SubjectIcon, SparkleIcon, TextPasteIcon, TypeIcon, UploadQuickIcon } from "../../components/icons";
import type { AccentColor, IconName, NoteSection } from "../../types";
import "../../components/RecentNotes/RecentNotes.css";
import "./Notes.css";

type Mode = "subject" | "paste" | "explain" | "upload";

interface GeneratedResult {
  title: string;
  sections: NoteSection[];
  icon: IconName;
  color: AccentColor;
  subjectName: string;
}

const MODES: { key: Mode; label: string; icon: ReactElement; placeholder: string }[] = [
  { key: "subject", label: "Subject Name", icon: <SparkleIcon />, placeholder: "e.g. Anatomy and Physiology" },
  { key: "paste", label: "Paste Text", icon: <TextPasteIcon />, placeholder: "Paste a passage, article, or lecture transcript…" },
  { key: "explain", label: "Type a Question", icon: <TypeIcon />, placeholder: "e.g. Explain Newton's Laws." },
  { key: "upload", label: "Upload File", icon: <UploadQuickIcon />, placeholder: "" },
];

export function Notes() {
  const { subjects, notes, addNote } = useAppData();
  const [mode, setMode] = useState<Mode>("subject");
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    const sourceText = mode === "paste" ? input : undefined;
    const promptInput = mode === "upload" ? fileName ?? "Uploaded material" : input;
    if (mode === "upload" && !fileName) return;
    if (mode !== "upload" && !input.trim()) return;

    setGenerating(true);
    setResult(null);
    window.setTimeout(() => {
      const generated = generateNotes(promptInput, sourceText);
      setResult(generated);
      setGenerating(false);
    }, 650);
  };

  const handleSave = () => {
    if (!result) return;
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    addNote({
      title: result.title,
      subjectId: subject?.id,
      subjectCode: subject?.code ?? "General",
      subjectName: subject?.name ?? result.subjectName,
      icon: result.icon,
      color: result.color,
      excerpt: result.sections[0]?.bullets[0] ?? "",
      sections: result.sections,
    });
    setResult(null);
    setInput("");
    setFileName(null);
  };

  return (
    <section className="page">
      <div className="eyebrow">AI Notes Generator</div>
      <h1 className="page-title">Turn material into study notes</h1>
      <p className="page-sub">Upload a file, paste text, or describe a topic — Scool organizes it into structured notes.</p>

      <div className="card notes-composer">
        <div className="notes-mode-tabs">
          {MODES.map((m) => (
            <button
              key={m.key}
              className={`notes-mode-tab ${mode === m.key ? "is-active" : ""}`}
              onClick={() => {
                setMode(m.key);
                setResult(null);
              }}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        <div className="notes-input-area">
          {mode === "upload" ? (
            <div className="notes-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: "none" }}
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
              <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
                <UploadQuickIcon /> Choose PDF, image, or screenshot
              </button>
              {fileName && <span className="notes-filename">{fileName}</span>}
            </div>
          ) : mode === "subject" ? (
            <input
              className="notes-text-input"
              placeholder={MODES.find((m) => m.key === mode)?.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          ) : (
            <textarea
              className="notes-textarea"
              rows={mode === "paste" ? 6 : 3}
              placeholder={MODES.find((m) => m.key === mode)?.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          )}
        </div>

        <button className="btn-solid notes-generate-btn" onClick={handleGenerate} disabled={generating}>
          <SparkleIcon /> {generating ? "Generating notes…" : "Generate Notes"}
        </button>
      </div>

      {result && (
        <div className="notes-result">
          <div className="notes-result-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Editable draft</div>
              <input
                className="notes-title-input"
                value={result.title}
                onChange={(e) => setResult({ ...result, title: e.target.value })}
              />
            </div>
            <div className="notes-save-row">
              <select
                className="notes-subject-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">Save without a subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button className="btn-solid" onClick={handleSave}>Save Note</button>
            </div>
          </div>
          <NoteEditor sections={result.sections} onChange={(sections) => setResult({ ...result, sections })} />
        </div>
      )}

      <div className="card notes-recent">
        <div className="panel-head">
          <h3>Saved Notes</h3>
        </div>
        <ul className="note-list">
          {notes.slice(0, 8).map((note) => (
            <li className="note-row" key={note.id}>
              <span className={`note-icon note-icon--${note.color}`}>
                <SubjectIcon name={note.icon} />
              </span>
              <div className="note-body">
                <div className="note-title-row">
                  <span className="note-title">{note.title}</span>
                  <span className="chip">{note.subjectCode}</span>
                </div>
                <p className="note-excerpt">{note.excerpt}</p>
                <div className="note-meta">{note.subjectName} · {note.timeAgo}</div>
              </div>
            </li>
          ))}
          {notes.length === 0 && <li className="notes-empty">No notes yet — generate your first one above.</li>}
        </ul>
      </div>
    </section>
  );
}
