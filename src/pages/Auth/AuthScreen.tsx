import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import DriftWall, { type DriftWallItem } from "../../components/carousel/DriftWall";
import {
  AlertIcon,
  CalculatorIcon,
  CalendarIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  FlashcardIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  NotebookIcon,
  SparkleIcon,
  SpinnerIcon,
  SubjectQuickIcon,
  UserIcon,
} from "../../components/ui/icons";
import "./AuthScreen.css";

type Mode = "sign-in" | "sign-up" | "reset";

interface FeatureSlide {
  key: string;
  title: string;
  description: string;
  icon: ReactNode;
  preview: ReactNode;
}

// ambient background tiles for the drift wall — decorative only
const WALL_ITEMS: DriftWallItem[] = [
  1050, 1074, 1062, 1080, 1084, 1069, 1043, 1015, 1044, 1039, 1025, 133, 110, 106, 164,
].map((id) => ({ image: `https://picsum.photos/id/${id}/500/700` }));

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="fp-bar-track">
      <div className="fp-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

const FEATURES: FeatureSlide[] = [
  {
    key: "grades",
    title: "Grade Calculator",
    description: "Build weighted grade trees per subject and see your projected grade update instantly.",
    icon: <CalculatorIcon />,
    preview: (
      <div className="fp-card fp-grades">
        <div className="fp-grades-ring">
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" className="fp-ring-track" />
            <circle cx="20" cy="20" r="16" className="fp-ring-fill" />
          </svg>
          <span>91%</span>
        </div>
        <div className="fp-grades-rows">
          <MiniBar pct={82} color="#34D399" />
          <MiniBar pct={64} color="#5B9DF9" />
          <MiniBar pct={95} color="#FBBF24" />
        </div>
      </div>
    ),
  },
  {
    key: "assistant",
    title: "AI Study Assistant",
    description: "Paste notes or a topic and get structured summaries, key concepts, and definitions in seconds.",
    icon: <SparkleIcon />,
    preview: (
      <div className="fp-card fp-assistant">
        <div className="fp-chat-bubble fp-chat-user">Explain photosynthesis</div>
        <div className="fp-chat-bubble fp-chat-ai">
          <span className="fp-typing"><i /><i /><i /></span>
        </div>
      </div>
    ),
  },
  {
    key: "flashcards",
    title: "Flashcards",
    description: "Turn any note into a flashcard set and drill through it with a tap-to-flip study mode.",
    icon: <FlashcardIcon />,
    preview: (
      <div className="fp-card fp-flash">
        <div className="fp-flash-stack">
          <div className="fp-flash-card fp-flash-back" />
          <div className="fp-flash-card fp-flash-front">
            <span>What is mitochondria?</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "notes",
    title: "Notes",
    description: "Generate organized notes from pasted text, an explanation, or an upload — then keep them forever.",
    icon: <NotebookIcon />,
    preview: (
      <div className="fp-card fp-notes">
        <div className="fp-note-line fp-note-line--title" />
        <div className="fp-note-line" />
        <div className="fp-note-line" />
        <div className="fp-note-line fp-note-line--short" />
      </div>
    ),
  },
  {
    key: "library",
    title: "Library",
    description: "Every book, PDF, note, and reference lives in one organized hub with semesters, colors, and icons.",
    icon: <SubjectQuickIcon />,
    preview: (
      <div className="fp-card fp-library">
        {["#6366F1", "#F97316", "#10B981", "#EC4899"].map((c) => (
          <div className="fp-book" style={{ background: c }} key={c} />
        ))}
      </div>
    ),
  },
  {
    key: "calendar",
    title: "Calendar",
    description: "A monthly view, daily agenda, and activity timeline in one place — everything due, when it's due.",
    icon: <CalendarIcon />,
    preview: (
      <div className="fp-card fp-calendar">
        <div className="fp-cal-grid">
          {Array.from({ length: 21 }, (_, i) => (
            <span key={i} className={i === 13 ? "is-marked" : ""} />
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "planner",
    title: "Academic Planner",
    description: "See assignments, exams, and study sessions aggregated across every subject, automatically.",
    icon: <CheckIcon />,
    preview: (
      <div className="fp-card fp-planner">
        <div className="fp-plan-row"><span className="fp-dot" style={{ background: "#F87171" }} />Database Assignment</div>
        <div className="fp-plan-row"><span className="fp-dot" style={{ background: "#5B9DF9" }} />Calculus Notes</div>
        <div className="fp-plan-row"><span className="fp-dot" style={{ background: "#34D399" }} />Study Session · 7 PM</div>
      </div>
    ),
  },
];

const AUTOPLAY_MS = 5200;

export function AuthScreen() {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    continueAsGuest,
    authLoading,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const [slide, setSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlide((i) => (i + 1) % FEATURES.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goToSlide = (i: number) => {
    setSlide(i);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide((cur) => (cur + 1) % FEATURES.length);
    }, AUTOPLAY_MS);
  };

  const active = FEATURES[slide];

  const switchMode = (next: Mode) => {
    setMode(next);
    setFieldError(null);
    setResetSent(false);
    clearAuthError();
  };

  const wallItems = useMemo(() => WALL_ITEMS, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (mode === "reset") {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setFieldError("Enter a valid email address.");
        return;
      }
      const ok = await resetPassword(email);
      if (ok) setResetSent(true);
      return;
    }

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
    <div className="auth-screen">
      <div className="auth-screen-showcase">
        <div className="auth-screen-wall">
          <DriftWall
            items={wallItems}
            columns={5}
            tileWidth={190}
            tileHeight={130}
            gap={16}
            tilt={16}
            turn={-14}
            perspective={1200}
            depth={110}
            speed={30}
            direction="up"
            variance={0.4}
            parallax={0.5}
            lift={50}
            fade={0.62}
            dim={0.32}
            overlayColor="#0A0620"
            radius={16}
            pauseOnHover={false}
          />
        </div>
        <div className="auth-screen-scrim" />

        <div className="auth-screen-brand">
          <span className="auth-screen-mark">S</span>
          <span>Scool</span>
        </div>

        <div className="auth-screen-feature" key={active.key}>
          <div className="feature-icon">{active.icon}</div>
          <h2>{active.title}</h2>
          <p>{active.description}</p>
          <div className="feature-preview-slot">{active.preview}</div>
        </div>

        <div className="auth-screen-controls">
          <button
            type="button"
            className="auth-screen-arrow"
            aria-label="Previous feature"
            onClick={() => goToSlide((slide - 1 + FEATURES.length) % FEATURES.length)}
          >
            ‹
          </button>
          <div className="auth-screen-dots">
            {FEATURES.map((f, i) => (
              <button
                key={f.key}
                type="button"
                className={`auth-screen-dot ${i === slide ? "is-active" : ""}`}
                aria-label={`Show ${f.title}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="auth-screen-arrow"
            aria-label="Next feature"
            onClick={() => goToSlide((slide + 1) % FEATURES.length)}
          >
            ›
          </button>
        </div>
      </div>

      <div className="auth-screen-form-side">
        <div className="auth-screen-card">
          <div className="as-brand-mobile">
            <span className="auth-screen-mark">S</span>
            <span>Scool</span>
          </div>

          {mode === "reset" ? (
            <>
              <h1 className="as-title">Reset your password</h1>
              <p className="as-sub">Enter your email and we'll send you a reset link.</p>
            </>
          ) : (
            <>
              <h1 className="as-title">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1>
              <p className="as-sub">
                {mode === "sign-in"
                  ? "Sign in to sync your subjects, notes, and grades everywhere."
                  : "It's free — save your work permanently and sync across devices."}
              </p>
            </>
          )}

          {resetSent ? (
            <div className="as-success">
              <CheckIcon /> Check your inbox for a reset link.
            </div>
          ) : (
            <form className="as-form" onSubmit={handleSubmit}>
              {mode === "sign-up" && (
                <label className="as-field">
                  <span className="as-field-icon"><UserIcon /></span>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </label>
              )}
              <label className="as-field">
                <span className="as-field-icon"><MailIcon /></span>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              {mode !== "reset" && (
                <label className="as-field">
                  <span className="as-field-icon"><LockIcon /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                    required
                  />
                  <button
                    type="button"
                    className="as-field-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </label>
              )}

              {mode === "sign-in" && (
                <button type="button" className="as-forgot" onClick={() => switchMode("reset")}>
                  Forgot password?
                </button>
              )}

              {errorMessage && (
                <div className="as-error">
                  <AlertIcon />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button className="as-submit" type="submit" disabled={authLoading}>
                {authLoading ? (
                  <>
                    <SpinnerIcon className="as-spinner" />
                    {mode === "sign-in" ? "Signing in…" : mode === "sign-up" ? "Creating account…" : "Sending…"}
                  </>
                ) : mode === "sign-in" ? (
                  "Log in"
                ) : mode === "sign-up" ? (
                  "Create account"
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          )}

          {mode !== "reset" && (
            <>
              <div className="as-divider"><span>or</span></div>
              <button type="button" className="as-google" onClick={() => signInWithGoogle()} disabled={authLoading}>
                <GoogleIcon /> Continue with Google
              </button>
            </>
          )}

          <button type="button" className="as-guest" onClick={continueAsGuest}>
            Continue as Guest
          </button>

          <p className="as-footnote">
            {mode === "reset" ? (
              <button type="button" className="as-link" onClick={() => switchMode("sign-in")}>
                Back to sign in
              </button>
            ) : (
              <>
                {mode === "sign-in" ? "Don't have an account?" : "Already have one?"}{" "}
                <button type="button" className="as-link" onClick={() => switchMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
                  {mode === "sign-in" ? "Create one" : "Sign in"}
                </button>
              </>
            )}
          </p>
          <p className="as-guest-note">Guest data stays on this device only — no cloud sync until you sign in.</p>
        </div>
      </div>
    </div>
  );
}
