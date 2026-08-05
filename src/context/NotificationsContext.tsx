import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { NotificationItem, NotificationType } from "../types";
import { accountStorageKey, readJSON, writeJSON } from "../lib/storage";
import { useAuth } from "./AuthContext";
import { useAppData } from "./AppDataContext";
import { formatDue } from "../utils/time";

function notifKey(accountKey: string) {
  return accountStorageKey("notifications", accountKey);
}

let uid = 0;
function makeId() {
  uid += 1;
  return `notif_${Date.now().toString(36)}${uid}`;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { accountKey } = useAuth();
  const { subjects, assignmentsBySubject, hydrated } = useAppData();

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readJSON(notifKey(accountKey), []));
  const loadedAccountKey = useRef(accountKey);
  const prevGradePercents = useRef<Record<string, number> | null>(null);

  // reload on account switch
  useEffect(() => {
    if (loadedAccountKey.current === accountKey) return;
    loadedAccountKey.current = accountKey;
    setNotifications(readJSON(notifKey(accountKey), []));
    prevGradePercents.current = null;
  }, [accountKey]);

  // debounced persist
  useEffect(() => {
    const timeout = setTimeout(() => writeJSON(notifKey(accountKey), notifications), 200);
    return () => clearTimeout(timeout);
  }, [accountKey, notifications]);

  const upsert = useCallback((incoming: { dedupeKey: string; type: NotificationType; title: string; message: string; subjectId?: string }[]) => {
    if (incoming.length === 0) return;
    setNotifications((prev) => {
      const existingKeys = new Set(prev.map((n) => n.dedupeKey));
      const fresh = incoming
        .filter((n) => !existingKeys.has(n.dedupeKey))
        .map((n) => ({ ...n, id: makeId(), timestamp: Date.now(), read: false }));
      if (fresh.length === 0) return prev;
      return [...fresh, ...prev].slice(0, 100);
    });
  }, []);

  // deadline/overdue from assignments
  useEffect(() => {
    if (!hydrated) return;
    const generated: { dedupeKey: string; type: NotificationType; title: string; message: string; subjectId?: string }[] = [];

    for (const subject of subjects) {
      const items = assignmentsBySubject[subject.id] ?? [];
      for (const a of items) {
        if (a.done || !a.due) continue;
        const { label, urgency } = formatDue(a.due);
        if (urgency === "overdue") {
          generated.push({
            dedupeKey: `assignment:${a.id}:overdue`,
            type: "overdue",
            title: `Overdue: ${a.title}`,
            message: `${subject.name} · ${label}`,
            subjectId: subject.id,
          });
        } else if (urgency === "today" || urgency === "tomorrow") {
          generated.push({
            dedupeKey: `assignment:${a.id}:${urgency}`,
            type: "deadline",
            title: `${a.title} is ${urgency === "today" ? "due today" : "due tomorrow"}`,
            message: `${subject.name} · worth ${a.weightPercent}% of your grade`,
            subjectId: subject.id,
          });
        }
      }
    }

    upsert(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, assignmentsBySubject, hydrated]);

  // notify on grade change
  useEffect(() => {
    if (!hydrated) return;
    if (prevGradePercents.current === null) {
      prevGradePercents.current = Object.fromEntries(subjects.map((s) => [s.id, s.gradePercent]));
      return;
    }
    const prevMap = prevGradePercents.current;
    const generated: { dedupeKey: string; type: NotificationType; title: string; message: string; subjectId?: string }[] = [];
    for (const s of subjects) {
      const prevPct = prevMap[s.id];
      if (prevPct !== undefined && prevPct !== s.gradePercent && s.gradePercent > 0) {
        generated.push({
          dedupeKey: `grade:${s.id}:${s.gradePercent}:${Date.now()}`,
          type: "grade",
          title: `Grade updated: ${s.name}`,
          message: `Your grade is now ${s.gradePercent}% (${s.letterGrade})`,
          subjectId: s.id,
        });
      }
    }
    prevGradePercents.current = Object.fromEntries(subjects.map((s) => [s.id, s.gradePercent]));
    upsert(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, hydrated]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clear = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, unreadCount, markRead, markAllRead, clear, clearAll }),
    [notifications, unreadCount, markRead, markAllRead, clear, clearAll]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
