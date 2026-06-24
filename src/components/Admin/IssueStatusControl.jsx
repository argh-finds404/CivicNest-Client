import React from'react';
import toast from'react-hot-toast';
import useAxiosSecure from'../../hooks/useAxiosSecure';

const IssueStatusControl = ({ issueId, currentStatus, onStatusChange }) => {
 const axiosSecure = useAxiosSecure();

 const handleStatusChange = async (e) => {
 const newStatus = e.target.value;
 try {
 await axiosSecure.patch(`/admin/issues/${issueId}/status`, { status: newStatus });
 toast.success(`Status updated to ${newStatus}`);
 if (onStatusChange) onStatusChange(newStatus);
 } catch (error) {
 toast.error(error.message);
 }
 };

 return (
 <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] p-2 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <i className="ri-shield-user-fill text-slate-400"></i>
 <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">Admin Control:</span>
 <select 
 value={currentStatus} 
 onChange={handleStatusChange}
 className="select select-sm select-bordered focus:border-[#028090] focus:ring-[#028090]">
 <option value="pending">Pending</option>
 <option value="in_review">In Review</option>
 <option value="action_taken">Action Taken</option>
 <option value="solved">Solved</option>
 </select>
 </div>
 );
};

export default IssueStatusControl;
