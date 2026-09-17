import { useState } from 'react';
import { Radio, Clock, CalendarDays, Loader2, Play, LogIn } from 'lucide-react';
import { useGetStudentUpcomingLiveSessions, useJoinLiveSession } from '../../../hooks/useLiveSessions';
import { useLanguage } from '../../../contexts/LanguageContext';
import JitsiMeeting from '../../../components/modals/JitsiMeeting';
import { useDashboardData } from '../hooks/useDashboardData';

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

const STATUS_STYLES: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
    live: 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse',
    completed: 'bg-slate-100 text-slate-500 border-slate-200',
    cancelled: 'bg-red-50 text-red-500 border-red-100',
};

export default function UpcomingLiveSessionsCard() {
    const { language } = useLanguage();
    const isAr = language === 'ar';

    const { data, isLoading } = useGetStudentUpcomingLiveSessions(1, 10);
    const { mutate: joinLive, isPending: isJoining } = useJoinLiveSession();

    const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
    const [joinedSessionIds, setJoinedSessionIds] = useState<string[]>([]);
    const [activeJitsiSession, setActiveJitsiSession] = useState<{
        roomName: string;
        token: string;
        title?: string;
    } | null>(null);

    const { data: dashboardResponse } = useDashboardData();
    const plan = dashboardResponse?.data?.metadata?.plan;

    const sessions = data?.data?.items ?? [];

    if (!plan) return null;

    const handleJoin = (session: any) => {
        if (session.status !== 'live') return;

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

        setJoiningSessionId(session.id);
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
            onSettled: () => {
                setJoiningSessionId(null);
            },
        });
    };

    return (
        <>
            <div
                className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all h-full flex flex-col"
                dir={isAr ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                            <Radio className="w-5 h-5 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {isAr ? 'جلسات البث القادمة' : 'Upcoming Live Sessions'}
                        </h3>
                    </div>

                    {/* Live indicator dot */}
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                </div>

                {/* Body */}
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                            <Loader2 className="w-7 h-7 animate-spin opacity-40 text-rose-500" />
                            <p className="text-xs font-bold">
                                {isAr ? 'جاري التحميل...' : 'Loading...'}
                            </p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                            <Radio className="w-10 h-10 opacity-20" />
                            <p className="text-xs font-bold">
                                {isAr ? 'لا توجد جلسات مباشرة قادمة' : 'No upcoming live sessions'}
                            </p>
                        </div>
                    ) : (
                        sessions.map((session, index) => {
                            const { date, time, dateEn, timeEn } = formatSessionDate(session.startAt);
                            const statusKey = (session.status ?? 'scheduled').toLowerCase();
                            const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.scheduled;
                            const isLive = statusKey === 'live';
                            const isCurrentJoining = isJoining && joiningSessionId === session.id;

                            return (
                                <div
                                    key={session.id}
                                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                                        isLive
                                            ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70'
                                            : 'bg-slate-50/50 border-slate-50 hover:border-rose-100 hover:bg-white'
                                    }`}
                                >
                                    {/* Index badge */}
                                    <div
                                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                                            isLive
                                                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                                                : 'bg-rose-50 text-rose-600'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <p className="text-sm font-bold text-slate-700 truncate">
                                            {session.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 truncate">
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3 text-slate-400 shrink-0" />
                                                {isAr ? date : dateEn}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                                {isAr ? time : timeEn}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions & Status */}
                                    <div className="shrink-0 flex items-center gap-2">
                                        {isLive ? (
                                            <button
                                                onClick={() => handleJoin(session)}
                                                disabled={isCurrentJoining}
                                                type="button"
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer ${
                                                    joinedSessionIds.includes(session.id)
                                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                                                }`}
                                            >
                                                {isCurrentJoining ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : joinedSessionIds.includes(session.id) ? (
                                                    <LogIn className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Play className="w-3.5 h-3.5 fill-current" />
                                                )}
                                                <span>
                                                    {joinedSessionIds.includes(session.id)
                                                        ? (isAr ? 'إعادة الانضمام' : 'Rejoin')
                                                        : (isAr ? 'انضم' : 'Join')}
                                                </span>
                                            </button>
                                        ) : (
                                            <span
                                                className={`text-[9px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider border ${statusStyle}`}
                                            >
                                                {isAr
                                                    ? statusKey === 'scheduled'
                                                        ? 'مجدولة'
                                                        : statusKey === 'completed'
                                                        ? 'مكتملة'
                                                        : 'ملغاة'
                                                    : statusKey}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Jitsi Meeting Modal */}
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