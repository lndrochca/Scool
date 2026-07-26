import type { ReactElement } from "react";
import { GradesQuickIcon, NotesQuickIcon, SubjectQuickIcon, UploadQuickIcon } from "./icons";
import "./QuickActions.css";

export type QuickActionKind = "new-notes" | "add-grades" | "new-subject" | "upload-file";

interface Action {
  label: string;
  color: "green" | "orange" | "tan";
  icon: ReactElement;
  kind: QuickActionKind;
}

const actions: Action[] = [
  { label: "New Notes", color: "green", icon: <NotesQuickIcon />, kind: "new-notes" },
  { label: "Add Grades", color: "orange", icon: <GradesQuickIcon />, kind: "add-grades" },
  { label: "New Subject", color: "tan", icon: <SubjectQuickIcon />, kind: "new-subject" },
  { label: "Upload File", color: "green", icon: <UploadQuickIcon />, kind: "upload-file" },
];

export function QuickActions({ onAction }: { onAction: (kind: QuickActionKind) => void }) {
  return (
    <div className="quick-grid">
      {actions.map((a) => (
        <button className="quick-card card" key={a.label} onClick={() => onAction(a.kind)}>
          <span className={`quick-icon quick-icon--${a.color}`}>{a.icon}</span>
          <span className="quick-label">{a.label}</span>
        </button>
      ))}
    </div>
  );
}
