import React, { useState, useEffect } from"react";
import { useNavigate } from"react-router";
import { motion } from"framer-motion";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { useAuth } from"../../hooks/useAuth";
import MinimalLoader from'../common/MinimalLoader.jsx';
import toast from"react-hot-toast";
import { useQueryClient } from"@tanstack/react-query";

export default function MembershipRequest() {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [status, setStatus] = useState(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 name: user?.displayName ||"",
 phone:"+880",
 area:"",
 streetAddress:"",
 apartmentNumber:"",
 nid:"",
 intro:"",
 idImage:"",
 });

 useEffect(() => {
 if (user?.displayName) {
 setFormData(prev => ({ ...prev, name: user.displayName }));
 }
 }, [user]);

 useEffect(() => {
 const fetchUserData = async () => {
 try {
 const res = await axiosSecure.get("/users/my");
 if (res.data) {
 setFormData(prev => ({
 ...prev,
 name: res.data.name || prev.name,
 phone: res.data.phone || prev.phone,
 area: res.data.area || prev.area,
 streetAddress: res.data.streetAddress || prev.streetAddress,
 apartmentNumber: res.data.apartmentNumber || prev.apartmentNumber,
 }));
 }
 } catch (err) {
 console.error("Failed to load user profile for pre-fill:", err);
 }
 };
 if (user) {
 fetchUserData();
 }
 }, [user, axiosSecure]);

 useEffect(() => {
 const fetchStatus = async () => {
 try {
 const res = await axiosSecure.get("/membership/status");
 setStatus(res.data?.status ||"none");
 } catch (err) {
 setStatus("none");
 } finally {
 setLoading(false);
 }
 };
 fetchStatus();
 }, [axiosSecure]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setSubmitting(true);
 try {
 await axiosSecure.post("/membership/request", formData);
 setStatus("pending");
 queryClient.invalidateQueries({ queryKey: ['membershipStatus', user?.email] });
 toast.success("Membership verification request submitted successfully!");
 } catch (err) {
 toast.error(err.response?.data?.error || err.response?.data?.message ||"Failed to submit request.");
 } finally {
 setSubmitting(false);
 }
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center min-h-[60vh]">
 <MinimalLoader />
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20">
 <div className="max-w-2xl mx-auto px-6">
 <motion.div 
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden p-5 md:p-10 relative">
 {/* Subtle design element */}
 <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>

 {/* Top-left Back button */}
 <div className="absolute top-5 left-5 md:top-8 md:left-8 z-10">
 <button 
 onClick={() => navigate(-1)} 
 className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-slate-55/70 hover:bg-slate-100 dark:bg-[#1e3040]/70 dark:hover:bg-[#1e3040] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1e3040] rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
 title="Go Back"
 >
 <i className="ri-arrow-left-line text-lg font-bold"></i>
 </button>
 </div>

 <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-6 border border-teal-100 shadow-sm text-[#0f766e]">
 <i className="ri-shield-user-line text-3xl tracking-tight"></i>
 </div>
 <h1 className="text-3xl tracking-tight font-extrabold text-slate-900 dark:text-white text-center mb-2 tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>Verified Membership</h1>
 <p className="text-slate-500 dark:text-slate-300 text-center text-[13px] mb-8 max-w-md mx-auto leading-relaxed">
 To organize cleanup drives, post items to Lost & Found, or report animals, you must verify your residency.
 </p>

 {status ==="pending"? (
 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
 <h3 className="font-bold text-amber-800 text-[13px] mb-2 flex items-center justify-center gap-2 tracking-tight">
 <i className="ri-time-line animate-pulse"></i> Verification Request Pending
 </h3>
 <p className="text-amber-700 text-[13px] leading-relaxed max-w-sm mx-auto">
 Your residency details are currently under review by our community admins. We will notify you once your verification is completed!
 </p>
 <button 
 onClick={() => navigate("/")}
 className="mt-6 px-6 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl transition-colors text-[13px]">
 Return Home
 </button>
 </div>
 ) : status ==="approved"? (
 <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
 <h3 className="font-bold text-emerald-800 text-[13px] mb-2 flex items-center justify-center gap-2 tracking-tight">
 <i className="ri-checkbox-circle-line"></i> You are Verified!
 </h3>
 <p className="text-emerald-700 text-[13px] leading-relaxed max-w-sm mx-auto">
 Your residency is successfully verified. You have full administrative and volunteering access.
 </p>
 <button 
 onClick={() => navigate("/")}
 className="mt-6 px-6 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl transition-colors text-[13px]">
 Return Home
 </button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="text-left space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {/* Full Name */}
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
 <div className="relative">
 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
 <i className="ri-user-line text-[13px]"></i>
 </span>
 <input 
 type="text"required
 placeholder="John Doe"value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all font-semibold text-slate-800 dark:text-white text-[13px]"/>
 </div>
 </div>

 {/* Contact Phone */}
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Contact Phone</label>
 <div className="relative">
 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
 <i className="ri-phone-line text-[13px]"></i>
 </span>
 <input 
 type="tel"required
 placeholder="e.g. +880 1712-345678"value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all font-semibold text-slate-800 dark:text-white text-[13px]"/>
 </div>
 </div>

 {/* Neighborhood / Area */}
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Neighborhood / Area</label>
 <div className="relative">
 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
 <i className="ri-map-pin-line text-[13px]"></i>
 </span>
 <input 
 type="text"required
 placeholder="e.g. Dhanmondi, Ward 15"value={formData.area}
 onChange={(e) => setFormData({...formData, area: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all font-semibold text-slate-800 dark:text-white text-[13px]"/>
 </div>
 </div>

 {/* Street Address / Road */}
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Street Address / Road</label>
 <div className="relative">
 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
 <i className="ri-compass-3-line text-[13px]"></i>
 </span>
 <input 
 type="text"required
 placeholder="e.g. Road 8A, Block B"value={formData.streetAddress}
 onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all font-semibold text-slate-800 dark:text-white text-[13px]"/>
 </div>
 </div>

 {/* Apartment / House Number */}
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Apartment / House Number</label>
 <div className="relative">
 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
 <i className="ri-home-4-line text-[13px]"></i>
 </span>
 <input 
 type="text"required
 placeholder="e.g. Flat 4B, House 12"value={formData.apartmentNumber}
 onChange={(e) => setFormData({...formData, apartmentNumber: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all font-semibold text-slate-800 dark:text-white text-[13px]"/>
 </div>
 </div>

 {/* NID / Passport Number */}
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">NID / Passport Number</label>
 <div className="relative">
 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
 <i className="ri-fingerprint-line text-[13px]"></i>
 </span>
 <input 
 type="text"required
 placeholder="e.g. 1992837192"value={formData.nid}
 onChange={(e) => setFormData({...formData, nid: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all font-semibold text-slate-800 dark:text-white text-[13px]"/>
 </div>
 </div>
 </div>

 {/* Utility Bill / ID Image URL */}
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
 Utility Bill / Residency Proof Image URL
 <span className="text-[10px] text-slate-400 lowercase font-normal italic">(Direct image link)</span>
 </label>
 <div className="relative">
 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
 <i className="ri-image-line text-[13px]"></i>
 </span>
 <input 
 type="url"required
 placeholder="https://example.com/my-utility-bill.jpg"value={formData.idImage}
 onChange={(e) => setFormData({...formData, idImage: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all font-semibold text-slate-800 dark:text-white text-[13px]"/>
 </div>
 </div>

 {/* Introduction */}
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Why are you joining? (Introduction)</label>
 <textarea 
 required
 rows="3"placeholder="Tell us why you would like to join as a verified resident member..."value={formData.intro}
 onChange={(e) => setFormData({...formData, intro: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/50 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all resize-none font-semibold text-slate-800 dark:text-white text-[13px]"></textarea>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 mt-4">
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="w-full sm:w-1/3 bg-slate-50 dark:bg-[#1e3040] hover:bg-slate-100 dark:hover:bg-[#1e3040]/80 text-slate-700 dark:text-[#cbd5e1] py-3.5 rounded-xl font-bold border border-slate-200 dark:border-[#1e3040] transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={submitting}
      className="w-full sm:w-2/3 bg-gradient-to-r from-[#0f766e] to-[#0d6b63] hover:from-[#0d6b63] hover:to-[#0f766e] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-900/10 transition-all disabled:opacity-50 uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
    >
      {submitting ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Submitting...
        </>
      ) : (
        <>
          <i className="ri-send-plane-line text-[13px]"></i>
          Submit Verification Request
        </>
      )}
    </button>
  </div>
 </form>
 )}
 </motion.div>
 </div>
 </div>
 );
}
