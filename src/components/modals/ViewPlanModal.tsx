import { X, CheckCircle, Package, CreditCard, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ViewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    duration: number;
    sessionsCount: number;
    features: string[];
    status: 'active' | 'inactive';
  };
}

export default function ViewPlanModal({ isOpen, onClose, plan }: ViewPlanModalProps) {
  const { language, t } = useLanguage();

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300" dir={language === "ar" ? "rtl" : "ltr"}>
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
               <Package className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {plan.name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  plan.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  {plan.status === 'active' ? t('active') : t('inactive')}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-3xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10 text-start">
          
          {/* Description Section */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{t('description')}</h4>
             <p className="text-slate-600 font-bold leading-relaxed">{plan.description}</p>
          </div>

          {/* Pricing & Structure Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:border-indigo-100 transition-all">
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('price')}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                <span className="text-xs font-bold text-slate-400">{plan.currency}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:border-fuchsia-100 transition-all">
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-fuchsia-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('duration')}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{plan.duration}</span>
                <span className="text-xs font-bold text-slate-400">{plan.duration === 1 ? t('month') : t('months')}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:border-emerald-100 transition-all">
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('sessions')}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{plan.sessionsCount}</span>
                <span className="text-xs font-bold text-slate-400">Total</span>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{t('features')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-50 shadow-sm hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 sticky bottom-0">
          <button onClick={onClose} className="w-full px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-[24px] transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
