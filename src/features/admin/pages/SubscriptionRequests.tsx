import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, Clock, User, Package, Calendar } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import ViewSubscriptionRequestModal from "../../../components/modals/ViewSubscriptionRequestModal";
import UpdateSubscriptionStatusModal from "../../../components/modals/UpdateSubscriptionStatusModal";
import CustomSelect from "../../../components/ui/CustomSelect";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import {
  changeSubscriptionRequestStatus,
  getSubscriptionRequests,
} from "../services/subscriptionRequestServices";
import { SubscriptionRequest } from "../../../types/subscription";


export default function SubscriptionRequests() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [initialModalStatus, setInitialModalStatus] = useState<"approved" | "rejected">("approved");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<SubscriptionRequest | null>(null);
  const itemsPerPage = 10;

  const text = {
    title: { ar: "طلبات الاشتراك", en: "Subscription Requests" },
    subtitle: { ar: "إدارة ومراجعة جميع طلبات الاشتراك الجديدة في المنصة", en: "Manage and review all new subscription requests on the platform" },
    search: {
      ar: "بحث عن اسم الطالب أو ولي الأمر...",
      en: "Search for student or parent name...",
    },
    filter: { ar: "تصفية", en: "Filter" },
    all: { ar: "الكل", en: "All" },
    pending: { ar: "قيد الانتظار", en: "Pending" },
    approved: { ar: "مقبول", en: "Approved" },
    rejected: { ar: "مرفوض", en: "Rejected" },
    studentName: { ar: "اسم الطالب", en: "Student Name" },
    parentName: { ar: "ولي الأمر", en: "Parent Name" },
    phone: { ar: "الهاتف", en: "Phone" },
    email: { ar: "البريد الإلكتروني", en: "Email" },
    plan: { ar: "الخطة", en: "Plan" },
    price: { ar: "السعر", en: "Price" },
    sessionsCount: { ar: "عدد الحصص", en: "Sessions Count" },
    session: { ar: "حصة", en: "session" },
    requestDate: { ar: "تاريخ الطلب", en: "Request Date" },
    status: { ar: "الحالة", en: "Status" },
    actions: { ar: "الإجراءات", en: "Actions" },
    approve: { ar: "قبول", en: "Approve" },
    reject: { ar: "رفض", en: "Reject" },
    view: { ar: "عرض", en: "View" },
    noRequests: {
      ar: "لا توجد طلبات اشتراك",
      en: "No subscription requests found",
    },
    showing: { ar: "عرض", en: "Showing" },
    of: { ar: "من", en: "of" },
    requests: { ar: "طلب", en: "requests" },
  };

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const data = await getSubscriptionRequests();
        if (!Array.isArray(data)) {
          console.error("Invalid data:", data);
          return;
        }

        const formatted = data.map((item: any) => ({
          ...item,
          plan: {
            ...item.plan,
            name: item.plan?.name || item.plan?.name_ar || item.plan?.name_en || "—"
          }
        }));
        setRequests(formatted);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
            <Clock size={12} />
            {text.pending[language]}
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={12} />
            {text.approved[language]}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
            <XCircle size={12} />
            {text.rejected[language]}
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setInitialModalStatus("approved");
    setStatusModalOpen(true);
  };

  const handleReject = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setInitialModalStatus("rejected");
    setStatusModalOpen(true);
  };

  const handleStatusChange = async (status: "approved" | "rejected", rankId?: string) => {
    if (!selectedRequest) return;

    try {
      await changeSubscriptionRequestStatus(selectedRequest.id, status, rankId);
      setRequests((prev) =>
        prev.map((req) => (req.id === selectedRequest.id ? { ...req, status } : req))
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleView = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className={`${language === 'ar' ? 'text-right' : 'text-left'} space-y-2`}>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {text.title[language]}
        </h1>
        <p className="text-slate-500 font-medium">{text.subtitle[language]}</p>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters Header */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors`} />
              <input
                type="text"
                placeholder={text.search[language]}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-700 font-medium transition-all shadow-sm`}
              />
            </div>

            <div className="w-full lg:w-64">
              <CustomSelect
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(
                    value as "all" | "pending" | "approved" | "rejected"
                  )
                }
                options={[
                  { value: "all", label: text.all[language] },
                  { value: "pending", label: text.pending[language] },
                  { value: "approved", label: text.approved[language] },
                  { value: "rejected", label: text.rejected[language] },
                ]}
                placeholder={text.filter[language]}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto no-scrollbar">
          {isLoading ? (
            <div className="p-8">
              <TableSkeleton rows={8} columns={8} />
            </div>
          ) : paginatedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Package size={40} />
              </div>
              <p className="text-slate-500 text-lg font-bold">{text.noRequests[language]}</p>
            </div>
          ) : (
            <table className="w-full border-collapse" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {[
                    { label: text.studentName[language], icon: User },
                    { label: text.plan[language], icon: Package },
                    { label: text.price[language], icon: Clock },
                    { label: text.requestDate[language], icon: Calendar },
                    { label: text.status[language], icon: CheckCircle },
                    { label: text.actions[language], icon: null }
                  ].map((head, i) => (
                    <th key={i} className="px-6 py-5 text-start">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                        {head.icon && <head.icon size={14} />}
                        {head.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{request.user.name}</span>
                        <span className="text-xs text-slate-400 font-medium">{request.user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Package size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{request.plan.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-900">{request.plan.price}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Calendar size={14} />
                        {request.createdAt.substring(0, 10)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(request)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                          title={text.view[language]}
                        >
                          <Eye size={18} />
                        </button>

                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                              title={text.approve[language]}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                              title={text.reject[language]}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with Pagination */}
        {!isLoading && paginatedRequests.length > 0 && (
          <div className="p-8 border-t border-slate-50 bg-slate-50/10">
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

      {selectedRequest && (
        <ViewSubscriptionRequestModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      )}

      <UpdateSubscriptionStatusModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setSelectedRequest(null);
        }}
        onRequestStatusChange={handleStatusChange}
        request={selectedRequest}
        initialStatus={initialModalStatus}
      />
    </div>
  );
}
