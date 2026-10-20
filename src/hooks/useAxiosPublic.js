import axios from "axios";
import { useEffect } from "react";

const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

const useAxiosPublic = () => {
  useEffect(() => {
    const interceptor = axiosPublic.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only server errors open the help panel; pages handle the rest themselves
        const status = error.response?.status;
        if (status >= 500) {
          const msg = error.response?.data?.message || error.response?.data?.error || "The server couldn't complete that request.";
          window.dispatchEvent(new CustomEvent('app:error-reported', { detail: { message: msg } }));
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axiosPublic.interceptors.response.eject(interceptor);
    };
  }, []);

  return axiosPublic;
};

export default useAxiosPublic;
