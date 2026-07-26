// import { ArrowLeft, Check, Play , Lock , Calendar } from "lucide-react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { useState } from "react";
// import VideoModal from "../../../../components/modals/VideoModal";
// import { useQuery } from "@tanstack/react-query";
// import { getStudentProgress } from "../../../../services/CoursesServices";
// import { SiOpen3D } from "react-icons/si";

// export default function CurriculumDetails() {
//   const navigate = useNavigate();
//   const { curriculumId } = useParams();
//   const location = useLocation();


//   const { data: progressData, isLoading, error } = useQuery({
//     queryKey: ['student-progress', curriculumId],
//     queryFn: () => getStudentProgress(curriculumId!),
//     enabled: !!curriculumId,
//   });

//   const courseTitle = progressData?.title || location.state?.courseTitle || "Course Details";
//   const lectures = progressData?.lectures || [];
//     const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
//   const [selectedVideoName, setSelectedVideoName] = useState("");
// const [selectedVideoUrl, setSelectedVideoUrl] = useState("");


//   return (
//     <div className="space-y-6 animate-in fade-in duration-700 p-6 md:p-10 max-w-7xl mx-auto">
//       {/* Top Back Nav */}
//       <div>
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm"
//         >
//           <ArrowLeft size={16} />
//           Back to Levels
//         </button>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center p-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       ) : error ? (
//         <div className="p-4 bg-red-50 text-red-600 rounded-lg">
//             Error loading curriculum data. Please try again later.
//         </div>
//       ) : (
//         <>
//             {/* Header */}
//             <h1 className="text-3xl font-bold text-slate-800 mb-8">{courseTitle}</h1>

//             {/* Sessions List */}
//             <div className="space-y-4">
//               {lectures.length === 0 ? (
//                 <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
//                     No lectures found for this course.
//                 </div>
//               ) : (
//                 lectures.map((lecture: any, index: number) => {
//                   const isCompleted = lecture.status === "Completed";
//                   const isPending = lecture.status === "Pending" || !lecture.status;
//                   const isLocked = lecture.status === "Locked";
//                   const lectureOrder = lecture.order || index + 1;

//                   return (
//                     <div 
//                       key={lecture.id || index}
//                       className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
//                     >
//                       <div className="flex items-center gap-4 md:gap-6">
//                         {/* Session Icon/Number */}
//                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
//                           isCompleted ? "bg-green-100 text-green-600" :
//                           isPending ? "bg-amber-100 text-amber-600" :
//                           "bg-slate-50 border border-slate-200 text-slate-500"
//                         }`}>
//                           {isCompleted ? <Check strokeWidth={3} size={20} /> : lectureOrder}
//                         </div>

//                         {/* Session Info */}
//                         <div>
//                           <h3 className="text-lg font-bold text-slate-800">{lecture.title || `Lecture ${lectureOrder}`}</h3>
//                           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 font-medium">
//                             <Calendar size={14} className="text-slate-400" />
//                             <span>{lecture.date || "Date TBA"}</span>
//                             {(lecture.duration) && (
//                                 <>
//                                     <span className="px-1 text-slate-300">•</span>
//                                     <span>Duration: {lecture.duration}</span>
//                                 </>
//                             )}
//                           </div>
//                           {lecture.content && (
//                               <p className="text-sm text-slate-500 mt-2 line-clamp-2">{lecture.content}</p>
//                           )}
//                         </div>
//                       </div>

//                       {/* Badges & Actions */}
//                       <div className="flex flex-wrap items-center gap-3">
//                         {/* Badge */}
//                         <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
//                           isCompleted ? "bg-green-100 text-green-700" :
//                           isPending ? "bg-amber-100 text-amber-700" :
//                           "bg-slate-100 text-slate-500"
//                         }`}>
//                           {lecture.status || "Pending"}
//                         </span>

//                         {/* Actions */}
//                         {(isCompleted || isPending) && lecture.videoUrl && (
//                             <button 
//                              onClick={() => {
//   setSelectedVideoName(lecture.title || `Lecture ${lectureOrder}`);
//   setSelectedVideoUrl(lecture.videoUrl);
//   setIsVideoModalOpen(true);
// }}
//                               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-blue-200"
//                             >
//                               <Play size={16} fill="currentColor" />
//                               Watch Video
//                             </button>
//                         )}
                        
//                         {(isCompleted || isPending) && lecture.pdfUrl && (
//                             <button 
//                               onClick={() => {
//                                 window.open(lecture.pdfUrl, '_blank', 'noopener,noreferrer');
//                               }}
//                               className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
//                             >
//                               <SiOpen3D size={16} />
//                               View PDF
//                             </button>
//                         )}

//                         {isPending && !lecture.videoUrl && (
//                           <button className="flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed">
//                             <Calendar size={16} />
//                             Upcoming
//                           </button>
//                         )}

//                         {isLocked && (
//                           <button className="flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed">
//                             <Lock size={16} />
//                             Locked
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>

//            <VideoModal
//   isOpen={isVideoModalOpen}
//   onClose={() => setIsVideoModalOpen(false)}
//   sessionName={selectedVideoName}
//   videoUrl={selectedVideoUrl}
// />
//         </>
//       )}
//     </div>
//   );
// }

