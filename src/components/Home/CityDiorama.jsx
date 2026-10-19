import React, { useEffect, useRef } from "react";
import { Link } from "react-router";
import "./CityDiorama.css";

/*
 * An isometric neighbourhood built from CSS 3D boxes. Real activity is pinned
 * onto it: open issues (red), fixed issues (green) and upcoming cleanups
 * (yellow). The block tilts toward the pointer. Everything is transforms on
 * the compositor, so it costs almost nothing while scrolling, and it stops
 * animating while it's off-screen.
 */

// r = road, w = water, p = park, s = plaza, digits = building height step
const MAP = [
  "34r2pw",
  "52r1pw",
  "rrrrrw",
  "2sr13w",
  "13r42w",
  "21r16w",
];

// Cells where pins stand, in fill order: spread out, and mostly on rooftops
// that nothing taller sits in front of, so every pin stays readable
const PIN_SLOTS = [[1, 0], [0, 3], [3, 4], [5, 4], [4, 1], [1, 4], [3, 1], [4, 4], [0, 0]];

const KIND = {
  open: { icon: "ri-error-warning-fill", label: "Open issue" },
  solved: { icon: "ri-check-line", label: "Fixed" },
  event: { icon: "ri-leaf-fill", label: "Cleanup" },
};

const heightOf = (ch) => (/\d/.test(ch) ? Number(ch) * 14 + 10 : ch === "p" ? 4 : 0);

export default function CityDiorama({ pins = [], size = "lg" }) {
  const stageRef = useRef(null);

  // Pointer tilt: write CSS variables directly, once per frame, no React renders
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frame = null;
    let target = { x: 0, y: 0 };
    const apply = () => {
      frame = null;
      stage.style.setProperty("--tx", `${target.x}deg`);
      stage.style.setProperty("--ty", `${target.y}deg`);
    };
    // Ignore pointer tilt while the page is scrolling: the pointer "moves" over
    // the scene only because the page does, and restyling the 3D scene then
    // competes with the scroll for frame time
    let scrollingUntil = 0;
    const onScroll = () => {
      scrollingUntil = performance.now() + 180;
    };
    const onMove = (e) => {
      if (performance.now() < scrollingUntil) return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      target = { x: px * 10, y: -py * 8 };
      if (frame === null) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      target = { x: 0, y: 0 };
      if (frame === null) frame = requestAnimationFrame(apply);
    };

    const host = stage.closest("[data-diorama-host]") || stage;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Pause the ambient animations while off-screen
    const io = new IntersectionObserver(([entry]) => {
      stage.classList.toggle("is-paused", !entry.isIntersecting);
    });
    io.observe(stage);

    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const placed = pins.slice(0, PIN_SLOTS.length).map((pin, i) => {
    const [row, col] = PIN_SLOTS[i];
    return { ...pin, row, col, h: heightOf(MAP[row][col]), i };
  });

  return (
    <div className={`cd-stage${size === "md" ? " cd-stage-md" : ""}`} ref={stageRef}>
      <div className="cd-scene">
        <div className="cd-ground" aria-hidden="true" />

        {MAP.flatMap((line, row) =>
          [...line].map((ch, col) => {
            const style = { "--r": row, "--c": col, "--h": `${heightOf(ch)}px` };
            if (ch === "r") return <div key={`${row}-${col}`} className={`cd-cell ${row === 2 ? "cd-road-h" : "cd-road-v"}`} style={style} aria-hidden="true" />;
            if (ch === "w") return <div key={`${row}-${col}`} className="cd-cell cd-water" style={style} aria-hidden="true" />;
            if (ch === "s") return <div key={`${row}-${col}`} className="cd-cell cd-plaza" style={style} aria-hidden="true" />;
            if (ch === "p")
              return (
                <div key={`${row}-${col}`} className="cd-cell cd-park" style={style} aria-hidden="true">
                  <span className="cd-tree" style={{ "--x": "28%", "--y": "30%" }} />
                  <span className="cd-tree" style={{ "--x": "66%", "--y": "58%" }} />
                </div>
              );
            const tall = Number(ch) >= 5;
            return (
              <div key={`${row}-${col}`} className={`cd-cell cd-bldg${tall ? " cd-bldg-civic" : ""}`} style={style} aria-hidden="true">
                <i className="cd-face cd-top" />
                <i className="cd-face cd-front" />
                <i className="cd-face cd-side" />
              </div>
            );
          })
        )}

        {placed.map((pin) => (
          <div
            key={pin.id}
            className={`cd-pin cd-pin-${pin.kind}${pin.i >= 5 ? " cd-pin-extra" : ""}`}
            style={{ "--r": pin.row, "--c": pin.col, "--h": `${pin.h}px`, "--i": pin.i }}
          >
            <Link to={pin.href} className="cd-pin-bb" aria-label={`${KIND[pin.kind].label}: ${pin.label}`}>
              <span className="cd-pin-head">
                <i className={KIND[pin.kind].icon} aria-hidden="true" />
              </span>
              <span className="cd-pin-stick" aria-hidden="true" />
              <span className="cd-pin-tip" role="tooltip">{pin.label}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
