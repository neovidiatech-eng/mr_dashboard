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

    if (token) {
      config.headers ??= {};
      config.headers.Authorization = `Bearer ${token}`;
    }

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
      // If we get 401, it means the session is invalid or expired
      // Clear storage regardless of whether a token was found (it's clearly invalid)
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("role");

      const publicPages = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-account"];
      const currentPath = window.location.pathname;

      // Only redirect if we are not already on a public page to avoid loops
      if (!publicPages.some(page => currentPath.includes(page))) {
        ErrorService.error(i18n.t("sessionExpiredError") || "Session expired. Please login again.");
        window.location.href = "/login";
      } else {
        const msg = ErrorService.parseErrorMessage(error);
        if (msg) {
          ErrorService.error(msg);
        }
      }
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
