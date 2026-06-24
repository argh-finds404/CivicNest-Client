import React, { useState } from'react';
import { Link } from'react-router';
import { motion } from'framer-motion';
import { formatDistanceToNow } from'date-fns';
import toast from'react-hot-toast';
import { useQueryClient, useMutation } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import AnimalDonationModal from'../Animals/AnimalDonationModal';

const URGENCY_CONFIG = {
 emergency: { bg:'bg-red-500', text:'text-white', label:'Emergency', pulse: true, stripe:'border-l-[3px] border-red-500'},
 high: { bg:'bg-orange-500', text:'text-white', label:'High', pulse: false, stripe:'border-l-[3px] border-orange-400'},
 medium: { bg:'bg-amber-400', text:'text-white', label:'Medium', pulse: false, stripe:'border-l-[3px] border-amber-400'},
 low: { bg:'bg-gray-300', text:'text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]', label:'Low', pulse: false, stripe:'border-l-[3px] border-gray-300 dark:border-[#1e3040] dark:border-[#1e3040]'},
};

const STATUS_CONFIG = {'needs-help': { bg:'bg-orange-500', text:'text-white', label:'Awaiting Rescue'},'in-treatment': { bg:'bg-blue-500', text:'text-white', label:'In Treatment'},'rescued': { bg:'bg-emerald-500', text:'text-white', label:'Rescued ✓'},'adopted': { bg:'bg-purple-500', text:'text-white', label:'Adopted 🏠'},
};

export default function AnimalCard({ animal }) {
 const { user } = useAuth();
 const isOwnReport = user?.email === animal.reporter?.email || user?.email === animal.contactInfo;
 const isVolunteer = animal.volunteers?.some(v => 
 (typeof v ==='string'&& v === user?.email) || 
 (v && v.email === user?.email)
 );

 const urgency = URGENCY_CONFIG[animal.urgency] || URGENCY_CONFIG.medium;
 
 let status = STATUS_CONFIG[animal.status] || STATUS_CONFIG['needs-help'];
 if (animal.status ==='rescued'&& animal.rescueVerificationStatus ==='pending') {
 if (isOwnReport) {
 status = { bg:'bg-amber-100', text:'text-amber-700 font-bold border border-amber-200', label:'⏳ Verification Pending'};
 } else {
 status = STATUS_CONFIG['in-treatment'];
 }
 }
 const [copied, setCopied] = useState(false);
 const [showDonateModal, setShowDonateModal] = useState(false);
 const axiosSecure = useAxiosSecure();

 const handleShare = (e) => {
 e.preventDefault();
 const url =`${window.location.origin}/animals/${animal._id}`;
 if (navigator.clipboard) {
 navigator.clipboard.writeText(url).then(() => {
 setCopied(true);
 toast.success('Link copied!');
 setTimeout(() => setCopied(false), 2000);
 });
 } else {
 const el = document.createElement('input');
 el.value = url;
 document.body.appendChild(el);
 el.select();
 document.execCommand('copy');
 document.body.removeChild(el);
 setCopied(true);
 toast.success('Link copied!');
 setTimeout(() => setCopied(false), 2000);
 }
 };

 const queryClient = useQueryClient();
 const volunteerMutation = useMutation({
 mutationFn: () => axiosSecure.post(`/animals/${animal._id}/volunteer`),
 onSuccess: (res) => {
 toast.success(res.data.volunteered ?"Thanks for volunteering!":"You have withdrawn.");
 queryClient.invalidateQueries({ queryKey: ["animals"] });
 },
 onError: () => toast.error("Failed to volunteer.")
 });

 return (
 <>
 <Link to={`/animals/${animal._id}`} className="block group h-full">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -4 }}
 className={`bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col ${urgency.stripe}`}
 >
 {/* Image */}
 <div className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] shrink-0">
 <img
 src={animal.image ||'/animal-placeholder.jpg'}
 alt={`${animal.animalType} — ${animal.condition}`}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>

 {/* Urgency badge */}
 <div className="absolute top-3 right-3">
 <span className={`${urgency.bg} ${urgency.text} px-3 py-1 rounded-full text-xs font-semibold ${urgency.pulse ?'animate-pulse':''}`}>
 {urgency.label}
 </span>
 </div>

 {/* Share */}
 <button
 onClick={handleShare}
 className="absolute top-3 left-3 w-8 h-8 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/80 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">
 <span className="text-[13px]">↗</span>
 </button>

 {copied && (
 <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
 Copied!
 </span>
 )}
 </div>

 {/* Body */}
 <div className="p-5 flex-grow flex flex-col">
 <div className="flex items-center justify-between mb-3">
 <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
 {animal.animalType}
 </span>
 <span className={`${status.bg} ${status.text} text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
 {status.label}
 </span>
 </div>

 <h3 className="font-extrabold text-slate-800 dark:text-white text-[13px] mb-3 line-clamp-2 tracking-tight">
 {animal.condition}
 </h3>

 <div className="flex flex-col gap-2 text-[13px] text-slate-500 dark:text-slate-300 mt-auto">
 <div className="flex items-start gap-2">
 <span className="mt-0.5">📍</span>
 <span className="line-clamp-1">{animal.location}</span>
 </div>
 <div className="flex items-center gap-2">
 <span>⏰</span>
 <span>{formatDistanceToNow(new Date(animal.date), { addSuffix: true })}</span>
 </div>
 {animal.volunteerCount > 0 && (
 <div className="flex items-center gap-2 text-xs font-semibold text-teal-600">
 <span>🙋</span>
 <span>{animal.volunteerCount} helping</span>
 </div>
 )}
 </div>
 </div>

 {/* Footer */}
 <div className="p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-t border-slate-100 grid grid-cols-2 gap-3 shrink-0">
 <button
 onClick={(e) => {
 e.preventDefault();
 setShowDonateModal(true);
 }}
 className="w-full py-2 px-2 text-[13px] font-bold border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-xl transition-all shadow-sm text-center truncate flex items-center justify-center gap-1">
 <i className="ri-heart-3-line"></i> Donate
 </button>
 <button
 onClick={(e) => {
 e.preventDefault();
 volunteerMutation.mutate();
 }}
 disabled={volunteerMutation.isPending}
 className={`w-full py-2 px-2 text-[13px] font-bold rounded-xl transition-all shadow-sm shadow-teal-900/10 disabled:opacity-50 text-center truncate flex items-center justify-center gap-1 ${
 isVolunteer
 ?'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100':'bg-teal-600 text-white hover:bg-teal-700'}`}
 >
 <i className={isVolunteer ?"ri-check-double-line":"ri-hand-heart-line"}></i> 
 {isVolunteer ?`Helping (${animal.volunteerCount || 0})`:`Help (${animal.volunteerCount || 0})`}
 </button>
 </div>
 </motion.div>
 </Link>

 {showDonateModal && (
 <AnimalDonationModal 
 animal={animal} 
 onClose={() => setShowDonateModal(false)} 
 />
 )}
 </>
 );
}