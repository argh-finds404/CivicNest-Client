import React, { useState } from'react';
import SEO from '../common/SEO';
import { useQuery } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { Link } from'react-router';
import { motion } from'framer-motion';
import { Building2 } from'lucide-react';
import MinimalLoader from'../common/MinimalLoader.jsx';
import PageHeader from'../common/PageHeader';
import PageArt from "../common/PageArt";
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
 ] : [];

 return (
 <div className="min-h-screen bg-[#f0fdf4]">
 <SEO title="Verified NGO Directory" canonical={`${window.location.origin}/ngos`} />
 <PageHeader
 width="calc(80rem + 10%)"
 gutter="5%"
 art={<PageArt scene="ngos" />}
 title="NGOs"
 description="Local organisations doing the long-term work: shelters, clean-water groups, youth clubs. Find one to support, or register yours."
 actions={
 <Link to="/ngos/register" className="cn-btn cn-btn-signal">
 <Building2 className="w-4 h-4" aria-hidden="true" />
 Register an NGO
 </Link>
 }
 meta={statsData.map((s) => (
 <span key={s.label}><strong>{s.value ?? 0}</strong> {s.label.toLowerCase()}</span>
 ))}
 />

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