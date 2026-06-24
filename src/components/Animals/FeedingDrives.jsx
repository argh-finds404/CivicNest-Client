import React, { useState, useEffect, useCallback } from'react';
import { motion } from'framer-motion';
import DriveCard from'../cards/DriveCard';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import MinimalLoader from'../common/MinimalLoader';
import Swal from'sweetalert2';

const FeedingDrives = () => {
 const [drives, setDrives] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const axiosPublic = useAxiosPublic();
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();

 const fetchDrives = useCallback(async () => {
 setIsLoading(true);
 try {
 const res = await axiosPublic.get('/feeding-drives');
 setDrives(res.data);
 } catch (error) {
 console.error("Failed to fetch feeding drives:", error);
 } finally {
 setIsLoading(false);
 }
 }, [axiosPublic]);

 useEffect(() => {
 fetchDrives();
 }, [fetchDrives]);

 const handleJoin = async (driveId) => {
 if (!user) {
 Swal.fire({
 title:'Login Required',
 text:'Please login to join a feeding drive.',
 icon:'warning',
 confirmButtonColor:'#40826D'});
 return;
 }

 try {
 await axiosSecure.post(`/feeding-drives/${driveId}/join`, { userId: user.email });
 Swal.fire({
 title:'Joined Successfully!',
 text:'Thank you for volunteering.',
 icon:'success',
 confirmButtonColor:'#40826D'});
 fetchDrives();
 } catch (error) {
 console.error("Failed to join drive:", error);
 Swal.fire({
 title:'Error',
 text:'Failed to join the drive. Please try again later.',
 icon:'error',
 confirmButtonColor:'#d33'});
 }
 };

 return (
 <div className="w-full dark:bg-[#0a1410] min-h-screen pb-20">
 {/* Header */}
 <div className="bg-[#40826D] text-white pt-20 pb-16 px-4 relative overflow-hidden">
 <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/3 -translate-y-1/3">
 <i className="ri-heart-pulse-fill text-[400px]"></i>
 </div>
 <div className="max-w-7xl mx-auto relative z-10 text-center">
 <h1 className="text-4xl tracking-tight md:text-5xl tracking-tight font-black mb-4 tracking-tight">Community Feeding Drives</h1>
 <p className="text-emerald-100 max-w-2xl mx-auto text-[13px]">
 Join local volunteers in feeding stray and abandoned animals in your neighborhood.
 Every little bit helps create a better environment for them.
 </p>
 </div>
 </div>

 {/* Main Content */}
 <div className="max-w-7xl mx-auto px-4 mt-8 relative z-20">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-100 p-4 md:p-5 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
 <div>
 <h2 className="text-2xl tracking-tight font-bold text-slate-800 dark:text-white tracking-tight">Upcoming Drives</h2>
 <p className="text-slate-500 dark:text-slate-300 text-[13px]">Find a drive near you and volunteer your time or resources.</p>
 </div>
 <button className="btn bg-[#40826D] hover:bg-[#326756] text-white rounded-full border-none px-8 shadow-md">
 Organize a Drive
 </button>
 </div>

 {isLoading ? (
 <div className="py-12">
 <MinimalLoader size="lg"color="#40826D"/>
 </div>
 ) : drives.length === 0 ? (
 <div className="text-center py-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-100 shadow-sm">
 <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
 <i className="ri-restaurant-line text-4xl tracking-tight text-emerald-500"></i>
 </div>
 <h3 className="text-2xl tracking-tight font-bold text-slate-800 dark:text-white mb-2 tracking-tight">No active drives</h3>
 <p className="text-slate-500 dark:text-slate-300 max-w-md mx-auto">There are currently no feeding drives planned. Check back later or organize one yourself!</p>
 </div>
 ) : (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {drives.map((drive, idx) => (
 <motion.div
 key={drive._id}
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 >
 <DriveCard drive={drive} onJoin={handleJoin} user={user} />
 </motion.div>
 ))}
 </motion.div>
 )}
 </div>
 </div>
 );
};

export default FeedingDrives;
