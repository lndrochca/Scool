import type { Subject } from "../types";
import { SubjectIcon } from "./icons";
import "./ActiveSubjects.css";

interface Props {
  subjects: Subject[];
  onSelect?: (subjectId: string) => void;
  onViewAll?: () => void;
}

export function ActiveSubjects({ subjects, onSelect, onViewAll }: Props) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h3>Active Subjects</h3>
        <button type="button" className="view-all" onClick={onViewAll}>
          View all →
        </button>
      </div>
      <ul className="subject-list">
        {subjects.map((s) => (
          <li className="subject-row" key={s.id}>
            <button className="subject-row-btn" onClick={() => onSelect?.(s.id)}>
              <span className={`subject-icon subject-icon--${s.color}`}>
                <SubjectIcon name={s.icon} />
              </span>
              <div className="subject-main">
                <div className="subject-top">
                  <span className="subject-name">{s.name}</span>
                  <span className="subject-letter">{s.letterGrade}</span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill progress-fill--${s.color}`}
                    style={{ width: `${s.gradePercent}%` }}
                  />
                </div>
                <div className="subject-foot">
                  <span>{s.notesCount} notes</span>
                  <span>{s.gradePercent}%</span>
                </div>
              </div>
            </button>
          </li>
        ))}
        {subjects.length === 0 && (
          <li className="notes-empty">No subjects yet. Create your first subject to begin.</li>
        )}
      </ul>
    </div>
  );
}
