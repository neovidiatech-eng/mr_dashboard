import { useState, lazy, useMemo, useEffect } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import WhatsAppPhone from "../../../components/ui/WhatsAppPhone";
import { useTranslation } from "react-i18next";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "../hooks/useStudents";
import { usePlans } from "../hooks/usePlans";
import { Student } from "../../../types/student";

import { useConfirm } from "../../../hooks/useConfirm";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import { Table, Dropdown } from "antd";

const AddStudentModal = lazy(
  () => import("../../../components/modals/AddStudentModal"),
);
const ViewStudentModal = lazy(
  () => import("../../../components/modals/ViewStudentModal"),
);
const EditStudentModal = lazy(
  () => import("../../../components/modals/EditStudentModal"),
);

const PasswordCell = ({ password }: { password?: string }) => {
  const [copied, setCopied] = useState(false);
  if (!password) return <span className="text-gray-300">---</span>;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={handleCopy}
      title="Click to copy"
      className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200/80 font-mono text-xs font-semibold transition-all cursor-pointer select-all shadow-2xs"
    >
      <span>{password}</span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
      )}
    </div>
  );
};

const tabs = [
  { label: "all", value: "all", traslationKey:"all", icon: Users },
  { label: "plan", value: "plan", traslationKey:"plan", icon: UserCheck },
  { label: "course", value: "course", traslationKey:"lms_courses_title", icon: UserX },
];

