import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { useNavigate } from'react-router';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import toast from'react-hot-toast';
import Swal from'sweetalert2';
import { useAuth } from'../../hooks/useAuth';
import BackButton from'../common/BackButton';

const SKILLS_LIST = [
 { id:'medical', label:'Medical First Aid', icon:'ri-nurse-line', color:'text-rose-500 bg-rose-50 border-rose-200'},
 { id:'plumbing', label:'Plumbing', icon:'ri-tools-line', color:'text-blue-500 bg-blue-50 border-blue-200'},
 { id:'electrical', label:'Electrical', icon:'ri-flashlight-line', color:'text-amber-500 bg-amber-50 border-amber-200'},
 { id:'driving', label:'Driving/Transport', icon:'ri-steering-2-line', color:'text-purple-500 bg-purple-50 border-purple-200'},
 { id:'teaching', label:'Teaching', icon:'ri-book-open-line', color:'text-cyan-500 bg-cyan-50 border-cyan-200'},
 { id:'cleanup', label:'General Cleanup', icon:'ri-leaf-line', color:'text-emerald-500 bg-emerald-50 border-emerald-200'},
 { id:'animal_care', label:'Animal Care', icon:'ri-bear-smile-line', color:'text-orange-500 bg-orange-50 border-orange-200'}
];

const AVAILABILITY_OPTS = [
 { id:'Weekdays', label:'Weekdays', icon:'ri-calendar-event-line'},
 { id:'Weekends', label:'Weekends', icon:'ri-calendar-check-line'},
 { id:'Anytime', label:'Anytime', icon:'ri-24-hours-line'}
];

