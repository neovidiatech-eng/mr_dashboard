import { Calendar, Info, Send, Loader2, Star, Edit, Eye, X } from "lucide-react";
import { useTeacherReports, useTeacherInsights, useAddTeacherReport, useUpdateTeacherReport } from "../hooks/useTeacherReports";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { useState } from "react";
import ReportDetailsModal from "../components/ReportDetailsModal";
import { useForm } from "react-hook-form";
import { CreateTeacherReport } from "../../../types/reports";
import { reportSchema } from "../../../lib/schemas/ReportSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const { data: reports, isLoading: reportsLoading } = useTeacherReports();
  const { mutateAsync: addReport, isPending: isAdding } = useAddTeacherReport();
  const { mutateAsync: updateReport, isPending: isUpdating } = useUpdateTeacherReport();
  const isSubmitting = isAdding || isUpdating;

  const defaultFormValues = {
    totalClasses: 0,
    studentsTaught: 0,
    avgSessionDuration: 0,
    materialsUploaded: 0,
    overallRating: 5,
    teachingSummary: "",
    studentProgress: "",
    challenges: "",
    weekStarting: "",
    weekEnding: ""
  };


  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateTeacherReport>({
    resolver: zodResolver(reportSchema),
    defaultValues: defaultFormValues
  });
  
  // Calculate current week range for insights
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 6 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 6 }), "yyyy-MM-dd");
  
  const { data: insights, isLoading: insightsLoading } = useTeacherInsights({
    weekStarting: weekStart,
    weekEnding: weekEnd,
  });

  const onSubmit = async (data: CreateTeacherReport) => {
      if (editingReportId) {
        await updateReport({ id: editingReportId, data });
      } else {
        await addReport(data);
      }
      reset(defaultFormValues);
      setEditingReportId(null);
  };

  const handleEdit = (report: any) => {
    setEditingReportId(report.id);
    reset({
      weekStarting: format(new Date(report.weekStarting), "yyyy-MM-dd"),
      weekEnding: format(new Date(report.weekEnding), "yyyy-MM-dd"),
      totalClasses: report.totalClasses,
      studentsTaught: report.studentsTaught,
      avgSessionDuration: report.avgSessionDuration,
      materialsUploaded: report.materialsUploaded,
      overallRating: report.overallRating,
      teachingSummary: report.teachingSummary,
      studentProgress: report.studentProgress,
      challenges: report.challenges,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const cancelEdit = () => {
    setEditingReportId(null);
    reset(defaultFormValues);
  };

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-12 p-7">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 font-['Inter']">
          Weekly Reports
        </h1>
        <p className="text-slate-400 font-medium">
          {editingReportId ? 'Edit your previously submitted report' : 'Submit your weekly teaching performance and feedback'}
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Form Section */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              Report Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Week Starting
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    type="date"
                    {...register("weekStarting")}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-600"
                  />
                </div>
                {errors.weekStarting && <p className="text-red-500 text-xs mt-1">{errors.weekStarting.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Week Ending
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    type="date"
                    {...register("weekEnding")}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-600"
                  />
                </div>
                {errors.weekEnding && <p className="text-red-500 text-xs mt-1">{errors.weekEnding.message}</p>}
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-8">
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Total Classes Conducted
                </label>
                <input
                  type="number"
                  placeholder="12"
                  {...register("totalClasses", { valueAsNumber: true })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-gray-100 rounded-xl focus:outline-none transition-all font-medium text-slate-600"
                />
                {errors.totalClasses && <p className="text-red-500 text-xs mt-1">{errors.totalClasses.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Students Taught
                </label>
                <input
                  type="number"
                  placeholder="18"
                  {...register("studentsTaught", { valueAsNumber: true })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-gray-100 rounded-xl focus:outline-none transition-all font-medium text-slate-600"
                />
                {errors.studentsTaught && <p className="text-red-500 text-xs mt-1">{errors.studentsTaught.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Average Session Duration (mins)
                </label>
                <input
                  type="number"
                  placeholder="55"
                  {...register("avgSessionDuration", { valueAsNumber: true })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-gray-100 rounded-xl focus:outline-none transition-all font-medium text-slate-600"
                />
                {errors.avgSessionDuration && <p className="text-red-500 text-xs mt-1">{errors.avgSessionDuration.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Materials Uploaded
                </label>
                <input
                  type="number"
                  placeholder="8"
                  {...register("materialsUploaded", { valueAsNumber: true })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-gray-100 rounded-xl focus:outline-none transition-all font-medium text-slate-600"
                />
                {errors.materialsUploaded && <p className="text-red-500 text-xs mt-1">{errors.materialsUploaded.message}</p>}
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Teaching Summary
                </label>
                <textarea
                  rows={4}
                  {...register("teachingSummary")}
                  placeholder="Provide a summary of topics covered, teaching methods used, and overall progress..."
                  className="w-full p-6 bg-slate-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-600 resize-none"
                />
                {errors.teachingSummary && <p className="text-red-500 text-xs mt-1">{errors.teachingSummary.message}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Student Progress & Highlights
                </label>
                <textarea
                  rows={4}
                  {...register("studentProgress")}
                  placeholder="Highlight notable student achievements, improvements, or areas needing attention..."
                  className="w-full p-6 bg-slate-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-600 resize-none"
                />
                {errors.studentProgress && <p className="text-red-500 text-xs mt-1">{errors.studentProgress.message}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Challenges Faced
                </label>
                <textarea
                  rows={4}
                  {...register("challenges")}
                  placeholder="Describe any challenges encountered during the week..."
                  className="w-full p-6 bg-slate-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-600 resize-none"
                />
                {errors.challenges && <p className="text-red-500 text-xs mt-1">{errors.challenges.message}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 ml-1">
                  Overall Rating (1-5)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    {...register("overallRating", { valueAsNumber: true })}
                    className="flex-1 accent-blue-600"
                  />
                  <div className="flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-xl text-blue-700 font-bold">
                    <Star size={16} className="fill-blue-700" />
                    {watch("overallRating")}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4 justify-center ">
              <button 
                type="submit"
                disabled={isSubmitting}
                className=" flex flex-row items-center justify-center bg-[#2563eb] text-white px-12 py-4 rounded-xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all h-[45px] w-full max-w-[250px] text-[12px] lg:text-[15px] disabled:opacity-50 "
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <Send className="inline-block mr-1" size={20} />
                )}
                {editingReportId ? 'Update Report' : 'Submit Report'}
              </button>
              {editingReportId && (
                <button 
                  type="button"
                  onClick={cancelEdit}
                  className=" flex flex-row items-center justify-center bg-white text-slate-600 border border-slate-200 px-12 py-4 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-800 transition-all h-[45px] w-full max-w-[200px] text-[12px] lg:text-[15px] "
                >
                  <X className="inline-block mr-1" size={20} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* This Week Stats */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
              This Week
              {insightsLoading && <Loader2 className="animate-spin text-blue-500" size={16} />}
            </h3>
            <div className="space-y-5">
              {[
                { label: "Classes", val: insights?.data?.totalClasses || 0, color: "text-blue-500" },
                { label: "Students", val: insights?.data?.studentsTaught || 0, color: "text-purple-500" },
                { label: "Hours", val: `${insights?.data?.avgSessionDuration || 0}m`, color: "text-green-500" },
                { label: "Materials", val: insights?.data?.materialsUploaded || 0, color: "text-orange-500" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-bold text-slate-400">
                    {item.label}
                  </span>
                  <span className={`text-lg font-black ${item.color}`}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Reports */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
              Previous Reports
              {reportsLoading && <Loader2 className="animate-spin text-blue-500" size={16} />}
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {(() => {
                const reportsList = Array.isArray(reports?.data) ? reports.data : (reports?.data?.items || []);
                return (
                  <>
                    {reportsList.length === 0 && !reportsLoading && (
                      <p className="text-sm text-slate-400 text-center py-4">No reports found</p>
                    )}
                    {reportsList.map((report: any, i: number) => (
                <div
                  key={report.id || i}
                  className="p-4 bg-slate-50/50 border border-slate-50 rounded-2xl flex flex-col gap-3 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-1">
                        {format(new Date(report.weekStarting), "MMM dd")} - {format(new Date(report.weekEnding), "MMM dd")}
                      </h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
                        Submitted
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      type="button"
                      onClick={() => setSelectedReportId(report.id)}
                      className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-1"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleEdit(report)}
                      className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:text-amber-600 hover:border-amber-200 transition-all flex items-center justify-center gap-1"
                    >
                      <Edit size={12} /> Edit
                    </button>
                  </div>
                </div>
              ))}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-[#E3EAF9] p-8 rounded-3xl border border-blue-100/30">
            <div className="flex items-center gap-3 text-blue-700 font-bold mb-4">
              <Info size={20} />
              <h4>Report Guidelines</h4>
            </div>
            <ul className="space-y-3">
              {[
                "Submit reports by end of each week",
                "Be specific about student progress",
                "Include measurable outcomes",
                "Note any technical issues",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[13px] font-medium text-blue-600/70"
                >
                  <span className="text-blue-400">•</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </form>

      <ReportDetailsModal 
        reportId={selectedReportId} 
        onClose={() => setSelectedReportId(null)} 
      />
    </div>
  );
}
