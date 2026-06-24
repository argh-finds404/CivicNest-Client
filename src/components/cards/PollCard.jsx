import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { useMutation, useQueryClient } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import { 
 Share2, 
 Eye, 
 Users, 
 Hourglass, 
 Check, 
 CheckSquare, 
 HelpCircle,
 Leaf,
 Calendar,
 Building2,
 MessageSquare,
 ClipboardList
} from'lucide-react';
import toast from'react-hot-toast';
import { useRole } from'../../hooks/useRole';
import { Bar as ChartJSBar } from'react-chartjs-2';
import { 
 Chart as ChartJS, 
 CategoryScale, 
 LinearScale, 
 BarElement, 
 Tooltip as ChartTooltip, 
 Legend as ChartLegend 
} from'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, ChartLegend);

const POLL_TYPE_CONFIG = {
 single: { label:'Single Choice', icon: <Check className="w-3.5 h-3.5"/>, color:'text-teal-700 bg-teal-50 border-teal-100'},
 multiple: { label:'Multiple Choice', icon: <CheckSquare className="w-3.5 h-3.5"/>, color:'text-blue-700 bg-blue-50 border-blue-100'},
 yesno: { label:'Yes / No', icon: <HelpCircle className="w-3.5 h-3.5"/>, color:'text-emerald-700 bg-emerald-50 border-emerald-100'},
 survey: { label:'Community Survey', icon: <ClipboardList className="w-3.5 h-3.5"/>, color:'text-purple-700 bg-purple-50 border-purple-100'},
};

const CATEGORY_CONFIG = {
 community: { color:'bg-blue-50 text-blue-700 border-blue-105', icon: <Users className="w-3 h-3"/> },
 environment: { color:'bg-emerald-50 text-emerald-700 border-emerald-105', icon: <Leaf className="w-3 h-3"/> },
 events: { color:'bg-purple-50 text-purple-700 border-purple-105', icon: <Calendar className="w-3 h-3"/> },
 infrastructure: { color:'bg-amber-50 text-amber-700 border-amber-105', icon: <Building2 className="w-3 h-3"/> },
 general: { color:'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border-slate-205', icon: <MessageSquare className="w-3 h-3"/> },
};

