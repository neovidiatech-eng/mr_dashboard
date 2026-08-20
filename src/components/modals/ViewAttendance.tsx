import { useState } from "react";
import {
    X,
    Mail,
    Phone,
    Globe,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CheckCircle2,
    Clock3,
    XCircle,
    History,
    Loader2,
    User,
} from "lucide-react";
import { Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { AttendanceItem, AttendanceStatus } from "../../types/attendance";
import { useGetStudentAttendance, useUpdateAttendance } from "../../features/admin/hooks/useAttendance";

interface ViewAttendanceProps {
    isOpen: boolean;
    onClose: () => void;
    attendance: AttendanceItem | null;
}

const HISTORY_LIMIT = 10;

function StatusBadge({ status }: { status: string }) {
    const { t } = useTranslation();
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
        present: {
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            cls: "bg-emerald-50 text-emerald-600",
        },
        late: {
            icon: <Clock3 className="w-3.5 h-3.5" />,
            cls: "bg-amber-50 text-amber-600",
        },
        absent: {
            icon: <XCircle className="w-3.5 h-3.5" />,
            cls: "bg-red-50 text-red-600",
        },
    };
    const cfg = map[status?.toLowerCase()] ?? {
        icon: null,
        cls: "bg-gray-50 text-gray-500",
    };
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${cfg.cls}`}
        >
            {cfg.icon}
            {t(`status_${status}`, status?.toUpperCase())}
        </span>
    );
}

function HistoryRow({
    item,
    onStatusChange,
    isUpdating,
}: {
    item: AttendanceItem;
    onStatusChange: (id: string, newStatus: AttendanceStatus) => void;
    isUpdating?: boolean;
}) {
    const { t } = useTranslation();
    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    const formatTime = (d: string | null) => {
        if (!d) return "\u2014";
        return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    const dotColor: Record<string, string> = {
        present: "bg-emerald-400",
        late: "bg-amber-400",
        absent: "bg-red-400",
    };

    const menuItems = [
        {
            key: "present",
            label: (
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("status_present", "Present")}
                </span>
            ),
            onClick: () => onStatusChange(item.id, "present"),
        },
        {
            key: "late",
            label: (
                <span className="flex items-center gap-2 text-xs font-bold text-amber-600 py-1">
                    <Clock3 className="w-3.5 h-3.5" />
                    {t("status_late", "Late")}
                </span>
            ),
            onClick: () => onStatusChange(item.id, "late"),
        },
        {
            key: "absent",
            label: (
                <span className="flex items-center gap-2 text-xs font-bold text-red-600 py-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {t("status_absent", "Absent")}
                </span>
            ),
            onClick: () => onStatusChange(item.id, "absent"),
        },
    ];

    return (
        <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50/80 transition-colors group">
            <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[item.status] ?? "bg-gray-300"}`} />
                <div>
                    <p className="text-sm font-bold text-gray-800">{formatDate(item.attendanceDate)}</p>
                    <p className="text-xs text-gray-400 font-medium" dir="ltr">{formatTime(item.checkedInAt)}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isUpdating ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t("updating", "Updating...")}
                    </span>
                ) : (
                    <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 p-1 -m-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            title={t("change_status", "Change Status")}
                        >
                            <StatusBadge status={item.status} />
                            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </button>
                    </Dropdown>
                )}
            </div>
        </div>
    );
}

