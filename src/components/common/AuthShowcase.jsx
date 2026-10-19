import React from "react";
import CityDiorama from "../Home/CityDiorama";
import usePublicStats, { statsToPins } from "../../hooks/usePublicStats";

const fmt = new Intl.NumberFormat("en");

/** Side panel for login and register: the live neighbourhood and real numbers */
export default function AuthShowcase({ title, text, className = "" }) {
  const { data: stats } = usePublicStats();

  return (
    <aside className={`cn-auth-showcase ${className}`} data-diorama-host>
      <div className="cn-auth-showcase-map">
        <CityDiorama pins={statsToPins(stats)} />
      </div>
      <div className="cn-auth-showcase-copy">
        <h2>{title}</h2>
        <p>{text}</p>
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
              <strong>{fmt.format(stats.activeMembers ?? 0)}</strong> neighbours
            </li>
          </ul>
        )}
      </div>
    </aside>
  );
}
