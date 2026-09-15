import { useState } from "react";
import {
  Bell,
  Send,
  Plus,
  CheckCheck,
  Trash2,
  Eye,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Popconfirm } from "antd";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  useGetNotifications,
  useCreateNotification,
  useDeleteNotification,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearAllNotifications,
} from "../hooks/useNotifications";
import {
  NotificationItem,
  CreateNotification,
} from "../../../types/notification";
import Pagination from "../../../components/ui/Pagination";
import AddNotificationModal from "../../../components/modals/AddNotificationModal";
import ViewNotificationModal from "../../../components/modals/ViewNotificationModal";

export default function Notification() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  // State
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<NotificationItem | null>(null);

  // Hooks
  const { data: response, isLoading } = useGetNotifications({
    page: currentPage,
    limit: 10,
    isRead: readFilter === "all" ? undefined : readFilter === "read",
  });

  const { mutate: createNotification, isPending: isCreating } = useCreateNotification();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();
  const { mutate: clearAllNotifications, isPending: isClearingAll } = useClearAllNotifications();

  const handleOpenPreview = (item: NotificationItem) => {
    setViewingNotification(item);
    if (!item.isRead) {
      markAsRead(item.id);
    }
  };

  const handleCreateSubmit = (data: CreateNotification) => {
    createNotification(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };


  const allNotifications = response?.data?.items || [];
  const unreadCount =
    response?.unreadCount ??
    allNotifications.filter((item) => !item.isRead).length;
  const readCount = allNotifications.filter((item) => item.isRead).length;

  const pagination = response?.data?.pagination || {
    page: 1,
    limit: 10,
    totalItems: allNotifications.length,
    totalPages: 1,
    hasNextPage: false,
  };

  const filteredNotifications = allNotifications.filter((item) => {
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "read" && item.isRead) ||
      (readFilter === "unread" && !item.isRead);

    return matchesRead;
  });

  const handleFilterChange = (filter: "all" | "read" | "unread") => {
    setReadFilter(filter);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500" dir={isAr ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary-dark via-primary to-[#000] border border-primary/30 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>


        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white shadow-sm">
            {/* <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> */}
            <span>{isAr ? "مركز البث المباشر والإشعارات" : "Broadcast & Notification Center"}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm">
            {isAr ? "إدارة الإشعارات والتنبيهات" : "Push Notifications Management"}
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-2xl font-medium leading-relaxed drop-shadow-sm">
            {isAr
              ? "إرسال وبث التنبيهات الفورية والإعلانات لجميع الطلاب وأولياء الأمور مع متابعة حالة القراءة والتفاعل."
              : "Send instant broadcast push notifications and announcements to users with delivery tracking."}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {allNotifications.length > 0 && (
            <>
              <button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl border border-white/30 backdrop-blur-md transition-all text-sm disabled:opacity-50 shadow-sm"
                title={isAr ? "تحديد جميع الإشعارات كمقروءة" : "Mark all as read"}
              >
                <CheckCheck className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? "تحديد الكل كمقروء" : "Mark All Read"}</span>
              </button>

              <Popconfirm
                title={isAr ? "مسح جميع الإشعارات" : "Clear All Notifications"}
                description={
                  isAr
                    ? "هل أنت متأكد من رغبتك في حذف جميع الإشعارات نهائياً؟"
                    : "Are you sure you want to delete all notifications?"
                }
                onConfirm={() => clearAllNotifications()}
                okText={isAr ? "نعم، مسح الكل" : "Yes, Clear All"}
                cancelText={isAr ? "إلغاء" : "Cancel"}
                okButtonProps={{ danger: true }}
              >
                <button
                  disabled={isClearingAll}
                  className="flex items-center gap-2 px-4 py-3 bg-rose-500/30 hover:bg-rose-500/40 text-rose-100 font-bold rounded-2xl border border-rose-300/30 backdrop-blur-md transition-all text-sm disabled:opacity-50 shadow-sm"
                  title={isAr ? "مسح جميع الإشعارات" : "Clear all notifications"}
                >
                  <Trash2 className="w-4 h-4 text-rose-200" />
                  <span>{isAr ? "مسح الكل" : "Clear All"}</span>
                </button>
              </Popconfirm>
            </>
          )}

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-white/95 text-primary font-black rounded-2xl shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span>{isAr ? "إرسال إشعار جديد" : "Send New Notification"}</span>
          </button>
        </div>
      </div>

      {/* Filter / Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: All Notifications */}
        <button
          type="button"
          onClick={() => handleFilterChange("all")}
          className={`p-6 rounded-3xl border text-start transition-all relative overflow-hidden group cursor-pointer ${
            readFilter === "all"
              ? "bg-white border-primary shadow-md ring-2 ring-primary/20"
              : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                readFilter === "all" ? "bg-primary text-white" : "bg-primary/10 text-primary"
              }`}
            >
              <Send className="w-6 h-6" />
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                readFilter === "all" ? "bg-primary text-white" : "bg-primary/10 text-primary"
              }`}
            >
              {isAr ? "الكل" : "All"}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-800">{pagination.totalItems || allNotifications.length}</div>
            <div className="text-sm font-semibold text-slate-500 mt-1">
              {isAr ? "إجمالي الإشعارات" : "Total Notifications"}
            </div>
          </div>
        </button>

        {/* Card 2: Unread Notifications */}
        <button
          type="button"
          onClick={() => handleFilterChange("unread")}
          className={`p-6 rounded-3xl border text-start transition-all relative overflow-hidden group cursor-pointer ${readFilter === "unread"
              ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
              : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${readFilter === "unread" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600"
              }`}>
              <Bell className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${readFilter === "unread"
                ? "bg-amber-500 text-white"
                : "bg-amber-50 text-amber-600"
              }`}>
              {isAr ? "غير مقروءة" : "Unread"}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-800">{unreadCount}</div>
            <div className="text-sm font-semibold text-slate-500 mt-1">
              {isAr ? "إشعارات غير مقروءة" : "Unread Notifications"}
            </div>
          </div>
        </button>

        {/* Card 3: Read Notifications */}
        <button
          type="button"
          onClick={() => handleFilterChange("read")}
          className={`p-6 rounded-3xl border text-start transition-all relative overflow-hidden group cursor-pointer ${readFilter === "read"
              ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${readFilter === "read" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600"
              }`}>
              <CheckCheck className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${readFilter === "read"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-600"
              }`}>
              {isAr ? "مقروءة" : "Read"}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-800">
              {readCount}
            </div>
            <div className="text-sm font-semibold text-slate-500 mt-1">
              {isAr ? "إشعارات تمت قراءتها" : "Read Notifications"}
            </div>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Notifications List */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-16 text-center text-slate-400 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-semibold">{isAr ? "جاري تحميل الإشعارات..." : "Loading notifications..."}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                {isAr ? "لا توجد إشعارات تطابق البحث" : "No notifications found"}
              </h3>
              {/* <p className="text-slate-400 text-sm max-w-sm mx-auto">
                {isAr
                  ? "لا توجد إشعارات بعد"
                  : "No notifications yet."}
              </p> */}
              {/* <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary-dark transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? "إرسال إشعار" : "Send Notification"}</span>
              </button> */}
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const translation = item.translations?.find((t) => t.lang === (isAr ? "ar" : "en"));
              const title = translation?.title || item.title || "";
              const message = translation?.message || item.message || "";

              return (
                <div
                  key={item.id}
                  className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon Badge */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 bg-indigo-50/60 text-indigo-600">
                      <Bell className="w-6 h-6" />
                    </div>

                    {/* Text Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {title}
                        </h3>

                        {/* Type Badge */}
                        {item.type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.type}
                          </span>
                        )}

                        {/* Read Status Badge */}
                        {item.isRead ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            {isAr ? "مقروء" : "Read"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                            <Bell className="w-3 h-3" />
                            {isAr ? "غير مقروء" : "Unread"}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed font-normal">
                        {message}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {!item.isRead && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all"
                        title={isAr ? "تحديد كمقروء" : "Mark as read"}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenPreview(item)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-primary-light text-slate-600 hover:text-primary transition-all"
                      title={isAr ? "معاينة الإشعار" : "Preview Notification"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Popconfirm
                      title={isAr ? "حذف الإشعار" : "Delete Notification"}
                      description={
                        isAr
                          ? "هل أنت متأكد من رغبتك في حذف هذا الإشعار؟"
                          : "Are you sure you want to delete this notification?"
                      }
                      onConfirm={() => deleteNotification(item.id)}
                      okText={isAr ? "نعم، حذف" : "Yes, Delete"}
                      cancelText={isAr ? "إلغاء" : "Cancel"}
                      okButtonProps={{ danger: true }}
                    >
                      <button
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all"
                        title={isAr ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.totalItems || allNotifications.length}
          itemsPerPage={pagination.limit || 10}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* ADD NOTIFICATION MODAL */}
      <AddNotificationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />

      {/* VIEW NOTIFICATION DETAIL MODAL */}
      <ViewNotificationModal
        isOpen={!!viewingNotification}
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
      />
    </div>
  );
}
