import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import StripeCheckoutWrapper from'./StripeCheckoutWrapper';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';

const PaymentGatewaySelector = ({ amount, currency ='BDT', donationType, referenceId, onClose, onSuccess }) => {
 const [selectedGateway, setSelectedGateway] = useState(null);
 const [selectedMethod, setSelectedMethod] = useState('card'); // 'card' | 'local'
 const [isProcessingSSL, setIsProcessingSSL] = useState(false);
 const [isProcessingStripe, setIsProcessingStripe] = useState(false);
 const [clientSecret, setClientSecret] = useState(null);
 const axiosSecure = useAxiosSecure();

  const handleSSLCommerz = async () => {
    setSelectedMethod('sslcommerz');
    setIsProcessingSSL(true);
    try {
      const res = await axiosSecure.post('/api/payment/ssl-init', {
        amount,
        donationType,
        referenceId: referenceId || null
      });
      if (res.data.GatewayPageURL) {
        window.location.replace(res.data.GatewayPageURL);
      } else {
        toast.error('Failed to get gateway URL');
      }
    } catch (err) {
      console.error("SSLCommerz Init Error:", err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to initialize local payment. Please try again.');
    } finally {
      setIsProcessingSSL(false);
    }
  };

  const handleStripe = async () => {
    setSelectedMethod('card');
    if (clientSecret) {
      setSelectedGateway('stripe');
      return;
    }
    
    setIsProcessingStripe(true);
    try {
      const res = await axiosSecure.post('/api/payment/create-stripe-intent', {
        amount,
        currency,
        donationType,
        referenceId: referenceId || null
      });
      setClientSecret(res.data.clientSecret);
      setSelectedGateway('stripe');
    } catch (err) {
      console.error("Failed to fetch payment intent:", err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to initialize Stripe. Please try again.');
    } finally {
      setIsProcessingStripe(false);
    }
  };

 return (
  <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 sm:p-5 relative">
  <button 
  onClick={onClose}
  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300 hover:bg-slate-200 transition-colors">
  <i className="ri-close-line text-[13px] tracking-tight"></i>
  </button>

  <div className="text-center mb-6">
  <h2 className="text-2xl tracking-tight font-black text-slate-800 dark:text-white mb-2 tracking-tight">Support the Cause</h2>
  <p className="text-slate-500 dark:text-slate-300 font-medium">Choose your preferred payment method</p>
  <div className="mt-4 inline-block px-6 py-3 bg-pink-50 rounded-lg border border-pink-100">
  <span className="text-[13px] font-bold text-pink-400 uppercase tracking-wider block mb-1">Total Amount</span>
  <span className="text-3xl tracking-tight font-black text-pink-600">৳{amount}</span>
  </div>
  </div>

  {/* Trust & Transparency Section */}
  <div className="mb-8">
    {donationType === 'issue' && (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 flex gap-3 text-left">
        <i className="ri-shield-keyhole-line text-xl text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"></i>
        <div>
          <h4 className="text-[13px] font-bold text-emerald-900 dark:text-emerald-300 mb-1">Secure Escrow System</h4>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium leading-relaxed">
            Your funds are held securely in escrow. They are only released to the organizer once community verifications confirm the issue is fixed.
          </p>
        </div>
      </div>
    )}

    {donationType === 'event' && (
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 flex gap-3 text-left">
        <i className="ri-team-line text-xl text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"></i>
        <div>
          <h4 className="text-[13px] font-bold text-blue-900 dark:text-blue-300 mb-1">Direct Event Support</h4>
          <p className="text-xs text-blue-700/80 dark:text-blue-400/80 font-medium leading-relaxed">
            These funds go directly to the organizer to support cleanup supplies and event logistics. Thank you for making this event possible!
          </p>
        </div>
      </div>
    )}

    {(donationType === 'community' || donationType === 'ngo') && (
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl p-4 flex gap-3 text-left">
        <i className="ri-heart-3-line text-xl text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"></i>
        <div>
          <h4 className="text-[13px] font-bold text-amber-900 dark:text-amber-300 mb-1">Community Growth</h4>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium leading-relaxed">
            Your direct contribution empowers operational initiatives. These funds are processed securely without escrow holds.
          </p>
        </div>
      </div>
    )}

    {/* Bank-Grade Badges */}
    <div className="flex items-center justify-center gap-4 mt-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
        <i className="ri-lock-password-line text-slate-400 dark:text-slate-500"></i>
        256-bit SSL
      </div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
        <i className="ri-shield-check-fill text-[#635BFF] dark:text-[#8079ff]"></i>
        PCI Compliant
      </div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
        <i className="ri-error-warning-line text-emerald-500 dark:text-emerald-400"></i>
        Fraud Protection
      </div>
    </div>
  </div>

  <AnimatePresence mode="wait">
  {!selectedGateway ? (
  <motion.div 
  key="selector"initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
  className="space-y-4 relative">
  {/* Cards container with disabled state */}
  <div className={`space-y-4 transition-all duration-300 ${isProcessingStripe || isProcessingSSL ?'opacity-50 pointer-events-none':''}`}>
  <motion.button
  whileHover={!isProcessingStripe && !isProcessingSSL ? { scale: 1.02 } : {}}
  whileTap={!isProcessingStripe && !isProcessingSSL ? { scale: 0.98 } : {}}
  onClick={handleStripe}
  disabled={isProcessingStripe || isProcessingSSL}
  className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-slate-100 hover:border-[#635BFF] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:shadow-md transition-all text-left group relative overflow-hidden">
  {/* Stripe loading skeleton overlay */}
  {isProcessingStripe && (
  <div className="absolute inset-0 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/60 backdrop-blur-sm z-10 flex items-center justify-center">
  <div className="flex flex-col items-center gap-2">
  <div className="w-6 h-6 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin"></div>
  <span className="text-xs font-bold text-[#635BFF]">Connecting to Stripe...</span>
  </div>
  </div>
  )}
  
  <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center text-2xl tracking-tight transition-transform">
  <i className="ri-bank-card-line"></i>
  </div>
  <div>
  <h3 className="font-bold text-slate-800 dark:text-white text-[13px] tracking-tight">Credit / Debit Card</h3>
  <p className="text-[13px] text-slate-500 dark:text-slate-300">Secure payment via Stripe</p>
  </div>
  <i className="ri-arrow-right-s-line ml-auto text-2xl tracking-tight text-slate-300 group-hover:text-[#635BFF]"></i>
  </motion.button>

  <motion.button
  whileHover={!isProcessingStripe && !isProcessingSSL ? { scale: 1.02 } : {}}
  whileTap={!isProcessingStripe && !isProcessingSSL ? { scale: 0.98 } : {}}
  onClick={handleSSLCommerz}
  disabled={isProcessingStripe || isProcessingSSL}
  className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all text-left group relative overflow-hidden">
  {isProcessingSSL && (
  <div className="absolute inset-0 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/60 backdrop-blur-sm z-10 flex items-center justify-center">
  <div className="flex flex-col items-center gap-2">
  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  <span className="text-xs font-bold text-emerald-600">Connecting to SSLCommerz...</span>
  </div>
  </div>
  )}

  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl tracking-tight transition-transform">
  <i className="ri-smartphone-line"></i>
  </div>
  <div>
  <h3 className="font-bold text-slate-800 dark:text-white text-[13px] tracking-tight">Mobile Banking / Local Cards</h3>
  <p className="text-[13px] text-slate-500 dark:text-slate-300">bKash, Nagad, Rocket & more</p>
  </div>
  <i className="ri-arrow-right-s-line ml-auto text-2xl tracking-tight text-slate-300 group-hover:text-emerald-500"></i>
  </motion.button>
  </div>
  </motion.div>
  ) : (
  <motion.div
  key="stripe"initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  >
  <button 
  onClick={() => setSelectedGateway(null)}
  className="text-[13px] font-bold text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:text-white mb-4 flex items-center gap-1 transition-colors">
  <i className="ri-arrow-left-s-line"></i> Back to options
  </button>

  {selectedMethod === 'local' ? (
    <div className="p-4 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/5 text-left flex items-start gap-3 mb-6">
      <i className="ri-information-line text-lg text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
      <div>
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-0.5">Local Cards Gateway</h4>
        <p className="text-[11.5px] text-slate-555 dark:text-slate-300 leading-relaxed font-medium">
          Stripe securely processes all local credit/debit cards (Visa, Mastercard, etc.). Enter your card details below to complete payment.
        </p>
      </div>
    </div>
  ) : (
    <div className="p-4 rounded-xl border border-dashed border-[#635BFF]/20 bg-[#635BFF]/5 text-left flex items-start gap-3 mb-6">
      <i className="ri-shield-check-line text-lg text-[#635BFF] mt-0.5 shrink-0" />
      <div>
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-0.5">Secure Card Payment</h4>
        <p className="text-[11.5px] text-slate-555 dark:text-slate-300 leading-relaxed font-medium">
          Your credentials are encrypted and processed securely by Stripe.
        </p>
      </div>
    </div>
  )}

  <StripeCheckoutWrapper 
  clientSecret={clientSecret}
  amount={amount} 
  onSuccess={onSuccess}
  />
  </motion.div>
  )}
  </AnimatePresence>
  </div>
 );
};

export default PaymentGatewaySelector;
