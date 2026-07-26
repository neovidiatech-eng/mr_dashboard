import { useEffect, useMemo, useState } from "react";
import { Video, LogOut } from "lucide-react";
import { useJoinSession, useEndSession, useUserSessions } from "../../hooks/useSessions";
import { Schedule } from "../../types/scheduales";
import { useLanguage } from "../../contexts/LanguageContext";
import FeedbackModal from "../../features/teacher/components/FeedbackModal";

const getActualEndTime = (session: Schedule) => {
  const start = new Date(session.start_time).getTime();
  const end = session.end_time ? new Date(session.end_time).getTime() : 0;
  if (!end || isNaN(end) || end <= start) {
    return start + (session.type?.toLowerCase() === 'half' ? 30 * 60 * 1000 : 60 * 60 * 1000);
  }
  return end;
};

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function MiniHeaderTimer() {
  const { language } = useLanguage();
  const { data, isLoading } = useUserSessions("");
  const { mutateAsync: joinSession, isPending: isJoining } = useJoinSession();
  const { mutateAsync: endSession, isPending: isLeaving } = useEndSession();

  const [timeLeft, setTimeLeft] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [leftSessionId, setLeftSessionId] = useState<string | null>(null);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [feedbackSessionTitle, setFeedbackSessionTitle] = useState<string>("");
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [timeOffset, setTimeOffset] = useState<number>(0);

  useEffect(() => {
    const loadTime = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch(`https://worldtimeapi.org/api/timezone/${tz}`);
        const apiData = await res.json();
        const serverTime = new Date(apiData.datetime).getTime();
        const localTime = new Date().getTime();
        setTimeOffset(serverTime - localTime);
      } catch (error) {
        // Silent fallback to local device time if API fails
      }
    };
    loadTime();
  }, []);

  // Get nearest upcoming session
  const nextSession = useMemo<Schedule | null>(() => {
    if (!data?.data) return null;

    const sessions: Schedule[] = Array.isArray(data.data)
      ? data.data
      : [
          ...((data.data as any).toDaySchedule || []),
          ...((data.data as any).upcomingSchedule || []),
          ...((data.data as any).previousSchedule || []),
        ];

    if (!sessions.length) return null;

    const now = new Date().getTime() + timeOffset;
    
    // Sort by start time
    const sorted = [...sessions].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    
    // Find the first session that hasn't ended yet and is not completed
    return sorted.find(s => s.status?.toLowerCase() !== "completed" && getActualEndTime(s) > now) || null;
  }, [data, refreshTrigger, leftSessionId, timeOffset]);


  useEffect(() => {
    if (!nextSession) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const startTime = new Date(nextSession.start_time).getTime();
    const endTime = getActualEndTime(nextSession);

    const updateTimer = () => {
      const now = new Date().getTime() + timeOffset;
      let diff = 0;
      
      if (now < startTime) {
        diff = startTime - now;
      } else if (now < endTime) {
        diff = endTime - now;
      } else {
        setRefreshTrigger(p => p + 1);
        diff = 0;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextSession, timeOffset]);

  const isSessionOngoing = useMemo(() => {
    if (!nextSession) return false;
    const now = new Date().getTime() + timeOffset;
    const startTime = new Date(nextSession.start_time).getTime();
    const endTime = getActualEndTime(nextSession);
    return now >= startTime && now < endTime;
  }, [nextSession, timeLeft, timeOffset]);

  const isReady = useMemo(() => {
    if (!nextSession) return false;
    const now = new Date().getTime() + timeOffset;
    const startTime = new Date(nextSession.start_time).getTime();
    const endTime = getActualEndTime(nextSession);
    const JOIN_THRESHOLD_MS = 5 * 60 * 1000;
    return now >= (startTime - JOIN_THRESHOLD_MS) && now < endTime;
  }, [nextSession, timeLeft, timeOffset]);

  const canLeaveSession = useMemo(() => {
    if (!nextSession) return false;
    const now = new Date().getTime() + timeOffset;
    const startTime = new Date(nextSession.start_time).getTime();
    const endTime = getActualEndTime(nextSession);
    const halfSessionDurationMs = (endTime - startTime) / 2;
    return now >= (startTime + halfSessionDurationMs);
  }, [nextSession, timeLeft, timeOffset]);

  const handleJoinSession = async () => {
    if (!nextSession?.id) return;
    try {
      await joinSession(nextSession.id);
      if (nextSession.link) {
        window.open(nextSession.link, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      // Error is handled by global interceptor
    }
  };

  const handleLeaveSession = async () => {
    if (!nextSession?.id) return;
    const sessionId = nextSession.id;
    const sessionTitle = nextSession.title || "";
    try {
      await endSession(sessionId);
      setLeftSessionId(sessionId); // hide this session immediately after leaving
      setFeedbackSessionId(sessionId);
      setFeedbackSessionTitle(sessionTitle);
      setIsFeedbackModalVisible(true);
    } catch (error) {
      // Error is handled by global interceptor
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-4">
      {/* Container Box */}
      <div className={`flex items-center gap-6 border rounded-[14px] px-5 py-2 transition-all duration-300 ${isSessionOngoing ? "bg-red-50 border-red-100" : "bg-[#F3F4F6] border-gray-100"}`}>
        {/* Next Session Label */}
        <span className={`text-[10px] font-bold uppercase tracking-tight ${isSessionOngoing ? "text-red-400" : "text-gray-400"}`}>
          {isSessionOngoing 
            ? (language === "ar" ? "الوقت المتبقي:" : "Time left:")
            : (language === "ar" ? "الحصة القادمة:" : "Next Session:")}
        </span>

        {/* Timer Units */}
        <div className="flex items-center gap-3">
          {timeLeft.days > 0 && (
            <>
              <TimeBlock 
                value={timeLeft.days} 
                label={language === "ar" ? "أيام" : "Days"} 
                isOngoing={isSessionOngoing}
              />
              <span className={`font-bold -mt-3 ${isSessionOngoing ? "text-red-200" : "text-gray-300"}`}>:</span>
            </>
          )}
          <TimeBlock 
            value={timeLeft.hours} 
            label={language === "ar" ? "ساعات" : "Hours"} 
            isOngoing={isSessionOngoing}
          />
          <span className={`font-bold -mt-3 ${isSessionOngoing ? "text-red-200" : "text-gray-300"}`}>:</span>
          <TimeBlock 
            value={timeLeft.minutes} 
            label={language === "ar" ? "دقائق" : "Min"} 
            isOngoing={isSessionOngoing}
          />
          <span className={`font-bold -mt-3 ${isSessionOngoing ? "text-red-200" : "text-gray-300"}`}>:</span>
          <TimeBlock 
            value={timeLeft.seconds} 
            label={language === "ar" ? "ثواني" : "Sec"} 
            isOngoing={isSessionOngoing}
          />
        </div>
      </div>

      {/* Action Button: Leave when ongoing and 15 mins passed, Join otherwise */}
      {isSessionOngoing && canLeaveSession ? (
        <button
          onClick={handleLeaveSession}
          disabled={isLeaving || nextSession?.id === leftSessionId}
          className="flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-sm font-bold transition-all duration-300 active:scale-95 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LogOut size={18} className="text-white" />
          <span>
            {isLeaving
              ? (language === "ar" ? "جاري المغادرة..." : "Leaving...")
              : nextSession?.id === leftSessionId
                ? (language === "ar" ? "غادرت الحصة" : "Session Left")
                : (language === "ar" ? "مغادرة الحصة" : "Leave Session")}
          </span>
        </button>
      ) : (
        <button
          onClick={handleJoinSession}
          disabled={!isReady || isJoining}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-sm font-bold transition-all duration-300 active:scale-95 ${
            isReady
              ? "bg-[#2049BF] text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
              : "bg-[#E5E7EB] text-gray-400 cursor-not-allowed border border-gray-200"
          }`}
        >
          <Video size={18} className={isReady ? "text-white" : "text-gray-300"} />
          <span>
            {isJoining
              ? (language === "ar" ? "جاري الانضمام..." : "Joining...")
              : (isSessionOngoing && !canLeaveSession 
                  ? (language === "ar" ? "انضم للحصة" : "Join Session")
                  : (language === "ar" ? "انضم للحصة" : "Join Session")
                )}
          </span>
        </button>
      )}

      {isFeedbackModalVisible && feedbackSessionId && (
        <FeedbackModal
          visible={isFeedbackModalVisible}
          onClose={() => setIsFeedbackModalVisible(false)}
          sessionId={feedbackSessionId}
          sessionTitle={feedbackSessionTitle}
        />
      )}
    </div>
  );
}

function TimeBlock({ value, label, isOngoing }: { value: number; label: string; isOngoing?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[28px]">
      <span className={`text-[15px] font-black tabular-nums leading-none ${isOngoing ? "text-red-600" : "text-gray-800"}`}>
        {String(value).padStart(2, "0")}
      </span>
      <span className={`text-[8px] font-bold uppercase tracking-tighter mt-1 ${isOngoing ? "text-red-400" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}