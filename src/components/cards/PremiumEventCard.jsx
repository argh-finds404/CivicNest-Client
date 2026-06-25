import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { Link } from'react-router';
import AttendeeAvatarStack from'../CleanupEvents/AttendeeAvatarStack';

function displayOrganizerName(organizer) {
 const name = organizer?.name?.trim();
 if (!name || name.includes('@')) return'Community Member';
 return name;
}

const INTERESTED_PARTICLES = [
 { color:'#f59e0b', icon:'★'},
 { color:'#fbbf24', icon:'✦'},
 { color:'#f97316', icon:'♥'},
 { color:'#ef4444', icon:'★'},
 { color:'#fcd34d', icon:'✦'},
 { color:'#fb923c', icon:'●'},
 { color:'#facc15', icon:'◆'},
 { color:'#f472b6', icon:'★'},
];

const GOING_PARTICLES = [
 { color:'#14b8a6', icon:'✔'},
 { color:'#0d9488', icon:'✦'},
 { color:'#10b981', icon:'●'},
 { color:'#34d399', icon:'★'},
 { color:'#6ee7b7', icon:'◆'},
 { color:'#2dd4bf', icon:'✔'},
 { color:'#5eead4', icon:'✦'},
 { color:'#a7f3d0', icon:'●'},
];

function ParticleBurst({ particles, active }) {
 if (!active) return null;
 return (
 <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
 {particles.map((p, i) => {
 const angle = (360 / particles.length) * i;
 const rad = (angle * Math.PI) / 180;
 const dist = 36 + Math.random() * 18;
 const tx = Math.cos(rad) * dist;
 const ty = Math.sin(rad) * dist;
 return (
 <motion.span
 key={i}
 initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
 animate={{ opacity: 0, scale: 1.4, x: tx, y: ty }}
 transition={{ duration: 0.55, ease:'easeOut', delay: i * 0.015 }}
 style={{
 position:'absolute',
 left:'50%',
 top:'50%',
 color: p.color,
 fontSize:'11px',
 fontWeight: 900,
 lineHeight: 1,
 transform:'translate(-50%,-50%)',
 userSelect:'none',
 }}
 >
 {p.icon}
 </motion.span>
 );
 })}
 </div>
 );
}

