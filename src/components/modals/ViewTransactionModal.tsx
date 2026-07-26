import { X, DollarSign, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Transaction } from '../../types/transaction';

interface ViewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export default function ViewTransactionModal({ isOpen, onClose, transaction }: ViewTransactionModalProps) {
  const { language } = useLanguage();

  const text = {
    title: { ar: 'تفاصيل المعاملة', en: 'Transaction Details' },
    type: { ar: 'النوع', en: 'Type' },
    income: { ar: 'إيراد', en: 'Income' },
    expense: { ar: 'مصروف', en: 'Expense' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    date: { ar: 'التاريخ', en: 'Date' },
    status: { ar: 'الحالة', en: 'Status' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    pending: { ar: 'معلق', en: 'Pending' },
    failed: { ar: 'فاشل', en: 'Failed' },
    reason: { ar: 'الوصف', en: 'Description' },
    convertedAmount: { ar: 'المبلغ المحوّل', en: 'Converted Amount' },
    close: { ar: 'إغلاق', en: 'Close' },
    credit: { ar: 'إيداع', en: 'Credit' },
    debit: { ar: 'سحب', en: 'Debit' },
    subscription: { ar: 'اشتراك', en: 'Subscription' },
  };

  const transactionCurrency = transaction.currencyCode || 'SAR';
  const amountToConvert = transaction.originalAmount || transaction.amount;
  const originalSymbol = transactionCurrency; // Use code as symbol if we don't have a map

  if (!isOpen) return null;

  const isIncome = transaction.type === 'credit' || transaction.type === 'subscription';

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'credit': return text.credit[language];
      case 'debit': return text.debit[language];
      case 'subscription': return text.subscription[language];
      case 'expense': return text.expense[language];
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return text.completed[language];
      case 'pending': return text.pending[language];
      case 'failed': return text.failed[language];
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`sticky top-0 px-6 py-5 flex items-center justify-between rounded-t-2xl ${isIncome ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'
          } text-white`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              {isIncome ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold">{text.title[language]}</h2>
              <p className="text-sm opacity-80">{getTransactionLabel(transaction.type)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className={`rounded-xl p-5 text-center ${isIncome ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
            <p className="text-sm text-gray-600 mb-2">{text.amount[language]}</p>
            <p className={`text-5xl font-bold ${isIncome ? 'text-green-600' : 'text-orange-600'}`}>
              {(transaction.originalAmount || transaction.amount).toFixed(2)} <span className="text-2xl">{originalSymbol}</span>
            </p>

            <span className={`inline-flex mt-3 px-3 py-1 rounded-full text-sm font-medium ${
              transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 
              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'
              }`}>
              {getStatusLabel(transaction.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{text.date[language]}</p>
              </div>
              <p className="font-semibold text-gray-900">{new Date(transaction.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{text.type[language]}</p>
              </div>
              <p className="font-semibold text-gray-900">{getTransactionLabel(transaction.type)}</p>
            </div>
          </div>

          {transaction.reason && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{text.reason[language]}</p>
              </div>
              <p className="text-gray-900">{transaction.reason}</p>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 font-medium transition-colors"
            >
              {text.close[language]}
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
