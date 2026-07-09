import { QuickActions } from "../../components/QuickActions/QuickActions";
import { RecentNotes } from "../../components/RecentNotes/RecentNotes";
import { ActiveSubjects } from "../../components/ActiveSubjects/ActiveSubjects";
import { UpcomingPanel } from "../../components/UpcomingPanel/UpcomingPanel";
import { GradesPanel } from "../../components/GradesPanel/GradesPanel";
import { useAppData } from "../../context/AppDataContext";
import type { PageName } from "../../types";
import "./Dashboard.css";

export function Dashboard({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  const { subjects, notes, profile } = useAppData();
  const pinned = subjects.filter((s) => s.pinned);
  const firstName = profile.name.trim().split(" ")[0] || profile.name;

  return (
    <section className="page">
      <div className="eyebrow">Good Morning</div>
      <h1 className="page-title">Welcome back, {firstName}</h1>
      <p className="page-sub">Here's your academic overview for {profile.semester}.</p>

      <QuickActions onNavigate={onNavigate} />

      <div className="dash-grid">
        <div className="dash-col-main">
          <RecentNotes notes={notes.slice(0, 5)} />
          <div style={{ height: 18 }} />
          <ActiveSubjects subjects={pinned.length > 0 ? pinned : subjects.slice(0, 4)} />
        </div>
        <div className="dash-col-side">
          <UpcomingPanel />
          <GradesPanel subjects={subjects} />
        </div>
      </div>
    </section>
  );
}
