import React, { useState, useEffect } from'react';
import { motion, AnimatePresence } from'framer-motion';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import MinimalLoader from'../common/MinimalLoader';
import Swal from'sweetalert2';
import ProofReviewModal from'./ProofReviewModal';

const AdminPosts = () => {
 const [data, setData] = useState({ animals: [], lostFound: [], announcements: [] });
 const [pendingRescues, setPendingRescues] = useState([]);
 const [activeTab, setActiveTab] = useState('animals');
 const [isLoading, setIsLoading] = useState(true);
 const [reviewingAnimal, setReviewingAnimal] = useState(null);
 
 const axiosSecure = useAxiosSecure();

 const fetchPosts = async () => {
 setIsLoading(true);
 try {
 const [postsRes, pendingRes] = await Promise.all([
 axiosSecure.get('/admin/posts'),
 axiosSecure.get('/admin/animals/pending-rescues')
 ]);
 setData(postsRes.data);
 setPendingRescues(pendingRes.data || []);
 } catch (error) {
 console.error("Failed to fetch posts:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchPosts();
 }, []);

 const handleDelete = async (type, id) => {
 const result = await Swal.fire({
 title:'Are you sure?',
 text:"You won't be able to revert this!",
 icon:'warning',
 showCancelButton: true,
 confirmButtonColor:'#d33',
 cancelButtonColor:'#40826D',
 confirmButtonText:'Yes, delete it!'});

 if (result.isConfirmed) {
 try {
 await axiosSecure.delete(`/admin/posts/${type}/${id}`);
 Swal.fire('Deleted!','The post has been deleted.','success');
 fetchPosts(); // Refresh data
 } catch (error) {
 console.error("Failed to delete post:", error);
 Swal.fire('Error','Failed to delete post.','error');
 }
 }
 };

 const handleDismissSubmission = async (itemId, submissionId, email) => {
 const { value: reason } = await Swal.fire({
 title:'Dismiss Submission?',
 text:`Please enter a rejection reason for the submission from ${email}:`,
 input:'text',
 inputPlaceholder:'e.g. Insufficient photo evidence',
 showCancelButton: true,
 confirmButtonColor:'#d33',
 cancelButtonColor:'#40826D',
 confirmButtonText:'Yes, reject and block!',
 inputValidator: (value) => {
 if (!value) {
 return'You must enter a reason!';
 }
 }
 });

 if (reason) {
 try {
 await axiosSecure.post(`/admin/lost-found/${itemId}/submissions/${submissionId}/dismiss`, { reason });
 Swal.fire('Dismissed!','The submission has been dismissed/rejected and the user blocked.','success');
 fetchPosts(); // Refresh data
 } catch (error) {
 console.error("Failed to dismiss submission:", error);
 const errMsg = error.response?.data?.error || error.message ||'Failed to dismiss submission.';
 Swal.fire('Error', errMsg,'error');
 }
 }
 };

 const handleResetSubmission = async (itemId, submissionId, email) => {
 const result = await Swal.fire({
 title:'Delete/Reset Submission?',
 text:`Are you sure you want to completely remove the submission from ${email}? This allows them to resubmit.`,
 icon:'warning',
 showCancelButton: true,
 confirmButtonColor:'#d33',
 cancelButtonColor:'#40826D',
 confirmButtonText:'Yes, reset it!'});

 if (result.isConfirmed) {
 try {
 await axiosSecure.delete(`/admin/lost-found/${itemId}/submissions/${submissionId}`);
 Swal.fire('Deleted!','The submission has been completely removed/reset.','success');
 fetchPosts(); // Refresh data
 } catch (error) {
 console.error("Failed to reset submission:", error);
 const errMsg = error.response?.data?.error || error.message ||'Failed to reset submission.';
 Swal.fire('Error', errMsg,'error');
 }
 }
 };

 const handleApprove = async (id) => {
 try {
 await axiosSecure.patch(`/admin/animals/${id}/verify-rescue`, { decision:'approved'});
 Swal.fire('Verified!','The rescue has been verified and points awarded.','success');
 setReviewingAnimal(null);
 fetchPosts();
 } catch (error) {
 console.error("Failed to verify rescue:", error);
 Swal.fire('Error','Failed to verify rescue.','error');
 }
 };

 const handleReject = async (id, reason) => {
 try {
 await axiosSecure.patch(`/admin/animals/${id}/verify-rescue`, { decision:'rejected', rejectionReason: reason });
 Swal.fire('Rejected','The proof was rejected and the reporter has been notified.','info');
 setReviewingAnimal(null);
 fetchPosts();
 } catch (error) {
 console.error("Failed to reject rescue:", error);
 Swal.fire('Error','Failed to reject rescue.','error');
 }
 };

 const tabs = [
 { id:'animals', label:'Animals & Rescues', icon:'ri-bear-smile-line', count: data.animals.length },
 { id:'pendingRescues', label:'Pending Rescues', icon:'ri-time-line', count: pendingRescues.length },
 { id:'lostFound', label:'Lost & Found', icon:'ri-search-eye-line', count: data.lostFound.length },
 { id:'announcements', label:'Announcements', icon:'ri-megaphone-line', count: data.announcements.length }
 ];

 if (isLoading) {
 return (
 <div className="flex justify-center py-12">
 <MinimalLoader size="lg"color="#40826D"/>
 </div>
 );
 }

 const renderContent = () => {
 let items = [];
 let type ='';

 if (activeTab ==='animals') {
 items = data.animals;
 type ='animal';
 } else if (activeTab ==='lostFound') {
 items = data.lostFound;
 type ='lostfound';
 } else if (activeTab ==='announcements') {
 items = data.announcements;
 type ='announcement';
 } else if (activeTab ==='pendingRescues') {
 if (pendingRescues.length === 0) {
 return (
 <div className="text-center py-10 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg border border-slate-100 border-dashed">
 <i className="ri-inbox-line text-4xl tracking-tight text-slate-300 mb-2 block"></i>
 <p className="text-slate-500 dark:text-slate-300">No pending rescues awaiting review.</p>
 </div>
 );
 }
 return (
 <div className="grid grid-cols-1 gap-4">
 <AnimatePresence>
 {pendingRescues.map((item) => (
 <motion.div 
 key={item._id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:shadow-md transition-all">
 <div className="flex items-start gap-4 flex-1">
 {item.image ? (
 <img 
 src={item.image} 
 alt="Stray"className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] shrink-0"/>
 ) : (
 <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] flex items-center justify-center text-slate-400 text-2xl tracking-tight shrink-0">
 <i className="ri-image-line"></i>
 </div>
 )}
 
 <div className="flex-grow min-w-0">
 <h3 className="font-bold text-slate-800 dark:text-white text-[13px] capitalize tracking-tight">
 {item.animalType || item.type ||'Stray Animal'}
 </h3>
 <div className="text-xs text-slate-500 dark:text-slate-300 flex flex-wrap gap-x-4 gap-y-1 mt-1">
 <span className="flex items-center gap-1">
 📍 {item.location}
 </span>
 <span className="flex items-center gap-1">
 ⏰ {new Date(item.date).toLocaleDateString()}
 </span>
 </div>

 {/* Proof detail box */}
 <div className="mt-4 p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl flex flex-col sm:flex-row gap-4 items-start">
 {item.rescueProof?.imageUrl ? (
 <a href={item.rescueProof.imageUrl} target="_blank"rel="noreferrer"className="shrink-0 group relative block">
 <img 
 src={item.rescueProof.imageUrl} 
 alt="Rescue Proof"className="w-20 h-20 rounded-lg object-cover border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:scale-105 transition-all"/>
 <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold rounded-lg text-center p-1">
 🔍 Zoom
 </span>
 </a>
 ) : (
 <div className="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-1 font-bold">No Image</div>
 )}
 
 <div className="flex-grow">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Reporter's Note</span>
 <p className="text-[13px] text-slate-600 dark:text-slate-300 italic mt-0.5">"{item.rescueProof?.note ||'No note provided'}"</p>
 
 <div className="flex flex-wrap gap-4 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
 <span>Volunteers Signed up: {item.volunteers?.length || 0}</span>
 <span className="text-teal-600 font-bold">Verified physically present: {item.rescueProof?.verifiedVolunteers?.length || 0}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="shrink-0 w-full md:w-auto flex flex-col md:flex-row gap-2">
 <button 
 onClick={() => setReviewingAnimal(item)}
 className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
 <i className="ri-check-double-line"></i> Review Proof
 </button>
 <button 
 onClick={() => handleDelete('animal', item._id)}
 className="w-full md:w-auto px-5 py-2.5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
 <i className="ri-delete-bin-line"></i> Delete
 </button>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 );
 }

 if (items.length === 0) {
 return (
 <div className="text-center py-10 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg border border-slate-100 border-dashed">
 <i className="ri-inbox-line text-4xl tracking-tight text-slate-300 mb-2 block"></i>
 <p className="text-slate-500 dark:text-slate-300">No records found for this category.</p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 gap-4">
 <AnimatePresence>
 {items.map((item) => (
 <motion.div 
 key={item._id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:shadow-md transition-all">
 <div className="flex items-center gap-4 flex-1">
 {item.image || item.photoURL || item.imageUrl ? (
 <img 
 src={item.image || item.photoURL || item.imageUrl} 
 alt="Thumbnail"className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] shrink-0"/>
 ) : (
 <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] flex items-center justify-center text-slate-400 text-2xl tracking-tight shrink-0">
 <i className="ri-image-line"></i>
 </div>
 )}
 
 <div>
 <h3 className="font-bold text-slate-800 dark:text-white text-[13px] tracking-tight">
 {item.name || item.title || item.itemName ||'Untitled'}
 </h3>
 <div className="text-xs text-slate-500 dark:text-slate-300 flex flex-wrap gap-x-4 gap-y-1 mt-1">
 {item.status && (
 <span className="flex items-center gap-1 font-medium capitalize">
 <i className="ri-checkbox-circle-line text-[#40826D]"></i> {item.status}
 </span>
 )}
 {type ==='animal'&& item.rescueVerificationStatus ==='pending'&& (
 <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 rounded">
 <i className="ri-time-line"></i> Verification Pending
 </span>
 )}
 {item.type && (
 <span className="flex items-center gap-1 capitalize">
 <i className="ri-price-tag-3-line text-blue-500"></i> {item.type}
 </span>
 )}
 <span className="flex items-center gap-1">
 <i className="ri-calendar-line text-slate-400"></i> 
 {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}
 </span>
 </div>
 <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-2 line-clamp-1 max-w-xl">
 {item.description || item.body ||''}
 </p>
 {type ==='animal'&& item.status ==='rescued'&& item.rescueVerificationStatus ==='pending'&& item.proofUrl && (
 <div className="mt-2">
 <a href={item.proofUrl} target="_blank"rel="noopener noreferrer"className="text-[13px] text-blue-600 font-bold hover:underline flex items-center gap-1">
 <i className="ri-link"></i> View Proof
 </a>
 </div>
 )}
 {type ==='lostfound'&& (
 <div className="mt-3 text-xs space-y-1.5 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] p-3 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 max-w-xl">
 <div>
 <span className="font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wider text-[10px]">Posted by:</span>{''}
 <span className="text-slate-800 dark:text-white font-bold">{item.reporter || item.postedBy || item.contactInfo ||'Citizen'}</span>
 </div>
 
 {item.status ==='reunited'&& (
 <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 flex flex-wrap items-center gap-x-2">
 <span className="font-extrabold text-emerald-700 uppercase tracking-wider text-[10px]">Reunited with:</span>{''}
 <span className="text-emerald-800 font-black">{item.claimedBy ||'General / Unknown'}</span>
 {item.reunitedAt && (
 <span className="text-slate-400 font-medium">
 on {new Date(item.reunitedAt).toLocaleDateString()}
 </span>
 )}
 </div>
 )}

 {/* Display foundReports or claims */}
 {item.type ==='lost'&& item.foundReports && item.foundReports.length > 0 && (
 <div className="pt-1.5 border-t border-slate-100/60 space-y-1.5">
 <span className="font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wider text-[10px]">Sighting Reports ({item.foundReports.length}):</span>
 <div className="flex flex-wrap gap-1.5">
 {item.foundReports.map((r, idx) => {
 const isRejected = r.status ==='rejected';
 return (
 <span key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11.5px] font-bold ${
 isRejected
 ?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-400 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] line-through opacity-70': r.isSuspicious 
 ?'bg-rose-50 text-rose-700 border-rose-200':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]'}`}>
 <span className="truncate max-w-[200px]"title={isRejected ?`Rejected: ${r.rejectionReason}`:''}>
 {r.name || r.email.split('@')[0]} ({r.email})
 </span>
 {isRejected && <span className="text-slate-400 font-extrabold text-[9px] shrink-0">🚫 REJECTED</span>}
 {r.isSuspicious && !isRejected && <span className="text-rose-500 font-black shrink-0 text-[10px]">⚠️ FLAG SUS</span>}
 
 {!isRejected ? (
 <div className="flex items-center gap-1 ml-1.5 border-l border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] pl-1.5">
 <button 
 onClick={() => handleDismissSubmission(item._id, r._id || idx, r.email)}
 className="text-slate-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-150 shrink-0"title="Dismiss & Block">
 <i className="ri-close-line text-[13px] font-bold"></i>
 </button>
 <button 
 onClick={() => handleResetSubmission(item._id, r._id || idx, r.email)}
 className="text-slate-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-150 shrink-0 animate-pulse"title="Delete / Reset">
 <i className="ri-delete-bin-line text-[11px] font-bold"></i>
 </button>
 </div>
 ) : (
 <button 
 onClick={() => handleResetSubmission(item._id, r._id || idx, r.email)}
 className="text-slate-400 hover:text-emerald-700 transition-colors ml-1 p-0.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-150 shrink-0"title="Reset / Unblock">
 <i className="ri-refresh-line text-[11px] font-bold"></i>
 </button>
 )}
 </span>
 );
 })}
 </div>
 </div>
 )}

 {item.type ==='found'&& item.claims && item.claims.length > 0 && (
 <div className="pt-1.5 border-t border-slate-100/60 space-y-1.5">
 <span className="font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wider text-[10px]">Ownership Claims ({item.claims.length}):</span>
 <div className="flex flex-wrap gap-1.5">
 {item.claims.map((c, idx) => {
 const isRejected = c.status ==='rejected';
 return (
 <span key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11.5px] font-bold ${
 isRejected
 ?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-400 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] line-through opacity-70': c.isSuspicious 
 ?'bg-rose-50 text-rose-700 border-rose-200':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]'}`}>
 <span className="truncate max-w-[200px]"title={isRejected ?`Rejected: ${c.rejectionReason}`:''}>
 {c.name || c.email.split('@')[0]} ({c.email})
 </span>
 {isRejected && <span className="text-slate-400 font-extrabold text-[9px] shrink-0">🚫 REJECTED</span>}
 {c.isSuspicious && !isRejected && <span className="text-rose-500 font-black shrink-0 text-[10px]">⚠️ FLAG SUS</span>}
 
 {!isRejected ? (
 <div className="flex items-center gap-1 ml-1.5 border-l border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] pl-1.5">
 <button 
 onClick={() => handleDismissSubmission(item._id, c._id || idx, c.email)}
 className="text-slate-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-150 shrink-0"title="Dismiss & Block">
 <i className="ri-close-line text-[13px] font-bold"></i>
 </button>
 <button 
 onClick={() => handleResetSubmission(item._id, c._id || idx, c.email)}
 className="text-slate-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-150 shrink-0"title="Delete / Reset">
 <i className="ri-delete-bin-line text-[11px] font-bold"></i>
 </button>
 </div>
 ) : (
 <button 
 onClick={() => handleResetSubmission(item._id, c._id || idx, c.email)}
 className="text-slate-400 hover:text-emerald-700 transition-colors ml-1 p-0.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-150 shrink-0"title="Reset / Unblock">
 <i className="ri-refresh-line text-[11px] font-bold"></i>
 </button>
 )}
 </span>
 );
 })}
 </div>
 </div>
 )}
 
 {/* Admin guidelines tip on flagged posts */}
 {(item.foundReports?.some(r => r.isSuspicious) || item.claims?.some(c => c.isSuspicious)) && (
 <div className="mt-3.5 p-3.5 bg-rose-50/40 rounded-lg border border-rose-200/60 text-[11.5px] text-rose-800 font-bold flex gap-2.5 items-start">
 <i className="ri-information-fill text-rose-500 text-[13px] shrink-0"></i>
 <div>
 <span className="font-black text-rose-900 block mb-0.5">Moderation Action Required:</span> 
 This post contains citizen claims flagged as suspicious. You can review claimant/finder profiles, message them for details, or contact the reporter. If malicious intent is found, click <span className="text-red-650">"Delete"</span> to remove the listing or suspend the user.
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 <div className="shrink-0 w-full md:w-auto flex flex-col md:flex-row gap-2">
 {type ==='animal'&& item.status ==='rescued'&& item.rescueVerificationStatus ==='pending'&& (
 <button 
 onClick={() => setReviewingAnimal(item)}
 className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
 <i className="ri-check-double-line"></i> Review Proof
 </button>
 )}
 <button 
 onClick={() => handleDelete(type, item._id)}
 className="w-full md:w-auto px-5 py-2.5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
 <i className="ri-delete-bin-line"></i> Delete
 </button>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 );
 };

 return (
 <div>
 {/* Premium Page Header */}
 <div className="flex items-center gap-5 mb-10">
 <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-700 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-rose-500/30 border border-rose-400">
 <i className="ri-file-shield-2-line text-3xl tracking-tight drop-shadow-md"></i>
 </div>
 <div>
 <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-black text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>Manage Posts</h1>
 <p className="text-[13px] md:text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1">Review and moderate all community posts and activities.</p>
 </div>
 </div>
 
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4 md:p-5">
 
 {/* Tabs */}
 <div className="bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/60 p-1.5 rounded-[1.25rem] flex flex-wrap md:flex-nowrap gap-1 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40 mb-8 overflow-x-auto scrollbar-hide">
 {tabs.map((tab) => {
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`relative whitespace-nowrap px-5 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 flex items-center gap-2 cursor-pointer select-none flex-grow md:flex-1 justify-center z-10 ${
 isActive 
 ?'text-[#40826D]':'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white'}`}
 >
 {isActive && (
 <motion.div
 layoutId="activeAdminTab"className="absolute inset-0 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/30"transition={{ type:'spring', stiffness: 380, damping: 30 }}
 />
 )}
 <span className="relative z-20 flex items-center gap-2">
 <i className={`${tab.icon} text-[13px] ${isActive ?'text-[#40826D]':'text-slate-400'}`}></i>
 <span>{tab.label}</span>
 <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all duration-300 ${
 isActive ?'bg-[#40826D]/10 text-[#40826D]':'bg-slate-200 text-slate-600 dark:text-slate-300'}`}>
 {tab.count}
 </span>
 </span>
 </button>
 );
 })}
 </div>
 
 {/* Tab Content */}
 <div className="min-h-[400px]">
 {renderContent()}
 </div>
 
 {reviewingAnimal && (
 <ProofReviewModal
 animal={reviewingAnimal}
 onApprove={handleApprove}
 onReject={handleReject}
 onClose={() => setReviewingAnimal(null)}
 />
 )}
 </div>
 </div>
 );
};

export default AdminPosts;
