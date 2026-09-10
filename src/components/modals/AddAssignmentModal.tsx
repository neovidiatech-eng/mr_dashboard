import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, ClipboardCheck, Upload, FileText, Trash2, Award, Download, Paperclip } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { AssignmentFormData, getAssignmentSchema } from '../../lib/schemas/AssignmentSchema';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetStudents, useCreateAssignment, useUpdateAssignment } from '../../hooks/useAssignment';
import { HomeworkItem, Attachment } from '../../types/assignment';
import { baseURL } from '../../consts';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: HomeworkItem | null;
}

const DEFAULT_FORM_VALUES: AssignmentFormData = {
  studentId: '',
  title_ar: '',
  title_en: '',
  description_ar: '',
  description_en: '',
  dueDate: '',
  status: 'pending',
  grade: '',
  feedback: '',
};

export default function AddAssignmentModal({ isOpen, onClose, initialData }: AddAssignmentModalProps) {
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);

  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudents();
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const studentsOptions = useMemo(() => {
    return (studentsData?.data?.studentsData || []).map((s: any) => ({
      value: s.id,
      label: s.user?.name ? `${s.user.name} (${s.user.email || ''})` : s.id,
    }));
  }, [studentsData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(getAssignmentSchema(t)) as Resolver<AssignmentFormData>,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const text = useMemo(() => ({
    title: initialData ? (language === 'ar' ? 'تعديل الواجب' : 'Edit Assignment') : (language === 'ar' ? 'إضافة واجب جديد' : 'Add New Assignment'),
    subtitle: initialData 
      ? (language === 'ar' ? 'تعديل بيانات الواجب والدرجة والملاحظات' : 'Update assignment details, grade and feedback')
      : (language === 'ar' ? 'أضف واجب جديد للطالب مع المرفقات' : 'Create a new assignment for a student with attachments'),
    student: language === 'ar' ? 'الطالب' : 'Student',
    titleAr: language === 'ar' ? 'عنوان الواجب (بالعربية)' : 'Assignment Title (Arabic)',
    titleEn: language === 'ar' ? 'عنوان الواجب (بالإنجليزية)' : 'Assignment Title (English)',
    descAr: language === 'ar' ? 'وصف الواجب (بالعربية)' : 'Assignment Description (Arabic)',
    descEn: language === 'ar' ? 'وصف الواجب (بالإنجليزية)' : 'Assignment Description (English)',
    dueDate: language === 'ar' ? 'تاريخ التسليم' : 'Due Date',
    status: language === 'ar' ? 'الحالة' : 'Status',
    grade: language === 'ar' ? 'الدرجة' : 'Grade',
    gradePlaceholder: language === 'ar' ? 'أدخل الدرجة (مثال: 95)' : 'Enter grade (e.g. 95)',
    feedback: language === 'ar' ? 'ملاحظات المعلم / التقييم' : 'Teacher Feedback',
    feedbackPlaceholder: language === 'ar' ? 'أدخل ملاحظات للطالب...' : 'Enter feedback for student...',
    pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
    submitted: language === 'ar' ? 'تم التسليم' : 'Submitted',
    graded: language === 'ar' ? 'تم التصحيح' : 'Graded',
    completed: language === 'ar' ? 'مكتمل' : 'Completed',
    attachments: language === 'ar' ? 'المرفقات والملفات' : 'Attachments & Files',
    uploadPrompt: language === 'ar' ? 'اسحب الملفات هنا أو اضغط للاختيار' : 'Drag files here or click to browse',
    supportsFiles: language === 'ar' ? 'يدعم جميع أنواع الملفات (PDF, Word, صور, إلخ)' : 'Supports all file formats (PDF, Word, Images, etc.)',
    currentAttachments: language === 'ar' ? 'الملفات المرفقة الحالية:' : 'Current Attachments:',
    selectedFilesToUpload: language === 'ar' ? 'الملفات المحددة للرفع:' : 'Files to upload:',
    download: language === 'ar' ? 'تحميل' : 'Download',
    removeFile: language === 'ar' ? 'حذف' : 'Remove',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    submit: initialData ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إنشاء الواجب' : 'Create Assignment'),
    loading: language === 'ar' ? 'جاري الحفظ...' : 'Saving...',
    loadingData: language === 'ar' ? 'جاري التحميل...' : 'Loading...',
  }), [initialData, language]);

  const statusOptions = useMemo(() => [
    { value: 'pending', label: text.pending },
    { value: 'submitted', label: text.submitted },
    { value: 'graded', label: text.graded },
    { value: 'completed', label: text.completed },
  ], [text]);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedFiles([]);
    if (initialData) {
      reset({
        studentId: initialData.studentId || initialData.student?.id || '',
        title_ar: initialData.title_ar || initialData.title || '',
        title_en: initialData.title_en || initialData.title || '',
        description_ar: initialData.description_ar || initialData.description || '',
        description_en: initialData.description_en || initialData.description || '',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        status: (initialData.status as any) || 'pending',
        grade: initialData.grade !== null && initialData.grade !== undefined ? initialData.grade : '',
        feedback: initialData.feedback || '',
      });
      setExistingAttachments(initialData.attachments || []);
    } else {
      reset(DEFAULT_FORM_VALUES);
      setExistingAttachments([]);
    }
  }, [initialData, reset, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOnSubmit = (data: AssignmentFormData) => {
    const formattedDueDate = data.dueDate
      ? data.dueDate.includes('T')
        ? data.dueDate
        : new Date(data.dueDate).toISOString()
      : '';

    if (initialData) {
      const payload: any = {
        studentId: data.studentId,
        title_ar: data.title_ar,
        title_en: data.title_en,
        description_ar: data.description_ar,
        description_en: data.description_en,
        dueDate: formattedDueDate,
        status: data.status,
        grade: data.grade !== '' && data.grade !== undefined && data.grade !== null ? Number(data.grade) : null,
        feedback: data.feedback || '',
      };

      updateMutation.mutate(
        { id: initialData.id, ...payload },
        { onSuccess: onClose }
      );
    } else {
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('studentId', data.studentId);
        formData.append('title_ar', data.title_ar);
        formData.append('title_en', data.title_en);
        formData.append('description_ar', data.description_ar);
        formData.append('description_en', data.description_en);
        formData.append('dueDate', formattedDueDate);

        selectedFiles.forEach((file) => {
          formData.append('attachments', file);
        });

        createMutation.mutate(formData, { onSuccess: onClose });
      } else {
        const payload = {
          studentId: data.studentId,
          title_ar: data.title_ar,
          title_en: data.title_en,
          description_ar: data.description_ar,
          description_en: data.description_en,
          dueDate: formattedDueDate,
        };

        createMutation.mutate(payload, { onSuccess: onClose });
      }
    }
  };

  if (!isOpen) return null;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 !mt-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans transition-all duration-300">
      <div 
        className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
              <ClipboardCheck className="w-6 h-6 text-[#800020]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{text.title}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">{text.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto max-h-[calc(92vh-80px)] p-8 custom-scrollbar">
          <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-6">
            
            {/* Student Selection (Full Width) */}
            <div className="text-start">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {text.student} <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={watch('studentId')}
                onChange={(val) => setValue('studentId', val, { shouldValidate: true })}
                options={studentsOptions}
                disabled={isLoadingStudents}
                placeholder={isLoadingStudents ? text.loadingData : text.student}
                className="rounded-2xl border-none bg-gray-50"
              />
              {errors.studentId && (
                <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.studentId.message}</p>
              )}
            </div>

            {/* Arabic & English Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Arabic Title */}
              <div className="text-start">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {text.titleAr} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  {...register('title_ar')}
                  placeholder="أدخل عنوان الواجب بالعربية"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${
                    errors.title_ar ? 'ring-red-500/20 border-red-200' : 'ring-transparent'
                  } focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.title_ar && (
                  <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.title_ar.message}</p>
                )}
              </div>

              {/* English Title */}
              <div className="text-start">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {text.titleEn} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  {...register('title_en')}
                  placeholder="Enter assignment title in English"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${
                    errors.title_en ? 'ring-red-500/20 border-red-200' : 'ring-transparent'
                  } focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.title_en && (
                  <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.title_en.message}</p>
                )}
              </div>
            </div>

            {/* Arabic & English Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Arabic Description */}
              <div className="text-start">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {text.descAr} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  {...register('description_ar')}
                  placeholder="أدخل وصف الواجب والتعليمات بالعربية"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${
                    errors.description_ar ? 'ring-red-500/20 border-red-200' : 'ring-transparent'
                  } focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 resize-none`}
                />
                {errors.description_ar && (
                  <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.description_ar.message}</p>
                )}
              </div>

              {/* English Description */}
              <div className="text-start">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {text.descEn} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  dir="ltr"
                  {...register('description_en')}
                  placeholder="Enter assignment description and instructions"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${
                    errors.description_en ? 'ring-red-500/20 border-red-200' : 'ring-transparent'
                  } focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 resize-none`}
                />
                {errors.description_en && (
                  <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.description_en.message}</p>
                )}
              </div>
            </div>

            {/* Due Date (Full Width) */}
            <div className="text-start w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {text.dueDate} <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <DatePickerField
                  value={watch('dueDate')}
                  onChange={(val) => setValue('dueDate', val, { shouldValidate: true })}
                  className="w-full rounded-2xl border-none bg-gray-50"
                />
              </div>
              {errors.dueDate && (
                <p className="text-[10px] text-red-500 mt-1.5 font-bold">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Status (In Edit Mode) */}
            {initialData && (
              <div className="text-start w-full">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {text.status}
                </label>
                <CustomSelect
                  value={watch('status')}
                  onChange={(val) => setValue('status', val as any, { shouldValidate: true })}
                  options={statusOptions}
                  className="rounded-2xl border-none bg-gray-50"
                />
              </div>
            )}

            {/* Grade & Feedback Section (In Edit Mode) */}
            {initialData && (
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100/70 space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{language === 'ar' ? 'التقييم والدرجات' : 'Grading & Evaluation'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Grade */}
                  <div className="text-start md:col-span-1">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                      {text.grade}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      {...register('grade')}
                      placeholder={text.gradePlaceholder}
                      className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-indigo-300 rounded-2xl text-sm font-bold text-gray-800 outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all placeholder:text-gray-400"
                    />
                  </div>

                  {/* Feedback */}
                  <div className="text-start md:col-span-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                      {text.feedback}
                    </label>
                    <input
                      type="text"
                      {...register('feedback')}
                      placeholder={text.feedbackPlaceholder}
                      className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-indigo-300 rounded-2xl text-sm font-bold text-gray-800 outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Existing Attachments Display (In Edit Mode only - Read Only) */}
            {initialData && existingAttachments && existingAttachments.length > 0 && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <Paperclip className="w-3.5 h-3.5" />
                  {text.currentAttachments}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {existingAttachments.map((att, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 truncate">
                          {att.name}
                        </span>
                      </div>
                      <a
                        href={`${baseURL}/${att.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                        title={text.download}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments Upload Section (Create Mode ONLY) */}
            {!initialData && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <Paperclip className="w-3.5 h-3.5" />
                  {text.attachments}
                </label>

                {/* Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-200 hover:border-indigo-300 bg-gray-50/50 hover:bg-indigo-50/20 rounded-[22px] p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 text-gray-400 group-hover:text-indigo-600 group-hover:scale-105 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 mb-1 text-center">
                    {text.uploadPrompt}
                  </p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">
                    {text.supportsFiles}
                  </p>
                </div>

                {/* Newly Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <span className="text-xs font-semibold text-indigo-600 block">
                      {text.selectedFilesToUpload}
                    </span>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100 animate-in fade-in duration-200"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-800 truncate">{file.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSelectedFile(index);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                            title={text.removeFile}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100 bg-white/80 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all disabled:opacity-50"
              >
                {text.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? text.loading : text.submit}
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
