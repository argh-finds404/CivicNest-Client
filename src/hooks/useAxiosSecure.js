import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

const useAxiosSecure = () => {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const requestInterceptor = axiosSecure.interceptors.request.use(
      async (config) => {
        const auth = await import("../firebase/firebase.init").then((m) => m.auth);
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          config.headers.authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const status = error.response?.status;
        const auth = await import("../firebase/firebase.init").then((m) => m.auth);
        if (status === 401 && auth.currentUser) {
          // A signed-in user's token was rejected: the session really expired
          await logOut();
          navigate("/login", { state: { from: window.location.pathname } });
        } else if (status === 401) {
          // Guest hit a members-only action. Ask them to log in instead of
          // bouncing them off a page they are allowed to browse.
          window.dispatchEvent(new CustomEvent("app:auth-required"));
        } else if (status === 403) {
          // Signed in but not allowed (e.g. not a verified member yet). Never log out for this.
          const msg = error.response?.data?.error || error.response?.data?.message || "You don't have access to that yet.";
          window.dispatchEvent(new CustomEvent("app:error-reported", { detail: { message: msg } }));
        } else {
          const msg = error.response?.data?.message || error.message || "An API error occurred";
          window.dispatchEvent(new CustomEvent('app:error-reported', { detail: { message: msg } }));
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [logOut, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
