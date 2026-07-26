import { useState } from "react";
import { useConfirm } from '../../../hooks/useConfirm';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Search,
  Filter,
  CreditCard,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import AddExpenseModal from "../../../components/modals/AddExpenseModal";
import ViewExpenseModal from "../../../components/modals/ViewExpenseModal";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "../hooks/useExpenses";
import { Expense } from "../../../types/expenses";
import ErrorService from "../../../utils/ErrorService";

export default function Expenses() {
  const { language } = useLanguage();
  const { confirm, ConfirmDialog } = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: expenses = [], isLoading } = useExpenses();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const text = {
    title: { ar: "إدارة المصروفات", en: "Expenses Management" },
    addExpense: { ar: "إضافة مصروف جديد", en: "Add New Expense" },
    search: { ar: "البحث في المصروفات...", en: "Search expenses..." },
    totalExpenses: { ar: "إجمالي المصروفات", en: "Total Expenses" },
    totalCount: { ar: "مصروف", en: "expenses" },
    description: { ar: "الوصف", en: "Description" },
    amount: { ar: "المبلغ", en: "Amount" },
    currency: { ar: "العملة", en: "Currency" },
    type: { ar: "النوع", en: "Type" },
    date: { ar: "التاريخ", en: "Date" },
    paymentMethod: { ar: "طريقة الدفع", en: "Payment Method" },
    status: { ar: "الحالة", en: "Status" },
    actions: { ar: "الإجراءات", en: "Actions" },
    edit: { ar: "تعديل", en: "Edit" },
    delete: { ar: "حذف", en: "Delete" },
    view: { ar: "عرض", en: "View" },
    paid: { ar: "مقبول", en: "Paid" },
    pending: { ar: "معلق", en: "Pending" },
    failed: { ar: "فاشل", en: "Failed" },
    noExpenses: { ar: "لا توجد مصروفات", en: "No expenses found" },
    confirmDelete: {
      ar: "هل أنت متأكد من حذف هذا المصروف؟",
      en: "Are you sure you want to delete this expense?",
    },
    allTypes: { ar: "كل الأنواع", en: "All Types" },
    salary: { ar: "رواتب", en: "Salary" },
    amenities: { ar: "مرافق", en: "Amenities" },
    general: { ar: "عام", en: "General" },
    management: { ar: "إدارة", en: "Management" },
    marketing: { ar: "تسويق", en: "Marketing" },
    other: { ar: "أخرى", en: "Other" },
    allStatuses: { ar: "كل الحالات", en: "All Statuses" },
  };

  const handleSaveExpense = async (expenseData: any) => {
    try {
      if (selectedExpense) {
        await updateMutation.mutateAsync({ id: selectedExpense.id, data: expenseData });
        ErrorService.success(language === 'ar' ? 'تم تحديث المصروف بنجاح' : 'Expense updated successfully');
      } else {
        await createMutation.mutateAsync(expenseData);
        ErrorService.success(language === 'ar' ? 'تم إضافة المصروف بنجاح' : 'Expense added successfully');
      }
      setSelectedExpense(null);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const ok = await confirm({
      title: language === 'ar' ? 'حذف المصروف' : 'Delete Expense',
      message: text.confirmDelete[language],
    });
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(id);
      ErrorService.success(language === 'ar' ? 'تم حذف المصروف بنجاح' : 'Expense deleted successfully');
    } catch (error) {
      ErrorService.error(language === 'ar' ? 'حدث خطأ ما' : 'Something went wrong');
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || expense.type === filterType;
    const matchesStatus = filterStatus === "all" || expense.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {text.title[language]}
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredExpenses.length} {text.totalCount[language]}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedExpense(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl transition-all hover:bg-primary/90 shadow-lg shadow-primary/20 w-fit"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">{text.addExpense[language]}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {text.totalExpenses[language]}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold text-gray-900">
                {totalAmount.toLocaleString()}
              </h2>
              <span className="text-sm font-medium text-gray-400">USD</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-red-50/50 to-transparent" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
            <input
              type="text"
              placeholder={text.search[language]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 ${language === 'ar' ? 'pr-12 pl-5' : 'pl-12 pr-5'} outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start`}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Filter className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`h-14 rounded-2xl border border-gray-200 bg-gray-50 ${language === 'ar' ? 'pr-11 pl-5' : 'pl-11 pr-5'} outline-none appearance-none min-w-[170px] text-gray-700 font-medium`}
              >
                <option value="all">{text.allTypes[language]}</option>
                <option value="salary">{text.salary[language]}</option>
                <option value="amenities">{text.amenities[language]}</option>
                <option value="general">{text.general[language]}</option>
                <option value="management">{text.management[language]}</option>
                <option value="marketing">{text.marketing[language]}</option>
                <option value="other">{text.other[language]}</option>
              </select>
            </div>

            <div className="relative">
              <Filter className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`h-14 rounded-2xl border border-gray-200 bg-gray-50 ${language === 'ar' ? 'pr-11 pl-5' : 'pl-11 pr-5'} outline-none appearance-none min-w-[170px] text-gray-700 font-medium`}
              >
                <option value="all">{text.allStatuses[language]}</option>
                <option value="paid">{text.paid[language]}</option>
                <option value="pending">{text.pending[language]}</option>
                <option value="failed">{text.failed[language]}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : filteredExpenses.length === 0 ? (
          <div className="py-20 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500 font-medium">{text.noExpenses[language]}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.description[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.type[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.amount[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.paymentMethod[language]}
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
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-gray-900">
                        {expense.title}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                        {text[expense.type as keyof typeof text]?.[language] || expense.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-red-600">
                          {expense.amount.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-gray-400 uppercase">
                          {expense.currency?.code || "USD"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-600">
                        {expense.payment_type || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(expense.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          expense.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : expense.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {text[expense.status as keyof typeof text]?.[language] || expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowViewModal(true);
                          }}
                          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          title={text.view[language]}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowModal(true);
                          }}
                          className="w-10 h-10 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-center hover:bg-amber-100 transition-colors"
                          title={text.edit[language]}
                        >
                          <Edit className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title={text.delete[language]}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={selectedExpense}
      />

      {showViewModal && selectedExpense && (
        <ViewExpenseModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
        />
      )}
      {ConfirmDialog}
    </div>
  );
}
