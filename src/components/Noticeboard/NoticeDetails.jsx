import React, { useState, useEffect } from'react';
import { useParams, Link } from'react-router';
import { motion } from'framer-motion';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import MinimalLoader from'../common/MinimalLoader';
import { TiWarning } from"react-icons/ti";
import BackButton from'../common/BackButton';
import PageTitle from'../common/PageTitle';


const NoticeDetails = () => {
 const { id } = useParams();
 const [notice, setNotice] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const axiosPublic = useAxiosPublic();

 useEffect(() => {
 const fetchNotice = async () => {
 try {
 const res = await axiosPublic.get(`/announcements/${id}`);
 setNotice(res.data);
 } catch (error) {
 console.error("Failed to fetch notice details:", error);
 } finally {
 setIsLoading(false);
 }
 };
 fetchNotice();
 }, [id, axiosPublic]);

 if (isLoading) {
 return (
 <div className="flex justify-center items-center py-32 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] min-h-[60vh]">
 <MinimalLoader size="xl"color="#40826D"/>
 </div>
 );
 }

 if (!notice) {
 return (
 <div className="text-center py-12 min-h-[60vh] flex flex-col items-center justify-center">
 <h2 className="text-2xl tracking-tight font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] tracking-tight">Notice not found</h2>
 <p className="text-slate-500 dark:text-slate-300 mt-2 mb-6">The announcement you are looking for does not exist or has expired.</p>
 <Link to="/noticeboard"className="btn bg-[#40826D] text-white rounded-full px-8">
 Back to Noticeboard
 </Link>
 </div>
 );
 }

 const getTypeStyle = (type, priority) => {
 if (priority ==='urgent') return"bg-red-50 text-red-600 border-red-200/60";
 switch (type) {
 case'Announcement': return"bg-blue-50 text-blue-600 border-blue-200/60";
 case'Event': return"bg-emerald-50 text-emerald-600 border-emerald-200/60";
 case'Warning': return"bg-amber-50 text-amber-700 border-amber-200/60";
 case'Maintenance': return"bg-purple-50 text-purple-600 border-purple-200/60";
 default: return"bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60";
 }
 };

 const getIcon = (type, priority) => {
 if (priority ==='urgent') return"ri-alarm-warning-line";
 switch (type) {
 case'Announcement': return"ri-megaphone-line";
 case'Event': return"ri-calendar-event-line";
 case'Warning': return"ri-error-warning-line";
 case'Maintenance': return"ri-tools-line";
 default: return"ri-information-line";
 }
 };

 return (
 <div className="w-full dark:bg-[#0b1215] min-h-screen py-12 px-4">
 <PageTitle title={notice?.title ?`${notice.title} - Notice Details`:"Notice Details"} />
 
 <div className="max-w-4xl mx-auto">
 <BackButton variant="dark"className="mb-6">
 <span>Back to Noticeboard</span>
 </BackButton>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden">
 {notice.coverImage && (
 <div className="w-full h-64 md:h-80 relative overflow-hidden">
 <img src={notice.coverImage} alt={notice.title} className="w-full h-full object-cover"/>
 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"/>
 </div>
 )}

 {/* Header */}
 <div className="p-5 border-b border-slate-100 relative overflow-hidden">
 <div className={`absolute top-0 right-0 -mr-10 -mt-10 opacity-[0.03] text-[150px] ${getTypeStyle(notice.type, notice.priority)}`}>
 <i className={getIcon(notice.type, notice.priority)}></i>
 </div>

 <div className="flex flex-wrap gap-2.5 mb-4">
 <span className={`px-3.5 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 shadow-sm ${getTypeStyle(notice.type, notice.priority)}`}>
 <i className={getIcon(notice.type, notice.priority)}></i> {notice.type}
 </span>
 {notice.priority ==='urgent'&& (
 <span className="px-3.5 py-1 rounded-full text-xs font-black border bg-red-50 text-red-600 border-red-200 flex items-center gap-1.5 shadow-sm">
 <i className="ri-flashlight-fill"></i> Urgent
 </span>
 )}
 {notice.targetGroup && notice.targetGroup !=='All'&& (
 <span className="px-3.5 py-1 rounded-full text-xs font-black border bg-violet-50 text-violet-700 border-violet-200 flex items-center gap-1.5 select-none shadow-sm">
 <i className="ri-group-line"></i> {notice.targetGroup}
 </span>
 )}
 {notice.affectedArea && notice.affectedArea !=='All Areas'&& (
 <span className="px-3.5 py-1 rounded-full text-xs font-black border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1.5 select-none shadow-sm">
 <i className="ri-map-pin-line"></i> {notice.affectedArea}
 </span>
 )}
 </div>

 <h1 className="text-2xl tracking-tight md:text-3xl tracking-tight font-heading font-black text-slate-800 dark:text-white mb-5 tracking-tight leading-tight">
 {notice.title}
 </h1>

 {/* Dates Row */}
 <div className="flex flex-wrap gap-3 mt-4">
 <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-inner">
 <i className="ri-calendar-line text-[#0f766e] text-[13px]"/>
 <span>Posted: <span className="text-slate-800 dark:text-white font-bold">{new Date(notice.createdAt || notice.date).toLocaleDateString()}</span></span>
 </div>
 {notice.validUntil && (
 <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-inner">
 <i className="ri-time-line text-orange-500 text-[13px]"/>
 <span>Expires: <span className="text-slate-800 dark:text-white font-bold">{new Date(notice.validUntil).toLocaleDateString()}</span></span>
 </div>
 )}
 </div>
 </div>

 {/* Body */}
 <div className="p-5">
 <div className="prose prose-slate max-w-none text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] leading-relaxed text-[13px] whitespace-pre-line mb-8">
 {notice.description}
 </div>

 {notice.actionRequired && (
 <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 via-amber-100/35 to-orange-50/25 rounded-lg border border-amber-200/65 shadow-sm flex items-start gap-4 select-none animate-fadeIn">
 <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center text-2xl tracking-tight shrink-0 shadow-inner">
 <i className="ri-alert-line"></i>
 </div>
 <div className="flex-1">
 <h4 className="font-heading font-black text-amber-900 text-[13px] tracking-tight flex items-center gap-1.5 uppercase">
 <TiWarning /> Citizen Instructions / Action Required
 </h4>
 <p className="text-[11px] text-amber-700/80 font-bold mt-0.5">Please execute the following actions to ensure safety and cooperation:</p>
 <div className="text-xs text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-semibold mt-3.5 leading-relaxed bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/70 border border-amber-200/50 p-4 rounded-xl shadow-sm">
 {notice.actionRequired}
 </div>
 </div>
 </div>
 )}

 {notice.organizerName && (
 <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-teal-50/20 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex flex-wrap items-center justify-between gap-4 shadow-sm animate-fadeIn">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-xl shadow-inner flex items-center justify-center text-teal-700 text-[13px] tracking-tight">
 <i className="ri-user-star-line"></i>
 </div>
 <div>
 <h4 className="font-bold text-slate-800 dark:text-white text-[13px]">Notice Coordinator / Contact</h4>
 <p className="text-[10px] text-slate-450 mt-0.5">For inquiries or coordination regarding this notice:</p>
 <div className="text-xs font-bold mt-1.5 flex flex-wrap items-center gap-2">
 <span className="px-2 py-0.5 bg-teal-650/10 border border-teal-600/15 rounded-md text-[#0f766e]">{notice.organizerName}</span>
 {notice.organizerContact && (
 <span className="text-slate-500 dark:text-slate-300 font-semibold flex items-center gap-1">
 <i className="ri-mail-open-line text-slate-400"/> {notice.organizerContact}
 </span>
 )}
 </div>
 </div>
 </div>
 {notice.organizerContact && notice.organizerContact.includes('@') && (
 <a href={`mailto:${notice.organizerContact}`} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 border-0">
 <i className="ri-mail-send-line text-[13px]"/> Email Coordinator
 </a>
 )}
 </div>
 )}

 {(() => {
 const attachmentsList = [];
 if (Array.isArray(notice.attachments) && notice.attachments.length > 0) {
 attachmentsList.push(...notice.attachments);
 } else if (notice.attachmentUrl || notice.attachment) {
 attachmentsList.push({ name:"Official Notice Document", url: notice.attachmentUrl || notice.attachment });
 }

 if (attachmentsList.length === 0) return null;

 return (
 <div className="mt-6 p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm animate-fadeIn">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-inner flex items-center justify-center text-blue-600 text-[13px] tracking-tight border border-slate-100">
 <i className="ri-file-text-line"></i>
 </div>
 <div>
 <h4 className="font-bold text-slate-800 dark:text-white text-[13px]">Official Attachments / Resources</h4>
 <p className="text-[10px] text-slate-450 mt-0.5">Download or view the official document attachments associated with this notice:</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
 {attachmentsList.map((file, idx) => {
 const isPdf = file.name?.toLowerCase().endsWith(".pdf") || file.url?.toLowerCase().endsWith(".pdf");
 return (
 <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl shadow-sm hover:border-slate-350 transition-all">
 <div className="flex items-center gap-2.5 min-w-0">
 <i className={`${isPdf ?'ri-file-pdf-line text-red-500 text-[13px] tracking-tight':'ri-file-text-line text-blue-500 text-[13px] tracking-tight'} shrink-0`} />
 <div className="min-w-0">
 <p className="text-xs font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] truncate max-w-[200px]"title={file.name}>
 {file.name ||`Attachment ${idx + 1}`}
 </p>
 <p className="text-[9px] text-slate-400">Official Resource</p>
 </div>
 </div>
 <a
 href={file.url}
 target="_blank"rel="noopener noreferrer"className="px-4 py-2 bg-[#0f766e]/10 hover:bg-[#0f766e]/20 text-[#0f766e] text-xs font-black rounded-lg transition-all flex items-center gap-1 border-0">
 Open <i className="ri-external-link-line"/>
 </a>
 </div>
 );
 })}
 </div>
 </div>
 );
 })()}
 </div>
 </motion.div>
 </div>
 </div>
 );
};

export default NoticeDetails;
