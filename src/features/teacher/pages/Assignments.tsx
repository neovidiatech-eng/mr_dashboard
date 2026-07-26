import { useState, useMemo } from 'react';
import { Search, Trash2, Edit2, Plus, ClipboardCheck, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, FileText, Download } from 'lucide-react';
import { baseURL } from '../../../consts';
import { useLanguage } from '../../../contexts/LanguageContext';
import AddAssignmentModal from '../../../components/modals/AddAssignmentModal';
import { useConfirm } from '../../../hooks/useConfirm';
import { useGetAssignments, useDeleteAssignment } from '../../../hooks/useAssignment';
import { HomeworkItem } from '../../../types/assignment';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { Table, Dropdown } from 'antd';

export default function Assignments() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<HomeworkItem | null>(null);

  const { confirm, ConfirmDialog } = useConfirm();
  const deleteMutation = useDeleteAssignment();
  const itemsPerPage = 10;

  const { data: assignmentsData, isLoading } = useGetAssignments();
  const assignments: HomeworkItem[] = assignmentsData?.data?.items || [];

  const text = {
    title: { ar: 'إدارة الواجبات', en: 'Assignment Management' },
    subtitle: { ar: 'إنشاء وتتبع الواجبات المسندة للطلاب', en: 'Create and track student assignments' },
    search: { ar: 'بحث بالطالب أو العنوان...', en: 'Search by student or title...' },
    addAssignment: { ar: 'إضافة واجب', en: 'Add Assignment' },
    totalAssignments: { ar: 'إجمالي الواجبات', en: 'Total Assignments' },
    pendingCount: { ar: 'قيد الانتظار', en: 'Pending' },
    submittedCount: { ar: 'تم التسليم', en: 'Submitted' },
    completedCount: { ar: 'مكتملة', en: 'Completed' },
    student: { ar: 'الطالب', en: 'Student' },
    teacher: { ar: 'المعلم', en: 'Teacher' },
    titleCol: { ar: 'العنوان', en: 'Title' },
    description: { ar: 'الوصف', en: 'Description' },
    dueDate: { ar: 'تاريخ التسليم', en: 'Due Date' },
    status: { ar: 'الحالة', en: 'Status' },
    actions: { ar: 'الإجراءات', en: 'Actions' },
    allStatuses: { ar: 'كل الحالات', en: 'All Statuses' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    submitted: { ar: 'تم التسليم', en: 'Submitted' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    edit: { ar: 'تعديل', en: 'Edit' },
    delete: { ar: 'حذف', en: 'Delete' },
    deleteTitle: { ar: 'حذف واجب', en: 'Delete Assignment' },
    deleteMessage: { ar: 'هل أنت متأكد من حذف هذا الواجب؟', en: 'Are you sure you want to delete this assignment?' },
    noResults: { ar: 'لا توجد واجبات تطابق بحثك', en: 'No assignments match your search' },
    attachmentsCol: { ar: 'المرفقات', en: 'Attachments' },
  };

  const stats = useMemo(() => [
    {
      id: 'total',
      label: text.totalAssignments[language],
      value: assignments.length,
      icon: ClipboardCheck,
      bgColor: 'bg-indigo-50/50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'pending',
      label: text.pendingCount[language],
      value: assignments.filter(a => a.status === 'pending').length,
      icon: Clock,
      bgColor: 'bg-amber-50/50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      id: 'submitted',
      label: text.submittedCount[language],
      value: assignments.filter(a => a.status === 'submitted').length,
      icon: AlertCircle,
      bgColor: 'bg-blue-50/50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'completed',
      label: text.completedCount[language],
      value: assignments.filter(a => a.status === 'completed').length,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  ], [assignments, language]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const studentName = assignment.student?.user?.name || '';
      const teacherName = assignment.teacher?.user?.name || '';
      const matchesSearch =
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const currentAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditAssignment = (assignment: HomeworkItem) => {
    setShowAddModal(true);
    setEditingAssignment(assignment);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    const confirmed = await confirm({
      title: text.deleteTitle[language],
      message: text.deleteMessage[language],
    });
    if (confirmed) {
      deleteMutation.mutate(assignmentId);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAssignment(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200/50 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.2)]';
      case 'submitted': return 'bg-blue-50 text-blue-600 border-blue-200/50 shadow-[0_2px_10px_-3px_rgba(59,130,246,0.2)]';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.2)]';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, Record<string, string>> = {
      pending: text.pending,
      submitted: text.submitted,
      completed: text.completed,
    };
    return map[status]?.[language] || status;
  };

  const columns = [
    {
      title: text.student[language],
      render: (_: any, record: HomeworkItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {(record.student?.user?.name || '?')[0]}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{record.student?.user?.name || '—'}</div>
            <div className="text-[11px] font-bold text-gray-400 mt-0.5">{record.student?.user?.email || ''}</div>
          </div>
        </div>
      ),
    },
    {
      title: text.teacher[language],
      render: (_: any, record: HomeworkItem) => (
        <span className="text-sm font-bold text-gray-700">{record.teacher?.user?.name || '—'}</span>
      ),
    },
    {
      title: text.titleCol[language],
      render: (_: any, record: HomeworkItem) => (
        <span className="text-sm font-bold text-gray-900">{record.title}</span>
      ),
    },
    {
      title: text.description[language],
      render: (_: any, record: HomeworkItem) => (
        <span className="text-sm text-gray-500 block max-w-[200px] truncate">{record.description}</span>
      ),
    },
    {
      title: text.dueDate[language],
      render: (_: any, record: HomeworkItem) => (
        <span className="text-sm font-bold text-gray-600">
          {new Date(record.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </span>
      ),
    },
    {
      title: text.status[language],
      render: (_: any, record: HomeworkItem) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(record.status)}`}>
          {getStatusLabel(record.status)}
        </span>
      ),
    },
    {
      title: text.attachmentsCol[language],
      render: (_: any, record: HomeworkItem) => (
        <div className="flex flex-col gap-1">
          {record.attachments && record.attachments.length > 0 ? (
            record.attachments.map((file, idx) => (
              <a 
                key={idx}
                href={`${baseURL}/${file.path}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:text-white hover:bg-indigo-600 transition-all bg-indigo-50/50 px-2.5 py-1.5 rounded-xl group w-fit border border-indigo-100/30"
              >
                <FileText className="w-3 h-3" />
                <span className="max-w-[100px] truncate uppercase tracking-tighter">{file.name}</span>
                <Download className="w-3 h-3" />
              </a>
            ))
          ) : (
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">—</span>
          )}
        </div>
      ),
    },
    {
      title: text.actions[language],
      align: 'right' as const,
      render: (_: any, record: HomeworkItem) => {
        const items = [
          {
            key: 'edit',
            label: <span className="flex items-center gap-2 text-xs font-bold text-gray-700"><Edit2 className="w-3.5 h-3.5" /> {text.edit[language]}</span>,
            onClick: () => handleEditAssignment(record),
          },
          {
            key: 'delete',
            label: <span className="flex items-center gap-2 text-xs font-bold text-red-600"><Trash2 className="w-3.5 h-3.5" /> {text.delete[language]}</span>,
            danger: true,
            onClick: () => handleDeleteAssignment(record.id),
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
    },
  ];

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto p-4 custom-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">{text.title[language]}</h1>
          <p className="text-gray-500 text-sm font-medium">{text.subtitle[language]}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-8 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-2xl transition-all font-black text-sm shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {text.addAssignment[language]}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`${stat.bgColor} rounded-[32px] p-6 border border-white shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3.5 rounded-2xl ${stat.iconBg} transition-all group-hover:scale-110 group-hover:rotate-6 duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="text-start relative z-10">
              <p className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
            {/* Subtle Decorative Circle */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${stat.iconBg} group-hover:scale-150 transition-transform duration-500`} />
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-8 py-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
            <input
              type="text"
              placeholder={text.search[language]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-2.5 bg-gray-50 border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:bg-white transition-colors placeholder:text-gray-400`}
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full pl-5 pr-10 py-2.5 bg-gray-50 border-none rounded-full text-sm font-bold text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="all">{text.allStatuses[language]}</option>
                <option value="pending">{text.pending[language]}</option>
                <option value="submitted">{text.submitted[language]}</option>
                <option value="completed">{text.completed[language]}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-8"><TableSkeleton rows={itemsPerPage} columns={7} /></div>
          ) : currentAssignments.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400 font-medium flex-col gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <span className="text-sm font-bold">{text.noResults[language]}</span>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={currentAssignments}
              rowKey="id"
              pagination={false}
              className="w-full min-w-[900px]"
              rowClassName="hover:bg-gray-50/50 transition-colors group cursor-pointer"
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && filteredAssignments.length > 0 && (
          <div className="p-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold ml-2">
              {language === 'ar' ? 'عرض' : 'Showing'} {(currentPage - 1) * itemsPerPage + 1} {language === 'ar' ? 'إلى' : 'to'} {Math.min(currentPage * itemsPerPage, filteredAssignments.length)} {language === 'ar' ? 'من' : 'of'} {filteredAssignments.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30 transition-all active:scale-90 border border-transparent hover:border-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-200 scale-110' : 'text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30 transition-all active:scale-90 border border-transparent hover:border-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddAssignmentModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        initialData={editingAssignment}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .ant-table-thead > tr > th {
          background-color: #fcfcfd !important;
          color: #9ca3af !important;
          font-size: 10px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 20px 24px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 20px 24px !important;
          transition: all 0.2s !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }
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
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />

      {ConfirmDialog}
    </div>
  );
}