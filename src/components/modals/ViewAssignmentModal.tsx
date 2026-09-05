import { X, Calendar, User, BookOpen, FileText, Download, CheckCircle2, Clock, AlertCircle, Award, MessageSquare, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HomeworkItem } from '../../types/assignment';
import { baseURL } from '../../consts';

interface ViewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: HomeworkItem | null;
}

export default function ViewAssignmentModal({ isOpen, onClose, assignment }: ViewAssignmentModalProps) {
  const { language } = useLanguage();

  if (!isOpen || !assignment) return null;

  const text = {
    modalTitle: { ar: 'تفاصيل الواجب', en: 'Assignment Details' },
    studentInfo: { ar: 'بيانات الطالب', en: 'Student Information' },
    title: { ar: 'العنوان', en: 'Title' },
    titleAr: { ar: 'العنوان (بالعربية)', en: 'Title (Arabic)' },
    titleEn: { ar: 'العنوان (بالإنجليزية)', en: 'Title (English)' },
    description: { ar: 'الوصف والتعليمات', en: 'Description & Instructions' },
    dueDate: { ar: 'تاريخ التسليم', en: 'Due Date' },
    status: { ar: 'الحالة', en: 'Status' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    submitted: { ar: 'تم التسليم', en: 'Submitted' },
    graded: { ar: 'تم التصحيح', en: 'Graded' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    grade: { ar: 'الدرجة', en: 'Grade' },
    feedback: { ar: 'ملاحظات المعلم / التقييم', en: 'Teacher Feedback' },
    noFeedback: { ar: 'لا توجد ملاحظات مسجلة', en: 'No feedback provided' },
    attachments: { ar: 'المرفقات والملفات', en: 'Attachments & Files' },
    noAttachments: { ar: 'لا توجد ملفات مرفقة', en: 'No attachments available' },
    download: { ar: 'تحميل', en: 'Download' },
    close: { ar: 'إغلاق', en: 'Close' },
    createdOn: { ar: 'تاريخ الإنشاء', en: 'Created On' },
    notGradedYet: { ar: 'لم يتم التصحيح بعد', en: 'Not graded yet' },
  };

  const isPending = assignment.status?.toLowerCase() === 'pending';

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {text.graded[language]}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {text.completed[language]}
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
            <AlertCircle className="w-3.5 h-3.5" />
            {text.submitted[language]}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-3.5 h-3.5" />
            {text.pending[language]}
          </span>
        );
    }
  };

  const primaryTitle = language === 'ar' 
    ? (assignment.title_ar || assignment.title_en || assignment.title)
    : (assignment.title_en || assignment.title_ar || assignment.title);

  const primaryDescription = language === 'ar'
    ? (assignment.description_ar || assignment.description_en || assignment.description)
    : (assignment.description_en || assignment.description_ar || assignment.description);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-all duration-200">
      <div 
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="bg-gray-50/80 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{text.modalTitle[language]}</h2>
              <p className="text-xs font-medium text-gray-400 mt-0.5">
                {text.createdOn[language]}: {new Date(assignment.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(assignment.status)}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Main Title & Optional Description */}
          <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                {text.title[language]}
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                {primaryTitle || '—'}
              </h3>
              {/* Show secondary language title if available */}
              {assignment.title_ar && assignment.title_en && (
                <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {language === 'ar' ? assignment.title_en : assignment.title_ar}
                </p>
              )}
            </div>

            {/* Only show description if NOT pending and description exists */}
            {!isPending && primaryDescription && (
              <div className="pt-3 border-t border-gray-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  {text.description[language]}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {primaryDescription}
                </p>
                {/* Show secondary description if both exist */}
                {assignment.description_ar && assignment.description_en && assignment.description_ar !== assignment.description_en && (
                  <p className="text-xs text-gray-400 leading-relaxed mt-2 pt-2 border-t border-gray-200/40">
                    {language === 'ar' ? assignment.description_en : assignment.description_ar}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Student & Feedback Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                  {text.studentInfo[language]}
                </span>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {assignment.student?.user?.name || '—'}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {assignment.student?.user?.email || '—'}
                </p>
              </div>
            </div>

            {/* Feedback Card (Replaces Teacher Card) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-0.5">
                  {text.feedback[language]}
                </span>
                {assignment.feedback ? (
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {assignment.feedback}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic mt-0.5">
                    {text.noFeedback[language]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Due Date & Grade Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  {text.dueDate[language]}
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(assignment.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Grade */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  {text.grade[language]}
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {!isPending && assignment.grade !== null && assignment.grade !== undefined ? (
                    <span className="text-purple-700 font-extrabold text-base">{assignment.grade} / 100</span>
                  ) : (
                    <span className="text-gray-400 font-normal">{text.notGradedYet[language]}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {text.attachments[language]}
              </h4>
            </div>

            {assignment.attachments && assignment.attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignment.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-indigo-50/50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {file.name}
                        </p>
                        {file.mimetype && (
                          <p className="text-[10px] font-medium text-gray-400 truncate">
                            {file.mimetype}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={`${baseURL}/${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm shrink-0"
                      title={text.download[language]}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200">
                {text.noAttachments[language]}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
          >
            {text.close[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
