import { useState, } from "react";
import { X, CheckCircle2, XCircle , Award, RotateCcw } from "lucide-react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useQuizById, useSubmitQuiz } from "../../../../hooks/useQuizzes";
import ErrorService from "../../../../utils/ErrorService";

interface TakeQuizModalProps {
  isOpen: boolean;
  quizId: string | null;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function TakeQuizModal({ isOpen, quizId, onClose, onSubmitted }: TakeQuizModalProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const { data: quiz, isLoading } = useQuizById(quizId || "");
  const { mutateAsync: submitQuiz, isPending: isSubmitting } = useSubmitQuiz();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen || !quizId) return null;

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (result) return; // Prevent changing after submission
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const payloadAnswers = (quiz.questions || []).map((q) => ({
      question_id: q.id,
      option_id: answers[q.id] || null,
    }));

    try {
      const res = await submitQuiz({
        quiz_id: quiz.id,
        answers: payloadAnswers,
      });

      setResult(res);
      if (onSubmitted) onSubmitted();

      if (res.passed) {
        ErrorService.success(
          isAr
            ? `مبروك! اجتزت الكويز بنجاح بنتيجة ${res.score} من ${res.total_points}`
            : `Congratulations! Passed quiz with score ${res.score}/${res.total_points}`
        );
      } else {
        ErrorService.warning(
          isAr
            ? `لم تجتز الكويز. حصلت على ${res.score} من ${res.total_points} (الدرجة المطلوبة للنجاح ${res.pass_points})`
            : `Failed. Score: ${res.score}/${res.total_points} (Pass required: ${res.pass_points})`
        );
      }
    } catch (err: any) {
      console.error("Quiz submit error:", err);
      ErrorService.error(
        err?.response?.data?.message || (isAr ? "حدث خطأ أثناء تسليم الكويز" : "Failed to submit quiz")
      );
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  const questionsCount = quiz?.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {quiz ? (isAr ? quiz.title_ar : quiz.title_en || quiz.title_ar) : (isAr ? "جاري تحميل الكويز..." : "Loading Quiz...")}
              </h2>
              {quiz && (
                <p className="text-xs text-white/80">
                  {isAr ? `المدة: ${quiz.duration_min} دقيقة • درجة النجاح: ${quiz.pass_points}/${quiz.total_points}` : `Duration: ${quiz.duration_min} mins • Pass: ${quiz.pass_points}/${quiz.total_points}`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
              onClose();
            }}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {isLoading || !quiz ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p>{isAr ? "جاري تحميل الكويز والأسئلة..." : "Loading Quiz & Questions..."}</p>
            </div>
          ) : result ? (
            /* Result View */
            <div className="space-y-6">
              <div
                className={`p-6 rounded-3xl text-center space-y-3 ${
                  result.passed
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : "bg-red-50 border border-red-200 text-red-900"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl font-black bg-white shadow-sm">
                  {result.passed ? "🥳" : "😔"}
                </div>
                <h3 className="text-2xl font-black">
                  {result.passed
                    ? (isAr ? "مبروك! اجتزت الكويز بنجاح 🎉" : "Passed Successfully!")
                    : (isAr ? "لم تجتز الكويز هذه المرة" : "Did Not Pass")}
                </h3>
                <p className="text-3xl font-black">
                  {result.score} <span className="text-base text-slate-500 font-medium">/ {result.total_points} {isAr ? "درجة" : "pts"}</span>
                </p>
                <p className="text-xs font-semibold opacity-80">
                  {isAr ? `الدرجة المطلوبة للنجاح: ${result.pass_points}` : `Pass mark required: ${result.pass_points}`}
                </p>
              </div>

              {/* Answers Review */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-base">{isAr ? "مراجعة الإجابات:" : "Answer Review:"}</h4>
                {(result.answers || []).map((ans: any, idx: number) => {
                  const q = (quiz.questions || []).find((q) => q.id === ans.question_id);
                  const selectedOpt = (q?.options || []).find((o) => o.id === ans.option_id);
                  const correctOpt = (q?.options || []).find((o) => o.is_correct);

                  return (
                    <div key={ans.id || idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        {ans.is_correct ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold text-sm text-slate-800">
                            {idx + 1}. {isAr ? q?.question_ar : q?.question_en || q?.question_ar}
                          </p>
                          <p className={`text-xs font-semibold mt-1 ${ans.is_correct ? "text-emerald-700" : "text-red-600"}`}>
                            {isAr ? "إجابتك:" : "Your answer:"} {selectedOpt ? (isAr ? selectedOpt.option_text_ar : selectedOpt.option_text_en || selectedOpt.option_text_ar) : (isAr ? "لم تجب" : "No answer")}
                          </p>
                          {!ans.is_correct && correctOpt && (
                            <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                              {isAr ? "الإجابة الصحيحة:" : "Correct answer:"} {isAr ? correctOpt.option_text_ar : correctOpt.option_text_en || correctOpt.option_text_ar}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!result.passed && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isAr ? "إعادة محاولة الكويز" : "Retry Quiz"}</span>
                </button>
              )}
            </div>
          ) : (
            /* Questions View */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-blue-50/70 p-3 px-4 rounded-xl text-xs font-bold text-blue-800">
                <span>{isAr ? `الإجابة على ${answeredCount} من ${questionsCount} سؤال` : `Answered ${answeredCount} of ${questionsCount}`}</span>
                <span>{isAr ? `إجمالي الدرجات: ${quiz.total_points}` : `Total Score: ${quiz.total_points}`}</span>
              </div>

              {(quiz.questions || []).map((q, qIndex) => (
                <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-sm text-slate-800">
                      {qIndex + 1}. {isAr ? q.question_ar : q.question_en || q.question_ar}
                    </span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {q.points} {isAr ? "درجة" : "pts"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(q.options || []).map((opt) => {
                      const isSelected = answers[q.id] === opt.id;
                      return (
                        <label
                          key={opt.id}
                          onClick={() => handleOptionSelect(q.id, opt.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20 text-slate-900 font-bold"
                              : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className="text-sm font-medium">
                            {isAr ? opt.option_text_ar : opt.option_text_en || opt.option_text_ar}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!result && (
          <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              {isAr ? "إغلاق" : "Close"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || answeredCount === 0}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? (isAr ? "جاري التسليم..." : "Submitting...") : (isAr ? "تسليم الكويز" : "Submit Quiz")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
