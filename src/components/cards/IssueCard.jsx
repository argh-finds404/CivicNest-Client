import React, { useState, useRef, useEffect } from'react';
import { Link } from'react-router';
import { motion, AnimatePresence } from'framer-motion';
import FlairPill from'../common/FlairPill';
import StatusBadge from'../common/StatusBadge';
import { useAuth } from'../../hooks/useAuth';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';
import { useRole } from'../../hooks/useRole';
import { useQueryClient } from'@tanstack/react-query';

const IssueCard = React.forwardRef(({ issue, isOwnerView }, ref) => {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const [role, isRoleLoading, isVolunteer, streak, userData] = useRole();
 
 const [localIssue, setLocalIssue] = useState(issue);

 const isBookmarked = userData?.bookmarks?.some(b => b.itemId === localIssue._id) || false;

 const handleBookmark = async (e) => {
 e.preventDefault();
 if (!user) return;
 try {
 const action = isBookmarked ?'remove':'add';
 await axiosSecure.patch('/users/my/bookmark', {
 itemId: localIssue._id,
 type:'issue',
 action
 });
 toast.success(isBookmarked ?"Removed from bookmarks":"Saved to bookmarks");
 queryClient.invalidateQueries({ queryKey: [user?.email,"role"] });
 } catch (err) {
 toast.error(err.response?.data?.error || err.message);
 }
 };

 const [voteAnimation, setVoteAnimation] = useState({ type: null, id: 0 });
 const [showShareMenu, setShowShareMenu] = useState(false);
 const shareMenuRef = useRef(null);

 // Sync local state if props change
 useEffect(() => { setLocalIssue(issue); }, [issue]);

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
 setShowShareMenu(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleVote = async (e, type) => {
 e.preventDefault();
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
 const url =`${window.location.origin}/issues/${localIssue._id}`;
 if (platform ==='copy') {
 navigator.clipboard.writeText(url);
 toast.success("Link copied to clipboard!");
 } else if (platform ==='fb') {
 window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank');
 } else if (platform ==='twitter') {
 window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(localIssue.title)}`,'_blank');
 }
 setShowShareMenu(false);
 };

 const isPending = localIssue.approvalStatus ==='pending_review';
 const isRejected = localIssue.approvalStatus ==='rejected'|| localIssue.status ==='rejected';
 const isLocked = isPending || isRejected;

 const dateToUse = localIssue.submittedAt || localIssue.createdAt || localIssue.incidentDate;
 const formattedDate = dateToUse ? new Date(dateToUse).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit', hour12: true }) :"Unknown Date";
 const authorName = localIssue.isAnonymous ?"Anonymous Member": (localIssue.submittedBy?.name ||"User");
 
 let cardClass ="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden flex flex-col group transition-all duration-300";
 let imageContainerClass ="relative w-full h-52 overflow-hidden bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]";
 
 if (isLocked) {
 if (isRejected) {
 cardClass +="border-red-200 shadow-sm shadow-red-100";
 imageContainerClass +="after:content-[''] after:absolute after:inset-0 after:bg-red-900/30";
 } else {
 imageContainerClass +="after:content-[''] after:absolute after:inset-0 after:bg-slate-900/40";
 }
 }

 return (
 <motion.div 
 ref={ref}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 whileHover={{ y: -4, boxShadow:"0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)"}}
 transition={{ duration: 0.3 }}
 className={cardClass}
 >
 {/* Image Header */}
 <div className={imageContainerClass}>
 <img 
 src={issue.images?.[0] ||'https://via.placeholder.com/400x300?text=No+Image'} 
 alt={issue.title} 
 className={`w-full h-full object-cover transition-transform duration-700 ${!isLocked ?'group-hover:scale-105':''}`}
 />
 
 <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
 <StatusBadge status={issue.status} />
 </div>
 
 <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
 <FlairPill category={issue.category} customFlair={issue.customFlair} />
 {localIssue.isStale && (
 <div className="bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded shadow-md border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
 <i className="ri-error-warning-fill text-xs"></i>
 {localIssue.daysOpen}d Unresolved
 </div>
 )}
 </div>

 {isLocked && (
 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-[2px]">
 <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow-xl ${isRejected ?'text-red-500':'text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]'}`}>
 <i className={`${isRejected ?'ri-error-warning-fill':'ri-lock-fill'} text-2xl tracking-tight`}></i>
 </div>
 <h3 className="font-bold text-[13px] mb-1 drop-shadow-md tracking-tight">
 {isRejected ?"Rejected by Admins":"Pending Review"}
 </h3>
 {isRejected && localIssue.rejectionReason && (
 <p className="text-[13px] font-medium opacity-90 drop-shadow-md line-clamp-2">Reason: {localIssue.rejectionReason}</p>
 )}
 </div>
 )}
 </div>

 {/* Content */}
 <div className="p-5 flex-grow flex flex-col">
 <div className="flex justify-between items-center mb-3">
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><i className="ri-map-pin-line"></i> {issue.area}</span>
 <span className="text-xs font-medium text-slate-400">{formattedDate}</span>
 </div>
 
 <h3 className="text-[19px] font-bold text-slate-800 dark:text-white mb-2 leading-snug line-clamp-2 group-hover:text-[#028090] transition-colors tracking-tight">{localIssue.title}</h3>
 
 <p className="text-slate-500 dark:text-slate-300 text-[14px] leading-relaxed line-clamp-2 flex-grow mb-4">
 {localIssue.description}
 </p>

 {localIssue.crowdfunding?.enabled && (
 <div className="mb-4 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
 <div className="flex justify-between text-xs font-bold mb-1">
 <span className="text-emerald-700 flex items-center gap-1"><i className="ri-hand-coin-fill"></i> Fund Raised</span>
 <span className="text-emerald-900">৳{localIssue.crowdfunding.raisedAmount || localIssue.crowdfunding.raised || 0} / ৳{localIssue.crowdfunding.targetAmount || localIssue.crowdfunding.goal || 0}</span>
 </div>
 <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-1 overflow-hidden">
 <div 
 className="bg-emerald-500 h-1.5 rounded-full"style={{ width:`${Math.min(((localIssue.crowdfunding.raisedAmount || localIssue.crowdfunding.raised || 0) / Math.max(localIssue.crowdfunding.targetAmount || localIssue.crowdfunding.goal || 1, 1)) * 100, 100)}%`}}
 ></div>
 </div>
 </div>
 )}
 
 <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
 <div className="flex items-center gap-2">
 {localIssue.isAnonymous ? (
 <>
 <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] overflow-hidden flex items-center justify-center flex-shrink-0 text-slate-400">
 <i className="ri-spy-fill text-xs"></i>
 </div>
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{authorName}</span>
 <i className="ri-spy-fill text-slate-400 text-xs"title="Anonymous"></i>
 </>
 ) : (
 <Link to={`/user/${localIssue.submittedBy?.userId}`} className="flex items-center gap-2 group/author w-full">
 <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] overflow-hidden flex items-center justify-center flex-shrink-0 group-hover/author:ring-2 ring-[#028090] transition-all">
 {localIssue.submittedBy?.photoURL ? <img src={localIssue.submittedBy.photoURL} alt="Author"className="w-full h-full object-cover"/> : <i className="ri-user-smile-line text-xs text-slate-400"></i>}
 </div>
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate group-hover/author:text-[#028090] transition-colors">{authorName}</span>
 </Link>
 )}
 </div>
 
 {user && (
 <button 
 onClick={handleBookmark}
 className={`w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:hover:bg-slate-800 flex items-center justify-center transition-colors select-none cursor-pointer ${
 isBookmarked ?'text-teal-600 dark:text-teal-400':'text-slate-500 dark:text-slate-300'}`}
 title={isBookmarked ?"Remove Bookmark":"Save Issue"}
 >
 <i className={isBookmarked ?"ri-bookmark-fill":"ri-bookmark-line"}></i>
 </button>
 )}

 <div className="relative"ref={shareMenuRef}>
 <button 
 onClick={(e) => { e.preventDefault(); setShowShareMenu(!showShareMenu); }}
 className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors">
 <i className="ri-share-forward-line"></i>
 </button>
 <AnimatePresence>
 {showShareMenu && (
 <motion.div 
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="absolute bottom-full right-0 mb-2 w-36 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] py-1.5 z-30 overflow-hidden">
 <button onClick={(e) => handleShare(e,'fb')} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#028090]/10 hover:text-[#028090] transition-colors flex items-center gap-2">
 <i className="ri-facebook-circle-fill text-blue-600"></i> Facebook
 </button>
 <button onClick={(e) => handleShare(e,'twitter')} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#028090]/10 hover:text-[#028090] transition-colors flex items-center gap-2">
 <i className="ri-twitter-x-line text-slate-900 dark:text-white"></i> X (Twitter)
 </button>
 <button onClick={(e) => handleShare(e,'copy')} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#028090]/10 hover:text-[#028090] transition-colors flex items-center gap-2">
 <i className="ri-link text-slate-500 dark:text-slate-300"></i> Copy Link
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>

 {/* Footer Stats & Actions */}
 <div className="px-4 py-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-t border-slate-100 flex justify-between items-center">
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1.5">
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
 onClick={(e) => handleVote(e,"upvote")}
 className={`flex items-center justify-center h-8 px-2 sm:px-3 rounded-full transition-all font-bold text-xs border ${localIssue.userVote ==='up'?'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-sm':'text-slate-500 dark:text-slate-300 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:text-emerald-600'}`}
 >
 <i className={localIssue.userVote ==='up'?"ri-arrow-up-circle-fill text-[13px]":"ri-arrow-up-circle-line text-[13px]"}></i> 
 {localIssue.upvotes?.length > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${localIssue.userVote ==='up'?'bg-emerald-100 text-emerald-700':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300'}`}>{localIssue.upvotes.length}</span>}
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
 onClick={(e) => handleVote(e,"downvote")}
 className={`flex items-center justify-center h-8 px-2 sm:px-3 rounded-full transition-all font-bold text-xs border ${localIssue.userVote ==='down'?'text-rose-500 bg-rose-50 border-rose-200 shadow-sm':'text-slate-500 dark:text-slate-300 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:text-rose-500'}`}
 >
 <i className={localIssue.userVote ==='down'?"ri-arrow-down-circle-fill text-[13px]":"ri-arrow-down-circle-line text-[13px]"}></i> 
 {localIssue.downvotes?.length > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${localIssue.userVote ==='down'?'bg-rose-100 text-rose-700':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300'}`}>{localIssue.downvotes.length}</span>}
 </button>
 </div>
 </div>
 
 <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300 font-bold text-[13px]">
 <i className="ri-chat-3-line text-[13px]"></i>
 {localIssue.commentCount || 0}
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 {isOwnerView && (
 <Link 
 to={`/issues/edit/${localIssue._id}`}
 className="btn btn-sm btn-ghost hover:bg-teal-50 text-teal-600 border border-teal-200 font-bold px-3 transition-colors">
 Edit <i className="ri-edit-line"></i>
 </Link>
 )}
 <Link 
 to={`/issues/${localIssue._id}`}
 state={{ from:'personal'}}
 className="btn btn-sm btn-ghost hover:bg-[#028090]/10 text-[#028090] font-bold px-3">
 Details <i className="ri-arrow-right-line"></i>
 </Link>
 </div>
 </div>

 </motion.div>
 );
});

IssueCard.displayName ="IssueCard";

export default IssueCard;
