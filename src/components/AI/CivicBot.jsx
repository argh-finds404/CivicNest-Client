import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import BackButton from "../common/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiFileText,
  FiInfo,
  FiLoader,
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa6";
import { LuSparkles } from "react-icons/lu";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

// Helper to replace **bold** text with <strong> JSX elements
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

// Helper to parse and render simple markdown block
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const cleanLine = line.trim();
    if (cleanLine === "---" || cleanLine === "___" || cleanLine === "***") {
      return <hr key={idx} className="my-4 border-slate-200 dark:border-slate-700/50" />;
    }
    if (cleanLine.startsWith("###")) {
      const headerText = cleanLine.replace(/^###\s*/, "");
      return (
        <h4 key={idx} className="text-base font-bold text-slate-800 dark:text-white mt-4 mb-2">
          {parseBoldText(headerText)}
        </h4>
      );
    }
    if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
      const itemText = cleanLine.replace(/^[*+-]\s*/, "");
      return (
        <li key={idx} className="ml-4 list-disc text-[13px] text-slate-650 dark:text-slate-300 mb-1 leading-relaxed">
          {parseBoldText(itemText)}
        </li>
      );
    }
    if (/^\d+\.\s+/.test(cleanLine)) {
      const itemText = cleanLine.replace(/^\d+\.\s+/, "");
      const numMatch = cleanLine.match(/^(\d+)\.\s+/);
      const num = numMatch ? numMatch[1] : "1";
      return (
        <div key={idx} className="flex gap-2 text-[13px] text-slate-650 dark:text-slate-300 mb-2 leading-relaxed pl-1">
          <span className="font-bold text-teal-600 dark:text-teal-400">{num}.</span>
          <span className="flex-1">{parseBoldText(itemText)}</span>
        </div>
      );
    }
    if (!cleanLine) {
      return <div key={idx} className="h-2" />;
    }
    return (
      <p key={idx} className="text-[13px] text-slate-650 dark:text-slate-300 mb-2 leading-relaxed">
        {parseBoldText(cleanLine)}
      </p>
    );
  });
};

// Helper to extract clean description narrative (no markdown, intro, or priority/cost tags)
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

