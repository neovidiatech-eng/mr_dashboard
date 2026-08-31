import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Plus,
  FileText,
  Video,
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  BookOpen,
  Presentation,
  ListChecks,
  Clock,
  Award,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button, Dropdown, Modal, Empty, Spin } from 'antd';
import { useCourseById } from '../../../hooks/useCourses';
import { useDeleteLecture } from '../../../hooks/useLectures';
import { useDeleteSection, useRemoveItemFromSection, useSectionsByCourse } from '../../../hooks/useSections';
import { useQueryClient } from '@tanstack/react-query';
import AddLectureModal from './AddLectureModal';
import AddQuizModal from '../../../components/modals/AddQuizModal';
import ViewQuizModal from '../../../components/modals/ViewQuizModal';
import AddSectionModal from '../../../components/modals/AddSectionModal';
import { useQuizById, useDeleteQuiz } from '../../../hooks/useQuiz';
import { Lecture } from '../../../types/lectures';
import { Section, SectionItem } from '../../../types/courses';
import UniversalVideoPlayer from '../../../components/ui/UniversalVideoPlayer';
import { useLanguage } from '../../../contexts/LanguageContext';
import ErrorService from '../../../utils/ErrorService';

export default function CourseDetails() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [selectedLectureObj, setSelectedLectureObj] = useState<Lecture | null>(null);
  const [mainViewMode, setMainViewMode] = useState<'lecture' | 'quiz'>('lecture');
  const [isAddLectureModalVisible, setIsAddLectureModalVisible] = useState(false);
  const [isAddQuizModalVisible, setIsAddQuizModalVisible] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isViewQuizModalVisible, setIsViewQuizModalVisible] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>({});
  const [targetSectionIdForQuiz, setTargetSectionIdForQuiz] = useState<string | null>(null);
  const [targetSectionIdForLecture, setTargetSectionIdForLecture] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === false ? true : false,
    }));
  };

  const queryClient = useQueryClient();
  const { data: selectedCourse, isLoading } = useCourseById(courseId || '');
  const { data: fetchedSections } = useSectionsByCourse(courseId || '');
  const { mutate: deleteLecture } = useDeleteLecture();
  const { mutate: deleteSection } = useDeleteSection();
  const { mutate: removeItemFromSection } = useRemoveItemFromSection();
  const { mutate: deleteQuiz } = useDeleteQuiz();

  const rawSections: Section[] = useMemo(() => {
    if (fetchedSections && Array.isArray(fetchedSections) && fetchedSections.length > 0) {
      return fetchedSections;
    }
    if ((selectedCourse as any)?.sections && Array.isArray((selectedCourse as any).sections) && (selectedCourse as any).sections.length > 0) {
      return (selectedCourse as any).sections;
    }
    return [];
  }, [fetchedSections, selectedCourse]);

  const sections: Section[] = useMemo(() => {
    if (rawSections && rawSections.length > 0) {
      return rawSections;
    }
    const legacyLectures = selectedCourse?.lectures || [];
    if (legacyLectures.length > 0) {
      return [
        {
          id: 'default-section',
          name: isAr ? 'محتوى الكورس' : 'Course Content',
          section_items: legacyLectures.map((lec: Lecture, idx: number) => ({
            id: lec.id,
            order: lec.order || idx + 1,
            section_id: 'default-section',
            item_id: lec.id,
            item_type: 'LECTURE',
            details: lec,
          })),
        },
      ];
    }
    return [];
  }, [rawSections, selectedCourse?.lectures, isAr]);

  const allSectionItems = useMemo(() => {
    return sections.flatMap((s) => s.section_items || s.sectionItems || []);
  }, [sections]);

  const lectures = useMemo(() => {
    const extracted = allSectionItems
      .filter((item) => (item.item_type || '').toUpperCase() === 'LECTURE')
      .map((item) => item.details)
      .filter(Boolean);
    return extracted.length > 0 ? extracted : selectedCourse?.lectures || [];
  }, [allSectionItems, selectedCourse?.lectures]);

  const activeLecture = (selectedLessonId ? lectures.find((l: Lecture) => l.id === selectedLessonId) : null) || selectedLectureObj || lectures[0];

  const activeQuizId = (activeLecture as any)?.quiz?.id || (activeLecture as any)?.quizId || selectedQuizId;
  const { data: activeQuiz, isLoading: isLoadingActiveQuizQuestions } = useQuizById(activeQuizId);

  const displayQuestions = useMemo(() => {
    if (Array.isArray(activeQuiz?.questions)) return activeQuiz.questions;
    if (Array.isArray((activeQuiz as any)?.quiz_questions)) return (activeQuiz as any).quiz_questions;
    return [];
  }, [activeQuiz]);

  // Auto-select first item if none selected
  useEffect(() => {
    if (sections.length > 0 && !selectedLessonId && !selectedQuizId) {
      const firstSection = sections[0];
      const items = firstSection.section_items || firstSection.sectionItems || [];
      if (items.length > 0) {
        const firstItem = items[0];
        const type = (firstItem.item_type || '').toUpperCase();
        if (type === 'QUIZ') {
          setSelectedQuizId(firstItem.details?.id || firstItem.item_id);
          setMainViewMode('quiz');
        } else {
          const lecId = firstItem.details?.id || firstItem.item_id;
          setSelectedLessonId(lecId);
          setSelectedLectureObj(firstItem.details || null);
          setMainViewMode('lecture');
        }
      }
    }
  }, [sections, selectedLessonId, selectedQuizId]);

  const handleBack = () => {
    navigate('/dashboard/curriculum');
  };

  const handleEditLecture = (lecture: Lecture, e: React.MouseEvent) => {
    e.stopPropagation();
    const lecId = lecture?.id || (lecture as any)?.item_id;
    const fullLecture = selectedCourse?.lectures?.find((l: Lecture) => l.id === lecId) || lectures.find((l: Lecture) => l.id === lecId) || lecture;
    setEditingLecture(fullLecture);
    setIsAddLectureModalVisible(true);
  };

  const handleDeleteLecture = (lectureId: string, sectionId?: string, sectionItemId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    Modal.confirm({
      title: t('deleteLectureConfirmTitle'),
      content: t('deleteLectureConfirmDesc'),
      okText: t('delete'),
      okType: 'danger',
      onOk: async () => {
        if (selectedLessonId === lectureId) setSelectedLessonId('');

        if (sectionId && isValidUUID(sectionId) && (sectionItemId || lectureId)) {
          try {
            await removeItemFromSection({ sectionId, itemId: sectionItemId || lectureId, courseId });
          } catch (err) {
            console.warn('Failed removing lecture from section:', err);
          }
        }
        deleteLecture(lectureId, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
          },
          onError: () => {
            queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
          }
        });
      }
    });
  };

  const isValidUUID = (id?: string) =>
    !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const handleEditSection = (sec: Section, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSection(sec);
    setIsAddSectionModalOpen(true);
  };

  const handleDeleteSection = (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isValidUUID(secId)) {
      ErrorService.error(isAr ? 'لا يمكن حذف السكشن الافتراضي، يرجى إنشاء سكشن جديد' : 'Cannot delete default fallback section');
      return;
    }

    Modal.confirm({
      title: isAr ? 'حذف السكشن' : 'Delete Section',
      content: isAr
        ? 'هل أنت تأكد من رغبتك في حذف هذا السكشن وكافة محتوياته (المحاضرات والكويزات)؟'
        : 'Are you sure you want to delete this section and all its contents (lectures & quizzes)?',
      okText: isAr ? 'نعم، حذف' : 'Yes, Delete',
      okType: 'danger',
      onOk: () => {
        deleteSection({ id: secId, courseId });
      },
    });
  };

  const handleEditQuiz = (quizObj: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQuiz(quizObj);
    setIsAddQuizModalVisible(true);
  };

  const handleDeleteQuizItem = (quizId: string, sectionId?: string, sectionItemId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    Modal.confirm({
      title: isAr ? 'حذف الكويز' : 'Delete Quiz',
      content: isAr ? 'هل أنت تأكد من حذف هذا الكويز؟' : 'Are you sure you want to delete this quiz?',
      okText: isAr ? 'نعم، حذف' : 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        if (selectedQuizId === quizId) setSelectedQuizId(null);

        if (sectionId && isValidUUID(sectionId) && (sectionItemId || quizId)) {
          try {
            await removeItemFromSection({ sectionId, itemId: sectionItemId || quizId, courseId });
          } catch (err) {
            console.warn('Failed removing quiz from section:', err);
          }
        }
        deleteQuiz(quizId, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
          },
          onError: () => {
            queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
          }
        });
      },
    });
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-90px)] bg-[#f8fafc]">
        <Spin size="large" tip={t('loadingCourseDetails')} />
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="p-8 bg-[#f8fafc] min-h-[calc(100vh-90px)] flex flex-col items-center justify-center" dir={isAr ? 'rtl' : 'ltr'}>
        <Empty description={t('courseNotFound')} />
        <Button onClick={handleBack} className="mt-4 rounded-xl font-bold">
          {t('backToCurriculum')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] bg-[#f8fafc] overflow-hidden p-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Detail Header */}
      <div className="mb-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="rounded-xl h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors bg-white shadow-sm"
          >
            <ArrowLeft size={18} className={isAr ? 'rotate-180' : ''} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {t('curriculum')} <ChevronRight size={10} className={isAr ? 'rotate-180' : ''} /> <span className="text-primary">{isAr ? selectedCourse.title_ar || selectedCourse.title : selectedCourse.title_en || selectedCourse.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{isAr ? selectedCourse.title_ar || selectedCourse.title : selectedCourse.title_en || selectedCourse.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setEditingSection(null);
              setIsAddSectionModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-all shadow-xs active:scale-95 text-xs"
          >
            <Layers size={15} className="text-primary" />
            {isAr ? 'إضافة سكشن' : 'Add Section'}
          </button>
          <button
            onClick={() => {
              setEditingQuiz(null);
              setTargetSectionIdForQuiz(null);
              setIsAddQuizModalVisible(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all shadow-xs active:scale-95 text-xs"
          >
            <ListChecks size={15} />
            {isAr ? 'إضافة كويز' : 'Add Quiz'}
          </button>
          <button
            onClick={() => {
              setEditingLecture(null);
              setTargetSectionIdForLecture(null);
              setIsAddLectureModalVisible(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-md shadow-primary/20 active:scale-95 text-xs"
          >
            <Plus size={15} />
            {t('addLectureBtn')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden gap-6">
        {/* Left Sidebar */}
        <div className="w-[350px] flex flex-col gap-4 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-primary" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('courseContent')}</span>
              </div>
              <span className="text-xs font-bold text-gray-500">{sections.length} {isAr ? 'سكشن' : 'Sections'}</span>
            </div>
            <div className="max-h-[65vh] overflow-y-auto no-scrollbar p-3 space-y-3">
              {sections.length > 0 ? (
                sections.map((section: Section, sectionIdx: number) => {
                  const items = section.section_items || section.sectionItems || [];
                  const isCollapsed = openSectionIds[section.id] === false;

                  return (
                    <div
                      key={section.id || sectionIdx}
                      className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-2xs transition-all"
                    >
                      {/* Section Header */}
                      <div
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center justify-between p-3.5 bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer transition-colors border-b border-gray-100/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {sectionIdx + 1}
                          </div>
                          <h4 className="text-xs font-extrabold text-gray-800 line-clamp-1">
                            {isAr ? section.name_ar || section.name : section.name_en || section.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: 'add_lecture',
                                  label: isAr ? 'إضافة محاضرة للسكشن' : 'Add Lecture',
                                  icon: <Plus size={14} />,
                                  onClick: () => {
                                    setTargetSectionIdForLecture(section.id);
                                    setIsAddLectureModalVisible(true);
                                  },
                                },
                                {
                                  key: 'add_quiz',
                                  label: isAr ? 'إضافة كويز للسكشن' : 'Add Quiz',
                                  icon: <ListChecks size={14} />,
                                  onClick: () => {
                                    setTargetSectionIdForQuiz(section.id);
                                    setIsAddQuizModalVisible(true);
                                  },
                                },
                                {
                                  type: 'divider',
                                },
                                {
                                  key: 'edit',
                                  label: isAr ? 'تعديل اسم السكشن' : 'Edit Section',
                                  icon: <Edit size={14} />,
                                  onClick: (info) => handleEditSection(section, info.domEvent as any),
                                },
                                {
                                  key: 'delete',
                                  label: isAr ? 'حذف السكشن' : 'Delete Section',
                                  icon: <Trash2 size={14} />,
                                  danger: true,
                                  onClick: (info) => handleDeleteSection(section.id, info.domEvent as any),
                                },
                              ],
                            }}
                            trigger={['click']}
                          >
                            <button className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-all">
                              <MoreVertical size={14} />
                            </button>
                          </Dropdown>
                          <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 bg-white rounded-md border border-gray-100">
                            {items.length} {isAr ? 'عنصر' : 'items'}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform duration-200 ${
                              isCollapsed ? '' : 'rotate-180'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Section Items */}
                      {!isCollapsed && (
                        <div className="divide-y divide-gray-50">
                          {items.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-400 font-medium">
                              {isAr ? 'لا توجد عناصر في هذا السكشن' : 'No items in this section'}
                            </div>
                          ) : (
                            items.map((item: SectionItem, itemIdx: number) => {
                              const isLecture = (item.item_type || '').toUpperCase() === 'LECTURE';
                              const isQuiz = (item.item_type || '').toUpperCase() === 'QUIZ';
                              const details = item.details || {};
                              const itemId = details.id || item.item_id;

                              const isSelected =
                                (isLecture && mainViewMode === 'lecture' && selectedLessonId === itemId) ||
                                (isQuiz && mainViewMode === 'quiz' && selectedQuizId === itemId);

                              const itemTitle = isAr
                                ? details.title_ar || details.title || details.name
                                : details.title_en || details.title || details.name;

                              return (
                                <div
                                  key={item.id || itemIdx}
                                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-primary-light/70 border-r-4 border-r-primary'
                                      : 'hover:bg-gray-50/80'
                                  }`}
                                  onClick={() => {
                                    if (isQuiz) {
                                      setSelectedQuizId(itemId);
                                      setMainViewMode('quiz');
                                    } else {
                                      setSelectedLessonId(itemId);
                                      setSelectedLectureObj(details);
                                      setMainViewMode('lecture');
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                        isSelected
                                          ? 'bg-primary text-white shadow-sm'
                                          : 'bg-gray-100 text-gray-500'
                                      }`}
                                    >
                                      {item.order || itemIdx + 1}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span
                                        className={`text-xs font-bold truncate ${
                                          isSelected ? 'text-primary' : 'text-gray-700'
                                        }`}
                                      >
                                        {itemTitle || (isQuiz ? (isAr ? 'كويز' : 'Quiz') : (isAr ? 'محاضرة' : 'Lecture'))}
                                      </span>
                                      <div className="flex items-center gap-2 mt-1">
                                        {isQuiz ? (
                                          <>
                                            <ListChecks
                                              size={11}
                                              className={isSelected ? 'text-primary' : 'text-purple-500'}
                                            />
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-600 border border-purple-100">
                                              {isAr ? 'كويز' : 'Quiz'}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <Video
                                              size={11}
                                              className={isSelected ? 'text-primary' : 'text-blue-500'}
                                            />
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                              {isAr ? 'محاضرة' : 'Lecture'}
                                            </span>
                                            {(details.quiz || details.quizId) && (
                                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                                                {isAr ? 'كويز' : 'Quiz'}
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <Dropdown
                                      menu={{
                                        items: isLecture
                                          ? [
                                              {
                                                key: 'edit',
                                                label: t('edit'),
                                                icon: <Edit size={14} />,
                                                onClick: (info) =>
                                                  handleEditLecture(details, info.domEvent as any),
                                              },
                                              {
                                                key: 'delete',
                                                label: isAr ? 'حذف المحاضرة' : 'Delete Lecture',
                                                icon: <Trash2 size={14} />,
                                                danger: true,
                                                onClick: (info) =>
                                                  handleDeleteLecture(itemId, section.id, item.id, info.domEvent as any),
                                              },
                                            ]
                                          : [
                                              {
                                                key: 'edit',
                                                label: isAr ? 'تعديل الكويز' : 'Edit Quiz',
                                                icon: <Edit size={14} />,
                                                onClick: (info) =>
                                                  handleEditQuiz(details, info.domEvent as any),
                                              },
                                              {
                                                key: 'delete',
                                                label: isAr ? 'حذف الكويز' : 'Delete Quiz',
                                                icon: <Trash2 size={14} />,
                                                danger: true,
                                                onClick: (info) =>
                                                  handleDeleteQuizItem(itemId, section.id, item.id, info.domEvent as any),
                                              },
                                            ],
                                      }}
                                      trigger={['click']}
                                    >
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<MoreVertical size={14} />}
                                        className="text-gray-300 hover:text-gray-600"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </Dropdown>
                                    <ChevronRight
                                      size={14}
                                      className={
                                        isSelected ? 'text-primary' : 'text-gray-300'
                                      }
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white rounded-xl">
                  <Empty description={t('noLecturesYet')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  <button
                    onClick={() => setIsAddLectureModalVisible(true)}
                    className="mt-2 px-4 py-1.5 rounded-lg text-[11px] font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm"
                  >
                    {t('addFirstLecture')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {/* Header Area */}
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary-light text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
                  {mainViewMode === 'quiz' ? (isAr ? 'كويز المحاضرة' : 'Lecture Quiz') : t('currentLecture')}
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  {mainViewMode === 'quiz'
                    ? (isAr ? activeQuiz?.title_ar || activeQuiz?.title || 'كويز المحاضرة' : activeQuiz?.title_en || activeQuiz?.title || 'Lecture Quiz')
                    : activeLecture
                    ? (isAr ? activeLecture.title_ar || activeLecture.title : activeLecture.title_en || activeLecture.title)
                    : t('noLectureSelected')}
                </h2>
                <p className="text-[11px] font-bold text-gray-400">
                  {mainViewMode === 'quiz'
                    ? `${isAr ? 'المحاضرة المرتبطة' : 'Linked Lecture'}: ${isAr ? activeLecture?.title_ar || activeLecture?.title : activeLecture?.title_en || activeLecture?.title}`
                    : `${t('lastUpdate')}: ${activeLecture ? new Date(activeLecture.updatedAt).toLocaleDateString() : '-'}`}
                </p>
              </div>

              {mainViewMode === 'quiz' && (
                <button
                  onClick={() => setMainViewMode('lecture')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
                >
                  <ChevronRight size={16} className={isAr ? '' : 'rotate-180'} />
                  {isAr ? 'العودة للمحاضرة' : 'Back to Lecture'}
                </button>
              )}
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {mainViewMode === 'quiz' ? (
                /* INLINE QUIZ VIEW (Matches Lecture View Layout) */
                <div className="space-y-6">
                  {/* Stats Cards (Styled like Lecture Resources) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-light border border-primary/20">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                        <Clock size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{isAr ? 'المدة الزمنيّة' : 'Duration'}</p>
                        <p className="text-xs text-gray-500 font-medium">{activeQuiz?.duration_min || activeQuiz?.duration || 0} {isAr ? 'دقيقة' : 'mins'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                        <Award size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{isAr ? 'درجة النجاح' : 'Pass Points'}</p>
                        <p className="text-xs text-gray-500 font-medium">{activeQuiz?.pass_points || 0} {isAr ? 'درجة' : 'pts'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <HelpCircle size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{isAr ? 'إجمالي الدرجات' : 'Total Score'}</p>
                        <p className="text-xs text-gray-500 font-medium">{activeQuiz?.total_points || activeQuiz?.totalMarks || 0} {isAr ? 'درجة' : 'pts'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  {(activeQuiz?.description_ar || activeQuiz?.description_en || activeQuiz?.description) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} className="text-primary" />
                        <span className="text-sm font-bold">{isAr ? 'وصف الكويز' : 'Quiz Description'}</span>
                      </div>
                      <div className="p-6 rounded-2xl bg-white border border-gray-100 text-gray-600 leading-relaxed text-sm font-medium">
                        {isAr ? activeQuiz.description_ar || activeQuiz.description : activeQuiz.description_en || activeQuiz.description}
                      </div>
                    </div>
                  )}

                  {/* Questions Section */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <ListChecks size={16} className="text-primary" />
                        <span className="text-sm font-bold">
                          {isAr ? 'أسئلة الكويز' : 'Quiz Questions'} ({displayQuestions.length})
                        </span>
                      </div>
                    </div>

                    {isLoadingActiveQuizQuestions ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <p className="text-xs font-bold text-gray-400">{isAr ? 'جاري تحميل أسئلة الكويز...' : 'Loading quiz questions...'}</p>
                      </div>
                    ) : displayQuestions.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 text-center text-gray-400">
                        <ListChecks size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-bold">{isAr ? 'لا توجد أسئلة مضافة في هذا الكويز بعد' : 'No questions found in this quiz'}</p>
                      </div>
                    ) : (
                      displayQuestions.map((q: any, idx: number) => (
                        <div
                          key={q.id || idx}
                          className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4 hover:border-gray-200 transition-all"
                        >
                          <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-50">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-primary/20">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                                {q.type === 'TRUE_FALSE' || q.type === 'true_false'
                                  ? (isAr ? 'صح / خطأ' : 'True / False')
                                  : (isAr ? 'اختيار من متعدد' : 'Multiple Choice')}
                              </span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold">
                              {q.points} {isAr ? 'درجات' : 'pts'}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-gray-900 leading-relaxed">
                            {typeof q === 'string'
                              ? q
                              : (isAr ? (q.question_ar || q.text_ar || q.title_ar) : (q.question_en || q.text_en || q.title_en)) ||
                                q.question || q.question_ar || q.question_en || q.text || q.text_ar || q.text_en || q.title || q.title_ar || q.title_en || ''}
                          </h4>

                          {((q.options && q.options.length > 0) || (q.choices && q.choices.length > 0)) && (
                            <div className="space-y-2 pt-1">
                              {(q.options || q.choices).map((opt: any, optIdx: number) => {
                                const isCorrect = typeof opt === 'object' && opt !== null ? !!(opt.is_correct || opt.isCorrect || opt.correct) : optIdx === 0;
                                const optText = typeof opt === 'string'
                                  ? opt
                                  : (isAr ? (opt.option_text_ar || opt.text_ar || opt.title_ar) : (opt.option_text_en || opt.text_en || opt.title_en)) ||
                                    opt.option_text || opt.option_text_ar || opt.option_text_en || opt.text || opt.text_ar || opt.text_en || opt.title || opt.option || opt.label || opt.value || '';

                                return (
                                  <div
                                    key={opt.id || optIdx}
                                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                                      isCorrect
                                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                                        : 'border-gray-100 bg-gray-50/50 text-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                          isCorrect
                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : 'border-gray-300 bg-white text-transparent'
                                        }`}
                                      >
                                        <CheckCircle2 size={12} />
                                      </div>
                                      <span>{optText || `${isAr ? 'الخيار' : 'Option'} ${optIdx + 1}`}</span>
                                    </div>
                                    {isCorrect && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                                        {isAr ? 'الإجابة الصحيحة' : 'Correct Answer'}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : activeLecture ? (
                /* STANDARD LECTURE VIEW */
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Video size={16} className="text-primary" />
                        <span className="text-sm font-bold">{t('videoContent')}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        MP4 - {activeLecture.videoUrl ? t('ready') : t('notSet')}
                      </span>
                    </div>
                    <UniversalVideoPlayer url={activeLecture?.videoUrl || (activeLecture as any)?.video_url || (activeLecture as any)?.url} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={16} className="text-primary" />
                      <span className="text-sm font-bold">{t('lectureDescription')}</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-gray-100 text-gray-600 leading-relaxed">
                      {isAr ? activeLecture.content_ar || activeLecture.content : activeLecture.content_en || activeLecture.content || t('noContentProvided')}
                    </div>
                  </div>

                  {activeLecture.pdfUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} className="text-primary" />
                        <span className="text-sm font-bold">{t('lectureResources')}</span>
                      </div>
                      <a
                        href={activeLecture.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-2xl bg-primary-light border border-primary/20 group hover:bg-primary-light/80 transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{t('downloadLectureNotes')}</p>
                          <p className="text-[11px] text-gray-500">{t('pdfDocument')}</p>
                        </div>
                        <Button type="text" icon={<ChevronRight size={18} />} className="text-primary/60 group-hover:text-primary" />
                      </a>
                    </div>
                  )}

                  {activeLecture.slidesUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Presentation size={16} className="text-purple-500" />
                        <span className="text-sm font-bold">{t('lectureSlides')}</span>
                      </div>
                      <a
                        href={activeLecture.slidesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100 group hover:bg-purple-100 transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-purple-500 shadow-sm">
                          <Presentation size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{t('viewSlides')}</p>
                          <p className="text-[11px] text-gray-500">{t('slideDeck')}</p>
                        </div>
                        <Button type="text" icon={<ChevronRight size={18} />} className="text-purple-400 group-hover:text-purple-600" />
                      </a>
                    </div>
                  )}

                  {/* Lecture Quiz Section */}
                  {((activeLecture as any).quiz || (activeLecture as any).quizId) && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <ListChecks size={16} className="text-primary" />
                        <span className="text-sm font-bold">{isAr ? 'كويز المحاضرة' : 'Lecture Quiz'}</span>
                      </div>

                      <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <ListChecks size={24} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">
                              {isAr
                                ? ((activeLecture as any).quiz?.title_ar || 'كويز المحاضرة')
                                : ((activeLecture as any).quiz?.title_en || 'Lecture Quiz')}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {isAr ? 'اضغط لعرض تفاصيل وأسئلة الكويز' : 'Click to view quiz details & questions'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const id = (activeLecture as any).quiz?.id || (activeLecture as any).quizId;
                              setSelectedQuizId(id);
                              setMainViewMode('quiz');
                            }}
                            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-sm"
                          >
                            {isAr ? 'عرض الكويز' : 'View Quiz'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <BookOpen size={64} className="text-gray-200 mb-4" />
                  <h3 className="text-lg font-bold text-gray-400">{t('selectLectureToView')}</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none;}
        .ant-switch-checked { background-color: #6B38D4 !important; }
      `}} />
      <AddLectureModal
        visible={isAddLectureModalVisible}
        onClose={() => {
          setIsAddLectureModalVisible(false);
          setEditingLecture(null);
          setTargetSectionIdForLecture(null);
        }}
        courseId={courseId || ''}
        lecture={editingLecture || undefined}
        sections={sections}
        defaultSectionId={targetSectionIdForLecture || undefined}
      />
      <AddQuizModal
        isOpen={isAddQuizModalVisible}
        onClose={() => {
          setIsAddQuizModalVisible(false);
          setTargetSectionIdForQuiz(null);
          setEditingQuiz(null);
        }}
        sections={sections}
        courseId={courseId}
        defaultSectionId={targetSectionIdForQuiz || undefined}
        quiz={editingQuiz}
      />
      <AddSectionModal
        isOpen={isAddSectionModalOpen}
        onClose={() => {
          setIsAddSectionModalOpen(false);
          setEditingSection(null);
        }}
        courseId={courseId || ''}
        section={editingSection}
      />
      <ViewQuizModal
        isOpen={isViewQuizModalVisible}
        onClose={() => {
          setIsViewQuizModalVisible(false);
          setSelectedQuizId(null);
        }}
        quizId={selectedQuizId}
      />
    </div>
  );
}
