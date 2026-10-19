import React from "react";
import { NavLink, Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useRole } from "../../hooks/useRole";

// `adminOnly` sections are hidden from moderators (the API refuses them too)
const SECTIONS = [
  { group: null, items: [{ to: "/admin", end: true, icon: "ri-dashboard-line", label: "Overview" }] },
  {
    group: "Operations",
    items: [
      { to: "/admin/tickets", icon: "ri-ticket-2-line", label: "Tickets" },
      { to: "/admin/queue", icon: "ri-list-check-2", label: "Issue queue", badge: (s, q) => q?.pending_review },
      { to: "/admin/notices", icon: "ri-megaphone-line", label: "Notices", adminOnly: true },
      { to: "/admin/users", icon: "ri-team-line", label: "Users & roles", adminOnly: true },
      { to: "/admin/membership", icon: "ri-pass-valid-line", label: "Members & volunteers", adminOnly: true, badge: (s) => s?.pendingRequests },
    ],
  },
  {
    group: "Community",
    items: [
      { to: "/admin/cleanup-events", icon: "ri-calendar-event-line", label: "Cleanup events" },
      { to: "/admin/posts", icon: "ri-file-list-3-line", label: "Reported posts" },
      { to: "/admin/forum", icon: "ri-chat-1-line", label: "Forum" },
      { to: "/admin/ngos", icon: "ri-building-4-line", label: "NGO verification", adminOnly: true, badge: (s) => s?.pendingNGOs },
      { to: "/admin/gallery", icon: "ri-image-line", label: "Gallery", adminOnly: true },
      { to: "/admin/donations", icon: "ri-heart-3-line", label: "Donations", adminOnly: true },
    ],
  },
];

export default function AdminDashboard() {
  const axiosSecure = useAxiosSecure();
  const [role] = useRole();
  const isAdmin = role === "admin";

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await axiosSecure.get("/admin/stats")).data,
  });
  const { data: queueCount } = useQuery({
    queryKey: ["admin-queue-count"],
    queryFn: async () => (await axiosSecure.get("/admin/queue/count")).data,
  });

  return (
    <div className="min-h-screen bg-[var(--cn-ground)] pt-8 pb-20">
      <div className="max-w-[1600px] xl:max-w-[95%] mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-72 shrink-0 z-10">
          <div className="cn-card p-4 md:sticky md:top-24">
            <div className="flex items-center justify-between mb-5 px-1">
              <h2 className="cn-heading text-lg">{isAdmin ? "Control center" : "Moderation"}</h2>
              <span className={`cn-role-chip ${isAdmin ? "cn-role-admin" : "cn-role-moderator"}`}>{role}</span>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Staff sections">
              {SECTIONS.map((section) => {
                const items = section.items.filter((item) => isAdmin || !item.adminOnly);
                if (!items.length) return null;
                return (
                  <React.Fragment key={section.group || "top"}>
                    {section.group && <p className="cn-nav-group">{section.group}</p>}
                    {items.map((item) => {
                      const count = item.badge?.(stats, queueCount);
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) => `cn-nav-item${isActive ? " is-active" : ""}`}
                        >
                          <span className="flex items-center gap-2.5">
                            <i className={`${item.icon} text-base`} aria-hidden="true" />
                            {item.label}
                          </span>
                          {count > 0 && <span className="cn-nav-badge">{count}</span>}
                        </NavLink>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </nav>

            {!isAdmin && (
              <p className="mt-5 px-1 text-xs leading-relaxed text-[var(--cn-ink-muted)]">
                Moderators triage reports and keep community spaces healthy. Users, residency checks, NGOs and
                donations are handled by admins.
              </p>
            )}
          </div>
        </aside>

        <main className="flex-grow min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
