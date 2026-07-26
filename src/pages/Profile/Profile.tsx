import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { CheckIcon, PencilIcon } from "../../components/icons";
import "../shared/page.css";
import "../shared/settings-common.css";
import "../../components/RecentNotes.css";
import "../../components/UpcomingPanel.css";
import "./Profile.css";

export function Profile() {
  const { subjects, notes } = useAppData();

  // No account exists yet — Guest Mode. A display name is optional and local-only
  // until authentication is implemented; nothing here is a preset fake identity.
  const [name, setName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);

  const displayName = name.trim() || "Guest";
  const initials = name.trim()
    ? name.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "G";

  return (
    <section className="page settings-page">
      <div className="eyebrow">Profile</div>
      <h1 className="page-title">Your profile</h1>
      <p className="page-sub">You're using Scool as a guest. Set a local display name if you'd like — it'll be replaced automatically once sign-in is available.</p>

      <div className="settings-grid">
        <div className="settings-col-main">
          <div className="card panel settings-panel">
            <div className="panel-head">
              <h3>Profile</h3>
              {!editingProfile ? (
                <button className="settings-edit-btn" onClick={() => setEditingProfile(true)}>
                  <PencilIcon /> Edit
                </button>
              ) : (
                <button className="settings-edit-btn settings-edit-btn--done" onClick={() => setEditingProfile(false)}>
                  <CheckIcon /> Done
                </button>
              )}
            </div>
            <div className="settings-profile">
              <div className="settings-avatar">{initials}</div>
              <div className="settings-profile-fields">
                {editingProfile ? (
                  <input
                    className="settings-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Display name (optional)"
                  />
                ) : (
                  <>
                    <div className="settings-profile-name">{displayName}</div>
                    <div className="settings-profile-email">Guest account — no email on file</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-col-side">
          <div className="card panel-tight settings-panel">
            <div className="panel-head" style={{ padding: "16px 16px 8px 16px" }}>
              <h3>Overview</h3>
            </div>
            <ul className="settings-stats">
              <li>
                <span>Subjects</span>
                <strong>{subjects.length}</strong>
              </li>
              <li>
                <span>Notes</span>
                <strong>{notes.length}</strong>
              </li>
              <li>
                <span>Plan</span>
                <strong>Guest — Local storage</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
