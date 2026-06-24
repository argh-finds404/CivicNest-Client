import React, { useState } from'react';
import { Link } from'react-router';
import { motion } from'framer-motion';
import { Building2, Globe, Mail, ChevronDown, ChevronUp, Heart } from'lucide-react';
import VerifiedBadge from'../common/VerifiedBadge';
import { useMutation } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import toast from'react-hot-toast';

export default function NGOCard({ ngo }) {
 const [showContact, setShowContact] = useState(false);
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();

 const donateMutation = useMutation({
 mutationFn: async () => {
 const res = await axiosSecure.post('/ngos/donate', {
 ngoId: ngo._id,
 amount: 0, // Record-keeping only
 message:'Support this organization'});
 return res.data;
 },
 onSuccess: () => {
 toast.success('Support recorded successfully!');
 },
 onError: (error) => {
 toast.error(error.response?.data?.message ||'Failed to record support');
 }
 });

 const handleDonate = () => {
 if (!user) {
 toast.error('Please log in to record support');
 return;
 }
 donateMutation.mutate();
 };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col h-full">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 shadow-sm shrink-0">
 <img src={ngo.logoUrl ||"https://i.ibb.co/X30F6Hk/ngo-placeholder.png"} alt={ngo.name} className="w-full h-full object-cover"/>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white line-clamp-1 tracking-tight">{ngo.name}</h3>
 <VerifiedBadge status={ngo.status} />
 </div>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 line-clamp-1">
 Focus: {ngo.mission?.substring(0, 50)}...
 </p>
 </div>
 </div>

 <p className="text-slate-600 dark:text-slate-300 text-[13px] mb-6 line-clamp-3 flex-grow">{ngo.mission}</p>

 <div className="space-y-2 mb-6 pt-4 border-t border-slate-50">
 <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-300">
 <Mail className="w-4 h-4 text-slate-400 flex-shrink-0"/>
 <span className="truncate">{ngo.contactEmail}</span>
 </div>
 {ngo.website && (
 <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-300">
 <Globe className="w-4 h-4 text-slate-400 flex-shrink-0"/>
 <span className="truncate">{ngo.website}</span>
 </div>
 )}
 </div>

 {/* Contact Accordion */}
 <div className="space-y-3 pt-4 border-t border-slate-100">
 <button
 onClick={() => setShowContact(!showContact)}
 className="flex items-center gap-1.5 px-4 py-2.5 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 text-[13px] font-semibold rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors w-full">
 <span>Connect</span>
 {showContact ? (
 <ChevronUp className="w-4 h-4 ml-auto"/>
 ) : (
 <ChevronDown className="w-4 h-4 ml-auto"/>
 )}
 </button>

 {showContact && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height:'auto'}}
 exit={{ opacity: 0, height: 0 }}
 className="space-y-2 pt-2">
 {ngo.contactEmail && (
 <a href={`mailto:${ngo.contactEmail}`} className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300 hover:text-teal-600">
 <Mail className="w-4 h-4"/>
 <span className="truncate">{ngo.contactEmail}</span>
 </a>
 )}
 {ngo.phone && (
 <a href={`tel:${ngo.phone}`} className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300 hover:text-teal-600">
 <Building2 className="w-4 h-4"/>
 <span>{ngo.phone}</span>
 </a>
 )}
 {ngo.website && (
 <a href={ngo.website} target="_blank"rel="noopener noreferrer"className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300 hover:text-teal-600">
 <Globe className="w-4 h-4"/>
 <span className="truncate">Website</span>
 </a>
 )}
 </motion.div>
 )}
 </div>

 <div className="mt-4 space-y-3">
 <Link to={`/ngos/${ngo._id}`} className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-[var(--g-600)] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
 View Profile <Building2 className="w-4 h-4"/>
 </Link>
 
 <button
 onClick={handleDonate}
 disabled={donateMutation.isPending}
 className="w-full bg-[var(--g-600)] hover:bg-[var(--g-700)] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
 <Heart className="w-4 h-4"/>
 {donateMutation.isPending ?'Recording...':'Support'}
 </button>
 </div>
 </motion.div>
 );
}