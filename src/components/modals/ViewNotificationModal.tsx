import { Modal } from "antd";
import { Bell } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { NotificationItem } from "../../types/notification";
import { getNotificationDetails } from "../../utils/notificationUtils";

interface ViewNotificationModalProps {
  isOpen: boolean;
  notification: NotificationItem | null;
  onClose: () => void;
}

export default function ViewNotificationModal({
  isOpen,
  notification,
  onClose,
}: ViewNotificationModalProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  if (!notification) return null;

  const { title, message, typeLabel } = getNotificationDetails(notification, isAr);
  const enDetails = getNotificationDetails(notification, false);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      <div className="p-4 md:p-6 space-y-6" dir={isAr ? "rtl" : "ltr"}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-indigo-100 bg-indigo-50/60 text-indigo-600">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            {notification.type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-1 bg-slate-100 text-slate-700 border border-slate-200">
                {typeLabel}
              </span>
            )}
            <h2 className="text-xl font-black text-slate-900">
              {title}
            </h2>
            {notification.createdAt && (
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {new Date(notification.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isAr ? "نص الرسالة" : "Notification Message"}
          </h4>
          <p className="text-slate-700 text-sm font-medium leading-relaxed">
            {message}
          </p>

          {enDetails.message && enDetails.message !== message && isAr && (
            <div className="pt-3 border-t border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">English Version:</span>
              <p className="text-slate-600 text-xs">{enDetails.message}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
