import React, { useState, useEffect } from"react";
import SEO from "../common/SEO";
import { useQuery } from"@tanstack/react-query";
import { Link, useSearchParams } from"react-router";
import { motion, AnimatePresence } from"framer-motion";
import LostFoundCard from"../cards/LostFoundCard";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import MinimalLoader from'../common/MinimalLoader.jsx';
import PageHeader from'../common/PageHeader';
import PageArt3D from'../three/PageArt3D';
import SectionFilterChips from'../common/SectionFilterChips';
import { 
 Search, 
 Gift, 
 Layers, 
 Cat, 
 Smartphone, 
 FileText, 
 Key, 
 Shirt, 
 Package,
 X
} from"lucide-react";

const TYPE_TOGGLE = [
 { label:'Lost', value:'lost', icon: <Search className="w-4 h-4"/> },
 { label:'Found', value:'found', icon: <Gift className="w-4 h-4"/> },
];

const CATEGORY_FILTERS = [
 { label:'All', value: null, icon: <Layers className="w-3.5 h-3.5"/> },
 { label:'Pets', value:'pets', icon: <Cat className="w-3.5 h-3.5"/> },
 { label:'Electronics', value:'electronics', icon: <Smartphone className="w-3.5 h-3.5"/> },
 { label:'Documents', value:'documents', icon: <FileText className="w-3.5 h-3.5"/> },
 { label:'Keys', value:'keys', icon: <Key className="w-3.5 h-3.5"/> },
 { label:'Clothing', value:'clothing', icon: <Shirt className="w-3.5 h-3.5"/> },
 { label:'Other', value:'other', icon: <Package className="w-3.5 h-3.5"/> },
];

