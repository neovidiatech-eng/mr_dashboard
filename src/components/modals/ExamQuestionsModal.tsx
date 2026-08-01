import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Pencil, CheckCircle2, ListChecks } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  useExamQuestions,
  useAddExamQuestion,
  useUpdateExamQuestion,
  useDeleteExamQuestion,
} from '../../hooks/useExams';
import { ExamQuestion } from '../../types/exam';
import { useConfirm } from '../../hooks/useConfirm';

interface ExamQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  examTitle: string;
}

interface DraftOption {
  text_ar: string;
  text_en?: string;
  text: string;
  isCorrect: boolean;
}

const emptyDraft = (type: 'mcq' | 'true_false') => ({
  text_ar: '',
  text_en: '',
  text: '',
  type,
  points: 1,
  options:
    type === 'true_false'
      ? ([{ text_ar: 'صح', text_en: 'True', text: 'True', isCorrect: false }, { text_ar: 'خطأ', text_en: 'False', text: 'False', isCorrect: false }] as DraftOption[])
      : ([{ text_ar: '', text_en: '', text: '', isCorrect: false }, { text_ar: '', text_en: '', text: '', isCorrect: false }] as DraftOption[]),
});

export default function ExamQuestionsModal({ isOpen, onClose, examId, examTitle }: ExamQuestionsModalProps) {
  const { language } = useLanguage();
  const { data: questions, isLoading } = useExamQuestions(examId);
  const { mutate: addQuestion, isPending: isAdding } = useAddExamQuestion(examId);
  const { mutate: updateQuestion } = useUpdateExamQuestion(examId);
  const { mutate: deleteQuestion } = useDeleteExamQuestion(examId);
  const { confirm, ConfirmDialog } = useConfirm();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft('mcq'));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDraft(emptyDraft('mcq'));
      setEditingId(null);
      setFormError('');
    }
  }, [isOpen]);

  const text = {
    title: { ar: 'إدارة أسئلة الامتحان', en: 'Manage Exam Questions' },
    questionTextAr: { ar: 'نص السؤال (عربي) *', en: 'Question Text (Arabic) *' },
    questionTextEn: { ar: 'نص السؤال (إنجليزي)', en: 'Question Text (English)' },
    type: { ar: 'نوع السؤال', en: 'Question Type' },
    mcq: { ar: 'اختيار من متعدد', en: 'Multiple Choice' },
    trueFalse: { ar: 'صح / خطأ', en: 'True / False' },
    points: { ar: 'الدرجة', en: 'Points' },
    options: { ar: 'الاختيارات (اختر الإجابة الصحيحة)', en: 'Options (pick the correct one)' },
    addOption: { ar: 'إضافة اختيار', en: 'Add Option' },
    save: { ar: 'حفظ السؤال', en: 'Save Question' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    close: { ar: 'إغلاق', en: 'Close' },
    noQuestions: { ar: 'لسه مفيش أسئلة في الامتحان ده', en: 'No questions in this exam yet' },
    needOneCorrect: { ar: 'لازم تختار إجابة صحيحة واحدة بالظبط', en: 'You must mark exactly one correct answer' },
    needOptionText: { ar: 'كل الاختيارات لازم يكون ليها نص بالعربي', en: 'Every option needs Arabic text' },
    deleteConfirmTitle: { ar: 'حذف سؤال', en: 'Delete Question' },
    deleteConfirmMsg: { ar: 'متأكد إنك عايز تحذف السؤال ده؟', en: 'Are you sure you want to delete this question?' },
    edit: { ar: 'تعديل', en: 'Edit' },
    delete: { ar: 'حذف', en: 'Delete' },
  };

  if (!isOpen) return null;

  const setOptionTextAr = (index: number, value: string) => {
    setDraft((d) => ({ ...d, options: d.options.map((o, i) => (i === index ? { ...o, text_ar: value, text: value } : o)) }));
  };

  const setOptionTextEn = (index: number, value: string) => {
    setDraft((d) => ({ ...d, options: d.options.map((o, i) => (i === index ? { ...o, text_en: value } : o)) }));
  };

  const setCorrectOption = (index: number) => {
    setDraft((d) => ({ ...d, options: d.options.map((o, i) => ({ ...o, isCorrect: i === index })) }));
  };

  const addOption = () => {
    setDraft((d) => ({ ...d, options: [...d.options, { text_ar: '', text_en: '', text: '', isCorrect: false }] }));
  };

  const removeOption = (index: number) => {
    setDraft((d) => ({ ...d, options: d.options.filter((_, i) => i !== index) }));
  };

  const startEdit = (q: ExamQuestion) => {
    setEditingId(q.id);
    setDraft({
      text_ar: q.text_ar || q.text || '',
      text_en: q.text_en || '',
      text: q.text_ar || q.text || '',
      type: q.type,
      points: q.points,
      options: q.options.map((o) => ({ text_ar: o.text_ar || o.text || '', text_en: o.text_en || '', text: o.text_ar || o.text || '', isCorrect: !!o.isCorrect })),
    });
    setFormError('');
  };

  const resetForm = () => {
    setDraft(emptyDraft('mcq'));
    setEditingId(null);
    setFormError('');
  };

  const handleSubmitQuestion = () => {
    setFormError('');
    if (!draft.text_ar.trim()) return setFormError(text.questionTextAr[language]);
    if (draft.options.some((o) => !o.text_ar.trim())) return setFormError(text.needOptionText[language]);
    if (draft.options.filter((o) => o.isCorrect).length !== 1) return setFormError(text.needOneCorrect[language]);

    const payload = {
      text_ar: draft.text_ar,
      text_en: draft.text_en,
      text: draft.text_ar,
      type: draft.type as 'mcq' | 'true_false',
      points: Number(draft.points) || 1,
      options: draft.options.map(o => ({
        text_ar: o.text_ar,
        text_en: o.text_en,
        text: o.text_ar,
        isCorrect: o.isCorrect,
      })),
    };

    if (editingId) {
      updateQuestion(
        { questionId: editingId, data: payload },
        { onSuccess: resetForm },
      );
    } else {
      addQuestion(payload, { onSuccess: resetForm });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: text.deleteConfirmTitle[language],
      message: text.deleteConfirmMsg[language],
    });
    if (confirmed) deleteQuestion(id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              {text.title[language]}
            </h2>
            <p className="text-white/70 text-xs mt-1">{examTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {/* Existing questions list */}
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-gray-400">...</p>
            ) : !questions || questions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">{text.noQuestions[language]}</p>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">
                        {idx + 1}. {q.text}
                        <span className="ml-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {q.points} {text.points[language]}
                        </span>
                      </p>
                      <div className="mt-2 space-y-1">
                        {q.options.map((o) => (
                          <div key={o.id} className="flex items-center gap-2 text-xs text-gray-600">
                            {o.isCorrect ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                            )}
                            {o.text}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(q)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title={text.edit[language]}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title={text.delete[language]}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add/Edit question form */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{text.questionTextAr[language]}</label>
                <textarea
                  value={draft.text_ar}
                  onChange={(e) => setDraft((d) => ({ ...d, text_ar: e.target.value, text: e.target.value }))}
                  rows={2}
                  dir="rtl"
                  placeholder="نص السؤال بالعربية"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{text.questionTextEn[language]}</label>
                <textarea
                  value={draft.text_en}
                  onChange={(e) => setDraft((d) => ({ ...d, text_en: e.target.value }))}
                  rows={2}
                  dir="ltr"
                  placeholder="Question text in English"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{text.type[language]}</label>
                <select
                  value={draft.type}
                  onChange={(e) => {
                    const type = e.target.value as 'mcq' | 'true_false';
                    setDraft(emptyDraft(type));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="mcq">{text.mcq[language]}</option>
                  <option value="true_false">{text.trueFalse[language]}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{text.points[language]}</label>
                <input
                  type="number"
                  min={0}
                  value={draft.points}
                  onChange={(e) => setDraft((d) => ({ ...d, points: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{text.options[language]}</label>
              <div className="space-y-3">
                {draft.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={o.isCorrect}
                      onChange={() => setCorrectOption(i)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                      <input
                        type="text"
                        value={o.text_ar}
                        dir="rtl"
                        placeholder="الاختيار (عربي) *"
                        disabled={draft.type === 'true_false'}
                        onChange={(e) => setOptionTextAr(i, e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100"
                      />
                      <input
                        type="text"
                        value={o.text_en}
                        dir="ltr"
                        placeholder="Option (English)"
                        disabled={draft.type === 'true_false'}
                        onChange={(e) => setOptionTextEn(i, e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100"
                      />
                    </div>
                    {draft.type === 'mcq' && draft.options.length > 2 && (
                      <button onClick={() => removeOption(i)} className="p-1.5 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {draft.type === 'mcq' && draft.options.length < 6 && (
                <button
                  onClick={addOption}
                  className="mt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> {text.addOption[language]}
                </button>
              )}
            </div>

            {formError && <p className="text-red-500 text-xs">{formError}</p>}

            <div className="flex gap-3">
              {editingId && (
                <button onClick={resetForm} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium">
                  {text.cancel[language]}
                </button>
              )}
              <button
                onClick={handleSubmitQuestion}
                disabled={isAdding}
                className="flex-1 px-4 py-2.5 btn-primary text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {text.save[language]}
              </button>
            </div>
          </div>

          <button onClick={onClose} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500">
            {text.close[language]}
          </button>
        </div>
      </div>
      {ConfirmDialog}
    </div>
  );
}