export default function VolunteerRegister() {
 const { user } = useAuth();
 const axiosSecure = useAxiosSecure();
 const navigate = useNavigate();

 const [step, setStep] = useState(1);
 const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
 skills: [],
 availability:'Anytime',
 area:'',
 phone:'+880',
 contactMethod:'Email'});

 const toggleSkill = (skillLabel) => {
 setFormData(prev => ({
 ...prev,
 skills: prev.skills.includes(skillLabel)
 ? prev.skills.filter(s => s !== skillLabel)
 : [...prev.skills, skillLabel]
 }));
 };

 const handleNext = () => {
 if (step === 1 && formData.skills.length === 0) {
 toast.error('Please select at least one skill.');
 return;
 }
 if (step === 2 && !formData.area) {
 toast.error('Please specify your primary area.');
 return;
 }
 setStep(prev => prev + 1);
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.contactMethod) {
 toast.error("Please select a preferred contact method.");
 return;
 }

 setLoading(true);
 try {
 await axiosSecure.post('/volunteers/register', formData);
 Swal.fire({
 title:'Registration Submitted!',
 text:'Thank you for volunteering! Your registration has been submitted to the admin for verification and approval.',
 icon:'success',
 confirmButtonColor:'#0d9488'}).then(() => {
 navigate('/volunteers');
 });
 } catch (err) {
 toast.error(err.response?.data?.message ||'Registration failed.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-[#ecf7f4] pt-28 pb-20 px-[5%]">
 <div className="max-w-2xl mx-auto">
 <div className="mb-6">
 <BackButton variant="dark"className="!bg-slate-900 hover:!bg-slate-800 !text-white shadow-md"/>
 </div>

 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-xl border border-slate-100 overflow-hidden">
 {/* Header */}
 <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-5 text-white text-center">
 <h1 className="text-3xl tracking-tight font-extrabold mb-2 tracking-tight"style={{ fontFamily:"HKGrotesk, sans-serif"}}>Join as a Volunteer</h1>
 <p className="text-white/80">Make a real difference in your community.</p>
 
 {/* Progress Bar */}
 <div className="flex items-center justify-center gap-2 mt-8">
 {[1, 2, 3].map(s => (
 <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ?'w-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]':'w-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/30'}`} />
 ))}
 </div>
 </div>

 <div className="p-5">
 <AnimatePresence mode="wait">
 {/* Step 1: Skills */}
 {step === 1 && (
 <motion.div key="step1"initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-6 tracking-tight"style={{ fontFamily:"HKGrotesk, sans-serif"}}>What skills can you offer?</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
 {SKILLS_LIST.map(skill => {
 const isSelected = formData.skills.includes(skill.label);
 return (
 <button
 key={skill.id}
 onClick={() => toggleSkill(skill.label)}
 className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left
 ${isSelected ?'border-teal-500 bg-teal-50':'border-slate-100 hover:border-teal-200'}`}
 >
 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] ${skill.color}`}>
 <i className={skill.icon} />
 </div>
 <span className={`font-semibold ${isSelected ?'text-teal-700':'text-slate-600 dark:text-slate-300'}`}>
 {skill.label}
 </span>
 </button>
 );
 })}
 </div>
 <div className="flex justify-end">
 <button onClick={handleNext} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
 Next Step →
 </button>
 </div>
 </motion.div>
 )}

 {/* Step 2: Availability & Area */}
 {step === 2 && (
 <motion.div key="step2"initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-6 tracking-tight"style={{ fontFamily:"HKGrotesk, sans-serif"}}>Where & When?</h3>
 
 <div className="space-y-6 mb-8">
 <div>
 <label className="block text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-3">Primary Area (Required)</label>
 <input 
 type="text"value={formData.area}
 onChange={(e) => setFormData({...formData, area: e.target.value})}
 placeholder="e.g. Mirpur, Dhanmondi..."className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-white"required
 />
 <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">This helps us match you with nearby opportunities.</p>
 </div>

 <div>
 <label className="block text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-3">General Availability</label>
 <div className="grid grid-cols-3 gap-3">
 {AVAILABILITY_OPTS.map(opt => (
 <button
 key={opt.id}
 onClick={() => setFormData({...formData, availability: opt.id})}
 className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors
 ${formData.availability === opt.id ?'border-teal-500 bg-teal-50 text-teal-700':'border-slate-100 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]'}`}
 >
 <i className={`${opt.icon} text-2xl tracking-tight mb-1`} />
 <span className="text-[13px] font-semibold">{opt.label}</span>
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="flex justify-between">
 <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-xl font-semibold transition-colors">
 ← Back
 </button>
 <button onClick={handleNext} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
 Next Step →
 </button>
 </div>
 </motion.div>
 )}

 {/* Step 3: Contact Info */}
 {step === 3 && (
 <motion.div key="step3"initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-6 tracking-tight"style={{ fontFamily:"HKGrotesk, sans-serif"}}>Contact Details</h3>
 
 <form onSubmit={handleSubmit} className="space-y-6 mb-8">
 <div>
 <label className="block text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-3">Phone Number (Optional)</label>
 <input 
 type="tel"value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 placeholder="+880 1..."className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-white"/>
 <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">Only shared with verified organizers when you RSVP.</p>
 </div>

 <div>
 <label className="block text-[13px] font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-3">Preferred Contact Method</label>
 <div className="flex gap-4">
 {['Email','Phone','WhatsApp'].map(method => (
 <label key={method} className="flex items-center gap-2 cursor-pointer">
 <input 
 type="radio"name="contactMethod"value={method}
 checked={formData.contactMethod === method}
 onChange={(e) => setFormData({...formData, contactMethod: e.target.value})}
 className="text-teal-600 focus:ring-teal-500"/>
 <span className="text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-medium">{method}</span>
 </label>
 ))}
 </div>
 </div>
 </form>

 <div className="flex justify-between">
 <button onClick={() => setStep(2)} className="px-6 py-3 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-xl font-semibold transition-colors">
 ← Back
 </button>
 <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50">
 {loading ?'Registering...':'Complete Registration'}
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 </div>
 );
}
