import {
  ArrowLeft,
  Check,
  Play,
  Lock,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  RotateCcw,
} from "lucide-react";

import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState } from "react";

import VideoModal from "../../../../components/modals/VideoModal";
import TakeQuizModal from "../../../../components/modals/TakeQuizModal";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudentProgress } from "../../../../services/CoursesServices";
import { useCompleteLecture, useUpdateLectureProgress } from "../../../../hooks/useLectures";
import { useLanguage } from "../../../../contexts/LanguageContext";

export default function CurriculumDetails() {
  const navigate = useNavigate();
  const { curriculumId } = useParams();
  const location = useLocation();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const queryClient = useQueryClient();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoName, setSelectedVideoName] = useState("");
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedStartPosition, setSelectedStartPosition] = useState(0);

  // Quiz Modal State
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Accordion open/close state for sections (key = section.id)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const completeLectureMutation = useCompleteLecture();
  const updateProgressMutation = useUpdateLectureProgress();

  const handleVideoEnded = () => {
    if (selectedLectureId) {
      completeLectureMutation.mutate(selectedLectureId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["student-progress", curriculumId] });
        },
      });
    }
  };

  const handleVideoProgress = (playedSeconds: number, durationSeconds: number) => {
    if (selectedLectureId && playedSeconds > 0) {
      updateProgressMutation.mutate({
        id: selectedLectureId,
        position: playedSeconds,
        duration: durationSeconds || undefined,
      });
    }
  };

  const {
    data: progressData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["student-progress", curriculumId],
    queryFn: () => getStudentProgress(curriculumId!),
    enabled: !!curriculumId,
  });

  const courseTitle =
    progressData?.title ||
    location.state?.courseTitle ||
    (isAr ? "تفاصيل الكورس" : "Course Details");

  const sections = progressData?.sections || [];
  const lecturesFallback = progressData?.lectures || [];

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [secId]: prev[secId] === undefined ? false : !prev[secId],
    }));
  };

  const handleStartQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setIsQuizModalOpen(true);
  };

  const handleQuizSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ["student-progress", curriculumId] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 p-6 md:p-10 max-w-7xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm"
        >
          <ArrowLeft size={16} />
          {isAr ? "الرجوع للمستويات" : "Back to Levels"}
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        /* Error */
        <div className="p-4 bg-red-50 text-red-600 rounded-lg font-semibold">
          {isAr ? "حدث خطأ أثناء تحميل بيانات الكورس. يرجى المحاولة لاحقاً." : "Error loading curriculum data."}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-800">{courseTitle}</h1>
              <p className="text-slate-500 font-medium text-sm">
                {sections.length > 0
                  ? (isAr ? `${sections.length} سكاشن تعليمية مقسمة بالتسلسل` : `${sections.length} Ordered Learning Sections`)
                  : (isAr ? `${lecturesFallback.length} محاضرة متاحة` : `${lecturesFallback.length} lectures available`)}
              </p>
            </div>
            
            {/* Mock Exam Button */}
            <button
              onClick={() => navigate("mock-exam")}
              className="flex items-center gap-2 bg-[#800020] hover:bg-[#600018] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-red-900/20 active:scale-95 whitespace-nowrap"
            >
              + Start New Exam
            </button>
          </div>

          {/* Access Warning Banner */}
          {progressData?.hasCourseAccess === false && (
            <div className="mb-8 flex items-center gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Lock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-800">
                  {isAr ? "الكورس ده مش ضمن اشتراكك الحالي" : "Course not included in subscription"}
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  {isAr
                    ? "اطلب شراء الكورس ده من متجر الكورسات عشان تقدر تشوف المحاضرات وتفتح السكاشن."
                    : "Please request to purchase this course from the store to unlock lectures."}
                </p>
              </div>
            </div>
          )}

          {/* Sections View (Primary Layout) */}
          {sections.length > 0 ? (
            <div className="space-y-6">
              {sections.map((sec: any, secIdx: number) => {
                const isSecOpen = openSections[sec.id] !== false; // Open by default
                const isSecLocked = sec.isLocked;
                const items = sec.section_items || [];
                const secTitle = isAr ? sec.name_ar || sec.name_en : sec.name_en || sec.name_ar;

                return (
                  <div
                    key={sec.id || secIdx}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                      isSecLocked
                        ? "border-slate-200 bg-slate-50/70"
                        : "border-slate-200 shadow-sm hover:border-slate-300"
                    }`}
                  >
                    {/* Section Header Accordion Toggle */}
                    <div
                      onClick={() => toggleSection(sec.id)}
                      className={`p-5 px-6 flex items-center justify-between cursor-pointer select-none transition-colors ${
                        isSecLocked ? "bg-slate-100/70" : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isSecLocked
                              ? "bg-slate-200 text-slate-500"
                              : sec.isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isSecLocked ? <Lock size={18} /> : sec.isCompleted ? <Check size={18} strokeWidth={3} /> : secIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-800">{secTitle}</h3>
                            {isSecLocked && (
                              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-0.5 rounded-full flex items-center gap-1">
                                <Lock size={12} />
                                {isAr ? "مغلق 🔒" : "Locked 🔒"}
                              </span>
                            )}
                            {!isSecLocked && sec.isCompleted && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full flex items-center gap-1">
                                <Check size={12} />
                                {isAr ? "مكتمل بالكامل 🟢" : "Section Completed 🟢"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {isAr ? `${items.length} عناصر داخل السكشن` : `${items.length} items in this section`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isSecOpen ? (
                          <ChevronUp size={20} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={20} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Section Body */}
                    {isSecOpen && (
                      <div className="p-6 pt-2 border-t border-slate-100 space-y-4">
                        {isSecLocked ? (
                          /* Locked Section Notice */
                          <div className="py-8 px-6 text-center bg-amber-50/60 border border-amber-200/60 rounded-2xl space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 mx-auto flex items-center justify-center text-amber-700">
                              <Lock size={22} />
                            </div>
                            <h4 className="font-bold text-amber-900 text-base">
                              {isAr ? "هذا السكشن مغلق حالياً" : "This section is currently locked"}
                            </h4>
                            <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed font-medium">
                              {isAr
                                ? "يجب عليك مشاهدة كافة محاضرات السكشن السابق واجتياز الكويز الخاص به أولاً لفتح هذا السكشن والتأهل للدروس القادمة."
                                : "You must complete all lectures in the previous section and pass its section quiz to unlock this section."}
                            </p>
                          </div>
                        ) : items.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-dashed">
                            {isAr ? "لا توجد عناصر في هذا السكشن بعد." : "No items in this section yet."}
                          </div>
                        ) : (
                          /* Section Items (Lectures & Quiz) */
                          items.map((item: any, itemIdx: number) => {
                            const type = (item.item_type || "").toUpperCase();
                            const details = item.details || {};

                            if (type === "LECTURE") {
                              const isCompleted = item.status === "Completed";
                              const isPending = item.status === "Pending";
                              const lectTitle = isAr ? details.title_ar || details.title : details.title_en || details.title;

                              return (
                                <div
                                  key={item.id || itemIdx}
                                  className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                        isCompleted
                                          ? "bg-emerald-100 text-emerald-700"
                                          : isPending
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      {isCompleted ? <Check size={18} strokeWidth={3} /> : <BookOpen size={18} />}
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-400">
                                          {isAr ? `محاضرة ${item.order}` : `Lecture ${item.order}`}
                                        </span>
                                      </div>
                                      <h4 className="font-bold text-sm text-slate-800 mt-0.5">
                                        {lectTitle || `Lecture ${item.order}`}
                                      </h4>
                                      {details.duration && (
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                          {isAr ? `المدة: ${details.duration}` : `Duration: ${details.duration}`}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        isCompleted
                                          ? "bg-emerald-100 text-emerald-700"
                                          : isPending
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-slate-200 text-slate-500"
                                      }`}
                                    >
                                      {isCompleted ? (isAr ? "مكتملة 🟢" : "Completed") : (isAr ? "قيد المشاهدة" : "Pending")}
                                    </span>

                                    {(isCompleted || isPending) && (details.video_path || details.videoUrl) && (
                                      <button
                                        onClick={() => {
                                          setSelectedVideoName(lectTitle || `Lecture ${item.order}`);
                                          setSelectedVideoUrl(details.video_path || details.videoUrl);
                                          setSelectedLectureId(details.id || item.item_id);
                                          setSelectedStartPosition(item.lastPosition || 0);
                                          setIsVideoModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                                      >
                                        <Play size={14} fill="currentColor" />
                                        <span>{isAr ? "مشاهدة الفيديو" : "Watch Video"}</span>
                                      </button>
                                    )}

                                    {isPending && (
                                      <button
                                        onClick={() =>
                                          completeLectureMutation.mutate(details.id || item.item_id, {
                                            onSuccess: () => {
                                              queryClient.invalidateQueries({ queryKey: ["student-progress", curriculumId] });
                                            },
                                          })
                                        }
                                        disabled={completeLectureMutation.isPending}
                                        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                                      >
                                        <Check size={14} />
                                        <span>{isAr ? "علامة مكتمل" : "Complete"}</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            } else if (type === "QUIZ") {
                              const quizDetails = details || {};
                              const attempt = item.attempt;
                              const isPassed = item.status === "Passed";
                              const isFailed = item.status === "Failed";
                              const quizTitle = isAr ? quizDetails.title_ar : quizDetails.title_en || quizDetails.title_ar;

                              return (
                                <div
                                  key={item.id || itemIdx}
                                  className={`rounded-2xl p-5 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                                    isPassed
                                      ? "bg-emerald-50/70 border-emerald-200"
                                      : isFailed
                                      ? "bg-red-50/70 border-red-200"
                                      : "bg-blue-50/60 border-blue-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                                        isPassed
                                          ? "bg-emerald-100 text-emerald-700"
                                          : isFailed
                                          ? "bg-red-100 text-red-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      <Award size={24} />
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-blue-700 uppercase tracking-wide">
                                          {isAr ? "🏆 كويز السكشن الإجباري" : "🏆 Required Section Quiz"}
                                        </span>
                                      </div>
                                      <h4 className="font-black text-base text-slate-800 mt-0.5">
                                        {quizTitle || (isAr ? "كويز نهاية السكشن" : "Section Quiz")}
                                      </h4>
                                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        {isAr
                                          ? `المدة: ${quizDetails.duration_min || 30} دقيقة • درجة النجاح: ${quizDetails.pass_points || 10}/${quizDetails.total_points || 20}`
                                          : `Duration: ${quizDetails.duration_min || 30} mins • Pass: ${quizDetails.pass_points || 10}/${quizDetails.total_points || 20}`}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {isPassed ? (
                                      <div className="flex items-center gap-3">
                                        <div className="text-end">
                                          <span className="block text-xs font-bold text-emerald-700">
                                            {isAr ? "تم الاجتياز بنجاح 🎉" : "Passed 🎉"}
                                          </span>
                                          <span className="text-xs font-black text-slate-700">
                                            {attempt?.score} / {attempt?.total_points} {isAr ? "درجة" : "pts"}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => handleStartQuiz(item.item_id)}
                                          className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl text-xs transition flex items-center gap-1"
                                        >
                                          <RotateCcw size={14} />
                                          <span>{isAr ? "إعادة" : "Retry"}</span>
                                        </button>
                                      </div>
                                    ) : isFailed ? (
                                      <div className="flex items-center gap-3">
                                        <div className="text-end">
                                          <span className="block text-xs font-bold text-red-700">
                                            {isAr ? "لم تتجاوز درجة النجاح ❌" : "Failed ❌"}
                                          </span>
                                          <span className="text-xs font-black text-slate-700">
                                            {attempt?.score} / {attempt?.total_points} {isAr ? "درجة" : "pts"}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => handleStartQuiz(item.item_id)}
                                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                                        >
                                          <RotateCcw size={14} />
                                          <span>{isAr ? "أعد المحاولة 🔄" : "Retry Quiz 🔄"}</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleStartQuiz(item.item_id)}
                                        className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
                                      >
                                        <Award size={16} />
                                        <span>{isAr ? "ابدأ كويز السكشن 📝" : "Start Section Quiz 📝"}</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback Flat List (If course has no sections defined) */
            <div className="space-y-4">
              {lecturesFallback.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  {isAr ? "لا توجد محاضرات في هذا الكورس بعد." : "No lectures found for this course."}
                </div>
              ) : (
                lecturesFallback.map((lecture: any, index: number) => {
                  const isCompleted = lecture.status === "Completed";
                  const isPending = lecture.status === "Pending" || !lecture.status;
                  const lectureOrder = lecture.order || index + 1;

                  return (
                    <div
                      key={lecture.id || index}
                      className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                            isCompleted
                              ? "bg-green-100 text-green-600"
                              : isPending
                              ? "bg-amber-100 text-amber-600"
                              : "bg-slate-50 border border-slate-200 text-slate-500"
                          }`}
                        >
                          {isCompleted ? <Check strokeWidth={3} size={20} /> : lectureOrder}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                            {(isAr ? lecture.title_ar || lecture.title : lecture.title_en || lecture.title) || `Lecture ${lectureOrder}`}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : isPending
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {lecture.status || "Pending"}
                        </span>
                        {(isCompleted || isPending) && (lecture.video_path || lecture.videoUrl) && (
                          <button
                            onClick={() => {
                              setSelectedVideoName(lecture.title || `Lecture ${lectureOrder}`);
                              setSelectedVideoUrl(lecture.video_path || lecture.videoUrl);
                              setSelectedLectureId(lecture.id);
                              setSelectedStartPosition(lecture.lastPosition || 0);
                              setIsVideoModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-blue-200"
                          >
                            <Play size={16} fill="currentColor" />
                            {isAr ? "مشاهدة الفيديو" : "Watch Video"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Video Modal */}
          <VideoModal
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
            sessionName={selectedVideoName}
            videoUrl={selectedVideoUrl}
            onEnded={handleVideoEnded}
            startPosition={selectedStartPosition}
            onProgress={handleVideoProgress}
          />

          {/* Take Quiz Modal */}
          <TakeQuizModal
            isOpen={isQuizModalOpen}
            quizId={activeQuizId}
            onClose={() => {
              setIsQuizModalOpen(false);
              setActiveQuizId(null);
            }}
            onSubmitted={handleQuizSubmitted}
          />
        </>
      )}
    </div>
  );
}
