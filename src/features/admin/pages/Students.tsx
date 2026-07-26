import { useState, lazy, useMemo, useEffect } from 'react';
import { Search, Eye, EyeOff, Pencil, Trash2, Plus, Users, UserCheck, UserX, ClipboardList, ChevronDown, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import WhatsAppPhone from '../../../components/ui/WhatsAppPhone';
import { useTranslation } from 'react-i18next';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../hooks/useStudents';
import { usePlans } from '../hooks/usePlans';
import { Student } from '../../../types/student';
import { useConfirm } from '../../../hooks/useConfirm';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { Table, Dropdown } from 'antd';

const AddStudentModal = lazy(() => import('../../../components/modals/AddStudentModal'));
const ViewStudentModal = lazy(() => import('../../../components/modals/ViewStudentModal'));
const EditStudentModal = lazy(() => import('../../../components/modals/EditStudentModal'));

const PasswordCell = ({ password }: { password?: string }) => {
  if (!password) return <span className="text-gray-400">---</span>;
  return <span className="font-mono text-sm text-gray-700">{password}</span>;
};



export default function Students() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const itemsPerPage = 10;

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 3000);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: apiResponse, isLoading } = useStudents(currentPage, itemsPerPage, debouncedSearchTerm);
  const rawData: any = apiResponse?.data;
  const studentsDataStatus = rawData?.status;
  const studentsList: Student[] = Array.isArray(rawData?.studentsData) ? rawData.studentsData : (rawData?.students || []);
  const pagination = rawData?.pagination;
  const totalItems = pagination?.totalItems || studentsList.length;
  const totalPages = pagination?.totalPages || Math.ceil(studentsList.length / itemsPerPage);
  const totalStudentsCount = studentsDataStatus?.totalStudents || 0;
  const activeStudentsCount = studentsDataStatus?.activeStudents || 0;
  const pendingStudentsCount = studentsDataStatus?.inactiveStudents || 0;
  const { mutateAsync: createStudent } = useCreateStudent();
  const { mutateAsync: updateStudent } = useUpdateStudent();
  const { mutateAsync: deleteStudent } = useDeleteStudent();
  const { data: plansData } = usePlans();
  const { confirm, ConfirmDialog } = useConfirm();
  const stats = useMemo(() => [
    {
      id: 'total',
      label: t('totalStudents'),
      value: totalStudentsCount,
      icon: Users,
      bgColor: 'bg-indigo-50/50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'active',
      label: t('activeStudents'),
      value: activeStudentsCount,
      icon: UserCheck,
      bgColor: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'pending',
      label: t('pendingStudents'),
      value: pendingStudentsCount,
      icon: UserX,
      bgColor: 'bg-amber-50/50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      id: 'plans',
      label: t('numberOfPlans'),
      value: plansData?.length,
      icon: ClipboardList,
      bgColor: 'bg-fuchsia-50/50',
      iconBg: 'bg-fuchsia-100',
      iconColor: 'text-fuchsia-600',
    },
  ], [totalStudentsCount, activeStudentsCount, pendingStudentsCount, plansData?.length, t]);

  const plans = plansData || [];
  const planFilterOptions = [
    { id: 'all', label: t('allPlans'), labelEn: 'All Plans' },
    ...plans.map(p => ({
      id: p.id,
      label: p.name,
      labelEn: p.name
    }))
  ];

  const countries = [
    { id: 'all', label: t('selectCountry'), labelEn: 'Select Country' },
    { id: 'egypt', label: t('egypt'), labelEn: 'Egypt' },
    { id: 'saudi', label: t('saudiArabia'), labelEn: 'Saudi Arabia' },
  ];

  const filteredStudents = useMemo(() => {
    return studentsList.filter(student => {
      const matchesGrade = selectedGrade === 'all' || student.planId === selectedGrade;
      const matchesCountry = selectedCountry === 'all' || student.country === selectedCountry;

      return matchesGrade && matchesCountry;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      title: t('deleteStudent'),
      message: t('deleteConfirmStudent'),
    });
    if (confirmed) {
      try {
        await deleteStudent(studentId);
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const columns = [
    {
      title: t('studentInfo'),
      render: (_: any, record: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {record.user.name ? record.user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{record.user.name}</div>
            <div className="text-[11px] font-bold text-gray-400 mt-0.5">{record.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: t('User Name'),
      render: (_: any, record: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {record.user.username ? record.user.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{record.user.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: t('password'),
      render: (_: any, record: Student) => (
        <PasswordCell password={record.user.password} />
      ),
    },
    {

      title: t('phone'),
      render: (_: any, record: Student) => (
        <WhatsAppPhone
          phone={`${record.user.code_country} ${record.user.phone}`}
          className="text-sm font-bold text-gray-700"
        />
      ),
    },
    {
      title: t('plan'),
      render: (_: any, record: Student) => (
        <span className="inline-flex px-3 py-1 bg-fuchsia-50 text-fuchsia-600 rounded-full text-[10px] font-bold border border-fuchsia-100 uppercase tracking-wider">
          {record.plan?.name || t('noPlan')}
        </span>
      ),
    },
    {
      title: t('academicRank') || 'Rank',
      render: (_: any, record: Student) => (
        <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100 uppercase tracking-wider">
          {record.rank?.name || '---'}
        </span>
      ),
    },
    {
      title: t('hours'),
      render: (_: any, record: Student) => (
        <div className="flex flex-col gap-1 w-24">
          <div className="flex justify-between text-[10px] font-bold text-gray-500">
            <span>{record.sessions_attended}/{record.sessions}</span>
            <span>{Math.round((record.sessions_attended / (record.sessions || 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(record.sessions_attended / (record.sessions || 1)) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      title: t('country'),
      render: (_: any, record: Student) => (
        <span className="text-sm font-bold text-gray-600 uppercase text-[11px] tracking-wide">{record.country}</span>
      ),
    },
    {
      title: t('status'),
      render: (_: any, record: Student) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${record.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
          {record.status === 'approved' ? t('active') : t('pending')}
        </span>
      ),
    },
    {
      title: t('actions'),
      align: 'right' as const,
      render: (_: any, record: Student) => {
        const items = [
          {
            key: 'view',
            label: <span className="flex items-center gap-2 text-xs font-bold text-gray-700"><Eye className="w-3.5 h-3.5" /> {t('view')}</span>,
            onClick: () => handleViewStudent(record),
          },
          {
            key: 'edit',
            label: <span className="flex items-center gap-2 text-xs font-bold text-gray-700"><Pencil className="w-3.5 h-3.5" /> {t('edit')}</span>,
            onClick: () => handleEditStudent(record),
          },
          {
            key: 'delete',
            label: <span className="flex items-center gap-2 text-xs font-bold text-red-600"><Trash2 className="w-3.5 h-3.5" /> {t('delete')}</span>,
            danger: true,
            onClick: () => handleDeleteStudent(record.id),
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
    <div className="space-y-6 max-w-[1200px] mx-auto p-2 custom-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>

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
        {/* Page Title & Add Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('studentManagement')}</h1>
            <p className="text-gray-500 text-sm font-medium">{t('manageStudentsDescription')}</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-full transition-colors font-bold text-sm shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('addNewStudent')}
          </button>
        </div>

        {/* Toolbar / Filters */}
        <div className="px-8 pb-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
            <input
              type="text"
              placeholder={t('searchUsersPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-2.5 bg-gray-50 border-none rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:bg-white transition-colors placeholder:text-gray-400`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[140px]">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none w-full pl-5 pr-10 py-2.5 bg-gray-50 border-none rounded-full text-sm font-bold text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {countries.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.label : c.labelEn}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-[140px]">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none w-full pl-5 pr-10 py-2.5 bg-gray-50 border-none rounded-full text-sm font-bold text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {planFilterOptions.map(g => <option key={g.id} value={g.id}>{language === 'ar' ? g.label : g.labelEn}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-8"><TableSkeleton rows={itemsPerPage} columns={7} /></div>
          ) : (
            <Table
              columns={columns}
              dataSource={currentStudents}
              rowKey="id"
              pagination={false}
              className="w-full min-w-[1000px]"
              rowClassName="hover:bg-gray-50/50 transition-colors group cursor-pointer"
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <div className="p-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold ml-2">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} students
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#6366f1] text-white shadow-sm scale-110' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .ant-table-thead > tr > th {
          background-color: white !important;
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
      `}} />

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
              country: studentData.country,
              active: studentData.status === 'approved',
              timezone: studentData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
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

            if (studentData.startingCourseId && studentData.startingCourseId.trim() !== "") {
              payload.startingCourseId = studentData.startingCourseId;
            }

            if (studentData.startingLectureId && studentData.startingLectureId.trim() !== "") {
              payload.startingLectureId = studentData.startingLectureId;
            }

            if (studentData.password) {
              payload.password = studentData.password;
            }
            await createStudent(payload);
            setCurrentPage(1);
            return true;
          } catch (error) {
            console.error('Error adding student:', error);
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
              country: selectedStudent.country ? selectedStudent.country.toLowerCase() : 'egypt',
              status: (selectedStudent.status || 'pending') as any,
              gender: selectedStudent.gender || 'male',
              plan: selectedStudent.planId || '',
              rankId: selectedStudent.rankId || '',
              password: selectedStudent.user.password || '',
              birthDate: selectedStudent.birth_date ? selectedStudent.birth_date.split('T')[0] : '',
            }
            : null
        }
        onSubmit={async (updatedData) => {
          try {
            const payload: any = {
              name: updatedData.name,
              // Backend expects separate phone and phone_code
              phone: updatedData.phone,
              phone_code: updatedData.phone_code,
              country: updatedData.country,
              birth_date: (updatedData.birthDate && updatedData.birthDate !== "") ? new Date(updatedData.birthDate).toISOString() : null,
              gender: updatedData.gender,
              active: updatedData.status === 'approved',
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

            await updateStudent({ id: updatedData.id, data: payload });
            return true;
          } catch (error) {
            console.error('Error updating student:', error);
            // Detailed error is handled by axios interceptor
            return false;
          }
        }}
      />
      {ConfirmDialog}
      <style dangerouslySetInnerHTML={{
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
      `}} />
    </div>
  );
}
