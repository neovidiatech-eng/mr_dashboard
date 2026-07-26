import { ArrowLeft, Award } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CurriculumCard from "../../components/CurriculumCard";

export default function Levels() {
  const navigate = useNavigate();
  const location = useLocation();
  const rank = location.state?.rank;

  const rankName = rank?.name || "Levels";
  const courses = rank?.courses || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-6 md:p-10 max-w-7xl mx-auto">
      {/* Top Back Nav */}
      <div>
        <button
          onClick={() => navigate("/student-dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Award className="w-12 h-12 text-blue-500 fill-blue-100" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{rankName} Level</h1>
            <p className="text-slate-500 font-medium mt-1">
              {courses.length} Courses
            </p>
          </div>
        </div>

        {/* Global Progress Bar (Hidden for courses view as we don't have cumulative progress here yet) */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full w-0"></div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {courses.map((course: any, index: number) => (
          <CurriculumCard
            key={course.id || index}
            id={index + 1}
            title={course.title || "Untitled Course"}
            description={course.description || "Course details"}
            totalSessions={1}
            completedSessions={0}
            currentSession={1}
            startSessionNumber={1}
            status={"In Progress"}
            onClick={() => navigate(`/student-dashboard/Materials/Levels/${course.id}`, { state: { courseTitle: course.title } })}
          />
        ))}

        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            No courses found in this level.
          </div>
        )}
      </div>
    </div>
  );
}
