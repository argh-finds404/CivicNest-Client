import React, { useState, useEffect, useCallback } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { useNavigate } from'react-router';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import SocialFeedCard from'../cards/SocialFeedCard';
import { Typewriter } from'react-simple-typewriter';
import MinimalLoader from'../common/MinimalLoader.jsx';
import PremiumDropdown from'../common/PremiumDropdown';

const FundCleanup = () => {
 const navigate = useNavigate();
 const axiosPublic = useAxiosPublic();
 const [issues, setIssues] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 
 // Filters state
 const [search, setSearch] = useState("");
 const [sort, setSort] = useState("most_funded");
 
 // Pagination
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 const fetchIssues = useCallback(async () => {
 setIsLoading(true);
 try {
 const queryParams = new URLSearchParams({ page, limit: 10, crowdfunding:'true'});
 if (search) queryParams.append('search', search);
 if (sort !=='newest') queryParams.append('sort', sort);

 const res = await axiosPublic.get(`/issues?${queryParams.toString()}`);
 const data = res.data;
 
 if (!data.issues || data.issues.length === 0) {
 setIssues([]);
 setTotalPages(1);
 } else {
 setIssues(data.issues);
 setTotalPages(data.totalPages);
 }
 } catch (error) {
 console.error(error);
 setIssues([]);
 setTotalPages(1);
 } finally {
 setIsLoading(false);
 }
 }, [search, sort, page]);

 useEffect(() => {
 const timer = setTimeout(() => fetchIssues(), 400);
 return () => clearTimeout(timer);
 }, [fetchIssues]);

 const sortOptions = [
 { label:"Highest Funded", value:"most_funded"},
 { label:"Newest First", value:"newest"},
 { label:"Most Upvoted", value:"most_upvoted"}
 ];

 return (
 <div className="bg-[#F8FAFC] min-h-screen pt-28 pb-16 font-body text-slate-900 dark:text-white">
 
 {/* Top Header */}
 <div className="max-w-5xl mx-auto px-4 md:px-6 mb-8 text-center md:text-left">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100/50 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4 border border-pink-200">
 <i className="ri-heart-3-fill"></i> Community Funding
 </div>
 <h1 className="text-4xl tracking-tight md:text-5xl tracking-tight font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
 Fund a Cleanup
 </h1>
 <p className="text-[13px] text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto md:mx-0">
 Support community drives with micro-donations. Every contribution helps build a{" "}
 <span className="text-[#db2777] font-bold">
 <Typewriter
 words={['cleaner city.','healthier environment.','brighter future.']}
 loop={0}
 cursor
 cursorStyle='|'typeSpeed={70}
 deleteSpeed={50}
 delaySpeed={1500}
 />
 </span>
 </p>
 </div>

 <div className="max-w-2xl mx-auto px-4">
 
 {/* Feed Controls */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 mb-8">
 <div className="relative w-full sm:w-auto flex-grow max-w-sm">
 <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
 <input 
 type="text"placeholder="Search drives..."value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
 className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-[13px] font-medium"/>
 </div>
 
 <div className="w-full sm:w-48">
 <PremiumDropdown 
 options={sortOptions} 
 value={sort} 
 onChange={(v) => { setSort(v); setPage(1); }} 
 placeholder="Sort By"icon="ri-filter-3-line"/>
 </div>
 </div>

 {/* Main Feed */}
 <div className="relative z-10 space-y-6">
 {isLoading ? (
 <div className="flex justify-center items-center py-12">
 <MinimalLoader />
 </div>
 ) : issues.length === 0 ? (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center py-24 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] border-dashed">
 <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
 <i className="ri-hand-heart-line text-4xl tracking-tight text-pink-400"></i>
 </div>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white tracking-tight">No campaigns found</h3>
 <p className="text-slate-500 dark:text-slate-300 text-[13px] mt-2 max-w-sm mx-auto">There are no active crowdfunding campaigns matching your criteria right now.</p>
 <button 
 onClick={() => { setSearch(""); setSort("most_funded"); setPage(1); }}
 className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
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

 {/* Pagination for Feed */}
 {totalPages > 1 && (
 <div className="flex justify-center mt-12 mb-8">
 <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-2 rounded-lg shadow-sm border border-slate-100">
 <button 
 className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 disabled:opacity-50 flex items-center justify-center transition-colors"onClick={() => setPage(p => Math.max(1, p - 1))}
 disabled={page === 1}
 >
 <i className="ri-arrow-left-s-line text-[13px] tracking-tight"></i>
 </button>
 <div className="px-4 text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">
 {page} <span className="text-slate-400 font-medium mx-1">of</span> {totalPages}
 </div>
 <button 
 className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 disabled:opacity-50 flex items-center justify-center transition-colors"onClick={() => setPage(p => Math.min(totalPages, p + 1))}
 disabled={page === totalPages}
 >
 <i className="ri-arrow-right-s-line text-[13px] tracking-tight"></i>
 </button>
 </div>
 </div>
 )}

 </div>
 </div>
 );
};

export default FundCleanup;
