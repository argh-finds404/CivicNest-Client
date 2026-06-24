import React, { useState, useEffect, useRef, useMemo } from'react';
import { useTheme } from'../../hooks/useTheme';
import { useForm, Controller } from'react-hook-form';
import toast from'react-hot-toast';
import { useNavigate, useParams } from'react-router';
import { useQuery } from'@tanstack/react-query';
import { useAuth } from'../../hooks/useAuth';
import { useRole } from'../../hooks/useRole';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import BackButton from'../common/BackButton';

// Map
import { MapContainer, TileLayer, Marker, useMapEvents } from"react-leaflet";
import L from"leaflet";
import"leaflet/dist/leaflet.css";

// Icons
import { MapPin, X, Send, EyeOff, ShieldCheck, HandCoins, ImagePlus, Calendar, AlertCircle } from 'lucide-react';
import PremiumDropdown from'../common/PremiumDropdown';
import PremiumImageUploader from '../common/PremiumImageUploader';

// Fix Leaflet icons
import iconRetinaUrl from'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from'leaflet/dist/images/marker-icon.png';
import shadowUrl from'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl,
 iconUrl,
 shadowUrl,
});

// Custom Clean Toggle Component
const CustomToggle = ({ checked, onChange, disabled, activeColor ="bg-[#40826D]", icon }) => (
 <button 
 type="button"disabled={disabled}
 onClick={() => onChange(!checked)}
 className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#9FE2BF]/50 focus:ring-offset-2 ${checked ? activeColor :'bg-slate-200'} ${disabled ?'opacity-50 cursor-not-allowed':''}`}
 >
 <span className={`pointer-events-none relative flex items-center justify-center h-6 w-6 transform rounded-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow transition-transform duration-300 ease-in-out ${checked ?'translate-x-5':'translate-x-0'}`}>
 {icon && checked && (
 <span className="absolute inset-0 flex items-center justify-center animate-in zoom-in-50 fade-in duration-200">
 {icon}
 </span>
 )}
 </span>
 </button>
);

