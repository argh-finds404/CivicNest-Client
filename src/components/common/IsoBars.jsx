import React from "react";
import "./IsoBars.css";

/**
 * Extruded 3D bars seen from a three-quarter angle, with an upright card
 * ("cap") standing on each one. Used for the leaderboard podium and live poll
 * results. Pure CSS transforms: cheap to render and static after it grows in.
 *
 * Caps and labels live in a second scene with the same transform, layered on
 * top. Separate 3D contexts are painted in order instead of depth-sorted
 * against each other, so a bar can never hide its own card.
 *
 * bars: [{ id, height (px), tone: "canopy" | "signal" | "hydrant" | "stone", cap, label }]
 */
export default function IsoBars({ bars, barWidth = 84, barDepth = 84, gap = 14, className = "", ariaLabel }) {
  const width = bars.length * barWidth + (bars.length - 1) * gap;
  const sceneStyle = { width, height: barDepth, "--w": `${barWidth}px`, "--d": `${barDepth}px` };
  const posOf = (bar, i) => ({ "--x": `${i * (barWidth + gap)}px`, "--h": `${Math.max(6, bar.height)}px`, "--i": i });

  return (
    <div className={`ib-stage ${className}`} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel}>
      <div className="ib-scene" style={sceneStyle}>
        <div className="ib-plinth" />
        {bars.map((bar, i) => (
          <div key={bar.id} className={`ib-bar ib-${bar.tone || "stone"}`} style={posOf(bar, i)}>
            <i className="ib-face ib-top" />
            <i className="ib-face ib-front" />
            <i className="ib-face ib-side" />
          </div>
        ))}
      </div>

      <div className="ib-scene ib-scene-overlay" style={sceneStyle}>
        {bars.map((bar, i) => (
          <React.Fragment key={bar.id}>
            {bar.cap && (
              <div className="ib-anchor" style={posOf(bar, i)}>
                <div className="ib-cap">
                  <div className="ib-cap-in">{bar.cap}</div>
                </div>
              </div>
            )}
            {bar.label && (
              <div className="ib-anchor ib-anchor-base" style={posOf(bar, i)}>
                <div className="ib-label">
                  <div className="ib-label-in">{bar.label}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
