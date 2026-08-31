import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
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
} from 'lucide-react';
import { Button, Dropdown, Modal, Empty, Spin } from 'antd';
import { useCourseById } from '../../../hooks/useCourses';
import { useDeleteLecture } from '../../../hooks/useLectures';
import { useQueryClient } from '@tanstack/react-query';
import AddLectureModal from './AddLectureModal';
import AddExam from '../../../components/modals/AddExamModal';
import { ExamData } from '../../../types/courseExam';
import { Lecture } from '../../../types/lectures';
import UniversalVideoPlayer from '../../../components/ui/UniversalVideoPlayer';
import { useLanguage } from '../../../contexts/LanguageContext';
import ErrorService from '../../../utils/ErrorService';
import { baseURL } from '../../../consts';

const encodePath = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return encodeURI(path).replace(/#/g, '%23');
  return `${baseURL}/${path.replace(/^\//, '').split('/').map(s => encodeURIComponent(s)).join('/')}`;
};

import { useCreateQuiz } from '../../../hooks/useQuizzes';
import { convertExamDataToQuizPayload } from '../../../services/QuizServices';

export default function CourseDetails() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [isAddLectureModalVisible, setIsAddLectureModalVisible] = useState(false);
  const [isAddExamModalVisible, setIsAddExamModalVisible] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  const queryClient = useQueryClient();
  const { data: selectedCourse, isLoading } = useCourseById(courseId || '');
  const { mutate: deleteLecture } = useDeleteLecture();
  const { mutateAsync: createQuiz } = useCreateQuiz();

  const lectures = selectedCourse?.lectures || [];
  const activeLecture = lectures.find((l: Lecture) => l.id === selectedLessonId) || lectures[0];

  // Auto-select first lecture if none selected
  useEffect(() => {
    if (lectures.length > 0 && !selectedLessonId) {
      setSelectedLessonId(lectures[0].id);
    }
  }, [lectures, selectedLessonId]);

  const handleBack = () => {
    navigate('/dashboard/curriculum');
  };

  const handleSaveExam = async (examData: ExamData) => {
    try {
      const payload = convertExamDataToQuizPayload(examData, courseId);
      await createQuiz(payload);
      ErrorService.success(isAr ? 'تم حفظ كويز الامتحان بنجاح!' : 'Quiz saved successfully!');
      setIsAddExamModalVisible(false);
    } catch (error: any) {
      console.error('Failed to save exam:', error);
      ErrorService.error(
        error?.response?.data?.message || (isAr ? 'حدث خطأ أثناء حفظ الامتحان' : 'Failed to save exam')
      );
    }
  };

  const handleEditLecture = (lecture: Lecture, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLecture(lecture);
    setIsAddLectureModalVisible(true);
  };

  const handleDeleteLecture = (lectureId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: t('deleteLectureConfirmTitle'),
      content: t('deleteLectureConfirmDesc'),
      okText: t('delete'),
      okType: 'danger',
      onOk: () => {
        deleteLecture(lectureId, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            if (selectedLessonId === lectureId) setSelectedLessonId('');
          }
        });
      }
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
      <div className="p-8 bg-[#f8fafc] min-h-[calc(100vh-90px)] flex flex-col items-center justify-center" dir="ltr">
        <Empty description={t('courseNotFound')} />
        <Button onClick={handleBack} className="mt-4 rounded-xl font-bold">
          {t('backToCurriculum')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] bg-[#f8fafc] overflow-hidden p-8" dir="ltr">
      {/* Detail Header */}
      <div className="mb-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="rounded-xl h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors bg-white shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {t('curriculum')} <ChevronRight size={10} /> <span className="text-primary">{isAr ? selectedCourse.title_ar || selectedCourse.title : selectedCourse.title_en || selectedCourse.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{isAr ? selectedCourse.title_ar || selectedCourse.title : selectedCourse.title_en || selectedCourse.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddExamModalVisible(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all shadow-sm active:scale-95"
          >
            <ListChecks size={16} />
            {isAr ? 'إضافة امتحان' : 'Add Exam'}
          </button>
          <button
            onClick={() => setIsAddLectureModalVisible(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-md shadow-primary/20 active:scale-95"
          >
            <Plus size={16} />
            {t('addLectureBtn')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden gap-6">
        {/* Left Sidebar */}
        <div className="w-[350px] flex flex-col gap-4 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('courseContent')}</span>
              <span className="text-xs font-bold text-gray-500">{lectures.length} {t('lecturesCount')}</span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
              {lectures.length > 0 ? (
                lectures.map((lecture: Lecture) => (
                  <div
                    key={lecture.id}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-all border-b border-gray-50 last:border-0 ${selectedLessonId === lecture.id ? 'bg-primary-light/60' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedLessonId(lecture.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${selectedLessonId === lecture.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {lecture.order}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${selectedLessonId === lecture.id ? 'text-primary' : 'text-gray-700'}`}>
                          {isAr ? lecture.title_ar || lecture.title : lecture.title_en || lecture.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Video size={10} className={selectedLessonId === lecture.id ? 'text-primary' : 'text-gray-300'} />
                          <span className="text-[10px] text-gray-400 font-medium">{t('lecture')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-black">
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'edit', label: t('edit'), icon: <Edit size={14} />, onClick: (info) => handleEditLecture(lecture, info.domEvent as any) },
                            { key: 'delete', label: t('delete'), icon: <Trash2 size={14} />, danger: true, onClick: (info) => handleDeleteLecture(lecture.id, info.domEvent as any) },
                          ]
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
                      <ChevronRight size={14} className={selectedLessonId === lecture.id ? 'text-primary' : 'text-gray-300'} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
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
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary-light text-primary text-[10px] font-bold uppercase tracking-widest mb-2">{t('currentLecture')}</span>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeLecture ? (isAr ? activeLecture.title_ar || activeLecture.title : activeLecture.title_en || activeLecture.title) : t('noLectureSelected')}
                </h2>
                <p className="text-[11px] font-bold text-gray-400">{t('lastUpdate')}: {activeLecture ? new Date(activeLecture.updatedAt).toLocaleDateString() : '-'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {activeLecture ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Video size={16} className="text-primary" />
                        <span className="text-sm font-bold">{t('videoContent')}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        MP4 - {activeLecture.video_path || activeLecture.videoUrl ? t('ready') : t('notSet')}
                      </span>
                    </div>
                    <UniversalVideoPlayer url={activeLecture.video_path || activeLecture.videoUrl || ''} />
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

                  {(activeLecture.pdf_path || activeLecture.pdfUrl) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} className="text-primary" />
                        <span className="text-sm font-bold">{t('lectureResources')}</span>
                      </div>
                      <a
                        href={encodePath(activeLecture.pdf_path || activeLecture.pdfUrl)}
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

                  {(activeLecture.slides_path || activeLecture.slidesUrl) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Presentation size={16} className="text-purple-500" />
                        <span className="text-sm font-bold">{t('lectureSlides')}</span>
                      </div>
                      <a
                        href={encodePath(activeLecture.slides_path || activeLecture.slidesUrl)}
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
        }}
        courseId={courseId || ''}
        lecture={editingLecture || undefined}
      />
      <AddExam
        isOpen={isAddExamModalVisible}
        onClose={() => setIsAddExamModalVisible(false)}
        onSave={handleSaveExam}
      />
    </div>
  );
}
