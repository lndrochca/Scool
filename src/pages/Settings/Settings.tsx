import { useEffect, useState } from "react";
import { CheckIcon, CloudCheckIcon, DeviceIcon, LaptopIcon, LogOutIcon, MoonIcon, SunIcon } from "../../components/ui/icons";
import { useAuth } from "../../context/AuthContext";
import { useTheme, isValidHex } from "../../context/ThemeContext";
import { useAppData } from "../../context/AppDataContext";
import "../shared/page.css";
import "../shared/settings-common.css";
import "../../components/dashboard/RecentNotes.css";
import "../../components/dashboard/UpcomingPanel.css";
import "./Settings.css";

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-desc">{description}</div>
      </div>
      <button
        className={`switch ${value ? "is-on" : ""}`}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        <span className="switch-knob" />
      </button>
    </div>
  );
}

const ACCENT_PRESETS = ["#3B82F6", "#6366F1", "#10B981", "#F97316", "#EC4899", "#111113"];

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function Settings() {
  const { mode, setMode, accent, setAccent } = useTheme();
  const { user, isGuest, openAuthModal, signOut } = useAuth();
  const appData = useAppData();

  const [hexDraft, setHexDraft] = useState(accent);
  const [hexError, setHexError] = useState(false);

  useEffect(() => setHexDraft(accent), [accent]);

  const [emailReminders, setEmailReminders] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  const [compactCards, setCompactCards] = useState(false);
  const [autoSaveNotes, setAutoSaveNotes] = useState(true);
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [cleared, setCleared] = useState(false);

  const commitHex = (value: string) => {
    setHexDraft(value);
    if (isValidHex(value)) {
      setHexError(false);
      setAccent(value);
    } else {
      setHexError(true);
    }
  };

  const handleExport = () => {
    downloadJSON(`scool-export-${new Date().toISOString().slice(0, 10)}.json`, {
      exportedAt: new Date().toISOString(),
      account: user ? { name: user.name, email: user.email } : "guest",
      subjects: appData.subjects,
      notes: appData.notes,
      gradesBySubject: appData.gradesBySubject,
      filesBySubject: appData.filesBySubject,
      assignmentsBySubject: appData.assignmentsBySubject,
      resourcesBySubject: appData.resourcesBySubject,
      flashcardSets: appData.flashcardSets,
    });
  };

  const handleClearLocal = () => {
    if (!window.confirm("This removes everything stored on this device. This can't be undone. Continue?")) return;
    appData.clearAllData();
    setCleared(true);
  };

  return (
    <section className="page settings-page">
      <div className="eyebrow">Settings</div>
      <h1 className="page-title">Customize Scool</h1>
      <p className="page-sub">Notifications, appearance, and account preferences.</p>

      <div className="settings-grid">
        <div className="settings-col-main">
          {/* Notifications */}
          <div className="card panel settings-panel">
            <div className="panel-head">
              <h3>Notifications</h3>
            </div>
            <ToggleRow
              label="Email reminders"
              description="Get a heads-up before assignments are due"
              value={emailReminders}
              onChange={setEmailReminders}
            />
            <ToggleRow
              label="Deadline alerts"
              description="In-app alerts for tasks due within 48 hours"
              value={deadlineAlerts}
              onChange={setDeadlineAlerts}
            />
            <ToggleRow
              label="Weekly digest"
              description="A Sunday summary of grades and upcoming work"
              value={weeklyDigest}
              onChange={setWeeklyDigest}
            />
            <ToggleRow
              label="AI suggestions"
              description="Let Scool suggest notes and study actions"
              value={aiSuggestions}
              onChange={setAiSuggestions}
            />
            {isGuest && (
              <p className="settings-inline-note">
                Notification preferences need an account to actually deliver anything —{" "}
                <button className="settings-inline-link" onClick={() => openAuthModal("sign-up", "settings")}>sign in</button> to turn these on.
              </p>
            )}
          </div>

          {/* Appearance */}
          <div className="card panel settings-panel">
            <div className="panel-head">
              <h3>Appearance</h3>
            </div>

            <div className="settings-row settings-row--theme">
              <div className="settings-row-text">
                <div className="settings-row-label">Theme</div>
                <div className="settings-row-desc">Choose a light or dark interface, or match your system</div>
              </div>
              <div className="theme-segmented">
                <button className={`theme-segment ${mode === "light" ? "is-active" : ""}`} onClick={() => setMode("light")}>
                  <SunIcon /> Light
                </button>
                <button className={`theme-segment ${mode === "dark" ? "is-active" : ""}`} onClick={() => setMode("dark")}>
                  <MoonIcon /> Dark
                </button>
                <button className={`theme-segment ${mode === "system" ? "is-active" : ""}`} onClick={() => setMode("system")}>
                  <LaptopIcon /> System
                </button>
              </div>
            </div>

            <div className="settings-row settings-row--accent">
              <div className="settings-row-text">
                <div className="settings-row-label">Accent color</div>
                <div className="settings-row-desc">Applied to buttons, links, progress bars, and highlights across the app</div>
              </div>
              <div className="accent-picker">
                <div className="accent-picker-presets">
                  {ACCENT_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      className={`accent-swatch ${accent.toLowerCase() === hex.toLowerCase() ? "is-active" : ""}`}
                      style={{ background: hex }}
                      aria-label={hex}
                      onClick={() => commitHex(hex)}
                    >
                      {accent.toLowerCase() === hex.toLowerCase() && <CheckIcon />}
                    </button>
                  ))}
                </div>
                <div className={`accent-hex-field ${hexError ? "has-error" : ""}`}>
                  <input
                    type="color"
                    className="accent-color-input"
                    value={isValidHex(hexDraft) ? hexDraft : accent}
                    onChange={(e) => commitHex(e.target.value)}
                    aria-label="Pick accent color"
                  />
                  <input
                    type="text"
                    className="accent-hex-input"
                    value={hexDraft}
                    onChange={(e) => commitHex(e.target.value)}
                    spellCheck={false}
                    maxLength={7}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
            {hexError && <p className="accent-hex-error">Enter a valid hex color, like #3B82F6.</p>}

            <ToggleRow
              label="Compact cards"
              description="Show more content with tighter spacing"
              value={compactCards}
              onChange={setCompactCards}
            />
            <ToggleRow
              label="Auto-save notes"
              description="Save edits to AI-generated notes as you type"
              value={autoSaveNotes}
              onChange={setAutoSaveNotes}
            />
          </div>
        </div>

        <div className="settings-col-side">
          <div className="card panel-tight settings-panel">
            <div className="panel-head" style={{ padding: "16px 16px 8px 16px" }}>
              <h3>Account</h3>
            </div>
            <div className="settings-row" style={{ padding: "0 16px 12px" }}>
              <div className="settings-row-text">
                <div className={`settings-status-pill ${isGuest ? "is-guest" : "is-active"}`}>
                  {isGuest ? "Guest Mode" : <><CloudCheckIcon /> Signed in</>}
                </div>
                {isGuest ? (
                  <div className="settings-row-desc" style={{ marginTop: 8 }}>
                    You're exploring Scool as a guest. Everything you create is saved on this device only — sign in to keep it
                    permanently and sync it across your devices.
                  </div>
                ) : (
                  <div className="settings-row-desc" style={{ marginTop: 8 }}>
                    Signed in as <strong style={{ color: "var(--text)" }}>{user!.name}</strong> ({user!.email}). Your data syncs to
                    this account automatically.
                  </div>
                )}
              </div>
            </div>
            <div className="settings-actions">
              {isGuest ? (
                <button className="settings-action settings-action--primary" onClick={() => openAuthModal("sign-up", "settings")}>
                  Sign In / Create Account
                </button>
              ) : (
                <button
                  className="settings-action"
                  disabled={signOutBusy}
                  onClick={async () => {
                    setSignOutBusy(true);
                    await signOut();
                    setSignOutBusy(false);
                  }}
                >
                  <LogOutIcon /> {signOutBusy ? "Signing out…" : "Log out"}
                </button>
              )}
              <button className="settings-action" onClick={handleExport}>
                <DeviceIcon /> Export my data
              </button>
              <button className="settings-action settings-action--danger" onClick={handleClearLocal}>
                Clear local data
              </button>
              {cleared && <p className="settings-row-desc" style={{ padding: "0 4px" }}>Local data cleared.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
