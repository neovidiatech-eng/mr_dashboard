import { useEffect, useState } from "react";
import { Search, Eye, CreditCard, User, Package, Calendar, CheckCircle, Clock, TrendingUp, RefreshCw } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import ViewSubscriptionDetailsModal from "../../../components/modals/ViewSubscriptionDetailsModal";
import RenewSubscriptionModal from "../../../components/modals/RenewSubscriptionModal";
import CustomSelect from "../../../components/ui/CustomSelect";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import { getAllSubscriptions } from "../services/subscriptionRequestServices";

interface Subscription {
  id: string;
  studentId: string;
  studentName: string;
  planName: string;
  planPrice: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  sessionsRemaining: number;
  totalSessions: number;
}

export default function AllSubscriptions() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired" | "cancelled"
  >("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [renewTarget, setRenewTarget] = useState<{ studentId: string; studentName: string } | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;

  const text = {
    title: { ar: "كل الاشتراكات", en: "All Subscriptions" },
    subtitle: { ar: "قائمة شاملة بجميع الاشتراكات الحالية والسابقة في المنصة", en: "A comprehensive list of all current and past subscriptions on the platform" },
    search: {
      ar: "بحث عن اسم الطالب أو الخطة...",
      en: "Search for student name or plan...",
    },
    filter: { ar: "تصفية", en: "Filter" },
    all: { ar: "الكل", en: "All" },
    active: { ar: "نشط", en: "Active" },
    expired: { ar: "منتهي", en: "Expired" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    studentName: { ar: "اسم الطالب", en: "Student Name" },
    plan: { ar: "الخطة", en: "Plan" },
    price: { ar: "السعر", en: "Price" },
    sessionsCount: { ar: "عدد الحصص", en: "Sessions Count" },
    session: { ar: "حصة", en: "session" },
    startDate: { ar: "تاريخ البدء", en: "Start Date" },
    endDate: { ar: "تاريخ الانتهاء", en: "End Date" },
    status: { ar: "الحالة", en: "Status" },
    progress: { ar: "التقدم", en: "Progress" },
    actions: { ar: "الإجراءات", en: "Actions" },
    view: { ar: "عرض", en: "View" },
    noSubscriptions: { ar: "لا توجد اشتراكات", en: "No subscriptions found" },
    showing: { ar: "عرض", en: "Showing" },
    of: { ar: "من", en: "of" },
    subscriptions: { ar: "اشتراك", en: "subscriptions" },
    sessions: { ar: "حصة", en: "sessions" },
  };

  const mapSubscriptionToUI = (item: any): Subscription => {
    const currencySymbol = item.currency?.symbol || item.currency?.code || "";
    const amount = item.amount ?? item.plan?.price ?? 0;
    const status = item.status as "active" | "expired" | "cancelled";
    return {
      id: item.id,
      studentId: item.student?.id || "",
      studentName: item.user?.name || "—",
      planName: item.plan?.name || item.plan?.name_ar || item.plan?.name_en || "—",
      planPrice: `${amount} ${currencySymbol}`.trim(),
      startDate: item.startDate?.split("T")[0] || item.paidAt?.split("T")[0] || "",
      endDate: "",
      status: ["active", "expired", "cancelled"].includes(status) ? status : "expired",
      sessionsRemaining: item.student?.sessions_remaining ?? item.plan?.sessionsCount ?? 0,
      totalSessions: item.student?.sessions ?? item.plan?.sessionsCount ?? 0,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllSubscriptions();
        const formatted = data.map((item: any) => mapSubscriptionToUI(item));
        setSubscriptions(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.studentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || subscription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscriptions = filteredSubscriptions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={12} />
            {text.active[language]}
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
            <Clock size={12} />
            {text.expired[language]}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
            <Clock size={12} />
            {text.cancelled[language]}
          </span>
        );
      default:
        return null;
    }
  };

  const calculateProgress = (remaining: number, total: number) => {
    const used = total - remaining;
    return (used / (total || 1)) * 100;
  };

  const handleView = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowViewModal(true);
  };

  const handleRenew = (subscription: Subscription) => {
    setRenewTarget({ studentId: subscription.studentId, studentName: subscription.studentName });
    setShowRenewModal(true);
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
                    value as "all" | "active" | "expired" | "cancelled",
                  )
                }
                options={[
                  { value: "all", label: text.all[language] },
                  { value: "active", label: text.active[language] },
                  { value: "expired", label: text.expired[language] },
                  { value: "cancelled", label: text.cancelled[language] },
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
          ) : paginatedSubscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <CreditCard size={40} />
              </div>
              <p className="text-slate-500 text-lg font-bold">{text.noSubscriptions[language]}</p>
            </div>
          ) : (
            <table className="w-full border-collapse" dir={language === "ar" ? "rtl" : "ltr"}>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {[
                    { label: text.studentName[language], icon: User },
                    { label: text.plan[language], icon: Package },
                    { label: text.status[language], icon: CheckCircle },
                    { label: text.progress[language], icon: TrendingUp },
                    { label: text.startDate[language], icon: Calendar },
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
                {paginatedSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{subscription.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Package size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{subscription.planName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(subscription.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {subscription.sessionsRemaining} / {subscription.totalSessions} {text.sessions[language]}
                          </span>
                          <span className="text-[10px] font-black text-blue-600">
                            {Math.round(calculateProgress(subscription.sessionsRemaining, subscription.totalSessions))}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${calculateProgress(
                                subscription.sessionsRemaining,
                                subscription.totalSessions
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Calendar size={14} />
                        {subscription.startDate}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(subscription)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                          title={text.view[language]}
                        >
                          <Eye size={18} />
                        </button>
                        {subscription.sessionsRemaining === 0 && (
                          <button
                            onClick={() => handleRenew(subscription)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 text-xs font-bold whitespace-nowrap border border-amber-200 hover:border-amber-500"
                            title="Renew Subscription"
                          >
                            <RefreshCw size={14} />
                            {language === "ar" ? "تجديد" : "Renew"}
                          </button>
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
        {!isLoading && paginatedSubscriptions.length > 0 && (
          <div className="p-8 border-t border-slate-50 bg-slate-50/10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredSubscriptions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {selectedSubscription && (
        <ViewSubscriptionDetailsModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSubscription(null);
          }}
          subscription={selectedSubscription}
        />
      )}

      {renewTarget && (
        <RenewSubscriptionModal
          isOpen={showRenewModal}
          onClose={() => {
            setShowRenewModal(false);
            setRenewTarget(null);
          }}
          studentId={renewTarget.studentId}
          studentName={renewTarget.studentName}
          onSuccess={() => {
            // Refetch subscriptions after renewal
            setIsLoading(true);
            getAllSubscriptions()
              .then((data) => setSubscriptions(data.map(mapSubscriptionToUI)))
              .catch(console.error)
              .finally(() => setIsLoading(false));
          }}
        />
      )}
    </div>
  );
}
