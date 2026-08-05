import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../context/NotificationsContext";
import { formatTimeAgo } from "../utils/time";
import { BellIcon, CalendarClockIcon, CircleAlertIcon, CheckIcon, SparkleIcon, TrendingUpIcon, XIcon } from "./icons";
import type { NotificationItem, NotificationType } from "../types";
import "./NotificationBell.css";

const TYPE_ICON: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  deadline: CalendarClockIcon,
  overdue: CircleAlertIcon,
  grade: TrendingUpIcon,
  system: SparkleIcon,
};

function NotificationRow({ item, onRead, onClear }: { item: NotificationItem; onRead: (id: string) => void; onClear: (id: string) => void }) {
  const Icon = TYPE_ICON[item.type];
  return (
    <li className={`notif-row ${item.read ? "" : "is-unread"}`} onClick={() => !item.read && onRead(item.id)}>
      <span className={`notif-row-icon notif-row-icon--${item.type}`}>
        <Icon />
      </span>
      <div className="notif-row-body">
        <div className="notif-row-title">{item.title}</div>
        <div className="notif-row-message">{item.message}</div>
        <div className="notif-row-time">{formatTimeAgo(item.timestamp)}</div>
      </div>
      {!item.read && <span className="notif-row-dot" aria-hidden />}
      <button
        className="notif-row-clear"
        aria-label="Clear notification"
        onClick={(e) => {
          e.stopPropagation();
          onClear(item.id);
        }}
      >
        <XIcon />
      </button>
    </li>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clear, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <BellIcon />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel card">
          <div className="notif-panel-head">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <div className="notif-panel-actions">
                <button onClick={markAllRead} disabled={unreadCount === 0}>
                  <CheckIcon /> Mark all read
                </button>
                <button onClick={clearAll} className="notif-panel-clear">Clear all</button>
              </div>
            )}
          </div>
          <ul className="notif-list">
            {notifications.map((item) => (
              <NotificationRow key={item.id} item={item} onRead={markRead} onClear={clear} />
            ))}
            {notifications.length === 0 && (
              <li className="notif-empty">
                <BellIcon />
                <p>You're all caught up.</p>
                <span>Deadline alerts and grade updates will show up here.</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
