import { X, Calendar, Tag, CreditCard, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Expense } from '../../lib/schemas/ExpenseSchema';

interface ViewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
}

export default function ViewExpenseModal({ isOpen, onClose, expense }: ViewExpenseModalProps) {
  const { language } = useLanguage();

  const text = {
    title: { ar: 'تفاصيل المصروف', en: 'Expense Details' },
    expenseTitle: { ar: 'عنوان المصروف', en: 'Expense Title' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    currency: { ar: 'العملة', en: 'Currency' },
    type: { ar: 'النوع', en: 'Type' },
    date: { ar: 'التاريخ', en: 'Date' },
    paymentMethod: { ar: 'طريقة الدفع', en: 'Payment Method' },
    status: { ar: 'الحالة', en: 'Status' },
    paid: { ar: 'مقبول', en: 'Paid' },
    pending: { ar: 'معلق', en: 'Pending' },
    failed: { ar: 'فاشل', en: 'Failed' },
    close: { ar: 'إغلاق', en: 'Close' },
    basicInfo: { ar: 'المعلومات الأساسية', en: 'Basic Information' },
    financialInfo: { ar: 'المعلومات المالية', en: 'Financial Information' },
    salary: { ar: 'رواتب', en: 'Salary' },
    amenities: { ar: 'مرافق', en: 'Amenities' },
    general: { ar: 'عام', en: 'General' },
    management: { ar: 'إدارة', en: 'Management' },
    marketing: { ar: 'تسويق', en: 'Marketing' },
    other: { ar: 'أخرى', en: 'Other' },
    notSpecified: { ar: 'غير محدد', en: 'Not Specified' }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{text.title[language]}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Status Badge */}
          <div className={`rounded-2xl p-4 flex items-center justify-center gap-3 border ${
            expense.status === 'paid'
              ? 'bg-green-50 border-green-100 text-green-700'
              : expense.status === 'pending'
              ? 'bg-yellow-50 border-yellow-100 text-yellow-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold text-lg">
              {text[expense.status as keyof typeof text]?.[language] || expense.status}
            </span>
          </div>

          {/* Financial Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
              <p className="text-sm font-semibold text-gray-500 mb-2">{text.amount[language]}</p>
              <div className="flex items-baseline justify-center gap-2">
                <p className="text-4xl font-black text-primary">{expense.amount.toLocaleString()}</p>
                <span className="text-sm font-bold text-gray-400 uppercase">{expense.currency?.code || 'USD'}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center flex flex-col justify-center">
              <p className="text-sm font-semibold text-gray-500 mb-2">{text.type[language]}</p>
              <p className="text-2xl font-bold text-gray-900">
                {text[expense.type as keyof typeof text]?.[language] || expense.type}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-900">{text.basicInfo[language]}</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">{text.expenseTitle[language]}</p>
                  <p className="text-lg font-bold text-gray-900">{expense.title}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-500">{text.date[language]}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(expense.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-500">{text.paymentMethod[language]}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {expense.payment_type || text.notSpecified[language]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
            >
              {text.close[language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
