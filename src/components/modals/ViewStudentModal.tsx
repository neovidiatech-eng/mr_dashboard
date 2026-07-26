import { X, Mail, Phone, MapPin, ClipboardList, Clock, Trophy, Star, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import WhatsAppPhone from '../ui/WhatsAppPhone';
import { useTranslation } from 'react-i18next';
import { Student } from '../../types/student';
import { useGetRank } from '../../features/admin/hooks/useRank';
import { useStudentById } from '../../features/admin/hooks/useStudents';

interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: Student | null;
}

export default function ViewStudentModal({ isOpen, onClose, studentData: initialStudentData }: ViewStudentModalProps) {
  const { } = useLanguage();
  const { t } = useTranslation();

  const { data: studentByIdData, isLoading } = useStudentById(initialStudentData?.id || "");
  const studentData = studentByIdData?.data || initialStudentData;

  const { data: rankData } = useGetRank(studentData?.rankId || "");

  const rank = rankData?.data;
  if (!isOpen || !studentData) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">

        {/* Profile Header */}
        <div className="relative h-32 bg-indigo-600 shrink-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 border-[32px] border-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-[16px] border-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="w-24 h-24 rounded-[22px] bg-white p-1.5 shadow-lg relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-[22px] flex items-center justify-center z-10">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className="w-full h-full rounded-[18px] bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-black">
                {studentData.user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{studentData.user.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase ${studentData.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                  {studentData.status === 'approved' ? t('active') : t('pending')}
                </span>
                <span className="text-gray-400 text-xs font-bold px-2 border-l border-gray-200">
                  ID: #{studentData.id.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* Content Body */}
        <div className="flex-1 overflow-y-auto mt-14 p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Contact Information */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-4">{t('contactInfo')}</h4>

              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('email')}</p>
                  <p className="text-sm font-bold text-gray-800 break-all">{studentData.user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('phone')}</p>
                  <WhatsAppPhone
                    phone={`${studentData.user.code_country} ${studentData.user.phone}`}
                    className="text-sm font-bold text-gray-800"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('country')}</p>
                  <p className="text-sm font-bold text-gray-800">{studentData.country}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('rank')}</p>
                  <p className="text-sm font-bold text-gray-800">{rank?.name}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-4">{t('academicInfo')}</h4>

              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-indigo-900">{t('plan')}</p>
                </div>
                <p className="text-sm font-black text-indigo-600">
                  {studentData.plan?.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">{t('sessions')}</p>
                  </div>
                  <p className="text-lg font-black text-gray-900">
                    {studentData.sessions_attended} / {studentData.sessions}
                  </p>
                  <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${(studentData.sessions_attended / (studentData.sessions || 1)) * 100}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8 space-y-6">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-4">{t('reviews') || 'Reviews'}</h4>
            {studentData.user?.reviewsReceived && studentData.user.reviewsReceived.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentData.user.reviewsReceived.map((review: any) => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {review.reviewer?.name?.charAt(0).toUpperCase() || 'R'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{review.reviewer?.name || 'Reviewer'}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600">{review.rating}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 font-medium leading-relaxed flex gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500">{t('noReviewsYet') || 'No reviews yet'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl transition-all font-bold text-xs shadow-lg active:scale-95"
          >
            {t('close')}
          </button>
        </div>
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
  );
}