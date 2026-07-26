import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { generateFlashcards } from "../../data/flashcardGenerator";
import { SubjectIcon, SparkleIcon, ShuffleIcon, TrashIcon, XIcon, CheckIcon, BackIcon, PlusIcon, PencilIcon } from "../../components/icons";
import type { Flashcard, FlashcardSet } from "../../types";
import "../shared/page.css";
import "../../components/RecentNotes.css";
import "../Notes/Notes.css";
import "../SubjectWorkspace/SubjectWorkspace.css";
import "./Flashcards.css";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface Props {
  /** When set (e.g. right after "Turn into Flashcard Quiz" from Notes), opens straight into editing that set. */
  initialSetId?: string | null;
  onInitialConsumed?: () => void;
}

export function Flashcards({ initialSetId, onInitialConsumed }: Props = {}) {
  const { flashcardSets, addFlashcardSet, deleteFlashcardSet } = useAppData();
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "edit" | "study">("list");

  useEffect(() => {
    if (!initialSetId) return;
    setActiveSetId(initialSetId);
    setMode("edit");
    onInitialConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSetId]);

  const activeSet = flashcardSets.find((s) => s.id === activeSetId) ?? null;

  const handleGenerate = () => {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const generated = generateFlashcards(topic);
      const newId = addFlashcardSet({
        title: generated.title,
        subjectName: generated.subjectName,
        icon: generated.icon,
        color: generated.color,
        cards: generated.cards,
      });
      setTopic("");
      setGenerating(false);
      setActiveSetId(newId);
      setMode("edit");
    }, 600);
  };

  if (activeSet && mode === "edit") {
    return (
      <SetEditor
        set={activeSet}
        onExit={() => { setActiveSetId(null); setMode("list"); }}
        onStudy={() => setMode("study")}
      />
    );
  }

  if (activeSet && mode === "study") {
    return <StudySession set={activeSet} onExit={() => { setActiveSetId(null); setMode("list"); }} />;
  }

  return (
    <section className="page">
      <div className="eyebrow">AI Flashcards</div>
      <h1 className="page-title">Quiz yourself before it counts</h1>
      <p className="page-sub">Generate a flashcard set from a subject or topic, then run through it as a quick self-quiz. You can also turn any AI note into a flashcard set right from the Notes workspace.</p>

      <div className="card fc-composer">
        <label className="fc-label"><SparkleIcon /> Generate from a subject or topic</label>
        <div className="fc-composer-row">
          <input
            className="notes-text-input"
            placeholder="e.g. Cell Biology, World War I, Derivatives"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <button className="btn-solid" onClick={handleGenerate} disabled={generating}>
            <SparkleIcon /> {generating ? "Generating…" : "Generate Set"}
          </button>
        </div>
      </div>

      <div className="fc-grid">
        {flashcardSets.map((set) => (
          <div className="card fc-set-card" key={set.id}>
            <button className="fc-set-main" onClick={() => { setActiveSetId(set.id); setMode("study"); }}>
              <span className={`subject-icon subject-icon--${set.color}`}>
                <SubjectIcon name={set.icon} />
              </span>
              <div className="fc-set-info">
                <div className="fc-set-title">{set.title}</div>
                <div className="note-meta">{set.subjectName} · {set.cards.length} cards</div>
              </div>
            </button>
            <button
              className="icon-btn fc-set-delete"
              aria-label="Edit set"
              title="Edit cards"
              onClick={() => { setActiveSetId(set.id); setMode("edit"); }}
            >
              <PencilIcon />
            </button>
            <button className="icon-btn fc-set-delete" onClick={() => deleteFlashcardSet(set.id)} aria-label="Delete set">
              <TrashIcon />
            </button>
          </div>
        ))}
        {flashcardSets.length === 0 && (
          <div className="fc-empty">No flashcard sets yet — generate your first one above, or turn any AI note into a quiz from the Notes workspace.</div>
        )}
      </div>
    </section>
  );
}

let editUid = 0;
function newCardId() {
  editUid += 1;
  return `fc-new-${Date.now().toString(36)}${editUid}`;
}

