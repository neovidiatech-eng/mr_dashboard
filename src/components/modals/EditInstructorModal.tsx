import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Loader2 } from 'lucide-react';
import { Schedule } from '../../types/scheduales';
import { useTeacher } from '../../features/admin/hooks/useTeacher';
import { useUpdateInstructorForSchedule } from '../../features/admin/hooks/useSchedules';

interface EditInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Schedule;
}

export default function EditInstructorModal({
  isOpen,
  onClose,
  session,
}: EditInstructorModalProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    session.teacher?.id || ''
  );

  const { data: instructors, isLoading: isLoadingTeachers } = useTeacher({
    search: '',
    page: 1,
    limit: 1000,
  });

  const { mutate: updateInstructor, isPending } =
    useUpdateInstructorForSchedule();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || selectedTeacherId === session.teacher?.id) {
      onClose();
      return;
    }
    updateInstructor(
      { id: session.id, teacherId: selectedTeacherId },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'تعديل المعلم' : 'Edit Instructor'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <form id="edit-instructor-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'اختر المعلم الجديد' : 'Select New Instructor'}
              </label>
              
              <div className="relative">
                {isLoadingTeachers ? (
                  <div className="flex items-center justify-center py-4 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <select
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      {language === 'ar' ? 'اختر معلماً...' : 'Select an instructor...'}
                    </option>
                    {instructors?.teachers?.map((teacher: any) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.user?.name || teacher.name} {teacher.id === session.teacher?.id ? (language === 'ar' ? '(الحالي)' : '(Current)') : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="edit-instructor-form"
            disabled={isPending || isLoadingTeachers || !selectedTeacherId || selectedTeacherId === session.teacher?.id}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
