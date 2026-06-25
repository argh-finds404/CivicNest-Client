import React from"react";
import SEO from "../common/SEO";
import { motion, AnimatePresence } from"framer-motion";
import { useAuth } from"../../hooks/useAuth";
import { useNavigate } from"react-router";
import { Typewriter } from'react-simple-typewriter';
import { Link } from'react-router';
import { useQuery } from'@tanstack/react-query';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import CleanupEventCard from'../cards/CleanupEventCard';
import PremiumEventCard from'../cards/PremiumEventCard';
import MinimalLoader from'../common/MinimalLoader';
import WarpShaderHero from"./WarpShaderHero";
import Banner from"../Banner/Banner";
import { useRole } from"../../hooks/useRole";
import toast from"react-hot-toast";
import"./Home.css";
import { aggregateFeed } from"../../utils/feedAggregator";
import ActivityTicker from"./ActivityTicker";

function MembershipPromo({ user, role, navigate }) {
 const displayName = user?.displayName || user?.email?.split("@")[0] ||"Neighbour";

 return (
 <motion.section 
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, ease:"easeOut"}}
 className="home-section relative overflow-visible w-full pt-6 pb-0 mb-0 animate-fadeIn">
 <div className="mb-8">
 <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0f766e] mb-1">CIVIC INTEGRATION</p>
 <h2 className="text-2xl tracking-tight md:text-[1.65rem] font-bold text-slate-900 dark:text-white tracking-tight">Verified Residency & Rewards</h2>
 <p className="text-slate-500 dark:text-slate-300 text-[13px] mt-1 max-w-xl">
 Get verified to unlock administrative privileges and register for volunteer point multipliers.
 </p>
 </div>

 {/* Bento Grid */}
 <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-12 items-stretch">
 
 {/* Card 1: Resident Card & CTA (spans 8 cols on desktop) */}
 <div className="col-span-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-[2.25rem] p-5 md:p-10 flex flex-col md:flex-row justify-between items-center gap-5 relative overflow-hidden group">
 {/* Subtle light leaks */}
 <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
 <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

 {/* Left info area */}
 <div className="flex-1 space-y-6 text-center md:text-left z-10">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
 <i className="ri-shield-check-fill animate-pulse"></i> RESIDENT BADGE
 </div>
 <h3 className="text-2xl tracking-tight md:text-3xl tracking-tight font-extrabold text-white leading-tight tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 Unlock Verification
 </h3>
 <p className="text-slate-400 text-[13px] leading-relaxed max-w-md">
 Verify your residency to help claim and solve community reports, host cleanup events, and post inside the forum.
 </p>

 <div className="pt-2 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
 {user ? (
 <button 
 onClick={() => navigate("/membership/request")}
 className="btn-premium">
 Apply for Verification
 </button>
 ) : (
 <>
 <button 
 onClick={() => navigate("/Register")}
 className="btn-premium">
 Register Now
 </button>
 <button 
 onClick={() => navigate("/Login")}
 className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full transition-all shadow-md text-[13px] uppercase tracking-wider text-center dark:hover:bg-slate-600">
 Log In
 </button>
 </>
 )}
 </div>
 </div>

 {/* Right Resident ID preview graphic */}
 <div className="shrink-0 z-10 w-full max-w-sm flex flex-col">
 <div className="relative overflow-hidden w-full h-48 bg-gradient-to-br from-slate-900/90 to-amber-950/80 border border-amber-500/20 rounded-lg p-4 shadow-2xl flex flex-col justify-between backdrop-blur-xl group/id transition-transform duration-500 hover:rotate-1 hover:scale-[1.02]">
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
 <i className="ri-shield-user-fill text-amber-400 text-[13px]"></i>
 </div>
 <div>
 <span className="block text-[9px] font-bold text-slate-400 tracking-wider">CIVICNEST</span>
 <span className="block text-[11px] font-black text-amber-400 tracking-widest leading-none">RESIDENT</span>
 </div>
 </div>
 <div className="text-right">
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/15 border border-amber-400/30 text-amber-400 text-[9px] font-extrabold uppercase rounded-full tracking-widest">
 <i className="ri-lock-line text-[10px]"></i> LOCKED
 </span>
 </div>
 </div>

 <div className="mt-4">
 <span className="block text-[8px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-widest mb-0.5">Resident Holder</span>
 <span className="block text-[13px] font-extrabold text-slate-100 tracking-tight truncate">{displayName}</span>
 <span className="block text-[10px] text-amber-400/80 font-semibold tracking-tight truncate">{user?.email ||"guest@civicnest.org"}</span>
 </div>

 <div className="flex justify-between items-end border-t border-slate-800/60 pt-3 mt-3">
 <div>
 <span className="block text-[8px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-widest mb-0.5">ID Reference</span>
 <span className="block text-[10px] font-mono text-slate-400 font-bold tracking-tight">CN-RES-[LOCKED]</span>
 </div>
 <div className="flex gap-0.5 h-6 items-end opacity-20 group-hover/id:opacity-40 transition-opacity duration-300">
 <div className="w-[1px] h-full bg-slate-500"></div>
 <div className="w-[2px] h-full bg-slate-500"></div>
 <div className="w-[1px] h-full bg-slate-500"></div>
 <div className="w-[1px] h-3 bg-slate-500"></div>
 <div className="w-[3px] h-full bg-slate-500"></div>
 <div className="w-[1px] h-full bg-slate-500"></div>
 <div className="w-[2px] h-2 bg-slate-500"></div>
 <div className="w-[1px] h-full bg-slate-500"></div>
 </div>
 </div>
 </div>
 
 {/* Explanatory Caption */}
 <div className="mt-3 text-slate-400 text-[11px] font-medium leading-normal flex items-start gap-1.5 px-1 text-left">
 <i className="ri-information-line text-amber-400 text-xs shrink-0 mt-0.5"></i>
 <span>Your official digital Resident ID is currently locked. Verify residency to unlock your unique reference ID and verified credentials.</span>
 </div>
 </div>

 </div>

 {/* Card 2: 2x Points (spans 3 cols on desktop) */}
 <div 
 onClick={() => user ? navigate("/membership/request") : navigate("/Register")}
 className="col-span-12 md:col-span-6 lg:col-span-3 uiverse-card uiverse-card--multiplier">
 <div className="space-y-3">
 <h4 className="uiverse-card-heading">
 <i className="ri-flashlight-line text-[#d97706]"></i> Volunteer Points Multiplier
 </h4>
 <p className="uiverse-card-desc">
 Register to volunteer after your residency is verified to unlock double points (2x) on all cleanup tasks.
 </p>
 </div>
 <div className="flex items-center justify-between mt-auto">
 <span className="text-3xl tracking-tight font-black text-[#b45309] drop-shadow">+2x Points</span>
 <span className="uiverse-card-cta">
 Activate Now <i className="ri-arrow-right-line"></i>
 </span>
 </div>
 </div>

 {/* Card 3: Forum Access (spans 3 cols) */}
 <div 
 onClick={() => user ? navigate("/membership/request") : navigate("/Register")}
 className="col-span-12 md:col-span-6 lg:col-span-3 uiverse-card uiverse-card--forum">
 <div className="space-y-3">
 <h4 className="uiverse-card-heading">
 <i className="ri-discuss-line text-[#9333ea]"></i> Forum Discussions
 </h4>
 <p className="uiverse-card-desc">
 Unlock access to post discussions, create new threads, and debate local community initiatives in the public forum.
 </p>
 </div>
 <div className="flex items-center justify-between mt-auto">
 <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-300">Verified Privilege</span>
 <span className="uiverse-card-cta">
 Verify to Post <i className="ri-arrow-right-line"></i>
 </span>
 </div>
 </div>

 {/* Card 4: Event Organizer (spans 3 cols) */}
 <div 
 onClick={() => user ? navigate("/membership/request") : navigate("/Register")}
 className="col-span-12 md:col-span-6 lg:col-span-3 uiverse-card uiverse-card--organize">
 <div className="space-y-3">
 <h4 className="uiverse-card-heading">
 <i className="ri-focus-3-line text-[#0f766e]"></i> Organize Cleanup Drives
 </h4>
 <p className="uiverse-card-desc">
 Propose official neighborhood cleanup events, collect donations, recruit volunteer support, and direct community actions.
 </p>
 </div>
 <div className="flex items-center justify-between mt-auto">
 <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-300">Verified Privilege</span>
 <span className="uiverse-card-cta">
 Get Started <i className="ri-arrow-right-line"></i>
 </span>
 </div>
 </div>

 {/* Card 5: Issue Verification (spans 3 cols) */}
 <div 
 onClick={() => user ? navigate("/membership/request") : navigate("/Register")}
 className="col-span-12 md:col-span-6 lg:col-span-3 uiverse-card uiverse-card--resolution">
 <div className="space-y-3">
 <h4 className="uiverse-card-heading">
 <i className="ri-shield-check-line text-[#2563eb]"></i> Issue Resolution Authority
 </h4>
 <p className="uiverse-card-desc">
 Inspect reported neighborhood problems, verify resolution claims, and check solutions on the map to release reporter points.
 </p>
 </div>
 <div className="flex items-center justify-between mt-auto">
 <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-300">Verified Privilege</span>
 <span className="uiverse-card-cta">
 Claim Authority <i className="ri-arrow-right-line"></i>
 </span>
 </div>
 </div>

 </div>
 </motion.section>
 );
}

