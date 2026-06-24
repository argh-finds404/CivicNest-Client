import React from'react';
import { motion } from'framer-motion';
import { Link } from'react-router';

export default function VolunteerDirectoryCard({ volunteer }) {
 const { name, photoURL, skills, area, availability, registeredAt, uid } = volunteer;

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -4 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
 <div className="flex items-start gap-4 mb-4">
 <div className="relative">
 {photoURL ? (
 <img src={photoURL} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-teal-50"/>
 ) : (
 <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[13px] tracking-tight font-bold border-2 border-teal-50">
 {name?.charAt(0).toUpperCase() ||'V'}
 </div>
 )}
 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
 <i className="ri-check-line text-white text-[10px]"/>
 </div>
 </div>
 
 <div className="flex-1">
 <h3 className="font-bold text-[13px] text-slate-800 dark:text-white group-hover:text-teal-600 transition-colors tracking-tight">
 {name ||'Anonymous Volunteer'}
 </h3>
 <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-300 mt-1">
 <i className="ri-map-pin-2-line"/>
 <span>{area ||'Local Area'}</span>
 </div>
 <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-300 mt-1">
 <i className="ri-time-line"/>
 <span>Available {availability}</span>
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills & Badges</div>
 <div className="flex flex-wrap gap-2">
 {skills?.length > 0 ? (
 skills.map((skill, index) => (
 <span key={index} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100">
 {skill}
 </span>
 ))
 ) : (
 <span className="text-[13px] text-slate-400 italic">General Volunteer</span>
 )}
 </div>
 </div>
 
 <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
 <span>Joined {new Date(registeredAt).toLocaleDateString()}</span>
 {uid ? (
 <Link to={`/user/${uid}`} className="text-teal-600 font-semibold hover:underline">View Profile</Link>
 ) : (
 <span className="text-slate-400 font-medium">View Profile</span>
 )}
 </div>
 </motion.div>
 );
}
