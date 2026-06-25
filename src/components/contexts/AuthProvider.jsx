import React, { useEffect, useState } from"react";
import { AuthContext } from"./AuthContext";
import {
 createUserWithEmailAndPassword,
 GoogleAuthProvider,
 onAuthStateChanged,
 signInWithEmailAndPassword,
 signInWithPopup,
 signOut,
 updateProfile,
} from"firebase/auth";
import { auth } from"../../firebase/firebase.init";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
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

 /** Sign in / register via Google popup */
 const googleSignIn = () => signInWithPopup(auth, googleProvider);

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
 }, []);

 const authInfo = {
 user,
 loading,
 registerUser,
 signInUser,
 googleSignIn,
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
        <p style={{ color: '#ffffff', fontSize: '14.5px', fontWeight: 'bold', fontFamily: 'HKGrotesk, sans-serif', letterSpacing: '0.05em' }}>
          Signing out securely...
        </p>
      </div>
    </div>
  )}
 </AuthContext.Provider>
 );
};

export default AuthProvider;
