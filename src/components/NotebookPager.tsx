import { useEffect, useRef, useState } from "react";
import type { NoteSection } from "../types";
import "./NotebookPager.css";

interface Props {
  sections: NoteSection[];
  personalNotes: string;
  onPersonalNotesChange?: (value: string) => void;
}

type Page = { kind: "section"; section: NoteSection } | { kind: "personal" };

export function NotebookPager({ sections, personalNotes, onPersonalNotesChange }: Props) {
  const pages: Page[] = [...sections.map((section) => ({ kind: "section" as const, section })), { kind: "personal" as const }];
  const [index, setIndex] = useState(0);
  const [anim, setAnim] = useState<"" | "next" | "prev">("");
  const touchStartX = useRef<number | null>(null);
  const animTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (index > pages.length - 1) setIndex(pages.length - 1);
  }, [pages.length]);

  const go = (dir: "next" | "prev") => {
    const nextIndex = dir === "next" ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex > pages.length - 1) return;
    window.clearTimeout(animTimeout.current);
    setAnim(dir);
    setIndex(nextIndex);
    animTimeout.current = window.setTimeout(() => setAnim(""), 260);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go("next");
    if (e.key === "ArrowLeft") go("prev");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? "next" : "prev");
  };

  const page = pages[index];
  const atStart = index === 0;
  const atEnd = index === pages.length - 1;

  return (
    <div className="pager" tabIndex={0} onKeyDown={handleKeyDown}>
      <div
        className="pager-page-wrap"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="pager-edge pager-edge--left"
          aria-label="Previous page"
          onClick={() => go("prev")}
          disabled={atStart}
        />
        <div key={index} className={`pager-page ${anim ? `pager-page--${anim}` : ""}`}>
          {page.kind === "section" ? (
            <>
              <h4 className="pager-page-heading">{page.section.heading}</h4>
              <ul className="pager-bullets">
                {page.section.bullets.map((b, i) => (
                  <li key={i}>
                    <span className="note-editor-dot" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h4 className="pager-page-heading">Personal Notes</h4>
              <p className="pager-personal-hint">Your own notes, kept separate from the AI-generated content.</p>
              <textarea
                className="pager-personal-input"
                placeholder="Add your own thoughts, questions, or reminders here…"
                rows={6}
                value={personalNotes}
                onChange={(e) => onPersonalNotesChange?.(e.target.value)}
              />
            </>
          )}
        </div>
        <button
          className="pager-edge pager-edge--right"
          aria-label="Next page"
          onClick={() => go("next")}
          disabled={atEnd}
        />
      </div>

      <div className="pager-controls">
        <button className="btn-ghost pager-nav-btn" onClick={() => go("prev")} disabled={atStart}>
          ‹ Previous
        </button>
        <div className="pager-dots">
          {pages.map((_, i) => (
            <button
              key={i}
              className={`pager-dot ${i === index ? "is-active" : ""}`}
              aria-label={`Go to page ${i + 1}`}
              onClick={() => {
                setAnim(i > index ? "next" : "prev");
                setIndex(i);
                window.clearTimeout(animTimeout.current);
                animTimeout.current = window.setTimeout(() => setAnim(""), 260);
              }}
            />
          ))}
        </div>
        <button className="btn-ghost pager-nav-btn" onClick={() => go("next")} disabled={atEnd}>
          Next ›
        </button>
      </div>
      <div className="pager-page-count">Page {index + 1} of {pages.length}</div>
    </div>
  );
}
