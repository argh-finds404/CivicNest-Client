import React, { useState, useEffect, useCallback, useMemo } from'react';
import { useMutation, useQueryClient } from'@tanstack/react-query';
import { motion, AnimatePresence } from'framer-motion';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';
import FlairPill from'../common/FlairPill';
import PremiumDropdown from'../common/PremiumDropdown';

const INPUT_CLASS ='w-full px-4 py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg text-[13px] font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none transition-all focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 shadow-sm';

const ASSIGN_ROLE_OPTIONS = [
 { value:'volunteer', label:'Volunteer', icon:'ri-hand-heart-line'},
 { value:'provider', label:'Service Provider', icon:'ri-tools-line'},
 { value:'ngo', label:'NGO', icon:'ri-community-line'},
 { value:'admin', label:'Internal Admin', icon:'ri-shield-user-line'},
];

const STATUS_STYLES = {
 pending_review:'bg-amber-50 text-amber-800 border-amber-200',
 open:'bg-sky-50 text-sky-800 border-sky-200',
 action_taken:'bg-violet-50 text-violet-800 border-violet-200',
 pending_verification:'bg-cyan-50 text-cyan-800 border-cyan-200',
 solved:'bg-emerald-50 text-emerald-800 border-emerald-200',
 rejected:'bg-rose-50 text-rose-800 border-rose-200',
};

function resolveImageUrl(img) {
 if (typeof img !=='string') return img;
 if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) return img;
 return`https://${img}`;
}

function formatStatus(status ='') {
 return status.replace(/_/g,'');
}

function SectionHeader({ icon, title, badge }) {
 return (
 <div className="flex items-center justify-between gap-3 mb-4">
 <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300 flex items-center gap-2">
 <span className="w-7 h-7 rounded-lg bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
 <i className={`${icon} text-[13px]`} />
 </span>
 {title}
 </h3>
 {badge}
 </div>
 );
}

