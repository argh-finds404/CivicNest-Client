

// e.preventDefault();
// .filter((checkbox) => checkbox.checked)
// .map((checkbox) => checkbox.value);

// skills,
// availability: form.availability.value,
// toast.success("Successfully registered as a volunteer!");
// setIsRegistering(false);
// checkStatus();
// } catch (err) {
// toast.error("Failed to register");

// Offer your skills to the community or join an upcoming drive.

 
// {isVolunteer ? (
// ) : isRegistering ? (
// {['Medical','Plumbing','Electrical','Driving','Teaching','General Labor'].map(skill => (
// ) : (

 
// {drivesLoading ? (
// ) : drives.length > 0 ? (
// {drives.map(drive => (
// key={drive._id}
// event={drive}
// userInterested={drive.interested?.includes(user?.email)}
// userGoing={drive.going?.some(a => a.email === user?.email)}
// onInterested={() => {}} 
// onGoing={() => {}}
// />
// ) : (

// src/components/Volunteers/VolunteerHub.jsx
import { useState, useEffect } from"react";
import SEO from "../common/SEO";
import { Link } from"react-router";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import { motion, AnimatePresence } from"framer-motion";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import { useAuth } from"../../hooks/useAuth";
import toast from"react-hot-toast";
import PremiumEventCard from"../cards/PremiumEventCard.jsx";
import MinimalLoader from"../common/MinimalLoader.jsx";
import OpportunityCard from"./OpportunityCard.jsx";
import { useRole } from "../../hooks/useRole";

import VolunteerDirectoryCard from "./VolunteerDirectoryCard.jsx";
import BackButton from "../common/BackButton";
import { Sprout, CheckCircle, Users } from "lucide-react";

const TABS = [
 { key:"drives", label:"Upcoming Drives", icon:"ri-calendar-event-line"},
 { key:"opportunities", label:"Open Opportunities", icon:"ri-flashlight-line"},
 { key:"directory", label:"Volunteer Directory",icon:"ri-group-line"},
];

