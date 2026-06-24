import React, { useState } from'react';
import { useQuery, useQueryClient } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';
import MinimalLoader from'../common/MinimalLoader';
import CreditIndicator from'../common/CreditIndicator';
import { useAuth } from'../../hooks/useAuth';

const CATEGORIES = ['General','Safety','Suggestions','Events','Off-Topic'];

export default function NewThreadModal({ isOpen, onClose, onThreadCreated }) {
 const { user } = useAuth();
 const [formData, setFormData] = useState({
 title:'',
 body:'',
 category:'General'});
 const [isSubmitting, setIsSubmitting] = useState(false);
 
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();

 const { data: creditData } = useQuery({
 queryKey: ['credits','forum'],
 queryFn: () => axiosSecure.get('/credits/forum').then(r => r.data),
 staleTime: 30000,
 enabled: !!user?.email && isOpen,
 });
 const credits = creditData?.remaining;

 if (!isOpen) return null;

 const handleChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.title.trim() || !formData.body.trim()) return;

 setIsSubmitting(true);
 try {
 const res = await axiosSecure.post('/forum', formData);
 const newId = res.data._id || res.data.insertedId;
 if (newId) {
 toast.success('Your thread has been posted successfully.');
 queryClient.invalidateQueries({ queryKey: ['forum'] });
 if (onThreadCreated) {
 onThreadCreated(newId);
 }
 setFormData({ title:'', body:'', category:'General'});
 onClose();
 }
 } catch (error) {
 console.error("Failed to create thread", error);
 toast.error(error.response?.data?.message ||'Failed to create thread. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 {/* Backdrop */}
 <div 
 className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"onClick={onClose}
 />

 {/* Modal Content */}
 <div className="relative w-full max-w-xl bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
 
 {/* Header */}
 <div className="p-4 border-b border-gray-100 flex justify-between items-start">
 <div>
 <h2 className="text-2xl tracking-tight font-black text-gray-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>
 Create New Thread
 </h2>
 <p className="text-gray-500 dark:text-slate-300 text-xs mt-1">
 Start a new discussion with the community.
 </p>
 </div>
 <button 
 onClick={onClose}
 className="text-gray-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center">
 <i className="ri-close-line text-[13px] tracking-tight"></i>
 </button>
 </div>

 {/* Scrollable Form */}
 <form 
 onSubmit={handleSubmit} 
 data-lenis-prevent="true"className="flex-1 overflow-y-auto p-4 space-y-5">
 <div className="flex justify-between items-center bg-teal-50 dark:bg-teal-950/20 p-3 rounded-lg border border-teal-100 dark:border-teal-900/50">
 <span className="text-xs font-semibold text-teal-800 dark:text-teal-400">Discussion Cost</span>
 <CreditIndicator postType="forum"/>
 </div>

 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] uppercase tracking-wider mb-2">
 Thread Title <span className="text-red-500">*</span>
 </label>
 <input 
 type="text"name="title"value={formData.title}
 onChange={handleChange}
 placeholder="What's on your mind?"className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-gray-900 dark:text-white text-[13px] font-semibold"required
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] uppercase tracking-wider mb-2">
 Category <span className="text-red-500">*</span>
 </label>
 <div className="flex flex-wrap gap-1.5">
 {CATEGORIES.map(cat => (
 <button 
 key={cat} 
 type="button"onClick={() => setFormData({ ...formData, category: cat })}
 className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all
 ${formData.category === cat
 ?'border-teal-500 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400':'border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] text-gray-500 dark:text-slate-300 hover:border-gray-300 dark:border-[#1e3040] dark:border-[#1e3040] dark:hover:border-gray-600'}`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] uppercase tracking-wider mb-2">
 Body <span className="text-red-500">*</span>
 </label>
 <textarea 
 name="body"value={formData.body}
 onChange={handleChange}
 placeholder="Describe your ideas or observations in detail..."rows="5"className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-y text-gray-900 dark:text-white text-[13px] leading-relaxed"required
 />
 </div>

 {/* Footer */}
 <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
 <button 
 type="button"onClick={onClose}
 className="px-5 py-2 rounded-xl text-[13px] font-bold text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
 Cancel
 </button>
 <button 
 type="submit"disabled={isSubmitting || credits === 0 || !formData.title.trim() || !formData.body.trim()}
 className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl text-[13px] font-bold shadow-md transition-all flex items-center gap-1.5">
 {isSubmitting ? (
 <><MinimalLoader size="sm"color="#ffffff"/> Posting...</>
 ) : credits === 0 ? (
 <>Out of Credits</>
 ) : (
 <>Post Thread</>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