export default function ViewAttendance({ isOpen, onClose, attendance }: ViewAttendanceProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const [historyPage, setHistoryPage] = useState(1);
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

    const updateAttendanceMutation = useUpdateAttendance();

    const studentId = attendance?.student?.id ?? "";

    const {
        data: historyData,
        isLoading: historyLoading,
        isFetching: historyFetching,
    } = useGetStudentAttendance(studentId, historyPage, HISTORY_LIMIT);

    if (!isOpen || !attendance) return null;

    const { student } = attendance;
    const user = student?.user;
    const rank = student?.rank;

    const handleStatusChange = (id: string, newStatus: AttendanceStatus) => {
        setUpdatingItemId(id);
        updateAttendanceMutation.mutate(
            { id, data: { status: newStatus } },
            {
                onSettled: () => {
                    setUpdatingItemId(null);
                },
            }
        );
    };

    const historyItems = historyData?.data?.items ?? [];
    const pagination = historyData?.data?.pagination;
    const totalPages = pagination?.totalPages ?? 1;
    const totalItems = pagination?.totalItems ?? 0;

    const getInitials = (name: string) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const formatDate = (d: string | null) => {
        if (!d) return "\u2014";
        return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    };
    const formatTime = (d: string | null) => {
        if (!d) return "\u2014";
        return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div
            className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">

                {/* Profile Header */}
                <div className="relative h-32 bg-gradient-to-r from-[#800020] to-[#500014] shrink-0">
                    {/* decorative circles */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 end-0 w-64 h-64 border-[32px] border-white rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 start-0 w-32 h-32 border-[16px] border-white rounded-full -translate-x-1/2 translate-y-1/2" />
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 end-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20"
                        id="view-attendance-close-btn"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Avatar + name */}
                    <div className="absolute -bottom-14 start-8 flex items-end gap-5">
                        <div className="w-24 h-24 rounded-[22px] bg-white p-1.5 shadow-lg">
                            <div className="w-full h-full rounded-[18px] bg-[#fdf2f4] flex items-center justify-center text-[#800020] text-3xl font-black">
                                {getInitials(user?.name ?? "")}
                            </div>
                        </div>
                        <div className="mb-2">
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">{user?.name ?? "\u2014"}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <StatusBadge status={attendance.status} />
                                {rank && (
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                                        style={{ backgroundColor: rank.color + "22", color: rank.color }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rank.color }} />
                                        {isRtl ? rank.name_ar : rank.name_en}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto mt-16 px-8 pb-4 custom-scrollbar space-y-8">

                    {/* Two-column info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Contact Info */}
                        <div className="space-y-5">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">
                                {t("contactInfo", "Contact Info")}
                            </h4>

                            <InfoItem
                                icon={<Mail className="w-4 h-4" />}
                                label={t("email", "Email")}
                                value={user?.email}
                                hoverColor="group-hover:bg-indigo-50 group-hover:text-indigo-600"
                            />
                            <InfoItem
                                icon={<Phone className="w-4 h-4" />}
                                label={t("phone", "Phone")}
                                value={user?.phone}
                                valueDir="ltr"
                                hoverColor="group-hover:bg-emerald-50 group-hover:text-emerald-600"
                            />
                            <InfoItem
                                icon={<Globe className="w-4 h-4" />}
                                label={t("country", "Country")}
                                value={student?.country}
                                hoverColor="group-hover:bg-amber-50 group-hover:text-amber-600"
                            />
                        </div>

                        {/* Check-in Info */}
                        <div className="space-y-5">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">
                                {t("checkin_info", "Check-in Info")}
                            </h4>

                            <InfoItem
                                icon={<Calendar className="w-4 h-4" />}
                                label={t("attendance_date", "Attendance Date")}
                                value={formatDate(attendance.attendanceDate)}
                                hoverColor="group-hover:bg-indigo-50 group-hover:text-indigo-600"
                            />
                            <InfoItem
                                icon={<Clock3 className="w-4 h-4" />}
                                label={t("checkin_time", "Check-in Time")}
                                value={formatTime(attendance.checkedInAt)}
                                valueDir="ltr"
                                hoverColor="group-hover:bg-emerald-50 group-hover:text-emerald-600"
                            />
                            <InfoItem
                                icon={<User className="w-4 h-4" />}
                                label={t("type", "Type")}
                                value={t(`type_${student?.type}`, student?.type)}
                                hoverColor="group-hover:bg-fuchsia-50 group-hover:text-fuchsia-600"
                            />
                        </div>
                    </div>

                    {/* Attendance History */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] flex items-center gap-2">
                                <History className="w-3.5 h-3.5" />
                                {t("attendance_history", "Attendance History")}
                            </h4>
                            {totalItems > 0 && (
                                <span className="text-[10px] font-bold text-gray-400">
                                    {totalItems} {t("records", "records")}
                                </span>
                            )}
                        </div>

                        <div className="rounded-2xl border border-gray-100 overflow-hidden">
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs font-medium">{t("loading", "Loading...")}</span>
                                </div>
                            ) : historyItems.length === 0 ? (
                                <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
                                    <History className="w-8 h-8 text-gray-300 mb-3" />
                                    <p className="text-sm font-bold text-gray-500">
                                        {t("no_history", "No attendance history found.")}
                                    </p>
                                </div>
                            ) : (
                                <div className={`divide-y divide-gray-50 transition-opacity ${historyFetching ? "opacity-60" : ""}`}>
                                    {historyItems.map((item) => (
                                        <HistoryRow
                                            key={item.id}
                                            item={item}
                                            onStatusChange={handleStatusChange}
                                            isUpdating={updatingItemId === item.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-gray-400 font-bold">
                                    {t("page", "Page")} {historyPage} / {totalPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                                        disabled={historyPage === 1 || historyFetching}
                                        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 transition-colors"
                                        id="history-prev-btn"
                                    >
                                        {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setHistoryPage(i + 1)}
                                            disabled={historyFetching}
                                            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                                historyPage === i + 1
                                                    ? "bg-[#800020] text-white shadow-sm"
                                                    : "text-gray-500 hover:bg-gray-100"
                                            }`}
                                            id={`history-page-${i + 1}-btn`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={historyPage === totalPages || historyFetching}
                                        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 transition-colors"
                                        id="history-next-btn"
                                    >
                                        {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 bg-white shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl transition-all font-bold text-xs shadow-lg active:scale-95"
                    >
                        {t("close", "Close")}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
}

/* ── Helper ── */
function InfoItem({
    icon,
    label,
    value,
    valueDir,
    hoverColor = "",
}: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
    valueDir?: string;
    hoverColor?: string;
}) {
    return (
        <div className="flex items-start gap-4 group">
            <div className={`p-2.5 rounded-xl bg-gray-50 text-gray-400 transition-colors ${hoverColor}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-bold text-gray-800 break-all" dir={valueDir}>{value ?? "\u2014"}</p>
            </div>
        </div>
    );
}
