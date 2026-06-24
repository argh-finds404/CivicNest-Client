import React, { useState, useEffect } from'react';
import { motion } from'framer-motion';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import MinimalLoader from'../common/MinimalLoader';
import Swal from'sweetalert2';
import { useQueryClient } from'@tanstack/react-query';

const AdminMembership = () => {
 const queryClient = useQueryClient();
 const [activeTab, setActiveTab] = useState('membership'); //'membership'|'volunteer'
 const [requests, setRequests] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isTabLoading, setIsTabLoading] = useState(false);
 const axiosSecure = useAxiosSecure();

 const fetchRequests = async (showMainLoader = false) => {
 if (showMainLoader) {
 setIsLoading(true);
 } else {
 setIsTabLoading(true);
 }
 try {
 const url = activeTab ==='membership'?'/admin/membership':'/admin/volunteers';
 const res = await axiosSecure.get(url);
 setRequests(res.data);
 } catch (error) {
 console.error(`Failed to fetch ${activeTab} requests`, error);
 } finally {
 setIsLoading(false);
 setIsTabLoading(false);
 }
 };

 useEffect(() => {
 fetchRequests(isLoading);
 }, [activeTab]);

 const handleStatusUpdate = async (id, email, status) => {
 try {
 const url = activeTab ==='membership'?`/admin/membership/${id}/status`:`/admin/volunteers/${id}/status`;
 await axiosSecure.patch(url, { status, email });
 Swal.fire({
 icon:'success',
 title:`Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
 timer: 1500,
 showConfirmButton: false
 });
 queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
 queryClient.invalidateQueries({ queryKey: ['admin-queue-count'] });
 fetchRequests();
 } catch (error) {
 console.error("Failed to update status", error);
 Swal.fire({
 icon:'error',
 title:'Update Failed',
 text:'Could not update status.'});
 }
 };

 if (isLoading) {
 return (
 <div className="flex justify-center py-12">
 <MinimalLoader size="lg"color="#40826D"/>
 </div>
 );
 }

 return (
 <div>
 {/* Premium Page Header */}
 <div className="flex items-center gap-5 mb-10">
 <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-700 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-indigo-500/30 border border-indigo-400">
 <i className="ri-pass-valid-line text-3xl tracking-tight drop-shadow-md"></i>
 </div>
 <div>
 <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-black text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>
 {activeTab ==='membership'?'Membership Applications':'Volunteer Applications'}
 </h1>
 <p className="text-[13px] md:text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1">
 {activeTab ==='membership'?'Review and manage user requests for verified membership.':'Review and approve member requests to join the volunteer force.'}
 </p>
 </div>
 </div>

 {/* Tabs */}
 <div className="bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/60 p-1.5 rounded-[1.25rem] flex flex-wrap md:flex-nowrap gap-1 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40 mb-8 overflow-x-auto scrollbar-hide select-none max-w-md">
 {['membership','volunteer'].map((tabVal) => {
 const isActive = activeTab === tabVal;
 return (
 <button
 key={tabVal}
 onClick={() => setActiveTab(tabVal)}
 className={`relative whitespace-nowrap px-6 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none flex-1 z-10 ${
 isActive 
 ?'text-indigo-600 font-extrabold':'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:text-white'}`}
 >
 {isActive && (
 <motion.div
 layoutId="activeAdminMembershipTab"className="absolute inset-0 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/30"transition={{ type:'spring', stiffness: 380, damping: 30 }}
 />
 )}
 <span className="relative z-20">
 {tabVal ==='membership'?'Membership Requests':'Volunteer Requests'}
 </span>
 </button>
 );
 })}
 </div>
 
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-sm border border-slate-100 p-4 md:p-5 relative overflow-hidden">
 {isTabLoading && (
 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-indigo-500 animate-pulse rounded-t-[2rem]"style={{ zIndex: 30 }} />
 )}

 <div className={`transition-opacity duration-300 ${isTabLoading ?'opacity-50 pointer-events-none':'opacity-100'}`}>
 {requests.length === 0 ? (
 <div className="text-center py-10 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl border border-dashed border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="w-20 h-20 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
 <i className="ri-inbox-line text-4xl tracking-tight text-slate-300"></i>
 </div>
 <p className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Inbox Zero!</p>
 <p className="text-slate-500 dark:text-slate-300 font-medium mt-1">No {activeTab ==='membership'?'membership':'volunteer'} requests are currently pending.</p>
 </div>
 ) : activeTab ==='membership'? (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {requests.map(req => {
 const status = req.status || req.approvalStatus ||'pending';
 return (
 <div key={req._id} className="group bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col relative overflow-hidden">
 {/* Background accent */}
 <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none ${
 status ==='pending'?'bg-amber-500':
 status ==='approved'?'bg-emerald-500':'bg-red-500'}`}></div>
 
 <div className="flex items-start justify-between mb-5 relative z-10">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-full flex items-center justify-center border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-400 shrink-0 overflow-hidden">
 {req.photoURL ? (
 <img src={req.photoURL} alt={req.name ||'User'} className="w-full h-full object-cover"onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
 ) : null}
 <i className={`ri-user-smile-line text-2xl tracking-tight ${req.photoURL ?'hidden':'block'}`}></i>
 </div>
 <div>
 <h3 className="font-extrabold text-[13px] text-slate-900 dark:text-white leading-tight tracking-tight">{req.name || req.email.split('@')[0]}</h3>
 <p className="text-xs text-slate-500 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
 <i className="ri-mail-line"></i> {req.email}
 </p>
 </div>
 </div>
 <span className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border shadow-sm flex items-center gap-1 ${
 status ==='pending'?'bg-amber-50 text-amber-700 border-amber-200':
 status ==='approved'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700 border-red-200'}`}>
 {status ==='pending'? <><i className="ri-time-line text-[13px]"></i> Pending</> : 
 status ==='approved'? <><i className="ri-check-double-line text-[13px]"></i> Approved</> : 
 <><i className="ri-close-circle-line text-[13px]"></i> Rejected</>}
 </span>
 </div>
 
 <div className="flex-1 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg p-5 border border-slate-100 mb-5 relative z-10 space-y-4">
 {/* Grid of Resident Details */}
 <div className="grid grid-cols-2 gap-4">
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</span>
 <p className="text-[13px] font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 truncate"title={req.name}>
 <i className="ri-user-line text-indigo-500"></i> {req.name ||"Not specified"}
 </p>
 </div>

 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contact Phone</span>
 <p className="text-[13px] font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 truncate"title={req.phone}>
 <i className="ri-phone-line text-indigo-500"></i> {req.phone ||"Not specified"}
 </p>
 </div>
 
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Neighborhood / Area</span>
 <p className="text-[13px] font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 truncate"title={req.area}>
 <i className="ri-map-pin-2-fill text-indigo-500"></i> {req.area ||"Not specified"}
 </p>
 </div>

 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Street Address</span>
 <p className="text-[13px] font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 truncate"title={req.streetAddress}>
 <i className="ri-compass-3-line text-indigo-500"></i> {req.streetAddress ||"Not specified"}
 </p>
 </div>

 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Apartment / House</span>
 <p className="text-[13px] font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 truncate"title={req.apartmentNumber}>
 <i className="ri-home-4-line text-indigo-500"></i> {req.apartmentNumber ||"Not specified"}
 </p>
 </div>

 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">NID / Passport</span>
 <p className="text-[13px] font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 truncate"title={req.nid}>
 <i className="ri-fingerprint-line text-indigo-500"></i> {req.nid ||"Not specified"}
 </p>
 </div>
 </div>
 
 <div className="pt-2 border-t border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Introduction / Reason</span>
 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic border-l-2 border-indigo-200 pl-3">"{req.intro ||"Not specified"}"</p>
 </div>
 
 {req.idImage && (
 <div className="pt-3 border-t border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 flex items-center justify-between">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Residency Proof</span>
 <a href={req.idImage} target="_blank"rel="noopener noreferrer"className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-bold flex items-center gap-1 w-fit">
 <i className="ri-id-card-line text-[13px]"></i> View Document <i className="ri-external-link-line text-[10px]"></i>
 </a>
 </div>
 )}
 </div>
 
 <div className="flex items-center justify-between mt-auto relative z-10">
 <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
 <i className="ri-calendar-line text-[13px]"></i> {new Date(req.submittedAt || req.registeredAt).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric'})}
 </span>
 
 {status ==='pending'&& (
 <div className="flex gap-2">
 <button 
 onClick={() => handleStatusUpdate(req._id, req.email,'rejected')}
 className="w-10 h-10 rounded-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-red-200 flex items-center justify-center transition-all shadow-sm group/rej"title="Reject">
 <i className="ri-close-line text-[13px] group-hover/rej:scale-110 transition-transform"></i>
 </button>
 <button 
 onClick={() => handleStatusUpdate(req._id, req.email,'approved')}
 className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
 <i className="ri-check-line text-[13px]"></i> Approve
 </button>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 /* Volunteer Requests - Structured Table List */
 <div className="overflow-x-auto -mx-6 md:-mx-8">
 <table className="w-full border-collapse text-left text-[13px]">
 <thead>
 <tr className="border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/70">
 <th className="py-4 px-6">Candidate</th>
 <th className="py-4 px-6">Skills</th>
 <th className="py-4 px-6">Area</th>
 <th className="py-4 px-6">Availability</th>
 <th className="py-4 px-6">Contact info</th>
 <th className="py-4 px-6 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {requests.map(req => {
 const status = req.approvalStatus ||'pending';
 return (
 <tr key={req._id} className="hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/45 transition-colors group">
 {/* Candidate */}
 <td className="py-4 px-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full border border-slate-100 shrink-0 overflow-hidden bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] flex items-center justify-center text-slate-400 shadow-sm animate-fade-in">
 {req.photoURL ? (
 <img src={req.photoURL} alt=""className="w-full h-full object-cover animate-fade-in"/>
 ) : (
 <i className="ri-user-smile-line text-[13px]"></i>
 )}
 </div>
 <div className="min-w-0">
 <p className="font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{req.name || req.email.split('@')[0]}</p>
 <p className="text-xs text-slate-400 truncate">{req.email}</p>
 </div>
 </div>
 </td>

 {/* Skills */}
 <td className="py-4 px-6">
 <div className="flex flex-wrap gap-1 max-w-[200px]">
 {req.skills?.map(s => (
 <span key={s} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[10px] font-bold border border-teal-100/50 shadow-sm">
 {s}
 </span>
 ))}
 </div>
 </td>

 {/* Area */}
 <td className="py-4 px-6 font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">
 <div className="flex items-center gap-1.5">
 <i className="ri-map-pin-2-fill text-indigo-500"></i>
 <span>{req.area ||"Not specified"}</span>
 </div>
 </td>

 {/* Availability */}
 <td className="py-4 px-6">
 <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
 <i className="ri-calendar-line text-slate-400"></i> {req.availability}
 </span>
 </td>

 {/* Contact details */}
 <td className="py-4 px-6 font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">
 {req.phone ||"No phone"}
 </td>

 {/* Actions */}
 <td className="py-4 px-6 text-right">
 <div className="flex items-center justify-end gap-2">
 {status ==='pending'? (
 <>
 <button 
 onClick={() => handleStatusUpdate(req._id, req.email,'approved')}
 className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1">
 <i className="ri-check-line"></i> Approve
 </button>
 <button 
 onClick={() => handleStatusUpdate(req._id, req.email,'rejected')}
 className="w-8 h-8 rounded-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-red-200 flex items-center justify-center transition-all shadow-sm"title="Reject">
 <i className="ri-close-line text-[13px]"></i>
 </button>
 </>
 ) : (
 <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border shadow-sm flex items-center gap-1 ${
 status ==='approved'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700 border-red-200'}`}>
 {status ==='approved'? <><i className="ri-check-double-line text-xs"></i> Approved</> : <><i className="ri-close-circle-line text-xs"></i> Rejected</>}
 </span>
 )}
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default AdminMembership;
