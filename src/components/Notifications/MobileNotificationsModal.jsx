import React from"react";
import { motion, AnimatePresence } from"framer-motion";
import { useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { formatDistanceToNow } from"date-fns";

export default function MobileNotificationsModal({ isOpen, onClose }) {
 const axiosSecure = useAxiosSecure();

 const { data: notifications = [], refetch } = useQuery({
 queryKey: ["notifications"],
 queryFn: async () => {
 const res = await axiosSecure.get("/notifications");
 return res.data;
 },
 enabled: isOpen,
 });

 const unreadCount = notifications.filter(n => !n.isRead).length;

 const markAsRead = async (id) => {
 await axiosSecure.patch(`/notifications/${id}/read`);
 refetch();
 };

 const markAllAsRead = async () => {
 await axiosSecure.patch("/notifications/read-all");
 refetch();
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]"/>
 <motion.div
 initial={{ y:"100%"}}
 animate={{ y: 0 }}
 exit={{ y:"100%"}}
 transition={{ type:"spring", damping: 25, stiffness: 200 }}
 className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] z-[90] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
 {/* Header */}
 <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/80">
 <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-[#0f766e] text-2xl tracking-tight">notifications</span>
 <h3 className="text-[13px] tracking-tight font-extrabold text-slate-900 dark:text-white tracking-tight">Notifications</h3>
 {unreadCount > 0 && (
 <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
 {unreadCount} New
 </span>
 )}
 </div>
 <div className="flex items-center gap-3">
 {unreadCount > 0 && (
 <button 
 onClick={markAllAsRead}
 className="text-[13px] text-[#0f766e] font-bold">
 Mark all read
 </button>
 )}
 <button 
 onClick={onClose}
 className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-300 transition-colors">
 <span className="material-symbols-outlined text-[20px]">close</span>
 </button>
 </div>
 </div>

 {/* List */}
 <div className="overflow-y-auto flex-1 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/30">
 {notifications.length > 0 ? (
 notifications.map(notif => (
 <div 
 key={notif._id} 
 onClick={() => markAsRead(notif._id)}
 className={`px-5 py-4 cursor-pointer transition-all border-b border-slate-100 flex gap-4 relative overflow-hidden ${notif.isRead ?'bg-[#f8fdfa] hover:bg-[#effaf4]':'bg-[#f4fbf7] hover:bg-[#eaf5ec] shadow-[inset_4px_0_0_#0f766e]'}`}
 >
 <div className="flex-1 min-w-0">
 <p className={`text-[15px] leading-relaxed ${notif.isRead ?'text-slate-600 dark:text-slate-300':'text-slate-900 dark:text-white font-bold'}`}>
 {notif.message}
 </p>
 <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1.5">
 <span className="material-symbols-outlined text-[14px]">schedule</span>
 {formatDistanceToNow(new Date(notif.createdAt))} ago
 </p>
 </div>
 {!notif.isRead && (
 <div className="w-2.5 h-2.5 rounded-full bg-[#0f766e] mt-2 shrink-0 shadow-[0_0_8px_rgba(15,118,110,0.5)]"/>
 )}
 </div>
 ))
 ) : (
 <div className="py-12 flex flex-col items-center text-center px-4">
 <div className="w-20 h-20 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-full flex items-center justify-center mb-4">
 <span className="material-symbols-outlined text-4xl tracking-tight text-slate-400">notifications_off</span>
 </div>
 <h4 className="text-[13px] tracking-tight text-slate-800 dark:text-white font-bold mb-2">You're All Caught Up!</h4>
 <p className="text-slate-500 dark:text-slate-300">There are no new notifications right now.</p>
 </div>
 )}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
