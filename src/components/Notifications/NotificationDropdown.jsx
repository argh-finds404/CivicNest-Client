import React, { useState, useRef, useEffect } from"react";
import { motion, AnimatePresence } from"framer-motion";
import { useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { formatDistanceToNow } from"date-fns";

export default function NotificationDropdown() {
 const [open, setOpen] = useState(false);
 const dropdownRef = useRef(null);
 const axiosSecure = useAxiosSecure();

 useEffect(() => {
 function handleClickOutside(event) {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setOpen(false);
 }
 }
 if (open) {
 document.addEventListener("mousedown", handleClickOutside);
 }
 return () => {
 document.removeEventListener("mousedown", handleClickOutside);
 };
 }, [open]);

 const { data: notifications = [], refetch } = useQuery({
 queryKey: ["notifications"],
 queryFn: async () => {
 const res = await axiosSecure.get("/notifications");
 return res.data;
 },
 refetchInterval: 10000, // Auto-poll every 10 seconds to keep unread badges updated
 });

 const unreadCount = notifications.filter(n => !n.isRead).length;

 const markAsRead = async (id) => {
 // Optimistic UI update or just wait for refetch
 await axiosSecure.patch(`/notifications/${id}/read`);
 refetch();
 };

 const markAllAsRead = async () => {
 await axiosSecure.patch("/notifications/read-all");
 refetch();
 };

 return (
 <div className="relative"ref={dropdownRef}>
 <button 
 onClick={() => {
 const nextState = !open;
 setOpen(nextState);
 if (nextState) {
 refetch(); // Fetch latest notifications immediately when user opens the dropdown
 }
 }}
 className="relative text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:text-white transition-colors p-1">
 <span className="material-symbols-outlined text-2xl tracking-tight">notifications</span>
 {unreadCount > 0 && (
 <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
 {unreadCount}
 </span>
 )}
 </button>

 <AnimatePresence>
 {open && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15, ease:"easeOut"}}
 className="absolute right-0 top-12 w-80 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-xl border border-slate-100 overflow-hidden origin-top-right z-50 flex flex-col max-h-[400px]">
 <div className="px-4 py-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50 border-b border-slate-100 flex justify-between items-center">
 <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h3>
 {unreadCount > 0 && (
 <button 
 onClick={markAllAsRead}
 className="text-xs text-[#0f766e] font-bold hover:underline">
 Mark all read
 </button>
 )}
 </div>
 
 <div className="overflow-y-auto flex-1 max-h-[350px]"data-lenis-prevent="true">
 {notifications.length > 0 ? (
 notifications.map(notif => (
 <div 
 key={notif._id} 
 onClick={() => markAsRead(notif._id)}
 className={`px-4 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 flex gap-3 relative overflow-hidden ${notif.isRead ?'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]':'bg-[#f4fbf7] hover:bg-[#eaf5ec]'}`}
 >
 {!notif.isRead && (
 <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0f766e]"/>
 )}
 <div className="flex-1 min-w-0">
 <p className={`text-[13px] leading-relaxed ${notif.isRead ?'text-slate-500 dark:text-slate-300':'text-slate-800 dark:text-white font-bold'}`}>
 {notif.message}
 </p>
 <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
 <span className="material-symbols-outlined text-[14px]">schedule</span>
 {formatDistanceToNow(new Date(notif.createdAt))} ago
 </p>
 </div>
 {!notif.isRead && (
 <div className="w-2 h-2 rounded-full bg-[#0f766e] mt-1.5 shrink-0 shadow-[0_0_6px_rgba(15,118,110,0.5)]"/>
 )}
 </div>
 ))
 ) : (
 <div className="py-12 text-center">
 <div className="w-16 h-16 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-full flex items-center justify-center mx-auto mb-3">
 <span className="material-symbols-outlined text-2xl tracking-tight text-slate-400">notifications_off</span>
 </div>
 <h4 className="text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-bold mb-1">All Caught Up</h4>
 <p className="text-[13px] text-slate-500 dark:text-slate-300">You have no new notifications.</p>
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
