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
    <div className="cn-reviewer" role="group" aria-label={`Reviewer demo accounts, password ${PASSWORD}`}>
      <span className="cn-reviewer-label" title={`Password: ${PASSWORD}`}>Reviewer demo</span>
      {ACCOUNTS.map((a) => (
        <button
          key={a.role}
          type="button"
          disabled={disabled}
          onClick={() => signInAs(a.email)}
          className="cn-reviewer-btn"
          title={`${a.email}: ${a.note}`}
        >
          <i className={a.icon} aria-hidden="true" />
          {a.role}
        </button>
      ))}
    </div>
  );
}
