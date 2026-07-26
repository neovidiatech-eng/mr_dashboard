import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Trophy, User, Package, Loader2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useGetRanks } from "../../features/admin/hooks/useRank";
import CustomSelect from "../ui/CustomSelect";
import { SubscriptionRequest } from "../../types/subscription";

interface UpdateSubscriptionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestStatusChange: (status: "approved" | "rejected", rankId?: string) => Promise<void>;
  request: SubscriptionRequest | null;
  initialStatus: "approved" | "rejected";
}

export default function UpdateSubscriptionStatusModal({
  isOpen,
  onClose,
  onRequestStatusChange,
  request,
  initialStatus,
}: UpdateSubscriptionStatusModalProps) {
  const { language } = useLanguage();
  const { data: ranksData, isLoading: isLoadingRanks } = useGetRanks();
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [status, setStatus] = useState<"approved" | "rejected">(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setStatus(initialStatus);
    
    if (!request) {
      setSelectedRank("");
      return;
    }

    // Auto-select rank based on age
    let age: number | null = null;
    if (request.user.age !== undefined && request.user.age !== null) {
      age = Number(request.user.age);
    } else {
      const birthStr = request.user.birth_date || request.user.birthDate;
      if (birthStr) {
        const birth = new Date(birthStr);
        if (!isNaN(birth.getTime())) {
          const today = new Date();
          let calculatedAge = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            calculatedAge--;
          }
          age = calculatedAge;
        }
      }
    }

    if (age !== null && ranksData?.data.items) {
      const matchedRank = ranksData.data.items.find(rank => 
        age! >= rank.ageRange.minAge && 
        age! <= rank.ageRange.maxAge
      );
      if (matchedRank) {
        setSelectedRank(matchedRank.id);
      } else {
        setSelectedRank("");
      }
    } else {
      setSelectedRank("");
    }
  }, [initialStatus, isOpen, request, ranksData]);

  if (!isOpen || !request) return null;

  const ranks = ranksData?.data.items || [];
  const rankOptions = ranks.map((rank) => ({
    value: rank.id,
    label: rank.name,
  }));

  const handleConfirm = async () => {
    if (status === "approved" && !selectedRank) {
      // Maybe show an error or just return
      return;
    }

    try {
      setIsSubmitting(true);
      await onRequestStatusChange(status, selectedRank);
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const text = {
    title: { ar: "تحديث حالة الطلب", en: "Update Request Status" },
    subtitle: { ar: "قم بتغيير حالة طلب الاشتراك وتحديد رتبة الطالب", en: "Change the subscription request status and set the student's rank" },
    student: { ar: "الطالب", en: "Student" },
    plan: { ar: "الخطة", en: "Plan" },
    status: { ar: "الحالة الجديدة", en: "New Status" },
    rank: { ar: "رتبة الطالب الأكاديمية", en: "Student Academic Rank" },
    selectRank: { ar: "اختر الرتبة...", en: "Select Rank..." },
    approve: { ar: "قبول", en: "Approve" },
    reject: { ar: "رفض", en: "Reject" },
    confirm: { ar: "تأكيد التغيير", en: "Confirm Change" },
    cancel: { ar: "إلغاء", en: "Cancel" },
    loading: { ar: "جاري التحميل...", en: "Loading..." },
    requiredRank: { ar: "يجب اختيار رتبة عند القبول", en: "Rank is required for approval" }
  };

  return (
    <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 text-start">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {status === 'approved' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {text.title[language]}
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {status === 'approved' ? text.approve[language] : text.reject[language]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {/* Request Info */}
          <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center gap-4 text-start">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{text.student[language]}</p>
                <p className="text-sm font-bold text-slate-800">{request.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-start border-t border-slate-100/50 pt-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{text.plan[language]}</p>
                <p className="text-sm font-bold text-slate-800">{request.plan.name}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6 text-start">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-500" />
                {text.status[language]}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("approved")}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border-2 ${status === 'approved' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-100 scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  <CheckCircle size={18} />
                  {text.approve[language]}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("rejected")}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border-2 ${status === 'rejected' ? 'bg-red-50 border-red-500 text-red-700 shadow-md shadow-red-100 scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  <XCircle size={18} />
                  {text.reject[language]}
                </button>
              </div>
            </div>

            <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" />
                  {text.rank[language]}
                </label>
                {isLoadingRanks ? (
                  <div className="py-4 flex items-center gap-3 text-slate-400 font-bold italic">
                    <Loader2 className="animate-spin" size={18} />
                    {text.loading[language]}
                  </div>
                ) : (
                  <CustomSelect
                    value={selectedRank}
                    onChange={(val) => setSelectedRank(val)}
                    options={rankOptions}
                    placeholder={text.selectRank[language]}
                    className="rounded-2xl border-2 border-slate-100 hover:border-slate-200 focus-within:border-blue-500 transition-all bg-slate-50/30"
                  />
                )}
                {!selectedRank && (
                  <p className="text-[10px] text-amber-600 font-bold px-2">{text.requiredRank[language]}</p>
                )}
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedRank}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:grayscale ${status === 'approved' ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' : 'bg-red-600 text-white shadow-red-200 hover:bg-red-700'}`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (status === 'approved' ? <CheckCircle size={18} /> : <XCircle size={18} />)}
            {text.confirm[language]}
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-bold text-sm text-slate-400 hover:text-slate-600 hover:bg-white transition-all uppercase tracking-widest"
          >
            {text.cancel[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