function MetaCard({ icon, label, value, subtext, image }) {
 return (
 <div className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/90 shadow-sm hover:border-[#0f766e]/30 hover:shadow-md transition-all duration-200">
 {image ? (
 <img src={resolveImageUrl(image)} alt={label} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 ) : (
 <div className="w-10 h-10 rounded-lg bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center shrink-0 border border-[#0f766e]/15">
 <i className={`${icon} text-[13px]`} />
 </div>
 )}
 <div className="min-w-0 flex-1">
 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-0.5">{label}</p>
 <p className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{value}</p>
 {subtext && <p className="text-[11px] text-slate-500 dark:text-slate-300 truncate mt-0.5">{subtext}</p>}
 </div>
 </div>
 );
}

function FieldLabel({ icon, children, badge }) {
 return (
 <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
 <span className="flex items-center gap-1.5">
 {icon && <i className={`${icon} text-[#0f766e] text-[13px]`} />}
 {children}
 </span>
 {badge}
 </label>
 );
}

function EvidenceLightbox({ images, index, onClose, onNavigate }) {
 if (index === null || !images?.length) return null;

 const currentUrl = resolveImageUrl(images[index]);

 return (
 <div
 className="fixed inset-0 z-[200] bg-slate-950/95 flex flex-col backdrop-blur-md"data-lenis-prevent="true"role="dialog"aria-modal="true"aria-label="Evidence gallery">
 <div className="px-5 py-4 flex justify-between items-center text-white/70 shrink-0">
 <span className="text-[13px] font-semibold tabular-nums">
 {index + 1} <span className="text-white/40">/</span> {images.length}
 </span>
 <button
 type="button"onClick={onClose}
 className="p-2.5 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 hover:text-white rounded-xl transition-colors"aria-label="Close gallery">
 <i className="ri-close-line text-2xl tracking-tight"/>
 </button>
 </div>

 <div className="flex-1 flex items-center justify-center p-4 md:p-5 relative min-h-0">
 {index > 0 && (
 <button
 type="button"onClick={() => onNavigate(index - 1)}
 className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 text-white rounded-xl backdrop-blur transition-colors"aria-label="Previous image">
 <i className="ri-arrow-left-s-line text-2xl tracking-tight"/>
 </button>
 )}

 <img
 src={currentUrl}
 alt={`Evidence ${index + 1}`}
 className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl select-none"/>

 {index < images.length - 1 && (
 <button
 type="button"onClick={() => onNavigate(index + 1)}
 className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 text-white rounded-xl backdrop-blur transition-colors"aria-label="Next image">
 <i className="ri-arrow-right-s-line text-2xl tracking-tight"/>
 </button>
 )}
 </div>
 </div>
 );
}

export default function AdminIssueDetailDrawer({ issue, onClose }) {
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();

 const [assignType, setAssignType] = useState('volunteer');
 const [assignName, setAssignName] = useState('');
 const [assignEmail, setAssignEmail] = useState('');
 const [adminNote, setAdminNote] = useState('');
 const [lightboxIndex, setLightboxIndex] = useState(null);
 const [activeIssue, setActiveIssue] = useState(null);

 useEffect(() => {
 if (issue) {
 setActiveIssue(issue);
 }
 }, [issue]);

 const images = activeIssue?.images ?? [];
 const isAssigned = Boolean(activeIssue?.assignedTo?.email);
 const ticketId = activeIssue?._id?.slice(-8).toUpperCase();
 const submittedDate = activeIssue
 ? new Date(activeIssue.submittedAt || activeIssue.createdAt).toLocaleDateString(undefined, {
 month:'short',
 day:'numeric',
 year:'numeric',
 })
 :'';

 const statusClass =
 STATUS_STYLES[activeIssue?.status] ??'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]';

 const assignMutation = useMutation({
 mutationFn: async (payload) => {
 if (!activeIssue) return;
 await axiosSecure.patch(`/admin/issues/${activeIssue._id}/assign`, payload);
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
 toast.success('Issue successfully assigned!');
 onClose();
 },
 onError: (error) => {
 toast.error(error.response?.data?.error ||'Failed to assign issue');
 },
 });

 const handleAssign = useCallback(
 (e) => {
 e.preventDefault();
 if (!assignName.trim() || !assignEmail.trim()) {
 toast.error('Name and Email are required to assign.');
 return;
 }
 assignMutation.mutate({
 type: assignType,
 name: assignName.trim(),
 email: assignEmail.trim(),
 adminNote,
 });
 },
 [assignType, assignName, assignEmail, adminNote, assignMutation]
 );

 useEffect(() => {
 if (!issue) return;
 setAssignType('volunteer');
 setAssignName('');
 setAssignEmail('');
 setAdminNote(issue.adminNotes ||'');
 setLightboxIndex(null);
 }, [issue?._id]);

 useEffect(() => {
 if (!issue) return undefined;
 document.body.style.overflow ='hidden';
 window.lenis?.stop();
 return () => {
 document.body.style.overflow ='';
 window.lenis?.start();
 };
 }, [issue]);

 useEffect(() => {
 if (lightboxIndex === null) return undefined;
 const onKeyDown = (e) => {
 if (e.key ==='Escape') setLightboxIndex(null);
 if (e.key ==='ArrowLeft'&& lightboxIndex > 0) {
 setLightboxIndex((prev) => prev - 1);
 }
 if (e.key ==='ArrowRight'&& lightboxIndex < images.length - 1) {
 setLightboxIndex((prev) => prev + 1);
 }
 };
 window.addEventListener('keydown', onKeyDown);
 return () => window.removeEventListener('keydown', onKeyDown);
 }, [lightboxIndex, images.length]);

 const reporterName = useMemo(() => {
 if (!activeIssue) return'';
 return activeIssue.submittedBy?.name ||'User';
 }, [activeIssue]);

 return (
 <AnimatePresence>
 {issue && activeIssue && (
 <>
 <EvidenceLightbox
 images={images}
 index={lightboxIndex}
 onClose={() => setLightboxIndex(null)}
 onNavigate={setLightboxIndex}
 />

 <motion.button
 type="button"aria-label="Close issue drawer"className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] cursor-default"initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.25 }}
 onClick={onClose}
 />

 <motion.aside
 role="dialog"aria-modal="true"aria-labelledby="issue-drawer-title"className="fixed inset-y-0 right-0 w-full max-w-xl z-[101] flex flex-col bg-[#eef2f6] shadow-2xl border-l border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]/60"initial={{ x:'100%'}}
 animate={{ x: 0 }}
 exit={{ x:'100%'}}
 transition={{ type:'spring', damping: 32, stiffness: 320 }}
 data-lenis-prevent="true">
 {/* High Contrast Dark Header */}
 <header className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-slate-900 bg-slate-900 shadow-lg z-20">
 <div className="flex items-center gap-3 text-[13px] text-slate-300 font-medium">
 <span className="uppercase tracking-widest font-black text-white flex items-center gap-2">
 <i className="ri-file-list-3-line text-slate-400"></i>
 Ticket No. #{ticketId}
 </span>
 <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
 <span className="flex items-center gap-1.5">
 <i className="ri-calendar-line text-slate-400"></i>
 {submittedDate}
 </span>
 </div>
 <button 
 type="button"onClick={onClose} 
 className="p-2 -mr-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"aria-label="Close drawer">
 <i className="ri-close-line text-[13px] tracking-tight"></i>
 </button>
 </header>

 {/* Scrollable body */}
 <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth overscroll-contain">
 <div className="p-5 md:p-4 space-y-8 pb-10">
 {/* Title block */}
 <section className="rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-5 shadow-sm">
 <div className="flex flex-wrap items-center gap-2 mb-4">
 <FlairPill category={activeIssue.category} customFlair={activeIssue.customFlair} />
 <span
 className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize border ${statusClass}`}
 >
 {formatStatus(activeIssue.status)}
 </span>
 </div>
 <h1
 id="issue-drawer-title"className="text-2xl tracking-tight md:text-[1.65rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
 {activeIssue.title}
 </h1>
 </section>

 {/* Description */}
 <section className="rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-5 shadow-sm">
 <SectionHeader icon="ri-file-text-line"title="Description"/>
 <p className="text-[15px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-100 rounded-lg p-4">
 {activeIssue.description}
 </p>
 </section>

 {/* Meta grid */}
 <section>
 <SectionHeader icon="ri-information-line"title="Details"/>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <MetaCard 
 image={activeIssue.submittedBy?.photoURL}
 icon={activeIssue.isAnonymous ?"ri-spy-line":"ri-user-3-line"} 
 label={activeIssue.isAnonymous ?"Reporter (Anonymous 🔒)":"Reporter"} 
 value={reporterName} 
 subtext={activeIssue.submittedBy?.email ||"No email"}
 />
 <MetaCard icon="ri-map-pin-line"label="Location"value={activeIssue.area ||'—'} />
 <MetaCard
 icon="ri-thumb-up-line"label="Community upvotes"value={String(activeIssue.netScore ?? 0)}
 />
 <MetaCard
 icon="ri-calendar-line"label="Submitted"value={submittedDate}
 />
 </div>
 </section>

 {/* Attachments */}
 {images.length > 0 && (
 <section className="rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-5 shadow-sm">
 <SectionHeader
 icon="ri-image-2-line"title="Attachments"badge={
 <span className="text-[11px] font-bold text-slate-400 tabular-nums">
 {images.length} {images.length === 1 ?'file':'files'}
 </span>
 }
 />
 <div className="grid grid-cols-2 gap-3">
 {images.map((img, i) => (
 <button
 key={i}
 type="button"onClick={() => setLightboxIndex(i)}
 className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2">
 <img
 src={resolveImageUrl(img)}
 alt={`Evidence ${i + 1}`}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
 <span className="text-white text-xs font-semibold flex items-center gap-1">
 <i className="ri-zoom-in-line"/> View
 </span>
 </div>
 </button>
 ))}
 </div>
 </section>
 )}

 {/* Assignment */}
 <section className="rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm overflow-hidden">
 <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] bg-gradient-to-r from-[#0f766e]/10 via-emerald-50 to-teal-50 flex items-center justify-between gap-3">
 <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300 flex items-center gap-2">
 <span className="w-7 h-7 rounded-lg bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
 <i className="ri-shield-user-line text-[13px]"/>
 </span>
 Action assignment
 </h3>
 {isAssigned && (
 <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
 Assigned
 </span>
 )}
 </div>

 <div className="p-5 md:p-4">
 {isAssigned ? (
 <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200/80">
 <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-[#0f766e] flex items-center justify-center border border-emerald-200 shadow-sm shrink-0">
 <i className="ri-user-star-line text-2xl tracking-tight"/>
 </div>
 <div className="min-w-0">
 <p className="font-bold text-slate-900 dark:text-white text-[13px] leading-tight">
 {activeIssue.assignedTo.name}
 </p>
 <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
 {activeIssue.assignedTo.email}
 </p>
 <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-[#0f766e] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] px-2.5 py-1 rounded-lg border border-emerald-100">
 {activeIssue.assignedTo.type}
 </span>
 </div>
 </div>
 ) : (
 <form onSubmit={handleAssign} className="space-y-5">
 <div className="flex gap-3 p-4 rounded-lg bg-teal-50/90 border border-teal-200/70">
 <div className="w-10 h-10 rounded-lg bg-[#0f766e]/15 text-[#0f766e] flex items-center justify-center shrink-0 border border-[#0f766e]/20">
 <i className="ri-user-shared-2-line text-[13px] tracking-tight"/>
 </div>
 <p className="text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] leading-relaxed font-medium pt-0.5">
 Assign this issue to an official or volunteer to move it into the
 resolution phase.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <FieldLabel icon="ri-shield-user-line">Assignee role</FieldLabel>
 <PremiumDropdown
 options={ASSIGN_ROLE_OPTIONS}
 value={assignType}
 onChange={setAssignType}
 placeholder="Select role"icon="ri-team-line"menuClassName="!z-[110]"/>
 </div>
 <div className="space-y-2">
 <FieldLabel icon="ri-user-3-line">Full name</FieldLabel>
 <div className="relative">
 <i className="ri-user-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0f766e]/70 text-[13px] pointer-events-none"/>
 <input
 type="text"value={assignName}
 onChange={(e) => setAssignName(e.target.value)}
 className={`${INPUT_CLASS} pl-10`}
 placeholder="e.g. John Doe"required
 />
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <FieldLabel icon="ri-mail-line">Email address</FieldLabel>
 <div className="relative">
 <i className="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0f766e]/70 text-[13px] pointer-events-none"/>
 <input
 type="email"value={assignEmail}
 onChange={(e) => setAssignEmail(e.target.value)}
 className={`${INPUT_CLASS} pl-10`}
 placeholder="john@example.com"required
 />
 </div>
 </div>

 <div className="space-y-2">
 <FieldLabel
 icon="ri-sticky-note-line"badge={
 <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-slate-700 px-2 py-0.5 rounded">
 Private
 </span>
 }
 >
 Internal note
 </FieldLabel>
 <div className="relative">
 <i className="ri-lock-2-line absolute left-3.5 top-3.5 text-[#0f766e]/60 text-[13px] pointer-events-none"/>
 <textarea
 value={adminNote}
 onChange={(e) => setAdminNote(e.target.value)}
 className={`${INPUT_CLASS} min-h-[100px] resize-y pl-10 rounded-lg`}
 placeholder="Instructions or private notes for the assignee..."/>
 </div>
 </div>

 <button
 type="submit"disabled={assignMutation.isPending}
 className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-[#0f766e] hover:bg-[#0d645d] text-white text-[13px] font-bold shadow-lg shadow-teal-900/15 transition-all hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none">
 {assignMutation.isPending ? (
 <>
 <i className="ri-loader-4-line animate-spin text-[13px]"/>
 Assigning…
 </>
 ) : (
 <>
 <i className="ri-check-double-line text-[13px]"/>
 Confirm assignment
 </>
 )}
 </button>
 </form>
 )}
 </div>
 </section>
 </div>
 </div>
 </motion.aside>
 </>
 )}
 </AnimatePresence>
 );
}
