import React, { useState, useEffect } from"react";
import SEO from "../common/SEO";
import { useTheme } from'../../hooks/useTheme';
import { MapContainer, TileLayer, Marker, Popup, useMap } from"react-leaflet";
import"leaflet/dist/leaflet.css";
import L from"leaflet";
import { useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import useAxiosPublic from"../../hooks/useAxiosPublic";

import iconRetinaUrl from'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from'leaflet/dist/images/marker-icon.png';
import shadowUrl from'leaflet/dist/images/marker-shadow.png';
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl,
 iconUrl,
 shadowUrl,
});

const greenIcon = new L.Icon({
 iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
 shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
 iconSize: [25, 41],
 iconAnchor: [12, 41],
 popupAnchor: [1, -34],
 shadowSize: [41, 41]
});

function MapController({ center }) {
 const map = useMap();
 useEffect(() => {
 if (center) {
 map.setView(center, map.getZoom());
 }
 }, [center, map]);
 return null;
}

export default function CommunityMap() {
 const { isDark } = useTheme();
 const axiosSecure = useAxiosSecure();
 const axiosPublic = useAxiosPublic();
 const [userLocation, setUserLocation] = useState([23.8103, 90.4125]); // Default Dhaka
 const [isLocationReal, setIsLocationReal] = useState(false);

 useEffect(() => {
 if ("geolocation"in navigator) {
 navigator.geolocation.getCurrentPosition(
 (position) => {
 setUserLocation([position.coords.latitude, position.coords.longitude]);
 setIsLocationReal(true);
 },
 (error) => {
 console.error("Error getting location:", error);
 }
 );
 }
 }, []);

 const { data: issues = [], isLoading: issuesLoading } = useQuery({
 queryKey: ["mapIssues"],
 queryFn: async () => {
 const res = await axiosSecure.get("/issues");
 return res.data.issues || [];
 },
 staleTime: 5 * 60 * 1000,
 });

 const { data: eventsData, isLoading: eventsLoading } = useQuery({
 queryKey: ["mapEvents"],
 queryFn: async () => {
 const res = await axiosPublic.get("/cleanup-events", { params: { upcoming: true } });
 return res.data?.events || [];
 },
 staleTime: 5 * 60 * 1000,
 });

 const isLoading = issuesLoading || eventsLoading;
 const events = eventsData || [];

 return (
 <div className="min-h-screen pt-28 pb-20 px-[5%]">
 <SEO title="Live Civic Map" />
 <div className="max-w-7xl mx-auto">
 <BackButton variant="dark"className="mb-6 inline-flex"/>
 <h1 className="font-heading text-5xl tracking-tight md:text-6xl text-slate-850 mb-2 tracking-tight">Community Map</h1>
 <p className="font-body text-slate-500 dark:text-slate-300 text-[13px] mb-10">
 Visualize active issues, reported animals, and cleanup drives in your area.
 </p>
 
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-[#1e3040] h-[600px] z-0 relative">
 {isLoading ? (
 <div className="w-full h-full flex items-center justify-center">
 <MinimalLoader />
 </div>
 ) : (
 <MapContainer 
 center={userLocation} 
 zoom={13} 
 scrollWheelZoom={true} 
 className="w-full h-full z-0">
 <MapController center={userLocation} />
 <TileLayer
 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'url={isDark ?"https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png":"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}/>
 
 {isLocationReal && (
 <Marker position={userLocation}>
 <Popup>
 <div className="font-body">
 <h3 className="font-bold text-[13px] mb-1 tracking-tight">Your Location</h3>
 <p className="text-[13px]">You are here</p>
 </div>
 </Popup>
 </Marker>
 )}

 {issues.map(issue => {
    const hasRealCoords = issue.coordinates?.lat && issue.coordinates?.lng;
    const position = hasRealCoords 
      ? [issue.coordinates.lat, issue.coordinates.lng]
      : [
          userLocation[0] + (Math.random() - 0.5) * 0.1, 
          userLocation[1] + (Math.random() - 0.5) * 0.1
        ];
    return (
    <Marker 
    key={issue._id} 
    position={position}
    >
 <Popup>
 <div className="font-body">
 <h3 className="font-bold text-[13px] mb-1 tracking-tight">{issue.title}</h3>
 <p className="text-[13px] mb-2 text-on-surface-variant">{issue.category}</p>
 <a href={`/issues/${issue._id}`} className="text-primary hover:underline font-bold text-[13px]">View Details</a>
 </div>
 </Popup>
 </Marker>
 );
 })}

 {events.filter(e => e.location?.coordinates?.length === 2).map(event => (
 <Marker
 key={event._id}
 position={[event.location.coordinates[1], event.location.coordinates[0]]}
 icon={greenIcon}
 >
 <Popup>
 <div className="font-body">
 <div className="flex items-center gap-2 text-teal-600 mb-1">
 <span className="material-symbols-outlined text-[13px]">calendar_month</span>
 <span className="text-xs font-bold uppercase tracking-wider">Cleanup Drive</span>
 </div>
 <h3 className="font-bold text-[13px] mb-1 leading-tight tracking-tight">{event.title}</h3>
 <p className="text-[13px] text-on-surface-variant mb-2">
 {new Date(event.eventDate).toLocaleDateString()} · {event.goingCount} going
 </p>
 <a href={`/cleanup-events/${event._id}`} className="text-teal-600 hover:underline font-bold text-[13px] block">View Event →</a>
 </div>
 </Popup>
 </Marker>
 ))}
 </MapContainer>
 )}
 </div>
 </div>
 </div>
 );
}
