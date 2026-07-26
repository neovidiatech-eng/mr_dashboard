import { Shield, Clock, FileText, AlertCircle, Lock, Book, Info } from 'lucide-react';
import { usePolicies, useNotice } from '../../../hooks/usePolicies';

const iconMap: any = {
  shield: Shield,
  clock: Clock,
  file: FileText,
  alert: AlertCircle,
  lock: Lock,
  book: Book,
  info: Info,
};

export default function PoliciesPage() {
  const { data: policiesData, isLoading: policiesLoading } = usePolicies();
  const { data: noticeData, isLoading: noticeLoading } = useNotice();

  const policies = policiesData?.data || [];
  const notice = noticeData?.data;

  if (policiesLoading || noticeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-12 p-7">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 font-['Inter']">Policies & Guidelines</h1>
        <p className="text-slate-400 font-medium">Review important policies and teaching guidelines</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {policies.map((policy, i) => {
          const iconKey = policy.icon as string;
          const Icon = (iconKey && iconMap[iconKey]) ? iconMap[iconKey] : Info;
          return (
            <div key={policy.id || i} className="bg-white p-8 rounded-3xl border border-gray-100/50 shadow-sm hover:shadow-md transition-all group">
              <div className="flex gap-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${policy.color}15`, color: policy.color }}
                >
                  <Icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{policy.title}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-4 leading-relaxed break-words break-all">
                    {policy.description}
                  </p>
                  <p className="text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                    Last updated: {policy.lastUpdated ? new Date(policy.lastUpdated).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Important Notice Banner */}
      {notice && (
        <div className="bg-[#E3EAF9] border border-[#E3EAF9] rounded-3xl p-8 sm:p-10">
          <h4 className="text-blue-700 font-bold text-lg mb-2">{'Important Notice'}</h4>
          <p className="text-blue-600/70 text-sm font-medium leading-relaxed break-words break-all">
            {notice.content}
          </p>
        </div>
      )}
    </div>
  );
}