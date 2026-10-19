import React from "react";
import { Link } from "react-router";
import IsoBars from "../common/IsoBars";

const PLACES = [
  { rank: 2, height: 96, tone: "stone" },
  { rank: 1, height: 140, tone: "signal" },
  { rank: 3, height: 64, tone: "canopy" },
];

const fmt = new Intl.NumberFormat("en");

function Champion({ user, rank }) {
  const name = user.name || "Neighbour";
  return (
    <Link to={user._id ? `/user/${user._id}` : "/leaderboard"} className="lb-champ">
      <span className={`lb-champ-avatar lb-rank-${rank}`}>
        {user.photoURL ? <img src={user.photoURL} alt="" loading="lazy" /> : <span>{name.charAt(0)}</span>}
      </span>
      <span className="lb-champ-name">{name.split(" ")[0]}</span>
      <span className="lb-champ-pts">{fmt.format(user.points || 0)} pts</span>
    </Link>
  );
}

/** Top three neighbours standing on a 3D podium: 2nd, 1st, 3rd from left to right */
export default function Podium({ users }) {
  const bars = PLACES.map((place) => {
    const user = users[place.rank - 1];
    return {
      id: `p${place.rank}`,
      height: place.height,
      tone: place.tone,
      cap: user ? <Champion user={user} rank={place.rank} /> : null,
      label: <span className="lb-place">{place.rank === 1 ? "1st" : place.rank === 2 ? "2nd" : "3rd"}</span>,
    };
  });

  const names = users.slice(0, 3).map((u, i) => `${i + 1}. ${u.name || "Neighbour"}, ${u.points || 0} points`).join("; ");

  return (
    <section className="cn-dark-stage lb-podium" aria-labelledby="lb-podium-title">
      <h2 id="lb-podium-title" className="lb-podium-title">Top neighbours this season</h2>
      <IsoBars bars={bars} barWidth={92} barDepth={80} gap={18} className="lb-bars" ariaLabel={names} />
    </section>
  );
}
