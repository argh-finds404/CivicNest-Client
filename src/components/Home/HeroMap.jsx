import React, { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { MapTiles } from "../Map/MapTiles";
import { pinIcon, DHAKA } from "../Map/mapIcons";

const issueColor = (status) =>
  status === "solved" ? "#16a34a" : ["action_taken", "pending_verification"].includes(status) ? "#d97706" : "#e11d48";

function FitToPoints({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 14 });
    else if (points.length === 1) map.setView(points[0], 14);
  }, [points, map]);
  return null;
}

/**
 * Live map for the home hero: real street tiles with the latest issues,
 * cleanups and animals in need pinned where they are.
 */
export default function HeroMap() {
  const axiosPublic = useAxiosPublic();
  const { data } = useQuery({
    queryKey: ["community-map"],
    queryFn: async () => (await axiosPublic.get("/public/map")).data,
    staleTime: 60 * 1000,
  });

  const pins = useMemo(() => [
    ...(data?.issues || []).map((i) => ({ id: i._id, pos: [i.lat, i.lng], color: issueColor(i.status), icon: "ri-error-warning-fill", title: i.title, meta: i.area, to: `/issues/${i._id}` })),
    ...(data?.events || []).map((e) => ({ id: e._id, pos: [e.lat, e.lng], color: "#0f766e", icon: "ri-leaf-fill", title: e.title, meta: `Cleanup · ${e.goingCount} going`, to: `/cleanup-events/${e._id}` })),
    ...(data?.animals || []).map((a) => ({ id: a._id, pos: [a.lat, a.lng], color: "#7c3aed", icon: "ri-heart-pulse-fill", title: a.condition, meta: a.area, to: `/animals/${a._id}` })),
  ], [data]);
  const points = useMemo(() => pins.map((p) => p.pos), [pins]);

  return (
    <div className="cn-hero-livemap">
      <MapContainer center={DHAKA} zoom={12} scrollWheelZoom={false} className="w-full h-full" attributionControl>
        <MapTiles />
        <FitToPoints points={points} />
        {pins.map((p) => (
          <Marker key={p.id} position={p.pos} icon={pinIcon(p.color, p.icon)}>
            <Popup>
              <div className="w-[200px] font-body">
                <p className="font-bold text-[13px] leading-snug text-slate-900 dark:text-white mb-1">{p.title}</p>
                {p.meta && <p className="text-[12px] text-slate-500 dark:text-slate-300 mb-2">{p.meta}</p>}
                <Link to={p.to} className="text-[12px] font-bold text-teal-700 dark:text-teal-300 hover:underline">Open →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <Link to="/map" className="cn-hero-livemap-open">
        <i className="ri-map-2-line" aria-hidden="true" /> Open full map
      </Link>
    </div>
  );
}
