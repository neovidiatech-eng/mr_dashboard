
import { useState, useMemo } from "react";import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Eye,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { useLanguage } from "../../../contexts/LanguageContext";
import ViewTransactionModal from "../../../components/modals/ViewTransactionModal";
import { useTransactions } from "../hooks/useTransaction";
import { Transaction, TransactionType } from "../../../types/transaction";
import Pagination from "../../../components/ui/Pagination";

export default function Transactions() {
  const { language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");



  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: response, isLoading, error } = useTransactions(page, limit);

  const transactions = response?.data?.transactions || [];
  const pagination = response?.data?.pagination;

  const text = {
    title: { ar: "المعاملات المالية", en: "Financial Transactions" },
    search: { ar: "بحث في المعاملات...", en: "Search transactions..." },
    totalRevenue: { ar: "إجمالي الإيرادات", en: "Total Revenue" },
    totalExpenses: { ar: "إجمالي المصاريف", en: "Total Expenses" },
    netProfit: { ar: "صافي الربح", en: "Net Profit" },
    pendingTransactions: {
      ar: "المعاملات المعلقة",
      en: "Pending Transactions",
    },
    completedTransactions: {
      ar: "المعاملات المكتملة",
      en: "Completed Transactions",
    },
    type: { ar: "النوع", en: "Type" },
    amount: { ar: "المبلغ", en: "Amount" },
    date: { ar: "التاريخ", en: "Date" },
    status: { ar: "الحالة", en: "Status" },
    actions: { ar: "الإجراءات", en: "Actions" },

    completed: { ar: "مكتمل", en: "Completed" },
    pending: { ar: "معلق", en: "Pending" },
    failed: { ar: "فاشل", en: "Failed" },

    credit: { ar: "إيداع", en: "Credit" },
    debit: { ar: "سحب", en: "Debit" },
    subscription: { ar: "اشتراك", en: "Subscription" },
    expense: { ar: "مصروفات", en: "Expense" },

    allStatuses: { ar: "كل الحالات", en: "All Statuses" },
    allTypes: { ar: "كل الأنواع", en: "All Types" },

    noTransactions: {
      ar: "لا توجد معاملات",
      en: "No transactions found",
    },

    loading: { ar: "جاري التحميل...", en: "Loading..." },
    error: { ar: "حدث خطأ أثناء تحميل البيانات", en: "Error loading data" },
  };

  const getTransactionLabel = (type: TransactionType) => {
    switch (type) {
      case "credit":
        return text.credit[language];

      case "debit":
        return text.debit[language];

      case "subscription":
        return text.subscription[language];

      case "expense":
        return text.expense[language];

      default:
        return type;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [transactions, searchQuery]);

  const stats = useMemo(() => {
    const incomeTypes: TransactionType[] = ["credit", "subscription"];
    const expenseTypes: TransactionType[] = ["debit", "expense"];

    const totalIncome = transactions
      .filter((t) => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + (t.originalAmount || t.amount || 0), 0);

    const totalExpenses = transactions
      .filter((t) => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + (t.originalAmount || t.amount || 0), 0);

    const netProfit = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      pendingCount: transactions.filter((t) => t.status === "pending").length,
      completedCount: transactions.filter((t) => t.status === "completed")
        .length,
    };
  }, [transactions]);

  const statsCurrency = transactions[0]?.currencyCode || "";

  const profitPercentage =
    stats.totalIncome > 0
      ? ((stats.netProfit / stats.totalIncome) * 100).toFixed(1)
      : "0.0";

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        {text.loading[language]}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        {text.error[language]}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {text.title[language]}
                </h1>

                <p className="text-sm text-gray-500">
                  {filteredTransactions.length} Transactions
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Income */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">
                {text.totalRevenue[language]}
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                {stats.totalIncome.toFixed(2)}
              </h2>

              <span className="text-sm text-gray-400 font-bold">
                {statsCurrency}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">
                {text.totalExpenses[language]}
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                {stats.totalExpenses.toFixed(2)}
              </h2>

              <span className="text-sm text-gray-400 font-bold">
                {statsCurrency}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {text.netProfit[language]}
              </p>

              <h2 className="text-3xl font-bold text-primary">
                {stats.netProfit.toFixed(2)}
              </h2>

              <span className="text-sm text-primary font-medium">
                {profitPercentage}%
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-3">
                {text.completedTransactions[language]}
              </p>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completedCount}
                  </p>

                  <p className="text-xs text-gray-400">
                    {text.completed[language]}
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pendingCount}
                  </p>

                  <p className="text-xs text-gray-400">
                    {text.pending[language]}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder={text.search[language]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 px-5 pr-12 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>
      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />

            <p className="text-lg text-gray-500">
              {text.noTransactions[language]}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full"
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.type[language]}
                  </th>

                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {language === "ar" ? "الوصف" : "Description"}
                  </th>

                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.amount[language]}
                  </th>

                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.date[language]}
                  </th>

                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.status[language]}
                  </th>

                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.actions[language]}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Type */}
                    <td className="px-6 py-5">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === "credit" ||
                          transaction.type === "subscription"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {getTransactionLabel(transaction.type)}
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-800">
                        {transaction.reason || "-"}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-sm font-bold ${
                            transaction.type === "credit" ||
                            transaction.type === "subscription"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {(transaction.originalAmount || transaction.amount || 0).toFixed(2)}
                        </span>

                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                          {transaction.currencyCode}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-600">
                        {new Date(
                          transaction.createdAt
                        ).toLocaleDateString(
                          language === "ar" ? "ar-EG" : "en-US"
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {text[transaction.status]
                          ? text[transaction.status][language]
                          : transaction.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleView(transaction)}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* Modal */}
      {showViewModal && selectedTransaction && (
        <ViewTransactionModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction as Transaction}
        />
      )}
    </div>
  );
}
