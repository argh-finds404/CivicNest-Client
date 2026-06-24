import React from'react';
import { useNavigate, useLocation } from'react-router';
import { motion } from'framer-motion';

const PaymentFailure = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const searchParams = new URLSearchParams(location.search);
 const reason = searchParams.get('reason');

 let message ="We couldn't process your payment at this time. Please try again or use a different payment method.";
 if (reason ==='cancelled') {
 message ="You cancelled the payment process before it completed.";
 }

 return (
 <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 className="max-w-md w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 sm:p-10 shadow-xl shadow-slate-200/50 text-center border border-slate-100">
 <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
 <i className="ri-error-warning-line text-5xl tracking-tight"></i>
 </div>
 
 <h1 className="text-3xl tracking-tight font-black text-slate-800 dark:text-white mb-2 tracking-tight">Payment Failed</h1>
 <p className="text-slate-500 dark:text-slate-300 font-medium mb-8">
 {message}
 </p>

 <div className="space-y-3">
 <button 
 onClick={() => navigate(-1)}
 className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-slate-900/20">
 Try Again
 </button>
 <button 
 onClick={() => navigate('/')}
 className="w-full py-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors">
 Return to Dashboard
 </button>
 </div>
 </motion.div>
 </div>
 );
};

export default PaymentFailure;
