import type { NoteSection } from "../../types";
import { PlusIcon, TrashIcon } from "../ui/icons";
import "./NoteEditor.css";

let uid = 0;
function id() {
  uid += 1;
  return `ne${Date.now().toString(36)}${uid}`;
}

interface Props {
  sections: NoteSection[];
  onChange: (sections: NoteSection[]) => void;
}

export function NoteEditor({ sections, onChange }: Props) {
  const updateHeading = (sid: string, heading: string) => {
    onChange(sections.map((s) => (s.id === sid ? { ...s, heading } : s)));
  };
  const updateBullet = (sid: string, idx: number, text: string) => {
    onChange(
      sections.map((s) =>
        s.id === sid ? { ...s, bullets: s.bullets.map((b, i) => (i === idx ? text : b)) } : s
      )
    );
  };
  const deleteBullet = (sid: string, idx: number) => {
    onChange(sections.map((s) => (s.id === sid ? { ...s, bullets: s.bullets.filter((_, i) => i !== idx) } : s)));
  };
  const addBullet = (sid: string) => {
    onChange(sections.map((s) => (s.id === sid ? { ...s, bullets: [...s.bullets, ""] } : s)));
  };
  const deleteSection = (sid: string) => {
    onChange(sections.filter((s) => s.id !== sid));
  };
  const addSection = () => {
    onChange([...sections, { id: id(), kind: "custom", heading: "New Section", bullets: [""] }]);
  };

  return (
    <div className="note-editor">
      {sections.map((s) => (
        <div className="card note-editor-section" key={s.id}>
          <div className="note-editor-head">
            <input
              className="note-editor-heading"
              value={s.heading}
              onChange={(e) => updateHeading(s.id, e.target.value)}
            />
            <button className="icon-btn" onClick={() => deleteSection(s.id)} aria-label="Delete section">
              <TrashIcon />
            </button>
          </div>
          <ul className="note-editor-bullets">
            {s.bullets.map((b, i) => (
              <li key={i} className="note-editor-bullet-row">
                <span className="note-editor-dot" />
                <textarea
                  value={b}
                  rows={1}
                  onChange={(e) => updateBullet(s.id, i, e.target.value)}
                />
                <button className="icon-btn" onClick={() => deleteBullet(s.id, i)} aria-label="Delete bullet">
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
          <button className="note-editor-add" onClick={() => addBullet(s.id)}>
            <PlusIcon /> Add point
          </button>
        </div>
      ))}
      <button className="btn-ghost" onClick={addSection}>
        <PlusIcon /> Add Section
      </button>
    </div>
  );
}
