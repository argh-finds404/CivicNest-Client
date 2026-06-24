import { useContext } from "react";
import { AuthContext } from "../components/contexts/AuthContext";

/**
 * useAuth — custom hook to consume AuthContext.
 *
 * Usage (in any component):
 *   const { user, logOut, loading } = useAuth();
 *
 * Throws a descriptive error if used outside <AuthProvider>,
 * making misconfiguration easy to diagnose.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth() must be called inside a component that is a child of <AuthProvider>.\n" +
      "Make sure your router is wrapped with <AuthProvider> in main.jsx.",
    );
  }

  return context;
};
