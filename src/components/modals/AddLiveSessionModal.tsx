import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Video, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { useCreateLiveSessions, useUpdateLiveSession } from '../../hooks/useLiveSessions';
import { useGetAllStages } from '../../features/admin/hooks/useStage';
import { usePlans } from '../../features/admin/hooks/usePlans';
import { getLiveSessionSchema, LiveSessionFormData } from '../../lib/schemas/LiveSessionSchema';
import { LiveSessions } from '../../types/liveSessions';

import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import CustomTimePicker from '../ui/CustomTime';
import { Input } from 'antd';

export interface AddLiveSessionProps {
  open: boolean;
  onClose: () => void;
  initialData?: LiveSessions | null;
}

export default function AddLiveSessionModal({ open, onClose, initialData }: AddLiveSessionProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const isEditMode = !!initialData;

  // 1. Data Fetching & Mutations
  const { data: stagesResponse, isLoading: isLoadingStages } = useGetAllStages();
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans();
  const { mutate: createSession, isPending: isCreating } = useCreateLiveSessions();
  const { mutate: updateSession, isPending: isUpdating } = useUpdateLiveSession();

  const isPending = isCreating || isUpdating;

  // 2. Form Setup
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LiveSessionFormData>({
    resolver: zodResolver(getLiveSessionSchema(t)),
    defaultValues: {
      title: '',
      stageId: '',
      planId: '',
      date: '',
      time: '',
      status: 'scheduled',
    },
  });

  // Reset/populate form when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        const startDateObj = dayjs(initialData.startAt);
        reset({
          title: initialData.title || initialData.roomName || '',
          stageId: initialData.stage?.id || '',
          planId: initialData.plan?.id || '',
          date: startDateObj.isValid() ? startDateObj.format('YYYY-MM-DD') : '',
          time: startDateObj.isValid() ? startDateObj.format('HH:mm') : '',
          status: (initialData.status as LiveSessionFormData['status']) || 'scheduled',
        });
      } else {
        reset({
          title: '',
          stageId: '',
          planId: '',
          date: '',
          time: '',
          status: 'scheduled',
        });
      }
    }
  }, [open, initialData, reset]);

  if (!open) return null;

  // 3. Dropdown Options
  const stageOptions = (stagesResponse?.data?.items || []).map((stage) => ({
    value: stage.id,
    label: language === 'ar' ? stage.name_ar : stage.name_en || stage.name_ar,
  }));

  const planOptions = plans.map((plan) => ({
    value: plan.id,
    label: plan.name,
  }));

  const statusOptions = [
    { value: 'scheduled', label: language === 'ar' ? 'مجدولة (Scheduled)' : 'Scheduled' },
    { value: 'live', label: language === 'ar' ? 'مباشر (Live)' : 'Live' },
    { value: 'completed', label: language === 'ar' ? 'مكتملة (Completed)' : 'Completed' },
    { value: 'cancelled', label: language === 'ar' ? 'ملغاة (Cancelled)' : 'Cancelled' },
  ];

  // 4. Form Submit
  const onSubmit = (formData: LiveSessionFormData) => {
    const combinedStartAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();

    if (isEditMode && initialData) {
      updateSession(
        {
          id: initialData.id,
          data: {
            title: formData.title,
            stageId: formData.stageId,
            planId: formData.planId,
            startAt: combinedStartAt,
            status: formData.status || initialData.status || 'Scheduled',
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createSession(
        {
          title: formData.title,
          stageId: formData.stageId,
          planId: formData.planId,
          startAt: combinedStartAt,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode
                  ? language === 'ar' ? 'تعديل الجلسة المباشرة' : 'Edit Live Session'
                  : language === 'ar' ? 'إضافة جلسة لايف جديدة' : 'Add New Live Session'}
              </h2>
              <p className="text-xs text-gray-500">
                {isEditMode
                  ? language === 'ar' ? 'تعديل تفاصيل الجلسة والحالة' : 'Update session details and status'
                  : language === 'ar' ? 'قم بتحديد المرحلة والخطة والموعد' : 'Select stage, plan and schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Title */}
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <div className="w-full flex flex-col gap-1 text-start">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'عنوان الجلسة' : 'Session Title'}
                </label>
                <Input
                  placeholder={language === 'ar' ? 'أدخل عنوان الجلسة' : 'Enter session title'}
                  value={field.value}
                  onChange={field.onChange}
                  status={errors.title ? 'error' : undefined}
                  className="h-[46px] rounded-lg"
                />
                {errors.title?.message && (
                  <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>
                )}
              </div>
            )}
          />

          {/* Stage Select */}
          <Controller
            name="stageId"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label={language === 'ar' ? 'المرحلة الدراسية' : 'Stage'}
                placeholder={language === 'ar' ? 'اختر المرحلة' : 'Select Stage'}
                options={stageOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                error={errors.stageId?.message}
                loading={isLoadingStages}
              />
            )}
          />

          {/* Plan Select */}
          <Controller
            name="planId"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label={language === 'ar' ? 'الخطة الدراسية' : 'Plan'}
                placeholder={language === 'ar' ? 'اختر الخطة' : 'Select Plan'}
                options={planOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                error={errors.planId?.message}
                loading={isLoadingPlans}
              />
            )}
          />

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  label={language === 'ar' ? 'تاريخ الجلسة' : 'Session Date'}
                  placeholder={language === 'ar' ? 'اختر التاريخ' : 'Select Date'}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date?.message}
                />
              )}
            />

            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <CustomTimePicker
                  label={language === 'ar' ? 'وقت البدء' : 'Start Time'}
                  placeholder={language === 'ar' ? 'اختر الوقت' : 'Select Time'}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.time?.message}
                />
              )}
            />
          </div>

          {/* Status Select (Shown in Edit Mode or Optional) */}
          {isEditMode && (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label={language === 'ar' ? 'حالة الجلسة' : 'Session Status'}
                  placeholder={language === 'ar' ? 'اختر الحالة' : 'Select Status'}
                  options={statusOptions}
                  value={field.value || 'Scheduled'}
                  onChange={field.onChange}
                  error={errors.status?.message}
                />
              )}
            />
          )}

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <span>
                  {isEditMode
                    ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...')
                    : (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...')}
                </span>
              ) : (
                <span>
                  {isEditMode
                    ? (language === 'ar' ? 'تحديث الجلسة' : 'Update Session')
                    : (language === 'ar' ? 'إنشاء الجلسة' : 'Create Session')}
                </span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

