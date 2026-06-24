import React from"react";
import { useParams, Link } from"react-router";
import SEO from'../common/SEO';

import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { format } from"date-fns";
import { useAuth } from"../../hooks/useAuth";
import toast from"react-hot-toast";
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton';
import { 
 Calendar, 
 MapPin, 
 User, 
 Mail, 
 CheckCircle2, 
 AlertCircle,
 Tag,
 Coins,
 ShieldCheck,
 ShieldAlert,
 Clock,
 ExternalLink,
 Info,
 Phone,
 Camera,
 X
} from"lucide-react";

export default function LostFoundDetails() {
 const { id } = useParams();
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const [statement, setStatement] = React.useState('');
 const [contactPhone, setContactPhone] = React.useState('');
 const [photoUrl, setPhotoUrl] = React.useState('');
 const [photoFile, setPhotoFile] = React.useState(null);
 const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
 const [showClaimForm, setShowClaimForm] = React.useState(false);

 const { data: item, isLoading } = useQuery({
 queryKey: ["lost-found", id],
 queryFn: async () => {
 const res = await axiosSecure.get(`/lost-found/${id}`);
 return res.data;
 },
 });

 const claimMutation = useMutation({
 mutationFn: (payload) => {
 const endpoint = item.type ==='lost'?`/lost-found/${id}/found-report`:`/lost-found/${id}/claim`;
 return axiosSecure.post(endpoint, payload);
 },
 onSuccess: () => {
 toast.success(item.type ==='lost'?"Report submitted successfully.":"Claim submitted successfully.");
 queryClient.invalidateQueries({ queryKey: ["lost-found", id] });
 setShowClaimForm(false);
 setStatement('');
 setContactPhone('');
 setPhotoUrl('');
 setPhotoFile(null);
 },
 onError: (err) => toast.error(err.response?.data?.message ||"Failed to submit.")
 });

 const reuniteMutation = useMutation({
 mutationFn: (payload) => axiosSecure.post(`/lost-found/${id}/reunite`, payload),
 onSuccess: () => {
 toast.success("Item marked as reunited!");
 queryClient.invalidateQueries({ queryKey: ["lost-found", id] });
 },
 onError: (err) => toast.error(err.response?.data?.message ||"Failed to mark reunited.")
 });

 const flagMutation = useMutation({
 mutationFn: (payload) => axiosSecure.post(`/lost-found/${id}/flag-suspicious`, payload),
 onSuccess: () => {
 toast.success("Flagged as suspicious. Admin notified.");
 queryClient.invalidateQueries({ queryKey: ["lost-found", id] });
 },
 onError: (err) => toast.error(err.response?.data?.message ||"Failed to flag.")
 });

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
 <MinimalLoader />
 </div>
 );
 }

 if (!item) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
 <div className="text-center">
 <AlertCircle className="w-16 h-16 text-slate-350 mx-auto mb-4"/>
 <p className="text-[13px] tracking-tight font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Item not found.</p>
 <Link to="/lost-found"className="mt-4 inline-block text-teal-600 font-bold hover:underline">
 Back to Lost & Found
 </Link>
 </div>
 </div>
 );
 }

 const isOwner = user?.email === (item.reporter || item.postedBy);

 // Expiration calculation
 const daysLeft = item.expiresAt
 ? Math.max(0, Math.ceil((new Date(item.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
 : null;
 const isExpired = daysLeft !== null && daysLeft <= 0;
 const progressPercent = daysLeft ? Math.max(0, Math.min(100, (daysLeft / 30) * 100)) : 0;

 // Dynamic Wording
 const isLost = item.type ==="lost";
 const primaryButtonText = isLost ?"I found this item":"I think this is mine";
 const formHeader = isLost ?"Submit Sighting / Found Report":"Claim Ownership of Item";
 const formInstructions = isLost 
 ?"Please describe where you spotted or retrieved this item, and provide your contact details so the owner can reach out.":"Provide specific details that only the rightful owner would know to verify your claim (e.g. unique scratches, serial numbers, content descriptions).";
 const textPlaceholder = isLost 
 ?"E.g., I saw a dog matching this description near Road 4. I was able to secure it at my yard...":"E.g., It has a scratch on the bottom left and a sticker that says'M2'...";

 // Check if current user has already submitted report or claim
 const alreadyActioned = isLost
 ? item.foundReports?.some(r => r.email === user?.email)
 : item.claims?.some(c => c.email === user?.email);

 const mySubmission = isLost
 ? item.foundReports?.find(r => r.email === user?.email)
 : item.claims?.find(c => c.email === user?.email);
 const isSubmissionSuspicious = mySubmission?.isSuspicious;

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!statement.trim()) {
 toast.error("Please enter a description/statement.");
 return;
 }
 if (isLost) {
 if (contactPhone && !/^[+0-9\s\-()]{6,20}$/.test(contactPhone)) {
 toast.error("Please enter a valid phone number (6 to 20 digits, space, +, - allowed).");
 return;
 }
 }

 setUploadingPhoto(true);
 try {
 let uploadedUrl ="";
 if (photoFile) {
 const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
 const formData = new FormData();
 formData.append("image", photoFile);
 const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
 method:"POST",
 body: formData,
 });
 const data = await res.json();
 if (!data.success) throw new Error("Failed to upload image.");
 uploadedUrl = data.data.display_url || data.data.url;
 }

 const payload = isLost 
 ? { statement, contactPhone, photoUrl: uploadedUrl }
 : { statement, photoUrl: uploadedUrl };
 claimMutation.mutate(payload);
 } catch (err) {
 console.error(err);
 toast.error("Failed to upload photo evidence.");
 } finally {
 setUploadingPhoto(false);
 }
 };

 return (
 <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
 <SEO 
    title={item?.itemName ? `${item.itemName} - Lost & Found Details` : "Lost & Found Details"} 
    description={item?.description?.slice(0, 155)} 
    image={item?.image} 
    type="article" 
  />
 <div className="max-w-7xl mx-auto px-6">
 {/* Navigation */}
 <div className="flex items-center gap-3 mb-8">
 <BackButton variant="dark"/>
 <span className="text-slate-500 dark:text-slate-300 font-bold text-[13px]">Back to Listings</span>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
 
 {/* Main Info Column (Left) */}
 <div className="lg:col-span-2 space-y-6">
 
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 overflow-hidden">
 
 {/* Image Frame */}
 <div className="h-64 md:h-96 w-full relative bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]">
 {item.image ? (
 <img src={item.image} alt={item.itemName} className="w-full h-full object-cover"/>
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410]/50">
 <ShieldCheck className="w-16 h-16 text-slate-200 mb-2"/>
 <span className="font-bold text-slate-400 text-[13px]">No Photo Provided</span>
 </div>
 )}
 
 {/* Badges */}
 <div className="absolute top-4 left-4 flex gap-2">
 <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border ${
 isLost 
 ?"bg-rose-500 text-white border-rose-600":"bg-emerald-600 text-white border-emerald-700"}`}>
 {item.type}
 </span>
 {item.status !=='open'&& (
 <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm bg-slate-700 text-white border border-slate-800">
 {item.status}
 </span>
 )}
 </div>
 </div>

 {/* Text Description Content */}
 <div className="p-5 md:p-10">
 <div className="flex flex-wrap gap-2.5 mb-4">
 <span className="bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/30">
 <Tag className="w-3.5 h-3.5"/>
 Category: <span className="capitalize">{item.category}</span>
 </span>
 <span className="bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/30">
 <Calendar className="w-3.5 h-3.5"/>
 Posted on: {item.dateLostFound || item.date ? format(new Date(item.dateLostFound || item.date),"PPP") :"Unknown date"}
 </span>
 </div>

 <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-extrabold text-slate-800 dark:text-white tracking-tight mb-6">{item.itemName}</h1>

 <div className="prose prose-slate max-w-none">
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 pb-2 tracking-tight">Description & Details</h3>
 <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[13px] font-medium whitespace-pre-line">{item.description}</p>
 </div>

 {/* Claiming/Sighting Buttons */}
 {isLost && item.reward > 0 && item.status ==='open'&& !isOwner && !showClaimForm && !alreadyActioned && (
 <div className="mb-6 bg-amber-50/85 border-2 border-amber-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center font-bold">
 <Coins className="w-5 h-5 text-amber-600"/>
 </div>
 <div>
 <span className="text-xs font-black text-amber-600 uppercase block tracking-wider">Cash Reward Offered</span>
 <span className="text-xs text-slate-500 dark:text-slate-300 font-bold mt-0.5">The owner is offering a reward for returning this item.</span>
 </div>
 </div>
 <span className="text-2xl tracking-tight font-black text-amber-700 font-mono">৳{item.reward}</span>
 </div>
 )}

 {item.status ==='open'&& !isOwner && !showClaimForm && !alreadyActioned && (
 <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
 <button 
 onClick={() => setShowClaimForm(true)}
 className={`flex-1 text-white text-center py-4 rounded-lg font-bold shadow-lg transition-all cursor-pointer text-[13px] hover:scale-[1.01] ${
 isLost 
 ?'bg-rose-500 hover:bg-rose-600 shadow-rose-900/10':'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10'}`}
 >
 {primaryButtonText}
 </button>
 </div>
 )}

 {alreadyActioned && (
 <div className="mt-8 pt-8 border-t border-slate-100">
 {isSubmissionSuspicious ? (
 <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-200 text-left shadow-inner space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
 <i className="ri-error-warning-fill text-[13px] tracking-tight animate-bounce"></i>
 </div>
 <div>
 <h4 className="font-bold text-rose-900 text-[13px]">Additional Verification Needed</h4>
 <p className="text-xs text-rose-500 font-semibold mt-0.5">Your submission has been flagged as insufficient or suspicious by the owner/finder.</p>
 </div>
 </div>
 
 <div className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed space-y-2 pl-3 border-l-2 border-rose-300">
 <p><strong>Reason:</strong> The description or evidence photo you provided did not contain enough details to confidently prove ownership or location accuracy.</p>
 <p><strong>Next Steps:</strong></p>
 <ul className="list-disc pl-4 space-y-1">
 <li>Check your provided statement below to ensure no typos or errors are present.</li>
 <li>Gather more concrete proof, such as: unique identifying features (scratches, stickers), serial numbers, purchase invoices, or clearer photo proofs.</li>
 <li>Contact the reporter directly using the contact details on the right pane to discuss the verification.</li>
 <li>If you believe this is an error, please email the CivicNest administration team at <a href="mailto:help@civicnest.com"className="text-teal-600 font-bold hover:underline">help@civicnest.com</a> for manual moderation.</li>
 </ul>
 </div>
 </div>
 ) : (
 <div className="bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] p-4 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 text-center shadow-inner">
 <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto mb-2 animate-pulse"/>
 <h4 className="font-bold text-slate-800 dark:text-white">Submission Received</h4>
 <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-1 leading-relaxed">
 {isLost 
 ?"You have already reported a sighting for this lost item. The owner has been notified.":"You have already submitted an ownership claim for this found item. The finder will review it."}
 </p>
 </div>
 )}
 </div>
 )}

 {showClaimForm && (
 <div className="mt-8 pt-8 border-t border-slate-100">
 <form onSubmit={handleSubmit} className={`p-4 rounded-lg border ${isLost ?'bg-rose-50/30 border-rose-200/50':'bg-amber-50/50 border-amber-250/50'} space-y-4`}>
 <h3 className={`text-[13px] font-bold flex items-center gap-2 ${isLost ?'text-rose-955':'text-amber-950'}`}>
 {isLost ? <Camera className="w-5 h-5 text-rose-500"/> : <AlertCircle className="w-5 h-5 text-amber-600"/>} 
 {formHeader}
 </h3>
 <p className={`text-xs font-medium leading-relaxed ${isLost ?'text-rose-700':'text-amber-700'}`}>
 {formInstructions}
 </p>

 {/* Main Statement */}
 <div>
 <label className="block text-xs font-bold text-slate-650 mb-1">Details / Description *</label>
 <textarea 
 value={statement}
 onChange={(e) => setStatement(e.target.value)}
 className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-[13px] text-slate-855 placeholder:text-slate-400"rows="3"required
 placeholder={textPlaceholder}
 />
 </div>

 {/* Phone & Photo input grids */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {isLost && (
 <div>
 <label className="block text-xs font-bold text-slate-655 mb-1 flex items-center gap-1">
 <Phone className="w-3 h-3 text-slate-450"/> Contact Phone (Optional)
 </label>
 <input 
 type="tel"value={contactPhone}
 onChange={(e) => {
 const clean = e.target.value.replace(/[^0-9+\s\-()]/g,'');
 setContactPhone(clean);
 }}
 placeholder="e.g. 01712-XXXXXX"className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-[13px] text-slate-850 placeholder:text-slate-400"/>
 </div>
 )}
 <div className={isLost ?"":"col-span-2"}>
 <label className="block text-xs font-bold text-slate-655 mb-1 flex items-center gap-1">
 <Camera className="w-3 h-3 text-slate-450"/> Photo Evidence (Optional)
 </label>
 {photoFile ? (
 <div className="relative w-full max-w-xs rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] mt-1">
 <img src={URL.createObjectURL(photoFile)} alt="Evidence Preview"className="h-24 w-full object-cover"/>
 <button
 type="button"onClick={() => setPhotoFile(null)}
 className="absolute top-1 right-1 w-6 h-6 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer">
 <X className="w-3.5 h-3.5"/>
 </button>
 </div>
 ) : (
 <input 
 type="file"accept="image/*"onChange={(e) => setPhotoFile(e.target.files[0])}
 className="w-full text-xs text-slate-500 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer mt-1"/>
 )}
 </div>
 </div>

 <div className="flex justify-end gap-2 pt-2">
 <button 
 type="button"onClick={() => setShowClaimForm(false)}
 className="px-4 py-2 text-[13px] font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-xl transition-colors cursor-pointer">
 Cancel
 </button>
 <button 
 type="submit"disabled={claimMutation.isPending || uploadingPhoto}
 className={`px-6 py-2 text-[13px] text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer shadow-sm ${
 isLost ?'bg-rose-600 hover:bg-rose-700':'bg-amber-600 hover:bg-amber-700'}`}
 >
 {uploadingPhoto ?"Uploading image...": claimMutation.isPending ?"Submitting...": isLost ?"Submit Report":"Submit Claim"}
 </button>
 </div>
 </form>
 </div>
 )}

 {/* Owner controls: View Submissions/Proofs */}
 {isOwner && item.status !=='reunited'&& (
 <div className="mt-8 pt-8 border-t border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] space-y-6">
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
 <div>
 <h3 className="text-[13px] tracking-tight font-black text-slate-800 dark:text-white tracking-tight">
 {isLost ?"Sighting / Finder Reports":"Ownership Claims"}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-1">
 Review submissions from community members to verify proof.
 </p>
 </div>
 {item.status !=='reunited'&& (
 <button 
 onClick={() => reuniteMutation.mutate({})}
 disabled={reuniteMutation.isPending}
 className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-900/10 transition-all disabled:opacity-50 cursor-pointer">
 {reuniteMutation.isPending ?"Updating...":"Mark as Reunited (General)"}
 </button>
 )}
 </div>

 {(isLost ? item.foundReports : item.claims)?.length > 0 ? (
 <div className="space-y-4">
 {(isLost ? item.foundReports : item.claims).map((submission, idx) => (
 <div 
 key={idx} 
 className={`p-5 rounded-lg border ${
 submission.status ==='rejected'?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]/70 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 opacity-60': submission.isSuspicious 
 ?'bg-rose-50/30 border-rose-250/45':'bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410]/50 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60'} flex flex-col gap-4`}
 >
 <div className="flex flex-wrap justify-between items-start gap-2">
 <div>
 <span className="font-bold text-slate-800 dark:text-white text-[13px] block">{submission.name}</span>
 <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
 <Mail className="w-3 h-3 text-slate-400"/> {submission.email}
 </span>
 {submission.contactPhone && (
 <span className="text-xs text-slate-450 font-bold flex items-center gap-1 mt-0.5">
 <Phone className="w-3 h-3 text-slate-440"/> {submission.contactPhone}
 </span>
 )}
 </div>
 <span className="text-[10px] text-slate-400 font-bold">
 {new Date(submission.submittedAt || Date.now()).toLocaleDateString()}
 </span>
 </div>

 <p className="text-[13px] text-slate-655 font-medium italic bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-3 rounded-xl border border-slate-100">"{submission.statement}"</p>

 {/* Photo Evidence */}
 {submission.photoUrl && (
 <div className="mt-1">
 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
 <Camera className="w-3.5 h-3.5 text-slate-450"/> Evidence Photo
 </span>
 <a href={submission.photoUrl} target="_blank"rel="noreferrer"className="inline-block relative group rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <img 
 src={submission.photoUrl} 
 alt="Evidence"className="h-28 w-44 object-cover group-hover:scale-103 transition-transform"/>
 </a>
 </div>
 )}

 {/* Action controls */}
 {submission.status ==='rejected'? (
 <div className="mt-2 p-3.5 bg-rose-50/50 border border-rose-100 rounded-lg text-xs text-rose-800 font-bold">
 🚫 This submission was dismissed by the Admin. Reason: {submission.rejectionReason ||'No reason provided.'}
 </div>
 ) : (
 <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100/50">
 {submission.isSuspicious ? (
 <span className="text-xs text-rose-600 font-black flex items-center gap-1">
 <ShieldAlert className="w-3.5 h-3.5"/> Flagged Suspicious
 </span>
 ) : (
 <button 
 onClick={() => flagMutation.mutate(
 isLost 
 ? { finderEmail: submission.email } 
 : { claimantEmail: submission.email }
 )}
 disabled={flagMutation.isPending}
 className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50">
 <ShieldAlert className="w-3.5 h-3.5"/> Flag Suspicious
 </button>
 )}

 <button 
 onClick={() => reuniteMutation.mutate(
 isLost 
 ? { finderEmail: submission.email } 
 : { claimantEmail: submission.email }
 )}
 disabled={reuniteMutation.isPending}
 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer disabled:opacity-50">
 {reuniteMutation.isPending ?"Resolving...":"Accept & Close Listing"}
 </button>
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] p-4 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/50 text-center">
 <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2"/>
 <p className="text-xs text-slate-500 dark:text-slate-300 font-bold">No submissions have been filed yet.</p>
 </div>
 )}
 </div>
 )}

 {/* Reunited Banner */}
 {item.status ==='reunited'&& (
 <div className="mt-8 pt-8 border-t border-slate-100">
 <div className="bg-emerald-50/50 p-5 rounded-lg border border-emerald-100 text-center shadow-inner">
 <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3"/>
 <h3 className="text-[13px] tracking-tight font-bold text-emerald-955 tracking-tight">Successfully Reunited!</h3>
 <p className="text-[13px] text-emerald-700 mt-1 font-medium">This listing has been successfully resolved.</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Side Panels Column (Right) */}
 <div className="space-y-6">
 
 {/* Quick Stats & Expiration Progress */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80">
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 tracking-tight">
 <Info className="w-4 h-4 text-slate-400"/> Listing Status
 </h3>
 
 <div className="space-y-4">
 {/* Status indicator */}
 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
 <span className="text-[13px] text-slate-500 dark:text-slate-300 font-bold">List Status:</span>
 <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
 item.status ==='open'?'bg-emerald-50/40 text-emerald-700 border border-emerald-200/40':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40'}`}>
 <span className={`w-2 h-2 rounded-full ${item.status ==='open'?'bg-emerald-500 animate-pulse':'bg-slate-400'}`}></span>
 {item.status ==='open'?'Active': item.status}
 </span>
 </div>

 {/* Listing Type */}
 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
 <span className="text-[13px] text-slate-500 dark:text-slate-300 font-bold">Listing Type:</span>
 <span className="text-[13px] font-extrabold capitalize text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{item.type}</span>
 </div>

 {/* Reward info */}
 {isLost && item.reward > 0 && (
 <div className="flex justify-between items-center pb-3 border-b border-slate-100 bg-amber-50/30 p-2.5 rounded-xl border border-amber-100/40">
 <span className="text-[13px] text-amber-805 font-bold flex items-center gap-1">
 <Coins className="w-3.5 h-3.5 text-amber-600"/> Cash Reward:
 </span>
 <span className="text-[13px] font-black text-amber-700">৳{item.reward}</span>
 </div>
 )}

 {/* Expiration warning */}
 {daysLeft !== null && (
 <div className="pt-1">
 <div className="flex justify-between text-xs font-bold mb-1.5">
 <span className="text-slate-500 dark:text-slate-300">Listing Lifespan</span>
 <span className={isExpired ?'text-rose-500 font-black':'text-slate-655'}>
 {isExpired ?'Expired':`${daysLeft} days remaining`}
 </span>
 </div>
 {!isExpired ? (
 <div className="w-full bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] h-2 rounded-full overflow-hidden">
 <div 
 className="bg-teal-500 h-full rounded-full transition-all duration-500"style={{ width:`${progressPercent}%`}}
 />
 </div>
 ) : (
 <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-700 font-medium leading-relaxed">
 This listing has expired. Verification submissions and claiming are locked.
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Location & Contact Information */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 space-y-5">
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 tracking-tight">
 <MapPin className="w-4 h-4 text-teal-650"/> Location Details
 </h3>
 <div>
 <p className="text-[13px] text-slate-705 font-bold leading-relaxed">{item.location}</p>
 </div>

 <div className="pt-2 border-t border-slate-100 space-y-2.5">
 <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
 <User className="w-3.5 h-3.5 text-slate-400"/> Reporter Details
 </h4>
 
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-400 uppercase w-16">Name:</span>
 <span className="text-[13px] text-slate-800 dark:text-white font-bold">
 {item.reporterDetails?.name || item.contactInfo?.split('@')[0] ||"Citizen"}
 </span>
 </div>

 {item.reporterDetails?.phone && (
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-400 uppercase w-16">Phone:</span>
 <span className="text-[13px] text-slate-800 dark:text-white font-bold flex items-center gap-1.5">
 <Phone className="w-3.5 h-3.5 text-teal-650"/>
 {item.reporterDetails.phone}
 </span>
 </div>
 )}

 {item.reporterDetails?.address && (
 <div className="flex items-start gap-2">
 <span className="text-xs font-bold text-slate-400 uppercase w-16 pt-0.5">Address:</span>
 <span className="text-[13px] text-slate-800 dark:text-white font-bold flex items-center gap-1.5 leading-tight">
 <MapPin className="w-3.5 h-3.5 text-teal-650 shrink-0"/>
 {item.reporterDetails.address}
 </span>
 </div>
 )}
 <p className="text-xs text-gray-400 mt-4 pt-4 text-center border-t border-slate-100">
 🤝 For safety, consider meeting at a public place such as a police station or shopping mall.
 </p>
 </div>
 </div>

 {/* Safe Handover Recommendation */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 space-y-4">
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
 <ShieldAlert className="w-4 h-4 text-amber-500"/> Safe Handover Notice
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-300 font-bold leading-relaxed bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] p-3.5 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/30">
 Consider meeting at a public place such as a police station or shopping mall for safe handover.
 </p>
 
 <ul className="text-[11px] text-slate-450 space-y-3 font-semibold">
 <li className="flex gap-2">
 <span className="text-emerald-500 shrink-0 font-bold">✓</span>
 <span><strong>Verify Ownership:</strong> Ask the claimant for unique identifier proofs or device passwords.</span>
 </li>
 <li className="flex gap-2">
 <span className="text-emerald-500 shrink-0 font-bold">✓</span>
 <span><strong>Zero Advance Cost:</strong> Never pay courier charges before reviewing the item in person.</span>
 </li>
 </ul>
 </div>

 </div>

 </div>
 </div>
 </div>
 );
}
