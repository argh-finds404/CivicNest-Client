import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, isPast } from "date-fns";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useAuth } from "../../hooks/useAuth";
import MinimalLoader from "../common/MinimalLoader";
import { StatusBadge, PriorityBadge, TicketTimeline } from "../Tickets/ticketUi";
import { STATUS, PRIORITY } from "../Tickets/ticketMeta";

const TABS = ["ALL", "OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

/** Staff ticket queue: sorted by SLA, filter, update in place */
export default function AdminTickets() {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("OPEN");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [openCode, setOpenCode] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = { page, ...(tab !== "ALL" && { status: tab }), ...(priority && { priority }), ...(q && { q }), ...(mineOnly && { assignee: "me" }) };
  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-tickets", params],
    queryFn: async () => (await axiosSecure.get("/tickets", { params })).data,
    placeholderData: (previous) => previous,
  });

  const update = useMutation({
    mutationFn: ({ code, body }) => axiosSecure.patch(`/tickets/${code}`, body),
    onSuccess: (_, { body }) => {
      queryClient.invalidateQueries({ queryKey: ["staff-tickets"] });
      toast.success(body.note ? "Note added" : "Ticket updated");
    },
    onError: (err) => toast.error(err.response?.data?.error || "That update didn't go through."),
  });

  const counts = data?.byStatus || {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <header className="cn-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="cn-heading text-2xl">Tickets</h1>
            <p className="mt-1 text-sm text-[var(--cn-ink-muted)]">Every report as a ticket, most urgent deadline first.</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--cn-ink)] cursor-pointer select-none">
            <input type="checkbox" className="toggle toggle-sm toggle-success" checked={mineOnly} onChange={(e) => { setMineOnly(e.target.checked); setPage(1); }} />
            Assigned to me
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Ticket status">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`cn-tab${tab === t ? " is-active" : ""}`}
            >
              {t === "ALL" ? "All" : STATUS[t].label}
              <span className="cn-tab-count">{t === "ALL" ? total : counts[t] || 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Search tickets</span>
            <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--cn-ink-faint)]" aria-hidden="true" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code, title or area" className="cn-input pl-10" />
          </label>
          <label className="sm:w-48">
            <span className="sr-only">Priority</span>
            <select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} className="cn-input">
              <option value="">Any priority</option>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16"><MinimalLoader /></div>
      ) : isError ? (
        <div className="cn-card p-8 text-center text-[var(--cn-ink-muted)]">Tickets couldn't be loaded. Refresh to try again.</div>
      ) : !data?.tickets?.length ? (
        <div className="cn-card p-10 text-center text-[var(--cn-ink-muted)]">Nothing here. Try another tab or clear the filters.</div>
      ) : (
        <ul className="grid gap-3">
          {data.tickets.map((t) => {
            const overdue = t.slaDueAt && isPast(new Date(t.slaDueAt)) && !["RESOLVED", "REJECTED"].includes(t.status);
            const expanded = openCode === t.code;
            return (
              <li key={t.id} className={`cn-card p-5 ${overdue ? "cn-card-alert" : ""}`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[var(--cn-ink-muted)]">{t.code}</span>
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                      {overdue && <span className="cn-pill cn-tone-hydrant"><i className="ri-alarm-warning-line" aria-hidden="true" />Overdue</span>}
                    </div>
                    <Link to={`/issues/${t.issueId}`} className="mt-2 block font-semibold text-[var(--cn-ink)] hover:text-[var(--cn-brand)] truncate">{t.title}</Link>
                    <p className="mt-1 text-sm text-[var(--cn-ink-muted)]">
                      {t.area || "No area"}, reported {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                      {t.assigneeEmail ? `, assigned to ${t.assigneeEmail}` : ", unassigned"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label>
                      <span className="sr-only">Status for {t.code}</span>
                      <select className="cn-input cn-input-sm" value={t.status} disabled={update.isPending}
                        onChange={(e) => update.mutate({ code: t.code, body: { status: e.target.value } })}>
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">Priority for {t.code}</span>
                      <select className="cn-input cn-input-sm" value={t.priority} disabled={update.isPending}
                        onChange={(e) => update.mutate({ code: t.code, body: { priority: e.target.value } })}>
                        {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </label>
                    {t.assigneeEmail !== user?.email && (
                      <button type="button" className="cn-btn cn-btn-ghost cn-btn-sm" disabled={update.isPending}
                        onClick={() => update.mutate({ code: t.code, body: { assigneeEmail: user.email } })}>
                        Assign to me
                      </button>
                    )}
                    <button type="button" className="cn-btn cn-btn-ghost cn-btn-sm" aria-expanded={expanded}
                      onClick={() => setOpenCode(expanded ? null : t.code)}>
                      {expanded ? "Hide" : "History"}
                    </button>
                  </div>
                </div>

                {expanded && <TicketPanel ticket={t} onNote={(note) => update.mutate({ code: t.code, body: { note } })} busy={update.isPending} />}
              </li>
            );
          })}
        </ul>
      )}

      {data?.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pages">
          <button className="cn-btn cn-btn-ghost cn-btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="text-sm text-[var(--cn-ink-muted)]">Page {page} of {data.totalPages}</span>
          <button className="cn-btn cn-btn-ghost cn-btn-sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </nav>
      )}
    </div>
  );
}

function TicketPanel({ ticket, onNote, busy }) {
  const [note, setNote] = useState("");
  return (
    <div className="mt-5 pt-5 border-t border-[var(--cn-line)] grid lg:grid-cols-[1fr_20rem] gap-6">
      <TicketTimeline events={ticket.events} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          onNote(note.trim());
          setNote("");
        }}
      >
        <label className="block text-sm font-semibold text-[var(--cn-ink)]" htmlFor={`note-${ticket.code}`}>Add a staff note</label>
        <textarea id={`note-${ticket.code}`} value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000}
          placeholder="e.g. Called the city utility office, crew booked for Tuesday" className="cn-input mt-2 resize-none" />
        <button type="submit" className="cn-btn cn-btn-primary cn-btn-sm mt-2" disabled={busy || !note.trim()}>Add note</button>
      </form>
    </div>
  );
}
