import { Rate } from 'antd';
import { User, Clock, AlertTriangle, CheckCircle2, TrendingUp, X, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TeacherReport } from '../../types/reports';
import dayjs from 'dayjs';

interface ViewReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportData: TeacherReport | null;
}

export default function ViewReportModal({ isOpen, onClose, reportData }: ViewReportModalProps) {
    const { t, i18n } = useTranslation();
    const language = i18n.language.split('-')[0];

    if (!isOpen || !reportData) return null;

    return (
        <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10 text-start">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <span>{t('reportDetails', 'Report Details')}</span>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{t('teacherReport', 'Teacher Report')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                    {/* Teacher Info */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-base font-black text-primary border border-slate-100">
                                {reportData.teacher?.user?.name ? reportData.teacher.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="text-start">
                                <h2 className="text-sm font-black text-slate-900">{reportData.teacher?.user?.name || '---'}</h2>
                                <p className="text-xs font-bold text-slate-500">{reportData.teacher?.user?.email || '---'}</p>
                            </div>
                        </div>
                        <div className="text-end">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{t('weekRange', 'Week Range')}</p>
                            <p className="text-xs font-bold text-slate-900">
                                {dayjs(reportData.weekStarting).format('MMM D')} - {dayjs(reportData.weekEnding).format('MMM D, YYYY')}
                            </p>
                        </div>
                    </div>

                    {/* Compact Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                            <span className="text-lg font-black text-slate-900">{reportData.totalClasses}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('classes', 'Classes')}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <User className="w-4 h-4 text-blue-500 mb-1" />
                            <span className="text-lg font-black text-slate-900">{reportData.studentsTaught}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('students', 'Students')}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <Clock className="w-4 h-4 text-amber-500 mb-1" />
                            <span className="text-lg font-black text-slate-900">{reportData.avgSessionDuration}m</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('duration', 'Duration')}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-1 mb-1">
                                <Rate disabled defaultValue={reportData.overallRating} className="text-[10px] text-amber-400" />
                            </div>
                            <span className="text-lg font-black text-slate-900">{reportData.overallRating}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('overallRating', 'Rating')}</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-start">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-emerald-50 rounded-lg">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('teachingSummary', 'Teaching Summary')}</h3>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {reportData.teachingSummary}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-start">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <TrendingUp className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('studentProgress', 'Progress')}</h3>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {reportData.studentProgress}
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-amber-50 rounded-lg">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('challenges', 'Challenges')}</h3>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {reportData.challenges}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-black text-xs uppercase tracking-widest"
                    >
                        {t('close', 'Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
