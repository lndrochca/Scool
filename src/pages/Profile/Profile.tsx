import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { CheckIcon, CloudCheckIcon, LockIcon, LogOutIcon, PencilIcon } from "../../components/ui/icons";
import "../shared/page.css";
import "../shared/settings-common.css";
import "../../components/dashboard/RecentNotes.css";
import "../../components/dashboard/UpcomingPanel.css";
import "./Profile.css";

export function Profile() {
  const { subjects, notes } = useAppData();
  const { user, isGuest, signOut, updateName } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);

  useEffect(() => setName(user?.name ?? ""), [user]);

  const initials = user
    ? user.name.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "U"
    : "G";

  const handleDone = async () => {
    if (user && name.trim() && name.trim() !== user.name) {
      setSavingName(true);
      await updateName(name.trim());
      setSavingName(false);
    }
    setEditingProfile(false);
  };

  return (
    <section className="page settings-page">
      <div className="eyebrow">Profile</div>
      <h1 className="page-title">Your profile</h1>
      <p className="page-sub">
        {isGuest
          ? "You're exploring Scool as a guest. Sign in to save your data permanently and sync across devices."
          : "Manage your account and see how your data is stored."}
      </p>

      <div className="settings-grid">
        <div className="settings-col-main">
          {isGuest ? (
            <div className="card panel settings-panel guest-hero">
              <div className="guest-hero-icon">
                <LockIcon />
              </div>
              <h3 className="guest-hero-title">You're in Guest Mode</h3>
              <p className="guest-hero-sub">
                Everything you create — subjects, notes, grades, flashcards — is saved locally in this browser only. It won't
                sync to other devices, and it can be lost if you clear your browser data. Sign in for free to keep it
                permanently.
              </p>
              <ul className="guest-hero-list">
                <li>Explore every feature, no account required</li>
                <li>Sign in any time — nothing you've made as a guest is lost</li>
                <li>Free accounts sync across all your devices</li>
              </ul>
              <p className="guest-hero-sub" style={{ marginTop: 4 }}>
                Sign out and choose "Sign In" from the welcome screen to create an account.
              </p>
            </div>
          ) : (
            <div className="card panel settings-panel">
              <div className="panel-head">
                <h3>Profile</h3>
                {!editingProfile ? (
                  <button className="settings-edit-btn" onClick={() => setEditingProfile(true)}>
                    <PencilIcon /> Edit
                  </button>
                ) : (
                  <button className="settings-edit-btn settings-edit-btn--done" onClick={handleDone} disabled={savingName}>
                    <CheckIcon /> {savingName ? "Saving…" : "Done"}
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
                      placeholder="Display name"
                    />
                  ) : (
                    <>
                      <div className="settings-profile-name">{user!.name}</div>
                      <div className="settings-profile-email">{user!.email}</div>
                    </>
                  )}
                </div>
              </div>
              <button
                className="settings-signout"
                disabled={signOutBusy}
                onClick={async () => {
                  setSignOutBusy(true);
                  await signOut();
                  setSignOutBusy(false);
                }}
              >
                <LogOutIcon /> {signOutBusy ? "Signing out…" : "Log out"}
              </button>
            </div>
          )}
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
                <span>Storage</span>
                <strong className={isGuest ? "stat-guest" : "stat-synced"}>
                  {isGuest ? "This device only" : (<><CloudCheckIcon /> Synced</>)}
                </strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
