import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { parseSyllabus, computeGrade } from "../../data/gradeParser";
import { GradeCalculator } from "../../components/GradeCalculator/GradeCalculator";
import { SparkleIcon, TextPasteIcon, UploadQuickIcon } from "../../components/icons";
import { SubjectIcon } from "../../components/icons";
import type { GradeCategory } from "../../types";
import "./Grades.css";

export function Grades() {
  const { subjects, gradesBySubject, setGradeCategories } = useAppData();
  const [syllabusText, setSyllabusText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [draft, setDraft] = useState<GradeCategory[] | null>(null);
  const [targetSubjectId, setTargetSubjectId] = useState<string>(subjects[0]?.id ?? "");
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const handleExtract = () => {
    setExtracting(true);
    window.setTimeout(() => {
      const categories = parseSyllabus(syllabusText || fileName || "");
      setDraft(categories);
      setExtracting(false);
    }, 650);
  };

  const handleSaveDraft = () => {
    if (!draft || !targetSubjectId) return;
    setGradeCategories(targetSubjectId, draft);
    setDraft(null);
    setSyllabusText("");
    setFileName(null);
    setActiveSubjectId(targetSubjectId);
  };

  const openSubjectCalculator = (id: string) => {
    setActiveSubjectId(id);
    setDraft(null);
  };

  const activeCategories = activeSubjectId ? gradesBySubject[activeSubjectId] ?? [] : null;

  return (
    <section className="page">
      <div className="eyebrow">AI Grade Calculator</div>
      <h1 className="page-title">Know your grade before finals do</h1>
      <p className="page-sub">Upload a syllabus or enter grading info — Scool builds an editable tracker.</p>

      <div className="card grades-composer">
        <div className="grades-composer-row">
          <div className="grades-input-col">
            <label className="grades-label"><TextPasteIcon /> Paste grading criteria</label>
            <textarea
              rows={5}
              placeholder={`e.g.\nExams — 30%\nQuizzes — 20%\nAssignments — 25%\nParticipation — 10%\nFinal Exam — 15%`}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
            />
          </div>
          <div className="grades-input-col grades-input-col--upload">
            <label className="grades-label"><UploadQuickIcon /> Or upload a syllabus</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              id="syllabus-upload"
              style={{ display: "none" }}
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            <button className="btn-ghost" onClick={() => document.getElementById("syllabus-upload")?.click()}>
              <UploadQuickIcon /> Choose file
            </button>
            {fileName && <span className="notes-filename">{fileName}</span>}
          </div>
        </div>
        <button className="btn-solid grades-extract-btn" onClick={handleExtract} disabled={extracting}>
          <SparkleIcon /> {extracting ? "Extracting grading structure…" : "Extract with AI"}
        </button>
      </div>

      {draft && (
        <div className="grades-draft">
          <div className="grades-draft-head">
            <div>
              <span className="chip grades-draft-chip">AI-generated draft</span>
              <p className="page-sub" style={{ margin: "8px 0 0" }}>
                Review and edit the extracted categories before saving — nothing is final yet.
              </p>
            </div>
            <div className="notes-save-row">
              <select
                className="notes-subject-select"
                value={targetSubjectId}
                onChange={(e) => setTargetSubjectId(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button className="btn-solid" onClick={handleSaveDraft} disabled={!targetSubjectId}>
                Save to Subject
              </button>
            </div>
          </div>
          <GradeCalculator categories={draft} onChange={setDraft} />
        </div>
      )}

      <div className="card grades-subjects-panel">
        <div className="panel-head">
          <h3>Your Subjects</h3>
        </div>
        <ul className="grades-subject-list">
          {subjects.map((s) => {
            const cats = gradesBySubject[s.id];
            const summary = cats && cats.length > 0 ? computeGrade(cats) : null;
            return (
              <li key={s.id} className={`grades-subject-row ${activeSubjectId === s.id ? "is-active" : ""}`}>
                <button className="grades-subject-btn" onClick={() => openSubjectCalculator(s.id)}>
                  <span className={`subject-icon subject-icon--${s.color}`}>
                    <SubjectIcon name={s.icon} />
                  </span>
                  <div className="grades-subject-info">
                    <div className="subject-name">{s.name}</div>
                    <div className="note-meta">{cats ? `${cats.length} categories` : "No grade data yet"}</div>
                  </div>
                  <div className="grades-subject-pct">
                    {summary ? `${summary.current}% · ${summary.letter}` : "—"}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {activeCategories && (
        <div className="grades-draft">
          <div className="grades-draft-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Editing</div>
              <h3 style={{ fontSize: 18, margin: 0 }}>{subjects.find((s) => s.id === activeSubjectId)?.name}</h3>
            </div>
          </div>
          <GradeCalculator
            categories={activeCategories}
            onChange={(cats) => activeSubjectId && setGradeCategories(activeSubjectId, cats)}
          />
        </div>
      )}
    </section>
  );
}
