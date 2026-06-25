import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX, FiInfo, FiLoader, FiArrowRight, FiSmile, FiRefreshCw } from "react-icons/fi";
import { FaRobot } from "react-icons/fa6";
import { LuSparkles } from "react-icons/lu";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const parseBoldText = (text) => {
  if (!text) return "";
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part}</strong>;
    }
    return part;
  });
};

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const cleanLine = line.trim();
    if (cleanLine === "---" || cleanLine === "___" || cleanLine === "***") {
      return <hr key={idx} className="my-3 border-slate-200 dark:border-slate-800" />;
    }
    if (cleanLine.startsWith("###")) {
      const headerText = cleanLine.replace(/^###\s*/, "");
      return (
        <h4 key={idx} className="text-xs font-bold text-slate-800 dark:text-white mt-3 mb-1">
          {parseBoldText(headerText)}
        </h4>
      );
    }
    if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
      const itemText = cleanLine.replace(/^[*+-]\s*/, "");
      return (
        <li key={idx} className="ml-3 list-disc text-[11px] text-slate-600 dark:text-slate-350 mb-0.5 leading-relaxed">
          {parseBoldText(itemText)}
        </li>
      );
    }
    if (/^\d+\.\s+/.test(cleanLine)) {
      const itemText = cleanLine.replace(/^\d+\.\s+/, "");
      const numMatch = cleanLine.match(/^(\d+)\.\s+/);
      const num = numMatch ? numMatch[1] : "1";
      return (
        <div key={idx} className="flex gap-1 text-[11px] text-slate-600 dark:text-slate-350 mb-1 leading-relaxed pl-0.5">
          <span className="font-bold text-teal-600 dark:text-teal-400">{num}.</span>
          <span className="flex-1">{parseBoldText(itemText)}</span>
        </div>
      );
    }
    if (!cleanLine) {
      return <div key={idx} className="h-1.5" />;
    }
    return (
      <p key={idx} className="text-[11px] text-slate-600 dark:text-slate-350 mb-1 leading-relaxed">
        {parseBoldText(cleanLine)}
      </p>
    );
  });
};

