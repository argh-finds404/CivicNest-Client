import React, { useState, useEffect, useMemo, useCallback } from"react";
import { motion, AnimatePresence } from"framer-motion";
import { useNavigate } from"react-router";
import { Link } from"react-router";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import MinimalLoader from"../common/MinimalLoader";
import { aggregateFeed } from"../../utils/feedAggregator";
import"./RecentActivities.css";
import BackButton from"../common/BackButton";

const CATEGORIES = [
 { id:"all", label:"All Activities", icon:"ri-global-line"},
 { id:"drives", label:"Cleanup Drives", icon:"ri-leaf-line"},
 { id:"issues", label:"Civic Issues", icon:"ri-alert-line"},
 { id:"social", label:"Forum & Polls", icon:"ri-discuss-line"},
 { id:"donations", label:"Contributions", icon:"ri-hand-coin-line"},
 { id:"others", label:"Animals & Lost", icon:"ri-heart-pulse-line"}
];

export default function RecentActivities() {
 const navigate = useNavigate();
 const axiosPublic = useAxiosPublic();
 const [rawFeed, setRawFeed] = useState([]);
 const [page, setPage] = useState(1);
 const [hasMore, setHasMore] = useState(true);
 const [isLoading, setIsLoading] = useState(false);
 const [activeTab, setActiveTab] = useState("all");
 const [searchQuery, setSearchQuery] = useState("");
 const [debouncedSearch, setDebouncedSearch] = useState("");

 // Debounce search input by 300ms
 useEffect(() => {
 const timer = setTimeout(() => {
 setDebouncedSearch(searchQuery);
 // Reset to page 1 on new search
 if (searchQuery !== debouncedSearch) setPage(1);
 }, 300);
 return () => clearTimeout(timer);
 }, [searchQuery]);

 useEffect(() => {
 const fetchFeed = async () => {
 setIsLoading(true);
 try {
 const res = await axiosPublic.get("/public/feed", {
 params: { page, limit: 15 }
 });
 if (page === 1) {
 setRawFeed(res.data.data);
 } else {
 setRawFeed(prev => [...prev, ...res.data.data]);
 }
 setHasMore(res.data.hasMore);
 } catch (error) {
 console.error("Error fetching recent activities:", error);
 } finally {
 setIsLoading(false);
 }
 };
 fetchFeed();
 }, [page, axiosPublic]);

 const getEventMeta = (type) => {
 switch (type) {
 case"drive_joined":
 case"drive_joined_summary":
 return {
 bg:"rgba(14, 165, 233, 0.08)",
 color:"#0284c7",
 border:"rgba(14, 165, 233, 0.15)",
 icon:"ri-group-line",
 label:"Volunteer RSVP",
 category:"drives",
 borderAccent:"#0284c7"};
 case"drive_completed":
 return {
 bg:"rgba(16, 185, 129, 0.08)",
 color:"#059669",
 border:"rgba(16, 185, 129, 0.15)",
 icon:"ri-checkbox-circle-line",
 label:"Drive Completed",
 category:"drives",
 borderAccent:"#059669"};
 case"cleanup_approved":
 case"new_cleanup_event":
 return {
 bg:"rgba(15, 118, 110, 0.08)",
 color:"#0f766e",
 border:"rgba(15, 118, 110, 0.15)",
 icon:"ri-leaf-line",
 label:"Cleanup Event",
 category:"drives",
 borderAccent:"#0f766e"};
 case"donation_made":
 return {
 bg:"rgba(219, 39, 119, 0.08)",
 color:"#db2777",
 border:"rgba(219, 39, 119, 0.15)",
 icon:"ri-hand-coin-line",
 label:"Donation",
 category:"donations",
 borderAccent:"#db2777"};
 case"ngo_partnership":
 return {
 bg:"rgba(124, 58, 237, 0.08)",
 color:"#7c3aed",
 border:"rgba(124, 58, 237, 0.15)",
 icon:"ri-handshake-line",
 label:"NGO Partnership",
 category:"donations",
 borderAccent:"#7c3aed"};
 case"social_activity":
 return {
 bg:"rgba(79, 70, 229, 0.08)",
 color:"#4f46e5",
 border:"rgba(79, 70, 229, 0.15)",
 icon:"ri-discuss-line",
 label:"Forum Post",
 category:"social",
 borderAccent:"#4f46e5"};
 case"incident_reported":
 return {
 bg:"rgba(249, 115, 22, 0.08)",
 color:"#ea580c",
 border:"rgba(249, 115, 22, 0.15)",
 icon:"ri-alert-line",
 label:"Incident Reported",
 category:"issues",
 borderAccent:"#ea580c"};
 case"animal_rescued":
 return {
 bg:"rgba(20, 184, 166, 0.08)",
 color:"#0d9488",
 border:"rgba(20, 184, 166, 0.15)",
 icon:"ri-heart-pulse-line",
 label:"Animal Rescue",
 category:"others",
 borderAccent:"#0d9488"};
 case"poll_created":
 case"poll_ended":
 return {
 bg:"rgba(220, 38, 38, 0.08)",
 color:"#dc2626",
 border:"rgba(220, 38, 38, 0.15)",
 icon:"ri-bar-chart-grouped-line",
 label:"Community Poll",
 category:"social",
 borderAccent:"#dc2626"};
 case"lostfound_reunited":
 return {
 bg:"rgba(234, 179, 8, 0.08)",
 color:"#ca8a04",
 border:"rgba(234, 179, 8, 0.15)",
 icon:"ri-magic-line",
 label:"Reunited",
 category:"others",
 borderAccent:"#ca8a04"};
 case"issue_solved":
 case"issue_solved_summary":
 return {
 bg:"rgba(16, 185, 129, 0.08)",
 color:"#059669",
 border:"rgba(16, 185, 129, 0.15)",
 icon:"ri-checkbox-circle-fill",
 label:"Issue Solved",
 category:"issues",
 borderAccent:"#059669"};
 case"new_issue":
 return {
 bg:"rgba(239, 68, 68, 0.08)",
 color:"#dc2626",
 border:"rgba(239, 68, 68, 0.15)",
 icon:"ri-alert-fill",
 label:"Issue Flagged",
 category:"issues",
 borderAccent:"#dc2626"};
 default:
 return {
 bg:"rgba(100, 116, 139, 0.08)",
 color:"#475569",
 border:"rgba(100, 116, 139, 0.15)",
 icon:"ri-notification-line",
 label:"Activity",
 category:"others",
 borderAccent:"#475569"};
 }
 };

 const renderEventContent = (item) => {
 const data = item.data || {};
 switch (item.type) {
 case"drive_joined":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 <span className="font-extrabold text-slate-800 dark:text-white">{data.count || 1} neighbor(s)</span> RSVP'd to Volunteer
 </h4>
 <p className="recent-rich-desc">
 Joined cleanup drive <span className="font-semibold text-teal-700">"{data.driveTitle}"</span> in the area of <span className="font-medium text-slate-600 dark:text-slate-300">{data.area}</span>.
 </p>
 </div>
 );
 case"drive_joined_summary":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 <span className="recent-rich-highlight highlight-sky">{data.count} neighbors</span> RSVP'd to Volunteer
 </h4>
 <p className="recent-rich-desc">
 A wave of civic support! Multiple community members joined cleanup drives in their respective wards.
 </p>
 </div>
 );
 case"drive_completed":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 Drive Completed Successfully! 🎉
 </h4>
 <p className="recent-rich-desc">
 Cleanup event <span className="font-semibold text-emerald-700">"{data.driveTitle}"</span> in <span className="font-medium text-slate-600 dark:text-slate-300">{data.area}</span> completed with <span className="font-bold text-slate-800 dark:text-white">{data.count || 0} active volunteer(s)</span>.
 </p>
 </div>
 );
 case"cleanup_approved":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 New Cleanup Drive Approved
 </h4>
 <p className="recent-rich-desc">
 Drive <span className="font-semibold text-teal-700">"{data.title}"</span> organized by <span className="font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{data.organizer}</span> is now verified and open.
 </p>
 </div>
 );
 case"new_cleanup_event":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 New Cleanup Drive Launched
 </h4>
 <p className="recent-rich-desc">
 Cleanup campaign <span className="font-semibold text-teal-700">"{data.driveTitle}"</span> was launched in <span className="font-medium text-slate-600 dark:text-slate-300">{data.area}</span> by <span className="font-bold text-slate-750">{data.actorName}</span>.
 </p>
 </div>
 );
 case"donation_made":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 Crowdfunding Donation Contribution
 </h4>
 <p className="recent-rich-desc">
 <span className="font-bold text-pink-700">{data.donor}</span> contributed <span className="font-extrabold text-slate-800 dark:text-white">৳{data.amount}</span> to fund the drive <span className="font-medium text-slate-600 dark:text-slate-300">"{data.title}"</span>.
 </p>
 </div>
 );
 case"ngo_partnership":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 NGO Partnership Established
 </h4>
 <p className="recent-rich-desc">
 Welcome aboard! NGO <span className="font-bold text-violet-700">{data.ngoName}</span> partnered with us to serve <span className="font-medium text-slate-600 dark:text-slate-300">{data.area}</span>.
 </p>
 </div>
 );
 case"social_activity":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 New Forum Discussion Thread
 </h4>
 <p className="recent-rich-desc">
 <span className="font-bold text-indigo-700">{data.authorName}</span> posted <span className="font-semibold text-slate-800 dark:text-white">"{data.title}"</span> under the <span className="recent-rich-tag">{data.category}</span> channel.
 </p>
 </div>
 );
 case"incident_reported":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title text-amber-700">
 New Incident Report Filed
 </h4>
 <p className="recent-rich-desc">
 <span className="font-bold text-slate-800 dark:text-white">{data.reporterName ||"Anonymous"}</span> flagged a <span className="font-semibold text-red-600">{data.category}</span> issue in <span className="font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{data.area}</span>:"{data.title}".
 </p>
 </div>
 );
 case"animal_rescued":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 Animal Successfully Rescued! 🐾
 </h4>
 <p className="recent-rich-desc">
 <span className="font-bold text-teal-700">{data.actorName}</span> rescued a stray/wild <span className="font-bold text-slate-800 dark:text-white">{data.animalType}</span> at <span className="font-medium text-slate-600 dark:text-slate-300">{data.location}</span>.
 </p>
 </div>
 );
 case"poll_created":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 Community Poll Published
 </h4>
 <p className="recent-rich-desc">
 <span className="font-bold text-red-700">{data.actorName}</span> launched a poll: <span className="font-semibold text-slate-800 dark:text-white">"{data.question}"</span>. Vote now!
 </p>
 </div>
 );
 case"poll_ended":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 Community Poll Concluded
 </h4>
 <p className="recent-rich-desc">
 Voting has ended for: <span className="font-semibold text-slate-800 dark:text-white">"{data.question}"</span>. Check the final outcomes in the Polls section.
 </p>
 </div>
 );
 case"lostfound_reunited":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 Lost & Found Item Reunited! 🔍
 </h4>
 <p className="recent-rich-desc">
 Buddy reunited! Found item <span className="font-bold text-amber-600">"{data.itemName}"</span> was returned to its owner in <span className="font-medium text-slate-600 dark:text-slate-300">{data.location}</span>.
 </p>
 </div>
 );
 case"issue_solved":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 Cleanliness Issue Resolved
 </h4>
 <p className="recent-rich-desc">
 Issue solved in <span className="font-bold text-emerald-700">{data.area}</span>: <span className="font-semibold text-slate-800 dark:text-white">{data.title}</span>. Great job by the neighborhood!
 </p>
 </div>
 );
 case"issue_solved_summary":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">
 <span className="recent-rich-highlight highlight-emerald">{data.count} Neighborhood Issues Solved</span>
 </h4>
 <p className="recent-rich-desc">
 A cleaner neighborhood in action! Multiple civic and cleanliness issues were successfully resolved by active citizens.
 </p>
 </div>
 );
 case"new_issue":
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title text-red-700">
 Cleanliness/Hazard Report Registered
 </h4>
 <p className="recent-rich-desc">
 New report in <span className="font-bold text-red-700">{data.area}</span>: <span className="font-semibold text-slate-800 dark:text-white">{data.title}</span>. Volunteer action is needed.
 </p>
 </div>
 );
 default:
 return (
 <div className="recent-rich-card-body">
 <h4 className="recent-rich-title">Community Update</h4>
 <p className="recent-rich-desc">New activity registered from community members.</p>
 </div>
 );
 }
 };

 const extractSearchText = useCallback((item, meta) => {
 const d = item.data || {};
 return [
 d.title, d.area, d.location, d.driveTitle,
 d.organizerName, d.reporterName, d.itemName,
 d.userName, d.content, meta.label
 ].filter(Boolean).join("").toLowerCase();
 }, []);

 // 1. Aggregate raw feed
 const aggregatedFeed = useMemo(() => aggregateFeed(rawFeed), [rawFeed]);

 // 2. Filter by tab + debounced search query
 const filteredFeed = useMemo(() => {
 const q = debouncedSearch.trim().toLowerCase();
 return aggregatedFeed.filter(item => {
 const meta = getEventMeta(item.type);
 if (activeTab !=="all"&& meta.category !== activeTab) return false;
 if (q) return extractSearchText(item, meta).includes(q);
 return true;
 });
 }, [aggregatedFeed, activeTab, debouncedSearch, extractSearchText]);

 return (
 <div className="recent-activities-root">
 {/* Hero Header */}
 <div className="recent-activities-hero">
 {/* Animated particles */}
 <div className="recent-hero-particles"aria-hidden="true">
 {[...Array(6)].map((_, i) => (
 <span key={i} className="recent-hero-particle"/>
 ))}
 </div>

 {/* Shimmer sweep */}
 <div className="recent-hero-shimmer"aria-hidden="true"/>

 <div className="recent-activities-hero-overlay"aria-hidden="true"/>

 <div className="recent-activities-hero-inner">
 {/* Decorative icon + breadcrumb layout */}
 <div className="recent-hero-top-row">
 {/* Left: stacked back-button → Live Feed badge */}
 <motion.div
 className="recent-hero-nav-stack"initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <BackButton variant="light"className="mb-0"/>
 <div className="recent-activities-badge">
 <span className="recent-activities-badge-dot"></span> Live Feed
 </div>
 </motion.div>

 {/* Right: decorative history icon */}
 <motion.div
 className="recent-hero-icon-deco"initial={{ opacity: 0, scale: 0.7 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.7, delay: 0.1, type:"spring", stiffness: 120 }}
 aria-hidden="true">
 <i className="ri-history-line"></i>
 </motion.div>
 </div>

 <motion.h1
 className="recent-activities-title"initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.1 }}
 >
 Recent Community Activities
 </motion.h1>
 <motion.p
 className="recent-activities-subtitle"initial={{ opacity: 0, y: 14 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.2 }}
 >
 Track real-time efforts, reports, resolutions, and contributions happening across your city dashboard.
 </motion.p>
 </div>

 {/* Wave separator */}
 <div style={{ position:'absolute', bottom:'-2px', left: 0, right: 0, zIndex: 3, lineHeight: 0 }} aria-hidden="true">
 <svg viewBox="0 0 1440 48"xmlns="http://www.w3.org/2000/svg"preserveAspectRatio="none"style={{ display:'block', width:'100%', height:'48px'}}>
 <path d="M0,28 C360,48 720,8 1080,28 C1260,36 1380,20 1440,24 L1440,48 L0,48 Z"fill="#f1f5f9"/>
 </svg>
 </div>
 </div>

 {/* Main Container */}
 <main className="recent-activities-main">
 {/* Toolbar: Tabs & Search */}
 <div className="recent-activities-toolbar">
 <div className="recent-activities-search-wrapper">
 <i className="ri-search-line recent-search-icon"></i>
 <input
 type="text"placeholder="Search activities by area, category, organizer..."value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="recent-search-input"/>
 {searchQuery && (
 <button onClick={() => setSearchQuery("")} className="recent-clear-search">
 <i className="ri-close-line"></i>
 </button>
 )}
 </div>

 <div className="recent-tabs-wrapper">
 {CATEGORIES.map(cat => (
 <button
 key={cat.id}
 onClick={() => {
 setActiveTab(cat.id);
 setPage(1);
 }}
 className={`recent-tab-btn ${activeTab === cat.id ?"active":""}`}
 >
 <i className={cat.icon}></i>
 <span>{cat.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Activities List */}
 <div className="recent-feed-container">
 <AnimatePresence mode="popLayout">
 {filteredFeed.map((item, i) => {
 const meta = getEventMeta(item.type);
 return (
 <motion.div
 key={item._id}
 layout
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.98 }}
 transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
 className="recent-activity-card"style={{"--card-border-accent": meta.borderAccent }}
 >
 {/* Left Icon Accent */}
 <div
 className="recent-card-icon-wrap"style={{
 background: meta.bg,
 color: meta.color,
 borderColor: meta.border
 }}
 >
 <i className={`${meta.icon} text-[13px]`}></i>
 </div>

 {/* Body Content */}
 <div className="recent-card-body">
 <div className="recent-card-header-row">
 <span
 className="recent-card-badge"style={{
 background: meta.bg,
 color: meta.color,
 borderColor: meta.border
 }}
 >
 {meta.label}
 </span>
 
 <span className="recent-card-time">
 <i className="ri-time-line"></i>
 {new Date(item.createdAt).toLocaleDateString(undefined, {
 month:"short",
 day:"numeric",
 hour:"2-digit",
 minute:"2-digit"})}
 </span>
 </div>

 {renderEventContent(item)}

 {/* Action Link if applicable */}
 {item.data?.link && (
 <Link to={item.data.link} className="recent-card-link-action">
 View Details <i className="ri-arrow-right-s-line"></i>
 </Link>
 )}
 </div>
 </motion.div>
 );
 })}
 </AnimatePresence>

 {filteredFeed.length === 0 && !isLoading && (
 <div className="recent-empty-state">
 <div className="recent-empty-icon">
 <i className="ri-inbox-line"></i>
 </div>
 <h3 className="recent-empty-title tracking-tight">No activities found</h3>
 <p className="recent-empty-desc">
 {searchQuery
 ?"We couldn't find any match for your search query. Try typing something else!":"No events are recorded under this category yet."}
 </p>
 </div>
 )}

 {/* Loader */}
 {isLoading && (
 <div className="recent-list-loader">
 <MinimalLoader size="lg"color="#0f766e"/>
 </div>
 )}

 {/* Load More / End of Feed — always visible when items exist */}
 {filteredFeed.length > 0 && !isLoading && (
 <motion.div
 className="recent-loadmore-wrap"initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 >
 {hasMore ? (
 <motion.button
 whileHover={{ scale: 1.01, y: -2 }}
 whileTap={{ scale: 0.99 }}
 onClick={() => setPage(p => p + 1)}
 className="recent-loadmore-btn">
 <span className="recent-loadmore-icon">
 <i className="ri-arrow-down-circle-line"></i>
 </span>
 <span className="recent-loadmore-text">
 <strong>Load More Activities</strong>
 <small>Showing {filteredFeed.length} results · click to load next batch</small>
 </span>
 <motion.i
 className="ri-arrow-down-s-line recent-loadmore-arrow"animate={{ y: [0, 4, 0] }}
 transition={{ duration: 1.5, repeat: Infinity, ease:"easeInOut"}}
 />
 </motion.button>
 ) : (
 <div className="recent-end-of-feed">
 <span className="recent-end-line"/>
 <span className="recent-end-text">
 <i className="ri-check-double-line"></i>
 You've seen all {filteredFeed.length} activities
 </span>
 <span className="recent-end-line"/>
 </div>
 )}
 </motion.div>
 )}
 </div>
 </main>
 </div>
 );
}
