import React, { useState } from"react";
import SEO from "../common/SEO";
import { useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import { format, formatDistanceToNow } from"date-fns";
import MinimalLoader from"../common/MinimalLoader.jsx";
import { Link } from"react-router";
import BackButton from"../common/BackButton";
import { Player } from"@lottiefiles/react-lottie-player";
import emptyAnimation from"../../assets/lottie/empty-notices.json";

export default function Noticeboard() {
 const axiosSecure = useAxiosSecure();
 const axiosPublic = useAxiosPublic();
 const [selectedType, setSelectedType] = useState("All");
 const [selectedPriority, setSelectedPriority] = useState("Any");
 const [openDropdownId, setOpenDropdownId] = useState(null);

 const { data: notices = [], isLoading } = useQuery({
 queryKey: ["announcements"],
 queryFn: async () => {
 const res = await axiosPublic.get("/announcements");
 return res.data;
 },
 staleTime: 5 * 60 * 1000,
 });

 // Calculate Stats
 const activeCount = notices.length;
 const pinnedCount = notices.filter((n) => n.isPinned).length;
 const oneWeekAgo = new Date();
 oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
 const thisWeekCount = notices.filter((n) => {
    const d = n.date || n.createdAt;
    return d && !isNaN(new Date(d).getTime()) && new Date(d) >= oneWeekAgo;
  }).length;

 // Filter Notices
 const filteredNotices = notices.filter((notice) => {
 const matchesType =
 selectedType ==="All"||
 notice.type?.toLowerCase() === selectedType.toLowerCase();
 const matchesPriority =
 selectedPriority ==="Any"||
 notice.priority?.toLowerCase() === selectedPriority.toLowerCase();
 return matchesType && matchesPriority;
 });

 const STRIPE = {
 urgent:"border-l-4 border-red-500 bg-red-50/30",
 high:"border-l-4 border-orange-400 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]",
 medium:"border-l-4 border-teal-500 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]",
 low:"border-l-4 border-gray-300 dark:border-[#1e3040] dark:border-[#1e3040] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]",
 };

 const PRIORITY_BADGE = {
 urgent:"bg-red-50 text-red-600 border border-red-200/60",
 high:"bg-orange-50 text-orange-600 border border-orange-200/60",
 medium:"bg-teal-50 text-teal-700 border border-teal-200/60",
 low:"bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60",
 };

 const TYPE_BADGE = {
 General:"bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60",
 Announcement:"bg-blue-50 text-blue-600 border border-blue-200/60",
 Event:"bg-emerald-50 text-emerald-600 border border-emerald-200/60",
 Warning:"bg-amber-50 text-amber-700 border border-amber-200/60",
 Maintenance:"bg-purple-50 text-purple-650 border border-purple-200/60",
 };

 return (
 <div className="min-h-screen dark:bg-[#0b1215] pt-28 pb-20 px-[5%]">
 <SEO title="Official Noticeboard" />
 {openDropdownId && (
 <div className="fixed inset-0 z-20"onClick={() => setOpenDropdownId(null)} />
 )}
 <div className="max-w-5xl mx-auto">
 <BackButton variant="dark"className="mb-6 inline-flex"/>

 {/* Banner */}
 <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-xl p-5 md:p-10 text-white flex flex-col md:flex-row justify-between items-center mb-8 relative overflow-hidden shadow-xl border border-teal-700/50">
 {/* Geometric subtle background grid */}
 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"/>
 <div className="flex-1 z-10 text-center md:text-left">
 <h1 className="font-heading text-4xl tracking-tight md:text-5xl tracking-tight font-black mb-3 tracking-tight flex items-center justify-center md:justify-start gap-3">
 <i className="ri-megaphone-fill text-emerald-300 text-3xl tracking-tight md:text-4xl tracking-tight animate-pulse"/>
 Community Notices
 </h1>
 <p className="font-body text-emerald-100 text-[13px] md:text-[13px] max-w-2xl mb-6">
 Official announcements, upcoming events, warnings, and maintenance updates for our neighborhood.
 </p>
 {/* Live Stats Badges */}
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
 <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-[10px] text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all hover:bg-white/20 select-none">
 <span className="flex h-5 px-2 items-center justify-center rounded-[6px] bg-emerald-500/20 text-emerald-300 font-bold text-xs">
 {activeCount}
 </span>
 <span className="text-white flex items-center gap-1.5">
 <i className="ri-checkbox-circle-fill text-emerald-400"/>
 Active Notices
 </span>
 </div>
 <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-[10px] text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all hover:bg-white/20 select-none">
 <span className="flex h-5 px-2 items-center justify-center rounded-[6px] bg-amber-500/20 text-amber-300 font-bold text-xs">
 {pinnedCount}
 </span>
 <span className="text-white flex items-center gap-1.5">
 <i className="ri-pushpin-2-fill text-amber-400"/>
 Important Alerts
 </span>
 </div>
 <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-[10px] text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all hover:bg-white/20 select-none">
 <span className="flex h-5 px-2 items-center justify-center rounded-[6px] bg-sky-500/20 text-sky-300 font-bold text-xs">
 {thisWeekCount}
 </span>
 <span className="text-white flex items-center gap-1.5">
 <i className="ri-calendar-check-fill text-sky-400"/>
 New This Week
 </span>
 </div>
 </div>
 </div>
 {/* Bell Icon Design */}
 <div className="w-40 h-40 shrink-0 select-none z-10 mt-6 md:mt-0 flex items-center justify-center relative">
 <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping opacity-30 scale-75"/>
 <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg">
 <span className="material-symbols-outlined text-[64px] text-white animate-bounce"style={{ animationDuration:'3s'}}>
 notifications_active
 </span>
 </div>
 </div>
 </div>

 {/* Filter Controls Bar */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm">
 {/* Type Filters */}
 <div className="flex flex-wrap gap-2">
 {["All","General","Announcement","Event","Warning","Maintenance"].map((type) => (
 <button
 key={type}
 onClick={() => setSelectedType(type)}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
 selectedType === type
 ?"bg-[#0f766e] text-white shadow-sm":"bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 hover:bg-slate-200"}`}
 >
 {type}
 </button>
 ))}
 </div>

 {/* Urgency/Priority Filters */}
 <div className="flex items-center gap-3">
 <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Urgency:</span>
 <div className="flex gap-1.5">
 {["Any","Urgent","High","Medium","Low"].map((priority) => (
 <button
 key={priority}
 onClick={() => setSelectedPriority(priority)}
 className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
 selectedPriority === priority
 ?"bg-slate-900 text-white shadow-sm":"bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300 hover:bg-slate-200"}`}
 >
 {priority ==="Urgent"&& <span className="w-2 h-2 rounded-full bg-red-500"/>}
 {priority ==="High"&& <span className="w-2 h-2 rounded-full bg-orange-400"/>}
 {priority ==="Medium"&& <span className="w-2 h-2 rounded-full bg-teal-500"/>}
 {priority ==="Low"&& <span className="w-2 h-2 rounded-full bg-gray-400"/>}
 {priority}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Notice List */}
 {isLoading ? (
 <div className="space-y-4">
 {[1, 2, 3].map(i => <NoticeSkeleton key={i} />)}
 </div>
 ) : filteredNotices.length === 0 ? (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-16 text-center border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm flex flex-col items-center">
 {/* Lottie checkmark animation (tick sign) used strictly once here */}
 <div className="w-32 h-32 shrink-0 select-none flex items-center justify-center">
 <Player autoplay loop src={emptyAnimation} style={{ width: 120, height: 120 }} />
 </div>
 <p className="font-heading text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mt-6">
 No matching notices found
 </p>
 <p className="text-slate-400 text-[13px] mt-1 max-w-sm">
 We couldn't find any announcements matching your current filters. Try choosing a different type or urgency.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {filteredNotices.map((notice) => {
 const stripeStyle = STRIPE[notice.priority?.toLowerCase()] || STRIPE.medium;
 
 const attachmentsList = [];
 if (Array.isArray(notice.attachments) && notice.attachments.length > 0) {
 attachmentsList.push(...notice.attachments);
 } else if (notice.attachmentUrl || notice.attachment) {
 attachmentsList.push({ name:"Attachment", url: notice.attachmentUrl || notice.attachment });
 }

 return (
 <div
 key={notice._id}
 className={`rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] ${stripeStyle}`}
 >
 <div className="flex flex-col sm:flex-row gap-5 items-start">
 {notice.coverImage && (
 <div className="w-full sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <img src={notice.coverImage} alt={notice.title} className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"/>
 </div>
 )}
 <div className="flex-1 min-w-0 w-full">
 <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
 <div>
 <div className="flex flex-wrap items-center gap-2 mb-2">
 {notice.isPinned && (
 <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
 <i className="ri-pushpin-2-fill text-xs"/> PINNED
 </span>
 )}
 <span
 className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
 PRIORITY_BADGE[notice.priority?.toLowerCase()] || PRIORITY_BADGE.medium
 }`}
 >
 {notice.priority}
 </span>
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
 TYPE_BADGE[notice.type] || TYPE_BADGE.General
 }`}>
 {notice.type}
 </span>
 {notice.targetGroup && notice.targetGroup !=="All"&& (
 <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
 <i className="ri-group-line text-xs"/> {notice.targetGroup}
 </span>
 )}
 {notice.affectedArea && notice.affectedArea !=="All Areas"&& (
 <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
 <i className="ri-map-pin-line text-xs"/> {notice.affectedArea}
 </span>
 )}
 </div>
 <h2 className="font-heading text-[13px] md:text-[13px] tracking-tight font-bold text-slate-800 dark:text-white leading-snug tracking-tight">
 {notice.title}
 </h2>
 </div>

 <div className="text-left sm:text-right shrink-0">
 <p className="font-body text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
 Expires
 </p>
 <p className="font-body text-xs font-semibold text-slate-600 dark:text-slate-300">
 {notice.validUntil && !isNaN(new Date(notice.validUntil).getTime())
 ? format(new Date(notice.validUntil),"MMM do, yyyy")
 :"Ongoing"}
 </p>
 </div>
 </div>

 <p className="font-body text-slate-650 leading-relaxed text-xs whitespace-pre-wrap mb-3 line-clamp-3">
 {notice.description}
 </p>

 {notice.actionRequired && (
 <div className="mb-4 p-3.5 bg-gradient-to-r from-amber-50/90 via-amber-100/30 to-orange-50/30 border border-amber-200/70 rounded-xl text-xs text-amber-950 flex items-start gap-2.5 shadow-sm select-none">
 <i className="ri-alert-line shrink-0 text-amber-600 text-[13px] mt-0.5"/>
 <div className="line-clamp-2 leading-relaxed">
 <span className="font-bold text-amber-800">Action Required: </span>
 {notice.actionRequired}
 </div>
 </div>
 )}

 <div className="flex flex-wrap justify-between items-center gap-4 pt-3 border-t border-slate-100 animate-fadeIn">
 {(() => {
 const isPosterAdmin = notice.posterRole ==="admin"|| notice.postedBy?.toLowerCase().includes("admin") || notice.posterName?.toLowerCase().includes("admin");
 return (
 <p className="text-[11px] text-slate-400 font-medium">
 Posted {(() => {
    const d = notice.date || notice.createdAt;
    return d && !isNaN(new Date(d).getTime())
      ? formatDistanceToNow(new Date(d), { addSuffix: true })
      : "recently";
  })()}
 {!isPosterAdmin && notice.posterName && (
 <> by <span className="text-slate-500 dark:text-slate-300 font-semibold">{notice.posterName}</span></>
 )}
 </p>
 );
 })()}

 <div className="flex gap-2">
 {attachmentsList.length === 1 && (
 <a
 href={attachmentsList[0].url}
 target="_blank"rel="noopener noreferrer"className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] text-xs font-bold rounded-[8px] transition-all flex items-center gap-1.5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40">
 <i className="ri-attachment-line text-[13px]"/> View Attachment
 </a>
 )}
 {attachmentsList.length > 1 && (
 <div className="relative">
 <button
 onClick={() => setOpenDropdownId(openDropdownId === notice._id ? null : notice._id)}
 className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] text-xs font-bold rounded-[8px] transition-all flex items-center gap-1.5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40 cursor-pointer select-none">
 <i className="ri-attachment-line text-[13px]"/> View Attachments ({attachmentsList.length})
 <i className={`ri-arrow-down-s-line text-slate-500 dark:text-slate-300 transition-transform duration-200 ${openDropdownId === notice._id ?'rotate-180 text-teal-600':''}`} />
 </button>
 
 {openDropdownId === notice._id && (
 <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[8px] shadow-xl z-30 py-1.5 min-w-[220px] text-left">
 <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
 Official Documents ({attachmentsList.length})
 </div>
 <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
 {attachmentsList.map((att, idx) => {
 const isPdf = att.name?.toLowerCase().endsWith(".pdf") || att.url?.toLowerCase().endsWith(".pdf");
 return (
 <a
 key={idx}
 href={att.url}
 target="_blank"rel="noopener noreferrer"className="px-3.5 py-2 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] text-xs font-semibold flex items-center gap-2 transition-colors"onClick={() => setOpenDropdownId(null)}
 >
 <i className={`${isPdf ?'ri-file-pdf-line text-red-500':'ri-file-text-line text-blue-500'} text-[13px] shrink-0`} />
 <span className="truncate max-w-[150px] inline-block"title={att.name}>{att.name ||`Document ${idx + 1}`}</span>
 </a>
 );
 })}
 </div>
 </div>
 )}
 </div>
 )}
 <Link
 to={`/noticeboard/${notice._id}`}
 className="px-3.5 py-1.5 bg-[#0f766e] hover:bg-[#0d645d] text-white text-xs font-bold rounded-[8px] transition-all flex items-center gap-1 shadow-sm">
 Details <i className="ri-arrow-right-line"/>
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}

function NoticeSkeleton() {
 return (
 <div className="rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 shadow-sm bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] animate-pulse">
 <div className="flex flex-col sm:flex-row gap-5 items-start">
 <div className="w-full sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl bg-slate-200 dark:bg-[#1e3040] shrink-0"></div>
 <div className="flex-1 w-full space-y-4">
 <div className="flex justify-between items-start gap-4">
 <div className="space-y-2 flex-1">
 <div className="flex gap-2">
 <div className="h-4 w-16 bg-slate-200 dark:bg-[#1e3040] rounded-full"></div>
 <div className="h-4 w-20 bg-slate-200 dark:bg-[#1e3040] rounded-full"></div>
 </div>
 <div className="h-6 w-3/4 bg-slate-200 dark:bg-[#1e3040] rounded-lg"></div>
 </div>
 <div className="w-20 space-y-1 text-right">
 <div className="h-3 w-12 bg-slate-200 dark:bg-[#1e3040] rounded ml-auto"></div>
 <div className="h-4 w-16 bg-slate-200 dark:bg-[#1e3040] rounded ml-auto"></div>
 </div>
 </div>
 <div className="space-y-2">
 <div className="h-3 w-full bg-slate-200 dark:bg-[#1e3040] rounded"></div>
 <div className="h-3 w-5/6 bg-slate-200 dark:bg-[#1e3040] rounded"></div>
 </div>
 <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-[#1e3040]">
 <div className="h-3 w-32 bg-slate-200 dark:bg-[#1e3040] rounded"></div>
 <div className="h-8 w-24 bg-slate-200 dark:bg-[#1e3040] rounded-lg"></div>
 </div>
 </div>
 </div>
 </div>
 );
}
