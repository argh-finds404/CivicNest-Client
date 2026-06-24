import React, { useState } from'react';
import toast from'react-hot-toast';
import { motion, AnimatePresence } from'framer-motion';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import MinimalLoader from'../common/MinimalLoader.jsx';

const ContributionModal = ({ issueId, isOpen, onClose, onContributeSuccess }) => {
 const axiosPublic = useAxiosPublic();
 const [amount, setAmount] = useState(100);
 const [name, setName] = useState("");
 const [phone, setPhone] = useState("");
 const [message, setMessage] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (amount < 10) {
 toast.error("Minimum contribution is 10 BDT");
 return;
 }

 setIsSubmitting(true);
 try {
 const payload = {
 issueId,
 amount: Number(amount),
 name,
 phone,
 message
 };

 const res = await axiosPublic.post('/contributions', payload);

 toast.success("Thank you for your contribution!");
 if (onContributeSuccess) onContributeSuccess(payload);
 onClose();
 // Reset form
 setAmount(100);
 setName("");
 setPhone("");
 setMessage("");
 } catch (error) {
 toast.error(error.message);
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"></motion.div>
 
 <motion.div 
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 transition={{ type:"spring", bounce: 0.3, duration: 0.4 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-2xl max-w-md w-full overflow-hidden relative z-10">
 <button 
 onClick={onClose} 
 className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors w-8 h-8 flex justify-center items-center rounded-full hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]">
 <i className="ri-close-line text-[13px] tracking-tight"></i>
 </button>

 <div className="bg-emerald-600 p-4 text-white text-center">
 <div className="w-16 h-16 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
 <i className="ri-hand-heart-fill text-3xl tracking-tight"></i>
 </div>
 <h3 className="font-bold text-2xl tracking-tight mb-1 tracking-tight">Support This Issue</h3>
 <p className="text-emerald-100 text-[13px]">Your contribution will help resolve this problem faster.</p>
 </div>

 <form onSubmit={handleSubmit} className="p-4 space-y-4">
 <div className="form-control">
 <label className="label"><span className="label-text font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Amount (BDT) <span className="text-red-500">*</span></span></label>
 <div className="flex items-center gap-2">
 {[100, 500, 1000].map(val => (
 <button 
 key={val}
 type="button"onClick={() => setAmount(val)}
 className={`flex-1 py-2 rounded-lg border font-semibold transition-colors ${amount === val ?'bg-emerald-50 text-emerald-600 border-emerald-200':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]'}`}
 >
 ৳{val}
 </button>
 ))}
 </div>
 <input 
 type="number"className="input input-bordered w-full mt-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] font-bold"value={amount}
 onChange={e => setAmount(e.target.value)}
 min="10"required
 />
 </div>

 <div className="form-control">
 <label className="label"><span className="label-text font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Name <span className="text-red-500">*</span></span></label>
 <input 
 type="text"placeholder="How should we address you?"className="input input-bordered focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"value={name}
 onChange={e => setName(e.target.value)}
 required
 />
 </div>

 <div className="form-control">
 <label className="label"><span className="label-text font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Phone Number <span className="text-red-500">*</span></span></label>
 <input 
 type="tel"placeholder="e.g. +8801700000000"className="input input-bordered focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"value={phone}
 onChange={e => setPhone(e.target.value)}
 required
 />
 </div>

 <div className="form-control">
 <label className="label"><span className="label-text font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Message (Optional)</span></label>
 <textarea 
 className="textarea textarea-bordered h-20 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"placeholder="Leave a word of encouragement..."value={message}
 onChange={e => setMessage(e.target.value)}
 ></textarea>
 </div>

 <button 
 type="submit"className="btn w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none mt-2"disabled={isSubmitting}
 >
 {isSubmitting ? <MinimalLoader /> :`Contribute ৳${amount}`}
 </button>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
};

export default ContributionModal;
