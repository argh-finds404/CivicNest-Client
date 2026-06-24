import React from'react';
import { Link } from'react-router';
import CountdownTimer from'../CleanupEvents/CountdownTimer';
import AttendeeAvatarStack from'../CleanupEvents/AttendeeAvatarStack';
import { useAuth } from'../../hooks/useAuth';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useRole } from'../../hooks/useRole';
import { useQueryClient } from'@tanstack/react-query';
import toast from'react-hot-toast';

const STATUS_CONFIG = {
 upcoming: { label:'UPCOMING', bg:'bg-teal-600 text-white'},
 ongoing: { label:'HAPPENING NOW', bg:'bg-green-500 text-white animate-pulse'},
 completed: { label:'COMPLETED ✓', bg:'bg-gray-500 text-white'},
 cancelled: { label:'CANCELLED', bg:'bg-red-500 text-white'},
};

export default function CleanupEventCard({ event, onInterested, onGoing, userInterested, userGoing }) {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const [role, isRoleLoading, isVolunteer, streak, userData] = useRole();

 const isBookmarked = userData?.bookmarks?.some(b => b.itemId === event._id) || false;

 const handleBookmark = async (e) => {
 e.preventDefault();
 if (!user) return;
 try {
 const action = isBookmarked ?'remove':'add';
 await axiosSecure.patch('/users/my/bookmark', {
 itemId: event._id,
 type:'event',
 action
 });
 toast.success(isBookmarked ?"Removed from bookmarks":"Saved to bookmarks");
 queryClient.invalidateQueries({ queryKey: [user?.email,"role"] });
 } catch (err) {
 toast.error(err.response?.data?.error || err.message);
 }
 };

 const status = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
 const isFull = event.maxVolunteers > 0 && event.goingCount >= event.maxVolunteers;
 const isPast = new Date(event.eventDate) < new Date();

 return (
 <article className="group relative
 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] 
 border border-slate-100 
 rounded-xl overflow-hidden
 hover:border-teal-200 dark:hover:border-teal-500/40
 hover:shadow-[0_20px_40px_rgba(15,118,110,0.08)]
 transition-all duration-500 hover:-translate-y-1">

 {/* ── Cover Image ── */}
 <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]">
 <img
 src={event.coverImages?.[0] ||'https://via.placeholder.com/800x400?text=Cleanup+Event'}
 alt={event.title}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>

 {/* Gradient overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"/>

 {/* Status ribbon */}
 <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-black rounded-lg tracking-wider ${status.bg}`}>
 {status.label}
 </span>

 {/* Bookmark Button */}
 {user && (
 <button 
 onClick={handleBookmark}
 className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/95 dark:bg-[#0a120e]/95 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:hover:bg-[#1e3040] shadow-md flex items-center justify-center transition-colors select-none cursor-pointer ${
 isBookmarked ?'text-teal-600 dark:text-teal-400':'text-slate-600 dark:text-slate-300'}`}
 title={isBookmarked ?"Remove Bookmark":"Save Event"}
 >
 <i className={isBookmarked ?"ri-bookmark-fill text-[13px] text-teal-600 dark:text-teal-400":"ri-bookmark-line text-[13px]"}></i>
 </button>
 )}

 {/* Date overlay on image */}
 <div className="absolute bottom-3 left-3 text-white">
 <p className="text-xs font-semibold opacity-80">
 📅 {new Date(event.eventDate).toLocaleDateString('en-GB', {
 day:'numeric', month:'short', year:'numeric'})} · {event.eventTime}
 </p>
 </div>

 {/* Funding progress bar (if enabled) */}
 {event.fundingEnabled && event.fundingGoal > 0 && (
 <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
 <div
 className="h-full bg-teal-400 transition-all duration-1000"style={{ width:`${Math.min(100, ((event.fundingRaised || 0) / Math.max(event.fundingGoal || 1, 1)) * 100)}%`}}
 />
 </div>
 )}
 </div>

 {/* ── Card Body ── */}
 <div className="relative z-10 -mt-6 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-t-[24px] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">

 {/* Slogan */}
 {event.slogan && (
 <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1.5 line-clamp-1">
 {event.slogan}
 </p>
 )}

 {/* Title */}
 <h3 className="font-extrabold text-[13px] tracking-tight text-slate-900 dark:text-white line-clamp-2 leading-tight mb-2 group-hover:text-teal-700 transition-colors tracking-tight"style={{ fontFamily:'Inter, sans-serif', letterSpacing:'-0.02em'}}>
 {event.title}
 </h3>

 {/* Location */}
 <p className="text-[13px] text-slate-500 dark:text-slate-300 flex items-start gap-1.5 font-medium">
 <i className="ri-map-pin-2-fill text-slate-400 mt-0.5"></i>
 <span className="line-clamp-1 leading-snug">{event.location?.address}</span>
 </p>

 {/* Countdown — only show if upcoming */}
 {event.status ==='upcoming'&& !isPast && (
 <div className="mt-3">
 <CountdownTimer targetDate={event.eventDate} compact />
 </div>
 )}

 {/* Attendee stack + counts */}
 <div className="flex items-center gap-3 mt-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] /50 p-2.5 rounded-lg border border-slate-100">
 <AttendeeAvatarStack attendees={event.going || []} max={3} />
 <div className="flex flex-col justify-center text-xs">
 <span className="font-bold text-slate-800 dark:text-white">
 {event.goingCount} going
 </span>
 <span className="text-slate-500 dark:text-slate-300 font-medium">
 {event.interestedCount} interested
 </span>
 </div>
 </div>

 {/* Funding if enabled */}
 {event.fundingEnabled && event.fundingGoal > 0 && (
 <div className="mt-3">
 <div className="flex justify-between text-xs text-gray-500 dark:text-slate-300 mb-1">
 <span>Fund raised</span>
 <span className="font-semibold text-teal-600">
 ৳{event.fundingRaised} / ৳{event.fundingGoal}
 </span>
 </div>
 <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
 <div
 className="h-full bg-teal-500 rounded-full transition-all duration-700"style={{ width:`${Math.min(100, ((event.fundingRaised || 0) / Math.max(event.fundingGoal || 1, 1)) * 100)}%`}}
 />
 </div>
 </div>
 )}

 {/* Action buttons */}
 {event.status ==='upcoming'&& (
 <div className="flex gap-2.5 mt-5 pt-5 border-t border-slate-100">

 <button
 onClick={() => onInterested(event._id)}
 className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all border shadow-sm flex items-center justify-center gap-1.5 ${
 userInterested
 ?'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:text-amber-500'}`}
 >
 <i className={userInterested ?"ri-star-fill text-amber-500 text-[13px]":"ri-star-line text-[13px]"}></i>
 {userInterested ?'Interested':'Interested'}
 </button>

 <button
 onClick={() => onGoing(event._id)}
 disabled={isFull && !userGoing}
 className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
 userGoing
 ?'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/30': isFull
 ?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-400 cursor-not-allowed':'bg-slate-900 text-white dark:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5'}`}
 >
 <i className={userGoing ?"ri-check-line text-[13px]": isFull ?"ri-close-circle-line text-[13px]":"ri-walk-line text-[13px]"}></i>
 {userGoing ?'Going': isFull ?'Full':'Join Event'}
 </button>

 <Link
 to={`/cleanup-events/${event._id}`}
 className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-teal-50 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-400 rounded-xl transition-colors border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-teal-200">
 <i className="ri-arrow-right-line text-[13px]"></i>
 </Link>
 </div>
 )}

 {event.status ==='completed'&& (
 <div className="mt-4 pt-4 border-t border-gray-100">
 <Link to={`/cleanup-events/${event._id}`}
 className="block text-center py-2 text-[13px] font-semibold text-gray-600 dark:text-slate-300 hover:text-teal-600 transition-colors">
 View Summary & Photos →
 </Link>
 </div>
 )}

 </div>
 </article>
 );
}
