import React, { useState, useEffect } from'react';
import { useTheme } from'../../hooks/useTheme';
import { useForm, Controller } from'react-hook-form';
import { useNavigate, Link } from'react-router';
import { useQuery } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import { useRole } from'../../hooks/useRole';
import toast from'react-hot-toast';
import CreditIndicator from'../common/CreditIndicator';
import BackButton from'../common/BackButton';
import { MapContainer, TileLayer, Marker, useMapEvents } from'react-leaflet';
import'leaflet/dist/leaflet.css';
import L from'leaflet';
import DatePicker from'react-datepicker';
import'react-datepicker/dist/react-datepicker.css';
import TimePicker from'react-time-picker';
import'react-time-picker/dist/TimePicker.css';
import'react-clock/dist/Clock.css';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
 iconUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
 shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks for location selection
function LocationMarker({ position, setPosition }) {
 useMapEvents({
 click(e) {
 setPosition(e.latlng);
 },
 });

 return position === null ? null : (
 <Marker position={position}></Marker>
 );
}

export default function OrganizeEventForm() {
 const { user } = useAuth();
 const [role, isRoleLoading] = useRole();
 const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm({
 defaultValues: { fundingEnabled: false, maxVolunteers: 0 }
 });
 const axiosSecure = useAxiosSecure();
 const navigate = useNavigate();

 const { data: creditData } = useQuery({
 queryKey: ['credits','cleanupEvents'],
 queryFn: () => axiosSecure.get('/credits/cleanupEvents').then(r => r.data),
 staleTime: 30000,
 enabled: !!user?.email,
 });
 const credits = creditData?.remaining;

 const isEligible = role?.toLowerCase() ==='member'|| role?.toLowerCase() ==='admin';

 const [position, setPosition] = useState(null); // { lat, lng }
 const [isSubmitting, setIsSubmitting] = useState(false);
 
 // For tags/arrays
 const [requiredSkills, setRequiredSkills] = useState([]);
 const [suppliesNeeded, setSuppliesNeeded] = useState([]);
 const [skillInput, setSkillInput] = useState('');
 const [supplyInput, setSupplyInput] = useState('');

 // Reverse geocoding when position changes
 useEffect(() => {
 if (position) {
 const fetchAddress = async () => {
 try {
 const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&email=cleancommunity@example.com`);
 const data = await res.json();
 if (data && data.display_name) {
 // Update address field
 setValue('address', data.display_name, { shouldValidate: true });
 // Try to extract a shorter area/ward name
 const areaName = data.address?.suburb || data.address?.city_district || data.address?.village || data.address?.town || data.address?.city ||'';
 if (areaName) {
 setValue('area', areaName, { shouldValidate: true });
 }
 }
 } catch (error) {
 console.error("Reverse geocoding failed:", error);
 }
 };
 // Debounce slightly to prevent spamming if dragged/clicked rapidly
 const timeoutId = setTimeout(fetchAddress, 300);
 return () => clearTimeout(timeoutId);
 }
 }, [position, setValue]);

 const fundingEnabled = watch('fundingEnabled');

 const addTag = (type) => {
 if (type ==='skill'&& skillInput.trim()) {
 setRequiredSkills([...requiredSkills, skillInput.trim()]);
 setSkillInput('');
 } else if (type ==='supply'&& supplyInput.trim()) {
 setSuppliesNeeded([...suppliesNeeded, supplyInput.trim()]);
 setSupplyInput('');
 }
 };

 const removeTag = (type, index) => {
 if (type ==='skill') setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
 if (type ==='supply') setSuppliesNeeded(suppliesNeeded.filter((_, i) => i !== index));
 };

 const onSubmit = async (data) => {
 if (!position) {
 return toast.error("Please select the exact meeting point on the map");
 }

 setIsSubmitting(true);
 try {
 const payload = {
 ...data,
 location: {
 address: data.address,
 area: data.area,
 coordinates: [position.lng, position.lat] // GeoJSON format [lng, lat]
 },
 requiredSkills,
 suppliesNeeded,
 coverImages: [data.coverImage ||'https://images.unsplash.com/photo-1618477461853-cf6ed80f4175?auto=format&fit=crop&q=80&w=1200']
 };

 await axiosSecure.post('/cleanup-events', payload);
 toast.success("Cleanup Event submitted for review!");
 navigate('/cleanup-events'); // redirect back to Cleanup Events page
 } catch (err) {
 toast.error(err.response?.data?.message ||"Failed to create event");
 } finally {
 setIsSubmitting(false);
 }
 };

 const { isDark } = useTheme();

 return (
 <div className="min-h-screen pb-20 pt-10">
 <div className="max-w-4xl mx-auto px-[5%] mb-8">
 {/* Back Button positioned outside banner */}
 <BackButton variant="dark"className="mb-6"/>

 <div className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f2e28] via-[#1a4a42] to-[#0d2a23] shadow-2xl p-10">
 {/* Ambient Glowing Orbs */}
 <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"style={{ animationDuration:'4s'}}></div>
 <div className="absolute -bottom-32 -left-32 w-[300px] h-[300px] bg-emerald-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>

 <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
 <div className="max-w-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 border border-white/20 text-teal-300 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
 <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
 Official Application
 </div>
 <h1 className="text-3xl tracking-tight md:text-5xl tracking-tight text-white font-black tracking-tight leading-tight"style={{ fontFamily:'Inter, sans-serif'}}>
 Organize a <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-200">
 Community Drive
 </span>
 </h1>
 <p className="text-teal-100/80 mt-3 text-[13px] md:text-[13px] font-medium leading-relaxed">
 Step up and lead your neighborhood. Submit a proposal to receive verified status, funding tools, and volunteer matchmaking.
 </p>
 </div>
 
 <div className="hidden lg:flex shrink-0 w-32 h-32 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10 backdrop-blur-xl border border-white/20 rounded-lg items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.15)] animate-vibrate">
 <span className="material-symbols-outlined text-[60px] text-teal-300 drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]">
 volunteer_activism
 </span>
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-[5%]">
 {isRoleLoading ? (
 <div className="flex justify-center items-center py-24">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
 </div>
 ) : !isEligible ? (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-10 text-center shadow-sm">
 <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
 <span className="material-symbols-outlined text-[48px] text-teal-600">verified_user</span>
 </div>
 <h2 className="text-2xl tracking-tight font-bold text-slate-800 dark:text-white mb-4 tracking-tight">Membership Required</h2>
 <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
 To ensure the quality and safety of our community drives, only verified members are allowed to organize cleanup events. Guests must request membership first.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link to="/request-membership"className="px-8 py-3.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-sm">
 Request Membership
 </Link>
 <BackButton variant="dark"/>
 </div>
 </div>
 ) : (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
 
 {/* Section 1: Basic Info */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-5">
 <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-slate-100 pb-4">
 <h2 className="text-2xl tracking-tight font-heading text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
 <span className="material-symbols-outlined text-teal-600">edit_document</span>
 Basic Details
 </h2>
 <CreditIndicator postType="cleanupEvents"/>
 </div>

 <div className="space-y-5">
 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Event Title *</label>
 <input 
 {...register("title", { required:"Title is required"})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-3 focus:outline-none focus:border-teal-500"placeholder="e.g. Mirpur Sector 7 Mega Cleanup"/>
 {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Slogan</label>
 <input 
 {...register("slogan")}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-3 focus:outline-none focus:border-teal-500"placeholder="e.g. Let's make Mirpur green again!"/>
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Description *</label>
 <textarea 
 {...register("description", { required:"Description is required"})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-4 focus:outline-none focus:border-teal-500 h-32"placeholder="Describe what you plan to achieve..."/>
 {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
 <i className="ri-image-add-line text-teal-600"></i>
 Event Banner / Poster URL
 </label>
 <input 
 {...register("coverImage")}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-3 focus:outline-none focus:border-teal-500"placeholder="https://example.com/poster.jpg (Optional)"/>
 <p className="text-slate-500 dark:text-slate-300 text-xs mt-1.5 flex items-center gap-1">
 <i className="ri-information-line"></i>
 Provide a direct link to an image. This will be shown on the event card to attract volunteers!
 </p>
 </div>
 </div>
 </div>

 {/* Section 2: Schedule & Logistics */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-5">
 <h2 className="text-2xl tracking-tight font-heading text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
 <span className="material-symbols-outlined text-teal-600">schedule</span>
 Schedule & Logistics
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Event Date *</label>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 pointer-events-none text-[13px] tracking-tight z-10">calendar_month</span>
 <div data-lenis-prevent="true">
 <Controller
 control={control}
 name="eventDate"rules={{ required:"Date is required"}}
 render={({ field }) => (
 <DatePicker
 placeholderText="Select Date"onChange={(date) => field.onChange(date)}
 selected={field.value}
 dateFormat="dd/MM/yyyy"className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-3 pl-10 focus:outline-none focus:border-teal-500"wrapperClassName="w-full"onKeyDown={(e) => e.preventDefault()}
 />
 )}
 />
 </div>
 </div>
 {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate.message}</p>}
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Event Time *</label>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 pointer-events-none text-[13px] tracking-tight z-10">schedule</span>
 <div data-lenis-prevent="true"className="w-full">
 <Controller
 control={control}
 name="eventTime"rules={{ required:"Time is required"}}
 render={({ field }) => (
 <div className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-2 pl-10 focus-within:border-teal-500">
 <TimePicker
 onChange={field.onChange}
 value={field.value || null}
 className="w-full border-none outline-none"clearIcon={null}
 clockIcon={<span className="hidden"></span>}
 disableClock={false}
 />
 </div>
 )}
 />
 </div>
 </div>
 {errors.eventTime && <p className="text-red-500 text-xs mt-1">{errors.eventTime.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Duration (Hours)</label>
 <input 
 type="number"{...register("durationHours")}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-3 focus:outline-none focus:border-teal-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none appearance-none"defaultValue={3}
 />
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Max Volunteers (0 for unlimited)</label>
 <input 
 type="number"{...register("maxVolunteers")}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-3 focus:outline-none focus:border-teal-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none appearance-none"/>
 </div>
 </div>
 </div>

 {/* Section 3: Location */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-5">
 <h2 className="text-2xl tracking-tight font-heading text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
 <span className="material-symbols-outlined text-teal-600">pin_drop</span>
 Location Details
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Full Address *</label>
 <input 
 {...register("address", { required:"Address is required"})}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-3 focus:outline-none focus:border-teal-500"placeholder="Street address or prominent landmark"/>
 {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">General Area / Ward</label>
 <input 
 {...register("area")}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-3 focus:outline-none focus:border-teal-500"placeholder="e.g. Mirpur"/>
 </div>
 </div>

 <div className="mb-5">
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Meeting Instructions</label>
 <textarea 
 {...register("meetingInstructions")}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-4 focus:outline-none focus:border-teal-500 h-24"placeholder="e.g. Meet by the south gate of the park"/>
 </div>

 <div>
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Pinpoint Meeting Spot *</label>
 <p className="text-xs text-slate-500 dark:text-slate-300 mb-2">Click on the map to set the exact meeting location for volunteers.</p>
 <div className="h-72 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] z-0 relative">
 <MapContainer center={[23.8103, 90.4125]} zoom={12} style={{ height:'100%', width:'100%', zIndex: 0 }}>
 <TileLayer url={isDark ?"https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png":"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}/>
 <LocationMarker position={position} setPosition={setPosition} />
 </MapContainer>
 </div>
 </div>
 </div>

 {/* Section 4: Skills & Supplies */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-5">
 <h2 className="text-2xl tracking-tight font-heading text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
 <span className="material-symbols-outlined text-teal-600">build</span>
 Skills & Supplies
 </h2>

 <div className="flex flex-col gap-4">
 <div className="w-full">
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Required Skills</label>
 <div className="flex gap-2 mb-3">
 <input 
 type="text"value={skillInput}
 onChange={(e) => setSkillInput(e.target.value)}
 onKeyDown={(e) => e.key ==='Enter'&& (e.preventDefault(), addTag('skill'))}
 className="flex-1 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-2 focus:outline-none focus:border-teal-500 text-[13px]"placeholder="e.g. Photography"/>
 <button type="button"onClick={() => addTag('skill')} className="px-5 bg-teal-600 text-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-teal-700 transition-colors">Add</button>
 </div>
 <div className="flex flex-wrap gap-2 min-h-[32px]">
 {requiredSkills.map((tag, i) => (
 <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs rounded-full flex items-center gap-2 border border-teal-200 max-w-full">
 <span className="truncate">{tag}</span> 
 <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-red-500 transition-colors flex-shrink-0"onClick={() => removeTag('skill', i)}>close</span>
 </span>
 ))}
 {requiredSkills.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-300 italic py-1.5">No specific skills required.</span>}
 </div>
 </div>

 <div className="w-full">
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-2">Supplies Needed</label>
 <div className="flex gap-2 mb-3">
 <input 
 type="text"value={supplyInput}
 onChange={(e) => setSupplyInput(e.target.value)}
 onKeyDown={(e) => e.key ==='Enter'&& (e.preventDefault(), addTag('supply'))}
 className="flex-1 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg p-2 focus:outline-none focus:border-teal-500 text-[13px]"placeholder="e.g. Gloves"/>
 <button type="button"onClick={() => addTag('supply')} className="px-5 bg-teal-600 text-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-teal-700 transition-colors">Add</button>
 </div>
 <div className="flex flex-wrap gap-2 min-h-[32px]">
 {suppliesNeeded.map((tag, i) => (
 <span key={i} className="px-3 py-1.5 bg-violet-100 text-violet-700 text-xs rounded-full flex items-center gap-2 border border-violet-200 max-w-full">
 <span className="truncate">{tag}</span> 
 <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-red-500 transition-colors flex-shrink-0"onClick={() => removeTag('supply', i)}>close</span>
 </span>
 ))}
 {suppliesNeeded.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-300 italic py-1.5">No supplies required yet.</span>}
 </div>
 </div>
 </div>
 </div>

 {/* Section 5: Funding */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-5">
 <h2 className="text-2xl tracking-tight font-heading text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
 <span className="material-symbols-outlined text-teal-600">volunteer_activism</span>
 Community Funding
 </h2>

 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl mb-4 transition-colors">
 <div className="flex flex-col gap-0.5">
 <label htmlFor="fundingEnabled"className="font-bold text-slate-800 dark:text-white cursor-pointer select-none">
 Accept Donations for Supplies
 </label>
 <span className="text-xs text-slate-500 dark:text-slate-300">
 Enable crowd-funding to help cover event expenses
 </span>
 </div>
 <label className="relative inline-flex items-center cursor-pointer select-none">
 <input 
 type="checkbox"id="fundingEnabled"{...register("fundingEnabled")}
 className="sr-only peer"/>
 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] after:border-slate-300 dark:border-[#1e3040] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
 </label>
 </div>

 {fundingEnabled && (
 <div className="mt-5 p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg shadow-sm">
 <label className="block text-[13px] font-bold text-slate-800 dark:text-white mb-1 font-bold">Target Funding Goal</label>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 mb-4">Set a target to cover costs for bags, tools, masks, or refreshments for volunteers.</p>
 
 <div className="relative w-full md:w-1/2 flex shadow-sm rounded-lg">
 <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-500 dark:text-slate-300 font-bold">
 ৳
 </span>
 <input 
 type="number"{...register("fundingGoal", { required: fundingEnabled ?"Goal is required": false })}
 className="flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-lg bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] focus:outline-none focus:border-[#40826D] font-bold text-slate-800 dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none appearance-none"placeholder="e.g. 5000"/>
 </div>
 {errors.fundingGoal && <p className="text-red-500 text-xs mt-2">{errors.fundingGoal.message}</p>}
 </div>
 )}
 </div>

 {/* Submit */}
 <div className="pt-4 flex justify-end">
 <button
 type="submit"disabled={isSubmitting || credits === 0}
 className="px-10 py-4 bg-teal-600 text-white rounded-full font-bold text-[13px] hover:bg-teal-700 hover:shadow-[0_8px_30px_rgba(13,148,136,0.3)] transition-all disabled:opacity-50">
 {isSubmitting ?'Submitting...': credits === 0 ?'Out of Credits':'Submit Cleanup Drive for Review'}
 </button>
 </div>

 </form>
 )}
 </div>
 </div>
 );
}
