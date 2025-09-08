import axios from "axios";
import { getStoredTokens } from "../services/auth";
import { ACCESS_TOKEN_KEY, BASE_URL } from "../utils/constants";

const axiosInstance = axios.create({
  withCredentials: false, // ✅ مهم جدًا لو السيرفر بيرد بكوكي
  headers: {
    Accept: "*/*", // زي الـ curl
  },
  // baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.baseURL = BASE_URL;

    const token = getStoredTokens();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log("Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error?.response?.data?.code === "token_not_valid") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.location.href = "/login";
    }

    if (error?.response?.data?.code === "user_not_found") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.location.href = "/login";
    }

    console.error("Response Error:", error?.response?.data?.code);
    return Promise.reject(error);
  }
);

export default axiosInstance;
