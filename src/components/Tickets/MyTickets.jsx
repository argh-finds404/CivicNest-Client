import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import PageHeader from "../common/PageHeader";
import SEO from "../common/SEO";
import MinimalLoader from "../common/MinimalLoader";
import { StatusBadge, PriorityBadge, SlaText } from "./ticketUi";

/** Every report you've filed, as a trackable ticket */
export default function MyTickets() {
  const axiosSecure = useAxiosSecure();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async () => (await axiosSecure.get("/tickets/mine")).data.tickets,
  });
  const tickets = data || [];
  const open = tickets.filter((t) => !["RESOLVED", "REJECTED"].includes(t.status)).length;

  return (
    <div className="min-h-screen bg-[var(--cn-ground)] pb-20">
      <SEO title="My tickets" />
      <PageHeader
        width="64rem"
        gutter="1rem"
        title="Your tickets"
        description="Every report you file gets a ticket. Follow it here from the moment you report it until it's fixed."
        actions={
          <Link to="/issues/add" className="cn-btn cn-btn-signal">
            <i className="ri-map-pin-add-line text-base" aria-hidden="true" />
            Report an issue
          </Link>
        }
        meta={tickets.length > 0 && (
          <>
            <span><strong>{open}</strong> still open</span>
            <span><strong>{tickets.length - open}</strong> closed</span>
          </>
        )}
      />

      <div className="max-w-5xl mx-auto px-4 pt-8">
        {isLoading ? (
          <div className="flex justify-center py-16"><MinimalLoader /></div>
        ) : isError ? (
          <div className="cn-card p-8 text-center text-[var(--cn-ink-muted)]">Your tickets couldn't be loaded. Refresh to try again.</div>
        ) : tickets.length === 0 ? (
          <div className="cn-card p-10 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl grid place-items-center bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]">
              <i className="ri-ticket-2-line text-2xl" aria-hidden="true" />
            </div>
            <h2 className="cn-heading text-xl">No tickets yet</h2>
            <p className="mt-2 text-[var(--cn-ink-muted)]">When you report a broken streetlight or a blocked drain, its ticket shows up here.</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link to={`/tickets/${t.code}`} className="cn-card cn-card-link p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[var(--cn-ink-muted)]">{t.code}</span>
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <h3 className="mt-2 font-semibold text-[var(--cn-ink)] truncate">{t.title}</h3>
                    <p className="mt-1 text-sm text-[var(--cn-ink-muted)]">
                      {t.area ? `${t.area}, ` : ""}reported {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-sm text-[var(--cn-ink-muted)] sm:text-right shrink-0">
                    <SlaText ticket={t} />
                  </div>
                  <i className="ri-arrow-right-s-line text-xl text-[var(--cn-ink-faint)] hidden sm:block" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

