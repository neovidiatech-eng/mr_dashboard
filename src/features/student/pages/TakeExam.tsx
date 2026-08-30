import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  useExamById,
  useExamQuestions,
  useStartExam,
  useSubmitExam,
} from '../../../hooks/useExams';
import ErrorService from '../../../utils/ErrorService';

export default function TakeExam() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

  const { data: exam, isLoading: examLoading } = useExamById(examId!);
  const { data: questions, isLoading: questionsLoading } = useExamQuestions(examId!);
  const { mutateAsync: startExam, isPending: isStarting } = useStartExam();
  const { mutateAsync: submitExam, isPending: isSubmitting } = useSubmitExam();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const text = {
    back: { ar: 'رجوع', en: 'Back' },
    startTitle: { ar: 'جاهز تبدأ الامتحان؟', en: 'Ready to start the exam?' },
    startDesc: {
      ar: 'هيبدأ العداد بمجرد ما تضغط ابدأ، ومش هينفع توقف في النص.',
      en: "The timer starts as soon as you click start, and you can't pause once you begin.",
    },
    startBtn: { ar: 'ابدأ الامتحان', en: 'Start Exam' },
    duration: { ar: 'المدة', en: 'Duration' },
    minutes: { ar: 'دقيقة', en: 'minutes' },
    questionsCount: { ar: 'عدد الأسئلة', en: 'Questions' },
    submitBtn: { ar: 'تسليم الامتحان', en: 'Submit Exam' },
    submitting: { ar: 'جاري التسليم...', en: 'Submitting...' },
    timeUp: { ar: 'خلص الوقت! هيتسلّم الامتحان تلقائيًا.', en: "Time's up! The exam will be submitted automatically." },
    resultTitle: { ar: 'نتيجتك', en: 'Your Result' },
    outOf: { ar: 'من', en: 'out of' },
    reviewTitle: { ar: 'مراجعة الإجابات', en: 'Answer Review' },
    yourAnswer: { ar: 'إجابتك', en: 'Your answer' },
    correctAnswer: { ar: 'الإجابة الصحيحة', en: 'Correct answer' },
    noAnswer: { ar: 'من غير إجابة', en: 'No answer' },
    backToList: { ar: 'العودة لقائمة الامتحانات', en: 'Back to Exams' },
    loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  };

  const totalSeconds = (exam?.duration || 0) * 60;

  useEffect(() => {
    if (exam?.status === 'in_progress' && exam.startedAt && exam.duration) {
      const startedAt = new Date(exam.startedAt).getTime();
      const deadline = startedAt + exam.duration * 60 * 1000;
      const tick = () => {
        const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        setSecondsLeft(remaining);
        return remaining;
      };
      tick();
      const interval = setInterval(() => {
        const remaining = tick();
        if (remaining <= 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [exam?.status, exam?.startedAt, exam?.duration]);

  useEffect(() => {
    if (secondsLeft === 0 && exam?.status === 'in_progress' && !autoSubmitted) {
      setAutoSubmitted(true);
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const handleStart = async () => {
    try {
      await startExam(examId!);
    } catch (err: any) {
      ErrorService.error(err?.response?.data?.message || 'Failed to start exam');
    }
  };

  const handleSubmit = async () => {
    if (!questions) return;
    try {
      await submitExam({
        examId: examId!,
        data: {
          answers: questions.map((q) => ({
            questionId: q.id!,
            selectedOptionId: q.id ? answers[q.id] || null : null,
          })),
        },
      });
    } catch (err: any) {
      ErrorService.error(err?.response?.data?.message || 'Failed to submit exam');
    }
  };

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (examLoading || !exam) {
    return <div className="p-10 text-center text-gray-400">{text.loading[language]}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm"
      >
        <ArrowLeft size={16} />
        {text.back[language]}
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{exam.title}</h1>
        {exam.subject && <p className="text-slate-400 font-medium mb-6">{exam.subject}</p>}

        {exam.status === 'pending' && (
          <div className="text-center py-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-700">{text.startTitle[language]}</h2>
            <p className="text-slate-500">{text.startDesc[language]}</p>
            <div className="flex items-center justify-center gap-8 text-sm text-slate-600 py-2">
              <span><strong>{text.duration[language]}:</strong> {exam.duration} {text.minutes[language]}</span>
              <span><strong>{text.questionsCount[language]}:</strong> {questions?.length ?? '—'}</span>
            </div>
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-sm shadow-blue-200 disabled:opacity-50"
            >
              {text.startBtn[language]}
            </button>
          </div>
        )}

        {exam.status === 'in_progress' && (
          <div className="space-y-6">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur flex items-center justify-between p-4 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500">
                {answeredCount} / {questions?.length ?? 0}
              </span>
              <div className={`flex items-center gap-2 font-black text-lg ${secondsLeft !== null && secondsLeft < 60 ? 'text-red-600' : 'text-slate-800'}`}>
                <Clock size={20} />
                {secondsLeft !== null ? formatTime(secondsLeft) : formatTime(totalSeconds)}
              </div>
            </div>

            {questionsLoading ? (
              <div className="text-center text-gray-400 py-8">{text.loading[language]}</div>
            ) : (
              questions?.map((q, idx) => (
                <div key={q.id} className="border border-slate-100 rounded-2xl p-5">
                  <p className="font-bold text-slate-800 mb-4">
                    {idx + 1}. {q.text}
                    <span className="ml-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {q.points} pt
                    </span>
                  </p>
                  <div className="space-y-2">
                    {q.options?.map((o) => (
                      <label
                        key={o.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          q.id && answers[q.id] === o.id ? 'border-primary bg-primary-light' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={!!(q.id && answers[q.id] === o.id)}
                          onChange={() => q.id && o.id && setAnswers((a) => ({ ...a, [q.id!]: o.id! }))}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm text-slate-700">{o.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}

            {secondsLeft === 0 && (
              <p className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle size={16} /> {text.timeUp[language]}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold shadow-sm shadow-emerald-200 disabled:opacity-50"
            >
              {isSubmitting ? text.submitting[language] : text.submitBtn[language]}
            </button>
          </div>
        )}

        {(exam.status === 'submitted' || exam.status === 'graded') && (
          <div className="space-y-6">
            <div className="text-center py-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl">
              <p className="text-sm font-bold text-slate-500 mb-1">{text.resultTitle[language]}</p>
              <p className="text-4xl font-black text-indigo-700">
                {exam.grade != null ? exam.grade.toFixed(1) : '—'} <span className="text-lg text-slate-400">{text.outOf[language]} {exam.totalMarks ?? '—'}</span>
              </p>
            </div>

            <h3 className="font-bold text-slate-700">{text.reviewTitle[language]}</h3>

            {questions?.map((q, idx) => {
              const myAnswer = q.answers?.[0];
              const selectedOption = q.options?.find((o) => o.id === myAnswer?.selectedOptionId);
              const correctOption = q.options?.find((o) => o.isCorrect);
              return (
                <div key={q.id} className="border border-slate-100 rounded-2xl p-5">
                  <div className="flex items-start gap-2 mb-3">
                    {myAnswer?.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="font-bold text-slate-800">
                      {idx + 1}. {q.text}
                    </p>
                  </div>
                  <div className="pl-7 space-y-1 text-sm">
                    <p className={myAnswer?.isCorrect ? 'text-emerald-600' : 'text-red-600'}>
                      {text.yourAnswer[language]}: {selectedOption?.text || text.noAnswer[language]}
                    </p>
                    {!myAnswer?.isCorrect && (
                      <p className="text-emerald-600">
                        {text.correctAnswer[language]}: {correctOption?.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => navigate(-1)}
              className="w-full border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50"
            >
              {text.backToList[language]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
