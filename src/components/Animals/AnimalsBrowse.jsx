import React, { useState, useEffect, useRef } from"react";
import SEO from "../common/SEO";
import { useTheme } from'../../hooks/useTheme';
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import { Link, useLocation } from"react-router";
import { motion, AnimatePresence } from"framer-motion";
import AnimalCard from"../cards/AnimalCard";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import MinimalLoader from'../common/MinimalLoader.jsx';
import PageHeader from'../common/PageHeader';
import PageArt from "../common/PageArt";
import { MapContainer, TileLayer, Marker, Popup } from"react-leaflet";
import"leaflet/dist/leaflet.css";
import L from"leaflet";
import Swal from"sweetalert2";

import iconRetinaUrl from'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from'leaflet/dist/images/marker-icon.png';
import shadowUrl from'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl,
 iconUrl,
 shadowUrl,
});

const QUICK_FILTERS = [
 { label:'All', value: null, icon: <i className="ri-apps-2-fill"></i>, bg:'bg-teal-600', text:'text-white'},
 { label:'Urgent', value:'emergency', icon: <i className="ri-alert-fill"></i>, bg:'bg-rose-100', text:'text-rose-700'},
 { label:'Needs Rescue', value:'needs-help', icon: <i className="ri-hospital-fill"></i>, bg:'bg-amber-100', text:'text-amber-700'},
 { label:'Adoptable', value:'rescued', icon: <i className="ri-home-heart-fill"></i>, bg:'bg-emerald-100', text:'text-emerald-700'},
];

const ANIMAL_TYPES = ['Dog','Cat','Cow','Bird','Other'];

