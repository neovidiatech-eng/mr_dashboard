import { X, User, Package, Calendar, Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import WhatsAppPhone from '../ui/WhatsAppPhone';
import { SubscriptionRequest } from '../../types/subscription';


interface ViewSubscriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SubscriptionRequest;
}

export default function ViewSubscriptionRequestModal({ isOpen, onClose, request }: ViewSubscriptionRequestModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const text = {
    title: { ar: 'تفاصيل طلب الاشتراك', en: 'Subscription Request Details' },
    studentInfo: { ar: 'معلومات الطالب', en: 'Student Information' },
    planInfo: { ar: 'تفاصيل الباقة', en: 'Plan Details' },
    studentName: { ar: 'اسم الطالب', en: 'Student Name' },
    parentName: { ar: 'ولي الأمر', en: 'Parent Name' },
    phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    plan: { ar: 'الخطة', en: 'Plan' },
    price: { ar: 'السعر', en: 'Price' },
    sessionsCount: { ar: 'عدد الحصص', en: 'Sessions Count' },
    session: { ar: 'حصة', en: 'session' },
    requestDate: { ar: 'تاريخ الطلب', en: 'Request Date' },
    status: { ar: 'الحالة', en: 'Status' },
    notes: { ar: 'ملاحظات', en: 'Notes' },
    close: { ar: 'إغلاق', en: 'Close' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    approved: { ar: 'مقبول', en: 'Approved' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    noNotes: { ar: 'لا توجد ملاحظات', en: 'No notes' }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
            <Clock size={14} />
            {text.pending[language]}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={14} />
            {text.approved[language]}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
            <XCircle size={14} />
            {text.rejected[language]}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{text.title[language]}</h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <Info size={14} />
              ID: {request.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-100 transition-all shadow-sm active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Status and Date */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-blue-50/30 rounded-[24px] border border-blue-50">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{text.status[language]}</p>
              {getStatusBadge(request.status)}
            </div>
            <div className={`${language === 'ar' ? 'text-left' : 'text-right'} space-y-1`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{text.requestDate[language]}</p>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Calendar size={16} />
                {request.createdAt.substring(0, 10)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} />
                {text.studentInfo[language]}
              </h3>

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
                    {text.studentName[language]}
                  </label>
                  <p className="text-slate-900 font-bold">{request.user.name}</p>
                </div>


                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
                    {text.phone[language]}
                  </label>
                  <WhatsAppPhone phone={request.user.phone} className="font-bold text-slate-900" />
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
                    {text.email[language]}
                  </label>
                  <p className="text-slate-900 font-bold truncate" dir="ltr">{request.user.email}</p>
                </div>
              </div>
            </div>

            {/* Plan Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} />
                {text.planInfo[language]}
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {text.plan[language]}
                  </label>
                  <p className="text-lg font-black text-slate-900">{request.plan.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                      {text.price[language]}
                    </label>
                    <p className="text-xl font-black text-emerald-700">{request.plan.price}</p>
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                      {text.sessionsCount[language]}
                    </label>
                    <p className="text-xl font-black text-blue-700">
                      {request.plan.sessionsCount} <span className="text-xs">{text.session[language]}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Footer */}
        {/* <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95"
          >
            {text.close[language]}
          </button>
        </div> */}
      </div>
    </div>
  );
}
