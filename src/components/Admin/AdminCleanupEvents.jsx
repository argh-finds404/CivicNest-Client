import React, { useState, useEffect } from'react';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import MinimalLoader from'../common/MinimalLoader';
import Swal from'sweetalert2';
import { useQueryClient } from'@tanstack/react-query';

const AdminCleanupEvents = () => {
 const queryClient = useQueryClient();
 const [events, setEvents] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const axiosSecure = useAxiosSecure();

 const fetchEvents = async () => {
 setIsLoading(true);
 try {
 const res = await axiosSecure.get('/admin/cleanup-events');
 setEvents(res.data);
 } catch (error) {
 console.error("Failed to fetch community events", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchEvents();
 }, []);

 const handleStatusUpdate = async (id, approvalStatus) => {
 try {
 await axiosSecure.patch(`/admin/cleanup-events/${id}/status`, { approvalStatus });
 Swal.fire({
 icon:'success',
 title:`Event ${approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}`,
 text: approvalStatus ==='approved'?'A global notification has been sent!':'',
 timer: 2000,
 showConfirmButton: false
 });
 queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
 queryClient.invalidateQueries({ queryKey: ['admin-queue-count'] });
 fetchEvents();
 } catch (error) {
 console.error("Failed to update status", error);
 Swal.fire({
 icon:'error',
 title:'Update Failed',
 text:'Could not update event status.'});
 }
 };

 if (isLoading) {
 return (
 <div className="flex justify-center py-12">
 <MinimalLoader size="lg"color="#40826D"/>
 </div>
 );
 }

 return (
 <div>
 {/* Premium Page Header */}
 <div className="flex items-center gap-5 mb-10">
 <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-700 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-emerald-500/30 border border-emerald-400">
 <i className="ri-plant-line text-3xl tracking-tight drop-shadow-md"></i>
 </div>
 <div>
 <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-black text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>Community Events</h1>
 <p className="text-[13px] md:text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1">Review, approve, and manage neighborhood gatherings, drives, and social events.</p>
 </div>
 </div>
 
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4">
 
 {events.length === 0 ? (
 <div className="text-center py-12">
 <p className="text-slate-500 dark:text-slate-300">No community events submitted yet.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
  <table className="table w-full">
  <thead>
  <tr className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">
  <th className="py-4 px-4 text-left">Title</th>
  <th className="py-4 px-4 text-left">Organizer</th>
  <th className="py-4 px-4 text-left">Location & Date</th>
  <th className="py-4 px-4 text-center">Status</th>
  <th className="py-4 px-4 text-center">Actions</th>
  </tr>
  </thead>
  <tbody>
  {events.filter(e => e.approvalStatus !=='rejected').map(event => (
  <tr key={event._id} className="hover border-b border-slate-100 dark:border-[#1e3040]/40">
  <td className="py-4 px-4">
  <div className="font-bold text-slate-800 dark:text-white">{event.title}</div>
  <div className="text-xs text-slate-500 dark:text-slate-300 truncate max-w-xs">{event.description}</div>
  </td>
  <td className="py-4 px-4">
  <div className="font-medium text-slate-800 dark:text-white">{event.organizer?.name}</div>
  <div className="text-xs text-slate-500 dark:text-slate-300">{event.organizer?.email}</div>
  </td>
  <td className="py-4 px-4 min-w-[240px]">
  <div className="font-medium text-slate-800 dark:text-white leading-normal">{event.location?.address}</div>
  <div className="text-xs text-slate-500 dark:text-slate-300 mt-1">{new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}</div>
  </td>
  <td className="py-4 px-4 text-center">
  <span className={`badge badge-sm font-bold uppercase px-4 py-2.5 min-w-[6.5rem] ${
  event.approvalStatus ==='pending_review'?'badge-warning':
  event.status ==='completed'?'bg-blue-50 text-blue-700 border-blue-200':
  event.approvalStatus ==='approved'?'badge-success':'badge-error'}`}>
  {event.status ==='completed'?'completed': event.approvalStatus.replace('_',' ')}
  </span>
  </td>
  <td className="py-4 px-4 text-center">
  {event.approvalStatus ==='pending_review'? (
  <div className="flex justify-center gap-2">
  <button 
  onClick={() => handleStatusUpdate(event._id,'approved')}
  className="btn btn-xs btn-success text-white">
  Approve
  </button>
  <button 
  onClick={() => handleStatusUpdate(event._id,'rejected')}
  className="btn btn-xs btn-outline btn-error">
  Reject
  </button>
  </div>
  ) : (event.approvalStatus ==='approved' && event.status ==='upcoming')? (
  <button 
  onClick={() => handleStatusUpdate(event._id,'cancelled')}
  className="btn btn-xs btn-outline btn-error min-w-[6.75rem] whitespace-nowrap px-3 leading-none mx-auto block">
  Cancel Event
  </button>
  ) : (event.approvalStatus ==='cancelled' || event.status ==='cancelled' || event.status ==='completed')? (
  <button 
  onClick={() => handleStatusUpdate(event._id,'approved')}
  className="btn btn-xs btn-outline btn-success min-w-[6.75rem] whitespace-nowrap px-3 leading-none mx-auto block">
  Reopen Event
  </button>
  ) : null}
  </td>
  </tr>
  ))}
  </tbody>
  </table>
 </div>
 )}
 </div>
 </div>
 );
};

export default AdminCleanupEvents;
