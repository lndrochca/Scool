import { useState } from "react";
import { TopNav } from "./components/TopNav/TopNav";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Notes } from "./pages/Notes/Notes";
import { Grades } from "./pages/Grades/Grades";
import { Library } from "./pages/Library/Library";
import { Bookshelf } from "./pages/Bookshelf/Bookshelf";
import { Flashcards } from "./pages/Flashcards/Flashcards";
import { SubjectWorkspace } from "./pages/SubjectWorkspace/SubjectWorkspace";
import { Settings } from "./pages/Settings/Settings";
import { Profile } from "./pages/Profile/Profile";
import { AppDataProvider } from "./context/AppDataContext";
import type { PageName } from "./types";

export default function App() {
  const [page, setPage] = useState<PageName>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const handleNavigate = (next: PageName) => {
    setPage(next);
    setMobileNavOpen(false);
  };

  const openSubject = (id: string) => {
    setActiveSubjectId(id);
    setPage("subject");
    setMobileNavOpen(false);
  };

  const navForTopNav: PageName = page === "subject" ? "library" : page;

  return (
    <AppDataProvider>
      <TopNav
        current={navForTopNav}
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
        onToggleMobile={() => setMobileNavOpen((v) => !v)}
      />
      {page === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
      {page === "notes" && <Notes />}
      {page === "grades" && <Grades />}
      {page === "library" && <Library onOpenSubject={openSubject} />}
      {page === "bookshelf" && <Bookshelf onOpenSubject={openSubject} />}
      {page === "flashcards" && <Flashcards />}
      {page === "subject" && activeSubjectId && (
        <SubjectWorkspace subjectId={activeSubjectId} onBack={() => setPage("library")} />
      )}
      {page === "settings" && <Settings />}
      {page === "profile" && <Profile />}
    </AppDataProvider>
  );
}
