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

 

 /** Create a new user with email + password */
 const registerUser = (email, password) =>
 createUserWithEmailAndPassword(auth, email, password);

 /** Sign in existing user with email + password */
 const signInUser = (email, password) =>
 signInWithEmailAndPassword(auth, email, password);

 /** Sign in / register via Google popup */
 const googleSignIn = () => signInWithPopup(auth, googleProvider);

 /** Sign out the current user */
 const logOut = () => signOut(auth);

 
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
 </AuthContext.Provider>
 );
};

export default AuthProvider;
