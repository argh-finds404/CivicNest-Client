import React, { useState } from'react';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';

import PaymentGatewaySelector from'../Payment/PaymentGatewaySelector';

export default function EventDonationModal({ event, onClose }) {
 const [amount, setAmount] = useState('');
 const [showPayment, setShowPayment] = useState(false);

 const predefinedAmounts = [500, 1000, 2000, 5000];

 const handleSubmit = (e) => {
 e.preventDefault();
 if (!amount || amount < 60) return toast.error('Minimum donation is ৳60 (due to payment gateway limits)');
 setShowPayment(true);
 };

 if (showPayment) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
 <PaymentGatewaySelector
 amount={amount}
 donationType="event"referenceId={event._id}
 onClose={() => setShowPayment(false)}
 onSuccess={() => {
 setShowPayment(false);
 toast.success('Donation successful! Thank you.');
 setTimeout(() => window.location.reload(), 1000);
 }}
 />
 </div>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] w-full max-w-md rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-[#1e3040]">
 
 {/* Header */}
 <div className="bg-teal-600 p-4 text-white text-center relative">
 <button 
 onClick={onClose}
 className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 rounded-full hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/35 transition-colors border border-white/20 cursor-pointer">
 <span className="material-symbols-outlined text-[18px]">close</span>
 </button>
 <span className="material-symbols-outlined text-4xl tracking-tight mb-2">volunteer_activism</span>
 <h2 className="font-heading text-2xl tracking-tight">Donate to Drive</h2>
 <p className="text-teal-100 text-[13px] mt-1">{event.title}</p>
 </div>

 {/* Body */}
 <div className="p-4">
 <div className="text-center mb-6 text-slate-500 dark:text-slate-300 text-[13px]">
 Help fund supplies like bags, gloves, and tools for this community cleanup. 
 <br/><span className="font-bold text-teal-600 mt-2 inline-block">Goal: ৳{event.fundingGoal}</span>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 
 <div className="grid grid-cols-2 gap-3">
 {predefinedAmounts.map(preset => (
 <button
 key={preset}
 type="button"onClick={() => setAmount(preset)}
 className={`py-3 rounded-xl border-2 font-bold transition-all cursor-pointer ${
 amount === preset 
 ?'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400':'border-slate-200 dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] hover:border-teal-300'}`}
 >
 ৳{preset}
 </button>
 ))}
 </div>

 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <span className="text-slate-500 dark:text-slate-300 font-bold">৳</span>
 </div>
 <input 
 type="number"value={amount}
 onChange={(e) => setAmount(Number(e.target.value))}
 placeholder="Custom Amount"className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-slate-200 dark:border-[#1e3040] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0b1215] text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none text-[13px] font-bold"min="60"/>
 </div>

 <button 
 type="submit"disabled={!amount || amount < 60}
 className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-[13px] shadow-lg hover:bg-teal-700 hover:shadow-teal-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
 Proceed to Pay ৳{amount ||'0'}
 </button>
 </form>
 </div>

 </div>
 </div>
 );
}
