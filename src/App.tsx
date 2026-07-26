import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionsProvider } from "./contexts/SessionsContext";

import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import ErrorBoundary from "./components/layout/ErrorBoundary";
import LanguageSwitcher from "./components/ui/LanguageSwitcher";
import AuthGuard from "./components/guards/AuthGuard";
import GuestGuard from "./components/guards/GuestGuard";
import { getDashboardPathForRole } from "./utils/auth";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { googleClientId } from "./components/constants";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { connectSocket, disconnectSocket } from "./lib/socket";

// --- Lazy Loading Core Layouts & Pages ---
const AuthLayout = lazy(() => import("./pages/AuthLayout/AuthLayout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyAccount = lazy(() => import("./pages/VerifyAccount"));
const AdminDashboard = lazy(
  () => import("./pages/AdminDashboard/AdminDashboard"),
);
const StudentDashboard = lazy(
  () => import("./pages/StudentDashboard/StudentDashboard"),
);
const TeacherDashboard = lazy(
  () => import("./pages/TeacherDashboard/TeacherDashboard"),
);

// Centralized Loading Fallback UI
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Create a client with global error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
  });
  const { i18n } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        connectSocket(token);
      }
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const lang = i18n.language.split("-")[0];
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [i18n.language]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>

              <SessionsProvider>
                <Router>
                  {!isAuthenticated && <LanguageSwitcher />}
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Auth Routes */}
                      <Route element={<GuestGuard />}>
                        <Route element={<AuthLayout />}>
                          <Route
                            path="/login"
                            element={<Login onLoginSuccess={handleLogin} />}
                          />
                          <Route
                            path="/register"
                            element={<Register onRegisterSuccess={handleLogin} />}
                          />
                          <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                          />
                          <Route
                            path="/reset-password"
                            element={<ResetPassword />}
                          />
                          <Route
                            path="/verify-account"
                            element={<VerifyAccount />}
                          />
                        </Route>
                      </Route>

                      {/* Protected Dashboard Routes */}
                      <Route element={<AuthGuard allowedRoles={['super_admin', 'admin']} allowCustomAdminRoles={true} />}>
                        <Route path="/dashboard/*" element={<AdminDashboard />} />
                      </Route>

                      <Route element={<AuthGuard allowedRoles={['student']} />}>
                        <Route
                          path="/student-dashboard/*"
                          element={<StudentDashboard />}
                        />
                      </Route>

                      <Route element={<AuthGuard allowedRoles={['teacher']} />}>
                        <Route
                          path="/teacher-dashboard/*"
                          element={<TeacherDashboard />}
                        />
                      </Route>

                      <Route
                        path="/"
                        element={
                          isAuthenticated ? (
                            <Navigate to={getDashboardPathForRole(localStorage.getItem('role'))} replace />
                          ) : (
                            <Navigate to="/login" replace />
                          )
                        }
                      />
                      <Route
                        path="*"
                        element={
                          isAuthenticated ? (
                            <Navigate to={getDashboardPathForRole(localStorage.getItem('role'))} replace />
                          ) : (
                            <Navigate to="/login" replace />
                          )
                        }
                      />
                    </Routes>
                  </Suspense>
                </Router>
              </SessionsProvider>

          </Provider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