export default function PremiumEventCard({ event, currentUser, userInterested, userGoing, onInterested, onGoing, compact = true }) {
 const dateObj = new Date(event.eventDate);
 const month = dateObj.toLocaleString('en-US', { month:'short'}).toUpperCase();
 const day = dateObj.getDate();
 const displayName = displayOrganizerName(event.organizer);

 let previewAttendees = event.goingPreview?.length ? [...event.goingPreview] : [
 { _id:'dummy1', photoURL:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60', name:'Alex'},
 { _id:'dummy2', photoURL:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=60', name:'Sarah'},
 { _id:'dummy3', photoURL:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60', name:'Mike'},
 ];

 if ((userInterested || userGoing) && currentUser) {
 if (!previewAttendees.some(a => a._id === currentUser.uid)) {
 previewAttendees = [{
 _id: currentUser.uid,
 photoURL: currentUser.photoURL,
 name: currentUser.displayName || currentUser.email,
 }, ...previewAttendees];
 }
 }

 let goingCount = event.goingCount || 12;
 if (userGoing || userInterested) goingCount += 1;
 const extraCount = Math.max(0, goingCount - previewAttendees.length);

 const [burstKey, setBurstKey] = useState({ type: null, key: 0 });

 const handleInterestedClick = (e) => {
 e.preventDefault();
 e.stopPropagation();
 setBurstKey(prev => ({ type:'interested', key: prev.key + 1 }));
 onInterested?.(event._id);
 };

 const handleGoingClick = (e) => {
 e.preventDefault();
 e.stopPropagation();
 setBurstKey(prev => ({ type:'going', key: prev.key + 1 }));
 onGoing?.(event._id);
 };

 return (
 <article className="flex flex-col h-auto bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 overflow-hidden">
 {/* Landscape banner */}
 <div className="relative w-full aspect-[16/9] shrink-0 overflow-hidden bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]">
 <img
 src={
 event.coverImages?.[0] ||'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1200&auto=format&fit=crop'}
 alt={event.title}
 className="absolute inset-0 w-full h-full object-cover"/>
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent pointer-events-none"/>

 <div className="event-date-shimmer absolute top-3 left-3 z-10 flex flex-col items-center justify-center w-12 h-12 rounded-[0.85rem] border border-white/70">
 <span className="text-red-500 font-bold text-[9px] uppercase tracking-[0.18em] leading-none">{month}</span>
 <span className="text-slate-900 dark:text-white font-black text-[13px] tracking-tight leading-none mt-0.5">{day}</span>
 </div>

 <div className="absolute bottom-3 left-3 right-3 z-10">
 <h3 className="text-white font-bold text-[13px] leading-snug line-clamp-2 drop-shadow-md tracking-tight">{event.title}</h3>
 </div>
 </div>

 <div className={`flex flex-col flex-1 ${compact ?'p-3.5 gap-2.5':'p-5 gap-3'}`}>
 <p className="text-xs text-slate-500 dark:text-slate-300 flex items-start gap-1.5 line-clamp-1">
 <i className="ri-map-pin-2-fill text-teal-600 shrink-0 mt-0.5"/>
 <span className="font-medium">{event.location?.address}</span>
 </p>

 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shrink-0">
 <img
 src={
 event.organizer?.photoURL ||`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=059669&color=fff`}
 alt=""className="w-full h-full object-cover"/>
 </div>
 <div className="min-w-0">
 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Organized by</p>
 <p className="text-slate-800 dark:text-white font-semibold text-xs truncate">{displayName}</p>
 </div>
 </div>

 <div className="flex gap-1.5 flex-wrap">
 <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-tight rounded-full border border-emerald-100">
 Drive
 </span>
 {event.fundingEnabled && (
 <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-tight rounded-full border border-amber-100">
 Funded
 </span>
 )}
 </div>

 {/* Reaction buttons with particle burst */}
 <div className="flex gap-2 pt-0.5">
 {/* Interested */}
 <div className="relative flex-1"style={{ overflow:'visible'}}>
 <motion.button
 type="button"onClick={handleInterestedClick}
 whileTap={{ scale: 0.88 }}
 animate={userInterested ? { scale: [1, 1.18, 1] } : { scale: 1 }}
 transition={{ duration: 0.25 }}
 className={`w-full py-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors ${userInterested
 ?'bg-amber-100 text-amber-700 border border-amber-200':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-amber-200'}`}
 >
 <motion.i
 className={userInterested ?'ri-star-fill':'ri-star-line'}
 animate={userInterested ? { rotate: [0, -20, 20, -10, 0], scale: [1, 1.4, 1] } : {}}
 transition={{ duration: 0.4 }}
 />
 Interested
 </motion.button>
 <AnimatePresence>
 {burstKey.type ==='interested'&& (
 <ParticleBurst key={`interested-${burstKey.key}`} particles={INTERESTED_PARTICLES} active />
 )}
 </AnimatePresence>
 </div>

 {/* Going */}
 <div className="relative flex-1"style={{ overflow:'visible'}}>
 <motion.button
 type="button"onClick={handleGoingClick}
 whileTap={{ scale: 0.88 }}
 animate={userGoing ? { scale: [1, 1.18, 1] } : { scale: 1 }}
 transition={{ duration: 0.25 }}
 className={`w-full py-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors ${userGoing
 ?'bg-teal-600 text-white border border-teal-700':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-teal-200'}`}
 >
 <motion.i
 className={userGoing ?'ri-check-double-line':'ri-check-line'}
 animate={userGoing ? { rotate: [0, -15, 15, -8, 0], scale: [1, 1.4, 1] } : {}}
 transition={{ duration: 0.4 }}
 />
 Going
 </motion.button>
 <AnimatePresence>
 {burstKey.type ==='going'&& (
 <ParticleBurst key={`going-${burstKey.key}`} particles={GOING_PARTICLES} active />
 )}
 </AnimatePresence>
 </div>
 </div>

 <div className="flex items-center gap-1.5 mt-1">
 <AttendeeAvatarStack attendees={previewAttendees} max={3} size="xs"/>
 {extraCount > 0 && (
 <span className="text-[9px] font-bold text-slate-500 dark:text-slate-300">+{extraCount}</span>
 )}
 <span className="text-[10px] text-slate-400">{goingCount} attending</span>
 </div>

 <Link
 to={`/cleanup-events/${event._id}`}
 className="mt-auto block w-full text-center py-2 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-100 transition-colors">
 View details <i className="ri-arrow-right-line"/>
 </Link>
 </div>
 </article>
 );
}
