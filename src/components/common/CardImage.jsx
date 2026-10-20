import React, { useState } from "react";
import {
  Bird, Cat, Dog, FileText, HeartHandshake, ImageOff, KeyRound, Package,
  PawPrint, Shirt, Smartphone, TriangleAlert, Trees,
} from "lucide-react";

// Artwork shown in place of a missing photo, picked from what the card is about
const ART = {
  dog: { Icon: Dog, tone: "teal" },
  cat: { Icon: Cat, tone: "amber" },
  bird: { Icon: Bird, tone: "sky" },
  animal: { Icon: PawPrint, tone: "teal" },
  pets: { Icon: PawPrint, tone: "teal" },
  electronics: { Icon: Smartphone, tone: "sky" },
  documents: { Icon: FileText, tone: "amber" },
  keys: { Icon: KeyRound, tone: "amber" },
  clothing: { Icon: Shirt, tone: "rose" },
  item: { Icon: Package, tone: "slate" },
  cleanup: { Icon: Trees, tone: "teal" },
  issue: { Icon: TriangleAlert, tone: "amber" },
  ngo: { Icon: HeartHandshake, tone: "rose" },
};

/** Artwork for a card with no usable photo. Drawn in the page, so it always shows. */
export function MediaFallback({ kind, label, compact = false }) {
  const { Icon, tone } = ART[String(kind || "").toLowerCase()] || { Icon: ImageOff, tone: "slate" };
  return (
    <div className={`cn-media-fallback${compact ? " is-compact" : ""}`} data-tone={tone} role="img" aria-label={label || "No photo"}>
      <span className="cn-media-fallback-icon"><Icon strokeWidth={1.6} aria-hidden="true" /></span>
      {!compact && label && <span className="cn-media-fallback-label">{label}</span>}
    </div>
  );
}

/**
 * Photo for a card. When there is no photo, or it fails to load, shows
 * MediaFallback instead of a broken image and its alt text.
 */
export default function CardImage({ src, alt, kind, label, compact, className = "w-full h-full object-cover" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return <MediaFallback kind={kind} label={label} compact={compact} />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}
