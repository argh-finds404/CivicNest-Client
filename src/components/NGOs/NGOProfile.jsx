import React, { useState } from'react';
import { useParams, Link } from'react-router';
import { useQuery, useMutation } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { Building2, Globe, Mail, Heart, Users, Target, MapPin } from'lucide-react';
import { motion } from'framer-motion';
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton';
import VerifiedBadge from'../common/VerifiedBadge.jsx';
import { useAuth } from'../../hooks/useAuth';
import toast from'react-hot-toast';
import PaymentGatewaySelector from'../Payment/PaymentGatewaySelector';
import SEO from'../common/SEO';

const NGOProfile = () => {
 const { id } = useParams();
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();
 const [message, setMessage] = useState('');
 const [amount, setAmount] = useState('');
 const [showPayment, setShowPayment] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);

 const { data: ngo, isLoading } = useQuery({
 queryKey: ['ngo', id],
 queryFn: async () => {
 const res = await axiosSecure.get(`/ngos/${id}`);
 return res.data;
 }
 });

 const handleDonate = () => {
 if (!user) {
 toast.error('Please log in to make a donation');
 return;
 }
 if (!amount || amount < 60) {
 toast.error('Minimum donation is ৳60 (due to payment gateway limits)');
 return;
 }
 setShowPayment(true);
 };

 if (isLoading) {
 return (
 <div className="min-h-screen flex justify-center items-center bg-[#f0fdf4]">
 <MinimalLoader />
 </div>
 );
 }

 if (!ngo) {
 return (
 <div className="min-h-screen flex justify-center items-center bg-[#f0fdf4]">
 <h2 className="text-2xl tracking-tight font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] tracking-tight">NGO Not Found</h2>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-[#f0fdf4]">
 <SEO 
    title={ngo?.name ? `${ngo.name} - NGO Profile` : "NGO Profile"} 
    description={ngo?.mission?.slice(0, 155)} 
    image={ngo?.logoUrl} 
    type="profile" 
  />
 {showPayment && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
 <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
 <PaymentGatewaySelector
 amount={amount}
 donationType="ngo"referenceId={ngo._id}
 onClose={() => setShowPayment(false)}
 onSuccess={() => {
 setShowPayment(false);
 setIsSuccess(true);
 toast.success('Donation successful! Thank you.');
 }}
 />
 </div>
 </div>
 )}
 
 {/* Banner Section */}
 <div className="relative pt-28 pb-16 px-[5%] bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 overflow-hidden">
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full blur-3xl"></div>
 <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
 </div>

 <div className="relative z-10 max-w-7xl mx-auto">
 <div className="mb-4">
 <BackButton variant="light"/>
 </div>

 <div className="flex flex-col md:flex-row gap-5 items-start">
 {/* Logo */}
 <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-white/20 shadow-xl shrink-0">
 <img src={ngo.logoUrl ||"https://i.ibb.co/X30F6Hk/ngo-placeholder.png"} alt={ngo.name} className="w-full h-full object-cover"/>
 </div>
 
 {/* Info */}
 <div className="flex-1 text-white">
 <div className="flex items-center gap-3 mb-3">
 <VerifiedBadge status={ngo.status} />
 <span className="text-[13px] font-semibold text-white/80">
 Joined {new Date(ngo.joinedAt).getFullYear()}
 </span>
 </div>
 <h1 className="font-heading text-4xl tracking-tight md:text-5xl tracking-tight font-extrabold mb-4 tracking-tight">{ngo.name}</h1>
 <p className="font-body text-white/80 text-[13px] max-w-2xl">{ngo.mission}</p>
 
 <div className="flex flex-wrap gap-4 mt-6 text-[13px] font-medium text-white/90">
 <div className="flex items-center gap-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 px-4 py-2 rounded-full">
 <Mail className="w-4 h-4"/> {ngo.contactEmail}
 </div>
 {ngo.website && (
 <a href={ngo.website} target="_blank"rel="noopener noreferrer"className="flex items-center gap-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 px-4 py-2 rounded-full hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 transition-colors">
 <Globe className="w-4 h-4"/> {new URL(ngo.website).hostname}
 </a>
 )}
 {ngo.phone && (
 <div className="flex items-center gap-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 px-4 py-2 rounded-full">
 <Building2 className="w-4 h-4"/> {ngo.phone}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Content Section */}
 <div className="px-[5%] py-8">
 <div className="max-w-4xl mx-auto">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6">
 {/* Stats Row */}
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-center">
 <Users className="w-8 h-8 text-teal-600 mx-auto mb-2"/>
 <p className="text-2xl tracking-tight font-bold text-slate-900 dark:text-white">34</p>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Volunteers</p>
 </div>
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-center">
 <Target className="w-8 h-8 text-teal-600 mx-auto mb-2"/>
 <p className="text-2xl tracking-tight font-bold text-slate-900 dark:text-white">8</p>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Projects</p>
 </div>
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg p-4 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-center">
 <MapPin className="w-8 h-8 text-teal-600 mx-auto mb-2"/>
 <p className="text-2xl tracking-tight font-bold text-slate-900 dark:text-white">3</p>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Areas</p>
 </div>
 </div>

 {/* Mission Section */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <h2 className="text-[13px] font-bold text-slate-900 dark:text-white mb-4 tracking-tight">About This NGO</h2>
 <p className="text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] leading-relaxed">{ngo.mission}</p>
 </div>

 {/* Focus Areas */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <h2 className="text-[13px] font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Focus Areas</h2>
 <div className="flex flex-wrap gap-2">
 {ngo.focusAreas?.map((area, index) => (
 <span key={index} className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-[13px] font-semibold border border-teal-200">
 {area}
 </span>
 )) || (
 <p className="text-slate-500 dark:text-slate-300 text-[13px]">No focus areas specified</p>
 )}
 </div>
 </div>

 {/* Contact Section */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <h2 className="text-[13px] font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Contact Information</h2>
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
 <Mail className="w-5 h-5 text-teal-600"/>
 </div>
 <div>
 <p className="text-[13px] text-slate-500 dark:text-slate-300">Email</p>
 <a href={`mailto:${ngo.contactEmail}`} className="font-semibold text-slate-900 dark:text-white hover:text-teal-600">
 {ngo.contactEmail}
 </a>
 </div>
 </div>
 {ngo.phone && (
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
 <Building2 className="w-5 h-5 text-teal-600"/>
 </div>
 <div>
 <p className="text-[13px] text-slate-500 dark:text-slate-300">Phone</p>
 <a href={`tel:${ngo.phone}`} className="font-semibold text-slate-900 dark:text-white hover:text-teal-600">
 {ngo.phone}
 </a>
 </div>
 </div>
 )}
 {ngo.website && (
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
 <Globe className="w-5 h-5 text-teal-600"/>
 </div>
 <div>
 <p className="text-[13px] text-slate-500 dark:text-slate-300">Website</p>
 <a href={ngo.website} target="_blank"rel="noopener noreferrer"className="font-semibold text-slate-900 dark:text-white hover:text-teal-600">
 {ngo.website}
 </a>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Donate Section */}
 <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-5 border border-teal-200 flex flex-col sm:flex-row justify-between items-center gap-4">
 <div>
 <h3 className="text-teal-900 font-bold text-[13px] mb-1 flex items-center gap-2 tracking-tight">
 <Heart className="w-5 h-5 text-teal-600"/> Support This NGO
 </h3>
 <p className="text-teal-800/80 text-[13px] font-medium">
 Record your support for this organization. Your contribution helps them continue their community work.
 </p>
 {ngo.totalSupporters && (
 <p className="text-teal-700/60 text-xs mt-2">
 {ngo.totalSupporters} people have shown support
 </p>
 )}
 </div>
 
 <div className="flex flex-col gap-3 w-full sm:w-auto">
 <input
 type="number"value={amount}
 onChange={(e) => setAmount(Number(e.target.value))}
 placeholder="Amount (৳)"className="w-full px-4 py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-teal-300 rounded-xl text-[13px] focus:outline-none focus:border-teal-500 transition-all font-bold"min="60"/>
 <button
 onClick={handleDonate}
 disabled={!amount || amount < 60}
 className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50">
 Proceed to Pay
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 </div>
 );
};

export default NGOProfile;