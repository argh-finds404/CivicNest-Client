import React from'react';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import toast from'react-hot-toast';

export default function CommunityVerifyFeed() {
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();
 const queryClient = useQueryClient();

 // Fetch issues pending verification
 const { data, isLoading, isError } = useQuery({
 queryKey: ['pendingVerifications'],
 queryFn: () =>
 axiosSecure.get('/issues', {
 params: { status:'pending_verification', limit: 10 }
 }).then(r => r.data),
 });

 const verifyMutation = useMutation({
 mutationFn: ({ issueId, coordinates }) =>
 axiosSecure.post(`/issues/${issueId}/verify`, { coordinates }),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['pendingVerifications'] });
 queryClient.invalidateQueries({ queryKey: ['volunteerStats'] });
 queryClient.invalidateQueries({ queryKey: ['activeEvents'] });
 
 const msg = res.data.solved
 ?'🎉 Issue solved! Points awarded to everyone.':`✅ Verified! +${res.data.pointsEarned} points earned. ${res.data.verificationCount}/3 verifications done.`;
 toast.success(msg, { duration: 4000 });
 },
 onError: (err) => {
 toast.error(err.response?.data?.error || err.response?.data?.message ||'Could not verify.');
 },
 });

 const handleVerify = (issueId) => {
 if (!navigator.geolocation) {
 toast.error("Geolocation is not supported by your browser. Verifying without GPS location.");
 verifyMutation.mutate({ issueId, coordinates: null });
 return;
 }

 const toastId = toast.loading("Checking GPS location...");
 navigator.geolocation.getCurrentPosition(
 (pos) => {
 toast.dismiss(toastId);
 verifyMutation.mutate({
 issueId,
 coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }
 });
 },
 (error) => {
 toast.dismiss(toastId);
 // GPS denied or failed - proceed anyway without GPS onsite bonus
 verifyMutation.mutate({ issueId, coordinates: null });
 },
 { enableHighAccuracy: true, timeout: 6000 }
 );
 };

 const issues = data?.issues || [];

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center py-12 space-y-4">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 font-medium">Fetching verification queue...</p>
 </div>
 );
 }

 if (isError) {
 return (
 <div className="text-center py-8 px-4 bg-rose-50 border border-rose-200 rounded-lg">
 <p className="text-[13px] font-semibold text-rose-800">
 Failed to load pending verifications. Please try again.
 </p>
 </div>
 );
 }

 if (issues.length === 0) {
 return (
 <div className="text-center py-12 px-6 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg border border-slate-100">
 <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
 <i className="ri-checkbox-circle-line text-3xl tracking-tight text-teal-600"></i>
 </div>
 <p className="font-bold text-slate-800 dark:text-white"style={{ fontFamily:'HKGrotesk'}}>
 All Clear!
 </p>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 mt-2 max-w-sm mx-auto">
 There are no issues pending verification in your area right now. Check back later!
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-lg p-4">
 <div className="flex gap-3">
 <div className="text-teal-600 mt-0.5">
 <i className="ri-information-line text-[13px] tracking-tight"></i>
 </div>
 <div>
 <h4 className="font-bold text-teal-900 text-[13px]">Decentralized Peer Verification</h4>
 <p className="text-xs text-teal-700 mt-1 leading-relaxed">
 Verify cleanups to earn <span className="font-bold text-teal-900">+5 points</span> (volunteers: <span className="font-bold text-teal-900">+10</span>). Verify on-site (within 200m) to get an additional <span className="font-bold text-teal-900">+2 bonus points</span>!
 </p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {issues.map(issue => {
 const proofs = issue.resolutionProofs || [];
 const latestProof = proofs[proofs.length - 1];
 const alreadyVerified = issue.verifications?.includes(user?.uid);
 const count = issue.verificationCount || 0;

 // Before image
 const beforeImg = issue.images?.[0] || issue.image || null;
 // After image
 const afterImg = latestProof?.images?.[0] || null;

 return (
 <div
 key={issue._id}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
 {/* Before & After comparison grid */}
 <div className="grid grid-cols-2 gap-px bg-slate-200 h-44 relative">
 {/* Before Photo */}
 <div className="relative bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] overflow-hidden group">
 {beforeImg ? (
 <img
 src={beforeImg}
 alt="Before"className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
 <i className="ri-image-line text-[13px] tracking-tight mb-1"></i>
 <span className="text-[10px]">No Before Image</span>
 </div>
 )}
 <span className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
 Before
 </span>
 </div>

 {/* After Photo */}
 <div className="relative bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] overflow-hidden group">
 {afterImg ? (
 <img
 src={afterImg}
 alt="After"className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
 <i className="ri-image-line text-[13px] tracking-tight mb-1"></i>
 <span className="text-[10px]">No Proof Image</span>
 </div>
 )}
 <span className="absolute top-2 right-2 bg-teal-600/90 text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
 After
 </span>
 </div>
 </div>

 {/* Issue details content */}
 <div className="p-4 flex-grow flex flex-col justify-between">
 <div>
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <h5 className="font-bold text-slate-900 dark:text-white text-[13px] line-clamp-1">
 {issue.title}
 </h5>
 <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-1">
 <i className="ri-map-pin-line text-teal-650"></i>
 <span className="truncate">{issue.location}</span>
 </p>
 </div>

 {/* Progress tracking dots */}
 <div className="flex flex-col items-end gap-1 flex-shrink-0">
 <div className="flex gap-1">
 {[1, 2, 3].map(i => (
 <div
 key={i}
 className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
 i <= count ?'bg-teal-500 shadow-sm':'bg-slate-200'}`}
 />
 ))}
 </div>
 <span className="text-[10px] font-semibold text-slate-400">{count}/3 verified</span>
 </div>
 </div>

 {latestProof?.notes && (
 <div className="mt-3 p-2 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg border border-slate-100">
 <p className="text-xs italic text-slate-600 dark:text-slate-300">
 <span className="font-semibold not-italic text-slate-400 mr-1">Resolver Note:</span>"{latestProof.notes}"</p>
 </div>
 )}
 </div>

 <div className="mt-4 pt-3 border-t border-slate-100">
 <button
 onClick={() => handleVerify(issue._id)}
 disabled={alreadyVerified || verifyMutation.isPending}
 className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
 alreadyVerified
 ?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-400 cursor-not-allowed':'bg-[#40826D] hover:bg-[#326756] text-white shadow-sm hover:shadow active:scale-[0.98]'}`}
 >
 {verifyMutation.isPending ? (
 <>
 <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
 Verifying...
 </>
 ) : alreadyVerified ? (
 <>
 <i className="ri-checkbox-circle-fill text-teal-650"></i>
 Already Verified
 </>
 ) : (
 <>
 <i className="ri-checkbox-circle-line"></i>
 Verify This Fix
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
