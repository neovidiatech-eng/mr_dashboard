

interface ChatHeaderProps {
  teacherName: string;
  isTeacherOnline: boolean;
  isTyping?: boolean;
}

export default function ChatHeader({ teacherName, isTeacherOnline, isTyping }: ChatHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-slate-100 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
              {teacherName.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isTeacherOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              {isTeacherOnline && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">
              {teacherName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              {isTyping ? (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-blue-600 animate-pulse">typing...</span>
                  <div className="flex gap-0.5">
                    <span className="w-0.5 h-0.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-0.5 h-0.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-0.5 h-0.5 rounded-full bg-blue-600 animate-bounce" />
                  </div>
                </div>
              ) : (
                <>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${isTeacherOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isTeacherOnline ? 'Online Now' : 'Offline'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[11px] text-slate-400 font-medium">Instructor</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
              Current Session
            </p>
            <p className="text-xs text-slate-600 font-semibold">
              Curriculum Support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
