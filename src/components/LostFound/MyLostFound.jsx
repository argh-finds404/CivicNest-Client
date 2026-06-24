import React, { useState, useEffect, useCallback } from'react';
import { Link } from'react-router';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { motion, AnimatePresence } from'framer-motion';
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton';
import { Plus, Search, HelpCircle, MapPin, Clock, Eye, AlertTriangle, ShieldCheck, Mail, Phone, Camera, Check } from'lucide-react';
import toast from'react-hot-toast';

const MyLostFound = () => {
 const [items, setItems] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [selectedItem, setSelectedItem] = useState(null);
 
 const axiosSecure = useAxiosSecure();

 const fetchItems = useCallback(async () => {
 setIsLoading(true);
 try {
 const res = await axiosSecure.get('/lost-found/my');
 setItems(res.data);
 } catch (error) {
 console.error("Failed to fetch my lost and found items", error);
 } finally {
 setIsLoading(false);
 }
 }, [axiosSecure]);

 useEffect(() => {
 fetchItems();
 }, [fetchItems]);

 const handleReunite = async (itemId, finderEmail, claimantEmail) => {
 try {
 await axiosSecure.post(`/lost-found/${itemId}/reunite`, { finderEmail, claimantEmail });
 toast.success("Listing marked as reunited!");
 fetchItems();
 setSelectedItem(null);
 } catch (error) {
 toast.error(error.response?.data?.message ||"Failed to resolve listing.");
 }
 };

 const handleFlagSuspicious = async (itemId, finderEmail, claimantEmail) => {
 try {
 await axiosSecure.post(`/lost-found/${itemId}/flag-suspicious`, { finderEmail, claimantEmail });
 toast.success("Flagged as suspicious. Admin notified.");
 fetchItems();
 
 if (selectedItem) {
 setSelectedItem(prev => {
 if (prev.type ==='lost') {
 const updatedReports = prev.foundReports.map(r => 
 r.email === finderEmail ? { ...r, isSuspicious: true } : r
 );
 return { ...prev, foundReports: updatedReports };
 } else {
 const updatedClaims = prev.claims.map(c => 
 c.email === claimantEmail ? { ...c, isSuspicious: true } : c
 );
 return { ...prev, claims: updatedClaims };
 }
 });
 }
 } catch (error) {
 toast.error(error.response?.data?.message ||"Failed to flag.");
 }
 };

 return (
 <div className="w-full pb-24 pt-8 px-4 md:px-8 bg-[#F8FAFC] min-h-screen">
 <div className="max-w-7xl mx-auto">
 <BackButton variant="dark"className="mb-6 inline-flex"/>
 
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
 <div>
 <h2 className="text-3xl tracking-tight font-black bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent mb-2 inline-block tracking-tight">
 My Lost & Found
 </h2>
 <p className="text-slate-500 dark:text-slate-300 font-medium text-[13px]">Track claims and sighting reports for items you posted.</p>
 </div>
 <div className="flex flex-wrap gap-3">
 <Link 
 to="/lost-found/add-lost"className="inline-flex items-center gap-2 px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
 <Plus className="w-4 h-4 shrink-0"/> Report Lost
 </Link>
 <Link 
 to="/lost-found/add-found"className="inline-flex items-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
 <Plus className="w-4 h-4 shrink-0"/> Report Found
 </Link>
 </div>
 </div>

 {/* Item Grid */}
 {isLoading ? (
 <div className="flex justify-center items-center py-12">
 <MinimalLoader />
 </div>
 ) : items.length === 0 ? (
 <div className="text-center py-10 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 max-w-xl mx-auto shadow-sm">
 <div className="w-20 h-20 bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100/80">
 <Search className="w-8 h-8 text-slate-350"/>
 </div>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white tracking-tight">No items reported</h3>
 <p className="text-slate-500 dark:text-slate-300 text-[13px] mt-2 mb-6 font-medium max-w-xs mx-auto">You haven't reported any lost or found items yet.</p>
 <div className="flex justify-center gap-3 flex-wrap">
 <Link 
 to="/lost-found/add-lost"className="inline-flex items-center gap-1 px-5 py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-rose-600 hover:bg-rose-50 rounded-xl shadow-sm font-bold transition-colors cursor-pointer">
 <Plus className="w-4 h-4 mr-1 text-rose-500"/> Report Lost
 </Link>
 <Link 
 to="/lost-found/add-found"className="inline-flex items-center gap-1 px-5 py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-emerald-600 hover:bg-emerald-50 rounded-xl shadow-sm font-bold transition-colors cursor-pointer">
 <Plus className="w-4 h-4 mr-1 text-emerald-500"/> Report Found
 </Link>
 </div>
 </div>
 ) : (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {items.map((item, index) => {
 const isLost = item.type ==='lost';
 const activeCount = isLost 
 ? (item.foundReports?.filter(r => r.status !=='rejected').length || 0) 
 : (item.claims?.filter(c => c.status !=='rejected').length || 0);

 return (
 <motion.div
 key={item._id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
 <div>
 {/* Item Image */}
 <div className="relative h-44 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]">
 <img 
 src={item.image ||'/lost-found-placeholder.jpg'} 
 alt={item.itemName} 
 className="w-full h-full object-cover"/>
 <span className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${
 isLost ?'bg-rose-500 text-white border-rose-450/20 shadow-sm':'bg-emerald-600 text-white border-emerald-500/20 shadow-sm'}`}>
 {item.type.toUpperCase()}
 </span>
 
 {item.status ==='reunited'&& (
 <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
 <span className="bg-emerald-600 text-white font-black text-xs px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md">
 <ShieldCheck className="w-3.5 h-3.5"/> REUNITED
 </span>
 </div>
 )}
 </div>

 {/* Content Body */}
 <div className="p-5">
 <div className="flex items-center justify-between mb-2">
 <span className="text-[10px] font-extrabold uppercase text-slate-400 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] px-2 py-0.5 rounded">
 {item.category}
 </span>
 {item.status ==='open'&& (
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
 )}
 </div>

 <h3 className="font-bold text-slate-800 dark:text-white text-[13px] mb-2 truncate tracking-tight">{item.itemName}</h3>
 
 <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-300 mb-4">
 <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0"/>
 <span className="truncate">{item.location}</span>
 </div>
 </div>
 </div>

 {/* Actions footer */}
 <div className="px-5 pb-5 pt-3 border-t border-slate-100/60 flex items-center justify-between bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410]/40">
 <Link 
 to={`/lost-found/${item._id}`} 
 className="text-xs text-slate-600 dark:text-slate-300 font-bold hover:underline flex items-center gap-1">
 <Eye className="w-3.5 h-3.5"/> Details
 </Link>
 
 {item.status !=='reunited'&& activeCount > 0 ? (
 <button 
 onClick={() => setSelectedItem(item)}
 className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all">
 {isLost ?`View ${activeCount} Sightings`:`View ${activeCount} Claims`}
 </button>
 ) : item.status !=='reunited'? (
 <span className="text-xs text-slate-400 font-bold italic">No submissions yet</span>
 ) : (
 <span className="text-xs text-emerald-600 font-black flex items-center gap-0.5"><Check className="w-3.5 h-3.5"/> Resolved</span>
 )}
 </div>
 </motion.div>
 );
 })}
 </motion.div>
 )}
 </div>

 {/* Reports / Claims Review Modal */}
 <AnimatePresence>
 {selectedItem && (
 <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
 {/* Overlay */}
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setSelectedItem(null)}
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"/>
 
 {/* Modal Box */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 className="relative w-full max-w-2xl bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl overflow-hidden shadow-2xl z-10 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex flex-col max-h-[85vh]">
 {/* Header */}
 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410]/50">
 <div>
 <h3 className="text-[13px] font-black text-slate-800 dark:text-white tracking-tight">
 {selectedItem.type ==='lost'?"Sighting / Finder Reports":"Ownership Claims"}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-0.5">{selectedItem.itemName}</p>
 </div>
 <button 
 onClick={() => setSelectedItem(null)}
 className="text-slate-450 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] text-[13px] font-extrabold cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-150 transition-colors">
 Close
 </button>
 </div>

 {/* Scrollable Content */}
 <div className="p-4 overflow-y-auto space-y-4 flex-grow">
 {selectedItem.type ==='lost'? (
 /* Lost Item: Multiple foundReports Array */
 selectedItem.foundReports && selectedItem.foundReports.length > 0 ? (
 selectedItem.foundReports.map((report, idx) => (
 <div 
 key={idx} 
 className={`p-5 rounded-lg border ${
 report.status ==='rejected'?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/70 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 opacity-60': report.isSuspicious 
 ?'bg-rose-50/30 border-rose-250/45':'bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410]/50 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60'} flex flex-col gap-4`}
 >
 {/* Reporter Details */}
 <div className="flex flex-wrap justify-between items-start gap-2">
 <div>
 <span className="font-bold text-slate-800 dark:text-white text-[13px] block">{report.name}</span>
 <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
 <Mail className="w-3 h-3"/> {report.email}
 </span>
 {report.contactPhone && (
 <span className="text-xs text-slate-450 font-bold flex items-center gap-1 mt-0.5">
 <Phone className="w-3 h-3 text-slate-440"/> {report.contactPhone}
 </span>
 )}
 </div>
 <span className="text-[10px] text-slate-400 font-bold">
 {new Date(report.submittedAt || Date.now()).toLocaleDateString()}
 </span>
 </div>

 {/* Statement */}
 <p className="text-[13px] text-slate-655 font-medium italic bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-3 rounded-xl border border-slate-100">"{report.statement}"</p>

 {/* Photo Evidence */}
 {report.photoUrl && (
 <div className="mt-1">
 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
 <Camera className="w-3.5 h-3.5 text-slate-450"/> Sighting Photo
 </span>
 <a href={report.photoUrl} target="_blank"rel="noreferrer"className="inline-block relative group rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <img 
 src={report.photoUrl} 
 alt="Sighting Evidence"className="h-28 w-44 object-cover group-hover:scale-103 transition-transform"/>
 </a>
 </div>
 )}

 {/* Card controls */}
 {report.status ==='rejected'? (
 <div className="mt-2 p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-800 font-bold">
 🚫 This report was dismissed by the Admin. Reason: {report.rejectionReason ||'No reason provided.'}
 </div>
 ) : (
 <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100/50">
 {report.isSuspicious ? (
 <span className="text-xs text-rose-600 font-black flex items-center gap-1">
 <AlertTriangle className="w-3.5 h-3.5"/> Flagged Suspicious
 </span>
 ) : (
 <button 
 onClick={() => handleFlagSuspicious(selectedItem._id, report.email, null)}
 className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer">
 <AlertTriangle className="w-3.5 h-3.5"/> Flag Suspicious
 </button>
 )}

 <button 
 onClick={() => handleReunite(selectedItem._id, report.email, null)}
 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer">
 Accept & Close Listing
 </button>
 </div>
 )}
 </div>
 ))
 ) : (
 <p className="text-[13px] text-slate-500 dark:text-slate-300 italic text-center py-6">No reports filed yet.</p>
 )
 ) : (
 /* Found Item: Multiple claims Array */
 selectedItem.claims && selectedItem.claims.length > 0 ? (
 selectedItem.claims.map((claim, idx) => (
 <div 
 key={idx} 
 className={`p-5 rounded-lg border ${
 claim.status ==='rejected'?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/70 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 opacity-60': claim.isSuspicious 
 ?'bg-rose-50/30 border-rose-250/45':'bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410]/50 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60'} flex flex-col gap-4`}
 >
 {/* Claimant Details */}
 <div className="flex flex-wrap justify-between items-start gap-2">
 <div>
 <span className="font-bold text-slate-800 dark:text-white text-[13px] block">{claim.name}</span>
 <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
 <Mail className="w-3 h-3"/> {claim.email}
 </span>
 </div>
 <span className="text-[10px] text-slate-400 font-bold">
 {new Date(claim.submittedAt || Date.now()).toLocaleDateString()}
 </span>
 </div>

 {/* Statement */}
 <p className="text-[13px] text-slate-655 font-medium italic bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-3 rounded-xl border border-slate-100">"{claim.statement}"</p>

 {/* Photo Evidence */}
 {claim.photoUrl && (
 <div className="mt-1">
 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
 <Camera className="w-3.5 h-3.5 text-slate-450"/> Ownership Evidence Photo
 </span>
 <a href={claim.photoUrl} target="_blank"rel="noreferrer"className="inline-block relative group rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <img 
 src={claim.photoUrl} 
 alt="Ownership Evidence"className="h-28 w-44 object-cover group-hover:scale-103 transition-transform"/>
 </a>
 </div>
 )}

 {/* Card controls */}
 {claim.status ==='rejected'? (
 <div className="mt-2 p-3.5 bg-rose-50/50 border border-rose-100 rounded-lg text-xs text-rose-800 font-bold">
 🚫 This claim was dismissed by the Admin. Reason: {claim.rejectionReason ||'No reason provided.'}
 </div>
 ) : (
 <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100/50">
 {claim.isSuspicious ? (
 <span className="text-xs text-rose-600 font-black flex items-center gap-1">
 <AlertTriangle className="w-3.5 h-3.5"/> Flagged Suspicious
 </span>
 ) : (
 <button 
 onClick={() => handleFlagSuspicious(selectedItem._id, null, claim.email)}
 className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer">
 <AlertTriangle className="w-3.5 h-3.5"/> Flag Suspicious
 </button>
 )}

 <button 
 onClick={() => handleReunite(selectedItem._id, null, claim.email)}
 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer">
 Accept & Close Listing
 </button>
 </div>
 )}
 </div>
 ))
 ) : (
 <p className="text-[13px] text-slate-500 dark:text-slate-300 italic text-center py-6">No claims filed yet.</p>
 )
 )}
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
};

export default MyLostFound;
