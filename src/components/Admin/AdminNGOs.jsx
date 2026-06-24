import React from'react';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';
import Swal from'sweetalert2';
import MinimalLoader from'../common/MinimalLoader';

export default function AdminNGOs() {
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();

 const { data: ngos = [], isLoading } = useQuery({
 queryKey: ['admin-ngos'],
 queryFn: async () => {
 const res = await axiosSecure.get('/admin/ngos');
 return res.data?.ngos || [];
 }
 });

 const verifyMutation = useMutation({
 mutationFn: (id) => axiosSecure.patch(`/admin/ngos/${id}/verify`),
 onSuccess: () => {
 toast.success('NGO verified successfully.');
 queryClient.invalidateQueries({ queryKey: ['admin-ngos'] });
 queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
 },
 onError: () => toast.error('Failed to verify NGO.')
 });

 const rejectMutation = useMutation({
 mutationFn: ({ id, reason }) => axiosSecure.patch(`/admin/ngos/${id}/reject`, { reason }),
 onSuccess: () => {
 toast.success('NGO registration rejected.');
 queryClient.invalidateQueries({ queryKey: ['admin-ngos'] });
 queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
 },
 onError: () => toast.error('Failed to reject NGO.')
 });

 const handleVerify = async (id) => {
 const result = await Swal.fire({
 title:"Verify this NGO?",
 text:"It will be displayed in the public NGO directory.",
 icon:"question",
 showCancelButton: true,
 confirmButtonText:"Yes, verify",
 confirmButtonColor:"#15803d",
 });
 
 if (result.isConfirmed) {
 verifyMutation.mutate(id);
 }
 };

 const handleReject = async (id) => {
 const { value: reason } = await Swal.fire({
 title:"Reason for rejection",
 input:"textarea",
 inputPlaceholder:"Tell the NGO why their registration was rejected...",
 inputAttributes: { maxlength: 300 },
 showCancelButton: true,
 confirmButtonText:"Reject",
 confirmButtonColor:"#dc2626",
 });

 if (reason) {
 rejectMutation.mutate({ id, reason });
 }
 };

 if (isLoading) {
 return <div className="p-5 flex justify-center"><MinimalLoader /></div>;
 }

 return (
 <div className="p-4 md:p-10">
 <div className="mb-8">
 <h1 className="text-3xl tracking-tight font-black text-slate-800 dark:text-white mb-2 tracking-tight">NGO Verification</h1>
 <p className="text-slate-500 dark:text-slate-300">Review and verify pending NGO registrations to display them in the directory.</p>
 </div>

 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">NGO Name</th>
 <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Contact</th>
 <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Status</th>
 <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300 text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {ngos.map(ngo => (
 <tr key={ngo._id} className="border-b border-slate-100 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors">
 <td className="px-6 py-4">
 <div className="font-bold text-slate-800 dark:text-white">{ngo.name}</div>
 <div className="text-xs text-slate-500 dark:text-slate-300">{ngo.mission?.substring(0, 50)}...</div>
 </td>
 <td className="px-6 py-4">
 <div className="text-[13px] text-slate-600 dark:text-slate-300">{ngo.contactEmail}</div>
 </td>
 <td className="px-6 py-4">
 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
 ngo.status ==='verified'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
 {ngo.status}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex justify-end gap-2">
 {ngo.status !=='verified'&& (
 <button 
 onClick={() => handleVerify(ngo._id)}
 className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-[13px] font-bold transition-colors">
 Verify
 </button>
 )}
 {ngo.status !=='rejected'&& (
 <button 
 onClick={() => handleReject(ngo._id)}
 className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[13px] font-bold transition-colors">
 Reject
 </button>
 )}
 </div>
 </td>
 </tr>
 ))}
 {ngos.length === 0 && (
 <tr>
 <td colSpan="4"className="px-6 py-12 text-center text-slate-500 dark:text-slate-300">
 No NGOs found.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
