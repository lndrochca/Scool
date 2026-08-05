import { useEffect, useState } from "react";
import { BOOK_COLOR_PRESETS, normalizeHex } from "../../utils/color";
import { CheckIcon } from "./icons";
import "./ColorPicker.css";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [draft, setDraft] = useState(value.replace(/^#/, ""));

  useEffect(() => setDraft(value.replace(/^#/, "")), [value]);

  const commit = (raw: string) => {
    const normalized = normalizeHex("#" + raw);
    if (normalized) onChange(normalized);
  };

  return (
    <div className="color-picker">
      <div className="color-picker-swatches">
        {BOOK_COLOR_PRESETS.map((hex) => (
          <button
            key={hex}
            type="button"
            className="color-swatch"
            style={{ background: hex }}
            aria-label={hex}
            onClick={() => onChange(hex)}
          >
            {value.toLowerCase() === hex.toLowerCase() && <CheckIcon className="color-swatch-check" />}
          </button>
        ))}

        <label className="color-swatch color-swatch--custom" aria-label="Custom color">
          {!BOOK_COLOR_PRESETS.some((p) => p.toLowerCase() === value.toLowerCase()) && (
            <span className="color-swatch-custom-fill" style={{ background: value }}>
              <CheckIcon className="color-swatch-check" />
            </span>
          )}
          <input
            type="color"
            className="color-swatch-native-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Pick a custom color"
          />
        </label>
      </div>

      <div className="color-picker-hex">
        <span className="color-picker-hex-hash">#</span>
        <input
          className="color-picker-hex-input"
          value={draft}
          maxLength={6}
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => e.key === "Enter" && commit(draft)}
          aria-label="Color hex code"
        />
      </div>
    </div>
  );
}
