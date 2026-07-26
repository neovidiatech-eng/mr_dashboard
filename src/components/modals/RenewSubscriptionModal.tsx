import { useEffect, useState } from "react";
import { X, RefreshCw, Package, Trophy, BookOpen, Loader2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPlans } from "../../features/admin/services/PlansServices";
import { getAllRanks } from "../../features/admin/services/RankServices";
import { getAllCourses } from "../../services/CoursesServices";
import { renewSubscription } from "../../features/admin/services/subscriptionRequestServices";

interface RenewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

export default function RenewSubscriptionModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}: RenewSubscriptionModalProps) {
  const { language } = useLanguage();

  const [planId, setPlanId] = useState("");
  const [rankId, setRankId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [plans, setPlans] = useState<any[]>([]);
  const [ranks, setRanks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = {
    title: { ar: "تجديد الاشتراك", en: "Renew Subscription" },
    subtitle: { ar: "اختر الخطة والمرحلة والكورس لتجديد اشتراك", en: "Select plan, rank, and course to renew subscription for" },
    plan: { ar: "الخطة", en: "Plan" },
    rank: { ar: "المرحلة", en: "Rank" },
    course: { ar: "الكورس", en: "Course" },
    selectPlan: { ar: "اختر الخطة...", en: "Select a plan..." },
    selectRank: { ar: "اختر المرحلة...", en: "Select a rank..." },
    selectCourse: { ar: "اختر الكورس...", en: "Select a course..." },
    cancel: { ar: "إلغاء", en: "Cancel" },
    renew: { ar: "تجديد", en: "Renew" },
    renewing: { ar: "جارٍ التجديد...", en: "Renewing..." },
    success: { ar: "تم تجديد الاشتراك بنجاح", en: "Subscription renewed successfully" },
    errorRequired: { ar: "يرجى اختيار جميع الحقول", en: "Please select all fields" },
    errorApi: { ar: "حدث خطأ أثناء التجديد", en: "An error occurred during renewal" },
  };

  // Fetch plans + ranks on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchInitial = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const [plansData, ranksData] = await Promise.all([
          getPlans(),
          getAllRanks(),
        ]);
        setPlans(plansData || []);
        setRanks(ranksData?.data?.items || []);
      } catch {
        setError(text.errorApi[language]);
      } finally {
        setLoadingData(false);
      }
    };
    fetchInitial();
    // reset form
    setPlanId("");
    setRankId("");
    setCourseId("");
    setCourses([]);
  }, [isOpen]);

  // Fetch courses filtered by selected rank
  useEffect(() => {
    if (!rankId) {
      setCourses([]);
      setCourseId("");
      return;
    }
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setCourseId("");
      setCourses([]);
      try {
        const data = await getAllCourses(1, 100, rankId);
        setCourses(data?.items || []);
      } catch {
        setError(text.errorApi[language]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [rankId]);

  const handleSubmit = async () => {
    if (!planId || !rankId || !courseId) {
      setError(text.errorRequired[language]);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await renewSubscription(studentId, { planId, rankId, courseId });
      onSuccess?.();
      onClose();
    } catch {
      setError(text.errorApi[language]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 !mt-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2a286b] to-blue-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{text.title[language]}</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                {text.subtitle[language]}{" "}
                <span className="font-bold text-white">{studentName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {loadingData ? (
            <div className="flex items-center justify-center py-10 gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading options...</span>
            </div>
          ) : (
            <>
              {/* Plan */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Package className="w-4 h-4 text-blue-500" />
                  {text.plan[language]}
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">{text.selectPlan[language]}</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price} {p.currency?.symbol || ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rank */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  {text.rank[language]}
                </label>
                <select
                  value={rankId}
                  onChange={(e) => setRankId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">{text.selectRank[language]}</option>
                  {ranks.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  {text.course[language]}
                </label>
                <div className="relative">
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    disabled={!rankId || loadingCourses}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingCourses
                        ? (language === "ar" ? "جارٍ التحميل..." : "Loading courses...")
                        : !rankId
                          ? (language === "ar" ? "اختر المرحلة أولاً" : "Select a rank first")
                          : text.selectCourse[language]}
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  {loadingCourses && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm font-medium text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
          >
            {text.cancel[language]}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingData}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2a286b] to-blue-600 hover:opacity-90 rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {text.renewing[language]}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                {text.renew[language]}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
