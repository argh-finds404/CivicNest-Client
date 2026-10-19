import React, { useState } from "react";
import { format, formatDistanceToNowStrict, isPast } from "date-fns";
import { STATUS, PRIORITY } from "./ticketMeta";

const STEPS = ["OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED"];

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.OPEN;
  return (
    <span className={`cn-pill ${s.tone}`}>
      <i className={s.icon} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.NORMAL;
  return <span className={`cn-pill cn-pill-quiet ${p.tone}`}>{p.label} priority</span>;
}

/** "Due in 3 days" / "Overdue by 2 hours" / resolved date */
export function SlaText({ ticket, bare = false }) {
  if (ticket.status === "RESOLVED") {
    return <span>Resolved {ticket.resolvedAt ? format(new Date(ticket.resolvedAt), "d MMM yyyy") : ""}</span>;
  }
  if (ticket.status === "REJECTED" || !ticket.slaDueAt) return null;
  const due = new Date(ticket.slaDueAt);
  return isPast(due) ? (
    <span className="text-[var(--cn-hydrant)] font-semibold">Overdue by {formatDistanceToNowStrict(due)}</span>
  ) : (
    <span>{bare ? "Within" : "Target: within"} {formatDistanceToNowStrict(due)}</span>
  );
}

/** Four-step progress: Open → Accepted → In progress → Resolved */
export function TicketProgress({ status }) {
  const rejected = status === "REJECTED";
  const current = STEPS.indexOf(status);
  return (
    <ol className="cn-steps" aria-label="Ticket progress">
      {STEPS.map((step, i) => {
        const state = rejected ? "is-off" : i < current ? "is-done" : i === current ? "is-now" : "";
        return (
          <li key={step} className={`cn-step ${state}`} aria-current={i === current ? "step" : undefined}>
            <span className="cn-step-dot" aria-hidden="true">
              {i < current && !rejected ? <i className="ri-check-line" /> : i + 1}
            </span>
            <span className="cn-step-label">{STATUS[step].label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="cn-code"
      onClick={() => {
        navigator.clipboard?.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      title="Copy ticket code"
    >
      <span>{code}</span>
      <i className={copied ? "ri-check-line" : "ri-file-copy-line"} aria-hidden="true" />
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

const EVENT_TEXT = {
  created: (e) => `Report filed${e.by && e.by !== "system" ? "" : " (imported)"}`,
  status: (e) => `${STATUS[e.from]?.label || e.from} → ${STATUS[e.to]?.label || e.to}`,
  priority: (e) => `Priority ${PRIORITY[e.from]?.label || e.from} → ${PRIORITY[e.to]?.label || e.to}`,
  assigned: (e) => (e.to ? `Assigned to ${e.to}` : "Unassigned"),
  note: () => "Staff note",
};

export function TicketTimeline({ events = [] }) {
  const sorted = [...events].sort((a, b) => new Date(b.at) - new Date(a.at));
  return (
    <ol className="cn-timeline">
      {sorted.map((e, i) => (
        <li key={i} className="cn-timeline-item">
          <span className="cn-timeline-dot" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[var(--cn-ink)] text-sm">{(EVENT_TEXT[e.type] || (() => e.type))(e)}</p>
            {e.note && <p className="text-sm text-[var(--cn-ink-muted)] mt-0.5">{e.note}</p>}
            <p className="text-xs text-[var(--cn-ink-faint)] mt-1">
              {format(new Date(e.at), "d MMM yyyy, h:mm a")}
              {e.by && e.by !== "system" ? ` by ${e.by}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
