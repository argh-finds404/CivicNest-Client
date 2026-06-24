import React, { useState, useEffect, useCallback } from'react';
import IssueCard from'../cards/IssueCard';
import { Link } from'react-router';
import'remixicon/fonts/remixicon.css';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import MinimalLoader from'../common/MinimalLoader.jsx';
import BackButton from'../common/BackButton';
import { socket } from'../../hooks/useSocket';

const MyIssues = () => {
 const [issues, setIssues] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 
 const axiosSecure = useAxiosSecure();

 const fetchIssues = useCallback(async (showLoader = false) => {
 if (showLoader) setIsLoading(true);
 try {
 const res = await axiosSecure.get('/issues/my');
 setIssues(res.data);
 } catch (error) {
 console.error(error);
 } finally {
 setIsLoading(false);
 }
 }, [axiosSecure]);

 useEffect(() => {
 fetchIssues(true); // show loader only on initial mount

 const handleUpdate = (data) => {
 fetchIssues(false); // background refresh
 };

 socket.on('issueStatusUpdated', handleUpdate);

 return () => {
 socket.off('issueStatusUpdated', handleUpdate);
 };
 }, [fetchIssues]);

 return (
 <div className="w-full pb-24 pt-8 px-4 md:px-8">
 <div className="max-w-7xl mx-auto">
 {/* Back Button on top */}
 <div className="mb-6">
 <BackButton variant="dark"/>
 </div>

 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
 <div>
 <h2 className="text-3xl tracking-tight font-extrabold bg-gradient-to-r from-teal-800 to-[#1e5844] bg-clip-text text-transparent inline-block tracking-tight">My Reports</h2>
 <p className="text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-medium text-[13px] mt-0.5">Track the status of civic issues you have reported.</p>
 </div>
 <Link to="/issues/add"className="btn bg-[#40826D] hover:bg-[#326756] text-white border-none shadow-md rounded-full px-6">
 <i className="ri-add-line"></i> Report New
 </Link>
 </div>

 {/* Issue Grid */}
 {isLoading ? (
 <div className="flex justify-center items-center py-12">
 <MinimalLoader />
 </div>
 ) : !Array.isArray(issues) ? (
 <div className="text-center py-10 bg-red-50 rounded-xl border border-red-100 max-w-2xl mx-auto shadow-inner">
 <h3 className="text-[13px] tracking-tight font-bold text-red-700 tracking-tight">Unable to load reports</h3>
 <p className="text-red-500 mt-2">There was an error communicating with the server. Please try again later.</p>
 {console.error("API Error: Expected an array, got:", issues)}
 </div>
 ) : issues.length === 0 ? (
 <div className="text-center py-10 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl border border-slate-100 max-w-2xl mx-auto shadow-inner">
 <div className="w-20 h-20 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
 <i className="ri-file-add-line text-3xl tracking-tight text-slate-300"></i>
 </div>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] tracking-tight">No issues reported yet</h3>
 <p className="text-slate-500 dark:text-slate-300 mt-2 mb-6">You haven't reported any civic problems. Help your community by bringing attention to local issues.</p>
 <Link to="/issues/add"className="btn bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-full px-6 shadow-sm">
 Start Reporting
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
 {issues.map(issue => (
 <IssueCard key={issue._id} issue={issue} isOwnerView={true} />
 ))}
 </div>
 )}
 </div>
 </div>
 );
};

export default MyIssues;
