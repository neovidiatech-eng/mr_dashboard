import { X, HelpCircle, CheckCircle2, Clock, Award, ListChecks} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQuizById } from '../../hooks/useQuiz';
import { Spin } from 'antd';

interface ViewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string | null;
}

export default function ViewQuizModal({ isOpen, onClose, quizId }: ViewQuizModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const { data: quiz, isLoading } = useQuizById(isOpen && quizId ? quizId : null);

  if (!isOpen || !quizId) return null;

  const quizTitle = isAr ? quiz?.title_ar || quiz?.title : quiz?.title_en || quiz?.title;
  const quizDesc = isAr ? (quiz?.description_ar || quiz?.description) : (quiz?.description_en || quiz?.description_ar || quiz?.description);
  const duration = quiz?.duration_min || quiz?.duration || 0;
  const passPoints = quiz?.pass_points || 0;
  const totalPoints = quiz?.total_points || quiz?.totalMarks || 0;

  // Use quiz.questions or quiz_questions
  const allQuestions = quiz?.questions || (quiz as any)?.quiz_questions || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 text-start animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary-light text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
              {isAr ? 'كويز المحاضرة' : 'Lecture Quiz'}
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              {quizTitle || (isAr ? 'تفاصيل الكويز' : 'Quiz Details')}
            </h2>
            {quizDesc && <p className="text-xs text-gray-400 font-medium mt-0.5 line-clamp-1">{quizDesc}</p>}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-light/60 border border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{isAr ? 'المدة الزمنيّة' : 'Duration'}</p>
              <p className="text-[11px] text-gray-500 font-medium">{duration} {isAr ? 'دقيقة' : 'mins'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm shrink-0">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{isAr ? 'درجة النجاح' : 'Pass Points'}</p>
              <p className="text-[11px] text-gray-500 font-medium">{passPoints} {isAr ? 'درجة' : 'pts'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{isAr ? 'إجمالي الدرجات' : 'Total Score'}</p>
              <p className="text-[11px] text-gray-500 font-medium">{totalPoints} {isAr ? 'درجة' : 'pts'}</p>
            </div>
          </div>
        </div>

        {/* Questions Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Spin size="large" />
              <p className="text-xs font-bold text-gray-400">{isAr ? 'جاري تحميل أسئلة الكويز...' : 'Loading quiz questions...'}</p>
            </div>
          ) : !allQuestions || allQuestions.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ListChecks size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-bold">{isAr ? 'لا توجد أسئلة مضافة في هذا الكويز بعد' : 'No questions found in this quiz'}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <ListChecks size={16} className="text-primary" />
                <span className="text-sm font-bold">{isAr ? 'أسئلة الكويز' : 'Quiz Questions'} ({allQuestions.length})</span>
              </div>

              {allQuestions.map((q: any, idx: number) => (
                <div
                  key={q.id || idx}
                  className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4 hover:border-gray-200 transition-all"
                >
                  {/* Top Header of Question */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-50">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-primary/20">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        {q.type === 'TRUE_FALSE' || q.type === 'true_false'
                          ? (isAr ? 'صح / خطأ' : 'True / False')
                          : (isAr ? 'اختيار من متعدد' : 'Multiple Choice')}
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold">
                      {q.points} {isAr ? 'درجات' : 'pts'}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h4 className="font-bold text-sm text-gray-900 leading-relaxed">
                    {isAr ? q.question_ar || q.text_ar || q.question || q.text : q.question_en || q.text_en || q.question || q.text}
                  </h4>

                  {/* Options List */}
                  {q.options && q.options.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {q.options.map((opt: any, optIdx: number) => {
                        const isCorrect = opt.is_correct || opt.isCorrect;
                        const optText = isAr
                          ? opt.option_text_ar || opt.text_ar || opt.option_text || opt.text
                          : opt.option_text_en || opt.text_en || opt.option_text || opt.text;

                        return (
                          <div
                            key={opt.id || optIdx}
                            className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                              isCorrect
                                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                                : 'border-gray-100 bg-gray-50/60 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                  isCorrect ? 'bg-emerald-500 text-white' : 'border border-gray-300 text-transparent'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                              <span>{optText}</span>
                            </div>

                            {isCorrect && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold">
                                {isAr ? 'الإجابة الصحيحة' : 'Correct Answer'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-8 bg-gray-50/50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

