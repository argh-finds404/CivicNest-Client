import React from "react";
import "./PageHeader.css";

/**
 * Shared header for top-level pages. Same ground, width and alignment as the
 * home hero so every section of the app lines up.
 *
 * - title / description: the page's job in plain words
 * - actions: primary buttons (use cn-btn classes)
 * - meta: a short line of live facts under the actions
 * - art: optional illustration (3D pieces) shown on the right from lg up
 * - width / gutter: match the page's own content container. Padding inside the
 *   max-width box (Tailwind max-w-5xl px-4) = "64rem" / "1rem"; padding on an
 *   outer wrapper (px-[5%] around max-w-7xl) = "calc(80rem + 10%)" / "5%".
 *   That way the header text lines up with the content below it.
 */
export default function PageHeader({ title, description, actions, meta, art, width = "1280px", gutter = "1.5rem", children }) {
  return (
    <header
      className={`cn-page-head${art ? " cn-page-head-art" : ""}`}
      style={{ "--head-w": width, "--head-g": gutter }}
    >
      <div className="cn-page-head-inner">
        <div className="cn-page-head-copy">
          <h1 className="cn-page-head-title">{title}</h1>
          {description && <p className="cn-page-head-desc">{description}</p>}
          {actions && <div className="cn-page-head-actions">{actions}</div>}
          {meta && <div className="cn-page-head-meta">{meta}</div>}
          {children}
        </div>
        {art && (
          <div className="cn-page-head-art-slot" aria-hidden="true">
            {art}
          </div>
        )}
      </div>
    </header>
  );
}