export default function PollCard({ poll }) {
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();
 const [role, isRoleLoading, isVolunteer] = useRole();
 const queryClient = useQueryClient();
 
 const [localPoll, setLocalPoll] = useState(poll);
 const [selectedOptions, setSelectedOptions] = useState([]);
 const [hasVoted, setHasVoted] = useState(false);
 const [showResults, setShowResults] = useState(false);
 const [isChangingVote, setIsChangingVote] = useState(false);
 const [showChartView, setShowChartView] = useState(false);
 
 React.useEffect(() => {
 setLocalPoll(poll);
 if (poll.voterVotes && user?.email) {
 const record = poll.voterVotes.find(v => v.email === user.email);
 if (record) {
 setSelectedOptions(record.optionIds || []);
 }
 }
 }, [poll, user?.email]);

 // Check if current user has already voted
 const userVoted = localPoll.voters?.includes(user?.email);

 const approveMutation = useMutation({
 mutationFn: async () => {
 const res = await axiosSecure.patch(`/polls/${localPoll._id}/approve`);
 return res.data;
 },
 onSuccess: (data) => {
 toast.success('Poll approved and published successfully!');
 queryClient.invalidateQueries({ queryKey: ['polls'] });
 queryClient.invalidateQueries({ queryKey: ['polls-stats'] });
 setLocalPoll(prev => ({ ...prev, status:'active'}));
 },
 onError: (error) => {
 toast.error(error.response?.data?.message ||'Failed to approve poll');
 }
 });

 const handleApprove = (e) => {
 e.preventDefault();
 e.stopPropagation();
 if (localPoll.isDummy) {
 setLocalPoll(prev => ({ ...prev, status:'active'}));
 toast.success('Poll approved and activated (Mock)!');
 return;
 }
 approveMutation.mutate();
 };

 const voteMutation = useMutation({
 mutationFn: async (optionIds) => {
 const res = await axiosSecure.post(`/polls/${localPoll._id}/vote`, { optionIds });
 return res.data;
 },
 onSuccess: (data, variables) => {
 toast.success(isChangingVote ?'Your vote has been updated!':'Your vote has been recorded!');
 queryClient.invalidateQueries({ queryKey: ['polls'] });
 queryClient.invalidateQueries({ queryKey: ['poll', localPoll._id] });
 setSelectedOptions(variables);
 setShowResults(true);
 setHasVoted(true);
 setIsChangingVote(false);
 },
 onError: (error) => {
 toast.error(error.response?.data?.message ||'Failed to submit vote');
 }
 });

 const handleVote = (optionId) => {
 const isAuthorized = role ==="member"|| role ==="admin"|| isVolunteer;
 if (!isAuthorized) {
 toast.error('Access Denied: Only members and volunteers are allowed to vote in community polls.');
 return;
 }

 if (hasEnded) {
 toast.error('This poll has ended.');
 return;
 }

 const optionIds = [optionId];

 if (localPoll.isDummy) {
 // Local dummy vote logic
 const userEmail = user?.email ||"anonymous@civicnest.demo";
 let prevOptionIds = [];
 let currentChangeCount = changeCount;

 const dummyVoterRecord = localPoll.voterVotes?.find(v => v.email === userEmail);
 if (dummyVoterRecord) {
 if (localPoll.endsAt) {
 toast.error('You cannot change your vote in a timed poll');
 return;
 }
 if (dummyVoterRecord.changeCount >= 2) {
 toast.error('You have already changed your vote the maximum number of times (2 times)');
 return;
 }
 prevOptionIds = dummyVoterRecord.optionIds || [];
 currentChangeCount = dummyVoterRecord.changeCount + 1;
 }

 const updatedOptions = localPoll.options.map(opt => {
 let votes = opt.votes || 0;
 if (prevOptionIds.includes(opt.id)) {
 votes = Math.max(0, votes - 1);
 }
 if (optionIds.includes(opt.id)) {
 votes += 1;
 }
 return { ...opt, votes };
 });
 
 const newTotalVotes = (localPoll.totalVotes || 0) - prevOptionIds.length + optionIds.length;
 
 let newVoters = localPoll.voters ? [...localPoll.voters] : [];
 if (!newVoters.includes(userEmail)) {
 newVoters.push(userEmail);
 }

 let newVoterVotes = localPoll.voterVotes ? [...localPoll.voterVotes] : [];
 const recordIdx = newVoterVotes.findIndex(v => v.email === userEmail);
 if (recordIdx >= 0) {
 newVoterVotes[recordIdx] = {
 email: userEmail,
 optionIds: optionIds,
 changeCount: currentChangeCount
 };
 } else {
 newVoterVotes.push({
 email: userEmail,
 optionIds: optionIds,
 changeCount: 0
 });
 }
 
 setLocalPoll(prev => ({
 ...prev,
 options: updatedOptions,
 totalVotes: newTotalVotes,
 voters: newVoters,
 voterVotes: newVoterVotes
 }));
 
 setSelectedOptions(optionIds);
 toast.success(dummyVoterRecord ?'Your vote has been updated!':'Your vote has been recorded!');
 setShowResults(true);
 setHasVoted(true);
 setIsChangingVote(false);
 return;
 }

 voteMutation.mutate(optionIds);
 };

 const handleShare = async (e) => {
 e.preventDefault();
 e.stopPropagation();
 const url =`${window.location.origin}/polls/${localPoll._id}`;
 try {
 await navigator.clipboard.writeText(url);
 toast.success('Poll link copied to clipboard!');
 } catch (err) {
 toast.error('Failed to copy link');
 }
 };

 const getTimeRemaining = () => {
 if (!localPoll.endsAt) return'No Time Limit';
 if (localPoll.status !=='active'&& localPoll.status !=='pending') return'Ended';
 const now = new Date();
 const endsAt = new Date(localPoll.endsAt);
 if (isNaN(endsAt.getTime())) return'No Time Limit';
 const diff = endsAt - now;
 
 if (diff <= 0) return'Ended';
 
 const days = Math.floor(diff / (1000 * 60 * 60 * 24));
 const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
 
 if (days > 0) return`${days}d ${hours}h`;
 return`${hours}h`;
 };

 const renderTimeBadge = () => {
 const timeRemaining = getTimeRemaining();
 if (timeRemaining ==='No Time Limit') {
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] uppercase tracking-tight">
 <span>No Time Limit</span>
 </span>
 );
 }
 if (timeRemaining ==='Ended') {
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-400 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] uppercase tracking-tight">
 <span>Ended</span>
 </span>
 );
 }
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 uppercase tracking-tight shrink-0">
 <Hourglass className="w-3 h-3 text-red-500"/>
 <span>Ends in: {timeRemaining}</span>
 </span>
 );
 };

 const totalVotes = localPoll.totalVotes || 0;
 const typeConfig = POLL_TYPE_CONFIG[localPoll.type] || POLL_TYPE_CONFIG.single;
 
 const voterRecord = localPoll.voterVotes?.find(v => v.email === user?.email);
 const changeCount = voterRecord?.changeCount || 0;
 const hasEnded = localPoll.endsAt && new Date(localPoll.endsAt) < new Date();
 const shouldShowResults = (showResults || userVoted || hasEnded) && !isChangingVote;

 const isPending = localPoll.status ==='pending';
 const isAdminOrMod = role ==='admin';
 const isLocked = isPending && !isAdminOrMod;

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className={`bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${
 isLocked ?'opacity-60 saturate-50 select-none pointer-events-none':''}`}
 >
 {/* Header */}
 <div className="p-5 border-b border-slate-100 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/20">
 <div className="flex items-start justify-between gap-4 mb-3">
 <div className="flex items-center gap-2 flex-wrap">
 <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeConfig.color}`}>
 {typeConfig.icon}
 </div>
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${typeConfig.color}`}>
 {typeConfig.label}
 </span>
 {localPoll.category && (
 <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
 CATEGORY_CONFIG[localPoll.category.toLowerCase()]?.color ||'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-500 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]'}`}>
 {CATEGORY_CONFIG[localPoll.category.toLowerCase()]?.icon}
 <span>{localPoll.category}</span>
 </span>
 )}
 {isPending && (
 <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 animate-pulse-subtle">
 Pending Approval
 </span>
 )}
 </div>
 
 <button
 onClick={handleShare}
 className="text-slate-400 hover:text-teal-655 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] p-1 rounded-lg transition-colors shrink-0 cursor-pointer"title="Copy Poll Link">
 <Share2 className="w-4.5 h-4.5"/>
 </button>
 </div>
 
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white leading-snug mb-3 tracking-tight">
 {localPoll.question}
 </h3>
 
 <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 pt-1">
 {/* Creator */}
 <div className="flex items-center gap-1.5 min-w-0">
 <div className="w-5 h-5 rounded-full overflow-hidden bg-teal-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 border border-teal-100">
 {localPoll.createdBy ? localPoll.createdBy.slice(0, 2).toUpperCase() :'C'}
 </div>
 <span className="font-semibold text-slate-655 truncate max-w-[120px]"title={localPoll.createdBy}>
 {localPoll.createdBy ? localPoll.createdBy.split('@')[0] :'Community'}
 </span>
 </div>

 <div className="flex items-center gap-3 font-semibold text-slate-450 shrink-0">
 <div className="flex items-center gap-1">
 <Users className="w-3.5 h-3.5"/>
 <span>{totalVotes} {totalVotes === 1 ?'vote':'votes'}</span>
 </div>
 {renderTimeBadge()}
 </div>
 </div>
 </div>

 {/* Options & YouTube results fill */}
 <div className="p-5 flex-1 flex flex-col justify-between">
 {isPending ? (
 <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
 <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
 <Hourglass className="w-6 h-6 animate-pulse"/>
 </div>
 <div>
 <h4 className="text-[13px] font-bold text-slate-800 dark:text-white">Pending Admin Approval</h4>
 <p className="font-medium text-xs text-slate-500 dark:text-slate-300 mt-1 max-w-[220px] mx-auto leading-relaxed">
 {isAdminOrMod 
 ?"Review this poll's content and options below before publishing it to the community.":"This poll will become active once it is verified by community administrators."}
 </p>
 </div>

 {isAdminOrMod && (
 <button
 onClick={handleApprove}
 disabled={approveMutation.isPending}
 className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95">
 {approveMutation.isPending ?"Approving...":"Approve & Publish"}
 </button>
 )}

 {/* List options preview for admin */}
 {isAdminOrMod && (
 <div className="w-full pt-3 space-y-1.5 text-left border-t border-slate-100">
 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Options Preview</span>
 {localPoll.options.map((option) => (
 <div key={option.id} className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-3.5 py-2 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg border border-slate-150">
 {option.text}
 </div>
 ))}
 </div>
 )}
 </div>
 ) : !shouldShowResults ? (
 <div className="space-y-2.5">
 {localPoll.options.map((option) => (
 <button
 key={option.id}
 onClick={() => handleVote(option.id)}
 disabled={hasEnded}
 className="w-full p-3.5 rounded-[12px] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-emerald-500 hover:bg-emerald-50/5 text-slate-750 hover:text-emerald-900 transition-all text-left group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
 <div className="flex items-center gap-3">
 <div className="w-4 h-4 rounded-full border border-slate-350 flex items-center justify-center shrink-0 group-hover:border-emerald-500 transition-colors">
 <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-emerald-500 transition-colors"/>
 </div>
 <span className="flex-1 text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] group-hover:text-emerald-900">{option.text}</span>
 </div>
 </button>
 ))}

 {isChangingVote && (
 <div className="flex justify-end pt-2">
 <button
 onClick={() => {
 setIsChangingVote(false);
 setShowResults(true);
 }}
 className="text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] transition-colors cursor-pointer">
 Cancel
 </button>
 </div>
 )}
 </div>
 ) : (
 <div className="space-y-2.5">
 {showChartView || localPoll.type ==='survey'? (
 // ChartJS Bar Chart View
 <div className="w-full flex justify-center items-center"style={{ minHeight: Math.max(140, localPoll.options.length * 44), fontFamily:'Inter, sans-serif'}}>
 <ChartJSBar
 data={{
 labels: localPoll.options.map(opt => {
 const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
 const truncated = opt.text.length > 16 ? opt.text.slice(0, 14) +'..': opt.text;
 return`${truncated} (${pct}%)`;
 }),
 datasets: [
 {
 data: localPoll.options.map(opt => opt.votes || 0),
 backgroundColor: localPoll.options.map(opt => {
 const maxVotes = Math.max(...localPoll.options.map(o => o.votes || 0));
 const isWinner = opt.votes === maxVotes && maxVotes > 0;
 return isWinner ?'#10b981':'#cbd5e1';
 }),
 borderRadius: 6,
 borderSkipped: false,
 barThickness: 18,
 }
 ]
 }}
 options={{
 indexAxis:'y',
 responsive: true,
 maintainAspectRatio: false,
 layout: {
 padding: {
 left: 25,
 right: 15,
 top: 5,
 bottom: 5
 }
 },
 plugins: {
 legend: { display: false },
 tooltip: {
 callbacks: {
 title: (tooltipItems) => {
 const index = tooltipItems[0].dataIndex;
 return localPoll.options[index].text;
 },
 label: (context) => {
 const votes = context.raw;
 const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
 return`${votes} ${votes === 1 ?'vote':'votes'} (${pct}%)`;
 }
 },
 backgroundColor:'#1e293b',
 titleFont: { size: 12, weight:'bold', family:'Inter'},
 bodyFont: { size: 11, family:'Inter'},
 padding: 10,
 cornerRadius: 8,
 }
 },
 scales: {
 x: {
 display: false,
 grid: { display: false }
 },
 y: {
 grid: { display: false },
 ticks: {
 font: { size: 11, weight:'600', family:'Inter'},
 color:'#475569',
 },
 border: { display: false }
 }
 }
 }}
 height={Math.max(140, localPoll.options.length * 44)}
 width={310}
 />
 </div>
 ) : (
 // Original YouTube-style results list
 localPoll.options.map((option) => {
 const percentage = totalVotes > 0 
 ? Math.round((option.votes / totalVotes) * 100) 
 : 0;
 
 const maxVotes = Math.max(...localPoll.options.map(o => o.votes || 0));
 const isWinner = option.votes === maxVotes && maxVotes > 0;
 const isSelected = selectedOptions.includes(option.id);
 
 return (
 <div 
 key={option.id} 
 className={`relative overflow-hidden rounded-[12px] border p-3.5 transition-all flex items-center justify-between ${
 isWinner 
 ?'border-emerald-500 text-emerald-955 font-bold':'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]'}`}
 >
 <div className={`absolute inset-0 -z-20 ${isWinner ?'bg-emerald-50/30':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/20'}`} />
 <motion.div
 initial={{ width: 0 }}
 animate={{ width:`${percentage}%`}}
 transition={{ duration: 0.6, ease:"easeOut"}}
 className={`absolute inset-y-0 left-0 -z-10 rounded-l-[11px] ${
 percentage >= 98 ?'rounded-r-[11px]':''} ${
 isWinner 
 ?'bg-emerald-500/15':'bg-slate-200/50'}`}
 />
 
 <div className="flex items-center gap-2.5 z-10 min-w-0">
 {isSelected && (
 <Check className={`w-4 h-4 shrink-0 ${isWinner ?'text-emerald-700':'text-slate-500 dark:text-slate-300'}`} />
 )}
 <span className="text-[13px] truncate pr-2 font-semibold">{option.text}</span>
 </div>
 
 <div className="flex items-center gap-1.5 text-xs z-10 shrink-0 font-bold">
 <span>{percentage}%</span>
 <span className={`text-[10px] font-normal ${isWinner ?'text-emerald-800/70':'text-slate-400'}`}>({option.votes || 0})</span>
 </div>
 </div>
 );
 })
 )}
 
 <div className="flex items-center justify-between pt-3 border-t border-slate-150 mt-1">
 <div className="flex items-center gap-1.5 text-xs text-slate-450 font-semibold">
 <Eye className="w-3.5 h-3.5"/>
 <span>Results visible</span>
 </div>

 <div className="flex items-center gap-3">
 {localPoll.type !=='survey'&& (
 <button
 onClick={() => setShowChartView(!showChartView)}
 className="text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-teal-600 transition-colors cursor-pointer">
 {showChartView ?'View List':'View Chart'}
 </button>
 )}

 {!localPoll.endsAt && userVoted && changeCount < 2 && !hasEnded && (
 <button
 onClick={() => {
 setIsChangingVote(true);
 setShowResults(false);
 }}
 className="text-xs font-bold text-teal-655 hover:text-teal-700 transition-colors cursor-pointer">
 Change Vote ({2 - changeCount} left)
 </button>
 )}

 {!userVoted && !hasEnded && (
 <button
 onClick={() => setShowResults(false)}
 className="text-xs font-bold text-teal-655 hover:text-teal-700 transition-colors cursor-pointer">
 Vote instead
 </button>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 </motion.div>
 );
}