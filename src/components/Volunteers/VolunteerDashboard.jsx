import React, { useState } from"react";
import { useNavigate } from"react-router";
import { motion, AnimatePresence } from"framer-motion";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { useAuth } from"../../hooks/useAuth";
import toast from"react-hot-toast";
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton.jsx';
import CommunityVerifyFeed from"../Issues/CommunityVerifyFeed";

const VERIFICATION_METHODS = [
 { id:'photo', label:'Photo Upload', icon:'ri-camera-line', description:'Upload a photo of your participation'},
 { id:'geolocation', label:'GPS Check-in', icon:'ri-map-pin-line', description:'Verify your location at the event'},
 { id:'organizer', label:'Organizer Approval', icon:'ri-user-star-line', description:'Get verified by event organizer'},
];

const ACHIEVEMENTS = [
 { id:'first_event', title:'First Step', description:'Complete your first event', points: 50, icon:'ri-flag-line', unlocked: true },
 { id:'five_events', title:'Dedicated', description:'Complete 5 events', points: 100, icon:'ri-medal-line', unlocked: false },
 { id:'ten_events', title:'Champion', description:'Complete 10 events', points: 200, icon:'ri-trophy-line', unlocked: false },
 { id:'twenty_events', title:'Legend', description:'Complete 20 events', points: 500, icon:'ri-vip-crown-line', unlocked: false },
];

const LEVEL_THEMES = {
 Bronze: {
 bg:"theme-card-bronze"},
 Silver: {
 bg:"theme-card-silver"},
 Gold: {
 bg:"theme-card-gold"},
 Platinum: {
 bg:"theme-card-platinum"}
};

function CheckInCard({ event }) {
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const [code, setCode] = useState('');
 const [loading, setLoading] = useState(false);

 const handleCheckIn = async () => {
 if (code.length !== 6) return toast.error('Enter the 6-digit code from the organizer.');
 setLoading(true);
 
 const performCheckIn = async (coords) => {
 try {
 const res = await axiosSecure.post(`/cleanup-events/${event._id}/checkin`, {
 otp: code,
 coordinates: coords
 });
 toast.success(res.data.message);
 queryClient.invalidateQueries({ queryKey: ['myEvents'] });
 queryClient.invalidateQueries({ queryKey: ['volunteerStats'] });
 } catch (err) {
 toast.error(err.response?.data?.message ||'Check-in failed.');
 } finally {
 setLoading(false);
 }
 };

 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 (pos) => {
 performCheckIn({ lat: pos.coords.latitude, lng: pos.coords.longitude });
 },
 () => {
 // No GPS permission or error — check in with OTP alone
 performCheckIn(null);
 },
 { enableHighAccuracy: true, timeout: 5000 }
 );
 } else {
 performCheckIn(null);
 }
 };

 return (
 <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl justify-between shadow-sm">
 <div className="flex-grow w-full text-left">
 <p className="text-[13px] font-semibold text-slate-900 dark:text-white line-clamp-1">{event.title}</p>
 <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">{new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}</p>
 </div>
 <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
 <input
 value={code}
 onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0, 6))}
 placeholder="6-digit code"className="w-28 px-3 py-2 text-[13px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl text-center font-mono tracking-widest focus:outline-none focus:border-teal-500 text-slate-800 dark:text-white"/>
 <button
 onClick={handleCheckIn}
 disabled={loading || code.length !== 6}
 className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap active:scale-95">
 {loading ?'...':'Check In'}
 </button>
 </div>
 </div>
 );
}

