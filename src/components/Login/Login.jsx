import React, { useState, useContext } from"react";
import { NavLink, useNavigate } from"react-router";
import { useAuth } from"../../hooks/useAuth";
import PageTitle from"../common/PageTitle";

const loginStyles =`/* ─────────────────────────────────────────────
 Login styles in JSX
───────────────────────────────────────────── */
.login-checkbox {
 width: 18px;
 height: 18px;
 border-radius: 5px;
 border: 1.5px solid #cbd5e1;
 background: #f8fafc;
 display: flex;
 align-items: center;
 justify-content: center;
 flex-shrink: 0;
 transition: background 0.15s ease, border-color 0.15s ease,
 box-shadow 0.15s ease;
}

.login-checkbox.is-checked {
 border: 1.5px solid transparent;
 background: #0f172a;
 box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
}

.login-social-btn {
 cursor: pointer;
 transition: background 0.2s ease, border-color 0.2s ease,
 box-shadow 0.2s ease, transform 0.2s ease;
}

.login-social-btn--google:hover {
 background: #eaf0fb;
 border-color: #4285f4;
 box-shadow: 0 4px 16px rgba(66, 133, 244, 0.18);
 transform: translateY(-1px);
}

.login-social-btn--facebook:hover {
 background: #e7f0ff;
 border-color: #1877f2;
 box-shadow: 0 4px 16px rgba(24, 119, 242, 0.18);
 transform: translateY(-1px);
}

@keyframes login-spin {
 to { transform: rotate(360deg); }
}
.login-spinner {
 animation: login-spin 0.8s linear infinite;
 flex-shrink: 0;
}`;



/* ── Backend base URL ─────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL ||"http://localhost:3000";

/** Save/upsert user to MongoDB after Google sign-in */
const saveUserToDB = (name, email, photoURL, token) =>
 fetch(`${API_BASE}/users`, {
 method:"POST",
 headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
 body: JSON.stringify({ name, email, photoURL }),
 }).then((r) => r.json());

/* ─────────────────────────────────────────────── */

