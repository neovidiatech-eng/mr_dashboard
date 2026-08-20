import { useState, useMemo } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Users,
    UserCheck,
    UserX,
    ClipboardList,
    Eye,
    Pencil,
    Trash2,
    MoreVertical,
} from "lucide-react";
import { useGetAllAttendance, useGetTodayAttendance, useDeleteAttendance } from "../hooks/useAttendance";
import { AttendanceItem } from "../../../types/attendance";
import ViewAttendance from "../../../components/modals/ViewAttendance";
import EditAttendance from "../../../components/modals/EditAttendance";
import ConfirmModal from "../../../components/modals/ConfirmModal";

import { Table, Dropdown } from "antd";
import { useTranslation } from "react-i18next";

export default function Attendance() {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const { data: attendanceData, isLoading } = useGetAllAttendance(currentPage, itemsPerPage);
    const { data: todayData } = useGetTodayAttendance();
    const deleteAttendanceMutation = useDeleteAttendance();

    const [selectedAttendance, setSelectedAttendance] = useState<AttendanceItem | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const allItems: AttendanceItem[] = attendanceData?.data?.items ?? [];

    const totalOnsiteStudents = todayData?.data?.totalOnsiteStudents ?? 0;
    const checkedInToday = todayData?.data?.checkedInToday ?? 0;
    const remainingToScan = todayData?.data?.remainingToScan ?? 0;
    const presentCount = todayData?.data?.stats?.present ?? 0;
    const lateCount = todayData?.data?.stats?.late ?? 0;
    const absentCount = todayData?.data?.stats?.absent ?? 0;


    const filteredItems = useMemo(() => {
        if (!searchTerm) return allItems;
        const lower = searchTerm.toLowerCase();
        return allItems.filter(
            (item) =>
                item.student?.user?.name?.toLowerCase().includes(lower) ||
                item.student?.user?.email?.toLowerCase().includes(lower) ||
                item.status?.toLowerCase().includes(lower),
        );
    }, [allItems, searchTerm]);

    const pagination = attendanceData?.data?.pagination;
    const totalItems = pagination?.totalItems ?? filteredItems.length;
    const totalPages = pagination?.totalPages ?? Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarStyle = (name: string) => {
        const styles = [
            "bg-indigo-100 text-indigo-600",
            "bg-fuchsia-100 text-fuchsia-600",
            "bg-amber-100 text-amber-600",
            "bg-blue-100 text-blue-600",
            "bg-emerald-100 text-emerald-600",
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
        return styles[hash % styles.length];
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "present":
                return "bg-green-50 text-green-600";
            case "late":
                return "bg-amber-50 text-amber-600";
            case "absent":
                return "bg-red-50 text-red-600";
            case "excused":
                return "bg-blue-50 text-blue-600";
            default:
                return "bg-gray-50 text-gray-600";
        }
    };

    const stats = useMemo(() => [
        {
            id: 'total',
            label: t('totalStudents'),
            value: totalOnsiteStudents,
            icon: Users,
            bgColor: 'bg-indigo-50/50',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
        },
        {
            id: 'checkedIn',
            label: t('activeStudents'),
            value: checkedInToday,
            icon: UserCheck,
            bgColor: 'bg-emerald-50/50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
        {
            id: 'remaining',
            label: t('pendingStudents'),
            value: remainingToScan,
            icon: UserX,
            bgColor: 'bg-amber-50/50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
        {
            id: 'present',
            label: t('status_present', 'Present'),
            value: presentCount,
            icon: ClipboardList,
            bgColor: 'bg-fuchsia-50/50',
            iconBg: 'bg-fuchsia-100',
            iconColor: 'text-fuchsia-600',
        },
    ], [totalOnsiteStudents, checkedInToday, remainingToScan, presentCount, lateCount, absentCount, t]);

    const handleViewAttendance = (attendance: AttendanceItem) => {
        setSelectedAttendance(attendance);
        setIsViewModalOpen(true);
    };

    const handleEditAttendance = (attendance: AttendanceItem) => {
        setSelectedAttendance(attendance);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deleteAttendanceMutation.mutate(itemToDelete);
            setItemToDelete(null);
        }
    };

    const columns = [
        {
            title: t('table_order', "#"),
            render: (_: unknown, __: AttendanceItem, index: number) => (
                <div className="font-bold text-gray-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                </div>
            ),
        },
        {
            title: t('table_student', "Student"),
            render: (_: unknown, record: AttendanceItem) => {
                const name = record.student?.user?.name || "Unknown";
                const email = record.student?.user?.email || "";
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarStyle(name)}`}
                        >
                            {getInitials(name)}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">{name}</div>
                            <div className="text-xs text-gray-400">{email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: t('table_rank', "Rank"),
            render: (_: unknown, record: AttendanceItem) => {
                const rank = record.student?.rank;
                if (!rank) return <span className="text-gray-400 text-sm">-</span>;
                return (
                    <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: rank.color + "22", color: rank.color }}
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: rank.color }}
                        />
                        {i18n.language === "ar" ? rank.name_ar : rank.name_en}
                    </span>
                );
            },
        },
        {
            title: t('table_attendance_date', "Attendance Date"),
            render: (_: unknown, record: AttendanceItem) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                        {formatDate(record.attendanceDate)}
                    </span>
                </div>
            ),
        },
        {
            title: t('table_checkin_time', "Check-in Time"),
            render: (_: unknown, record: AttendanceItem) => (
                <span className="text-sm font-bold text-gray-700" dir="ltr">
                    {formatTime(record.checkedInAt)}
                </span>
            ),
        },
        {
            title: t('table_status', "Status"),
            render: (_: unknown, record: AttendanceItem) => (
                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] tracking-widest uppercase font-bold ${getStatusBadgeStyle(record.status)}`}
                >
                    {t(`status_${record.status}`, record.status.toUpperCase())}
                </span>
            ),
        },
        {
            title: t('actions'),
            align: 'right' as const,
            render: (_: any, record: AttendanceItem) => {
                const items = [
                    {
                        key: 'view',
                        label: <span className="flex items-center gap-2 text-xs font-bold text-gray-700"><Eye className="w-3.5 h-3.5" /> {t('view')}</span>,
                        onClick: () => handleViewAttendance(record),
                    },
                    {
                        key: 'edit',
                        label: <span className="flex items-center gap-2 text-xs font-bold text-gray-700"><Pencil className="w-3.5 h-3.5" /> {t('edit')}</span>,
                        onClick: () => handleEditAttendance(record),
                    },
                    {
                        key: 'delete',
                        label: <span className="flex items-center gap-2 text-xs font-bold text-red-600"><Trash2 className="w-3.5 h-3.5" /> {t('delete')}</span>,
                        danger: true,
                        onClick: () => handleDeleteClick(record.id),
                    },
                ];
                return (
                    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </Dropdown>
                );
            },
        }
    ];

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto p-2 custom-scrollbar" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className={`${stat.bgColor} rounded-[24px] p-3 border border-gray-100 hover:shadow-md transition-all group`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.iconBg} transition-colors group-hover:scale-110 duration-300`}>
                                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                        </div>
                        <div className="text-start">
                            <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                {/* Page Title */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            {t('attendance_management', 'Attendance')}
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">
                            {t('attendance_subtitle', 'Track and monitor student attendance records.')}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="px-8 pb-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t('search_attendance_placeholder', "Search by student name, email, or status...")}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#800020] focus:bg-white transition-colors placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={filteredItems}
                        rowKey="id"
                        loading={isLoading}
                        pagination={false}
                        locale={{ emptyText: t('no_data', 'No data') }}
                        className="w-full min-w-[700px]"
                        rowClassName="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    />
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold ml-2">
                        {t('showing', 'Showing')}{" "}
                        {(currentPage - 1) * itemsPerPage + (totalItems > 0 ? 1 : 0)}{" "}
                        {t('to', 'to')}{" "}
                        {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
                        {t('of', 'of')} {totalItems}{" "}
                        {t('records', 'records')}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${currentPage === i + 1
                                    ? "bg-[#800020] text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .ant-table-content::-webkit-scrollbar,
        .overflow-x-auto::-webkit-scrollbar { display: none; }
        .ant-table-content, .overflow-x-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .ant-table-thead > tr > th {
          background-color: white !important;
          color: #9ca3af !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          border-bottom: 1px solid #f9fafb !important;
          border-top: 1px solid #f9fafb !important;
          padding: 16px 24px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f9fafb !important;
          padding: 16px 24px !important;
        }
      `,
                }}
            />

            {/* Modals */}
            <ViewAttendance
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedAttendance(null);
                }}
                attendance={selectedAttendance}
            />

            <EditAttendance
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedAttendance(null);
                }}
                attendance={selectedAttendance}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
