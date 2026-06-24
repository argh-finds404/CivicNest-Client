import React, { useState, useEffect } from'react';
import { useQuery } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { Zap, AlertCircle, Clock, Sparkles } from'lucide-react';

export default function CreditIndicator({ postType }) {
 const axiosSecure = useAxiosSecure();

 const { data } = useQuery({
 queryKey: ['credits', postType],
 queryFn: () => axiosSecure.get(`/credits/${postType}`).then(r => r.data),
 staleTime: 30000,
 });

 const [timeText, setTimeText] = useState('');

 useEffect(() => {
 if (!data?.resetAt) {
 setTimeText('');
 return;
 }
 const updateTime = () => {
 const diff = new Date(data.resetAt).getTime() - Date.now();
 if (diff <= 0) {
 setTimeText('restoring...');
 return;
 }
 const h = Math.floor(diff / (1000 * 60 * 60));
 const m = Math.ceil((diff % (1000 * 60 * 60)) / (1000 * 60));
 if (h > 0) {
 setTimeText(`${h}h ${m}m`);
 } else {
 setTimeText(`${m}m`);
 }
 };
 updateTime();
 const interval = setInterval(updateTime, 60000);
 return () => clearInterval(interval);
 }, [data?.resetAt]);

 if (!data || data.isAdmin) return null;

 const { limit, remaining } = data;
 const depleted = remaining === 0;

 // Visual configuration based on state
 let badgeStyles ="";
 let textStyles ="";
 let StatusIcon = null;

 if (depleted) {
 badgeStyles ="bg-rose-50/60 dark:bg-rose-950/10 border-rose-200/80 dark:border-rose-900/50 shadow-sm shadow-rose-100/50 dark:shadow-none text-rose-700 dark:text-rose-400";
 textStyles ="text-rose-700 dark:text-rose-400 font-semibold";
 StatusIcon = <Clock className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 animate-pulse"/>;
 } else if (remaining === 1) {
 badgeStyles ="bg-amber-50/60 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-900/50 shadow-sm shadow-amber-100/50 dark:shadow-none text-amber-700 dark:text-amber-400";
 textStyles ="text-amber-700 dark:text-amber-400 font-semibold";
 StatusIcon = <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-bounce"/>;
 } else if (remaining > limit) {
 badgeStyles ="bg-gradient-to-r from-amber-50/60 to-yellow-50/60 dark:from-amber-950/10 dark:to-yellow-950/10 border-amber-200/80 dark:border-amber-900/50 shadow-sm shadow-amber-100/30 text-amber-800 dark:text-amber-400";
 textStyles ="text-amber-800 dark:text-amber-400 font-bold";
 StatusIcon = <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse"/>;
 } else {
 badgeStyles ="bg-emerald-50/60 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/50 shadow-sm shadow-emerald-100/50 dark:shadow-none text-emerald-700 dark:text-emerald-400";
 textStyles ="text-emerald-700 dark:text-emerald-400 font-semibold";
 StatusIcon = <Zap className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse"/>;
 }

 return (
 <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 ${badgeStyles}`}>
 {/* Icon */}
 {StatusIcon}

 {/* Energy capsules */}
 <div className="flex gap-1 items-center">
 {Array.from({ length: Math.max(limit, remaining) }).map((_, i) => {
 const isActive = i < remaining;
 const isSurplus = remaining > limit;
 let cellClass ="";
 if (isActive) {
 if (isSurplus) {
 cellClass ="bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
 } else if (depleted) {
 cellClass ="bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]";
 } else if (remaining === 1) {
 cellClass ="bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
 } else {
 cellClass ="bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
 }
 } else {
 cellClass ="bg-slate-200";
 }
 return (
 <div 
 key={i} 
 className={`w-2.5 h-1.5 rounded-full transition-all duration-500 ${cellClass}`} 
 />
 );
 })}
 </div>

 {/* Label Text */}
 <span className={`text-[11px] tracking-tight select-none ${textStyles}`}>
 {depleted
 ?`Depleted — ${timeText}`: remaining > limit
 ?`${remaining}/${limit} Boosted`:`${remaining}/${limit} remaining`}
 </span>
 </div>
 );
}