export default function LostFoundBrowse() {
 const axiosSecure = useAxiosSecure();
 const [searchParams, setSearchParams] = useSearchParams();
 const typeView = searchParams.get('type') ==='found'?'found':'lost';
 const [categoryFilter, setCategoryFilter] = useState(null);
 const [inputValue, setInputValue] = useState("");
 const [searchQuery, setSearchQuery] = useState("");

 useEffect(() => {
 const handler = setTimeout(() => {
 setSearchQuery(inputValue);
 }, 400);
 return () => clearTimeout(handler);
 }, [inputValue]);

 const { data: stats } = useQuery({
 queryKey: ["lostfound-stats"],
 queryFn: async () => {
 const res = await axiosSecure.get("/lost-found/stats");
 return res.data;
 },
 staleTime: 5 * 60 * 1000,
 });

 const { data: items = [], isLoading } = useQuery({
 queryKey: ["lost-found", searchQuery],
 queryFn: async () => {
 const res = await axiosSecure.get("/lost-found", {
 params: { search: searchQuery }
 });
 return res.data;
 },
 staleTime: 5 * 60 * 1000,
 });

 const filteredItems = items.filter(item => {
 const matchesType = item.type === typeView;
 const matchesCategory = !categoryFilter || item.category === categoryFilter;
 return matchesType && matchesCategory;
 });

 const statsData = stats ? [
 { value: stats.active, label:'Active'},
 { value: stats.reunited, label:'Reunited'},
 { value: stats.thisWeek, label:'This Week'},
 ] : [];


 return (
 <div className="min-h-screen bg-[#F8FAFC]">
 <SEO title="Lost & Found Hub" canonical={`${window.location.origin}/lost-found`} />
 <PageHeader
 width="calc(80rem + 10%)"
 gutter="5%"
 art={<PageArt3D model="lostfound" label="A magnifying glass searching over a lost key and wallet" />}
 title="Lost & found"
 description={typeView ==='lost'
 ? "Lost a wallet, a phone or a pet? Post it here so neighbours know to look out for it."
 : "Found something on the street? Post it here and help it get back to its owner."}
 actions={
 <Link to={typeView ==='lost'?"/lost-found/add-lost":"/lost-found/add-found"} className="cn-btn cn-btn-signal">
 {typeView ==='lost' ? <Search className="w-4 h-4" aria-hidden="true" /> : <Gift className="w-4 h-4" aria-hidden="true" />}
 {typeView ==='lost'?'Report something lost':'Report something found'}
 </Link>
 }
 meta={statsData.map((s) => (
 <span key={s.label}><strong>{s.value ?? 0}</strong> {s.label.toLowerCase()}</span>
 ))}
 />

 {/* Content Section */}
 <div className="px-[5%] py-8">
 <div className="max-w-7xl mx-auto">
 {/* Type Toggle */}
 <div className="mb-8">
 <div className="flex bg-slate-200/55 dark:bg-white/5 p-1.5 rounded-2xl max-w-md mx-auto relative border border-slate-200 dark:border-white/10 select-none">
 {TYPE_TOGGLE.map(type => {
 const isActive = typeView === type.value;
 return (
 <button
 key={type.value}
 onClick={() => {
 setSearchParams({ type: type.value });
 }}
 className={`relative flex-grow flex items-center justify-center gap-2 py-3 text-[13px] font-bold rounded-xl transition-all duration-300 cursor-pointer z-10 select-none
 ${isActive
 ?'text-white':'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'}`}
 >
 {isActive && (
 <motion.div
 layoutId="activeLostFoundToggle"className={`absolute inset-0 rounded-xl shadow-md z-0 ${
 type.value ==='lost'?'bg-rose-500':'bg-emerald-600'}`}
 transition={{ type:'spring', stiffness: 380, damping: 30 }}
 />
 )}
 <span className="relative z-20 flex items-center justify-center gap-2">
 {type.icon}
 <span>{type.label}</span>
 </span>
 </button>
 );
 })}
 </div>
 </div>

 {/* Search Input Bar */}
 <div className="max-w-md mx-auto mb-6 relative">
 <input
 type="text"value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 placeholder="Search items by name or description..."className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg outline-none transition-all shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 font-medium text-slate-800 dark:text-white placeholder:text-slate-400 text-[13px]"/>
 <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"/>
 {inputValue && (
 <button 
 onClick={() => setInputValue("")}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300 cursor-pointer">
 <X className="w-4 h-4"/>
 </button>
 )}
 </div>

 {/* Category Filter Chips */}
 <div className="mb-8 overflow-x-auto py-2 px-1 -mx-1 flex justify-center">
 <SectionFilterChips chips={CATEGORY_FILTERS} value={categoryFilter} onChange={setCategoryFilter} />
 </div>

 {/* Grid */}
 {isLoading ? (
 <div className="flex justify-center py-12">
 <MinimalLoader />
 </div>
 ) : filteredItems.length === 0 ? (
 <div className="text-center py-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] max-w-xl mx-auto shadow-sm">
 <div className="w-20 h-20 bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100/80">
 {typeView ==='lost'? (
 <Search className="w-8 h-8 text-rose-500"/>
 ) : (
 <Gift className="w-8 h-8 text-emerald-500"/>
 )}
 </div>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
 No {typeView ==='lost'?'lost':'found'} items found
 </h3>
 <p className="text-slate-500 dark:text-slate-300 text-[13px] max-w-sm mx-auto font-medium">
 Try a different category, or be the first to {typeView ==='lost'?'report a lost':'report a found'} item.
 </p>
 <Link
 to={typeView ==='lost'?"/lost-found/add-lost":"/lost-found/add-found"}
 className="mt-6 inline-block px-6 py-3 bg-[var(--g-600)] text-white rounded-xl font-bold shadow-lg hover:shadow-[var(--g-600)]/30 transition-all cursor-pointer">
 {typeView ==='lost'?'Report Lost Item':'Report Found Item'}
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredItems.map((item, index) => (
 <motion.div
 key={item._id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 >
 <LostFoundCard item={item} />
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}