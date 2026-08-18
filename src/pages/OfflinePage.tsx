import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  CheckCircle,
  Mail,
  Phone,
  Award,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Loader2,
  Globe
} from "lucide-react";
import { getStudentById } from "../features/admin/services/StudentServices";
import { getStudentProfile } from "../features/student/services/ProfileServices";
import { Student } from "../types/student";

export default function OfflinePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<Student | any>(null);

  // Extract student ID from QR code parameters (e.g., ?studentId=123 or ?id=123)
  const studentToken = searchParams.get("token");

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      // Save target URL including student ID query param for post-login redirect
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem("redirect_after_login", currentPath);

      // Redirect to login page
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, {
        replace: true,
      });
      return;
    }

    setIsCheckingAuth(false);

    // Fetch Student Data
    const fetchStudentData = async () => {
      setLoadingData(true);
      setErrorMessage(null);

      try {
        if (studentToken) {
          // Fetch specific student by ID from QR scan
          const res = await getStudentById(studentToken);
          if (res?.data) {
            setStudentData(res.data);
          } else {
            setStudentData(res);
          }
        } else {
          // Fallback: Fetch currently logged in student profile
          const res = await getStudentProfile();
          if (res?.data) {
            setStudentData(res.data);
          } else {
            setStudentData(res);
          }
        }
      } catch (err: any) {
        console.error("Error fetching student details:", err);
        setErrorMessage(
          err?.response?.data?.message ||
            t("offlinePage.defaultFetchError")
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchStudentData();
  }, [navigate, studentToken]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">{t("offlinePage.checkingAuth")}</h3>
          <p className="text-xs text-gray-500 mt-1">{t("offlinePage.pleaseWait")}</p>
        </div>
      </div>
    );
  }

  // Extract student user object
  const user = studentData?.user || studentData || {};
  const name = user.name || user.username || t("offlinePage.unidentifiedStudent");
  const email = user.email || t("offlinePage.notAvailable");
  const phone = user.phone || t("offlinePage.notAvailable");
  const country = studentData?.country || user.country || t("offlinePage.notSpecified");
  const status = studentData?.status || user.status || t("offlinePage.activeStatus");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/40 shadow-inner overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-black">{name}</h1>
          <p className="text-white/80 text-xs mt-1 flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{t("offlinePage.scanConfirmed")}</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {loadingData ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600">{t("offlinePage.loadingStudentData")}</p>
            </div>
          ) : errorMessage ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-red-900">{t("offlinePage.errorFetchingData")}</h4>
                <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Student ID Badge */}
              {studentToken && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">{t("offlinePage.studentIdLabel")}</span>
                  <span className="font-mono bg-white px-3 py-1 rounded-lg border border-primary/20 font-bold text-primary">
                    {studentToken}
                  </span>
                </div>
              )}

              {/* Details List */}
              <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-500 w-24">{t("offlinePage.emailLabel")}</span>
                  <span className="font-medium text-gray-900 truncate">{email}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-500 w-24">{t("offlinePage.phoneLabel")}</span>
                  <span className="font-medium text-gray-900">{phone}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-500 w-24">{t("offlinePage.countryLabel")}</span>
                  <span className="font-medium text-gray-900">{country}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-500 w-24">{t("offlinePage.accountStatusLabel")}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {status}
                  </span>
                </div>

                {studentData?.sessions_attended !== undefined && (
                  <div className="flex items-center gap-3 text-sm text-gray-700 pt-2 border-t border-gray-200">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-500 w-24">{t("offlinePage.attendedSessionsLabel")}</span>
                    <span className="font-bold text-gray-900">{studentData.sessions_attended}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate("/student-dashboard")}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group mt-4"
              >
                <span>{t("offlinePage.goToDashboard")}</span>
                <ArrowRight className={`w-5 h-5 transition-transform ${i18n.language === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1 rotate-180'}`} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
