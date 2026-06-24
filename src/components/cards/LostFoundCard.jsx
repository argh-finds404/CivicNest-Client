import React, { useState } from'react';
import { Link } from'react-router';
import { motion } from'framer-motion';
import { formatDistanceToNow } from'date-fns';
import toast from'react-hot-toast';
import { Share2, MapPin, Clock, ArrowRight, AlertCircle, CheckCircle2 } from'lucide-react';
import { useAuth } from'../../hooks/useAuth';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useRole } from'../../hooks/useRole';
import { useQueryClient } from'@tanstack/react-query';

const TYPE_CONFIG = {
 lost: {
 stripe:'border-l-[3px] border-rose-500',
 tint:'bg-gradient-to-r from-rose-50/30 to-transparent',
 badge:'bg-rose-500 text-white border border-rose-450/20 shadow-sm',
 label:'LOST',
 btnClass:'bg-rose-600 hover:bg-rose-700',
 },
 found: {
 stripe:'border-l-[3px] border-emerald-500',
 tint:'bg-gradient-to-r from-emerald-50/30 to-transparent',
 badge:'bg-emerald-600 text-white border border-emerald-500/20 shadow-sm',
 label:'FOUND',
 btnClass:'bg-emerald-600 hover:bg-emerald-700',
 },
};

export default function LostFoundCard({ item }) {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const [role, isRoleLoading, isVolunteer, streak, userData] = useRole();

 const isBookmarked = userData?.bookmarks?.some(b => b.itemId === item._id) || false;

 const handleBookmark = async (e) => {
 e.preventDefault();
 if (!user) return;
 try {
 const action = isBookmarked ?'remove':'add';
 await axiosSecure.patch('/users/my/bookmark', {
 itemId: item._id,
 type:'lostfound',
 action
 });
 toast.success(isBookmarked ?"Removed from bookmarks":"Saved to bookmarks");
 queryClient.invalidateQueries({ queryKey: [user?.email,"role"] });
 } catch (err) {
 toast.error(err.response?.data?.error || err.message);
 }
 };

 const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.lost;
 const [copied, setCopied] = useState(false);

 // Expiration calculation
 const daysLeft = item.expiresAt
 ? Math.ceil((new Date(item.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
 : null;
 const isExpired = daysLeft !== null && daysLeft <= 0;
 const isExpiring = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

 const handleShare = (e) => {
 e.preventDefault();
 const url =`${window.location.origin}/lost-found/${item._id}`;
 navigator.clipboard.writeText(url);
 setCopied(true);
 toast.success('Link copied to clipboard!');
 setTimeout(() => setCopied(false), 2000);
 };

 return (
 <Link to={`/lost-found/${item._id}`} className="block group">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -4 }}
 className={`bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] transition-all duration-300 ${typeConfig.stripe} ${typeConfig.tint} ${item.status ==='reunited'?'opacity-85':''} ${isExpired ?'opacity-60':''}`}
 >
 {/* Image */}
 <div className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]">
 <img
 src={item.image ||'/lost-found-placeholder.jpg'}
 alt={`${item.itemName} — ${item.category}`}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750 ease-out"/>

 {/* Resolved Overlay */}
 {item.status ==='reunited'&& (
 <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
 <div className="bg-emerald-600/90 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-emerald-500 shadow-lg backdrop-blur-md flex items-center gap-1.5">
 <CheckCircle2 className="w-4 h-4 text-white"/> REUNITED
 </div>
 </div>
 )}

 {/* Type Badge */}
 <div className="absolute top-3 right-3 z-10">
 <span className={`${typeConfig.badge} text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm`}>
 {typeConfig.label}
 </span>
 </div>

 {/* Reward Overlay Badge */}
 {item.reward && item.reward > 0 && (
 <div className="absolute bottom-3 right-3 z-10">
 <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md border border-amber-400/40">
 ৳{item.reward} Reward
 </span>
 </div>
 )}

 {/* Share */}
 <button
 onClick={handleShare}
 className="absolute top-3 left-3 z-10 w-8 h-8 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/90 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
 <Share2 className="w-3.5 h-3.5 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]"/>
 </button>

 {/* Expiration Badge */}
 {isExpired && (
 <div className="absolute top-3 left-12 z-10">
 <span className="bg-slate-700/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
 <AlertCircle className="w-3 h-3"/> EXPIRED
 </span>
 </div>
 )}
 {isExpiring && !isExpired && (
 <div className="absolute top-3 left-12 z-10">
 <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
 <Clock className="w-3 h-3"/> Expires in {daysLeft}d
 </span>
 </div>
 )}

 {copied && (
 <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded-lg backdrop-blur-sm z-10">
 Copied!
 </span>
 )}

 {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
 <span className="absolute bottom-3 left-3 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold z-10">
 ⏱ {daysLeft}d left
 </span>
 )}
 </div>

 {/* Body */}
 <div className="p-5">
 <div className="flex flex-wrap items-center gap-2 mb-2.5">
 <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] px-2 py-0.5 rounded">
 {item.category}
 </span>
 {item.reward && item.reward > 0 && (
 <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100/50">
 ৳{item.reward} Reward
 </span>
 )}
 {item.type ==='lost'&& item.foundReports && item.foundReports.length > 0 && (
 <span className="text-[10px] font-black text-rose-705 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/40">
 {item.foundReports.length} sighting{item.foundReports.length > 1 ?'s':''}
 </span>
 )}
 {item.type ==='found'&& item.claims && item.claims.length > 0 && (
 <span className="text-[10px] font-black text-amber-705 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100/40">
 {item.claims.length} claim{item.claims.length > 1 ?'s':''}
 </span>
 )}
 </div>

 <h3 className="font-bold text-slate-800 dark:text-white text-[13px] mb-3 line-clamp-1 group-hover:text-[var(--g-700)] transition-colors tracking-tight">
 {item.itemName}
 </h3>

 <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-300 mb-4">
 <div className="flex items-center gap-1.5 min-w-0">
 <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0"/>
 <span className="truncate">{item.location}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0"/>
 <span>{formatDistanceToNow(new Date(item.dateLostFound || item.date), { addSuffix: true })}</span>
 </div>
 </div>

 <p className="text-[13px] text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed">
 {item.description}
 </p>
 </div>

 {/* Footer */}
 <div className="px-5 pb-5 border-t border-slate-100/60 pt-4 flex items-center justify-between">
 {item.status ==='reunited'? (
 <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/> Listing Closed
 </span>
 ) : (
 <span className="text-xs font-bold text-teal-600 group-hover:text-teal-700 transition-colors flex items-center gap-1">
 View Details 
 <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"/>
 </span>
 )}

 {user && (
 <button 
 onClick={handleBookmark}
 className={`w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:hover:bg-slate-800 flex items-center justify-center transition-colors select-none cursor-pointer z-20 ${
 isBookmarked ?'text-teal-600 dark:text-teal-400':'text-slate-500 dark:text-slate-300'}`}
 title={isBookmarked ?"Remove Bookmark":"Save Item"}
 >
 <i className={isBookmarked ?"ri-bookmark-fill text-[13px]":"ri-bookmark-line text-[13px]"}></i>
 </button>
 )}
 </div>
 </motion.div>
 </Link>
 );
}