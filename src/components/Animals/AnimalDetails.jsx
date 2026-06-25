import React, { useState, useEffect } from"react";
import { useParams, Link, useNavigate } from"react-router";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import { format } from"date-fns";
import { useAuth } from"../../hooks/useAuth";
import toast from"react-hot-toast";
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton';
import AnimalDonationModal from'./AnimalDonationModal';
import Swal from'sweetalert2';
import SEO from'../common/SEO';

export default function AnimalDetails() {
 const { id } = useParams();
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const axiosPublic = useAxiosPublic();
 const navigate = useNavigate();
 const [showDonateModal, setShowDonateModal] = useState(false);
 const queryClient = useQueryClient();

 // Adoption request states
 const [showAdoptModal, setShowAdoptModal] = useState(false);
 const [adoptPhone, setAdoptPhone] = useState('');
 const [adoptMessage, setAdoptMessage] = useState('');
 const [submittingAdopt, setSubmittingAdopt] = useState(false);

 // Edit states
 const [showEditModal, setShowEditModal] = useState(false);
 const [editData, setEditData] = useState({
 animalType:'Dog',
 urgency:'medium',
 condition:'',
 location:'',
 date:'',
 image:'',
 contactInfo:''});

 const volunteerMutation = useMutation({
 mutationFn: () => axiosSecure.post(`/animals/${id}/volunteer`),
 onSuccess: (res) => {
 toast.success(res.data.volunteered ?"Thanks for volunteering! 🐾":"You have withdrawn.");
 queryClient.invalidateQueries({ queryKey: ["animals", id] });
 queryClient.invalidateQueries({ queryKey: ["animals"] });
 },
 onError: () => toast.error("Failed to volunteer.")
 });

 const { data: animal, isLoading } = useQuery({
 queryKey: ["animals", id],
 queryFn: async () => {
 const res = await axiosSecure.get(`/animals/${id}`);
 return res.data;
 },
 });

 const [showUpdateForm, setShowUpdateForm] = useState(false);
 const [updateData, setUpdateData] = useState({
 status:'in-treatment',
 proofUrl:'',
 updateNote:''});

 // Sync state values when animal loads
 useEffect(() => {
 if (animal) {
 setUpdateData({
 status: animal.status ||'in-treatment',
 proofUrl: animal.proofUrl ||'',
 updateNote: animal.updateNote ||''});
 }
 }, [animal]);

 const [proofImageFile, setProofImageFile] = useState(null);
 const [proofImageUrl, setProofImageUrl] = useState('');
 const [rescueNote, setRescueNote] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [verifiedVolunteers, setVerifiedVolunteers] = useState([]);
 const [showAllVolunteers, setShowAllVolunteers] = useState(false);

 // AI Tip Card states
 const [showTip, setShowTip] = useState(false);
 const [tip, setTip] = useState('');
 const [tipLoading, setTipLoading] = useState(false);

 const loadTip = async () => {
 if (tip) {
 setShowTip(!showTip);
 return;
 }
 setTipLoading(true);
 try {
 const res = await axiosPublic.post('/ai/animal-tip', {
 animalType: animal.animalType || animal.type,
 condition: animal.condition,
 });
 setTip(res.data.tip);
 setShowTip(true);
 } catch (err) {
 console.error(err);
 toast.error('Could not load AI tip.');
 } finally {
 setTipLoading(false);
 }
 };

 const handleProofUpload = (e) => {
 if (e.target.files && e.target.files[0]) {
 setProofImageFile(e.target.files[0]);
 setProofImageUrl(URL.createObjectURL(e.target.files[0]));
 }
 };

 const handleSubmitRescue = async () => {
 if (!proofImageFile) return toast.error("Please upload a proof photo.");
 setSubmitting(true);
 try {
 const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
 const formData = new FormData();
 formData.append("image", proofImageFile);

 const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
 method:"POST",
 body: formData,
 });
 const data = await res.json();
 
 if (!data.success) throw new Error("Failed to upload image.");
 
 const uploadedUrl = data.data.display_url;

 await updateStatusMutation.mutateAsync({
 status:'rescued',
 proofImageUrl: uploadedUrl,
 note: rescueNote,
 verifiedVolunteers: verifiedVolunteers
 });
 
 } catch (e) {
 console.error(e);
 toast.error("Failed to submit rescue proof.");
 } finally {
 setSubmitting(false);
 }
 };

 const updateStatusMutation = useMutation({
 mutationFn: (data) => axiosSecure.patch(`/animals/${id}/status`, data),
 onSuccess: () => {
 toast.success("Status updated successfully!");
 queryClient.invalidateQueries({ queryKey: ["animals", id] });
 queryClient.invalidateQueries({ queryKey: ["animals"] });
 setShowUpdateForm(false);
 },
 onError: () => toast.error("Failed to update status.")
 });

 // Edit / Delete Mutations
 const editMutation = useMutation({
 mutationFn: (data) => axiosSecure.put(`/animals/${id}`, data),
 onSuccess: () => {
 toast.success("Report updated successfully!");
 queryClient.invalidateQueries({ queryKey: ["animals", id] });
 queryClient.invalidateQueries({ queryKey: ["animals"] });
 setShowEditModal(false);
 },
 onError: () => toast.error("Failed to update report.")
 });

 const deleteMutation = useMutation({
 mutationFn: () => axiosSecure.delete(`/animals/${id}`),
 onSuccess: () => {
 Swal.fire("Deleted!","Animal report has been deleted.","success");
 navigate("/animals");
 },
 onError: () => toast.error("Failed to delete report.")
 });

 // Adoptable Status Toggle
 const toggleAdoptableMutation = useMutation({
 mutationFn: (adoptable) => axiosSecure.patch(`/animals/${id}/adoptable`, { adoptable }),
 onSuccess: (res) => {
 toast.success(res.data.adoptable ?"Animal is now ready for adoption! 🏠":"Adoption disabled.");
 queryClient.invalidateQueries({ queryKey: ["animals", id] });
 },
 onError: () => toast.error("Failed to update adoption availability.")
 });

 // Submit Adoption Request
 const handleAdoptRequest = async (e) => {
 e.preventDefault();
 if (!adoptPhone || !adoptMessage) {
 toast.error("Please fill in all details.");
 return;
 }
 setSubmittingAdopt(true);
 try {
 await axiosSecure.post(`/animals/${id}/adopt-request`, {
 phone: adoptPhone,
 message: adoptMessage
 });
 Swal.fire("Request Sent!","Your request has been submitted to the reporter.","success");
 setShowAdoptModal(false);
 setAdoptPhone('');
 setAdoptMessage('');
 queryClient.invalidateQueries({ queryKey: ["animals", id] });
 } catch (err) {
 console.error(err);
 toast.error("Failed to submit adoption request.");
 } finally {
 setSubmittingAdopt(false);
 }
 };

 // Approve Adoption request
 const approveAdoptionMutation = useMutation({
 mutationFn: (adopterEmail) => axiosSecure.post(`/animals/${id}/adopt-approve`, { adopterEmail }),
 onSuccess: () => {
 Swal.fire("Approved!","Adoption request approved! Points awarded.","success");
 queryClient.invalidateQueries({ queryKey: ["animals", id] });
 queryClient.invalidateQueries({ queryKey: ["animals"] });
 },
 onError: () => toast.error("Failed to approve adoption.")
 });

 const { data: myContributions = [] } = useQuery({
 queryKey: ['my-contributions', user?.email],
 queryFn: async () => {
 if (!user?.email) return [];
 const res = await axiosSecure.get(`/contributions/my?email=${user.email}`);
 return res.data;
 },
 enabled: !!user?.email,
 });

 // Match NGOs suggestion query
 const { data: matchedNgos = [] } = useQuery({
 queryKey: ['ngoMatch', animal?.area || animal?.location],
 enabled: !!(animal?.area || animal?.location),
 queryFn: async () => {
 const area = animal?.area || animal?.location ||'';
 const res = await axiosPublic.get('/ngos', {
 params: { serviceType:'Animal Rescue', area, limit: 2 }
 });
 return Array.isArray(res.data) ? res.data : res.data.ngos || [];
 },
 });

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center dark:bg-[#0a1410]">
 <MinimalLoader />
 </div>
 );
 }

 if (!animal) {
 return (
 <div className="min-h-screen flex items-center justify-center dark:bg-[#0a1410]">
 <p className="text-[13px] tracking-tight font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Animal report not found.</p>
 </div>
 );
 }

 const isOwnReport = user?.email === animal.reporter?.email || user?.email === animal.contactInfo;
 const isVolunteer = animal.volunteers?.some(v => 
 (typeof v ==='string'&& v === user?.email) || 
 (v && v.email === user?.email)
 );

 const hasDonated = myContributions.some(c => c.animalId === animal._id);
 const alreadyRequestedAdopt = animal.adoptionRequests?.some(r => r.email === user?.email);

 return (
  <div className="min-h-screen dark:bg-[#0a1410] pt-24 pb-20">
  <SEO 
    title={animal?.animalType ? `${animal.animalType} - Stray Animal Details` : "Stray Animal Details"} 
    description={animal?.condition?.slice(0, 155)} 
    image={animal?.image} 
    type="article" 
  />
 <div className="max-w-4xl mx-auto px-6">
 <div className="flex items-center gap-3 mb-6">
 <BackButton variant="dark"/>
 <span className="text-slate-500 dark:text-slate-300 font-bold">Back to Animals</span>
 </div>
 
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden mb-8">
 <div className="h-64 md:h-96 w-full relative bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]">
 {animal.image ? (
 <img src={animal.image} alt={animal.type} className="w-full h-full object-cover"/>
 ) : (
 <div className="w-full h-full relative">
 <img src="https://images.unsplash.com/photo-1548767797641-c90d27c7311f?auto=format&fit=crop&q=80"alt="Animal Rescue Fallback"className="w-full h-full object-cover"/>
 <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
 <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
 <i className="ri-image-line text-4xl tracking-tight text-white/50"></i>
 <span className="text-white/80 font-bold tracking-wider uppercase text-[13px]">No Photo Provided</span>
 </div>
 </div>
 )}
 <div className="absolute top-4 left-4 flex gap-2">
 <span className={`px-4 py-1.5 rounded-full text-[13px] font-extrabold uppercase tracking-widest shadow-md ${
 animal.urgency ==="high"|| animal.urgency ==="emergency"?"bg-rose-500 text-white": 
 animal.urgency ==="medium"?"bg-amber-500 text-white":"bg-emerald-500 text-white"}`}>
 {animal.urgency} Urgency
 </span>
 {animal.status && (
 <span className={`px-4 py-1.5 rounded-full text-[13px] font-extrabold uppercase tracking-widest shadow-md ${
 animal.status ==='rescued'?'bg-emerald-500 text-white':
 animal.status ==='in-treatment'?'bg-blue-500 text-white':
 animal.status ==='adopted'?'bg-purple-600 text-white':'bg-orange-500 text-white'}`}>
 {animal.status ==='needs-help'?'Awaiting Rescue': animal.status.replace('-','')}
 </span>
 )}
 </div>
 </div>

 <div className="p-5 md:p-12">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
 <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">{animal.animalType || animal.type ||'Stray Animal'} in Need</h1>
 
 {/* Edit / Delete Buttons */}
 {isOwnReport && (
 <div className="flex gap-2">
 <button 
 onClick={() => {
 setEditData({
 animalType: animal.animalType || animal.type ||'Dog',
 urgency: animal.urgency ||'medium',
 condition: animal.condition ||'',
 location: animal.location ||'',
 date: animal.date ? animal.date.substring(0, 10) :'',
 image: animal.image ||'',
 contactInfo: animal.contactInfo || user?.email ||''});
 setShowEditModal(true);
 }}
 className="px-4 py-2 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm">
 <i className="ri-edit-line"></i> Edit
 </button>
 <button 
 onClick={() => {
 Swal.fire({
 title:'Are you sure?',
 text:"Do you want to delete this stray animal report?",
 icon:'warning',
 showCancelButton: true,
 confirmButtonColor:'#e11d48',
 cancelButtonColor:'#64748b',
 confirmButtonText:'Yes, delete it!'}).then((result) => {
 if (result.isConfirmed) {
 deleteMutation.mutate();
 }
 });
 }}
 className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm">
 <i className="ri-delete-bin-line"></i> Delete
 </button>
 </div>
 )}
 </div>
 
 <div className="flex flex-wrap gap-4 mb-8">
 <span className="bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[13px] font-bold flex items-center gap-2">
 <svg width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"><rect x="3"y="4"width="18"height="18"rx="2"ry="2"></rect><line x1="16"y1="2"x2="16"y2="6"></line><line x1="8"y1="2"x2="8"y2="6"></line><line x1="3"y1="10"x2="21"y2="10"></line></svg>
 Spotted: {animal.date ? format(new Date(animal.date),"PPP") :"Unknown date"}
 </span>
 <span className="bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[13px] font-bold flex items-center gap-2">
 🙋 {animal.volunteerCount || 0} Helping
 </span>
 </div>

 <div className="prose prose-slate max-w-none mb-6">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Condition Details</h3>
 <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[13px] whitespace-pre-wrap">{animal.condition}</p>
 </div>

 {/* AI first-aid tips collapsible */}
 <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 mb-8 shadow-sm">
 <button 
 onClick={loadTip}
 className="w-full flex items-center justify-between font-bold text-emerald-800 text-[13px] transition-all">
 <span className="flex items-center gap-2">
 <i className="ri-lightbulb-fill text-yellow-500 text-[13px] tracking-tight animate-pulse"></i>
 {tipLoading ?"Loading Tip Guide...":"View First-Aid Guide"}
 </span>
 <i className={`ri-arrow-${showTip ?'up':'down'}-s-line text-2xl tracking-tight`}></i>
 </button>
 {showTip && tip && (
 <motion.div 
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height:'auto'}}
 className="mt-4 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] text-[13px] whitespace-pre-line border-t border-emerald-100 pt-4 leading-relaxed font-medium">
 {tip}
 </motion.div>
 )}
 </div>

 <div className="bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] p-4 rounded-lg border border-slate-100 mb-8">
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 tracking-tight">
 <svg width="20"height="20"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12"cy="10"r="3"></circle></svg>
 Location
 </h3>
 <p className="text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">{animal.location}</p>
 </div>

 {/* Match NGOs suggestions */}
 {matchedNgos.length > 0 && (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] mb-8 shadow-sm">
 <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
 <i className="ri-contacts-line text-teal-600 text-[13px]"></i>
 Matching Local NGOs
 </h3>
 <div className="space-y-3">
 {matchedNgos.map(ngo => (
 <div key={ngo._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] transition-colors">
 <div>
 <p className="font-bold text-slate-800 dark:text-white text-[13px]">{ngo.name}</p>
 <p className="text-xs text-slate-500 dark:text-slate-300">📞 {ngo.phone ||'No phone provided'}</p>
 </div>
 {ngo.phone && (
 <a href={`tel:${ngo.phone}`} className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
 Call NGO
 </a>
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {(animal.proofUrl || animal.updateNote || animal.rescueProof?.imageUrl) && (
 <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-8">
 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
 <h3 className="text-[13px] font-bold text-blue-900 flex items-center gap-2 tracking-tight">
 <span className="text-2xl tracking-tight">📋</span>
 Rescue Proof Details
 </h3>
 {animal.rescueVerificationStatus ==='pending'&& (
 <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1 border border-amber-200 shadow-sm">
 <i className="ri-time-line text-[13px]"></i> Pending Admin Approval
 </span>
 )}
 {animal.rescueVerificationStatus ==='approved'&& (
 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1 border border-emerald-200 shadow-sm">
 <i className="ri-check-double-line text-[13px]"></i> Verified Rescue
 </span>
 )}
 {animal.rescueVerificationStatus ==='rejected'&& (
 <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1 border border-rose-200 shadow-sm">
 <i className="ri-close-circle-line text-[13px]"></i> Rejected Proof
 </span>
 )}
 </div>
 
 {animal.rescueRejectionReason && (
 <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-800 text-[13px] mb-4">
 <strong>Rejection Reason:</strong>"{animal.rescueRejectionReason}"</div>
 )}

 {animal.rescueProof?.note && (
 <p className="text-blue-800 italic mb-4">"{animal.rescueProof.note}"</p>
 )}
 {animal.rescueProof?.imageUrl && (
 <div>
 <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">Submitted Proof Image</span>
 <img src={animal.rescueProof.imageUrl} alt="Proof"className="max-h-64 rounded-xl border border-blue-200 shadow-sm object-cover"/>
 </div>
 )}
 </div>
 )}

 {/* Ready for Adoption switch (Reporter only, Rescued and Approved only) */}
 {isOwnReport && animal.status ==='rescued'&& animal.rescueVerificationStatus ==='approved'&& (
 <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg mb-8 flex items-center justify-between">
 <div>
 <h4 className="font-bold text-purple-900 text-[13px]">Animal Adoption</h4>
 <p className="text-xs text-purple-700 font-medium">Allow community members to request adoption for this animal.</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input 
 type="checkbox"checked={!!animal.adoptable} 
 onChange={(e) => toggleAdoptableMutation.mutate(e.target.checked)}
 className="sr-only peer"/>
 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] after:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
 </label>
 </div>
 )}

 {/* List of Adoption Applicants */}
 {isOwnReport && animal.status ==='rescued'&& animal.adoptable && animal.adoptionRequests?.length > 0 && (
 <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-200 mb-8">
 <h3 className="font-bold text-purple-900 text-[13px] mb-4 flex items-center gap-2 tracking-tight">
 <i className="ri-heart-add-fill text-purple-600 text-[13px] tracking-tight"></i>
 Adoption Applications ({animal.adoptionRequests.length})
 </h3>
 <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
 {animal.adoptionRequests.map((req, i) => (
 <div key={i} className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-bold text-slate-800 dark:text-white text-[13px]">{req.name}</span>
 <span className="text-xs text-slate-400">({req.email})</span>
 </div>
 <p className="text-xs text-teal-600 font-bold mb-2">📞 Phone: {req.phone}</p>
 <p className="text-[13px] text-slate-600 dark:text-slate-300 italic">"{req.message}"</p>
 </div>
 <button 
 onClick={() => approveAdoptionMutation.mutate(req.email)}
 disabled={approveAdoptionMutation.isPending}
 className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all text-center shrink-0">
 Approve Request
 </button>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Adoption Approved Visual */}
 {animal.status ==='adopted'&& (
 <div className="bg-purple-100 border-2 border-purple-200 p-5 rounded-xl text-center mb-8 shadow-inner">
 <div className="w-20 h-20 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
 <span className="text-4xl tracking-tight">🏠</span>
 </div>
 <h3 className="text-2xl tracking-tight font-black text-purple-900 tracking-tight">Successfully Adopted!</h3>
 <p className="text-[13px] text-purple-700 mt-2 font-semibold">
 This animal has found a loving home. Thank you for your support!
 </p>
 {animal.adoptedBy && (
 <span className="inline-block mt-3 px-4 py-1.5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-purple-900 border border-purple-200 rounded-full text-xs font-bold uppercase tracking-tight">
 Adopter: {animal.adoptedBy}
 </span>
 )}
 </div>
 )}

 {/* Adoption request button for non-reporters */}
 {!isOwnReport && animal.status ==='rescued'&& animal.adoptable && (
 <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-8 flex flex-col items-center text-center">
 <h3 className="font-bold text-purple-900 text-[13px] mb-2 tracking-tight">Ready for Adoption!</h3>
 <p className="text-[13px] text-purple-700 mb-4 max-w-md">Provide a warm and loving home for this animal. Submit your request now.</p>
 {alreadyRequestedAdopt ? (
 <div className="px-6 py-3 bg-purple-100 border border-purple-200 text-purple-800 rounded-xl font-bold text-[13px] shadow-sm flex items-center gap-2">
 <i className="ri-checkbox-circle-fill text-purple-600 text-[13px]"></i>
 Adoption Request Submitted
 </div>
 ) : (
 <button 
 onClick={() => setShowAdoptModal(true)}
 className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2">
 <i className="ri-home-heart-line text-[13px]"></i> Request Adoption
 </button>
 )}
 </div>
 )}

 {animal.status !=='rescued'&& animal.status !=='adopted'&& (
 <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
 {!isOwnReport && (
 <button 
 onClick={() => volunteerMutation.mutate()}
 disabled={volunteerMutation.isPending}
 className={`flex-1 text-center py-4 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
 isVolunteer 
 ?'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]':'bg-teal-600 hover:bg-teal-700 text-white'}`}
 >
 <i className={isVolunteer ?"ri-checkbox-circle-line":"ri-hand-heart-line"}></i> 
 {isVolunteer ?"Withdraw from volunteering":"Volunteer to Help"}
 </button>
 )}
 
 {hasDonated ? (
 <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm">
 <i className="ri-heart-pulse-fill text-[13px] tracking-tight text-emerald-500 animate-pulse"></i> 
 Thank you for donating!
 </div>
 ) : (
 <button 
 onClick={() => setShowDonateModal(true)}
 className="flex-1 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-2 border-teal-600 text-teal-600 hover:bg-teal-50 text-center py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
 <i className="ri-secure-payment-line"></i> Donate to Care
 </button>
 )}
 </div>
 )}

 {/* Reporter Update Form for Treatment status */}
 {isOwnReport && animal.status !=='rescued'&& animal.status !=='adopted'&& (
 <div className="mt-8 pt-8 border-t border-slate-100">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h4 className="font-bold text-slate-800 dark:text-white text-[13px]">Update Animal Status</h4>
 <p className="text-[13px] text-slate-500 dark:text-slate-300">Provide proof of treatment or rescue to keep the community informed.</p>
 </div>
 {!showUpdateForm && (
 <button 
 onClick={() => setShowUpdateForm(true)}
 className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all">
 Update
 </button>
 )}
 </div>

 {showUpdateForm && (
 <div className="bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] p-4 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] mt-4">
 <div className="space-y-4">
 <div>
 <label className="block text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">New Status</label>
 <select 
 value={updateData.status}
 onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
 className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
 <option value="needs-help">Awaiting Rescue</option>
 <option value="in-treatment">In Treatment</option>
 </select>
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">Update Note</label>
 <textarea 
 value={updateData.updateNote}
 onChange={(e) => setUpdateData({...updateData, updateNote: e.target.value})}
 placeholder="E.g., Taken to the vet, prescribed antibiotics..."rows="3"className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"></textarea>
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">Proof Image URL (Optional)</label>
 <input 
 type="url"value={updateData.proofUrl}
 onChange={(e) => setUpdateData({...updateData, proofUrl: e.target.value})}
 placeholder="https://..."className="w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"/>
 </div>

 <div className="flex gap-3 pt-2">
 <button 
 onClick={() => updateStatusMutation.mutate(updateData)}
 disabled={updateStatusMutation.isPending}
 className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all disabled:opacity-50">
 {updateStatusMutation.isPending ?"Updating...":"Save Update"}
 </button>
 <button 
 onClick={() => setShowUpdateForm(false)}
 className="px-6 py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] rounded-xl font-bold transition-all">
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Reporter Mark Rescued Proof Submissions Form */}
 {isOwnReport && animal.status !=='rescued'&& animal.status !=='adopted'&& (
 <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
 <h3 className="font-bold text-emerald-800 mb-3 text-[13px] flex items-center gap-2 tracking-tight">
 <i className="ri-shield-check-fill text-[13px] tracking-tight"></i> Mark as Rescued
 </h3>
 <p className="text-[13px] text-emerald-700 mb-4 font-medium">
 Upload a photo as proof. An admin will verify and award points to you and all volunteers.
 </p>

 <div className="mb-4">
 <label className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-2">Proof Photo *</label>
 <input type="file"accept="image/*"onChange={handleProofUpload}
 className="text-[13px] text-emerald-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:text-[13px] file:font-bold hover:file:bg-emerald-700 transition-all cursor-pointer"/>
 {proofImageUrl && <img src={proofImageUrl} alt="Proof"className="mt-3 h-32 rounded-xl object-cover border-2 border-emerald-200 shadow-sm"/>}
 </div>

 <textarea
 value={rescueNote}
 onChange={e => setRescueNote(e.target.value)}
 placeholder="Briefly describe what happened — where they are now, who helped..."rows={3}
 className="w-full px-4 py-3 text-[13px] border border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none mb-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]"/>

 {animal.volunteers?.length > 0 && (
 <div className="mb-4">
 <p className="text-[13px] font-semibold text-emerald-800 mb-2">
 Who actually came and helped? Check only those who were physically present.
 </p>
 <div className="space-y-2 max-h-48 overflow-y-auto">
 {(showAllVolunteers ? animal.volunteers : animal.volunteers.slice(0, 5)).map(vol => {
 const email = vol?.email || vol;
 const name = vol?.name || email;
 const photo = vol?.photoURL || null;
 return (
 <label key={email}
 className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-100/50 cursor-pointer border border-transparent hover:border-emerald-200 transition-all bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow-sm">
 {photo ? (
 <img src={photo} alt={name}
 className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-emerald-200"/>
 ) : (
 <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
 {name[0].toUpperCase()}
 </div>
 )}
 <span className="text-[13px] font-medium text-emerald-900 flex-grow truncate">
 {name}
 </span>
 <input
 type="checkbox"value={email}
 checked={verifiedVolunteers.includes(email)}
 onChange={(e) => {
 const val = e.target.value;
 setVerifiedVolunteers(prev =>
 e.target.checked ? [...prev, val] : prev.filter(v => v !== val)
 );
 }}
 className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"/>
 </label>
 );
 })}
 </div>
 {animal.volunteers.length > 5 && (
 <button
 type="button"onClick={() => setShowAllVolunteers(!showAllVolunteers)}
 className="text-xs font-bold text-emerald-600 hover:text-emerald-800 mt-2 flex items-center gap-1">
 {showAllVolunteers
 ? <><i className="ri-arrow-up-s-line"></i> Show fewer</>
 : <><i className="ri-arrow-down-s-line"></i> + {animal.volunteers.length - 5} more volunteers</>}
 </button>
 )}
 </div>
 )}

 <button
 onClick={handleSubmitRescue}
 disabled={!proofImageFile || submitting}
 className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex justify-center items-center gap-2">
 {submitting ? <MinimalLoader size="sm"color="#ffffff"/> : <><i className="ri-send-plane-fill"></i> Submit Rescue Proof</>}
 </button>
 </div>
 )}

 {isOwnReport && animal.status ==='rescued'&& animal.rescueVerificationStatus ==='pending'&& (
 <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center shadow-inner">
 <div className="w-16 h-16 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-amber-100">
 <i className="ri-hourglass-2-fill text-3xl tracking-tight text-amber-500 animate-pulse"></i>
 </div>
 <h3 className="font-bold text-amber-800 text-[13px] tracking-tight">Proof Submitted</h3>
 <p className="text-[13px] text-amber-700 mt-2 font-medium">
 An admin will review your proof. Points will be awarded once verified.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>

 {showDonateModal && (
 <AnimalDonationModal 
 animal={animal} 
 onClose={() => setShowDonateModal(false)} 
 />
 )}

 {/* Adoption Request Modal */}
 {showAdoptModal && (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100">
 <div className="p-4 bg-purple-600 text-white">
 <h3 className="text-[13px] tracking-tight font-bold tracking-tight">Adopt Stray Animal</h3>
 <p className="text-purple-100 text-xs mt-1">Submit your request to take in this animal.</p>
 </div>
 <form onSubmit={handleAdoptRequest} className="p-4 space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Contact Phone *</label>
 <input 
 type="tel"required
 placeholder="e.g. +8801712345678"value={adoptPhone}
 onChange={(e) => setAdoptPhone(e.target.value)}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-purple-500 transition-all"/>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Adoption Statement *</label>
 <textarea 
 required
 rows="4"placeholder="Tell the reporter why you would make a good adopter..."value={adoptMessage}
 onChange={(e) => setAdoptMessage(e.target.value)}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-purple-500 transition-all resize-none"/>
 </div>

 <div className="pt-2 flex gap-3 justify-end">
 <button 
 type="button"onClick={() => setShowAdoptModal(false)}
 className="px-5 py-2.5 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-[13px] transition-colors">
 Cancel
 </button>
 <button 
 type="submit"disabled={submittingAdopt}
 className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-[13px] transition-all shadow-md shadow-purple-600/20 disabled:opacity-50">
 {submittingAdopt ?"Submitting...":"Submit Request"}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}

 {/* Edit Animal Report Modal */}
 {showEditModal && (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
 <div className="p-4 bg-slate-800 text-white shrink-0 relative">
 <h3 className="text-[13px] tracking-tight font-bold tracking-tight">Edit Animal Report</h3>
 <p className="text-slate-300 text-xs mt-1">Update the report details below.</p>
 <button 
 onClick={() => setShowEditModal(false)}
 className="absolute top-6 right-6 text-slate-300 hover:text-white transition-colors">
 <i className="ri-close-line text-2xl tracking-tight"></i>
 </button>
 </div>
 
 <form onSubmit={(e) => {
 e.preventDefault();
 editMutation.mutate(editData);
 }} className="p-4 space-y-4 overflow-y-auto flex-grow">
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Animal Type *</label>
 <select
 value={editData.animalType}
 onChange={(e) => setEditData({...editData, animalType: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] outline-none focus:border-teal-500 transition-all">
 <option value="Dog">Dog</option>
 <option value="Cat">Cat</option>
 <option value="Cow">Cow</option>
 <option value="Bird">Bird</option>
 <option value="Other">Other</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Urgency *</label>
 <select
 value={editData.urgency}
 onChange={(e) => setEditData({...editData, urgency: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] outline-none focus:border-teal-500 transition-all">
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 <option value="emergency">Emergency</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Condition Description *</label>
 <textarea 
 required
 rows="3"value={editData.condition}
 onChange={(e) => setEditData({...editData, condition: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all resize-none"/>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Location *</label>
 <input 
 type="text"required
 value={editData.location}
 onChange={(e) => setEditData({...editData, location: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Date Spotted *</label>
 <input 
 type="date"required
 value={editData.date}
 onChange={(e) => setEditData({...editData, date: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Contact Email *</label>
 <input 
 type="email"required
 value={editData.contactInfo}
 onChange={(e) => setEditData({...editData, contactInfo: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Photo URL (Optional)</label>
 <input 
 type="url"value={editData.image}
 onChange={(e) => setEditData({...editData, image: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>

 <div className="pt-4 flex gap-3 justify-end shrink-0">
 <button 
 type="button"onClick={() => setShowEditModal(false)}
 className="px-5 py-2.5 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-[13px] transition-colors">
 Cancel
 </button>
 <button 
 type="submit"disabled={editMutation.isPending}
 className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[13px] transition-all shadow-md shadow-teal-600/20 disabled:opacity-50">
 {editMutation.isPending ?"Saving...":"Save Changes"}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </div>
 );
}
