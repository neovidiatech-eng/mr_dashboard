import { useState } from "react";
import { Search, CheckCircle, XCircle, Clock, FileText, Filter } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import WhatsAppPhone from "../../../components/ui/WhatsAppPhone";
import { useUpdateWithdrawal, useWithdrawals } from "../hooks/useTransaction";
import ErrorService from "../../../utils/ErrorService";
import { X } from "lucide-react";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  status: 'approve' | 'reject';
  language: 'ar' | 'en';
  isPending: boolean;
}

function StatusUpdateModal({ isOpen, onClose, onConfirm, status, language, isPending }: StatusUpdateModalProps) {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const text = {
    title: {
      ar: status === 'approve' ? 'قبول الطلب' : 'رفض الطلب',
      en: status === 'approve' ? 'Approve Request' : 'Reject Request',
    },
    label: {
      ar: 'ملاحظات المدير (اختياري):',
      en: 'Admin Notes (Optional):',
    },
    placeholder: {
      ar: 'اكتب ملاحظاتك هنا...',
      en: 'Write your notes here...',
    },
    confirm: {
      ar: status === 'approve' ? 'تأكيد القبول' : 'تأكيد الرفض',
      en: status === 'approve' ? 'Confirm Approval' : 'Confirm Rejection',
    },
    cancel: {
      ar: 'إلغاء',
      en: 'Cancel',
    }
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{text.title[language]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {text.label[language]}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={text.placeholder[language]}
              className="w-full h-32 rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-gray-700"
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
          >
            {text.cancel[language]}
          </button>
          <button
            onClick={() => onConfirm(notes)}
            disabled={isPending}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              status === 'approve' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'
            } disabled:opacity-50`}
          >
            {isPending && <Clock className="w-4 h-4 animate-spin" />}
            {text.confirm[language]}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionRequests() {
  const { language } = useLanguage();
  const { data: withdrawalsData, isLoading } = useWithdrawals();
  const updateStatusMutation = useUpdateWithdrawal();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    requestId: string;
    status: 'approve' | 'reject';
  }>({
    isOpen: false,
    requestId: "",
    status: 'approve'
  });
  
  const itemsPerPage = 10;

  const text = {
    title: { ar: "طلبات السحب", en: "Withdrawal Requests" },
    search: {
      ar: "بحث عن اسم المعلم...",
      en: "Search for teacher name...",
    },
    filter: { ar: "تصفية", en: "Filter" },
    all: { ar: "الكل", en: "All" },
    pending: { ar: "قيد الانتظار", en: "Pending" },
    approved: { ar: "مقبول", en: "Approved" },
    rejected: { ar: "مرفوض", en: "Rejected" },
    completed: { ar: "مكتمل", en: "Completed" },
    teacherName: { ar: "اسم المعلم", en: "Teacher Name" },
    phone: { ar: "الهاتف", en: "Phone" },
    email: { ar: "البريد الإلكتروني", en: "Email" },
    amount: { ar: "المبلغ", en: "Amount" },
    requestDate: { ar: "تاريخ الطلب", en: "Request Date" },
    status: { ar: "الحالة", en: "Status" },
    actions: { ar: "الإجراءات", en: "Actions" },
    approve: { ar: "قبول", en: "Approve" },
    reject: { ar: "رفض", en: "Reject" },
    noRequests: {
      ar: "لا توجد طلبات سحب",
      en: "No withdrawal requests found",
    },
    requestsCount: {
      ar: "طلب",
      en: "Requests"
    }
  };

  const withdrawals = withdrawalsData?.data?.withdrawals || [];

  const filteredRequests = withdrawals.filter((request) => {
    const matchesSearch = request.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleStatusUpdate = (id: string, status: 'approve' | 'reject') => {
    setModalConfig({
        isOpen: true,
        requestId: id,
        status: status
    });
  };

  const confirmStatusUpdate = (adminNotes: string) => {
    updateStatusMutation.mutate({ 
        id: modalConfig.requestId, 
        status: modalConfig.status, 
        adminNotes 
    }, {
        onSuccess: () => {
            ErrorService.success(language === 'ar' ? 'تم تحديث حالة الطلب بنجاح' : 'Request status updated successfully');
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        },
    });
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-4 animate-spin" />
        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
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
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {text.title[language]}
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredRequests.length} {text.requestsCount[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 ${language === 'ar' ? 'pr-12 pl-5' : 'pl-12 pr-5'} outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Filter className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`h-14 rounded-2xl border border-gray-200 bg-gray-50 ${language === 'ar' ? 'pr-11 pl-5' : 'pl-11 pr-5'} outline-none appearance-none min-w-[170px] text-gray-700 font-medium`}
              >
                <option value="all">{text.all[language]}</option>
                <option value="pending">{text.pending[language]}</option>
                <option value="approved">{text.approved[language]}</option>
                <option value="completed">{text.completed[language]}</option>
                <option value="rejected">{text.rejected[language]}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {paginatedRequests.length === 0 ? (
          <div className="py-20 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500">
              {text.noRequests[language]}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.teacherName[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.phone[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.email[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.amount[language]}
                  </th>
                  <th className="px-6 py-5 text-start text-sm font-semibold text-gray-600">
                    {text.requestDate[language]}
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
                {paginatedRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-5 text-start text-sm font-medium text-gray-900">
                      {request.teacher?.name || "—"}
                    </td>
                    <td className="px-6 py-5 text-start text-sm text-gray-600" dir="ltr">
                      <WhatsAppPhone phone={request.teacher?.phone || ""} />
                    </td>
                    <td className="px-6 py-5 text-start text-sm text-gray-600" dir="ltr">
                      {request.teacher?.email || "—"}
                    </td>
                    <td className="px-6 py-5 text-start text-sm font-bold text-primary">
                      {request.amount}
                    </td>
                    <td className="px-6 py-5 text-start text-sm text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="px-6 py-5 text-start">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {text[request.status as keyof typeof text]?.[language] || request.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 justify-start">
                        <button
                          onClick={() => handleStatusUpdate(request.id, "approve")}
                          disabled={request.status !== "pending" || updateStatusMutation.isPending}
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                            request.status === "pending"
                              ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                              : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                          }`}
                          title={text.approve[language]}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, "reject")}
                          disabled={request.status !== "pending" || updateStatusMutation.isPending}
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                            request.status === "pending"
                              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                          }`}
                          title={text.reject[language]}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && paginatedRequests.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRequests.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <StatusUpdateModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmStatusUpdate}
        status={modalConfig.status}
        language={language}
        isPending={updateStatusMutation.isPending}
      />
    </div>
  );
}