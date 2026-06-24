import React, { useState } from'react';
import toast from'react-hot-toast';
import MinimalLoader from'../common/MinimalLoader.jsx';
import useAxiosSecure from'../../hooks/useAxiosSecure';

const CommentBox = ({ issueId, onCommentAdded, parentCommentId = null, autoFocus = false, onCancel = null }) => {
 const [comment, setComment] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const axiosSecure = useAxiosSecure();

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!comment.trim()) return;

 setIsSubmitting(true);
 try {
 const res = await axiosSecure.post(`/issues/${issueId}/comments`, {
 body: comment,
 ...(parentCommentId && { parentCommentId })
 });
 const data = res.data;
 toast.success(parentCommentId ?"Reply posted successfully!":"Comment posted successfully!", {
 style: {
 padding:'16px 24px',
 fontSize:'1.1rem',
 fontWeight:'600',
 borderRadius:'16px',
 boxShadow:'0 10px 25px -5px rgba(64, 130, 109, 0.2)'},
 iconTheme: {
 primary:'#40826D',
 secondary:'#fff',
 },
 });
 setComment("");
 if (onCommentAdded) onCommentAdded(data);
 } catch (error) {
 console.error(error.response?.data);
 const errMsg = error.response?.data?.error || error.message;
 toast.error(`Error: ${errMsg}`);
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="mt-6">
 <div className="flex gap-4 items-start">
 <div className="avatar mt-1 flex-shrink-0">
 <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 dark:text-slate-300 shadow-inner">
 <i className="ri-user-line text-[13px]"></i>
 </div>
 </div>
 <div className="flex-grow flex flex-col gap-3">
 <textarea 
 className="w-full min-h-[80px] px-4 py-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg text-slate-800 dark:text-white focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:outline-none focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] transition-all resize-y"placeholder={parentCommentId ?"Write a reply...":"Add a comment... Be respectful and constructive."}
 value={comment}
 onChange={e => setComment(e.target.value)}
 maxLength={1000}
 autoFocus={autoFocus}
 ></textarea>
 <div className="flex justify-between items-center">
 <span className="text-xs text-slate-400">{comment.length}/1000 characters</span>
 <div className="flex gap-2">
 {onCancel && (
 <button 
 type="button"onClick={onCancel}
 className="btn btn-sm btn-ghost text-slate-500 dark:text-slate-300">
 Cancel
 </button>
 )}
 <button 
 type="submit"className="btn btn-sm bg-[#40826D] hover:bg-[#326756] text-white border-none"disabled={isSubmitting || !comment.trim()}
 >
 {isSubmitting ? <MinimalLoader /> : parentCommentId ?"Reply":"Post Comment"}
 </button>
 </div>
 </div>
 </div>
 </div>
 </form>
 );
};

export default CommentBox;
