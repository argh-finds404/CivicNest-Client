import React, { useState } from"react";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { formatDistanceToNow } from"date-fns";
import { useForm } from"react-hook-form";
import toast from"react-hot-toast";
import Swal from"sweetalert2";
import MinimalLoader from"../common/MinimalLoader.jsx";
import { motion, AnimatePresence } from"framer-motion";

export default function AdminNotices() {
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const [showCreate, setShowCreate] = useState(false);
 const [editTarget, setEditTarget] = useState(null);

 const { data: notices = [], isLoading } = useQuery({
 queryKey: ["adminNotices"],
 queryFn: () => axiosSecure.get("/announcements?all=true").then((r) => r.data),
 });

 const deleteMutation = useMutation({
 mutationFn: (id) => axiosSecure.delete(`/announcements/${id}`),
 onSuccess: () => {
 toast.success("Notice deleted.");
 queryClient.invalidateQueries({ queryKey: ["adminNotices"] });
 queryClient.invalidateQueries({ queryKey: ["announcements"] }); // update public noticeboard as well
 },
 });

 const pinMutation = useMutation({
 mutationFn: (id) => axiosSecure.patch(`/announcements/${id}/pin`),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["adminNotices"] });
 queryClient.invalidateQueries({ queryKey: ["announcements"] });
 },
 });

 const handleDelete = async (id, title) => {
 const result = await Swal.fire({
 title:"Delete this notice?",
 text:`"${title}"will be removed from the noticeboard.`,
 icon:"warning",
 showCancelButton: true,
 confirmButtonColor:"#dc2626",
 cancelButtonColor:"#6b7280",
 confirmButtonText:"Delete",
 });
 if (result.isConfirmed) {
 deleteMutation.mutate(id);
 }
 };

 const active = notices.filter(
 (n) => !n.validUntil || new Date(n.validUntil) > new Date()
 );
 const expired = notices.filter(
 (n) => n.validUntil && new Date(n.validUntil) <= new Date()
 );

 const PRIORITY_STRIPE = {
 urgent:"border-l-4 border-red-500",
 high:"border-l-4 border-orange-400",
 medium:"border-l-4 border-teal-500",
 low:"border-l-4 border-gray-300 dark:border-[#1e3040] dark:border-[#1e3040]",
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
 <div>
 {/* Header */}
 <div className="sticky top-0 z-20 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] px-8 py-5 flex items-center justify-between">
 <div>
 <h1 className="text-[13px] tracking-tight font-black text-slate-800 dark:text-white tracking-tight">
 Notice Management
 </h1>
 <p className="text-[13px] font-semibold text-slate-400 mt-0.5">
 {active.length} active · {notices.filter((n) => n.isPinned).length} pinned · {expired.length} expired
 </p>
 </div>
 <button
 onClick={() => setShowCreate(true)}
 className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[13px] transition-all shadow-sm active:scale-95 cursor-pointer">
 + Create Notice
 </button>
 </div>

 <div className="p-5">
 {isLoading ? (
 <div className="flex justify-center py-12">
 <MinimalLoader />
 </div>
 ) : notices.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-12 text-center shadow-sm max-w-lg mx-auto">
 <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4 border border-teal-100">
 <i className="ri-megaphone-line text-[40px]"/>
 </div>
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-1 tracking-tight">No notices posted yet</h3>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 max-w-xs leading-relaxed">
 Create an announcement or event notice above to broadcast it to all registered community members.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {notices.map((notice) => {
 const isExpired =
 notice.validUntil && new Date(notice.validUntil) <= new Date();
 return (
 <div
 key={notice._id}
 className={`flex items-start gap-4 p-4
 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60
 ${PRIORITY_STRIPE[notice.priority] || PRIORITY_STRIPE.medium}
 rounded-lg
 ${isExpired ?"opacity-50":""}
 transition-all hover:shadow-md hover:border-slate-350`}
 >
 <div className="flex-grow min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 {notice.isPinned && (
 <span className="text-amber-500 text-xs font-bold flex items-center gap-1">
 <i className="ri-pushpin-2-fill text-xs"/> Pinned
 </span>
 )}
 <span
 className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
 PRIORITY_BADGE[notice.priority?.toLowerCase()] || PRIORITY_BADGE.medium
 }`}
 >
 {notice.priority?.toUpperCase()}
 </span>
 <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
 TYPE_BADGE[notice.type] || TYPE_BADGE.General
 }`}>
 {notice.type}
 </span>
 {notice.targetGroup && notice.targetGroup !=="All"&& (
 <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-full font-medium flex items-center gap-1 select-none">
 <i className="ri-group-line text-[10px]"/> {notice.targetGroup ==="Volunteers"?"Volunteers":"NGOs"}
 </span>
 )}
 {notice.affectedArea && notice.affectedArea !=="All Areas"&& (
 <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full font-medium flex items-center gap-1 select-none">
 <i className="ri-map-pin-line text-[10px]"/> {notice.affectedArea}
 </span>
 )}
 <span
 className={`text-xs flex items-center gap-1 font-medium ${
 isExpired ?"text-gray-400":"text-green-600"}`}
 >
 <span
 className={`w-1.5 h-1.5 rounded-full ${
 isExpired ?"bg-gray-400":"bg-green-500"}`}
 />
 {isExpired ?"Expired":"Active"}
 </span>
 </div>

 <h3 className="font-bold text-slate-800 dark:text-white text-[13px] tracking-tight">
 {notice.title}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 line-clamp-2">
 {notice.description}
 </p>
 <p className="text-xs text-slate-400 mt-1">
  {notice.postedBy} ·{" "}
  {formatDistanceToNow(new Date(notice.date || notice.createdAt), {
 addSuffix: true,
 })}
 {notice.validUntil &&`· Expires ${new Date(notice.validUntil).toLocaleDateString()}`}
 </p>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2 flex-shrink-0">
 <button
 onClick={() => pinMutation.mutate(notice._id)}
 title={notice.isPinned ?"Unpin":"Pin"}
 className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer">
 <i className="ri-pushpin-line text-[13px]"/>
 </button>
 <button
 onClick={() => setEditTarget(notice)}
 title="Edit"className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
 <i className="ri-pencil-line text-[13px]"/>
 </button>
 <button
 onClick={() => handleDelete(notice._id, notice.title)}
 title="Delete"className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
 <i className="ri-delete-bin-line text-[13px]"/>
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Create/Edit Modal */}
 {(showCreate || editTarget) && (
 <NoticeModal
 existing={editTarget}
 onClose={() => {
 setShowCreate(false);
 setEditTarget(null);
 }}
 onSaved={() => {
 queryClient.invalidateQueries({ queryKey: ["adminNotices"] });
 queryClient.invalidateQueries({ queryKey: ["announcements"] });
 setShowCreate(false);
 setEditTarget(null);
 toast.success(
 editTarget ?"Notice updated.":"Notice posted to all users.");
 }}
 />
 )}
 </div>
 );
}

