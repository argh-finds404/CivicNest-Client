import React from "react";
import "./PageArt.css";

/*
 * Header artwork for top-level pages: a glass tile holding a drawn emblem,
 * with two small labels floating beside it. Pure SVG and CSS, so it costs
 * nothing to load. Motion is slow and quiet (lines draw in once, then a
 * gentle float), and stops for people who prefer reduced motion.
 *
 * Emblems use a 120×120 box. Classes: s = outline, f-* = fills.
 */
const EMBLEMS = {
  issues: (
    <>
      <ellipse cx="60" cy="100" rx="22" ry="4.5" className="f-shadow" />
      <path className="s draw f-signal" d="M60 16c-16 0-29 12.6-29 28.4C31 65.6 60 93 60 93s29-27.4 29-48.6C89 28.6 76 16 60 16z" />
      <path className="s draw s-dark" d="M60 33v17" />
      <circle cx="60" cy="59" r="3.2" className="f-dark" />
      <path className="s draw s-soft" d="M22 108h20M52 108h16M78 108h20" />
    </>
  ),
  cleanups: (
    <>
      <ellipse cx="60" cy="106" rx="26" ry="4.5" className="f-shadow" />
      <path className="s draw f-mint" d="M38 46h44l-4 52a6 6 0 0 1-6 5.5H48a6 6 0 0 1-6-5.5z" />
      <rect className="s draw f-light" x="31" y="35" width="58" height="11" rx="4" />
      <path className="s draw" d="M52 35v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" />
      <path className="s draw s-soft" d="M51 58v34M60 58v34M69 58v34" />
      <path className="s draw f-mint-strong" d="M82 26c5-11 17-14 23-12-2 9-9 17-22 15" />
      <path className="f-signal twinkle" d="M24 18l2.6 6 6 2.6-6 2.6-2.6 6-2.6-6-6-2.6 6-2.6z" />
    </>
  ),
  volunteers: (
    <>
      <ellipse cx="60" cy="106" rx="24" ry="4.5" className="f-shadow" />
      <path className="s draw f-coral" d="M60 84C36 69 28 56 34 44c5.5-10.5 18-10.5 26 0 8-10.5 20.5-10.5 26 0 6 12-2 25-26 40z" />
      <path className="s draw" d="M18 96c11 0 19 3 27 7h24a6 6 0 0 0 0-12H54" />
      <path className="s draw" d="M102 96c-11 0-19 3-27 7" />
      <path className="f-signal twinkle" d="M94 20l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" />
    </>
  ),
  polls: (
    <>
      <ellipse cx="60" cy="106" rx="30" ry="4.5" className="f-shadow" />
      <g className="ballot">
        <rect className="s draw f-light" x="43" y="18" width="34" height="42" rx="4" />
        <path className="s draw s-canopy" d="M51 39l6.5 6.5L70 33" />
      </g>
      <rect className="s draw f-mint" x="24" y="56" width="72" height="46" rx="7" />
      <path className="s s-dark slot" d="M44 64h32" />
      <path className="s draw s-soft" d="M38 86h44" />
    </>
  ),
  animals: (
    <>
      <ellipse cx="60" cy="106" rx="24" ry="4.5" className="f-shadow" />
      <path className="s draw f-mint" d="M60 64c-13 0-24 10-24 22 0 9 7 14 15 12 4-1 6-3 9-3s5 2 9 3c8 2 15-3 15-12 0-12-11-22-24-22z" />
      <ellipse className="s draw f-mint" cx="36" cy="52" rx="8" ry="10" transform="rotate(-18 36 52)" />
      <ellipse className="s draw f-mint" cx="51" cy="38" rx="8" ry="10.5" transform="rotate(-6 51 38)" />
      <ellipse className="s draw f-mint" cx="69" cy="38" rx="8" ry="10.5" transform="rotate(6 69 38)" />
      <ellipse className="s draw f-mint" cx="84" cy="52" rx="8" ry="10" transform="rotate(18 84 52)" />
      <path className="f-coral twinkle" d="M96 18c-4-3-6-5.5-4.5-8 1.2-2 4-2 4.5 0 .5-2 3.3-2 4.5 0 1.5 2.5-.5 5-4.5 8z" />
    </>
  ),
  lostfound: (
    <>
      <ellipse cx="60" cy="106" rx="26" ry="4.5" className="f-shadow" />
      <g className="lens">
        <circle className="s draw f-glass" cx="52" cy="52" r="26" />
        <path className="s draw s-signal" d="M41 52a6 6 0 1 0 12 0 6 6 0 1 0-12 0zM53 52h15M63 52v5M68 52v4" />
        <path className="s draw s-thick s-mint" d="M71 71l22 22" />
      </g>
      <path className="s-glint" d="M38 36a20 20 0 0 1 12-6" />
    </>
  ),
  ngos: (
    <>
      <ellipse cx="60" cy="106" rx="30" ry="4.5" className="f-shadow" />
      <path className="s draw f-mint" d="M26 60L60 30l34 30v42H26z" />
      <path className="s draw s-soft" d="M20 64L60 26l40 38" />
      <path className="s draw f-coral" d="M60 92c-12-8-17-14-14-20.5 2.6-5 9-5.4 14 .3 5-5.7 11.4-5.3 14-.3 3 6.5-2 12.5-14 20.5z" />
      <path className="f-signal twinkle" d="M96 22l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" />
    </>
  ),
  notices: (
    <>
      <ellipse cx="56" cy="106" rx="26" ry="4.5" className="f-shadow" />
      <path className="s draw f-signal" d="M30 52l42-20v58L30 72z" />
      <rect className="s draw f-light" x="20" y="50" width="12" height="24" rx="4" />
      <path className="s draw" d="M38 74l6 22h11l-5-19" />
      <path className="s draw s-mint wave" d="M84 48a17 17 0 0 1 0 26" />
      <path className="s draw s-mint wave wave-2" d="M93 39a29 29 0 0 1 0 44" />
    </>
  ),
  trophy: (
    <>
      <ellipse cx="60" cy="108" rx="28" ry="4.5" className="f-shadow" />
      <path className="s draw f-signal" d="M40 22h40v22a20 20 0 0 1-40 0z" />
      <path className="s draw" d="M40 29H29a11 11 0 0 0 12 17M80 29h11a11 11 0 0 1-12 17" />
      <path className="s draw" d="M60 64v14" />
      <rect className="s draw f-light" x="45" y="78" width="30" height="8" rx="2" />
      <rect className="s draw f-mint" x="37" y="86" width="46" height="14" rx="3" />
      <path className="f-white" d="M60 31l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
      <path className="f-signal twinkle" d="M98 18l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" />
    </>
  ),
};

