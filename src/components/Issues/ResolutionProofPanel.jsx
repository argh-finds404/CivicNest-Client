import React, { useState } from'react';
import toast from'react-hot-toast';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { CheckCircle2 } from'lucide-react';
import { useAuth } from'../../hooks/useAuth';
import PremiumImageUploader from '../common/PremiumImageUploader';

const ResolutionProofPanel = ({ issue, onProofUploaded }) => {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const [uploadedImages, setUploadedImages] = useState([]);
 const [notes, setNotes] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);

 const isAssigned = issue.assignedTo?.email === user?.email;
 const hasProofs = issue.resolutionProofs && issue.resolutionProofs.length > 0;

 const handleSubmit = async () => {
 if (uploadedImages.length === 0) {
 toast.error("Please attach at least one proof photo.");
 return;
 }

 setIsSubmitting(true);
 try {
 toast.loading("Submitting proofs...", { id: "submitProof" });
 const imageUrls = uploadedImages.map(img => img.url);
 
 const res = await axiosSecure.post(`/issues/${issue._id}/proofs`, {
 images: imageUrls,
 notes: notes
 });

 if (res.data.success) {
 toast.success("Resolution proof uploaded successfully!", { id: "submitProof" });
 setUploadedImages([]);
 setNotes('');
 if (onProofUploaded) onProofUploaded(res.data.proofs);
 }
 } catch (error) {
 console.error(error);
 toast.error(error.response?.data?.message ||"Failed to upload proof", { id:"submitProof"});
 } finally {
 setIsSubmitting(false);
 }
 };

 if (!isAssigned && !hasProofs) return null;

 return (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4 md:p-5 mt-8">
 <h3 className="text-2xl tracking-tight font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
 <CheckCircle2 className="w-6 h-6 text-[#40826D]"/> Resolution Proofs
 </h3>

 {hasProofs && (
 <div className="space-y-6 mb-8">
 {issue.resolutionProofs.map((proof, idx) => (
 <div key={idx} className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] p-4 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <div className="flex justify-between items-center mb-3">
 <span className="font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Resolver: {proof.uploadedBy}</span>
 <span className="text-xs text-slate-500 dark:text-slate-300">{new Date(proof.uploadedAt).toLocaleDateString()}</span>
 </div>
 {proof.notes && <p className="text-slate-600 dark:text-slate-300 mb-4">{proof.notes}</p>}
 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
 {proof.images.map((img, i) => (
 <img key={i} src={img} alt="Proof"className="w-24 h-24 object-cover rounded-lg border border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]"/>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}

 {isAssigned && issue.status !=='solved'&& (
 <div className="border-t border-slate-100 pt-6">
 <h4 className="font-bold text-slate-800 dark:text-white mb-4">Upload New Proof</h4>
 <textarea 
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="Describe what was fixed..."className="w-full min-h-[100px] p-4 rounded-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] transition-all outline-none resize-y text-slate-800 dark:text-white placeholder-slate-400 mb-4"/>

 <div className="mb-6">
 <PremiumImageUploader 
 label="After Photos (up to 5)"
 maxCount={5}
 onUploadComplete={(url, id) => setUploadedImages(prev => [...prev, { url, id }])}
 onRemove={(id) => setUploadedImages(prev => prev.filter(img => img.id !== id))}
 />
 </div>

 <button 
 onClick={handleSubmit}
 disabled={isSubmitting || uploadedImages.length === 0}
 className={`w-full md:w-auto px-8 h-12 flex items-center justify-center rounded-xl font-bold text-white transition-all shadow-md ${isSubmitting || uploadedImages.length === 0 ?'bg-slate-400 cursor-not-allowed':'bg-[#40826D] hover:bg-[#326756] hover:shadow-lg'}`}
 >
 {isSubmitting ?"Uploading...":"Submit Proof"}
 </button>
 </div>
 )}
 </div>
 );
};

export default ResolutionProofPanel;
