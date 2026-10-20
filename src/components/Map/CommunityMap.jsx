import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import SEO from "../common/SEO";
import BackButton from "../common/BackButton";
import CardImage from "../common/CardImage";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { MapTiles } from "./MapTiles";
import { pinIcon, youAreHereIcon, DHAKA } from "./mapIcons";

const LAYERS = [
  { key: "issues", label: "Issues", icon: "ri-error-warning-fill", color: "#e11d48" },
  { key: "events", label: "Cleanup drives", icon: "ri-leaf-fill", color: "#0f766e" },
  { key: "animals", label: "Animals in need", icon: "ri-heart-pulse-fill", color: "#7c3aed" },
];

// Issue pins by status: solved green, in progress amber, everything else red
const issueColor = (status) =>
  status === "solved" ? "#16a34a" : ["action_taken", "pending_verification"].includes(status) ? "#d97706" : "#e11d48";

const STATUS_LABEL = {
  open: "Open",
  action_taken: "Being fixed",
  pending_verification: "Awaiting verification",
  solved: "Solved",
};

/** Zoom to fit whatever is on the map, once the data arrives */
function FitToPoints({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 15);
    else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
  }, [points, map]);
  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 0.8 });
  }, [position, map]);
  return null;
}

function PopupCard({ image, kind, eyebrow, title, meta, to, cta }) {
  return (
    <div className="w-[220px] font-body">
      <div className="h-24 -mx-1 mb-2 rounded-lg overflow-hidden bg-slate-100">
        <CardImage src={image} alt={title} kind={kind} compact />
      </div>
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">{eyebrow}</span>
      <p className="font-bold text-[13px] leading-snug text-slate-900 dark:text-white mt-0.5 mb-1">{title}</p>
      {meta && <p className="text-[12px] text-slate-500 dark:text-slate-300 mb-2">{meta}</p>}
      <Link to={to} className="cn-btn cn-btn-primary cn-btn-sm w-full justify-center !text-white">
        {cta} <i className="ri-arrow-right-line" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function CommunityMap() {
  const axiosPublic = useAxiosPublic();
  const [visible, setVisible] = useState({ issues: true, events: true, animals: true });
  const [me, setMe] = useState(null);
  const [locating, setLocating] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["community-map"],
    queryFn: async () => (await axiosPublic.get("/public/map")).data,
    staleTime: 60 * 1000,
  });

  const layers = useMemo(() => ({
    issues: data?.issues || [],
    events: data?.events || [],
    animals: data?.animals || [],
  }), [data]);

  const points = useMemo(
    () => LAYERS.flatMap(({ key }) => (visible[key] ? layers[key] : [])).map((p) => [p.lat, p.lng]),
    [layers, visible]
  );
  // Fit once per data load, not on every filter toggle
  const fitPoints = useMemo(
    () => [...layers.issues, ...layers.events, ...layers.animals].map((p) => [p.lat, p.lng]),
    [layers]
  );

  const locate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser can't share its location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        toast.error("Location permission was denied.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-[5%]">
      <SEO title="Live Civic Map" />
      <div className="max-w-7xl mx-auto">
        <BackButton variant="dark" className="mb-6 inline-flex" />
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl tracking-tight text-slate-900 dark:text-white mb-2">Community Map</h1>
            <p className="font-body text-slate-500 dark:text-slate-300 text-[14px]">
              Reported issues, upcoming cleanup drives and animals that need help, pinned where they are.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Show on map">
            {LAYERS.map((l) => (
              <button
                key={l.key}
                type="button"
                aria-pressed={visible[l.key]}
                onClick={() => setVisible((v) => ({ ...v, [l.key]: !v[l.key] }))}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[13px] font-semibold transition-colors cursor-pointer ${
                  visible[l.key]
                    ? "bg-white dark:bg-white/10 border-slate-200 dark:border-white/15 text-slate-800 dark:text-white shadow-sm"
                    : "border-dashed border-slate-300 dark:border-white/15 text-slate-400"
                }`}>
                <span className="w-3 h-3 rounded-full" style={{ background: visible[l.key] ? l.color : "#cbd5e1" }} />
                {l.label}
                <span className="text-[11px] font-bold text-slate-400">{layers[l.key].length}</span>
              </button>
            ))}
            <button type="button" onClick={locate} disabled={locating} className="cn-btn cn-btn-sm cn-btn-ghost disabled:opacity-60">
              <i className={locating ? "ri-loader-4-line animate-spin" : "ri-focus-3-line"} aria-hidden="true" /> Near me
            </button>
          </div>
        </div>

        <div className="cn-glass-card border overflow-hidden h-[620px] relative z-0">
          <MapContainer center={DHAKA} zoom={12} scrollWheelZoom className="w-full h-full z-0">
            <MapTiles />
            <FitToPoints points={fitPoints} />
            <FlyTo position={me} />
            {me && (
              <Marker position={me} icon={youAreHereIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {visible.issues && layers.issues.map((i) => (
              <Marker key={i._id} position={[i.lat, i.lng]} icon={pinIcon(issueColor(i.status), "ri-error-warning-fill")}>
                <Popup>
                  <PopupCard image={i.image} kind="issue" eyebrow={`${i.category} · ${STATUS_LABEL[i.status] || i.status}`}
                    title={i.title} meta={i.area} to={`/issues/${i._id}`} cta="View issue" />
                </Popup>
              </Marker>
            ))}

            {visible.events && layers.events.map((e) => (
              <Marker key={e._id} position={[e.lat, e.lng]} icon={pinIcon("#0f766e", "ri-leaf-fill")}>
                <Popup>
                  <PopupCard image={e.image} kind="cleanup" eyebrow="Cleanup drive"
                    title={e.title}
                    meta={`${new Date(e.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}${e.eventTime ? `, ${e.eventTime}` : ""} · ${e.goingCount} going`}
                    to={`/cleanup-events/${e._id}`} cta="View drive" />
                </Popup>
              </Marker>
            ))}

            {visible.animals && layers.animals.map((a) => (
              <Marker key={a._id} position={[a.lat, a.lng]} icon={pinIcon("#7c3aed", "ri-heart-pulse-fill")}>
                <Popup>
                  <PopupCard image={a.image} kind={String(a.animalType || "animal").toLowerCase()} eyebrow={`${a.animalType} · ${a.urgency || "needs help"}`}
                    title={a.condition} meta={a.area} to={`/animals/${a._id}`} cta="Help this animal" />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {isLoading && (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-white/60 dark:bg-black/40 pointer-events-none">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-600 dark:text-slate-200">
                <i className="ri-loader-4-line animate-spin" aria-hidden="true" /> Loading the map…
              </span>
            </div>
          )}
          {isError && (
            <div className="absolute inset-x-0 top-4 z-[500] flex justify-center">
              <div className="cn-glass-card border px-4 py-2.5 flex items-center gap-3 text-[13px]">
                Couldn't load the map pins.
                <button type="button" onClick={() => refetch()} className="cn-btn cn-btn-sm cn-btn-primary">Try again</button>
              </div>
            </div>
          )}
          {!isLoading && !isError && points.length === 0 && (
            <div className="absolute inset-x-0 top-4 z-[500] flex justify-center pointer-events-none">
              <div className="cn-glass-card border px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-200">Nothing to show for these filters yet.</div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-slate-500 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" /> Open issue</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" /> Being fixed</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" /> Solved</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0f766e]" /> Cleanup drive</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" /> Animal in need</span>
        </div>
      </div>
    </div>
  );
}