export default function VolunteerDashboard() {
 const { user } = useAuth();
 const navigate = useNavigate();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const [activeTab, setActiveTab] = useState('overview');
 const [selectedEvent, setSelectedEvent] = useState(null);
 const [showVerification, setShowVerification] = useState(false);
 const [selectedMethod, setSelectedMethod] = useState(null);

 const { data: myEventsData } = useQuery({
 queryKey: ['myEvents', user?.email],
 queryFn: () => axiosSecure.get('/cleanup-events/my').then(r => r.data),
 enabled: !!user?.email,
 });

 const attendingEvents = myEventsData?.attending || [];
 const notCheckedIn = attendingEvents.filter(e =>
 e.status !=='completed'&& e.status !=='cancelled'&&
 e.going?.some(a => a.email.toLowerCase() === user?.email?.toLowerCase() && !a.checkedIn)
 );

 const { data: volunteerData, isLoading: statsLoading } = useQuery({
 queryKey: ["volunteerStats", user?.email],
 enabled: !!user?.email,
 queryFn: () => axiosSecure.get("/volunteers/stats").then((r) => r.data),
 });

 const stats = volunteerData || {};
 const history = volunteerData?.history || [];
 const theme = LEVEL_THEMES[stats.currentLevel] || LEVEL_THEMES.Bronze;

 const dynamicAchievements = [
 { id:'official_volunteer', title:'Community Volunteer', description:'Approved volunteer force member', points: 0, icon:'ri-heart-3-fill', unlocked: true },
 { id:'first_event', title:'First Step', description:'Complete your first event', points: 50, icon:'ri-flag-line', unlocked: ((stats.totalEvents || 0) >= 1) },
 { id:'five_events', title:'Dedicated', description:'Complete 5 events', points: 100, icon:'ri-medal-line', unlocked: ((stats.totalEvents || 0) >= 5) },
 { id:'ten_events', title:'Champion', description:'Complete 10 events', points: 200, icon:'ri-trophy-line', unlocked: ((stats.totalEvents || 0) >= 10) },
 { id:'twenty_events', title:'Legend', description:'Complete 20 events', points: 500, icon:'ri-vip-crown-line', unlocked: ((stats.totalEvents || 0) >= 20) },
 ];

 const verifyMutation = useMutation({
 mutationFn: ({ eventId, method }) =>
 axiosSecure.post("/volunteers/verify", {
 eventId,
 method,
 }),

 onSuccess: () => {
 toast.success("Verification submitted! Waiting for organizer.");

 setShowVerification(false);
 setSelectedMethod(null);

 queryClient.invalidateQueries({
 queryKey: ["volunteerStats"],
 });

 queryClient.invalidateQueries({
 queryKey: ["volunteerHistory"],
 });
 },

 onError: () => {
 toast.error("Verification failed. Try again.");
 },
 });

 if (statsLoading) {
 return (
 <div className="min-h-screen pt-28 pb-20 px-[5%] flex items-center justify-center">
 <MinimalLoader />
 </div>
 );
 }

 return (
 <div className="min-h-screen">
 {/* Header Banner */}
 <div className="relative pt-28 pb-12 px-[5%] bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 overflow-hidden">
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full blur-3xl"></div>
 <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
 </div>

 <div className="relative z-10 max-w-7xl mx-auto">
 <div className="mb-4">
 <BackButton variant="light"/>
 </div>

 <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
 <div className="text-white">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 text-emerald-300">
 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
 <span className="text-[13px] font-bold uppercase tracking-wider">Volunteer Portal</span>
 </div>
 <h1 className="font-heading text-4xl tracking-tight md:text-5xl tracking-tight font-extrabold mb-4 leading-tight tracking-tight">
 My Volunteer Journey
 </h1>
 <p className="font-body text-white/80 text-[13px] max-w-2xl">
 Track your contributions, verify your participation, and earn
 points for making a difference.
 </p>
 </div>

 <div className="flex items-center gap-4">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
 <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
 Total Points
 </p>
 <p className="text-3xl tracking-tight font-bold text-white">
 {stats.totalPoints}
 </p>
 </div>
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
 <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
 Level
 </p>
 <p className="text-3xl tracking-tight font-bold text-white">
 {stats.currentLevel}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="px-[5%] py-8">
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
 <i className="ri-time-line text-teal-600 text-[13px] tracking-tight"></i>
 </div>
 <p className="text-slate-500 dark:text-slate-300 text-[13px]">Total Hours</p>
 </div>
 <p className="text-3xl tracking-tight font-bold text-slate-800 dark:text-white">
 {stats.totalHours}h
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
 <i className="ri-calendar-check-line text-emerald-600 text-[13px] tracking-tight"></i>
 </div>
 <p className="text-slate-500 dark:text-slate-300 text-[13px]">Events Completed</p>
 </div>
 <p className="text-3xl tracking-tight font-bold text-slate-800 dark:text-white">
 {stats.totalEvents}
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
 <i className="ri-star-line text-amber-600 text-[13px] tracking-tight"></i>
 </div>
 <p className="text-slate-500 dark:text-slate-300 text-[13px]">Total Points</p>
 </div>
 <p className="text-3xl tracking-tight font-bold text-slate-800 dark:text-white">
 {stats.totalPoints}
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
 <i className="ri-history-line text-purple-600 text-[13px] tracking-tight"></i>
 </div>
 <p className="text-slate-500 dark:text-slate-300 text-[13px]">Pending Verifications</p>
 </div>
 <p className="text-3xl tracking-tight font-bold text-slate-800 dark:text-white">
 {stats.pendingVerifications}
 </p>
 </motion.div>
 </div>

 {/* Tabs */}
 <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 {["overview","history","achievements"].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-6 py-3 font-semibold capitalize transition-all relative ${
 activeTab === tab
 ?"text-teal-600":"text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]"}`}
 >
 {tab}
 {activeTab === tab && (
 <motion.div
 layoutId="activeTab"className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"/>
 )}
 </button>
 ))}
 </div>

 <AnimatePresence mode="wait">
 {activeTab ==="overview"&& (
 <motion.div
 key="overview"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 {/* Progress to next level & Check-in Panel */}
 <div className="lg:col-span-2 space-y-6">
 {/* Active Events Check-in Panel */}
 {notCheckedIn.length > 0 && (
 <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 shadow-sm">
 <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2 tracking-tight"style={{ fontFamily:'HKGrotesk'}}>
 <i className="ri-calendar-check-line text-[13px]"></i>
 🗓 Active Events — Check In
 </h3>
 <div className="space-y-3">
 {notCheckedIn.map(event => (
 <CheckInCard key={event._id} event={event} />
 ))}
 </div>
 </div>
 )}

 <div className={`${theme.bg} rounded-lg p-4 shadow-sm relative overflow-hidden`}>
 {/* Decorative elements */}
 <div className="absolute -top-12 -right-12 w-40 h-40 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/15 rounded-full blur-2xl"></div>
 <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
 
 <h3 className="font-heading text-[13px] tracking-tight font-black mb-4 tracking-tight relative z-10"style={{ fontFamily:'HKGrotesk'}}>
 Progress to {stats.nextLevel}
 </h3>
 <div className="mb-4 relative z-10">
 <div className="flex justify-between text-[13px] mb-2 font-semibold">
 <span style={{ color:'var(--theme-subtext, rgba(255, 255, 255, 0.85))'}}>
 Current: {stats.currentLevel}
 </span>
 <span style={{ color:'var(--theme-subtext, rgba(255, 255, 255, 0.85))'}}>
 {stats.pointsToNextLevel} points to {stats.nextLevel}
 </span>
 </div>
 <div className="h-3 rounded-full overflow-hidden border border-white/5"style={{ backgroundColor:'var(--theme-progress-bg, rgba(255, 255, 255, 0.2))'}}>
 <motion.div
 initial={{ width: 0 }}
 animate={{
 width:`${Math.min(100, Math.max(0, (stats.totalPoints / Math.max(1, stats.totalPoints + stats.pointsToNextLevel)) * 100))}%`,
 }}
 className="h-full rounded-full shadow-inner"style={{ backgroundColor:'var(--theme-progress-bar, #ffffff)'}}
 />
 </div>
 </div>
 <p className="text-[13px] leading-relaxed relative z-10"style={{ color:'var(--theme-subtext, rgba(255, 255, 255, 0.85))'}}>
 Keep participating in events to level up and unlock
 exclusive benefits!
 </p>
 </div>
 </div>

 {/* Quick Actions & Verify Feed */}
 <div className="space-y-6">
 {/* Quick Actions */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <h3 className="font-heading text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-4 tracking-tight">
 Quick Actions
 </h3>
 <div className="space-y-3">
 <button 
 onClick={() => navigate('/volunteers')}
 className="w-full flex items-center gap-3 p-3 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors text-left cursor-pointer">
 <i className="ri-add-circle-line text-teal-600 text-[13px] tracking-tight"></i>
 <span className="font-semibold text-teal-700">
 Find Events
 </span>
 </button>
 <button 
 onClick={() => setActiveTab('achievements')}
 className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left cursor-pointer">
 <i className="ri-award-line text-emerald-600 text-[13px] tracking-tight"></i>
 <span className="font-semibold text-emerald-700">
 View Achievements
 </span>
 </button>
 <button 
 onClick={() => navigate('/leaderboard')}
 className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-left cursor-pointer">
 <i className="ri-leaderboard-line text-amber-600 text-[13px] tracking-tight"></i>
 <span className="font-semibold text-amber-700">
 Leaderboard
 </span>
 </button>
 </div>
 </div>

 {/* Community Verify Feed Widget */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <h3 className="font-heading text-[13px] font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 tracking-tight"style={{ fontFamily:'HKGrotesk'}}>
 <i className="ri-shield-check-line text-teal-600"></i>
 Needs Verification
 </h3>
 <CommunityVerifyFeed />
 </div>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab ==="history"&& (
 <motion.div
 key="history"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm overflow-hidden">
 <div className="p-4 border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <h3 className="font-heading text-[13px] tracking-tight font-bold text-slate-800 dark:text-white tracking-tight">
 Participation History
 </h3>
 </div>

 {history.length === 0 ? (
 <div className="p-12 text-center">
 <i className="ri-inbox-line text-6xl text-slate-300 mb-4 block"></i>
 <p className="text-slate-500 dark:text-slate-300">
 No participation history yet
 </p>
 </div>
 ) : (
 <div className="divide-y divide-slate-100">
 {history.map((event, index) => (
 <motion.div
 key={event._id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.05 }}
 className="p-4 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1">
 <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
 {event.title}
 </h4>
 <div className="flex items-center gap-4 text-[13px] text-slate-500 dark:text-slate-300">
 <span className="flex items-center gap-1">
 <i className="ri-calendar-line"></i>
 {event.date}
 </span>
 <span className="flex items-center gap-1">
 <i className="ri-time-line"></i>
 {event.hours}h
 </span>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <div className="text-right">
 <p className="font-bold text-teal-600">
 +{event.points} pts
 </p>
 <span
 className={`text-xs px-2 py-1 rounded-full ${
 event.status ==="verified"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}
 >
 {event.status ==="verified"?"✓ Verified":"⏳ Pending"}
 </span>
 </div>

 {event.status ==="pending"&& (
 <button
 onClick={() => {
 setSelectedEvent(event);
 setShowVerification(true);
 }}
 className="px-4 py-2 bg-teal-600 text-white text-[13px] font-semibold rounded-lg hover:bg-teal-700 transition-colors">
 Verify
 </button>
 )}
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 )}

 {activeTab ==="achievements"&& (
 <motion.div
 key="achievements"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {dynamicAchievements.map((achievement, index) => (
 <motion.div
 key={achievement.id}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: index * 0.1 }}
 className={`bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border ${
 achievement.unlocked
 ?"border-amber-200 shadow-sm":"border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] opacity-60"}`}
 >
 <div className="flex items-start gap-4">
 <div
 className={`w-12 h-12 rounded-xl flex items-center justify-center ${
 achievement.unlocked
 ?"bg-amber-100":"bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]"}`}
 >
 <i
 className={`${achievement.icon} text-2xl tracking-tight ${
 achievement.unlocked
 ?"text-amber-600":"text-slate-400"}`}
 ></i>
 </div>
 <div className="flex-1">
 <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
 {achievement.title}
 </h4>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 mb-2">
 {achievement.description}
 </p>
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-amber-600">
 +{achievement.points} pts
 </span>
 {achievement.unlocked && (
 <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
 Unlocked
 </span>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>

 {/* Verification Modal */}
 <AnimatePresence>
 {showVerification && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"onClick={() => setShowVerification(false)}
 >
 <motion.div
 initial={{ scale: 0.9, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.9, y: 20 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-5 max-w-2xl w-full"onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-center justify-between mb-6">
 <h3 className="font-heading text-2xl tracking-tight font-bold text-slate-800 dark:text-white tracking-tight">
 Verify Participation
 </h3>
 <button
 onClick={() => setShowVerification(false)}
 className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 flex items-center justify-center transition-colors">
 <i className="ri-close-line text-slate-600 dark:text-slate-300"></i>
 </button>
 </div>

 {selectedEvent && (
 <div className="mb-6 p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl">
 <p className="font-semibold text-slate-800 dark:text-white">
 {selectedEvent.title}
 </p>
 <p className="text-[13px] text-slate-500 dark:text-slate-300">{selectedEvent.date}</p>
 </div>
 )}

 {!selectedMethod ? (
 <div className="space-y-4">
 <p className="text-slate-600 dark:text-slate-300 mb-4">
 Choose a verification method:
 </p>
 {VERIFICATION_METHODS.map((method) => (
 <motion.button
 key={method.id}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => setSelectedMethod(method.id)}
 className="w-full p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
 <i
 className={`${method.icon} text-2xl tracking-tight text-teal-600`}
 ></i>
 </div>
 <div>
 <h4 className="font-semibold text-slate-800 dark:text-white">
 {method.label}
 </h4>
 <p className="text-[13px] text-slate-500 dark:text-slate-300">
 {method.description}
 </p>
 </div>
 </div>
 </motion.button>
 ))}
 </div>
 ) : (
 <div className="space-y-6">
 {selectedMethod ==="photo"&& (
 <div>
 <label className="block text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">
 Upload Photo
 </label>
 <div className="border-2 border-dashed border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-5 text-center hover:border-teal-500 transition-colors cursor-pointer">
 <i className="ri-upload-cloud-line text-4xl tracking-tight text-slate-400 mb-2 block"></i>
 <p className="text-slate-600 dark:text-slate-300">
 Click to upload or drag and drop
 </p>
 <p className="text-xs text-slate-400 mt-1">
 PNG, JPG up to 10MB
 </p>
 </div>
 </div>
 )}

 {selectedMethod ==="geolocation"&& (
 <div>
 <label className="block text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">
 Location Verification
 </label>
 <div className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl p-4 text-center">
 <i className="ri-map-pin-line text-4xl tracking-tight text-teal-600 mb-2 block"></i>
 <p className="text-slate-600 dark:text-slate-300 mb-4">
 Enable GPS to verify your location
 </p>
 <button className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors">
 <i className="ri-gps-line mr-2"></i>
 Check In
 </button>
 </div>
 </div>
 )}

 {selectedMethod ==="organizer"&& (
 <div>
 <label className="block text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">
 Request Organizer Approval
 </label>
 <div className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl p-4 text-center">
 <i className="ri-user-star-line text-4xl tracking-tight text-amber-600 mb-2 block"></i>
 <p className="text-slate-600 dark:text-slate-300 mb-4">
 The event organizer will verify your participation
 </p>
 <button className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors">
 <i className="ri-send-line mr-2"></i>
 Send Request
 </button>
 </div>
 </div>
 )}

 <div className="flex gap-3 pt-4">
 <button
 onClick={() => setSelectedMethod(null)}
 className="flex-1 px-6 py-3 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors">
 Back
 </button>
 <button
 onClick={() =>
 verifyMutation.mutate({
 eventId: selectedEvent._id,
 method: selectedMethod,
 })
 }
 disabled={verifyMutation.isPending}
 className="flex-1 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors">
 {verifyMutation.isPending
 ?"Submitting...":"Submit Verification"}
 </button>
 </div>
 </div>
 )}
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}