export default function VolunteerHub() {
 const { user } = useAuth();
 const [role] = useRole();
 const axiosSecure = useAxiosSecure();
 const axiosPublic = useAxiosPublic();
 const queryClient = useQueryClient();
 const [tab, setTab] = useState("drives");
 const [areaFilter, setAreaFilter] = useState("");
 const [skillFilter, setSkillFilter] = useState("");

 const { data: eventsData, isLoading: eventsLoading } = useQuery({
 queryKey: ["volunteerDrives", areaFilter],
 queryFn: () =>
 axiosPublic.get("/cleanup-events", {
 params: { upcoming: true, limit: 6, area: areaFilter || undefined },
 }).then(r => r.data),
 staleTime: 5 * 60 * 1000,
 });

 const { data: oppsData, isLoading: oppsLoading } = useQuery({
 queryKey: ["volunteerOpportunities", areaFilter, skillFilter],
 enabled: tab ==="opportunities",
 queryFn: () =>
 axiosSecure.get("/volunteers/opportunities", {
 params: { area: areaFilter || undefined, skill: skillFilter || undefined },
 }).then(r => r.data),
 staleTime: 5 * 60 * 1000,
 });

 const { data: directoryData, isLoading: directoryLoading } = useQuery({
 queryKey: ["volunteerDirectory", areaFilter, skillFilter],
 enabled: tab ==="directory",
 queryFn: () =>
 axiosPublic.get("/volunteers", {
 params: { area: areaFilter || undefined, skill: skillFilter || undefined },
 }).then(r => r.data),
 staleTime: 5 * 60 * 1000,
 });

 const { data: statusData } = useQuery({
 queryKey: ["volunteerStatus", user?.email],
 enabled: !!user?.email,
 queryFn: () => axiosSecure.get("/volunteers/status").then(r => r.data),
 staleTime: 5 * 60 * 1000,
 });
 const isVolunteer = statusData?.volunteer?.approvalStatus ==="approved";
 const isPendingVolunteer = statusData?.volunteer?.approvalStatus ==="pending";
 const isMember = role ==="member"|| role ==="admin";

 // Redirect to drives if trying to access directory without being volunteer or pending volunteer
 useEffect(() => {
 if (tab ==="directory"&& statusData && !isVolunteer && !isPendingVolunteer) {
 setTab("drives");
 }
 }, [tab, statusData, isVolunteer, isPendingVolunteer]);

 const visibleTabs = TABS.filter(t => {
 if (t.key ==="directory") {
 return isVolunteer || isPendingVolunteer;
 }
 return true;
 });

 const interestedMutation = useMutation({
 mutationFn: (id) => axiosSecure.post(`/cleanup-events/${id}/interested`),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["volunteerDrives"] });
 toast.success("Interest updated!");
 },
 onError: () => toast.error("Please log in to mark interest."),
 });

 const goingMutation = useMutation({
 mutationFn: (id) => axiosSecure.post(`/cleanup-events/${id}/going`),
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ["volunteerDrives"] });
 toast.success(data.data.going ?"You're going! 🎉":"RSVP removed.");
 },
 onError: (err) => {
 const msg = err.response?.data?.message ||"Could not update RSVP.";
 toast.error(msg);
 },
 });

 const drives = eventsData?.events || [];
 const opps = oppsData?.opportunities || [];

 return (
 <div className="min-h-screen dark:bg-[#0b1215]">
 <SEO title="Volunteer Opportunities" />

 {}
 <div className="relative bg-gradient-to-br from-teal-900 to-emerald-900 pt-32 pb-24 px-[5%] overflow-hidden">
 {/* Mesh Gradient Background */}
 <div className="absolute inset-0 opacity-40 mix-blend-color-dodge">
 <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] bg-teal-500 rounded-full blur-[120px]"/>
 <div className="absolute top-[30%] -right-[10%] w-[60%] h-[100%] bg-emerald-500 rounded-full blur-[140px]"/>
 <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[60%] bg-lime-500 rounded-full blur-[130px]"/>
 </div>

 {/* Decorative Grid */}
 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
 <div className="absolute inset-0 border-white/5 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

 <div className="relative max-w-7xl mx-auto z-10 flex flex-col lg:flex-row items-center gap-12">
 
 {/* Text Content */}
 <div className="flex-1 text-center lg:text-left">
  <div className="mb-6 flex justify-center lg:justify-start">
    <BackButton variant="light" className="" />
  </div>
  
  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-300">
      {isMember ? (
        <>
          <i className="ri-shield-check-fill text-[13px] text-emerald-400"/>
          Verified Community Member
        </>
      ) : (
        <>
          <i className="ri-shield-star-fill text-[13px] animate-pulse"/>
          Members-Only Volunteer Program
        </>
      )}
    </motion.div>
  </div>
 
 <motion.h1 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="text-5xl tracking-tight md:text-7xl font-black text-white leading-tight mb-6 font-heading">
 {isMember ? (
 <>
 Let's Clean <br className="hidden lg:block"/>
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-lime-300">
 Together
 </span>
 </>
 ) : (
 <>
 Step Up For <br className="hidden lg:block"/>
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-lime-300">
 Your Community
 </span>
 </>
 )}
 </motion.h1>

 <motion.p 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="text-[13px] md:text-[13px] tracking-tight text-white/80 max-w-2xl mx-auto lg:mx-0 mb-6 leading-relaxed">
 {isMember ? ("Welcome back! You have verified member access. Join upcoming drives, help resolve issues, and earn double points for your contributions.") : ("Only verified members can join the volunteer force. Organize drives, help resolve issues, and earn double points for your contributions!")}
 </motion.p>

 {/* Catchy 2x Points badge */}
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.25 }}
 className="inline-flex items-center gap-3 px-5 py-2.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-300 text-[13px] font-bold mb-8 backdrop-blur-sm">
 <i className="ri-flashlight-fill text-[13px] tracking-tight text-amber-400 animate-pulse"/>
 <span>Volunteers receive <strong className="text-amber-200 underline decoration-amber-400 font-extrabold text-[13px]">2x Points Multiplier</strong> for all cleanup activities!</span>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
 {!user ? (
 <Link to="/login"className="px-8 py-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-teal-900 font-extrabold rounded-lg hover:scale-105 transition-transform shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
 Log In to Participate
 </Link>
 ) : role !=="member"&& role !=="admin"? (
 <div className="flex flex-col sm:flex-row items-center gap-4">
 <Link to="/membership/request"className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-lg hover:scale-105 transition-transform shadow-[0_8px_30px_rgb(245,158,11,0.3)] flex items-center gap-2">
 <i className="ri-shield-star-line text-[13px] tracking-tight"/> Apply for Membership
 </Link>
 <span className="text-white/60 text-[13px] font-medium">
 (Required to volunteer)
 </span>
 </div>
 ) : isVolunteer ? (
 <Link to="/volunteer-dashboard"className="px-8 py-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-teal-800 font-extrabold rounded-lg hover:scale-105 transition-transform shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2">
 <i className="ri-dashboard-fill text-[13px] tracking-tight"/> My Dashboard
 </Link>
 ) : isPendingVolunteer ? (
 <div className="flex flex-col sm:flex-row items-center gap-4">
 <div className="px-8 py-4 bg-amber-500/10 border border-amber-300/30 text-amber-300 font-extrabold rounded-lg flex items-center gap-2 shadow-sm backdrop-blur-md">
 <i className="ri-time-line text-[13px] tracking-tight animate-pulse"/> Volunteer Registration Pending
 </div>
 </div>
 ) : (
 <Link to="/volunteers/register"className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold rounded-lg hover:scale-105 transition-transform shadow-[0_8px_30px_rgb(16,185,129,0.3)] flex items-center gap-2">
 <i className="ri-user-add-line text-[13px] tracking-tight"/> Join as Volunteer
 </Link>
 )}
 </motion.div>
 </div>

 {/* Decorative Visual element */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.2 }}
 className="hidden lg:block relative w-96 h-96">
 <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"/>
 <div className="absolute inset-4 bg-white/5 dark:bg-emerald-950/20 border border-white/15 rounded-full backdrop-blur-md flex items-center justify-center shadow-2xl shadow-emerald-950/20">
 <div className="grid grid-cols-2 gap-4">
 <div className="w-24 h-24 bg-white/10 dark:bg-emerald-900/20 border border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 backdrop-blur-lg hover:scale-105 transition-all duration-300 shadow-md shadow-black/10">
 <i className="ri-plant-line text-3xl tracking-tight text-emerald-400"/>
 <span className="text-white/90 text-xs font-bold">Drives</span>
 </div>
 <div className="w-24 h-24 bg-white/10 dark:bg-emerald-900/20 border border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 backdrop-blur-lg hover:scale-105 transition-all duration-300 shadow-md shadow-black/10 translate-y-8">
 <i className="ri-group-line text-3xl tracking-tight text-teal-400"/>
 <span className="text-white/90 text-xs font-bold">Network</span>
 </div>
 <div className="w-24 h-24 bg-white/10 dark:bg-emerald-900/20 border border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 backdrop-blur-lg hover:scale-105 transition-all duration-300 shadow-md shadow-black/10 -translate-y-4">
 <i className="ri-tools-line text-3xl tracking-tight text-amber-400"/>
 <span className="text-white/90 text-xs font-bold">Skills</span>
 </div>
 <div className="w-24 h-24 bg-white/10 dark:bg-emerald-900/20 border border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 backdrop-blur-lg hover:scale-105 transition-all duration-300 shadow-md shadow-black/10 translate-y-4">
 <i className="ri-award-line text-3xl tracking-tight text-purple-400"/>
 <span className="text-white/80 text-xs font-bold">Points</span>
 </div>
 </div>
 </div>
 </motion.div>

 </div>
 </div>

 {}
 <div className="sticky top-0 z-20 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-b border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="max-w-7xl mx-auto px-[5%]">
 <div className="flex items-center justify-between gap-4 py-3 overflow-x-auto">

 {/* Tabs */}
 <div className="flex bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] p-1.5 rounded-lg gap-1 flex-shrink-0 relative border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40 select-none">
 {visibleTabs.map(t => {
 const isActive = tab === t.key;
 return (
 <button 
 key={t.key} 
 onClick={() => setTab(t.key)}
 className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 whitespace-nowrap z-10 cursor-pointer select-none
 ${isActive
 ?"text-white":"text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"}`}
 >
 {isActive && (
 <motion.div
 layoutId="activeVolunteerTab"className="absolute inset-0 bg-teal-600 rounded-xl shadow-sm z-0"transition={{ type:'spring', stiffness: 380, damping: 30 }}
 />
 )}
 <span className="relative z-20 flex items-center gap-2">
 <i className={t.icon} />
 {t.label}
 </span>
 </button>
 );
 })}
 </div>

 {/* Filters */}
 <div className="flex gap-2 flex-shrink-0">
 <input
 value={areaFilter}
 onChange={e => setAreaFilter(e.target.value)}
 placeholder="Filter by area..."className="px-3 py-1.5 text-[13px] border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:outline-none focus:border-teal-500 w-36 text-gray-800 dark:text-white"/>
 {tab !=="drives"&& (
 <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
 style={{ fontFamily:"'Outfit', sans-serif"}}
 className="px-4 py-2 text-[13px] font-semibold border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:outline-none focus:border-teal-500 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] shadow-sm cursor-pointer hover:border-teal-500 transition-all">
 <option value="">All skills</option>
 {["Medical","Plumbing","Electrical","Driving","Teaching","General Cleanup","Animal Care"].map(s => (
 <option key={s} value={s}>{s}</option>
 ))}
 </select>
 )}
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="max-w-7xl mx-auto px-[5%] py-8">
 <AnimatePresence mode="wait">

 {/* TAB 1: Upcoming Drives */}
 {tab ==="drives"&& (
 <motion.div key="drives"initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-2xl tracking-tight font-bold text-gray-900 dark:text-white tracking-tight font-heading">
 Upcoming Drives
 </h2>
 <Link to="/cleanup-events/organize"className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-semibold rounded-xl transition-colors">
 + Organize a Drive
 </Link>
 </div>

 {eventsLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
 </div>
 ) : drives.length === 0 ? (
 <EmptyState icon={Sprout} title="No upcoming drives" description="Be the first to organize one in your area." />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {drives.map(event => (
 <PremiumEventCard
 key={event._id}
 event={event}
 currentUser={user}
 userInterested={event.interested?.includes(user?.email)}
 userGoing={event.going?.some(a => a.email === user?.email)}
 onInterested={(id) => interestedMutation.mutate(id)}
 onGoing={(id) => {
 if (!user) {
 toast.error("Please log in to volunteer.");
 return;
 }
 if (!isMember) {
 toast.error("Only verified members can volunteer for drives.");
 return;
 }
 if (!isVolunteer) {
 toast.error("Please join the volunteer force first.");
 return;
 }
 goingMutation.mutate(id);
 }}
 />
 ))}
 </div>
 )}

 <div className="mt-8 text-center">
 <Link to="/cleanup-events"className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl text-gray-600 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition-all font-semibold text-[13px]">
 View All Events →
 </Link>
 </div>
 </motion.div>
 )}

 {/* TAB 2: Open Opportunities */}
 {tab ==="opportunities"&& (
 <motion.div key="opps"initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <div className="mb-6">
 <h2 className="text-2xl tracking-tight font-bold text-gray-900 dark:text-white mb-1 tracking-tight font-heading">
 Open Opportunities
 </h2>
 <p className="text-[13px] text-gray-500 dark:text-slate-300">
 Cleanup events, feeding drives, and issues that need volunteer help right now.
 </p>
 </div>

 {oppsLoading ? (
 <div className="space-y-4">
 {[1, 2, 3].map(i => <ListSkeleton key={i} />)}
 </div>
 ) : opps.length === 0 ? (
 <EmptyState icon={CheckCircle} title="All clear!" description="No open tasks match your filters right now." />
 ) : (
 <div className="space-y-4">
 {opps.map(opp => (
 <OpportunityCard key={`${opp.type}-${opp._id}`} opportunity={opp} />
 ))}
 </div>
 )}
 </motion.div>
 )}

 {/* TAB 3: Volunteer Directory */}
 {tab ==="directory"&& (
 <motion.div key="directory"initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 <div className="mb-6">
 <h2 className="text-2xl tracking-tight font-bold text-gray-900 dark:text-white mb-1 tracking-tight"style={{ fontFamily:"HKGrotesk, sans-serif"}}>
 Volunteer Directory
 </h2>
 <p className="text-[13px] text-gray-500 dark:text-slate-300">
 Connect with registered volunteers in your area.
 </p>
 </div>

 {directoryLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {[1, 2, 3, 4, 5, 6].map(i => <DirectorySkeleton key={i} />)}
 </div>
 ) : directoryData?.volunteers?.length === 0 ? (
 <EmptyState icon={Users} title="No volunteers found" description="Try adjusting your filters or be the first to register!" />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {directoryData?.volunteers?.map(vol => (
 <VolunteerDirectoryCard key={vol._id} volunteer={vol} />
 ))}
 </div>
 )}
 </motion.div>
 )}

 </AnimatePresence>
 </div>
 </div>
 );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-teal-500/20 dark:bg-teal-500/10 rounded-full blur-xl animate-pulse" />
        <div className="relative w-20 h-20 bg-gradient-to-tr from-teal-50/80 to-emerald-50/80 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200/50 dark:border-emerald-500/30 rounded-3xl flex items-center justify-center text-teal-600 dark:text-emerald-400 shadow-xl shadow-teal-950/5 backdrop-blur-md">
          <Icon className="w-10 h-10 stroke-[1.25]" />
        </div>
      </div>
      <h3 className="text-[13px] tracking-tight font-bold text-gray-700 dark:text-[#cbd5e1] mb-2 tracking-tight font-heading uppercase tracking-wider">{title}</h3>
      <p className="text-gray-500 dark:text-slate-300 max-w-sm text-[13px] leading-relaxed">{description}</p>
    </div>
  );
}
function CardSkeleton() {
 return (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg overflow-hidden shadow-sm animate-pulse">
 <div className="h-48 bg-slate-200 dark:bg-[#1e3040]"></div>
 <div className="p-5">
 <div className="h-6 bg-slate-200 dark:bg-[#1e3040] rounded w-3/4 mb-3"></div>
 <div className="h-4 bg-slate-200 dark:bg-[#1e3040] rounded w-1/2 mb-4"></div>
 <div className="space-y-2 mb-4">
 <div className="h-3 bg-slate-200 dark:bg-[#1e3040] rounded w-full"></div>
 <div className="h-3 bg-slate-200 dark:bg-[#1e3040] rounded w-5/6"></div>
 </div>
 <div className="flex gap-2">
 <div className="h-10 bg-slate-200 dark:bg-[#1e3040] rounded-xl flex-1"></div>
 <div className="h-10 bg-slate-200 dark:bg-[#1e3040] rounded-xl w-24"></div>
 </div>
 </div>
 </div>
 );
}

function ListSkeleton() {
 return (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 flex gap-4 animate-pulse">
 <div className="w-16 h-16 bg-slate-200 dark:bg-[#1e3040] rounded-lg shrink-0"></div>
 <div className="flex-1">
 <div className="h-5 bg-slate-200 dark:bg-[#1e3040] rounded w-1/3 mb-2"></div>
 <div className="h-3 bg-slate-200 dark:bg-[#1e3040] rounded w-1/4 mb-3"></div>
 <div className="h-3 bg-slate-200 dark:bg-[#1e3040] rounded w-full mb-1"></div>
 <div className="h-3 bg-slate-200 dark:bg-[#1e3040] rounded w-2/3"></div>
 </div>
 </div>
 );
}

function DirectorySkeleton() {
 return (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 flex items-center gap-4 animate-pulse">
 <div className="w-14 h-14 bg-slate-200 dark:bg-[#1e3040] rounded-full shrink-0"></div>
 <div className="flex-1">
 <div className="h-4 bg-slate-200 dark:bg-[#1e3040] rounded w-1/2 mb-2"></div>
 <div className="h-3 bg-slate-200 dark:bg-[#1e3040] rounded w-1/3 mb-2"></div>
 <div className="flex gap-1">
 <div className="h-5 w-12 bg-slate-200 dark:bg-[#1e3040] rounded-full"></div>
 <div className="h-5 w-12 bg-slate-200 dark:bg-[#1e3040] rounded-full"></div>
 </div>
 </div>
 </div>
 );
}
