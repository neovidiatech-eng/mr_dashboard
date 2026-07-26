import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ExpenseFormData, getExpenseSchema } from '../../lib/schemas/ExpenseSchema';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseFormData & { id: string };
  onSave: (expense: ExpenseFormData & { id: string }) => boolean | Promise<boolean>;
  currencies: { id: string; code: string; symbol: string }[];
}

export default function EditExpenseModal({ isOpen, onClose, expense, onSave, currencies }: EditExpenseModalProps) {
  const { language, t } = useLanguage();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(getExpenseSchema(t)) as Resolver<ExpenseFormData>,
    defaultValues: expense,
  });

  useEffect(() => {
    if (isOpen && expense) {
      reset(expense);
    }
  }, [isOpen, expense, reset]);

  const text = {
    title: { ar: 'تعديل المصروف', en: 'Edit Expense' },
    description: { ar: 'الوصف', en: 'Description' },
    descriptionPlaceholder: { ar: 'أدخل الوصف', en: 'Enter description' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    currency: { ar: 'العملة', en: 'Currency' },
    category: { ar: 'الفئة', en: 'Category' },
    date: { ar: 'التاريخ', en: 'Date' },
    paymentMethod: { ar: 'طريقة الدفع', en: 'Payment Method' },
    paymentMethodPlaceholder: { ar: 'أدخل طريقة الدفع', en: 'Enter payment method' },
    status: { ar: 'الحالة', en: 'Status' },
    paid: { ar: 'مقبول', en: 'Paid' },
    pending: { ar: 'معلق', en: 'Pending' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    salaries: { ar: 'رواتب', en: 'Salaries' },
    utilities: { ar: 'مرافق', en: 'Utilities' },
    supplies: { ar: 'لوازم', en: 'Supplies' },
    marketing: { ar: 'تسويق', en: 'Marketing' },
    general: { ar: 'عام', en: 'General' },
    administrative: { ar: 'إدارية', en: 'Administrative' },
    other: { ar: 'أخرى', en: 'Other' }
  };

  const categories = [
    { id: 'salary', label: text.salaries },
    { id: 'amenities', label: text.utilities },
    { id: 'general', label: text.general },
    { id: 'management', label: text.administrative },
    { id: 'marketing', label: text.marketing },
    { id: 'other', label: text.other }
  ];

  if (!isOpen) return null;

  const onSubmit = async (data: ExpenseFormData) => {
    const isSuccess = await onSave({
      ...data,
      id: expense.id
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
              {text.description[language]}
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder={text.descriptionPlaceholder[language]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
            />
            {errors.title && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.category[language]}
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={categories.map(cat => ({
                      value: cat.id,
                      label: cat.label[language]
                    }))}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.currency[language]}
              </label>
              <Controller
                name="currencyId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={currencies.map(curr => ({
                      value: curr.id,
                      label: curr.symbol
                    }))}
                  />
                )}
              />
              {errors.currencyId && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.currencyId.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.amount[language]}
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
            />
            {errors.amount && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.amount.message}</p>}
          </div>

          <div>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  label={`${text.date[language]}`}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.date && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.paymentMethod[language]}
            </label>
            <input
              type="text"
              {...register('payment_type')}
              placeholder={text.paymentMethodPlaceholder[language]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
            />
            {errors.payment_type && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.payment_type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.status[language]}
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'pending', label: text.pending[language] },
                    { value: 'paid', label: text.paid[language] }
                  ]}
                />
              )}
            />
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
