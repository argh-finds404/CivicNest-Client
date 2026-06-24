import React, { useState } from'react';
import { useQuery, useQueryClient } from'@tanstack/react-query';
import { Link } from'react-router';
import toast from'react-hot-toast';
import { motion } from'framer-motion';
import PollCard from'../cards/PollCard';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import MinimalLoader from'../common/MinimalLoader';
import BackButton from'../common/BackButton';
import SectionStats from'../common/SectionStats';
import SectionFilterChips from'../common/SectionFilterChips';
import CreatePollModal from'./CreatePollModal';
import { useRole } from'../../hooks/useRole';
import { 
 Clock, 
 CheckCircle2, 
 Layers, 
 Users, 
 Leaf, 
 Calendar, 
 Building2, 
 MessageSquare,
 Plus,
 BarChart3,
 Search
} from'lucide-react';

const STATUS_FILTERS = [
 { label:'Active', value:'active', icon: <Clock className="w-3.5 h-3.5"/> },
 { label:'Ended', value:'ended', icon: <CheckCircle2 className="w-3.5 h-3.5"/> },
 { label:'All Statuses', value: null, icon: <Layers className="w-3.5 h-3.5"/> },
];

const CATEGORY_FILTERS = [
 { label:'All Topics', value: null, icon: <Layers className="w-3.5 h-3.5"/> },
 { label:'Community', value:'community', icon: <Users className="w-3.5 h-3.5"/> },
 { label:'Environment', value:'environment', icon: <Leaf className="w-3.5 h-3.5"/> },
 { label:'Events', value:'events', icon: <Calendar className="w-3.5 h-3.5"/> },
 { label:'Infrastructure', value:'infrastructure', icon: <Building2 className="w-3.5 h-3.5"/> },
 { label:'General', value:'general', icon: <MessageSquare className="w-3.5 h-3.5"/> },
];

const LOCAL_DUMMY_POLLS = [
 {
 _id:"dummy-1",
 question:"Should we install automated waste segregation bins in the central park?",
 type:"yesno",
 options: [
 { id:"opt-1-1", text:"Yes", votes: 8, order: 0 },
 { id:"opt-1-2", text:"No", votes: 3, order: 1 }
 ],
 category:"environment",
 createdBy:"citizen@civicnest.demo",
 createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
 endsAt: null, // Open ended / No time limit
 status:"active",
 totalVotes: 11,
 voters: [],
 allowAnonymous: false,
 isDummy: true
 },
 {
 _id:"dummy-2",
 question:"Which park area should be prioritized for the upcoming tree plantation drive?",
 type:"single",
 options: [
 { id:"opt-2-1", text:"North Sector Playground", votes: 15, order: 0 },
 { id:"opt-2-2", text:"South Sector Lake Side", votes: 24, order: 1 },
 { id:"opt-2-3", text:"West Sector Walking Path", votes: 9, order: 2 }
 ],
 category:"community",
 createdBy:"citizen@civicnest.demo",
 createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
 endsAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 23 * 60 * 65 * 1000).toISOString(), // Time limited: 9d 23h
 status:"active",
 totalVotes: 48,
 voters: [],
 allowAnonymous: false,
 isDummy: true
 },
 {
 _id:"dummy-3",
 question:"How satisfied are you with the current cleanliness schedule in our neighborhood?",
 type:"survey",
 options: [
 { id:"opt-3-1", text:"Very Satisfied", votes: 22, order: 0 },
 { id:"opt-3-2", text:"Somewhat Satisfied", votes: 18, order: 1 },
 { id:"opt-3-3", text:"Neutral", votes: 12, order: 2 },
 { id:"opt-3-4", text:"Dissatisfied", votes: 5, order: 3 }
 ],
 category:"general",
 createdBy:"citizen@civicnest.demo",
 createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
 endsAt: null, // Survey type / Open ended
 status:"active",
 totalVotes: 57,
 voters: [],
 allowAnonymous: true,
 isDummy: true
 }
];

