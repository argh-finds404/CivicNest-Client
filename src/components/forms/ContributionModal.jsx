import React, { useState } from'react';
import toast from'react-hot-toast';
import { motion, AnimatePresence } from'framer-motion';
import PaymentGatewaySelector from'../Payment/PaymentGatewaySelector';

const PRESETS = [100, 250, 500, 1000];
// Card payments can't go below roughly ৳60, so that's the floor for every gateway
const MIN_AMOUNT = 60;

/**
 * Fund an issue's repair. The amount is only added to the issue once the
 * payment succeeds (the server records it from the payment gateway).
 */
const ContributionModal = ({ issueId, isOpen, onClose, onContributeSuccess }) => {
 const [amount, setAmount] = useState(250);
 const [paying, setPaying] = useState(false);

 const close = () => {
 setPaying(false);
 onClose();
 };

 const startPayment = (e) => {
 e.preventDefault();
 if (!amount || amount < MIN_AMOUNT) {
 toast.error(`The minimum contribution is ৳${MIN_AMOUNT}.`);
 return;
 }
 setPaying(true);
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={close}
 className="absolute inset-0 bg-black/60"/>

 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: 12 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: 12 }}
 transition={{ duration: 0.2 }}
 className="relative w-full max-w-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="contribute-title">
 {paying ? (
 <PaymentGatewaySelector
 amount={amount}
 donationType="issue"
 referenceId={issueId}
 onClose={() => setPaying(false)}
 onSuccess={() => {
 toast.success("Thank you! Your contribution has been added to this fix.");
 onContributeSuccess?.({ amount: Number(amount) });
 close();
 }}
 />
 ) : (
 <form onSubmit={startPayment} className="cn-glass-card border overflow-hidden">
 <div className="p-6 pb-4 flex items-start gap-4">
 <span className="w-12 h-12 shrink-0 rounded-2xl grid place-items-center bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
 <i className="ri-hand-coin-fill text-2xl" aria-hidden="true"/>
 </span>
 <div className="flex-1">
 <h2 id="contribute-title" className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily:'var(--font-heading)'}}>Help fund this fix</h2>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 mt-0.5">Your money is held for this repair and added once the payment goes through.</p>
 </div>
 <button type="button" onClick={close} aria-label="Close" className="w-8 h-8 grid place-items-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer">
 <i className="ri-close-line text-lg" aria-hidden="true"/>
 </button>
 </div>

 <div className="px-6 pb-6 space-y-4">
 <div className="grid grid-cols-4 gap-2">
 {PRESETS.map((preset) => (
 <button
 key={preset}
 type="button"
 onClick={() => setAmount(preset)}
 aria-pressed={amount === preset}
 className={`py-2.5 rounded-xl border-2 text-[13px] font-bold cursor-pointer transition-colors ${
 amount === preset
 ?'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
 :'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-emerald-300'}`}>
 ৳{preset}
 </button>
 ))}
 </div>

 <label className="block">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">Or enter an amount</span>
 <div className="relative mt-1.5">
 <span className="absolute inset-y-0 left-4 flex items-center font-bold text-slate-400">৳</span>
 <input
 type="number"
 min={MIN_AMOUNT}
 step="1"
 value={amount}
 onChange={(e) => setAmount(Number(e.target.value))}
 className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-bold text-[15px] focus:outline-none focus:border-emerald-500"/>
 </div>
 </label>

 <button
 type="submit"
 disabled={!amount || amount < MIN_AMOUNT}
 className="cn-btn cn-btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
 <i className="ri-secure-payment-line" aria-hidden="true"/> Continue to payment · ৳{amount ||0}
 </button>
 <p className="text-[11px] text-center text-slate-400">Minimum ৳{MIN_AMOUNT}. Paid securely by card or SSLCommerz.</p>
 </div>
 </form>
 )}
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
};

export default ContributionModal;
