import { Calendar, FileText, GraduationCap, User, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import type { LiveSessions } from "../../types/liveSessions";



export interface ViewLiveSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    liveSession?: LiveSessions | null;
}
export default function ViewLiveSessionModal({ isOpen, onClose, liveSession }: ViewLiveSessionModalProps) {
    const { language } = useLanguage();

    const text = {
        title: { ar: 'تفاصيل الجلسة المباشرة', en: 'Live Session Details' },
        sessionName: { ar: 'اسم الجلسة', en: 'Session Name' },
        date: { ar: 'التاريخ', en: 'Date' },
        time: { ar: 'الوقت', en: 'Time' },
        status: { ar: 'الحالة', en: 'Status' },
        roomName: { ar: 'اسم الغرفة', en: 'Room Name' },
        stage: { ar: 'المرحلة', en: 'Stage' },
        plan: { ar: 'الخطة', en: 'Plan' },
        actions: { ar: 'الإجراءات', en: 'Actions' },
        close: { ar: 'إغلاق', en: 'Close' },
        view: { ar: 'عرض', en: 'View' },
        edit: { ar: 'تعديل', en: 'Edit' },
        delete: { ar: 'حذف', en: 'Delete' },
        live: { ar: 'مباشر', en: 'Live' },
        completed: { ar: 'مكتمل', en: 'Completed' },
        scheduled: { ar: 'مجدولة', en: 'Scheduled' },
        studentsAttended: { ar: 'عدد الطلاب', en: 'Students Attended' },
        minutes: { ar: 'دقائق', en: 'minutes' },
        noStudentsYet: { ar: 'لا يوجد طلاب بعد', en: 'No students yet' },
        viewDetails: { ar: 'عرض التفاصيل', en: 'View Details' },
        startTime: { ar: 'وقت البداية', en: 'Start Time' },
        endTime: { ar: 'وقت النهاية', en: 'End Time' },
        notAvailable: { ar: 'غير متاح', en: 'Not Available' },
        viewSession: { ar: 'عرض الجلسة', en: 'View Session' },
        editSession: { ar: 'تعديل الجلسة', en: 'Edit Session' },
        deleteSession: { ar: 'حذف الجلسة', en: 'Delete Session' },
    };
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'completed':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (!isOpen || !liveSession) return null;

    return (
        <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
            <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[#800020]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{text.title[language]}</h2>
                            <p className="text-[13px] font-semibold text-gray-400 mt-0.5 break-words whitespace-pre-wrap line-clamp-3">{liveSession.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(liveSession.status)}`}>
                            {liveSession.status}
                        </span>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-hidden flex-1">

                    {/* Session Details */}
                    <div className="p-6 bg-white overflow-y-auto custom-scrollbar">

                        {/* Room Name */}
                        <div className="mb-5 flex items-start gap-4 group">
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 transition-transform">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{text.roomName[language]}</p>
                                <p className="text-sm font-bold text-gray-900">{liveSession.roomName || '—'}</p>
                            </div>
                        </div>

                        {/* Plan & Stage side-by-side */}
                        <div className="grid grid-cols-2 gap-5 mb-6">
                            <div className="flex items-start gap-4 group">
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{text.plan[language]}</p>
                                    <p className="text-sm font-bold text-gray-900">{liveSession.plan?.name || '—'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{text.stage[language]}</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {language === 'ar' ? (liveSession.stage?.name_ar || liveSession.stage?.name_en || '—') : (liveSession.stage?.name_en || liveSession.stage?.name_ar || '—')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Duration Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
                                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">{text.date[language]}</p>
                                </div>
                                <p className="text-sm font-black text-indigo-700" dir="ltr">
                                    {new Date(liveSession.startAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50">
                                <div className="flex items-center gap-2 mb-2 text-purple-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">{text.time[language]}</p>
                                </div>
                                <p className="text-sm font-black text-purple-700" dir="ltr">
                                    {new Date(liveSession.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        {/* Notification */}
                        {/* {session.notification_Time && (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
                                <div className="p-2 bg-rose-50 rounded-lg text-rose-400">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('notificationTime')}</p>
                                    <p className="text-sm font-bold text-gray-800">{session.notification_Time} {t('minutes')}</p>
                                </div>
                            </div>
                        )} */}

                        {/* Meeting Link */}
                        {/* {session.link && session.status?.toLowerCase() !== 'completed' && (
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('meetingLink')}</p>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={session.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all text-xs font-bold shadow-sm active:scale-95"
                                    >
                                        <Video className="w-4 h-4" />
                                        {t('joinSession')}
                                    </a>
                                    <span className="text-xs text-gray-400 break-all" dir="ltr">{session.link}</span>
                                </div>
                            </div>
                        )} */}

                        {/* Notes */}
                        {/* {session.notes && (
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('notes')}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700 leading-relaxed break-words whitespace-pre-wrap overflow-hidden">{session.notes}</p>
                            </div>
                        )} */}

                        {/* Session Logs */}
                        {/* {session.scheduleLogs && (
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-lg font-bold text-gray-900">{language === 'ar' ? 'سجلات الحضور' : 'Attendance Logs'}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Student Logs */}
                        {/* <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
                                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            {t('studentLabel')}
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">{language === 'ar' ? 'وقت الانضمام' : 'Join Time'}</span>
                                                <span className="text-xs font-bold text-gray-700">{formatTimeOnly(session.scheduleLogs.joinTime_student)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">{language === 'ar' ? 'وقت المغادرة' : 'Leave Time'}</span>
                                                <span className="text-xs font-bold text-gray-700">{formatTimeOnly(session.scheduleLogs.leaveTime_student)}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-blue-100/30">
                                                <span className="text-xs text-gray-500">{language === 'ar' ? 'الحالة' : 'Status'}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${session.scheduleLogs.isStudentAttended ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {session.scheduleLogs.isStudentAttended ? (language === 'ar' ? 'حضر' : 'Attended') : (language === 'ar' ? 'غائب' : 'Absent')}
                                                </span>
                                            </div>
                                        </div>
                                    </div> */}

                        {/* Teacher Logs */}
                        {/* <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
                                        <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <GraduationCap className="w-3 h-3" />
                                            {t('teacherLabel')}
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">{language === 'ar' ? 'وقت الانضمام' : 'Join Time'}</span>
                                                <span className="text-xs font-bold text-gray-700">{formatTimeOnly(session.scheduleLogs.joinTime_teacher)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">{language === 'ar' ? 'وقت المغادرة' : 'Leave Time'}</span>
                                                <span className="text-xs font-bold text-gray-700">{formatTimeOnly(session.scheduleLogs.leaveTime_teacher)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">{language === 'ar' ? 'المدة' : 'Duration'}</span>
                                                <span className="text-xs font-bold text-gray-700">
                                                    {session.scheduleLogs.duration_teacher ? `${Math.round(session.scheduleLogs.duration_teacher)} ${t('minutes')}` : '—'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-indigo-100/30">
                                                <span className="text-xs text-gray-500">{language === 'ar' ? 'تأخير' : 'Late'}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${session.scheduleLogs.isTeacherLate ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {session.scheduleLogs.isTeacherLate ? (language === 'ar' ? 'متأخر' : 'Late') : (language === 'ar' ? 'في الموعد' : 'On Time')}
                                                </span>
                                            </div>
                                        </div>
                                    </div> */}
                        {/* </div>
                            </div>
                        )} */}
                    {/* </div> */}

                    {/* Right Column - Recurring Sessions / Other Sessions */}
                    {/* <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100/80 flex flex-col overflow-hidden"> */}

                        {/* Recurring Sessions Header */}
                        {/* {(session.is_recurring || session.parent_recurring_id) && groupedSessions && groupedSessions.length > 1 ? (
                            <div>
                                <div className="p-6 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-sm shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Repeat className="w-4 h-4 text-indigo-500" />
                                        <h3 className="font-bold text-gray-900 text-sm">{t('recurringSessions')}</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                                        {groupedSessions.length} {t('sessions')}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                                    {groupedSessions.map((s, index) => {
                                        const { date, time } = formatDateTime(s.start_time);
                                        const { time: endT } = formatDateTime(s.end_time);
                                        const isCurrent = s.id === session.id;

                                        // ✅ lecture mapping by order
                                        const lectures = session.course?.lectures || [];
                                        const sortedLectures = [...lectures].sort((a, b) => a.order - b.order);
                                        const lecture = sortedLectures[index] || null;

                                        return (
                                            <div
                                                key={s.id}
                                                className={`bg-white border rounded-2xl p-4 transition-all ${isCurrent
                                                    ? 'border-indigo-200 ring-2 ring-indigo-500/10 shadow-sm'
                                                    : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">

                                                    <div className="flex-1">

                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                                {t(s.day_of_week?.toLowerCase() || '') || s.day_of_week || '—'}
                                                            </span>

                                                            {isCurrent && (
                                                                <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                    CURRENT
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-xs font-bold text-gray-800">{date}</p>

                                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5" dir="ltr">
                                                            {time} - {endT}
                                                        </p>

                                                        {/* ⭐ Lecture per session */}
                        {/* {lecture && (
                                                            <div className="mt-2 p-2 bg-indigo-50/40 rounded-lg border border-indigo-100">
                                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                                                                    Lecture {lecture.order}
                                                                </p>

                                                                <p className="text-xs font-bold text-gray-800 mt-0.5">
                                                                    {lecture.title}
                                                                </p>

                                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                                    {lecture.content}
                                                                </p>

                                                                {lecture.videoUrl && (
                                                                    <a
                                                                        href={lecture.videoUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors inline-block mt-1"
                                                                    >
                                                                        Watch Video
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )} */}

                    {/* </div> */}

                    {/* <div className="flex flex-col items-end gap-2">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-widest ${getStatusStyle(s.status)}`}
                                                        >
                                                            {t(s.status?.toLowerCase() || '')}
                                                        </span>

                                                        {s.link && s.status?.toLowerCase() !== 'completed' && (
                                                            <a
                                                                href={s.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-500 hover:text-indigo-700 transition-colors"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div> */}
                    {/* 
                                                </div>
                                            </div>
                                        );
                                    })} */}
                </div>

            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-white shrink-0">
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-all font-bold text-xs shadow-lg active:scale-95"
                >
                    {text.close[language]}
                </button>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}} />
        </div>
    </div>)
}
