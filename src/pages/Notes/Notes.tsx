import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { GeneratorPanel } from "./GeneratorPanel";
import { NotebookGrid } from "./NotebookGrid";
import { NotebookView } from "./NotebookView";
import { BookmarkIcon, ClockIcon, SearchIcon, SubjectIcon } from "../../components/icons";
import { formatTimeAgo } from "../../utils/time";
import "../shared/page.css";
import "../../components/RecentNotes.css";
import "./Notes.css";

type View = { kind: "grid" } | { kind: "notebook"; subjectId: string | null; scrollTo?: string };

interface Props {
  onOpenFlashcards?: (setId: string) => void;
  /** Set when arriving from a Quick Action so the generator opens immediately. */
  autoOpenComposer?: boolean;
  onAutoOpenConsumed?: () => void;
  /** Set when arriving from a Dashboard "Recent Notes" click, to jump straight into that note. */
  initialNoteId?: string | null;
  onInitialNoteConsumed?: () => void;
}

export function Notes({
  onOpenFlashcards,
  autoOpenComposer,
  onAutoOpenConsumed,
  initialNoteId,
  onInitialNoteConsumed,
}: Props) {
  const { subjects, notes, recentlyViewedNoteIds } = useAppData();
  const [view, setView] = useState<View>({ kind: "grid" });
  const [query, setQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    if (autoOpenComposer) {
      setComposerOpen(true);
      onAutoOpenConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenComposer]);

  useEffect(() => {
    if (!initialNoteId) return;
    const note = notes.find((n) => n.id === initialNoteId);
    if (note) setView({ kind: "notebook", subjectId: note.subjectId ?? null, scrollTo: note.id });
    onInitialNoteConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNoteId]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return notes.filter((n) => {
      if (n.title.toLowerCase().includes(q)) return true;
      if (n.subjectName.toLowerCase().includes(q)) return true;
      return n.sections.some((s) => s.bullets.some((b) => b.toLowerCase().includes(q)));
    });
  }, [notes, query]);

  const recentlyViewed = useMemo(
    () => recentlyViewedNoteIds.map((id) => notes.find((n) => n.id === id)).filter((n): n is NonNullable<typeof n> => Boolean(n)),
    [recentlyViewedNoteIds, notes]
  );

  const bookmarked = useMemo(() => notes.filter((n) => n.bookmarked), [notes]);

  const openNotebookFor = (note: { subjectId?: string; id: string }) => {
    setView({ kind: "notebook", subjectId: note.subjectId ?? null, scrollTo: note.id });
  };

  if (view.kind === "notebook") {
    const subject = view.subjectId ? subjects.find((s) => s.id === view.subjectId) ?? null : null;
    const notebookNotes = notes.filter((n) => (view.subjectId ? n.subjectId === view.subjectId : !n.subjectId));
    return (
      <section className="page">
        <div className="eyebrow">Notes Workspace</div>
        <NotebookView
          subject={subject}
          notes={notebookNotes}
          onBack={() => setView({ kind: "grid" })}
          scrollToNoteId={view.scrollTo ?? null}
          onOpenFlashcards={onOpenFlashcards}
        />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="eyebrow">Notes Workspace</div>
      <h1 className="page-title">Your notebooks</h1>
      <p className="page-sub">Every subject has its own notebook, organized automatically from your generated notes.</p>

      <div className="notebook-toolbar">
        <div className="notebook-search notebook-search--wide">
          <SearchIcon />
          <input
            placeholder="Search all your notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn-solid" onClick={() => setComposerOpen((v) => !v)}>
          {composerOpen ? "Close" : "+ Generate Notes"}
        </button>
      </div>

      {composerOpen && (
        <GeneratorPanel
          onSaved={(_id, subjectId) => { setComposerOpen(false); setView({ kind: "notebook", subjectId: subjectId ?? null }); }}
          onOpenFlashcards={onOpenFlashcards}
        />
      )}

      {query.trim() ? (
        <div className="card notes-recent">
          <div className="panel-head">
            <h3>Results for "{query}"</h3>
          </div>
          <ul className="note-list">
            {searchResults.map((n) => (
              <li className="note-row" key={n.id} onClick={() => openNotebookFor(n)} style={{ cursor: "pointer" }}>
                <span className={`note-icon note-icon--${n.color}`}>
                  <SubjectIcon name={n.icon} />
                </span>
                <div className="note-body">
                  <div className="note-title-row">
                    <span className="note-title">{n.title}</span>
                    <span className="chip">{n.subjectCode}</span>
                  </div>
                  <p className="note-excerpt">{n.excerpt}</p>
                  <div className="note-meta">{n.subjectName} · {formatTimeAgo(n.updatedAt)}</div>
                </div>
              </li>
            ))}
            {searchResults.length === 0 && <li className="notes-empty">No notes match "{query}".</li>}
          </ul>
        </div>
      ) : (
        <>
          {(recentlyViewed.length > 0 || bookmarked.length > 0) && (
            <div className="notebook-shortcuts">
              {recentlyViewed.length > 0 && (
                <div className="card notebook-shortcut-panel">
                  <div className="panel-head" style={{ padding: "14px 16px 6px 16px" }}>
                    <h3><ClockIcon className="notebook-shortcut-icon" /> Recently Viewed</h3>
                  </div>
                  <ul className="notebook-shortcut-list">
                    {recentlyViewed.slice(0, 5).map((n) => (
                      <li key={n.id} onClick={() => openNotebookFor(n)}>
                        <span className="note-title">{n.title}</span>
                        <span className="note-meta">{n.subjectName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {bookmarked.length > 0 && (
                <div className="card notebook-shortcut-panel">
                  <div className="panel-head" style={{ padding: "14px 16px 6px 16px" }}>
                    <h3><BookmarkIcon className="notebook-shortcut-icon" filled /> Bookmarked</h3>
                  </div>
                  <ul className="notebook-shortcut-list">
                    {bookmarked.slice(0, 5).map((n) => (
                      <li key={n.id} onClick={() => openNotebookFor(n)}>
                        <span className="note-title">{n.title}</span>
                        <span className="note-meta">{n.subjectName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <NotebookGrid
            subjects={subjects}
            notes={notes}
            onOpen={(subjectId) => setView({ kind: "notebook", subjectId })}
            onStartGenerating={() => setComposerOpen(true)}
          />
        </>
      )}
    </section>
  );
}
