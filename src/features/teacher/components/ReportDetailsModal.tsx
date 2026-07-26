import { X, Calendar, Users, Clock, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useTeacherReportById } from '../hooks/useTeacherReports';

interface ReportDetailsModalProps {
  reportId: string | null;
  onClose: () => void;
}

export default function ReportDetailsModal({ reportId, onClose }: ReportDetailsModalProps) {
  const { data: reportResponse, isLoading } = useTeacherReportById(reportId || '');
  const report = reportResponse?.data;

  if (!reportId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">Weekly Report Details</h2>
            {report && (
              <p className="text-slate-500 font-medium mt-1">
                {format(new Date(report.weekStarting), "MMM dd")} - {format(new Date(report.weekEnding), "MMM dd, yyyy")}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold animate-pulse">Loading report data...</p>
            </div>
          ) : report ? (
            <div className="space-y-10">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { icon: Calendar, label: "Classes", val: report.totalClasses, color: "text-blue-500", bg: "bg-blue-50" },
                  { icon: Users, label: "Students", val: report.studentsTaught, color: "text-purple-500", bg: "bg-purple-50" },
                  { icon: Clock, label: "Avg. Duration", val: `${report.avgSessionDuration}m`, color: "text-green-500", bg: "bg-green-50" },
                  { icon: FileText, label: "Materials", val: report.materialsUploaded, color: "text-orange-500", bg: "bg-orange-50" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/30 flex flex-col items-center text-center">
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} mb-3`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{item.label}</span>
                    <span className="text-lg font-black text-slate-700">{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Text Sections */}
              <div className="space-y-8">
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h3 className="text-lg">Teaching Summary</h3>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-50 text-slate-600 leading-relaxed font-medium">
                    {report.teachingSummary}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <div className="w-1 h-6 bg-green-500 rounded-full" />
                    <h3 className="text-lg">Student Progress</h3>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-50 text-slate-600 leading-relaxed font-medium">
                    {report.studentProgress}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <div className="w-1 h-6 bg-red-500 rounded-full" />
                    <h3 className="text-lg">Challenges</h3>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-50 text-slate-600 leading-relaxed font-medium">
                    {report.challenges}
                  </div>
                </section>
              </div>

              {/* Rating */}
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-400 font-bold">Overall Rating</span>
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                  <TrendingUp size={18} className="text-yellow-600" />
                  <span className="text-lg font-black text-yellow-700">{report.overallRating}/5</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <AlertCircle size={48} className="mb-4 opacity-20" />
               <p className="font-bold">Report not found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