function MapPicker({ position, setPosition, setValue }) {
 const markerRef = useRef(null);
 const [hasUserInteracted, setHasUserInteracted] = useState(false);

 const fetchAddress = async (lat, lng) => {
 try {
 const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&email=cleancommunity@example.com`);
 const data = await res.json();
 if (data && data.display_name) {
 setValue("location", data.display_name, { shouldValidate: true });
 toast.success("Location auto-filled from map!", { id:'geocode'});
 }
 } catch (err) {
 console.error("Geocoding failed", err);
 }
 };

 const map = useMapEvents({
 click(e) {
 setHasUserInteracted(true);
 const lat = e.latlng.lat;
 const lng = e.latlng.lng;
 setPosition([lat, lng]);
 fetchAddress(lat, lng);
 map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 0.8 });
 },
 });

 useEffect(() => {
 if (position && position[0] !== 0) {
 map.flyTo(position, 15, { animate: true, duration: 0.8 });
 }
 }, [position, map]);

 const eventHandlers = useMemo(
 () => ({
 dragend() {
 const marker = markerRef.current;
 if (marker != null) {
 const latLng = marker.getLatLng();
 setHasUserInteracted(true);
 setPosition([latLng.lat, latLng.lng]);
 fetchAddress(latLng.lat, latLng.lng);
 map.flyTo([latLng.lat, latLng.lng], map.getZoom(), { animate: true, duration: 0.8 });
 }
 },
 }),
 [setPosition, setValue, map]
 );

 return position === null ? null : (
 <Marker 
 draggable={true}
 eventHandlers={eventHandlers}
 position={position}
 ref={markerRef}
 ></Marker>
 );
}

const CATEGORIES = ["Garbage & Waste","Road Damage","Waterlogging","Illegal Construction","Broken Public Property","Utility Problems","Social Problems","Environmental Issues","Safety & Crime","Community Norms","Custom"];
const WARDS = ["Ward 1","Ward 2","Ward 3","Ward 4","Ward 5","Ward 6"];

const CATEGORY_OPTIONS = CATEGORIES.map(cat => ({ label: cat, value: cat }));
const WARD_OPTIONS = WARDS.map(ward => ({ label: ward, value: ward }));

const EditIssue = () => {
 const navigate = useNavigate();
 const { id } = useParams();
 const { user } = useAuth();
 const [role, isRoleLoading, isVolunteer] = useRole();
 const axiosSecure = useAxiosSecure();
 const { isDark } = useTheme();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [uploadedImages, setUploadedImages] = useState([]);
 const mapCenter = [23.8103, 90.4125];

 const { data: issue, isLoading: isIssueLoading } = useQuery({
 queryKey: ['issue', id],
 queryFn: () => axiosSecure.get(`/issues/${id}`).then(r => r.data),
 enabled: !!id,
 });

 const isPremiumUser = role ==='member'|| role ==='admin'|| isVolunteer;

 const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
 defaultValues: {
 title:"",
 category:"",
 customFlair:"",
 description:"",
 location:"",
 area:"",
 incidentDate:"",
 mapCoordinates: null,
 isAnonymous: false,
 enableCrowdfunding: false,
 goal:"",
 purpose:""}
 });

 const selectedCategory = watch("category");

 useEffect(() => {
 if (issue) {
 reset({
 title: issue.title ||"",
 category: CATEGORIES.includes(issue.category) ? issue.category :"Custom",
 customFlair: CATEGORIES.includes(issue.category) ?"": issue.category,
 description: issue.description ||"",
 location: issue.location ||"",
 area: issue.area ||"",
 incidentDate: issue.incidentDate ? new Date(issue.incidentDate).toISOString().split('T')[0] :"",
 mapCoordinates: issue.coordinates && issue.coordinates.lat ? [issue.coordinates.lat, issue.coordinates.lng] : null,
 isAnonymous: !!issue.isAnonymous,
 enableCrowdfunding: !!issue.crowdfunding?.enabled,
 goal: issue.crowdfunding?.targetAmount ||"",
 purpose: issue.crowdfunding?.purpose ||""});
 if (issue.images) {
 setUploadedImages(issue.images.map((url, idx) => ({ id: `init-${idx}`, url })));
 }
 }
 }, [issue, reset]);

 const onSubmit = async (data) => {
 if (uploadedImages.length === 0) {
 toast.error("Please provide at least one photo as evidence.");
 return;
 }
 setIsSubmitting(true);
 toast.loading("Updating issue report...", { id:"updateIssue"});
 try {
 const finalImageUrls = uploadedImages.map(img => img.url);

 const payload = {
 title: data.title,
 category: data.category ==="Custom"? data.customFlair : data.category,
 description: data.description,
 location: data.location,
 area: data.area ||"General Area",
 incidentDate: data.incidentDate,
 images: finalImageUrls,
 coordinates: data.mapCoordinates ? { lat: data.mapCoordinates[0], lng: data.mapCoordinates[1] } : { lat: null, lng: null },
 isAnonymous: data.isAnonymous,
 crowdfunding: {
 enabled: data.enableCrowdfunding,
 targetAmount: data.enableCrowdfunding ? parseFloat(data.goal) : null,
 purpose: data.enableCrowdfunding ? data.purpose : null
 }
 };

 await axiosSecure.patch(`/issues/${id}`, payload);
 toast.success("Issue updated successfully!", { id:"updateIssue"});
 navigate(`/issues/${id}`);
 } catch (error) {
 console.error("Update Error:", error);
 toast.error(error.response?.data?.error || error.message ||"Failed to update issue. Please try again.", { id:"updateIssue"});
 } finally {
 setIsSubmitting(false);
 }
 };

 if (isIssueLoading) {
 return (
 <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090f0c] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#40826D] mx-auto"></div>
 <p className="text-slate-500 dark:text-slate-300 mt-4 font-semibold">Loading issue details...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090f0c] py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-200">
 <div className="max-w-3xl mx-auto">
 
 {/* Back Button Outside */}
 <div className="mb-6">
 <BackButton variant="dark"/>
 </div>

 {/* Premium Banner Section */}
 <div className="relative rounded-lg overflow-hidden shadow-lg mb-10 group">
 {/* Gradient Overlay for Readability */}
 <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/40 to-transparent z-10"></div>
 
 {/* Content Area */}
 <div className="relative z-20 px-6 pt-12 pb-10 md:pt-14 md:pb-12 md:px-10 text-white">
 
 {/* Badge and Title */}
 <div className="max-w-2xl mt-8">
 <div className="flex items-center gap-3 mb-4">
 <div className="bg-[#9FE2BF]/20 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
 <ShieldCheck className="w-6 h-6 text-[#9FE2BF]"/>
 </div>
 <span className="text-xs font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-emerald-300">
 Civic Reporting Hub
 </span>
 </div>
 
 <h1 className="text-3xl tracking-tight md:text-5xl tracking-tight font-extrabold tracking-tight drop-shadow-md">
 Official Incident Report
 </h1>
 
 <p className="text-slate-200 text-[13px] md:text-[13px] mt-4 max-w-xl leading-relaxed font-medium">
 Submit comprehensive details regarding the civic or infrastructure issue. All reports are verified by municipal authorities and tracked by the community.
 </p>
 
 {/* Feature Tags */}
 <div className="flex flex-wrap gap-3 mt-6">
 <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-md border border-white/20 shadow-sm">
 <AlertCircle className="w-3.5 h-3.5 text-[#9FE2BF]"/> Official Verification
 </div>
 <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-md border border-white/20 shadow-sm">
 <HandCoins className="w-3.5 h-3.5 text-[#9FE2BF]"/> Community Funded
 </div>
 </div>
 </div>
 </div>
 
 {/* Bottom Accent Bar */}
 <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9FE2BF] via-[#40826D] to-slate-900 z-20"></div>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
 
 {/* Section 1: Basic Info */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] space-y-6">
 <h2 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 flex items-center gap-2 tracking-tight">
 <AlertCircle className="w-5 h-5 text-slate-400"/> Basic Details
 </h2>
 
 <div className="space-y-2">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Issue Title <span className="text-red-500">*</span></label>
 <input 
 className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] transition-all outline-none text-slate-800 dark:text-white placeholder-slate-400"placeholder="E.g., Large pothole causing traffic"{...register("title", { 
 required:"Title is required",
 minLength: { value: 10, message:"Minimum 10 characters required"},
 maxLength: { value: 120, message:"Maximum 120 characters allowed"}
 })}
 />
 {errors.title && <p className="text-[13px] text-red-500">{errors.title.message}</p>}
 </div>

 <div className="space-y-2 relative">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Category <span className="text-red-500">*</span></label>
 <Controller
 name="category"control={control}
 rules={{ required:"Please select a category"}}
 render={({ field }) => (
 <PremiumDropdown 
 options={CATEGORY_OPTIONS}
 value={field.value}
 onChange={field.onChange}
 placeholder="Select Category"/>
 )}
 />
 {errors.category && <p className="text-[13px] text-red-500">{errors.category.message}</p>}
 </div>

 {selectedCategory ==="Custom"&& (
 <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Custom Flair (1-7 words) <span className="text-red-500">*</span></label>
 <input 
 placeholder="e.g. Open manhole near bus stop"className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] transition-all outline-none text-slate-800 dark:text-white"{...register("customFlair", { 
 required:"Custom flair is required",
 validate: (v) => {
 const words = v.trim().split(/\s+/).length;
 return (words >= 1 && words <= 7) ||"Custom flair must be 1 to 7 words";
 }
 })}
 />
 {errors.customFlair && <p className="text-[13px] text-red-500">{errors.customFlair.message}</p>}
 </div>
 )}

 <div className="space-y-2">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Description <span className="text-red-500">*</span></label>
 <textarea 
 className="w-full min-h-[160px] p-4 rounded-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] transition-all outline-none resize-y text-slate-800 dark:text-white placeholder-slate-400"placeholder="Provide a detailed description of the problem..."{...register("description", { 
 required:"Description is required",
 minLength: { value: 30, message:"Minimum 30 characters required"},
 maxLength: { value: 2000, message:"Maximum 2000 characters allowed"}
 })}
 />
 {errors.description && <p className="text-[13px] text-red-500">{errors.description.message}</p>}
 </div>
 </div>

 {/* Section 2: Location & Map */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] space-y-6">
 <h2 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 flex items-center gap-2 tracking-tight">
 <MapPin className="w-5 h-5 text-slate-400"/> Location Details
 </h2>
 
 {/* Interactive Map First */}
 <div className="pt-2 pb-2">
 <div className="flex items-center justify-between mb-3">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center gap-2">
 Pinpoint on Map
 </label>
 <div className="flex items-center gap-4">
 <button type="button"onClick={() => {
 if ("geolocation"in navigator) {
 toast.loading("Finding your location...", { id:"gps"});
 navigator.geolocation.getCurrentPosition(
 async (pos) => {
 const lat = pos.coords.latitude;
 const lng = pos.coords.longitude;
 setValue("mapCoordinates", [lat, lng]);
 
 try {
 const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&email=cleancommunity@example.com`);
 const data = await res.json();
 if (data && data.display_name) {
 setValue("location", data.display_name, { shouldValidate: true });
 }
 } catch (err) {
 console.error("Auto-geocoding failed", err);
 }

 toast.success("Location found!", { id:"gps"});
 },
 (err) => {
 let msg ="Could not access GPS.";
 if (err.code === 1) msg ="Location permission denied.";
 else if (err.code === 2) msg ="Location unavailable. Check device settings.";
 else if (err.code === 3) msg ="Location request timed out.";
 toast.error(msg, { id:"gps"});
 },
 { timeout: 15000, maximumAge: 10000 }
 );
 }
 }} className="text-xs text-white bg-[#40826D] hover:bg-[#2c5c4d] px-3 py-1.5 rounded-full shadow-sm font-bold flex items-center gap-1.5 transition-colors">
 <MapPin className="w-3.5 h-3.5"/> Use My Location
 </button>
 {watch("mapCoordinates") && (
 <button type="button"onClick={() => setValue("mapCoordinates", null)} className="text-xs text-red-500 font-medium hover:underline">
 Remove Pin
 </button>
 )}
 </div>
 </div>
 <div className="h-[340px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-inner z-0 relative group">
 <MapContainer center={mapCenter} zoom={13} className="h-full w-full z-0">
 <TileLayer url={isDark ?"https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png":"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}/>
 <Controller
 name="mapCoordinates"control={control}
 render={({ field }) => (
 <MapPicker position={field.value} setPosition={field.onChange} setValue={setValue} />
 )}
 />
 </MapContainer>
 </div>
 {watch("mapCoordinates") ? (
 <p className="text-xs text-[#40826D] mt-3 font-semibold flex items-center gap-1">
 <i className="ri-check-double-line"></i> Location pinned successfully. You can drag the pin to make micro-adjustments.
 </p>
 ) : (
 <p className="text-xs text-slate-500 dark:text-slate-300 mt-3 font-medium">
 Tap the map or use GPS to automatically fill out your specific address below.
 </p>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
 <div className="space-y-2">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Specific Location <span className="text-red-500">*</span></label>
 <input 
 className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] transition-all outline-none text-slate-800 dark:text-white placeholder-slate-400"placeholder="e.g. 123 Main Street, Near Central Park"{...register("location", { required:"Location is required"})}
 />
 {errors.location && <p className="text-[13px] text-red-500">{errors.location.message}</p>}
 </div>

 <div className="space-y-2 relative">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">City / Neighborhood <span className="text-slate-400 font-normal">(Optional)</span></label>
 <input 
 className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] transition-all outline-none text-slate-800 dark:text-white placeholder-slate-400"placeholder="e.g. Downtown, Ward 5, Northside"{...register("area")}
 />
 </div>
 </div>
 </div>

 {/* Section 3: Media & Timing */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] space-y-6">
 <h2 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 flex items-center gap-2 tracking-tight">
 <ImagePlus className="w-5 h-5 text-slate-400"/> Media & Timing
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Date of Incident <span className="text-red-500">*</span></label>
 <div className="relative">
 <input 
 type="date"className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#9FE2BF]/40 focus:border-[#40826D] transition-all outline-none text-slate-800 dark:text-white"{...register("incidentDate", { required:"Date is required"})}
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">Registered Email</label>
 <input 
 type="email"value={user?.email ||""} 
 disabled
 className="w-full h-12 px-4 rounded-lg bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-500 dark:text-slate-300 cursor-not-allowed"/>
 </div>
 </div>

 <div className="space-y-3 pt-2">
          <div className="pt-2">
            <PremiumImageUploader 
              label="Photographic Evidence (Max 5) *"
              maxCount={5}
              initialImages={issue?.images || []}
              onUploadComplete={(url, id) => setUploadedImages(prev => [...prev, { url, id }])}
              onRemove={(id) => setUploadedImages(prev => prev.filter(img => img.id !== id))}
            />
          </div>
        </div>
 </div>

 {/* Section 4: Advanced Options */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] space-y-6">
 <h2 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-4 flex items-center gap-2 tracking-tight">
 <ShieldCheck className="w-5 h-5 text-slate-400"/> Advanced Options
 </h2>
 
 <div className="flex flex-col gap-2">
 
 {/* Anonymity Row */}
 <div className={`p-5 rounded-lg border transition-all duration-500 ${watch("isAnonymous") ?'bg-slate-800 border-slate-700 shadow-md':'bg-transparent border-transparent'}`}>
 <div className="flex items-center justify-between gap-4">
 <div className="space-y-1">
 <label className={`text-[13px] font-bold flex items-center gap-2 transition-colors duration-500 ${watch("isAnonymous") ?'text-white':'text-slate-800 dark:text-white'}`}>
 <EyeOff className={`w-5 h-5 transition-colors duration-500 ${watch("isAnonymous") ?'text-slate-400':'text-slate-400'}`} /> Post Anonymously
 </label>
 <p className={`text-[13px] transition-colors duration-500 ${watch("isAnonymous") ?'text-slate-400':'text-slate-555'}`}>Hide your identity and profile from the public issue board.</p>
 </div>
 <Controller
 name="isAnonymous"control={control}
 render={({ field }) => (
 <CustomToggle 
 checked={field.value} 
 onChange={field.onChange} 
 disabled={!isPremiumUser} 
 activeColor="bg-slate-600"icon={<EyeOff className="w-3.5 h-3.5 text-slate-900 dark:text-white"/>}
 />
 )}
 />
 </div>
 </div>

 <div className="h-px bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] w-full my-2"></div>

 {/* Crowdfunding Row */}
 <div className={`p-5 rounded-lg border transition-all duration-500 ${watch("enableCrowdfunding") ?'bg-[#ecfdf5] border-[#a7f3d0] shadow-md':'bg-transparent border-transparent'}`}>
 <div className="flex items-center justify-between gap-4">
 <div className="space-y-1">
 <label className={`text-[13px] font-bold flex items-center gap-2 transition-colors duration-500 ${watch("enableCrowdfunding") ?'text-[#065f46]':'text-slate-800 dark:text-white'}`}>
 <HandCoins className={`w-5 h-5 transition-colors duration-500 ${watch("enableCrowdfunding") ?'text-[#10b981]':'text-slate-450'}`} /> Enable Community Funding
 </label>
 <p className={`text-[13px] transition-colors duration-500 ${watch("enableCrowdfunding") ?'text-[#065f46]/70':'text-slate-500 dark:text-slate-300'}`}>Allow members to contribute funds to fix this issue directly.</p>
 </div>
 <Controller
 name="enableCrowdfunding"control={control}
 render={({ field }) => (
 <CustomToggle 
 checked={field.value} 
 onChange={field.onChange} 
 activeColor="bg-[#10b981]"icon={<HandCoins className="w-3.5 h-3.5 text-[#10b981]"/>}
 />
 )}
 />
 </div>
 
 {watch("enableCrowdfunding") && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 mt-5 border-t border-[#a7f3d0] animate-in fade-in slide-in-from-top-2 duration-500">
 <div className="space-y-2">
 <label className="text-[13px] font-semibold text-[#065f46]">Target Goal (BDT) *</label>
 <input 
 type="number"placeholder="e.g. 5000"className="w-full h-12 px-4 rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-[#a7f3d0] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#10b981]/40 focus:border-[#10b981] transition-all outline-none text-slate-800 dark:text-white"{...register("goal", { 
 required:"Goal is required", 
 min: { value: 100, message:"Minimum 100 BDT"}, 
 max: { value: 500000, message:"Maximum 500,000 BDT"} 
 })}
 />
 {errors.goal && <p className="text-[13px] text-red-500">{errors.goal.message}</p>}
 </div>
 <div className="space-y-2">
 <label className="text-[13px] font-semibold text-[#065f46]">Purpose *</label>
 <input 
 placeholder="e.g. Material and labor costs"className="w-full h-12 px-4 rounded-lg bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-[#a7f3d0] focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] focus:ring-2 focus:ring-[#10b981]/40 focus:border-[#10b981] transition-all outline-none text-slate-800 dark:text-white"{...register("purpose", { required:"Purpose is required"})}
 />
 {errors.purpose && <p className="text-[13px] text-red-500">{errors.purpose.message}</p>}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="pt-4">
 <button 
 type="submit"className={`w-full h-14 flex items-center justify-center rounded-xl text-[13px] font-bold text-white transition-all shadow-md ${isSubmitting ?'bg-slate-400 cursor-not-allowed':'bg-[#40826D] hover:bg-[#326756] hover:shadow-lg hover:-translate-y-0.5'}`}
 disabled={isSubmitting}
 >
 {isSubmitting ? (
 <>Processing...</>
 ) : (
 <><Send className="w-5 h-5 mr-2"/> Update Issue Report</>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default EditIssue;
