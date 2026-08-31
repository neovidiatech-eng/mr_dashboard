import { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, ListChecks, HelpCircle, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import ErrorService from '../../utils/ErrorService';
import { MCQQuestion, TrueFalseQuestion } from '../../types/courseExam';
import { useCreateQuiz, useUpdateQuiz, useQuizById } from '../../hooks/useQuiz';
import { useAddItemsToSection } from '../../hooks/useSections';
import { createSection } from '../../services/SectionServices';
import { useQueryClient } from '@tanstack/react-query';
import { CreateQuizPayload, CreateQuizQuestionPayload } from '../../types/quiz';
import { Section } from '../../types/courses';

export interface AddQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (quizData: CreateQuizPayload) => void | Promise<void>;
  sections?: Section[];
  defaultSectionId?: string;
  courseId?: string;
  quiz?: any;
}

export default function AddQuizModal({ isOpen, onClose, onSave, sections, defaultSectionId, courseId, quiz }: AddQuizProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const queryClient = useQueryClient();

  const editingQuizId = isOpen && quiz ? (quiz.id || quiz.item_id || quiz.details?.id) : null;
  const { data: fetchedQuizData } = useQuizById(editingQuizId);
  const activeQuiz = fetchedQuizData || quiz?.details || quiz;

  const { mutateAsync: createQuiz, isPending: isCreating } = useCreateQuiz();
  const { mutateAsync: updateQuiz, isPending: isUpdating } = useUpdateQuiz();
  const { mutateAsync: addItemsToSection } = useAddItemsToSection();
  const isPending = isCreating || isUpdating;
  const isEditMode = !!quiz;

  const [activeTab, setActiveTab] = useState<'mcq' | 'true_false'>('mcq');

  // Quiz general info
  const [quizTitle, setQuizTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [quizDuration, setQuizDuration] = useState(30);
  const [passPoints, setPassPoints] = useState(50);
  const [quizOrder, setQuizOrder] = useState<number>(1);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(defaultSectionId || sections?.[0]?.id || '');

  useEffect(() => {
    if (defaultSectionId) {
      setSelectedSectionId(defaultSectionId);
    } else if (sections && sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
    }
  }, [defaultSectionId, sections]);

  useEffect(() => {
    if (isOpen) {
      if (activeQuiz) {
        setQuizTitle(activeQuiz.title_ar || activeQuiz.title || '');
        setTitleEn(activeQuiz.title_en || activeQuiz.title || '');
        setDescriptionAr(activeQuiz.description_ar || activeQuiz.description || '');
        setDescriptionEn(activeQuiz.description_en || activeQuiz.description || '');
        setQuizDuration(activeQuiz.duration_min || activeQuiz.duration || 30);
        setPassPoints(activeQuiz.pass_points || 0);
        setQuizOrder(activeQuiz.order || 1);

        const questionsList =
          activeQuiz.questions ||
          (activeQuiz as any).quiz_questions ||
          (activeQuiz as any).QuizQuestions ||
          (activeQuiz as any).items ||
          (activeQuiz as any).data?.questions ||
          [];

        if (Array.isArray(questionsList) && questionsList.length > 0) {
          const mcqs: MCQQuestion[] = [];
          const tfs: TrueFalseQuestion[] = [];

          questionsList.forEach((q: any) => {
            const qType = (q.type || '').toUpperCase();
            const text =
              typeof q === 'string'
                ? q
                : q.question_ar ||
                  q.question_en ||
                  q.question ||
                  q.text_ar ||
                  q.text_en ||
                  q.text ||
                  q.title_ar ||
                  q.title_en ||
                  q.title ||
                  '';
            const points = q.points || q.marks || 1;
            const optionsList = q.options || q.quiz_options || q.QuizOptions || q.choices || q.answers || [];

            const isTrueFalse =
              qType === 'TRUE_FALSE' ||
              qType === 'BOOLEAN' ||
              (optionsList.length === 2 &&
                optionsList.some((o: any) => {
                  const oTxt = (typeof o === 'string' ? o : o.option_text_ar || o.option_text_en || o.option_text || o.text || '').toLowerCase();
                  return oTxt === 'true' || oTxt === 'صح' || oTxt === 'false' || oTxt === 'خطأ';
                }));

            if (isTrueFalse) {
              const isCorrectTrue = optionsList.some((o: any) => {
                const isCorr = typeof o === 'object' && o !== null ? !!(o.is_correct || o.isCorrect || o.correct || o.is_answer) : false;
                const oTxt = (typeof o === 'string' ? o : o.option_text_ar || o.option_text_en || o.option_text || o.text || '').toLowerCase();
                return isCorr && (oTxt === 'true' || oTxt === 'صح');
              });
              tfs.push({
                text,
                points,
                correctAnswer: isCorrectTrue,
              });
            } else {
              const parsedOptions = optionsList.map((o: any, idx: number) => {
                const oTxt =
                  typeof o === 'string'
                    ? o
                    : o.option_text_ar ||
                      o.option_text_en ||
                      o.option_text ||
                      o.optionText ||
                      o.text_ar ||
                      o.text_en ||
                      o.text ||
                      o.title_ar ||
                      o.title_en ||
                      o.title ||
                      o.option ||
                      o.label ||
                      o.value ||
                      o.name ||
                      '';
                const isCorr = typeof o === 'object' && o !== null ? !!(o.is_correct || o.isCorrect || o.correct || o.is_answer) : idx === 0;
                return {
                  text: oTxt,
                  isCorrect: isCorr,
                };
              });
              mcqs.push({
                text,
                points,
                options: parsedOptions.length > 0 ? parsedOptions : [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
              });
            }
          });

          if (mcqs.length > 0) setMcqQuestions(mcqs);
          if (tfs.length > 0) setTrueFalseQuestions(tfs);
          if (mcqs.length > 0 && tfs.length === 0) setTrueFalseQuestions([]);
          if (tfs.length > 0 && mcqs.length === 0) setMcqQuestions([]);
        }
      } else {
        setQuizTitle('');
        setTitleEn('');
        setDescriptionAr('');
        setDescriptionEn('');
        setQuizDuration(30);
        setPassPoints(50);
        setQuizOrder(1);
        setMcqQuestions([
          {
            text: '',
            points: 1,
            options: [
              { text: '', isCorrect: true },
              { text: '', isCorrect: false },
            ],
          },
        ]);
        setTrueFalseQuestions([]);
      }
    }
  }, [isOpen, activeQuiz]);

  // MCQ Questions State
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([
    {
      text: '',
      points: 1,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
    },
  ]);

  // True / False Questions State
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<TrueFalseQuestion[]>([]);

  if (!isOpen) return null;

  // --- MCQ Handlers ---
  const handleAddMCQQuestion = () => {
    setMcqQuestions((prev) => [
      ...prev,
      {
        text: '',
        points: 1,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveMCQQuestion = (qIndex: number) => {
    if (mcqQuestions.length + trueFalseQuestions.length <= 1) {
      ErrorService.warning(isAr ? 'يجب أن يحتوي الكويز على سؤال واحد على الأقل' : 'Must have at least one question');
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
            { text: '', isCorrect: false },
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
        text: '',
        points: 1,
        correctAnswer: true,
      },
    ]);
  };

  const handleRemoveTFQuestion = (qIndex: number) => {
    if (mcqQuestions.length + trueFalseQuestions.length <= 1) {
      ErrorService.warning(isAr ? 'يجب أن يحتوي الكويز على سؤال واحد على الأقل' : 'Must have at least one question');
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
    if (!quizTitle.trim()) {
      ErrorService.error(isAr ? 'يرجى كتابة عنوان الكويز' : 'Please enter quiz title');
      return;
    }

    const activeMcqs = mcqQuestions.filter((q) => q.text.trim() || q.options.some((o) => o.text.trim()));
    const activeTfs = trueFalseQuestions.filter((q) => q.text.trim());

    if (activeMcqs.length + activeTfs.length === 0) {
      ErrorService.error(isAr ? 'يجب إضافة سؤال واحد على الأقل في الكويز وتعبئة بياناته' : 'Must add and fill at least one question');
      return;
    }

    // Validate active MCQ
    for (let i = 0; i < activeMcqs.length; i++) {
      const q = activeMcqs[i];
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

    // Validate active True / False
    for (let i = 0; i < activeTfs.length; i++) {
      const q = activeTfs[i];
      if (!q.text.trim()) {
        ErrorService.error(isAr ? `يرجى إدخال نص السؤال رقم ${i + 1} في أسئلة صح وخطأ` : `Please enter question text for True/False #${i + 1}`);
        setActiveTab('true_false');
        return;
      }
    }

    const formattedMcq: CreateQuizQuestionPayload[] = activeMcqs.map((q, idx) => ({
      question_ar: q.text,
      question_en: q.text,
      type: 'MCQ',
      points: Number(q.points) || 1,
      order: idx + 1,
      options: q.options.map((opt) => ({
        option_text_ar: opt.text,
        option_text_en: opt.text,
        is_correct: opt.isCorrect,
      })),
    }));

    const formattedTF: CreateQuizQuestionPayload[] = activeTfs.map((q, idx) => ({
      question_ar: q.text,
      question_en: q.text,
      type: 'TRUE_FALSE',
      points: Number(q.points) || 1,
      order: activeMcqs.length + idx + 1,
      options: [
        { option_text_ar: 'صح', option_text_en: 'True', is_correct: q.correctAnswer === true },
        { option_text_ar: 'خطأ', option_text_en: 'False', is_correct: q.correctAnswer === false },
      ],
    }));

    const quizPayload: CreateQuizPayload = {
      title_ar: quizTitle,
      title_en: titleEn.trim() || quizTitle,
      description_ar: descriptionAr,
      description_en: descriptionEn.trim() || descriptionAr,
      duration_min: Number(quizDuration) || 30,
      pass_points: Number(passPoints) || 0,
      total_points: totalScore,
      questions: [...formattedMcq, ...formattedTF],
      order: Number(quizOrder) || 1,
    };

    if (courseId) {
      quizPayload.courseId = courseId;
    }

    try {
      let createdQuizId = quiz?.id;
      if (onSave) {
        const result: any = await onSave(quizPayload);
        if (result?.id || result?.data?.id) {
          createdQuizId = result.id || result.data.id;
        }
      } else if (isEditMode && createdQuizId) {
        await updateQuiz({ id: createdQuizId, data: quizPayload });
        ErrorService.success(isAr ? 'تم تحديث الكويز بنجاح!' : 'Quiz updated successfully!');
      } else {
        const res: any = await createQuiz(quizPayload);
        createdQuizId = res?.id || res?.data?.id;
        ErrorService.success(isAr ? 'تم إنشاء الكويز بنجاح!' : 'Quiz created successfully!');
      }

      const isValidUUID = (id?: string) =>
        !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let targetSecId = selectedSectionId;
      if ((!targetSecId || !isValidUUID(targetSecId)) && courseId) {
        try {
          const newSec = await createSection({
            course_id: courseId,
            name_ar: 'محتوى الكورس',
            name_en: 'Course Content',
            items: createdQuizId ? [{ item_id: createdQuizId, item_type: 'QUIZ', order: Number(quizOrder) || 1 }] : [],
          });
          targetSecId = newSec.id;
        } catch (secErr) {
          console.error('Failed to auto-create section for quiz:', secErr);
        }
      }

      if (!isEditMode && createdQuizId && targetSecId && isValidUUID(targetSecId)) {
        try {
          await addItemsToSection({
            sectionId: targetSecId,
            items: [{ item_id: createdQuizId, item_type: 'QUIZ', order: Number(quizOrder) || 1 }],
            courseId,
          });
        } catch (err) {
          console.error('Failed to link quiz to section:', err);
        }
      }

      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
        queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      onClose();
    } catch (error: any) {
      ErrorService.error(
        error?.response?.data?.message || error?.message || (isAr ? 'حدث خطأ أثناء حفظ الكويز' : 'Failed to save quiz')
      );
    }
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
                {isAr ? 'إنشاء وتصميم كويز جديد (/quiz)' : 'Create New Quiz (/quiz)'}
              </h2>
              <p className="text-xs text-white/80">
                {isAr ? 'إضافة أسئلة اختيار من متعدد وصح أو خطأ للكويز' : 'Add MCQ and True/False questions for Quiz'}
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

        {/* Quiz Title & Duration Bar */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          {/* {sections && sections.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-primary mb-1">
                {isAr ? 'اختر السكشن المراد إضافة الكويز له *' : 'Select Target Section *'}
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-primary/30 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start shadow-sm cursor-pointer"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {isAr ? sec.name_ar || sec.name : sec.name_en || sec.name}
                  </option>
                ))}
              </select>
            </div>
          )} */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'عنوان الكويز (بالعربي) *' : 'Quiz Title (Arabic) *'}
            </label>
            <input
              type="text"
              dir="rtl"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder={isAr ? 'مثال: كويز المحاضرة الأولى' : 'e.g. Lecture 1 Quiz'}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'عنوان الكويز (بالإنجليزي)' : 'Quiz Title (English)'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Lecture 1 Quiz"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'وصف الكويز (بالعربي)' : 'Quiz Description (Arabic)'}
            </label>
            <textarea
              rows={2}
              dir="rtl"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder={isAr ? 'اكتب وصفاً للكويز...' : 'Type quiz description...'}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isAr ? 'وصف الكويز (بالإنجليزي)' : 'Quiz Description (English)'}
            </label>
            <textarea
              rows={2}
              dir="ltr"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Type English quiz description..."
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start resize-none"
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
              value={quizDuration}
              onChange={(e) => setQuizDuration(Number(e.target.value))}
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
              {isAr ? 'الترتيب *' : 'Order *'}
            </label>
            <input
              type="number"
              min="1"
              dir={isAr ? 'rtl' : 'ltr'}
              value={quizOrder}
              onChange={(e) => setQuizOrder(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-start"
            />
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('mcq')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all ${activeTab === 'mcq'
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
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all ${activeTab === 'true_false'
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
                  key={qIndex}
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
                    <label className="block text-xs font-medium text-slate-600 items-center justify-between">
                      <span>{isAr ? 'الاختيارات (اختر الدائرة الخضراء لتحديد الإجابة الصحيحة للتصحيح التلقائي):' : 'Options (select green circle for the correct answer):'}</span>
                    </label>

                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${opt.isCorrect
                              ? 'border-emerald-400 bg-emerald-50/50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          {/* Radio Button to mark Correct */}
                          <button
                            type="button"
                            onClick={() => handleSetCorrectOption(qIndex, optIndex)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${opt.isCorrect
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

                    {/* Add Option Button */}
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
                  key={qIndex}
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
                        className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${q.correctAnswer === true
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
                        className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${q.correctAnswer === false
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
              disabled={isPending}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isAr ? 'حفظ الكويز والأسئلة' : 'Save Quiz & Questions'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
