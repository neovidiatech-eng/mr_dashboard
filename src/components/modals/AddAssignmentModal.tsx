import { useEffect } from 'react';
import { X, ClipboardCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { AssignmentFormData, getAssignmentSchema } from '../../lib/schemas/AssignmentSchema';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetStudents, useCreateAssignment, useUpdateAssignment } from '../../hooks/useAssignment';
import { HomeworkItem } from '../../types/assignment';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: HomeworkItem | null;
}

export default function AddAssignmentModal({ isOpen, onClose, initialData }: AddAssignmentModalProps) {
  const { language, t } = useLanguage();

  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudents();

  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const studentsOptions = (studentsData?.data?.studentsData || []).map((s: any) => ({
    value: s.id,
    label: s.user?.name || s.id
  }));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(getAssignmentSchema(t)) as Resolver<AssignmentFormData>,
    defaultValues: {
      status: 'pending',
    },
  });

  const text = {
    title: { ar: initialData ? 'تعديل الواجب' : 'إضافة واجب جديد', en: initialData ? 'Edit Assignment' : 'Add New Assignment' },
    subtitle: { ar: initialData ? 'تعديل بيانات الواجب' : 'أضف واجب جديد للطالب', en: initialData ? 'Update assignment details' : 'Create a new assignment for a student' },
    student: { ar: 'اختر الطالب', en: 'Select Student' },
    assignmentTitle: { ar: 'العنوان', en: 'Title' },
    description: { ar: 'الوصف', en: 'Description' },
    dueDate: { ar: 'تاريخ التسليم', en: 'Due Date' },
    status: { ar: 'الحالة', en: 'Status' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    submitted: { ar: 'تم التسليم', en: 'Submitted' },
    graded: { ar: 'تم التصحيح', en: 'Graded' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    submit: { ar: initialData ? 'تعديل' : 'إضافة', en: initialData ? 'Update' : 'Add' },
    loading: { ar: 'جاري التحميل...', en: 'Loading...' }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          studentId: initialData.student?.id || '',
          title: initialData.title || '',
          description: initialData.description || '',
          dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
          status: (initialData.status as any) || 'pending',
        });
      } else {
        reset({
          studentId: '',
          title: '',
          description: '',
          dueDate: '',
          status: 'pending',
        });
      }
    }
  }, [initialData, reset, isOpen]);

  const handleOnSubmit = (data: AssignmentFormData) => {
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, ...data } as any, {
        onSuccess: () => {
          onClose();
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'pending', label: text.pending[language] },
    { value: 'submitted', label: text.submitted[language] },
    { value: 'graded', label: text.graded[language] }
  ];

  return (
    <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans transition-all duration-300">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-100 duration-300">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-[#6366f1]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{text.title[language]}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">{text.subtitle[language]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto max-h-[calc(92vh-80px)] p-8 custom-scrollbar">
          <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-6">
            {/* Student Select */}
            <div className="text-start">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {text.student[language]} *
              </label>
              <CustomSelect
                value={watch('studentId')}
                onChange={(val) => setValue('studentId', val, { shouldValidate: true })}
                options={studentsOptions}
                disabled={isLoadingStudents}
                placeholder={isLoadingStudents ? text.loading[language] : text.student[language]}
                className="rounded-2xl border-none bg-gray-50"
              />
              {errors.studentId && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.studentId.message}</p>}
            </div>

            {/* Title */}
            <div className="text-start">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {text.assignmentTitle[language]} *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder={language === 'ar' ? 'أدخل عنوان الواجب' : 'Enter assignment title'}
                className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.title ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
              />
              {errors.title && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="text-start">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {text.description[language]} *
              </label>
              <textarea
                rows={3}
                {...register('description')}
                placeholder={language === 'ar' ? 'أدخل وصف الواجب' : 'Enter assignment description'}
                className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.description ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 resize-none`}
              />
              {errors.description && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.description.message}</p>}
            </div>

            {/* Due Date + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {text.dueDate[language]} *
                </label>
                <DatePickerField
                  value={watch('dueDate')}
                  onChange={(val) => setValue('dueDate', val, { shouldValidate: true })}
                  className="rounded-2xl border-none bg-gray-50"
                />
                {errors.dueDate && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.dueDate.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {text.status[language]}
                </label>
                <CustomSelect
                  value={watch('status')}
                  onChange={(val) => setValue('status', val as 'pending' | 'submitted' | 'graded', { shouldValidate: true })}
                  options={statusOptions}
                  className="rounded-2xl border-none bg-gray-50"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100 bg-white/80 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all disabled:opacity-50"
              >
                {text.cancel[language]}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) ? text.loading[language] : text.submit[language]}
              </button>
            </div>
          </form>
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
