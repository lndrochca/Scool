import { useEffect, useRef, useState } from "react";
import type { IconName } from "../../types";
import { SubjectIcon, DotsIcon } from "./icons";
import "./IconPicker.css";

const ALL_ICONS: IconName[] = [
  "general",
  "biology",
  "chemistry",
  "physics",
  "math",
  "calculus",
  "statistics",
  "computer_science",
  "engineering",
  "astronomy",
  "geology",
  "geography",
  "history",
  "english",
  "literature",
  "language",
  "philosophy",
  "psychology",
  "economics",
  "business",
  "law",
  "medicine",
  "art",
  "music",
  "theater",
  "pe",
];

interface IconPickerProps {
  value: IconName;
  onChange: (icon: IconName) => void;
  /** Optional: color the preview swatch to match the subject's chosen color. */
  swatchStyle?: React.CSSProperties;
}

export function IconPicker({ value, onChange, swatchStyle }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="icon-picker" ref={wrapRef}>
      <div className="icon-picker-current" style={swatchStyle}>
        <SubjectIcon name={value} />
      </div>
      <button
        type="button"
        className="icon-picker-more"
        onClick={() => setOpen((v) => !v)}
        aria-label="Choose a different icon"
        aria-expanded={open}
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="icon-picker-popover card">
          <div className="icon-picker-popover-label">Choose an icon</div>
          <div className="icon-picker-grid">
            {ALL_ICONS.map((name) => (
              <button
                key={name}
                type="button"
                className={`icon-picker-cell ${name === value ? "is-selected" : ""}`}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                aria-label={name.replace("_", " ")}
                title={name.replace("_", " ")}
              >
                <SubjectIcon name={name} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
