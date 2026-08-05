import { useAuth } from "../context/AuthContext";
import { CloudCheckIcon, XIcon } from "./icons";
import "./GuestPromptModal.css";

export function GuestPromptModal() {
  const { guestPrompt, dismissGuestPrompt, openAuthModal } = useAuth();

  if (!guestPrompt.open) return null;

  return (
    <div className="guest-prompt" role="status">
      <button className="guest-prompt-close" onClick={dismissGuestPrompt} aria-label="Dismiss">
        <XIcon />
      </button>
      <div className="guest-prompt-icon">
        <CloudCheckIcon />
      </div>
      <div className="guest-prompt-body">
        <h3 className="guest-prompt-title">Saved locally as a guest</h3>
        <p className="guest-prompt-sub">
          This only lives on this device. Sign in free to keep it permanently and sync across devices.
        </p>
        <div className="guest-prompt-actions">
          <button
            className="guest-prompt-signin"
            onClick={() => {
              dismissGuestPrompt();
              openAuthModal("sign-up", "save");
            }}
          >
            Sign in to save
          </button>
          <button className="guest-prompt-dismiss" onClick={dismissGuestPrompt}>
            Keep exploring
          </button>
        </div>
      </div>
    </div>
  );
}
