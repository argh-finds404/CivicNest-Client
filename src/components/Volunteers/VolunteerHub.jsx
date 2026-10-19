

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
import PageHeader from "../common/PageHeader";
import CityDiorama from "../Home/CityDiorama";
import usePublicStats, { statsToPins } from "../../hooks/usePublicStats";
import { Sprout, CheckCircle, Users } from "lucide-react";

const TABS = [
 { key:"drives", label:"Upcoming Drives", icon:"ri-calendar-event-line"},
 { key:"opportunities", label:"Open Opportunities", icon:"ri-flashlight-line"},
 { key:"directory", label:"Volunteer Directory",icon:"ri-group-line"},
];

export default function VolunteerHub() {
 const { user } = useAuth();
 const [role] = useRole();
 const { data: publicStats } = usePublicStats();
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
 <PageHeader
 width="calc(80rem + 10%)"
 gutter="5%"
 title="Volunteer"
 description={isMember
 ? "Pick up a cleanup, help on a reported issue, or join a feeding drive. Volunteer work earns double points."
 : "Verified residents can sign up as volunteers to join cleanups, help on reported issues and run feeding drives. Volunteer work earns double points."}
 actions={
 !user ? (
 <Link to="/login" state={{ from: "/volunteers" }} className="cn-btn cn-btn-signal">Log in to volunteer</Link>
 ) : role !=="member"&& role !=="admin"? (
 <>
 <Link to="/membership/request" className="cn-btn cn-btn-signal">
 <i className="ri-shield-check-line text-base" aria-hidden="true" />
 Verify your residency
 </Link>
 <span className="self-center text-sm text-white/70">Needed before you can volunteer</span>
 </>
 ) : isVolunteer ? (
 <Link to="/volunteer-dashboard" className="cn-btn cn-btn-signal">
 <i className="ri-dashboard-line text-base" aria-hidden="true" />
 Open my volunteer dashboard
 </Link>
 ) : isPendingVolunteer ? (
 <span className="cn-btn cn-btn-on-dark cursor-default">
 <i className="ri-time-line text-base" aria-hidden="true" />
 Your volunteer sign-up is being reviewed
 </span>
 ) : (
 <Link to="/volunteers/register" className="cn-btn cn-btn-signal">
 <i className="ri-user-add-line text-base" aria-hidden="true" />
 Sign up as a volunteer
 </Link>
 )
 }
 meta={publicStats && (
 <>
 <span><strong>{publicStats.upcomingEvents}</strong> cleanups coming up</span>
 <span><strong>{publicStats.openIssues}</strong> open issues that need hands</span>
 </>
 )}
 art={<CityDiorama size="md" pins={statsToPins(publicStats)} />}
 />

 {}
 <div className="sticky top-0 z-20 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-b border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] px-[5%]">
 <div className="max-w-7xl mx-auto">
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
 style={{ fontFamily:"var(--font-heading)"}}
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
 <div className="px-[5%] py-8">
 <div className="max-w-7xl mx-auto">
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
