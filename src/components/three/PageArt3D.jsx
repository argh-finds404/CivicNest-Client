import React, { Suspense, lazy, useEffect, useState } from "react";

const Scene3D = lazy(() => import("./Scene3D"));
const QUERY = "(min-width: 1024px)";

/**
 * Header 3D model for a page (see MODELS in models.jsx). Desktop only: on
 * smaller screens the header has no art column, so three.js isn't loaded.
 */
export default function PageArt3D({ model, label }) {
  const [wide, setWide] = useState(() => window.matchMedia?.(QUERY).matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const onChange = (e) => setWide(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!wide) return null;
  return (
    <Suspense fallback={<div className="cn-scene3d" aria-hidden="true" />}>
      <Scene3D model={model} label={label} />
    </Suspense>
  );
}
