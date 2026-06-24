import React, { useState } from'react';
import { useQuery } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import MinimalLoader from'../common/MinimalLoader';
import { Link } from'react-router';

export default function MyOrganizedEvents() {
 const axiosSecure = useAxiosSecure();
 const [activeTab, setActiveTab] = useState('organized'); // 'organized' | 'attending'
 const { data, isLoading } = useQuery({
 queryKey: ['myCleanupEvents'],
 queryFn: async () => {
 const res = await axiosSecure.get('/cleanup-events/my');
 return res.data;
 }
 });

 if (isLoading) return <div className="py-10 flex justify-center"><MinimalLoader /></div>;

 const organized = data?.organized || [];
 const attending = data?.attending || [];

 return (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] border border-slate-200 dark:border-[#1e3040] rounded-xl p-5 shadow-sm">
 
 <div className="flex gap-4 mb-6 border-b border-slate-100 /80 pb-4">
 <button
 onClick={() => setActiveTab('organized')}
 className={`font-bold text-[13px] transition-colors cursor-pointer ${
 activeTab ==='organized'?'text-teal-600 border-b-2 border-teal-600 pb-1':'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:text-white dark:hover:text-white'}`}
 >
 Organized ({organized.length})
 </button>
 <button
 onClick={() => setActiveTab('attending')}
 className={`font-bold text-[13px] transition-colors cursor-pointer ${
 activeTab ==='attending'?'text-teal-600 border-b-2 border-teal-600 pb-1':'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:text-white dark:hover:text-white'}`}
 >
 Attending ({attending.length})
 </button>
 </div>

 {activeTab ==='organized'&& (
 organized.length === 0 ? (
 <p className="text-slate-500 dark:text-slate-300">You haven't organized any events yet.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-slate-200 dark:border-[#1e3040] text-slate-500 dark:text-slate-300 text-[13px]">
 <th className="py-3 px-4 font-bold">Title</th>
 <th className="py-3 px-4 font-bold">Date</th>
 <th className="py-3 px-4 font-bold">Status</th>
 <th className="py-3 px-4 font-bold">RSVPs</th>
 <th className="py-3 px-4 font-bold">Action</th>
 </tr>
 </thead>
 <tbody>
 {organized.map(event => (
 <tr key={event._id} className="border-b border-slate-100 /60 hover:bg-slate-50 dark:bg-[#0b1215] dark:hover:bg-slate-900/40 transition-colors">
 <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white max-w-[200px] truncate">{event.title}</td>
 <td className="py-4 px-4 text-[13px] text-slate-500 dark:text-slate-300">
 {new Date(event.eventDate).toLocaleDateString('en-GB')}
 </td>
 <td className="py-4 px-4">
 <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase
 ${event.approvalStatus ==='pending_review'?'bg-amber-100 text-amber-700':
 event.status ==='completed'?'bg-slate-200 text-slate-700 dark:text-[#cbd5e1]':
 event.status ==='cancelled'?'bg-red-100 text-red-700':'bg-teal-100 text-teal-700'}`}
 >
 {event.approvalStatus ==='pending_review'?'Pending': event.status}
 </span>
 </td>
 <td className="py-4 px-4 text-[13px] text-slate-500 dark:text-slate-300 font-bold">
 {event.goingCount} {event.maxVolunteers > 0 ?`/ ${event.maxVolunteers}`:''}
 </td>
 <td className="py-4 px-4">
 <Link 
 to={`/cleanup-events/${event._id}`} 
 className="text-teal-600 font-bold hover:underline text-[13px]">
 Manage →
 </Link>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )
 )}

 {activeTab ==='attending'&& (
 attending.length === 0 ? (
 <p className="text-slate-500 dark:text-slate-300">You are not attending any upcoming events.</p>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {attending.map(event => (
 <div key={event._id} className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] rounded-xl p-4 flex gap-4 items-center shadow-sm">
 <img src={event.coverImages?.[0] ||'https://via.placeholder.com/80'} alt=""className="w-16 h-16 rounded-xl object-cover"/>
 <div className="flex-1">
 <h4 className="font-bold text-slate-800 dark:text-white truncate line-clamp-1">{event.title}</h4>
 <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
 📅 {new Date(event.eventDate).toLocaleDateString('en-GB')}
 </p>
 <Link to={`/cleanup-events/${event._id}`} className="text-xs text-teal-600 font-bold hover:underline mt-2 inline-block">
 View Event →
 </Link>
 </div>
 </div>
 ))}
 </div>
 )
 )}
 </div>
 );
}
