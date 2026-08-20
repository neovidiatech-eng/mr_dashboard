import React, { useState, useEffect } from "react";
import {
    X,
    CheckCircle2,
    Clock3,
    XCircle,
    Calendar,
    Mail,
    User,
    Loader2,
    Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AttendanceItem, AttendanceStatus } from "../../types/attendance";
import { useUpdateAttendance } from "../../features/admin/hooks/useAttendance";

interface EditAttendanceProps {
    isOpen: boolean;
    onClose: () => void;
    attendance: AttendanceItem | null;
}

export default function EditAttendance({ isOpen, onClose, attendance }: EditAttendanceProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const updateAttendanceMutation = useUpdateAttendance();

    const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>("present");

    useEffect(() => {
        if (attendance) {
            setSelectedStatus(attendance.status ?? "present");
        }
    }, [attendance, isOpen]);

    if (!isOpen || !attendance) return null;

    const { student } = attendance;
    const user = student?.user;
    const rank = student?.rank;

    const getInitials = (name: string) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const statusOptions: {
        value: AttendanceStatus;
        label: string;
        description: string;
        icon: React.ReactNode;
        activeBorder: string;
        activeBg: string;
        iconColor: string;
        badgeColor: string;
    }[] = [
        {
            value: "present",
            label: t("status_present", "Present"),
            description: t("status_present_desc", "Student attended the session on time"),
            icon: <CheckCircle2 className="w-5 h-5" />,
            activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20",
            activeBg: "bg-emerald-50/60",
            iconColor: "text-emerald-600",
            badgeColor: "bg-emerald-500 text-white",
        },
        {
            value: "late",
            label: t("status_late", "Late"),
            description: t("status_late_desc", "Student checked in after start time"),
            icon: <Clock3 className="w-5 h-5" />,
            activeBorder: "border-amber-500 ring-2 ring-amber-500/20",
            activeBg: "bg-amber-50/60",
            iconColor: "text-amber-600",
            badgeColor: "bg-amber-500 text-white",
        },
        {
            value: "absent",
            label: t("status_absent", "Absent"),
            description: t("status_absent_desc", "Student did not attend the session"),
            icon: <XCircle className="w-5 h-5" />,
            activeBorder: "border-red-500 ring-2 ring-red-500/20",
            activeBg: "bg-red-50/60",
            iconColor: "text-red-600",
            badgeColor: "bg-red-500 text-white",
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!attendance) return;

        updateAttendanceMutation.mutate(
            {
                id: attendance.id,
                data: { status: selectedStatus },
            },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div
            className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all"
            dir={isRtl ? "rtl" : "ltr"}
            onClick={(e) => {
                if (e.target === e.currentTarget && !updateAttendanceMutation.isPending) {
                    onClose();
                }
            }}
        >
            <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#800020] to-[#500014] text-white p-6 shrink-0 overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 end-0 w-48 h-48 border-[24px] border-white rounded-full translate-x-1/3 -translate-y-1/3" />
                        <div className="absolute bottom-0 start-0 w-24 h-24 border-[12px] border-white rounded-full -translate-x-1/3 translate-y-1/3" />
                    </div>

                    <button
                        onClick={onClose}
                        disabled={updateAttendanceMutation.isPending}
                        className="absolute top-5 end-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors disabled:opacity-50 z-10"
                        id="edit-attendance-close-btn"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-lg font-black shrink-0">
                            {getInitials(user?.name ?? "")}
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                                {t("edit_attendance", "Edit Attendance")}
                            </span>
                            <h3 className="text-lg font-black text-white leading-tight">
                                {user?.name ?? "—"}
                            </h3>
                            <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(attendance.attendanceDate)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Student Info preview snippet */}
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-600 font-medium truncate">{user?.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-600 font-medium capitalize">
                                {t(`type_${student?.type}`, student?.type || "—")}
                            </span>
                        </div>
                        {rank && (
                            <div className="col-span-2 flex items-center gap-1.5 pt-1 border-t border-gray-100">
                                <span className="text-gray-400 font-bold text-[10px] uppercase">
                                    {t("table_rank", "Rank")}:
                                </span>
                                <span
                                    className="px-2 py-0.5 rounded text-[11px] font-bold"
                                    style={{ backgroundColor: rank.color + "22", color: rank.color }}
                                >
                                    {isRtl ? rank.name_ar : rank.name_en}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Status Selection Cards */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {t("select_attendance_status", "Select Status")}
                        </label>

                        <div className="space-y-2.5">
                            {statusOptions.map((option) => {
                                const isSelected = selectedStatus === option.value;
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => setSelectedStatus(option.value)}
                                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                                            isSelected
                                                ? `${option.activeBorder} ${option.activeBg}`
                                                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-white shadow-sm ${option.iconColor}`}>
                                                {option.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {option.label}
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-medium">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            {isSelected ? (
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${option.badgeColor}`}>
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </span>
                                            ) : (
                                                <span className="w-5 h-5 rounded-full border-2 border-gray-200" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Modal Footer / Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={updateAttendanceMutation.isPending}
                            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors disabled:opacity-50"
                        >
                            {t("cancel", "Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={updateAttendanceMutation.isPending}
                            className="flex-1 px-4 py-3 bg-[#800020] hover:bg-[#66001a] text-white rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {updateAttendanceMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t("saving", "Saving...")}</span>
                                </>
                            ) : (
                                <span>{t("save_changes", "Save Changes")}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
