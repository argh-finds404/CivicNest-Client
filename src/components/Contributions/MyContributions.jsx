import React, { useEffect, useState, useCallback } from'react';
import { generateContributionsPDF } from'../../utils/generatePDF';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import MinimalLoader from'../common/MinimalLoader.jsx';

const MyContributions = () => {
 const [contributions, setContributions] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();

 const fetchContributions = useCallback(async () => {
 if (!user?.email) return;
 setIsLoading(true);
 try {
 const res = await axiosSecure.get(`/contributions/${user.email}`);
 setContributions(res.data);
 } catch (error) {
 console.error("Failed to fetch contributions", error);
 } finally {
 setIsLoading(false);
 }
 }, [axiosSecure, user?.email]);

 useEffect(() => {
 fetchContributions();
 }, [fetchContributions]);

 const handleDownloadPDF = () => {
 const userDetails = { name:"Current User", email:"user@example.com"};
 generateContributionsPDF(contributions, userDetails);
 };

 if (isLoading) {
 return (
 <div className="py-12 flex justify-center items-center">
 <MinimalLoader />
 </div>
 );
 }

 return (
 <div className="w-full pb-24 pt-8 px-4 md:px-8">
 <div className="max-w-5xl mx-auto">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
 <div>
 <h2 className="text-3xl tracking-tight font-bold bg-gradient-to-r from-[#9FE2BF] to-[#40826D] bg-clip-text text-transparent mb-2 inline-block tracking-tight">My Donations</h2>
 <p className="text-slate-600 dark:text-slate-300 font-medium text-[13px]">Track your financial contributions towards community causes.</p>
 </div>
 </div>

 {contributions.length === 0 ? (
 <div className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl shadow-inner p-12 text-center border border-slate-100">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2 tracking-tight">No contributions yet</h3>
 <p className="text-slate-500 dark:text-slate-300">When you donate to a cause or issue, it will appear here.</p>
 </div>
 ) : (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm overflow-hidden border border-slate-100">
 <div className="overflow-x-auto">
 <table className="table w-full">
 {/* head */}
 <thead className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
 <tr>
 <th className="px-6 py-4">Date</th>
 <th className="px-6 py-4">Cause/Issue</th>
 <th className="px-6 py-4">Fund Type</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4 text-right">Amount (BDT)</th>
 </tr>
 </thead>
 <tbody>
 {contributions.map((item) => (
 <tr key={item._id} className="hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors border-b border-slate-100 last:border-0">
 <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">{new Date(item.date).toLocaleDateString()}</td>
 <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{item.title}</td>
 <td className="px-6 py-4">
 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.type ==='animal'?'bg-[#9FE2BF]/20 text-[#40826D]':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300'}`}>
 {item.type ==='animal'?'Animal Fund':'Issue Contribution'}
 </span>
 </td>
 <td className="px-6 py-4">
 {item.escrowStatus ? (
 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
 item.escrowStatus ==='holding'?'bg-amber-100 text-amber-700': 
 item.escrowStatus ==='released'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>
 {item.escrowStatus ==='holding'?'In Escrow': item.escrowStatus}
 </span>
 ) : (
 <span className="text-slate-400 text-xs">-</span>
 )}
 </td>
 <td className="px-6 py-4 text-right font-extrabold text-[#40826D] text-[13px]">
 ৳{item.amount}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};

export default MyContributions;