const QUICK_ACTIONS = [
 {
 id:"civicbot",
 icon: (
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912-1.275-1.275Z"/>
 <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"/>
 <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
 </svg>
 ),
 title:"CivicBot AI Assistant",
 desc:"Draft incident reports, categories, and letters with AI.",
 color:"#0f766e",
 bg:"#e0f2fe",
 path:"/ai-assistant",
 },
 {
 id:"report",
 icon: (
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
 <line x1="12"y1="9"x2="12"y2="13"/>
 <line x1="12"y1="17"x2="12.01"y2="17"/>
 </svg>
 ),
 title:"Report an Issue",
 desc:"Flag litter, damage, or pollution in your area.",
 color:"#f97316",
 bg:"#fff4ec",
 path:"/issues/add",
 },
 {
 id:"cleanup",
 icon: (
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <polyline points="3 6 5 6 21 6"/>
 <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
 <path d="M10 11v6M14 11v6"/>
 <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
 </svg>
 ),
 title:"Organise a Cleanup",
 desc:"Schedule an event and recruit volunteers.",
 color:"#0f766e",
 bg:"#ecf4f3",
 path:"/cleanup-events/organize",
 },
 {
 id:"donate",
 icon: (
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
 </svg>
 ),
 title:"Fund a Cleanup",
 desc:"Support community drives with micro-donations.",
 color:"#db2777",
 bg:"#fceef4",
 path:"/fund",
 },
 {
 id:"map",
 icon: (
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
 <line x1="9"y1="3"x2="9"y2="18"/>
 <line x1="15"y1="6"x2="15"y2="21"/>
 </svg>
 ),
 title:"Explore Map",
 desc:"View reported issues and cleanups on the live map.",
 color:"#059669",
 bg:"#ecfdf5",
 path:"/map",
 },
 {
 id:"lostfound",
 icon: (
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <circle cx="11"cy="11"r="8"/>
 <line x1="21"y1="21"x2="16.65"y2="16.65"/>
 <line x1="11"y1="8"x2="11"y2="14"/>
 <line x1="8"y1="11"x2="14"y2="11"/>
 </svg>
 ),
 title:"Lost & Found",
 desc:"Find lost belongings or search found objects.",
 color:"#d97706",
 bg:"#fef3c7",
 path:"/lost-found",
 },
 {
 id:"polls",
 icon: (
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <path d="M9 11l3 3L22 4"/>
 <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
 </svg>
 ),
 title:"Vote in Polls",
 desc:"Participate in local decisions and community polls.",
 color:"#0891b2",
 bg:"#ecfeff",
 path:"/polls",
 },
 {
 id:"verify",
 icon: (
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
 <path d="m9 11 2 2 4-4"/>
 </svg>
 ),
 title:"Verify Fixes",
 desc:"Confirm reported resolutions to earn points.",
 color:"#2563eb",
 bg:"#eff6ff",
 path:"/issues/verify",
 },
];

