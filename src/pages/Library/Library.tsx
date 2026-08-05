import { useEffect, useMemo, useRef, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { SubjectIcon } from "../../components/ui/icons";
import { PinIcon, PlusIcon, SearchIcon, DotsIcon, PencilIcon, TrashIcon, CheckIcon, XIcon } from "../../components/ui/icons";
import type { IconName } from "../../types";
import { SEMESTER_OPTIONS } from "../../types";
import { AppearanceFields } from "../../components/ui/AppearanceFields";
import { subjectHex, subjectColorVars, BOOK_COLOR_PRESETS } from "../../utils/color";
import "../shared/page.css";
import "./Library.css";

type SortKey = "name" | "grade" | "notes";
type SemesterFilter = "all" | "unassigned" | (typeof SEMESTER_OPTIONS)[number];

interface Props {
  onOpenSubject: (id: string) => void;
  autoOpenAdd?: boolean;
  onAutoOpenConsumed?: () => void;
}

export function Library({ onOpenSubject, autoOpenAdd, onAutoOpenConsumed }: Props) {
  const { subjects, addSubject, renameSubject, deleteSubject, togglePin, updateSubject } = useAppData();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>("all");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newIcon, setNewIcon] = useState<IconName>("general");
  const [newColor, setNewColor] = useState<string>(BOOK_COLOR_PRESETS[0]);
  const [newSemester, setNewSemester] = useState<string>("");
  const editPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoOpenAdd) {
      setShowAdd(true);
      onAutoOpenConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenAdd]);

  useEffect(() => {
    if (!editingId) return;
    const onClick = (e: MouseEvent) => {
      if (editPopoverRef.current && !editPopoverRef.current.contains(e.target as Node)) setEditingId(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [editingId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = subjects.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
    if (semesterFilter === "unassigned") list = list.filter((s) => !s.semester);
    else if (semesterFilter !== "all") list = list.filter((s) => s.semester === semesterFilter);

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "grade") return b.gradePercent - a.gradePercent;
      return b.notesCount - a.notesCount;
    });
    const pinned = list.filter((s) => s.pinned);
    const rest = list.filter((s) => !s.pinned);
    return [...pinned, ...rest];
  }, [subjects, query, sort, semesterFilter]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const code = newCode.trim() || newName.trim().slice(0, 3).toUpperCase() + " 101";
    addSubject({ name: newName.trim(), code, icon: newIcon, color: "tan", customColor: newColor, semester: newSemester || undefined });
    setNewName("");
    setNewCode("");
    setNewIcon("general");
    setNewColor(BOOK_COLOR_PRESETS[0]);
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
        <div className="lib-toolbar-selects">
          <select className="lib-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="name">Sort: Name</option>
            <option value="grade">Sort: Grade</option>
            <option value="notes">Sort: Notes</option>
          </select>
          <select
            className="lib-sort"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value as SemesterFilter)}
            aria-label="Filter by semester"
          >
            <option value="all">All Semesters</option>
            <option value="unassigned">Unassigned</option>
            {SEMESTER_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
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
          <AppearanceFields
            icon={newIcon}
            color={newColor}
            semester={newSemester}
            onIconChange={setNewIcon}
            onColorChange={setNewColor}
            onSemesterChange={setNewSemester}
          />
          <div className="lib-add-actions">
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-solid" onClick={handleAdd} disabled={!newName.trim()}>Create Subject</button>
          </div>
        </div>
      )}

      <div className="lib-grid">
        {filtered.map((s) => {
          const hex = subjectHex(s);
          const vars = subjectColorVars(hex) as React.CSSProperties;
          return (
            <div className="card lib-card" key={s.id} style={vars}>
              <div className="lib-card-top">
                <span className="lib-icon">
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
                        <button onClick={() => { setEditingId(s.id); setMenuOpenId(null); }}>
                          <span className="lib-menu-color-dot" style={{ background: hex }} /> Edit appearance
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
                    {editingId === s.id && (
                      <div className="lib-edit-popover card" ref={editPopoverRef}>
                        <div className="lib-edit-popover-head">
                          <span>Edit appearance</span>
                          <button className="icon-btn" onClick={() => setEditingId(null)} aria-label="Close">
                            <XIcon />
                          </button>
                        </div>
                        <AppearanceFields
                          compact
                          icon={s.icon}
                          color={hex}
                          semester={s.semester ?? ""}
                          onIconChange={(icon) => updateSubject(s.id, { icon })}
                          onColorChange={(customColor) => updateSubject(s.id, { customColor })}
                          onSemesterChange={(semester) => updateSubject(s.id, { semester: semester || undefined })}
                        />
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
                    <div className="lib-card-meta-row">
                      <div className="chip lib-card-code">{s.code}</div>
                      {s.semester && <div className="chip lib-card-semester">{s.semester}</div>}
                    </div>
                  </>
                )}

                <div className="progress-track" style={{ margin: "14px 0 10px" }}>
                  <div className="progress-fill" style={{ width: `${s.gradePercent}%`, background: hex }} />
                </div>
                <div className="lib-card-foot">
                  <span>{s.notesCount} notes</span>
                  <span>{s.gradePercent > 0 ? `${s.gradePercent}% · ${s.letterGrade}` : "No grades yet"}</span>
                </div>
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && subjects.length === 0 && (
          <div className="card lib-empty">No subjects yet. Create your first subject to begin.</div>
        )}
        {filtered.length === 0 && subjects.length > 0 && (
          <div className="card lib-empty">No subjects match your filters.</div>
        )}
      </div>
    </section>
  );
}
