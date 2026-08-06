import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { SubjectIcon } from "../../components/ui/icons";
import { ChevronLeftIcon, ChevronRightIcon, DeadlineIcon, NotebookIcon } from "../../components/ui/icons";
import { subjectHex } from "../../utils/color";
import type { IconName, AssignmentPriority, Note } from "../../types";
import "../shared/page.css";
import "./Calendar.css";

type EventKind = "assignment" | "note";

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  kind: EventKind;
  title: string;
  subtitle: string;
  color: string;
  icon: IconName | "note";
  priority?: AssignmentPriority;
  subjectId?: string;
  note?: Note;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function relativeDayLabel(key: string, todayKey: string): string {
  const diff = Math.round((parseKey(key).getTime() - parseKey(todayKey).getTime()) / 86_400_000);
  if (diff === 0) return "Due Today";
  if (diff === 1) return "Due Tomorrow";
  if (diff === -1) return "1 day overdue";
  if (diff < -1) return `${Math.abs(diff)} days overdue`;
  if (diff > 1 && diff <= 30) return `Due in ${diff} days`;
  return parseKey(key).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface Props {
  onOpenSubject: (id: string) => void;
  onOpenNote: (note: Note) => void;
}

export function Calendar({ onOpenSubject, onOpenNote }: Props) {
  const { subjects, assignmentsBySubject, notes } = useAppData();

  const today = useMemo(() => new Date(), []);
  const todayKey = toKey(today);

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const events = useMemo<CalendarEvent[]>(() => {
    const out: CalendarEvent[] = [];

    for (const [subjectId, list] of Object.entries(assignmentsBySubject)) {
      const subject = subjectById.get(subjectId);
      for (const a of list) {
        if (!a.due) continue;
        out.push({
          id: `a-${a.id}`,
          date: a.due,
          kind: "assignment",
          title: a.title,
          subtitle: subject ? subject.name : "Assignment",
          color: subject ? subjectHex(subject) : "#5B9DF9",
          icon: subject?.icon ?? "general",
          priority: a.priority,
          subjectId,
        });
      }
    }

    for (const n of notes) {
      out.push({
        id: `n-${n.id}`,
        date: toKey(new Date(n.createdAt)),
        kind: "note",
        title: n.title,
        subtitle: n.subjectName || "Personal note",
        color: "#5B9DF9",
        icon: "note",
        note: n,
      });
    }

    return out;
  }, [assignmentsBySubject, notes, subjectById]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    }
    return map;
  }, [events]);

  // month grid cells
  const gridDays = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - startOffset);

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const key = toKey(d);
      return {
        date: d,
        key,
        inMonth: d.getMonth() === cursor.getMonth(),
        isToday: key === todayKey,
        events: eventsByDate.get(key) ?? [],
      };
    });
  }, [cursor, eventsByDate, todayKey]);

  // next 14 days timeline
  const timelineDays = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = toKey(d);
      return { key, date: d, events: eventsByDate.get(key) ?? [] };
    });
  }, [today, eventsByDate]);

  const selectedEvents = (eventsByDate.get(selectedKey) ?? []).slice().sort((a, b) => {
    const order = { assignment: 0, note: 1 } as Record<EventKind, number>;
    return order[a.kind] - order[b.kind];
  });

  const selectedDateObj = parseKey(selectedKey);
  const selectedLabel = selectedDateObj.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  const goToMonth = (delta: number) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  const jumpToToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedKey(todayKey);
  };

  return (
    <section className="page calendar-page">
      <div className="eyebrow">Calendar</div>
      <h1 className="page-title">Your academic timeline</h1>
      <p className="page-sub">Everything due, written, and happening — organized by day.</p>

      {/* timeline / gallery strip */}
      <div className="cal-timeline">
        {timelineDays.map(({ key, date, events: dayEvents }) => (
          <button
            key={key}
            className={`cal-timeline-chip ${key === selectedKey ? "is-active" : ""} ${key === todayKey ? "is-today" : ""}`}
            onClick={() => {
              setSelectedKey(key);
              setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
            }}
          >
            <span className="cal-timeline-dow">{WEEKDAYS[date.getDay()]}</span>
            <span className="cal-timeline-num">{date.getDate()}</span>
            {dayEvents.length > 0 ? (
              <span className="cal-timeline-dots">
                {dayEvents.slice(0, 3).map((e) => (
                  <span key={e.id} className="cal-dot" style={{ background: e.color }} />
                ))}
              </span>
            ) : (
              <span className="cal-timeline-dots cal-timeline-dots--empty" />
            )}
          </button>
        ))}
      </div>

      <div className="cal-layout">
        {/* month grid */}
        <div className="card cal-month">
          <div className="cal-month-head">
            <div className="cal-month-title">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</div>
            <div className="cal-month-nav">
              <button className="icon-btn" onClick={() => goToMonth(-1)} aria-label="Previous month"><ChevronLeftIcon /></button>
              <button className="cal-today-btn" onClick={jumpToToday}>Today</button>
              <button className="icon-btn" onClick={() => goToMonth(1)} aria-label="Next month"><ChevronRightIcon /></button>
            </div>
          </div>

          <div className="cal-weekdays">
            {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
          </div>

          <div className="cal-grid">
            {gridDays.map(({ key, date, inMonth, isToday, events: dayEvents }) => (
              <button
                key={key}
                className={`cal-cell ${inMonth ? "" : "is-outside"} ${isToday ? "is-today" : ""} ${key === selectedKey ? "is-selected" : ""}`}
                onClick={() => setSelectedKey(key)}
              >
                <span className="cal-cell-num">{date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <span className="cal-cell-dots">
                    {dayEvents.slice(0, 4).map((e) => (
                      <span key={e.id} className="cal-dot" style={{ background: e.color }} />
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* daily agenda */}
        <div className="card cal-agenda">
          <div className="cal-agenda-head">
            <div className="cal-agenda-eyebrow">{selectedKey === todayKey ? "Today" : ""}</div>
            <h2 className="cal-agenda-title">{selectedLabel}</h2>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="cal-empty">
              <span className="cal-empty-icon"><DeadlineIcon /></span>
              <p>Nothing on the calendar for this day.</p>
            </div>
          ) : (
            <div className="cal-agenda-list">
              {selectedEvents.map((ev) => (
                <button
                  key={ev.id}
                  className="cal-agenda-item"
                  onClick={() => {
                    if (ev.kind === "assignment" && ev.subjectId) onOpenSubject(ev.subjectId);
                    else if (ev.kind === "note" && ev.note) onOpenNote(ev.note);
                  }}
                >
                  <span className="cal-agenda-icon" style={{ background: `${ev.color}22`, color: ev.color }}>
                    {ev.kind === "note" ? <NotebookIcon /> : <SubjectIcon name={ev.icon as IconName} />}
                  </span>
                  <span className="cal-agenda-body">
                    <span className="cal-agenda-item-title">{ev.title}</span>
                    <span className="cal-agenda-item-sub">{ev.subtitle}</span>
                  </span>
                  {ev.kind === "assignment" && (
                    <span className={`cal-agenda-badge urgency-${relativeDayLabel(ev.date, todayKey).includes("overdue") ? "overdue" : relativeDayLabel(ev.date, todayKey) === "Due Today" ? "today" : "upcoming"}`}>
                      {relativeDayLabel(ev.date, todayKey)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