const ACTIVITY = [
 { id: 1, type:"resolved", user:"Maria S.", city:"Dhaka", text:"Illegal dumping cleared near Dhanmondi Lake.", ago:"2 min ago"},
 { id: 2, type:"event", user:"James K.", city:"Chittagong", text:"Weekend cleanup rally — 34 volunteers joined.", ago:"18 min ago"},
 { id: 3, type:"report", user:"Nadia R.", city:"Sylhet", text:"New report: broken street lamp on Ring Road.", ago:"1 hr ago"},
 { id: 4, type:"resolved", user:"Omar F.", city:"Dhaka", text:"Graffiti removed from Shahbagh underpass wall.", ago:"3 hr ago"},
 { id: 5, type:"event", user:"Priya D.", city:"Comilla", text:"Tree-planting drive completed — 120 saplings.", ago:"5 hr ago"},
];

const TYPE_META = {
 resolved: { color:"#0f766e", bg:"rgba(15,118,110,0.1)", label:"Resolved"},
 event: { color:"#7c3aed", bg:"rgba(124,58,237,0.1)", label:"Event"},
 report: { color:"#f97316", bg:"rgba(249,115,22,0.1)", label:"Report"},
};

export default function Home() {
 const { user } = useAuth();
 const [role, isRoleLoading, isVolunteer] = useRole();
 const navigate = useNavigate();
 const axiosPublic = useAxiosPublic();

 const isVerifiedMemberOrStaff = role ==='member'|| role ==='admin'|| isVolunteer;
 const isGuestOrUnverified = !user || !isVerifiedMemberOrStaff;

 const { data: upcomingData, isLoading: isUpcomingLoading } = useQuery({
 queryKey: ['homeUpcomingCleanups'],
 queryFn: async () => {
 const res = await axiosPublic.get('/cleanup-events', { params: { upcoming: true, limit: 5 } });
 return res.data;
 }
 });

 // Fetch paginated feed
 const [feedData, setFeedData] = React.useState([]);
 const [page, setPage] = React.useState(1);
 const [hasMore, setHasMore] = React.useState(true);
 const [isFeedLoading, setIsFeedLoading] = React.useState(false);

 React.useEffect(() => {
 const fetchFeed = async () => {
 setIsFeedLoading(true);
 try {
 const res = await axiosPublic.get('/public/feed', { params: { page, limit: 10 } });
 if (page === 1) {
 setFeedData(res.data.data);
 } else {
 setFeedData(prev => [...prev, ...res.data.data]);
 }
 setHasMore(res.data.hasMore);
 } catch (error) {
 console.error("Error fetching feed:", error);
 } finally {
 setIsFeedLoading(false);
 }
 };
 fetchFeed();
 }, [page, axiosPublic]);

 // Handlers for Interested and Going
 const [interestedEvents, setInterestedEvents] = React.useState(new Set());
 const [goingEvents, setGoingEvents] = React.useState(new Set());

 const handleInterested = (eventId) => {
 if (!user) return toast.error("Please login to mark interest");
 setInterestedEvents(prev => {
 const next = new Set(prev);
 if (next.has(eventId)) next.delete(eventId);
 else next.add(eventId);
 return next;
 });
 };

 const handleGoing = (eventId) => {
 if (!user) return toast.error("Please login to RSVP");
 setGoingEvents(prev => {
 const next = new Set(prev);
 if (next.has(eventId)) next.delete(eventId);
 else next.add(eventId);
 return next;
 });
 };

 // Quick Report Incident Modal States
 const [showReportModal, setShowReportModal] = React.useState(false);
 const [isSubmittingIncident, setIsSubmittingIncident] = React.useState(false);
 const [incidentForm, setIncidentForm] = React.useState({
 title:"",
 area:"",
 description:"",
 category:"General Waste",
 reporterName:"",
 anonymous: false
 });

 React.useEffect(() => {
 if (showReportModal) {
 setIncidentForm({
 title:"",
 area:"",
 description:"",
 category:"General Waste",
 reporterName: user?.displayName || user?.name ||"",
 anonymous: false
 });
 }
 }, [showReportModal, user]);

 const handleIncidentSubmit = async (e) => {
 e.preventDefault();
 if (!incidentForm.title.trim() || !incidentForm.area.trim() || !incidentForm.description.trim()) {
 return toast.error("Please fill in all required fields.");
 }

 setIsSubmittingIncident(true);
 try {
 const headers = {};
 if (user) {
 const auth = await import("../../firebase/firebase.init").then((m) => m.auth);
 const token = await auth.currentUser?.getIdToken();
 if (token) {
 headers.Authorization =`Bearer ${token}`;
 }
 }

 const payload = {
 title: incidentForm.title,
 area: incidentForm.area,
 description: incidentForm.description,
 category: incidentForm.category,
 reporterName: incidentForm.anonymous ?"Anonymous Neighbour": (incidentForm.reporterName ||"Anonymous Neighbour")
 };

 const res = await axiosPublic.post("/public/incidents", payload, { headers });
 if (res.data.success) {
 toast.success("Incident reported successfully! The community has been updated.");
 setShowReportModal(false);
 setPage(1);
 // Refresh feed data immediately
 try {
 const feedRes = await axiosPublic.get('/public/feed', { params: { page: 1, limit: 10 } });
 setFeedData(feedRes.data.data);
 setHasMore(feedRes.data.hasMore);
 } catch (err) {
 console.error("Error refreshing feed:", err);
 }
 } else {
 toast.error(res.data.message ||"Failed to submit incident.");
 }
 } catch (error) {
 console.error("Error submitting incident:", error);
 toast.error(error.response?.data?.message ||"Failed to submit incident. Please check your connection.");
 } finally {
 setIsSubmittingIncident(false);
 }
 };

 const getEventMeta = (type) => {
 switch (type) {
 case'drive_joined':
 return {
 bg:'rgba(14, 165, 233, 0.08)',
 color:'#0284c7',
 border:'rgba(14, 165, 233, 0.15)',
 icon:'ri-group-line',
 label:'Volunteer RSVP'};
 case'drive_completed':
 return {
 bg:'rgba(16, 185, 129, 0.08)',
 color:'#059669',
 border:'rgba(16, 185, 129, 0.15)',
 icon:'ri-checkbox-circle-line',
 label:'Drive Completed'};
 case'cleanup_approved':
 case'new_cleanup_event':
 return {
 bg:'rgba(15, 118, 110, 0.08)',
 color:'#0f766e',
 border:'rgba(15, 118, 110, 0.15)',
 icon:'ri-leaf-line',
 label:'Cleanup Event'};
 case'donation_made':
 return {
 bg:'rgba(219, 39, 119, 0.08)',
 color:'#db2777',
 border:'rgba(219, 39, 119, 0.15)',
 icon:'ri-hand-coin-line',
 label:'Donation'};
 case'ngo_partnership':
 return {
 bg:'rgba(124, 58, 237, 0.08)',
 color:'#7c3aed',
 border:'rgba(124, 58, 237, 0.15)',
 icon:'ri-handshake-line',
 label:'NGO Partnership'};
 case'social_activity':
 return {
 bg:'rgba(79, 70, 229, 0.08)',
 color:'#4f46e5',
 border:'rgba(79, 70, 229, 0.15)',
 icon:'ri-discuss-line',
 label:'Forum Post'};
 case'incident_reported':
 return {
 bg:'rgba(249, 115, 22, 0.08)',
 color:'#ea580c',
 border:'rgba(249, 115, 22, 0.15)',
 icon:'ri-alert-line',
 label:'Incident Reported'};
 case'animal_rescued':
 return {
 bg:'rgba(20, 184, 166, 0.08)',
 color:'#0d9488',
 border:'rgba(20, 184, 166, 0.15)',
 icon:'ri-heart-pulse-line',
 label:'Animal Rescue'};
 case'poll_created':
 case'poll_ended':
 return {
 bg:'rgba(220, 38, 38, 0.08)',
 color:'#dc2626',
 border:'rgba(220, 38, 38, 0.15)',
 icon:'ri-bar-chart-grouped-line',
 label:'Community Poll'};
 case'lostfound_reunited':
 return {
 bg:'rgba(234, 179, 8, 0.08)',
 color:'#ca8a04',
 border:'rgba(234, 179, 8, 0.15)',
 icon:'ri-magic-line',
 label:'Reunited'};
 case'issue_solved':
 return {
 bg:'rgba(16, 185, 129, 0.08)',
 color:'#059669',
 border:'rgba(16, 185, 129, 0.15)',
 icon:'ri-checkbox-circle-fill',
 label:'Issue Solved'};
 case'new_issue':
 return {
 bg:'rgba(239, 68, 68, 0.08)',
 color:'#dc2626',
 border:'rgba(239, 68, 68, 0.15)',
 icon:'ri-alert-fill',
 label:'Issue Flagged'};
 case'drive_joined_summary':
 return {
 bg:'rgba(14, 165, 233, 0.08)',
 color:'#0284c7',
 border:'rgba(14, 165, 233, 0.15)',
 icon:'ri-group-fill',
 label:'Volunteers'};
 case'issue_solved_summary':
 return {
 bg:'rgba(16, 185, 129, 0.08)',
 color:'#059669',
 border:'rgba(16, 185, 129, 0.15)',
 icon:'ri-checkbox-circle-fill',
 label:'Solved'};
 default:
 return {
 bg:'rgba(100, 116, 139, 0.08)',
 color:'#475569',
 border:'rgba(100, 116, 139, 0.15)',
 icon:'ri-notification-line',
 label:'Activity'};
 }
 };

 const getEventText = (item) => {
 const data = item.data || {};
 switch (item.type) {
 case'drive_joined':
 return (
 <span>
 <span className="font-bold text-slate-800 dark:text-white">{data.count || 1} neighbor(s)</span> RSVP'd to join the cleanup drive{" "}
 <span className="font-bold text-teal-700 dark:text-teal-400">"{data.driveTitle}"</span> in <span className="font-medium text-slate-600 dark:text-slate-300">{data.area}</span>.
 </span>
 );
 case'drive_completed':
 return (
 <span>
 Cleanup drive <span className="font-bold text-emerald-700 dark:text-emerald-400">"{data.driveTitle}"</span> in{" "}
 <span className="font-medium text-slate-600 dark:text-slate-300">{data.area}</span> completed successfully with{" "}
 <span className="font-bold text-slate-800 dark:text-white">{data.count || 0} volunteer(s)</span>!
 </span>
 );
 case'cleanup_approved':
 return (
 <span>
 New cleanup drive approved: <span className="font-bold text-teal-700 dark:text-teal-400">"{data.title}"</span> organized by{" "}
 <span className="font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{data.organizer}</span>.
 </span>
 );
 case'new_cleanup_event':
 return (
 <span>
 New cleanup drive launched in <span className="font-medium text-slate-600 dark:text-slate-300">{data.area}</span>:{" "}
 <span className="font-bold text-teal-700 dark:text-teal-400">"{data.driveTitle}"</span> by{" "}
 <span className="font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{data.actorName}</span>.
 </span>
 );
 case'donation_made':
 return (
 <span>
 <span className="font-bold text-pink-700 dark:text-pink-400">{data.donor}</span> contributed{" "}
 <span className="font-bold text-slate-800 dark:text-white">৳{data.amount}</span> to support{" "}
 <span className="font-medium text-slate-600 dark:text-slate-300">"{data.title}"</span>.
 </span>
 );
 case'ngo_partnership':
 return (
 <span>
 New verified partnership with NGO <span className="font-bold text-violet-700 dark:text-violet-400">{data.ngoName}</span> serving{" "}
 <span className="font-medium text-slate-600 dark:text-slate-300">{data.area}</span>.
 </span>
 );
 case'social_activity':
 return (
 <span>
 <span className="font-bold text-indigo-700 dark:text-indigo-400">{data.authorName}</span> posted in the forum:{" "}
 <span className="font-bold text-slate-800 dark:text-white">"{data.title}"</span> under{" "}
 <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">{data.category}</span>.
 </span>
 );
 case'incident_reported':
 return (
 <span>
 <span className="font-bold text-amber-700 dark:text-amber-400">{data.reporterName ||'Anonymous Neighbour'}</span> reported a{" "}
 <span className="font-medium text-red-600 dark:text-red-400">{data.category}</span> issue in{" "}
 <span className="font-bold text-slate-800 dark:text-white">{data.area}</span>: {" "}"{data.title}".
 </span>
 );
 case'animal_rescued':
 return (
 <span>
 <span className="font-bold text-teal-700 dark:text-teal-400">{data.actorName}</span> successfully helped a stray/wild{" "}
 <span className="font-bold text-slate-800 dark:text-white">{data.animalType}</span> in{" "}
 <span className="font-medium text-slate-600 dark:text-slate-300">{data.location}</span>.
 </span>
 );
 case'poll_created':
 return (
 <span>
 <span className="font-bold text-red-700 dark:text-red-400">{data.actorName}</span> published a new community poll:{" "}
 <span className="font-medium text-slate-800 dark:text-white">"{data.question}"</span>.
 </span>
 );
 case'poll_ended':
 return (
 <span>
 Community poll concluded: <span className="font-medium text-slate-800 dark:text-white">"{data.question}"</span>.
 </span>
 );
 case'lostfound_reunited':
 return (
 <span>
 Reunited! Lost & found item <span className="font-bold text-amber-600 dark:text-amber-400">"{data.itemName}"</span> was returned to its owner in <span className="font-medium text-slate-600 dark:text-slate-300">{data.location}</span>.
 </span>
 );
 case'issue_solved':
 return (
 <span>
 Issue resolved in <span className="font-bold text-emerald-700 dark:text-emerald-400">{data.area}</span>: <span className="font-medium text-slate-800 dark:text-white">{data.title}</span>.
 </span>
 );
 case'new_issue':
 return (
 <span>
 New cleanliness/hazard report in <span className="font-bold text-red-700 dark:text-red-400">{data.area}</span>: <span className="font-medium text-slate-800 dark:text-white">{data.title}</span>.
 </span>
 );
 case'drive_joined_summary':
 return (
 <span>
 <span className="font-extrabold text-[#0284c7]">{data.count} neighbors</span> RSVP'd to volunteer in recent cleanup drives!
 </span>
 );
 case'issue_solved_summary':
 return (
 <span>
 <span className="font-extrabold text-[#059669]">{data.count} community issues</span> were successfully resolved!
 </span>
 );
 default:
 return <span>New activity from community members.</span>;
 }
 };

 const displayName = user?.displayName || user?.email?.split("@")[0] ||"Neighbour";

 return (
 <div className="drawer drawer-end">
 <SEO title="Community Cleanliness Portal" description="Report civic issues, find lost items, and volunteer in your community." />
 <input id="events-drawer"type="checkbox"className="drawer-toggle"/>
 <div className="drawer-content home-root">
 {}
 <WarpShaderHero>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="home-hero-text">
 <div className="home-hero-badge">
 <span className="home-hero-badge-dot"/>
 Community Dashboard
 </div>
 <h1 className="home-hero-title tracking-tight">
 Welcome back,{" "}
 <span className="home-hero-title-name">{displayName}</span>{" "}
 <motion.img 
 src="https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f44b.png"alt="👋"width="34"height="34"className="inline-block origin-[70%_70%] -translate-y-0.5 ml-1"animate={{ rotate: [0, 25, -15, 25, -15, 20, 0, 0] }}
 transition={{
 duration: 1.8,
 ease:"easeInOut",
 times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
 repeat: Infinity,
 repeatDelay: 3.5
 }}
 />
 </h1>
 <p className="home-hero-sub text-[13px] mt-2">
  Your city needs you. Let's build{" "}
 <span className="text-[#6EE7B7] font-bold">
 <Typewriter
 words={['cleaner streets.','greener parks.','safer neighborhoods.','a better tomorrow.']}
 loop={0}
 cursor
 cursorStyle='|' typeSpeed={70}
 deleteSpeed={50}
 delaySpeed={1500}
 />
 </span>
 <br />
 Report issues, organise cleanups, and celebrate every win with 15,000+ neighbours.
 </p>
 </motion.div>

 {/* Stat cards - wrapped for 2-col desktop layout */}
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.15 }}
 className="home-stats-row-wrap">
 <div className="home-stats-row">
 {[
 { label:"Issues Reported", value:"1,847", delta:"+12 today", accent:"#f97316"},
 { label:"Resolved", value:"12,492", delta:"+38 today", accent:"#0f766e"},
 { label:"Active Members", value:"15,241", delta:"+204 week", accent:"#7c3aed"},
 { label:"Events This Month", value:"94", delta:"34 upcoming", accent:"#db2777"},
 ].map((s) => (
 <div key={s.label} className="home-stat-card">
 <div className="home-stat-accent"style={{ background: s.accent }} />
 <p className="home-stat-value">{s.value}</p>
 <p className="home-stat-label">{s.label}</p>
 <p className="home-stat-delta">{s.delta}</p>
 </div>
 ))}
 </div>
 </motion.div>
 </WarpShaderHero>

 {}
 <main className="home-main pt-8">
 <ActivityTicker />

 {/* Upcoming community drives */}
 {user && isVerifiedMemberOrStaff && (
 <section className="home-section home-section--drives relative z-20 w-full animate-fadeIn">
 <div className="home-section-header home-drives-header flex flex-col md:flex-row justify-between items-center md:items-end text-center md:text-left gap-3">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400 mb-1">Community programmes</p>
 <h2 className="text-2xl tracking-tight md:text-[1.65rem] font-bold text-slate-900 dark:text-white tracking-tight">Upcoming cleanup drives</h2>
 <p className="text-slate-500 dark:text-slate-300 text-[13px] mt-1 max-w-xl">
 Verified neighbourhood events you can join, support, or share with your network.
 </p>
 </div>
 <button
 type="button"onClick={() => navigate('/cleanup-events')}
 className="px-4 py-1.5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-teal-600 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:text-white text-[13px] font-semibold rounded-full transition-colors border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-teal-600 flex items-center gap-2 shrink-0">
 Browse all drives <i className="ri-arrow-right-line"/>
 </button>
 </div>
 
 {isUpcomingLoading ? (
 <div className="flex justify-center py-10"><MinimalLoader size="lg"color="#40826D"/></div>
 ) : upcomingData?.events?.length > 0 ? (
 <div className="home-events-scroller -mx-4 px-4 md:mx-0 md:px-0">
 {upcomingData.events.map((event) => (
 <div key={event._id} className="home-event-card-slot">
 <div className="home-event-card-surface">
 <PremiumEventCard
 event={event}
 currentUser={user}
 userInterested={interestedEvents.has(event._id)}
 userGoing={goingEvents.has(event._id)}
 onInterested={handleInterested}
 onGoing={handleGoing}
 />
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-12 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
 <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600 text-3xl tracking-tight">
 <i className="ri-plant-line"></i>
 </div>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-2 tracking-tight">No upcoming drives</h3>
 <p className="text-slate-500 dark:text-slate-300 mb-6">There are currently no community drives scheduled. Be the first to organize one!</p>
 <button onClick={() => navigate('/cleanup-events/organize')} className="px-8 py-3 bg-[#40826D] hover:bg-[#326756] text-white rounded-xl font-bold shadow-md transition-all hover:shadow-lg">
 Organize a Drive
 </button>
 </div>
 )}
 </section>
 )}

 {/* Premium Membership Promo Section */}
 {isGuestOrUnverified && (
 <MembershipPromo user={user} role={role} navigate={navigate} />
 )}

 {/* Quick actions */}
 <section className="home-section">
 <h2 className="home-section-title tracking-tight">Quick Actions</h2>
 <div className="home-actions-grid">
 {QUICK_ACTIONS.map((a, i) => (
 <motion.button
 key={a.id}
 onClick={() => {
 if (a.id ==="report") {
 setShowReportModal(true);
 } else {
 navigate(a.path);
 }
 }}
 initial="initial"animate="animate"whileHover="hover"whileTap="tap"variants={{
 initial: { opacity: 0, y: 16 },
 animate: { opacity: 1, y: 0, backgroundColor:"#ffffff", borderColor:"#e2e8f0", transition: { delay: 0.1 * i, duration: 0.2, ease:"easeOut"} },
 hover: { y: -4, boxShadow:"0 12px 32px rgba(0,0,0,0.1)", backgroundColor: a.bg, borderColor:"transparent", transition: { duration: 0.2, ease:"easeOut"} },
 tap: { scale: 0.98 }
 }}
 className="home-action-card">
 <motion.div
 className="home-action-icon"variants={{
 initial: { backgroundColor: a.bg, boxShadow:"none"},
 animate: { backgroundColor: a.bg, boxShadow:"none", transition: { duration: 0.2, ease:"easeOut"} },
 hover: { backgroundColor:"#ffffff", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", transition: { duration: 0.2, ease:"easeOut"} }
 }}
 style={{ color: a.color }}
 >
 {a.icon}
 </motion.div>
 <div className="home-action-body">
 <p className="home-action-title">{a.title}</p>
 <p className="home-action-desc">{a.desc}</p>
 </div>
 <svg width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="#94a3b8"strokeWidth="2.5"strokeLinecap="round"className="home-action-arrow">
 <polyline points="9 18 15 12 9 6"/>
 </svg>
 </motion.button>
 ))}
 </div>
 </section>

 {/* Recent activity */}
 <section className="home-section">
 <div className="home-section-header">
 <h2 className="home-section-title tracking-tight">Recent Activity</h2>
 </div>

 <div className="home-activity-list /50">
 {aggregateFeed(feedData).map((item, i) => {
 const meta = getEventMeta(item.type);

 return (
 <motion.div
 key={item._id}
 initial={{ opacity: 0, x: -12 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5) }}
 className="home-activity-item flex items-start gap-5 py-5 px-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50 dark:hover:bg-slate-700/30 transition-all">
 <div 
 className="flex items-center justify-center text-[13px] shrink-0 w-10 h-10 rounded-xl shadow-sm border transition-transform duration-300 group-hover:scale-105"style={{ 
 background: meta.bg, 
 color: meta.color, 
 borderColor: meta.border 
 }}
 >
 <i className={meta.icon}></i>
 </div>
 <div className="home-activity-body flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-2 flex-wrap">
 <span 
 className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border"style={{ 
 background: meta.bg, 
 color: meta.color, 
 borderColor: meta.border 
 }}
 >
 {meta.label}
 </span>
 </div>
 <p className="home-activity-text text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] leading-relaxed">
 {getEventText(item)}
 </p>
 <p className="home-activity-meta text-[10px] font-medium text-slate-400 mt-2 flex items-center gap-1">
 <i className="ri-time-line text-[11px]"></i>
 {new Date(item.createdAt).toLocaleDateString(undefined, { 
 month:'short', 
 day:'numeric', 
 hour:'2-digit', 
 minute:'2-digit'})}
 </p>
 </div>
 </motion.div>
 );
 })}
 </div>

 {isFeedLoading && feedData.length === 0 && (
 <div className="flex justify-center py-10">
 <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
 </div>
 )}

 {feedData.length === 0 && !isFeedLoading && (
 <div className="text-center py-8 text-slate-400 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-100 mt-2">
 <i className="ri-history-line text-3xl tracking-tight block mb-2 opacity-40"></i>
 No recent community activity found.
 </div>
 )}

 {/* See All + Load More */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
 {hasMore && feedData.length > 0 && (
 <motion.button 
 whileTap={{ scale: 0.95 }}
 onClick={() => setPage(p => p + 1)}
 disabled={isFeedLoading}
 className="relative overflow-hidden group px-6 py-2.5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-[#40826D] font-bold rounded-full shadow-sm border border-teal-200 transition-all hover:shadow-md disabled:opacity-50 text-[13px]">
 <div className="absolute inset-0 bg-teal-50 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
 <span className="relative flex items-center gap-2">
 {isFeedLoading ?'Loading...':'Load More'} <i className="ri-arrow-down-s-line"></i>
 </span>
 </motion.button>
 )}
 <Link
 to="/recent-activities"className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all text-[13px] group ml-auto">
 <i className="ri-history-line"></i>
 See All Recent Activities
 <i className="ri-arrow-right-line group-hover:translate-x-0.5 transition-transform"></i>
 </Link>
 </div>
 </section>
 </main>
 
 {}
 <Banner />
 
 {/* Quick Incident Reporting Modal */}
 <AnimatePresence>
 {showReportModal && (
 <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
 <motion.div
 initial={{ scale: 0.95, y: 20, opacity: 0 }}
 animate={{ scale: 1, y: 0, opacity: 1 }}
 exit={{ scale: 0.95, y: 20, opacity: 0 }}
 transition={{ type:"spring", duration: 0.4 }}
 className="relative w-full max-w-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
 {/* Header */}
 <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white flex justify-between items-center shrink-0">
 <div>
 <h3 className="text-[13px] tracking-tight font-black tracking-tight flex items-center gap-2"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 <i className="ri-alert-fill text-yellow-300 animate-pulse"></i> Quick Report Incident
 </h3>
 <p className="text-xs text-teal-100 mt-1">Alert the community about cleanliness & public hazards</p>
 </div>
 <button
 onClick={() => setShowReportModal(false)}
 className="p-1.5 rounded-lg hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 transition-colors text-white/80 hover:text-white">
 <i className="ri-close-line text-2xl tracking-tight"></i>
 </button>
 </div>

 {/* Form Body */}
 <form onSubmit={handleIncidentSubmit} className="p-4 overflow-y-auto space-y-5 flex-1 text-left">
 {/* Category Selector */}
 <div>
 <label className="block text-[13px] font-extrabold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">
 Category <span className="text-red-500 font-black">*</span>
 </label>
 <div className="grid grid-cols-2 gap-2">
 {[
 { value:"Clogged Drain", icon:"ri-water-flash-line"},
 { value:"Littering", icon:"ri-delete-bin-6-line"},
 { value:"Graffiti", icon:"ri-paint-brush-line"},
 { value:"Illegal Dumping", icon:"ri-spam-line"},
 { value:"General Waste", icon:"ri-recycle-line"},
 { value:"Other", icon:"ri-question-mark"}
 ].map((cat) => (
 <button
 key={cat.value}
 type="button"onClick={() => setIncidentForm(prev => ({ ...prev, category: cat.value }))}
 className={`category-select-btn flex items-center gap-2.5 px-3 py-3 rounded-xl border text-[13px] font-bold shadow-sm transition-all ${
 incidentForm.category === cat.value
 ?"bg-teal-50 border-teal-500 text-teal-700 shadow-sm ring-1 ring-teal-500/20":"bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-650 hover:bg-slate-550 hover:border-slate-350"}`}
 >
 <i className={`${cat.icon} text-[15px]`}></i>
 <span>{cat.value}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Title */}
 <div>
 <label className="block text-[13px] font-extrabold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-1.5">
 Incident Title <span className="text-red-500 font-black">*</span>
 </label>
 <input
 type="text"required
 placeholder="e.g. Clogged drain causing overflow on main street"value={incidentForm.title}
 onChange={(e) => setIncidentForm(prev => ({ ...prev, title: e.target.value }))}
 className="modal-input-field w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:outline-none text-[13px] transition-all placeholder:text-slate-400 font-medium text-slate-800 dark:text-white"/>
 </div>

 {/* Area/Location */}
 <div>
 <label className="block text-[13px] font-extrabold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-1.5">
 Area/Location <span className="text-red-500 font-black">*</span>
 </label>
 <input
 type="text"required
 placeholder="e.g. Dhanmondi, Road 15"value={incidentForm.area}
 onChange={(e) => setIncidentForm(prev => ({ ...prev, area: e.target.value }))}
 className="modal-input-field w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:outline-none text-[13px] transition-all placeholder:text-slate-400 font-medium text-slate-800 dark:text-white"/>
 <p className="text-[11px] font-semibold text-slate-400 mt-1">Provide a brief, clear landmark or neighborhood name.</p>
 </div>

 {/* Description */}
 <div>
 <label className="block text-[13px] font-extrabold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-1.5">
 Description <span className="text-red-500 font-black">*</span>
 </label>
 <textarea
 required
 rows={3}
 placeholder="Describe the issue in detail (e.g. trash piling up, foul smell, blocked pathway)"value={incidentForm.description}
 onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
 className="modal-input-field w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:outline-none text-[13px] transition-all resize-none placeholder:text-slate-400 font-medium text-slate-800 dark:text-white"/>
 </div>

 {/* Reporter Name & Anonymous Checkbox */}
 <div className="pt-3 border-t border-slate-100 space-y-3">
 <div className="flex items-center justify-between">
 <label className="text-[13px] font-extrabold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Reporter Identity</label>
 <label className="flex items-center gap-2 cursor-pointer select-none">
 <input
 type="checkbox"checked={incidentForm.anonymous}
 onChange={(e) => setIncidentForm(prev => ({ 
 ...prev, 
 anonymous: e.target.checked,
 reporterName: e.target.checked ?"Anonymous Neighbour": (user?.displayName ||"")
 }))}
 className="rounded border-slate-350 text-teal-600 focus:ring-teal-500/20 w-4 h-4 cursor-pointer"/>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Report Anonymously</span>
 </label>
 </div>

 {!incidentForm.anonymous && (
 <input
 type="text"placeholder="Your name"value={incidentForm.reporterName}
 onChange={(e) => setIncidentForm(prev => ({ ...prev, reporterName: e.target.value }))}
 className="modal-input-field w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:outline-none text-[13px] transition-all font-medium text-slate-800 dark:text-white"/>
 )}
 </div>

 {/* Actions */}
 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
 <button
 type="button"onClick={() => setShowReportModal(false)}
 className="px-5 py-3 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-650 text-[13px] font-extrabold rounded-xl transition-colors">
 Cancel
 </button>
 <button
 type="submit"disabled={isSubmittingIncident}
 className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-[13px] font-black rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer">
 {isSubmittingIncident ? (
 <>
 <i className="ri-loader-4-line animate-spin"></i> Submitting...
 </>
 ) : (
 <>
 <i className="ri-send-plane-fill animate-pulse"></i> Submit Report
 </>
 )}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </div> 
 {/* End drawer-content */}

 {/* Sidebar Drawer */}
 <div className="drawer-side z-[100]">
 <label htmlFor="events-drawer"aria-label="close sidebar"className="drawer-overlay"></label>
 <div className="p-4 w-full md:w-[450px] min-h-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-800 dark:text-white flex flex-col border-l border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl tracking-tight font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
 <i className="ri-calendar-event-fill text-teal-600"></i> All Upcoming Drives
 </h2>
 <label htmlFor="events-drawer"className="btn btn-circle btn-ghost btn-sm text-slate-400 hover:text-slate-800 dark:text-white">
 <i className="ri-close-line text-[13px] tracking-tight"></i>
 </label>
 </div>

 <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
 {upcomingData?.events?.map(event => (
 <div key={event._id} className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group cursor-pointer"onClick={() => navigate(`/cleanup-events/${event._id}`)}>
 <div className="flex gap-4">
 <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
 <img 
 src={event.coverImages?.[0] ||'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1000'} 
 alt={event.title}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-slate-800 dark:text-white text-[13px] leading-tight truncate group-hover:text-teal-700 transition-colors tracking-tight">{event.title}</h3>
 <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 mb-2 font-medium bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] w-max px-2 py-0.5 rounded-full">
 {new Date(event.eventDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric'})}
 </p>
 <p className="text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2">{event.description}</p>
 </div>
 </div>
 <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
 <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-300">
 <img src={event.organizer?.photoURL ||`https://ui-avatars.com/api/?name=${event.organizer?.name}&background=random`} alt="host"className="w-6 h-6 rounded-full"/>
 <span>{event.organizer?.name?.includes('@') ?'Community Member': (event.organizer?.name ||'Community Member')}</span>
 </div>
 <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full group-hover:bg-teal-600 group-hover:text-white transition-colors">
 View Details
 </span>
 </div>
 </div>
 ))}
 </div>

 <div className="mt-6 pt-6 border-t border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <button onClick={() => navigate('/cleanup-events')} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
 Browse Event Directory <i className="ri-arrow-right-line"></i>
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
