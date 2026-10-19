import React from "react";

// Demo accounts created by `npm run seed:reviewers` on the server.
// Hide this panel with VITE_SHOW_REVIEWER_LOGIN=false.
const PASSWORD = import.meta.env.VITE_REVIEWER_PASSWORD || "CivicNest@2026";
const ACCOUNTS = [
  { role: "Admin", email: "admin.reviewer@civicnest.app", icon: "ri-shield-star-line", note: "Everything, incl. users & roles" },
  { role: "Moderator", email: "moderator.reviewer@civicnest.app", icon: "ri-shield-check-line", note: "Tickets, queue, forum" },
  { role: "Member", email: "member.reviewer@civicnest.app", icon: "ri-user-smile-line", note: "Report, vote, volunteer" },
];

/** One-click sign-in for reviewers: fills the login form and submits it */
export default function ReviewerAccess({ formRef, disabled }) {
  if (import.meta.env.VITE_SHOW_REVIEWER_LOGIN === "false") return null;

  const signInAs = (email) => {
    const form = formRef.current;
    if (!form) return;
    form.elements.email.value = email;
    form.elements.password.value = PASSWORD;
    form.requestSubmit();
  };

  return (
    <section className="cn-reviewer" aria-labelledby="reviewer-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="reviewer-title" className="text-sm font-bold text-[var(--cn-ink)]">Reviewing CivicNest?</h2>
        <span className="text-xs text-[var(--cn-ink-muted)]">Password {PASSWORD}</span>
      </div>
      <p className="mt-1 text-xs text-[var(--cn-ink-muted)]">Sign in to a demo account to explore each role.</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.role}
            type="button"
            disabled={disabled}
            onClick={() => signInAs(a.email)}
            className="cn-reviewer-btn"
            title={`${a.email}: ${a.note}`}
          >
            <i className={`${a.icon} text-lg`} aria-hidden="true" />
            <span className="font-bold text-[13px]">{a.role}</span>
            <span className="text-[10.5px] leading-tight text-[var(--cn-ink-muted)]">{a.note}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
