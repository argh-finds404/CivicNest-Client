import React, { useState } from'react';
import { useMutation, useQueryClient } from'@tanstack/react-query';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import { useRole } from'../../hooks/useRole';
import toast from'react-hot-toast';
import { Check, CheckSquare, HelpCircle, Clock, BarChart3, MessageCircle, Users, ChevronLeft, ChevronRight, CheckCircle2 } from'lucide-react';

const POLL_TYPES = [
 { value:'single', label:'Single Choice', icon: <Check className="w-5 h-5"/>, description:'Choose one option'},
 { value:'multiple', label:'Multiple Choice', icon: <CheckSquare className="w-4.5 h-4.5"/>, description:'Select multiple options'},
 { value:'yesno', label:'Yes / No', icon: <HelpCircle className="w-5 h-5"/>, description:'Simple yes or no'},
];

const POLL_CATEGORIES = ['Community','Environment','Events','Infrastructure','General'];

const TIME_PRESETS = [
 { label:'Custom', value:'custom'},
 { label:'1 Hour', value: 1 },
 { label:'6 Hours', value: 6 },
 { label:'12 Hours', value: 12 },
 { label:'1 Day', value: 24 },
 { label:'3 Days', value: 72 },
 { label:'1 Week', value: 168 },
 { label:'2 Weeks', value: 336 },
 { label:'1 Month', value: 720 },
];