const TYPE_OPTIONS = [
 { value:"General", label:"General", icon:"ri-information-line", color:"text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]"},
 { value:"Announcement", label:"Announcement", icon:"ri-megaphone-line", color:"text-blue-500 bg-blue-50"},
 { value:"Event", label:"Event", icon:"ri-calendar-event-line", color:"text-emerald-500 bg-emerald-50"},
 { value:"Warning", label:"Warning", icon:"ri-error-warning-line", color:"text-orange-500 bg-orange-50"},
 { value:"Maintenance", label:"Maintenance", icon:"ri-tools-line", color:"text-purple-500 bg-purple-50"},
];

const PRIORITY_OPTIONS = [
 { value:"low", label:"Low", color:"bg-gray-400 text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] bg-gray-50 dark:bg-[#0b1215] dark:bg-[#0b1215]"},
 { value:"medium", label:"Medium", color:"bg-teal-500 text-teal-700 bg-teal-50"},
 { value:"high", label:"High", color:"bg-orange-400 text-orange-700 bg-orange-50"},
 { value:"urgent", label:"Urgent", color:"bg-red-500 text-red-700 bg-red-50"},
];

const AUDIENCE_OPTIONS = [
 { value:"All", label:"All Members", icon:"ri-group-line", color:"text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]"},
 { value:"Volunteers", label:"Volunteers Only", icon:"ri-hand-heart-line", color:"text-emerald-500 bg-emerald-50"},
 { value:"NGOs", label:"NGOs Only", icon:"ri-community-line", color:"text-blue-500 bg-blue-50"},
];

