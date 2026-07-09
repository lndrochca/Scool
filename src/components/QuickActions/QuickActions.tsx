import type { ReactElement } from "react";
import { GradesQuickIcon, NotesQuickIcon, SubjectQuickIcon, UploadQuickIcon } from "../icons";
import type { PageName } from "../../types";
import "./QuickActions.css";

interface Action {
  label: string;
  color: "green" | "orange" | "tan";
  icon: ReactElement;
  page: PageName;
}

const actions: Action[] = [
  { label: "New Notes", color: "green", icon: <NotesQuickIcon />, page: "notes" },
  { label: "Add Grades", color: "orange", icon: <GradesQuickIcon />, page: "grades" },
  { label: "New Subject", color: "tan", icon: <SubjectQuickIcon />, page: "library" },
  { label: "Upload File", color: "green", icon: <UploadQuickIcon />, page: "notes" },
];

export function QuickActions({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  return (
    <div className="quick-grid">
      {actions.map((a) => (
        <button className="quick-card card" key={a.label} onClick={() => onNavigate(a.page)}>
          <span className={`quick-icon quick-icon--${a.color}`}>{a.icon}</span>
          <span className="quick-label">{a.label}</span>
        </button>
      ))}
    </div>
  );
}
