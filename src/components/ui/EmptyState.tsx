import type { ReactElement } from "react";
import "./EmptyState.css";

interface Props {
  icon: ReactElement;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, message, action }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button className="btn-solid" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
