import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, SpinnerIcon, UserIcon, XIcon } from "./icons";
import "./AuthModal.css";

const REASON_COPY: Record<string, { title: string; sub: string }> = {
  manual: { title: "", sub: "" },
  save: { title: "Save your progress", sub: "Sign in to keep what you've created and pick up on any device." },
  sync: { title: "Sync across devices", sub: "Sign in to access your subjects, notes, and grades anywhere." },
  settings: { title: "Sign in to Scool", sub: "Manage your profile and preferences from one account." },
};

export function AuthModal() {
  const { authModal, closeAuthModal, signIn, signUp, authLoading, authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">(authModal.mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (authModal.open) {
      setMode(authModal.mode);
      setFieldError(null);
    }
  }, [authModal.open, authModal.mode]);

  useEffect(() => {
    if (!authModal.open) {
      setName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
    }
  }, [authModal.open]);

  if (!authModal.open) return null;

  const reasonCopy = REASON_COPY[authModal.reason] ?? REASON_COPY.manual;

  const switchMode = (next: "sign-in" | "sign-up") => {
    setMode(next);
    setFieldError(null);
    clearAuthError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setFieldError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "sign-up") {
      await signUp(name, email, password);
    } else {
      await signIn(email, password);
    }
  };

  const errorMessage = fieldError ?? authError;

  return (
    <div className="auth-modal-overlay" onMouseDown={closeAuthModal}>
      <div className="auth-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={closeAuthModal} aria-label="Close">
          <XIcon />
        </button>

        <div className="auth-modal-brand">
          <span className="auth-modal-mark">S</span>
        </div>

        {reasonCopy.title ? (
          <>
            <h2 className="auth-modal-title">{reasonCopy.title}</h2>
            <p className="auth-modal-sub">{reasonCopy.sub}</p>
          </>
        ) : (
          <>
            <h2 className="auth-modal-title">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h2>
            <p className="auth-modal-sub">
              {mode === "sign-in" ? "Sign in to sync your data across devices." : "It's free — save your data permanently and sync everywhere."}
            </p>
          </>
        )}

        <div className="auth-modal-tabs">
          <button className={`auth-modal-tab ${mode === "sign-in" ? "is-active" : ""}`} onClick={() => switchMode("sign-in")} type="button">
            Sign in
          </button>
          <button className={`auth-modal-tab ${mode === "sign-up" ? "is-active" : ""}`} onClick={() => switchMode("sign-up")} type="button">
            Create account
          </button>
        </div>

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {mode === "sign-up" && (
            <label className="auth-field">
              <span className="auth-field-icon"><UserIcon /></span>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label className="auth-field">
            <span className="auth-field-icon"><MailIcon /></span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-field">
            <span className="auth-field-icon"><LockIcon /></span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              required
            />
            <button type="button" className="auth-field-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </label>

          {errorMessage && (
            <div className="auth-error">
              <AlertIcon />
              <span>{errorMessage}</span>
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={authLoading}>
            {authLoading ? (
              <>
                <SpinnerIcon className="auth-spinner" /> {mode === "sign-in" ? "Signing in…" : "Creating account…"}
              </>
            ) : mode === "sign-in" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <button className="auth-modal-guest" onClick={closeAuthModal}>
          Continue as Guest
        </button>
        <p className="auth-modal-footnote">
          Guest data stays on this device only. {mode === "sign-in" ? "Don't have an account?" : "Already have one?"}{" "}
          <button type="button" className="auth-modal-link" onClick={() => switchMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
            {mode === "sign-in" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