export default function CreatePollModal() {
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();
 const [role] = useRole();
 const queryClient = useQueryClient();
 
 const [formData, setFormData] = useState({
 question:'',
 type:'single',
 options: ['',''],
 category:'General',
 durationType:'custom',
 customHours: 24,
 selectedPreset: 24,
 allowAnonymous: false
 });

 const [currentStep, setCurrentStep] = useState(1);
 const totalSteps = 4;

 const createMutation = useMutation({
 mutationFn: async (pollData) => {
 const res = await axiosSecure.post('/polls', pollData);
 return res.data;
 },
 onSuccess: () => {
 toast.success('Poll created successfully!');
 queryClient.invalidateQueries({ queryKey: ['polls'] });
 queryClient.invalidateQueries({ queryKey: ['polls-stats'] });
 closeModal();
 resetForm();
 },
 onError: (error) => {
 toast.error(error.response?.data?.message ||'Failed to create poll');
 }
 });

 const handleTypeChange = (type) => {
 setFormData({ ...formData, type });
 setFormData(prev => ({ ...prev, options: ['',''] }));
 };

 const handleOptionChange = (index, value) => {
 const newOptions = [...formData.options];
 newOptions[index] = value;
 setFormData({ ...formData, options: newOptions });
 };

 const addOption = () => {
 if (formData.options.length < 10) {
 setFormData({ ...formData, options: [...formData.options,''] });
 } else {
 toast.error('Maximum 10 options allowed');
 }
 };

 const removeOption = (index) => {
 if (formData.options.length > 2) {
 const newOptions = formData.options.filter((_, i) => i !== index);
 setFormData({ ...formData, options: newOptions });
 } else {
 toast.error('At least 2 options are required');
 }
 };

 const nextStep = () => {
 if (currentStep === 1 && !formData.question.trim()) {
 toast.error('Please enter a question');
 return;
 }
 if (currentStep === 2) {
 const validOptions = formData.type ==='yesno'? ['Yes','No'] 
 : formData.options.filter(opt => opt.trim());
 if (validOptions.length < 2) {
 toast.error('Please enter at least 2 options');
 return;
 }
 }
 if (currentStep < totalSteps) {
 setCurrentStep(currentStep + 1);
 }
 };

 const prevStep = () => {
 if (currentStep > 1) {
 setCurrentStep(currentStep - 1);
 }
 };

 const handleSubmit = (e) => {
 e.preventDefault();
 
 if (!user) {
 toast.error('Please log in to create a poll');
 return;
 }

 if (role !=='member'&& role !=='admin') {
 toast.error('Only members can create polls');
 return;
 }

 const hours = formData.durationType ==='custom'? formData.customHours 
 : formData.selectedPreset;

 if (hours <= 0) {
 toast.error('Duration must be greater than 0');
 return;
 }

 const endsDate = new Date();
 endsDate.setHours(endsDate.getHours() + hours);
 const endsAt = endsDate.toISOString();

 const validOptions = formData.type ==='yesno'? ['Yes','No']
 : formData.options.filter(opt => opt.trim());

 const pollData = {
 question: formData.question.trim(),
 type: formData.type,
 options: validOptions.map((text, index) => ({ text, order: index })),
 category: formData.category,
 endsAt: endsAt,
 allowAnonymous: formData.allowAnonymous
 };

 createMutation.mutate(pollData);
 };

 const resetForm = () => {
 setFormData({
 question:'',
 type:'single',
 options: ['',''],
 category:'General',
 durationType:'custom',
 customHours: 24,
 selectedPreset: 24,
 allowAnonymous: false
 });
 setCurrentStep(1);
 };

 const closeModal = () => {
 const modal = document.getElementById('create-poll-modal');
 if (modal) {
 modal.close();
 modal.removeAttribute('open');
 }
 };

 const StepIndicator = () => (
 <div className="flex items-center justify-center gap-2 mb-6">
 {[1, 2, 3, 4].map((step) => (
 <React.Fragment key={step}>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all
 ${currentStep >= step 
 ?'bg-gradient-to-r from-teal-600 to-emerald-600 text-white':'bg-slate-200 text-slate-500 dark:text-slate-300'}`}>
 {currentStep > step ? <CheckCircle2 className="w-4 h-4"/> : step}
 </div>
 {step < 4 && (
 <div className={`w-12 h-1 rounded-full transition-all ${currentStep > step ?'bg-gradient-to-r from-teal-600 to-emerald-600':'bg-slate-200'}`} />
 )}
 </React.Fragment>
 ))}
 </div>
 );

 return (
 <dialog id="create-poll-modal"className="modal">
 <form method="dialog"className="modal-backdrop bg-black/60 backdrop-blur-sm"onClick={closeModal} />
 <div className="modal-box max-w-2xl p-0 rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
 {/* Header */}
 <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 px-8 py-6 relative overflow-hidden shrink-0">
 <div className="absolute inset-0 opacity-10">
 <BarChart3 className="absolute top-4 right-8 w-32 h-32 text-white"/>
 <MessageCircle className="absolute bottom-4 left-8 w-24 h-24 text-white"/>
 <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 text-white"/>
 </div>
 
 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-12 h-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
 <BarChart3 className="w-6 h-6 text-white"/>
 </div>
 <h3 className="text-2xl tracking-tight font-bold text-white tracking-tight">Create New Poll</h3>
 </div>
 <p className="text-white/80 text-[13px] ml-15">Engage the community with questions</p>
 </div>
 </div>

 {/* Content */}
 <div className="p-5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] flex-1 overflow-y-auto custom-scrollbar">
 <StepIndicator />
 
 <div className="min-h-[400px]">
 {/* Step 1: Question & Type */}
 {currentStep === 1 && (
 <div className="space-y-6">
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2 block">Question *</label>
 <textarea
 name="question"required
 rows="3"value={formData.question}
 onChange={(e) => setFormData({ ...formData, question: e.target.value })}
 placeholder="What would you like to ask the community?"className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all resize-none font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]"maxLength="500"/>
 <p className="text-xs text-slate-400 text-right mt-1">{formData.question.length}/500</p>
 </div>

 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-3 block">Poll Type</label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {POLL_TYPES.map((type) => (
 <button
 key={type.value}
 type="button"onClick={() => handleTypeChange(type.value)}
 className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center text-center gap-2 cursor-pointer
 ${formData.type === type.value
 ?'border-teal-500 bg-teal-50 text-teal-900 font-semibold shadow-md':'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-slate-500 dark:text-slate-300 hover:border-teal-300 hover:bg-teal-50/50'}`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
 formData.type === type.value ?'bg-teal-100 text-teal-700':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300'}`}>
 {type.icon}
 </div>
 <span className="font-bold text-[13px]">{type.label}</span>
 <span className="text-xs text-slate-400 font-medium leading-tight">{type.description}</span>
 </button>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Step 2: Options */}
 {currentStep === 2 && (
 <div className="space-y-4">
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] block">
 Options * {formData.type ==='yesno'&&'(automatically set to Yes/No)'}
 </label>
 
 {formData.type ==='yesno'? (
 <div className="p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-center text-slate-500 dark:text-slate-300 font-medium">
 Yes/No polls automatically have"Yes"and"No"options
 </div>
 ) : (
 <div className="space-y-3">
 {formData.options.map((option, index) => (
 <div key={index} className="flex gap-2">
 <input
 type="text"value={option}
 onChange={(e) => handleOptionChange(index, e.target.value)}
 placeholder={`Option ${index + 1}`}
 required
 className="flex-1 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]"/>
 {formData.options.length > 2 && (
 <button
 type="button"onClick={() => removeOption(index)}
 className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold">
 ✕
 </button>
 )}
 </div>
 ))}
 
 {formData.options.length < 10 && (
 <button
 type="button"onClick={addOption}
 className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl text-slate-500 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600 transition-all font-medium">
 + Add Option
 </button>
 )}
 </div>
 )}
 </div>
 )}

 {/* Step 3: Duration & Category */}
 {currentStep === 3 && (
 <div className="space-y-6">
 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2 block">Category</label>
 <select
 value={formData.category}
 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all appearance-none cursor-pointer font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]">
 {POLL_CATEGORIES.map(cat => (
 <option key={cat} value={cat} className="font-medium">{cat}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-2 block">Duration</label>
 
 {formData.durationType ==='custom'? (
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <Clock className="w-5 h-5 text-slate-400"/>
 <input
 type="number"min="1"max="8760"value={formData.customHours}
 onChange={(e) => setFormData({ ...formData, customHours: parseInt(e.target.value) || 1 })}
 className="flex-1 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]"placeholder="Enter hours"/>
 <span className="text-slate-500 dark:text-slate-300 font-medium text-[13px]">hours</span>
 </div>
 <button
 type="button"onClick={() => setFormData({ ...formData, durationType:'preset'})}
 className="text-xs text-teal-600 hover:text-teal-700 font-medium">
 Use presets instead
 </button>
 </div>
 ) : (
 <div className="space-y-2">
 <div className="relative">
 <select
 value={formData.selectedPreset}
 onChange={(e) => setFormData({ ...formData, selectedPreset: parseInt(e.target.value) })}
 className="w-full bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl px-4 py-3.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all appearance-none cursor-pointer font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]">
 {TIME_PRESETS.map(opt => (
 <option key={opt.value} value={opt.value} className="font-medium">{opt.label}</option>
 ))}
 </select>
 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
 <svg className="w-5 h-5 text-slate-400"fill="none"stroke="currentColor"viewBox="0 0 24 24">
 <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 9l-7 7-7-7"/>
 </svg>
 </div>
 </div>
 <button
 type="button"onClick={() => setFormData({ ...formData, durationType:'custom'})}
 className="text-xs text-teal-600 hover:text-teal-700 font-medium">
 Set custom hours
 </button>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Step 4: Review */}
 {currentStep === 4 && (
 <div className="space-y-4">
 <div className="p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] space-y-3">
 <div>
 <span className="text-xs font-bold text-slate-400 uppercase">Question</span>
 <p className="text-slate-800 dark:text-white font-medium">{formData.question}</p>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <span className="text-xs font-bold text-slate-400 uppercase">Type</span>
 <p className="text-slate-800 dark:text-white font-medium">{formData.type}</p>
 </div>
 <div>
 <span className="text-xs font-bold text-slate-400 uppercase">Category</span>
 <p className="text-slate-800 dark:text-white font-medium">{formData.category}</p>
 </div>
 </div>
 <div>
 <span className="text-xs font-bold text-slate-400 uppercase">Duration</span>
 <p className="text-slate-800 dark:text-white font-medium">
 {formData.durationType ==='custom'?`${formData.customHours} hours`: TIME_PRESETS.find(p => p.value === formData.selectedPreset)?.label}
 </p>
 </div>
 <div>
 <span className="text-xs font-bold text-slate-400 uppercase">Options</span>
 <ul className="text-slate-800 dark:text-white font-medium text-[13px] mt-1">
 {formData.type ==='yesno'? (
 <li>Yes</li>
 ) : formData.options.filter(o => o.trim()).map((opt, i) => (
 <li key={i}>{opt}</li>
 ))}
 </ul>
 </div>
 </div>

 <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-xl border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 <input
 type="checkbox"id="allowAnonymous"checked={formData.allowAnonymous}
 onChange={(e) => setFormData({ ...formData, allowAnonymous: e.target.checked })}
 className="w-5 h-5 rounded border-2 border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] text-teal-600 focus:ring-2 focus:ring-teal-500/10"/>
 <label htmlFor="allowAnonymous"className="text-[13px] font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] cursor-pointer">
 Allow anonymous votes
 </label>
 </div>
 </div>
 )}
 </div>

 {/* Navigation */}
 <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-slate-100">
 {currentStep === 1 ? (
 <button
 type="button"onClick={() => {
 closeModal();
 resetForm();
 }}
 className="px-6 py-3 font-bold text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] transition-colors">
 Cancel
 </button>
 ) : (
 <button
 type="button"onClick={prevStep}
 className="flex items-center gap-2 px-6 py-3 font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-white transition-colors">
 <ChevronLeft className="w-4 h-4"/>
 Back
 </button>
 )}

 {currentStep === totalSteps ? (
 <button
 type="button"onClick={handleSubmit}
 disabled={createMutation.isPending}
 className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
 {createMutation.isPending ?'Creating...':'Create Poll'}
 </button>
 ) : (
 <button
 type="button"onClick={nextStep}
 className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all">
 Next
 <ChevronRight className="w-4 h-4"/>
 </button>
 )}
 </div>
 </div>
 </div>
 </dialog>
 );
}