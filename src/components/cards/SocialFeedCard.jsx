import React, { useState, useEffect, useRef } from'react';
import { Link } from'react-router';
import { motion, AnimatePresence } from'framer-motion';
import toast from'react-hot-toast';
import FlairPill from'../common/FlairPill';
import StatusBadge from'../common/StatusBadge';
import { useAuth } from'../../hooks/useAuth';
import useAxiosSecure from'../../hooks/useAxiosSecure';

const SocialFeedCard = React.forwardRef(({ issue }, ref) => {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();

 const [localIssue, setLocalIssue] = useState(issue);
 const [voteAnimation, setVoteAnimation] = useState(null);
 const [showShareMenu, setShowShareMenu] = useState(false);
 const shareMenuRef = useRef(null);

 useEffect(() => {
 setLocalIssue(issue);
 }, [issue]);

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
 setShowShareMenu(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleVote = async (type) => {
 if (!user) {
 toast.error("Please login to vote");
 return;
 }
 
 try {
 const res = await axiosSecure.patch(`/issues/${localIssue._id}/${type}`);
 const data = res.data;
 
 const diff = type ==='upvote'? (data.upvotes.length - (localIssue.upvotes?.length || 0))
 : (data.downvotes.length - (localIssue.downvotes?.length || 0));

 if (diff !== 0) {
 setVoteAnimation({
 id: Date.now(),
 target: type,
 value: diff > 0 ?`+${diff}`:`${diff}`,
 color: diff > 0 ? (type ==='upvote'?'text-emerald-500':'text-rose-400') :'text-slate-400'});
 setTimeout(() => setVoteAnimation(null), 1000);
 }
 
 setLocalIssue({ 
 ...localIssue, 
 upvotes: data.upvotes, 
 downvotes: data.downvotes, 
 userVote: data.userVote 
 });
 } catch (error) {
 toast.error(error.response?.data?.error || error.message);
 }
 };

 const handleShare = (e, platform) => {
 e.preventDefault();
 const url =`${window.location.origin}/issues/${issue._id}`;
 if (platform ==='copy') {
 navigator.clipboard.writeText(url);
 toast.success("Link copied to clipboard!");
 } else if (platform ==='fb') {
 window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank');
 } else if (platform ==='twitter') {
 window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(issue.title)}`,'_blank');
 }
 setShowShareMenu(false);
 };
 const isPending = issue.approvalStatus ==='pending_review';
 const isRejected = issue.approvalStatus ==='rejected'|| issue.status ==='rejected';
 const isLocked = isPending || isRejected;
 const isEvent = issue._type ==='cleanup_event';

 const dateToUse = issue.submittedAt || issue.createdAt || issue.incidentDate || issue.eventDate || new Date();
 const formattedDate = new Date(dateToUse).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit', hour12: true });
 
 // Handle name display - check if it looks like an email and fallback to proper format
 const getName = (name, email) => {
 if (name && !name.includes('@')) return name; // Already a proper name
 if (email) {
 const localPart = email.split('@')[0];
 // Convert email local part to proper name format
 return localPart
 .split(/[._-]/)
 .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
 .join('');
 }
 return"Community Member";
 };
 
 const authorName = issue.isAnonymous ?"Anonymous Member": getName(issue.submittedBy?.name, issue.submittedBy?.email) || getName(issue.organizer?.name, issue.organizer?.email) ||"Community Member";
 const authorPhoto = issue.submittedBy?.photoURL || issue.organizer?.photoURL;
 const authorEmail = issue.submittedBy?.email || issue.organizer?.email;
 
 const hasImages = !isEvent && issue.images && issue.images.length > 0;
 
 const displayArea = issue.area || issue.location?.area;
 const displayLocation = typeof issue.location ==='string'? issue.location : issue.location?.address;

 // Glassmorphism base
 let cardStateClasses ="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/80 backdrop-blur-xl border-white/60 shadow-lg hover:shadow-xl";
 if (isEvent) {
 cardStateClasses ="bg-gradient-to-br from-teal-50/90 to-emerald-50/90 backdrop-blur-xl border-teal-200/60 shadow-md hover:shadow-lg ring-1 ring-teal-500/20";
 } else if (isLocked) {
 cardStateClasses ="bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/60 backdrop-blur-md border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 shadow-sm grayscale-[30%]";
 } else if (isRejected) {
 cardStateClasses ="bg-rose-50/60 backdrop-blur-md border-rose-200/50 shadow-sm";
 }

 return (
 <motion.div 
 ref={ref}
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.3 }}
 className={`rounded-lg border transition-all duration-300 overflow-hidden relative group mb-6 ${cardStateClasses}`}
 >
 {/* Locked Overlay for Image Dimming */}
 {isLocked && <div className="absolute inset-0 bg-slate-900/5 z-10 pointer-events-none"></div>}

 {/* Post Header */}
 <div className="px-6 pt-5 pb-3 flex justify-between items-start relative z-20">
 <div className="flex gap-4 items-center">
 {issue.isAnonymous ? (
 <>
 <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white shadow-sm text-slate-400">
 <i className="ri-spy-fill text-[13px] tracking-tight"></i>
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <span className="font-bold text-slate-800 dark:text-white text-[16px] leading-tight">{authorName}</span>
 <i className="ri-spy-fill text-slate-400 text-xs"title="Anonymous"></i>
 <span className="text-slate-300 text-xs mx-1">•</span>
 <span className="text-[13px] font-medium text-slate-500 dark:text-slate-300 hover:underline cursor-pointer">{formattedDate}</span>
 </div>
 <div className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1 flex items-center gap-1.5">
 <i className="ri-map-pin-2-fill text-slate-400"></i> 
 <span className="truncate max-w-[220px] sm:max-w-[350px]">
 {displayArea}{displayLocation ?`• ${displayLocation.split(',').slice(0,2).join(',')}`:''}
 </span>
 </div>
 </div>
 </>
 ) : (
 <>
 <Link to={`/user/${issue.submittedBy?.userId}`} className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white shadow-sm hover:ring-2 ring-[#028090] transition-all">
 {authorPhoto ? <img src={authorPhoto} alt="Author"className="w-full h-full object-cover"/> : <i className="ri-user-smile-line text-slate-400 text-[13px] tracking-tight"></i>}
 </Link>
 <div>
 <div className="flex items-center gap-1.5">
 <Link to={`/user/${issue.submittedBy?.userId}`} className="font-bold text-slate-800 dark:text-white text-[16px] leading-tight hover:text-[#028090] transition-colors">{authorName}</Link>
 <span className="text-slate-300 text-xs mx-1">•</span>
 <span className="text-[13px] font-medium text-slate-500 dark:text-slate-300 hover:underline cursor-pointer">{formattedDate}</span>
 </div>
 <div className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1 flex items-center gap-1.5">
 <i className="ri-map-pin-2-fill text-slate-400"></i> 
 <span className="truncate max-w-[220px] sm:max-w-[350px]">
 {displayArea}{displayLocation ?`• ${displayLocation.split(',').slice(0,2).join(',')}`:''}
 </span>
 </div>
 </div>
 </>
 )}
 </div>
 
 <div className="flex items-center gap-2 flex-wrap justify-end">
 {isLocked && <i className="ri-lock-2-fill text-slate-400 text-[13px] mr-1"title="Locked"></i>}
 {isEvent ? (
 <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-teal-600 text-white shadow-sm flex items-center gap-1">
 <span className="material-symbols-outlined text-[14px]">event</span>
 Community Event
 </span>
 ) : (
 <FlairPill category={issue.category} customFlair={issue.customFlair} />
 )}
 {!isEvent && <StatusBadge status={issue.status} />}
 </div>
 </div>

 {/* Post Content */}
 <div className="px-6 pb-4 cursor-pointer relative z-20">
 <Link to={isEvent ?`/cleanup-events/${issue._id}`:`/issues/${issue._id}`} className="block group-hover:opacity-90 transition-opacity">
 <h3 className="text-[20px] font-extrabold text-slate-800 dark:text-white mb-2 leading-snug tracking-tight">
 {issue.title}
 </h3>
 <p className="text-slate-600 dark:text-slate-300 text-[16px] leading-relaxed line-clamp-4">
 {issue.description}
 </p>
 </Link>
 </div>

 {/* Image Section */}
 {hasImages && (
 <div className="w-full relative bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 mt-1 z-20">
 <Link to={`/issues/${issue._id}`}>
 <img 
 src={issue.images[0]} 
 alt={issue.title} 
 className={`w-full h-[300px] sm:h-[400px] object-cover ${isLocked ?'opacity-70':''}`}
 />
 </Link>
 {issue.images.length > 1 && (
 <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md border border-white/20">
 <i className="ri-image-2-line mr-1"></i> 1 / {issue.images.length}
 </div>
 )}
 </div>
 )}

 {/* Admin Message for Locked/Rejected */}
 {isPending && (
 <div className="px-6 py-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/80 border-t border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 relative z-20">
 <p className="text-slate-600 dark:text-slate-300 font-medium text-[13px] flex items-start gap-2">
 <i className="ri-error-warning-fill text-slate-400 text-[13px]"></i>
 This post is pending admin review. No activity until approved.
 </p>
 </div>
 )}

 {isRejected && (
 <div className="px-6 py-4 bg-rose-50/80 border-t border-rose-200/60 relative z-20">
 <p className="text-rose-700 font-bold text-[13px] mb-1 flex items-center gap-1.5">
 <i className="ri-close-circle-fill text-[13px]"></i> Admin Feedback
 </p>
 <p className="text-rose-600/90 text-[13px] ml-6 italic">"{issue.rejectReason ||"Does not meet community guidelines."}"</p>
 </div>
 )}

 {/* Interactive Footer - HIDDEN if Locked */}
 {!isLocked && (
 <>
 {/* Crowdfunding Mini-bar */}
 {issue.crowdfunding?.enabled && (
 <div className="px-6 py-3.5 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-y border-emerald-100/50 flex items-center justify-between gap-5 relative z-20">
 <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-[13px] whitespace-nowrap">
 <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
 <i className="ri-hand-coin-fill text-emerald-600 text-[13px]"></i>
 </div>
 <span>৳{issue.crowdfunding.raised || issue.crowdfunding.raisedAmount || 0}</span>
 <span className="text-emerald-900/40 font-normal text-xs uppercase tracking-tight">/ ৳{issue.crowdfunding.goal || issue.crowdfunding.targetAmount || 0}</span>
 </div>
 <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-1 overflow-hidden">
 <div className="bg-emerald-500 h-1.5 rounded-full"style={{ width:`${Math.min(((issue.crowdfunding.raisedAmount || issue.crowdfunding.raised || 0) / Math.max(issue.crowdfunding.targetAmount || issue.crowdfunding.goal || 1, 1)) * 100, 100)}%`}}
 ></div>
 </div>
 </div>
 )}

 {/* Social Actions */}
 <div className={`px-6 py-4 flex items-center gap-4 relative z-20 ${!hasImages && !issue.crowdfunding?.enabled ?'border-t border-slate-100/80':''}`}>
 
 {/* Voting System (Only for non-events) */}
 {!isEvent && (
 <div className="flex items-center gap-2">
 <div className="relative">
 <AnimatePresence>
 {voteAnimation?.target ==='upvote'&& (
 <motion.span
 key={`up-${voteAnimation.id}`}
 initial={{ opacity: 0, y: 0, scale: 0.5 }}
 animate={{ opacity: 1, y: -25, scale: 1.2 }}
 exit={{ opacity: 0, y: -40, scale: 1 }}
 transition={{ duration: 0.6, ease:"easeOut"}}
 className={`absolute top-0 left-1/2 -translate-x-1/2 font-extrabold ${voteAnimation.color} pointer-events-none drop-shadow-sm z-10`}
 >
 {voteAnimation.value}
 </motion.span>
 )}
 </AnimatePresence>
 <button 
 onClick={() => handleVote("upvote")}
 className={`flex items-center justify-center h-10 px-3 sm:px-4 rounded-full transition-all font-bold text-[13px] border ${localIssue.userVote ==='up'?'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-sm':'text-slate-500 dark:text-slate-300 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:text-emerald-600'}`}
 >
 <i className={localIssue.userVote ==='up'?"ri-arrow-up-circle-fill text-[13px] tracking-tight":"ri-arrow-up-circle-line text-[13px] tracking-tight"}></i> 
 {localIssue.upvotes?.length > 0 && <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${localIssue.userVote ==='up'?'bg-emerald-100 text-emerald-700':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300'}`}>{localIssue.upvotes.length}</span>}
 </button>
 </div>

 <div className="relative">
 <AnimatePresence>
 {voteAnimation?.target ==='downvote'&& (
 <motion.span
 key={`down-${voteAnimation.id}`}
 initial={{ opacity: 0, y: 0, scale: 0.5 }}
 animate={{ opacity: 1, y: -25, scale: 1.2 }}
 exit={{ opacity: 0, y: -40, scale: 1 }}
 transition={{ duration: 0.6, ease:"easeOut"}}
 className={`absolute top-0 left-1/2 -translate-x-1/2 font-extrabold ${voteAnimation.color} pointer-events-none drop-shadow-sm z-10`}
 >
 {voteAnimation.value}
 </motion.span>
 )}
 </AnimatePresence>
 <button 
 onClick={() => handleVote("downvote")}
 className={`flex items-center justify-center h-10 px-3 sm:px-4 rounded-full transition-all font-bold text-[13px] border ${localIssue.userVote ==='down'?'text-rose-500 bg-rose-50 border-rose-200 shadow-sm':'text-slate-500 dark:text-slate-300 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:text-rose-500'}`}
 >
 <i className={localIssue.userVote ==='down'?"ri-arrow-down-circle-fill text-[13px] tracking-tight":"ri-arrow-down-circle-line text-[13px] tracking-tight"}></i> 
 {localIssue.downvotes?.length > 0 && <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${localIssue.userVote ==='down'?'bg-rose-100 text-rose-700':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300'}`}>{localIssue.downvotes.length}</span>}
 </button>
 </div>
 </div>
 )}
 
 {/* Comments/Going Pill */}
 <Link to={isEvent ?`/cleanup-events/${issue._id}`:`/issues/${issue._id}`} className={`flex items-center justify-center gap-2 ${isEvent ?'bg-teal-600 hover:bg-teal-700 text-white':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/60 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-600 dark:text-slate-300'} rounded-full px-5 h-10 transition-all duration-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm font-bold`}>
 {isEvent ? (
 <>
 <span className="material-symbols-outlined text-[20px]">groups</span>
 <span className="text-[15px]">View Event</span>
 </>
 ) : (
 <>
 <i className="ri-chat-3-fill text-[20px] text-slate-400"></i>
 <span className="text-[15px]">{issue.commentCount || 0} Comments</span>
 </>
 )}
 </Link>
 
 {/* Share Menu */}
 <div className="relative ml-auto"ref={shareMenuRef}>
 <button 
 onClick={(e) => { e.preventDefault(); setShowShareMenu(!showShareMenu); }}
 className="flex items-center justify-center gap-2 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full px-4 h-10 text-slate-500 dark:text-slate-300 transition-all duration-300 font-bold border border-transparent hover:border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:shadow-sm">
 <i className="ri-share-forward-fill text-[20px] text-slate-400"></i>
 <span className="text-[13px] hidden sm:inline uppercase tracking-wider">Share</span>
 </button>
 <AnimatePresence>
 {showShareMenu && (
 <motion.div 
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="absolute bottom-full right-0 mb-2 w-36 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] py-1.5 z-30 overflow-hidden">
 <button onClick={(e) => handleShare(e,'fb')} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#40826D]/10 hover:text-[#40826D] transition-colors flex items-center gap-2">
 <i className="ri-facebook-circle-fill text-blue-600"></i> Facebook
 </button>
 <button onClick={(e) => handleShare(e,'twitter')} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#40826D]/10 hover:text-[#40826D] transition-colors flex items-center gap-2">
 <i className="ri-twitter-x-line text-slate-900 dark:text-white"></i> X (Twitter)
 </button>
 <button onClick={(e) => handleShare(e,'copy')} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#40826D]/10 hover:text-[#40826D] transition-colors flex items-center gap-2">
 <i className="ri-link text-slate-500 dark:text-slate-300"></i> Copy Link
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </>
 )}

 {/* Edit Post Button for Locked Items */}
 {isLocked && user?.email && (user.email === issue.submittedBy?.email || user.email === issue.email) && (
 <div className="px-6 py-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] relative z-20 border-t border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 flex justify-end">
 <button className="btn btn-sm bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] shadow-sm">
 <i className="ri-edit-2-line"></i> {isRejected ?"Edit & Resubmit":"Edit Post"}
 </button>
 </div>
 )}

 </motion.div>
 );
});

SocialFeedCard.displayName ="SocialFeedCard";

export default SocialFeedCard;