const Login = () => {
 const { signInUser, googleSignIn } = useAuth();
 const navigate = useNavigate();

 const [showPassword, setShowPassword] = useState(false);
 const [rememberMe, setRememberMe] = useState(false);
 const [emailLoading, setEmailLoading] = useState(false);
 const [googleLoading, setGoogleLoading] = useState(false);
 const [checking, setChecking] = useState(false);
 const [toast, setToast] = useState({
 show: false,
 type:"",
 message:"",
 description:"",
 });
 const [isToastVisible, setIsToastVisible] = useState(false);

 /* ── Toast helpers ─── */
 const showToastMessage = (type, message, description) => {
 setToast({ show: true, type, message, description });
 setTimeout(() => setIsToastVisible(true), 50);
 setTimeout(() => {
 setIsToastVisible(false);
 setTimeout(
 () => setToast({ show: false, type:"", message:"", description:""}),
 400,
 );
 }, 4000);
 };

 const handleCloseToast = () => {
 setIsToastVisible(false);
 setTimeout(
 () => setToast({ show: false, type:"", message:"", description:""}),
 400,
 );
 };

 /* ── Email / Password sign-in ─── */
 const handleSubmit = async (e) => {
 e.preventDefault();
 const email = e.target.email.value.trim();
 const password = e.target.password.value;

 if (!email || !password) {
 showToastMessage("error","Missing Fields","Please enter your email and password.");
 return;
 }

 setChecking(true);
 try {
 const checkRes = await fetch(`${API_BASE}/users/check-email?email=${encodeURIComponent(email)}`);
 const checkData = await checkRes.json();

 if (checkData.error) {
 showToastMessage("error", "Error Checking Account", checkData.error);
 return;
 }

 if (!checkData.exists) {
 navigate("/Register", { state: { email, fromLogin: true } });
 return;
 }

 setEmailLoading(true);
 await signInUser(email, password);
 showToastMessage("success","Login Successful","Welcome back to CivicNest!");
 setTimeout(() => navigate("/"), 1500);
 } catch (err) {
    if (err.message && err.message.toLowerCase().includes("fetch")) {
      showToastMessage("error", "Server Connection Failed", "Could not connect to the backend server. The database or server might be spin-starting on Render (takes ~50s) or CORS is blocking the request. Please wait 1 minute and try again.");
    } else {
      showToastMessage("error", "Authentication Failed", err.message ?? "Invalid email or password.");
    }
 } finally {
 setChecking(false);
 setEmailLoading(false);
 }
 };

 /* ── Google sign-in ─── */
 const handleGoogleSignIn = async () => {
 setGoogleLoading(true);
 try {
 const result = await googleSignIn();
 const firebaseUser = result.user;

 /* Upsert user into MongoDB */
 const token = await firebaseUser.getIdToken();
 await saveUserToDB(
 firebaseUser.displayName ??"",
 firebaseUser.email,
 firebaseUser.photoURL ??"",
 token
 );

 showToastMessage("success","Login Successful",`Welcome, ${firebaseUser.displayName ??"neighbour"}!`);
 setTimeout(() => navigate("/"), 1500);
 } catch (err) {
    /* user closed popup → auth/popup-closed-by-user — don't show that as an error */
    if (err.code !== "auth/popup-closed-by-user") {
      if (err.code === "auth/unauthorized-domain") {
        showToastMessage("error", "Google Sign-In Failed", "Firebase Setup Error: This domain is not authorized. Please add this website's domain in your Firebase Console under Authentication -> Settings -> Authorized Domains.");
      } else if (err.message && err.message.toLowerCase().includes("fetch")) {
        showToastMessage("error", "Server Connection Failed", "Authentication succeeded on Firebase, but MongoDB could not be reached. Free tier servers take ~50 seconds to spin up on first load. Please wait a moment and try again.");
      } else {
        showToastMessage("error", "Google Sign-In Failed", err.message ?? "Please try again.");
      }
    }
 } finally {
 setGoogleLoading(false);
 }
 };

 return (
 <div className="h-screen w-full flex bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] overflow-hidden"style={{ fontFamily:"'Raleway', sans-serif", fontWeight: 500 }}>
 <PageTitle title="Sign In"/>
 {/* Left Side - Clean Form Section */}
 <div className="w-full lg:w-[42%] flex flex-col justify-center px-6 md:px-10 lg:px-12 xl:px-16 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] relative">
 <div className="absolute top-8 left-6 md:left-10 lg:left-12 xl:left-16">
 <NavLink to="/"className="flex items-center gap-2 text-[13px] font-bold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors">
 <svg width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"strokeLinecap="round">
 <polyline points="15 18 9 12 15 6"/>
 </svg>
 Back to Home
 </NavLink>
 </div>
 
 <div className="w-full max-w-[400px] mx-auto mt-12">
 {/* Logo */}
 <div className="flex items-center gap-2.5 mb-10">
 <div className="w-12 h-12 rounded-[14px] bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm overflow-hidden flex-shrink-0">
 <img
 src="https://i.ibb.co/LD7Xxdky/Gemini-Generated-Image-wmnkxewmnkxewmnk.png"alt="CivicNest Logo"className="w-full h-full object-cover"/>
 </div>
 <div className="flex flex-col">
 <span className="text-[28px] text-[#0f172a] tracking-tight leading-none"style={{ fontFamily:"'Montserrat', sans-serif", fontWeight: 900 }}>
 Civic<span className="text-[#0f766e]">Nest</span>
 </span>
 <span className="text-[9px] font-bold uppercase tracking-widest text-[#0f766e] mt-0.5">
 Sustainable Urban Living
 </span>
 </div>
 </div>

 {/* Header */}
 <div className="mb-8">
 <h2 className="text-[32px] font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight">
 Sign in
 </h2>
 <p className="text-[#64748b] text-[13px] mt-1.5">
 Don't have an account?{" "}
 <NavLink
 to={"/Register"}
 className="text-[#6EE7B7] font-semibold hover:underline transition-all">
 Create now
 </NavLink>
 </p>
 </div>

 {/* Form — name attributes added, wired to handleSubmit */}
 <form className="space-y-5"onSubmit={handleSubmit}>
 {/* Email Field */}
 <div className="space-y-1.5">
 <label className="block text-xs font-semibold text-[#94a3b8]">
 E-mail
 </label>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[13px]">
 mail
 </span>
 <input
 type="email"name="email"placeholder="name@email.com"className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-2 border-slate-100 rounded-xl text-[15px] font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] transition-all duration-300"required
 disabled={emailLoading || googleLoading || checking}
 />
 </div>
 </div>

 {/* Password Field */}
 <div className="space-y-1.5">
 <label className="block text-xs font-semibold text-[#94a3b8]">
 Password
 </label>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[13px]">
 lock
 </span>
 <input
 type={showPassword ?"text":"password"}
 name="password"placeholder="••••••••"className="w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-2 border-slate-100 rounded-xl text-[15px] font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] transition-all duration-300"required
 disabled={emailLoading || googleLoading || checking}
 />
 <button
 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-slate-600 dark:text-slate-300 transition-colors"type="button"onClick={() => setShowPassword(!showPassword)}
 >
 <span className="material-symbols-outlined text-[13px]">
 {showPassword ?"visibility_off":"visibility"}
 </span>
 </button>
 </div>
 </div>

 {/* Remember Me & Forgot Password */}
 <div className="flex items-center justify-between">
 <label
 className="flex items-center gap-2 cursor-pointer group"onClick={() => setRememberMe(!rememberMe)}
 >
 {/* Custom checkbox — styled via Login.css */}
 <div className={`login-checkbox${rememberMe ?"is-checked":""}`}>
 {rememberMe && (
 <svg width="10"height="10"viewBox="0 0 10 10"fill="none">
 <polyline
 points="1.5,5 4,7.5 8.5,2.5"stroke="white"strokeWidth="1.7"strokeLinecap="round"strokeLinejoin="round"/>
 </svg>
 )}
 </div>
 <span className="text-[13px] text-[#475569] group-hover:text-[#0f172a] transition-colors select-none">
 Remember me
 </span>
 </label>
 <a
 href="#"className="text-[13px] font-medium text-[#0f766e] hover:underline transition-all">
 Forgot Password?
 </a>
 </div>

 {/* Sign In Button */}
 <button
 className="w-full h-[48px] bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-[13px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"type="submit"disabled={emailLoading || googleLoading || checking}
 >
 {checking ? (
 <>
 <svg
 className="login-spinner"width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"strokeLinecap="round">
 <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
 </svg>
 Checking account…
 </>
 ) : emailLoading ? (
 <>
 <svg
 className="login-spinner"width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"strokeLinecap="round">
 <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
 </svg>
 Signing in…
 </>
 ) : ("Sign in")}
 </button>
 </form>

 {/* Divider */}
 <div className="relative my-6">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-[#e2e8f0]"></div>
 </div>
 <div className="relative flex justify-center">
 <span className="px-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-[#94a3b8] text-xs font-medium">
 Or continue with
 </span>
 </div>
 </div>

 {/* Social Login */}
 <div className="space-y-3">
 {/* Google — wired to handleGoogleSignIn */}
 <button
 type="button"onClick={handleGoogleSignIn}
 disabled={emailLoading || googleLoading}
 className="login-social-btn login-social-btn--google w-full h-[48px] flex items-center justify-center gap-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-[#e2e8f0] rounded-xl text-[13px] disabled:opacity-60 disabled:cursor-not-allowed">
 {googleLoading ? (
 <svg className="login-spinner"style={{ stroke:'#475569', marginRight:'8px'}} width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2.5"strokeLinecap="round">
 <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
 </svg>
 ) : (
 <svg className="w-5 h-5"viewBox="0 0 24 24">
 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"fill="#4285F4"/>
 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"fill="#34A853"/>
 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"fill="#FBBC05"/>
 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"fill="#EA4335"/>
 </svg>
 )}
 <span className="text-[#334155] font-medium text-[13px]">{googleLoading ?"Signing in...":"Continue with Google"}</span>
 </button>

 {/* Facebook — placeholder (no Facebook provider in AuthProvider) */}
 <button
 type="button"disabled
 className="login-social-btn login-social-btn--facebook w-full h-[48px] flex items-center justify-center gap-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-[#e2e8f0] rounded-xl text-[13px] opacity-50 cursor-not-allowed"title="Facebook sign-in coming soon">
 <svg className="w-5 h-5"viewBox="0 0 24 24"fill="#1877F2">
 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
 </svg>
 <span className="text-[#334155] font-medium text-[13px]">Continue with Facebook</span>
 </button>
 </div>
 </div>
 </div>

 {/* Right Side - Hero Image Section (Preserved) */}
 <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-[#0f766e]/30 via-[#0f766e]/15 to-transparent z-10"></div>
 <img
 alt="Community volunteers cleaning a park"className="absolute inset-0 w-full h-full object-cover"src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1470&auto=format&fit=crop"/>

 {/* Overlay Content */}
 <div className="relative z-20 flex flex-col justify-end p-12 xl:p-16 w-full">
 <div className="max-w-md">
 <h2 className="text-white text-3xl tracking-tight xl:text-4xl tracking-tight font-bold leading-tight tracking-tight mb-3 drop-shadow-sm">
 Restore your local sanctuary.
 </h2>
 <p className="text-white/90 text-[13px] font-medium drop-shadow-sm">
 Join 2,400+ neighbors curating the cleanliness and beauty of our
 shared public spaces.
 </p>

 {/* Stats */}
 <div className="flex items-center gap-4 mt-8">
 <div>
 <p className="text-white/70 text-xs uppercase tracking-wider">
 Active Issues
 </p>
 <p className="text-white text-2xl tracking-tight font-bold">1,847</p>
 </div>
 <div className="w-px h-8 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/30"></div>
 <div>
 <p className="text-white/70 text-xs uppercase tracking-wider">
 Resolved
 </p>
 <p className="text-white text-2xl tracking-tight font-bold">12,492</p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Toast Notification */}
 {toast.show && (
 <div
 className={`fixed top-5 right-5 z-[100] transition-all duration-500 ease-out ${
 isToastVisible
 ?"translate-x-0 opacity-100":"translate-x-full opacity-0"}`}
 >
 <div
 className={`flex items-center gap-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] pl-5 pr-6 py-4 rounded-lg shadow-2xl border ${
 toast.type ==="error"?"border-[#ffcdd2]":"border-[#c8e6c9]"} min-w-[360px]`}
 >
 <div
 className={`flex items-center justify-center w-9 h-9 rounded-full ${
 toast.type ==="error"?"bg-[#ba1a1a]/10 text-[#ba1a1a]":"bg-[#10b981]/10 text-[#10b981]"}`}
 >
 <span className="material-symbols-outlined text-[13px] tracking-tight">
 {toast.type ==="error"?"error":"check_circle"}
 </span>
 </div>
 <div className="flex-1">
 <p className="text-[#0f172a] font-bold text-[13px]">{toast.message}</p>
 <p className="text-[#475569] text-xs mt-0.5">{toast.description}</p>
 </div>
 <button
 className="text-[#94a3b8] hover:text-[#475569] transition-colors"onClick={handleCloseToast}
 >
 <span className="material-symbols-outlined text-[13px] tracking-tight">close</span>
 </button>
 </div>
 </div>
 )}
 <style>{loginStyles}</style>
 </div>
 );
};

export default Login;
