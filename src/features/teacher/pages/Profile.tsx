import { useTranslation } from 'react-i18next';

import {
  Mail, Phone, MapPin,
  Clock,
  BookOpen, Users, Star,
} from 'lucide-react';
// import ErrorService from '../../../utils/ErrorService';
import { useTeacherProfile } from '../hooks/useTeacherProfile';
// import { useCreateTeacherWithdrawal, useTeacherWithdrawals } from '../hooks/useWithdraw';

// Internal Withdrawal Modal Component
// function WithdrawalModal({ isOpen, onClose, balance, onWithdraw, isRtl, isLoading }: any) {
//   const [amount, setAmount] = useState('');

//   if (!isOpen) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const numAmount = parseFloat(amount);
//     if (!numAmount || numAmount <= 0) {
//       ErrorService.error(isRtl ? 'يرجى إدخال مبلغ صالح' : 'Please enter a valid amount');
//       return;
//     }
//     if (numAmount > balance) {
//       ErrorService.error(isRtl ? 'المبلغ يتجاوز الرصيد الحالي' : 'Amount exceeds current balance');
//       return;
//     }
//     onWithdraw(numAmount);
//     setAmount('');
//   };

//   return (
//     <div className="fixed inset-0 !mt-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-300">
//       <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 border border-gray-100">
//         <div className="flex justify-between items-center mb-6 sm:mb-8">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
//               <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
//             </div>
//             <h2 className="text-lg sm:text-xl font-bold text-gray-900">{isRtl ? 'طلب سحب رصيد' : 'Withdrawal Request'}</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
//             <X className="w-5 h-5 text-gray-400" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
//           <div>
//             <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3 ml-1">
//               {isRtl ? 'المبلغ المطلوب سحبه' : 'Amount to withdraw'}
//             </label>
//             <div className="relative group">
//               <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
//               <input
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="0.00"
//                 className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/20 outline-none transition-all font-bold text-xl sm:text-2xl text-gray-900"
//                 autoFocus
//               />
//             </div>
//             <div className="mt-4 p-3 sm:p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 flex justify-between items-center">
//               <span className="text-xs sm:text-sm text-indigo-600/70 font-medium">{isRtl ? 'الرصيد المتاح' : 'Available Balance'}</span>
//               <span className="text-sm sm:text-base font-bold text-indigo-700">${balance.toLocaleString()}</span>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all active:scale-[0.98] shadow-lg shadow-indigo-200"
//           >
//             {isLoading ? (
//               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//             ) : (
//               <Send className="w-4 h-4 sm:w-5 sm:h-5" />
//             )}
//             {isRtl ? 'تأكيد عملية السحب' : 'Confirm Withdrawal'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

export default function TeacherProfile() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.split('-')[0] === 'ar';
  const primaryColor = '#800020';
  const accentColor = '#06b6d4';
  // const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { data: profileResponse, isLoading } = useTeacherProfile();
