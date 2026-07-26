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
      name: '',
      color: '#4F46E5',
      ageRange: { minAge: 6, maxAge: 12 }
    }
  });

  const colorValue = watch('color');

  useEffect(() => {
    if (isOpen) {
      if (rank) {
        reset({
          name: rank.name,
          color: rank.color,
          ageRange: {
            minAge: rank.ageRange.minAge,
            maxAge: rank.ageRange.maxAge
          }
        });
      } else {
        reset({
          name: '',
          color: '#4F46E5',
          ageRange: { minAge: 6, maxAge: 12 }
        });
      }
    }
  }, [rank, isOpen, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: RankSchema) => {
    try {
      if (isUpdate && rank) {
        await updateRank.mutateAsync(data);
      } else {
        await createRank.mutateAsync(data);
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
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-indigo-600" />
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

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {language === 'ar' ? 'اسم الرتبة' : 'Rank Name'}
              </label>
              <input
                type="text"
                className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-start ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                placeholder={language === 'ar' ? 'مثل: البرونزي، الفضي...' : 'e.g. Bronze, Silver...'}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-500 font-bold px-2">{errors.name.message}</p>}
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
                  className={`flex-1 px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium uppercase ${errors.color ? 'ring-2 ring-red-500' : ''}`}
                  value={colorValue}
                  onChange={(e) => setValue('color', e.target.value)}
                />
              </div>
              {errors.color && <p className="text-xs text-red-500 font-bold px-2">{errors.color.message}</p>}
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
                  className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium ${errors.ageRange?.minAge ? 'ring-2 ring-red-500' : ''}`}
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
                  className={`w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium ${errors.ageRange?.maxAge ? 'ring-2 ring-red-500' : ''}`}
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
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
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
