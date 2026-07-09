import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { getDueMeta } from "../../data/deadlines";
import { SubjectIcon, PlusIcon, CheckIcon, TrashIcon, XIcon } from "../icons";
import "./UpcomingPanel.css";

export function UpcomingPanel() {
  const { deadlines, subjects, addDeadline, toggleDeadlineComplete, deleteDeadline } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [weight, setWeight] = useState("");

  const sorted = [...deadlines].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const resetForm = () => {
    setTitle("");
    setSubjectId("");
    setDueDate("");
    setWeight("");
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!title.trim() || !dueDate) return;
    const subject = subjects.find((s) => s.id === subjectId);
    addDeadline({
      title: title.trim(),
      subjectId: subject?.id,
      subjectName: subject?.name ?? "General",
      icon: subject?.icon ?? "english",
      color: subject?.color ?? "tan",
      weightPercent: Number(weight) || 0,
      dueDate,
    });
    resetForm();
  };

  return (
    <div className="card panel-tight">
      <div className="panel-head" style={{ padding: "16px 16px 8px 16px" }}>
        <h3>Upcoming</h3>
        <button className="upcoming-toggle-btn" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
          {showForm ? (
            <>
              <XIcon /> Cancel
            </>
          ) : (
            <>
              <PlusIcon /> Add
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="upcoming-form">
          <input
            className="upcoming-form-input"
            placeholder="What's due?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div className="upcoming-form-row">
            <select className="upcoming-form-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">General</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              className="upcoming-form-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="upcoming-form-row">
            <input
              className="upcoming-form-weight"
              type="number"
              placeholder="Weight %"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <button className="btn-solid upcoming-form-submit" onClick={handleAdd} disabled={!title.trim() || !dueDate}>
              Add deadline
            </button>
          </div>
        </div>
      )}

      <ul className="upcoming-list">
        {sorted.map((item) => {
          const meta = getDueMeta(item.dueDate);
          return (
            <li className={`upcoming-row ${item.completed ? "is-done" : ""}`} key={item.id}>
              <button
                className={`upcoming-check ${item.completed ? "is-checked" : ""}`}
                aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                onClick={() => toggleDeadlineComplete(item.id)}
              >
                {item.completed && <CheckIcon />}
              </button>
              <span className={`upcoming-icon upcoming-icon--${item.color}`}>
                <SubjectIcon name={item.icon} />
              </span>
              <div className="upcoming-body">
                <div className="upcoming-title">{item.title}</div>
                <div className="upcoming-meta">{item.subjectName}</div>
                <div className="upcoming-foot">
                  <span className="weight-tag">{item.weightPercent}%</span>
                  {!item.completed && (
                    <span className={`due-tag due-${meta.urgency}`}>
                      <span className="due-dot" /> {meta.label}
                    </span>
                  )}
                </div>
              </div>
              <button className="upcoming-delete" aria-label="Delete deadline" onClick={() => deleteDeadline(item.id)}>
                <TrashIcon />
              </button>
            </li>
          );
        })}
        {sorted.length === 0 && (
          <li className="upcoming-empty">No deadlines yet — you're in charge here, add your first one.</li>
        )}
      </ul>
    </div>
  );
}
