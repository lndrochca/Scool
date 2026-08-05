import { useState } from "react";
import { TopNav } from "./components/nav/TopNav";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Notes } from "./pages/Notes/Notes";
import { Grades } from "./pages/Grades/Grades";
import { Library } from "./pages/Library/Library";
import { Bookshelf } from "./pages/Bookshelf/Bookshelf";
import { Flashcards } from "./pages/Flashcards/Flashcards";
import { SubjectWorkspace } from "./pages/SubjectWorkspace/SubjectWorkspace";
import { Profile } from "./pages/Profile/Profile";
import { Settings } from "./pages/Settings/Settings";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { AuthModal } from "./components/modals/AuthModal";
import { GuestPromptModal } from "./components/modals/GuestPromptModal";
import type { PageName, WorkspaceTabTarget, Note } from "./types";
import type { QuickActionKind } from "./components/dashboard/QuickActions";

export default function App() {
  return (
    <AppDataProvider>
      <NotificationsProvider>
        <AppShell />
        <AuthModal />
        <GuestPromptModal />
      </NotificationsProvider>
    </AppDataProvider>
  );
}

function AppShell() {
  const { subjects } = useAppData();
  const [page, setPage] = useState<PageName>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeSubjectTab, setActiveSubjectTab] = useState<WorkspaceTabTarget | undefined>(undefined);
  const [pendingFlashcardSetId, setPendingFlashcardSetId] = useState<string | null>(null);
  const [autoOpenAddSubject, setAutoOpenAddSubject] = useState(false);
  const [autoOpenNotesComposer, setAutoOpenNotesComposer] = useState(false);
  const [pendingNoteId, setPendingNoteId] = useState<string | null>(null);

  const handleNavigate = (next: PageName) => {
    setPage(next);
    setMobileNavOpen(false);
  };

  const openSubject = (id: string, tab?: WorkspaceTabTarget) => {
    setActiveSubjectId(id);
    setActiveSubjectTab(tab);
    setPage("subject");
    setMobileNavOpen(false);
  };

  const openFlashcardSet = (setId: string) => {
    setPendingFlashcardSetId(setId);
    setPage("flashcards");
    setMobileNavOpen(false);
  };

  const openNote = (note: Note) => {
    if (note.subjectId) {
      openSubject(note.subjectId, "notes");
    } else {
      setPendingNoteId(note.id);
      setPage("notes");
    }
  };

  const handleQuickAction = (kind: QuickActionKind) => {
    if (kind === "new-notes") {
      setAutoOpenNotesComposer(true);
      handleNavigate("notes");
      return;
    }
    if (kind === "add-grades") {
      handleNavigate("grades");
      return;
    }
    if (kind === "new-subject") {
      setAutoOpenAddSubject(true);
      handleNavigate("library");
      return;
    }
    if (kind === "upload-file") {
      if (subjects.length === 1) {
        openSubject(subjects[0].id, "files");
      } else if (subjects.length === 0) {
        setAutoOpenAddSubject(true);
        handleNavigate("library");
      } else {
        handleNavigate("library");
      }
    }
  };

  const navForTopNav: PageName = page === "subject" ? "library" : page;

  return (
    <>
      <TopNav
        current={navForTopNav}
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
        onToggleMobile={() => setMobileNavOpen((v) => !v)}
      />
      {page === "dashboard" && (
        <Dashboard
          onNavigate={handleNavigate}
          onQuickAction={handleQuickAction}
          onOpenSubject={openSubject}
          onOpenNote={openNote}
        />
      )}
      {page === "notes" && (
        <Notes
          onOpenFlashcards={openFlashcardSet}
          autoOpenComposer={autoOpenNotesComposer}
          onAutoOpenConsumed={() => setAutoOpenNotesComposer(false)}
          initialNoteId={pendingNoteId}
          onInitialNoteConsumed={() => setPendingNoteId(null)}
        />
      )}
      {page === "grades" && <Grades />}
      {page === "library" && (
        <Library
          onOpenSubject={openSubject}
          autoOpenAdd={autoOpenAddSubject}
          onAutoOpenConsumed={() => setAutoOpenAddSubject(false)}
        />
      )}
      {page === "bookshelf" && <Bookshelf onOpenSubject={openSubject} />}
      {page === "flashcards" && (
        <Flashcards
          initialSetId={pendingFlashcardSetId}
          onInitialConsumed={() => setPendingFlashcardSetId(null)}
        />
      )}
      {page === "subject" && activeSubjectId && (
        <SubjectWorkspace
          subjectId={activeSubjectId}
          onBack={() => setPage("library")}
          onOpenFlashcards={openFlashcardSet}
          initialTab={activeSubjectTab}
          onInitialTabConsumed={() => setActiveSubjectTab(undefined)}
        />
      )}
      {page === "profile" && <Profile />}
      {page === "settings" && <Settings />}
    </>
  );
}
