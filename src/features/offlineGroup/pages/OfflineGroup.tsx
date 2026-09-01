import { useState } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  QrCode,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  X,
  Tag,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useScanOfflineGroup } from "../hooks/useOfflineGroup";
import { OfflineGroupCourseDetails } from "../../../types/offlineGroup";

export default function OfflineGroup() {
  const [searchParams] = useSearchParams();
  const params = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const language = i18n.language.split("-")[0];
  const isArabic = language === "ar";

  // Selected course for modal details
  const [selectedCourse, setSelectedCourse] =
    useState<OfflineGroupCourseDetails | null>(null);

  // Extract token from query params or URL params
  const token = searchParams.get("token") || params.token || "";

  // React Query hook
  const { data, isLoading, isError, error, refetch, isFetching } =
    useScanOfflineGroup(token || null);

  // Helper to extract course title
  const getCourseTitle = (course?: OfflineGroupCourseDetails | any) => {
    if (!course) return "";
    if (isArabic) {
      return (
        course.title_ar ||
        course.title_en ||
        course.title ||
        course.name_ar ||
        course.name_en ||
        course.name ||
        t("untitled_course", "كورس بدون عنوان")
      );
    }
    return (
      course.title_en ||
      course.title_ar ||
      course.title ||
      course.name_en ||
      course.name_ar ||
      course.name ||
      t("untitled_course", "Untitled Course")
    );
  };

  // Helper to extract course description
  const getCourseDescription = (course?: OfflineGroupCourseDetails | any) => {
    if (!course) return "";
    if (isArabic) {
      return (
        course.description_ar ||
        course.description_en ||
        course.description ||
        ""
      );
    }
    return (
      course.description_en ||
      course.description_ar ||
      course.description ||
      ""
    );
  };

  // Helper to extract keywords list safely
  const getKeywords = (keywords?: string[] | string | null): string[] => {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === "string") {
      return keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }
    return [];
  };

  const coursesList = data?.data?.courses || [];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-100 text-gray-800"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {t("academyName", "أكاديمية مستر محمود")}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {t("offline_classroom_portal", "بوابة المجموعات الحضورية")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextLang = language === "ar" ? "en" : "ar";
                i18n.changeLanguage(nextLang);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
            >
              {language === "ar" ? "English" : "العربية"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
            <QrCode className="w-4 h-4 text-indigo-300" />
            <span>{t("scanned_via_qr", "تم المسح عبر رمز QR")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t("offline_group_courses_title", "مقررات المجموعة الحضورية")}
          </h2>

          <p className="text-sm sm:text-base text-indigo-100/90 max-w-2xl mx-auto font-normal">
            {t(
              "offline_group_courses_desc",
              "استعرض جميع الكورسات والمقررات الدراسية المتاحة والمخصصة لهذه المجموعة الحضورية مباشرة."
            )}
          </p>

          {token && (
            <div className="pt-2 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/10 text-[11px] text-indigo-200 font-mono">
                <span className="text-white/60">Token:</span>
                <span className="truncate max-w-[200px] sm:max-w-[300px]">
                  {token}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* State 1: No Token Provided */}
        {!token && (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {t("no_token_title", "لم يتم العثور على رمز المجموعة")}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t(
                "no_token_desc",
                "يرجى مسح رمز QR الخاص بالمجموعة الحضورية مرة أخرى من خلال الكاميرا للوصول إلى الكورسات المتاحة."
              )}
            </p>
          </div>
        )}

        {/* State 2: Loading State */}
        {token && isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-4 animate-pulse"
                >
                  <div className="h-48 bg-gray-200 rounded-2xl w-full" />
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                    <div className="h-4 bg-gray-100 rounded-md w-full" />
                    <div className="h-4 bg-gray-100 rounded-md w-2/3" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State 3: Error State */}
        {token && !isLoading && isError && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 border border-red-100 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                {t("scan_error_title", "فشل جلب بيانات المجموعة")}
              </h3>
              <p className="text-sm text-red-600/90 leading-relaxed">
                {(error as any)?.response?.data?.message ||
                  (error as any)?.message ||
                  t(
                    "scan_error_desc",
                    "رمز QR غير صالح أو ربما انتهت صلاحيته. يرجى مراجعة إدارة الأكاديمية."
                  )}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
              <span>{t("retry", "إعادة المحاولة")}</span>
            </button>
          </div>
        )}

        {/* State 4: Loaded Successfully */}
        {token && !isLoading && !isError && (
          <div className="space-y-8">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {t("courses_available_count", "الكورسات المتاحة")}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t(
                      "courses_available_count_sub",
                      "تم التحقق من صحة رمز المجموعة بنجاح"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                  {coursesList.length} {t("courses_count_unit", "مقرر")}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("active_status", "نشط")}
                </span>
              </div>
            </div>

            {/* Empty Courses List */}
            {coursesList.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mx-auto">
                  <Layers className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">
                  {t("no_courses_linked", "لا توجد كورسات مرتبطة بهذه المجموعة")}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {t(
                    "no_courses_linked_desc",
                    "لم يتم ربط أي مقررات دراسية بهذه المجموعة حتى الآن."
                  )}
                </p>
              </div>
            ) : (
              /* Grid of Courses */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesList.map((item: any, idx: number) => {
                  const course = item?.course || item;
                  const title = getCourseTitle(course);
                  const description = getCourseDescription(course);
                  const price = course?.price;

                  return (
                    <div
                      key={course?.id || idx}
                      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1"
                    >
                      <div>
                        {/* Course Image Banner */}
                        <div className="relative h-48 w-full bg-gradient-to-tr from-slate-800 to-indigo-900 overflow-hidden">
                          {course?.image ? (
                            <img
                              src={course.image}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 p-4">
                              <BookOpen className="w-12 h-12 mb-2 stroke-1" />
                              <span className="text-xs font-semibold">
                                {t("course_cover", "غلاف المقرر")}
                              </span>
                            </div>
                          )}

                          {/* Price Tag Pill */}
                          <div className="absolute top-3.5 right-3.5 z-10">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl text-xs font-black text-indigo-900 shadow-sm">
                              {price !== undefined && price !== null && price > 0 ? (
                                <>
                                  <span>{price}</span>
                                  <span className="text-[10px] text-gray-500 font-semibold">
                                    {isArabic ? "ج.م" : "EGP"}
                                  </span>
                                </>
                              ) : (
                                <span className="text-emerald-600">
                                  {t("free_course", "مجاني")}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {title}
                          </h4>

                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed min-h-[2rem]">
                            {description ||
                              t(
                                "no_description_available",
                                "لا يوجد وصف تفصيلي متاح لهذا المقرر حالياً."
                              )}
                          </p>

                          {/* Keywords */}
                          {(() => {
                            const kws = getKeywords(course?.keywords);
                            if (kws.length === 0) return null;
                            return (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {kws.slice(0, 3).map((kw: string, kIdx: number) => (
                                  <span
                                    key={kIdx}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50/70 text-indigo-600"
                                  >
                                    <Tag className="w-2.5 h-2.5" />
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Card Footer Button */}
                      <div className="p-5 pt-0">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="w-full py-3 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          <span>{t("view_details", "عرض تفاصيل المقرر")}</span>
                          {isArabic ? (
                            <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                          ) : (
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Call to Action for Student Login/Signup */}
            <div className="mt-12 bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 text-center md:text-start relative z-10">
                <h4 className="text-xl font-black">
                  {t("have_student_account", "هل تمتلك حساباً على المنصة؟")}
                </h4>
                <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
                  {t(
                    "student_account_cta_desc",
                    "قم بتسجيل الدخول للوصول إلى الواجبات، الاختبارات، والمحاضرات الكاملة الخاصة بك."
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 relative z-10">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-indigo-900 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>{t("login", "تسجيل الدخول")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md transition-all active:scale-95"
                >
                  {t("createNewStudentAccount", "إنشاء حساب جديد")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header Cover */}
            <div className="relative h-44 bg-gradient-to-tr from-slate-900 to-indigo-900">
              {selectedCourse.image ? (
                <img
                  src={selectedCourse.image}
                  alt={getCourseTitle(selectedCourse)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <BookOpen className="w-16 h-16" />
                </div>
              )}
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="text-2xl font-black text-gray-900">
                    {getCourseTitle(selectedCourse)}
                  </h3>
                  <span className="px-3.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-sm rounded-xl border border-indigo-100 flex-shrink-0">
                    {selectedCourse.price && selectedCourse.price > 0
                      ? `${selectedCourse.price} ${isArabic ? "ج.م" : "EGP"}`
                      : t("free_course", "مجاني")}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {getCourseDescription(selectedCourse) ||
                    t(
                      "no_description_available",
                      "لا يوجد وصف تفصيلي متاح لهذا المقرر حالياً."
                    )}
                </p>
              </div>

              {/* Keywords List */}
              {(() => {
                const kws = getKeywords(selectedCourse.keywords);
                if (kws.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t("keywords", "الكلمات المفتاحية")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {kws.map((kw: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Extra Details */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
                {selectedCourse.createdAt && (
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {t("created_date", "تاريخ الإضافة")}
                    </span>
                    <span className="font-bold text-gray-800 block">
                      {new Date(selectedCourse.createdAt).toLocaleDateString(
                        language,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-gray-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("classroom_type", "نوع الدراسة")}
                  </span>
                  <span className="font-bold text-indigo-700 block">
                    {t("offline_classroom", "حضوري (سنتر)")}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={() => setSelectedCourse(null)}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                {t("close", "إغلاق")}
              </button>
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  navigate("/login");
                }}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{t("login_to_view_lectures", "دخول لمتابعة الكورس")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
