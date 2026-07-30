import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {  ArrowLeft } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const AuthLayout = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isAuthTab = isLogin || isRegister;

  return (
    <div
      className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[720px] relative z-10">
        {/* common header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white rounded-3xl p-5 shadow-2xl shadow-primary/10 border border-white relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl scale-0 group-hover:scale-110 transition-transform duration-500" />
              {/* <img src="/logo.png" alt="Logo" className="w-14 h-14 text-primary relative z-10" /> */}
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
            {"Mr Mahmoud"}
          </h1>
          
        </div>

        {!isAuthTab && (
          <div className="flex justify-start mb-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-all font-semibold group bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm"
            >
              <ArrowLeft
                className={`w-4 h-4 transition-transform ${language === "ar" ? "rotate-180 group-hover:translate-x-1" : "group-hover:-translate-x-1"}`}
              />
              <span>{t("backToLogin")}</span>
            </button>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden backdrop-blur-sm">
          {/* Tabs */}
          {isAuthTab && (
            <div className="flex p-2 bg-gray-50/50">
              <div className="flex w-full bg-white/50 p-1 rounded-[2rem] border border-gray-100 shadow-sm">
                <button
                  onClick={() => navigate("/login")}
                  className={`flex-1 py-3.5 text-sm font-bold rounded-[1.75rem] transition-all duration-300 ${isLogin
                      ? "bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white"
                    }`}
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className={`flex-1 py-3.5 text-sm font-bold rounded-[1.75rem] transition-all duration-300 ${isRegister
                      ? "bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white"
                    }`}
                >
                  {language === "ar" ? "تسجيل جديد" : "New Register"}
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-10">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-sm font-medium text-gray-400">
          {t("footerText")}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;