import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Presentation,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  GraduationCap,
  Tag,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Play,
  AlertCircle,
  RefreshCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Lock,
} from "lucide-react";
import { useCourseById } from "../../../hooks/useCourses";
import { useSectionsByCourse } from "../../../hooks/useSections";
import { baseURL } from "../../../consts";
import UniversalVideoPlayer from "../../../components/ui/UniversalVideoPlayer";
import VideoModal from "../../../components/modals/VideoModal";
import { Section, SectionItem } from "../../../types/courses";
import { Lecture } from "../../../types/lectures";

// Helper to extract video path from various possible object structures
export const getLectureVideo = (lec: any): string => {
  if (!lec) return "";
  if (typeof lec.video_path === "string" && lec.video_path.trim()) return lec.video_path.trim();
  if (typeof lec.videoUrl === "string" && lec.videoUrl.trim()) return lec.videoUrl.trim();
  if (typeof lec.video_url === "string" && lec.video_url.trim()) return lec.video_url.trim();
  if (typeof lec.video === "string" && lec.video.trim()) return lec.video.trim();
  if (typeof lec.url === "string" && lec.url.trim()) return lec.url.trim();
  if (typeof lec.videoFile === "string" && lec.videoFile.trim()) return lec.videoFile.trim();
  if (typeof lec.video_link === "string" && lec.video_link.trim()) return lec.video_link.trim();
  return "";
};

// Helper to extract PDF path
export const getLecturePdf = (lec: any): string => {
  if (!lec) return "";
  if (typeof lec.pdf_path === "string" && lec.pdf_path.trim()) return lec.pdf_path.trim();
  if (typeof lec.pdfUrl === "string" && lec.pdfUrl.trim()) return lec.pdfUrl.trim();
  if (typeof lec.pdf_url === "string" && lec.pdf_url.trim()) return lec.pdf_url.trim();
  if (typeof lec.pdf === "string" && lec.pdf.trim()) return lec.pdf.trim();
  return "";
};

// Helper to extract Slides path
export const getLectureSlides = (lec: any): string => {
  if (!lec) return "";
  if (typeof lec.slides_path === "string" && lec.slides_path.trim()) return lec.slides_path.trim();
  if (typeof lec.slidesUrl === "string" && lec.slidesUrl.trim()) return lec.slidesUrl.trim();
  if (typeof lec.slides_url === "string" && lec.slides_url.trim()) return lec.slides_url.trim();
  if (typeof lec.slides === "string" && lec.slides.trim()) return lec.slides.trim();
  return "";
};

