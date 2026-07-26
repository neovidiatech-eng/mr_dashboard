import { X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { TransactionFormData, getTransactionSchema } from '../../lib/schemas/TransactionSchema';
import { Resolver, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionFormData & { id: string };
  onSave: (transaction: TransactionFormData & { id: string }) => boolean | Promise<boolean>;
  currencies: { code: string; symbol: string; rate: number }[];
}

export default function EditTransactionModal({ isOpen, onClose, transaction, onSave, currencies }: EditTransactionModalProps) {
  const { language, t } = useLanguage();

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(getTransactionSchema(t)) as Resolver<TransactionFormData>,
    defaultValues: transaction,
  });

  const transactionType = watch('type');
  const sessionCount = watch('sessionCount');
  const sessionDuration = watch('sessionDuration') || 60;
  const ratePerHour = watch('ratePerHour');

  useEffect(() => {
    if (isOpen && transaction) {
      reset(transaction);
    }
  }, [isOpen, transaction, reset]);

  const handleCalculate = () => {
    const sessions = Number(sessionCount) || 0;
    const duration = Number(sessionDuration) || 60;
    const rate = Number(ratePerHour) || 0;
    const calculated = sessions * (duration / 60) * rate;
    setValue('amount', Number(calculated.toFixed(2)));
  };

  const text = {
    title: { ar: 'تعديل المعاملة', en: 'Edit Transaction' },
    type: { ar: 'النوع', en: 'Type' },
    income: { ar: 'إيراد', en: 'Income' },
    teacher_expense: { ar: 'مصروف معلم', en: 'Teacher Expense' },
    student: { ar: 'اسم الطالب', en: 'Student Name' },
    teacher: { ar: 'اسم المعلم', en: 'Teacher Name' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    currency: { ar: 'العملة', en: 'Currency' },
    paymentMethod: { ar: 'طريقة الدفع', en: 'Payment Method' },
    date: { ar: 'التاريخ', en: 'Date' },
    status: { ar: 'الحالة', en: 'Status' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    pending: { ar: 'معلق', en: 'Pending' },
    notes: { ar: 'ملاحظات', en: 'Notes' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    sessionCount: { ar: 'عدد الحصص', en: 'Sessions' },
    sessionDuration: { ar: 'مدة الحصة', en: 'Duration (min)' },
    ratePerHour: { ar: 'سعر/ساعة', en: 'Rate/Hour' }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: TransactionFormData) => {
    const isSuccess = await onSave({
      ...data,
      id: transaction.id
    });
    if (isSuccess) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{text.title[language]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.type[language]}</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'income', label: text.income[language] },
                    { value: 'teacher_expense', label: text.teacher_expense[language] }
                  ]}
                />
              )}
            />
          </div>

          {transactionType === 'income' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.student[language]}</label>
              <input
                type="text"
                {...register('studentName')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start"
              />
              {errors.studentName && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.studentName.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.teacher[language]}</label>
            <input
              type="text"
              {...register('teacherName')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start"
            />
            {errors.teacherName && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.teacherName.message}</p>}
          </div>

          {transactionType === 'teacher_expense' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-start">{text.sessionCount[language]}</label>
                  <input
                    type="number"
                    {...register('sessionCount', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-start text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-start">{text.sessionDuration[language]}</label>
                  <Controller
                    name="sessionDuration"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        value={field.value}
                        onChange={(value) => field.onChange(parseInt(value as string))}
                        options={[
                          { value: 30, label: '30' },
                          { value: 45, label: '45' },
                          { value: 60, label: '60' },
                          { value: 90, label: '90' },
                          { value: 120, label: '120' }
                        ]}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-start">{text.ratePerHour[language]}</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('ratePerHour', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-start text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleCalculate}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                {language === 'ar' ? 'احسب المبلغ' : 'Calculate Amount'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.amount[language]}</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start"
              />
              {errors.amount && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.currency[language]}</label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={currencies.map(c => ({
                      value: c.code,
                      label: `${c.symbol} ${c.code}`
                    }))}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.paymentMethod[language]}</label>
              <input
                type="text"
                {...register('paymentMethod')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.status[language]}</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'pending', label: text.pending[language] },
                    { value: 'completed', label: text.completed[language] }
                  ]}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">{text.notes[language]}</label>
            <textarea
              {...register('notes')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-start resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              {text.cancel[language]}
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {text.save[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
