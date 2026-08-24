import { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, ListChecks, HelpCircle, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import ErrorService from '../../utils/ErrorService';
import { ExamData, MCQQuestion, TrueFalseQuestion } from '../../types/courseExam';

export interface AddExamProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (examData: ExamData) => void | Promise<void>;
}

export default function AddExam({ isOpen, onClose, onSave }: AddExamProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'mcq' | 'true_false'>('mcq');

  // Exam general info
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState(30);
  const [passPoints, setPassPoints] = useState(50);
  const [examOrder, setExamOrder] = useState(1);

  // MCQ Questions State
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([
    {
      id: crypto.randomUUID(),
      text: '',
      points: 1,
      options: [
        { id: crypto.randomUUID(), text: '', isCorrect: true },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ],
    },
  ]);

  // True / False Questions State
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<TrueFalseQuestion[]>([
    {
      id: crypto.randomUUID(),
      text: '',
      points: 1,
      correctAnswer: true,
    },
  ]);

  if (!isOpen) return null;

  // --- MCQ Handlers ---
  const handleAddMCQQuestion = () => {
    setMcqQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: '',
        points: 1,
        options: [
          { id: crypto.randomUUID(), text: '', isCorrect: true },
          { id: crypto.randomUUID(), text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveMCQQuestion = (qIndex: number) => {
    if (mcqQuestions.length === 1) {
      ErrorService.warning(isAr ? 'يجب أن يحتوي الامتحان على سؤال واحد على الأقل' : 'Must have at least one question');
      return;
    }
    setMcqQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const handleMCQTextChange = (qIndex: number, text: string) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, text } : q))
    );
  };

  const handleMCQPointsChange = (qIndex: number, points: number) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, points: Math.max(1, points) } : q))
    );
  };

  const handleAddOption = (qIndex: number) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length >= 6) {
          ErrorService.warning(isAr ? 'الحد الأقصى 6 اختيارات لكل سؤال' : 'Max 6 options per question');
          return q;
        }
        return {
          ...q,
          options: [
            ...q.options,
            { id: crypto.randomUUID(), text: '', isCorrect: false },
          ],
        };
      })
    );
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 2) {
          ErrorService.warning(isAr ? 'يجب أن يحتوي السؤال على اختيارين على الأقل' : 'Must have at least 2 options');
          return q;
        }
        const wasCorrect = q.options[optIndex].isCorrect;
        const newOptions = q.options.filter((_, idx) => idx !== optIndex);
        // If the removed option was the correct one, make the first one correct by default
        if (wasCorrect && newOptions.length > 0) {
          newOptions[0].isCorrect = true;
        }
        return { ...q, options: newOptions };
      })
    );
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return {
          ...q,
          options: q.options.map((opt, idx) =>
            idx === optIndex ? { ...opt, text } : opt
          ),
        };
      })
    );
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return {
          ...q,
          options: q.options.map((opt, idx) => ({
            ...opt,
            isCorrect: idx === optIndex,
          })),
        };
      })
    );
  };

  // --- True / False Handlers ---
  const handleAddTFQuestion = () => {
    setTrueFalseQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: '',
        points: 1,
        correctAnswer: true,
      },
    ]);
  };

  const handleRemoveTFQuestion = (qIndex: number) => {
    if (trueFalseQuestions.length === 1) {
      ErrorService.warning(isAr ? 'يجب أن يحتوي على سؤال واحد على الأقل' : 'Must have at least one question');
      return;
    }
    setTrueFalseQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const handleTFTextChange = (qIndex: number, text: string) => {
    setTrueFalseQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, text } : q))
    );
  };

  const handleTFPointsChange = (qIndex: number, points: number) => {
    setTrueFalseQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, points: Math.max(1, points) } : q))
    );
  };

  const handleSetTFAnswer = (qIndex: number, correctAnswer: boolean) => {
    setTrueFalseQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctAnswer } : q))
    );
  };

  // --- Validation & Submit ---
  const handleSubmit = async () => {
    if (!examTitle.trim()) {
      ErrorService.error(isAr ? 'يرجى كتابة عنوان الامتحان' : 'Please enter exam title');
      return;
    }

    // Validate MCQ
    for (let i = 0; i < mcqQuestions.length; i++) {
      const q = mcqQuestions[i];
      if (!q.text.trim()) {
        ErrorService.error(isAr ? `يرجى إدخال نص السؤال رقم ${i + 1} في أسئلة الاختيار من متعدد` : `Please enter question text for MCQ #${i + 1}`);
        setActiveTab('mcq');
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          ErrorService.error(isAr ? `يرجى ملء الاختيار رقم ${j + 1} للسؤال رقم ${i + 1}` : `Please fill option #${j + 1} for MCQ #${i + 1}`);
          setActiveTab('mcq');
          return;
        }
      }
      const hasCorrect = q.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        ErrorService.error(isAr ? `يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1}` : `Please select correct answer for MCQ #${i + 1}`);
        setActiveTab('mcq');
        return;
      }
    }

    // Validate True / False
    for (let i = 0; i < trueFalseQuestions.length; i++) {
      const q = trueFalseQuestions[i];
      if (!q.text.trim()) {
        ErrorService.error(isAr ? `يرجى إدخال نص السؤال رقم ${i + 1} في أسئلة صح وخطأ` : `Please enter question text for True/False #${i + 1}`);
        setActiveTab('true_false');
        return;
      }
    }

    const payload: ExamData = {
      title: examTitle,
      duration: Number(examDuration) || 30,
      passPoints: Number(passPoints) || 0,
      order: Number(examOrder) || 1,
      mcqQuestions,
      trueFalseQuestions,
    };

    await onSave(payload);
    onClose();
  };

  // Calculate totals
  const totalMCQPoints = mcqQuestions.reduce((acc, q) => acc + (q.points || 0), 0);
  const totalTFPoints = trueFalseQuestions.reduce((acc, q) => acc + (q.points || 0), 0);
  const totalScore = totalMCQPoints + totalTFPoints;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-start"
      >
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ListChecks className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {isAr ? 'إنشاء وتصميم امتحان جديد' : 'Create New Exam'}
              </h2>
              <p className="text-xs text-white/80">
                {isAr ? 'إضافة أسئلة اختيار من متعدد وصح أو خطأ مع التصحيح التلقائي' : 'Add MCQ and True/False questions with auto-grading'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exam Title & Duration Bar */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'عنوان الامتحان *' : 'Exam Title *'}
            </label>
            <input
              type="text"
              dir={isAr ? 'rtl' : 'ltr'}
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder={isAr ? 'مثال: اختبار الشهر الأول في الرياضيات' : 'e.g. Monthly Math Quiz'}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'المدة (بالدقائق)' : 'Duration (Minutes)'}
            </label>
            <input
              type="number"
              min="5"
              dir={isAr ? 'rtl' : 'ltr'}
              value={examDuration}
              onChange={(e) => setExamDuration(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'درجات النجاح' : 'Pass Points'}
            </label>
            <input
              type="number"
              min="0"
              dir={isAr ? 'rtl' : 'ltr'}
              value={passPoints}
              onChange={(e) => setPassPoints(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'الترتيب' : ' Order'}
            </label>
            <input
              type="number"
              min="1"
              dir={isAr ? 'rtl' : 'ltr'}
              value={examOrder}
              onChange={(e) => setExamOrder(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
            />
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('mcq')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all ${
              activeTab === 'mcq'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>{isAr ? 'اختيار من متعدد (MCQ)' : 'Multiple Choice (MCQ)'}</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-bold">
              {mcqQuestions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('true_false')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all ${
              activeTab === 'true_false'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isAr ? 'صح / خطأ (True & False)' : 'True / False'}</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-bold">
              {trueFalseQuestions.length}
            </span>
          </button>
        </div>

        {/* Scrollable Questions Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* TAB 1: MCQ QUESTIONS */}
          {activeTab === 'mcq' && (
            <div className="space-y-6">
              {mcqQuestions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-slate-300"
                >
                  {/* Question Header & Points */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {qIndex + 1}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-800">
                        {isAr ? `سؤال اختيار من متعدد #${qIndex + 1}` : `MCQ Question #${qIndex + 1}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium">{isAr ? 'الدرجة:' : 'Points:'}</span>
                        <input
                          type="number"
                          min="1"
                          value={q.points}
                          onChange={(e) => handleMCQPointsChange(qIndex, Number(e.target.value))}
                          className="w-12 bg-transparent text-xs font-bold text-slate-800 text-center outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMCQQuestion(qIndex)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={isAr ? 'حذف السؤال' : 'Delete Question'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {isAr ? 'نص السؤال *' : 'Question Text *'}
                    </label>
                    <input
                      type="text"
                      dir={isAr ? 'rtl' : 'ltr'}
                      value={q.text}
                      onChange={(e) => handleMCQTextChange(qIndex, e.target.value)}
                      placeholder={isAr ? 'اكتب نص السؤال هنا...' : 'Type the question text here...'}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-2">
                    <label className="block text-xs font-medium text-slate-600 flex items-center justify-between">
                      <span>{isAr ? 'الاختيارات (اختر الدائرة الخضراء لتحديد الإجابة الصحيحة للتصحيح التلقائي):' : 'Options (select green circle for the correct answer):'}</span>
                    </label>

                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                            opt.isCorrect
                              ? 'border-emerald-400 bg-emerald-50/50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          {/* Radio Button to mark Correct */}
                          <button
                            type="button"
                            onClick={() => handleSetCorrectOption(qIndex, optIndex)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                              opt.isCorrect
                                ? 'bg-emerald-500 text-white ring-2 ring-emerald-200'
                                : 'border-2 border-slate-300 text-transparent hover:border-emerald-400'
                            }`}
                            title={isAr ? 'تحديد كإجابة صحيحة' : 'Mark as correct answer'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          {/* Option Text Input */}
                          <input
                            type="text"
                            dir={isAr ? 'rtl' : 'ltr'}
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                            placeholder={`${isAr ? 'الاختيار' : 'Option'} ${optIndex + 1}`}
                            className="flex-1 bg-transparent px-2 py-1 text-sm outline-none text-slate-800 font-medium text-start"
                          />

                          {opt.isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              {isAr ? 'الإجابة الصحيحة' : 'Correct Answer'}
                            </span>
                          )}

                          {/* Delete Option Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIndex, optIndex)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                            title={isAr ? 'حذف الاختيار' : 'Delete Option'}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Option Button (Plus inside question) */}
                    <button
                      type="button"
                      onClick={() => handleAddOption(qIndex)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-blue-50/70 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة اختيار إضافي' : 'Add Another Option'}</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New MCQ Question Button */}
              <button
                type="button"
                onClick={handleAddMCQQuestion}
                className="w-full py-3.5 border-2 border-dashed border-primary/40 hover:border-primary bg-blue-50/30 hover:bg-blue-50/70 text-primary font-bold rounded-2xl flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة سؤال اختيار من متعدد جديد +' : 'Add New MCQ Question +'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: TRUE / FALSE QUESTIONS */}
          {activeTab === 'true_false' && (
            <div className="space-y-6">
              {trueFalseQuestions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-slate-300"
                >
                  {/* Question Header & Points */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {qIndex + 1}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-800">
                        {isAr ? `سؤال صح / خطأ #${qIndex + 1}` : `True/False Question #${qIndex + 1}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium">{isAr ? 'الدرجة:' : 'Points:'}</span>
                        <input
                          type="number"
                          min="1"
                          value={q.points}
                          onChange={(e) => handleTFPointsChange(qIndex, Number(e.target.value))}
                          className="w-12 bg-transparent text-xs font-bold text-slate-800 text-center outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTFQuestion(qIndex)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={isAr ? 'حذف السؤال' : 'Delete Question'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {isAr ? 'نص السؤال (العبارة) *' : 'Question Statement *'}
                    </label>
                    <input
                      type="text"
                      dir={isAr ? 'rtl' : 'ltr'}
                      value={q.text}
                      onChange={(e) => handleTFTextChange(qIndex, e.target.value)}
                      placeholder={isAr ? 'اكتب العبارة هنا لمعرفة إن كانت صحيحة أم خاطئة...' : 'Type statement here...'}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
                    />
                  </div>

                  {/* Select Correct Answer (True vs False) */}
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      {isAr ? 'حدد الإجابة الصحيحة للعبارة (للتصحيح التلقائي):' : 'Select the correct answer for auto-grading:'}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* True Button */}
                      <button
                        type="button"
                        onClick={() => handleSetTFAnswer(qIndex, true)}
                        className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                          q.correctAnswer === true
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-2 ring-emerald-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${q.correctAnswer === true ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{isAr ? 'صح (True)' : 'True'}</span>
                      </button>

                      {/* False Button */}
                      <button
                        type="button"
                        onClick={() => handleSetTFAnswer(qIndex, false)}
                        className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                          q.correctAnswer === false
                            ? 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-2 ring-red-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <X className={`w-4 h-4 ${q.correctAnswer === false ? 'text-red-600' : 'text-slate-400'}`} />
                        <span>{isAr ? 'خطأ (False)' : 'False'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New True / False Question Button */}
              <button
                type="button"
                onClick={handleAddTFQuestion}
                className="w-full py-3.5 border-2 border-dashed border-primary/40 hover:border-primary bg-blue-50/30 hover:bg-blue-50/70 text-primary font-bold rounded-2xl flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة سؤال صح / خطأ جديد +' : 'Add New True/False Question +'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary & Actions */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>
              {isAr ? 'إجمالي الأسئلة:' : 'Total Questions:'}{' '}
              <strong className="text-slate-900">{mcqQuestions.length + trueFalseQuestions.length}</strong>
            </span>
            <span>•</span>
            <span>
              {isAr ? 'الدرجة الكلية:' : 'Total Score:'}{' '}
              <strong className="text-primary">{totalScore} {isAr ? 'درجة' : 'pts'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ الامتحان والأسئلة' : 'Save Exam & Questions'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
