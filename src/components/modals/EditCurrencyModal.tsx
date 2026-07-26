import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CurrencyFormData, getCurrencySchema } from '../../lib/schemas/CurrencySchema';
import { useForm } from 'react-hook-form';
import { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

interface EditCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    symbol: string;
    exchangeRate: number;
    isDefault: boolean;
  };
  onSave: (currency: any) => boolean | Promise<boolean>;
}

export default function EditCurrencyModal({ isOpen, onClose, currency, onSave }: EditCurrencyModalProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CurrencyFormData>({
    resolver: zodResolver(getCurrencySchema(t)) as Resolver<CurrencyFormData>,
    defaultValues: {
      name_ar: currency.nameAr,
      name_en: currency.nameEn,
      symbol: currency.symbol,
      code: currency.code,
      default: currency.isDefault,
      exchangeRate: currency.exchangeRate,
    }
  });

  const isDefault = watch('default');

  useEffect(() => {
    if (isOpen && currency) {
      reset({
        name_ar: currency.nameAr,
        name_en: currency.nameEn,
        symbol: currency.symbol,
        code: currency.code,
        default: currency.isDefault,
        exchangeRate: currency.exchangeRate,
      });
    }
  }, [isOpen, currency, reset]);

  const text = {
    title: { ar: 'تعديل العملة', en: 'Edit Currency' },
    code: { ar: 'رمز العملة (الرمز)', en: 'Currency Code' },
    codePlaceholder: { ar: 'USD, SAR, EGP', en: 'USD, SAR, EGP' },
    nameAr: { ar: 'اسم العملة', en: 'Currency Name' },
    nameArPlaceholder: { ar: 'الدولار الأمريكي', en: 'US Dollar' },
    symbol: { ar: 'الرمز المختصر', en: 'Symbol' },
    symbolPlaceholder: { ar: '$ أو ر.س', en: '$ or ر.س' },
    exchangeRate: { ar: 'سعر الصرف', en: 'Exchange Rate' },
    exchangeRateHint: { ar: 'مقابل العملة الافتراضية', en: 'Against default currency' },
    isDefault: { ar: 'جعل هذه العملة الافتراضية', en: 'Make this the default currency' },
    defaultWarning: { ar: 'تحويل هذه العملة لافتراضية سيعيد حساب جميع أسعار الصرف', en: 'Making this default will recalculate all exchange rates' },
    arabic: { ar: 'العربية', en: 'Arabic' },
    english: { ar: 'English', en: 'English' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: CurrencyFormData) => {
    const isSuccess = await onSave({
      id: currency.id,
      code: data.code.toUpperCase(),
      nameAr: data.name_ar,
      nameEn: data.name_en,
      symbol: data.symbol,
      exchangeRate: data.exchangeRate,
      isDefault: data.default
    });
    if (isSuccess) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.code[language]}
            </label>
            <input
              type="text"
              {...register('code')}
              placeholder={text.codePlaceholder[language]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start uppercase"
              maxLength={3}
            />
            {errors.code && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.code.message}</p>}
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('ar')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'ar'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {text.arabic[language]}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'en'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {text.english[language]}
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'ar' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                    {text.nameAr[language]}
                  </label>
                  <input
                    type="text"
                    {...register('name_ar')}
                    placeholder={text.nameArPlaceholder[language]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
                  />
                  {errors.name_ar && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.name_ar.message}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-end">
                    {text.nameAr[language]}
                  </label>
                  <input
                    type="text"
                    {...register('name_en')}
                    placeholder={text.nameArPlaceholder[language]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-end"
                  />
                  {errors.name_en && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.name_en.message}</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.symbol[language]}
            </label>
            <input
              type="text"
              {...register('symbol')}
              placeholder={text.symbolPlaceholder[language]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
              maxLength={5}
            />
            {errors.symbol && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.symbol.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.exchangeRate[language]}
            </label>
            <input
              type="number"
              step="0.0001"
              {...register('exchangeRate', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
              disabled={isDefault}
            />
            {errors.exchangeRate && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.exchangeRate.message}</p>}
            <p className="text-xs text-gray-500 mt-1 text-start">{text.exchangeRateHint[language]}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center justify-end gap-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">{text.isDefault[language]}</span>
              <input
                type="checkbox"
                {...register('default')}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
            {!currency.isDefault && isDefault && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 text-start">{text.defaultWarning[language]}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{text.save[language]}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
