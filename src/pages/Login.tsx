import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, ArrowRight, User, Lock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput, getLoginSchema } from "../lib/schemas/LoginSchema";
import { login } from "../services/AuthServices";
import { Link, useNavigate } from "react-router-dom";
import { CustomCheckbox } from "../components/ui/CustomCheckbox";
import ErrorService from "../utils/ErrorService";
import { connectSocket } from "../lib/socket";
import { getDashboardPathForRole, storeAuthPermissions } from "../utils/auth";
import { message } from "antd";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    const { username, password, rememberMe } = data;

    try {
      const result = await login({ username, password });

      const token = result.data?.accessToken || result.accessToken;


      

      if (token) {
        // clear old
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        // save token
        if (rememberMe) {
          localStorage.setItem("token", token);
        } else {
          sessionStorage.setItem("token", token);
        }

        const role = result.data?.role || result.role;
        localStorage.setItem("role", role);

        // Save user name and email
        const userObj = result.data?.user || result.user || result.data || {};
        const name = userObj.name || userObj.username || username || "Admin";
        const email = userObj.email || username || "admin@admin.com";
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);

        const permissions = result.data?.permissions || result.permissions || [];
        storeAuthPermissions(permissions, data.rememberMe || false);
        onLoginSuccess();
        message.success(result.message || t('loginSuccess'));
 

        // Handle redirect if user scanned QR code before logging in
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get("redirect") || sessionStorage.getItem("redirect_after_login");

        if (redirectUrl) {
          sessionStorage.removeItem("redirect_after_login");
          navigate(redirectUrl, { replace: true });
        } else {
          navigate(getDashboardPathForRole(role));
        }

        onLoginSuccess();
        connectSocket(token);
        ErrorService.success(t("loginSuccess"));
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };


  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("login")}
        </h2>
        <p className="text-gray-500 font-medium">{t("joinAcademy")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Username */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mx-1">
            {t("username") || "Username"}
          </label>
          <div className="relative group">
            <div className={`absolute ${language === "ar" ? "right" : "left"}-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors`}>
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              {...register("username")}
              className={`w-full ${language === "ar" ? "pr-14 pl-5" : "pl-14 pr-5"} py-4 bg-gray-50/50 border ${errors.username ? "border-red-400" : "border-gray-200"
                } rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400`}
              placeholder="Super Admin_mr_mahmoud"
              dir="ltr"
            />
          </div>
          {errors.username && (
            <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full" />
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mx-1">
            {t("password")}
          </label>

          <div className="relative group">
            <div className={`absolute ${language === "ar" ? "right-5" : "left-5"} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none`}>
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full ${language === "ar" ? "pr-14 pl-12" : "pl-14 pr-12"} py-4 bg-gray-50/50 border ${errors.password ? "border-red-400" : "border-gray-200"
                } rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400`}
              dir={language === "ar" ? "rtl" : "ltr"}
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${language === "ar" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-all p-2 rounded-xl hover:bg-gray-100/50 flex items-center justify-center`}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between px-1">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <CustomCheckbox
                checked={field.value ?? false}
                onChange={field.onChange}
                label={t("rememberMe")}
              />
            )}
          />

          <Link
            to="/forgot-password"
            className="text-sm text-primary font-bold hover:underline underline-offset-4 decoration-2"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-dark text-white rounded-2xl py-4 px-6 font-bold text-lg shadow-xl shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{t("login")}</span>
              <ArrowIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm font-bold uppercase tracking-wider">
            <span className="bg-white px-4 text-gray-400">{t("or")}</span>
          </div>
        </div> */}

        {/* Google Login */}
        {/* <div className="flex justify-center pb-2">
          <div className="w-full max-w-md rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <GoogleLogin
              onSuccess={async (res) => {
                const idToken = res.credential;

                if (idToken) {
                  try {
                    const result = await googleLogin({
                      idToken,
                      provider: "google",
                    });

                    const token =
                      result.data?.accessToken || result.accessToken;

                    if (token) {
                      localStorage.setItem("token", token);
                      onLoginSuccess();
                      ErrorService.success(t("loginSuccess"));
                      navigate("/student-dashboard");
                    }
                  } catch (error) {
                    console.error("Google Login failed:", error);
                  }
                }
              }}
              onError={() => console.log("Login Failed")}
              width="100%"
              theme="outline"
              size="large"
              text="signin_with"
              shape="pill"
            />
          </div>
        </div> */}
      </form>
    </div>
  );
}