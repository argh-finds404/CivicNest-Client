import React, { useState } from'react';
import { useTheme } from'../../hooks/useTheme';
import { useParams, Link } from'react-router';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import { useRole } from'../../hooks/useRole';
import CountdownTimer from'./CountdownTimer';
import MinimalLoader from'../common/MinimalLoader';
import toast from'react-hot-toast';
import EventDonationModal from'./EventDonationModal';
import BackButton from'../common/BackButton';
import SEO from'../common/SEO';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import'leaflet/dist/leaflet.css';
import L from'leaflet';

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
 iconUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
 shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function CleanupEventDetails() {
 const { id } = useParams();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const { user } = useAuth();
 const [role] = useRole();
 const { isDark } = useTheme();
 const { data: statusData } = useQuery({
 queryKey: ["volunteerStatus", user?.email],
 enabled: !!user?.email,
 queryFn: () => axiosSecure.get("/volunteers/status").then(r => r.data)
 });
 const isVolunteer = statusData?.isRegistered;
 const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
 const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
 const [organizerImgError, setOrganizerImgError] = useState(false);

 const { data: event, isLoading, isError } = useQuery({
 queryKey: ['cleanupEvent', id],
 queryFn: async () => {
 const res = await axiosSecure.get(`/cleanup-events/${id}`);
 return res.data;
 }
 });

 const [checkinCode, setCheckinCode] = useState(null);

 React.useEffect(() => {
 if (event?.checkinCode) {
 setCheckinCode(event.checkinCode);
 }
 }, [event]);

 const generateCodeMutation = useMutation({
 mutationFn: () => axiosSecure.post(`/cleanup-events/${id}/generate-checkin-code`),
 onSuccess: (res) => {
 setCheckinCode(res.data.code);
 toast.success('Check-in code generated! Show this to attendees.');
 },
 onError: (err) => {
 toast.error(err.response?.data?.message ||'Failed to generate code.');
 }
 });

 const toggleInterestMutation = useMutation({
 mutationFn: async () => {
 const res = await axiosSecure.post(`/cleanup-events/${id}/interested`);
 return res.data;
 },
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleanupEvent', id] })
 });

 const toggleGoingMutation = useMutation({
 mutationFn: async () => {
 const res = await axiosSecure.post(`/cleanup-events/${id}/going`);
 return res.data;
 },
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleanupEvent', id] }),
 onError: (err) => toast.error(err.response?.data?.message ||'Failed to RSVP')
 });

 const completeMutation = useMutation({
 mutationFn: async (photos) => {
 const res = await axiosSecure.post(`/cleanup-events/${id}/complete`, { postEventPhotos: photos });
 return res.data;
 },
 onSuccess: () => {
 toast.success('Event marked as completed!');
 queryClient.invalidateQueries({ queryKey: ['cleanupEvent', id] });
 }
 });

 const cancelMutation = useMutation({
 mutationFn: async (reason) => {
 const res = await axiosSecure.post(`/cleanup-events/${id}/cancel`, { reason });
 return res.data;
 },
 onSuccess: () => {
 toast.success('Event cancelled.');
 queryClient.invalidateQueries({ queryKey: ['cleanupEvent', id] });
 }
 });

 if (isLoading) return <div className="min-h-screen pt-28 flex justify-center"><MinimalLoader /></div>;
  if (isError || !event) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070b09] px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <SEO title="Event Not Found - CivicNest" />
        
        {/* Animated Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/80 border border-slate-200 dark:border-[#1e3040]/60 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] flex flex-col items-center">
          
          {/* Top subtle visual accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />
          
          {/* Animated Illustration Container */}
          <div className="w-28 h-28 bg-teal-500/10 dark:bg-[#14241d]/50 rounded-full flex items-center justify-center mb-8 relative border border-teal-100 dark:border-[#1e3040]/30 shadow-inner group">
            {/* Pulsing Outer Ring */}
            <div className="absolute inset-0 rounded-full bg-teal-500/5 animate-ping opacity-75" />
            
            {/* Detailed Premium Custom SVG Illustration */}
            <svg 
              className="w-16 h-16 text-teal-600 dark:text-teal-400 drop-shadow-md" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Map pin shape */}
              <path 
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" 
                className="animate-[pulse_3s_infinite_ease-in-out]"
              />
              {/* Question mark inside map pin */}
              <path 
                d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" 
                strokeDasharray="4 4"
                className="animate-[pulse_2s_infinite_ease-in-out]"
              />
              <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
              
              {/* Searching magnifying glass floating on the side */}
              <circle cx="17.5" cy="6.5" r="2.5" fill="none" strokeWidth="1.2" className="animate-[bounce_4s_infinite_ease-in-out]" />
              <line x1="19.25" y1="8.25" x2="21.5" y2="10.5" strokeWidth="1.2" className="animate-[bounce_4s_infinite_ease-in-out]" />
            </svg>
            
            {/* Small leaf/star icons representing cleanliness theme */}
            <span className="material-symbols-outlined absolute -top-1 -right-1 text-emerald-500 animate-bounce text-[20px]">leaf</span>
            <span className="material-symbols-outlined absolute -bottom-1 -left-1 text-teal-500 animate-[pulse_2s_infinite] text-[18px]">psychology</span>
          </div>

          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
            Event Not Found
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-8">
            The cleanup drive you are looking for might have been completed, cancelled, or the link is incorrect. Don't worry, there are plenty of other cleanups waiting for your contribution!
          </p>

          <div className="w-full space-y-3">
            <Link
              id="browse-events-btn"
              to="/cleanup-events"
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-[13px] tracking-tight rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Browse Cleanup Drives
            </Link>

            <button
              id="go-back-btn"
              onClick={() => window.history.back()}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#1e3040]/40 dark:hover:bg-[#1e3040]/70 text-slate-700 dark:text-[#cbd5e1] font-bold text-[13px] tracking-tight rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-slate-200/60 dark:border-[#1e3040]/80"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Return to Previous Page
            </button>
          </div>

          {/* Quick links footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#1e3040]/40 w-full font-sans">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Popular Cleanliness Tools</p>
            <div className="flex justify-center gap-4 text-xs font-semibold text-teal-600 dark:text-teal-400">
              <Link to="/map" className="hover:underline hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">map</span> Community Map
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link to="/noticeboard" className="hover:underline hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">campaign</span> Noticeboard
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link to="/forum" className="hover:underline hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">forum</span> Forums
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

 const userInterested = event.interested?.includes(user?.email);
 const userGoing = event.going?.some(a => a.email === user?.email);
 const isOrganizer = event.organizer?.email === user?.email;
 const hasAdminPowers = isOrganizer || role ==='admin';
 const isFull = event.maxVolunteers > 0 && event.goingCount >= event.maxVolunteers;
 const isPast = new Date(event.eventDate) < new Date();
 const position = event.location?.coordinates?.length === 2
 ? [event.location.coordinates[1], event.location.coordinates[0]] // [lat, lng]
 : null;

 // Initials for avatar backup
 const organizerInitials = event.organizer?.name
 ? event.organizer.name.split('').map(w => w[0]).join('').toUpperCase().slice(0, 2)
 :'OR';

 const shareEvent = () => {
 if (navigator.share) {
 navigator.share({
 title: event.title,
 text: event.slogan || event.description,
 url: window.location.href,
 }).catch(console.error);
 } else {
 navigator.clipboard.writeText(window.location.href);
 toast.success('Event link copied to clipboard!');
 }
 };

 return (
 <div className="min-h-screen pb-20"style={{ fontFamily:"'Outfit', sans-serif"}}>
 <SEO 
   title={event?.title ? `${event.title} - Cleanup Event Details` : "Cleanup Event Details"} 
   description={event?.description?.slice(0, 155)} 
   image={event?.coverImages?.[0]} 
   type="article" 
 />
 {/* ── HERO SECTION ── */}
 <div className="relative w-full h-[320px] md:h-[450px] bg-slate-950 overflow-hidden pt-16">
 <img
 src={event.coverImages?.[0] ||'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=1200&auto=format&fit=crop'}
 alt={event.title}
 className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"/>
 {/* Soft elegant glassmorphic/gradient overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"/>
 <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950/80"/>

 <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-center z-10">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
 <span className="material-symbols-outlined text-[14px]">calendar_today</span>
 {new Date(event.eventDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric'})} · {event.eventTime}
 </div>

 <h1 className="text-3xl tracking-tight md:text-5xl tracking-tight lg:text-6xl font-black text-white mb-3 tracking-tight drop-shadow-md max-w-4xl"style={{ fontFamily:"'Outfit', sans-serif"}}>
 {event.title}
 </h1>

 {event.slogan && (
 <p className="text-teal-300 font-medium italic text-[13px] md:text-[13px] tracking-tight drop-shadow-sm max-w-2xl">"{event.slogan}"</p>
 )}

 {event.status ==='upcoming'&& !isPast && (
 <div className="mt-8 scale-90 md:scale-100 origin-bottom">
 <CountdownTimer targetDate={event.eventDate} />
 </div>
 )}
 </div>

 <div className="absolute top-24 left-6 md:left-12 z-20">
 <BackButton className="!bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/85 !text-slate-800 dark:text-white hover:!bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:!scale-105 transition-all shadow-md border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 rounded-xl"/>
 </div>

 {/* Share Button */}
 <button 
 onClick={shareEvent}
 className="absolute top-24 right-6 md:right-12 w-11 h-11 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/85 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-800 dark:text-white hover:scale-105 transition-all shadow-md border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 rounded-xl flex items-center justify-center z-20">
 <span className="material-symbols-outlined text-[22px]">share</span>
 </button>
 </div>

 {/* ── MAIN CONTENT ── */}
 <div className="max-w-6xl mx-auto px-6 py-12">
 <div className="flex flex-col lg:flex-row gap-10">

 {/* Left Column (Content) */}
 <div className="lg:w-[63%] space-y-10">

 {/* About Card */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 p-4 md:p-5 rounded-xl shadow-sm hover:shadow-md/5 transition-all duration-300">
 <h2 className="text-2xl tracking-tight font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 tracking-tight">
 <span className="w-1.5 h-6 bg-teal-600 rounded-full"/>
 About this Drive
 </h2>
 <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-[13px] font-normal">
 {event.description}
 </p>
 </div>

 {/* Supplies Card */}
 {event.suppliesNeeded?.length > 0 && (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 p-4 md:p-5 rounded-xl shadow-sm hover:shadow-md/5 transition-all duration-300">
 <h3 className="text-[13px] tracking-tight font-extrabold mb-5 text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
 <span className="material-symbols-outlined text-teal-600 text-[26px]">backpack</span>
 What to Bring
 </h3>
 <div className="flex flex-wrap gap-2.5">
 {event.suppliesNeeded.map(s => (
 <span key={s} className="px-4 py-2 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 flex items-center gap-2 shadow-sm">
 <span className="material-symbols-outlined text-[16px] text-teal-600">check_circle</span>
 {s}
 </span>
 ))}
 </div>
 </div>
 )}

 {event.requiredSkills?.length > 0 && (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 p-4 md:p-5 rounded-xl shadow-sm hover:shadow-md/5 transition-all duration-300">
 <h3 className="text-[13px] tracking-tight font-extrabold mb-5 text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
 <span className="material-symbols-outlined text-indigo-600 text-[26px]">psychology</span>
 Skills Welcome
 </h3>
 <div className="flex flex-wrap gap-2.5">
 {event.requiredSkills.map(s => (
 <span key={s} className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-[13px] font-bold text-indigo-800 flex items-center gap-2 shadow-sm">
 <span className="material-symbols-outlined text-[18px] text-indigo-600">workspace_premium</span>
 {s}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Meeting Point Card */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 p-4 md:p-5 rounded-xl shadow-sm hover:shadow-md/5 transition-all duration-300">
 <h3 className="text-[13px] tracking-tight font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
 <span className="material-symbols-outlined text-teal-600 text-[26px]">location_on</span>
 Meeting Instructions
 </h3>
 <p className="text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40 p-4 rounded-lg mb-5 shadow-inner leading-relaxed">
 📍 {event.meetingInstructions || event.location.address}
 </p>

  {position && (
    <div className="relative h-72 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 z-0 shadow-sm group">
      <MapContainer center={position} zoom={15} style={{ height:'100%', width:'100%', zIndex: 0 }}>
        <TileLayer url={isDark ?"https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png":"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}/>
        <Marker position={position}>
          <Popup>
            <div className="p-2 min-w-[200px]" style={{ fontFamily: 'HKGrotesk, sans-serif' }}>
              <h4 className="font-extrabold text-slate-900 text-xs mb-1 truncate">{event.title}</h4>
              <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">{event.location?.address || 'Meeting Point'}</p>
              <div className="flex gap-2">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-[#40826D] hover:bg-[#326756] text-white text-[10px] font-bold px-2 py-1.5 rounded transition-all no-underline"
                >
                  <span className="material-symbols-outlined text-[12px]">directions</span>
                  Directions
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${position[0]}, ${position[1]}`);
                    toast.success("GPS coordinates copied!");
                  }}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1.5 rounded transition-all border border-slate-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">content_copy</span>
                  Copy GPS
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Floating Directions Button */}
      <a 
        href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-[1000] bg-white/95 dark:bg-[#0a120e]/95 hover:bg-white dark:hover:bg-[#0a120e] text-[#40826D] hover:text-[#326756] ring-1 ring-slate-200 dark:ring-[#14241d] font-bold text-[11px] py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 no-underline backdrop-blur-sm"
      >
        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
        Open in Google Maps
      </a>
    </div>
  )}
 </div>

 {/* Gallery Section */}
 {event.status ==='completed'&& event.postEventPhotos?.length > 0 && (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 p-4 md:p-5 rounded-xl shadow-sm hover:shadow-md/5 transition-all duration-300">
 <h3 className="text-2xl tracking-tight font-extrabold mb-5 text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
 <span className="w-1.5 h-6 bg-teal-600 rounded-full"/>
 Drive Gallery
 </h3>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {event.postEventPhotos.map((img, i) => (
 <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm group relative">
 <img src={img} alt="Post Event"className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
 <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
 </div>
 ))}
 </div>
 </div>
 )}

 </div>

 {/* Right Column (Sticky Cards) */}
 <div className="lg:w-[37%] space-y-6">
 <div className="sticky top-28 space-y-6">

 {/* ORGANIZER PANEL */}
 {hasAdminPowers && (
 <div className="bg-gradient-to-tr from-teal-50/90 to-emerald-50/70 border border-teal-200/80 p-4 rounded-xl shadow-sm relative overflow-hidden backdrop-blur-md">
 <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/50 rounded-bl-full -z-0 opacity-40"></div>
 <h3 className="font-extrabold text-teal-800 text-[13px] mb-4 flex items-center gap-2 relative z-10 tracking-tight">
 <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
 {role ==='admin'?'Admin Control Center':'Organizer Portal'}
 </h3>

 <div className="space-y-3 relative z-10">
 <button 
 onClick={() => setIsAttendeesModalOpen(true)} 
 className="w-full py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-teal-800 border border-teal-200/80 rounded-xl font-bold hover:bg-teal-50 hover:border-teal-300 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2">
 <span className="material-symbols-outlined text-[18px]">visibility</span>
 View Attendee List ({event.goingCount})
 </button>

 {event.status ==='upcoming'&& (
 <>
 <button
 onClick={() => {
 const url = prompt("Enter a photo URL for post-event gallery:");
 if (url) completeMutation.mutate([url]);
 }}
 className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow hover:shadow-md transition-all flex items-center justify-center gap-2">
 <span className="material-symbols-outlined text-[18px]">check_circle</span>
 Mark Completed & Upload
 </button>

 <button
 onClick={() => {
 const reason = prompt("Enter cancellation reason:");
 if (reason) cancelMutation.mutate(reason);
 }}
 className="w-full py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50/80 hover:border-red-300 transition-all flex items-center justify-center gap-2">
 <span className="material-symbols-outlined text-[18px]">cancel</span>
 Cancel Event Drive
 </button>
 </>
 )}

 {isOrganizer && event.status ==='upcoming'&& (
 <div className="mt-4 pt-4 border-t border-teal-200/60">
 <p className="text-[13px] font-bold text-teal-850 mb-3 flex items-center gap-1.5">
 <span className="material-symbols-outlined text-[18px]">qr_code</span>
 Event Check-in Code
 </p>
 {checkinCode ? (
 <div className="text-center bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/60 /60 rounded-lg p-4 border border-teal-200/40">
 <p className="text-3xl tracking-tight font-black tracking-[0.2em] text-teal-600 font-mono select-all">
 {checkinCode}
 </p>
 <p className="text-[10px] text-teal-700 font-medium mt-2">
 Share this 6-digit code with attendees at the event location
 </p>
 </div>
 ) : (
 <button
 onClick={() => generateCodeMutation.mutate()}
 disabled={generateCodeMutation.isPending}
 className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-98 flex items-center justify-center gap-2">
 {generateCodeMutation.isPending ?'Generating...':'Generate Check-in Code'}
 </button>
 )}
 </div>
 )}
 </div>
 </div>
 )}

 {/* RSVP Card */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 p-4 rounded-xl shadow-sm">

 {/* Grid Stat Counter Layout */}
 <div className="grid grid-cols-2 gap-4 mb-6">
 {/* Going Card */}
 <div className="bg-teal-500/5 border border-teal-500/15 p-4 rounded-lg text-center hover:scale-[1.02] transition-all duration-200">
 <div className="flex items-center justify-center gap-1 text-teal-700 mb-1">
 <span className="material-symbols-outlined text-[18px] font-bold">group</span>
 <span className="text-[10px] uppercase font-extrabold tracking-widest">Going</span>
 </div>
 <span className="text-3xl tracking-tight font-black text-slate-800 dark:text-white leading-none block my-1">{event.goingCount}</span>
 <span className="block text-[10px] text-slate-500 dark:text-slate-300 font-semibold uppercase">Joined</span>
 </div>

 {/* Interested Card */}
 <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-lg text-center hover:scale-[1.02] transition-all duration-200">
 <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
 <span className="material-symbols-outlined text-[18px] font-bold">star</span>
 <span className="text-[10px] uppercase font-extrabold tracking-widest">Interested</span>
 </div>
 <span className="text-3xl tracking-tight font-black text-slate-800 dark:text-white leading-none block my-1">{event.interestedCount}</span>
 <span className="block text-[10px] text-slate-500 dark:text-slate-300 font-semibold uppercase">Interested</span>
 </div>
 </div>

 {event.status ==='upcoming'&& (
 isOrganizer ? (
 <div className="relative overflow-hidden bg-slate-900 text-white rounded-xl p-5 border border-slate-800 hover:shadow-lg transition-all duration-300 shadow-md">
 <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"/>
 <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"/>
 
 <div className="flex items-start gap-4 relative z-10 text-left">
 <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-inner shrink-0">
 <span className="material-symbols-outlined text-[22px] animate-pulse">shield_person</span>
 </div>
 <div>
 <h4 className="font-extrabold text-white text-[14px] tracking-tight mb-1 flex items-center gap-1.5">
 You're Hosting This Drive
 </h4>
 <p className="text-[11.5px] text-slate-300 leading-relaxed font-medium">
 Thank you for leading this community effort! Use your control center panel above to track attendees, run check-ins, or complete the event.
 </p>
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-3">
 <button
 onClick={() => {
 if (!userGoing) {
 if (!user) {
 toast.error("Please log in to volunteer.");
 return;
 }
 if (role !=="member"&& role !=="admin") {
 toast.error("Only verified members can volunteer for drives.");
 return;
 }
 if (!isVolunteer) {
 toast.error("Please join the volunteer force first.");
 return;
 }
 }
 toggleGoingMutation.mutate();
 }}
 disabled={isFull && !userGoing}
 className={`w-full py-4 rounded-lg font-bold text-[13px] tracking-tight shadow transition-all hover:scale-[1.01] flex items-center justify-center gap-2 ${userGoing
 ?'bg-teal-600 text-white hover:bg-teal-700': isFull
 ?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-400 cursor-not-allowed border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-none':'bg-slate-900 text-white hover:bg-slate-800'}`}
 >
 {userGoing ? (
 <>
 <span className="material-symbols-outlined text-[18px]">check_circle</span>
 You are Going!
 </>
 ) : isFull ? ('Drive Limit Reached') : (
 <>
 <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
 Count me in! (RSVP)
 </>
 )}
 </button>

 <button
 onClick={() => toggleInterestMutation.mutate()}
 className={`w-full py-3.5 rounded-lg font-bold text-[13px] transition-all border-2 flex items-center justify-center gap-2 ${userInterested
 ?'bg-amber-500/10 text-amber-700 border-amber-300':'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:border-amber-300 hover:text-amber-600 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50 hover:bg-amber-500/5'}`}
 >
 <span className="material-symbols-outlined text-[18px]">{userInterested ?'star':'grade'}</span>
 {userInterested ?'Interested':'Mark as Interested'}
 </button>
 </div>
 )
 )}

 {/* Organizer Card mini inline */}
 {!isOrganizer && (
 <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
 {(!event.organizer?.photoURL || organizerImgError) ? (
 <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-teal-600 to-teal-800 text-white flex items-center justify-center font-bold text-[13px] shadow-md shrink-0 border border-teal-200/10">
 {organizerInitials}
 </div>
 ) : (
 <img
 src={event.organizer.photoURL}
 alt="Organizer"onError={() => setOrganizerImgError(true)}
 className="w-12 h-12 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] object-cover shadow-sm shrink-0"/>
 )}
 <div className="min-w-0">
 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Organized By</p>
 <p className="font-bold text-slate-800 dark:text-white truncate text-[13px]">{event.organizer?.name ||'Neighbour'}</p>
 <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{event.organizer?.email}</p>
 </div>
 </div>
 )}

 {/* Funding Section */}
 {event.fundingEnabled && event.fundingGoal > 0 && (
 <div className="mt-6 pt-6 border-t border-slate-100">
 <h4 className="font-extrabold text-slate-800 dark:text-white text-[13px] mb-3 flex items-center gap-2">
 <span className="material-symbols-outlined text-rose-500 text-[18px]">volunteer_activism</span>
 Drive Funding
 </h4>
 <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-300 mb-2">
 <span>Raised so far</span>
 <span className="font-bold text-teal-700">৳{event.fundingRaised} / ৳{event.fundingGoal}</span>
 </div>
 <div className="h-3 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-full overflow-hidden mb-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 shadow-inner">
 <div
 className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"style={{ width:`${Math.min(100, ((event.fundingRaised || 0) / Math.max(event.fundingGoal || 1, 1)) * 100)}%`}}
 />
 </div>

 <button
 onClick={() => setIsDonationModalOpen(true)}
 className="w-full py-3 bg-teal-50/50 text-teal-700 border border-teal-200/60 hover:bg-teal-50 hover:text-teal-800 hover:scale-[1.01] rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
 <span className="material-symbols-outlined text-[18px]">favorite</span>
 Donate to this Drive
 </button>
 </div>
 )}

 </div>

 </div>
 </div>

 </div>
 </div>

 {isDonationModalOpen && (
 <EventDonationModal
 event={event}
 onClose={() => setIsDonationModalOpen(false)}
 />
 )}

 {/* Attendees Modal */}
 {isAttendeesModalOpen && hasAdminPowers && (
 <AttendeesModal eventId={id} onClose={() => setIsAttendeesModalOpen(false)} />
 )}
 </div>
 );
}

// Mini component for fetching and displaying attendees in a beautiful modal
function AttendeesModal({ eventId, onClose }) {
 const axiosSecure = useAxiosSecure();
 const [attendeeImgErrors, setAttendeeImgErrors] = useState({});

 const { data, isLoading } = useQuery({
 queryKey: ['eventAttendees', eventId],
 queryFn: async () => {
 const res = await axiosSecure.get(`/cleanup-events/${eventId}/attendees`);
 return res.data;
 }
 });

 const handleImgError = (idx) => {
 setAttendeeImgErrors(prev => ({ ...prev, [idx]: true }));
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]"style={{ fontFamily:"'Outfit', sans-serif"}}>
 
 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50">
 <h3 className="font-extrabold text-[13px] tracking-tight text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
 <span className="material-symbols-outlined text-teal-600 text-[26px]">group</span>
 Volunteers Attending
 </h3>
 <button 
 onClick={onClose} 
 className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 focus:outline-none">
 <span className="material-symbols-outlined text-[20px]">close</span>
 </button>
 </div>

 <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
 {isLoading ? (
 <div className="flex justify-center p-16"><MinimalLoader /></div>
 ) : !data?.going || data.going.length === 0 ? (
 <div className="text-center py-10 text-slate-500 dark:text-slate-300 font-medium flex flex-col items-center gap-2">
 <span className="material-symbols-outlined text-[48px] text-slate-300">group_off</span>
 No volunteers registered yet.
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="table w-full border-collapse">
 <thead>
 <tr className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-500 dark:text-slate-300 uppercase tracking-widest text-[10px] font-extrabold text-left border-b border-slate-100">
 <th className="py-3.5 px-6">Name</th>
 <th className="py-3.5 px-6">Email Address</th>
 <th className="py-3.5 px-6">RSVP Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {data.going.map((user, i) => {
 const initials = user.name 
 ? user.name.split('').map(w => w[0]).join('').toUpperCase().slice(0, 2)
 :'AN';

 return (
 <tr key={i} className="hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/40 transition-colors">
 <td className="py-4 px-6">
 <div className="flex items-center gap-3">
 {(!user.photoURL || attendeeImgErrors[i]) ? (
 <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow shrink-0">
 {initials}
 </div>
 ) : (
 <img 
 src={user.photoURL} 
 alt="Avatar"onError={() => handleImgError(i)}
 className="w-8.5 h-8.5 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] object-cover shadow-sm shrink-0"/>
 )}
 <div className="font-semibold text-slate-800 dark:text-white text-[13px]">{user.name ||'Anonymous Neighbour'}</div>
 </div>
 </td>
 <td className="py-4 px-6 text-slate-500 dark:text-slate-300 text-[13px] font-medium">{user.email}</td>
 <td className="py-4 px-6">
 <span className="inline-flex items-center px-2.5 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-teal-100">
 Going
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>

 <div className="p-4 border-t border-slate-100 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50 flex justify-end">
 <button 
 onClick={onClose} 
 className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm focus:outline-none">
 Close
 </button>
 </div>
 </div>
 </div>
 );
}
