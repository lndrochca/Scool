import { useEffect, useRef, useState } from "react";
import type { Note } from "../../types";
import { useAppData } from "../../context/AppDataContext";
import { generateFlashcardsFromSections } from "../../data/flashcardGenerator";
import { formatTimeAgo } from "../../utils/time";
import { BookmarkIcon, ChevronDownIcon, SparkleIcon, SubjectIcon, TrashIcon } from "../ui/icons";
import { NotebookPager } from "./NotebookPager";
import "./NoteDetail.css";

interface Props {
  note: Note;
  defaultOpen?: boolean;
  onToggleBookmark?: (id: string) => void;
  onPersonalNotesChange?: (id: string, value: string) => void;
  onDelete?: (id: string) => void;
  onOpen?: (id: string) => void;
  /** Called with the id of a newly created flashcard set, so the caller can navigate there. */
  onFlashcardsCreated?: (setId: string) => void;
}

export function NoteDetail({
  note,
  defaultOpen = true,
  onToggleBookmark,
  onPersonalNotesChange,
  onDelete,
  onOpen,
  onFlashcardsCreated,
}: Props) {
  const { addFlashcardSet } = useAppData();
  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState(note.personalNotes);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setDraft(note.personalNotes);
  }, [note.id, note.personalNotes]);

  useEffect(() => {
    if (defaultOpen) onOpen?.(note.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) onOpen?.(note.id);
      return next;
    });
  };

  const handlePersonalNotesInput = (value: string) => {
    setDraft(value);
    if (!onPersonalNotesChange) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => onPersonalNotesChange(note.id, value), 500);
  };

  const [flashcardGenerating, setFlashcardGenerating] = useState(false);

  const handleCreateFlashcards = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (flashcardGenerating) return;
    setFlashcardGenerating(true);
    try {
      const cards = await generateFlashcardsFromSections(note.sections, { noteTitle: note.title });
      if (cards.length === 0) return;
      const setId = addFlashcardSet({
        title: `${note.title} — Flashcards`,
        subjectId: note.subjectId,
        subjectName: note.subjectName,
        icon: note.icon,
        color: note.color,
        cards,
      });
      onFlashcardsCreated?.(setId);
    } catch (err) {
      console.error("Flashcard generation failed:", err);
    } finally {
      setFlashcardGenerating(false);
    }
  };

  return (
    <div className="card note-detail" id={`note-${note.id}`}>
      <button className="note-detail-head" onClick={handleToggle}>
        <span className={`note-icon note-icon--${note.color}`}>
          <SubjectIcon name={note.icon} />
        </span>
        <div className="note-detail-headtext">
          <div className="note-detail-title-row">
            <span className="note-title">{note.title}</span>
            <span className="chip">{note.subjectCode}</span>
          </div>
          <div className="note-meta">
            {note.subjectName} · {formatTimeAgo(note.updatedAt)}
          </div>
        </div>
        <div className="note-detail-actions">
          {onFlashcardsCreated && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Turn this note into a flashcard quiz"
              title={flashcardGenerating ? "Generating…" : "Turn into Flashcard Quiz"}
              className="icon-btn note-detail-flashcard-btn"
              onClick={handleCreateFlashcards}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCreateFlashcards(e as unknown as React.MouseEvent);
              }}
            >
              <SparkleIcon />
            </span>
          )}
          {onToggleBookmark && (
            <span
              role="button"
              tabIndex={0}
              aria-label={note.bookmarked ? "Remove bookmark" : "Bookmark note"}
              className={`icon-btn note-detail-bookmark ${note.bookmarked ? "is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(note.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onToggleBookmark(note.id);
                }
              }}
            >
              <BookmarkIcon filled={note.bookmarked} />
            </span>
          )}
          {onDelete && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Delete note"
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onDelete(note.id);
                }
              }}
            >
              <TrashIcon />
            </span>
          )}
          <ChevronDownIcon className={`note-detail-chevron ${open ? "is-open" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="note-detail-body">
          <NotebookPager
            sections={note.sections}
            personalNotes={draft}
            onPersonalNotesChange={handlePersonalNotesInput}
          />
        </div>
      )}
    </div>
  );
}