const CivicBot = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const axiosSecure = useAxiosSecure();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    issueType: "",
    severity: "",
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const issueTypes = ["Garbage & Waste", "Road Damage", "Utility Issue", "Social Problem", "Animal Help"];
  const severities = ["Low (Not urgent)", "Medium (Needs attention)", "High (Urgent)", "Emergency"];

  const handleNext = () => {
    if (step === 2) {
      getAIRecommendations();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const getAIRecommendations = async () => {
    setLoading(true);
    try {
      const mode = answers.issueType === "Animal Help" ? "animal-tip" : "issue-helper";
      const messageText = `I want to report an issue. Type: ${answers.issueType}. Severity: ${answers.severity}. Details: ${answers.details}`;
      const res = await axiosSecure.post('/ai/chat', {
        messages: [{ role: 'user', content: messageText }],
        mode: mode
      });
      
      const response = res.data.response;
      
      setResult({
        greeting: "Analysis Complete!",
        category: answers.issueType,
        priority: answers.severity,
        draft: response,
        tips: ["Include clear photos when you submit this issue.", "Tag the exact location on the map.", "Check if neighbors have already reported a similar issue."]
      });
      toast.success("AI draft recommendation generated!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate AI recommendations.");
      setResult({
        greeting: "Analysis Complete (Offline Fallback)",
        category: answers.issueType,
        priority: answers.severity,
        draft: `I am reporting: ${answers.details}. Category: ${answers.issueType}. Severity: ${answers.severity}.`,
        tips: ["Include clear photos when you submit.", "Tag location on the map."]
      });
    } finally {
      setLoading(false);
    }
  };

  const resetBot = () => {
    setStep(0);
    setAnswers({ issueType: "", severity: "", details: "" });
    setResult(null);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              What kind of issue are you reporting? <LuSparkles className="text-teal-500 dark:text-teal-400" />
            </h3>
            <div className="flex flex-wrap gap-4">
              {issueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setAnswers({ ...answers, issueType: type })}
                  className={`px-6 py-3 rounded-full border transition-all duration-300 font-bold cursor-pointer ${
                    answers.issueType === type
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-105"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-400/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              How severe is this issue? <FiInfo className="text-rose-500 dark:text-rose-400" />
            </h3>
            <div className="flex flex-wrap gap-4">
              {severities.map((severity) => (
                <button
                  key={severity}
                  onClick={() => setAnswers({ ...answers, severity: severity })}
                  className={`px-6 py-3 rounded-full border transition-all duration-300 font-bold cursor-pointer ${
                    answers.severity === severity
                      ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white border-transparent shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-105"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-400 dark:hover:border-rose-400/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              Any specific details? <FiFileText className="text-blue-500 dark:text-blue-400" />
            </h3>
            <p className="text-slate-500 dark:text-white/50 text-[13px] tracking-wider uppercase font-bold">
              Briefly describe the situation
            </p>
            <textarea
              rows="4"
              value={answers.details}
              onChange={(e) => setAnswers({ ...answers, details: e.target.value })}
              placeholder="E.g. A stray dog is limping near the main gate..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 outline-none text-slate-800 dark:text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (step === 0) return answers.issueType !== "";
    if (step === 1) return answers.severity !== "";
    if (step === 2) return answers.details.length > 5;
    return false;
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-[5%] bg-slate-50 dark:bg-[#050a08] text-slate-800 dark:text-white relative overflow-hidden flex flex-col justify-center transition-colors duration-300">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-teal-500 dark:bg-teal-600 opacity-[0.12] dark:opacity-[0.15] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[40%] bg-emerald-500 dark:bg-emerald-600 opacity-[0.08] dark:opacity-[0.1] blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 pt-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-white dark:bg-slate-800/60 border border-teal-500/20 dark:border-teal-500/30 px-4 py-1.5 rounded-full mb-4 shadow-sm dark:shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <span className="text-teal-600 dark:text-teal-400 text-[13px] font-bold tracking-wider flex items-center gap-2">
              <FaRobot className="text-[13px]" /> Powered by Civic AI
            </span>
          </div>
          <h1 className="text-5xl tracking-tight font-extrabold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent mb-3 drop-shadow-sm">
            CivicBot Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-[13px] font-medium tracking-tight">
            Let me help you draft a highly effective community report.
          </p>
        </div>

        {/* Progress Steps */}
        {!result && !loading && (
          <div className="flex justify-between mb-10 px-4 max-w-2xl mx-auto">
            {["Category", "Severity", "Details"].map((label, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold tracking-widest transition-all duration-500 ease-out border ${
                    step > i
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-[0_0_20px_rgba(20,184,166,0.4)]"
                      : step === i
                      ? "bg-transparent border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400 scale-110 shadow-sm"
                      : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-white/30"
                  }`}
                >
                  {step > i ? <FiCheck /> : i + 1}
                </div>
                <span
                  className={`text-xs mt-3 tracking-widest uppercase font-bold transition-colors duration-500 ${
                    step === i
                      ? "text-teal-600 dark:text-teal-400"
                      : step > i
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-white/30"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Form Container */}
        {!result && !loading && (
          <div className="bg-white/95 dark:bg-slate-800/40 backdrop-blur-2xl rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-700 p-10 max-w-3xl mx-auto relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 transition-all duration-300">
              {renderStep()}
            </div>
            
            <div className="relative z-10 flex justify-between mt-10">
              <button
                onClick={handleBack}
                className={`px-8 py-3 rounded-full border font-bold transition-all duration-300 cursor-pointer ${
                  step > 0
                    ? "border-slate-200 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-450 dark:hover:border-white/40"
                    : "border-slate-100 dark:border-white/5 text-slate-300 dark:text-white/20 cursor-not-allowed"
                }`}
                disabled={step === 0}
              >
                ← Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-full font-extrabold tracking-tight transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  !canProceed()
                    ? "bg-slate-100 dark:bg-slate-900/40 text-slate-400 dark:text-white/30 cursor-not-allowed border border-slate-200 dark:border-slate-800"
                    : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] hover:scale-[1.02] border border-transparent"
                }`}
              >
                {step === 2 ? (
                  <>
                    <LuSparkles /> Generate Draft
                  </>
                ) : ("Continue →")}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 bg-white/95 dark:bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-700 shadow-[0_10px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.4)]">
            <div className="inline-block relative">
              <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-teal-500 dark:border-t-teal-400 animate-spin shadow-sm dark:shadow-[0_0_15px_rgba(20,184,166,0.4)]"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                <FiLoader className="animate-spin text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <p className="text-teal-650 dark:text-teal-450 text-2xl font-extrabold mt-6">
              AI is drafting your report...
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            <div className="bg-white/95 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-colors duration-500">
              <p className="text-4xl mb-3 flex justify-center">
                <LuSparkles className="text-teal-500 dark:text-teal-400" />
              </p>
              <p className="text-3xl text-slate-800 dark:text-white font-extrabold mb-6">
                {result.greeting}
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex justify-center gap-4 flex-wrap pt-2">
                  <span className="px-6 py-2 rounded-full bg-teal-50 dark:bg-slate-800/60 border border-teal-500/20 dark:border-teal-500/40 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-widest uppercase shadow-sm">
                    Category: {result.category}
                  </span>
                  <span className="px-6 py-2 rounded-full bg-rose-50 dark:bg-slate-800/60 border border-rose-500/20 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-widest uppercase shadow-sm">
                    Priority: {result.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Generated Draft */}
            <div className="bg-white/95 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-teal-500/20 rounded-xl p-5 hover:border-teal-500/40 shadow-sm transition-all duration-500">
              <h3 className="text-2xl text-teal-600 dark:text-teal-400 font-extrabold mb-4 flex items-center gap-3">
                <FiFileText /> Recommended Description
              </h3>
              <div className="text-slate-700 dark:text-slate-300 text-[13px] leading-relaxed font-medium bg-slate-50 dark:bg-black/20 p-5 rounded-lg border border-slate-100 dark:border-white/5 space-y-2">
                {renderMarkdown(result.draft)}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <button 
                  onClick={() => {
                    const cleanDesc = extractCleanDescription(result.draft);
                    navigator.clipboard.writeText(cleanDesc);
                    toast.success("Polished description copied for reporting form!");
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-md hover:scale-[1.01] flex items-center gap-2 cursor-pointer"
                >
                  <FiCheck className="text-sm" /> Copy Description Only (For Form)
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(result.draft);
                    toast.success("Full draft copied to clipboard!");
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-750 dark:text-white rounded-xl text-[13px] font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Copy Full Draft
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-500/30 backdrop-blur-xl rounded-xl p-5">
              <h3 className="text-2xl text-slate-800 dark:text-white font-extrabold mb-5 flex items-center gap-3">
                <FiInfo /> Next Steps & Tips
              </h3>
              <ul className="space-y-4">
                {result.tips?.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-[13px] text-slate-650 dark:text-slate-300 font-bold leading-relaxed">
                    <span className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">→</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-8">
              <button
                onClick={resetBot}
                className="px-8 py-3 rounded-full border border-slate-200 dark:border-white/20 text-slate-750 dark:text-white font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Draft Another
              </button>
              <Link
                to={answers.issueType === "Animal Help" ? "/animals/add" : "/issues/add"}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-extrabold tracking-tight shadow-lg hover:shadow-teal-500/40 hover:scale-[1.02] transition-all"
              >
                Go to Report Form →
              </Link>
            </div>
          </div>
        )}
        {/* Return Button to Go Back in Navigation History */}
        <div className="flex justify-center mt-10">
          <BackButton variant="dark">
            Return to Dashboard
          </BackButton>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6">
          Powered by Google Gemini · Conversations may be used to improve AI.
        </p>
      </div>
    </div>
  );
};

export default CivicBot;
