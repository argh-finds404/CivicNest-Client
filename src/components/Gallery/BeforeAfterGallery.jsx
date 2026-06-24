import React, { useState } from"react";
import { useQuery, keepPreviousData } from"@tanstack/react-query";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import { motion } from"framer-motion";
import { FiMapPin, FiCalendar, FiTrendingUp, FiCheckCircle } from"react-icons/fi";
import MinimalLoader from"../common/MinimalLoader";

const BeforeAfterGallery = () => {
 const [selectedArea, setSelectedArea] = useState("");
 const axiosPublic = useAxiosPublic();

 // Fetch gallery items
 const { data = {}, isLoading, isFetching } = useQuery({
 queryKey: ["gallery", selectedArea],
 queryFn: async () => {
 const url = selectedArea ?`/gallery?area=${selectedArea}`:"/gallery";
 const res = await axiosPublic.get(url);
 return res.data || { issues: [] };
 },
 staleTime: 2 * 60 * 1000, // cache for 2 minutes
 placeholderData: keepPreviousData,
 });

 const issues = data.issues || [];

 // Get distinct areas for filter dropdown
 const areas = ["Mirpur","Uttara","Dhanmondi","Gulshan","Badda","Mohammadpur","Motijheel"];

 return (
 <div className="min-h-screen pt-32 pb-20 px-[5%] bg-[#fafafa] dark:bg-[#050a08] text-slate-800 dark:text-white dark:text-[#cbd5e1] relative overflow-hidden">
 {/* Decorative background blurs */}
 <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[55%] bg-teal-500 opacity-[0.06] blur-[160px] rounded-full pointer-events-none"/>
 <div className="absolute bottom-[-10%] right-[-15%] w-[40%] h-[50%] bg-emerald-500 opacity-[0.04] blur-[150px] rounded-full pointer-events-none"/>

 <div className="max-w-7xl mx-auto relative z-10">
 {/* Header */}
 <div className="text-center mb-16">
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4 shadow-sm">
 <FiCheckCircle className="text-teal-600 dark:text-teal-400"/>
 <span className="text-teal-700 dark:text-teal-400 text-xs font-black uppercase tracking-widest">Community Impact Gallery</span>
 </motion.div>
 
 <motion.h1
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="text-5xl tracking-tight md:text-6xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-teal-700 dark:from-white dark:via-slate-100 dark:to-teal-400 bg-clip-text text-transparent drop-shadow-sm">
 Real Problems. Real Solutions.
 </motion.h1>
 
 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.2 }}
 className="text-slate-500 dark:text-slate-300 max-w-xl mx-auto mt-4 text-[13px] font-bold tracking-tight">
 Proof of local change powered by active neighbors and volunteers. Here is the before and after of resolved complaints.
 </motion.p>
 </div>

 {/* Filter Controls */}
 <div className="flex justify-center mb-12">
 <div className="bg-slate-50 dark:bg-[#0b1215] dark:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/5 border border-slate-200 dark:border-[#1e3040]/60 dark:border-white/10 p-2.5 rounded-lg flex items-center gap-4 backdrop-blur-xl shadow-md w-full max-w-md relative">
 <span className="text-slate-500 dark:text-slate-300 text-xs font-bold pl-3 uppercase tracking-wider shrink-0">Filter Area:</span>
 <select
 value={selectedArea}
 onChange={(e) => setSelectedArea(e.target.value)}
 className="flex-grow bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-white/5 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all font-semibold shadow-sm">
 <option value="">All Areas</option>
 {areas.map((area) => (
 <option key={area} value={area}>
 {area}
 </option>
 ))}
 </select>
 {isFetching && !isLoading && (
 <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
 <MinimalLoader size="sm"color="#0f766e"/>
 </div>
 )}
 </div>
 </div>

 {/* Loading Spinner (Only for initial page load) */}
 {isLoading && (
 <div className="py-12 flex justify-center">
 <MinimalLoader size="lg"color="#0f766e"/>
 </div>
 )}

 {/* Empty State */}
 {!isLoading && issues.length === 0 && (
 <div className="text-center py-12 bg-slate-50 dark:bg-[#0b1215] dark:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/5 border border-slate-100 dark:border-white/5 backdrop-blur-md rounded-lg p-10 max-w-lg mx-auto shadow-sm">
 <span className="text-4xl tracking-tight">🌱</span>
 <h3 className="text-lg tracking-tight font-bold mt-4 text-slate-800 dark:text-white tracking-tight">No Success Stories Found</h3>
 <p className="text-slate-500 dark:text-slate-300 text-xs mt-2 font-semibold">
 No issues have been fully resolved and verified in this area yet. Be the first to report or volunteer!
 </p>
 </div>
 )}

 {/* Masonry/Flex Grid */}
 {!isLoading && issues.length > 0 && (
 <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 transition-opacity duration-300 ${isFetching ?"opacity-60 pointer-events-none":""}`}>
 {issues.map((issue, index) => (
 <motion.div
 key={issue._id}
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: index * 0.05 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0b120f]/80 ring-1 ring-slate-100 dark:ring-white/5 border border-slate-100 dark:border-white/5 hover:border-teal-500/20 backdrop-blur-xl rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
 {/* Images side-by-side split layout */}
 <div className="grid grid-cols-2 aspect-[16/10] bg-slate-950 relative border-b border-slate-100 dark:border-white/5">
 {/* Before */}
 <div className="relative overflow-hidden group">
 <img
 src={issue.beforeImage}
 alt="Before cleanup"className="w-full h-full object-cover grayscale opacity-70 group-hover:scale-105 group-hover:opacity-85 transition duration-500"/>
 <div className="absolute top-3 left-3 bg-red-600/90 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-md tracking-wider">
 Before
 </div>
 </div>

 {/* After */}
 <div className="relative overflow-hidden border-l border-white/10 group">
 <img
 src={issue.afterImage}
 alt="After resolution"className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
 <div className="absolute top-3 right-3 bg-emerald-600/90 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-md tracking-wider">
 Resolved ✓
 </div>
 </div>
 </div>

 {/* Content */}
 <div className="p-4">
 <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider">
 {issue.category}
 </span>
 
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mt-3 truncate leading-snug tracking-tight">
 {issue.title}
 </h3>

 <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-slate-550 font-semibold border-t border-slate-100 dark:border-white/5 pt-4">
 <div className="flex items-center gap-1.5">
 <FiMapPin className="text-teal-400"/>
 <span>{issue.area}, {issue.location.split(",")[0]}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <FiCalendar className="text-emerald-400"/>
 <span>{new Date(issue.resolvedAt).toLocaleDateString()}</span>
 </div>
 <div className="flex items-center gap-1.5 ml-auto">
 <FiTrendingUp className="text-amber-400 animate-pulse"/>
 <span>{issue.upvotesCount} community upvotes</span>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
};

export default BeforeAfterGallery;
