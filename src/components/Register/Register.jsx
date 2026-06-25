import React, { useContext, useState, useEffect } from"react";
import { motion, AnimatePresence } from"framer-motion";
import { NavLink, useNavigate, useLocation } from"react-router";
import { updateProfile, sendEmailVerification } from"firebase/auth";
import PageTitle from"../common/PageTitle";

import { registerStyles } from"./RegisterStyles.js";
import {
 IMAGES,
 SLIDE_TEXTS,
 STATS,
 AVATARS,
 STEPS,
 STEP_LABELS,
 STEP_PLACEHOLDERS,
 STEP_HINTS,
 PASSWORD_CHECKS,
 BADGES,
} from"./styleInfo";
import { AuthContext } from"../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL ||"http://localhost:3000";

const saveUserToDB = (name, email, photoURL, token) =>
 fetch(`${API_BASE}/users`, {
 method:"POST",
 headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
 body: JSON.stringify({
 name,
 email,
 photoURL,
 }),
 }).then((r) => {
 if (!r.ok) {
 // If the server returns an error page (HTML) or non-JSON, we handle it
 return r.text().then(text => {
 try {
 return JSON.parse(text);
 } catch (e) {
 throw new Error(`Server returned status ${r.status}`);
 }
 });
 }
 return r.json();
 });

const EyeIcon = ({ open }) => (
 <svg width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 {open ? (
 <>
 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
 <circle cx="12"cy="12"r="3"/>
 </>
 ) : (
 <>
 <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
 <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
 <line x1="1"y1="1"x2="23"y2="23"/>
 </>
 )}
 </svg>
);

const CheckIcon = ({ filled }) => (
 <svg width="16"height="16"viewBox="0 0 16 16"fill="none">
 <circle cx="8"cy="8"r="7.5"fill={filled ?"#0f766e":"none"}
 stroke={filled ?"#0f766e":"#CBD5E1"}
 strokeWidth="1.5"/>
 {filled && (
 <path d="M5 8l2 2 4-4"stroke="white"strokeWidth="1.8"strokeLinecap="round"strokeLinejoin="round"/>
 )}
 </svg>
);

