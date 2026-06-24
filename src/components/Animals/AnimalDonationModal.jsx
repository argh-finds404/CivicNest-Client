import React, { useState } from'react';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';

import PaymentGatewaySelector from'../Payment/PaymentGatewaySelector';

export default function AnimalDonationModal({ animal, onClose }) {
 const [amount, setAmount] = useState('');
 const [showPayment, setShowPayment] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);

 const predefinedAmounts = [200, 500, 1000, 2000];

 const handleSubmit = (e) => {
 e.preventDefault();
 if (!amount || amount < 60) return toast.error('Minimum donation is ৳60 (due to payment gateway limits)');
 setShowPayment(true);
 };

 if (showPayment) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
 <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
 <PaymentGatewaySelector
 amount={amount}
 donationType="animal"referenceId={animal._id}
 onClose={() => setShowPayment(false)}
 onSuccess={() => {
 setShowPayment(false);
 setIsSuccess(true);
 }}
 />
 </div>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] w-full max-w-md rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
 
 {isSuccess ? (
 <div className="p-10 text-center relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
 <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
 <i className="ri-heart-pulse-fill text-5xl tracking-tight animate-pulse"></i>
 </div>
 <h2 className="text-3xl tracking-tight font-heading font-black text-slate-800 dark:text-white mb-3 tracking-tight">Thank You!</h2>
 <p className="text-slate-600 dark:text-slate-300 mb-8 font-medium text-[13px] leading-relaxed">
 Your generous donation of <span className="font-bold text-teal-600">৳{amount}</span> has been received. You are making a real difference in this {animal.animalType?.toLowerCase() ||'animal'}'s life.
 </p>
 <button 
 onClick={() => {
 onClose();
 window.location.reload(); 
 }}
 className="w-full py-4 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] rounded-xl font-bold transition-all flex items-center justify-center gap-2">
 Return to Details <i className="ri-arrow-right-line"></i>
 </button>
 </div>
 ) : (
 <>
 {/* Header */}
 <div className="bg-teal-600 p-4 text-white text-center relative">
 <button 
 onClick={onClose}
 className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 rounded-full hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/30 transition-colors">
 <i className="ri-close-line text-[13px]"></i>
 </button>
 <div className="w-16 h-16 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 rounded-full flex items-center justify-center mx-auto mb-3">
 <i className="ri-hand-heart-fill text-3xl tracking-tight"></i>
 </div>
 <h2 className="font-heading text-2xl tracking-tight font-bold tracking-tight">Help Fund Medical Care</h2>
 <p className="text-teal-100 text-[13px] mt-1">{animal.animalType || animal.type} — {animal.condition}</p>
 </div>

 {/* Body */}
 <div className="p-4">
 <div className="text-center mb-6 text-slate-600 dark:text-slate-300 text-[13px]">
 Your donation goes directly to paying for veterinary bills, medication, and food for this animal.
 {animal.fundingRaised > 0 && (
 <div className="font-bold text-teal-600 mt-2 bg-teal-50 py-1.5 px-3 rounded-full inline-block border border-teal-100">
 Raised so far: ৳{animal.fundingRaised}
 </div>
 )}
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 
 <div className="grid grid-cols-2 gap-3">
 {predefinedAmounts.map(preset => (
 <button
 key={preset}
 type="button"onClick={() => setAmount(preset)}
 className={`py-3 rounded-xl border-2 font-bold transition-all ${
 amount === preset 
 ?'border-teal-600 bg-teal-50 text-teal-700':'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-600 dark:text-slate-300 hover:border-teal-300'}`}
 >
 ৳{preset}
 </button>
 ))}
 </div>

 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <span className="text-slate-400 font-bold">৳</span>
 </div>
 <input 
 type="number"value={amount}
 onChange={(e) => setAmount(Number(e.target.value))}
 placeholder="Custom Amount"className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] transition-all text-[13px] font-bold"min="60"/>
 </div>

 <button 
 type="submit"disabled={!amount || amount < 60}
 className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-[13px] shadow-lg hover:bg-teal-700 hover:shadow-teal-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
 <i className="ri-secure-payment-line"></i> Proceed to Pay ৳{amount ||'0'}
 </button>
 </form>
 </div>
 </>
 )}

 </div>
 </div>
 );
}
