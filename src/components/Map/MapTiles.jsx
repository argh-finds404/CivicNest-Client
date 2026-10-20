import React, { useRef, useState } from "react";
import { TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useTheme } from "../../hooks/useTheme";

// Leaflet's default marker looks for its images relative to the CSS file,
// which breaks under Vite. Point it at the bundled copies once, for every map.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const OSM = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: "abc",
};
const CARTO_ATTRIBUTION = `${OSM.attribution} &copy; <a href="https://carto.com/attributions">CARTO</a>`;

// Keyless tile providers, tried in order
const PROVIDERS = {
  light: [
    { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", attribution: CARTO_ATTRIBUTION, subdomains: "abcd" },
    OSM,
  ],
  dark: [
    { url: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png", attribution: CARTO_ATTRIBUTION, subdomains: "abcd" },
    OSM,
  ],
};

/**
 * Base map tiles that follow the theme. If the first provider's tiles keep
 * failing before any loads (blocked, rate limited, down), it switches to the
 * next one, so the map is never left blank.
 */
export function MapTiles() {
  const { isDark } = useTheme();
  const [index, setIndex] = useState(0);
  const failures = useRef(0);
  const loadedOnce = useRef(false);
  const list = PROVIDERS[isDark ? "dark" : "light"];
  const provider = list[Math.min(index, list.length - 1)];

  return (
    <TileLayer
      key={provider.url}
      url={provider.url}
      attribution={provider.attribution}
      subdomains={provider.subdomains}
      maxZoom={19}
      eventHandlers={{
        tileload: () => {
          loadedOnce.current = true;
        },
        tileerror: () => {
          failures.current += 1;
          if (!loadedOnce.current && failures.current >= 3 && index < list.length - 1) {
            failures.current = 0;
            setIndex((i) => i + 1);
          }
        },
      }}
    />
  );
}
