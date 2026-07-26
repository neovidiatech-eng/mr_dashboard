import { X, CheckCircle, Package, Zap, Shield, Crown, Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePlans } from '../../features/admin/hooks/usePlans';
import { Plan } from '../../types/plan';

interface SubscribePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscribePlanModal({ isOpen, onClose }: SubscribePlanModalProps) {
  const { language } = useLanguage();
  const { data: plans = [], isLoading } = usePlans();
  const isRtl = language === 'ar';

  const text = {
    title: { ar: 'خطط الاشتراك المميزة', en: 'Premium Subscription Plans' },
    subtitle: {
      ar: 'اختر الخطة المناسبة لك وابدأ رحلتك التعليمية بأفضل الأدوات والمميزات',
      en: 'Choose the right plan for you and start your educational journey with the best tools and features'
    },
    subscribe: { ar: 'اشترك الآن', en: 'Subscribe Now' },
    popular: { ar: 'الأكثر مبيعاً', en: 'Best Seller' },
    sessions: { ar: 'حصة', en: 'sessions' },
    month: { ar: 'شهر', en: 'month' },
    noPlans: { ar: 'لا توجد خطط متاحة حالياً', en: 'No plans available at the moment' },
    loading: { ar: 'جاري تحميل الخطط...', en: 'Loading plans...' },
  };

  if (!isOpen) return null;

  const getPlanIcon = (index: number) => {
    const icons = [Zap, Shield, Crown];
    const Icon = icons[index % icons.length];
    return <Icon className="w-6 h-6" />;
  };

  const getPlanColor = (index: number, bestSeller: boolean) => {
    if (bestSeller) return "from-blue-600 to-indigo-700";
    if (index === 0) return "from-emerald-500 to-teal-600";
    return "from-slate-700 to-slate-900";
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md overflow-y-auto no-scrollbar flex items-center justify-center p-4 md:p-8">
      <div className="bg-[#f8fafc] w-full max-w-7xl min-h-[90vh] rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative p-8 md:p-12 flex justify-between items-start z-10">
          <div className={`${isRtl ? 'text-right' : 'text-left'} space-y-2`}>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              {text.title[language]}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl font-medium">
              {text.subtitle[language]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm border border-slate-100 active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 px-8 md:px-12 pb-12 z-10">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-bold">{text.loading[language]}</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center bg-white/50 rounded-[32px] border-2 border-dashed border-slate-200">
              <Package className="w-20 h-20 text-slate-300 mb-4" />
              <p className="text-slate-500 text-xl font-bold">{text.noPlans[language]}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mt-4">
              {plans.map((plan: Plan, index: number) => (
                <div
                  key={plan.id}
                  className={`group relative bg-white rounded-[32px] border transition-all duration-500 flex flex-col h-full ${plan.bestSeller
                      ? 'border-blue-500 shadow-2xl shadow-blue-200/50 scale-[1.02] z-10'
                      : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2'
                    }`}
                >
                  {/* Popular Badge */}
                  {plan.bestSeller && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg z-20 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {text.popular[language]}
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="p-8 pb-0 flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getPlanColor(index, plan.bestSeller)} flex items-center justify-center text-white shadow-lg`}>
                      {getPlanIcon(index)}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">
                        {plan.duration} {text.month[language]}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className={`${isRtl ? 'text-right' : 'text-left'} mb-8`}>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        {plan.description || (isRtl ? 'خطة تعليمية متكاملة مصممة خصيصاً لاحتياجاتك' : 'A comprehensive educational plan tailored to your needs')}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                        <span className="text-lg font-bold text-slate-500">{plan.currency?.symbol || 'EGP'}</span>
                      </div>
                      <div className="mt-2 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-100/50 px-3 py-1 rounded-full">
                        {plan.sessionsCount} {text.sessions[language]}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-4 mb-10 flex-1">
                      {plan.features?.map((feature, idx) => (
                        <div key={idx} className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className={`text-slate-600 text-sm font-semibold w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                            {feature}
                          </span>
                        </div>
                      )) || (
                          <div className="text-slate-400 text-sm italic text-center">
                            {isRtl ? 'لا توجد مميزات مسجلة' : 'No features listed'}
                          </div>
                        )}
                    </div>

                    <button
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${plan.bestSeller
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'
                          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
                        }`}
                    >
                      {text.subscribe[language]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
