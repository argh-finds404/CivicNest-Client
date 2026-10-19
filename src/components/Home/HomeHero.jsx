import React from "react";
import { Link } from "react-router";
import usePublicStats, { statsToPins } from "../../hooks/usePublicStats";
import CityDiorama from "./CityDiorama";

const fmt = new Intl.NumberFormat("en");

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export default function HomeHero({ user, displayName }) {
  const { data: stats } = usePublicStats();
  const pins = statsToPins(stats);

  const firstName = displayName?.split(" ")[0];

  return (
    <section className="cn-hero" data-diorama-host>
      <div className="cn-hero-inner">
        <div className="cn-hero-copy">
          {user && (
            <p className="cn-hero-greet">
              {greeting()}, {firstName}
            </p>
          )}
          <h1 className="cn-hero-title">Your street, looked after.</h1>
          <p className="cn-hero-sub">
            Report a broken streetlight or an overflowing bin, follow it until it&apos;s fixed, and join cleanups
            with the people who live around you.
          </p>
          <div className="cn-hero-actions">
            <Link to="/issues/add" className="cn-btn cn-btn-signal">
              <i className="ri-map-pin-add-line text-base" aria-hidden="true" />
              Report an issue
            </Link>
            <Link to="/cleanup-events" className="cn-btn cn-btn-on-dark">
              Find a cleanup
            </Link>
          </div>

          {stats && (
            <ul className="cn-hero-legend" aria-label="Activity on CivicNest">
              <li>
                <span className="cn-dot cn-dot-open" aria-hidden="true" />
                <strong>{fmt.format(stats.openIssues ?? 0)}</strong> open issues
              </li>
              <li>
                <span className="cn-dot cn-dot-solved" aria-hidden="true" />
                <strong>{fmt.format(stats.issuesResolved ?? 0)}</strong> fixed
              </li>
              <li>
                <span className="cn-dot cn-dot-event" aria-hidden="true" />
                <strong>{fmt.format(stats.upcomingEvents ?? 0)}</strong> cleanups coming up
              </li>
              <li className="cn-hero-legend-members">
                <strong>{fmt.format(stats.activeMembers ?? 0)}</strong> neighbours on CivicNest
              </li>
            </ul>
          )}
        </div>

        <div className="cn-hero-map">
          <CityDiorama pins={pins} />
          {pins.length > 0 && <p className="cn-hero-map-hint">Latest reports and cleanups. Tap a pin to open it.</p>}
        </div>
      </div>
    </section>
  );
}
