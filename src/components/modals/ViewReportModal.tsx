import { Modal, Rate } from 'antd';
import { User, Clock, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
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

  if (!reportData) return null;

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      closeIcon={false}
      footer={null}
      width={650}
      centered
      className="view-report-modal"
      bodyStyle={{ padding: 0 }}
    >
      <div className="relative overflow-hidden rounded-2xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black">
                {reportData.teacher?.user?.name ? reportData.teacher.user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">{reportData.teacher?.user?.name || '---'}</h2>
                <p className="text-indigo-100 text-xs opacity-90">{reportData.teacher?.user?.email || '---'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider mb-1">{t('weekRange') || 'Week Range'}</p>
              <p className="text-sm font-bold">
                 {dayjs(reportData.weekStarting).format('MMM D')} - {dayjs(reportData.weekEnding).format('MMM D, YYYY')}
              </p>
            </div>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">{reportData.totalClasses}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{t('classes') || 'Classes'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-x border-gray-100 px-6">
              <User className="w-4 h-4 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">{reportData.studentsTaught}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{t('students') || 'Students'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">{reportData.avgSessionDuration}m</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{t('duration') || 'Duration'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
                <Rate disabled defaultValue={reportData.overallRating} className="text-xs text-amber-400" />
                <span className="text-sm font-black text-gray-900">{reportData.overallRating}</span>
             </div>
             <span className="text-[9px] font-bold text-gray-400 uppercase">{t('overallRating') || 'Rating'}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-5 bg-gray-50/30">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">{t('teachingSummary') || 'Teaching Summary'}</h3>
              </div>
              <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                {reportData.teachingSummary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">{t('studentProgress') || 'Progress'}</h3>
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                  {reportData.studentProgress}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">{t('challenges') || 'Challenges'}</h3>
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                  {reportData.challenges}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors shadow-sm active:scale-95"
            >
              {t('close') || 'Close'}
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
