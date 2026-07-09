import type { Note } from "../../types";
import { SubjectIcon } from "../icons";
import "./RecentNotes.css";

export function RecentNotes({ notes }: { notes: Note[] }) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h3>Recent Notes</h3>
        <a className="view-all" href="#">
          View all →
        </a>
      </div>
      <ul className="note-list">
        {notes.map((note) => (
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
              <div className="note-meta">
                {note.subjectName} · {note.timeAgo}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
