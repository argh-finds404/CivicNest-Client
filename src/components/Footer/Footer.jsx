import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import "./Footer.css";
import { scrollToTop } from "../../utils/smoothScroll";

const COLUMNS = [
  {
    title: "Take part",
    links: [
      { to: "/issues/add", label: "Report an issue" },
      { to: "/cleanup-events", label: "Join a cleanup" },
      { to: "/volunteers", label: "Volunteer" },
      { to: "/polls", label: "Vote in polls" },
    ],
  },
  {
    title: "Community",
    links: [
      { to: "/noticeboard", label: "Notices" },
      { to: "/forum", label: "Threads" },
      { to: "/ngos", label: "NGOs" },
      { to: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "Help",
    links: [
      { to: "/user-manual", label: "User manual" },
      { to: "/community-guidelines", label: "Community guidelines" },
      { to: "/status", label: "System status" },
      { to: "/press-kit", label: "Press kit" },
    ],
  },
];

const CODE_RE = /^CN-\d{4}-\d{6}$/;

// Low skyline along the top edge (drawn once, purely decorative)
function Skyline() {
  return (
    <svg className="ft-skyline" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 90V62h40V40h28v22h22V28h36v34h18V48h30v14h26V18h42v44h20V36h34v26h30V50h24v12h28V24h22v-8h16v8h20v38h30V44h36v18h22V30h40v32h18V54h26v8h30V20h34v42h24V40h28v22h20V8h18v-6h12v6h18v54h28V46h34v16h22V34h30v28h26V52h20v10h30V26h40v36h18V44h30v18h28V30h22v32h40V48h26v14h24V36h34v26h30V58h26v4h22V40h30v50z" />
    </svg>
  );
}

export default function Footer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const trackTicket = (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!CODE_RE.test(c)) {
      setError("Ticket codes look like CN-2026-000123.");
      return;
    }
    setError("");
    navigate(`/tickets/${c}`);
  };

  return (
    <footer className="ft cn-defer">
      <Skyline />
      <div className="ft-inner">
        <section className="ft-cta" aria-label="Get started">
          <div>
            <h2 className="ft-cta-title">Seen something broken on your street?</h2>
            <p className="ft-cta-text">Report it in a minute. You'll get a ticket you can follow until it's fixed.</p>
          </div>
          <div className="ft-cta-actions">
            <Link to="/issues/add" className="cn-btn cn-btn-signal">
              <i className="ri-map-pin-add-line text-base" aria-hidden="true" />
              Report an issue
            </Link>
            <form className="ft-track" onSubmit={trackTicket} noValidate>
              <label htmlFor="ft-track-code" className="sr-only">Ticket code</label>
              <input
                id="ft-track-code"
                className="bg-transparent"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CN-2026-000123"
                autoComplete="off"
                spellCheck="false"
                aria-describedby={error ? "ft-track-error" : undefined}
                aria-invalid={!!error}
              />
              <button type="submit" className="ft-track-btn">Track ticket</button>
            </form>
            {error && <p id="ft-track-error" className="ft-track-error" role="alert">{error}</p>}
          </div>
        </section>

        <div className="ft-main">
          <div className="ft-brand">
            <Link to="/" className="ft-logo" aria-label="CivicNest home">
              <img src="https://i.ibb.co/LD7Xxdky/Gemini-Generated-Image-wmnkxewmnkxewmnk.png" alt="" width="44" height="44" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src ="/favicon.png"; }}/>
              <span>
                Civic<span className="ft-logo-accent">Nest</span>
              </span>
            </Link>
            <p className="ft-mission">
              Neighbours reporting what's broken, cleaning up together and looking after the streets they share.
            </p>
            <div className="ft-account">
              {user ? (
                <>
                  <Link to="/tickets">My tickets</Link>
                  <Link to="/profile">Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/login">Log in</Link>
                  <Link to="/register">Create an account</Link>
                </>
              )}
            </div>
          </div>

          <nav className="ft-cols" aria-label="Footer">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="ft-col-title">{col.title}</h3>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="ft-link">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="ft-bottom">
          <p>© {new Date().getFullYear()} CivicNest. Built for neighbourhoods across Dhaka.</p>
          <button type="button" className="ft-top" onClick={() => scrollToTop()}>
            Back to top <i className="ri-arrow-up-line" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
