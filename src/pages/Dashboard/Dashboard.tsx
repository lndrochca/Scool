import { useMemo } from "react";
import { QuickActions, type QuickActionKind } from "../../components/QuickActions";
import { RecentNotes } from "../../components/RecentNotes";
import { ActiveSubjects } from "../../components/ActiveSubjects";
import { UpcomingPanel } from "../../components/UpcomingPanel";
import { GradesPanel } from "../../components/GradesPanel";
import { useAppData } from "../../context/AppDataContext";
import { formatDue } from "../../utils/time";
import type { Note, PageName, UpcomingItem, WorkspaceTabTarget } from "../../types";
import "../shared/page.css";
import "./Dashboard.css";

interface Props {
  onNavigate: (page: PageName) => void;
  onQuickAction: (kind: QuickActionKind) => void;
  onOpenSubject: (subjectId: string, tab?: WorkspaceTabTarget) => void;
  onOpenNote: (note: Note) => void;
}

export function Dashboard({ onNavigate, onQuickAction, onOpenSubject, onOpenNote }: Props) {
  const { subjects, notes, assignmentsBySubject } = useAppData();
  const pinned = subjects.filter((s) => s.pinned);

  const upcoming = useMemo<UpcomingItem[]>(() => {
    const items: UpcomingItem[] = [];
    for (const subject of subjects) {
      const assignments = assignmentsBySubject[subject.id] ?? [];
      for (const a of assignments) {
        if (a.done) continue;
        const due = formatDue(a.due);
        items.push({
          id: a.id,
          title: a.title,
          subjectName: subject.name,
          weightPercent: a.weightPercent,
          icon: subject.icon,
          color: subject.color,
          due: due.label,
          urgency: due.urgency,
        });
      }
    }
    return items
      .sort((a, b) => (a.due === b.due ? 0 : a.due < b.due ? -1 : 1))
      .slice(0, 5);
  }, [subjects, assignmentsBySubject]);

  return (
    <section className="page">
      <div className="eyebrow">Welcome</div>
      <h1 className="page-title">Welcome back, Guest</h1>
      <p className="page-sub">Here's your academic overview. Create a subject to get started.</p>

      <QuickActions onAction={onQuickAction} />

      <div className="dash-grid">
        <div className="dash-col-main">
          <RecentNotes
            notes={notes.slice(0, 5)}
            onSelect={onOpenNote}
            onViewAll={() => onNavigate("notes")}
          />
          <div style={{ height: 18 }} />
          <ActiveSubjects
            subjects={pinned.length > 0 ? pinned : subjects.slice(0, 4)}
            onSelect={(id) => onOpenSubject(id)}
            onViewAll={() => onNavigate("library")}
          />
        </div>
        <div className="dash-col-side">
          <UpcomingPanel
            items={upcoming}
            onSelect={(item) => {
              const subject = subjects.find((s) => s.name === item.subjectName);
              if (subject) onOpenSubject(subject.id, "assignments");
            }}
            onViewAll={() => onNavigate("library")}
          />
          <GradesPanel
            subjects={subjects}
            onSelect={(id) => onOpenSubject(id, "grades")}
            onViewAll={() => onNavigate("grades")}
          />
        </div>
      </div>
    </section>
  );
}
