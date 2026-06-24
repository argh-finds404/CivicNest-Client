import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import MinimalLoader from '../common/MinimalLoader';
import { motion } from 'framer-motion';
import { Image as ImageIcon, MapPin, Tag, Type, Upload, X, Trash2, PlusCircle } from 'lucide-react';

const CATEGORIES = ["Garbage & Waste","Road Damage","Waterlogging","Illegal Construction","Broken Public Property","Utility Problems","Social Problems","Environmental Issues","Safety & Crime","Community Norms","Custom"];
const AREAS = ["Mirpur","Uttara","Dhanmondi","Gulshan","Badda","Mohammadpur","Motijheel"];

export default function AdminGallery() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    category: CATEGORIES[0],
    area: AREAS[0],
    location: ""
  });
  
  const [beforeFile, setBeforeFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterFile, setAfterFile] = useState(null);
  const [afterPreview, setAfterPreview] = useState("");
  
  const { data: galleryItems = [], isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => {
      const res = await axiosSecure.get('/gallery?limit=100');
      return res.data?.issues || [];
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => axiosSecure.delete(`/gallery/${id}`),
    onSuccess: () => {
      toast.success('Custom story deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
    },
    onError: () => toast.error('Failed to delete story.')
  });
  
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this story?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      confirmButtonColor: "#dc2626",
    });
    
    if (result.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'before') {
        setBeforeFile(file);
        setBeforePreview(URL.createObjectURL(file));
      } else {
        setAfterFile(file);
        setAfterPreview(URL.createObjectURL(file));
      }
    }
  };
  
  const removeFile = (type) => {
    if (type === 'before') {
      setBeforeFile(null);
      setBeforePreview("");
    } else {
      setAfterFile(null);
      setAfterPreview("");
    }
  };
  
  const uploadToImgbb = async (file) => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    const data = new FormData();
    data.append("image", file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: data,
    });
    const resJson = await res.json();
    if (resJson.success) {
      return resJson.data.display_url || resJson.data.url;
    } else {
      throw new Error("Failed to upload image.");
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!beforeFile || !afterFile) {
      return toast.error("Both Before and After images are required.");
    }
    
    setIsUploading(true);
    try {
      const beforeUrl = await uploadToImgbb(beforeFile);
      const afterUrl = await uploadToImgbb(afterFile);
      
      const payload = {
        ...formData,
        beforeImage: beforeUrl,
        afterImage: afterUrl
      };
      
      await axiosSecure.post("/gallery", payload);
      toast.success("Success story added to gallery!");
      
      // Reset form
      setFormData({ title: "", category: CATEGORIES[0], area: AREAS[0], location: "" });
      removeFile('before');
      removeFile('after');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload story.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="mb-8">
        <h1 className="text-3xl tracking-tight font-black text-slate-800 dark:text-white mb-2">Manage Community Gallery</h1>
        <p className="text-slate-500 dark:text-slate-300">Directly upload success stories or remove custom entries.</p>
      </div>

      {/* Upload Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 dark:border-[#1e3040] bg-slate-50 dark:bg-[#0a1410] flex items-center gap-2">
          <PlusCircle className="text-teal-600 dark:text-teal-400 w-5 h-5" />
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Add Custom Success Story</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] flex items-center gap-1">
                <Type className="w-4 h-4 text-slate-400" /> Title *
              </label>
              <input 
                type="text" name="title" required value={formData.title} onChange={handleChange}
                placeholder="e.g., Cleaned up Mirpur Park"
                className="w-full bg-slate-50 dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-teal-300 focus:ring-1 focus:ring-teal-300/50 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" /> Exact Location *
              </label>
              <input 
                type="text" name="location" required value={formData.location} onChange={handleChange}
                placeholder="e.g., Block C, Avenue 4"
                className="w-full bg-slate-50 dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-teal-300 focus:ring-1 focus:ring-teal-300/50 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] flex items-center gap-1">
                <Tag className="w-4 h-4 text-slate-400" /> Category *
              </label>
              <select 
                name="category" required value={formData.category} onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none font-medium text-slate-800 dark:text-white focus:border-teal-300 focus:ring-1 focus:ring-teal-300/50 transition-all"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" /> Area *
              </label>
              <select 
                name="area" required value={formData.area} onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none font-medium text-slate-800 dark:text-white focus:border-teal-300 focus:ring-1 focus:ring-teal-300/50 transition-all"
              >
                {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-[#1e3040]">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-slate-400" /> Before Image *
              </label>
              {beforePreview ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 dark:border-[#1e3040]">
                  <img src={beforePreview} alt="Before" className="w-full h-40 object-cover" />
                  <button type="button" onClick={() => removeFile('before')} className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 dark:border-[#1e3040] border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-[#0a1410] hover:bg-slate-100 dark:hover:bg-[#1e3040] transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                    <Upload className="w-8 h-8 mb-2" />
                    <p className="text-[13px] font-bold">Upload Before Photo</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'before')} required />
                </label>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-slate-400" /> After Image *
              </label>
              {afterPreview ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 dark:border-[#1e3040]">
                  <img src={afterPreview} alt="After" className="w-full h-40 object-cover" />
                  <button type="button" onClick={() => removeFile('after')} className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 dark:border-[#1e3040] border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-[#0a1410] hover:bg-slate-100 dark:hover:bg-[#1e3040] transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                    <Upload className="w-8 h-8 mb-2" />
                    <p className="text-[13px] font-bold">Upload After Photo</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'after')} required />
                </label>
              )}
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isUploading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? "Uploading..." : "Publish to Gallery"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Gallery Items List */}
      <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-[#1e3040] bg-slate-50 dark:bg-[#0a1410]">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Current Gallery Items</h2>
        </div>
        
        {isLoading ? (
          <div className="p-10 flex justify-center"><MinimalLoader /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b1215] border-b border-slate-200 dark:border-[#1e3040]">
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Preview</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Title & Category</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Location</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">Source</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {galleryItems.map(item => (
                  <tr key={item._id} className="border-b border-slate-100 dark:border-[#1e3040] hover:bg-slate-50 dark:hover:bg-[#0b1215] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <img src={item.beforeImage} alt="before" className="w-12 h-12 object-cover rounded-md border border-slate-200 dark:border-[#1e3040]" />
                        <img src={item.afterImage} alt="after" className="w-12 h-12 object-cover rounded-md border border-slate-200 dark:border-[#1e3040]" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-white text-[14px] max-w-[200px] truncate">{item.title}</div>
                      <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">{item.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{item.area}</div>
                      <div className="text-[12px] text-slate-500 dark:text-slate-400 max-w-[150px] truncate">{item.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        item.isCustom ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                      }`}>
                        {item.isCustom ? 'Custom Upload' : 'Solved Issue'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.isCustom ? (
                        <button 
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          title="Delete Custom Story"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">Auto-generated</span>
                      )}
                    </td>
                  </tr>
                ))}
                {galleryItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No gallery stories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
