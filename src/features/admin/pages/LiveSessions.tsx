import { useState } from "react";
import {
    Search,
    Plus,
    Trash2,
    Video,
    Calendar,
    Clock,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Radio,
    Eye,
    Edit2,
} from "lucide-react";
import { Table, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

// Hooks
import { useGetAllLiveSessions, useDeleteLiveSession } from "../../../hooks/useLiveSessions";

// Modals
import AddLiveSessionModal from "../../../components/modals/AddLiveSessionModal";
import ConfirmModal from "../../../components/modals/ConfirmModal";

// Types
import { LiveSessions as LiveSessionType } from "../../../types/liveSessions";

export default function LiveSessions() {
    const { i18n } = useTranslation();
    const language = i18n.language.split("-")[0];

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals state
    const [showAddModal, setShowAddModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<LiveSessionType | null>(null);

    // Queries & Mutations
    const { data: responseData, isLoading } = useGetAllLiveSessions(currentPage, itemsPerPage, searchTerm);
    const { mutate: deleteSession } = useDeleteLiveSession();

    // Data parsing
    const sessionsList: LiveSessionType[] = Array.isArray(responseData?.data)
        ? responseData.data
        : (responseData?.data?.items || responseData?.items || []);
    const totalItems = responseData?.data?.pagination?.total || responseData?.pagination?.total || responseData?.total || sessionsList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Delete handler
    const handleDeleteSession = (session: LiveSessionType) => {
        setSessionToDelete(session);
    };

    const confirmDelete = () => {
        if (!sessionToDelete) return;
        deleteSession(sessionToDelete.id, {
            onSuccess: () => {
                setSessionToDelete(null);
            },
        });
    };

    // Helper Styles
    const getBadgeStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "live":
                return "bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 animate-pulse";
            case "upcoming":
                return "bg-blue-50 text-blue-600 font-bold border border-blue-200";
            case "completed":
                return "bg-gray-50 text-gray-600 font-bold border border-gray-200";
            default:
                return "bg-amber-50 text-amber-600 font-bold border border-amber-200";
        }
    };

    // Table Columns
    const columns = [
        {
            title: language === "ar" ? "عنوان الجلسة" : "Session / Room Name",
            render: (_: unknown, record: LiveSessionType) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                        <Video className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-900">{record.roomName}</div>
                        <div className="text-xs text-gray-400">ID: {record.id}</div>
                    </div>
                </div>
            ),
        },
        {
            title: language === "ar" ? "المرحلة الدراسية" : "Stage",
            dataIndex: "stageId",
            render: (text: string) => (
                <span className="text-sm font-medium text-gray-700">{text || "—"}</span>
            ),
        },
        {
            title: language === "ar" ? "الخطة" : "Plan",
            dataIndex: "planId",
            render: (text: string) => (
                <span className="text-sm font-medium text-gray-700">{text || "—"}</span>
            ),
        },
        {
            title: language === "ar" ? "الموعد والتاريخ" : "Date & Time",
            render: (_: unknown, record: LiveSessionType) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {dayjs(record.startAt).format("DD/MM/YYYY")}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 mt-0.5 flex items-center gap-1.5" dir="ltr">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {dayjs(record.startAt).format("hh:mm A")}
                    </span>
                </div>
            ),
        },
        {
            title: language === "ar" ? "الحالة" : "Status",
            render: (_: unknown, record: LiveSessionType) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs uppercase ${getBadgeStyle(record.status)}`}>
                    {record.status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                    {record.status}
                </span>
            ),
        },
        {
            title: language === "ar" ? "الإجراءات" : "Actions",
            align: "right" as const,
            render: (_: unknown, record: LiveSessionType) => {
                const items = [
                    {
                        key: "View",
                        label: (
                            <span className="flex items-center gap-2 text-xs font-bold text-black">
                                <Eye className="w-3.5 h-3.5" /> {language === "ar" ? "عرض" : "View"}
                            </span>
                        ),
                        danger: true,
                        // onClick: () => handleViewSession(record),
                    },
                        {
                        key: "Edit",
                        label: (
                            <span className="flex items-center gap-2 text-xs font-bold text-black">
                                <Edit2 className="w-3.5 h-3.5" /> {language === "ar" ? "تعديل" : "Edit"}
                            </span>
                        ),
                        danger: true,
                        // onClick: () => handleEditSession(record),
                    },    {
                        key: "delete",
                        label: (
                            <span className="flex items-center gap-2 text-xs font-bold text-red-600">
                                <Trash2 className="w-3.5 h-3.5" /> {language === "ar" ? "حذف" : "Delete"}
                            </span>
                        ),
                        danger: true,
                        onClick: () => handleDeleteSession(record),
                    },
                ];

                return (
                    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto p-2" dir={language === "ar" ? "rtl" : "ltr"}>
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">

                {/* 1. Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Radio className="w-6 h-6 text-purple-600" />
                            {language === "ar" ? "الجلسات المباشرة (Live Sessions)" : "Live Sessions"}
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">
                            {language === "ar"
                                ? "إدارة ومتابعة الجلسات والبث المباشر للطلاب"
                                : "Manage and monitor live broadcast sessions for cohorts."}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors font-bold text-sm shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            {language === "ar" ? "إضافة جلسة لايف" : "Create Live Session"}
                        </button>
                    </div>
                </div>

                {/* 2. Toolbar & Tabs */}
                <div className="px-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute start-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={language === "ar" ? "بحث باسم الجلسة أو المرحلة أو الخطة..." : "Search sessions..."}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full ps-11 pe-4 py-2.5 bg-gray-50 border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors placeholder:text-gray-400"
                        />
                    </div>

                    {/* <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
                        {(["All", "Live", "Upcoming", "Completed"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setCurrentTab(tab);
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 md:min-w-[100px] px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                                    currentTab === tab
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {tab === "All"
                                    ? language === "ar" ? "الكل" : "All"
                                    : tab === "Live"
                                    ? language === "ar" ? "مباشر الآن" : "Live"
                                    : tab === "Upcoming"
                                    ? language === "ar" ? "القادمة" : "Upcoming"
                                    : language === "ar" ? "المكتملة" : "Completed"}
                            </button>
                        ))}
                    </div> */}
                </div>

                {/* 3. Table */}
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={sessionsList}
                        loading={isLoading}
                        rowKey="id"
                        pagination={false}
                        locale={{ emptyText: language === "ar" ? "لا توجد جلسات لايف" : "No live sessions found" }}
                        className="w-full min-w-[800px]"
                        rowClassName="hover:bg-gray-50/50 transition-colors"
                    />
                </div>

                {/* 4. Pagination */}
                <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold ms-2">
                        {language === "ar"
                            ? `عرض ${(currentPage - 1) * itemsPerPage + (totalItems > 0 ? 1 : 0)} إلى ${Math.min(currentPage * itemsPerPage, totalItems)} من إجمالي ${totalItems} جلسة`
                            : `Showing ${(currentPage - 1) * itemsPerPage + (totalItems > 0 ? 1 : 0)} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} sessions`}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${currentPage === i + 1
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal: Create Live Session */}
            <AddLiveSessionModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
            />

            {/* Modal: Confirm Delete */}
            <ConfirmModal
                isOpen={!!sessionToDelete}
                onClose={() => setSessionToDelete(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
