import React, { useState } from'react';
import SEO from '../common/SEO';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import { motion, AnimatePresence } from'framer-motion';
import { Link } from'react-router';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import PremiumEventCard from'../cards/PremiumEventCard';
import MinimalLoader from'../common/MinimalLoader';
import BackButton from'../common/BackButton';
import { useAuth } from'../../hooks/useAuth';
import { useRole } from'../../hooks/useRole';
import toast from'react-hot-toast';

export default function CleanupEventsPage() {
 const axiosSecure = useAxiosSecure();
 const axiosPublic = useAxiosPublic();
 const queryClient = useQueryClient();
 const { user } = useAuth();
 const [role] = useRole();
 const { data: statusData } = useQuery({
 queryKey: ["volunteerStatus", user?.email],
 enabled: !!user?.email,
 queryFn: () => axiosSecure.get("/volunteers/status").then(r => r.data)
 });
 const isVolunteer = statusData?.volunteer?.approvalStatus ==="approved";

 const [filter, setFilter] = useState('upcoming');
 const [area, setArea] = useState('');

 const {
 data,
 fetchNextPage,
 hasNextPage,
 isFetchingNextPage,
 isLoading,
 isError
 } = useInfiniteQuery({
 queryKey: ['cleanupEvents', filter, area],
 queryFn: async ({ pageParam = 1 }) => {
 const res = await axiosPublic.get('/cleanup-events', {
 params: { upcoming: filter ==='upcoming', area, page: pageParam, limit: 12 }
 });
 return res.data;
 },
 getNextPageParam: (lastPage, pages) => {
 if (lastPage.events.length === 12) return pages.length + 1;
 return undefined;
 },
 });

 const toggleInterestMutation = useMutation({
 mutationFn: async (id) => {
 const res = await axiosSecure.post(`/cleanup-events/${id}/interested`);
 return { id, data: res.data };
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['cleanupEvents'] });
 toast.success(data.data.message || (data.data.interested ?'Interest marked successfully!':'Interest removed successfully!'));
 },
 onError: (err) => {
 toast.error(err.response?.data?.message ||'Failed to update interest. Please try again.');
 }
 });

 const toggleGoingMutation = useMutation({
 mutationFn: async (id) => {
 const res = await axiosSecure.post(`/cleanup-events/${id}/going`);
 return { id, data: res.data };
 },
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ['cleanupEvents'] });
 if (data.data.full) {
 toast.info('This event is full, but you can still mark yourself as Interested!');
 } else {
 toast.success(data.data.message || (data.data.going ?'Volunteer registration successful!':'Volunteer registration removed!'));
 }
 },
 onError: (err) => {
 toast.error(err.response?.data?.message ||'Failed to update volunteer status. Please try again.');
 }
 });

 const handleInterested = (id) => {
 if (!user) return toast.error('Please login to mark interest');
 toggleInterestMutation.mutate(id);
 };

 const handleGoing = (id) => {
 if (!user) return toast.error('Please login to volunteer');

 // Find the event to check if the user is already RSVP'd (going)
 const event = allEvents.find(e => e._id === id);
 const userGoing = event?.going?.some(a => a.email === user?.email);

 if (!userGoing) {
 if (role !=="member"&& role !=="admin") {
 return toast.error("Only verified members can volunteer for drives.");
 }
 if (!isVolunteer) {
 return toast.error("Please join the volunteer force first.");
 }
 }
 toggleGoingMutation.mutate(id);
 };

 const allEvents = data?.pages.flatMap(page => page.events) || [];

 return (
 <div className="min-h-screen">
 <SEO title="Cleanup Drives" canonical={`${window.location.origin}/cleanup-events`} />
 {/* Hero Banner Section */}
 <div className="relative pt-28 pb-16 px-[5%] bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 overflow-hidden">
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full blur-3xl"></div>
 <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
 </div>

 <div className="relative z-10 max-w-7xl mx-auto">
 {/* Back Button */}
 <div className="mb-4">
 <BackButton variant="light"/>
 </div>

 {/* Header Content */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
 <div className="text-white">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 text-emerald-300">
 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
 <span className="text-[13px] font-bold uppercase tracking-wider">Community Gatherings</span>
 </div>
 <h1 className="font-heading text-4xl tracking-tight md:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
 Social Events
 </h1>
 <p className="font-body text-white/80 text-[13px] max-w-2xl">
 Discover and join community gatherings, workshops, and social events. Connect with like-minded people and make a difference together.
 </p>
 
 {/* Stats */}
 <div className="flex flex-wrap items-center gap-4 mt-6">
 <div className="flex items-center gap-2">
 <i className="ri-group-line text-2xl tracking-tight text-emerald-300"></i>
 <div>
 <p className="text-2xl tracking-tight font-bold text-white">1,234</p>
 <p className="text-xs text-white/60 uppercase tracking-wider">Members</p>
 </div>
 </div>
 <div className="w-px h-10 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20"></div>
 <div className="flex items-center gap-2">
 <i className="ri-calendar-event-line text-2xl tracking-tight text-emerald-300"></i>
 <div>
 <p className="text-2xl tracking-tight font-bold text-white">56</p>
 <p className="text-xs text-white/60 uppercase tracking-wider">Events</p>
 </div>
 </div>
 <div className="w-px h-10 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20"></div>
 <div className="flex items-center gap-2">
 <i className="ri-trophy-line text-2xl tracking-tight text-emerald-300"></i>
 <div>
 <p className="text-2xl tracking-tight font-bold text-white">89%</p>
 <p className="text-xs text-white/60 uppercase tracking-wider">Engagement</p>
 </div>
 </div>
 </div>
 </div>

 <Link
 to="/cleanup-events/organize"className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] hover:bg-emerald-50 text-teal-700 font-bold rounded-lg shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105">
 <span className="material-symbols-outlined text-2xl tracking-tight">add_circle</span>
 <span>Create Event</span>
 </Link>
 </div>
 </div>
 </div>

 {/* Content Section */}
 <div className="px-[5%] py-12">
 <div className="max-w-7xl mx-auto">

 {/* Filters */}
 <div className="flex flex-wrap items-center gap-4 mb-8">
 <div className="flex bg-slate-100 dark:bg-[#1e3040]/80 /60 rounded-xl p-1 border border-slate-200 dark:border-[#1e3040]/80 /85 shadow-sm">
 {['upcoming','all'].map(f => (
 <motion.button
 key={f}
 onClick={() => setFilter(f)}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className={`relative px-6 py-2 rounded-lg text-[13px] font-bold capitalize transition-all duration-200 cursor-pointer select-none ${
 filter === f
 ?'text-teal-700 dark:text-teal-400':'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-white dark:hover:text-white'}`}
 >
 {filter === f && (
 <motion.div
 layoutId="activeFilter"className="absolute inset-0 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0b1215] shadow-sm rounded-lg border border-slate-200 dark:border-[#1e3040]/50 /50"transition={{ type:"spring", stiffness: 380, damping: 30 }}
 />
 )}
 <span className="relative z-10">{f}</span>
 </motion.button>
 ))}
 </div>

 <motion.select
 value={area}
 onChange={(e) => setArea(e.target.value)}
 whileFocus={{ scale: 1.02 }}
 className="select select-bordered bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0b1215] border-slate-200 dark:border-[#1e3040] rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 min-w-[200px] shadow-sm transition-all text-[13px] font-semibold text-slate-800 dark:text-white cursor-pointer">
 <option value="">All Areas</option>
 <option value="Mirpur">Mirpur</option>
 <option value="Gulshan">Gulshan</option>
 <option value="Banani">Banani</option>
 <option value="Dhanmondi">Dhanmondi</option>
 <option value="Uttara">Uttara</option>
 </motion.select>
 </div>

 {/* Grid */}
 {isLoading ? (
 <div className="py-12 flex justify-center">
 <MinimalLoader />
 </div>
 ) : isError ? (
 <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
 <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">error_outline</span>
 <h3 className="font-heading text-[13px] tracking-tight text-red-700 mb-2 tracking-tight">Failed to load events</h3>
 <p className="text-red-600">Please try again later.</p>
 </div>
 ) : allEvents.length === 0 ? (
 <div className="text-center py-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <span className="material-symbols-outlined text-6xl text-teal-600/30 mb-4 block">event_busy</span>
 <h3 className="font-heading text-2xl tracking-tight text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2 tracking-tight">No cleanup drives found</h3>
 <p className="text-slate-500 dark:text-slate-300 max-w-sm mx-auto mb-6">
 There are no {filter} events in {area ||'any area'}. Why not organize one yourself?
 </p>
 <Link
 to="/cleanup-events/organize"className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-600/30 transition-all">
 <span className="material-symbols-outlined">add</span>
 Organize a Drive
 </Link>
 </div>
 ) : (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {allEvents.map(event => (
 <PremiumEventCard
 key={event._id}
 event={event}
 currentUser={user}
 userInterested={event.interested?.includes(user?.email)}
 userGoing={event.going?.some(a => a.email === user?.email)}
 onInterested={handleInterested}
 onGoing={handleGoing}
 />
 ))}
 </div>

 {hasNextPage && (
 <div className="mt-12 flex justify-center">
 <button
 onClick={() => fetchNextPage()}
 disabled={isFetchingNextPage}
 className="px-8 py-3 rounded-full border-2 border-teal-200 text-teal-700 font-bold hover:bg-teal-50 hover:border-teal-300 transition-all disabled:opacity-50 shadow-sm hover:shadow-md">
 {isFetchingNextPage ?'Loading more...':'Load More Drives'}
 </button>
 </div>
 )}
 </>
 )}

 </div>
 </div>
 </div>
 );
}
