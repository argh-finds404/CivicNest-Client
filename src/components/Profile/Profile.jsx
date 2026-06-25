import React, { useState, useEffect } from"react";
import { Link } from"react-router";
import { useAuth } from"../../hooks/useAuth";
import { useRole } from"../../hooks/useRole";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { updateProfile } from"firebase/auth";
import { auth } from"../../firebase/firebase.init";
import { motion, AnimatePresence } from"framer-motion";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import toast from"react-hot-toast";
import { jsPDF } from"jspdf";
import autoTable from"jspdf-autotable";

import MyIssues from"../Issues/MyIssues";
import MyContributions from"../Contributions/MyContributions";
import MyLostFound from"../LostFound/MyLostFound";
import MyOrganizedEvents from"./MyOrganizedEvents";
import MinimalLoader from"../common/MinimalLoader.jsx";
import IssueCard from"../cards/IssueCard";
import CleanupEventCard from"../cards/CleanupEventCard";
import LostFoundCard from"../cards/LostFoundCard";

const OverviewTab = ({
 user,
 role,
 isRoleLoading,
 userData,
 firebaseForm,
 setFirebaseForm,
 dbForm,
 setDbForm,
 handleUnifiedSave,
 savingFirebase,
 savingDb,
 axiosSecure,
 myEvents,
}) => {
 const [isEditingProfile, setIsEditingProfile] = useState(false);
 const [avatarHover, setAvatarHover] = useState(false);
 const [showCoverModal, setShowCoverModal] = useState(false);
 const [tempCoverUrl, setTempCoverUrl] = useState("");
 const queryClient = useQueryClient();
 const isSaving = savingFirebase || savingDb;

 const nextEvent = myEvents?.attending?.[0];

 const handleCoverClick = () => {
 setTempCoverUrl(dbForm.coverPhoto ||"");
 setShowCoverModal(true);
 };

 const handleSaveCoverUrl = () => {
 setDbForm((p) => ({ ...p, coverPhoto: tempCoverUrl }));
 setShowCoverModal(false);
 toast.success("Cover photo updated!");
 };

 const unlockToast = (msg) => {
 toast.custom(
 (t) => (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/90 backdrop-blur-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] rounded-full pointer-events-auto flex items-center p-2 pr-5 border border-slate-100 dark:border-[#1e3040]/30"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 <div className="h-10 w-10 shrink-0 rounded-full bg-[#40826D]/15 dark:bg-[#40826D]/20 flex items-center justify-center">
 <i className="ri-lock-unlock-line text-[#40826D] text-[15px] font-bold"></i>
 </div>
 <div className="ml-3 shrink-0">
 <p className="text-[13px] font-extrabold text-slate-800 dark:text-white whitespace-nowrap">{msg}</p>
 </div>
 </div>
 ),
 { duration: 1200 }
 );
 };

 const { data: membershipStatus } = useQuery({
 queryKey: ['membershipStatus', user?.email],
 queryFn: async () => {
 const res = await axiosSecure.get("/membership/status");
 return res.data;
 },
 enabled: !!user && (role ==="guest"|| !role),
 });

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 className="flex flex-col gap-4 w-full">
 {}
 <div className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
 {/* Cover Photo Area */}
 <div className="w-full h-48 md:h-64 bg-slate-200 relative group">
 {dbForm.coverPhoto ? (
 <img src={dbForm.coverPhoto} alt="Cover"className="w-full h-full object-cover"/>
 ) : firebaseForm.photoURL ? (
 <div className="w-full h-full relative overflow-hidden bg-slate-800">
 <img src={firebaseForm.photoURL} alt="Cover Fallback"className="w-full h-full object-cover opacity-50 blur-xl scale-110"/>
 </div>
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"></div>
 )}
 
 {/* Upload Button */}
 {isEditingProfile && (
 <button 
 onClick={handleCoverClick}
 className="absolute bottom-4 right-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/90 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-800 dark:text-white px-4 py-2 rounded-xl font-bold text-[13px] shadow-lg cursor-pointer flex items-center gap-2 backdrop-blur-sm transition-all z-10 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50">
 <i className="ri-image-add-fill text-[13px]"></i>
 <span className="hidden sm:inline">Change Cover URL</span>
 </button>
 )}
 </div>

 {/* Profile Info Area */}
 <div className="px-8 pb-8 relative flex flex-col md:flex-row items-center md:items-end gap-4 z-10">
 <div 
 className="relative group shrink-0 cursor-pointer -mt-12 md:-mt-16"onMouseEnter={() => setAvatarHover(true)}
 onMouseLeave={() => setAvatarHover(false)}
 >
 <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl relative z-10 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] ring-2 ring-slate-50">
 <img
 src={firebaseForm.photoURL ||"https://i.ibb.co/cS32smV8/shamblen-studios-xw-M61-TPMl-Yk-unsplash.jpg"}
 alt="avatar"className={`w-full h-full object-cover transition-all ${isEditingProfile ?'group-hover:brightness-75':''}`}
 onError={(e) => { e.target.onerror = null; e.target.src ="https://i.ibb.co/cS32smV8/shamblen-studios-xw-M61-TPMl-Yk-unsplash.jpg"; }}
 />
 </div>
 {isEditingProfile && (
 <AnimatePresence>
 {avatarHover && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-full">
 <i className="ri-camera-fill text-white text-3xl tracking-tight drop-shadow-md"></i>
 </motion.div>
 )}
 </AnimatePresence>
 )}
 {isEditingProfile && (
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#40826D] rounded-full flex items-center justify-center border-4 border-white z-30 shadow-md">
 <i className="ri-check-line text-white text-[13px] font-bold"></i>
 </motion.div>
 )}
 </div>

 <div className="flex-1 text-center md:text-left relative mt-4 md:mt-4 pb-2">
 <h2 className="text-3xl tracking-tight font-extrabold text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>
 {firebaseForm.displayName ||"Citizen"}
 </h2>
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
 <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
 role ==="admin"?"bg-purple-50 text-purple-700 border-purple-200": role ==="member"?"bg-[#40826D]/10 text-[#40826D] border-[#40826D]/20":"bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]"}`}>
 {role ||"Guest"}
 </span>
 {(role ==='member'|| role ==='admin') && userData?.memberId && (
 <span className="bg-amber-100 text-amber-700 text-xs font-black px-3 py-1 rounded-full border border-amber-200 shadow-sm flex items-center gap-1">
 <i className="ri-shield-star-fill"></i> ID: {userData.memberId}
 </span>
 )}
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 
 {/* Main Details */}
 <div className="lg:col-span-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-100 shadow-sm p-5">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white flex items-center gap-2 tracking-tight"style={{ fontFamily:'HKGrotesk'}}>
 <i className="ri-user-settings-line text-[#40826D]"></i> Profile Information
 </h3>
 {!isEditingProfile && (
 <button
 onClick={() => {
 setIsEditingProfile(true);
 unlockToast("Profile Settings Unlocked");
 }}
 className="text-[13px] font-bold text-[#40826D] bg-[#40826D]/10 hover:bg-[#40826D]/20 px-4 py-2 rounded-lg transition-all flex items-center gap-2">
 <i className="ri-pencil-line"></i> Edit Profile
 </button>
 )}
 </div>
 
 <div className="space-y-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  <div>
  <label className="block text-xs font-bold text-slate-500 dark:text-slate-350 uppercase tracking-widest mb-1.5">Display Name</label>
  {isEditingProfile ? (
    <input
      type="text"
      value={firebaseForm.displayName}
      onChange={e => setFirebaseForm(p => ({ ...p, displayName: e.target.value }))}
      placeholder="Your name"
      className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] rounded-lg px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-[#40826D] focus:ring-2 focus:ring-[#40826D]/20 transition-all font-medium hover:border-slate-300"
    />
  ) : (
    <div className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 py-2.5 px-1 border-b border-transparent">
      {firebaseForm.displayName || <span className="text-slate-400 font-normal italic">Not specified</span>}
    </div>
  )}
  </div>
  <div>
  <label className="block text-xs font-bold text-slate-500 dark:text-slate-350 uppercase tracking-widest mb-1.5">Neighborhood / Area</label>
  {isEditingProfile ? (
    <input
      type="text"
      value={dbForm.area}
      onChange={e => setDbForm(p => ({ ...p, area: e.target.value }))}
      placeholder="e.g. Ward 1, Central District"
      className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] rounded-lg px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-[#40826D] focus:ring-2 focus:ring-[#40826D]/20 transition-all font-medium hover:border-slate-300"
    />
  ) : (
    <div className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 py-2.5 px-1 border-b border-transparent">
      {dbForm.area || <span className="text-slate-400 font-normal italic">Not specified</span>}
    </div>
  )}
  </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  <div>
  <label className="block text-xs font-bold text-slate-500 dark:text-slate-350 uppercase tracking-widest mb-1.5">Contact Phone</label>
  {isEditingProfile ? (
    <input
      type="tel"
      value={dbForm.phone || ""}
      onChange={e => setDbForm(p => ({ ...p, phone: e.target.value }))}
      placeholder="e.g. +8801712345678"
      className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] rounded-lg px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-[#40826D] focus:ring-2 focus:ring-[#40826D]/20 transition-all font-medium hover:border-slate-300"
    />
  ) : (
    <div className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 py-2.5 px-1 border-b border-transparent">
      {dbForm.phone || <span className="text-slate-400 font-normal italic">Not specified</span>}
    </div>
  )}
  </div>
  </div>

 <AnimatePresence>
 {isEditingProfile && (
 <motion.div
 initial={{ opacity: 0, height: 0, marginTop: 0 }}
 animate={{ opacity: 1, height:'auto', marginTop: 20 }}
 exit={{ opacity: 0, height: 0, marginTop: 0 }}
 className="overflow-hidden">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
 <i className="ri-image-line text-[#40826D]"></i> Avatar Image URL
 </label>
 <input
 type="url"value={firebaseForm.photoURL}
 onChange={e => setFirebaseForm(p => ({ ...p, photoURL: e.target.value }))}
 placeholder="https://..."className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-[#40826D] focus:ring-2 focus:ring-[#40826D]/20 transition-all font-medium"/>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
 <i className="ri-image-2-line text-[#40826D]"></i> Cover Image URL
 </label>
 <input
 type="url"value={dbForm.coverPhoto ||""}
 onChange={e => setDbForm(p => ({ ...p, coverPhoto: e.target.value }))}
 placeholder="https://..."className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-[#40826D] focus:ring-2 focus:ring-[#40826D]/20 transition-all font-medium"/>
 </div>
 </div> </motion.div>
 )}
 </AnimatePresence>

  <div>
  <label className="block text-xs font-bold text-slate-500 dark:text-slate-355 uppercase tracking-widest mb-1.5">Short Bio</label>
  {isEditingProfile ? (
    <textarea
      rows="4"
      value={dbForm.bio}
      onChange={e => setDbForm(p => ({ ...p, bio: e.target.value }))}
      placeholder="Tell the community about yourself..."
      className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] rounded-lg px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-[#40826D] focus:ring-2 focus:ring-[#40826D]/20 transition-all resize-none font-medium hover:border-slate-300"
    />
  ) : (
    <div className="text-[15px] text-slate-600 dark:text-slate-300 py-2 px-1 whitespace-pre-line leading-relaxed">
      {dbForm.bio || <span className="text-slate-450 italic font-normal">No bio added yet. Tell the community about yourself!</span>}
    </div>
  )}
  </div>
 </div>

 {/* Save Changes Area */}
 <AnimatePresence>
 {isEditingProfile && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height:'auto'}}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
 <button
 onClick={() => setIsEditingProfile(false)}
 className="w-full sm:w-auto bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-bold py-2.5 px-6 rounded-lg transition-all">
 Cancel
 </button>
 <button
 onClick={async () => {
 await handleUnifiedSave();
 setIsEditingProfile(false);
 }}
 disabled={isSaving}
 className="w-full sm:w-auto bg-[#40826D] hover:bg-[#326756] text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
 {isSaving ? (
 <>
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
 Saving...
 </>
 ) : (
 <><i className="ri-save-3-line"></i> Save Changes</>
 )}
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Security & Badges */}
 <div className="lg:col-span-1 flex flex-col gap-4">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-100 shadow-sm p-5 flex-1">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight"style={{ fontFamily:'HKGrotesk'}}>
 <i className="ri-shield-check-line text-[#40826D]"></i> Account Status
 </h3>
 
 <div className="space-y-5">
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Email Address</label>
 <div className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-100 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-300 font-medium flex items-center justify-between">
 <span className="truncate text-[13px]">{user.email}</span>
 <i className="ri-lock-line text-slate-300"></i>
 </div>
 <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Email cannot be changed.</p>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Security Badges</label>
 <div className="flex flex-col gap-3">
 <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${
 user.emailVerified 
 ?"bg-[#9FE2BF]/10 text-[#40826D] border-[#9FE2BF]/30":"bg-red-50 text-red-600 border-red-200"}`}>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${user.emailVerified ?'bg-[#40826D]/10':'bg-red-100'}`}>
 <i className={user.emailVerified ?"ri-shield-check-fill text-[13px]":"ri-shield-cross-fill text-[13px]"}></i> 
 </div>
 <div className="flex flex-col">
 <span className="text-[13px] font-bold">{user.emailVerified ?"Email Verified":"Email Unverified"}</span>
 <span className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Authentication</span>
 </div>
 </div>
 
 <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${
 user.providerData?.[0]?.providerId ==="google.com"?"bg-blue-50/50 text-blue-700 border-blue-200":"bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]"}`}>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${user.providerData?.[0]?.providerId ==="google.com"?'bg-blue-100':'bg-slate-200'}`}>
 <i className={user.providerData?.[0]?.providerId ==="google.com"?"ri-google-fill text-[13px]":"ri-mail-lock-fill text-[13px]"}></i> 
 </div>
 <div className="flex flex-col">
 <span className="text-[13px] font-bold">{user.providerData?.[0]?.providerId ==="google.com"?"Google Linked":"Password Login"}</span>
 <span className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Provider</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Upcoming Event Card */}
 {nextEvent && (
 <div className="bg-teal-50 rounded-xl border border-teal-200 shadow-sm p-4 relative overflow-hidden mt-6">
 <div className="absolute -right-4 -top-4 w-20 h-20 bg-teal-100 rounded-full opacity-50"></div>
 <h3 className="text-[13px] font-bold text-teal-800 uppercase tracking-widest mb-3 flex items-center gap-2">
 <span className="material-symbols-outlined text-[13px]">event</span>
 Upcoming Drive
 </h3>
 <p className="text-teal-900 font-bold mb-1 line-clamp-1">{nextEvent.title}</p>
 <p className="text-xs text-teal-700 mb-3">📅 {new Date(nextEvent.eventDate).toLocaleDateString()}</p>
 <Link to={`/cleanup-events/${nextEvent._id}`} className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg inline-block transition-colors">
 View Details →
 </Link>
 </div>
 )}
 </div>

 </div>

 {}
 {!isRoleLoading && (!role || role.toLowerCase() === 'guest') && membershipStatus?.status !== 'approved' && (
 <div className="w-full relative overflow-hidden rounded-xl mt-4 p-5 border border-slate-700/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
 {/* Main Background */}
 <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 z-0 transition-colors duration-500"></div>
 
 {/* Glow Orbs */}
 <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#40826D]/30 rounded-full mix-blend-screen filter blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-[#40826D]/40 group-hover:scale-110 transition-all duration-700 ease-in-out z-0"></div>
 <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-teal-900/40 rounded-full mix-blend-screen filter blur-[60px] translate-y-1/2 -translate-x-1/4 z-0 group-hover:bg-teal-800/40 transition-colors duration-700"></div>
 
 {/* Overlay Gradient */}
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900/50 to-[#40826D]/20 z-0"></div>

 {/* Decorative Crown */}
 <div className="absolute right-[20%] sm:right-[30%] lg:right-[40%] -top-10 text-[#40826D]/20 text-[180px] pointer-events-none transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 ease-out z-0">
 <i className="ri-vip-crown-fill blur-[4px]"></i>
 </div>
 <div className="absolute right-[30%] sm:right-[40%] lg:right-[50%] top-6 text-[#40826D]/40 text-7xl pointer-events-none z-0 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
 <i className="ri-vip-crown-line"></i>
 </div>
 
 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h4 className="text-3xl tracking-tight font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#9FE2BF] mb-2 drop-shadow-sm"style={{ fontFamily:'HKGrotesk'}}>
 Become a Verified Member
 </h4>
 <p className="text-slate-300 font-medium max-w-xl leading-relaxed text-[13px]">
 Unlock the ability to verify civic issues, earn higher impact points, and take an active role in keeping our community clean.
 </p>
 </div>
 
 <div className="shrink-0">
 {membershipStatus?.status ==='pending'? (
 <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[13px] font-bold px-6 py-3.5 rounded-xl backdrop-blur-md">
 <i className="ri-time-line text-[13px] animate-pulse"></i> Application Under Review
 </div>
 ) : (
 <Link 
 to="/membership/request"className="relative overflow-hidden bg-gradient-to-r from-[#9FE2BF] to-[#60b093] hover:from-white hover:to-white text-[#0f766e] text-[13px] font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(64,130,109,0.3)] hover:shadow-[0_0_25px_rgba(159,226,191,0.5)] hover:-translate-y-0.5 inline-flex items-center gap-2 whitespace-nowrap group/btn">
 <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-in-out"></div>
 <span className="relative z-10 flex items-center gap-2">
 Apply Now
 </span>
 </Link>
 )}
 </div>
 </div>
 </div>
 )}

 {}
 <AnimatePresence>
 {showCoverModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setShowCoverModal(false)}
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
 
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative w-full max-w-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-2xl p-5 border border-slate-100 z-10">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-12 h-12 rounded-lg bg-[#40826D]/10 flex items-center justify-center text-[#40826D]">
 <i className="ri-image-edit-fill text-2xl tracking-tight"></i>
 </div>
 <div>
 <h3 className="text-[13px] tracking-tight font-extrabold text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>Update Cover Photo</h3>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 font-medium">Paste a direct image URL below.</p>
 </div>
 </div>
 
 <div className="mb-8">
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Image Link (URL)</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
 <i className="ri-link"></i>
 </div>
 <input
 type="url"autoFocus
 value={tempCoverUrl}
 onChange={e => setTempCoverUrl(e.target.value)}
 placeholder="https://example.com/image.jpg"className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3.5 text-slate-800 dark:text-white focus:outline-none focus:border-[#40826D] focus:ring-2 focus:ring-[#40826D]/20 transition-all font-medium"onKeyDown={e => {
 if (e.key ==='Enter') handleSaveCoverUrl();
 }}
 />
 </div>
 </div>

 <div className="flex justify-end gap-3">
 <button
 onClick={() => setShowCoverModal(false)}
 className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 transition-all">
 Cancel
 </button>
 <button
 onClick={handleSaveCoverUrl}
 className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#40826D] hover:bg-[#326756] shadow-lg shadow-[#40826D]/30 transition-all">
 Apply Cover
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </motion.div>
 );
};

const BookmarksTab = ({ axiosSecure, user }) => {
 const [bookmarkType, setBookmarkType] = useState('issues');
 const queryClient = useQueryClient();
 
 const { data: bookmarks, isLoading } = useQuery({
 queryKey: ['myBookmarks', user?.email],
 queryFn: async () => {
 const res = await axiosSecure.get('/users/my/bookmarks');
 return res.data;
 },
 enabled: !!user
 });

 const toggleInterestMutation = useMutation({
 mutationFn: async (id) => {
 const res = await axiosSecure.post(`/cleanup-events/${id}/interested`);
 return { id, data: res.data };
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['myBookmarks'] });
 toast.success('Interest updated!');
 },
 onError: (err) => {
 toast.error(err.response?.data?.message ||'Failed to update interest.');
 }
 });

 const toggleGoingMutation = useMutation({
 mutationFn: async (id) => {
 const res = await axiosSecure.post(`/cleanup-events/${id}/going`);
 return { id, data: res.data };
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['myBookmarks'] });
 if (data.data.full) {
 toast.info('This event is full, but you can still mark yourself as Interested!');
 } else {
 toast.success(data.data.going ?'Registered for drive!':'Registration cancelled.');
 }
 },
 onError: (err) => {
 toast.error(err.response?.data?.message ||'Failed to update RSVP.');
 }
 });

 const handleInterested = (id) => {
 toggleInterestMutation.mutate(id);
 };

 const handleGoing = (id) => {
 toggleGoingMutation.mutate(id);
 };

 if (isLoading) {
 return (
 <div className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-center">
 <MinimalLoader />
 </div>
 );
 }

 const issuesList = bookmarks?.issues || [];
 const eventsList = bookmarks?.events || [];
 const lostFoundList = bookmarks?.lostFound || [];

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 shadow-sm border border-slate-100">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-[#1e3040] pb-4 mb-6 gap-3">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white flex items-center gap-2">
 <i className="ri-bookmark-fill text-[#40826D]"></i> Saved Bookmarks
 </h3>
 <div className="flex flex-wrap gap-2">
 <button 
 onClick={() => setBookmarkType('issues')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
 bookmarkType ==='issues'?'bg-[#40826D] text-white shadow-sm':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040]'}`}
 >
 Issues ({issuesList.length})
 </button>
 <button 
 onClick={() => setBookmarkType('events')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
 bookmarkType ==='events'?'bg-[#40826D] text-white shadow-sm':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040]'}`}
 >
 Cleanup Events ({eventsList.length})
 </button>
 <button 
 onClick={() => setBookmarkType('lostfound')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
 bookmarkType ==='lostfound'?'bg-[#40826D] text-white shadow-sm':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040]'}`}
 >
 Lost & Found ({lostFoundList.length})
 </button>
 </div>
 </div>

 <AnimatePresence mode="wait">
 {bookmarkType ==='issues'&& (
 <motion.div 
 key="issues"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {issuesList.length === 0 ? (
 <div className="col-span-full text-center py-12 text-slate-400">
 <i className="ri-bookmark-line text-4xl tracking-tight mb-2 block"></i>
 No saved issues.
 </div>
 ) : (
 issuesList.map(issue => <IssueCard key={issue._id} issue={issue} />)
 )}
 </motion.div>
 )}

 {bookmarkType ==='events'&& (
 <motion.div 
 key="events"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {eventsList.length === 0 ? (
 <div className="col-span-full text-center py-12 text-slate-400">
 <i className="ri-leaf-line text-4xl tracking-tight mb-2 block"></i>
 No saved cleanup events.
 </div>
 ) : (
 eventsList.map(event => (
 <CleanupEventCard 
 key={event._id} 
 event={event} 
 onInterested={handleInterested}
 onGoing={handleGoing}
 userInterested={event.interested?.includes(user?.email)}
 userGoing={event.going?.some(a => a.email === user?.email)}
 />
 ))
 )}
 </motion.div>
 )}

 {bookmarkType ==='lostfound'&& (
 <motion.div 
 key="lostfound"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {lostFoundList.length === 0 ? (
 <div className="col-span-full text-center py-12 text-slate-400">
 <i className="ri-search-eye-line text-4xl tracking-tight mb-2 block"></i>
 No saved lost/found items.
 </div>
 ) : (
 lostFoundList.map(item => <LostFoundCard key={item._id} item={item} />)
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
};

const RewardsTab = ({ userData }) => {
  const [unlockedCodes, setUnlockedCodes] = useState({});
  const points = userData?.points || 0;

  const rewards = [
    { id: 'tea', partner: 'Tongi Corner Tea Stall', offer: 'Free Cup of Special Milk Tea', points: 50, location: 'Ward 1 & 2', code: 'CIVIC-MILKTEA-894', icon: 'ri-cup-line' },
    { id: 'pharmacy', partner: 'Dhaka Care Pharmacy', offer: '10% Off All General Medicine', points: 150, location: 'Ward 1', code: 'CIVIC-MEDS-712', icon: 'ri-capsule-line' },
    { id: 'grocery', partner: 'Daily SuperMart', offer: '৳150 Discount Voucher (Min. Spend ৳1000)', points: 300, location: 'Central Ward', code: 'CIVIC-GROCERY-302', icon: 'ri-shopping-cart-2-line' },
    { id: 'sweets', partner: 'Bikrampur Sweet House', offer: 'Free Box of Premium Rosogolla (1kg)', points: 500, location: 'Ward 3', code: 'CIVIC-SWEET-550', icon: 'ri-cake-3-line' },
  ];

  const handleUnlock = (id) => {
    setUnlockedCodes(prev => ({ ...prev, [id]: true }));
    toast.success("Voucher unlocked successfully!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-6"
    >
      <div className="border-b border-slate-100 dark:border-[#1e3040] pb-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <i className="ri-coupon-3-fill text-[#40826D]"></i> Local Civic Rewards & Partner Discounts
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Sponsor shops in Dhaka partner with CivicNest to reward active neighborhood volunteers. 
          Your impact points act as credentials—unlock vouchers without spending points!
        </p>
      </div>

      <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
        <div className="w-12 h-12 bg-white dark:bg-[#0a120e] text-[#40826D] dark:text-emerald-400 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm border border-emerald-150">
          <i className="ri-medal-line"></i>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Civic Standing Balance</div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none mt-1">
            {points} <span className="text-xs font-bold text-[#40826D]">Lifetime Points</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const isEligible = points >= reward.points;
          const isUnlocked = unlockedCodes[reward.id];

          return (
            <div 
              key={reward.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 ${isEligible ? 'bg-slate-50/50 dark:bg-[#0b1215]/30 border-slate-200 dark:border-[#1e3040] hover:shadow-md' : 'bg-slate-100/30 dark:bg-[#0b1215]/10 border-slate-100 dark:border-[#1c2e39] opacity-70'}`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a120e] border border-slate-150 text-[#40826D] flex items-center justify-center text-xl">
                    <i className={reward.icon}></i>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isEligible ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-350' : 'bg-slate-100 dark:bg-[#1e3040] text-slate-500'}`}>
                    {reward.points} Pts Required
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-905 dark:text-white text-[13px] mb-0.5">{reward.partner}</h4>
                <p className="text-xs text-[#40826D] font-extrabold mb-1">{reward.offer}</p>
                <div className="text-[10px] text-slate-450 flex items-center gap-1 mb-4">
                  <i className="ri-map-pin-line"></i> Valid at: {reward.location}
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100/50">
                {isUnlocked ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-dashed border-emerald-300 dark:border-emerald-900 text-center py-2 rounded-lg font-mono text-xs font-bold text-[#40826D]">
                    CODE: {reward.code}
                  </div>
                ) : isEligible ? (
                  <button
                    type="button"
                    onClick={() => handleUnlock(reward.id)}
                    className="w-full py-2 bg-[#40826D] hover:bg-[#326756] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="ri-key-line"></i> Unlock Reward Code
                  </button>
                ) : (
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      <span>Unlock Progress</span>
                      <span>{points} / {reward.points} pts</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#1e3040] rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-[#40826D] h-full rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((points / reward.points) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const Profile = () => {
 const { user, loading } = useAuth();
 const [role, isRoleLoading] = useRole();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();

 const [firebaseForm, setFirebaseForm] = useState({ displayName:"", photoURL:""});
 const [savingFirebase, setSavingFirebase] = useState(false);

 const [dbForm, setDbForm] = useState({ area:"", bio:"", coverPhoto:"", streetAddress:"", apartmentNumber:"", phone:""});
 const [savingDb, setSavingDb] = useState(false);
 const [userData, setUserData] = useState(null);
 
 const [activeTab, setActiveTab] = useState("overview");

 // Fetch volunteer drive events for Civic Resume
 const { data: myEvents } = useQuery({
   queryKey: ['overviewCleanupEvents'],
   queryFn: async () => {
     const res = await axiosSecure.get('/cleanup-events/my');
     return res.data;
   },
   enabled: !!user
 });

 useEffect(() => {
 if (!user) return;

 // Invalidate role cache and membership request status cache on profile view to get fresh values
 queryClient.invalidateQueries({ queryKey: [user?.email,"role"] });
 queryClient.invalidateQueries({ queryKey: ["membershipStatus", user?.email] });

 setFirebaseForm({
 displayName: user.displayName ||"",
 photoURL: user.photoURL ||"",
 });

 const fetchUserData = async () => {
 try {
 const res = await axiosSecure.get("/users/my");
 setUserData(res.data);
 setDbForm({
 area: res.data?.area ||"",
 bio: res.data?.bio ||"",
 coverPhoto: res.data?.coverPhoto ||"",
 streetAddress: res.data?.streetAddress ||"",
 apartmentNumber: res.data?.apartmentNumber ||"",
 phone: res.data?.phone ||"",
 });
 } catch (err) {
 console.error("Failed to load profile", err);
 }
 };
 fetchUserData();
 }, [user, axiosSecure]);

 const handleUnifiedSave = async () => {
 setSavingFirebase(true);
 setSavingDb(true);
 try {
 if (auth.currentUser) {
 await updateProfile(auth.currentUser, {
 displayName: firebaseForm.displayName,
 photoURL: firebaseForm.photoURL,
 });
 }
 
 // Update DB
 await axiosSecure.post("/users", {
 name: firebaseForm.displayName,
 email: user.email,
 photoURL: firebaseForm.photoURL,
 coverPhoto: dbForm.coverPhoto,
 area: dbForm.area,
 bio: dbForm.bio,
 streetAddress: dbForm.streetAddress,
 apartmentNumber: dbForm.apartmentNumber,
 phone: dbForm.phone,
 });

 toast.custom(
 (t) => (
 <div className="max-w-sm w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/90 backdrop-blur-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[2rem] pointer-events-auto flex items-center ring-1 ring-slate-900/5 p-2.5 pr-4"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#9FE2BF] to-[#40826D] flex items-center justify-center shadow-inner">
 <i className="ri-check-double-line text-white text-[13px] tracking-tight shadow-sm"></i>
 </div>
 <div className="ml-4 flex-1">
 <p className="text-[15px] font-extrabold text-slate-800 dark:text-white leading-tight">Profile Saved</p>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-0.5">Your settings have been updated.</p>
 </div>
 <button 
 onClick={() => toast.dismiss(t.id)} 
 className="ml-3 flex-shrink-0 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-400 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] h-8 w-8 flex items-center justify-center rounded-full transition-all focus:outline-none">
 <i className="ri-close-line text-[13px]"></i>
 </button>
 </div>
 ),
 { duration: 4000 }
 );
 } catch (err) {
 toast.custom(
 (t) => (
 <div className="max-w-sm w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/90 backdrop-blur-2xl shadow-[0_20px_50px_-12px_rgba(239,68,68,0.15)] rounded-[2rem] pointer-events-auto flex items-center ring-1 ring-red-500/10 p-2.5 pr-4"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-inner">
 <i className="ri-error-warning-line text-white text-[13px] tracking-tight shadow-sm"></i>
 </div>
 <div className="ml-4 flex-1">
 <p className="text-[15px] font-extrabold text-slate-800 dark:text-white leading-tight">Update Failed</p>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-0.5 line-clamp-1">{err.message}</p>
 </div>
 <button 
 onClick={() => toast.dismiss(t.id)} 
 className="ml-3 flex-shrink-0 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-red-100 text-slate-400 hover:text-red-600 h-8 w-8 flex items-center justify-center rounded-full transition-all focus:outline-none">
 <i className="ri-close-line text-[13px]"></i>
 </button>
 </div>
 ),
 { duration: 5000 }
 );
 } finally {
 setSavingFirebase(false);
 setSavingDb(false);
 }
 };

 const downloadUserReport = () => {
 if (!userData || !user) return;
 const doc = new jsPDF();
 
 // Header
 doc.setFontSize(22);
 doc.setTextColor(15, 118, 110);
 doc.text("CivicNest - User Progress Report", 14, 20);
 
 doc.setFontSize(10);
 doc.setTextColor(100);
 doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
 
 // User Identity Info
 doc.setFontSize(12);
 doc.setTextColor(40);
 doc.text(`Name: ${firebaseForm.displayName ||"N/A"}`, 14, 40);
 doc.text(`Email: ${user.email}`, 14, 47);
 doc.text(`Role: ${role ||"guest"}`, 14, 54);
 if (userData.memberId) {
 doc.text(`Member ID: ${userData.memberId}`, 14, 61);
 }
 
 // Summary Metrics Table
 autoTable(doc, {
 startY: 70,
 head: [['Metric','Value']],
 body: [
 ['Impact Points', userData.points || 0],
 ['Neighborhood / Area', dbForm.area ||'N/A'],
 ['Account Status','Active'],
 ],
 theme:'grid',
 headStyles: { fillColor: [15, 118, 110] }
 });
 
 doc.save(`Progress_Report_${firebaseForm.displayName ||'User'}.pdf`);
 };

  const downloadCivicResume = () => {
    if (!userData || !user) return;
    const doc = new jsPDF();

    // Styling parameters
    const primaryColor = [15, 118, 110]; // Teal
    const secondaryColor = [30, 41, 59]; // Dark Slate
    const lightBg = [248, 250, 252]; // Light grey

    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("CIVIC IMPACT RESUME", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(230, 230, 230);
    doc.text("Official Community Service Record | CivicNest Bangladesh", 14, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.text(`Ref Hash: ${userData._id ? userData._id.slice(-8).toUpperCase() : 'CIVICNEST-1002'}`, 140, 20);
    doc.text(`Verification ID: ${userData._id || 'user-uuid'}`, 140, 28);

    // Applicant Info
    doc.setFillColor(...lightBg);
    doc.rect(14, 48, 182, 32, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.text(firebaseForm.displayName || "CivicNest Citizen", 20, 56);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(`Email: ${user.email}`, 20, 63);
    doc.text(`Area / Neighborhood: ${dbForm.area || "Dhaka, Bangladesh"}`, 20, 70);
    if (userData.memberId) {
      doc.text(`Verified Member ID: ${userData.memberId}`, 110, 56);
    }
    doc.text(`Active Streak: ${userData.streak?.current ?? 0} days`, 110, 63);
    doc.text(`Account Role: ${role || "Guest"}`, 110, 70);

    // Profile Summary
    let y = 92;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text("1. Overall Impact Metrics", 14, y); y += 8;

    // Metrics Table
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Assessment']],
      body: [
        ['Civic Impact Points', userData.points || 0, 'Reflects overall platform contribution and helpfulness'],
        ['Reports Submitted', userData.issuesCount || 0, 'Total cleanliness/infrastructure grievances raised'],
        ['Volunteer Events Registered', userData.volunteerEventCount || 0, 'Cleanliness drives and community efforts attended'],
        ['Verification Actions', userData.verificationCount || 0, 'Assisted in verifying physical problem resolutions'],
      ],
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      margin: { left: 14, right: 14 }
    });

    y = (doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || y + 40) + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text("2. Completed Volunteer Drives & Cleanups", 14, y); y += 8;

    // Attended Events Table
    const cleanupsAttended = myEvents?.attending?.map(e => [
      e.title || 'Cleanup Drive',
      e.eventDate ? new Date(e.eventDate).toLocaleDateString() : 'N/A',
      e.location?.area || 'Dhaka',
      'Completed'
    ]) || [];

    if (cleanupsAttended.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("No official volunteer drive participations recorded yet.", 14, y); y += 8;
    } else {
      autoTable(doc, {
        startY: y,
        head: [['Drive Title', 'Date', 'Area', 'Status']],
        body: cleanupsAttended,
        theme: 'grid',
        headStyles: { fillColor: [70, 70, 70] },
        margin: { left: 14, right: 14 }
      });
      y = (doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || y + 45) + 12;
    }

    // Certification Statement
    doc.setFillColor(...lightBg);
    doc.rect(14, y, 182, 28, 'F');
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    const statement = "This resume compiles digital audit trails of civic contributions made on the CivicNest platform. By engaging in community cleanliness reporting and participating in cleanup drives, the owner of this certificate has verified their active civic leadership.";
    const splitStatement = doc.splitTextToSize(statement, 170);
    doc.text(splitStatement, 20, y + 8);
    
    y += 35;
    
    // Signatures
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text("CivicNest Portal Team", 14, y);
    doc.text("Public Relations Officer", 140, y);
    
    doc.line(14, y - 5, 60, y - 5);
    doc.line(140, y - 5, 190, y - 5);

    doc.save(`Civic_Impact_Resume_${firebaseForm.displayName || 'User'}.pdf`);
    toast.success("Civic Impact Resume PDF generated!");
  };

  const handleLockedResumeClick = () => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, x: 200, scale: 0.95 }}
          animate={{ 
            opacity: t.visible ? 1 : 0, 
            x: t.visible ? 0 : 200, 
            scale: t.visible ? 1 : 0.95 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 70, 
            damping: 15,
            mass: 0.8
          }}
          className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-200 dark:ring-[#14241d]/90 backdrop-blur-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-2xl pointer-events-auto flex items-center p-4 border border-slate-200 dark:border-[#1e3040]/30 max-w-sm"
          style={{ fontFamily: 'HKGrotesk, sans-serif' }}
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center">
            <i className="ri-lock-2-line text-amber-500 text-lg font-bold"></i>
          </div>
          <div className="ml-3">
            <p className="text-[13px] font-extrabold text-slate-800 dark:text-white">Verified Feature Only</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-300 mt-0.5 leading-relaxed">
              Please apply for membership under the Overview tab to unlock and download your Civic Impact Resume!
            </p>
          </div>
        </motion.div>
      ),
      { duration: 4500 }
    );
  };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
 <MinimalLoader />
 </div>
 );
 }

 if (!user) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
 <p className="text-[13px] tracking-tight text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-bold">Please log in to view your dashboard.</p>
 </div>
 );
 }

 const tabs = [
    { id:'overview', label:'Overview', icon:'ri-dashboard-line'},
    { id:'posts', label:'My Reports', icon:'ri-file-list-3-line'},
    { id:'lostfound', label:'My Lost & Found', icon:'ri-search-eye-line'},
    { id:'contributions', label:'My Donations', icon:'ri-hand-coin-line'},
    { id:'cleanup', label:'Cleanup Events', icon:'ri-leaf-line'},
    { id:'bookmarks', label:'Saved Bookmarks', icon:'ri-bookmark-line'},
    { id:'rewards', label:'Civic Rewards', icon:'ri-coupon-3-line'}
  ];

 return (
 <div className="min-h-screen bg-[#F8FAFC] pb-16 font-body">
 {}
 <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-10 pb-2">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-xl border border-slate-100 shadow-sm">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-[#40826D]/10 rounded-lg flex items-center justify-center border border-[#40826D]/20">
 <i className="ri-dashboard-3-line text-[#40826D] text-2xl tracking-tight"></i>
 </div>
 <div>
 <h1 className="text-2xl tracking-tight font-extrabold text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>My Dashboard</h1>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-0.5">Manage your profile, reports, and community contributions.</p>
 </div>
 </div>
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
    {role === 'member' || role === 'admin' ? (
      <button
        onClick={downloadCivicResume}
        className="group flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-[#40826D]/10 border border-[#40826D]/30 text-[#40826D] dark:text-emerald-300 text-[13px] font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all w-full sm:w-auto shrink-0 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow-sm text-slate-500 dark:text-slate-300 flex items-center justify-center group-hover:text-[#40826D] transition-all">
          <i className="ri-file-user-line text-[13px]"></i>
        </div>
        Civic Impact Resume
      </button>
    ) : (
      <button
        onClick={handleLockedResumeClick}
        className="group flex items-center justify-center gap-2 bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[13px] font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all w-full sm:w-auto shrink-0 cursor-pointer hover:border-amber-500/30 hover:text-amber-500 dark:hover:text-amber-400"
      >
        <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow-sm text-slate-400 dark:text-slate-500 flex items-center justify-center group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-all">
          <i className="ri-lock-line text-[13px]"></i>
        </div>
        Civic Impact Resume
      </button>
    )}
 <button
 onClick={downloadUserReport}
 className="group flex items-center justify-center gap-2 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] text-[13px] font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all w-full md:w-auto shrink-0 cursor-pointer">
 <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow-sm text-slate-500 dark:text-slate-300 flex items-center justify-center group-hover:text-[#40826D] transition-all">
 <i className="ri-download-cloud-2-line text-[13px]"></i>
 </div>
 Export Data
 </button>
 </div>
 </div>
 </div>

 <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 flex flex-col lg:flex-row gap-5">
 
 {}
 <div className="lg:w-72 flex-shrink-0">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-100 sticky top-28">
 
 {/* User Mini Profile */}
 <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
 <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex-shrink-0">
 <img src={firebaseForm.photoURL ||"https://i.ibb.co/cS32smV8/shamblen-studios-xw-M61-TPMl-Yk-unsplash.jpg"} className="w-full h-full object-cover"alt="User Avatar"/>
 </div>
 <div className="overflow-hidden">
 <h3 className="font-semibold text-slate-800 dark:text-white text-[13px] truncate tracking-tight">{firebaseForm.displayName ||"Citizen"}</h3>
 <span className="text-[11px] font-semibold text-[#40826D] bg-[#9FE2BF]/20 px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#40826D]/10">{role ||"Guest"}</span>
 </div>
 </div>

 {/* Quick Stats (Retained from premium design) */}
 <div className="grid grid-cols-2 gap-3 mb-8">
 <div className="event-date-shimmer p-3 rounded-lg border border-white/80 flex flex-col items-center justify-center text-center relative overflow-hidden">
 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 z-10">Impact</span>
 <span className="text-2xl tracking-tight font-black text-slate-900 dark:text-white leading-none z-10">{userData?.points || 0}</span>
 </div>
 <div className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
 <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Status</span>
 <div className="mt-1 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200/60 shadow-sm">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
 </span>
 <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
 </div>
 </div>
 </div>

 {/* Navigation Menu */}
 <nav className="flex flex-col gap-2">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2 px-2">Menu</span>
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id ?'bg-[#40826D] text-white shadow-md shadow-[#40826D]/20 translate-x-1 font-semibold':'text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:text-slate-900 dark:text-white hover:shadow-sm'}`}
 >
 <i className={`${tab.icon} text-[13px] tracking-tight ${activeTab === tab.id ?'text-white':'text-slate-500 dark:text-slate-300'}`}></i>
 {tab.label}
 </button>
 ))}
 </nav>
 
 </div>
 </div>

 {}
 <div className="flex-grow min-w-0 min-h-[600px] relative">
 <AnimatePresence mode="wait">
 {activeTab ==='overview'&& (
 <OverviewTab 
 key="overview"user={user}
 role={role}
 isRoleLoading={isRoleLoading}
 userData={userData}
 firebaseForm={firebaseForm}
 setFirebaseForm={setFirebaseForm}
 dbForm={dbForm}
 setDbForm={setDbForm}
 handleUnifiedSave={handleUnifiedSave}
 savingFirebase={savingFirebase}
 savingDb={savingDb}
 axiosSecure={axiosSecure}
 myEvents={myEvents}
 />
 )}
 {activeTab ==='posts'&& (
 <motion.div 
 key="posts"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-100">
 <MyIssues />
 </motion.div>
 )}
 {activeTab ==='contributions'&& (
 <motion.div 
 key="contributions"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-100">
 <MyContributions />
 </motion.div>
 )}
 {activeTab ==='lostfound'&& (
 <motion.div 
 key="lostfound"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-100">
 <MyLostFound />
 </motion.div>
 )}
 {activeTab ==='cleanup'&& (
 <motion.div 
 key="cleanup"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-100">
 <MyOrganizedEvents />
 </motion.div>
 )}
 {activeTab ==='bookmarks'&& (
 <BookmarksTab axiosSecure={axiosSecure} user={user} />
 )}
 {activeTab ==='rewards'&& (
 <RewardsTab userData={userData} />
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
};

export default Profile;
