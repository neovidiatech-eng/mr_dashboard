import { useState, useMemo } from "react";
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
    Play,
    Square,
    LogIn,
} from "lucide-react";
import { Table, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

// Hooks
import { useGetAllLiveSessions, useDeleteLiveSession, useStartExistingLiveSession, useEndExistingLiveSession, useJoinLiveSession } from "../../../hooks/useLiveSessions";

// Modals
import AddLiveSessionModal from "../../../components/modals/AddLiveSessionModal";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import ViewLiveSessionModal from "../../../components/modals/ViewLiveSessionModal";
import JitsiMeeting from "../../../components/modals/JitsiMeeting";

// Types
import { LiveSessions as LiveSessionType } from "../../../types/liveSessions";

//Components
import StartLive from "../components/StartLive";

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
    const [selectedSession, setSelectedSession] = useState<LiveSessionType | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editSession, setEditSession] = useState<LiveSessionType | null>(null);
    const [activeJitsiSession, setActiveJitsiSession] = useState<{ id?: string; roomName: string; title: string; token: string } | null>(null);

    // Queries & Mutations
    const { data: responseData, isLoading } = useGetAllLiveSessions(currentPage, itemsPerPage, searchTerm);
    const { mutate: deleteSession } = useDeleteLiveSession();
    const { mutate: startExistingLive } = useStartExistingLiveSession();
    const { mutate: joinLive } = useJoinLiveSession();
    const { mutate: endExistingLive } = useEndExistingLiveSession();

    // Data parsing & Sorting (من الأقرب للأبعد)
    const sessionsList: LiveSessionType[] = useMemo(() => {
        const rawList: LiveSessionType[] = Array.isArray(responseData?.data)
            ? responseData.data
            : (responseData?.data?.items || responseData?.items || []);

        return [...rawList].sort((a, b) => {
            const timeA = a.startAt ? new Date(a.startAt).getTime() : 0;
            const timeB = b.startAt ? new Date(b.startAt).getTime() : 0;
            return timeA - timeB;
        });
    }, [responseData]);

    const totalItems = responseData?.data?.pagination?.totalItems || responseData?.pagination?.total || responseData?.total || sessionsList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // 1. بدء جلسة جديدة ثم الانضمام تلقائياً لجلب توكن المشرف
    const handleStartLiveSession = (record: LiveSessionType) => {
        startExistingLive(record.id, {
            onSuccess: () => {
                joinLive(record.id, {
                    onSuccess: (joinRes: any) => {
                        const roomName = joinRes?.data?.roomName || joinRes?.roomName || record.roomName;
                        const token = joinRes?.data?.token || joinRes?.token || '';
                        setActiveJitsiSession({ id: record.id, roomName, title: record.title, token });
                    },
                });
            },
        });
    };

    // 2. الانضمام لجلسة بدأت بالفعل والتحقق من التوكن كمودريتور (Join Live Session)
    const handleJoinLiveSession = (record: LiveSessionType) => {
        joinLive(record.id, {
            onSuccess: (res: any) => {
                const roomName = res?.data?.roomName || res?.roomName || record.roomName;
                const token = res?.data?.token || res?.token || '';
                setActiveJitsiSession({ id: record.id, roomName, title: record.title, token });
            },
        });
    };

    const handleEndLiveSession = (record: LiveSessionType | string) => {
        endExistingLive(record);
    };

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
            case "scheduled":
                return "bg-blue-50 text-blue-600 font-bold border border-blue-200";
            case "completed":
                return "bg-gray-50 text-gray-600 font-bold border border-gray-200";
            case "cancelled":
                return "bg-red-50 text-red-700 border border-red-200";
            default:
                return "bg-amber-50 text-amber-600 font-bold border border-amber-200";
        }
    };

    const handleViewSession = (record: LiveSessionType) => {
        setSelectedSession(record);
        setViewModalOpen(true);
    }

    const handleEditSession = (record: LiveSessionType) => {
        setEditSession(record);
        setEditModalOpen(true);
    }

    // Table Columns
    const columns = [
        {
            title: language === "ar" ? "عنوان الجلسة" : "Session Name",
            render: (_: unknown, record: LiveSessionType) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                        <Video className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-900">{record.title}</div>
                    </div>
                </div>
            ),
        },
        {
            title: language === "ar" ? "عنوان الغرفة" : "Room Name",
            render: (_: unknown, record: LiveSessionType) => (
                <div className="flex items-center gap-3">
                    <div>
                        <div className="text-sm font-bold text-gray-900">{record.roomName}</div>
                    </div>
                </div>
            ),
        },
        {
            title: language === "ar" ? "المرحلة الدراسية" : "Stage",
            render: (_: unknown, record: LiveSessionType) => (
                <span className="text-sm font-medium text-gray-700">
                    {(language === "ar" ? record.stage?.name_ar : record.stage?.name_en) || "—"}
                </span>
            ),
        },
        {
            title: language === "ar" ? "الخطة" : "Plan",
            render: (_: unknown, record: LiveSessionType) => (
                <span className="text-sm font-medium text-gray-700">{record.plan?.name || "—"}</span>
            ),
        },
        {
            title: language === "ar" ? "الموعد والتاريخ" : "Date & Time",
            render: (_: unknown, record: LiveSessionType) => (
                <div className="flex flex-col gap-1 items-start w-fit">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{dayjs(record.startAt).format("DD/MM/YYYY")}</span>
                    </span>
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span dir="ltr">{dayjs(record.startAt).format("hh:mm A")}</span>
                    </span>
                </div>
            ),
        },
        {
            title: language === "ar" ? "الحالة" : "Status",
            render: (_: unknown, record: LiveSessionType) => (
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs uppercase ${getBadgeStyle(record.status)}`}>
                        {record.status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                        {record.status}
                    </span>
                    {record.status === "live" && (
                        <button
                            onClick={() => handleJoinLiveSession(record)}
                            title={language === "ar" ? "انضمام للبث" : "Join Stream"}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold shadow-sm shadow-emerald-200 transition-all active:scale-95 animate-pulse"
                        >
                            <LogIn className="w-3 h-3" />
                            {language === "ar" ? "انضمام" : "Join"}
                        </button>
                    )}
                </div>
            ),
        },
        {
            title: language === "ar" ? "الإجراءات" : "Actions",
            align: "right" as const,
            render: (_: unknown, record: LiveSessionType) => {
                const items = [
                    ...(record.status === "scheduled"
                        ? [
                            {
                                key: "start",
                                label: (
                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                        <Play className="w-3.5 h-3.5" /> {language === "ar" ? "بدء البث" : "Start Stream"}
                                    </span>
                                ),
                                danger: false,
                                onClick: () => handleStartLiveSession(record),
                            },
                        ]
                        : []),
                    ...(record.status === "live"
                        ? [
                            {
                                key: "join",
                                label: (
                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                        <LogIn className="w-3.5 h-3.5" /> {language === "ar" ? "انضمام للبث" : "Join Stream"}
                                    </span>
                                ),
                                danger: false,
                                onClick: () => handleJoinLiveSession(record),
                            },
                            {
                                key: "end",
                                label: (
                                    <span className="flex items-center gap-2 text-xs font-bold text-amber-600">
                                        <Square className="w-3.5 h-3.5" /> {language === "ar" ? "إنهاء البث" : "End Stream"}
                                    </span>
                                ),
                                danger: false,
                                onClick: () => handleEndLiveSession(record),
                            },
                        ]
                        : []),
                    {
                        key: "View",
                        label: (
                            <span className="flex items-center gap-2 text-xs font-bold text-black">
                                <Eye className="w-3.5 h-3.5" /> {language === "ar" ? "عرض" : "View"}
                            </span>
                        ),
                        danger: false,
                        onClick: () => handleViewSession(record),
                    },
                    {
                        key: "Edit",
                        label: (
                            <span className="flex items-center gap-2 text-xs font-bold text-black">
                                <Edit2 className="w-3.5 h-3.5" /> {language === "ar" ? "تعديل" : "Edit"}
                            </span>
                        ),
                        danger: false,
                        onClick: () => handleEditSession(record),
                    }, {
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
    console.log(activeJitsiSession?.roomName);
    console.log(activeJitsiSession?.token);

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto p-2 flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
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

                        {


                            Array.from({ length: totalPages }).map((_, i) => (
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
            <StartLive
                onStartLive={() => setShowAddModal(true)}
                onSchedule={() => setShowAddModal(true)}
            />
            {/* Modal: Create / Edit Live Session */}
            <AddLiveSessionModal
                open={showAddModal || editModalOpen}
                initialData={editModalOpen ? editSession : null}
                onClose={() => {
                    setShowAddModal(false);
                    setEditModalOpen(false);
                    setEditSession(null);
                }}
            />

            {/* Modal: Confirm Delete */}
            <ConfirmModal
                isOpen={!!sessionToDelete}
                onClose={() => setSessionToDelete(null)}
                onConfirm={confirmDelete}
            />
            <ViewLiveSessionModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                liveSession={selectedSession}
            />

            {/* Jitsi Meeting Full Screen Component */}
            {activeJitsiSession && (
                <JitsiMeeting
                    isOpen={!!activeJitsiSession}
                    onClose={() => setActiveJitsiSession(null)}
                    onEndSession={() => {
                        if (activeJitsiSession.id) {
                            handleEndLiveSession(activeJitsiSession.id);
                        }
                    }}
                    roomName={activeJitsiSession.roomName}
                    token={activeJitsiSession.token}
                    sessionTitle={activeJitsiSession.title}
                />
            )}
        </div>
    );
}