// Two short labels per page. Descriptive, never made-up numbers.
const LABELS = {
  issues: [["ri-map-pin-2-fill", "Reported nearby"], ["ri-checkbox-circle-fill", "Tracked to fixed"]],
  cleanups: [["ri-calendar-event-fill", "Weekend drives"], ["ri-team-fill", "Neighbours join in"]],
  volunteers: [["ri-hand-heart-fill", "Give an hour"], ["ri-seedling-fill", "Grow your street"]],
  polls: [["ri-checkbox-circle-fill", "Your vote counts"], ["ri-bar-chart-2-fill", "Results in real time"]],
  animals: [["ri-first-aid-kit-fill", "Rescue & treatment"], ["ri-heart-3-fill", "Adopt a friend"]],
  lostfound: [["ri-key-2-fill", "Lost it? Post it"], ["ri-map-pin-2-fill", "Found near you"]],
  ngos: [["ri-shield-check-fill", "Verified groups"], ["ri-hand-coin-fill", "Support their work"]],
  notices: [["ri-megaphone-fill", "Official updates"], ["ri-alarm-warning-fill", "Know before it happens"]],
  trophy: [["ri-medal-fill", "Earn points"], ["ri-fire-fill", "Keep your streak"]],
};

export default function PageArt({ scene }) {
  const emblem = EMBLEMS[scene];
  if (!emblem) return null;
  const [first, second] = LABELS[scene] || [];
  return (
    <div className="cn-art" aria-hidden="true">
      <div className="cn-art-glow" />
      <div className="cn-art-ring" />
      <div className="cn-art-ring cn-art-ring-2" />
      <div className="cn-art-tile">
        <svg viewBox="0 0 120 120" className="cn-art-emblem">{emblem}</svg>
      </div>
      {first && (
        <span className="cn-art-label cn-art-label-a">
          <i className={first[0]} /> {first[1]}
        </span>
      )}
      {second && (
        <span className="cn-art-label cn-art-label-b">
          <i className={second[0]} /> {second[1]}
        </span>
      )}
    </div>
  );
}