// Safe media URL formatter
export const formatMediaUrl = (path?: string | null): string => {
  if (!path || typeof path !== "string" || !path.trim()) return "";
  const trimmed = path.trim().replace(/\\/g, "/");
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return encodeURI(trimmed).replace(/#/g, "%23");
  }
  const cleanPath = trimmed.replace(/^\/+/, "");
  const encodedSegments = cleanPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${baseURL}/${encodedSegments}`;
};

export default function CoursesDetails() {
  const params = useParams<{ token?: string; courseId?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const language = i18n.language.split("-")[0];
  const isArabic = language === "ar";

  // Extract courseId and token
  const courseId =
    params.courseId ||
    searchParams.get("courseId") ||
    location.state?.course?.id ||
    "";
  const token =
    params.token ||
    searchParams.get("token") ||
    location.state?.token ||
    "";

  // Initial state passed from previous page
  const initialCourse = location.state?.course || null;

  // React Query fetch for course and sections
  const {
    data: fetchedCourse,
    isLoading: isCourseLoading,
    isError: isCourseError,
    error: courseError,
    refetch: refetchCourse,
  } = useCourseById(courseId);

  const {
    data: fetchedSections,
  } = useSectionsByCourse(courseId);

  // Active course data merged
  const course = fetchedCourse || initialCourse;

  // Selected active lecture for inline player
  const [selectedLectureId, setSelectedLectureId] = useState<string>("");

  // Video Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalVideoName, setModalVideoName] = useState("");
  const [modalVideoUrl, setModalVideoUrl] = useState("");

  // Sections collapse state (true = open, false = collapsed)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [secId]: prev[secId] === undefined ? false : !prev[secId],
    }));
  };

  // Helper for title
  const getCourseTitle = (c?: any) => {
    if (!c) return "";
    if (isArabic) {
      return (
        c.title_ar ||
        c.title_en ||
        c.title ||
        c.name_ar ||
        c.name_en ||
        c.name ||
        t("untitled_course", "كورس بدون عنوان")
      );
    }
    return (
      c.title_en ||
      c.title_ar ||
      c.title ||
      c.name_en ||
      c.name_ar ||
      c.name ||
      t("untitled_course", "Untitled Course")
    );
  };

  // Helper for description
  const getCourseDescription = (c?: any) => {
    if (!c) return "";
    if (isArabic) {
      return (
        c.description_ar ||
        c.description_en ||
        c.description ||
        ""
      );
    }
    return (
      c.description_en ||
      c.description_ar ||
      c.description ||
      ""
    );
  };

  // Helper for keywords
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

  // Sections and Lectures Computation
  const sections: Section[] = useMemo(() => {
    if (fetchedSections && Array.isArray(fetchedSections) && fetchedSections.length > 0) {
      return fetchedSections;
    }
    if (course?.sections && Array.isArray(course.sections) && course.sections.length > 0) {
      return course.sections;
    }
    return [];
  }, [fetchedSections, course?.sections]);

  const courseLectures: Lecture[] = useMemo(() => {
    if (course?.lectures && Array.isArray(course.lectures)) {
      return course.lectures;
    }
    return [];
  }, [course?.lectures]);

  // Resolve a lecture item by combining item details + matching course.lectures
  const resolveLecture = (item: any): Lecture => {
    const itemId = item?.details?.id || item?.item_id || item?.id;
    const matching = courseLectures.find((l: any) => l.id === itemId);
    return {
      ...(typeof item === "object" ? item : {}),
      ...(item?.details || {}),
      ...(matching || {}),
      id: itemId || (matching?.id ?? ""),
    };
  };

  // Flatten all lectures in chronological sequence (excluding quizzes)
  const allLectures: Lecture[] = useMemo(() => {
    if (sections.length > 0) {
      const extracted: Lecture[] = [];
      sections.forEach((sec) => {
        const items = sec.section_items || sec.sectionItems || [];
        items.forEach((it) => {
          if ((it.item_type || "LECTURE").toUpperCase() === "LECTURE") {
            extracted.push(resolveLecture(it));
          }
        });
      });
      if (extracted.length > 0) return extracted;
    }
    return courseLectures;
  }, [sections, courseLectures]);

  // Max 3 lectures displayed for preview
  const displayedLectures: Lecture[] = useMemo(() => {
    return allLectures.slice(0, 3);
  }, [allLectures]);

  const hasMoreLectures = allLectures.length > 3;
  const remainingLecturesCount = allLectures.length - 3;

  // Set of allowed lecture IDs (first 3 lectures only)
  const allowedLectureIds = useMemo(() => {
    return new Set(displayedLectures.map((l) => l.id));
  }, [displayedLectures]);

  // Filter sections to only those containing allowed lectures
  const displayedSections = useMemo(() => {
    if (!sections || sections.length === 0) return [];
    return sections
      .map((sec) => {
        const items = sec.section_items || sec.sectionItems || [];
        const filteredItems = items.filter((rawItem: SectionItem) => {
          const type = (rawItem.item_type || "LECTURE").toUpperCase();
          if (type !== "LECTURE") return false; // Exclude quizzes completely
          const itemId = rawItem?.details?.id || rawItem?.item_id || rawItem?.id;
          return allowedLectureIds.has(itemId);
        });
        return {
          ...sec,
          displayedItems: filteredItems,
        };
      })
      .filter((sec) => sec.displayedItems.length > 0);
  }, [sections, allowedLectureIds]);

  // Auto-select first lecture with video, or first lecture among displayedLectures
  useEffect(() => {
    if (displayedLectures.length > 0) {
      const currentSelectedExists = displayedLectures.some((l) => l.id === selectedLectureId);
      if (!currentSelectedExists) {
        const firstWithVideo = displayedLectures.find((l) => !!getLectureVideo(l));
        if (firstWithVideo) {
          setSelectedLectureId(firstWithVideo.id);
        } else {
          setSelectedLectureId(displayedLectures[0].id);
        }
      }
    }
  }, [displayedLectures, selectedLectureId]);

  // Active lecture object
  const activeLecture = useMemo(() => {
    if (!selectedLectureId && displayedLectures.length > 0) return displayedLectures[0];
    return displayedLectures.find((l) => l.id === selectedLectureId) || displayedLectures[0] || null;
  }, [displayedLectures, selectedLectureId]);

  // Next / Previous lecture navigation
  const activeIndex = displayedLectures.findIndex((l) => l.id === activeLecture?.id);
  const prevLecture = activeIndex > 0 ? displayedLectures[activeIndex - 1] : null;
  const nextLecture =
    activeIndex >= 0 && activeIndex < displayedLectures.length - 1
      ? displayedLectures[activeIndex + 1]
      : null;

  // Active lecture video, pdf, slides
  const activeVideoUrl = activeLecture ? getLectureVideo(activeLecture) : "";
  const activePdfUrl = activeLecture ? getLecturePdf(activeLecture) : "";
  const activeSlidesUrl = activeLecture ? getLectureSlides(activeLecture) : "";

  // Back Navigation Helper
  const handleBackToCourses = () => {
    if (token) {
      navigate(`/offline-group/${token}`);
    } else {
      navigate("/offline-group");
    }
  };

  // Open modal video preview helper
  const handleOpenVideoModal = (lec: Lecture) => {
    const rawVideo = getLectureVideo(lec);
    if (!rawVideo) return;
    const title = isArabic
      ? lec.title_ar || lec.title
      : lec.title_en || lec.title_ar || lec.title || "Lecture Video";
    setModalVideoName(title);
    setModalVideoUrl(rawVideo);
    setIsVideoModalOpen(true);
  };

  // Switch main stage lecture video view
  const handleViewLectureOnStage = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    document.getElementById("active-featured-stage")?.scrollIntoView({ behavior: "smooth" });
  };

  const courseTitle = getCourseTitle(course);
  const courseDescription = getCourseDescription(course);
  const keywordsList = getKeywords(course?.keywords);
  const price = course?.price;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 text-gray-800"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToCourses}
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors shadow-xs cursor-pointer"
              title={t("back_to_offline_courses", "الرجوع لمقررات المجموعة")}
            >
              {isArabic ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-gray-900 leading-tight">
                  {t("academyName", "أكاديمية مستر محمود")}
                </h1>
                <p className="text-[11px] text-gray-500 font-medium">
                  {t("course_details_title", "تفاصيل المقرر الدراسي")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextLang = language === "ar" ? "en" : "ar";
                i18n.changeLanguage(nextLang);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-sm cursor-pointer"
            >
              {language === "ar" ? "English" : "العربية"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Link Breadcrumb */}
        <div>
          <button
            onClick={handleBackToCourses}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            {isArabic ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{t("back_to_offline_courses", "الرجوع لمقررات المجموعة")}</span>
          </button>
        </div>

        {/* Loading State */}
        {isCourseLoading && !course && (
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-3xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-40 bg-gray-200 rounded-3xl animate-pulse" />
              <div className="h-40 bg-gray-200 rounded-3xl animate-pulse" />
              <div className="h-40 bg-gray-200 rounded-3xl animate-pulse" />
            </div>
          </div>
        )}

        {/* Error State */}
        {isCourseError && !course && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 border border-red-100 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                {t("scan_error_title", "فشل جلب بيانات الكورس")}
              </h3>
              <p className="text-sm text-red-600/90 leading-relaxed">
                {(courseError as any)?.response?.data?.message ||
                  (courseError as any)?.message ||
                  t(
                    "course_load_error",
                    "تعذر تحميل بيانات المقرر الدراسي. يرجى التحقق من الرابط وإعادة المحاولة."
                  )}
              </p>
            </div>
            <button
              onClick={() => refetchCourse()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t("retry", "إعادة المحاولة")}</span>
            </button>
          </div>
        )}

        {/* Course Loaded Content */}
        {course && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Course Overview Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Course Image Banner */}
                <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[360px] bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center">
                  {course?.image ? (
                    <img
                      src={formatMediaUrl(course.image)}
                      alt={courseTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/40 p-6 text-center">
                      <BookOpen className="w-20 h-20 mb-3 stroke-1" />
                      <span className="text-sm font-semibold">
                        {t("course_cover", "غلاف المقرر الدراسي")}
                      </span>
                    </div>
                  )}

                  {/* Price Tag Floating Overlay */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl text-xs font-black text-indigo-900 shadow-md">
                      {price !== undefined && price !== null && price > 0 ? (
                        <>
                          <span className="text-sm">{price}</span>
                          <span className="text-[10px] text-gray-500 font-bold">
                            {isArabic ? "ج.م" : "EGP"}
                          </span>
                        </>
                      ) : (
                        <span className="text-emerald-600 font-black">
                          {t("free_course", "مجاني")}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Course Main Details & Meta */}
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Badges / Meta Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        {t("offline_classroom", "حضوري (سنتر)")}
                      </span>

                      {course.rank && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                          {isArabic
                            ? course.rank.name_ar || course.rank.name
                            : course.rank.name_en || course.rank.name}
                        </span>
                      )}

                      {course.category && (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl"
                          style={{
                            backgroundColor: `${course.category.color || "#6366f1"}15`,
                            color: course.category.color || "#4338ca",
                          }}
                        >
                          <Tag className="w-3.5 h-3.5" />
                          {isArabic
                            ? course.category.name_ar
                            : course.category.name_en || course.category.name_ar}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
                      {courseTitle}
                    </h2>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
                      {courseDescription ||
                        t(
                          "no_description_available",
                          "لا يوجد وصف تفصيلي متاح لهذا المقرر حالياً."
                        )}
                    </p>

                    {/* Keywords */}
                    {keywordsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {keywordsList.map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            <Tag className="w-3 h-3 text-slate-400" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-100">
                    <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 space-y-1">
                      <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        {t("total_lectures", "المحاضرات المعروضة")}
                      </span>
                      <span className="text-base font-black text-indigo-900 block">
                        {displayedLectures.length} {t("lectures_unit", "محاضرة")}
                      </span>
                      {hasMoreLectures && (
                        <span className="text-[10px] text-amber-700 font-bold block">
                          {isArabic ? `(أول 3 من ${allLectures.length})` : `(First 3 of ${allLectures.length})`}
                        </span>
                      )}
                    </div>

                    {displayedSections.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-600" />
                          {t("total_sections", "إجمالي السكاشن")}
                        </span>
                        <span className="text-base font-black text-slate-900 block">
                          {displayedSections.length} {t("sections_unit", "سكشن")}
                        </span>
                      </div>
                    )}

                    {course.createdAt && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          {t("created_date", "تاريخ الإضافة")}
                        </span>
                        <span className="text-xs font-bold text-slate-800 block">
                          {new Date(course.createdAt).toLocaleDateString(language, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURED / ACTIVE STAGE (Video Player) */}
            <div id="active-featured-stage">
              {activeLecture ? (
                /* INLINE VIDEO LECTURE STAGE */
                <div className="bg-indigo-700 text-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">
                            {t("now_playing", "المحاضرة المعروضة حالياً")}
                          </span>
                          {activeLecture.order && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white">
                              {t("lecture_order", `محاضرة ${activeLecture.order}`, {
                                order: activeLecture.order,
                              })}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                          {isArabic
                            ? activeLecture.title_ar || activeLecture.title
                            : activeLecture.title_en || activeLecture.title_ar || activeLecture.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeVideoUrl && (
                        <button
                          onClick={() => handleOpenVideoModal(activeLecture)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-white transition cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>{t("popup_view", "تكبير في نافذة")}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Embedded Video Player */}
                  <div className="rounded-2xl overflow-hidden bg-black aspect-video max-h-[520px] mx-auto shadow-2xl relative">
                    <UniversalVideoPlayer url={activeVideoUrl} autoPlay={false} />
                  </div>

                  {/* Lecture Description & Downloadable Materials */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    <div className="lg:col-span-8 space-y-3">
                      {(activeLecture.content_ar || activeLecture.content_en || activeLecture.content) && (
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            {t("lecture_description", "وصف المحاضرة")}
                          </span>
                          <p className="text-sm text-slate-300 leading-relaxed font-normal">
                            {isArabic
                              ? activeLecture.content_ar || activeLecture.content
                              : activeLecture.content_en || activeLecture.content_ar || activeLecture.content}
                          </p>
                        </div>
                      )}

                      {activeLecture.duration && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-3 py-1.5 rounded-xl">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t("duration", "المدة")}: {activeLecture.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Materials / Actions on right side */}
                    <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          {t("attachments", "المرفقات والملفات")}
                        </span>
                        <div className="flex flex-col gap-2">
                          {activePdfUrl ? (
                            <a
                              href={formatMediaUrl(activePdfUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-rose-400" />
                                <span>{t("pdf_material", "ملف PDF / المذكرة")}</span>
                              </span>
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-white/5 text-slate-500 text-xs font-medium">
                              {t("no_pdf_attached", "لا توجد ملزمة PDF مرفقة")}
                            </div>
                          )}

                          {activeSlidesUrl ? (
                            <a
                              href={formatMediaUrl(activeSlidesUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Presentation className="w-4 h-4 text-amber-400" />
                                <span>{t("slides_material", "عرض تقديمي Slides")}</span>
                              </span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-white/5 text-slate-500 text-xs font-medium">
                              {t("no_slides_attached", "لا توجد سلايدز مرفقة")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prev / Next Lecture Switcher */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                        {prevLecture && (
                          <button
                            onClick={() => {
                              handleViewLectureOnStage(prevLecture.id);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            <span>{t("prev_lecture", "السابقة")}</span>
                          </button>
                        )}

                        {nextLecture && (
                          <button
                            onClick={() => {
                              handleViewLectureOnStage(nextLecture.id);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
                          >
                            <span>{t("next_lecture", "التالية")}</span>
                            {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Curriculum & Lectures Section Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {t("course_curriculum_and_lectures", "الخطة الدراسية والمحاضرات")}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t(
                        "course_curriculum_desc",
                        "استعرض محتوى المحاضرات والسكاشن التعليمية المقررة لهذا الكورس."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                    {displayedLectures.length} {t("lectures_unit", "محاضرة")}
                  </span>
                  {hasMoreLectures && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                      {isArabic ? `معاينة (3 من ${allLectures.length})` : `Preview (3 of ${allLectures.length})`}
                    </span>
                  )}
                </div>
              </div>

              {/* Sections Layout */}
              {displayedSections.length > 0 ? (
                <div className="space-y-4">
                  {displayedSections.map((sec: any, secIdx: number) => {
                    const isSecOpen = openSections[sec.id] !== false; // Open by default
                    const items: SectionItem[] = sec.displayedItems || [];
                    const secTitle = isArabic
                      ? sec.name_ar || sec.name
                      : sec.name_en || sec.name_ar || sec.name;

                    return (
                      <div
                        key={sec.id || secIdx}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Section Header Accordion Toggle */}
                        <div
                          onClick={() => toggleSection(sec.id)}
                          className="p-5 sm:px-6 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/80 transition-colors border-b border-gray-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                              {secIdx + 1}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-gray-900">
                                {secTitle || `${t("section", "سكشن")} ${secIdx + 1}`}
                              </h4>
                              <p className="text-xs text-gray-400 font-medium mt-0.5">
                                {items.length} {t("lectures_unit", "محاضرات")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 px-3 py-1 bg-gray-50 rounded-xl">
                              {items.length} {isArabic ? "محاضرة" : "lectures"}
                            </span>
                            {isSecOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Section Body */}
                        {isSecOpen && (
                          <div className="p-4 sm:p-6 space-y-3 bg-slate-50/40">
                            {items.length === 0 ? (
                              <div className="py-8 text-center text-gray-400 text-xs font-semibold bg-white rounded-2xl border border-dashed border-gray-200">
                                {t(
                                  "no_items_in_section",
                                  "لا توجد محاضرات في هذا السكشن حالياً."
                                )}
                              </div>
                            ) : (
                              items.map((rawItem: SectionItem, itemIdx: number) => {
                                const itemOrder = rawItem.order || itemIdx + 1;
                                const lectureObj = resolveLecture(rawItem);
                                const lectTitle = isArabic
                                  ? lectureObj.title_ar || lectureObj.title
                                  : lectureObj.title_en || lectureObj.title_ar || lectureObj.title;
                                const lectContent = isArabic
                                  ? lectureObj.content_ar || lectureObj.content
                                  : lectureObj.content_en || lectureObj.content_ar || lectureObj.content;
                                const videoUrl = getLectureVideo(lectureObj);
                                const pdfUrl = getLecturePdf(lectureObj);
                                const slidesUrl = getLectureSlides(lectureObj);
                                const isSelected = activeLecture?.id === lectureObj.id;

                                return (
                                  <div
                                    key={lectureObj.id || itemIdx}
                                    onClick={() => handleViewLectureOnStage(lectureObj.id)}
                                    className={`rounded-2xl p-4 sm:p-5 border transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${
                                      isSelected
                                        ? "bg-indigo-50/80 border-indigo-300 shadow-md ring-2 ring-indigo-500/20"
                                        : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex items-start sm:items-center gap-3.5">
                                      <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0 ${
                                          isSelected
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-300"
                                            : "bg-indigo-50 text-indigo-600"
                                        }`}
                                      >
                                        {isSelected ? <Play className="w-4 h-4 fill-current" /> : <BookOpen className="w-5 h-5" />}
                                      </div>

                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                                              isSelected
                                                ? "bg-indigo-600 text-white"
                                                : "text-indigo-600 bg-indigo-50/80"
                                            }`}
                                          >
                                            {t("lecture_order", `محاضرة ${itemOrder}`, {
                                              order: itemOrder,
                                            })}
                                          </span>
                                          {lectureObj.duration && (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                              <Clock className="w-3 h-3" />
                                              {lectureObj.duration}
                                            </span>
                                          )}
                                        </div>

                                        <h5 className="font-bold text-sm text-gray-900">
                                          {lectTitle || `${t("lecture", "محاضرة")} ${itemOrder}`}
                                        </h5>

                                        {lectContent && (
                                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
                                            {lectContent}
                                          </p>
                                        )}

                                        {/* Resource Badges */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                          {videoUrl && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                              <Video className="w-2.5 h-2.5" />
                                              {t("video_material", "فيديو شرح")}
                                            </span>
                                          )}
                                          {pdfUrl && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                                              <FileText className="w-2.5 h-2.5" />
                                              {t("pdf_material", "ملف PDF")}
                                            </span>
                                          )}
                                          {slidesUrl && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                                              <Presentation className="w-2.5 h-2.5" />
                                              {t("slides_material", "عرض تقديمي")}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-center">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewLectureOnStage(lectureObj.id);
                                        }}
                                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer ${
                                          isSelected
                                            ? "bg-indigo-600 text-white"
                                            : "bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white"
                                        }`}
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>{isSelected ? t("playing_now", "يعرض الآن") : t("watch_lecture_preview", "تشغيل المحاضرة")}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback Flat List (If course has direct lectures array) */
                <div className="space-y-3">
                  {displayedLectures.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 text-center space-y-3">
                      <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800">
                        {t(
                          "no_lectures_in_course",
                          "لا توجد محاضرات مضافة في هذا المقرر حتى الآن"
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        {t(
                          "no_lectures_in_course_desc",
                          "سيتم إضافة المحاضرات والدروس قريباً من قبل المحاضر."
                        )}
                      </p>
                    </div>
                  ) : (
                    displayedLectures.map((lecture: Lecture, index: number) => {
                      const lectureOrder = lecture.order || index + 1;
                      const lectTitle = isArabic
                        ? lecture.title_ar || lecture.title
                        : lecture.title_en || lecture.title_ar || lecture.title;
                      const lectContent = isArabic
                        ? lecture.content_ar || lecture.content
                        : lecture.content_en || lecture.content_ar || lecture.content;
                      const videoUrl = getLectureVideo(lecture);
                      const pdfUrl = getLecturePdf(lecture);
                      const slidesUrl = getLectureSlides(lecture);
                      const isSelected = activeLecture?.id === lecture.id;

                      return (
                        <div
                          key={lecture.id || index}
                          onClick={() => handleViewLectureOnStage(lecture.id)}
                          className={`rounded-2xl p-4 sm:p-5 border transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50/80 border-indigo-300 shadow-md ring-2 ring-indigo-500/20"
                              : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0 ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-300"
                                  : "bg-indigo-50 text-indigo-600"
                              }`}
                            >
                              {isSelected ? <Play className="w-4 h-4 fill-current" /> : <BookOpen className="w-5 h-5" />}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                                    isSelected
                                      ? "bg-indigo-600 text-white"
                                      : "text-indigo-600 bg-indigo-50/80"
                                  }`}
                                >
                                  {t("lecture_order", `محاضرة ${lectureOrder}`, {
                                    order: lectureOrder,
                                  })}
                                </span>
                                {lecture.duration && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                    <Clock className="w-3 h-3" />
                                    {lecture.duration}
                                  </span>
                                )}
                              </div>

                              <h5 className="font-bold text-sm text-gray-900">
                                {lectTitle || `${t("lecture", "محاضرة")} ${lectureOrder}`}
                              </h5>

                              {lectContent && (
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
                                  {lectContent}
                                </p>
                              )}

                              {/* Resource Badges */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {videoUrl && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                    <Video className="w-2.5 h-2.5" />
                                    {t("video_material", "فيديو شرح")}
                                  </span>
                                )}
                                {pdfUrl && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                                    <FileText className="w-2.5 h-2.5" />
                                    {t("pdf_material", "ملف PDF")}
                                  </span>
                                )}
                                {slidesUrl && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                                    <Presentation className="w-2.5 h-2.5" />
                                    {t("slides_material", "عرض تقديمي")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="flex items-center gap-2 self-end md:self-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLectureOnStage(lecture.id);
                              }}
                              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white"
                              }`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{isSelected ? t("playing_now", "يعرض الآن") : t("watch_lecture_preview", "تشغيل المحاضرة")}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Notice when more lectures are available in the full course */}
              {hasMoreLectures && (
                <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-50/90 via-indigo-50/50 to-slate-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900">
                        {isArabic
                          ? `يتم عرض أول 3 محاضرات فقط للمعاينة (متبقي ${remainingLecturesCount} محاضرة)`
                          : `Showing first 3 lectures for preview (${remainingLecturesCount} more available)`}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {isArabic
                          ? "للوصول إلى جميع المحاضرات الكاملة والمذكرات الدراسية، يرجى تسجيل الدخول إلى حسابك."
                          : "To access all full lectures and study materials, please log in to your account."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => navigate("/login")}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer w-full sm:w-auto text-center"
                    >
                      {t("login", "تسجيل الدخول")}
                    </button>
                  </div>
                </div>
              )}
            </div>

         
          </div>
        )}
      </main>

      {/* Video Preview Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        sessionName={modalVideoName}
        videoUrl={modalVideoUrl}
      />
    </div>
  );
}
