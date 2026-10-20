import React, { useState } from "react";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxiosSecure";

/**
 * Creates (or resets) the reviewer demo accounts on the live server, so the
 * one-click reviewer sign-in on the login page works without a terminal.
 */
export default function ReviewerLoginsPanel({ onDone }) {
  const axiosSecure = useAxiosSecure();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [resetting, setResetting] = useState(false);

  const setUp = async () => {
    setBusy(true);
    try {
      const res = await axiosSecure.post("/admin/reviewer-accounts");
      setResult(res.data);
      toast.success("Reviewer logins are ready.");
      onDone?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't set up reviewer logins.");
    } finally {
      setBusy(false);
    }
  };

  // Puts the demo neighbourhood (members, issues, cleanups, animals, lost &
  // found) back to its starting state; real content is never touched
  const resetDemo = async () => {
    setResetting(true);
    try {
      await axiosSecure.post("/admin/demo-content");
      toast.success("Demo content has been reset.");
      onDone?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't reset the demo content.");
    } finally {
      setResetting(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard?.writeText(text).then(() => toast.success("Copied"), () => {});
  };

  return (
    <section className="cn-glass-card border p-5 mb-6" aria-labelledby="reviewer-logins-title">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="w-11 h-11 shrink-0 rounded-2xl grid place-items-center bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
          <i className="ri-key-2-line text-xl" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 id="reviewer-logins-title" className="text-[15px] font-bold text-slate-900 dark:text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Reviewer logins
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-300">
            Creates the admin, moderator and member demo accounts used by the reviewer buttons on the sign-in page. Running it again resets them.
          </p>
        </div>
        <button type="button" onClick={setUp} disabled={busy} className="cn-btn cn-btn-primary cn-btn-sm shrink-0 disabled:opacity-60">
          <i className={busy ? "ri-loader-4-line animate-spin" : "ri-user-add-line"} aria-hidden="true" />
          {busy ? "Setting up…" : result ? "Reset again" : "Set up reviewer logins"}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="flex-1 text-[13px] text-slate-500 dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Demo content:</span> sample members, issues, cleanup drives, animals and lost &amp; found posts load automatically. Reset them here after a demo.
        </p>
        <button type="button" onClick={resetDemo} disabled={resetting} className="cn-btn cn-btn-ghost cn-btn-sm shrink-0 disabled:opacity-60">
          <i className={resetting ? "ri-loader-4-line animate-spin" : "ri-refresh-line"} aria-hidden="true" />
          {resetting ? "Resetting…" : "Reset demo content"}
        </button>
      </div>

      {result && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {result.accounts.map((a) => (
            <div key={a.email} className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2.5 text-[13px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{a.role}</div>
              <button type="button" onClick={() => copy(a.email)} className="font-semibold text-slate-800 dark:text-white break-all text-left hover:underline cursor-pointer" title="Copy email">
                {a.email}
              </button>
              <div className="text-slate-500 dark:text-slate-300">
                Password:{" "}
                <button type="button" onClick={() => copy(result.password)} className="font-mono hover:underline cursor-pointer" title="Copy password">
                  {result.password}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
