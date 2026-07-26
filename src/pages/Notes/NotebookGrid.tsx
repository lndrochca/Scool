import type { Note, Subject } from "../../types";
import { NotebookIcon, SubjectIcon } from "../../components/icons";
import { EmptyState } from "../../components/EmptyState";
import "./Notes.css";

interface Props {
  subjects: Subject[];
  notes: Note[];
  onOpen: (subjectId: string | null) => void;
  onStartGenerating: () => void;
}

export function NotebookGrid({ subjects, notes, onOpen, onStartGenerating }: Props) {
  const generalCount = notes.filter((n) => !n.subjectId).length;

  if (subjects.length === 0 && generalCount === 0) {
    return (
      <EmptyState
        icon={<NotebookIcon />}
        title="Your notebook is empty"
        message="Start building your study notebook with AI-generated notes. Upload a PDF, paste text, or just type a subject name to get started."
        action={{ label: "Generate your first note", onClick: onStartGenerating }}
      />
    );
  }

  return (
    <div className="notebook-grid">
      {subjects.map((s) => (
        <button key={s.id} className="notebook-card" onClick={() => onOpen(s.id)}>
          <span className={`notebook-card-icon notebook-card-icon--${s.color}`}>
            <SubjectIcon name={s.icon} />
          </span>
          <div className="notebook-card-text">
            <span className="notebook-card-title">{s.name}</span>
            <span className="notebook-card-meta">{s.notesCount} {s.notesCount === 1 ? "note" : "notes"}</span>
          </div>
        </button>
      ))}
      {generalCount > 0 && (
        <button className="notebook-card" onClick={() => onOpen(null)}>
          <span className="notebook-card-icon">
            <NotebookIcon />
          </span>
          <div className="notebook-card-text">
            <span className="notebook-card-title">General</span>
            <span className="notebook-card-meta">{generalCount} {generalCount === 1 ? "note" : "notes"}</span>
          </div>
        </button>
      )}
    </div>
  );
}
