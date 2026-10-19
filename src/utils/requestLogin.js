/**
 * Ask a guest to sign in when they try a members-only action, e.g.
 * requestLogin("vote in polls"). AuthPrompt (mounted in Layout) shows the dialog.
 * The axios interceptor fires the same event when a guest request gets a 401.
 */
export const requestLogin = (reason) =>
  window.dispatchEvent(new CustomEvent("app:auth-required", { detail: { reason } }));
