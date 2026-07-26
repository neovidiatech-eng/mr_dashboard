import { useState, useMemo } from 'react';
import { Search, FileText, Star, Download, Trash2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, Rate, Modal } from 'antd';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { TeacherReport, TeacherReportsResponse } from '../../../types/reports';
import dayjs from 'dayjs';
import { useAdminReports, useDeleteAdminReport } from '../../../hooks/useAdminReports';
import type { ColumnsType } from 'antd/es/table';
import ViewReportModal from '../../../components/modals/ViewReportModal';

export default function Reports() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TeacherReport | null>(null);
  const itemsPerPage = 10;

  const { data: reportsResponse, isLoading } = useAdminReports() as { data: TeacherReportsResponse | undefined, isLoading: boolean };
  const { mutateAsync: deleteReport } = useDeleteAdminReport();

  const reportsList = useMemo((): TeacherReport[] => {
    if (!reportsResponse) return [];

    // If data is a direct array
    if (Array.isArray(reportsResponse.data)) {
      return reportsResponse.data;
    }

    // If data is an object with items
    if (reportsResponse.data && 'items' in reportsResponse.data && Array.isArray(reportsResponse.data.items)) {
      return reportsResponse.data.items;
    }

    return [];
  }, [reportsResponse]);

  const stats = useMemo(() => {
    if (!reportsList.length) return [];

    const avgRating = reportsList.reduce((acc: number, curr: TeacherReport) => acc + curr.overallRating, 0) / reportsList.length;


    return [
      {
        id: 'total_reports',
        label: t('totalReports') || 'Total Reports',
        value: reportsList.length,
        icon: FileText,
        bgColor: 'bg-indigo-50/50',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
      },
      {
        id: 'avg_rating',
        label: t('avgRating') || 'Avg Rating',
        value: avgRating.toFixed(1),
        icon: Star,
        bgColor: 'bg-amber-50/50',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
      },
    ];
  }, [reportsList, t]);

  const filteredReports = useMemo(() => {
    return reportsList.filter((report: TeacherReport) => {
      const teacherName = report.teacher?.user?.name?.toLowerCase() || '';
      return teacherName.includes(searchTerm.toLowerCase());
    }).sort((a: TeacherReport, b: TeacherReport) => dayjs(b.weekStarting).unix() - dayjs(a.weekStarting).unix());
  }, [reportsList, searchTerm]);

  const handleDownloadCSV = () => {
    if (!filteredReports.length) return;

    // CSV Header
    const headers = [
      'Teacher Name',
      'Teacher Email',
      'Week Starting',
      'Week Ending',
      'Total Classes',
      'Students Taught',
      'Overall Rating',
      'Summary'
    ];

    // CSV Rows
    const rows = filteredReports.map(report => [
      `"${report.teacher?.user?.name || '---'}"`,
      `"${report.teacher?.user?.email || '---'}"`,
      dayjs(report.weekStarting).format('YYYY-MM-DD'),
      dayjs(report.weekEnding).format('YYYY-MM-DD'),
      report.totalClasses,
      report.studentsTaught,
      report.overallRating,
      `"${report.teachingSummary.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Teacher_Reports_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnsType<TeacherReport> = [
    {
      title: t('teacherLabel') || 'Teacher',
      key: 'teacher',
      render: (_: unknown, record: TeacherReport) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {record.teacher?.user?.name ? record.teacher.user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">{record.teacher?.user?.name || '---'}</span>
            <span className="text-[10px] text-gray-400 font-medium">{record.teacher?.user?.email || '---'}</span>
          </div>
        </div>
      ),
    },
    {
      title: t('week') || 'Week',
      key: 'week',
      render: (_: unknown, record: TeacherReport) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">
            {dayjs(record.weekStarting).format('MMM D')} - {dayjs(record.weekEnding).format('MMM D, YYYY')}
          </span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            {dayjs(record.createdAt).format('YYYY-MM-DD')}
          </span>
        </div>
      ),
    },
    {
      title: t('performance') || 'Performance',
      key: 'performance',
      render: (_: unknown, record: TeacherReport) => (
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t('classes') || 'Classes'}</span>
              <span className="text-sm font-black text-gray-700">{record.totalClasses}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t('students') || 'Students'}</span>
              <span className="text-sm font-black text-gray-700">{record.studentsTaught}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t('summary') || 'Summary',
      dataIndex: 'teachingSummary',
      key: 'teachingSummary',
      width: 300,
      render: (text: string) => (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
          {text}
        </p>
      ),
    },
    {
      title: t('rating') || 'Rating',
      key: 'rating',
      render: (_: unknown, record: TeacherReport) => (
        <div className="flex flex-col gap-1">
          <Rate disabled defaultValue={record.overallRating} className="text-xs text-amber-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">{record.overallRating}/5</span>
        </div>
      ),
    },
    {
      title: t('status') || 'Status',
      key: 'status',
      render: () => (
        <Tag color="blue" className="rounded-full px-3 py-0.5 border-none text-[10px] font-bold uppercase tracking-widest">
          {t('submitted') || 'Submitted'}
        </Tag>
      ),
    },
    {
      title: t('actions') || 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: unknown, record: TeacherReport) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReport(record);
              setIsViewModalOpen(true);
            }}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              Modal.confirm({
                title: t('deleteReportTitle') || 'Delete Report',
                content: t('deleteReportContent') || 'Are you sure you want to delete this report? This action cannot be undone.',
                okText: t('yesDelete') || 'Yes, Delete',
                okType: 'danger',
                cancelText: t('cancel') || 'Cancel',
                onOk: async () => {
                  if (record.id) {
                    await deleteReport(record.id);
                  }
                }
              });
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto p-4 md:p-6 custom-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Teacher Weekly Reports</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">{t('manageReportsDescription') || 'Review and analyze teacher performance reports'}</p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 font-bold text-sm"
        >
          <Download className="w-4 h-4" />
          {t('download') || 'Download'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`${stat.bgColor} rounded-[32px] p-6 border border-white/60 shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="flex items-center gap-5 relative z-10">
              <div className={`p-4 rounded-2xl ${stat.iconBg} transition-all group-hover:scale-110 group-hover:rotate-3 duration-300 shadow-sm`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="text-start">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 bg-gray-50/30 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
            <input
              type="text"
              placeholder={t('searchReports') || 'Search by teacher name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all placeholder:text-gray-400 shadow-sm`}
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-8"><TableSkeleton rows={5} columns={5} /></div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredReports}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => {
                  setSelectedReport(record);
                  setIsViewModalOpen(true);
                }
              })}
              pagination={{
                pageSize: itemsPerPage,
                current: currentPage,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                className: "px-8 py-4",
              }}
              className="w-full min-w-[1000px]"
              rowClassName="hover:bg-gray-50/50 transition-colors cursor-pointer"
            />
          )}
        </div>
      </div>

      <ViewReportModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        reportData={selectedReport}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .ant-table-thead > tr > th {
          background-color: transparent !important;
          color: #9ca3af !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          border-bottom: 1px solid #f9fafb !important;
          padding: 16px 24px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f9fafb !important;
          padding: 16px 24px !important;
        }
        .ant-pagination-item-active {
          border-color: #6366f1 !important;
          background: #6366f1 !important;
        }
        .ant-pagination-item-active a {
          color: white !important;
        }
        .ant-rate-star:not(:last-child) {
          margin-inline-end: 2px !important;
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
          transition: all 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