function SetEditor({ set, onExit, onStudy }: { set: FlashcardSet; onExit: () => void; onStudy: () => void }) {
  const { updateFlashcardSetCards } = useAppData();
  const [cards, setCards] = useState<Flashcard[]>(set.cards);

  useEffect(() => {
    setCards(set.cards);
    // Only re-sync when switching which set is being edited, not on every local edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set.id]);

  const commit = (next: Flashcard[]) => {
    setCards(next);
    updateFlashcardSetCards(set.id, next);
  };

  const updateCard = (id: string, patch: Partial<Flashcard>) => {
    commit(cards.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCard = (id: string) => {
    commit(cards.filter((c) => c.id !== id));
  };

  const addCard = () => {
    commit([...cards, { id: newCardId(), front: "", back: "" }]);
  };

  return (
    <section className="page">
      <button className="workspace-back" onClick={onExit}><BackIcon /> Back to Flashcards</button>

      <div className="eyebrow">{set.subjectName}</div>
      <h1 className="page-title" style={{ marginBottom: 4 }}>{set.title}</h1>
      <p className="page-sub">Review the AI-generated cards below — edit any of them, remove ones you don't need, or add your own before you start studying.</p>

      <div className="fc-editor-list">
        {cards.map((c, i) => (
          <div className="card fc-editor-card" key={c.id}>
            <div className="fc-editor-card-head">
              <span className="note-meta">Card {i + 1}</span>
              <button className="icon-btn" aria-label="Remove card" onClick={() => removeCard(c.id)}>
                <TrashIcon />
              </button>
            </div>
            <div className="fc-editor-fields">
              <div className="fc-editor-field">
                <label>Question</label>
                <textarea rows={2} value={c.front} onChange={(e) => updateCard(c.id, { front: e.target.value })} />
              </div>
              <div className="fc-editor-field">
                <label>Answer</label>
                <textarea rows={2} value={c.back} onChange={(e) => updateCard(c.id, { back: e.target.value })} />
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="notes-empty">No cards yet — add one below.</p>}
      </div>

      <div className="fc-editor-actions">
        <button className="btn-ghost" onClick={addCard}><PlusIcon /> Add your own card</button>
        <button className="btn-solid" onClick={onStudy} disabled={cards.length === 0}>Start Studying</button>
      </div>
    </section>
  );
}

function StudySession({ set, onExit }: { set: { id: string; title: string; subjectName: string; cards: { id: string; front: string; back: string }[] }; onExit: () => void }) {
  const [order, setOrder] = useState<number[]>(() => set.cards.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const total = set.cards.length;
  const currentCard = total > 0 ? set.cards[order[index]] : null;
  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter(Boolean).length;

  const goNext = () => {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  const mark = (correct: boolean) => {
    if (!currentCard) return;
    setResults((prev) => ({ ...prev, [currentCard.id]: correct }));
    goNext();
  };

  const restart = (onlyMissed = false) => {
    const missedIdx = order.filter((idx) => results[set.cards[idx].id] === false);
    const base = onlyMissed && missedIdx.length > 0 ? missedIdx : set.cards.map((_, i) => i);
    setOrder(shuffle(base));
    setIndex(0);
    setFlipped(false);
    setResults({});
    setFinished(false);
  };

  const doShuffle = () => {
    setOrder(shuffle(set.cards.map((_, i) => i)));
    setIndex(0);
    setFlipped(false);
    setResults({});
    setFinished(false);
  };

  if (total === 0) {
    return (
      <section className="page">
        <button className="workspace-back" onClick={onExit}><BackIcon /> Back to Flashcards</button>
        <p className="page-sub">This set has no cards yet.</p>
      </section>
    );
  }

  return (
    <section className="page fc-study-page">
      <div className="fc-study-head">
        <button className="workspace-back" onClick={onExit}><BackIcon /> Back to Flashcards</button>
        <button className="btn-ghost fc-shuffle-btn" onClick={doShuffle}>
          <ShuffleIcon /> Shuffle
        </button>
      </div>

      <div className="eyebrow">{set.subjectName}</div>
      <h1 className="page-title">{set.title}</h1>

      {!finished ? (
        <>
          <div className="fc-progress-row">
            <div className="fc-progress-track">
              <div className="fc-progress-fill" style={{ width: `${(index / total) * 100}%` }} />
            </div>
            <span className="fc-progress-label">{index + 1} / {total}</span>
          </div>

          <div className={`fc-card ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((v) => !v)}>
            <div className="fc-card-inner">
              <div className="fc-card-face fc-card-front">
                <span className="fc-card-eyebrow">Question</span>
                <p className="fc-card-text">{currentCard?.front}</p>
                <span className="fc-card-hint">Tap to reveal answer</span>
              </div>
              <div className="fc-card-face fc-card-back">
                <span className="fc-card-eyebrow">Answer</span>
                <p className="fc-card-text">{currentCard?.back}</p>
                <span className="fc-card-hint">Tap to flip back</span>
              </div>
            </div>
          </div>

          {flipped ? (
            <div className="fc-answer-row">
              <button className="fc-answer-btn fc-answer-btn--miss" onClick={() => mark(false)}>
                <XIcon /> Still learning
              </button>
              <button className="fc-answer-btn fc-answer-btn--hit" onClick={() => mark(true)}>
                <CheckIcon /> Got it
              </button>
            </div>
          ) : (
            <div className="fc-skip-row">
              <button className="btn-ghost" onClick={() => setFlipped(true)}>Reveal answer</button>
            </div>
          )}
        </>
      ) : (
        <div className="card fc-results">
          <div className="fc-results-score">{correctCount} / {answeredCount}</div>
          <p className="page-sub" style={{ margin: "4px 0 20px" }}>
            You got {correctCount} of {answeredCount} correct this round.
          </p>
          <div className="fc-results-actions">
            <button className="btn-ghost" onClick={() => restart(false)}>Restart full set</button>
            {correctCount < answeredCount && (
              <button className="btn-solid" onClick={() => restart(true)}>Retry missed cards</button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
