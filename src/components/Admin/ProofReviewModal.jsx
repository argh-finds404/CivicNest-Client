import React, { useState } from'react';

export default function ProofReviewModal({ animal, onApprove, onReject, onClose }) {
 const [rejectionReason, setRejectionReason] = useState('');
 const [showReject, setShowReject] = useState(false);

 return (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">

 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">Review Rescue Proof</h3>
 <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-slate-300">✕</button>
 </div>

 <div className="p-4 space-y-4">
 {/* Animal summary */}
 <div className="p-3 bg-gray-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl text-[13px]">
 <p className="font-semibold text-gray-800 dark:text-white">{animal.animalType} — {animal.location || animal.area}</p>
 <p className="text-gray-500 dark:text-slate-300 mt-0.5">Reported by {animal.reporter?.email ||'Unknown'}</p>
 <p className="text-gray-500 dark:text-slate-300">Volunteers: {animal.volunteers?.length || 0}</p>
 </div>

 {/* Rescue proof photo */}
 {animal.rescueProof?.imageUrl ? (
 <div>
 <p className="text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-tight mb-2">Proof Photo</p>
 <img
 src={animal.rescueProof.imageUrl}
 alt="Rescue proof"className="w-full h-52 object-cover rounded-xl cursor-pointer shadow-sm border border-gray-100"onClick={() => window.open(animal.rescueProof.imageUrl,'_blank')}
 />
 <p className="text-xs text-gray-400 mt-1">Click to open full size</p>
 </div>
 ) : (
 <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center">
 <p className="text-gray-400 text-[13px]">No photo submitted</p>
 </div>
 )}

 {/* Reporter note */}
 {animal.rescueProof?.note && (
 <div>
 <p className="text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-tight mb-1">Reporter's Note</p>
 <p className="text-[13px] text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] bg-gray-50 dark:bg-[#0b1215] dark:bg-[#0b1215] p-3 rounded-xl border border-gray-100">"{animal.rescueProof.note}"</p>
 </div>
 )}

 {/* Rejection reason input */}
 {showReject && (
 <div>
 <label className="text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-tight block mb-1">
 Rejection Reason (sent to reporter)
 </label>
 <textarea
 value={rejectionReason}
 onChange={e => setRejectionReason(e.target.value)}
 rows={3}
 placeholder="e.g. Photo is too dark to verify. Please re-submit."className="w-full px-3 py-2 text-[13px] border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-gray-900 dark:text-white"/>
 </div>
 )}
 </div>

 <div className="flex gap-3 px-6 pb-6 mt-2">
 {!showReject ? (
 <>
 <button onClick={() => setShowReject(true)}
 className="flex-1 py-2.5 text-[13px] font-semibold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
 ✗ Reject
 </button>
 <button onClick={() => onApprove(animal._id)}
 className="flex-1 py-2.5 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm">
 ✓ Approve Rescue
 </button>
 </>
 ) : (
 <>
 <button onClick={() => setShowReject(false)}
 className="flex-1 py-2.5 text-[13px] font-semibold border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:bg-[#0b1215] dark:bg-[#0b1215] dark:hover:bg-gray-800 transition-colors">
 Back
 </button>
 <button onClick={() => onReject(animal._id, rejectionReason)}
 disabled={!rejectionReason.trim()}
 className="flex-1 py-2.5 text-[13px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm">
 Send Rejection
 </button>
 </>
 )}
 </div>
 </div>
 </div>
 );
}
