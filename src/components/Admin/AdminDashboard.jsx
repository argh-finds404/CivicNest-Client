import React from"react";
import { NavLink, Outlet } from"react-router";
import { useAuth } from"../../hooks/useAuth";
import { useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";

export default function AdminDashboard() {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();

 // Fetch admin stats to get pending membership and NGO counts
 const { data: stats } = useQuery({
 queryKey: ["admin-stats"],
 queryFn: async () => {
 const res = await axiosSecure.get("/admin/stats");
 return res.data;
 },
 });

 // Fetch issue queue count to get pending review issues/events
 const { data: queueCount } = useQuery({
 queryKey: ["admin-queue-count"],
 queryFn: async () => {
 const res = await axiosSecure.get("/admin/queue/count");
 return res.data;
 },
 });

 return (
 <div className="min-h-screen dark:bg-[#0b1215] pt-24 pb-20">
 <div className="max-w-[1600px] xl:max-w-[95%] mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6">
 
 {/* Sidebar */}
 <aside className="w-full md:w-72 shrink-0 z-10">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] md:sticky top-28">
 <h2 className="text-[13px] tracking-tight font-black font-display text-slate-800 dark:text-white mb-6 tracking-tight">
 Control Center
 </h2>
 
 <nav className="flex flex-col gap-2">
 <NavLink 
 to="/admin"end
 className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-dashboard-line mr-2"></i> Overview
 </span>
 </NavLink>

 <div className="mt-4 mb-2">
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operations</span>
 </div>

 <NavLink 
 to="/admin/queue"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-list-check-2 mr-2"></i> Issue Queue
 </span>
 {queueCount?.pending_review > 0 && (
 <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse shadow-sm">
 {queueCount.pending_review}
 </span>
 )}
 </NavLink>

 <NavLink 
 to="/admin/notices"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-megaphone-line mr-2"></i> Manage Notices
 </span>
 </NavLink>
 
 <NavLink 
 to="/admin/users"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-team-line mr-2"></i> User Management
 </span>
 </NavLink>
 
 <NavLink 
 to="/admin/membership"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-pass-valid-line mr-2"></i> Members & Volunteers
 </span>
 {stats?.pendingRequests > 0 && (
 <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-sm">
 {stats.pendingRequests}
 </span>
 )}
 </NavLink>

 <NavLink 
 to="/admin/cleanup-events"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-calendar-event-line mr-2"></i> Community Events
 </span>
 </NavLink>

 <NavLink 
 to="/admin/posts"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-file-list-3-line mr-2"></i> Manage Posts
 </span>
 </NavLink>

 <NavLink 
 to="/admin/forum"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-chat-1-line mr-2"></i> Forum Moderation
 </span>
 </NavLink>

 <NavLink 
 to="/admin/ngos"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-building-4-line mr-2"></i> NGO Verification
 </span>
 {stats?.pendingNGOs > 0 && (
 <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-sm">
 {stats.pendingNGOs}
 </span>
 )}
 </NavLink>

 <NavLink 
 to="/admin/gallery"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-image-line mr-2"></i> Manage Gallery
 </span>
 </NavLink>

 <NavLink 
 to="/admin/donations"className={({ isActive }) =>`px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
 isActive ?"bg-teal-600 text-white shadow-md font-bold":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] font-medium"}`}
 >
 <span className="flex items-center">
 <i className="ri-heart-3-line mr-2"></i> Donations
 </span>
 </NavLink>
 </nav>
 </div>
 </aside>

 {/* Main Content Area */}
 <main className="flex-grow min-w-0">
 <Outlet />
 </main>
 </div>
 </div>
 );
}
