import type { ReactElement } from "react";
import type { PageName } from "../../types";
import { FlashcardIcon, MenuIcon, SettingsIcon, UserIcon } from "../ui/icons";
import { useAuth } from "../../context/AuthContext";
import { NotificationBell } from "./NotificationBell";
import "./TopNav.css";

const NAV_ITEMS: { key: PageName; label: string; icon: ReactElement }[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="9" rx="2" />
        <rect x="14" y="3" width="7" height="5" rx="2" />
        <rect x="14" y="12" width="7" height="9" rx="2" />
        <rect x="3" y="16" width="7" height="5" rx="2" />
      </svg>
    ),
  },
  {
    key: "notes",
    label: "Notes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14 3v5a1 1 0 0 0 1 1h5" />
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      </svg>
    ),
  },
  {
    key: "grades",
    label: "Grades",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </svg>
    ),
  },
  {
    key: "library",
    label: "Library",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    key: "bookshelf",
    label: "Bookshelf",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 20V6a2 2 0 0 1 2-2h2v16" />
        <path d="M10 20V4h4l2 16" />
        <path d="M17 20V7l3 .6V20" />
      </svg>
    ),
  },
  {
    key: "flashcards",
    label: "Flashcards",
    icon: <FlashcardIcon />,
  },
];

interface TopNavProps {
  current: PageName;
  onNavigate: (page: PageName) => void;
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export function TopNav({ current, onNavigate, mobileOpen, onToggleMobile }: TopNavProps) {
  const { user, isGuest } = useAuth();

  const initials = user
    ? user.name.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "U"
    : "G";

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <div className="topnav-brand">
          <span className="topnav-mark">S</span>
          <span className="topnav-word">Scool</span>
        </div>

        <nav className={`topnav-links ${mobileOpen ? "is-open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`topnav-link ${current === item.key ? "active" : ""}`}
              onClick={() => onNavigate(item.key)}
            >
              <span className="topnav-link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="topnav-right">
          {isGuest && (
            <button className="guest-badge" onClick={() => onNavigate("profile")} title="You're browsing as a guest — sign in to save your data">
              <span className="guest-badge-dot" />
              Guest
            </button>
          )}
          <NotificationBell />
          <button
            className={`topnav-link settings-link ${current === "profile" ? "active" : ""}`}
            onClick={() => onNavigate("profile")}
          >
            <UserIcon className="topnav-link-icon" />
            <span className="settings-label">Profile</span>
          </button>
          <button
            className={`topnav-link settings-link ${current === "settings" ? "active" : ""}`}
            onClick={() => onNavigate("settings")}
          >
            <SettingsIcon className="topnav-link-icon" />
            <span className="settings-label">Settings</span>
          </button>
          <button
            className={`avatar avatar-btn ${isGuest ? "avatar--guest" : ""}`}
            aria-label={isGuest ? "Open profile (Guest)" : `Open profile (${user!.name})`}
            onClick={() => onNavigate("profile")}
          >
            {initials}
          </button>
          <button className="menu-btn" aria-label="Toggle menu" onClick={onToggleMobile}>
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
