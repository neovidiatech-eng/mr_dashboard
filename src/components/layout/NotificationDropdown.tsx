import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Check, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../features/admin/hooks/useNotifications";
import { NotificationItem } from "../../types/notification";
import ViewNotificationModal from "../modals/ViewNotificationModal";

interface NotificationDropdownProps {
  userRole: "admin" | "super_admin" | "teacher" | "student" | string;
}

export default function NotificationDropdown({ userRole }: NotificationDropdownProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<NotificationItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Queries & Mutations
  const { data: unreadResponse } = useGetUnreadCount();
  const { data: notificationsResponse, isLoading } = useGetNotifications(
    { page: 1, limit: 8 },
    { enabled: isOpen }
  );

  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  const notifications: NotificationItem[] = notificationsResponse?.data?.items || [];
  const unreadCount =
    unreadResponse?.data?.unreadCount ??
    notificationsResponse?.unreadCount ??
    notifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    setViewingNotification(item);
    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    if (userRole === "admin" || userRole === "super_admin") {
      navigate("/dashboard/notifications");
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative p-2.5 rounded-2xl transition-all duration-200 border ${
            isOpen
              ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
              : "text-slate-500 hover:text-primary hover:bg-slate-100/80 border-transparent hover:border-slate-200"
          }`}
          title={isAr ? "الإشعارات والتنبيهات" : "Notifications"}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 transition-transform active:scale-90" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in-75">
              {unreadCount > 99 ? "+99" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Popup Menu */}
        {isOpen && (
          <div
            className={`absolute top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200 ${
              isAr ? "left-0 sm:-left-4" : "right-0 sm:-right-4"
            }`}
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Dropdown Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isAr ? "الإشعارات" : "Notifications"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {unreadCount > 0
                      ? isAr
                        ? `لديك ${unreadCount} إشعار غير مقروء`
                        : `${unreadCount} unread notification(s)`
                      : isAr
                      ? "جميع الإشعارات مقروءة"
                      : "All notifications read"}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-colors disabled:opacity-50"
                  title={isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? "قراءة الكل" : "Mark read"}</span>
                </button>
              )}
            </div>

            {/* Notifications Body */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 font-medium">
                    {isAr ? "جاري تحميل الإشعارات..." : "Loading notifications..."}
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                /* Empty State */
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
                    <Inbox className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">
                      {isAr ? "لا توجد إشعارات حالياً" : "No notifications available"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                      {isAr
                        ? "ستظهر هنا التنبيهات والرسائل الجديدة فور إرسالها."
                        : "New alerts and broadcast messages will appear here."}
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((item) => {
                  const translation = item.translations?.find((t) => t.lang === (isAr ? "ar" : "en"));
                  const title = translation?.title || item.title || "";
                  const message = translation?.message || item.message || "";

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 group relative ${
                        !item.isRead ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      {/* Status Dot / Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          !item.isRead
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs truncate ${
                              !item.isRead
                                ? "font-bold text-slate-900 group-hover:text-primary"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {title}
                          </h4>

                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {message}
                        </p>

                        {item.createdAt && (
                          <span className="text-[10px] text-slate-400 block pt-0.5">
                            {new Date(item.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      {/* Direct Mark as Read Button */}
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item.id);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                          title={isAr ? "تحديد كمقروء" : "Mark as read"}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer (for Admin / Super Admin) */}
            {/* {(userRole === "admin" || userRole === "super_admin") && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  <span>{isAr ? "عرض كل الإشعارات وإدارتها" : "View & Manage All Notifications"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )} */}
          </div>
        )}
      </div>

      {/* Preview Modal when clicked */}
      <ViewNotificationModal
        isOpen={!!viewingNotification}
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
      />
    </>
  );
}
