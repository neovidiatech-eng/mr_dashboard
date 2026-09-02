import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  QrCode,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  GraduationCap,
  Tag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useScanOfflineGroup } from "../hooks/useOfflineGroup";
import { OfflineGroupCourseDetails } from "../../../types/offlineGroup";
import { baseURL } from "../../../consts";

export default function OfflineGroup() {
  const [searchParams] = useSearchParams();
  const params = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const language = i18n.language.split("-")[0];
  const isArabic = language === "ar";

  // Extract token from query params or URL params
  const token = searchParams.get("token") || params.token || "";

  // Navigate to course details
  const handleViewDetails = (courseItem: any) => {
    const course = courseItem?.course || courseItem;
    const courseId = course?.id || courseItem?.courseId || courseItem?.id;
    const targetUrl = token
      ? `/offline-group/${token}/course/${courseId}`
      : `/offline-group/course/${courseId}`;
    navigate(targetUrl, { state: { course, token } });
  };

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

          ر
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
                              src={`${baseURL}/${course.image}`}
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
                          onClick={() => handleViewDetails(item)}
                          className="w-full py-3 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
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

           
          </div>
        )}
      </main>
    </div>
  );
}
