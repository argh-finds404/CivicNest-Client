import React, { useMemo } from'react';
import CommentItem from'./CommentItem';

const CommentList = ({ comments, issue, onCommentUpdated, onCommentAdded, onCommentDeleted }) => {
 // Build a tree of comments
 const commentTree = useMemo(() => {
 const map = {};
 const roots = [];

 // Initialize map
 comments.forEach(c => {
 map[c._id] = { comment: c, children: [], _id: c._id };
 });

 // Populate children
 comments.forEach(c => {
 if (c.parentCommentId && map[c.parentCommentId]) {
 map[c.parentCommentId].children.push(map[c._id]);
 } else {
 roots.push(map[c._id]);
 }
 });

 return roots;
 }, [comments]);

 if (comments.length === 0) {
 return (
 <div className="text-center py-12 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] border-dashed">
 <i className="ri-message-3-line text-4xl tracking-tight text-slate-300 mb-2 block"></i>
 <p className="text-slate-500 dark:text-slate-300 font-medium">No comments yet. Be the first to start the discussion!</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 md:space-y-8">
 {commentTree.map(root => (
 <CommentItem 
 key={root._id}
 comment={root.comment}
 childrenComments={root.children}
 issue={issue}
 onCommentUpdated={onCommentUpdated}
 onCommentAdded={onCommentAdded}
 onCommentDeleted={onCommentDeleted}
 />
 ))}
 </div>
 );
};

export default CommentList;
