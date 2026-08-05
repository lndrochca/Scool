import { useRef, useState, type ReactElement } from "react";
import { useAppData } from "../../context/AppDataContext";
import { generateNotes } from "../../data/noteGenerator";
import { generateFlashcardsFromSections } from "../../data/flashcardGenerator";
import { NoteEditor } from "../../components/notes/NoteEditor";
import { SparkleIcon, TextPasteIcon, TypeIcon, UploadQuickIcon } from "../../components/ui/icons";
import type { AccentColor, IconName, NoteSection, NoteSourceType } from "../../types";
import "./Notes.css";

type Mode = "subject" | "paste" | "explain" | "upload";

const MODE_TO_SOURCE: Record<Mode, NoteSourceType> = {
  subject: "subject",
  paste: "paste",
  explain: "explain",
  upload: "upload",
};

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

interface Props {
  /** Pre-selects a subject, e.g. when generating from inside a specific notebook. */
  initialSubjectId?: string;
  onSaved?: (noteId: string, subjectId: string | undefined) => void;
  onOpenFlashcards?: (setId: string) => void;
}

export function GeneratorPanel({ initialSubjectId, onSaved, onOpenFlashcards }: Props) {
  const { subjects, addNote, addFlashcardSet } = useAppData();
  const [mode, setMode] = useState<Mode>("subject");
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId ?? "");
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

  const buildNotePayload = () => {
    if (!result) return null;
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    return {
      subject,
      payload: {
        title: result.title,
        subjectId: subject?.id,
        subjectCode: subject?.code ?? "General",
        subjectName: subject?.name ?? result.subjectName,
        icon: result.icon,
        color: result.color,
        excerpt: result.sections.find((s) => s.kind === "overview")?.bullets[0] ?? result.sections[0]?.bullets[0] ?? "",
        sections: result.sections,
        sourceType: MODE_TO_SOURCE[mode],
      },
    };
  };

  const handleSave = () => {
    const built = buildNotePayload();
    if (!built) return;
    const noteId = addNote(built.payload);
    setResult(null);
    setInput("");
    setFileName(null);
    onSaved?.(noteId, built.subject?.id);
  };

  const handleTurnIntoFlashcards = () => {
    const built = buildNotePayload();
    if (!built || !result) return;
    const cards = generateFlashcardsFromSections(result.sections);
    if (cards.length === 0) return;

    // Save the note itself too, so it's still there to review in the notebook later.
    addNote(built.payload);
    const setId = addFlashcardSet({
      title: `${result.title} — Flashcards`,
      subjectId: built.subject?.id,
      subjectName: built.subject?.name ?? result.subjectName,
      icon: result.icon,
      color: result.color,
      cards,
    });

    setResult(null);
    setInput("");
    setFileName(null);
    onOpenFlashcards?.(setId);
  };

  return (
    <div>
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

          <div className="notes-flashcard-cta">
            <button className="btn-ghost notes-flashcard-btn" onClick={handleTurnIntoFlashcards}>
              <SparkleIcon /> Turn this topic into a Flashcard Quiz
            </button>
            <p className="notes-flashcard-hint">
              Generates review flashcards straight from these notes and saves them to {subjects.find((s) => s.id === selectedSubjectId)?.name ?? result.subjectName} in your Library.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
