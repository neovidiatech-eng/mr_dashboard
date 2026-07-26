import {
  Calendar,
  Award,
  BookOpen,
  User,
  MessageSquare,
  ChevronRight,
  Star,
  Plus,
  ClipboardList,
} from "lucide-react";
// Student Dashboard Page
import { useState, useEffect, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { studentDashboardRoutes } from "./studentDashboardRoutes";
import { useDashboardData } from "../../features/student/hooks/useDashboardData";
import { useCreateConversation } from "../../hooks/useMessages";
import { useJoinSession } from "../../features/student/hooks/useSessions";

import { useLanguage } from "../../contexts/LanguageContext";
import TeacherFeedback from "../../features/student/components/Feedback";
import SubmitAssignmentModal from "../../components/modals/SubmitAssignmentModal";
import { Assignment } from "../../types/assignment";
import { useGetAssignments } from "../../features/student/hooks/useStudentsAssignment";
import { useServerTime } from "../../hooks/useServerTime";
import { useUserSessions } from "../../hooks/useSessions";

const getActualEndTime = (session: any) => {
  const start = new Date(session.start_time).getTime();
  const end = session.end_time ? new Date(session.end_time).getTime() : 0;
  if (!end || isNaN(end) || end <= start) {
    return start + (session.type?.toLowerCase() === 'half' ? 30 * 60 * 1000 : 60 * 60 * 1000);
  }
  return end;
};

export default function StudentDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { getServerTime } = useServerTime();

  const { data: dashboardResponse, isLoading: isDashboardLoading, refetch } = useDashboardData();
  const dashboardData = dashboardResponse?.data;
  const metadata = dashboardData?.metadata;
  
  const { data: userSessionsData } = useUserSessions("");
  const nextSession = useMemo(() => {
    if (!userSessionsData?.data) return dashboardData?.nextSchedule || null;
    const sessions = Array.isArray(userSessionsData.data) ? userSessionsData.data : [
      ...((userSessionsData.data as any).toDaySchedule || []),
      ...((userSessionsData.data as any).upcomingSchedule || []),
      ...((userSessionsData.data as any).previousSchedule || []),
    ];
    if (!sessions.length) return dashboardData?.nextSchedule || null;
    const now = getServerTime();
    const sorted = [...sessions].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    return sorted.find(s => s.status?.toLowerCase() !== "completed" && getActualEndTime(s) > now) || dashboardData?.nextSchedule || null;
  }, [userSessionsData, dashboardData, getServerTime]);

  const { mutate: startChat, isPending } = useCreateConversation();
  const { mutate: joinSession, isPending: isJoining } = useJoinSession();

  const { data: assignmentsResponse } = useGetAssignments();
  const latestAssignments = (assignmentsResponse?.data || []).slice(0, 3);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const handleSubmitClick = (e: React.MouseEvent, assignment: Assignment) => {
    e.stopPropagation();
    setSelectedAssignment(assignment);
    setIsSubmitModalOpen(true);
  };


  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!nextSession) {
      setTimeLeft(0);
      return;
    }
    const startTime = new Date(nextSession.start_time).getTime();
    const endTime = getActualEndTime(nextSession);

    const updateTimer = () => {
      const now = getServerTime();

      if (now < startTime) {
        // Counting down to start
        setTimeLeft(startTime - now);
      } else if (now < endTime) {
        // Session is ongoing, counting down to end
        setTimeLeft(endTime - now);
      } else {
        // Session ended
        if (timeLeft > 0) {
          setTimeLeft(0);
          refetch(); // Fetch next session if available
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [nextSession, refetch, getServerTime]);

  const countdown = useMemo(() => {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return {
      days: d.toString().padStart(2, '0'),
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0'),
      totalSeconds
    };
  }, [timeLeft]);

  const JOIN_THRESHOLD_SECONDS = 5 * 60;

  const isSessionOngoing = useMemo(() => {
    if (!nextSession) return false;
    const now = getServerTime();
    const startTime = new Date(nextSession.start_time).getTime();
    const endTime = getActualEndTime(nextSession);
    return now >= startTime && now < endTime;
  }, [nextSession, timeLeft, getServerTime]);

  const isSessionReady = useMemo(() => {
    if (!nextSession) return false;
    const now = getServerTime();
    const startTime = new Date(nextSession.start_time).getTime();
    const endTime = getActualEndTime(nextSession);
    return (now >= startTime - (JOIN_THRESHOLD_SECONDS * 1000)) && now < endTime;
  }, [nextSession, timeLeft, getServerTime]);

  const renderStudentHome = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Main Welcome/Session Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2563eb] to-[#1e40af] p-8 md:p-12 text-white shadow-2xl shadow-blue-500/20 group">
        {/* Background Decorative Circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-1000" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-1000" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <p className={`font-bold tracking-widest uppercase text-xs ${isSessionOngoing ? "text-red-400" : "text-blue-100"}`}>
                {isSessionOngoing
                  ? (language === "ar" ? "الوقت المتبقي لنهاية الحصة" : "Time remaining in session")
                  : (language === "ar" ? "تبدأ الحصة القادمة خلال" : "Next Session Starts In")}
              </p>
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter flex items-baseline gap-2 ${isSessionOngoing ? "text-red-500" : "text-white"}`}>
                {countdown.days !== "00" && (
                  <span className="flex items-baseline gap-1">
                    {countdown.days}
                    <span className="text-xl opacity-60 font-bold uppercase">{language === "ar" ? "يوم" : "d"}</span>
                  </span>
                )}
                <span className="flex items-baseline gap-1">
                  {countdown.hours}
                  <span className="text-xl opacity-60 font-bold uppercase">{language === "ar" ? "س" : "h"}</span>
                </span>
                <span className="flex items-baseline gap-1">
                  {countdown.minutes}
                  <span className="text-xl opacity-60 font-bold uppercase">{language === "ar" ? "د" : "m"}</span>
                </span>
                <span className="flex items-baseline gap-1">
                  {countdown.seconds}
                  <span className="text-xl opacity-60 font-bold uppercase">{language === "ar" ? "ث" : "s"}</span>
                </span>
              </h2>
            </div>

            <div className="space-y-4 pt-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {nextSession ? nextSession.title : (language === "ar" ? "لا توجد حصص قادمة" : "No upcoming sessions")}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-blue-100/80 font-medium">
                {nextSession && (
                  <>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <BookOpen size={16} />
                      <span className="text-sm">{nextSession?.course?.title || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <User size={16} />
                      <span className="text-sm">{nextSession?.teacher?.user?.name || "-"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6">
              <button
                onClick={async () => {
                  if (nextSession) {
                    joinSession(nextSession.id);
                    if (nextSession.link) {
                      window.open(nextSession.link, "_blank", "noopener,noreferrer");
                    }
                  }
                }}
                disabled={!isSessionReady || isJoining}
                className={`px-8 py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${isSessionReady
                  ? "bg-white text-blue-600 hover:bg-blue-50 hover:-translate-y-1"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
                  }`}
              >
                {isJoining
                  ? (language === "ar" ? "جاري الانضمام..." : "Joining...")
                  : (isSessionOngoing
                    ? (language === "ar" ? "انضم للحصة الآن" : "Join Ongoing Session")
                    : (isSessionReady
                      ? (language === "ar" ? "انضم الآن" : "Join Now")
                      : (language === "ar" ? "انتظر الحصة" : "Wait for Session")))}
              </button>

              <button
                onClick={() => navigate('/student-dashboard/reschedule')}
                className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95"
              >
                <Calendar size={18} />
                Reschedule
              </button>
              <button
                onClick={() => {
                  if (nextSession) {
                    startChat(
                      {
                        teacherId: nextSession?.teacher?.id,
                        studentId: metadata?.id || "",
                      },
                      {
                        onSuccess: (data) => {
                          console.log("📝 Chat Data:", data);
                          console.log("👨‍🏫 Teacher Object:", nextSession?.teacher);
                          navigate("/student-dashboard/chat", {
                            state: {
                              conversationId: data.id,
                              teacherId: nextSession?.teacher?.id,
                              teacherUserId: nextSession?.teacher?.user?.id,
                              teacherName: nextSession?.teacher?.user?.name || "Instructor",
                              teacherSubject: nextSession?.course?.title || "General",
                              sessionTitle: nextSession?.title || "Not scheduled",
                              sessionTime: nextSession?.start_time,
                            },
                          });
                        },
                      }
                    );
                  }
                }}
                disabled={isPending || !nextSession}
                className={`flex items-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all ${(!nextSession) ? "text-white/40 cursor-not-allowed" : "text-white/80 hover:text-white"
                  }`}
              >
                <MessageSquare size={18} />
                {isPending ? "Opening..." : "Message Instructor"}
              </button>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-4">
            <div className="bg-white/10 border border-white/20 backdrop-blur-md px-6 py-2.5 rounded-full text-sm font-bold tracking-wide uppercase">
              Upcoming
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Subscription & Feedback Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-8">
        <div className="lg:col-span-1 h-full">
          {/* Your Subscription Card */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4 mt-10">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  Your Subscription
                </h3>
                <p className="text-slate-400 font-bold text-xs tracking-wide">
                  {metadata?.plan?.name || "No Plan"}
                </p>
              </div>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Annual
              </span>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="space-y-2 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500">
                    Sessions Progress
                  </span>
                  <span className="text-xs font-black text-slate-800 tracking-tighter">
                    {metadata?.sessions_attended || 0} / {metadata?.sessions || 0}
                  </span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${((metadata?.sessions_attended || 0) / (metadata?.sessions || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 pb-0 mt-10">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Sessions Remaining
                  </p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">
                    {metadata?.sessions_remaining || 0}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Price
                  </p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">
                    {metadata?.plan?.price}  {metadata?.plan?.currency?.symbol}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 h-full">
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {language === "ar" ? "آخر الواجبات" : "Latest Assignments"}
                </h3>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {latestAssignments.length > 0 ? (
                latestAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-50 hover:border-indigo-100 hover:bg-white transition-all group cursor-pointer"
                  >
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 truncate">
                          {assignment.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border shrink-0 ${assignment.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          assignment.status === 'submitted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {language === 'ar' ?
                            (assignment.status === 'completed' ? 'مكتمل' : assignment.status === 'submitted' ? 'تم التسليم' : 'قيد الانتظار') :
                            assignment.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-bold truncate">
                        {assignment.description}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleSubmitClick(e, assignment)}
                      className={`p-2 rounded-xl bg-white text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all shadow-sm shrink-0 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <BookOpen className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-xs font-bold">
                    {language === "ar" ? "لا توجد واجبات حالياً" : "No assignments found"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 h-full">
          {(dashboardData?.metadata?.user?.reviewsReceived?.length ?? 0) > 0 ? (
            <TeacherFeedback
              rating={Number(dashboardData?.metadata?.user?.reviewsReceived?.[0]?.rating || 0)}
              message={dashboardData?.metadata?.user?.reviewsReceived?.[0]?.comment || ""}
            />
          ) : (
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 flex flex-col items-center justify-center h-full shadow-sm">
              <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
              <h2 className="text-xl font-bold text-slate-400 text-center">
                {language === "ar" ? "لا يوجد تقييمات حتى الآن" : "No reviews yet"}
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Learning Path Section - Aligned with Subscription (2/3 width) */}
      <div className="space-y-8 lg:w-2/3">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
            Learning Path
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Level Card - Enhanced & Enlarged */}
          <div
            className="group relative bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden"
            onClick={() => {
              const rank = metadata?.rank;
              if (rank) {
                navigate(`/student-dashboard/Materials/Levels`, {
                  state: { rank }
                });
              } else {
                navigate('/student-dashboard/Materials/Levels');
              }
            }}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[80px] -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-700" />

            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Award size={32} strokeWidth={1.5} />
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} strokeWidth={3} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                    Active Level
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors">
                  {metadata?.rank?.name || 'No Rank'}
                </h4>
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen size={16} className="text-blue-400" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {metadata?.rank?.courses.length + ' ' + 'Curriculums Available'}
                  </p>
                </div>
              </div>

              {/* <div className="pt-2 flex items-center gap-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-2/3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
                <span className="text-xs font-black text-slate-800">65%</span>
              </div> */}
            </div>
          </div>

          {/* Stats/Next Goal Card */}
          <div className="bg-slate-50/50 rounded-[32px] p-8 border border-dashed border-slate-200 flex flex-col justify-center items-center gap-4 text-center group hover:bg-white hover:border-solid hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-400 transition-colors shadow-sm">
              <Star size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Next Milestone</p>
              <h5 className="text-lg font-bold text-slate-600 group-hover:text-slate-800 leading-tight">Keep learning to unlock the next rank!</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <StudentDashboardLayout>
        {isDashboardLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Routes>
            <Route index element={renderStudentHome()} />
            {studentDashboardRoutes.flatMap((route) => {
              if (route.subItems) {
                return route.subItems.map((subItem) => (
                  <Route
                    key={subItem.id}
                    path={subItem.path}
                    element={subItem.element}
                  />
                ));
              }
              return route.element
                ? [
                  <Route
                    key={route.id}
                    path={route.path}
                    element={route.element}
                  />,
                ]
                : [];
            })}
          </Routes>
        )}
      </StudentDashboardLayout>
      {isSubmitModalOpen && selectedAssignment && (
        <SubmitAssignmentModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.title}
        />
      )}
    </>
  );
}
