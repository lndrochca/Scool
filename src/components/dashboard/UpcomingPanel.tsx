import type { UpcomingItem } from "../../types";
import { SubjectIcon } from "../ui/icons";
import "./UpcomingPanel.css";

const urgencyClass: Record<UpcomingItem["urgency"], string> = {
  overdue: "due-overdue",
  today: "due-today",
  tomorrow: "due-tomorrow",
  upcoming: "due-upcoming",
};

interface Props {
  items: UpcomingItem[];
  onSelect?: (item: UpcomingItem) => void;
  onViewAll?: () => void;
}

export function UpcomingPanel({ items, onSelect, onViewAll }: Props) {
  return (
    <div className="card panel-tight">
      <div className="panel-head" style={{ padding: "16px 16px 8px 16px" }}>
        <h3>Upcoming</h3>
        <button type="button" className="view-all" onClick={onViewAll}>
          View all →
        </button>
      </div>
      <ul className="upcoming-list">
        {items.map((item) => (
          <li className="upcoming-row" key={item.id}>
            <button className="upcoming-row-btn" onClick={() => onSelect?.(item)}>
              <span className={`upcoming-icon upcoming-icon--${item.color}`}>
                <SubjectIcon name={item.icon} />
              </span>
              <div className="upcoming-body">
                <div className="upcoming-title">{item.title}</div>
                <div className="upcoming-meta">{item.subjectName}</div>
                <div className="upcoming-foot">
                  <span className="weight-tag">{item.weightPercent}%</span>
                  <span className={`due-tag ${urgencyClass[item.urgency]}`}>
                    <span className="due-dot" /> {item.due}
                  </span>
                </div>
              </div>
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="notes-empty">No upcoming assignments.</li>}
      </ul>
    </div>
  );
}
