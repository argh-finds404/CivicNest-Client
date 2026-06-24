import React, { useState } from'react';
import { motion } from'framer-motion';
import toast from'react-hot-toast';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import CommentBox from'../forms/CommentBox';
import MinimalLoader from'../common/MinimalLoader.jsx';
import Swal from'sweetalert2';

const CommentItem = ({ comment, childrenComments, issue, onCommentUpdated, onCommentAdded, onCommentDeleted }) => {
 const [isReplying, setIsReplying] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [editBody, setEditBody] = useState(comment.body);
 const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();

 const isAuthor = user && user.uid === comment.userId;
 const isAnonymous = comment.isAnonymousPost && comment.userId === issue.submittedBy?.userId;
 const authorName = isAnonymous ?"Anonymous Poster": comment.userName;
 const hasLiked = user && comment.likes?.includes(user.uid);

 const handleLikeToggle = async () => {
 if (!user) {
 toast.error("Please log in to like comments");
 return;
 }
 
 // Optimistically update
 const action = hasLiked ?'unlike':'like';
 try {
 const res = await axiosSecure.patch(`/comments/${comment._id}/${action}`);
 if (res.data.success) {
 onCommentUpdated({ ...comment, likes: res.data.likes });
 }
 } catch (error) {
 toast.error(error.response?.data?.error ||"Failed to update like");
 }
 };

 const handleEditSubmit = async () => {
 if (!editBody.trim() || editBody === comment.body) {
 setIsEditing(false);
 return;
 }
 setIsSubmittingEdit(true);
 try {
 const res = await axiosSecure.patch(`/comments/${comment._id}`, { body: editBody });
 if (res.data.success) {
 onCommentUpdated({ ...comment, body: editBody, editedAt: res.data.editedAt });
 setIsEditing(false);
 toast.success("Comment updated");
 }
 } catch (error) {
 toast.error(error.response?.data?.error ||"Failed to update comment");
 } finally {
 setIsSubmittingEdit(false);
 }
 };

 const handleDelete = async () => {
 const result = await Swal.fire({
 title:'Delete Comment?',
 text:"This action cannot be undone.",
 icon:'warning',
 showCancelButton: true,
 confirmButtonColor:'#ef4444',
 cancelButtonColor:'#40826D',
 confirmButtonText:'Yes, delete it!',
 customClass: {
 popup:'rounded-xl',
 confirmButton:'rounded-xl px-5 py-2.5 font-bold',
 cancelButton:'rounded-xl px-5 py-2.5 font-bold'}
 });

 if (!result.isConfirmed) return;
 
 setIsDeleting(true);
 try {
 const res = await axiosSecure.delete(`/comments/${comment._id}`);
 if (res.data.success) {
 if (onCommentDeleted) onCommentDeleted(comment._id);
 toast.success("Comment deleted");
 }
 } catch (error) {
 toast.error(error.response?.data?.error ||"Failed to delete comment");
 setIsDeleting(false);
 }
 };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex gap-3 md:gap-4 w-full">
 <div className="avatar mt-1 flex-shrink-0">
 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 dark:text-slate-300 shadow-inner">
 {comment.userAvatar ? <img src={comment.userAvatar} alt="Avatar"className="w-full h-full object-cover rounded-full"/> : <i className="ri-user-line text-[13px] tracking-tight"></i>}
 </div>
 </div>
 
 <div className="flex-grow min-w-0">
 <div className={`bg-[#FDFCFA] p-4 md:p-5 rounded-[24px] rounded-tl-md border ${isEditing ?'border-[#40826D]/50 ring-2 ring-[#40826D]/10':'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]'} shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] relative before:content-[''] before:absolute before:-left-[9px] before:top-4 before:w-4 before:h-4 before:bg-[#FDFCFA] before:border-l before:border-t before:border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] before:rotate-[-45deg] before:rounded-tl-sm z-10 transition-all`}>
 
 <div className="flex justify-between items-center mb-2 md:mb-3">
 <span className="font-bold text-slate-800 dark:text-white text-[14px] md:text-[15px] truncate mr-2">{authorName}</span>
 <div className="flex items-center gap-2 flex-shrink-0">
 {comment.editedAt && <span className="text-[10px] text-slate-400 italic">Edited</span>}
 <span className="text-[10px] md:text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-100 px-2 md:px-3 py-1 rounded-full uppercase tracking-wider">{new Date(comment.createdAt).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12: true })}</span>
 </div>
 </div>
 
 {isEditing ? (
 <div className="mt-2">
 <textarea 
 className="w-full min-h-[80px] px-3 py-2 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl text-slate-800 dark:text-white focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:outline-none focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] resize-y text-[13px] md:text-[13px]"value={editBody}
 onChange={(e) => setEditBody(e.target.value)}
 autoFocus
 />
 <div className="flex justify-end gap-2 mt-2">
 <button onClick={() => { setIsEditing(false); setEditBody(comment.body); }} className="btn btn-xs md:btn-sm btn-ghost text-slate-500 dark:text-slate-300">Cancel</button>
 <button onClick={handleEditSubmit} disabled={isSubmittingEdit} className="btn btn-xs md:btn-sm bg-[#40826D] hover:bg-[#326756] text-white border-none">
 {isSubmittingEdit ? <MinimalLoader /> :'Save'}
 </button>
 </div>
 </div>
 ) : (
 <p className={`text-[14px] md:text-[15px] leading-relaxed relative z-20 break-words ${comment.isDeleted ?'text-slate-400 italic':'text-slate-600 dark:text-slate-300'}`}>
 {comment.body}
 </p>
 )}

 {!comment.isDeleted && !isEditing && (
 <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-4">
 <button 
 onClick={handleLikeToggle}
 className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${hasLiked ?'text-rose-500':'text-slate-400 hover:text-slate-600 dark:text-slate-300'}`}
 >
 <i className={hasLiked ?"ri-heart-3-fill text-[13px] md:text-[13px]":"ri-heart-3-line text-[13px] md:text-[13px]"}></i> 
 {comment.likes?.length || 0}
 </button>
 
 <button 
 onClick={() => setIsReplying(!isReplying)}
 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
 <i className="ri-reply-line text-[13px] md:text-[13px]"></i> Reply
 </button>

 {isAuthor && (
 <div className="flex items-center gap-4 ml-auto">
 <button 
 onClick={() => setIsEditing(true)}
 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#40826D] transition-colors">
 <i className="ri-edit-line text-[13px] md:text-[13px]"></i> Edit
 </button>
 <button 
 onClick={handleDelete}
 disabled={isDeleting}
 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
 {isDeleting ? <MinimalLoader /> : <><i className="ri-delete-bin-line text-[13px] md:text-[13px]"></i> Delete</>}
 </button>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Reply Box */}
 {isReplying && (
 <div className="mt-2 md:mt-3">
 <CommentBox 
 issueId={issue._id} 
 parentCommentId={comment._id} 
 autoFocus={true} 
 onCancel={() => setIsReplying(false)}
 onCommentAdded={(newComment) => {
 setIsReplying(false);
 onCommentAdded(newComment);
 }}
 />
 </div>
 )}

 {/* Nested Comments */}
 {childrenComments && childrenComments.length > 0 && (
 <div className="mt-4 md:mt-6 space-y-4 md:space-y-6 relative before:content-[''] before:absolute before:-left-6 md:before:-left-8 before:top-0 before:bottom-6 before:w-px before:bg-slate-200">
 {childrenComments.map(child => (
 <div key={child._id} className="relative before:content-[''] before:absolute before:-left-6 md:before:-left-8 before:top-6 before:w-4 md:before:w-6 before:h-px before:bg-slate-200">
 <CommentItem 
 comment={child.comment} 
 childrenComments={child.children} 
 issue={issue} 
 onCommentUpdated={onCommentUpdated} 
 onCommentAdded={onCommentAdded} 
 onCommentDeleted={onCommentDeleted}
 />
 </div>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 );
};

export default CommentItem;