function NoticeModal({ existing, onClose, onSaved }) {
 const axiosSecure = useAxiosSecure();
 const {
 register,
 handleSubmit,
 setValue,
 watch,
 formState: { errors },
 } = useForm({
 defaultValues: existing
 ? {
 ...existing,
 validUntil: existing.validUntil
 ? new Date(existing.validUntil).toISOString().split("T")[0]
 :"",
 targetGroup: existing.targetGroup ||"All",
 affectedArea: existing.affectedArea ||"All Areas",
 organizerName: existing.organizerName ||"",
 organizerContact: existing.organizerContact ||"",
 actionRequired: existing.actionRequired ||"",
 coverImage: existing.coverImage ||"",
 isPinned: existing.isPinned || false,
 }
 : {
 title:"",
 description:"",
 type:"General",
 priority:"medium",
 validUntil:"",
 attachmentUrl:"",
 targetGroup:"All",
 affectedArea:"All Areas",
 organizerName:"",
 organizerContact:"",
 actionRequired:"",
 coverImage:"",
 isPinned: false,
 },
 });

 const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
 const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
 const [audienceDropdownOpen, setAudienceDropdownOpen] = useState(false);
 const [attachments, setAttachments] = useState(
 existing?.attachments || (existing?.attachmentUrl ? [{ name:"Attachment", url: existing.attachmentUrl }] : [])
 );
 const [uploading, setUploading] = useState(false);

 const activeType = watch("type") ||"General";
 const activePriority = watch("priority") ||"medium";
 const activeAudience = watch("targetGroup") ||"All";
 const isPinned = watch("isPinned") || false;

 const currentTypeOpt = TYPE_OPTIONS.find(o => o.value === activeType) || TYPE_OPTIONS[0];
 const currentPriorityOpt = PRIORITY_OPTIONS.find(o => o.value === activePriority) || PRIORITY_OPTIONS[1];
 const currentAudienceOpt = AUDIENCE_OPTIONS.find(o => o.value === activeAudience) || AUDIENCE_OPTIONS[0];

 const handleFileUpload = async (e) => {
 const files = Array.from(e.target.files);
 if (files.length === 0) return;

 setUploading(true);
 try {
 for (const file of files) {
 const reader = new FileReader();
 const base64Promise = new Promise((resolve, reject) => {
 reader.onload = () => resolve(reader.result.split(",")[1]);
 reader.onerror = (error) => reject(error);
 });
 reader.readAsDataURL(file);
 const base64 = await base64Promise;

 const res = await axiosSecure.post("/upload", {
 name: file.name,
 base64,
 });

 if (res.data?.success && res.data?.url) {
 setAttachments((prev) => [...prev, { name: file.name, url: res.data.url }]);
 } else {
 toast.error(`Failed to upload ${file.name}`);
 }
 }
 toast.success("File(s) uploaded successfully.");
 } catch (err) {
 console.error(err);
 toast.error("An error occurred during upload.");
 } finally {
 setUploading(false);
 e.target.value ="";
 }
 };

 const removeAttachment = (indexToRemove) => {
 setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
 };

 const onSubmit = async (data) => {
 try {
 let finalAttachments = [...attachments];
 if (data.attachmentUrl && !finalAttachments.some(a => a.url === data.attachmentUrl)) {
 finalAttachments.push({ name:"Manual Attachment Link", url: data.attachmentUrl });
 }
 const payload = {
 ...data,
 attachments: finalAttachments,
 attachmentUrl: finalAttachments.length > 0 ? finalAttachments[0].url :"",
 };
 if (existing) {
 await axiosSecure.patch(`/announcements/${existing._id}`, payload);
 } else {
 await axiosSecure.post("/announcements", payload);
 }
 onSaved();
 } catch (err) {
 toast.error(err.response?.data?.message ||"Failed to save notice.");
 }
 };

 return (
 <div className="fixed inset-0 bg-black/55 z-55 flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden">
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
 <h2 className="font-bold text-slate-800 dark:text-white tracking-tight">
 {existing ?"Edit Notice":"Create Notice"}
 </h2>
 <button
 onClick={onClose}
 className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] flex items-center justify-center text-slate-400 hover:text-slate-655 cursor-pointer">
 ✕
 </button>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar"data-lenis-prevent="true">
 {/* Title */}
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-1">
 Title <span className="text-red-500">*</span>
 </label>
 <input
 {...register("title", { required: true, minLength: 5 })}
 className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 {errors.title && (
 <p className="text-xs text-red-500 mt-1">
 Title must be at least 5 characters.
 </p>
 )}
 </div>

 {/* Description */}
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-1">
 Description <span className="text-red-500">*</span>
 </label>
 <textarea
 {...register("description", { required: true })}
 rows={3}
 data-lenis-prevent="true"className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-transparent resize-none text-slate-800 dark:text-white transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 </div>

 {/* Type + Priority side by side with Custom Dropdowns */}
 <div className="grid grid-cols-2 gap-4">
 {/* Custom Type Dropdown */}
 <div className="relative animate-fadeIn">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-1">
 Type
 </label>
 <button
 type="button"onClick={() => {
 setTypeDropdownOpen(!typeDropdownOpen);
 setPriorityDropdownOpen(false);
 setAudienceDropdownOpen(false);
 }}
 className="w-full px-3 py-2 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-800 dark:text-white flex items-center justify-between shadow-sm cursor-pointer select-none transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="flex items-center gap-2">
 <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentTypeOpt.color}`}>
 <i className={`${currentTypeOpt.icon} text-[13px]`} />
 </span>
 <span className="font-semibold text-xs">{currentTypeOpt.label}</span>
 </div>
 <i className={`ri-arrow-down-s-line text-slate-400 transition-transform duration-200 ${typeDropdownOpen ?'rotate-180 text-teal-600':''}`} />
 </button>

 <AnimatePresence>
 {typeDropdownOpen && (
 <>
 <div className="fixed inset-0 z-40"onClick={() => setTypeDropdownOpen(false)} />
 <motion.div
 initial={{ opacity: 0, y: -8, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -8, scale: 0.96 }}
 transition={{ duration: 0.15, ease:"easeOut"}}
 data-lenis-prevent="true"className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] shadow-xl z-50 custom-scrollbar select-none py-1.5">
 {TYPE_OPTIONS.map((opt) => (
 <button
 key={opt.value}
 type="button"onClick={() => {
 setValue("type", opt.value);
 setTypeDropdownOpen(false);
 }}
 className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors flex items-center justify-between ${
 activeType === opt.value ?'bg-teal-50/70 text-teal-700 font-bold':'text-slate-600 dark:text-slate-300'}`}
 >
 <div className="flex items-center gap-2.5">
 <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${opt.color} transition-all`}>
 <i className={`${opt.icon} text-[13px]`} />
 </span>
 <span>{opt.label}</span>
 </div>
 {activeType === opt.value && <i className="ri-check-line text-teal-650 text-[13px]"/>}
 </button>
 ))}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>

 {/* Custom Priority Dropdown */}
 <div className="relative animate-fadeIn">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-1">
 Priority
 </label>
 <button
 type="button"onClick={() => {
 setPriorityDropdownOpen(!priorityDropdownOpen);
 setTypeDropdownOpen(false);
 setAudienceDropdownOpen(false);
 }}
 className="w-full px-3 py-2 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-800 dark:text-white flex items-center justify-between shadow-sm cursor-pointer select-none transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="flex items-center gap-2">
 <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentPriorityOpt.color.split('')[2]}`}>
 <span className={`w-2.5 h-2.5 rounded-full ${currentPriorityOpt.color.split('')[0]}`} />
 </span>
 <span className="font-semibold text-xs capitalize">{currentPriorityOpt.label}</span>
 </div>
 <i className={`ri-arrow-down-s-line text-slate-400 transition-transform duration-200 ${priorityDropdownOpen ?'rotate-180 text-teal-650':''}`} />
 </button>

 <AnimatePresence>
 {priorityDropdownOpen && (
 <>
 <div className="fixed inset-0 z-40"onClick={() => setPriorityDropdownOpen(false)} />
 <motion.div
 initial={{ opacity: 0, y: -8, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -8, scale: 0.96 }}
 transition={{ duration: 0.15, ease:"easeOut"}}
 data-lenis-prevent="true"className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] shadow-xl z-50 custom-scrollbar select-none py-1.5">
 {PRIORITY_OPTIONS.map((opt) => (
 <button
 key={opt.value}
 type="button"onClick={() => {
 setValue("priority", opt.value);
 setPriorityDropdownOpen(false);
 }}
 className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors flex items-center justify-between ${
 activePriority === opt.value ?'bg-teal-50/70 text-teal-700 font-bold':'text-slate-600 dark:text-slate-300'}`}
 >
 <div className="flex items-center gap-2.5">
 <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${opt.color.split('')[2]}`}>
 <span className={`w-2 h-2 rounded-full ${opt.color.split('')[0]}`} />
 </span>
 <span className="capitalize">{opt.label}</span>
 </div>
 {activePriority === opt.value && <i className="ri-check-line text-teal-650 text-[13px]"/>}
 </button>
 ))}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 </div>

 {/* Target Group + Valid Until side by side */}
 <div className="grid grid-cols-2 gap-4">
 {/* Custom Target Group Dropdown */}
 <div className="relative animate-fadeIn">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-1">
 Audience (Target Group)
 </label>
 <button
 type="button"onClick={() => {
 setAudienceDropdownOpen(!audienceDropdownOpen);
 setTypeDropdownOpen(false);
 setPriorityDropdownOpen(false);
 }}
 className="w-full px-3 py-2 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-800 dark:text-white flex items-center justify-between shadow-sm cursor-pointer select-none transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="flex items-center gap-2">
 <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentAudienceOpt.color}`}>
 <i className={`${currentAudienceOpt.icon} text-[13px]`} />
 </span>
 <span className="font-semibold text-xs">{currentAudienceOpt.label}</span>
 </div>
 <i className={`ri-arrow-down-s-line text-slate-400 transition-transform duration-200 ${audienceDropdownOpen ?'rotate-180 text-teal-650':''}`} />
 </button>

 <AnimatePresence>
 {audienceDropdownOpen && (
 <>
 <div className="fixed inset-0 z-40"onClick={() => setAudienceDropdownOpen(false)} />
 <motion.div
 initial={{ opacity: 0, y: -8, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -8, scale: 0.96 }}
 transition={{ duration: 0.15, ease:"easeOut"}}
 data-lenis-prevent="true"className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] shadow-xl z-50 custom-scrollbar select-none py-1.5">
 {AUDIENCE_OPTIONS.map((opt) => (
 <button
 key={opt.value}
 type="button"onClick={() => {
 setValue("targetGroup", opt.value);
 setAudienceDropdownOpen(false);
 }}
 className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors flex items-center justify-between ${
 activeAudience === opt.value ?'bg-teal-50/70 text-teal-700 font-bold':'text-slate-600 dark:text-slate-300'}`}
 >
 <div className="flex items-center gap-2.5">
 <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${opt.color} transition-all`}>
 <i className={`${opt.icon} text-[13px]`} />
 </span>
 <span>{opt.label}</span>
 </div>
 {activeAudience === opt.value && <i className="ri-check-line text-teal-650 text-[13px]"/>}
 </button>
 ))}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>

 {/* Valid Until */}
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-1">
 Valid Until <span className="font-normal text-slate-400 text-xs">(optional)</span>
 </label>
 <input
 type="date"{...register("validUntil")}
 min={new Date().toISOString().split("T")[0]}
 className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 </div>
 </div>

 {/* Affected Area + Cover Image URL side by side */}
 <div className="grid grid-cols-2 gap-4">
 {/* Affected Area */}
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-0.5">
 Affected Area / Location
 </label>
 <p className="text-[11px] text-slate-500 dark:text-slate-300 mb-1.5 leading-relaxed">Specific zones or zones impacted by this notice (e.g., sector, block, or all areas).</p>
 <div className="relative">
 <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none"/>
 <input
 type="text"placeholder="e.g. All Areas, Sector-4, Downtown..."{...register("affectedArea")}
 className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 </div>
 </div>

 {/* Cover Image URL */}
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-0.5">
 Cover Image URL <span className="font-normal text-slate-400 text-xs">(optional)</span>
 </label>
 <p className="text-[11px] text-slate-500 dark:text-slate-300 mb-1.5 leading-relaxed">Visual illustration or banner link (Unsplash, Imgur) to highlight this notice on the board.</p>
 <div className="relative">
 <i className="ri-image-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none"/>
 <input
 type="url"placeholder="https://images.unsplash.com/... or similar image link"{...register("coverImage")}
 className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 </div>
 </div>
 </div>

 {/* File Attachments Uploader */}
 <div className="border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 rounded-[12px] p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-1">
 Official Attachments / PDF Documents
 </label>
 <p className="text-[11px] text-slate-500 dark:text-slate-300 mb-3 leading-relaxed">
 Upload official circular PDFs, schedules, or maps. Members can view/download these documents.
 </p>

 {/* List of current attachments */}
 {attachments.length > 0 && (
 <div className="space-y-2 mb-3">
 {attachments.map((file, idx) => {
 const isPdf = file.name?.toLowerCase().endsWith(".pdf") || file.url?.toLowerCase().endsWith(".pdf");
 return (
 <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl shadow-sm">
 <div className="flex items-center gap-2 min-w-0">
 <i className={`${isPdf ?'ri-file-pdf-line text-red-500':'ri-file-text-line text-blue-500'} text-[13px] shrink-0`} />
 <span className="text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] truncate max-w-[320px]">{file.name ||"Attachment"}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <a
 href={file.url}
 target="_blank"rel="noopener noreferrer"className="p-1 px-2.5 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all">
 View
 </a>
 <button
 type="button"onClick={() => removeAttachment(idx)}
 className="p-1 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-all border border-transparent cursor-pointer"title="Remove attachment">
 <i className="ri-delete-bin-line text-xs"/>
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Upload Button / Input */}
 <div className="relative">
 <input
 type="file"multiple
 accept=".pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"onChange={handleFileUpload}
 disabled={uploading}
 className="hidden"id="file-attachments-input"/>
 <label
 htmlFor="file-attachments-input"className={`flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-teal-500 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-teal-50/10 p-5 rounded-xl cursor-pointer transition-all select-none ${uploading ?'opacity-60 pointer-events-none':''}`}
 >
 {uploading ? (
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 border-2 border-teal-650 border-t-transparent rounded-full animate-spin"/>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Uploading documents...</span>
 </div>
 ) : (
 <>
 <i className="ri-upload-cloud-2-line text-2xl tracking-tight text-slate-400 mb-1"/>
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Upload Attachments (PDF, Images, Docs)</span>
 <span className="text-[10px] text-slate-400 mt-0.5">Select one or multiple files</span>
 </>
 )}
 </label>
 </div>
 </div>

 {/* Organizer / Contact Person + Organizer Contact Info side by side */}
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-0.5">
 Contact Person Name <span className="font-normal text-slate-400 text-xs">(optional)</span>
 </label>
 <p className="text-[11px] text-slate-500 dark:text-slate-300 mb-1.5 leading-relaxed">Name of the official staff member or coordinator managing this notice.</p>
 <div className="relative">
 <i className="ri-user-follow-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none"/>
 <input
 type="text"placeholder="e.g. John Doe"{...register("organizerName")}
 className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 </div>
 </div>

 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-0.5">
 Contact Email / Phone <span className="font-normal text-slate-400 text-xs">(optional)</span>
 </label>
 <p className="text-[11px] text-slate-500 dark:text-slate-300 mb-1.5 leading-relaxed">Communication channel where citizens can directly direct queries.</p>
 <div className="relative">
 <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none"/>
 <input
 type="text"placeholder="e.g. email@domain.com"{...register("organizerContact")}
 className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 </div>
 </div>
 </div>

 {/* Instructions / Action Required */}
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block mb-0.5">
 Instructions / Action Required <span className="font-normal text-slate-400 text-xs">(optional)</span>
 </label>
 <p className="text-[11px] text-slate-500 dark:text-slate-300 mb-1.5 leading-relaxed">Immediate steps or emergency tasks required from community members (e.g., store water, clear paths).</p>
 <textarea
 {...register("actionRequired")}
 rows={2}
 data-lenis-prevent="true"placeholder="e.g. Please boil tap water before consuming until further notice."className="w-full px-3.5 py-2.5 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] focus:outline-none focus:border-teal-500 bg-transparent resize-none text-slate-800 dark:text-white transition-all hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 </div>

 {/* Pin to Top Toggle */}
 <div className={`flex items-center justify-between p-3 rounded-[12px] border shadow-sm select-none transition-all duration-300 ${
 isPinned 
 ?"bg-amber-50/60 border-amber-300 ring-2 ring-amber-300/10":"bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]"}`}>
 <div className="flex items-center gap-2.5">
 <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-colors duration-300 ${
 isPinned 
 ?"bg-amber-100 border-amber-200 text-amber-600 animate-pulse":"bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-450"}`}>
 <i className="ri-pushpin-2-fill text-[13px]"/>
 </div>
 <div className="min-w-0">
 <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Pin to Noticeboard Top</p>
 <p className="text-[10px] text-slate-450 mt-0.5 truncate">Keep this notice stickied at the very top of the board</p>
 </div>
 </div>
 <input
 type="checkbox"className="toggle toggle-success toggle-sm cursor-pointer"{...register("isPinned")}
 />
 </div>

 <div className="flex gap-3 pt-2">
 <button
 type="button"onClick={onClose}
 className="flex-1 py-2.5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-[12px] text-[13px] font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors cursor-pointer">
 Cancel
 </button>
 <button
 type="submit"className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-[12px] text-[13px] font-semibold transition-colors cursor-pointer">
 {existing ?"Save Changes":"Post Notice"}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 );
}
