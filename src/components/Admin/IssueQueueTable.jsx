import React, { useState } from"react";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import Swal from"sweetalert2";
import toast from"react-hot-toast";
import FlairPill from"../common/FlairPill";
import MinimalLoader from'../common/MinimalLoader.jsx';
import AdminIssueDetailDrawer from"./AdminIssueDetailDrawer";

export default function IssueQueueTable() {
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 
 const [statusFilter, setStatusFilter] = useState("pending_review");
 const [selectedIssues, setSelectedIssues] = useState([]);
 const [drawerIssue, setDrawerIssue] = useState(null);

 const { 
 data, 
 fetchNextPage, 
 hasNextPage, 
 isFetchingNextPage, 
 isLoading 
 } = useInfiniteQuery({
 queryKey: ["admin-queue", statusFilter],
 queryFn: async ({ pageParam = 1 }) => {
 const res = await axiosSecure.get(`/admin/queue?status=${statusFilter}&page=${pageParam}&limit=5`);
 return res.data;
 },
 getNextPageParam: (lastPage) => {
 if (lastPage.currentPage < lastPage.totalPages) {
 return lastPage.currentPage + 1;
 }
 return undefined;
 },
 initialPageParam: 1,
 });

 const { data: countsData } = useQuery({
 queryKey: ["admin-queue-counts"],
 queryFn: async () => {
 const res = await axiosSecure.get(`/admin/queue/count`);
 return res.data;
 },
 refetchInterval: 10000 // Refetch every 10 seconds for real-time feel
 });

 const queue = data ? data.pages.flatMap(page => page.issues) : [];

 const approveMutation = useMutation({
 mutationFn: async ({ issueId, type }) => {
 const endpoint = type ==='cleanup_event'?`/admin/cleanup-events/${issueId}/approve`:`/admin/issues/${issueId}/approve`;
 await axiosSecure.patch(endpoint);
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
 queryClient.invalidateQueries({ queryKey: ["admin-queue-counts"] });
 queryClient.invalidateQueries({ queryKey: ["admin-queue-count"] });
 queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
 toast.success("Approved successfully!");
 },
 });

 const rejectMutation = useMutation({
 mutationFn: async ({ issueId, type, reason }) => {
 const endpoint = type ==='cleanup_event'?`/admin/cleanup-events/${issueId}/reject`:`/admin/issues/${issueId}/reject`;
 await axiosSecure.patch(endpoint, { reason });
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
 queryClient.invalidateQueries({ queryKey: ["admin-queue-counts"] });
 queryClient.invalidateQueries({ queryKey: ["admin-queue-count"] });
 queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
 toast.success("Rejected. Poster has been notified.");
 },
 });

 const handleApprove = async (e, issueId, type) => {
 e.stopPropagation();
 const result = await Swal.fire({
 title:"Approve this submission?",
 text:"It will become publicly visible.",
 icon:"question",
 showCancelButton: true,
 confirmButtonText:"Yes, approve",
 confirmButtonColor:"#15803d",
 });
 
 if (result.isConfirmed) {
 approveMutation.mutate({ issueId, type });
 }
 };

 const handleReject = async (e, issueId, type) => {
 e.stopPropagation();
 const { value: reason } = await Swal.fire({
 title:"Reason for rejection",
 input:"textarea",
 inputPlaceholder:"Tell the poster why this was rejected...",
 inputAttributes: { maxlength: 300 },
 showCancelButton: true,
 confirmButtonText:"Reject",
 confirmButtonColor:"#dc2626",
 });

 if (reason) {
 rejectMutation.mutate({ issueId, type, reason });
 }
 };

 const toggleSelectAll = (e) => {
 if (e.target.checked) {
 setSelectedIssues(queue.map(i => i._id));
 } else {
 setSelectedIssues([]);
 }
 };

 const toggleSelect = (e, id) => {
 e.stopPropagation();
 if (e.target.checked) {
 setSelectedIssues([...selectedIssues, id]);
 } else {
 setSelectedIssues(selectedIssues.filter(i => i !== id));
 }
 };

 const getUrgencyIcon = (priority) => {
 switch (priority) {
 case'high': return <i className="ri-error-warning-fill text-rose-500"title="High Urgency"></i>;
 case'medium': return <i className="ri-information-fill text-amber-500"title="Medium Urgency"></i>;
 default: return <i className="ri-checkbox-circle-fill text-teal-500"title="Low Urgency"></i>;
 }
 };

 const tabIcons = {'pending_review':'ri-time-line text-amber-500','all_approved':'ri-check-double-line text-emerald-500','open':'ri-folder-open-line text-blue-500','action_taken':'ri-tools-line text-purple-500','pending_verification':'ri-shield-check-line text-cyan-500','solved':'ri-task-line text-green-500','rejected':'ri-close-circle-line text-rose-500'};

 const activeStyles = {'pending_review': { bg:'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-500/10', badge:'bg-amber-100 text-amber-800 border border-amber-200/60'},'all_approved': { bg:'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/10', badge:'bg-emerald-100 text-emerald-800 border border-emerald-200/60'},'open': { bg:'bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-500/10', badge:'bg-blue-100 text-blue-800 border border-blue-200/60'},'action_taken': { bg:'bg-purple-50 text-purple-700 border-purple-200 shadow-sm shadow-purple-500/10', badge:'bg-purple-100 text-purple-800 border border-purple-200/60'},'pending_verification': { bg:'bg-cyan-50 text-cyan-700 border-cyan-200 shadow-sm shadow-cyan-500/10', badge:'bg-cyan-100 text-cyan-800 border border-cyan-200/60'},'solved': { bg:'bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-500/10', badge:'bg-green-100 text-green-800 border border-green-200/60'},'rejected': { bg:'bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-500/10', badge:'bg-rose-100 text-rose-800 border border-rose-200/60'}
 };

 return (
 <div>
 {/* Premium Page Header */}
 <div className="flex items-center gap-5 mb-10">
 <div className="w-16 h-16 bg-gradient-to-br from-[#40826D] to-teal-800 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-[#40826D]/30 border border-teal-600">
 <i className="ri-stack-line text-3xl tracking-tight drop-shadow-md"></i>
 </div>
 <div>
 <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-black text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>Issue Command Center</h1>
 <p className="text-[13px] md:text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1">Efficiently manage, assign, and resolve community reports.</p>
 </div>
 </div>
 
 {/* Filters Bar with Icons */}
 <div className="flex gap-3 mb-8 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-slate-200 px-1">
 {['pending_review','all_approved','open','action_taken','pending_verification','solved','rejected'].map(status => {
 let countKey = status;
 if (status ==='all_approved') countKey = null; 
 
 const isActive = statusFilter === status;
 
 return (
 <button
 key={status}
 onClick={() => { setStatusFilter(status); setSelectedIssues([]); }}
 className={`px-5 py-3 flex items-center gap-2.5 rounded-[1.1rem] text-[13px] whitespace-nowrap transition-all duration-300 border ${
 isActive 
 ? activeStyles[status].bg +'font-bold transform -translate-y-0.5':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] font-bold hover:-translate-y-0.5 hover:shadow-sm'}`}
 >
 <i className={`${tabIcons[status]} text-[13px]`}></i>
 <span className="uppercase tracking-wider">{status.replace('_','')}</span>
 {countsData && countKey && countsData[countKey] !== undefined && (
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ml-1 shadow-inner ${
 isActive ? activeStyles[status].badge :'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60'}`}>
 {countsData[countKey]}
 </span>
 )}
 </button>
 );
 })}
 </div>

 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden relative">
 {/* Table Header Section */}
 <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] relative overflow-hidden">
 {/* Decorative subtle background glow */}
 <div className="absolute right-0 top-0 w-64 h-64 bg-[#40826D]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

 <div className="flex items-center gap-4 relative z-10">
 <div className="w-14 h-14 rounded-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
 <i className={`${tabIcons[statusFilter]} text-3xl tracking-tight opacity-80`}></i>
 </div>
 <div>
 <h2 className="text-2xl tracking-tight font-extrabold text-slate-800 dark:text-white capitalize tracking-tight"style={{ fontFamily:'HKGrotesk'}}>{statusFilter.replace('_','')} Queue</h2>
 <p className="text-[13px] font-medium text-slate-500 dark:text-slate-300 mt-1">Review and manage specific community reports</p>
 </div>
 </div>
 {selectedIssues.length > 0 && (
 <div className="flex items-center gap-4 text-[13px] bg-teal-50 px-4 py-2.5 rounded-xl border border-teal-200 shadow-inner relative z-10">
 <span className="font-extrabold text-teal-800 tracking-tight">{selectedIssues.length} selected</span>
 <button className="px-4 py-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-teal-700 rounded-lg font-bold hover:bg-teal-100 transition-colors shadow-sm border border-teal-100 flex items-center gap-2">
 Bulk Action <i className="ri-arrow-down-s-line"></i>
 </button>
 </div>
 )}
 </div>
 
 <div className="w-full">
 {isLoading ? (
 <div className="p-20 flex justify-center bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]">
 <MinimalLoader size="lg"color="#40826D"/>
 </div>
 ) : queue.length === 0 ? (
 <div className="py-24 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50">
 <div className="w-32 h-32 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
 <i className={`${tabIcons[statusFilter]} text-6xl opacity-50`}></i>
 </div>
 <h3 className="text-2xl tracking-tight md:text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>Queue is Empty!</h3>
 <p className="text-slate-500 dark:text-slate-300 font-medium mt-3 max-w-sm leading-relaxed">
 There are currently no issues in the <strong className="text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] capitalize">{statusFilter.replace('_','')}</strong> queue. Take a break or check another category!
 </p>
 </div>
 ) : (
 <div className="flex flex-col gap-3 p-4 md:p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/30">
 {queue.map((issue, index) => (
 <div 
 key={issue._id} 
 onClick={() => setDrawerIssue(issue)}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-[#40826D]/40 hover:shadow-md transition-all duration-300 rounded-[1.25rem] p-3 md:p-4 cursor-pointer flex items-center gap-4 relative group">
 {/* Left Section: Thumbnail */}
 <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] overflow-hidden shrink-0 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] relative">
 {issue.images && issue.images[0] ? (
 <img src={issue.images[0]} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-400">
 <i className="ri-image-line text-[13px] tracking-tight md:text-2xl tracking-tight"></i>
 </div>
 )}
 </div>
 
 {/* Middle Section: Core Info */}
 <div className="flex-1 min-w-0 flex flex-col justify-center">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="text-[13px] md:text-[13px] font-bold text-slate-800 dark:text-white truncate group-hover:text-[#40826D] transition-colors leading-tight tracking-tight"title={issue.title}>
 {issue.title}
 </h3>
 {issue.priority ==='high'&& <i className="ri-error-warning-fill text-rose-500 text-[13px]"title="High Priority"></i>}
 </div>
 
 <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] md:text-xs font-semibold text-slate-500 dark:text-slate-300 mt-1">
 <span className="flex items-center gap-1"><i className="ri-map-pin-line text-[#40826D]/70"></i> <span className="truncate max-w-[120px] md:max-w-none">{issue.area}</span></span>
 <span className="hidden md:block w-1 h-1 rounded-full bg-slate-300"></span>
 <span className="flex items-center gap-1"><i className="ri-calendar-line text-slate-400"></i> {new Date(issue.submittedAt || issue.createdAt).toLocaleDateString()}</span>
 
 {/* Reporter Avatar (Minimal) */}
 <span className="hidden md:flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]"title={issue.isAnonymous ?"Anonymous Post":""}>
 <div className="w-4 h-4 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
 {issue.submittedBy?.photoURL ? (
 <img src={issue.submittedBy.photoURL} alt="Author"className="w-full h-full object-cover"/>
 ) : (
 <i className="ri-user-line text-[10px] text-slate-500 dark:text-slate-300"></i>
 )}
 {issue.isAnonymous && (
 <span className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
 <i className="ri-spy-fill text-[8px] text-white"></i>
 </span>
 )}
 </div>
 <span className="truncate max-w-[85px] flex items-center gap-1">
 {issue.submittedBy?.name ? issue.submittedBy.name.split('')[0] :'User'}
 {issue.isAnonymous && <i className="ri-lock-fill text-[10px] text-slate-400"title="Anonymous post"></i>}
 </span>
 </span>
 </div>
 </div>

 {/* Badges Section (Hidden on very small screens) */}
 <div className="hidden sm:flex items-center gap-2 px-4 shrink-0">
 {issue.fundingEnabled && (
 <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
 <i className="ri-funds-line"></i>
 Funding
 </span>
 )}
 <FlairPill category={issue.category} />
 </div>

 {/* Right Section: Actions */}
 <div className="flex items-center gap-2 shrink-0 border-l border-slate-100 pl-4">
 {statusFilter ==='pending_review'? (
 <>
 <button 
 onClick={(e) => handleApprove(e, issue._id, issue._type)}
 className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center gap-1.5 transition-all border border-emerald-100 shadow-sm font-bold text-[13px]">
 <i className="ri-check-line text-[13px]"></i>
 Approve
 </button>
 <button 
 onClick={(e) => handleReject(e, issue._id, issue._type)}
 className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center gap-1.5 transition-all border border-rose-100 shadow-sm font-bold text-[13px]">
 <i className="ri-close-line text-[13px]"></i>
 Reject
 </button>
 </>
 ) : (
 <div className="w-10 h-10 flex items-center justify-center text-slate-300 group-hover:text-[#40826D] transition-colors">
 <i className="ri-arrow-right-s-line text-3xl tracking-tight"></i>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 
 {hasNextPage && (
 <div className="p-4 border-t border-slate-100 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] flex justify-center">
 <button 
 onClick={() => fetchNextPage()} 
 disabled={isFetchingNextPage}
 className="px-6 py-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] rounded-full font-bold text-[13px] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
 {isFetchingNextPage ? (
 <><i className="ri-loader-4-line animate-spin"></i> Loading more...</>
 ) : (
 <><i className="ri-arrow-down-line"></i> Load More Issues</>
 )}
 </button>
 </div>
 )}
 </div>

 {/* Detail & Assignment Drawer */}
 <AdminIssueDetailDrawer 
 issue={drawerIssue} 
 onClose={() => setDrawerIssue(null)} 
 />
 </div>
 );
}
