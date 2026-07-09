import type { Subject } from "../../types";
import { SubjectIcon } from "../icons";
import "./ActiveSubjects.css";

export function ActiveSubjects({ subjects }: { subjects: Subject[] }) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h3>Active Subjects</h3>
        <a className="view-all" href="#">
          View all →
        </a>
      </div>
      <ul className="subject-list">
        {subjects.map((s) => (
          <li className="subject-row" key={s.id}>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
