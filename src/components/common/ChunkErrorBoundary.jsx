import React from'react';
import { useRouteError } from'react-router';

export default function ChunkErrorBoundary() {
 const error = useRouteError();

 const isChunkError = 
 error?.name ==='ChunkLoadError'|| 
 error?.message?.includes('Failed to fetch dynamically imported module');

 return (
 <div className="min-h-screen flex flex-col items-center justify-center dark:bg-[#0b1215] p-4 text-center">
 <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
 <i className="ri-error-warning-line text-4xl tracking-tight"></i>
 </div>
 <h1 className="text-2xl tracking-tight font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
 {isChunkError ?'App Update Available':'Something went wrong'}
 </h1>
 <p className="text-slate-500 dark:text-slate-300 max-w-md mb-8">
 {isChunkError 
 ?"We've just updated the application. Please refresh the page to get the latest version.":"An unexpected error occurred while loading this page. Please try again."}
 </p>
 <button 
 onClick={() => window.location.reload()}
 className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2">
 <i className="ri-refresh-line"></i> Reload Page
 </button>
 
 {/* For developers, show the actual error message in development */}
 {import.meta.env.DEV && !isChunkError && (
 <pre className="mt-12 text-xs text-red-400 bg-red-50 p-4 rounded-xl text-left max-w-2xl overflow-auto border border-red-100">
 {error?.stack || error?.message ||'Unknown error'}
 </pre>
 )}
 </div>
 );
}
