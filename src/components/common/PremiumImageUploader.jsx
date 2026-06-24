import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('Only JPEG, PNG, and WebP images are allowed.');
    return false;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    toast.error(`Image must be under ${MAX_SIZE_MB}MB. Yours is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
    return false;
  }
  return true;
};

function PremiumImageUploader({ onUploadComplete, onRemove, label = 'Upload Image', maxCount = 1, initialImages = [] }) {
  const [images, setImages] = useState(() => 
    initialImages.map((url, idx) => ({ id: `init-${idx}`, url, progress: 100, preview: url, name: `Existing Image ${idx + 1}`, size: 0 }))
  ); // [{ url, deleteHash, progress, preview, name, size, id }]
  const cancelRefs = useRef({});

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, maxCount - images.length);
    files.forEach(uploadFile);
    e.target.value = ''; // reset input so same file can be re-selected
  };

  const uploadFile = async (file) => {
    if (!validateFile(file)) return;

    const id = Date.now() + Math.random();
    const preview = URL.createObjectURL(file);

    // Add placeholder immediately
    setImages(prev => [...prev, { id, preview, name: file.name, size: file.size, progress: 0, url: null }]);

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    cancelRefs.current[id] = source;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        formData,
        {
          cancelToken: source.token,
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded / e.total) * 100);
            setImages(prev => prev.map(img =>
              img.id === id ? { ...img, progress: pct } : img
            ));
          },
        }
      );

      const { url, delete_hash } = res.data.data;
      setImages(prev => prev.map(img =>
        img.id === id ? { ...img, url, deleteHash: delete_hash, progress: 100 } : img
      ));
      onUploadComplete?.(url, id);

    } catch (err) {
      if (!axios.isCancel(err)) {
        setImages(prev => prev.filter(img => img.id !== id));
        toast.error('Upload failed. Please try again.');
      }
    } finally {
      URL.revokeObjectURL(preview); // free memory
      delete cancelRefs.current[id];
    }
  };

  const handleRemove = async (img) => {
    cancelRefs.current[img.id]?.cancel();
    if (img.deleteHash) {
      fetch(`https://api.imgbb.com/1/image/${img.deleteHash}?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
        method: 'DELETE'
      }).catch(() => {});
    }
    setImages(prev => prev.filter(i => i.id !== img.id));
    onRemove?.(img.id);
  };

  useEffect(() => {
    return () => {
      Object.values(cancelRefs.current).forEach(s => s.cancel('unmounted'));
    };
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1]">{label}</label>

      {/* Upload trigger */}
      {images.length < maxCount && (
        <label className="
          flex flex-col items-center justify-center
          w-full h-32 rounded-2xl
          border-2 border-dashed border-slate-300 dark:border-[#1e3040]
          hover:border-[#40826D] dark:hover:border-[#40826D]
          cursor-pointer transition-colors
          bg-slate-50 dark:bg-[#0b1215]
        ">
          <i className="ri-upload-cloud-2-line text-3xl text-slate-400" />
          <span className="text-xs font-medium text-slate-500 mt-1">Click or drag to upload</span>
          <span className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">JPEG, PNG, WebP · max 5MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp"
                 multiple={maxCount > 1} onChange={handleFileChange}
                 className="hidden" />
        </label>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map(img => (
            <div key={img.id} className="relative rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm group">

              <img src={img.preview || img.url} alt={img.name}
                   className="w-full h-full object-cover" />

              {/* Progress overlay */}
              {img.progress < 100 && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#40826D" strokeWidth="3"
                            strokeDasharray={`${img.progress * 0.942} 100`}
                            strokeLinecap="round" className="transition-all duration-300" />
                  </svg>
                  <span className="text-white text-xs font-bold mt-2 drop-shadow-md">{img.progress}%</span>
                </div>
              )}

              {/* Success tick */}
              {img.progress === 100 && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-[#40826D] rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                  <i className="ri-check-line text-white text-sm" />
                </div>
              )}

              {/* File size */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent pt-6 pb-2 px-3">
                <span className="text-white/90 text-[11px] font-bold tracking-wide">
                  {(img.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>

              {/* Remove */}
              <button onClick={() => handleRemove(img)} type="button"
                      className="absolute top-2 right-2 w-7 h-7 bg-slate-900/60 hover:bg-rose-500 rounded-full flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 backdrop-blur-md">
                <i className="ri-close-line text-white text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PremiumImageUploader;
