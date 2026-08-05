import type { Note } from "../../types";
import { SubjectIcon } from "../ui/icons";
import { formatTimeAgo } from "../../utils/time";
import "./RecentNotes.css";

interface Props {
  notes: Note[];
  onSelect?: (note: Note) => void;
  onViewAll?: () => void;
}

export function RecentNotes({ notes, onSelect, onViewAll }: Props) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h3>Recent Notes</h3>
        <button type="button" className="view-all" onClick={onViewAll}>
          View all →
        </button>
      </div>
      <ul className="note-list">
        {notes.map((note) => (
          <li className="note-row" key={note.id}>
            <button className="note-row-btn" onClick={() => onSelect?.(note)}>
              <span className={`note-icon note-icon--${note.color}`}>
                <SubjectIcon name={note.icon} />
              </span>
              <div className="note-body">
                <div className="note-title-row">
                  <span className="note-title">{note.title}</span>
                  <span className="chip">{note.subjectCode}</span>
                </div>
                <p className="note-excerpt">{note.excerpt}</p>
                <div className="note-meta">
                  {note.subjectName} · {formatTimeAgo(note.createdAt)}
                </div>
              </div>
            </button>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="notes-empty">No notes yet. Upload a PDF, image, or enter a topic to generate AI notes.</li>
        )}
      </ul>
    </div>
  );
}
