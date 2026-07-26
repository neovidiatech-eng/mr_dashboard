import { Calendar, ChevronDown } from 'lucide-react';
import { Course } from '../../../types/courses';

interface SessionPreviewProps {
  previewSessions: {
    date: string;
    available: boolean;
  }[];
  formatDateCard: (date: string) => { month: string; day: number };
  watchTitle: string;
  selectedCourse: Course | null;
  watchStartTime: string;
}

export default function SessionPreview({
  previewSessions,
  formatDateCard,
  watchTitle,
  selectedCourse,
  watchStartTime,
}: SessionPreviewProps) {
  return (
    <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Schedule Preview</h3>
        <p className="text-xs text-gray-400 mt-1">
          {previewSessions.length} Sessions
        </p>
      </div>

      <div className="p-6 space-y-4">
        {previewSessions.length ? (
          previewSessions.map((session, index) => {
            const date = formatDateCard(session.date);

            return (
              <div
                key={index}
                className={`rounded-2xl p-4 border ${
                  session.available
                    ? 'bg-white border-gray-100'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase font-black text-gray-500">
                      {date.month}
                    </span>
                    <span className="font-black text-lg">{date.day}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      {/* <h4 className="text-sm font-bold text-gray-900">
                        {watchTitle || 'Untitled Session'}
                      </h4> */}
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                          session.available
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {session.available ? 'Available' : 'Conflict'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {selectedCourse?.title || 'No Subject'}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {watchStartTime}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No sessions generated yet</p>
          </div>
        )}

        {previewSessions.length > 5 && (
          <button
            type="button"
            className="w-full text-indigo-600 text-sm font-bold flex items-center justify-center gap-1"
          >
            View More
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