import {
  ArrowLeft,
  Check,
  Play,
  Lock,
  Calendar,
} from "lucide-react";

import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import { useState } from "react";

import VideoModal from "../../../../components/modals/VideoModal";

import { useQuery } from "@tanstack/react-query";
import { getStudentProgress } from "../../../../services/CoursesServices";
import { useCompleteLecture } from "../../../../hooks/useLectures";
import { SiOpen3D } from "react-icons/si";

export default function CurriculumDetails() {
  const navigate = useNavigate();
  const { curriculumId } = useParams();
  const location = useLocation();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoName, setSelectedVideoName] = useState("");
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);

  const completeLectureMutation = useCompleteLecture();

  const handleVideoEnded = () => {
    if (selectedLectureId) {
      completeLectureMutation.mutate(selectedLectureId);
    }
  };

  const {
    data: progressData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["student-progress", curriculumId],

    queryFn: () =>
      getStudentProgress(curriculumId!),

    enabled: !!curriculumId,
  });

  const courseTitle =
    progressData?.title ||
    location.state?.courseTitle ||
    "Course Details";

  const lectures = progressData?.lectures || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 p-6 md:p-10 max-w-7xl mx-auto">
      
      {/* Back */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm"
        >
          <ArrowLeft size={16} />
          Back to Levels
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        
        /* Error */
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Error loading curriculum data.
          Please try again later.
        </div>

      ) : (
        <>
          {/* Header */}
          <h1 className="text-3xl font-bold text-slate-800 mb-8">
            {courseTitle}
          </h1>

          {/* Lectures */}
          <div className="space-y-4">
            {lectures.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No lectures found for this course.
              </div>
            ) : (
              lectures.map(
                (lecture: any, index: number) => {
                  const isCompleted =
                    lecture.status === "Completed";

                  const isPending =
                    lecture.status === "Pending" ||
                    !lecture.status;

                  const isLocked =
                    lecture.status === "Locked";

                  const lectureOrder =
                    lecture.order || index + 1;

                  return (
                    <div
                      key={lecture.id || index}
                      className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      
                      {/* Left */}
                      <div className="flex items-center gap-4 md:gap-6">
                        
                        {/* Number */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                            isCompleted
                              ? "bg-green-100 text-green-600"
                              : isPending
                              ? "bg-amber-100 text-amber-600"
                              : "bg-slate-50 border border-slate-200 text-slate-500"
                          }`}
                        >
                          {isCompleted ? (
                            <Check
                              strokeWidth={3}
                              size={20}
                            />
                          ) : (
                            lectureOrder
                          )}
                        </div>

                        {/* Info */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                            {lecture.title ||
                              `Lecture ${lectureOrder}`}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 font-medium">
                            <Calendar
                              size={14}
                              className="text-slate-400"
                            />

                            <span>
                              {lecture.date ||
                                "Date TBA"}
                            </span>

                            {lecture.duration && (
                              <>
                                <span className="px-1 text-slate-300">
                                  •
                                </span>

                                <span>
                                  Duration:{" "}
                                  {lecture.duration}
                                </span>
                              </>
                            )}
                          </div>

                          {lecture.content && (
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                              {lecture.content}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-wrap items-center gap-3">
                        
                        {/* Status */}
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : isPending
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {lecture.status || "Pending"}
                        </span>

                        {/* Video */}
                        {(isCompleted || isPending) &&
                          lecture.videoUrl && (
                            <button
                              onClick={() => {
                                setSelectedVideoName(
                                  lecture.title ||
                                    `Lecture ${lectureOrder}`
                                );

                                setSelectedVideoUrl(
                                  lecture.videoUrl
                                );

                                setSelectedLectureId(lecture.id);

                                setIsVideoModalOpen(
                                  true
                                );
                              }}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-blue-200"
                            >
                              <Play
                                size={16}
                                fill="currentColor"
                              />

                              Watch Video
                            </button>
                          )}

                        {/* Mark Complete Button */}
                        {isPending && (
                          <button
                            onClick={() => completeLectureMutation.mutate(lecture.id)}
                            disabled={completeLectureMutation.isPending}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-emerald-100 disabled:opacity-50"
                          >
                            <Check size={16} />
                            Complete
                          </button>
                        )}

                        {/* PDF */}
                        {(isCompleted || isPending) &&
                          lecture.pdfUrl && (
                            <button
                              onClick={() => {
                                window.open(
                                  lecture.pdfUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }}
                              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                            >
                              <SiOpen3D size={16} />
                              View PDF
                            </button>
                          )}

                        {/* Upcoming */}
                        {isPending &&
                          !lecture.videoUrl && (
                            <button className="flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed">
                              <Calendar size={16} />
                              Upcoming
                            </button>
                          )}

                        {/* Locked */}
                        {isLocked && (
                          <button className="flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed">
                            <Lock size={16} />
                            Locked
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>

          {/* Video Modal */}
          <VideoModal
            isOpen={isVideoModalOpen}
            onClose={() =>
              setIsVideoModalOpen(false)
            }
            sessionName={selectedVideoName}
            videoUrl={selectedVideoUrl}
            onEnded={handleVideoEnded}
          />
        </>
      )}
    </div>
  );
}
