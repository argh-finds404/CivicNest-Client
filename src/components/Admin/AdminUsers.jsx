import React, { useState, useEffect } from'react';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import MinimalLoader from'../common/MinimalLoader';
import Swal from'sweetalert2';

const AdminUsers = () => {
 const [users, setUsers] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const axiosSecure = useAxiosSecure();

 const fetchUsers = async () => {
 setIsLoading(true);
 try {
 const res = await axiosSecure.get('/admin/users');
 setUsers(res.data);
 } catch (error) {
 console.error("Failed to fetch users", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchUsers();
 }, []);

 const handleRoleChange = async (id, newRole) => {
 try {
 await axiosSecure.patch(`/admin/users/${id}/role`, { role: newRole });
 Swal.fire({
 icon:'success',
 title:'Role Updated',
 text:'User role has been successfully changed.',
 timer: 1500,
 showConfirmButton: false
 });
 fetchUsers();
 } catch (error) {
 console.error("Failed to update role", error);
 Swal.fire({
 icon:'error',
 title:'Update Failed',
 text:'Could not update user role.'});
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
 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-500/30 border border-blue-400">
 <i className="ri-team-line text-3xl tracking-tight drop-shadow-md"></i>
 </div>
 <div>
 <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-black text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>User Management</h1>
 <p className="text-[13px] md:text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1">Manage user roles and accounts across the platform.</p>
 </div>
 </div>
 
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-500 dark:text-slate-300 text-[13px] uppercase tracking-wider">
 <th className="py-4 px-6">User</th>
 <th className="py-4 px-6">Email</th>
 <th className="py-4 px-6">Current Role</th>
 <th className="py-4 px-6 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {users.map(user => (
 <tr key={user._id} className="hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors">
 <td className="py-4 px-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-[#40826D]/10 text-[#40826D] flex items-center justify-center font-bold">
 {user.photoURL ? (
 <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover"/>
 ) : (
 user.name?.charAt(0).toUpperCase() ||'U')}
 </div>
 <div>
 <p className="font-bold text-slate-800 dark:text-white">{user.name ||'Anonymous User'}</p>
 <p className="text-xs text-slate-500 dark:text-slate-300">Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
 </div>
 </div>
 </td>
 <td className="py-4 px-6 text-[13px] text-slate-600 dark:text-slate-300">{user.email}</td>
 <td className="py-4 px-6">
 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
 user.role ==='admin'?'bg-red-50 text-red-600 border border-red-200':
 user.role ==='member'?'bg-[#40826D]/10 text-[#40826D] border border-[#40826D]/20':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]'}`}>
 {user.role ||'guest'}
 </span>
 </td>
 <td className="py-4 px-6 text-right">
 <select 
 value={user.role ||'guest'}
 onChange={(e) => handleRoleChange(user._id, e.target.value)}
 className="select select-sm bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#40826D]"disabled={user.role ==='admin'}
 >
 <option value="guest">Guest</option>
 <option value="member">Member</option>
 <option value="admin">Admin</option>
 </select>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};

export default AdminUsers;
