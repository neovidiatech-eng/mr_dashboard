import { useState, useMemo, useEffect, lazy } from 'react';
import { Search, Eye, Pencil, Trash2, Plus, Users, UserCheck, UserX } from 'lucide-react';
import WhatsAppPhone from '../../../components/ui/WhatsAppPhone';
import Pagination from '../../../components/ui/Pagination';
import { useTranslation } from 'react-i18next';
import { useTeacher, useDeleteTeacher, useCreateTeacher, useUpdateTeacher } from '../hooks/useTeacher';
import { CreateTeacherInput, Teacher } from '../../../types/teachers';
import { TeacherFormData, UpdateTeacherFormData } from '../../../lib/schemas/TeacherSchema';
import { useCurrency } from '../hooks/useCurrency';
import { useConfirm } from '../../../hooks/useConfirm';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';

const AddTeacherModal = lazy(() => import('../../../components/modals/AddTeacherModal'));
const ViewTeacherModal = lazy(() => import('../../../components/modals/ViewTeacherModal'));
const EditTeacherModal = lazy(() => import('../../../components/modals/EditTeacherModal'));


export default function Teachers() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const itemsPerPage = 8;

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: teachersResponse, isLoading } = useTeacher({search: debouncedSearch, page: currentPage, limit: itemsPerPage});
  const { data: currenciesData } = useCurrency();
  const deleteTeacherMutation = useDeleteTeacher();
  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const { confirm, ConfirmDialog } = useConfirm();

  const teachers = useMemo(() => teachersResponse?.teachers || [], [teachersResponse]);

  const currencyLookup = useMemo(() => {
    const map: Record<string, string> = {};
    if (currenciesData?.currencies) {
      currenciesData.currencies.forEach(c => {
        map[c.id] = c.symbol || c.code;
      });
    }
    return map;
  }, [currenciesData]);

  const statsCards = useMemo(() => [
    {
      id: 'total',
      label: t('totalTeachers'),
      value: teachers.length,
      icon: Users,
      color: 'indigo',
    },
    {
      id: 'active',
      label: t('active'),
      value: teachers.filter((teacher) => teacher?.active).length,
      icon: UserCheck,
      color: 'emerald',
    },
    {
      id: 'inactive',
      label: t('inactive'),
      value: teachers.filter((teacher) => teacher && !teacher.active).length,
      icon: UserX,
      color: 'orange',
    },
  ], [teachers, t]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      if (!teacher) return false;
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'active' && teacher.active) ||
        (selectedStatus === 'inactive' && !teacher.active);
      return matchesStatus;
    });
  }, [teachers, selectedStatus]);

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const currentTeachers = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const handleAddTeacher = async (formData: TeacherFormData) => {
    try {
      const apiData = mapFormToApi(formData);
      await createTeacherMutation.mutateAsync(apiData);
      return true;
    } catch (error) { console.error(error); return false; }
  };

  const handleUpdateTeacher = async (formData: UpdateTeacherFormData) => {
    if (!selectedTeacher) return false;
    try {
      const apiData = mapFormToApi(formData);
      await updateTeacherMutation.mutateAsync({ id: selectedTeacher.id, data: apiData });
      return true;
    } catch (error) { console.error(error); return false; }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const confirmed = await confirm({ title: t('deleteTeacher'), message: t('deleteConfirmTeacher') });
    if (confirmed) await deleteTeacherMutation.mutateAsync(teacherId);
  };

  const mapFormToApi = (formData: TeacherFormData | UpdateTeacherFormData): CreateTeacherInput => ({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    password: formData.password || undefined,
    hour_price: Number(formData.hourlyRate),
    currency_id: formData.currency,
    gender: formData.gender as 'male' | 'female',
    active: formData.status === 'active',
    code_country: '+20',
    age: formData.age,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="max-w-[1600px] mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-start">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {t('teacherManagement')}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {t('teacherManagementSubtitle')}
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl transition-all font-black text-sm shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            {t('addNewTeacher')}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statsCards.map((card) => (
            <div key={card.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    {card.label}
                  </p>
                  <p className={`text-4xl font-black text-${card.color}-600`}>
                    {card.value}
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-${card.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-8 h-8 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('searchTeachersPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full">
               {['all', 'active', 'inactive'].map((status) => (
                 <button
                   key={status}
                   onClick={() => setSelectedStatus(status)}
                   className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                     selectedStatus === status 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                   }`}
                 >
                   {status === 'all' ? 'All' : t(status)}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={itemsPerPage} columns={6} />
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-start text-xs font-black uppercase tracking-widest text-gray-400">Teacher</th>
                    <th className="px-8 py-5 text-start text-xs font-black uppercase tracking-widest text-gray-400">Email</th>
                    <th className="px-8 py-5 text-start text-xs font-black uppercase tracking-widest text-gray-400">  User Name</th>
                    <th className="px-8 py-5 text-start text-xs font-black uppercase tracking-widest text-gray-400">  Password</th>
                    <th className="px-8 py-5 text-start text-xs font-black uppercase tracking-widest text-gray-400">Phone</th>
                    <th className="px-8 py-5 text-start text-xs font-black uppercase tracking-widest text-gray-400">Price</th>
                    <th className="px-8 py-5 text-start text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-8 py-5 text-end text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                            {teacher.user?.name?.[0] || 'T'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{teacher.user?.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Instructor</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-gray-500">{teacher.user?.email}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-gray-500">{teacher.user?.username}</span>
                      </td>
                                            <td className="px-8 py-5">
                        <span className="text-sm font-bold text-gray-500">{teacher.user?.password}</span>
                      </td>
                      <td className="px-8 py-5">
                         <WhatsAppPhone
                            phone={`${teacher.user?.code_country || ''}${teacher.user?.phone || ''}`}
                            className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
                          />
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-gray-900">
                            {teacher.hour_price?.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase">
                            {currencyLookup[teacher.currencyId] || 'USD'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          teacher.active ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {teacher.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button onClick={() => handleViewTeacher(teacher)} className="p-2.5 bg-gray-50 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-transparent hover:border-gray-100">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditTeacher(teacher)} className="p-2.5 bg-gray-50 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-amber-600 transition-all border border-transparent hover:border-gray-100">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTeacher(teacher.id)} className="p-2.5 bg-gray-50 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-red-600 transition-all border border-transparent hover:border-gray-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && (
            <div className="px-8 py-6 border-t border-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTeachers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      <AddTeacherModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddTeacher} />
      <ViewTeacherModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} teacher={selectedTeacher} />
      <EditTeacherModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleUpdateTeacher} teacher={selectedTeacher} />
      {ConfirmDialog}
    </div>
  );
}
