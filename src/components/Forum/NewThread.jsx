import React, { useState } from'react';
import { useNavigate, Link } from'react-router';
import { useQuery } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';
import MinimalLoader from'../common/MinimalLoader';
import CreditIndicator from'../common/CreditIndicator';
import { useAuth } from'../../hooks/useAuth';
import BackButton from'../common/BackButton';

const CATEGORIES = ['General','Safety','Suggestions','Events','Off-Topic'];

const NewThread = () => {
 const { user } = useAuth();
 const [formData, setFormData] = useState({
 title:'',
 body:'',
 category:'General'});
 const [isSubmitting, setIsSubmitting] = useState(false);
 
 const axiosSecure = useAxiosSecure();
 const navigate = useNavigate();

 const { data: creditData } = useQuery({
 queryKey: ['credits','forum'],
 queryFn: () => axiosSecure.get('/credits/forum').then(r => r.data),
 staleTime: 30000,
 enabled: !!user?.email,
 });
 const credits = creditData?.remaining;

 const handleChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.title.trim() || !formData.body.trim()) return;

 setIsSubmitting(true);
 try {
 const res = await axiosSecure.post('/forum', formData);
 if (res.data._id) {
 toast.success('Your discussion thread has been posted successfully.');
 navigate(`/forum/${res.data._id}`);
 } else if (res.data.insertedId) {
 toast.success('Your discussion thread has been posted successfully.');
 navigate(`/forum/${res.data.insertedId}`);
 }
 } catch (error) {
 console.error("Failed to create thread", error);
 toast.error(error.response?.data?.message ||'Failed to create thread. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="min-h-screen dark:bg-[#0b1215] pt-24 pb-12 px-4 md:px-8">
 <div className="max-w-3xl mx-auto">
 <BackButton variant="dark"className="mb-6">
 <span>Back to Forum</span>
 </BackButton>
 
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4 md:p-10">
 <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
 <div>
 <h1 className="text-3xl tracking-tight font-black text-gray-900 dark:text-white mb-2 tracking-tight"style={{ fontFamily:'HKGrotesk, sans-serif'}}>Create New Thread</h1>
 <p className="text-gray-500 dark:text-slate-300 text-[13px]">Start a new discussion with the community.</p>
 </div>
 <CreditIndicator postType="forum"/>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-[13px] font-bold text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">Thread Title <span className="text-red-500">*</span></label>
 <input 
 type="text"name="title"value={formData.title}
 onChange={handleChange}
 placeholder="What's on your mind?"className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-gray-900 dark:text-white font-medium"required
 />
 </div>

 <div>
 <label className="block text-[13px] font-bold text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">Category <span className="text-red-500">*</span></label>
 <div className="flex flex-wrap gap-2">
 {CATEGORIES.map(cat => (
 <button key={cat} type="button"onClick={() => setFormData({ ...formData, category: cat })}
 className={`px-4 py-2 rounded-full text-[13px] font-semibold border-2 transition-all
 ${formData.category === cat
 ?'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400':'border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] text-gray-500 dark:text-slate-300 hover:border-gray-300 dark:border-[#1e3040] dark:border-[#1e3040] dark:hover:border-gray-600'}`}>
 {cat}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-[13px] font-bold text-gray-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2">Body <span className="text-red-500">*</span></label>
 <textarea 
 name="body"value={formData.body}
 onChange={handleChange}
 placeholder="Describe in detail..."rows="8"className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all resize-y text-gray-900 dark:text-white leading-relaxed"required
 ></textarea>
 </div>

 <div className="pt-4 border-t border-gray-100 flex justify-end gap-4 mt-8">
 <button 
 type="button"onClick={() => navigate('/forum')}
 className="px-6 py-2.5 rounded-full font-bold text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
 Cancel
 </button>
 <button 
 type="submit"disabled={isSubmitting || credits === 0 || !formData.title.trim() || !formData.body.trim()}
 className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
 {isSubmitting ? (
 <><MinimalLoader size="sm"color="#ffffff"/> Posting...</>
 ) : credits === 0 ? (
 <>Out of Credits</>
 ) : (
 <>Post Thread <i className="ri-arrow-right-line"></i></>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
};

export default NewThread;
