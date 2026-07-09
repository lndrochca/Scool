import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { CheckIcon, PencilIcon } from "../../components/icons";
import "./Profile.css";

export function Profile() {
  const { subjects, profile, updateProfile } = useAppData();
  const [editing, setEditing] = useState(false);

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="page profile-page">
      <div className="eyebrow">Profile</div>
      <h1 className="page-title">Your info</h1>
      <p className="page-sub">Name, contact, and semester — used across your dashboard and workspaces.</p>

      <div className="profile-grid">
        <div className="card panel profile-panel">
          <div className="panel-head">
            <h3>Personal details</h3>
            {!editing ? (
              <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                <PencilIcon /> Edit
              </button>
            ) : (
              <button className="profile-edit-btn profile-edit-btn--done" onClick={() => setEditing(false)}>
                <CheckIcon /> Done
              </button>
            )}
          </div>

          <div className="profile-identity">
            <div className="profile-avatar">{initials || "?"}</div>
            <div className="profile-identity-fields">
              {editing ? (
                <>
                  <input
                    className="profile-input"
                    value={profile.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    placeholder="Full name"
                  />
                  <input
                    className="profile-input"
                    value={profile.email}
                    onChange={(e) => updateProfile({ email: e.target.value })}
                    placeholder="Email"
                  />
                </>
              ) : (
                <>
                  <div className="profile-name">{profile.name}</div>
                  <div className="profile-email">{profile.email}</div>
                </>
              )}
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-row">
            <div className="profile-row-text">
              <div className="profile-row-label">Current semester</div>
              <div className="profile-row-desc">Used across your dashboard and workspaces</div>
            </div>
            <select
              className="profile-select"
              value={profile.semester}
              onChange={(e) => updateProfile({ semester: e.target.value })}
            >
              <option>Fall 2026</option>
              <option>Spring 2026</option>
              <option>Summer 2026</option>
              <option>Fall 2025</option>
            </select>
          </div>
        </div>

        <div className="card panel-tight profile-panel">
          <div className="panel-head" style={{ padding: "16px 16px 8px 16px" }}>
            <h3>Overview</h3>
          </div>
          <ul className="profile-stats">
            <li>
              <span>Subjects</span>
              <strong>{subjects.length}</strong>
            </li>
            <li>
              <span>Semester</span>
              <strong>{profile.semester}</strong>
            </li>
            <li>
              <span>Plan</span>
              <strong>Student — Free</strong>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