export default function PollsBrowse() {
 const axiosSecure = useAxiosSecure();
 const [statusFilter, setStatusFilter] = useState('active');
 const [categoryFilter, setCategoryFilter] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [role] = useRole();

 const isAdminOrMod = role ==='admin';

 const statusFilters = [
 { label:'Active', value:'active', icon: <Clock className="w-3.5 h-3.5"/> },
 { label:'Ended', value:'ended', icon: <CheckCircle2 className="w-3.5 h-3.5"/> },
 ...(isAdminOrMod ? [{ label:'Pending Approval', value:'pending', icon: <Layers className="w-3.5 h-3.5 text-amber-500 animate-pulse"/> }] : []),
 { label:'All Statuses', value: null, icon: <Layers className="w-3.5 h-3.5"/> },
 ];

 const { data: stats } = useQuery({
 queryKey: ["polls-stats"],
 queryFn: async () => {
 const res = await axiosSecure.get("/polls/stats");
 return res.data;
 },
 refetchInterval: 5000,
 });

 const { data: polls = [], isLoading } = useQuery({
 queryKey: ["polls", statusFilter, categoryFilter, searchQuery, role],
 queryFn: async () => {
 const params = {};
 if (statusFilter) params.status = statusFilter;
 if (categoryFilter) params.category = categoryFilter;
 if (searchQuery) params.search = searchQuery;
 
 const res = await axiosSecure.get("/polls", { params });
 return res.data;
 },
 refetchInterval: 5000,
 });

 const queryClient = useQueryClient();

 const filteredDummyPolls = LOCAL_DUMMY_POLLS.filter(poll => {
 // 1. Status Filter
 if (statusFilter ==='active') {
 const isEnded = new Date(poll.endsAt) < new Date() || poll.status ==='ended';
 if (isEnded || poll.status ==='pending') return false;
 } else if (statusFilter ==='ended') {
 const isEnded = new Date(poll.endsAt) < new Date() || poll.status ==='ended';
 if (!isEnded) return false;
 } else if (statusFilter ==='pending') {
 if (poll.status !=='pending') return false;
 }
 
 // 2. Category Filter
 if (categoryFilter && poll.category !== categoryFilter) {
 return false;
 }
 
 // 3. Search Filter
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 if (!poll.question.toLowerCase().includes(q) && !poll.category.toLowerCase().includes(q)) {
 return false;
 }
 }
 
 return true;
 });

 const displayPolls = [...polls, ...filteredDummyPolls];

 const totalDummyActive = LOCAL_DUMMY_POLLS.filter(p => {
 const isEnded = new Date(p.endsAt) < new Date() || p.status ==='ended';
 return !isEnded;
 }).length;
 const totalDummyVotes = LOCAL_DUMMY_POLLS.reduce((acc, p) => acc + p.totalVotes, 0);
 const totalDummyCount = LOCAL_DUMMY_POLLS.length;

 const statsData = stats ? [
 { value: stats.active + totalDummyActive, label:'Active Polls'},
 { value: stats.totalVotes + totalDummyVotes, label:'Total Votes'},
 { value: stats.total + totalDummyCount, label:'Total Polls'},
 ] : [
 { value: totalDummyActive, label:'Active Polls'},
 { value: totalDummyVotes, label:'Total Votes'},
 { value: totalDummyCount, label:'Total Polls'},
 ];

 return (
 <div className="min-h-screen bg-[#f0fdf4]">
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
 <span className="text-[13px] font-bold uppercase tracking-wider">Community Polls</span>
 </div>
 <h1 className="font-heading text-4xl tracking-tight md:text-5xl tracking-tight font-extrabold mb-4 leading-tight tracking-tight">
 Voice Your Opinion
 </h1>
 <p className="font-body text-white/80 text-[13px] max-w-2xl">
 Participate in community polls to help shape decisions. Every vote matters.
 </p>
 </div>

 <div className="flex items-center gap-4 flex-wrap">
 <button
 onClick={() => document.getElementById('create-poll-modal').showModal()}
 className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-emerald-50 text-teal-700 font-bold rounded-lg shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105 cursor-pointer">
 <Plus className="w-5 h-5"/>
 <span>Create Poll</span>
 </button>
 </div>
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
 <div className="relative flex items-center">
 <Search className="absolute left-5 w-5 h-5 text-slate-400 pointer-events-none"/>
 <input
 type="text"placeholder="Search polls..."value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--g-300)] focus:ring-1 focus:ring-[var(--g-300)]/50 transition-all"/>
 </div>

 {/* Filters */}
 <div className="flex flex-col gap-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/40 backdrop-blur-sm p-4 rounded-lg border border-[#e6eee9] select-none shadow-sm">
 <div className="flex items-center gap-4 flex-wrap">
 <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest min-w-[70px]">Status</span>
 <SectionFilterChips chips={statusFilters} value={statusFilter} onChange={setStatusFilter} />
 </div>
 <div className="flex items-center gap-4 flex-wrap">
 <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest min-w-[70px]">Category</span>
 <SectionFilterChips chips={CATEGORY_FILTERS} value={categoryFilter} onChange={setCategoryFilter} />
 </div>
 </div>
 </div>

 {/* Grid */}
 {isLoading ? (
 <div className="flex justify-center py-12">
 <MinimalLoader />
 </div>
 ) : displayPolls.length === 0 ? (
 <div className="text-center py-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] max-w-2xl mx-auto shadow-sm select-none">
 <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-900 dark:text-white mb-2 tracking-tight">No polls found</h3>
 <p className="text-slate-500 dark:text-slate-300 max-w-sm mx-auto text-[13px] font-medium mb-6 leading-relaxed">
 Try a different filter, or be the first to create a community poll.
 </p>
 
 <button
 onClick={() => document.getElementById('create-poll-modal').showModal()}
 className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--g-600)] hover:bg-[var(--g-700)] text-white font-bold rounded-xl shadow-md hover:shadow-emerald-600/10 transition-all cursor-pointer active:scale-95">
 <Plus className="w-4 h-4"/>
 <span>Create First Poll</span>
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {displayPolls.map((poll, index) => (
 <motion.div
 key={poll._id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 >
 <PollCard poll={poll} />
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Create Poll Modal */}
 <CreatePollModal />
 </div>
 );
}