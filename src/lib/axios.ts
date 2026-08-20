import axios from "axios";
import { baseURL } from "../consts";
import ErrorService from "../utils/ErrorService";
import i18n from "../../i18n";

const api = axios.create({
  baseURL: baseURL,
  timeout: 300000,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const currentLang = i18n.language || localStorage.getItem("i18nextLng") || "en";
    config.headers["Accept-Language"] = currentLang;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const config = error.config;

    // Log the error for debugging
    console.error(`API Error [${config?.method?.toUpperCase()}] ${config?.url}:`, {
      status,
      data: error.response?.data,
    });

    if (status === 401) {
      const msg = ErrorService.parseErrorMessage(error);
      ErrorService.error(msg || i18n.t("sessionExpiredError") || "Unauthorized or session expired.");
    } else if (status === 403) {
      ErrorService.error(i18n.t("unauthorizedRoleError") || "You do not have permission to perform this action.");
    } else if (status === 404) {
      const msg = ErrorService.parseErrorMessage(error);
      if (msg && msg !== "An unknown error occurred. Please try again." && error.response?.data) {
        ErrorService.error(msg);
      } else {
        ErrorService.error("The requested resource was not found.");
      }
    } else if (status >= 500) {
      ErrorService.error("A server error occurred. Please try again later.");
    } else {
      // For other errors, parse and show message if possible
      const msg = ErrorService.parseErrorMessage(error);
      if (msg && msg !== "An unknown error occurred. Please try again.") {
        ErrorService.error(msg);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
