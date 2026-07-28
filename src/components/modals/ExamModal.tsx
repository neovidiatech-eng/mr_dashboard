import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExamFormData, getExamSchema } from '../../lib/schemas/ExamSchema';
import { useEffect } from 'react';
import { useGetStudents } from '../../hooks/useAssignment';
import { useTeacher } from '../../features/admin/hooks/useTeacher';
import { Exam } from '../../types/exam';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exam: ExamFormData) => boolean | Promise<boolean>;
  initialData?: Exam | null;
}

export default function AddExamModal({ isOpen, onClose, onAdd, initialData }: AddExamModalProps) {
  const { language, t } = useLanguage();

  const { data: studentsData } = useGetStudents();
  const { data: teachersData } = useTeacher({ search: '', page: 1, limit: 1000 });

  const studentOptions = (studentsData?.data?.studentsData || []).map((s: any) => ({
    value: s.id,
    label: s.user?.name || s.id,
  }));

  const teacherOptions = (teachersData?.teachers || []).map((tch: any) => ({
    value: tch.id,
    label: tch.user?.name || tch.id,
  }));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(getExamSchema(t)) as Resolver<ExamFormData>,
    defaultValues: {
      totalMarks: 100,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          subject: initialData.subject || '',
          studentId: initialData.studentId,
          teacherId: initialData.teacherId,
          dueDate: initialData.dueDate?.split('T')[0] || '',
          duration: initialData.duration,
          totalMarks: initialData.totalMarks,
        });
      } else {
        reset({
          title: '',
          subject: '',
          studentId: '',
          teacherId: '',
          dueDate: '',
          duration: 60,
          totalMarks: 100,
        });
      }
    }
  }, [initialData, reset, isOpen]);

  const text = {
    title: {
      ar: initialData ? 'تعديل امتحان' : 'إضافة امتحان جديد',
      en: initialData ? 'Edit Exam' : 'Add New Exam',
    },
    examTitle: { ar: 'العنوان', en: 'Title' },
    subject: { ar: 'المادة', en: 'Subject' },
    teacher: { ar: 'المعلم', en: 'Teacher' },
    student: { ar: 'اختر الطالب', en: 'Select Student' },
    dueDate: { ar: 'التاريخ', en: 'Date' },
    duration: { ar: 'المدة (دقيقة)', en: 'Duration (minutes)' },
    totalMarks: { ar: 'الدرجة الكلية', en: 'Total Marks' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    submitBtn: {
      ar: initialData ? 'حفظ التعديلات' : 'إضافة',
      en: initialData ? 'Save Changes' : 'Add',
    },
    note: {
      ar: 'بعد الإضافة، هتقدر تضيف أسئلة الامتحان من زرار "إدارة الأسئلة".',
      en: 'After adding, you can build the exam questions via "Manage Questions".',
    },
  };

  const handleOnSubmit = async (data: ExamFormData) => {
    const isSuccess = await onAdd(data);
    if (isSuccess) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleOnSubmit)} className="p-6 space-y-4" dir="rtl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.examTitle[language]}</label>
            <input type="text" {...register('title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-start" dir="rtl" />
            {errors.title && <p className="text-red-500 text-xs mt-1 text-start">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.subject[language]}</label>
            <input type="text" {...register('subject')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-start" dir="rtl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label={text.student[language]}
                value={watch('studentId')}
                onChange={(value) => setValue('studentId', value, { shouldValidate: true })}
                options={studentOptions}
              />
              {errors.studentId && <p className="text-red-500 text-xs mt-1 text-start">{errors.studentId.message}</p>}
            </div>

            <div>
              <CustomSelect
                label={text.teacher[language]}
                value={watch('teacherId')}
                onChange={(value) => setValue('teacherId', value, { shouldValidate: true })}
                options={teacherOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {errors.dueDate && <p className="text-red-500 text-xs mt-1 text-start">{errors.dueDate.message}</p>}
              <DatePickerField
                label={text.dueDate[language]}
                value={watch('dueDate')}
                onChange={(val) => setValue('dueDate', val, { shouldValidate: true })}
                error={errors.dueDate?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.duration[language]}</label>
              <input type="number" min="1" {...register('duration')} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-start" dir="rtl" />
              {errors.duration && <p className="text-red-500 text-xs mt-1 text-start">{errors.duration.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.totalMarks[language]}</label>
            <input type="number" min="1" {...register('totalMarks')} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-start" dir="rtl" />
          </div>

          {!initialData && (
            <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg p-3 text-start">{text.note[language]}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              {text.cancel[language]}
            </button>
            <button type="submit" className="flex-1 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium">
              {text.submitBtn[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
