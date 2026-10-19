import React, { useEffect, useRef, useState } from"react";
import { useQueryClient } from"@tanstack/react-query";
import { AuthContext } from"./AuthContext";
import {
 createUserWithEmailAndPassword,
 getRedirectResult,
 GoogleAuthProvider,
 onAuthStateChanged,
 signInWithEmailAndPassword,
 signInWithPopup,
 signInWithRedirect,
 signOut,
 updateProfile,
} from"firebase/auth";
import { auth } from"../../firebase/firebase.init";

const googleProvider = new GoogleAuthProvider();
const RETURN_KEY = "civicnest-google-return";

/*
 * Firebase loads a helper frame before it opens the Google popup, and on
 * desktop Chrome it only starts that on the first click. If the frame is
 * slow, the popup is no longer tied to the click and Chrome blocks it
 * (auth/popup-blocked). Sign-in pages call this on mount so the frame is
 * ready and the popup opens straight away. Safe to call repeatedly.
 */
const prepareGoogleSignIn = () => {
 try {
 auth._popupRedirectResolver?._initialize(auth)?.catch(() => {});
 } catch {
 // Not available in this SDK version: the popup still works, just later
 }
};

const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const queryClient = useQueryClient();
 const lastUid = useRef(undefined);
 /*
 *`loading`= true ONLY during the one-time initial auth-state check.
 * We do NOT set it to true during login/register — that caused the
 * Register/Login components to unmount mid-flow, losing all state
 * and interrupting async chains (updateProfile, DB save, etc.).
 */
 const [loading, setLoading] = useState(true);
 const [isLoggingOut, setIsLoggingOut] = useState(false);
 const [renderOverlay, setRenderOverlay] = useState(false);

 

 /** Create a new user with email + password */
 const registerUser = (email, password) =>
 createUserWithEmailAndPassword(auth, email, password);

 /** Sign in existing user with email + password */
 const signInUser = (email, password) =>
 signInWithEmailAndPassword(auth, email, password);

 /**
 * Sign in / register with Google. Uses a popup; if the browser blocks it,
 * continues in this tab instead. The page then leaves for Google and comes
 * back, and finishGoogleRedirect() completes the sign-in.
 */
 const googleSignIn = async (returnTo ="/") => {
 try {
 return await signInWithPopup(auth, googleProvider);
 } catch (err) {
 if (err.code !=="auth/popup-blocked") throw err;
 try {
 sessionStorage.setItem(RETURN_KEY, returnTo);
 } catch {
 // storage blocked: the user lands on home after signing in
 }
 await signInWithRedirect(auth, googleProvider);
 return new Promise(() => {}); // the page is navigating to Google
 }
 };

 /** After a same-tab Google sign-in: { user, returnTo }, or null if there was none */
 const finishGoogleRedirect = async () => {
 const result = await getRedirectResult(auth);
 if (!result) return null;
 let returnTo ="/";
 try {
 returnTo = sessionStorage.getItem(RETURN_KEY) ||"/";
 sessionStorage.removeItem(RETURN_KEY);
 } catch {
 // storage blocked: fall back to home
 }
 return { user: result.user, returnTo };
 };

 /** Sign out the current user */
 const logOut = async () => {
    setRenderOverlay(true);
    // Let the overlay mount first, then trigger fade-in in next tick
    setTimeout(() => setIsLoggingOut(true), 50);
    // Wait for the fade-in transition (450ms)
    await new Promise(resolve => setTimeout(resolve, 450));
    await signOut(auth);
    // Wait for navigation / component teardown, then trigger fade-out
    setTimeout(() => {
      setIsLoggingOut(false);
      // Wait for fade-out transition (400ms) before unmounting
      setTimeout(() => {
        setRenderOverlay(false);
      }, 400);
    }, 600);
  };

 
 useEffect(() => {
 const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
 // Someone signed in, out or switched accounts: refetch everything so no page
 // keeps showing data cached for the previous identity (e.g. the guest view
 // of the forum)
 const uid = currentUser?.uid ?? null;
 if (lastUid.current !== undefined && lastUid.current !== uid) {
 queryClient.invalidateQueries();
 }
 lastUid.current = uid;
 setUser(currentUser);
 setLoading(false); // resolved — children can render
 
 // Hide the initial loader if it exists in the DOM
 const loader = document.getElementById('initial-loader');
 if (loader) {
 loader.classList.add('fade-out');
 setTimeout(() => {
 loader.remove();
 }, 500); // match transition duration in CSS
 }
 });
 return () => unsubscribe();
 }, [queryClient]);

 const authInfo = {
 user,
 loading,
 registerUser,
 signInUser,
 googleSignIn,
 finishGoogleRedirect,
 prepareGoogleSignIn,
 logOut,
 updateProfile, // expose so components can call it directly
 };

 return (
 <AuthContext.Provider value={authInfo}>
 {/*
 Show nothing until Firebase resolves the initial auth state.
 After that, children stay mounted permanently — login/register
 actions no longer flip`loading`, so no unexpected unmounts.
 */}
 {loading ? null : children}

 {renderOverlay && (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(11, 18, 21, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'opacity 0.4s ease-in-out',
        opacity: isLoggingOut ? 1 : 0,
        pointerEvents: 'all'
      }}
    >
      <style>{`
        @keyframes auth-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(15, 118, 110, 0.2)',
            borderTop: '4px solid #0f766e',
            borderRadius: '50%',
            animation: 'auth-spin 1s linear infinite',
            margin: '0 auto 16px'
          }}
        />
        <p style={{ color: '#ffffff', fontSize: '14.5px', fontWeight: 'bold', fontFamily:'var(--font-heading)', letterSpacing: '0.05em' }}>
          Signing out securely...
        </p>
      </div>
    </div>
  )}
 </AuthContext.Provider>
 );
};

export default AuthProvider;
