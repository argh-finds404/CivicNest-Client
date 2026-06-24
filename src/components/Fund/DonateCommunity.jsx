import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import PaymentGatewaySelector from '../Payment/PaymentGatewaySelector';
import toast from 'react-hot-toast';

const DonateCommunity = () => {
  const [amount, setAmount] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
  }, []);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['communityDonationSummary'],
    queryFn: async () => {
      const res = await axiosPublic.get('/public/contributions/summary?type=community');
      return res.data;
    }
  });

  const handleAmountSelect = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setAmount(Number(e.target.value) || 0);
  };

  const handleDonateClick = () => {
    if (!amount || amount < 10) {
      toast.error('Minimum donation is ৳10.');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    toast.success('Thank you for supporting CivicNest!');
  };

  // Milestone Progress calculations
  const totalRaised = summary?.totalRaised || 0;
  const targetGoal = 50000;
  const percentage = Math.min(100, Math.round((totalRaised / targetGoal) * 100));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a120e] py-16 px-4 sm:px-6 lg:px-8 pt-28 transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[10%] -left-[10%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#0b1215]/80 backdrop-blur-xl border border-slate-200/80 dark:border-[#1e3040]/50 rounded-[2rem] p-6 sm:p-10 shadow-2xl"
        >
          {/* Header Section */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 mx-auto bg-gradient-to-tr from-teal-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center text-4xl mb-5 shadow-lg shadow-teal-500/20"
            >
              <i className="ri-heart-pulse-fill animate-pulse"></i>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight font-heading"
            >
              Support Civic<span className="text-[#0f766e] dark:text-emerald-400">Nest</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-600 dark:text-slate-350 text-[14.5px] leading-relaxed max-w-md mx-auto"
            >
              Your contributions keep our neighborhood servers active and fund green cleanup initiatives directly. Help us sustain a cleaner community.
            </motion.p>
          </div>

          {/* Stats Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-slate-50 dark:bg-[#0d1d18]/40 border border-slate-100 dark:border-[#14241d]/40 rounded-2xl p-5 mb-8 text-left shadow-inner"
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Community Milestone</span>
              <span className="text-xs font-black text-teal-600 dark:text-emerald-400">৳{totalRaised.toLocaleString()} raised</span>
            </div>
            
            {/* ProgressBar */}
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3.5 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.5)]"
              />
            </div>

            <div className="flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-300">
              <p>Target Goal: ৳{targetGoal.toLocaleString()}</p>
              <p className="font-bold text-slate-700 dark:text-emerald-400">{percentage}% reached</p>
            </div>
          </motion.div>

          {/* Form Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3.5 text-left">
                Choose Donation Amount
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[100, 250, 500, 1000].map((val, idx) => {
                  const isSelected = amount === val && !customAmount;
                  return (
                    <motion.button
                      key={val}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAmountSelect(val)}
                      className={`py-3.5 px-4 rounded-xl font-bold text-[14.5px] transition-all relative overflow-hidden flex items-center justify-center gap-1 cursor-pointer border ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 border-transparent text-white shadow-lg shadow-teal-500/25 ring-2 ring-emerald-400/20'
                          : 'bg-white dark:bg-[#111c21] border-slate-200 dark:border-[#1e3040]/70 text-slate-700 dark:text-[#cbd5e1] hover:border-teal-400 dark:hover:border-teal-700/50 hover:bg-slate-50 dark:hover:bg-[#152329]'
                      }`}
                    >
                      <span>৳{val}</span>
                      {isSelected && (
                        <motion.span
                          layoutId="selectedCheck"
                          className="material-symbols-outlined text-[15px] leading-none"
                        >
                          check_circle
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Custom Input */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-left"
            >
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Or enter custom amount
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-lg">৳</span>
                <input
                  type="number"
                  min="10"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="Custom amount"
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-white dark:bg-[#111c21] border border-slate-200 dark:border-[#1e3040]/70 focus:outline-none focus:border-teal-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-emerald-500/20 text-slate-800 dark:text-[#e2e8f0] font-bold text-[15.5px] transition-all hover:border-slate-300 dark:hover:border-slate-700"
                />
              </div>
            </motion.div>

            {/* Support Pledge Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-xl border border-dashed border-teal-500/20 dark:border-teal-400/20 bg-teal-500/5 text-left flex items-start gap-3"
            >
              <i className="ri-shield-check-line text-xl text-teal-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-0.5">Secure Transaction</h4>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-350 leading-relaxed font-medium">
                  We process payments securely using encrypted, industry-standard gateways. 100% of community donations go toward platform maintenance and public cleanups.
                </p>
              </div>
            </motion.div>

            {/* Payment triggers */}
            <AnimatePresence mode="wait">
              {!showPayment ? (
                <motion.button
                  key="donate-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleDonateClick}
                  className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-base shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-secure-payment-line text-lg" />
                  Proceed to Pay ৳{amount || 0}
                </motion.button>
              ) : (
                <motion.div
                  key="payment-gateway"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="mt-6 border-t border-slate-200 dark:border-[#1e3040] pt-8"
                >
                  <PaymentGatewaySelector
                    amount={amount}
                    donationType="community"
                    onClose={() => setShowPayment(false)}
                    onSuccess={handlePaymentSuccess}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonateCommunity;
