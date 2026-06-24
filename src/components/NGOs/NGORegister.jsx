import React, { useState } from'react';
import toast from'react-hot-toast';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useNavigate } from'react-router';
import { motion } from'framer-motion';
import BackButton from'../common/BackButton';

const NGORegister = () => {
 const axiosSecure = useAxiosSecure();
 const navigate = useNavigate();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 name:'',
 mission:'',
 contactEmail:'',
 website:'',
 phone:'',
 logoUrl:'',
 focusAreas: []
 });

 const handleChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const res = await axiosSecure.post('/ngos', formData);
 if (res.data.insertedId) {
 toast.success("NGO Registration submitted! Pending admin approval.");
 navigate('/ngos');
 }
 } catch (error) {
 toast.error(error.response?.data?.message ||"Registration failed");
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="min-h-screen bg-[#f0fdf4]">
 {/* Banner Section */}
 <div className="relative pt-28 pb-12 px-[5%] bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 overflow-hidden">
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full blur-3xl"></div>
 <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
 </div>

 <div className="relative z-10 max-w-7xl mx-auto">
 <div className="mb-4">
 <BackButton variant="light"/>
 </div>

 <div className="text-white">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 text-emerald-300">
 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
 <span className="text-[13px] font-bold uppercase tracking-wider">NGO Registration</span>
 </div>
 <h1 className="font-heading text-4xl tracking-tight md:text-5xl tracking-tight font-extrabold mb-4 leading-tight tracking-tight">
 Register Your NGO
 </h1>
 <p className="font-body text-white/80 text-[13px] max-w-2xl">
 Join the CivicNest network. All applications are reviewed by our community admins.
 </p>
 </div>
 </div>
 </div>

 {/* Form Section */}
 <div className="px-[5%] py-8">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="max-w-2xl mx-auto bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-5 md:p-12 rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Organization Name *</label>
 <input required type="text"name="name"value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--g-300)] focus:ring-1 focus:ring-[var(--g-300)]/50 transition-all font-medium text-slate-800 dark:text-white"placeholder="e.g. Green Earth Initiative"/>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Mission Statement *</label>
 <textarea required name="mission"value={formData.mission} onChange={handleChange} rows="4"className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--g-300)] focus:ring-1 focus:ring-[var(--g-300)]/50 transition-all resize-none font-medium text-slate-800 dark:text-white"placeholder="What does your organization strive to achieve?"></textarea>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Contact Email *</label>
 <input required type="email"name="contactEmail"value={formData.contactEmail} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--g-300)] focus:ring-1 focus:ring-[var(--g-300)]/50 transition-all font-medium text-slate-800 dark:text-white"placeholder="hello@ngo.org"/>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Phone (Optional)</label>
 <input type="tel"name="phone"value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--g-300)] focus:ring-1 focus:ring-[var(--g-300)]/50 transition-all font-medium text-slate-800 dark:text-white"placeholder="+880 1XXX-XXXXXX"/>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Website URL (Optional)</label>
 <input type="url"name="website"value={formData.website} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--g-300)] focus:ring-1 focus:ring-[var(--g-300)]/50 transition-all font-medium text-slate-800 dark:text-white"placeholder="https://"/>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Logo Image URL *</label>
 <input required type="url"name="logoUrl"value={formData.logoUrl} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--g-300)] focus:ring-1 focus:ring-[var(--g-300)]/50 transition-all font-medium text-slate-800 dark:text-white"placeholder="https://imgur.com/..."/>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-3">Focus Areas (Select all that apply)</label>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
 {[
 { value:'environment', label:'Environment 🌿'},
 { value:'education', label:'Education 📚'},
 { value:'health', label:'Health 🏥'},
 { value:'animals', label:'Animals 🐾'},
 { value:'community', label:'Community 👥'},
 ].map(area => {
 const isSelected = formData.focusAreas.includes(area.value);
 return (
 <button
 key={area.value}
 type="button"onClick={() => {
 setFormData(prev => ({
 ...prev,
 focusAreas: isSelected
 ? prev.focusAreas.filter(a => a !== area.value)
 : [...prev.focusAreas, area.value]
 }));
 }}
 className={`px-4 py-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
 isSelected
 ?'border-[var(--g-600)] bg-[var(--g-50)] text-[var(--g-700)] shadow-sm':'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]'}`}
 >
 {area.label}
 </button>
 );
 })}
 </div>
 </div>

 <button disabled={isSubmitting} type="submit"className="w-full bg-[var(--g-600)] hover:bg-[var(--g-700)] text-white font-bold py-4 rounded-xl transition-all shadow-md mt-4">
 {isSubmitting ?"Submitting...":"Submit Application"}
 </button>
 </form>
 </motion.div>
 </div>
 </div>
 );
};

export default NGORegister;