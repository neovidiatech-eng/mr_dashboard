

interface ChatSidebarProps {
  teacherName: string;
  isTeacherOnline: boolean;
  teacherSubject: string;
  sessionTitle: string;
}

export default function ChatSidebar({
  teacherName,
  isTeacherOnline,
  teacherSubject,
  sessionTitle,
}: ChatSidebarProps) {
  return (
    <div className="hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 h-fit p-8 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center border-b border-slate-100 pb-6 mb-6">
        <div className="w-24 h-24 rounded-full border-[3px] border-blue-500 p-1 mb-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=random&color=fff`}
            alt={teacherName}
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        <h2 className="text-[1.1rem] font-bold text-slate-800 text-center mb-2">
          {teacherName}
        </h2>

        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isTeacherOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className={`text-xs font-semibold ${isTeacherOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
            {isTeacherOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <p className="text-sm font-medium text-slate-500 text-center">
          {teacherSubject}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs text-slate-400 mb-1">Current Curriculum</p>
          <p className="text-sm font-semibold text-slate-800">{sessionTitle}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Response Time</p>
          <p className="text-sm font-semibold text-slate-800">Within 2 hours</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Availability</p>
          <p className="text-sm font-semibold text-slate-800">Mon-Fri, 9AM-6PM</p>
        </div>
      </div>
    </div>
  );
}
