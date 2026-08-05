import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  Edit,
  Trash2,
  MoreVertical,
  BookOpen,
  Search,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { Button, Input, Tag, Card, Empty, Dropdown, Modal, Pagination } from 'antd';
import { useCourses, useDeleteCourse } from '../../../hooks/useCourses';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AddCourseModal from './AddCourseModal';
import { useGetRanks } from '../hooks/useRank';
import { baseURL } from '../../../consts';

export default function Curriculum() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRankId, setSelectedRankId] = useState<string | undefined>(undefined);
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryClient = useQueryClient();
  const { data: ranksData } = useGetRanks();
  const ranksList = useMemo(() => {
    const items = ranksData?.data.items || (Array.isArray(ranksData) ? ranksData : []);
    return items.map((r: any) => ({ id: r.id, name: r.name, name_ar: r.name_ar, name_en: r.name_en, color: r.color }));
  }, [ranksData]);

  const { data: coursesData } = useCourses(currentPage, pageSize, selectedRankId, debouncedSearchQuery);
  const { mutate: deleteCourse } = useDeleteCourse();

  const courses = coursesData?.items;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedRankId]);

  const paginatedCourses = courses;

  const handleCourseClick = (id: string) => {
    navigate(`/dashboard/curriculum/${id}`);
  };

  const handleEdit = (course: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(course);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: t('delete_confirm_title', 'Are you sure?'),
      content: t('delete_confirm_content', 'This action cannot be undone.'),
      okText: t('delete_yes', 'Yes, Delete'),
      okType: 'danger',
      cancelText: t('delete_cancel', 'Cancel'),
      onOk: () => {
        deleteCourse(id, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
          }
        });
      }
    });
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-[calc(100vh-90px)]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('courses_title', 'Curriculum Shelf')}</h1>
          <p className="text-gray-500 mt-1 font-medium">{t('courses_subtitle', 'Select a course to manage its curriculum modules and lessons')}</p>
        </div>
        <Button
          icon={<Plus size={18} />}
          type="primary"
          onClick={() => setIsAddModalVisible(true)}
          className="h-11 px-6 rounded-xl bg-primary hover:!bg-primary-dark border-none font-bold shadow-lg shadow-primary/20 flex items-center"
        >
          {t('add_course', 'New Course')}
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center gap-3 flex-wrap">
        <div className="relative w-52">
          <Input
            prefix={<Search size={16} className="text-gray-400 mr-1" />}
            placeholder={t('search_placeholder', 'Search...')}
            className="h-9 rounded-xl border-gray-200 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          <button
            onClick={() => setSelectedRankId(undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!selectedRankId ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {t('all_levels', 'All')}
          </button>
          {ranksList.length === 0 ? (
            <span className="text-xs text-gray-400 font-medium px-2 animate-pulse">{t('loading_levels', 'Loading...')}</span>
          ) : (
            ranksList.map((rank) => (
              <button
                key={rank.id}
                onClick={() => setSelectedRankId(rank.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRankId === rank.id ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                style={selectedRankId === rank.id ? { backgroundColor: rank.color || '#6366f1' } : {}}
              >
                {isAr ? rank.name_ar || rank.name : rank.name_en || rank.name}
              </button>
            ))
          )}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      {(courses?.length ?? 0) > 0 ? (
        <>
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {paginatedCourses?.map((course) => (
              <Card
                key={course.id}
                className={`group overflow-hidden rounded-3xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'p-2' : ''}`}
                styles={{ body: { padding: 0 } }}
                onClick={() => handleCourseClick(course.id)}
              >
                {viewMode === 'grid' ? (
                  <div className="flex flex-col h-full">
                    <div
                      className="h-40 p-6 flex flex-col justify-between relative overflow-hidden bg-cover bg-center"
                      style={{
                        backgroundImage:
                          course?.image
                            ? `url("${baseURL}/${course.image}")`
                            : "linear-gradient(to bottom right, #6366f1, #a855f7)"
                      }}
                    >
                      {course?.image && <img src={`${baseURL}/${course.image}`} alt={course.title} className="absolute top-0 left-0 w-full h-full object-cover" />}

                      <div className="absolute top-0 right-0 p-8 opacity-10" >
                        <BookOpen size={100} className="text-white" />
                      </div>
                      <div className="flex justify-between items-start relative z-10">
                        <Tag color={course.rank.color} className="w-fit rounded-lg px-3 py-1 font-bold border-none text-[10px] uppercase tracking-wider">
                          {isAr ? course.rank?.name_ar || course.rank?.name : course.rank?.name_en || course.rank?.name}
                        </Tag>
                        <Dropdown
                          classNames={{ root: "custom-dropdown" }}
                          menu={{
                            className: "bg-white text-black",
                            items: [
                              {
                                key: 'edit',
                                label: t('edit', 'Edit Course'),
                                icon: <Edit size={14} />,
                                onClick: (info) => handleEdit(course, info.domEvent as any)
                              },
                              {
                                key: 'delete',
                                label: t('delete', 'Delete'),
                                icon: <Trash2 size={14} />,
                                danger: true,
                                onClick: (info) => handleDelete(course.id, info.domEvent as any)
                              },
                            ]
                          }}
                          trigger={['click']}
                        >
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-black/80 transition-all"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </Dropdown>
                      </div>
                      <h3 className="text-xl font-bold text-white relative z-10">{isAr ? course.title_ar || course.title : course.title_en || course.title}</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-500 text-sm line-clamp-2 mb-6">{isAr ? course.description_ar || course.description : course.description_en || course.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-indigo-600" />
                          <span className="text-xs font-bold text-gray-600">{course.lectures?.length || 0} {t('lectures', 'Lectures')}</span>
                        </div>
                        <ArrowRight size={18} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{isAr ? course.title_ar || course.title : course.title_en || course.title}</h3>
                        <p className="text-xs text-gray-500">{course.lectures?.length || 0} {t('lecture', 'Lectures')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Tag color={course.rank.color} className="rounded-lg font-bold border-none text-[9px] uppercase tracking-wider">{isAr ? course.rank?.name_ar || course.rank?.name : course.rank?.name_en || course.rank?.name}</Tag>
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'edit', label: t('edit', 'Edit'), icon: <Edit size={14} />, onClick: (info) => handleEdit(course, info.domEvent as any) },
                            { key: 'delete', label: t('delete', 'Delete'), icon: <Trash2 size={14} />, danger: true, onClick: (info) => handleDelete(course.id, info.domEvent as any) },
                          ]
                        }}
                        trigger={['click']}
                      >
                        <Button
                          shape="circle"
                          icon={<MoreVertical size={16} />}
                          className="border-none bg-gray-50 hover:bg-gray-100 text-gray-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                      <ArrowRight size={18} className="text-gray-300" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8 mb-8">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={coursesData?.pagination?.totalItems || 0}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty description={t('no_courses_found', 'No courses found')} className="mt-20" />
      )}
      <AddCourseModal
        visible={isAddModalVisible || !!editingCourse}
        onClose={() => {
          setIsAddModalVisible(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
      />
    </div>
  );
}
