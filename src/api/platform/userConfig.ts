import { getStoredTokens } from "@/services/platform/userAuth";
import axios from "axios";

const axiosInstance = axios.create({
  // headers: {
  //   "Content-Type": "application/json",
  //   Accept: "application/json",
  // },
  // baseURL: "https://lms.vision-jo.com/",
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.baseURL = "https://lms.vision-jo.com/";

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
      localStorage.removeItem("platform_auth_tokens");
      window.location.href = "/login";
    }

    // if (error?.response?.status === 404) {
    //   toast.error("Page not found");
    //   localStorage.removeItem("auth_tokens");
    //   localStorage.removeItem("company_domain");
    //   window.location.href = "/login";
    // }

    console.error("Response Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
