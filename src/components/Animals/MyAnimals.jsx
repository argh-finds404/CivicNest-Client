import React, { useState, useEffect, useCallback } from'react';
import { Link, useNavigate } from'react-router';
import'remixicon/fonts/remixicon.css';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { motion } from'framer-motion';
import MinimalLoader from'../common/MinimalLoader.jsx';
import Swal from'sweetalert2';
import { format } from'date-fns';

const URGENCY_COLORS = {
 emergency:'bg-red-100 text-red-700 border-red-200',
 high:'bg-orange-100 text-orange-700 border-orange-200',
 medium:'bg-amber-100 text-amber-700 border-amber-200',
 low:'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]',
};

const STATUS_COLORS = {'needs-help':'bg-orange-500 text-white','in-treatment':'bg-blue-500 text-white','rescued':'bg-emerald-500 text-white','adopted':'bg-purple-500 text-white',
};

const MyAnimals = () => {
 const [animals, setAnimals] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const axiosSecure = useAxiosSecure();
 const navigate = useNavigate();

 const fetchAnimals = useCallback(async () => {
 setIsLoading(true);
 try {
 const res = await axiosSecure.get('/animals/my');
 setAnimals(res.data);
 } catch (error) {
 console.error("Failed to fetch my animal reports", error);
 } finally {
 setIsLoading(false);
 }
 }, [axiosSecure]);

 useEffect(() => {
 fetchAnimals();
 }, [fetchAnimals]);

 const handleDelete = async (id) => {
 Swal.fire({
 title:'Are you sure?',
 text:"You won't be able to revert this animal report!",
 icon:'warning',
 showCancelButton: true,
 confirmButtonColor:'#d33',
 cancelButtonColor:'#64748b',
 confirmButtonText:'Yes, delete it!'}).then(async (result) => {
 if (result.isConfirmed) {
 try {
 await axiosSecure.delete(`/animals/${id}`);
 Swal.fire('Deleted!','Report has been deleted.','success');
 fetchAnimals();
 } catch (err) {
 Swal.fire('Error','Failed to delete report.','error');
 }
 }
 });
 };

 const getStatusBadge = (animal) => {
 if (animal.status ==='rescued') {
 if (animal.rescueVerificationStatus ==='pending') {
 return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 rounded-full">⏳ Awaiting Verification</span>;
 }
 if (animal.rescueVerificationStatus ==='approved'|| animal.rescueVerificationStatus ==='verified') {
 return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 rounded-full">✓ Rescue Verified</span>;
 }
 if (animal.rescueVerificationStatus ==='rejected') {
 return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 rounded-full">✗ Proof Rejected</span>;
 }
 return <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">Rescued ✓</span>;
 }

 if (animal.status ==='adopted') {
 return <span className="px-2.5 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">Adopted 🏠</span>;
 }

 if (animal.status ==='in-treatment') {
 return <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">In Treatment</span>;
 }

 return <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">Awaiting Rescue</span>;
 };

 return (
 <div className="w-full py-12 px-4 dark:bg-[#0a1410] min-h-screen pt-24">
 <div className="max-w-7xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
 <div>
 <h1 className="text-3xl tracking-tight font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">My Animal Reports</h1>
 <p className="text-slate-600 dark:text-slate-300 font-medium text-[13px]">Track, update, or remove reports you've posted in the community.</p>
 </div>
 <Link to="/animals/add"className="btn bg-[#40826D] hover:bg-[#326756] text-white border-none shadow-md rounded-full px-6">
 <i className="ri-add-line"></i> Report Animal
 </Link>
 </div>

 {isLoading ? (
 <div className="flex justify-center items-center py-12">
 <MinimalLoader />
 </div>
 ) : animals.length === 0 ? (
 <div className="text-center py-10 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-100 max-w-2xl mx-auto shadow-inner">
 <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
 <i className="ri-heart-pulse-line text-3xl tracking-tight text-emerald-500"></i>
 </div>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] tracking-tight">No animals reported</h3>
 <p className="text-slate-500 dark:text-slate-300 mt-2 mb-6">You haven't reported any animals needing help yet.</p>
 <Link to="/animals/add"className="btn bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] rounded-full px-6 shadow-sm">
 Start Reporting
 </Link>
 </div>
 ) : (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-500 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
 <th className="p-5">Thumbnail</th>
 <th className="p-5">Type</th>
 <th className="p-5">Status</th>
 <th className="p-5">Urgency</th>
 <th className="p-5">Location</th>
 <th className="p-5">Spotted Date</th>
 <th className="p-5 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {animals.map((animal) => (
 <tr key={animal._id} className="hover:bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410]/50 transition-colors text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">
 <td className="p-5">
 <img 
 src={animal.image ||'https://images.unsplash.com/photo-1548767797641-c90d27c7311f?auto=format&fit=crop&q=80'} 
 alt={animal.animalType || animal.type} 
 className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0"/>
 </td>
 <td className="p-5 font-bold capitalize">{animal.animalType || animal.type}</td>
 <td className="p-5">{getStatusBadge(animal)}</td>
 <td className="p-5">
 <span className={`px-2.5 py-1 text-xs font-bold border rounded-full uppercase tracking-tight ${URGENCY_COLORS[animal.urgency] || URGENCY_COLORS.medium}`}>
 {animal.urgency}
 </span>
 </td>
 <td className="p-5 max-w-[200px] truncate">{animal.location}</td>
 <td className="p-5 text-slate-500 dark:text-slate-300 font-medium">
 {animal.date ? format(new Date(animal.date),"MMM d, yyyy") :'N/A'}
 </td>
 <td className="p-5 text-right">
 <div className="flex justify-end items-center gap-2">
 <Link 
 to={`/animals/${animal._id}`}
 className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-xl border border-teal-100 transition-colors">
 Manage
 </Link>
 <button 
 onClick={() => handleDelete(animal._id)}
 className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 transition-colors">
 Delete
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </motion.div>
 )}
 </div>
 </div>
 );
};

export default MyAnimals;
