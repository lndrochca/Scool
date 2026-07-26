import { useEffect, useMemo, useState } from "react";
import type { GradeNode } from "../types";
import {
  addChild,
  computeNodeStats,
  createDefaultTerms,
  createFolder,
  createItem,
  createTerm,
  deleteNode,
  duplicateNode,
  findNode,
  getPath,
  listFolders,
  moveNode,
  reorderSibling,
  reorderToIndex,
  toLetter,
  updateNode,
} from "../data/gradeTree";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DuplicateIcon,
  FolderIcon,
  GenericFileIcon,
  MoveIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "./icons";
import "./GradeExplorer.css";

interface Props {
  root: GradeNode;
  onChange: (root: GradeNode) => void;
}

function ringColor(pct: number | null) {
  if (pct === null) return "var(--border)";
  if (pct >= 90) return "var(--green)";
  if (pct >= 80) return "var(--amber)";
  if (pct >= 70) return "var(--orange)";
  return "var(--red)";
}

type AddKind = "folder" | "item";

export function GradeExplorer({ root, onChange }: Props) {
  const terms = root.children ?? [];

  const [selectedTermId, setSelectedTermId] = useState<string | null>(terms[0]?.id ?? null);
  const [focusPath, setFocusPath] = useState<string[]>(terms[0] ? [terms[0].id] : []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(terms[0]?.id ?? null);

  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState("");
  const [addingTerm, setAddingTerm] = useState(false);
  const [newTermName, setNewTermName] = useState("");
  const [draggedTermId, setDraggedTermId] = useState<string | null>(null);
  const [dragOverTermId, setDragOverTermId] = useState<string | null>(null);
  const [detailsOpenId, setDetailsOpenId] = useState<string | null>(null);

  useEffect(() => {
    const currentTerms = root.children ?? [];
    if (!selectedTermId || !currentTerms.some((t) => t.id === selectedTermId)) {
      const first = currentTerms[0]?.id ?? null;
      setSelectedTermId(first);
      setFocusPath(first ? [first] : []);
      setSelectedNodeId(first);
      return;
    }
    let cursor = root;
    let valid = true;
    for (const id of focusPath) {
      const next = (cursor.children ?? []).find((c) => c.id === id);
      if (!next) {
        valid = false;
        break;
      }
      cursor = next;
    }
    if (!valid) {
      setFocusPath([selectedTermId]);
      setSelectedNodeId(selectedTermId);
    } else if (selectedNodeId && !findNode(root, selectedNodeId)) {
      setSelectedNodeId(focusPath[focusPath.length - 1] ?? selectedTermId);
    }
  }, [root]);

  const update = (fn: (r: GradeNode) => GradeNode) => onChange(fn(root));

  const focusFolderId = focusPath[focusPath.length - 1] ?? null;
  const focusFolder = focusFolderId ? findNode(root, focusFolderId) : null;
  const selectedTerm = selectedTermId ? findNode(root, selectedTermId) : null;
  const selectedNode = selectedNodeId ? findNode(root, selectedNodeId) : focusFolder;

  const rootStats = useMemo(() => computeNodeStats(root), [root]);
  const termStats = useMemo(() => (selectedTerm ? computeNodeStats(selectedTerm) : null), [selectedTerm]);
  const focusStats = useMemo(() => (focusFolder ? computeNodeStats(focusFolder) : null), [focusFolder]);
  const selectedStats = useMemo(() => (selectedNode ? computeNodeStats(selectedNode) : null), [selectedNode]);
  const breadcrumbPath = useMemo(
    () => (focusFolderId ? getPath(root, focusFolderId) ?? [root] : [root]),
    [root, focusFolderId],
  );
  const folders = useMemo(() => (selectedTerm ? listFolders(selectedTerm) : []), [selectedTerm]);

  const isViewingComponents = focusPath.length === 1;

  const openTerm = (id: string) => {
    setSelectedTermId(id);
    setFocusPath([id]);
    setSelectedNodeId(id);
    setDetailsOpenId(null);
  };
  const backToTerms = () => {
    setSelectedTermId(null);
    setFocusPath([]);
    setSelectedNodeId(null);
  };
  const commitAddTerm = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setAddingTerm(false);
      setNewTermName("");
      return;
    }
    const term = createTerm(trimmed);
    update((r) => ({ ...r, children: [...(r.children ?? []), term] }));
    setAddingTerm(false);
    setNewTermName("");
    openTerm(term.id);
  };
  const addDefaultTerms = () => {
    const defaults = createDefaultTerms();
    update((r) => ({ ...r, children: [...(r.children ?? []), ...defaults] }));
    openTerm(defaults[0].id);
  };
  const renameTerm = (id: string, name: string) => update((r) => updateNode(r, id, { name }));
  const deleteTerm = (id: string, name: string) => {
    if (window.confirm(`Delete the "${name}" term and everything inside it? This can't be undone.`)) {
      update((r) => deleteNode(r, id));
    }
  };
  const duplicateTerm = (id: string) => update((r) => duplicateNode(r, id));

  const handleTermDrop = (targetId: string) => {
    if (draggedTermId && draggedTermId !== targetId) {
      const targetIndex = terms.findIndex((t) => t.id === targetId);
      update((r) => reorderToIndex(r, draggedTermId, targetIndex));
    }
    setDraggedTermId(null);
    setDragOverTermId(null);
  };

  const addToFocusFolder = (kind: AddKind) => {
    if (!focusFolderId) return;
    const node = kind === "folder" ? createFolder("New Folder") : createItem("New Item");
    update((r) => addChild(r, focusFolderId, node));
  };
  const addChildTo = (parentId: string, kind: AddKind) => {
    const node = kind === "folder" ? createFolder("New Folder") : createItem("New Item");
    update((r) => addChild(r, parentId, node));
  };
  const renameNode = (id: string, name: string) => update((r) => updateNode(r, id, { name }));
  const setWeight = (id: string, w: number) => update((r) => updateNode(r, id, { weightPercent: w }));
  const removeNode = (id: string, name: string, isFolder: boolean) => {
    if (window.confirm(`Delete "${name}"${isFolder ? " and everything inside it" : ""}? This can't be undone.`)) {
      update((r) => deleteNode(r, id));
    }
  };
  const duplicateRow = (id: string) => update((r) => duplicateNode(r, id));
  const reorderRow = (id: string, dir: -1 | 1) => update((r) => reorderSibling(r, id, dir));

  const startMove = (id: string) => {
    setMovingId(id);
    setMoveTarget("");
  };
  const confirmMove = (id: string) => {
    if (!moveTarget) return;
    update((r) => moveNode(r, id, moveTarget));
    setMovingId(null);
  };

  const openFolder = (id: string) => {
    setFocusPath((p) => [...p, id]);
    setSelectedNodeId(id);
    setDetailsOpenId(null);
  };
  const goUp = () => {
    if (focusPath.length > 1) {
      setFocusPath((p) => p.slice(0, -1));
      setSelectedNodeId(focusPath[focusPath.length - 2]);
    } else {
      backToTerms();
    }
  };
  const goToCrumb = (index: number) => {
    if (index === 0) {
      backToTerms();
      return;
    }
    const ids = breadcrumbPath.slice(1, index + 1).map((n) => n.id);
    setSelectedTermId(ids[0]);
    setFocusPath(ids);
    setSelectedNodeId(ids[ids.length - 1]);
  };

  const children = focusFolder?.children ?? [];

  return (
    <div className="gx">
      <div className="gx-breadcrumb">
        <span className="gx-crumb-wrap">
          <button
            className={`gx-crumb ${!selectedTermId ? "is-current" : ""}`}
            onClick={() => (selectedTermId ? goToCrumb(0) : undefined)}
          >
            {root.name}
          </button>
        </span>
        {selectedTermId &&
          breadcrumbPath.slice(1).map((node, i) => (
            <span key={node.id} className="gx-crumb-wrap">
              <span className="gx-crumb-sep">›</span>
              <button
                className={`gx-crumb ${i === breadcrumbPath.length - 2 ? "is-current" : ""}`}
                onClick={() => goToCrumb(i + 1)}
              >
                {node.name}
              </button>
            </span>
          ))}
      </div>

      {!selectedTermId && (
        <div className="gx-terms-section">
          <div className="gx-terms-head">
            <div>
              <h2 className="gx-terms-title">{root.name}</h2>
              <p className="gx-terms-sub">
                Grades start with an academic term. Pick one to build out its grading structure.
              </p>
            </div>
            <div className="gx-terms-overall">
              <span>Overall Subject Grade</span>
              <strong>{rootStats.percent !== null ? `${rootStats.percent}%` : "—"}</strong>
            </div>
          </div>

          {terms.length === 0 && !addingTerm ? (
            <div className="gx-empty gx-empty--terms">
              <p className="gx-empty-title">No academic terms yet.</p>
              <p className="gx-empty-sub">
                Start with common terms like Prelim, Midterm, Prefinals, and Finals — or add your own custom terms
                to match how your school grades.
              </p>
              <div className="gx-empty-actions">
                <button className="btn-solid" onClick={addDefaultTerms}>
                  <PlusIcon /> Add Prelim, Midterm, Prefinals, Finals
                </button>
                <button className="btn-ghost" onClick={() => setAddingTerm(true)}>
                  <PlusIcon /> Add Custom Term
                </button>
              </div>
            </div>
          ) : (
            <div className="gx-terms-grid">
              {terms.map((term, i) => (
                <TermCard
                  key={term.id}
                  term={term}
                  index={i}
                  stats={computeNodeStats(term)}
                  isDragging={draggedTermId === term.id}
                  isDragOver={dragOverTermId === term.id}
                  onOpen={() => openTerm(term.id)}
                  onRename={(name) => renameTerm(term.id, name)}
                  onDuplicate={() => duplicateTerm(term.id)}
                  onDelete={() => deleteTerm(term.id, term.name)}
                  onDragStart={() => setDraggedTermId(term.id)}
                  onDragOver={() => setDragOverTermId(term.id)}
                  onDragEnd={() => {
                    setDraggedTermId(null);
                    setDragOverTermId(null);
                  }}
                  onDrop={() => handleTermDrop(term.id)}
                />
              ))}

              {addingTerm ? (
                <div className="gx-term-card gx-term-card--new">
                  <input
                    autoFocus
                    className="gx-term-new-input"
                    placeholder="Term name…"
                    value={newTermName}
                    onChange={(e) => setNewTermName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitAddTerm(newTermName);
                      if (e.key === "Escape") {
                        setAddingTerm(false);
                        setNewTermName("");
                      }
                    }}
                    onBlur={() => commitAddTerm(newTermName)}
                  />
                  <span className="gx-term-new-hint">Press Enter to add</span>
                </div>
              ) : (
                <button className="gx-term-add-card" onClick={() => setAddingTerm(true)}>
                  <PlusIcon />
                  <span>Add Term</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {selectedTermId && focusFolder && (
        <div className="gx-layout">
          <div className="gx-main card">
            <div className="gx-main-toolbar">
              <button className="gx-up-btn" onClick={goUp} aria-label="Go up one level">
                <ChevronRightIcon className="gx-up-icon" />
              </button>
              <div className="gx-main-toolbar-label">
                <span className="gx-main-toolbar-kind">{isViewingComponents ? "Term" : "Folder"}</span>
                <span className="gx-main-toolbar-name">{focusFolder.name}</span>
              </div>
              <div className="gx-main-toolbar-actions">
                <button className="btn-ghost gx-small-btn" onClick={() => addToFocusFolder("folder")}>
                  <PlusIcon /> Folder
                </button>
                <button className="btn-ghost gx-small-btn" onClick={() => addToFocusFolder("item")}>
                  <PlusIcon /> Assessment
                </button>
              </div>
            </div>

            {children.length === 0 ? (
              <div className="gx-empty">
                <p className="gx-empty-title">{focusFolder.name}</p>
                <p className="gx-empty-sub">
                  {isViewingComponents
                    ? "No grading components have been created yet."
                    : "This folder is empty."}
                </p>
                <p className="gx-empty-hint">
                  {isViewingComponents
                    ? "Start by adding Lecture, Laboratory, or another grading component."
                    : "Add a subfolder to keep organizing, or add an assessment to start recording grades."}
                </p>
                <div className="gx-empty-actions">
                  <button className="btn-solid" onClick={() => addToFocusFolder("folder")}>
                    <PlusIcon /> Add {isViewingComponents ? "Component" : "Folder"}
                  </button>
                  <button className="btn-ghost" onClick={() => addToFocusFolder("item")}>
                    <PlusIcon /> Add Assessment
                  </button>
                </div>
              </div>
            ) : (
              <div className={`gx-content-list ${isViewingComponents ? "gx-content-list--cards" : ""}`}>
                {children.map((child, i) => (
                  <ExplorerRow
                    key={child.id}
                    node={child}
                    variant={child.kind === "item" ? "item" : isViewingComponents ? "component" : "folder"}
                    siblingIndex={i}
                    siblingCount={children.length}
                    isSelected={selectedNodeId === child.id}
                    detailsOpen={detailsOpenId === child.id}
                    onToggleDetails={() => setDetailsOpenId((v) => (v === child.id ? null : child.id))}
                    onOpen={() => (child.kind === "folder" ? openFolder(child.id) : setSelectedNodeId(child.id))}
                    onRename={(name) => renameNode(child.id, name)}
                    onSetWeight={(w) => setWeight(child.id, w)}
                    onSetScore={(s) => update((r) => updateNode(r, child.id, { score: s }))}
                    onSetMaxScore={(m) => update((r) => updateNode(r, child.id, { maxScore: m }))}
                    onSetDate={(d) => update((r) => updateNode(r, child.id, { date: d }))}
                    onSetNotes={(n) => update((r) => updateNode(r, child.id, { notes: n }))}
                    onAddChild={(kind) => addChildTo(child.id, kind)}
                    onDuplicate={() => duplicateRow(child.id)}
                    onDelete={() => removeNode(child.id, child.name, child.kind === "folder")}
                    onMoveUp={() => reorderRow(child.id, -1)}
                    onMoveDown={() => reorderRow(child.id, 1)}
                    onStartMove={() => startMove(child.id)}
                    isMoving={movingId === child.id}
                    moveTarget={moveTarget}
                    onSetMoveTarget={setMoveTarget}
                    onConfirmMove={() => confirmMove(child.id)}
                    onCancelMove={() => setMovingId(null)}
                    moveDestinations={folders.filter((f) => f.node.id !== child.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <SummaryPanel
            term={selectedTerm}
            termStats={termStats}
            rootStats={rootStats}
            selectedNode={selectedNode}
            selectedStats={selectedStats}
            focusFolder={focusFolder}
            focusStats={focusStats}
            root={root}
          />
        </div>
      )}
    </div>
  );
}

interface TermCardProps {
  term: GradeNode;
  index: number;
  stats: { percent: number | null; itemCount: number; gradedCount: number };
  isDragging: boolean;
  isDragOver: boolean;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}

function TermCard({
  term,
  stats,
  isDragging,
  isDragOver,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: TermCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(term.name);

  const commit = () => {
    const trimmed = draft.trim();
    onRename(trimmed || term.name);
    setEditing(false);
  };

  return (
    <div
      className={`gx-term-card ${isDragging ? "is-dragging" : ""} ${isDragOver ? "is-drag-over" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onClick={() => !editing && onOpen()}
    >
      <div className="gx-term-card-drag" title="Drag to reorder" onClick={(e) => e.stopPropagation()}>
        ⋮⋮
      </div>

      <div className="gx-term-card-head" onClick={(e) => editing && e.stopPropagation()}>
        {editing ? (
          <input
            autoFocus
            className="gx-term-rename-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(term.name);
                setEditing(false);
              }
            }}
          />
        ) : (
          <h3 className="gx-term-card-name">{term.name}</h3>
        )}
      </div>

      <div className="gx-term-card-ring">
        <MiniRing pct={stats.percent} />
      </div>

      <div className="gx-term-card-meta">
        <span>{stats.gradedCount}/{stats.itemCount} graded</span>
      </div>

      <div className="gx-term-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" aria-label="Rename term" onClick={() => setEditing(true)}>
          <PencilIcon />
        </button>
        <button className="icon-btn" aria-label="Duplicate term" onClick={onDuplicate}>
          <DuplicateIcon />
        </button>
        <button className="icon-btn" aria-label="Delete term" onClick={onDelete}>
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function MiniRing({ pct }: { pct: number | null }) {
  const value = pct ?? 0;
  const circumference = 2 * Math.PI * 26;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className="gx-mini-ring-wrap">
      <svg viewBox="0 0 64 64" className="gx-mini-ring">
        <circle cx="32" cy="32" r="26" className="gx-ring-track" />
        <circle
          cx="32"
          cy="32"
          r="26"
          className="gx-ring-fill"
          style={{ stroke: ringColor(pct), strokeDasharray: `${dash} ${circumference}` }}
        />
      </svg>
      <div className="gx-mini-ring-center">{pct !== null ? `${pct}%` : "—"}</div>
    </div>
  );
}

function WeightChip({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="gx-weight-chip" onClick={(e) => e.stopPropagation()}>
      <span className="gx-weight-chip-label">Weight</span>
      <div className="gx-weight-chip-control">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <span className="gx-weight-chip-pct">%</span>
      </div>
    </div>
  );
}

type RowVariant = "component" | "folder" | "item";

interface RowProps {
  node: GradeNode;
  variant: RowVariant;
  siblingIndex: number;
  siblingCount: number;
  isSelected: boolean;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  onOpen: () => void;
  onRename: (name: string) => void;
  onSetWeight: (w: number) => void;
  onSetScore: (s: number | null) => void;
  onSetMaxScore: (m: number) => void;
  onSetDate: (d: string) => void;
  onSetNotes: (n: string) => void;
  onAddChild: (kind: AddKind) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onStartMove: () => void;
  isMoving: boolean;
  moveTarget: string;
  onSetMoveTarget: (id: string) => void;
  onConfirmMove: () => void;
  onCancelMove: () => void;
  moveDestinations: { node: GradeNode; path: string }[];
}

function ExplorerRow({
  node,
  variant,
  siblingIndex,
  siblingCount,
  isSelected,
  detailsOpen,
  onToggleDetails,
  onOpen,
  onRename,
  onSetWeight,
  onSetScore,
  onSetMaxScore,
  onSetDate,
  onSetNotes,
  onAddChild,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onStartMove,
  isMoving,
  moveTarget,
  onSetMoveTarget,
  onConfirmMove,
  onCancelMove,
  moveDestinations,
}: RowProps) {
  const stats = useMemo(() => computeNodeStats(node), [node]);
  const isFolder = node.kind === "folder";

  if (variant === "component") {
    return (
      <div className={`gx-card gx-card--component ${isSelected ? "is-selected" : ""}`} onClick={onOpen}>
        <div className="gx-card-head">
          <span className="gx-card-icon"><FolderIcon /></span>
          <input
            className="gx-name-input gx-card-name"
            value={node.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onRename(e.target.value)}
          />
          <span className="gx-card-pct" style={{ color: ringColor(stats.percent) }}>
            {stats.percent !== null ? `${stats.percent}%` : "—"}
          </span>
        </div>
        <div className="gx-mini-bar gx-card-bar">
          <div
            className="gx-mini-bar-fill"
            style={{ width: `${stats.percent ?? 0}%`, background: ringColor(stats.percent) }}
          />
        </div>
        <div className="gx-card-foot">
          <WeightChip value={node.weightPercent} onChange={onSetWeight} />
          <span className="gx-card-count">{(node.children ?? []).length} inside</span>
        </div>
        <div className="gx-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" aria-label="Move up" disabled={siblingIndex === 0} onClick={onMoveUp}>‹</button>
          <button className="icon-btn" aria-label="Move down" disabled={siblingIndex === siblingCount - 1} onClick={onMoveDown}>›</button>
          <button className="icon-btn" aria-label="Add folder inside" onClick={() => onAddChild("folder")}><PlusIcon /></button>
          <button className="icon-btn" aria-label="Duplicate" onClick={onDuplicate}><DuplicateIcon /></button>
          <button className="icon-btn" aria-label="Move to another folder" onClick={onStartMove}><MoveIcon /></button>
          <button className="icon-btn" aria-label="Delete" onClick={onDelete}><TrashIcon /></button>
        </div>

        {isMoving && (
          <MovePicker
            destinations={moveDestinations}
            value={moveTarget}
            onChange={onSetMoveTarget}
            onConfirm={onConfirmMove}
            onCancel={onCancelMove}
          />
        )}
      </div>
    );
  }

  return (
    <div className="gx-row-wrap">
      <div className={`gx-row gx-row--${variant} ${isSelected ? "is-selected" : ""}`} onClick={onOpen}>
        <span className="gx-row-icon">{isFolder ? <FolderIcon /> : <GenericFileIcon />}</span>

        <input
          className="gx-name-input"
          value={node.name}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onRename(e.target.value)}
        />

        {!isFolder && (
          <div className="gx-score-group" onClick={(e) => e.stopPropagation()}>
            <input
              className="gx-score-input"
              type="number"
              placeholder="—"
              value={node.score ?? ""}
              onChange={(e) => onSetScore(e.target.value === "" ? null : Number(e.target.value))}
            />
            <span className="gx-slash">/</span>
            <input
              className="gx-score-input"
              type="number"
              value={node.maxScore ?? 100}
              onChange={(e) => onSetMaxScore(Number(e.target.value) || 0)}
            />
          </div>
        )}

        <WeightChip value={node.weightPercent} onChange={onSetWeight} />

        {isFolder && (
          <div className="gx-mini-bar">
            <div
              className="gx-mini-bar-fill"
              style={{ width: `${stats.percent ?? 0}%`, background: ringColor(stats.percent) }}
            />
          </div>
        )}

        <span className="gx-row-pct">{stats.percent !== null ? `${stats.percent}%` : "—"}</span>

        <div className="gx-row-actions" onClick={(e) => e.stopPropagation()}>
          {isFolder ? (
            <>
              <button className="icon-btn" aria-label="Add folder inside" onClick={() => onAddChild("folder")}><PlusIcon /></button>
              <button className="icon-btn" aria-label="Add assessment inside" onClick={() => onAddChild("item")}><GenericFileIcon /></button>
            </>
          ) : (
            <button className="icon-btn" aria-label="Toggle details" onClick={onToggleDetails}>
              <ChevronDownIcon className={detailsOpen ? "is-open" : ""} />
            </button>
          )}
          <button className="icon-btn" aria-label="Move up" disabled={siblingIndex === 0} onClick={onMoveUp}>‹</button>
          <button className="icon-btn" aria-label="Move down" disabled={siblingIndex === siblingCount - 1} onClick={onMoveDown}>›</button>
          <button className="icon-btn" aria-label="Duplicate" onClick={onDuplicate}><DuplicateIcon /></button>
          <button className="icon-btn" aria-label="Move to another folder" onClick={onStartMove}><MoveIcon /></button>
          <button className="icon-btn" aria-label="Delete" onClick={onDelete}><TrashIcon /></button>
        </div>
      </div>

      {isMoving && (
        <MovePicker
          destinations={moveDestinations}
          value={moveTarget}
          onChange={onSetMoveTarget}
          onConfirm={onConfirmMove}
          onCancel={onCancelMove}
        />
      )}

      {!isFolder && detailsOpen && (
        <div className="gx-details">
          <label>
            Date
            <input type="date" value={node.date ?? ""} onChange={(e) => onSetDate(e.target.value)} />
          </label>
          <label className="gx-details-notes">
            Notes
            <textarea
              rows={2}
              value={node.notes ?? ""}
              onChange={(e) => onSetNotes(e.target.value)}
              placeholder="Optional notes about this item…"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function MovePicker({
  destinations,
  value,
  onChange,
  onConfirm,
  onCancel,
}: {
  destinations: { node: GradeNode; path: string }[];
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="gx-move-picker" onClick={(e) => e.stopPropagation()}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Move to…</option>
        {destinations.map((f) => (
          <option key={f.node.id} value={f.node.id}>{f.path}</option>
        ))}
      </select>
      <button className="btn-solid gx-small-btn" onClick={onConfirm} disabled={!value}>Move</button>
      <button className="btn-ghost gx-small-btn" onClick={onCancel}>Cancel</button>
    </div>
  );
}

interface SummaryPanelProps {
  term: GradeNode | null;
  termStats: { percent: number | null; itemCount: number; gradedCount: number } | null;
  rootStats: { percent: number | null; itemCount: number; gradedCount: number };
  selectedNode: GradeNode | null;
  selectedStats: { percent: number | null; itemCount: number; gradedCount: number } | null;
  focusFolder: GradeNode | null;
  focusStats: { percent: number | null; itemCount: number; gradedCount: number } | null;
  root: GradeNode;
}

function SummaryPanel({ term, termStats, rootStats, selectedNode, selectedStats, focusFolder, root }: SummaryPanelProps) {
  const showDetail = selectedNode && selectedNode.id !== focusFolder?.id;

  return (
    <div className="gx-side card">
      {term && (
        <>
          <div className="gx-summary-head">{term.name} Summary</div>
          {(term.children ?? []).length === 0 ? (
            <p className="gx-summary-empty">Add components to see a breakdown here.</p>
          ) : (
            <ul className="gx-summary-list">
              {(term.children ?? []).map((c) => {
                const s = computeNodeStats(c);
                return (
                  <li key={c.id} className="gx-summary-row">
                    <span className="gx-summary-name">{c.name}</span>
                    <span className="gx-summary-dots" />
                    <span className="gx-summary-pct">{s.percent !== null ? `${s.percent}%` : "—"}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="gx-summary-box">
            <span>Current Term Grade</span>
            <strong>{termStats?.percent !== null && termStats ? `${termStats.percent}%` : "—"}</strong>
          </div>
          <div className="gx-summary-box gx-summary-box--overall">
            <span>Overall Subject Grade</span>
            <strong>{rootStats.percent !== null ? `${rootStats.percent}%` : "—"} · {toLetter(rootStats.percent)}</strong>
          </div>
        </>
      )}

      {showDetail && selectedNode && (
        <div className="gx-side-detail">
          <div className="gx-side-head">
            <span className="gx-side-kind">{selectedNode.kind === "folder" ? "Folder" : "Assessment"}</span>
            <h3 className="gx-side-title">{selectedNode.name}</h3>
          </div>
          <div className="gx-side-ring-wrap">
            <RingStat pct={selectedNode.id === root.id ? rootStats.percent : (selectedStats?.percent ?? null)} />
          </div>
          <ul className="gx-side-stats">
            {selectedNode.kind === "folder" ? (
              <>
                <li><span>Subfolders &amp; items</span><strong>{(selectedNode.children ?? []).length}</strong></li>
                <li><span>Graded items</span><strong>{selectedStats?.gradedCount ?? 0} / {selectedStats?.itemCount ?? 0}</strong></li>
              </>
            ) : (
              <li><span>Score</span><strong>{selectedNode.score ?? "—"} / {selectedNode.maxScore ?? 100}</strong></li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function RingStat({ pct }: { pct: number | null }) {
  const value = pct ?? 0;
  const circumference = 2 * Math.PI * 40;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className="gx-ring-wrap">
      <svg viewBox="0 0 100 100" className="gx-ring">
        <circle cx="50" cy="50" r="40" className="gx-ring-track" />
        <circle
          cx="50"
          cy="50"
          r="40"
          className="gx-ring-fill"
          style={{ stroke: ringColor(pct), strokeDasharray: `${dash} ${circumference}` }}
        />
      </svg>
      <div className="gx-ring-center">
        <span className="gx-ring-value">{pct !== null ? `${pct}%` : "—"}</span>
      </div>
    </div>
  );
}
