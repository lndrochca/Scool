import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { SubjectIcon } from "../../components/icons";
import { PinIcon, FolderMoveIcon } from "../../components/icons";
import { SEMESTER_OPTIONS } from "../../types";
import "../shared/page.css";
import "./Bookshelf.css";

type GroupBy = "none" | "semester" | "category";

/** Fixed display order for known semester/category labels; anything else falls back to alphabetical, with "Unassigned" always last. */
const KNOWN_ORDER = [...SEMESTER_OPTIONS];

function sortGroupLabels(labels: string[]): string[] {
  return [...labels].sort((a, b) => {
    if (a === "Unassigned" || a === "Uncategorized") return 1;
    if (b === "Unassigned" || b === "Uncategorized") return -1;
    const ai = KNOWN_ORDER.indexOf(a as (typeof KNOWN_ORDER)[number]);
    const bi = KNOWN_ORDER.indexOf(b as (typeof KNOWN_ORDER)[number]);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function Bookshelf({ onOpenSubject }: { onOpenSubject: (id: string) => void }) {
  const { subjects, togglePin, updateSubject } = useAppData();
  const [groupBy, setGroupBy] = useState<GroupBy>("semester");
  const [order, setOrder] = useState<string[]>(subjects.map((s) => s.id));
  const [moveMenuId, setMoveMenuId] = useState<string | null>(null);

  const orderedIds = useMemo(() => {
    const existing = new Set(subjects.map((s) => s.id));
    const kept = order.filter((id) => existing.has(id));
    const missing = subjects.map((s) => s.id).filter((id) => !kept.includes(id));
    return [...kept, ...missing];
  }, [subjects, order]);

  const ordered = orderedIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter((s): s is (typeof subjects)[number] => Boolean(s));

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ label: "All Subjects", items: ordered }];
    const map = new Map<string, typeof ordered>();
    for (const s of ordered) {
      const key = groupBy === "semester" ? s.semester ?? "Unassigned" : s.category ?? "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    const labels = sortGroupLabels(Array.from(map.keys()));
    return labels.map((label) => ({ label, items: map.get(label)! }));
  }, [ordered, groupBy]);

  const move = (id: string, dir: -1 | 1) => {
    setOrder((prev) => {
      const list = [...(prev.length ? prev : subjects.map((s) => s.id))];
      const idx = list.indexOf(id);
      const swapWith = idx + dir;
      if (idx < 0 || swapWith < 0 || swapWith >= list.length) return list;
      [list[idx], list[swapWith]] = [list[swapWith], list[idx]];
      return list;
    });
  };

  const assignSemester = (id: string, semester: string) => {
    updateSubject(id, { semester: semester || undefined });
    setMoveMenuId(null);
  };

  return (
    <section className="page">
      <div className="eyebrow">Bookshelf</div>
      <h1 className="page-title">My bookshelf</h1>
      <p className="page-sub">Your subjects, beautifully organized.</p>

      <div className="shelf-toolbar">
        <span className="shelf-toolbar-label">Organize:</span>
        {(["semester", "category", "none"] as GroupBy[]).map((g) => (
          <button
            key={g}
            className={`shelf-toggle ${groupBy === g ? "is-active" : ""}`}
            onClick={() => setGroupBy(g)}
          >
            {g === "none" ? "All" : g === "semester" ? "By Semester" : "By Category"}
          </button>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          Your library is empty. Create your first subject to get started.
        </div>
      )}

      {groups.map((group) => (
        <div className="shelf-group" key={group.label}>
          <div className="shelf-group-head">
            <h3 className="shelf-group-title">{group.label}</h3>
            <span className="shelf-group-count">{group.items.length} {group.items.length === 1 ? "subject" : "subjects"}</span>
          </div>
          <div className="shelf">
            <div className="shelf-row">
              {group.items.map((s, i) => (
                <div className="book-wrap" key={s.id}>
                  <button
                    className={`book book--${s.color}`}
                    onClick={() => onOpenSubject(s.id)}
                    title={s.name}
                  >
                    <span className="book-favorite" onClick={(e) => { e.stopPropagation(); togglePin(s.id); }}>
                      <PinIcon filled={s.pinned} />
                    </span>
                    <span className="book-icon"><SubjectIcon name={s.icon} /></span>
                    <span className="book-title">{s.name}</span>
                    <span className="book-code">{s.code}</span>
                    <div className="book-foot">
                      <span>{s.notesCount} notes</span>
                      <span>{s.gradePercent > 0 ? `${s.gradePercent}%` : "—"}</span>
                    </div>
                  </button>
                  <div className="book-controls">
                    <div className="book-move-wrap">
                      <button
                        className="book-move-btn"
                        onClick={(e) => { e.stopPropagation(); setMoveMenuId(moveMenuId === s.id ? null : s.id); }}
                        aria-label="Move to section"
                        title="Move to section"
                      >
                        <FolderMoveIcon />
                      </button>
                      {moveMenuId === s.id && (
                        <div className="book-move-menu card">
                          <div className="book-move-menu-label">Move to…</div>
                          <button onClick={() => assignSemester(s.id, "")}>Unassigned</button>
                          {SEMESTER_OPTIONS.map((opt) => (
                            <button key={opt} onClick={() => assignSemester(s.id, opt)} className={s.semester === opt ? "is-current" : ""}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="book-reorder">
                      <button disabled={i === 0} onClick={() => move(s.id, -1)}>‹</button>
                      <button disabled={i === group.items.length - 1} onClick={() => move(s.id, 1)}>›</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="shelf-plank" />
          </div>
        </div>
      ))}
    </section>
  );
}
