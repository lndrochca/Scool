import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { NoteDetail } from "../../components/NoteDetail";
import { EmptyState } from "../../components/EmptyState";
import { GeneratorPanel } from "./GeneratorPanel";
import { BackIcon, NotebookIcon, PlusIcon, SearchIcon, SubjectIcon } from "../../components/icons";
import type { Note, Subject } from "../../types";
import "../shared/page.css";
import "./Notes.css";

interface Props {
  subject: Subject | null;
  notes: Note[];
  onBack: () => void;
  scrollToNoteId?: string | null;
  onOpenFlashcards?: (setId: string) => void;
}

export function NotebookView({ subject, notes, onBack, scrollToNoteId, onOpenFlashcards }: Props) {
  const { toggleNoteBookmark, updatePersonalNotes, deleteNote, touchNoteViewed } = useAppData();
  const [query, setQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  const sorted = useMemo(() => [...notes].sort((a, b) => b.createdAt - a.createdAt), [notes]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.toLowerCase();
    return sorted.filter((n) => {
      if (n.title.toLowerCase().includes(q)) return true;
      return n.sections.some(
        (s) => s.heading.toLowerCase().includes(q) || s.bullets.some((b) => b.toLowerCase().includes(q))
      );
    });
  }, [sorted, query]);

  useEffect(() => {
    if (!scrollToNoteId) return;
    const el = document.getElementById(`note-${scrollToNoteId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollToNoteId, filtered.length]);

  const title = subject ? subject.name : "General";

  return (
    <div className="notebook-view">
      <button className="workspace-back" onClick={onBack}>
        <BackIcon /> All Notebooks
      </button>

      <div className="notebook-view-head">
        <span className={`notebook-card-icon ${subject ? `notebook-card-icon--${subject.color}` : ""}`}>
          {subject ? <SubjectIcon name={subject.icon} /> : <NotebookIcon />}
        </span>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{title}</h1>
          <p className="page-sub" style={{ margin: 0 }}>
            {notes.length} {notes.length === 1 ? "note" : "notes"} in this notebook
          </p>
        </div>
        <button className="btn-solid notebook-add-btn" onClick={() => setComposerOpen((v) => !v)}>
          <PlusIcon /> {composerOpen ? "Close" : "Add Note"}
        </button>
      </div>

      {composerOpen && (
        <GeneratorPanel
          initialSubjectId={subject?.id}
          onSaved={() => setComposerOpen(false)}
          onOpenFlashcards={onOpenFlashcards}
        />
      )}

      {notes.length === 0 ? (
        <EmptyState
          icon={<NotebookIcon />}
          title="No notes yet"
          message={`Generate your first AI note for ${title} by uploading a PDF, image, or entering a topic.`}
          action={{ label: "Generate a note", onClick: () => setComposerOpen(true) }}
        />
      ) : (
        <div className="notebook-layout">
          <aside className="notebook-outline">
            <div className="notebook-search">
              <SearchIcon />
              <input
                placeholder="Search this notebook…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="notebook-outline-label">On this page</div>
            <ul className="notebook-outline-list">
              {filtered.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#note-${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`note-${n.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {n.title}
                  </a>
                </li>
              ))}
              {filtered.length === 0 && <li className="notebook-outline-empty">No matches</li>}
            </ul>
          </aside>

          <div className="notebook-entries">
            {filtered.map((n, i) => (
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
            {filtered.length === 0 && (
              <p className="note-meta" style={{ padding: "12px 4px" }}>No notes match "{query}".</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
