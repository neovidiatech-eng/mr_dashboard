import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Calendar, ArrowLeft, ArrowRight, Play, Loader2 } from 'lucide-react';
import { useGetAllLiveSessions, useStartExistingLiveSession, useEndExistingLiveSession, useJoinLiveSession } from '../../../hooks/useLiveSessions';
import SelectSessionModal from '../../../components/modals/SelectSessionModal';
import JitsiMeeting from '../../../components/modals/JitsiMeeting';

export interface StartLiveProps {
    onStartLive?: () => void;
    onSchedule?: () => void;
}

export default function StartLive({
    onStartLive,
    onSchedule,
}: StartLiveProps) {
    const { i18n } = useTranslation();
    const language = i18n.language.split('-')[0];
    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

    const { mutate: startExistingLive, isPending: isStartingExisting } = useStartExistingLiveSession();
    const { mutate: joinLive } = useJoinLiveSession();
    const { mutate: endExistingLive } = useEndExistingLiveSession();
    const { data: sessionsData, isLoading: isSessionsLoading } = useGetAllLiveSessions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeJitsiSession, setActiveJitsiSession] = useState<{ id?: string; roomName: string; title: string; sessionData?: any; token: string } | null>(null);

    const sessionArray = Array.isArray(sessionsData)
        ? sessionsData
        : (sessionsData?.data?.items || sessionsData?.items || sessionsData?.data || []);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleStartExisting = (sessionId: string) => {
        const foundSession = sessionArray.find((s: any) => s.id === sessionId);
        startExistingLive(sessionId, {
            onSuccess: () => {
                joinLive(sessionId, {
                    onSuccess: (joinRes: any) => {
                        const roomName = joinRes?.data?.roomName || joinRes?.roomName || foundSession?.roomName;
                        const title = foundSession?.title || joinRes?.data?.title || '';
                        const token = joinRes?.data?.token || joinRes?.token || '';
                        setActiveJitsiSession({
                            id: sessionId,
                            roomName,
                            title,
                            token,
                            sessionData: foundSession,
                        });
                        onStartLive?.();
                    },
                });
            },
        });
    };

    const handleEndSession = () => {
        if (activeJitsiSession?.sessionData) {
            endExistingLive(activeJitsiSession.sessionData);
        } else if (activeJitsiSession?.id) {
            endExistingLive(activeJitsiSession.id);
        }
    };

    return (
        <div
            className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4a0013] via-[#75001d] to-[#260009] text-white p-8 sm:p-10 lg:p-12 shadow-xl shadow-purple-950/20 border border-white/10`}
            dir={isAr ? 'rtl' : 'ltr'}
        >
            {/* Soft ambient background glows */}
            <div className="absolute -top-20 -end-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -start-20 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
                {/* Main Content Area */}
                <div className="flex-1 space-y-4 text-center md:text-start">
                    {/* Live Status Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/90">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span>{isAr ? 'بث مباشر تفاعلي' : 'Live Interactive Stream'}</span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                        {isAr ? 'ابدأ بثًا مباشرًا مع طلابك الآن' : 'Start a Live Stream With Your Students'}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
                        {isAr
                            ? 'تواصل وتفاعل مع طلابك مباشرة عبر منصة البث الحي، وشارِك الشاشة والمحتوى التعليمي بكل سهولة وبأعلى جودة.'
                            : 'Engage directly with your students through live streaming, share your screen and lessons easily in high definition.'}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
                        <button
                            onClick={handleOpenModal}
                            type="button"
                            disabled={isStartingExisting || isSessionsLoading}
                            className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-[#75001d] font-bold text-sm sm:text-base shadow-lg hover:bg-rose-50 hover:shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {(isStartingExisting)
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Play className="w-4 h-4 fill-current" />
                            }
                            <span>{isAr ? 'ابدأ البث الآن' : 'Start Live Now'}</span>
                            {!isStartingExisting && <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 group-rtl:group-hover:-translate-x-1" />}
                        </button>

                        <SelectSessionModal
                            open={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            sessions={sessionsData ?? []}
                            onConfirm={(id) => {
                                handleStartExisting(id);
                                setIsModalOpen(false);
                            }}
                        />

                        {onSchedule && (
                            <button
                                onClick={onSchedule}
                                type="button"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-white font-semibold text-sm sm:text-base transition-all active:scale-[0.98]"
                            >
                                <Calendar className="w-4 h-4 text-white/80" />
                                <span>{isAr ? 'جدولة جلسة' : 'Schedule Session'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Clean, Non-Crowded Visual Feature */}
                <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl flex flex-col items-center justify-center gap-2 shadow-2xl text-center p-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-rose-200">
                            <Radio className="w-8 h-8 sm:w-9 sm:h-9 animate-pulse" />
                        </div>
                        <span className="text-xs font-bold text-white/90 tracking-wide">
                            {isAr ? 'استوديو البث' : 'Live Studio'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Jitsi Meeting Full Screen Component */}
            {activeJitsiSession && (
                <JitsiMeeting
                    isOpen={!!activeJitsiSession}
                    onClose={() => setActiveJitsiSession(null)}
                    onEndSession={handleEndSession}
                    roomName={activeJitsiSession.roomName}
                    token={activeJitsiSession.token}
                    sessionTitle={activeJitsiSession.title}
                />
            )}
        </div>
    );
}