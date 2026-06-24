import React from'react';
import { motion } from'framer-motion';

const DriveCard = ({ drive, onJoin, user }) => {
 const isJoined = user && drive.volunteers && (drive.volunteers.includes(user.email) || drive.volunteers.includes(user.uid));
 const percentFilled = Math.min(((drive.volunteers?.length || 0) / drive.volunteersNeeded) * 100, 100);

 return (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full relative overflow-hidden">
 {drive.status ==='upcoming'? (
 <div className="absolute top-0 right-0 bg-[#40826D] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 uppercase tracking-wider">
 Upcoming
 </div>
 ) : (
 <div className="absolute top-0 right-0 bg-slate-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 uppercase tracking-wider">
 Completed
 </div>
 )}

 <div className="flex-1">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-2 tracking-tight">{drive.title}</h3>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 mb-4 line-clamp-2">{drive.description}</p>

 <div className="space-y-3 mb-6">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
 <i className="ri-calendar-line text-orange-500"></i>
 </div>
 <div>
 <p className="text-xs text-slate-400 font-medium">Date & Time</p>
 <p className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{new Date(drive.date).toLocaleDateString()} at {drive.time}</p>
 </div>
 </div>
 
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
 <i className="ri-map-pin-line text-blue-500"></i>
 </div>
 <div>
 <p className="text-xs text-slate-400 font-medium">Location</p>
 <p className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{drive.location}</p>
 </div>
 </div>

 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
 <i className="ri-restaurant-line text-emerald-500"></i>
 </div>
 <div>
 <p className="text-xs text-slate-400 font-medium">Food Type</p>
 <p className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{drive.foodType}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="mt-auto pt-4 border-t border-slate-100">
 <div className="flex justify-between text-xs font-bold mb-2">
 <span className="text-slate-500 dark:text-slate-300">Volunteers Needed</span>
 <span className="text-[#40826D]">{drive.volunteers?.length || 0} / {drive.volunteersNeeded}</span>
 </div>
 <div className="w-full h-2 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-full overflow-hidden mb-4">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width:`${percentFilled}%`}}
 className={`h-full rounded-full ${percentFilled >= 100 ?'bg-emerald-500':'bg-[#40826D]'}`}
 />
 </div>

 <button 
 onClick={() => onJoin(drive._id)}
 disabled={isJoined || drive.status ==='completed'|| percentFilled >= 100}
 className={`w-full py-2.5 rounded-xl font-bold text-[13px] transition-all flex justify-center items-center gap-2 ${
 isJoined 
 ?'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed': drive.status ==='completed'?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-400 cursor-not-allowed': percentFilled >= 100
 ?'bg-orange-50 text-orange-600 border border-orange-200 cursor-not-allowed':'bg-[#40826D] text-white hover:bg-[#326756] shadow-md hover:shadow-lg'}`}
 >
 {isJoined ? (
 <><i className="ri-check-line"></i> You Joined</>
 ) : drive.status ==='completed'? ('Drive Completed') : percentFilled >= 100 ? ('Volunteers Full') : ('Join Drive')}
 </button>
 </div>
 </div>
 );
};

export default DriveCard;
