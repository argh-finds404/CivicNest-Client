import React, { useState, useEffect, useCallback } from'react';
import SEO from '../common/SEO';
import { useNavigate, Link } from'react-router';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import SocialFeedCard from'../cards/SocialFeedCard';
import MinimalLoader from'../common/MinimalLoader';
import { motion, AnimatePresence } from'framer-motion';
import PremiumDropdown from'../common/PremiumDropdown';
import { socket } from'../../hooks/useSocket';
import PageHeader from'../common/PageHeader';
import PageArt3D from'../three/PageArt3D';
import usePublicStats from'../../hooks/usePublicStats';

const AllIssues = () => {
 const navigate = useNavigate();
 const { data: stats } = usePublicStats();
 const axiosPublic = useAxiosPublic();
 const [issues, setIssues] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 
 const [search, setSearch] = useState("");
 const [category, setCategory] = useState("");
 const [area, setArea] = useState("");
 const [sort, setSort] = useState("newest");
 
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 const fetchIssues = useCallback(async () => {
 if (page === 1) setIsLoading(true);
 try {
 const queryParams = new URLSearchParams({ page, limit: 10 });
 if (search) queryParams.append('search', search);
 if (category) queryParams.append('category', category);
 if (area) queryParams.append('area', area);
 if (sort !=='newest') queryParams.append('sort', sort);

 const res = await axiosPublic.get(`/issues?${queryParams.toString()}`);
 const data = res.data;
 
 if (!data.issues || data.issues.length === 0) {
 if (page === 1) setIssues([]);
 setTotalPages(1);
 } else {
 setIssues(prev => page === 1 ? data.issues : [...prev, ...data.issues]);
 setTotalPages(data.totalPages);
 }
 } catch (error) {
 console.error(error);
 if (page === 1) setIssues([]);
 setTotalPages(1);
 } finally {
 setIsLoading(false);
 }
 }, [search, category, area, sort, page]);

 useEffect(() => {
 const timer = setTimeout(() => fetchIssues(), 400);
 
 socket.on('issueStatusUpdated', (data) => {
 fetchIssues(); // Refresh feed completely behind the scenes
 });

 return () => {
 clearTimeout(timer);
 socket.off('issueStatusUpdated');
 };
 }, [fetchIssues]);

 const categories = [
 { label:"Garbage & Waste", count: 142, image:"https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=500&q=80"},
 { label:"Road Damage", count: 87, image:"https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=500&q=80"},
 { label:"Waterlogging", count: 56, image:"https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=500&q=80"},
 { label:"Utility Problems", count: 34, image:"https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?auto=format&fit=crop&w=500&q=80"},
 { label:"Broken Public Property", count: 21, image:"https://images.unsplash.com/photo-1498677231914-50df6bc1ec22?auto=format&fit=crop&w=500&q=80"},
 { label:"Safety & Crime", count: 45, image:"https://images.unsplash.com/photo-1517737883398-67b14041e21b?auto=format&fit=crop&w=500&q=80"},
 { label:"Environmental Issues", count: 68, image:"https://images.unsplash.com/photo-1611273426858-450d8e814323?auto=format&fit=crop&w=500&q=80"}
 ];

 const sortOptions = [
 { label:"Newest First", value:"newest"},
 { label:"Most Upvoted", value:"most_upvoted"},
 { label:"Highest Funded", value:"most_funded"}
 ];

 const areaOptions = [
 { label:"All Areas", value:""},
 { label:"Ward 1", value:"Ward 1"},
 { label:"Ward 2", value:"Ward 2"},
 { label:"Ward 3", value:"Ward 3"},
 { label:"Ward 4", value:"Ward 4"},
 { label:"Ward 5", value:"Ward 5"},
 { label:"Ward 6", value:"Ward 6"}
 ];

 // Try one fallback image only; retrying on every error looped forever when the fallback failed too
 const handleImageError = (e) => {
 if (e.target.dataset.fallback) return;
 e.target.dataset.fallback ="1";
 e.target.src =`https://picsum.photos/seed/${e.target.alt}/500/400`;
 };

 return (
 <div className="min-h-screen pb-8 font-body">
 <SEO title="Active Incident Reports" canonical={`${window.location.origin}/issues`} />
 
 <PageHeader
 width="64rem"
 gutter="1rem"
 title="Issues near you"
 description="Broken streetlights, blocked drains, overflowing bins: see what neighbours have reported, add what you've seen, and follow each one until it's fixed."
 actions={
 <>
 <Link to="/issues/add" className="cn-btn cn-btn-signal">
 <i className="ri-map-pin-add-line text-base" aria-hidden="true" />
 Report an issue
 </Link>
 <Link to="/ai-assistant" className="cn-btn cn-btn-on-dark">
 <i className="ri-robot-2-line text-base" aria-hidden="true" />
 Draft one with CivicBot
 </Link>
 </>
 }
 meta={stats && (
 <>
 <span><strong>{stats.openIssues?.toLocaleString()}</strong> open</span>
 <span><strong>{stats.issuesResolved?.toLocaleString()}</strong> fixed so far</span>
 </>
 )}
 art={<PageArt3D model="issues" label="A traffic cone and warning sign beside a pothole" />}
 />

 {}
 <div className="max-w-5xl mx-auto px-4 mt-8 mb-8">
 <h2 className="text-[13px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-4 px-1">Filter Incidents by Infrastructure Sector</h2>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
 <button 
 onClick={() => { setCategory(""); setPage(1); }}
 className={`relative flex flex-col items-start justify-end w-full aspect-[4/3] rounded-md p-3 overflow-hidden transition-all duration-300 group ${category ===""?'ring-2 ring-slate-800 ring-offset-2 ring-offset-background':'hover:opacity-95'}`}
 >
 <img 
 src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80"alt="All Reports"onError={handleImageError}
 className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"/>
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20"></div>

 <i className="ri-list-check-2 text-2xl tracking-tight text-white/80 mb-auto relative z-10"></i>
 <div className="relative z-10">
 <span className="block text-[13px] sm:text-[13px] font-bold text-white text-left">All Active Reports</span>
 <span className="block text-xs text-slate-300 mt-0.5 text-left">453 Total</span>
 </div>
 </button>
 
 {categories.map((c) => (
 <button 
 key={c.label}
 onClick={() => { setCategory(c.label); setPage(1); }}
 className={`relative w-full aspect-[4/3] rounded-md overflow-hidden transition-all duration-300 group ${category === c.label ?'ring-2 ring-slate-800 ring-offset-2 ring-offset-background':'hover:opacity-95'}`}
 >
 <img 
 src={c.image} 
 alt={c.label} 
 onError={handleImageError}
 className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"/>
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
 
 <div className="absolute bottom-3 left-3 right-3 text-left">
 <span className="block text-[13px] sm:text-[13px] font-bold text-white leading-tight mb-0.5">{c.label}</span>
 <span className="block text-xs text-slate-300">
 {c.count} Reports
 </span>
 </div>
 </button>
 ))}
 </div>

 {}
 <div className="flex justify-center mt-4">
 <button className="text-[13px] font-bold text-slate-500 dark:text-slate-300 hover:text-[#40826D] transition-colors flex items-center gap-1 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] px-5 py-2.5 rounded-full shadow-sm">
 Load More Categories
 <i className="ri-arrow-down-s-line"></i>
 </button>
 </div>
 </div>

 <div className="max-w-2xl mx-auto px-4">
 
 {}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-3 mb-6 flex gap-3 items-center">
 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] flex items-center justify-center flex-shrink-0 overflow-hidden">
 <i className="ri-user-smile-line text-[13px] tracking-tight text-slate-400"></i>
 </div>
 <button 
 onClick={() => navigate("/issues/add")}
 className="flex-grow bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] transition-colors rounded-md h-10 px-4 text-left text-slate-500 dark:text-slate-300 font-medium border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 Create Post...
 </button>
 <button onClick={() => navigate("/issues/add")} className="w-10 h-10 rounded-md hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors">
 <i className="ri-image-add-line text-[13px] tracking-tight"></i>
 </button>
 <button onClick={() => navigate("/issues/add")} className="w-10 h-10 rounded-md hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors">
 <i className="ri-link text-[13px] tracking-tight"></i>
 </button>
 </div>

 {}
 <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
 <div className="relative w-full sm:w-auto flex-grow max-w-sm">
 <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
 <input 
 type="text"placeholder="Search..."value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
 className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[13px] font-medium"/>
 </div>
 
 <div className="flex gap-2 w-full sm:w-auto">
 <PremiumDropdown 
 options={areaOptions} 
 value={area} 
 onChange={(v) => { setArea(v); setPage(1); }} 
 placeholder="Area"icon="ri-map-pin-line"/>
 <PremiumDropdown 
 options={sortOptions} 
 value={sort} 
 onChange={(v) => { setSort(v); setPage(1); }} 
 placeholder="Sort"icon="ri-filter-3-line"/>
 </div>
 </div>

 {}
 <div className="relative z-10 space-y-4">
 {isLoading ? (
 <div className="flex justify-center items-center py-12">
 <MinimalLoader />
 </div>
 ) : issues.length === 0 ? (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center py-24 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] border-dashed">
 <div className="w-20 h-20 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-full flex items-center justify-center mx-auto mb-4">
 <i className="ri-cactus-line text-4xl tracking-tight text-slate-400"></i>
 </div>
 <h3 className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] tracking-tight">Wow, such empty</h3>
 <p className="text-slate-500 dark:text-slate-300 text-[13px] mt-1">No issues match your current filters.</p>
 <button 
 onClick={() => { setSearch(""); setCategory(""); setArea(""); setPage(1); }}
 className="mt-4 px-6 py-2 text-[13px] font-bold text-[#40826D] bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 rounded-full transition-colors">
 Clear all filters
 </button>
 </motion.div>
 ) : (
 <AnimatePresence mode="popLayout">
 {issues.map((issue) => (
 <SocialFeedCard key={issue._id} issue={issue} />
 ))}
 </AnimatePresence>
 )}
 </div>

 {}
 {page < totalPages && (
 <div className="flex justify-center mt-8 mb-8">
 <motion.button 
 onClick={() => setPage(p => p + 1)}
 className="relative overflow-hidden text-[13px] font-bold text-slate-500 dark:text-slate-300 hover:text-[#40826D] transition-colors flex items-center gap-1 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] px-5 py-2.5 rounded-full shadow-sm group"whileTap="tapped">
 <motion.div 
 variants={{
 tapped: { width:"100%", opacity: 1, transition: { duration: 0.3 } }
 }}
 initial={{ width:"0%", opacity: 0 }}
 className="absolute left-0 top-0 bottom-0 bg-[#40826D]/10 rounded-full z-0 pointer-events-none"/>
 <span className="relative z-10 flex items-center gap-2">
 Load More Posts
 <i className="ri-refresh-line"></i>
 </span>
 </motion.button>
 </div>
 )}
 </div>
 </div>
 );
};

export default AllIssues;