const Toast = ({ toast, onClose }) => (
 <AnimatePresence>
 {toast.show && (
 <motion.div
 initial={{ x: 100, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 exit={{ x: 100, opacity: 0 }}
 transition={{ type:"spring", stiffness: 400, damping: 30 }}
 className="reg-toast-wrapper">
 <div className={`reg-toast-card ${
 toast.type ==="error"?"reg-toast-card--error":"reg-toast-card--success"}`}>
 <div className={`reg-toast-icon-wrap ${
 toast.type ==="error"?"reg-toast-icon-wrap--error":"reg-toast-icon-wrap--success"}`}>
 <svg width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"strokeLinecap="round">
 {toast.type ==="error"? (
 <>
 <circle cx="12"cy="12"r="10"/>
 <line x1="15"y1="9"x2="9"y2="15"/>
 <line x1="9"y1="9"x2="15"y2="15"/>
 </>
 ) : (
 <>
 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
 <polyline points="22 4 12 14.01 9 11.01"/>
 </>
 )}
 </svg>
 </div>
 <div className="reg-toast-body">
 <p className="reg-toast-msg">{toast.message}</p>
 <p className="reg-toast-desc">{toast.description}</p>
 </div>
 <button onClick={onClose} className="reg-toast-close">
 <svg width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"strokeLinecap="round">
 <line x1="18"y1="6"x2="6"y2="18"/>
 <line x1="6"y1="6"x2="18"y2="18"/>
 </svg>
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
);

export default function Register() {
 const { registerUser, googleSignIn } = useContext(AuthContext);
 const navigate = useNavigate();
 const location = useLocation();

 
 const [currentStep, setCurrentStep] = useState(0);
 const [formData, setFormData] = useState({
 fullName:"", email:"", photoURL:"", password:"",
 });

 useEffect(() => {
 if (location.state?.fromLogin && location.state?.email) {
 setFormData((prev) => ({ ...prev, email: location.state.email }));
 showToast("success", "Email Pre-filled", "No account was found for this email. Complete registration to continue.");
 }
 }, [location.state]);

 const [showPassword, setShowPassword] = useState(false);
 const [checks, setChecks] = useState({
 hasMin: false, hasUpper: false, hasLower: false,
 });
 const [toast, setToast] = useState({ show: false, type:"", message:"", description:""});
 const [bgIndex, setBgIndex] = useState(0);
 const [submitted, setSubmitted] = useState(false);
 const [emailLoading, setEmailLoading] = useState(false);
 const [googleLoading, setGoogleLoading] = useState(false);

 /* Auto-advance slideshow */
 useEffect(() => {
 const id = setInterval(() => setBgIndex((i) => (i + 1) % IMAGES.length), 6000);
 return () => clearInterval(id);
 }, []);

 
 const showToast = (type, message, description) => {
 setToast({ show: true, type, message, description });
 setTimeout(() => setToast((t) => ({ ...t, show: false })), 4500);
 };
 const showError = (msg) => showToast("error","Error", msg);
 const showSuccess = (msg) => showToast("success","Account Created!", msg);

 
 const handleChange = (val) => {
 const key = STEPS[currentStep];
 setFormData((fd) => ({ ...fd, [key]: val }));
 if (key ==="password") {
 setChecks({
 hasMin: val.length >= 6,
 hasUpper: /[A-Z]/.test(val),
 hasLower: /[a-z]/.test(val),
 });
 }
 };

 const handleNext = () => {
 const key = STEPS[currentStep];
 if (!formData[key] && key !=="photoURL") {
 showError(`Please enter your ${STEP_LABELS[currentStep].toLowerCase()}.`);
 return;
 }
 if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
 else handleEmailPasswordSubmit();
 };

 
 const handleEmailPasswordSubmit = async () => {
 const { hasMin, hasUpper, hasLower } = checks;
 if (!hasMin || !hasUpper || !hasLower) {
 showError("Password needs 6+ chars, one uppercase and one lowercase.");
 return;
 }

 setEmailLoading(true);
 try {
 /* Step 1 — Create Firebase Auth user */
 const credential = await registerUser(formData.email, formData.password);
 const firebaseUser = credential.user;

 /* Step 2 — Set displayName + photoURL on Firebase profile */
 await updateProfile(firebaseUser, {
 displayName: formData.fullName,
 photoURL: formData.photoURL ||"",
 });

 /* Step 3 — Send verification email safely */
 try {
 await sendEmailVerification(firebaseUser);
 } catch (e) {
 console.warn("Could not send verification email", e);
 }

 /* Step 4 — Save to MongoDB using normalized Firebase email */
 const token = await firebaseUser.getIdToken();
 const dbResult = await saveUserToDB(
 formData.fullName,
 firebaseUser.email,
 formData.photoURL ||"",
 token
 );
 
 if (dbResult.error) {
 throw new Error(dbResult.error);
 }

 console.log("[Register] MongoDB result:", dbResult);

 /* Step 5 — Success */
 setSubmitted(true);
 showSuccess("Welcome to CivicNest! Check your email to verify.");
 setTimeout(() => navigate("/"), 4600);

 } catch (err) {
    console.error("[Register] Email/password error:", err);
    if (err.message && err.message.toLowerCase().includes("fetch")) {
      showError("Server Connection Failed: The backend API could not be reached. If it is hosted on a free Render tier, it may be waking up (cold starts can take ~50 seconds). Please wait a moment and try again.");
    } else {
      showError(err.message ?? "Registration failed. Please try again.");
    }
  } finally {
    setEmailLoading(false);
  }
  };

 
 const handleGoogleSignIn = async () => {
 setGoogleLoading(true);
 try {
 const credential = await googleSignIn();
 const firebaseUser = credential.user;

 /* Save to MongoDB */
 const token = await firebaseUser.getIdToken();
 const dbResult = await saveUserToDB(
 firebaseUser.displayName ??"",
 firebaseUser.email,
 firebaseUser.photoURL ??"",
 token
 );
 console.log("[Register] Google → MongoDB result:", dbResult);

 setSubmitted(true);
 showSuccess(`Welcome, ${firebaseUser.displayName ??"neighbour"}! You're in.`);
 setTimeout(() => navigate("/"), 4600);

 } catch (err) {
    console.error("[Register] Google error:", err);
    if (err.code !== "auth/popup-closed-by-user") {
      if (err.code === "auth/unauthorized-domain") {
        showError("Firebase Setup Error: This domain is not authorized for OAuth. Please log in to your Firebase Console, navigate to Authentication -> Settings -> Authorized Domains, and add your production domain to the list.");
      } else if (err.message && err.message.toLowerCase().includes("fetch")) {
        showError("Server Connection Failed: Authentication succeeded on Firebase, but MongoDB could not be reached. Free tier servers take ~50 seconds to spin up on first load. Please wait a moment and try again.");
      } else {
        showError(err.message ?? "Google sign-up failed. Please try again.");
      }
    }
 } finally {
    setGoogleLoading(false);
  }
  };

 
 const isPasswordStep = currentStep === 3;
 const isPasswordValid = checks.hasMin && checks.hasUpper && checks.hasLower;

 const ctaBtnMod = submitted || emailLoading || googleLoading
 ?"reg-cta-btn--submitted": isPasswordStep && !isPasswordValid && formData.password
 ?"reg-cta-btn--weak":"reg-cta-btn--default";

 const stepCircleMod = (i) =>
 i < currentStep ?"reg-step-circle--done":
 i === currentStep ?"reg-step-circle--active":"reg-step-circle--pending";

 const stepColMod = (i) =>
 i === 0 ?"reg-step-col--first":
 i === STEPS.length - 1 ?"reg-step-col--last":"reg-step-col--mid";

 const ctaLabel = () => {
 if (submitted) return"Account Created!";
 if (emailLoading) return"Please wait…";
 if (currentStep < STEPS.length - 1) return"Continue";
 return"Create Free Account →";
 };

 
 return (
 <div className="reg-root">
 <PageTitle title="Register"/>
 <Toast toast={toast} onClose={() => setToast((t) => ({ ...t, show: false }))} />

 {}
 <div className="reg-left-panel">

 {/* Slideshow images */}
 <AnimatePresence mode="popLayout">
 <motion.div
 key={bgIndex}
 initial={{ opacity: 0, scale: 1.04 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 1.02 }}
 transition={{ duration: 0.35, ease:"easeInOut"}}
 className="reg-bg-img-wrapper">
 <img src={IMAGES[bgIndex]} alt="Community action"className="reg-bg-img"/>
 </motion.div>
 </AnimatePresence>

 <div className="reg-overlay-primary"/>
 <div className="reg-overlay-secondary"/>

 <div className="reg-left-content">

 {/* Logo */}
 <motion.div 
 initial={{ opacity: 0, y: -16 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ delay: 0.2 }}
 className="z-20 mb-12">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-[14px] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 backdrop-blur-md border-2 border-white/40 shadow-sm overflow-hidden flex-shrink-0">
 <img
 src="https://i.ibb.co/LD7Xxdky/Gemini-Generated-Image-wmnkxewmnkxewmnk.png"alt="CivicNest Logo"className="w-full h-full object-cover"/>
 </div>
 <div className="flex flex-col">
 <span className="text-[28px] text-white tracking-tight leading-none"style={{ fontFamily:"'Montserrat', sans-serif", fontWeight: 900 }}>
 Civic<span className="text-[#6EE7B7]">Nest</span>
 </span>
 <span className="text-[9px] font-bold uppercase pl-1 tracking-widest text-[#f4d35e] mt-0.5">
 Sustainable Urban Living
 </span>
 </div>
 </div>
 </motion.div>

 {/* Middle — badge + animated text + stats */}
 <div className="reg-middle-section">
 {/* Badge pinned absolute — never shifts with text animation */}
 <div className="reg-badge">
 <div className="reg-badge-dot"/>
 <span className="reg-badge-text">{BADGES[bgIndex]}</span>
 </div>

 <div className="reg-slide-text-container">
 <AnimatePresence mode="wait">
 <motion.div
 key={bgIndex}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.35, delay: 0.2, ease:"easeOut"}}
 className="reg-slide-text-inner">
 <h2 className="reg-slide-title tracking-tight">{SLIDE_TEXTS[bgIndex].title}</h2>
 <p className="reg-slide-desc">{SLIDE_TEXTS[bgIndex].desc}</p>
 </motion.div>
 </AnimatePresence>
 </div>

 <div className="reg-stats-row">
 {STATS.map((s, i) => (
 <motion.div key={i}
 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.6 + i * 0.1 }}
 >
 <p className="reg-stat-value">{s.value}</p>
 <p className="reg-stat-label">{s.label}</p>
 </motion.div>
 ))}
 </div>
 </div>

 {/* Social proof */}
 <motion.div
 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.7 }}
 className="reg-social-proof">
 <div className="reg-avatar-stack">
 {AVATARS.map((src, i) => (
 <img key={i} src={src} alt="Member"className="reg-avatar"/>
 ))}
 <div className="reg-avatar-extra">+12k</div>
 </div>
 <div>
 <p className="reg-proof-title">15,000+ neighbors joined</p>
 <p className="reg-proof-sub">across 40+ cities this month</p>
 </div>
 </motion.div>
 </div>

 {/* Indicator dots */}
 <div className="reg-indicators">
 {IMAGES.map((_, i) => (
 <button
 key={i}
 onClick={() => setBgIndex(i)}
 className={`reg-indicator-dot${i === bgIndex ?"is-active":""}`}
 />
 ))}
 </div>
 </div>

 {}
 <div className="reg-right-panel">
 <div className="reg-topbar">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 transition={{ delay: 0.3 }}
 >
 <NavLink to="/"className="reg-back-link">
 <svg width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round">
 <polyline points="15 18 9 12 15 6"/>
 </svg>
 Back to Home
 </NavLink>
 </motion.div>
 </div>

 <div className="reg-form-center">
 <div className="reg-form-inner">

 {/* Header */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.15 }} className="reg-form-header">
 <h1 className="reg-form-title tracking-tight">Join <span style={{ fontFamily:"'Montserrat', sans-serif", fontWeight: 900 }}>Civic<span className="text-[#0f766e]">Nest</span></span></h1>
 <p className="reg-form-subtitle">
 Report issues, fund cleanups, make a difference.
 </p>
 </motion.div>

 {/* Step progress */}
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 transition={{ delay: 0.2 }} className="reg-progress-wrapper">
 <div className="reg-steps-row">
 {STEPS.map((_, i) => (
 <div key={i} className={`reg-step-col ${stepColMod(i)}`}>
 <div className={`reg-step-circle ${stepCircleMod(i)}`}>
 {i < currentStep ? (
 <svg width="12"height="12"viewBox="0 0 24 24"fill="none"stroke="white"strokeWidth="3"strokeLinecap="round">
 <polyline points="20 6 9 17 4 12"/>
 </svg>
 ) : (
 <span className={`reg-step-number ${
 i === currentStep ?"reg-step-number--active":"reg-step-number--pending"}`}>
 {i + 1}
 </span>
 )}
 </div>
 </div>
 ))}
 </div>

 <div className="reg-progress-track">
 <motion.div
 className="reg-progress-fill"animate={{ width:`${(currentStep / (STEPS.length - 1)) * 100}%`}}
 transition={{ duration: 0.5, ease:"easeOut"}}
 />
 </div>

 <p className="reg-progress-label">
 Step {currentStep + 1} of {STEPS.length} — {STEP_LABELS[currentStep]}
 </p>
 </motion.div>

 {/* Animated field */}
 <div className="reg-field-wrapper">
 <AnimatePresence mode="wait">
 <motion.div
 key={currentStep}
 initial={{ opacity: 0, x: 30 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -30 }}
 transition={{ type:"spring", stiffness: 350, damping: 30 }}
 >
 <label className="reg-field-label">{STEP_LABELS[currentStep]}</label>

 <div className="reg-input-wrap">
 <input
 autoFocus
 type={
 isPasswordStep
 ? showPassword ?"text":"password": currentStep === 1 ?"email":"text"}
 value={formData[STEPS[currentStep]]}
 onChange={(e) => handleChange(e.target.value)}
 onKeyDown={(e) => e.key ==="Enter"&& handleNext()}
 placeholder={STEP_PLACEHOLDERS[currentStep]}
 className="reg-input"disabled={emailLoading || googleLoading || submitted}
 />
 {isPasswordStep && (
 <button type="button"onClick={() => setShowPassword((v) => !v)}
 className="reg-eye-btn"disabled={emailLoading || googleLoading || submitted}
 >
 <EyeIcon open={showPassword} />
 </button>
 )}
 </div>

 <p className="reg-field-hint">{STEP_HINTS[currentStep]}</p>

 {/* Password strength checklist */}
 {isPasswordStep && (
 <motion.div
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="reg-pw-checks">
 {PASSWORD_CHECKS.map(({ key, label }) => (
 <div key={key} className="reg-pw-check-item">
 <CheckIcon filled={checks[key]} />
 <span className={`reg-pw-check-label ${
 checks[key] ?"reg-pw-check-label--valid":"reg-pw-check-label--invalid"}`}>
 {label}
 </span>
 </div>
 ))}
 </motion.div>
 )}
 </motion.div>
 </AnimatePresence>
 </div>

 {/* Previous steps preview */}
 {currentStep > 0 && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 className="reg-preview-card">
 {STEPS.slice(0, currentStep).map((key, i) =>
 formData[key] ? (
 <div key={key} className={`reg-preview-row${
 i < currentStep - 1 ?"reg-preview-row--bordered":""}`}>
 <span className="reg-preview-key">{STEP_LABELS[i]}</span>
 <div className="reg-preview-val-group">
 <span className="reg-preview-val">
 {key ==="password"?"••••••••": formData[key]}
 </span>
 <button
 onClick={() => !emailLoading && !googleLoading && !submitted && setCurrentStep(i)}
 className="reg-preview-edit-btn">
 Edit
 </button>
 </div>
 </div>
 ) : null
 )}
 </motion.div>
 )}

 {/* CTA — Continue / Create Free Account */}
 <motion.button
 onClick={handleNext}
 disabled={submitted || emailLoading || googleLoading}
 whileHover={!submitted && !emailLoading && !googleLoading ? { scale: 1.01, y: -2 } : {}}
 whileTap={!submitted && !emailLoading && !googleLoading ? { scale: 0.98 } : {}}
 className={`reg-cta-btn ${ctaBtnMod}`}
 >
 {emailLoading && !submitted ? (
 <svg className="reg-cta-spinner"width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="white"strokeWidth="2.5"strokeLinecap="round">
 <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
 </svg>
 ) : submitted ? (
 <svg width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="white"strokeWidth="2.5"strokeLinecap="round">
 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
 <polyline points="22 4 12 14.01 9 11.01"/>
 </svg>
 ) : currentStep < STEPS.length - 1 ? (
 <svg width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="white"strokeWidth="2.5"strokeLinecap="round"className="reg-cta-arrow">
 <polyline points="9 18 15 12 9 6"/>
 </svg>
 ) : null}
 {ctaLabel()}
 </motion.button>

 {/* Divider */}
 <div className="reg-divider">
 <div className="reg-divider-line"/>
 <span className="reg-divider-text">Or</span>
 <div className="reg-divider-line"/>
 </div>

 {/* Google sign-up */}
 <motion.button
 type="button"onClick={handleGoogleSignIn}
 disabled={submitted || emailLoading || googleLoading}
 whileHover={!submitted && !emailLoading && !googleLoading ? { scale: 1.01, y: -1 } : {}}
 whileTap={!submitted && !emailLoading && !googleLoading ? { scale: 0.99 } : {}}
 className="reg-google-btn">
 {googleLoading ? (
 <svg className="reg-cta-spinner"style={{ stroke:'currentColor', marginRight:'8px'}} width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"strokeLinecap="round">
 <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
 </svg>
 ) : (
 <svg width="18"height="18"viewBox="0 0 24 24">
 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"fill="#4285F4"/>
 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"fill="#34A853"/>
 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"fill="#FBBC05"/>
 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"fill="#EA4335"/>
 </svg>
 )}
 {googleLoading ?"Signing up...":"Sign up with Google"}
 </motion.button>

 {/* Sign-in link */}
 <p className="reg-signin-text">
  Already have a nest?{" "}
  <NavLink to="/Login"className="reg-signin-link">
 Sign In →
 </NavLink>
 </p>
 </div>
 </div>
 </div>
 <style>{registerStyles}</style>
 </div>
 );
}
