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
} from 'lucide-react';
import { Button, Dropdown, Modal, Empty, Spin } from 'antd';
import { useCourseById } from '../../../hooks/useCourses';
import { useDeleteLecture } from '../../../hooks/useLectures';
import { useQueryClient } from '@tanstack/react-query';
import AddLectureModal from './AddLectureModal';
import { Lecture } from '../../../types/lectures';
import UniversalVideoPlayer from '../../../components/ui/UniversalVideoPlayer';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [isAddLectureModalVisible, setIsAddLectureModalVisible] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  const queryClient = useQueryClient();
  const { data: selectedCourse, isLoading } = useCourseById(courseId || '');
  const { mutate: deleteLecture } = useDeleteLecture();

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

  const handleEditLecture = (lecture: Lecture, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLecture(lecture);
    setIsAddLectureModalVisible(true);
  };

  const handleDeleteLecture = (lectureId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Delete Lecture?',
      content: 'Are you sure you want to remove this lecture from the course?',
      okText: 'Delete',
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
        <Spin size="large" tip="Loading course details..." />
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="p-8 bg-[#f8fafc] min-h-[calc(100vh-90px)] flex flex-col items-center justify-center" dir="ltr">
        <Empty description="Course not found" />
        <Button onClick={handleBack} className="mt-4 rounded-xl font-bold">
          Back to Curriculum
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
              Curriculum <ChevronRight size={10} /> <span className="text-primary">{selectedCourse.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h1>
          </div>
        </div>
        <button
          onClick={() => setIsAddLectureModalVisible(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-md shadow-primary/20 active:scale-95"
        >
          <Plus size={16} />
          Add Lecture
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden gap-6">
        {/* Left Sidebar */}
        <div className="w-[350px] flex flex-col gap-4 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course Content</span>
              <span className="text-xs font-bold text-gray-500">{lectures.length} Lectures</span>
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
                          {lecture.title_ar || lecture.title_en || lecture.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Video size={10} className={selectedLessonId === lecture.id ? 'text-primary' : 'text-gray-300'} />
                          <span className="text-[10px] text-gray-400 font-medium">Lecture</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-black">
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'edit', label: 'Edit', icon: <Edit size={14} />, onClick: (info) => handleEditLecture(lecture, info.domEvent as any) },
                            { key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: (info) => handleDeleteLecture(lecture.id, info.domEvent as any) },
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
                  <Empty description="No lectures yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  <button
                    onClick={() => setIsAddLectureModalVisible(true)}
                    className="mt-2 px-4 py-1.5 rounded-lg text-[11px] font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm"
                  >
                    + Add First Lecture
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
                <span className="inline-block px-3 py-1 rounded-full bg-primary-light text-primary text-[10px] font-bold uppercase tracking-widest mb-2">Current Lecture</span>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeLecture ? (activeLecture.title_ar || activeLecture.title_en || activeLecture.title) : 'No Lecture Selected'}
                </h2>
                <p className="text-[11px] font-bold text-gray-400">Last Update: {activeLecture ? new Date(activeLecture.updatedAt).toLocaleDateString() : '-'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {activeLecture ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Video size={16} className="text-primary" />
                        <span className="text-sm font-bold">Video Content</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        MP4 - {activeLecture.videoUrl ? 'Ready' : 'Not Set'}
                      </span>
                    </div>
                    <UniversalVideoPlayer url={activeLecture?.videoUrl || (activeLecture as any)?.video_url || (activeLecture as any)?.url} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={16} className="text-primary" />
                      <span className="text-sm font-bold">Lecture Description</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-gray-100 text-gray-600 leading-relaxed">
                      {activeLecture.content_ar || activeLecture.content_en || activeLecture.content || 'No content provided for this lecture.'}
                    </div>
                  </div>

                  {activeLecture.pdfUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} className="text-primary" />
                        <span className="text-sm font-bold">Lecture Resources (PDF)</span>
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
                          <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Download Lecture Notes</p>
                          <p className="text-[11px] text-gray-500">PDF Document • Click to view or download</p>
                        </div>
                        <Button type="text" icon={<ChevronRight size={18} />} className="text-primary/60 group-hover:text-primary" />
                      </a>
                    </div>
                  )}

                  {activeLecture.slidesUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Presentation size={16} className="text-purple-500" />
                        <span className="text-sm font-bold">Lecture Slides</span>
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
                          <p className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">View Slides</p>
                          <p className="text-[11px] text-gray-500">Slide Deck • Click to view</p>
                        </div>
                        <Button type="text" icon={<ChevronRight size={18} />} className="text-purple-400 group-hover:text-purple-600" />
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <BookOpen size={64} className="text-gray-200 mb-4" />
                  <h3 className="text-lg font-bold text-gray-400">Select a lecture to view details</h3>
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
    </div>
  );
}
