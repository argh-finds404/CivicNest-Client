import React, { useState } from'react';
import { loadStripe } from'@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from'@stripe/react-stripe-js';
import useAxiosSecure from'../../hooks/useAxiosSecure';

// Load Stripe outside of component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||'pk_test_placeholder');

const CheckoutForm = ({ amount, clientSecret, onSuccess }) => {
 const stripe = useStripe();
 const elements = useElements();
 const [error, setError] = useState(null);
 const [isProcessing, setIsProcessing] = useState(false);
 const axiosSecure = useAxiosSecure();

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!stripe || !elements) return;

 setIsProcessing(true);
 setError(null);

 const cardElement = elements.getElement(CardElement);
 if (!cardElement) {
 setError("Card element not found.");
 setIsProcessing(false);
 return;
 }

 try {
 const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
 payment_method: {
 card: cardElement,
 },
 });

 if (error) {
 setError(error.message);
 setIsProcessing(false);
 } else if (paymentIntent && paymentIntent.status ==='succeeded') {
 try {
 const tran_id = paymentIntent.metadata?.tran_id;
 await axiosSecure.post('/api/payment/stripe-success', {
 paymentIntentId: paymentIntent.id,
 tran_id: tran_id
 });
 setIsProcessing(false);
 onSuccess(paymentIntent);
 } catch (serverErr) {
 console.error("Server synchronization error:", serverErr);
 setError(serverErr.response?.data?.error ||"Payment succeeded but failed to sync donation with server. Please contact support.");
 setIsProcessing(false);
 }
 }
 } catch (err) {
 console.error("Payment error:", err);
 setError("An unexpected error occurred.");
 setIsProcessing(false);
 }
 };

 const cardStyle = {
 style: {
 base: {
 color:"#1e293b",
 fontFamily:"Outfit, system-ui, sans-serif",
 fontSmoothing:"antialiased",
 fontSize:"15px","::placeholder": {
 color:"#94a3b8",
 },
 },
 invalid: {
 color:"#ef4444",
 iconColor:"#ef4444",
 },
 },
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus-within:border-teal-500 transition-colors">
 <CardElement options={cardStyle} />
 </div>
 {error && <div className="text-red-500 text-[13px] font-medium p-3 bg-red-50 rounded-xl">{error}</div>}
 
 <button 
 type="submit"disabled={!stripe || isProcessing}
 className="w-full py-4 bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#635BFF]/30 flex items-center justify-center gap-2 cursor-pointer">
 {isProcessing ? (
 <>
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 Processing...
 </>
 ) : (
 <>Pay ${amount}</>
 )}
 </button>
 
 <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
 <i className="ri-lock-2-line"></i> Payments are secure and encrypted by Stripe
 </p>
 </form>
 );
};

const StripeCheckoutWrapper = ({ clientSecret, amount, onSuccess }) => {
 if (!clientSecret) {
 return (
 <div className="flex flex-col items-center justify-center py-12">
 <div className="w-8 h-8 border-4 border-[#635BFF]/30 border-t-[#635BFF] rounded-full animate-spin mb-4"></div>
 <p className="text-[13px] font-bold text-slate-500 dark:text-slate-300">Initializing secure checkout...</p>
 </div>
 );
 }

 return (
 <Elements stripe={stripePromise}>
 <CheckoutForm amount={amount} clientSecret={clientSecret} onSuccess={onSuccess} />
 </Elements>
 );
};

export default StripeCheckoutWrapper;
