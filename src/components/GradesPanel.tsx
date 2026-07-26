import type { Subject } from "../types";
import "./GradesPanel.css";

interface Props {
  subjects: Subject[];
  onSelect?: (subjectId: string) => void;
  onViewAll?: () => void;
}

export function GradesPanel({ subjects, onSelect, onViewAll }: Props) {
  return (
    <div className="card panel-tight">
      <div className="panel-head" style={{ padding: "16px 16px 8px 16px" }}>
        <h3>Grades</h3>
        <button type="button" className="view-all" onClick={onViewAll}>
          Details →
        </button>
      </div>
      <ul className="grades-list">
        {subjects.map((s) => (
          <li className="grades-row" key={s.id}>
            <button className="grades-row-btn" onClick={() => onSelect?.(s.id)}>
              <div className="grades-info">
                <div className="grades-name">{s.name}</div>
                <div className="progress-track small">
                  <div
                    className={`progress-fill progress-fill--${s.color}`}
                    style={{ width: `${s.gradePercent}%` }}
                  />
                </div>
              </div>
              <div className="grades-numbers">
                <span className="grades-pct">{s.gradePercent}%</span>
                <span className="grades-letter">{s.letterGrade}</span>
              </div>
            </button>
          </li>
        ))}
        {subjects.length === 0 && <li className="notes-empty">No grades available.</li>}
      </ul>
    </div>
  );
}
