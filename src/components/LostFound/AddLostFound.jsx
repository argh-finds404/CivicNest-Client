import React, { useState, useEffect } from"react";
import { useNavigate, useSearchParams } from"react-router";
import { motion } from"framer-motion";
import { useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { useAuth } from"../../hooks/useAuth";
import CreditIndicator from"../common/CreditIndicator";
import BackButton from"../common/BackButton";
import toast from'react-hot-toast';
import { 
 Cat, 
 Smartphone, 
 FileText, 
 Key, 
 Shirt, 
 Package,
 Calendar,
 MapPin,
 Image as ImageIcon,
 Coins,
 Search,
 Gift,
 Upload,
 X
} from"lucide-react";

const CATEGORY_GRID = [
 { value:'pets', icon: Cat, label:'Pets'},
 { value:'electronics', icon: Smartphone, label:'Electronics'},
 { value:'documents', icon: FileText, label:'Documents'},
 { value:'keys', icon: Key, label:'Keys'},
 { value:'clothing', icon: Shirt, label:'Clothing'},
 { value:'other', icon: Package, label:'Other'},
];

export default function AddLostFound() {
 const navigate = useNavigate();
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const [searchParams, setSearchParams] = useSearchParams();
 const [loading, setLoading] = useState(false);

 const initialType = searchParams.get('type') ==='found'?'found':'lost';
 const [type, setType] = useState(initialType);
 const [uploadedImages, setUploadedImages] = useState([]);

 const { data: creditData } = useQuery({
 queryKey: ['credits','lostFound'],
 queryFn: () => axiosSecure.get('/credits/lostFound').then(r => r.data),
 staleTime: 30000,
 enabled: !!user?.email,
 });
 const credits = creditData?.remaining;

 const [formData, setFormData] = useState({
 category:"pets",
 itemName:"",
 description:"",
 location:"",
 dateLostFound:"",
 image:"",
 reward: 0,
 contactInfo: user?.email ||"",
 });

 useEffect(() => {
 setSearchParams({ type: type });
 }, [type, setSearchParams]);

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 let uploadedImageUrl = uploadedImages[0]?.url || "";

 // Set expiration date (30 days from now)
 const expiresAt = new Date();
 expiresAt.setDate(expiresAt.getDate() + 30);
 
 const payload = {
 ...formData,
 type: type,
 image: uploadedImageUrl,
 reward: type ==='lost'? parseFloat(formData.reward) || 0 : 0,
 expiresAt,
 status:'open',
 notifiedExpiry: false
 };

 await axiosSecure.post("/lost-found", payload);
 toast.success(type ==='lost'?"Lost item reported successfully!":"Found item reported successfully!");
 navigate(`/lost-found?type=${type}`);
 } catch (error) {
 console.error("Failed to post lost/found item", error);
 toast.error("Failed to submit. Please try again.");
 } finally {
 setLoading(false);
 }
 };

 const isLost = type ==='lost';
 const themeAccent = isLost ?'rose':'emerald';
 
 const bannerGradient = isLost
 ?'bg-gradient-to-br from-rose-950 via-rose-900 to-slate-900':'bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900';

 const themeBtnActive = isLost
 ?'border-rose-500 bg-rose-50 text-rose-700':'border-emerald-600 bg-emerald-50 text-emerald-700';

 const submitBtnColor = isLost
 ?'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20':'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20';

 return (
 <div className="min-h-screen bg-[#F8FAFC]">
 {/* Banner Section */}
 <div className={`relative pt-28 pb-12 px-[5%] ${bannerGradient} overflow-hidden transition-all duration-500`}>
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full blur-3xl"></div>
 <div className="absolute bottom-10 right-10 w-96 h-96 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full blur-3xl"></div>
 </div>

 <div className="relative z-10 max-w-7xl mx-auto">
 <div className="mb-4">
 <BackButton variant="light"/>
 </div>

 <div className="text-white">
 <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 ${isLost ?'text-rose-300':'text-emerald-300'}`}>
 <span className={`w-2 h-2 rounded-full animate-pulse ${isLost ?'bg-rose-400':'bg-emerald-400'}`}></span>
 <span className="text-xs font-bold uppercase tracking-widest">
 {isLost ?'Report Lost Item':'Report Found Item'}
 </span>
 </div>
 <h1 className="font-heading text-4xl tracking-tight md:text-5xl tracking-tight font-extrabold mb-4 leading-tight tracking-tight">
 {isLost ?'Help Me Find It':'Help Reunite This Item'}
 </h1>
 <p className="font-body text-white/80 text-[13px] max-w-2xl">
 {isLost 
 ?'Report lost items to get community assistance finding them.':'Found something? Help reunite it with its owner by reporting it here.'}
 </p>
 </div>
 </div>
 </div>

 {/* Form Section */}
 <div className="px-[5%] py-8">
 <div className="max-w-3xl mx-auto">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden">
 <form onSubmit={handleSubmit} className="p-5 space-y-8">
 <div className="flex justify-between items-center pb-4 border-b border-slate-100 flex-wrap gap-4">
 <h2 className="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">Item Details</h2>
 <CreditIndicator postType="lostFound"/>
 </div>

 {/* Fix 1: Visual Type Selector */}
 <div className="space-y-3">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Listing Type</label>
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"onClick={() => setType('lost')}
 className={`py-4 rounded-xl font-bold text-[13px] border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
 isLost ? themeBtnActive :'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-400 hover:border-slate-350 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]'}`}
 >
 <Search className="w-4 h-4 shrink-0"/>
 <span>😟 I Lost This</span>
 </button>
 <button
 type="button"onClick={() => setType('found')}
 className={`py-4 rounded-xl font-bold text-[13px] border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
 !isLost ? themeBtnActive :'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-400 hover:border-slate-350 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]'}`}
 >
 <Gift className="w-4 h-4 shrink-0"/>
 <span>🎁 I Found This</span>
 </button>
 </div>
 </div>

 {/* Category Grid */}
 <div className="space-y-3">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Category</label>
 <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
 {CATEGORY_GRID.map(category => {
 const IconComponent = category.icon;
 const isSelected = formData.category === category.value;
 const catAccentBorder = isSelected 
 ? (isLost ?'border-rose-500 bg-rose-50 text-rose-700':'border-emerald-600 bg-emerald-50 text-emerald-700')
 :'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-500 dark:text-slate-300 hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]';
 
 return (
 <button
 key={category.value}
 type="button"onClick={() => setFormData({ ...formData, category: category.value })}
 className={`flex flex-col items-center gap-2 py-3.5 rounded-xl border-2 transition-all cursor-pointer ${catAccentBorder}`}
 >
 <IconComponent className="w-5 h-5 shrink-0"/>
 <span className="text-xs font-bold">{category.label}</span>
 </button>
 );
 })}
 </div>
 </div>

 {/* Item Name */}
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Item Name *</label>
 <input 
 type="text"name="itemName"required
 value={formData.itemName} 
 onChange={handleChange}
 placeholder="e.g. Golden Retriever, iPhone 13, Black Wallet..."className={`w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-${themeAccent}-300 focus:ring-1 focus:ring-${themeAccent}-300/50`}
 />
 </div>

 {/* Description */}
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Description *</label>
 <textarea 
 name="description"required
 rows="4"value={formData.description} 
 onChange={handleChange}
 placeholder="Provide distinct features, color, brand, or any helpful details..."className={`w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none transition-all resize-none font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-${themeAccent}-300 focus:ring-1 focus:ring-${themeAccent}-300/50`}
 ></textarea>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Location */}
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5 text-slate-400"/> Location *
 </label>
 <input 
 type="text"name="location"required
 value={formData.location} 
 onChange={handleChange}
 placeholder="e.g. Central Park near the fountain"className={`w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-${themeAccent}-300 focus:ring-1 focus:ring-${themeAccent}-300/50`}
 />
 </div>

 {/* Date */}
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center gap-1">
 <Calendar className="w-3.5 h-3.5 text-slate-400"/> Date *
 </label>
 <input 
 type="date"name="dateLostFound"required
 value={formData.dateLostFound} 
 onChange={handleChange}
 className={`w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-${themeAccent}-300 focus:ring-1 focus:ring-${themeAccent}-300/50`}
 />
 </div>
 </div>

 {/* Reward - only for lost items */}
 {isLost && (
 <div className="space-y-2">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center gap-1">
 <Coins className="w-3.5 h-3.5 text-slate-400"/> Cash Reward (Optional)
 </label>
 <input 
 type="number"name="reward"value={formData.reward} 
 onChange={handleChange}
 placeholder="0"min="0"className={`w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-${themeAccent}-300 focus:ring-1 focus:ring-${themeAccent}-300/50`}
 />
 <p className="text-xs text-slate-450 font-medium">Offer a reward to encourage people to help find your item.</p>
 </div>
 )}

 {/* Item Photo Upload */}
 <div className="pt-2">
 <PremiumImageUploader 
   label="Item Photo (Optional)"
   maxCount={1}
   onUploadComplete={(url, id) => setUploadedImages([{ url, id }])}
   onRemove={() => setUploadedImages([])}
 />
 </div>

 <div className="pt-4 flex justify-end gap-4">
 <button
 type="button"onClick={() => navigate("/lost-found")}
 className="px-6 py-3 font-bold text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] transition-colors cursor-pointer">
 Cancel
 </button>
 <button
 type="submit"disabled={loading || credits === 0}
 className={`${submitBtnColor} text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer`}
 >
 {loading ?"Submitting...": credits === 0 ?"Out of Credits":"Post Listing"}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 </div>
 </div>
 );
}
