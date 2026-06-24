import React from'react';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import axios from'axios';
import { useAuth } from'../../hooks/useAuth';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { motion } from'framer-motion';
import { BarChart3, CheckCircle2 } from'lucide-react';
import toast from'react-hot-toast';
import MinimalLoader from'../common/MinimalLoader.jsx';

const PollsPage = () => {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();

 const { data: polls = [], isLoading } = useQuery({
 queryKey: ['polls'],
 queryFn: async () => {
 const res = await axios.get('http://localhost:5000/api/polls');
 return res.data;
 }
 });

 const voteMutation = useMutation({
 mutationFn: async ({ pollId, optionIndex }) => {
 const res = await axiosSecure.post(`/polls/${pollId}/vote`, {
 optionIndex,
 uid: user.uid
 });
 return res.data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['polls'] });
 toast.success("Vote recorded!");
 },
 onError: () => {
 toast.error("Failed to record vote. Please try again.");
 }
 });

 const handleVote = (pollId, optionIndex) => {
 if (!user) {
 toast.error("Please login to vote");
 return;
 }
 voteMutation.mutate({ pollId, optionIndex });
 };

 const calculateResults = (poll) => {
 const totalVotes = Object.keys(poll.votes || {}).length;
 const results = poll.options.map((opt, index) => {
 const count = Object.values(poll.votes || {}).filter(v => v === index).length;
 const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
 return { text: opt, count, percentage, index };
 });
 return { totalVotes, results };
 };

 return (
 <div className="min-h-screen bg-[#F8FAFC] py-24 px-4">
 <div className="max-w-4xl mx-auto">
 <div className="mb-12">
 <h1 className="text-4xl tracking-tight md:text-5xl tracking-tight font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-4">
 Community Polls <BarChart3 className="w-8 h-8 text-[#40826D]"/>
 </h1>
 <p className="text-[13px] text-slate-600 dark:text-slate-300 font-medium max-w-2xl">
 Have your say in local initiatives. Your vote helps shape the future of our neighborhood.
 </p>
 </div>

 {isLoading ? (
 <div className="flex justify-center py-12">
 <MinimalLoader />
 </div>
 ) : polls.length === 0 ? (
 <div className="text-center py-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <div className="w-20 h-20 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
 <BarChart3 className="w-10 h-10 text-slate-300"/>
 </div>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-900 dark:text-white mb-2 tracking-tight">No active polls</h3>
 <p className="text-slate-500 dark:text-slate-300">Check back later for new community votes.</p>
 </div>
 ) : (
 <div className="space-y-8">
 {polls.map((poll, idx) => {
 const { totalVotes, results } = calculateResults(poll);
 const userVotedIndex = user ? poll.votes?.[user.uid] : undefined;
 const hasVoted = userVotedIndex !== undefined;

 return (
 <motion.div 
 key={poll._id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 md:p-5 shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="flex justify-between items-start mb-6 gap-4">
 <h2 className="text-2xl tracking-tight font-bold text-slate-800 dark:text-white tracking-tight">{poll.question}</h2>
 <span className="shrink-0 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
 {totalVotes} Votes
 </span>
 </div>

 <div className="space-y-4">
 {results.map((opt) => {
 const isSelected = userVotedIndex === opt.index;
 return (
 <div key={opt.index} className="relative">
 {hasVoted ? (
 <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width:`${opt.percentage}%`}}
 transition={{ duration: 1, ease:"easeOut"}}
 className={`absolute top-0 left-0 h-full ${isSelected ?'bg-[#9FE2BF]/40':'bg-slate-200/50'}`}
 />
 <div className="relative flex justify-between items-center p-4">
 <span className={`font-bold flex items-center gap-2 ${isSelected ?'text-[#40826D]':'text-slate-600 dark:text-slate-300'}`}>
 {isSelected && <CheckCircle2 className="w-5 h-5"/>} {opt.text}
 </span>
 <span className="font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{opt.percentage}%</span>
 </div>
 </div>
 ) : (
 <button
 onClick={() => handleVote(poll._id, opt.index)}
 className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-[#40826D] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] transition-all group flex justify-between items-center">
 <span>{opt.text}</span>
 <span className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] group-hover:border-[#40826D]"></span>
 </button>
 )}
 </div>
 );
 })}
 </div>
 </motion.div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
};

export default PollsPage;
