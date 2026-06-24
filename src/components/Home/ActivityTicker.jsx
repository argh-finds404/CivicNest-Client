import React from'react';
import { useQuery } from'@tanstack/react-query';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import { motion } from'framer-motion';

const getTickerText = (item) => {
 const data = item.data || {};
 switch (item.type) {
 case'drive_joined':
 return`${data.count || 1} neighbor(s) RSVP'd to join the cleanup drive"${data.driveTitle ||'Event'}"in ${data.area ||'community'}.`;
 case'drive_completed':
 return`Cleanup drive"${data.driveTitle ||'Event'}"in ${data.area ||'community'} completed successfully with ${data.count || 0} volunteer(s)!`;
 case'cleanup_approved':
 return`New cleanup drive approved:"${data.title}"organized by ${data.organizer ||'Member'}.`;
 case'new_cleanup_event':
 return`New cleanup drive launched in ${data.area ||'community'}:"${data.driveTitle}"by ${data.actorName ||'Member'}.`;
 case'donation_made':
 return`${data.donor ||'Resident'} contributed ৳${data.amount} to support"${data.title}".`;
 case'ngo_partnership':
 return`New verified partnership with NGO ${data.ngoName} serving ${data.area ||'community'}.`;
 case'social_activity':
 return`${data.authorName} posted in the forum:"${data.title}"under ${data.category}.`;
 case'incident_reported':
 return`${data.reporterName ||'Anonymous'} reported a ${data.category} issue in ${data.area}:"${data.title}".`;
 case'animal_rescued':
 return`${data.actorName} successfully helped a stray/wild ${data.animalType} in ${data.location}.`;
 case'poll_created':
 return`${data.actorName} published a new community poll:"${data.question}".`;
 case'poll_ended':
 return`Community poll concluded:"${data.question}".`;
 case'lostfound_reunited':
 return`Reunited! Lost & found item"${data.itemName}"was returned to its owner in ${data.location}.`;
 case'issue_solved':
 return`Issue resolved in ${data.area}: ${data.title}.`;
 default:
 return item.description ||`Community activity update in ${data.area ||'community'}`;
 }
};

const getTickerIcon = (type) => {
 switch (type) {
 case'drive_joined': return'ri-group-line text-sky-500';
 case'drive_completed': return'ri-checkbox-circle-line text-emerald-500';
 case'cleanup_approved':
 case'new_cleanup_event': return'ri-leaf-line text-[#0f766e]';
 case'donation_made': return'ri-hand-coin-line text-pink-500';
 case'ngo_partnership': return'ri-handshake-line text-violet-500';
 case'social_activity': return'ri-discuss-line text-indigo-500';
 case'incident_reported': return'ri-alert-line text-orange-500';
 case'animal_rescued': return'ri-heart-pulse-line text-teal-500';
 case'poll_created':
 case'poll_ended': return'ri-bar-chart-grouped-line text-red-500';
 case'lostfound_reunited': return'ri-magic-line text-yellow-500';
 case'issue_solved': return'ri-checkbox-circle-fill text-emerald-500';
 default: return'ri-notification-badge-line text-slate-500 dark:text-slate-300';
 }
};

export default function ActivityTicker() {
 const axiosPublic = useAxiosPublic();
 
 const { data: feedRes, isLoading } = useQuery({
 queryKey: ['tickerFeed'],
 queryFn: async () => {
 const res = await axiosPublic.get('/public/feed', { params: { page: 1, limit: 15 } });
 return res.data;
 },
 refetchInterval: 15000, // Poll every 15 seconds for live ticker feel
 });

 const events = feedRes?.data || [];

 if (isLoading || events.length === 0) {
 return null;
 }

 // Duplicate items twice to ensure no gap in infinite scroll marquee
 const tickerItems = [...events, ...events, ...events];

 return (
 <div className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 rounded-xl py-3 px-4 overflow-hidden relative select-none flex items-center mb-6 shadow-sm">
 {/* Pulse Label */}
 <div className="flex items-center gap-2 bg-[#0f766e] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg z-10 shadow-sm shrink-0 mr-4">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
 </span>
 Live Pulse
 </div>

 {/* Marquee Container */}
 <div className="flex-1 overflow-hidden relative h-5 flex items-center">
 <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] gap-12 absolute left-0">
 {tickerItems.map((item, idx) => (
 <div key={`${item._id}-${idx}`} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-[#cbd5e1] font-semibold">
 <i className={`${getTickerIcon(item.type)} text-[15px]`}></i>
 <span>{getTickerText(item)}</span>
 <span className="text-[10px] font-medium text-slate-400">
 • {new Date(item.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'})}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* CSS style block for keyframe animation */}
 <style>{`@keyframes marquee {
 0% { transform: translateX(0); }
 100% { transform: translateX(-33.33%); }
 }
 .animate-marquee {
 display: flex;
 animation: marquee 50s linear infinite;
 }`}</style>
 </div>
 );
}
