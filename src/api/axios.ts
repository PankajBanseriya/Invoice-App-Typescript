import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const BASE_URL: string = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401 && currentPath === "/") {
      return Promise.reject(error);
    }

    if (status === 401 && currentPath !== "/") {
      console.warn("Session expired or unauthorized. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = "/"; 
    }

    return Promise.reject(error);
  }
);

export default api;