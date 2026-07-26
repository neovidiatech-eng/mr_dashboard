import { X, Phone, Mail, GraduationCap, DollarSign, Calendar, Users, Videotape } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSessions } from '../../contexts/SessionsContext';
import { Teacher } from '../../types/teachers';
import { useCurrency } from '../../features/admin/hooks/useCurrency';
import { Currency } from '../../types/currency';
import { useTeacherById } from '../../features/admin/hooks/useTeacher';

interface ViewTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

export default function ViewTeacherModal({ isOpen, onClose, teacher }: ViewTeacherModalProps) {
  const { language, t } = useLanguage();
  const { sessions } = useSessions();
  const { data: currenciesData } = useCurrency();
  const { data: teacherDetails } = useTeacherById(teacher?.id || '');

  if (!isOpen || !teacher) return null;

  const teacherSessions = sessions.filter(s => s.teacherName === teacher.user?.name);
  const today = new Date().toISOString().split('T')[0];
  // const upcomingSessions = teacherSessions.filter(s => s.date >= today);
  // const completedSessions = teacherSessions.filter(s => s.date < today);

  // const calcSessionHours = (session: { time: string; endTime: string }) => {
  //   const parseTime = (timeStr: string) => {
  //     const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  //     if (!m) return 0;
  //     let h = parseInt(m[1]);
  //     const min = parseInt(m[2]);
  //     const p = m[3].toUpperCase();
  //     if (p === 'PM' && h !== 12) h += 12;
  //     if (p === 'AM' && h === 12) h = 0;
  //     return h + min / 60;
  //   };
  //   return Math.max(0, parseTime(session.endTime) - parseTime(session.time));
  // };



  const hourPrice = teacher.hour_price || 0;

  const currencies = currenciesData?.currencies || [];
  const teacherCurrency = currencies.find(
    (c: Currency) => c.id === teacher.currencyId
  );
  const currencySymbol = teacherCurrency?.symbol || teacherCurrency?.code || 'EGP';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300" dir={language === "ar" ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{teacher.user?.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${teacher.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                  {teacher.active ? t('active') : t('inactive')}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instructor Profile</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-3xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
              <div className="p-3 bg-white rounded-2xl w-fit mb-4 shadow-sm">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('email')}</p>
              <p className="text-sm font-bold text-slate-900 truncate">{teacher.user?.email}</p>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
              <div className="p-3 bg-white rounded-2xl w-fit mb-4 shadow-sm">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('phone')}</p>
              <p className="text-sm font-bold text-slate-900">{teacher.user?.code_country} {teacher.user?.phone}</p>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
              <div className="p-3 bg-white rounded-2xl w-fit mb-4 shadow-sm">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('hourlyRate')}</p>
              <p className="text-sm font-black text-slate-900">{hourPrice.toFixed(2)} {currencySymbol}</p>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
              <div className="p-3 bg-white rounded-2xl w-fit mb-4 shadow-sm">
                <Users className="w-5 h-5 text-fuchsia-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
              <p className="text-sm font-bold text-slate-900">{teacher.user.age || 'N/A'} Years</p>
            </div>
          </div>

          {/* Stats & Earnings Sections */}
          <div className="grid grid-cols-1 gap-10">
            {/* Statistics */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('statistics')}</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Students', value: teacherDetails?.teacherStudents ?? 0, icon: Users, color: 'indigo' },
                  { label: 'Total Sessions', value: teacherDetails?.totalsessions ?? 0, icon: Videotape, color: 'red' },
                  { label: 'Completed Sessions', value: teacherDetails?.sessionCount ?? 0, icon: Calendar, color: 'emerald' },

                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className={`p-4 bg-${stat.color}-50 rounded-2xl`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</p>
                      <p className="text-[10px] font-bold text-sl-ate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            {/* <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('earningsDetails')}</h4>
              </div>
              <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110" />
                <div className="relative z-10">
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Owed</p>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black">{totalOwed.toFixed(2)}</span>
                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{currencySymbol}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                    <div>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Completed</p>
                      <p className="text-xl font-bold text-emerald-400">{totalEarnings.toFixed(2)} <span className="text-xs">{currencySymbol}</span></p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Pending</p>
                      <p className="text-xl font-bold text-amber-400">{pendingEarnings.toFixed(2)} <span className="text-xs">{currencySymbol}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Recent Activity */}
          {/* <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('recentSessions')}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacherSessions.slice(0, 6).map(session => (
                  <div key={session.id} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm hover:border-indigo-100 transition-all flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      session.date < today ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{session.studentName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{session.date} · {session.time}</p>
                    </div>
                  </div>
                ))}
              </div>
          </div> */}
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

