import React from "react";
import IsoBars from "../common/IsoBars";

const TONES = ["canopy", "signal", "stone", "hydrant"];

/** The busiest active poll, drawn as 3D columns with the share of votes on top */
export default function PollSpotlight({ polls }) {
  const now = new Date();
  const live = polls
    .filter((p) => p.status === "active" && (!p.endsAt || new Date(p.endsAt) > now) && p.options?.length)
    .sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))[0];
  if (!live) return null;

  const options = [...live.options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 4);
  const total = options.reduce((sum, o) => sum + (o.votes || 0), 0);
  const max = Math.max(1, ...options.map((o) => o.votes || 0));

  const bars = options.map((o, i) => ({
    id: o.id || o._id || i,
    tone: TONES[i % TONES.length],
    height: 14 + Math.round(((o.votes || 0) / max) * 96),
    cap: <span className="ps-share">{total ? Math.round(((o.votes || 0) / total) * 100) : 0}%</span>,
    label: <span className="ps-option">{o.text}</span>,
  }));

  return (
    <figure className="ps-spot">
      <IsoBars bars={bars} barWidth={58} barDepth={58} gap={22} className="ps-bars" />
      <figcaption className="ps-question">
        <span className="ps-live">Live</span> {live.question}
      </figcaption>
    </figure>
  );
}
