import React from "react";
import { Search, Monitor, Pencil, LogOut } from "lucide-react";
import { Table, Tag, Space, Button, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useJoinSession, useUserSessions, useEndSession } from "../../../hooks/useSessions";
import { Schedule, Student } from "../../../types/scheduales";
import AddRequestModal from "../components/AddRequestModal";
import FeedbackModal from "../components/FeedbackModal";

const ClassesPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [requestModal, setRequestModal] = React.useState<{ visible: boolean; id: string; title: string }>({
    visible: false,
    id: "",
    title: "",
  });

  const [feedbackModal, setFeedbackModal] = React.useState<{ visible: boolean; id: string; title: string }>({
    visible: false,
    id: "",
    title: "",
  });

  const [currentTab, setCurrentTab] = React.useState<"History" | "Today" | "Upcoming">("Today");

  const { data: userSessions, isLoading } = useUserSessions(search);
  const { mutateAsync: joinSession } = useJoinSession()
  const { mutateAsync: endSession } = useEndSession()
  const sessions = React.useMemo(() => {
    if (!userSessions?.data) return [];

    let data: Schedule[] = [];
    if (currentTab === "Upcoming") data = userSessions.data.upcomingSchedule || [];
    else if (currentTab === "Today") data = userSessions.data.toDaySchedule || [];
    else if (currentTab === "History") data = userSessions.data.previousSchedule || [];

    return [...data].sort((a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
  }, [userSessions, currentTab]);

  const handleJoinSession = async (id: string, link: string) => {
    try {
      await joinSession(id);
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (error) {
      // Error is handled by the global axios interceptor in axios.ts
    }

  };

  const handleEndSession = async (id: string) => {
    try {
      await endSession(id);
    } catch (error) {
      // Error is handled by the global axios interceptor
    }
  };

  const handleOpenFeedback = (record: Schedule) => {
    setFeedbackModal({
      visible: true,
      id: record.id,
      title: record.title,
    });
  };




  const columns: ColumnsType<Schedule> = [

{
  title: "Order",
  dataIndex: "order",
  key: "order",
  width: 120,
  align: "center",
  render: (_: any, record: Schedule) => (
    <span className="font-bold text-black">
      {record.order ?? "-"}
    </span>
  ),
},
    {
      title: "STUDENT",
      dataIndex: "student",
      width: 200,
      key: "student",
      render: (student: Student) => (
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-700">{student.user.name}</span>
        </div>
      ),
    },
    {
      title: "LESSON",
      dataIndex: "title",
      key: "lesson",
      width: 220,
      render: (text) => (
        <span className="font-semibold text-slate-600">{text}</span>
      ),
    },

    {
      title: "TYPE",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => (
        <Tag
          className="rounded-full px-4 py-0.5 border-none font-bold text-[10px] uppercase tracking-wider"
          color={type === "Live" ? "green" : "purple"}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      width: 150,
      render: (language: string) => (
        <span className="px-3 py-1 bg-slate-50 border border-gray-100 rounded-lg text-[11px] font-bold text-slate-500">
          {language ? language.toUpperCase() : "N/A"}
        </span>
      ),
    },
    {
      title: "SCHEDULE",
      dataIndex: "start_time",
      key: "schedule",
      width: 200,
      sorter: (a: Schedule, b: Schedule) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      render: (time) => (
        <span className="text-sm font-bold text-slate-600">
          {new Date(time).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (status) => (
        <span className="text-sm font-semibold text-slate-500 uppercase">{status}</span>
      ),
    },

    {
      title: "Materials",
      key: "materials",
      width: 140,
      render: (_: any, record: Schedule) => (
        <Space size="middle">
          <Tooltip
            placement="top"
            color="white"
            overlayInnerStyle={{ padding: '2px' }}
            title={
              <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-lg">
                {record.videoUrl && (
                  <a
                    href={record.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white text-blue-600 rounded-md text-[10px] font-bold shadow-sm hover:text-blue-700 transition-all whitespace-nowrap"
                  >
                    VIDEO
                  </a>
                )}
                {record.slidesUrl && (
                  <a
                    href={record.slidesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-slate-400 hover:text-blue-600 hover:bg-white/50 rounded-md text-[10px] font-bold transition-all whitespace-nowrap"
                  >
                    SLIDES
                  </a>
                )}
              </div>
            }
          >
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2 px-3 py-1.5 border border-blue-100 bg-blue-50/30 rounded-full text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-all"
            >
              <Monitor size={12} />
              Materials
            </a>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 280,
      render: (record: Schedule) => {
        const isCompleted = record.status?.toLowerCase() === "completed";
        return (
        <Space size="small">
          {record.link && (
            <a
              href={isCompleted ? undefined : record.link}
              target={isCompleted ? undefined : "_blank"}
              rel="noreferrer"
              onClick={(e) => {
                e.preventDefault();
                if (!isCompleted) handleJoinSession(record.id, record.link);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all ${
                isCompleted 
                  ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed" 
                  : "border-blue-100 bg-blue-50/30 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <Monitor size={12} /> Join Class
            </a>
          )}

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isCompleted) handleEndSession(record.id);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all ${
              isCompleted
                ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                : "border-red-100 bg-red-50/30 text-red-600 hover:bg-red-100"
            }`}
          >
            <LogOut size={12} /> End Session
          </a>
        </Space>
      )},
    },

    {
      title: "FEEDBACK",
      key: "feedback",
      width: 100,
      render: (record: Schedule) => (
        <Button
          type="primary"
          icon={<Pencil size={14} />}
          onClick={() => handleOpenFeedback(record)}
          className="bg-[#2563eb] h-9 w-9 flex items-center justify-center rounded-lg shadow-blue-500/20"
        />
      ),
    },
  ];


  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto animate-fade-in w-full overflow-x-hidden">
      {/* Main Header */}
      <header className="mb-10 pl-1 flex justify-between items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 font-['Outfit']">
            Classes
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Manage and track all your teaching sessions
          </p>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 flex flex-col gap-6 mb-8 shadow-sm">
        <div className="relative w-full">
          <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full pl-12 sm:pl-14 pr-6 py-3.5 sm:py-4 rounded-xl border border-gray-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm sm:text-base placeholder:text-slate-400"
            placeholder="Search by student or lesson..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {(["History", "Today", "Upcoming"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`flex-1 md:min-w-[120px] px-4 sm:px-8 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${currentTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>


        </div>
      </div>

      {/* Classes Table using Ant Design */}
      <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white dashboard-table">
        <Table
          columns={columns}
          dataSource={sessions}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            className: "px-6 py-4",
          }}
          className="custom-antd-table"
          scroll={{ x: 1400 }}
        />
      </div>

      <AddRequestModal
        visible={requestModal.visible}
        onClose={() => setRequestModal({ ...requestModal, visible: false })}
        sessionId={requestModal.id}
        sessionTitle={requestModal.title}
      />

      <FeedbackModal
        visible={feedbackModal.visible}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
        sessionId={feedbackModal.id}
        sessionTitle={feedbackModal.title}
      />

      <style>{`
        .dashboard-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          padding: 20px 32px;
          border-bottom: 1px solid #f1f5f9;
        }
        .dashboard-table .ant-table-tbody > tr > td {
          padding: 24px 32px;
          border-bottom: 1px solid #f8fafc;
        }
        .dashboard-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .dashboard-table .ant-table-container::-webkit-scrollbar,
        .dashboard-table .ant-table-content::-webkit-scrollbar,
        .dashboard-table .ant-table-body::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .dashboard-table .ant-table-container,
        .dashboard-table .ant-table-content,
        .dashboard-table .ant-table-body {
          -ms-overflow-style: none !important;  /* IE and Edge */
          scrollbar-width: none !important;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default ClassesPage;

