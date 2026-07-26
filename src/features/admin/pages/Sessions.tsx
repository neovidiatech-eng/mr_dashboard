import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import {
  useSearchSchedules,
  useCreateSchedule,
  useCreateRecurringSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useDeleteGroupedSchedule,
  useGetScheduleById,
} from "../hooks/useSchedules";
import { useTeacher } from "../hooks/useTeacher";
import { useTeacherAvailability } from "../hooks/useTeacherAvailabilty";
import AddSessionModal from "../../../components/modals/AddSessionModal";
import ViewSessionModal from "../../../components/modals/ViewSessionModal";
import EditSessionModal from "../../../components/modals/EditSessionModal";
import EditInstructorModal from "../../../components/modals/EditInstructorModal";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import {
  DayOfWeek,
  Schedule,
  UpdateSchedulePayload,
} from "../../../types/scheduales";
import {
  SessionFormData,
  MultipleSessionsPayload,
} from "../../../lib/schemas/SessionSchema";
import { Table, Dropdown } from "antd";
import { Link } from "react-router-dom";
import { useServerTime } from "../../../hooks/useServerTime";

type GroupedSchedule = Schedule & { groupCount?: number };

export default function Sessions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditInstructorModal, setShowEditInstructorModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Schedule | null>(null);
  const [groupedSessions, setGroupedSessions] = useState<Schedule[]>([]);
  const [currentTab, setCurrentTab] = useState("Today");
  const [sessionToDelete, setSessionToDelete] = useState<Schedule | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const createSchedule = useCreateSchedule();
  const createRecurringSchedule = useCreateRecurringSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const deleteGroupedSchedule = useDeleteGroupedSchedule();
  const { data: fullSessionData } = useGetScheduleById(viewingId || "");
  const { data: instructors } = useTeacher({search: "", page: 1, limit: 1000});
  const { getServerDate } = useServerTime();

  // Fetch today's availability
  const today = getServerDate().toISOString().split("T")[0];
  const { data: availabilityData } = useTeacherAvailability(today, today);

  const handleUpdateSession = async (
    id: string,
    data: UpdateSchedulePayload,
  ) => {
    try {
      await updateSchedule.mutateAsync({ id, data });
      setSelectedSession(null);
      return true;
    } catch (error) {
      console.error("Update session failed:", error);
      return false;
    }
  };

  const handleDeleteSession = (session: Schedule) => {
    setSessionToDelete(session);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      if (sessionToDelete.is_recurring) {
        await deleteGroupedSchedule.mutateAsync(
          sessionToDelete.parent_recurring_id || sessionToDelete.id,
        );
      } else {
        await deleteSchedule.mutateAsync(sessionToDelete.id);
      }
      setSessionToDelete(null);
    } catch (error) {
      console.error("Delete session failed:", error);
    }
  };

  const handleAddSession = async (
    data: SessionFormData | MultipleSessionsPayload,
  ) => {
    try {
      if ("studentId" in data) {
        // Single Session
        const singlePayload: any = {
          studentId: data.studentId,
          teacherId: data.teacherId,
          courseId: data.courseId,
          title: data.title,
          link: data.link || "",
          notes: data.notes || "",
          start_time: new Date(
            `${data.sessionDate}T${data.startTime}`,
          ).toISOString(),
          type: data.type,
          notification_Time: data.notification_Time || "10",
          platform: data.platform,
          language: data.language,
          videoUrl: data.videoUrl,
        };

        // Only include description if it has a value
        if (data.description) {
          singlePayload.description = data.description;
        }
        if (data.notes) {
          singlePayload.notes = data.notes;
        }

        await createSchedule.mutateAsync(singlePayload);

        console.log("CREATE PAYLOAD", singlePayload);
      } else {
        // Batch Session
        const { formData } = data;
        const batchPayload: any = {
          studentId: formData.studentId,
          teacherId: formData.teacherId,
          courseId: formData.courseId,
          link: formData.link || "",
          notes: formData.notes || "",
          startTime: formData.startTime || "00:00",
          days: formData.selectedDays as DayOfWeek[],
          startDate: formData.batchStartDate,
          endDate: formData.batchEndDate,
          notification_Time: formData.notification_Time || "10",
          language: formData.language,
        };

        // Only include description if it has a value
        if (formData.description) {
          batchPayload.description = formData.description;
        }
        if (formData.notes) {
          batchPayload.notes = formData.notes;
        }

        await createRecurringSchedule.mutateAsync(batchPayload);
      }
      return true;
    } catch (error) {
      console.error("Add session failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchResults } = useSearchSchedules(debouncedSearch, 1, 1000);

  const itemsPerPage = 5;
  const rawScheduleData: Schedule[] = useMemo(() => {
    if (!searchResults?.data?.schedule) return [];

    switch (currentTab) {
      case "Upcoming":
        return searchResults.data.schedule.upcomingSchedule || [];
      case "Today":
        return searchResults.data.schedule.toDaySchedule || [];
      case "History":
        return searchResults.data.schedule.previousSchedule || [];
      default:
        return [];
    }
  }, [searchResults, currentTab]);

  const scheduleData = useMemo(() => {
    if (!searchTerm) return rawScheduleData;
    const lowerSearch = searchTerm.toLowerCase();
    return rawScheduleData.filter(
      (s) =>
        s.title?.toLowerCase().includes(lowerSearch) ||
        s.student?.user?.name?.toLowerCase().includes(lowerSearch) ||
        s.teacher?.user?.name?.toLowerCase().includes(lowerSearch) ||
        s.subject?.name?.toLowerCase().includes(lowerSearch),
    );
  }, [rawScheduleData, searchTerm]);

  const groupedMap = new Map<string, GroupedSchedule>();

  scheduleData.forEach((schedule) => {
    const hasParent = !!schedule.parent_recurring_id;

    const key = hasParent ? schedule.parent_recurring_id! : schedule.id;

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        ...schedule,
        groupCount: hasParent ? 1 : undefined,
      });
    } else {
      const existing = groupedMap.get(key)!;

      if (hasParent) {
        existing.groupCount = (existing.groupCount || 1) + 1;

        const existingDate = new Date(existing.start_time).getTime();
        const currentDate = new Date(schedule.start_time).getTime();

        const isHistory = currentTab === "History";
        const shouldUpdate = isHistory
          ? currentDate > existingDate
          : currentDate < existingDate;

        if (shouldUpdate) {
          groupedMap.set(key, {
            ...schedule,
            groupCount: existing.groupCount,
          });
        }
      }
    }
  });

  const groupedSchedules: GroupedSchedule[] = Array.from(
    groupedMap.values(),
  ).sort((a, b) => {
    if (currentTab === "History") {
      return (
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
    }
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const totalItems = groupedSchedules.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const displaySchedules = groupedSchedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: "", time: "" };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { date: dateString, time: "" };
      const formattedDate = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // const endDate = new Date(date.getTime() + 60 * 60 * 1000);
      // const endFormattedTime = endDate.toLocaleTimeString('en-US', {
      //   hour: '2-digit',
      //   minute: '2-digit'
      // });

      return { date: formattedDate, time: `${formattedTime} ` };
    } catch (e) {
      return { date: dateString, time: "" };
    }
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

  const getBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
      case "planned":
      case "upcoming":
        return "bg-blue-50 text-blue-600 font-bold";
      case "completed":
        return "bg-green-50 text-green-600 font-bold";
      case "missed":
      case "cancelled":
        return "bg-red-50 text-red-600 font-bold";
      case "rescheduled":
        return "bg-amber-50 text-amber-600 font-bold";
      default:
        return "bg-gray-50 text-gray-600 font-bold";
    }
  };

  const columns = [
    {
      title: "Order",
      dataIndex: "order",
      render: (text: number) => (
        <div className="font-bold text-gray-700">{text ?? "-"}</div>
      ),
    },

    {
      title: "Student",
      dataIndex: "student",
      render: (_: unknown, record: GroupedSchedule) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarStyle(record.student?.user?.name || "")}`}
          >
            {getInitials(record.student?.user?.name || "")}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
              {record.student?.user?.name || "Unknown"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Instructor",
      render: (_: unknown, record: GroupedSchedule) => (
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.teacher?.user?.name || "T")}&background=f3f4f6&color=4b5563`}
            alt="Instructor"
            className="w-8 h-8 rounded-full object-cover border border-gray-100"
          />
          <span className="text-sm font-bold text-gray-800">
            {record.teacher?.user?.name || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      title: "Lesson",
      render: (_: unknown, record: GroupedSchedule) => {
        return (
          <span className="text-sm font-bold text-gray-800">
            {record.title || "Unknown"}
          </span>
        );
      },
    },

    {
      title: "Date & Time",
      render: (_: unknown, record: GroupedSchedule) => {
        const { date, time } = formatDateTime(record.start_time);
        const isRescheduled = record.status?.toLowerCase() === "rescheduled";
        return (
          <div className="flex flex-col">
            <span
              className={`text-sm font-bold ${isRescheduled ? "text-[#6366f1]" : "text-gray-900"}`}
            >
              {isRescheduled ? "Rescheduled" : date}
            </span>
            <span
              className="text-[11px] font-bold text-gray-400 mt-0.5"
              dir="ltr"
            >
              {isRescheduled ? date : time}
            </span>
          </div>
        );
      },
    },
    {
      title: "Status",
      render: (_: unknown, record: GroupedSchedule) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] tracking-widest uppercase ${getBadgeStyle(record.status || "upcoming")}`}
          >
            {record.status || "UPCOMING"}
          </span>
          {record.is_recurring && (
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">
              Recurring Series ({record.groupCount} sessions)
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Meeting Details",
      render: (_: unknown, record: GroupedSchedule) => {
        const isCompleted = record.status?.toLowerCase() === "completed";
        return (
          <div className="flex items-center gap-1.5">
            {record.link && !isCompleted ? (
              <a
                href={record.link}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#6366f1] font-bold hover:underline flex items-center gap-1.5"
              >
                {record.link.includes("zoom")
                  ? "Join Zoom"
                  : record.link.includes("meet")
                    ? "Google Meet"
                    : "Join Link"}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-sm font-bold text-gray-400">
                {isCompleted ? "Session Completed" : "Link Pending"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Actions",
      align: "right" as const,
      render: (_: unknown, record: GroupedSchedule) => {
        const items = [
          {
            key: "view",
            label: (
              <span className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <Eye className="w-3.5 h-3.5" /> View
              </span>
            ),
            onClick: () => {
              const recurringId = record.parent_recurring_id;
              const relatedSessions = recurringId
                ? scheduleData
                  .filter((s) => s.parent_recurring_id === recurringId)
                  .sort(
                    (a, b) =>
                      new Date(a.start_time).getTime() -
                      new Date(b.start_time).getTime(),
                  )
                : [record];

              setGroupedSessions(relatedSessions);
              setSelectedSession(record);
              setViewingId(record.id);
              setShowViewModal(true);
            },
          },
          {
            key: "edit",
            label: (
              <span className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <Edit className="w-3.5 h-3.5" /> Edit
              </span>
            ),
            onClick: () => {
              setSelectedSession(record);
              setShowEditModal(true);
            },
          },
          {
            key: "delete",
            label: (
              <span className="flex items-center gap-2 text-xs font-bold text-red-600">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </span>
            ),
            danger: true,
            onClick: () => handleDeleteSession(record),
          },
          {
            key:"edit Instructor",
            label: (
              <span className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <Edit className="w-3.5 h-3.5" /> Edit Instructor
              </span>
            ),
            onClick: () => {
              setSelectedSession(record);
              setShowEditInstructorModal(true);
            },
          },
        ];

        return (
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto p-2" dir="ltr">
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Page Title & Create Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Sessions Management
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Manage and monitor academic interactions across all cohorts.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-full transition-colors font-bold text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Session
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by student, instructor, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:bg-white transition-colors placeholder:text-gray-400"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
              {["History", "Today", "Upcoming"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setCurrentTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 md:min-w-[120px] px-4 sm:px-8 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${currentTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={displaySchedules}
            rowKey="id"
            pagination={false}
            className="w-full min-w-[900px]"
            rowClassName="hover:bg-gray-50/50 transition-colors group cursor-pointer"
          />
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-bold ml-2">
            Showing{" "}
            {(currentPage - 1) * itemsPerPage + (totalItems > 0 ? 1 : 0)} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            sessions
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
                    ? "bg-[#6366f1] text-white shadow-sm"
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
        /* Hide scrollbar for the table */
        .ant-table-content::-webkit-scrollbar,
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        .ant-table-content, .overflow-x-auto {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        /* Style dropdown menu items */
        .ant-dropdown-menu .ant-dropdown-menu-item {
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #333 !important;
        }
        
        /* Make Ant Design table header match the design */
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

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mt-8 pb-20">
        {/* Instructor Availability Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-base">
              Instructor Availability
            </h3>
            <Link
              to="/dashboard/teacher-availability"
              className="text-xs text-[#6366f1] font-bold hover:underline"
            >
              View Calendar
            </Link>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {(instructors?.teachers || [])
              .slice(0, 5)
              .map((instructor: any) => {
                // Find matching instructor in availability data
                const availability = availabilityData?.find(
                  (a: any) => a.id === instructor.id,
                );
                const now = getServerDate();
                const currentSchedule = availability?.schedules?.find(
                  (s: any) => {
                    const start = new Date(s.start_time);
                    const end = new Date(s.end_time);
                    return now >= start && now <= end;
                  },
                );

                const isBusy = !!currentSchedule;

                return (
                  <div
                    key={instructor.id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.user?.name || "T")}&background=f3f4f6&color=6366f1&bold=true`}
                          alt="Instructor"
                          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isBusy ? "bg-amber-500" : "bg-emerald-500"}`}
                        ></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-[#6366f1] transition-colors">
                          {instructor.user?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${isBusy ? "text-amber-600" : "text-emerald-600"}`}
                          >
                            {isBusy ? "In Session" : "Available"}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                            {instructor.hour_price}$/hr
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {(!instructors?.teachers || instructors.teachers.length === 0) && (
              <div className="flex flex-col items-center justify-center py-10 opacity-40">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs font-bold text-gray-400">
                  No instructors found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notification Card */}
        <div className="bg-[#6366f1] rounded-[24px] shadow-sm p-7 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          {/* Subtle decoration */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[20%] translate-y-[20%]">
            <div className="w-64 h-64 border-[24px] border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-[24px] border-white rounded-full"></div>
          </div>

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-white" />
              <h3 className="font-bold text-base">Admin Notification</h3>
            </div>
            <p className="text-indigo-50 text-sm font-medium leading-relaxed max-w-[85%]">
              3 students have missed multiple sessions this week. This could
              indicate a risk of churn or academic difficulty. Consider sending
              a batch reminder or checking in.
            </p>
          </div>
          <div className="relative z-10 mt-6">
            <button className="px-6 py-2.5 bg-white text-[#6366f1] text-xs font-bold rounded-full hover:bg-gray-50 transition-colors shadow-sm">
              Review Attendance
            </button>
          </div>
        </div>
      </div>

      <AddSessionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSession}
      />

      <ViewSessionModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingId(null);
        }}
        session={fullSessionData?.data?.schedule || selectedSession}
        groupedSessions={groupedSessions}
      />

      <EditSessionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSave={handleUpdateSession}
      />

      {selectedSession && (
        <EditInstructorModal
          isOpen={showEditInstructorModal}
          onClose={() => {
            setShowEditInstructorModal(false);
            setSelectedSession(null);
          }}
          session={selectedSession}
        />
      )}

      <ConfirmModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
