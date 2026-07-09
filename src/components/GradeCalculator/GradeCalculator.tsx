import { useState } from "react";
import type { GradeCategory } from "../../types";
import { computeGrade, computeCategoryPercent } from "../../data/gradeParser";
import { ChevronRightIcon, PlusIcon, TrashIcon } from "../icons";
import "./GradeCalculator.css";

let uid = 0;
function id() {
  uid += 1;
  return `gc${Date.now().toString(36)}${uid}`;
}

interface Props {
  categories: GradeCategory[];
  onChange: (categories: GradeCategory[]) => void;
}

function ringColor(pct: number) {
  if (pct >= 90) return "var(--green)";
  if (pct >= 80) return "var(--amber)";
  if (pct >= 70) return "var(--orange)";
  if (pct <= 0) return "var(--border)";
  return "var(--red)";
}

export function GradeCalculator({ categories, onChange }: Props) {
  const { current, projected, letter } = computeGrade(categories);
  const totalWeight = categories.reduce((sum, c) => sum + c.weightPercent, 0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateCategory = (catId: string, patch: Partial<GradeCategory>) => {
    onChange(categories.map((c) => (c.id === catId ? { ...c, ...patch } : c)));
  };
  const deleteCategory = (catId: string) => {
    onChange(categories.filter((c) => c.id !== catId));
    if (editingId === catId) setEditingId(null);
  };
  const addCategory = () => {
    const newId = id();
    onChange([...categories, { id: newId, name: "New Category", weightPercent: 0, assignments: [] }]);
    setEditingId(newId);
  };

  const updateAssignment = (catId: string, aId: string, patch: Partial<GradeCategory["assignments"][number]>) => {
    onChange(
      categories.map((c) =>
        c.id === catId
          ? { ...c, assignments: c.assignments.map((a) => (a.id === aId ? { ...a, ...patch } : a)) }
          : c
      )
    );
  };
  const deleteAssignment = (catId: string, aId: string) => {
    onChange(
      categories.map((c) => (c.id === catId ? { ...c, assignments: c.assignments.filter((a) => a.id !== aId) } : c))
    );
  };
  const addAssignment = (catId: string) => {
    onChange(
      categories.map((c) =>
        c.id === catId
          ? { ...c, assignments: [...c.assignments, { id: id(), name: "New Item", score: null, maxScore: 100 }] }
          : c
      )
    );
  };

  const ringPct = Math.max(0, Math.min(100, current));
  const circumference = 2 * Math.PI * 42;
  const dash = (ringPct / 100) * circumference;

  return (
    <div className="gcalc">
      {/* Hero */}
      <div className="gcalc-hero">
        <div className="gcalc-ring-wrap">
          <svg viewBox="0 0 100 100" className="gcalc-ring">
            <circle cx="50" cy="50" r="42" className="gcalc-ring-track" />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="gcalc-ring-fill"
              style={{
                stroke: ringColor(current),
                strokeDasharray: `${dash} ${circumference}`,
              }}
            />
          </svg>
          <div className="gcalc-ring-center">
            <span className="gcalc-ring-value">{current > 0 ? `${current}%` : "—"}</span>
            <span className="gcalc-ring-label">{letter}</span>
          </div>
        </div>

        <div className="gcalc-hero-stats">
          <div className="gcalc-stat">
            <span className="gcalc-stat-label">Projected</span>
            <span className="gcalc-stat-value">{projected > 0 ? `${projected}%` : "—"}</span>
          </div>
          <div className="gcalc-stat">
            <span className="gcalc-stat-label">Categories</span>
            <span className="gcalc-stat-value">{categories.length}</span>
          </div>
          <div className={`gcalc-stat ${totalWeight !== 100 ? "gcalc-weight-warn" : ""}`}>
            <span className="gcalc-stat-label">Total Weight</span>
            <span className="gcalc-stat-value">{totalWeight}%</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="gcalc-categories">
        {categories.map((cat) => {
          const pct = computeCategoryPercent(cat);
          const isEditing = editingId === cat.id;
          return (
            <div className={`gcalc-cat ${isEditing ? "is-editing" : ""}`} key={cat.id}>
              <button
                className="gcalc-cat-row"
                onClick={() => setEditingId(isEditing ? null : cat.id)}
              >
                <ChevronRightIcon className={`gcalc-chevron ${isEditing ? "is-open" : ""}`} />
                <span className="gcalc-cat-title">{cat.name}</span>
                <span className="gcalc-cat-weight-pill">{cat.weightPercent}%</span>
                <div className="gcalc-cat-bar">
                  <div
                    className="gcalc-cat-bar-fill"
                    style={{
                      width: `${pct ?? 0}%`,
                      background: pct !== null ? ringColor(pct) : "var(--border)",
                    }}
                  />
                </div>
                <span className="gcalc-cat-pct">{pct !== null ? `${pct}%` : "—"}</span>
              </button>

              {isEditing && (
                <div className="gcalc-cat-body">
                  <div className="gcalc-edit-row">
                    <label className="gcalc-edit-label">Category name</label>
                    <input
                      className="gcalc-edit-input"
                      value={cat.name}
                      onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                    />
                    <label className="gcalc-edit-label">Weight</label>
                    <div className="gcalc-weight-input">
                      <input
                        type="number"
                        value={cat.weightPercent}
                        onChange={(e) => updateCategory(cat.id, { weightPercent: Number(e.target.value) || 0 })}
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <div className="gcalc-assignments">
                    {cat.assignments.map((a) => {
                      const aPct = a.score !== null && a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 1000) / 10 : null;
                      return (
                        <div className="gcalc-assignment-row" key={a.id}>
                          <input
                            className="gcalc-a-name"
                            value={a.name}
                            onChange={(e) => updateAssignment(cat.id, a.id, { name: e.target.value })}
                          />
                          <div className="gcalc-a-scoregroup">
                            <input
                              className="gcalc-a-score"
                              type="number"
                              placeholder="—"
                              value={a.score ?? ""}
                              onChange={(e) =>
                                updateAssignment(cat.id, a.id, {
                                  score: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                            />
                            <span className="gcalc-a-slash">/</span>
                            <input
                              className="gcalc-a-max"
                              type="number"
                              value={a.maxScore}
                              onChange={(e) => updateAssignment(cat.id, a.id, { maxScore: Number(e.target.value) || 0 })}
                            />
                          </div>
                          <span className="gcalc-a-pct">{aPct !== null ? `${aPct}%` : "—"}</span>
                          <button className="icon-btn" onClick={() => deleteAssignment(cat.id, a.id)} aria-label="Delete assignment">
                            <TrashIcon />
                          </button>
                        </div>
                      );
                    })}
                    <button className="gcalc-add-assignment" onClick={() => addAssignment(cat.id)}>
                      <PlusIcon /> Add item
                    </button>
                  </div>

                  <div className="gcalc-cat-footer">
                    <button className="gcalc-delete-cat" onClick={() => deleteCategory(cat.id)}>
                      <TrashIcon /> Delete category
                    </button>
                    <button className="btn-solid gcalc-done-btn" onClick={() => setEditingId(null)}>
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="btn-ghost gcalc-add-cat" onClick={addCategory}>
        <PlusIcon /> Add Category
      </button>
    </div>
  );
}
