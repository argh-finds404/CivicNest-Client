import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await axiosPublic.get(`/public/search?q=${encodeURIComponent(query)}`);
        if (res.data.success) {
          setResults(res.data.results);
        }
      } catch (err) {
        console.error("Global search error", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 400);
    return () => clearTimeout(debounceTimer);
  }, [query, axiosPublic]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white dark:bg-[#0a120e] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1e3040] overflow-hidden flex flex-col"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-[#1e3040]">
            <i className="ri-search-line text-xl text-slate-400"></i>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search issues, events, notices..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-4 text-[15px] text-slate-800 dark:text-white placeholder-slate-400 font-medium h-10"
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e3040] text-slate-400"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            )}
            <div className="h-6 w-px bg-slate-200 dark:bg-[#1e3040] mx-2"></div>
            <button 
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded"
            >
              ESC
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2" data-lenis-prevent>
            {isSearching ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                <i className="ri-loader-4-line text-2xl animate-spin text-[#0f766e]"></i>
                <span className="text-sm font-medium">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col gap-1">
                {results.map((result) => (
                  <button
                    key={result._id}
                    onClick={() => {
                      navigate(result.link);
                      onClose();
                    }}
                    className="flex items-center justify-between w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0b1215] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e3040] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0f766e]/10">
                        {result.type === 'Issue' && <i className="ri-alert-line text-sm text-amber-500"></i>}
                        {result.type === 'Event' && <i className="ri-calendar-event-line text-sm text-emerald-500"></i>}
                        {result.type === 'Notice' && <i className="ri-notification-3-line text-sm text-indigo-500"></i>}
                        {result.type === 'Lost & Found' && <i className="ri-search-eye-line text-sm text-blue-500"></i>}
                        {result.type === 'Animal Rescue' && <i className="ri-heart-line text-sm text-rose-500"></i>}
                        {result.type === 'NGO' && <i className="ri-shield-user-line text-sm text-teal-500"></i>}
                        {result.type === 'Forum Thread' && <i className="ri-chat-3-line text-sm text-purple-500"></i>}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[13px] font-bold text-slate-800 dark:text-white truncate">
                          {result.title}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                          {result.type}
                        </span>
                      </div>
                    </div>
                    <i className="ri-arrow-right-line text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                <i className="ri-ghost-line text-3xl opacity-50"></i>
                <span className="text-[13px] font-medium">No results found for "{query}"</span>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                <i className="ri-search-eye-line text-3xl opacity-50"></i>
                <span className="text-[13px] font-medium">Type at least 2 characters to search</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSearchModal;
