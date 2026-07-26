import { useTranslation } from 'react-i18next';
import { 
  CreditCard, Zap, Shield, Crown, Star, 
  CheckCircle, ArrowRight, Package,
  History, AlertCircle, TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { usePlans } from '../../admin/hooks/usePlans';
import { useProfile } from '../hooks/useProfile';
import { Plan } from '../../../types/plan';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionPage() {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0] as 'ar' | 'en';
  const isRtl = language === 'ar';

  const navigate = useNavigate();
  
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: profileResponse, isLoading: profileLoading } = useProfile();
  
  const profileData = profileResponse?.data;
  
  const text = {
    title: { ar: 'اشتراكي', en: 'My Subscription' },
    currentPlan: { ar: 'الخطة الحالية', en: 'Current Plan' },
    usage: { ar: 'استهلاك الحصص', en: 'Session Usage' },
    remaining: { ar: 'متبقي', en: 'Remaining' },
    total: { ar: 'إجمالي', en: 'Total' },
    expires: { ar: 'ينتهي في', en: 'Expires On' },
    upgrade: { ar: 'ترقية الحساب', en: 'Upgrade Account' },
    availablePlans: { ar: 'الخطط المتاحة', en: 'Available Plans' },
    history: { ar: 'سجل المدفوعات', en: 'Payment History' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    sessions: { ar: 'حصة', en: 'sessions' },
    month: { ar: 'شهر', en: 'month' },
    subscribe: { ar: 'اشترك الآن', en: 'Subscribe Now' },
    bestSeller: { ar: 'الأكثر مبيعاً', en: 'Best Seller' },
    noPlans: { ar: 'لا توجد خطط متاحة حالياً', en: 'No plans available at the moment' },
  };

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

  if (profileLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
     <div>
 <button
          onClick={() => navigate("/student-dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      
     </div>
      {/* Header */}
      <div className={`${isRtl ? 'text-right' : 'text-left'} space-y-2`}>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">{text.title[language]}</h1>
        <p className="text-slate-500 font-medium">Manage your subscription, view usage, and explore premium plans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Current Subscription Status */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Status Card */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <CreditCard size={160} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{text.currentPlan[language]}</p>
                   <h2 className="text-3xl font-black text-slate-800">
                     {isRtl ? profileData?.plan?.name : (profileData?.plan?.name|| 'Basic Plan')}
                   </h2>
                </div>
                <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest ${profileData?.active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {profileData?.active ? text.active[language] : text.inactive[language]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 space-y-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{text.usage[language]}</p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-800">{profileData?.sessions_attended || 0}</span>
                      <span className="text-slate-400 font-bold">/ {profileData?.sessions || 0}</span>
                   </div>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100 space-y-1">
                   <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{text.remaining[language]}</p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-600">{profileData?.sessions_remaining || 0}</span>
                      <span className="text-blue-400/60 font-bold">{text.sessions[language]}</span>
                   </div>
                </div>
                <div className="bg-amber-50/50 p-6 rounded-[24px] border border-amber-100 space-y-1">
                   <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">{text.expires[language]}</p>
                   <p className="text-xl font-black text-amber-900 truncate">August 24, 2026</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-xs font-black text-slate-800">
                      {Math.round(((profileData?.sessions_attended || 0) / (profileData?.sessions || 1)) * 100)}%
                    </span>
                 </div>
                 <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                      style={{ width: `${((profileData?.sessions_attended || 0) / (profileData?.sessions || 1)) * 100}%` }}
                    />
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Perks Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-4">
                   <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <TrendingUp size={24} />
                   </div>
                   <h3 className="text-xl font-bold">Fast-track Learning</h3>
                   <p className="text-blue-100/80 text-sm leading-relaxed">Your current plan allows you to access 4 major curriculums and exclusive recorded sessions.</p>
                </div>
             </div>
             <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                <div className="space-y-4">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <History size={24} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-800">{text.history[language]}</h3>
                   <p className="text-slate-500 text-sm">View and download your past subscription invoices and payment receipts.</p>
                </div>
                <button className="flex items-center gap-2 text-blue-600 font-bold text-sm mt-6 hover:gap-3 transition-all">
                   View History <ArrowRight size={16} />
                </button>
             </div>
          </div>

        </div>

        {/* Right: Summary / CTA */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 shadow-2xl shadow-slate-200">
              <h3 className="text-2xl font-bold tracking-tight">Need More?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upgrade to a higher plan to get more weekly sessions, private coaching, and priority support.
              </p>
              <div className="space-y-4 pt-4 border-t border-slate-800">
                 {[
                   'Private 1-on-1 Sessions',
                   'Weekly Progress Reports',
                   'Certification Exams',
                   '24/7 Priority Support'
                 ].map((perk, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                         <CheckCircle className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{perk}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                 <AlertCircle size={24} />
                 <h4 className="font-bold">Subscription Tip</h4>
              </div>
              <p className="text-amber-800/80 text-sm leading-relaxed">
                Renew your subscription before it expires to keep your learning progress and maintain your current pricing.
              </p>
           </div>
        </div>
      </div>

      {/* Available Plans Section */}
      <div className="space-y-8 pt-10 border-t border-slate-100">
        <div className={`${isRtl ? 'text-right' : 'text-left'} space-y-2`}>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{text.availablePlans[language]}</h2>
          <p className="text-slate-500 font-medium">Explore our range of plans designed for every learning pace.</p>
        </div>

        {plans.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
            <Package className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-lg text-center">{text.noPlans[language]}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan: Plan, index: number) => (
              <div
                key={plan.id}
                className={`group relative bg-white rounded-[32px] border transition-all duration-500 flex flex-col h-full ${
                  plan.bestSeller
                    ? 'border-blue-500 shadow-2xl shadow-blue-200/50 scale-[1.02] z-10'
                    : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2'
                }`}
              >
                {/* Popular Badge */}
                {plan.bestSeller && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg z-20 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {text.bestSeller[language]}
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
                      {isRtl ? plan.name : plan.name}
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
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      plan.bestSeller
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
  );
}