//const { data: withdrawalsResponse } = useTeacherWithdrawals();
  // const { mutate: createWithdrawal, isPending: isWithdrawing } = useCreateTeacherWithdrawal();

  // const withdrawals = withdrawalsResponse?.data?.withdrawals || [];
  const data = profileResponse?.data;
  const teacher = data?.teacher;
  const stats = data?.stats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-indigo-50 border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  const teacherInfo = {
    name: teacher?.name || '---',
    email: teacher?.email || '---',
    phone: teacher?.phone || '---',
    title: isRtl ? 'معلم مستر محمود المعتمد' : 'Mr Mahmoud Certified Teacher',
    id: teacher?.id || '---',
    country: isRtl ? 'جمهورية مصر العربية' : 'Egypt',
    rating: 5.0,
    experience: isRtl ? 'خبير تعليمي' : 'Educational Expert',
  };

  //const wallet = teacher?.wallet?.[0];
  // const financialInfo = {
  //   pendingBalance: wallet?.balance || 0,
  //   totalWithdrawn: 0,
  //   transactions: wallet?.transactions || [],
  //   currency: wallet?.currency?.symbol || '$'
  // };

  const profileStats = [
    { label: isRtl ? 'الطلاب' : 'Students', value: stats?.totalStudents || 0, icon: Users, gradient: 'from-blue-500 to-indigo-600' },
    { label: isRtl ? 'الجلسات' : 'Sessions', value: stats?.totalSessions || 0, icon: BookOpen, gradient: 'from-purple-500 to-fuchsia-600' },
    { label: isRtl ? 'التقييم' : 'Rating', value: '5.0', icon: Star, gradient: 'from-amber-400 to-orange-500' },
    { label: isRtl ? 'الساعة' : 'Rate', value: `${teacher?.hourPrice || 0}$`, icon: Clock, gradient: 'from-emerald-400 to-teal-600' },
  ];

  // const handleWithdraw = (amount: number) => {
  //   createWithdrawal(amount, {
  //     onSuccess: () => {
  //       ErrorService.success(isRtl ? `تم إرسال طلب سحب مبلغ $${amount} بنجاح` : `Withdrawal request for $${amount} submitted successfully`);
  //       setIsWithdrawModalOpen(false);
  //     },
  //     onError: (error: any) => {
  //       ErrorService.error(error.response?.data?.message || (isRtl ? 'فشل إرسال طلب السحب' : 'Failed to submit withdrawal request'));
  //     }
  //   });
  // };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-7 sm:space-y-8 animate-fade-in pt-7 sm:pt-8 pb-10 sm:pb-16" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header Banner */}
      <div className="relative h-44 sm:h-52 md:h-72 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, ${primaryColor}aa, ${accentColor}aa), url('https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80')` }}
        />

        <div className="absolute inset-x-0 bottom-4 p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-8 translate-y-10 sm:translate-y-12">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2rem] sm:rounded-[2.5rem] bg-white p-2 shadow-2xl transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-3">
              <div
                className="w-full h-full rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-white text-4xl sm:text-6xl font-black shadow-inner"
                style={{ backgroundColor: primaryColor }}
              >
                {teacherInfo.name.charAt(0)}
              </div>
            </div>
          </div>

          <div className="text-center sm:text-left flex-1 pb-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight">
              {teacherInfo.name}
            </h1>
            <p className="text-sm sm:text-lg text-white/90 font-bold mt-2 flex items-center gap-2 justify-center sm:justify-start drop-shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
              {teacherInfo.title}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-20 sm:mt-24">

        {/* Profile Stats - Mobile Optimized Grid */}
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {profileStats.map((stat, idx) => (
              <div key={idx} className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 text-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mx-auto mb-2 sm:mb-4 shadow-md`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">{stat.label}</p>
                <h4 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">{stat.value}</h4>
              </div>
            ))}
          </div>

          {/* Smart Wallet Card */}
          {/* <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-gray-100 p-6 sm:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900">{isRtl ? 'المحفظة الذكية' : 'Smart Wallet'}</h2>
                    <p className="text-[10px] sm:text-sm font-bold text-gray-400">{isRtl ? 'إدارة أرباحك' : 'Manage your earnings'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-gray-900 hover:bg-black text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  {isRtl ? 'سحب الرصيد' : 'Withdraw Now'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-gray-900 text-center sm:text-left">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 sm:mb-4">{isRtl ? 'الرصيد المتاح' : 'Available'}</p>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter">${financialInfo.pendingBalance.toLocaleString()}</span>
                    <span className="text-indigo-400 font-bold text-sm">USD</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100 flex flex-col">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-sm font-black text-gray-900">{isRtl ? 'أحدث العمليات' : 'Recent'}</h3>
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div className="space-y-3">
                    {withdrawals.length > 0 ? (
                      withdrawals.slice(0, 4).map((tx: any) => (
                        <div key={tx.id} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-900">${tx.amount}</span>
                            <span className="text-[8px] text-gray-400 font-medium">{new Date(tx.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
                          </div>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${tx.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              tx.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-red-50 text-red-600'
                            }`}>
                            {isRtl ? (
                              tx.status === 'approved' ? 'مكتمل' :
                                tx.status === 'pending' ? 'قيد الانتظار' : 'مرفوض'
                            ) : tx.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 opacity-40">
                        <p className="text-[10px] font-bold">{isRtl ? 'لا توجد عمليات' : 'No transactions'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Details Column - Full width on mobile, right on desktop */}
        <div className="order-1 lg:order-2">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-base sm:text-lg font-black text-gray-900 mb-6 sm:mb-8 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {isRtl ? 'المعلومات' : 'Details'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              {[
                { icon: Mail, label: isRtl ? 'البريد' : 'Email', value: teacherInfo.email },
                { icon: Phone, label: isRtl ? 'الهاتف' : 'Phone', value: teacherInfo.phone },
                { icon: MapPin, label: isRtl ? 'الموقع' : 'Location', value: teacherInfo.country },
                // { icon: Star, label: isRtl ? 'الخبرة' : 'Expertise', value: teacherInfo.experience },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-0 rounded-xl hover:bg-gray-50 lg:hover:bg-transparent">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 transition-all">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-700 truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        balance={financialInfo.pendingBalance}
        onWithdraw={handleWithdraw}
        isRtl={isRtl}
        isLoading={isWithdrawing}
        settings={settings}
      /> */}
    </div>
  );
}