export default function Students() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split("-")[0];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const itemsPerPage = 10;


  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 3000);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: apiResponse, isLoading } = useStudents(
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    activeTab
  );
  const rawData: any = apiResponse?.data;
  const studentsDataStatus = rawData?.status;
  const studentsList: Student[] = Array.isArray(rawData?.studentsData)
    ? rawData.studentsData
    : rawData?.students || [];
  const pagination = rawData?.pagination;
  const totalItems = pagination?.totalItems || studentsList.length;
  const totalPages =
    pagination?.totalPages || Math.ceil(studentsList.length / itemsPerPage);
  const totalStudentsCount = studentsDataStatus?.totalStudents || 0;
  const activeStudentsCount = studentsDataStatus?.activeStudents || 0;
  const pendingStudentsCount = studentsDataStatus?.inactiveStudents || 0;
  const { mutateAsync: createStudent } = useCreateStudent();
  const { mutateAsync: updateStudent } = useUpdateStudent();
  const { mutateAsync: deleteStudent } = useDeleteStudent();
  const { data: plansData } = usePlans();
  const { confirm, ConfirmDialog } = useConfirm();
  console.log({t:t("course")});
  const stats = useMemo(
    () => [
      {
        id: "total",
        label: t("totalStudents"),
        value: totalStudentsCount,
        icon: Users,
        bgColor: "bg-indigo-50/50",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
      },
      {
        id: "active",
        label: t("activeStudents"),
        value: activeStudentsCount,
        icon: UserCheck,
        bgColor: "bg-emerald-50/50",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
      },
      {
        id: "pending",
        label: t("pendingStudents"),
        value: pendingStudentsCount,
        icon: UserX,
        bgColor: "bg-amber-50/50",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        id: "plans",
        label: t("numberOfPlans"),
        value: plansData?.length,
        icon: ClipboardList,
        bgColor: "bg-fuchsia-50/50",
        iconBg: "bg-fuchsia-100",
        iconColor: "text-fuchsia-600",
      },
    ],
    [
      totalStudentsCount,
      activeStudentsCount,
      pendingStudentsCount,
      plansData?.length,
      t,
    ],
  );

  const plans = plansData || [];
  const planFilterOptions = [
    { id: "all", label: t("allPlans"), labelEn: "All Plans" },
    ...plans.map((p) => ({
      id: p.id,
      label: p.name,
      labelEn: p.name,
    })),
  ];

  const countries = [
    { id: "all", label: t("selectCountry"), labelEn: "Select Country" },
    { id: "egypt", label: t("egypt"), labelEn: "Egypt" },
    { id: "saudi", label: t("saudiArabia"), labelEn: "Saudi Arabia" },
  ];

  const filteredStudents = useMemo(() => {
    return studentsList
      .filter((student) => {
        const matchesGrade =
          selectedGrade === "all" || student.planId === selectedGrade;
        const matchesCountry =
          selectedCountry === "all" || student.country === selectedCountry;

        return matchesGrade && matchesCountry;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [studentsList, selectedGrade, selectedCountry]);

  const currentStudents = filteredStudents;

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    const confirmed = await confirm({
      title: t("deleteStudent"),
      message: t("deleteConfirmStudent"),
    });
    if (confirmed) {
      try {
        await deleteStudent(studentId);
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const columns = [
    {
      title: t("studentInfo", "Student Info"),
      render: (_: any, record: Student) => {
        const initial = record.user?.name
          ? record.user.name.charAt(0).toUpperCase()
          : "?";
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                {record.user?.name || "---"}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {record.user?.email || "---"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: t("password", "Password"),
      align: "center" as const,
      render: (_: any, record: Student) => (
        <PasswordCell password={record.user?.password} />
      ),
    },
    {
      title: t("phone", "Phone"),
      render: (_: any, record: Student) => (
        <WhatsAppPhone
          phone={`${record.user?.code_country || ""} ${record.user?.phone || ""}`}
          className="text-xs font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
        />
      ),
    },
    {
      title: t("plan", "Plan"),
      render: (_: any, record: Student) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100/80">
          {record.plan?.name || t("noPlan", "No Plan")}
        </span>
      ),
    },
    {
      title: t("academicRank", "Level / Stage"),
      render: (_: any, record: Student) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
            {language === "ar"
              ? record.stage?.rank?.name_ar || 'لا يوجد مرحلة دراسية'
              : record.stage?.rank?.name_en || "No educational stage"}
          </span>
          {record.stage && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100/80">
              {record.stage?.name_ar ||
                record.stage?.name_en ||
                record.stage?.slug}
            </span>
          )}
        </div>
      ),
    },
    {
      title: t("hours", "Sessions"),
      render: (_: any, record: Student) => {
        const attended = record.sessions_attended || 0;
        const total = record.sessions || 1;
        const pct = Math.min(100, Math.round((attended / total) * 100));
        return (
          <div className="flex flex-col gap-1.5 w-28">
            <div className="flex justify-between items-center text-xs font-medium text-slate-500">
              <span className="font-semibold text-slate-700">
                {attended}/{total}
              </span>
              <span className="text-[11px] text-slate-400">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: t("country", "Country"),
      render: (_: any, record: Student) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200/50 uppercase tracking-wider">
          {record.country || "---"}
        </span>
      ),
    },
    {
      title: t("status", "Status"),
      align: "center" as const,
      render: (_: any, record: Student) => {
        const isActive =
          record.user?.status === "approved" ||
          record.user?.status === "active";
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-amber-50 text-amber-700 border border-amber-200/60"
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {isActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isActive ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            {isActive ? t("active", "Active") : t("pending", "Pending")}
          </span>
        );
      },
    },
    {
      title: t("actions", "Actions"),
      align: language === "ar" ? ("left" as const) : ("right" as const),
      render: (_: any, record: Student) => {
        const items = [
          {
            key: "view",
            label: (
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Eye className="w-3.5 h-3.5 text-indigo-500" /> {t("view", "View")}
              </span>
            ),
            onClick: () => handleViewStudent(record),
          },
          {
            key: "edit",
            label: (
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Pencil className="w-3.5 h-3.5 text-amber-500" /> {t("edit", "Edit")}
              </span>
            ),
            onClick: () => handleEditStudent(record),
          },
          {
            key: "delete",
            label: (
              <span className="flex items-center gap-2 text-xs font-semibold text-red-600">
                <Trash2 className="w-3.5 h-3.5" /> {t("delete", "Delete")}
              </span>
            ),
            danger: true,
            onClick: () => handleDeleteStudent(record.id),
          },
        ];
        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleViewStudent(record)}
              title={t("view", "View")}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditStudent(record)}
              title={t("edit", "Edit")}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <Dropdown
              menu={{ items }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div
      className="space-y-6 max-w-[1500px] mx-auto p-2 custom-scrollbar"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`${stat.bgColor} rounded-[24px] p-3 border border-gray-100 hover:shadow-md transition-all group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl ${stat.iconBg} transition-colors group-hover:scale-110 duration-300`}
              >
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="text-start">
              <p className="text-3xl font-black text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Page Title & Add Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {t("studentManagement")}
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              {t("manageStudentsDescription")}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full transition-colors font-bold text-sm shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t("addNewStudent")}
          </button>
        </div>

         <div
          className={`px-8 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 ${language === "ar" ? "rtl" : "ltr"}`}
        >
          {tabs.map((tab) => {
            
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full justify-center text-sm font-semibold transition-colors ${
                  tab.value === activeTab
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {t(tab.traslationKey)}
              </button>
            );
          })}
        </div>

        {/* Toolbar / Filters */}
        <div className="px-8 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4">
          <div className="relative flex-1 col-span-2 md:col-span-2  w-full ">
            <Search
              className={`absolute ${language === "ar" ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`}
            />
            <input
              type="text"
              placeholder={t("searchUsersPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === "ar" ? "pr-11 pl-4" : "pl-11 pr-4"} py-2.5 bg-gray-50 border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#800020] focus:bg-white transition-colors placeholder:text-gray-400`}
            />
          </div>

          <div className="flex flex-wrap col-span-1 items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[140px]">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none w-full pl-5 pr-10 py-2.5 bg-gray-50 border-none rounded-full text-sm font-bold text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {language === "ar" ? c.label : c.labelEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-[140px]">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none w-full pl-5 pr-10 py-2.5 bg-gray-50 border-none rounded-full text-sm font-bold text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {planFilterOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {language === "ar" ? g.label : g.labelEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
       

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-8">
              <TableSkeleton rows={itemsPerPage} columns={7} />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={currentStudents}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: t("no_data", "No data") }}
              className="w-full min-w-[1000px]"
              rowClassName="hover:bg-gray-50/50 transition-colors group cursor-pointer"
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <div className="p-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold ml-2">
              {t("showing")} {(currentPage - 1) * itemsPerPage + 1} {t("to")}{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} {t("of")}{" "}
              {totalItems} {t("sidebar_students", "Students")}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-[#800020] text-white shadow-sm scale-110"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ant-table {
          background: transparent !important;
        }
        .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 14px 20px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 14px 20px !important;
          vertical-align: middle !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc/80 !important;
        }
      `,
        }}
      />

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (studentData) => {
          try {
            const payload: any = {
              name: studentData.name,
              email: studentData.email,
              phone: studentData.phone,
              phone_code: studentData.phone_code,
              gender: studentData.gender,
              status: studentData.status,
              type: studentData.type,
              country: studentData.country,
              timezone:
                studentData.timezone ||
                Intl.DateTimeFormat().resolvedOptions().timeZone,
              ...(studentData.parentNumber
                ? { parentNumber: studentData.parentNumber }
                : {}),
            };

            if (studentData.birthDate && studentData.birthDate !== "") {
              const birth = new Date(studentData.birthDate);
              const today = new Date();
              let age = today.getFullYear() - birth.getFullYear();
              const m = today.getMonth() - birth.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
              }
              payload.age = age;
            }

            if (studentData.plan && studentData.plan.trim() !== "") {
              payload.planId = studentData.plan;
            }

            if (studentData.rankId && studentData.rankId.trim() !== "") {
              payload.rankId = studentData.rankId;
            }

            if (studentData.stageId && studentData.stageId.trim() !== "") {
              payload.stageId = studentData.stageId;
            }

            if (
              studentData.startingCourseId &&
              studentData.startingCourseId.trim() !== ""
            ) {
              payload.startingCourseId = studentData.startingCourseId;
            }

            if (
              studentData.startingLectureId &&
              studentData.startingLectureId.trim() !== ""
            ) {
              payload.startingLectureId = studentData.startingLectureId;
            }

            if (studentData.password) {
              payload.password = studentData.password;
            }

            if (studentData.image) {
              payload.image = studentData.image;
            }
            await createStudent(payload);
            setCurrentPage(1);
            return true;
          } catch (error) {
            console.error("Error adding student:", error);
            // Detailed error is handled by axios interceptor
            return false;
          }
        }}
      />

      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        studentData={selectedStudent}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        studentData={
          selectedStudent
            ? {
                id: selectedStudent.id,
                name: selectedStudent.user.name,
                email: selectedStudent.user.email,
                phone: selectedStudent.user.phone,
                phone_code: selectedStudent.user.code_country,
                country: selectedStudent.country
                  ? selectedStudent.country.toLowerCase()
                  : "egypt",
                status: (selectedStudent.user.status === "active"
                  ? "approved"
                  : selectedStudent.user.status) as any,
                gender: selectedStudent.gender || "male",
                type: selectedStudent.type || "online",
                plan: selectedStudent.planId || "",
                rankId: selectedStudent.rankId || "",
                stageId: selectedStudent.stageId || "",
                password: selectedStudent.user.password || "",
                confirmPassword: selectedStudent.user.password || "",
                birthDate: selectedStudent.birth_date
                  ? selectedStudent.birth_date.split("T")[0]
                  : "",
                parentNumber:
                  selectedStudent.user.parentNumber ||
                  selectedStudent.parentNumber ||
                  "",
              }
            : null
        }
        onSubmit={async (updatedData) => {
          try {
            const payload: any = {
              name: updatedData.name,
              phone: updatedData.phone,
              phone_code: updatedData.phone_code,
              country: updatedData.country,
              birth_date:
                updatedData.birthDate && updatedData.birthDate !== ""
                  ? new Date(updatedData.birthDate).toISOString()
                  : null,
              gender: updatedData.gender,
              type: updatedData.type,
              status: updatedData.status,
              ...(updatedData.parentNumber
                ? { parentNumber: updatedData.parentNumber }
                : {}),
              password: updatedData.password,
            };

            if (updatedData.plan && updatedData.plan.trim() !== "") {
              payload.planId = updatedData.plan;
            } else {
              payload.planId = null;
            }

            if (updatedData.rankId && updatedData.rankId.trim() !== "") {
              payload.rankId = updatedData.rankId;
            } else {
              payload.rankId = null;
            }

            if (updatedData.stageId && updatedData.stageId.trim() !== "") {
              payload.stageId = updatedData.stageId;
            } else {
              payload.stageId = null;
            }

            if (updatedData.image) {
              payload.image = updatedData.image;
            }

            await updateStudent({ id: updatedData.id, data: payload });
            return true;
          } catch (error) {
            console.error("Error updating student:", error);
            // Detailed error is handled by axios interceptor
            return false;
          }
        }}
      />
      {ConfirmDialog}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          transition: all 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `,
        }}
      />
    </div>
  );
}
