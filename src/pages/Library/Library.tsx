import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { SubjectIcon } from "../../components/icons";
import { PinIcon, PlusIcon, SearchIcon, DotsIcon, PencilIcon, TrashIcon, CheckIcon, XIcon } from "../../components/icons";
import type { AccentColor, IconName } from "../../types";
import { SEMESTER_OPTIONS } from "../../types";
import "../shared/page.css";
import "./Library.css";

type SortKey = "name" | "grade" | "notes";

const ICON_OPTIONS: IconName[] = ["biology", "calculus", "history", "physics", "english"];
const COLOR_OPTIONS: AccentColor[] = ["green", "orange", "tan", "red", "amber"];

interface Props {
  onOpenSubject: (id: string) => void;
  autoOpenAdd?: boolean;
  onAutoOpenConsumed?: () => void;
}

export function Library({ onOpenSubject, autoOpenAdd, onAutoOpenConsumed }: Props) {
  const { subjects, addSubject, renameSubject, deleteSubject, togglePin } = useAppData();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newIcon, setNewIcon] = useState<IconName>("biology");
  const [newColor, setNewColor] = useState<AccentColor>("green");
  const [newSemester, setNewSemester] = useState<string>("");

  useEffect(() => {
    if (autoOpenAdd) {
      setShowAdd(true);
      onAutoOpenConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenAdd]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = subjects.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "grade") return b.gradePercent - a.gradePercent;
      return b.notesCount - a.notesCount;
    });
    const pinned = list.filter((s) => s.pinned);
    const rest = list.filter((s) => !s.pinned);
    return [...pinned, ...rest];
  }, [subjects, query, sort]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const code = newCode.trim() || newName.trim().slice(0, 3).toUpperCase() + " 101";
    addSubject({ name: newName.trim(), code, icon: newIcon, color: newColor, semester: newSemester || undefined });
    setNewName("");
    setNewCode("");
    setNewIcon("biology");
    setNewColor("green");
    setNewSemester("");
    setShowAdd(false);
  };

  const startRename = (id: string, current: string) => {
    setRenamingId(id);
    setRenameValue(current);
    setMenuOpenId(null);
  };

  const commitRename = (id: string) => {
    if (renameValue.trim()) renameSubject(id, renameValue.trim());
    setRenamingId(null);
  };

  return (
    <section className="page">
      <div className="eyebrow">Library</div>
      <h1 className="page-title">Your subjects</h1>
      <p className="page-sub">Every workspace holds its notes, files, and progress.</p>

      <div className="lib-toolbar">
        <div className="lib-search">
          <SearchIcon className="lib-search-icon" />
          <input
            placeholder="Search subjects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="lib-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="name">Sort: Name</option>
          <option value="grade">Sort: Grade</option>
          <option value="notes">Sort: Notes</option>
        </select>
        <button className="lib-add-btn" onClick={() => setShowAdd((v) => !v)}>
          <PlusIcon /> New Subject
        </button>
      </div>

      {showAdd && (
        <div className="card lib-add-card">
          <div className="lib-add-row">
            <input
              className="lib-add-input"
              placeholder="Subject name (e.g. Organic Chemistry)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <input
              className="lib-add-input lib-add-input--code"
              placeholder="Code (e.g. CHEM 220)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
          </div>
          <div className="lib-add-row lib-add-row--options">
            <div className="lib-swatches">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  className={`lib-swatch ${newIcon === icon ? "is-active" : ""}`}
                  onClick={() => setNewIcon(icon)}
                  aria-label={icon}
                >
                  <SubjectIcon name={icon} />
                </button>
              ))}
            </div>
            <div className="lib-colors">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  className={`lib-color-dot lib-color-dot--${color} ${newColor === color ? "is-active" : ""}`}
                  onClick={() => setNewColor(color)}
                  aria-label={color}
                />
              ))}
            </div>
            <select
              className="lib-semester-select"
              value={newSemester}
              onChange={(e) => setNewSemester(e.target.value)}
              aria-label="Assign to semester"
            >
              <option value="">Unassigned</option>
              {SEMESTER_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="lib-add-actions">
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-solid" onClick={handleAdd}>Create Subject</button>
            </div>
          </div>
        </div>
      )}

      <div className="lib-grid">
        {filtered.map((s) => (
          <div className="card lib-card" key={s.id}>
            <div className="lib-card-top">
              <span className={`lib-icon lib-icon--${s.color}`}>
                <SubjectIcon name={s.icon} />
              </span>
              <div className="lib-card-actions">
                <button
                  className={`icon-btn ${s.pinned ? "is-active" : ""}`}
                  onClick={() => togglePin(s.id)}
                  aria-label="Pin subject"
                >
                  <PinIcon filled={s.pinned} />
                </button>
                <div className="lib-menu-wrap">
                  <button
                    className="icon-btn"
                    onClick={() => setMenuOpenId(menuOpenId === s.id ? null : s.id)}
                    aria-label="More options"
                  >
                    <DotsIcon />
                  </button>
                  {menuOpenId === s.id && (
                    <div className="lib-menu card">
                      <button onClick={() => startRename(s.id, s.name)}>
                        <PencilIcon /> Rename
                      </button>
                      <button
                        className="lib-menu-danger"
                        onClick={() => {
                          deleteSubject(s.id);
                          setMenuOpenId(null);
                        }}
                      >
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button className="lib-card-body" onClick={() => onOpenSubject(s.id)}>
              {renamingId === s.id ? (
                <div className="lib-rename-row" onClick={(e) => e.stopPropagation()}>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && commitRename(s.id)}
                  />
                  <button className="icon-btn" onClick={() => commitRename(s.id)}><CheckIcon /></button>
                  <button className="icon-btn" onClick={() => setRenamingId(null)}><XIcon /></button>
                </div>
              ) : (
                <>
                  <div className="lib-card-name">{s.name}</div>
                  <div className="chip lib-card-code">{s.code}</div>
                </>
              )}

              <div className="progress-track" style={{ margin: "14px 0 10px" }}>
                <div
                  className={`progress-fill progress-fill--${s.color}`}
                  style={{ width: `${s.gradePercent}%` }}
                />
              </div>
              <div className="lib-card-foot">
                <span>{s.notesCount} notes</span>
                <span>{s.gradePercent > 0 ? `${s.gradePercent}% · ${s.letterGrade}` : "No grades yet"}</span>
              </div>
            </button>
          </div>
        ))}

        {filtered.length === 0 && subjects.length === 0 && (
          <div className="card lib-empty">No subjects yet. Create your first subject to begin.</div>
        )}
        {filtered.length === 0 && subjects.length > 0 && (
          <div className="card lib-empty">No subjects match “{query}”.</div>
        )}
      </div>
    </section>
  );
}
