import React from'react';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';
import MinimalLoader from'../common/MinimalLoader';

export default function AdminForum() {
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();

 const { data: threads = [], isLoading } = useQuery({
 queryKey: ['admin-forum'],
 queryFn: async () => {
 const res = await axiosSecure.get('/admin/forum');
 return res.data?.threads || [];
 }
 });

 const togglePinMutation = useMutation({
 mutationFn: (id) => axiosSecure.patch(`/admin/forum/${id}/pin`),
 onSuccess: () => {
 toast.success('Pin status updated.');
 queryClient.invalidateQueries({ queryKey: ['admin-forum'] });
 },
 onError: () => toast.error('Failed to update pin status.')
 });

 const deleteMutation = useMutation({
 mutationFn: (id) => axiosSecure.delete(`/admin/forum/${id}`),
 onSuccess: () => {
 toast.success('Thread deleted.');
 queryClient.invalidateQueries({ queryKey: ['admin-forum'] });
 },
 onError: () => toast.error('Failed to delete thread.')
 });

 if (isLoading) {
 return <div className="p-5 flex justify-center"><MinimalLoader /></div>;
 }

 return (
 <div className="p-4 md:p-10">
 <div className="mb-8">
 <h1 className="text-3xl tracking-tight font-black text-slate-800 dark:text-white mb-2 tracking-tight">Forum Moderation</h1>
 <p className="text-slate-500 dark:text-slate-300">Manage community discussions, pin important threads, or remove inappropriate content.</p>
 </div>

 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Thread</th>
 <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Author</th>
 <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Category</th>
 <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300 text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {threads.map(thread => (
 <tr key={thread._id} className="border-b border-slate-100 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 {thread.isPinned && <i className="ri-pushpin-fill text-amber-500"title="Pinned"></i>}
 <span className="font-bold text-slate-800 dark:text-white line-clamp-1">{thread.title}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="text-[13px] text-slate-600 dark:text-slate-300">{thread.posterName}</span>
 </td>
 <td className="px-6 py-4">
 <span className="px-3 py-1 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
 {thread.category}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex justify-end gap-2">
 <button 
 onClick={() => togglePinMutation.mutate(thread._id)}
 className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${thread.isPinned ?'bg-amber-100 text-amber-700 hover:bg-amber-200':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
 >
 {thread.isPinned ?'Unpin':'Pin'}
 </button>
 <button 
 onClick={() => {
 if(confirm("Are you sure you want to delete this thread?")) {
 deleteMutation.mutate(thread._id);
 }
 }}
 className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[13px] font-bold transition-colors">
 Delete
 </button>
 </div>
 </td>
 </tr>
 ))}
 {threads.length === 0 && (
 <tr>
 <td colSpan="4"className="px-6 py-12 text-center text-slate-500 dark:text-slate-300">
 No threads found.
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
