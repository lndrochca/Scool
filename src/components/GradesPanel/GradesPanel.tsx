import type { Subject } from "../../types";
import "./GradesPanel.css";

export function GradesPanel({ subjects }: { subjects: Subject[] }) {
  return (
    <div className="card panel-tight">
      <div className="panel-head" style={{ padding: "16px 16px 8px 16px" }}>
        <h3>Grades</h3>
        <a className="view-all" href="#">
          Details →
        </a>
      </div>
      <ul className="grades-list">
        {subjects.map((s) => (
          <li className="grades-row" key={s.id}>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
