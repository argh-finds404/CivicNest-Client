import React from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import SEO from "../common/SEO";
import MinimalLoader from "../common/MinimalLoader";
import { StatusBadge, PriorityBadge, SlaText, TicketProgress, TicketTimeline, CopyCode } from "./ticketUi";

export default function TicketDetails() {
  const { code } = useParams();
  const axiosSecure = useAxiosSecure();
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", code],
    queryFn: async () => (await axiosSecure.get(`/tickets/${code}`)).data.ticket,
    retry: false,
  });

  if (isLoading) return <div className="flex justify-center py-24"><MinimalLoader /></div>;
  if (error || !ticket) {
    const msg = error?.response?.data?.error || "This ticket couldn't be loaded.";
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="cn-heading text-2xl">Ticket not available</h1>
        <p className="mt-2 text-[var(--cn-ink-muted)]">{msg}</p>
        <Link to="/tickets" className="cn-btn cn-btn-primary mt-6 inline-flex">Back to your tickets</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cn-ground)] pb-20">
      <SEO title={`Ticket ${ticket.code}`} />
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link to="/tickets" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--cn-ink-muted)] hover:text-[var(--cn-brand)]">
          <i className="ri-arrow-left-s-line text-lg" aria-hidden="true" /> Your tickets
        </Link>

        <section className="cn-card cn-card-raised mt-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <CopyCode code={ticket.code} />
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="cn-heading text-2xl md:text-3xl mt-4">{ticket.title}</h1>
          <p className="mt-2 text-[var(--cn-ink-muted)]">
            {[ticket.category, ticket.area].filter(Boolean).join(" in ")}
            {ticket.category || ticket.area ? ", " : ""}reported {format(new Date(ticket.createdAt), "d MMM yyyy")}
          </p>

          <div className="mt-7"><TicketProgress status={ticket.status} /></div>

          <dl className="mt-7 grid sm:grid-cols-3 gap-4">
            <div className="cn-stat">
              <dt>Target</dt>
              <dd>{ticket.status === "REJECTED" ? "Closed without action" : <SlaText ticket={ticket} bare />}</dd>
            </div>
            <div className="cn-stat">
              <dt>Handled by</dt>
              <dd>{ticket.assigneeEmail || "Not assigned yet"}</dd>
            </div>
            <div className="cn-stat">
              <dt>Last update</dt>
              <dd>{format(new Date(ticket.updatedAt), "d MMM yyyy, h:mm a")}</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link to={`/issues/${ticket.issueId}`} className="cn-btn cn-btn-primary">
              View the report <i className="ri-arrow-right-line" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="cn-card mt-5 p-6 md:p-8">
          <h2 className="cn-heading text-lg">History</h2>
          <div className="mt-5"><TicketTimeline events={ticket.events} /></div>
        </section>
      </div>
    </div>
  );
}
