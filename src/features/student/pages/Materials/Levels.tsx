import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../contexts/LanguageContext";
import CurriculumCard from "../../components/CurriculumCard";
import { useQuery } from "@tanstack/react-query";
import { getMyCourses } from "../../services/CoursePurchaseServices";
import { Course } from "../../../../types/courses";

export default function Levels() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-courses"],
    queryFn: getMyCourses,
  });

  const courses: Course[] = data?.data?.items ?? data?.data ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-6 md:p-10 max-w-7xl mx-auto">
      {/* Top Back Nav */}
      <div>
        <button
          onClick={() => navigate("/student-dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm"
        >
          <ArrowLeft size={16} />
          {language === "ar" ? "العودة للرئيسية" : "Back to Dashboard"}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            {language === "ar" ? "كورساتي" : "My Courses"}
          </h1>
          {!isLoading && (
            <p className="text-slate-500 font-medium mt-1">
              {courses.length} {language === "ar" ? "كورس" : "Courses"}
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-500 font-medium">
              {language === "ar" ? "جاري التحميل..." : "Loading courses..."}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-red-500 font-semibold text-lg">
            {language === "ar"
              ? "حدث خطأ أثناء تحميل الكورسات"
              : "Failed to load courses"}
          </p>
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {courses.map((course: Course, index: number) => (
            <CurriculumCard
              key={course.id}
              id={index + 1}
              title={
                (language === "ar" ? course.title_ar : course.title_en) ||
                course.title ||
                "Untitled Course"
              }
              description={
                (language === "ar"
                  ? course.description_ar
                  : course.description_en) ||
                course.description ||
                ""
              }
              totalSessions={course.lectures?.length ?? 1}
              completedSessions={0}
              currentSession={1}
              startSessionNumber={1}
              status={"In Progress"}
              onClick={() =>
                navigate(
                  `/student-dashboard/Materials/Levels/${course.id}`,
                  {
                    state: {
                      courseTitle:
                        (language === "ar"
                          ? course.title_ar
                          : course.title_en) || course.title,
                    },
                  },
                )
              }
            />
          ))}

          {courses.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-lg">
                {language === "ar"
                  ? "لا توجد كورسات مشترك فيها حالياً"
                  : "No courses found"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