export default function AnimalsBrowse() {
 const { isDark } = useTheme();
 const axiosSecure = useAxiosSecure();
 const axiosPublic = useAxiosPublic();
 const queryClient = useQueryClient();

 const [urgencyFilter, setUrgencyFilter] = useState(null);
 const [statusFilter, setStatusFilter] = useState(null);
 const [typeFilter, setTypeFilter] = useState(null);
 const [areaFilter, setAreaFilter] = useState('');
 const [viewMode, setViewMode] = useState('grid');
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const dropdownRef = useRef(null);

 useEffect(() => {
 function handleClickOutside(event) {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsDropdownOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const location = useLocation();
 // "Organize a Drive" on the feeding drives page sends people here with the form open
 const [showDriveModal, setShowDriveModal] = useState(() => !!location.state?.openDriveForm);
 const [driveData, setDriveData] = useState({
 title:"",
 description:"",
 date:"",
 time:"",
 location:"",
 foodType:"",
 volunteersNeeded: 5
 });

 const { data: stats } = useQuery({
 queryKey: ["animals-stats"],
 queryFn: async () => {
 const res = await axiosPublic.get("/animals/stats");
 return res.data;
 },
 staleTime: 5 * 60 * 1000,
 });

 const { data: animals = [], isLoading } = useQuery({
 queryKey: ["animals", urgencyFilter, statusFilter, typeFilter, areaFilter],
 queryFn: async () => {
 const res = await axiosPublic.get("/animals", {
 params: {
 urgency: urgencyFilter || undefined,
 // "Adoptable" means rescued and marked adoptable, which the server filters for
 status: statusFilter ==='adoptable'? undefined : statusFilter || undefined,
 adoptable: statusFilter ==='adoptable'?'true': undefined,
 type: typeFilter || undefined,
 area: areaFilter || undefined,
 }
 });
 return res.data;
 },
 staleTime: 5 * 60 * 1000,
 });

 const createDriveMutation = useMutation({
 mutationFn: (data) => axiosSecure.post("/feeding-drives", data),
 onSuccess: () => {
 Swal.fire({
 title:"Success!",
 text:"Feeding drive created successfully.",
 icon:"success",
 confirmButtonColor:"#0D9488"});
 setShowDriveModal(false);
 setDriveData({
 title:"",
 description:"",
 date:"",
 time:"",
 location:"",
 foodType:"",
 volunteersNeeded: 5
 });
 queryClient.invalidateQueries({ queryKey: ["feeding-drives"] });
 },
 onError: (err) => {
 Swal.fire("Error", err.response?.data?.message ||"Failed to create drive.","error");
 }
 });

 const handleCreateDrive = (e) => {
 e.preventDefault();
 if (!driveData.title || !driveData.description || !driveData.date || !driveData.time || !driveData.location || !driveData.foodType) {
 Swal.fire("Validation Error","All fields are required.","warning");
 return;
 }
 createDriveMutation.mutate({
 ...driveData,
 volunteers: [],
 volunteerCount: 0
 });
 };

 return (
 <div className="min-h-screen bg-[#f0fdf4]">
 <SEO title="Animal Rescue & Feeding" canonical={`${window.location.origin}/animals`} />
 <PageHeader
 width="calc(80rem + 10%)"
 gutter="5%"
 art={<PageArt scene="animals" />}
 title="Animals"
 description="Strays that need food, treatment or a home. Report one you've seen, follow its recovery, or organise a feeding drive with neighbours."
 actions={
 <>
 <Link to="/animals/add" className="cn-btn cn-btn-signal">
 <i className="ri-heart-add-line text-base" aria-hidden="true" />
 Report an animal
 </Link>
 <button type="button" onClick={() => setShowDriveModal(true)} className="cn-btn cn-btn-on-dark">
 <i className="ri-restaurant-2-line text-base" aria-hidden="true" />
 Organise a feeding drive
 </button>
 </>
 }
 meta={stats && (
 <>
 <span><strong>{stats.urgent || 0}</strong> urgent</span>
 <span><strong>{stats.inTreatment || 0}</strong> in treatment</span>
 <span><strong>{stats.rescued || 0}</strong> rescued</span>
 <span><strong>{stats.total || 0}</strong> reported in all</span>
 </>
 )}
 />

 {/* Content Section */}
 <div className="px-[5%] py-8">
 <div className="max-w-7xl mx-auto">
 {/* Controls Panel */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] mb-8 space-y-6">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
 {/* Quick Filters */}
 <div className="flex flex-wrap gap-2.5">
 {QUICK_FILTERS.map((filter) => (
 <button
 key={filter.label}
 onClick={() => {
 if (filter.value ==='emergency') {
 setUrgencyFilter('emergency');
 setStatusFilter(null);
 } else if (filter.value ==='needs-help') {
 setUrgencyFilter(null);
 setStatusFilter('needs-help');
 } else if (filter.value ==='rescued') {
 setUrgencyFilter(null);
 setStatusFilter('adoptable');
 } else {
 setUrgencyFilter(null);
 setStatusFilter(null);
 }
 }}
 className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
 (filter.value === null && !urgencyFilter && !statusFilter) ||
 (filter.value ==='emergency'&& urgencyFilter ==='emergency') ||
 (filter.value ==='needs-help'&& statusFilter ==='needs-help') ||
 (filter.value ==='rescued'&& statusFilter ==='adoptable')
 ?'ring-2 ring-offset-2 ring-teal-500 shadow-md'+ filter.bg +''+ filter.text
 :'bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]'}`}
 >
 <span className="text-[13px] leading-none">{filter.icon}</span>
 {filter.label}
 </button>
 ))}
 </div>

 {/* View Toggle */}
 <div className="flex items-center bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] p-1 rounded-xl gap-1 shrink-0 self-start lg:self-auto shadow-inner border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/40 relative select-none">
 {['grid','map'].map((mode) => {
 const isActive = viewMode === mode;
 return (
 <button
 key={mode}
 onClick={() => setViewMode(mode)}
 className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-1.5 z-10 cursor-pointer ${
 isActive
 ?'text-teal-700':'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]'}`}
 >
 {isActive && (
 <motion.div
 layoutId="activeViewMode"className="absolute inset-0 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/30"transition={{ type:'spring', stiffness: 380, damping: 30 }}
 />
 )}
 <span className="relative z-20 flex items-center gap-1.5 capitalize">
 <i className={mode ==='grid'?"ri-grid-fill":"ri-map-fill"}></i>
 <span>{mode}</span>
 </span>
 </button>
 );
 })}
 </div>
 </div>

 {/* Advanced Filters */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
 {/* Type Select */}
 <div className="space-y-1.5 relative"ref={dropdownRef}>
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Animal Type</label>
 <div className="relative">
 <button
 type="button"onClick={() => setIsDropdownOpen(!isDropdownOpen)}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all flex items-center justify-between cursor-pointer font-semibold shadow-sm select-none">
 <span>{typeFilter ? typeFilter :"All Animals"}</span>
 <i className={`ri-arrow-down-s-line text-[13px] transition-transform duration-200 ${isDropdownOpen ?'rotate-180':''}`}></i>
 </button>
 
 <AnimatePresence>
 {isDropdownOpen && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.15 }}
 className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] border border-slate-250 dark:border-[#1e3040] rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] overflow-hidden z-50 p-1.5">
 <div
 onClick={() => {
 setTypeFilter(null);
 setIsDropdownOpen(false);
 }}
 className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer flex items-center justify-between select-none ${
 !typeFilter 
 ?'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold':'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0a1410] dark:hover:bg-[#1e3040] hover:text-slate-900 dark:text-white dark:hover:text-white'}`}
 >
 All Animals
 {!typeFilter && <i className="ri-check-line text-[13px] tracking-tight"></i>}
 </div>
 {ANIMAL_TYPES.map(type => {
 const isSelected = typeFilter === type;
 return (
 <div
 key={type}
 onClick={() => {
 setTypeFilter(type);
 setIsDropdownOpen(false);
 }}
 className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer flex items-center justify-between select-none ${
 isSelected 
 ?'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold':'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0a1410] dark:hover:bg-[#1e3040] hover:text-slate-900 dark:text-white dark:hover:text-white'}`}
 >
 {type}
 {isSelected && <i className="ri-check-line text-[13px] tracking-tight"></i>}
 </div>
 );
 })}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>

 {/* Area search */}
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Search Area / Location</label>
 <div className="relative">
 <input
 type="text"value={areaFilter}
 onChange={(e) => setAreaFilter(e.target.value)}
 placeholder="e.g. Banani, Dhanmondi..."className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl pl-9 pr-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] outline-none focus:border-teal-500 transition-all"/>
 <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
 </div>
 </div>

 {/* Reset Filters */}
 <div className="flex items-end justify-end">
 <button
 onClick={() => {
 setUrgencyFilter(null);
 setStatusFilter(null);
 setTypeFilter(null);
 setAreaFilter('');
 }}
 className="px-6 py-2 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors w-full sm:w-auto">
 Reset Filters
 </button>
 </div>
 </div>
 </div>

 {/* Main Content Pane */}
 {isLoading ? (
 <div className="flex justify-center py-12">
 <MinimalLoader />
 </div>
 ) : animals.length === 0 ? (
 <div className="text-center py-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm">
 <i className="ri-emotion-sad-line text-6xl text-slate-300 mb-4 block animate-bounce"></i>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-900 dark:text-white mb-2 tracking-tight">No animals found</h3>
 <p className="text-slate-500 dark:text-slate-300 max-w-sm mx-auto">
 Try a different filter, or be the first to report an animal that needs help.
 </p>
 <Link
 to="/animals/add"className="mt-6 inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-teal-600/30 transition-all">
 Report an Animal
 </Link>
 </div>
 ) : viewMode ==='grid'? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <AnimatePresence>
 {animals.map((animal, index) => (
 <motion.div
 key={animal._id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ delay: (index % 6) * 0.05 }}
 >
 <AnimalCard animal={animal} />
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 ) : (
 /* Map View */
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] h-[600px] z-0 relative">
 <MapContainer 
 center={[23.8103, 90.4125]} 
 zoom={12} 
 scrollWheelZoom={true} 
 className="w-full h-full z-0">
 <TileLayer
 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'url={isDark ?"https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png":"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}/>
 {animals.map(animal => {
 let lat = animal.coordinates?.lat;
 let lng = animal.coordinates?.lng;
 
 // Generate deterministic, stable coordinates based on animal ID to prevent jumping on re-renders
 if (!lat || !lng) {
 const idStr = animal._id ||"";
 let hash = 0;
 for (let i = 0; i < idStr.length; i++) {
 hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
 }
 const latOffset = ((hash % 100) / 1000) - 0.05; // range: -0.05 to +0.05
 const lngOffset = (((hash >> 8) % 100) / 1000) - 0.05; // range: -0.05 to +0.05
 lat = 23.75 + latOffset;
 lng = 90.38 + lngOffset;
 }
 
 return (
 <Marker key={animal._id} position={[lat, lng]}>
 <Popup>
 <div className="font-body p-1 max-w-[200px]">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{animal.animalType}</span>
 <h4 className="font-bold text-[13px] text-slate-800 dark:text-white line-clamp-1 mb-1">{animal.condition}</h4>
 <p className="text-[11px] text-slate-500 dark:text-slate-300 mb-2 truncate">📍 {animal.location}</p>
 <Link 
 to={`/animals/${animal._id}`} 
 className="inline-block w-full py-1 text-center bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
 Details →
 </Link>
 </div>
 </Popup>
 </Marker>
 );
 })}
 </MapContainer>
 </div>
 )}
 </div>
 </div>

 {/* Organize Feeding Drive Modal */}
 {showDriveModal && (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
 {/* Modal Header */}
 <div className="p-4 bg-teal-600 text-white shrink-0 relative">
 <h3 className="text-[13px] tracking-tight font-bold tracking-tight">Organize a Feeding Drive</h3>
 <p className="text-teal-100 text-xs mt-1">Plan and schedule a drive to feed animals in need.</p>
 <button 
 onClick={() => setShowDriveModal(false)}
 className="absolute top-6 right-6 text-teal-100 hover:text-white transition-colors">
 <i className="ri-close-line text-2xl tracking-tight"></i>
 </button>
 </div>

 {/* Modal Body / Form */}
 <form onSubmit={handleCreateDrive} className="p-4 space-y-4 overflow-y-auto flex-grow">
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Drive Title *</label>
 <input 
 type="text"required
 placeholder="e.g. Stray Cat Feeding Drive at Dhanmondi"value={driveData.title}
 onChange={(e) => setDriveData({...driveData, title: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Description *</label>
 <textarea 
 required
 rows="3"placeholder="Tell volunteers what supplies to bring, what kind of animals, etc..."value={driveData.description}
 onChange={(e) => setDriveData({...driveData, description: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all resize-none"/>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Date *</label>
 <input 
 type="date"required
 value={driveData.date}
 onChange={(e) => setDriveData({...driveData, date: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Time *</label>
 <input 
 type="text"required
 placeholder="e.g. 4:00 PM"value={driveData.time}
 onChange={(e) => setDriveData({...driveData, time: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Location *</label>
 <input 
 type="text"required
 placeholder="e.g. Dhanmondi Lake, Sector 4..."value={driveData.location}
 onChange={(e) => setDriveData({...driveData, location: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Food Type *</label>
 <input 
 type="text"required
 placeholder="e.g. Cat kibble, Milk..."value={driveData.foodType}
 onChange={(e) => setDriveData({...driveData, foodType: e.target.value})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Volunteers Needed *</label>
 <input 
 type="number"required
 min="1"value={driveData.volunteersNeeded}
 onChange={(e) => setDriveData({...driveData, volunteersNeeded: parseInt(e.target.value) || 1})}
 className="w-full bg-slate-50 dark:bg-[#0a1410] dark:bg-[#0a1410] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-all"/>
 </div>
 </div>

 <div className="pt-4 flex gap-3 justify-end shrink-0">
 <button 
 type="button"onClick={() => setShowDriveModal(false)}
 className="px-5 py-2.5 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-[13px] transition-colors">
 Cancel
 </button>
 <button 
 type="submit"disabled={createDriveMutation.isPending}
 className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[13px] transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2">
 {createDriveMutation.isPending ?"Creating...": <><i className="ri-check-line"></i> Create Drive</>}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </div>
 );
}