const extractCleanDescription = (text) => {
  if (!text) return "";
  let descMatch = text.match(/(?:\*\*Description:\*\*|Description:)\s*([\s\S]*?)(?:\r?\n\r?\n|\r?\n\d\.\s*|$)/i);
  if (!descMatch) {
    descMatch = text.match(/(?:2\.\s*\*?\*?Description\*?\*?:)\s*([\s\S]*?)(?:3\.\s*\*?\*?Estimated|$)/i);
  }
  if (!descMatch) {
    descMatch = text.match(/(?:\*\*Polished Description:\*\*|Polished Description:)\s*([\s\S]*?)(?:\r?\n\r?\n|\r?\n\d\.\s*|$)/i);
  }
  let extracted = "";
  if (descMatch && descMatch[1]) {
    extracted = descMatch[1].trim();
  } else {
    extracted = text;
    extracted = extracted.replace(/^Here's[^:]+:\s*(?:---)?\s*/i, "");
  }
  return extracted
    .replace(/\*\*/g, '')
    .replace(/^["'-\s]+|["'-\s]+$/g, '')
    .trim();
};

const FloatingCivicBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); //'chat' or 'wizard'
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am CivicBot, your AI helper for CivicNest. How can I assist you with your neighborhood issues or community questions today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Wizard state
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState({
    issueType: "",
    severity: "",
    details: "",
  });
  const [wizardResult, setWizardResult] = useState(null);

  const axiosSecure = useAxiosSecure();
  const chatEndRef = useRef(null);

  // Listen for global event to open the bot (e.g. from the navigation drawer)
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("open-civic-bot", handleOpenEvent);
    return () => window.removeEventListener("open-civic-bot", handleOpenEvent);
  }, []);

  // Listen for contextual prompts from the User Manual
  useEffect(() => {
    const handleCivicBotOpen = (e) => {
      setIsOpen(true);
      setActiveTab("chat");
      if (e.detail && e.detail.prompt) {
        setInputMessage(e.detail.prompt);
      }
    };
    window.addEventListener("civicbot:open", handleCivicBotOpen);
    return () => window.removeEventListener("civicbot:open", handleCivicBotOpen);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage("");
    setChatMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      // Create request payload using last 10 messages for context
      const contextMessages = chatMessages.slice(-10).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        content: msg.content
      }));
      contextMessages.push({ role: "user", content: userText });

      const res = await axiosSecure.post("/ai/chat", {
        messages: contextMessages,
        mode: "general",
      });

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response }
      ]);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "I am currently offline. Please try again in a bit!";
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${errMsg}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleWizardNext = async () => {
    if (wizardStep === 2) {
      setLoading(true);
      try {
        const mode = wizardAnswers.issueType === "Animal Help" ? "animal-tip" : "issue-helper";
        const prompt = `I want to report an issue. Type: ${wizardAnswers.issueType}. Severity: ${wizardAnswers.severity}. Details: ${wizardAnswers.details}`;
        
        const res = await axiosSecure.post("/ai/chat", {
          messages: [{ role: "user", content: prompt }],
          mode: mode,
        });

        setWizardResult(res.data.response);
        setWizardStep(3);
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate description draft. Using offline fallback.");
        setWizardResult(`I am reporting: ${wizardAnswers.details}. Category: ${wizardAnswers.issueType}. Severity: ${wizardAnswers.severity}.`);
        setWizardStep(3);
      } finally {
        setLoading(false);
      }
    } else {
      setWizardStep((prev) => prev + 1);
    }
  };

  const resetWizard = () => {
    setWizardStep(0);
    setWizardAnswers({ issueType: "", severity: "", details: "" });
    setWizardResult(null);
  };

  const issueTypes = ["Garbage & Waste", "Road Damage", "Utility Issue", "Social Problem", "Animal Help"];
  const severities = ["Low", "Medium", "High", "Emergency"];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-body">
      {/* Bot Icon Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative group w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white flex items-center justify-center border border-teal-400/30 shadow-[0_4px_20px_rgba(20,184,166,0.4)] cursor-pointer focus:outline-none"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulsing ring background */}
          <span className="absolute -inset-1.5 rounded-full bg-teal-500/20 blur-sm group-hover:bg-teal-500/30 animate-pulse transition duration-300" />
          
          {/* Custom Animated Robot Head */}
          <div className="relative w-8 h-8 flex flex-col items-center justify-center">
            {/* Robot Head Outer box */}
            <motion.div 
              className="w-7 h-5 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/95 rounded-md relative flex items-center justify-center border border-emerald-600/10 shadow-sm"
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {/* Antenna */}
              <div className="absolute -top-2 w-0.5 h-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/95">
                <motion.div 
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-teal-400"
                  animate={{ scale: [0.8, 1.3, 0.8], backgroundColor: ["#2dd4bf", "#10b981", "#2dd4bf"] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </div>

              {/* Ears */}
              <div className="absolute -left-1 w-1 h-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/80 rounded-l-sm" />
              <div className="absolute -right-1 w-1 h-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/80 rounded-r-sm" />

              {/* Glowing LED Eyes */}
              <div className="flex gap-1.5">
                <motion.div 
                  className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                  animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                  transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.92, 0.94, 1] }}
                />
                <motion.div 
                  className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                  animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                  transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.92, 0.94, 1] }}
                />
              </div>

              {/* Subtle mouth */}
              <div className="absolute bottom-0.5 w-3 h-0.5 bg-teal-600/40 rounded-full" />
            </motion.div>
          </div>

          {/* Sparkle badge */}
          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 dark:text-white rounded-full p-1 text-[9px] font-bold shadow-md border border-amber-300">
            <LuSparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
          </div>
        </motion.button>
      )}

      {/* Slide-out Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-[380px] max-w-[calc(100vw-2rem)] h-[560px] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/50 backdrop-blur-2xl rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/90 dark:to-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center relative">
                  <FaRobot className="text-teal-500 dark:text-teal-400 text-[13px]" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-slate-800 dark:text-white text-[13px] font-bold tracking-tight">CivicBot Assistant</h3>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wider uppercase">Active Support</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <FiX className="text-[13px]" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 p-1">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-2 text-xs font-bold tracking-wider uppercase rounded-lg transition cursor-pointer ${
                  activeTab === "chat"
                    ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Ask Anything
              </button>
              <button
                onClick={() => setActiveTab("wizard")}
                className={`flex-1 py-2 text-xs font-bold tracking-wider uppercase rounded-lg transition cursor-pointer ${
                  activeTab === "wizard"
                    ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Draft Report
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === "chat" ? (
                
                <>
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                          <FaRobot className="text-teal-500 dark:text-teal-400 text-xs" />
                        </div>
                      )}
                      <div 
                        className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[80%] ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium"
                            : "bg-slate-55 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/30"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                        <FiLoader className="animate-spin text-teal-500 dark:text-teal-400 text-xs" />
                      </div>
                      <div className="bg-slate-55 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700/30 rounded-xl px-3 py-2 text-xs">
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              ) : (
                
                <div className="space-y-4">
                  {wizardStep === 0 && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">What category is the issue you reported?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {issueTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => setWizardAnswers({ ...wizardAnswers, issueType: type })}
                            className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition cursor-pointer ${
                              wizardAnswers.issueType === type
                                ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400"
                                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 hover:border-slate-350 dark:hover:border-slate-600"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">What is the urgency level?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {severities.map((sev) => (
                          <button
                            key={sev}
                            onClick={() => setWizardAnswers({ ...wizardAnswers, severity: sev })}
                            className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition cursor-pointer ${
                              wizardAnswers.severity === sev
                                ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400"
                                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 hover:border-slate-350 dark:hover:border-slate-600"
                            }`}
                          >
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Please provide a few raw details:</p>
                      <textarea
                        rows="4"
                        value={wizardAnswers.details}
                        onChange={(e) => setWizardAnswers({ ...wizardAnswers, details: e.target.value })}
                        placeholder="E.g. A trash pile has accumulated on the street and is blocking the pavement near the mosque..."
                        className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
                      />
                    </div>
                  )}

                  {wizardStep === 3 && wizardResult && (
                    <div className="space-y-4">
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1.5">
                        <LuSparkles /> Recommended AI Draft:
                      </p>
                      <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-3 rounded-lg text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                        {renderMarkdown(wizardResult)}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            const cleanDesc = extractCleanDescription(wizardResult);
                            navigator.clipboard.writeText(cleanDesc);
                            toast.success("Polished description copied for reporting form!");
                          }}
                          className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Copy Description Only (For Form)
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(wizardResult);
                              toast.success("Full draft copied to clipboard!");
                            }}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700/50 transition cursor-pointer"
                          >
                            Copy Full Draft
                          </button>
                          <button
                            onClick={resetWizard}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-white text-xs rounded-lg border border-slate-200 dark:border-slate-700/50 transition cursor-pointer"
                            title="Restart"
                          >
                            <FiRefreshCw />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <FiLoader className="animate-spin text-teal-500 dark:text-teal-400 text-[13px]" />
                      AI Drafting recommendations...
                    </div>
                  )}

                  {/* Wizard Action Controls */}
                  {!loading && wizardStep < 3 && (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => setWizardStep((prev) => Math.max(0, prev - 1))}
                        disabled={wizardStep === 0}
                        className={`text-xs font-bold transition cursor-pointer ${
                          wizardStep === 0 
                            ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" 
                            : "text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleWizardNext}
                        disabled={
                          (wizardStep === 0 && !wizardAnswers.issueType) ||
                          (wizardStep === 1 && !wizardAnswers.severity) ||
                          (wizardStep === 2 && wizardAnswers.details.length < 5)
                        }
                        className={`px-4 py-2 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
                          ((wizardStep === 0 && !wizardAnswers.issueType) ||
                          (wizardStep === 1 && !wizardAnswers.severity) ||
                          (wizardStep === 2 && wizardAnswers.details.length < 5))
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-750"
                            : "bg-gradient-to-r from-teal-500 to-emerald-500 shadow-md shadow-teal-500/20 hover:scale-[1.02]"
                        }`}
                      >
                        {wizardStep === 2 ? "Generate Draft" : "Continue"} <FiArrowRight />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Footer (Only for Chat Tab) */}
            {activeTab === "chat" && (
              <form 
                onSubmit={handleSendMessage}
                className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a community question..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/80"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white cursor-pointer transition ${
                    !inputMessage.trim() || loading
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-750"
                      : "bg-gradient-to-r from-teal-500 to-emerald-500 shadow-sm"
                  }`}
                >
                  <FiSend className="text-[13px]" />
                </button>
              </form>
            )}

            {/* Powered by Google Gemini footer */}
            <div className="bg-slate-100 dark:bg-slate-950 p-2 text-[9px] text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-900">
              Powered by Google Gemini · Conversations improve AI safety.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingCivicBot;
