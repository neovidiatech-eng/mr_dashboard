import { X, Trophy, Palette, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
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

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RankSchema>({
    resolver: zodResolver(rankSchema),
    defaultValues: {
      name_ar: '',
      name_en: '',
      color: '#800020',
      ageRange: { minAge: 6, maxAge: 12 },
      stageName_ar: '',
      stageName_en: '',
    }
  });

  const colorValue = watch('color');

  useEffect(() => {
    if (isOpen) {
      if (rank) {
        reset({
          name_ar: rank.name_ar || rank.name || '',
          name_en: rank.name_en || '',
          color: rank.color,
          ageRange: {
            minAge: rank.ageRange.minAge,
            maxAge: rank.ageRange.maxAge
          },
          stageName_ar: rank.stageName_ar || rank.stageName || '',
          stageName_en: rank.stageName_en || '',
        });
      } else {
        reset({
          name_ar: '',
          name_en: '',
          color: '#800020',
          ageRange: { minAge: 6, maxAge: 12 },
          stageName_ar: '',
          stageName_en: '',
        });
      }
    }
  }, [rank, isOpen, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: RankSchema) => {
    const payload = {
      ...data,
      name: data.name_ar,
      stageName: data.stageName_ar,
    };
    try {
      if (isUpdate && rank) {
        await updateRank.mutateAsync(payload as any);
      } else {
        await createRank.mutateAsync(payload as any);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save rank:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] !mt-0 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isUpdate ? (language === 'ar' ? 'تحديث الرتبة' : 'Update Rank') : (language === 'ar' ? 'إضافة رتبة جديدة' : 'Add New Rank')}
                </h2>
                <p className="text-sm text-gray-400 font-medium">
                  {language === 'ar' ? 'أدخل تفاصيل الرتبة الأكاديمية' : 'Enter the academic rank details'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Name Input (Dual-language) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {language === 'ar' ? 'اسم الرتبة (عربي) *' : 'Rank Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-start ${errors.name_ar ? 'ring-2 ring-red-500' : ''}`}
                  placeholder="مثل: الذهبي"
                  {...register('name_ar')}
                />
                {errors.name_ar && <p className="text-xs text-red-500 font-bold px-2">{errors.name_ar.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {language === 'ar' ? 'اسم الرتبة (إنجليزي)' : 'Rank Name (English)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-start"
                  placeholder="e.g. Gold"
                  {...register('name_en')}
                />
              </div>
            </div>

            {/* Color Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {language === 'ar' ? 'لون الرتبة' : 'Rank Color'}
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

            {/* Stage Name Input (Dual language) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {language === 'ar' ? 'المرحلة (عربي)' : 'Stage (Arabic)'}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-start"
                  placeholder="الصف الأول الثانوي"
                  {...register('stageName_ar')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {language === 'ar' ? 'المرحلة (إنجليزي)' : 'Stage (English)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-start"
                  placeholder="Grade 10"
                  {...register('stageName_en')}
                />
              </div>
            </div>

            {/* Age Range Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {language === 'ar' ? 'الحد الأدنى للسن' : 'Min Age'}
                </label>
                <input
                  type="number"
                  className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium ${errors.ageRange?.minAge ? 'ring-2 ring-red-500' : ''}`}
                  {...register('ageRange.minAge', { valueAsNumber: true })}
                />
                {errors.ageRange?.minAge && <p className="text-xs text-red-500 font-bold px-2">{errors.ageRange.minAge.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {language === 'ar' ? 'الحد الأقصى للسن' : 'Max Age'}
                </label>
                <input
                  type="number"
                  className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium ${errors.ageRange?.maxAge ? 'ring-2 ring-red-500' : ''}`}
                  {...register('ageRange.maxAge', { valueAsNumber: true })}
                />
                {errors.ageRange?.maxAge && <p className="text-xs text-red-500 font-bold px-2">{errors.ageRange.maxAge.message}</p>}
              </div>
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
