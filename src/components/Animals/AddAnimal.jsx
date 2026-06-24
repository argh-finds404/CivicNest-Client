import React, { useState } from"react";
import { useNavigate } from"react-router";
import { motion } from"framer-motion";
import { useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { useAuth } from"../../hooks/useAuth";
import CreditIndicator from"../common/CreditIndicator";
import BackButton from"../common/BackButton";
import toast from'react-hot-toast';
import { FaDog, FaCat, FaCow, FaCrow, FaPaw } from"react-icons/fa6";

const ANIMAL_TYPES = [
 { value:'Dog', icon: <FaDog />, label:'Dog'},
 { value:'Cat', icon: <FaCat />, label:'Cat'},
 { value:'Cow', icon: <FaCow />, label:'Cow'}, 
 { value:'Bird', icon: <FaCrow />, label:'Bird'}, 
 { value:'Other', icon: <FaPaw />, label:'Other'},
];

export default function AddAnimal() {
 const navigate = useNavigate();
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const [loading, setLoading] = useState(false);

 const { data: creditData } = useQuery({
 queryKey: ['credits','animals'],
 queryFn: () => axiosSecure.get('/credits/animals').then(r => r.data),
 staleTime: 30000,
 enabled: !!user?.email,
 });
 const credits = creditData?.remaining;

 const [formData, setFormData] = useState({
 animalType:"Dog",
 urgency:"medium",
 condition:"",
 location:"",
 date:"",
 image:"",
 contactInfo: user?.email ||"",
 });

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 await axiosSecure.post("/animals", formData);
 toast.success("Animal report submitted successfully!");
 navigate("/animals");
 } catch (error) {
 console.error("Failed to post animal report", error);
 toast.error("Failed to submit. Please try again.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-[#f0fdf4]">
 {/* Banner Section */}
 <div className="relative pt-28 pb-16 px-[5%] overflow-hidden">
 {/* Background Image & Overlay */}
 <div className="absolute inset-0">
 <img 
 src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80"alt="Animal Rescue"className="w-full h-full object-cover"/>
 <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-teal-900/80 backdrop-blur-sm"></div>
 </div>

 <div className="relative z-10 max-w-7xl mx-auto">
 <div className="mb-6">
 <BackButton variant="light"/>
 </div>

 <div className="text-white">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 text-emerald-300">
 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
 <span className="text-xs font-bold uppercase tracking-wider">Report Animal</span>
 </div>
 <h1 className="font-heading text-4xl tracking-tight md:text-5xl tracking-tight font-black mb-3 leading-tight drop-shadow-md tracking-tight">
 Help an Animal in Need
 </h1>
 <p className="font-body text-emerald-50/90 text-[13px] font-medium drop-shadow-sm max-w-xl">
 Report stray animals that need medical attention, shelter, or food. Every report can save a life.
 </p>
 </div>
 </div>
 </div>

 {/* Form Section */}
 <div className="px-[5%] py-8">
 <div className="max-w-3xl mx-auto">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden">
 <form onSubmit={handleSubmit} className="p-5 space-y-8">
 <div className="flex justify-between items-center pb-4 border-b border-slate-100 flex-wrap gap-4">
 <h2 className="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">Animal Details</h2>
 <CreditIndicator postType="animals"/>
 </div>

 {/* Animal Type - Icon Selection */}
 <div className="space-y-3">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Animal Type</label>
 <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
 {ANIMAL_TYPES.map(type => (
 <button
 key={type.value}
 type="button"onClick={() => setFormData({ ...formData, animalType: type.value })}
 className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all
 ${formData.animalType === type.value
 ?'border-teal-600 bg-teal-50 text-teal-700':'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-500 dark:text-slate-300 hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]'}`}
 >
 <span className="text-2xl tracking-tight">{type.icon}</span>
 <span className="text-[13px] font-medium">{type.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Urgency - Segmented Control */}
 <div className="space-y-3">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Urgency Level</label>
 <div className="flex flex-wrap sm:flex-nowrap bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] p-1 rounded-xl gap-1">
 {['low','medium','high','emergency'].map(level => (
 <button
 key={level}
 type="button"onClick={() => setFormData({ ...formData, urgency: level })}
 className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5
 ${formData.urgency === level
 ?'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-teal-600 shadow-sm ring-1 ring-slate-200/50':'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-200/50'}`}
 >
 {level ==='emergency'&& <i className="ri-alarm-warning-fill text-rose-500"></i>}
 {level.charAt(0).toUpperCase() + level.slice(1)}
 </button>
 ))}
 </div>
 </div>

 {/* Description */}
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center gap-2">
 <i className="ri-file-text-line text-teal-600"></i> Condition Description *
 </label>
 <textarea 
 name="condition"required
 rows="4"value={formData.condition} 
 onChange={handleChange}
 placeholder="Describe the animal's condition, appearance, and what kind of help is needed..."className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all resize-none"></textarea>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Location */}
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center gap-2">
 <i className="ri-map-pin-line text-teal-600"></i> Location *
 </label>
 <div className="relative">
 <input 
 type="text"name="location"required
 value={formData.location} 
 onChange={handleChange}
 placeholder="Precise location or landmark"className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all"/>
 <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
 </div>
 </div>

 {/* Date */}
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center gap-2">
 <i className="ri-calendar-event-line text-teal-600"></i> Date Spotted *
 </label>
 <div className="relative">
 <input 
 type="date"name="date"required
 value={formData.date} 
 onChange={handleChange}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all"/>
 </div>
 </div>
 </div>

 {/* Image */}
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center gap-2">
 <i className="ri-image-add-line text-teal-600"></i> Photo (Optional)
 </label>
 <div className="relative">
 <input 
 type="url"name="image"value={formData.image} 
 onChange={handleChange}
 placeholder="https://..."className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all"/>
 <i className="ri-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
 </div>
 </div>

 <div className="pt-4 flex justify-end gap-4">
 <button
 type="button"onClick={() => navigate("/animals")}
 className="px-6 py-3 font-bold text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 rounded-xl transition-colors">
 Cancel
 </button>
 <button
 type="submit"disabled={loading || credits === 0}
 className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-900/20 transition-all disabled:opacity-50 flex items-center gap-2">
 {loading ?"Submitting...": credits === 0 ?"Out of Credits": <><i className="ri-send-plane-fill"></i> Submit Report</>}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 </div>
 </div>
 );
}