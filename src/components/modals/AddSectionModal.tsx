import { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';
import { Layers, Globe, Type } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCreateSection, useUpdateSection } from '../../hooks/useSections';
import { Section } from '../../types/courses';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  section?: Section | null;
}

export default function AddSectionModal({
  isOpen,
  onClose,
  courseId,
  section,
}: AddSectionModalProps) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const { mutate: createSection, isPending: isCreating } = useCreateSection();
  const { mutate: updateSection, isPending: isUpdating } = useUpdateSection();
  const isPending = isCreating || isUpdating;
  const isEditMode = !!section;

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (section) {
        setNameAr(section.name_ar || section.name || '');
        setNameEn(section.name_en || section.name || '');
      } else {
        setNameAr('');
        setNameEn('');
      }
    }
  }, [isOpen, section]);

  const handleSubmit = () => {
    if (!nameAr.trim() && !nameEn.trim()) {
      return;
    }

    const payload: any = {
      name_ar: nameAr.trim(),
      name_en: nameEn.trim() || nameAr.trim(),
      course_id: courseId,
    };

    if (isEditMode && section) {
      updateSection(
        { id: section.id, data: payload, courseId },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createSection(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isEditMode
                ? isAr
                  ? 'تعديل السكشن'
                  : 'Edit Section'
                : isAr
                ? 'إضافة سكشن جديد'
                : 'Add New Section'}
            </h3>
            <p className="text-xs font-medium text-gray-400">
              {isAr
                ? 'إدخال اسم السكشن لتنظيم المحاضرات والكويزات'
                : 'Enter section name to organize lectures and quizzes'}
            </p>
          </div>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      className="premium-modal"
    >
      <div className="mt-5 space-y-4 text-start" dir={isAr ? 'rtl' : 'ltr'}>
        <div>
          <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
            <Globe size={14} className="text-primary" />
            {isAr ? 'اسم السكشن (بالعربي) *' : 'Section Name (Arabic) *'}
          </label>
          <Input
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder={isAr ? 'مثال: السكشن الأول - الأساسيات' : 'e.g. Section 1 - Fundamentals'}
            className="h-11 rounded-xl text-sm border-gray-200"
          />
        </div>

        <div>
          <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
            <Type size={14} className="text-primary" />
            {isAr ? 'اسم السكشن (بالإنجليزي)' : 'Section Name (English)'}
          </label>
          <Input
            dir="ltr"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Section 1 - Fundamentals"
            className="h-11 rounded-xl text-sm border-gray-200"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button
            onClick={onClose}
            className="h-11 px-6 rounded-xl font-bold text-gray-600 border-gray-200"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isPending}
            className="h-11 px-8 rounded-xl font-bold bg-primary hover:!bg-primary-dark border-none shadow-lg shadow-primary/20"
          >
            {isEditMode ? (isAr ? 'تعديل السكشن' : 'Update Section') : (isAr ? 'إنشاء السكشن' : 'Create Section')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
