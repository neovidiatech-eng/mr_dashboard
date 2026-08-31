import { X, Trophy, Palette, Image as ImageIcon, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { RankItem } from '../../../types/rank';
import { useCreateRank, useUpdateRank } from '../hooks/useRank';
import { useForm } from 'react-hook-form';
import { rankSchema, RankSchema } from '../../../lib/schemas/RankSchema';
import { zodResolver } from '@hookform/resolvers/zod';

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank?: RankItem | null;
}

export default function RankModal({ isOpen, onClose, rank }: RankModalProps) {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const isUpdate = !!rank;

  const createRank = useCreateRank();
  const updateRank = useUpdateRank(rank?.id || ''); 

  const [iconFile, setIconFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RankSchema>({
    resolver: zodResolver(rankSchema),
    defaultValues: {
      name_ar: '',
      name_en: '',
      color: '#C0C0C0',
   
    }
  });

  const colorValue = watch('color');

  useEffect(() => {
    if (isOpen) {
      if (rank) {
        reset({
          name_ar: rank.name_ar || rank.name || '',
          name_en: rank.name_en || rank.slug||'',
          color: rank.color || '#C0C0C0',
        });
      } else {
        reset({
          name_ar: '',
          name_en: '',
          color: '#C0C0C0',
        });
        setIconFile(null);
      }
    }
  }, [rank, isOpen, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: RankSchema) => {
    try {
      const payload: any = {
        name_ar: data.name_ar,
        name_en: data.name_en,
        color: data.color,
      };
      if (iconFile) payload.icon = iconFile;

      if (isUpdate && rank) {
        await updateRank.mutateAsync(payload);
      } else {
        await createRank.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save rank:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] !mt-0 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isUpdate ? (language === 'ar' ? 'تعديل المرحلة الدراسية' : 'Update Academic Level') : (language === 'ar' ? 'إضافة مرحلة دراسية جديدة' : 'Add New Academic Level')}
                </h2>
                <p className="text-sm text-gray-400 font-medium">
                  {language === 'ar' ? 'أدخل تفاصيل المرحلة الدراسية' : 'Enter the academic level details'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Arabic Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {language === 'ar' ? 'المرحلة الدراسية (بالعربية)' : 'Academic Level (Arabic)'}
              </label>
              <input
                type="text"
                dir="rtl"
                className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-start ${errors.name_ar ? 'ring-2 ring-red-500' : ''}`}
                placeholder="مثل: المرحلة الثانوية"
                {...register('name_ar')}
              />
              {errors.name_ar && <p className="text-xs text-red-500 font-bold px-2">{errors.name_ar.message}</p>}
            </div>

            {/* English Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {language === 'ar' ? 'المرحلة الدراسية (بالإنجليزية)' : 'Academic Level (English)'}
              </label>
              <input
                type="text"
                dir="ltr"
                className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-start ${errors.name_en ? 'ring-2 ring-red-500' : ''}`}
                placeholder="e.g. High School"
                {...register('name_en')}
              />
              {errors.name_en && <p className="text-xs text-red-500 font-bold px-2">{errors.name_en.message}</p>}
            </div>

            {/* Color Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {language === 'ar' ? 'لون المرحلة الدراسية' : 'Level Color'}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  className="w-14 h-14 rounded-2xl border-none cursor-pointer p-1 bg-gray-50"
                  value={colorValue}
                  onChange={(e) => setValue('color', e.target.value)}
                />
                <input
                  type="text"
                  className={`flex-1 px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium uppercase ${errors.color ? 'ring-2 ring-red-500' : ''}`}
                  value={colorValue}
                  onChange={(e) => setValue('color', e.target.value)}
                />
              </div>
              {errors.color && <p className="text-xs text-red-500 font-bold px-2">{errors.color.message}</p>}
            </div>

            {/* Arabic Stage Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {language === 'ar' ? 'السنة الدراسية (بالعربية)' : 'Academic Year (Arabic)'}
              </label>
              <input
                type="text"
                dir="rtl"
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-start"
                placeholder="مثل: الصف الأول الثانوي"
                {...register('name_ar')}
              />
            </div>

            {/* Academic Year (English) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {language === 'ar' ? 'السنة الدراسية (بالإنجليزية)' : 'Academic Year (English)'}
              </label>
              <input
                type="text"
                dir="ltr"
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-start"
                placeholder="e.g. Grade 10"
                {...register('name_en')}
              />
            </div>

            {/* Icon Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {language === 'ar' ? 'أيقونة المستوى (اختياري)' : 'Level Icon (optional)'}
              </label>
              <input
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
              />
              {iconFile && (
                <p className="text-xs text-primary font-bold px-2">{iconFile.name}</p>
              )}
            </div>


            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={createRank.isPending || updateRank.isPending}
                className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {createRank.isPending || updateRank.isPending 
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (isUpdate ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'حفظ' : 'Save'))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
