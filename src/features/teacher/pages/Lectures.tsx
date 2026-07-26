import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  FileText,
  Video,
  ArrowLeft,
  BookOpen,
  Earth,
  Presentation,
} from 'lucide-react';
import { Button, Empty } from 'antd';
import { useCourseById } from '../../../hooks/useCourses';
import { Lecture } from '../../../types/lectures';
import ReactPlayer from 'react-player';

export default function TeacherLectures() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  const { data: selectedCourse, isLoading } = useCourseById(courseId || '');

  // Auto-select first lecture if none selected
  useEffect(() => {
    if (selectedCourse?.lectures && selectedCourse.lectures.length > 0 && !selectedLessonId) {
      setSelectedLessonId(selectedCourse.lectures[0].id);
    }
  }, [selectedCourse, selectedLessonId]);

  const handleBack = () => {
    navigate('/teacher-dashboard/courses');
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
  }

  if (!selectedCourse && !isLoading) {
    return (
      <div className="p-8 text-center">
        <Empty description="Course not found" />
        <Button onClick={handleBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const lectures = selectedCourse?.lectures || [];
  const activeLecture = lectures.find((l: Lecture) => l.id === selectedLessonId) || lectures[0];

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] bg-[#f8fafc] overflow-hidden p-8" dir="ltr">
      {/* Detail Header */}
      <div className="mb-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeft size={18} />}
            onClick={handleBack}
            className="rounded-xl h-10 w-10 flex items-center justify-center border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100"
          />
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Teacher Hub <ChevronRight size={10} /> <span className="text-indigo-600">{selectedCourse?.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedCourse?.title}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden gap-6">
        {/* Left Sidebar */}
        <div className="w-[350px] flex flex-col gap-4 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course Content</span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
              {lectures.length > 0 ? (
                lectures.map((lecture: Lecture) => (
                  <div
                    key={lecture.id}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-all border-b border-gray-50 last:border-0 ${selectedLessonId === lecture.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedLessonId(lecture.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${selectedLessonId === lecture.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {lecture.order}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${selectedLessonId === lecture.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                          {lecture.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Video size={10} className={selectedLessonId === lecture.id ? 'text-indigo-400' : 'text-gray-300'} />
                          <span className="text-[10px] text-gray-400 font-medium">Lecture</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={14} className={selectedLessonId === lecture.id ? 'text-indigo-400' : 'text-gray-300'} />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Empty description="No lectures yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-2">Current Lecture</span>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeLecture?.title || 'No Lecture Selected'}
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
                        <Video size={16} className="text-red-600" />
                        <span className="text-sm font-bold">Video Content</span>
                      </div>
                    </div>
                    {activeLecture.videoUrl ? (
                      <div className="relative aspect-video rounded-2xl bg-gray-900 overflow-hidden shadow-lg group">
                        {activeLecture.videoUrl.includes('drive.google.com') ? (
                          <iframe
                            src={activeLecture.videoUrl.replace('/view', '/preview')}
                            width="100%"
                            height="100%"
                            className="w-full h-full border-0 absolute top-0 left-0"
                            allowFullScreen
                            title="Google Drive Video"
                          />
                        ) : (
                          /* @ts-ignore */
                          <ReactPlayer
                            url={activeLecture.videoUrl}
                            width="100%"
                            height="100%"
                            className="absolute top-0 left-0"
                            controls
                          />
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                        <Video size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-400 font-medium">No video uploaded for this lecture</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={16} className="text-indigo-600" />
                      <span className="text-sm font-bold">Lecture Description</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-gray-100 text-gray-600 leading-relaxed">
                      {activeLecture.content || 'No content provided for this lecture.'}
                    </div>
                  </div>

                  {activeLecture.pdfUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} className="text-red-500" />
                        <span className="text-sm font-bold">Lecture Resources (PDF)</span>
                      </div>
                      <a 
                        href={activeLecture.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-2xl bg-red-50 border border-red-100 group hover:bg-red-100 transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">Download Lecture Notes</p>
                          <p className="text-[11px] text-gray-500">PDF Document • Click to view or download</p>
                        </div>
                        <Button type="text" icon={<ChevronRight size={18} />} className="text-red-400 group-hover:text-red-600" />
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

            <div className="p-6 rounded-2xl bg-[#F4F7FF] border border-gray-100 flex items-center justify-between mt-auto mx-8 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4648D4] border border-gray-100">
                  <Earth size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-gray-900">Material is Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
