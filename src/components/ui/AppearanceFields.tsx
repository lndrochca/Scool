import type { IconName } from "../../types";
import { SEMESTER_OPTIONS } from "../../types";
import { IconPicker } from "./IconPicker";
import { ColorPicker } from "./ColorPicker";
import { subjectColorVars } from "../../utils/color";
import "./AppearanceFields.css";

interface AppearanceFieldsProps {
  icon: IconName;
  color: string;
  semester: string; // "" = Unassigned
  onIconChange: (icon: IconName) => void;
  onColorChange: (hex: string) => void;
  onSemesterChange: (semester: string) => void;
  compact?: boolean;
}

export function AppearanceFields({
  icon,
  color,
  semester,
  onIconChange,
  onColorChange,
  onSemesterChange,
  compact,
}: AppearanceFieldsProps) {
  return (
    <div className={`appearance-fields ${compact ? "appearance-fields--compact" : ""}`}>
      <div className="appearance-field">
        <label className="appearance-field-label">Icon</label>
        <IconPicker value={icon} onChange={onIconChange} swatchStyle={subjectColorVars(color) as React.CSSProperties} />
      </div>
      <div className="appearance-field">
        <label className="appearance-field-label">Color</label>
        <ColorPicker value={color} onChange={onColorChange} />
      </div>
      <div className="appearance-field">
        <label className="appearance-field-label">Assign to</label>
        <select
          className="appearance-semester-select"
          value={semester}
          onChange={(e) => onSemesterChange(e.target.value)}
          aria-label="Assign to semester"
        >
          <option value="">Unassigned</option>
          {SEMESTER_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
