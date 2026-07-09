import { useState } from "react";
import { CheckIcon } from "../../components/icons";
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

const ACCENTS: { key: "green" | "orange" | "tan" | "red" | "amber"; label: string }[] = [
  { key: "green", label: "Sage" },
  { key: "orange", label: "Clay" },
  { key: "tan", label: "Tan" },
  { key: "amber", label: "Amber" },
  { key: "red", label: "Brick" },
];

export function Settings() {
  const [accent, setAccent] = useState<"green" | "orange" | "tan" | "red" | "amber">("green");

  const [emailReminders, setEmailReminders] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  const [compactCards, setCompactCards] = useState(false);
  const [autoSaveNotes, setAutoSaveNotes] = useState(true);

  return (
    <section className="page settings-page">
      <div className="eyebrow">Settings</div>
      <h1 className="page-title">Preferences</h1>
      <p className="page-sub">Notifications, appearance, and account controls. Looking for name or email? That's under Profile.</p>

      <div className="settings-grid">
        <div className="settings-col-main">
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
          </div>

          <div className="card panel settings-panel">
            <div className="panel-head">
              <h3>Appearance</h3>
            </div>
            <div className="settings-row">
              <div className="settings-row-text">
                <div className="settings-row-label">Accent color</div>
                <div className="settings-row-desc">Applied to highlights across the app</div>
              </div>
              <div className="settings-swatches">
                {ACCENTS.map((a) => (
                  <button
                    key={a.key}
                    className={`settings-swatch settings-swatch--${a.key} ${accent === a.key ? "is-active" : ""}`}
                    aria-label={a.label}
                    onClick={() => setAccent(a.key)}
                  >
                    {accent === a.key && <CheckIcon />}
                  </button>
                ))}
              </div>
            </div>
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
            <div className="settings-actions">
              <button className="settings-action">Export my data</button>
              <button className="settings-action">Change password</button>
              <button className="settings-action settings-action--danger">Delete account</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
