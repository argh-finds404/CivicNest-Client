import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Ask a guest to sign in when they try a members-only action.
 * Fire it from anywhere with `requestLogin("vote in polls")`.
 * The axios interceptor also fires it when a guest request gets a 401.
 */
export const requestLogin = (reason) =>
  window.dispatchEvent(new CustomEvent("app:auth-required", { detail: { reason } }));

export default function AuthPrompt() {
  const [reason, setReason] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const open = (e) => setReason(e.detail?.reason || "continue");
    window.addEventListener("app:auth-required", open);
    return () => window.removeEventListener("app:auth-required", open);
  }, []);

  // Close when the user navigates away
  useEffect(() => setReason(null), [location.pathname]);

  useEffect(() => {
    if (!reason) return undefined;
    const onKey = (e) => e.key === "Escape" && setReason(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reason]);

  return (
    <AnimatePresence>
      {reason && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-slate-950/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setReason(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-prompt-title"
        >
          <motion.div
            className="cn-card w-full max-w-sm p-6 text-center"
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl grid place-items-center bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]">
              <i className="ri-lock-unlock-line text-2xl" />
            </div>
            <h2 id="auth-prompt-title" className="text-lg font-bold text-[var(--cn-ink)]">
              Sign in to {reason}
            </h2>
            <p className="mt-1.5 text-[13px] text-[var(--cn-ink-muted)] leading-relaxed">
              Browsing is open to everyone. Joining in takes a free CivicNest account.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link to="/login" state={{ from: location }} className="cn-btn cn-btn-primary w-full justify-center">
                Log in
              </Link>
              <Link to="/register" state={{ from: location }} className="cn-btn cn-btn-ghost w-full justify-center">
                Create an account
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setReason(null)}
              className="mt-3 text-xs font-semibold text-[var(--cn-ink-muted)] hover:text-[var(--cn-ink)] cursor-pointer"
            >
              Keep browsing
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
