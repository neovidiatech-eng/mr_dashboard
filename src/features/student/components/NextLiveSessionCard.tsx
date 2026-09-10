import { useState, useMemo, useEffect } from 'react';
import { Radio, CalendarDays, Clock, Play, Loader2, Sparkles, Layers, LogIn } from 'lucide-react';
import { useGetStudentNextLiveSession, useGetStudentUpcomingLiveSessions, useJoinLiveSession } from '../../../hooks/useLiveSessions';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useServerTime } from '../../../hooks/useServerTime';
import JitsiMeeting from '../../../components/modals/JitsiMeeting';

function formatSessionDate(dateStr: string) {
    if (!dateStr) return { date: '-', time: '-' };
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return { date: dateStr, time: '' };
        return {
            date: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }),
            dateEn: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true }),
            timeEn: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        };
    } catch {
        return { date: dateStr, time: '', dateEn: dateStr, timeEn: '' };
    }
}

export default function NextLiveSessionCard() {
    const { language } = useLanguage();
    const isAr = language === 'ar';
    const { getServerTime } = useServerTime();

    const { data: nextResponse, isLoading: isNextLoading } = useGetStudentNextLiveSession();
    const { data: upcomingResponse, isLoading: isUpcomingLoading } = useGetStudentUpcomingLiveSessions(1, 10);
    const { mutate: joinLive, isPending: isJoining } = useJoinLiveSession();

    const [activeJitsiSession, setActiveJitsiSession] = useState<{
        roomName: string;
        token: string;
        title?: string;
    } | null>(null);
    const [joinedSessionIds, setJoinedSessionIds] = useState<string[]>([]);

    // Find active live session with highest priority, or fallback to next scheduled session
    const session = useMemo(() => {
        const nextSession = nextResponse?.data;
        const upcomingItems: any[] = upcomingResponse?.data?.items ?? (Array.isArray(upcomingResponse?.data) ? upcomingResponse?.data : []);

        const liveFromUpcoming = upcomingItems.find((s) => s?.status === 'live');
        const liveFromNext = nextSession?.status === 'live' ? nextSession : null;

        return liveFromUpcoming || liveFromNext || nextSession || upcomingItems[0] || null;
    }, [nextResponse, upcomingResponse]);

    const isLive = session?.status === 'live';
    const hasJoinedBefore = session?.id ? joinedSessionIds.includes(session.id) : false;
    const isLoading = isNextLoading && isUpcomingLoading && !session;

    // Timer calculation for countdown if session is scheduled
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!session?.startAt) {
            setTimeLeft(0);
            return;
        }

        const startTime = new Date(session.startAt).getTime();
        const updateTimer = () => {
            const now = getServerTime();
            const diff = startTime - now;
            setTimeLeft(diff > 0 ? diff : 0);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [session?.startAt, getServerTime]);

    const countdown = useMemo(() => {
        const totalSeconds = Math.floor(timeLeft / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return {
            days: days.toString().padStart(2, '0'),
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            totalSeconds,
        };
    }, [timeLeft]);

    const handleJoin = () => {
        if (!session || !isLive) return;

        // Check if we already have a cached token for this session (for rejoin)
        const cached = sessionStorage.getItem(`live_session_${session.id}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.token && parsed.roomName) {
                    setActiveJitsiSession({
                        roomName: parsed.roomName,
                        token: parsed.token,
                        title: parsed.title || session.title,
                    });
                    setJoinedSessionIds((prev) => (prev.includes(session.id) ? prev : [...prev, session.id]));
                    return;
                }
            } catch (e) {
                console.warn('Failed to parse cached session token:', e);
            }
        }

        // Otherwise request join token from backend
        joinLive(session.id, {
            onSuccess: (res: any) => {
                const token = res?.data?.token || res?.token;
                const roomName = res?.data?.roomName || res?.roomName || session.roomName;
                const title = res?.data?.title || res?.title || session.title;

                if (token && roomName) {
                    const sessionData = { roomName, token, title };
                    sessionStorage.setItem(`live_session_${session.id}`, JSON.stringify(sessionData));
                    setActiveJitsiSession(sessionData);
                    setJoinedSessionIds((prev) => (prev.includes(session.id) ? prev : [...prev, session.id]));
                }
            },
            onError: () => {
                // If backend throws an error on duplicate join, check if token was saved
                const fallbackCached = sessionStorage.getItem(`live_session_${session.id}`);
                if (fallbackCached) {
                    try {
                        const parsed = JSON.parse(fallbackCached);
                        if (parsed.token && parsed.roomName) {
                            setActiveJitsiSession({
                                roomName: parsed.roomName,
                                token: parsed.token,
                                title: parsed.title || session.title,
                            });
                            setJoinedSessionIds((prev) => (prev.includes(session.id) ? prev : [...prev, session.id]));
                        }
                    } catch (e) {
                        console.error('Fallback join failed:', e);
                    }
                }
            },
        });
    };

    if (isLoading) {
        return (
            <div
                className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a] text-white p-8 border border-white/10 shadow-xl flex items-center justify-center min-h-[220px]"
                dir={isAr ? 'rtl' : 'ltr'}
            >
                <div className="flex flex-col items-center gap-3 text-slate-300">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
                    <p className="text-sm font-semibold">
                        {isAr ? 'جاري تحميل تفاصيل البث القادم...' : 'Loading next live session...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div
                className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-8 border border-white/10 shadow-lg"
                dir={isAr ? 'rtl' : 'ltr'}
            >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                            <Radio className="w-7 h-7 opacity-50" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {isAr ? 'البث المباشر القادم' : 'Next Live Session'}
                            </h3>
                            <p className="text-sm text-slate-400">
                                {isAr ? 'لا توجد جلسات بث مباشر مجدولة حالياً' : 'No upcoming live sessions scheduled currently'}
                            </p>
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-400">
                        {isAr ? 'كن على استعداد للجلسات القادمة' : 'Stay tuned for new sessions'}
                    </div>
                </div>
            </div>
        );
    }

    const { date, time, dateEn, timeEn } = formatSessionDate(session.startAt);

    return (
        <>
            <div
                className={`relative overflow-hidden rounded-[32px] p-8 sm:p-10 transition-all duration-300 text-white shadow-2xl border ${isLive
                        ? 'bg-gradient-to-br from-[#4a0013] via-[#75001d] to-[#260009] border-rose-500/30 shadow-rose-950/40'
                        : 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#172554] border-indigo-500/20 shadow-indigo-950/30'
                    }`}
                dir={isAr ? 'rtl' : 'ltr'}
            >
                {/* Ambient Glows */}
                <div
                    className={`absolute -top-24 -end-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${isLive ? 'bg-rose-500/25 animate-pulse' : 'bg-indigo-500/20'
                        }`}
                />
                <div className="absolute -bottom-24 -start-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    {/* Main Information */}
                    <div className="flex-1 space-y-4">
                        {/* Status / Category Badges */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {isLive ? (
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 backdrop-blur-md text-xs font-bold text-rose-200">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                                    </span>
                                    <span>{isAr ? 'بث مباشر الآن' : 'LIVE NOW'}</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-slate-200">
                                    <Clock className="w-3.5 h-3.5 text-indigo-300" />
                                    <span>{isAr ? 'البث القادم' : 'Next Session'}</span>
                                </div>
                            )}

                            {(session.stage?.name_ar || session.stage?.name_en) && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white/90">
                                    <Layers className="w-3 h-3 text-indigo-300" />
                                    <span>
                                        {isAr
                                            ? (session.stage?.name_ar)
                                            : (session.stage?.name_en)}
                                    </span>
                                </span>
                            )}

                            {session.plan?.name && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white/90">
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                    <span>{session.plan.name}</span>
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                            {session.title}
                        </h3>

                        {/* Timing Details */}
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/80 font-medium">
                            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                                <CalendarDays className="w-4 h-4 text-rose-300" />
                                <span>{isAr ? date : dateEn}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                                <Clock className="w-4 h-4 text-amber-300" />
                                <span>{isAr ? time : timeEn}</span>
                            </div>
                        </div>

                        {/* Countdown if scheduled */}
                        {!isLive && timeLeft > 0 && (
                            <div className="pt-2 flex items-center gap-2 text-xs font-medium text-indigo-200">
                                <span>{isAr ? 'يبدأ البث خلال:' : 'Starts in:'}</span>
                                <div className="flex items-center gap-1.5 font-bold font-mono text-sm bg-white/10 px-3 py-1 rounded-lg border border-white/15">
                                    {countdown.days !== '00' && <span>{countdown.days}d : </span>}
                                    <span>{countdown.hours}h : </span>
                                    <span>{countdown.minutes}m : </span>
                                    <span className="text-amber-300">{countdown.seconds}s</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Join Action & Visual */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 w-full lg:w-auto shrink-0">
                        {isLive ? (
                            <button
                                onClick={handleJoin}
                                disabled={isJoining}
                                type="button"
                                className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-rose-700 font-black text-base shadow-xl hover:bg-rose-50 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{isAr ? 'جاري الانضمام...' : 'Joining...'}</span>
                                    </>
                                ) : hasJoinedBefore ? (
                                    <>
                                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                            <LogIn className="w-4 h-4 ml-0.5" />
                                        </div>
                                        <span>{isAr ? 'إعادة الانضمام للبث' : 'Rejoin Live Stream'}</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Play className="w-4 h-4 fill-current ml-0.5" />
                                        </div>
                                        <span>{isAr ? 'انضم للبث المباشر' : 'Join Live Stream'}</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                                <button
                                    disabled
                                    type="button"
                                    className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white/10 text-white/50 border border-white/10 font-bold text-sm cursor-not-allowed"
                                >
                                    <Play className="w-4 h-4 opacity-40" />
                                    <span>{isAr ? 'في انتظار بدء البث' : 'Waiting for Stream'}</span>
                                </button>
                                <span className="text-[11px] text-white/60 text-center">
                                    {isAr
                                        ? 'سيتم تفعيل زر الانضمام تلقائياً عند بدء المعلم للبث'
                                        : 'Join button activates when the instructor starts'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Jitsi Meeting Modal for Student */}
            {activeJitsiSession && (
                <JitsiMeeting
                    isOpen={!!activeJitsiSession}
                    onClose={() => setActiveJitsiSession(null)}
                    roomName={activeJitsiSession.roomName}
                    token={activeJitsiSession.token}
                    sessionTitle={activeJitsiSession.title}
                    isStudent={true}
                />
            )}
        </>
    );
}
