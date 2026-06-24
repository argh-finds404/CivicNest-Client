import React, { useState } from'react';
import SEO from '../common/SEO';
import { useQuery } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { Link } from'react-router';
import { motion } from'framer-motion';
import { Building2 } from'lucide-react';
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton';
import SectionStats from'../common/SectionStats';
import SectionFilterChips from'../common/SectionFilterChips';
import NGOCard from'../cards/NGOCard.jsx';

const FOCUS_FILTERS = [
 { label:'All', value: null },
 { label:'Environment 🌿', value:'environment'},
 { label:'Education 📚', value:'education'},
 { label:'Health 🏥', value:'health'},
 { label:'Animals 🐾', value:'animals'},
 { label:'Community 👥', value:'community'},
];

export default function NGODirectory() {
 const axiosSecure = useAxiosSecure();
 const [focusFilter, setFocusFilter] = useState(null);
 const [verifiedOnly, setVerifiedOnly] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');

 const { data: stats } = useQuery({
 queryKey: ["ngos-stats"],
 queryFn: async () => {
 const res = await axiosSecure.get('/ngos/stats');
 return res.data;
 },
 staleTime: 5 * 60 * 1000,
 });

 const { data: ngos = [], isLoading } = useQuery({
 queryKey: ['ngos', focusFilter, verifiedOnly, searchQuery],
 queryFn: async () => {
 const params = {};
 if (searchQuery) params.search = searchQuery;
 // The backend already handles verified filter
 
 const res = await axiosSecure.get('/ngos', { params });
 return res.data;
 },
 staleTime: 5 * 60 * 1000,
 });

 const filteredNGOs = ngos.filter(ngo => {
 const matchesVerified = !verifiedOnly || ngo.status ==='verified';
 const matchesFocus = !focusFilter || ngo.focusAreas?.includes(focusFilter);
 const matchesSearch = !searchQuery || 
 ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 ngo.mission.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesVerified && matchesFocus && matchesSearch;
 });

 const statsData = stats ? [
 { value: stats.total, label:'Partner NGOs'},
 { value: stats.verified, label:'Verified'},
 { value:'100+', label:'Communities'},
 ] : [];

 return (
 <div className="min-h-screen bg-[#f0fdf4]">
 <SEO title="Verified NGO Directory" canonical={`${window.location.origin}/ngos`} />
 {/* Banner Section */}
 <div className="relative pt-28 pb-12 px-[5%] bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 overflow-hidden">
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full blur-3xl"></div>
 <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
 </div>

 <div className="relative z-10 max-w-7xl mx-auto">
 {/* Back Button */}
 <div className="mb-4">
 <BackButton variant="light"/>
 </div>

 <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
 <div className="text-white">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 text-emerald-300">
 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
 <span className="text-[13px] font-semibold uppercase tracking-wider">NGO Directory</span>
 </div>
 <h1 className="font-heading text-4xl tracking-tight md:text-5xl tracking-tight font-extrabold mb-4 leading-tight tracking-tight">
 Connect with Organizations
 </h1>
 <p className="font-body text-white/80 text-[13px] max-w-2xl">
 Discover and support verified Non-Governmental Organizations working to improve our community.
 </p>
 </div>

 <Link to="/ngos/register"className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-emerald-50 text-teal-700 font-bold rounded-lg shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105">
 <Building2 className="w-6 h-6"/>
 <span>Register NGO</span>
 </Link>
 </div>

 {/* Stats */}
 <SectionStats stats={statsData} />
 </div>
 </div>

 {/* Content Section */}
 <div className="px-[5%] py-8">
 <div className="max-w-7xl mx-auto">
 {/* Search & Filters */}
 <div className="mb-6 space-y-4">
 {/* Search Bar */}
 <div className="relative">
 <input
 type="text"placeholder="🔍 Search NGO name or focus area..."value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full px-6 py-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--g-300)] focus:ring-1 focus:ring-[var(--g-300)]/50 transition-all"/>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap items-center gap-4">
 <SectionFilterChips chips={FOCUS_FILTERS} value={focusFilter} onChange={setFocusFilter} />
 
 <button
 onClick={() => setVerifiedOnly(!verifiedOnly)}
 className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all
 ${verifiedOnly
 ?'bg-[var(--g-600)] border-[var(--g-600)] text-white shadow-sm':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] text-gray-600 dark:text-slate-300 hover:border-[var(--g-200)] hover:text-[var(--g-600)]'}`}
 >
 Verified Only
 </button>
 </div>
 </div>

 {/* Grid */}
 {isLoading ? (
 <div className="flex justify-center py-12">
 <MinimalLoader />
 </div>
 ) : filteredNGOs.length === 0 ? (
 <div className="text-center py-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="w-20 h-20 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
 <Building2 className="w-10 h-10 text-slate-300"/>
 </div>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-900 dark:text-white mb-2 tracking-tight">No NGOs found</h3>
 <p className="text-slate-500 dark:text-slate-300 max-w-sm mx-auto">
 There are currently no verified NGOs in the directory matching your criteria.
 </p>
 <Link
 to="/ngos/register"className="mt-6 inline-block px-6 py-3 bg-[var(--g-600)] text-white rounded-xl font-bold shadow-lg hover:shadow-[var(--g-600)]/30 transition-all">
 Register Your NGO
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredNGOs.map((ngo, idx) => (
 <motion.div
 key={ngo._id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.05 }}
 >
 <NGOCard ngo={ngo} />
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}