import { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronRight,
  Layout,
  AlertCircle,
  FileText,
  Activity,
  History
} from "lucide-react";
import { Skeleton, Empty, Tag } from 'antd';
import { useRequestDashboard } from '../../../hooks/useRequests';
import SubmitRequestModal from '../components/SubmitRequestModal';
import { UnifiedRequest, UnifiedRequestType, RequestPriority } from '../../../types/requests';

const RequestCard = ({ request }: { request: UnifiedRequest }) => {
  const isHighPriority = request.priority === 'high';

  const getPriorityStyles = (priority: RequestPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'low': return 'bg-gray-50 text-gray-400 border-gray-100';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600';
      case 'approved': return 'bg-green-50 text-green-600';
      case 'rejected': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const getTypeLabel = (type: UnifiedRequestType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className={`
      bg-white p-6 rounded-3xl border transition-all duration-300 group relative overflow-hidden
      ${isHighPriority ? 'border-red-200 shadow-md shadow-red-50 ring-1 ring-red-100' : 'border-gray-100 shadow-sm hover:shadow-md'}
    `}>
      {isHighPriority && <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 blur-3xl -mr-10 -mt-10 animate-pulse" />}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex gap-4">
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
            ${isHighPriority ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}
          `}>
            {request.type === 'technical_issue' ? <AlertCircle size={22} /> : <FileText size={22} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{request.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-slate-300">
                {new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                {getTypeLabel(request.type)}
              </span>
            </div>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyles(request.status)}`}>
          {request.status}
        </div>
      </div>

      <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed line-clamp-2">
        {request.reason}
      </p>

      <div className="flex justify-between items-center relative z-10">
        <div className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest ${getPriorityStyles(request.priority)}`}>
          {request.priority} Priority
        </div>
        <button className="text-slate-500 hover:text-blue-600 text-[13px] font-bold transition-all flex items-center gap-1 group/btn">
          View Details
          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const TypeCircle = ({ label, count, color }: { label: string, count: number, color: string }) => (
  <div className="flex flex-col items-center gap-3 min-w-[100px]">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {label.replace('_', ' ')}
    </span>
    <div className="relative group cursor-default">
      <div className={`w-16 h-16 rounded-full border-4 border-slate-50 flex items-center justify-center transition-transform group-hover:scale-105 duration-300`}>
        <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg`} style={{ backgroundColor: color }}>
          {count}
        </div>
      </div>
    </div>
  </div>
);

const StatusOverviewCard = ({ label, count, color, bg, icon: Icon }: any) => (
  <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-100 hover:shadow-md transition-all duration-300">
    <div>
      <p className="text-sm font-bold text-slate-400 mb-1">{label}</p>
      <h3 className={`text-4xl font-black ${color}`}>{count}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center text-${color.split('-')[1]}-500 shadow-sm`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
  </div>
);

export default function TeacherRequests() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: dashboardData, isLoading } = useRequestDashboard();

  const rawData = dashboardData?.data;
  const dashboard = (() => {
    if (!rawData) return null;
    
    // If it's already in the expected dashboard format
    if (rawData && typeof rawData === 'object' && 'summary' in rawData && 'pending' in rawData) {
      return rawData;
    }
    
    // If it's an array of requests (compatibility)
    const requests = Array.isArray(rawData) ? rawData : [];
    
    return {
      summary: {
        types: requests.reduce((acc: any, req: any) => {
          if (req.type) {
            acc[req.type] = (acc[req.type] || 0) + 1;
          }
          return acc;
        }, {}),
        statuses: {
          pending: requests.filter((r: any) => r.status === 'pending').length,
          approved: requests.filter((r: any) => r.status === 'approved').length,
          rejected: requests.filter((r: any) => r.status === 'rejected').length,
          total: requests.length
        }
      },
      pending: requests.filter((r: any) => r.status === 'pending'),
      history: requests.filter((r: any) => r.status !== 'pending')
    };
  })();

  const typeColors: any = {
    vacation: '#2563eb',
    sick_leave: '#db2777',
    excuse: '#f59e0b',
    emergency: '#ef4444',
    resign: '#7c3aed',
    technical_issue: '#06b6d4',
    reschedule: '#10b981',
    others: '#64748b'
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto animate-fade-in font-['Outfit']">
        <header className="mb-10">
          <Skeleton.Button active style={{ width: 300, height: 40, borderRadius: '12px' }} />
          <div className="mt-4">
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => <Skeleton.Button key={i} active style={{ width: '100%', height: 120, borderRadius: '24px' }} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton active paragraph={{ rows: 10 }} />
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-12 p-8 font-['Outfit']">
      <header className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Layout size={20} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Requests Dashboard</h1>
          </div>
          <p className="text-slate-400 font-medium">Centralized system for managing leave, issues, and administrative requests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[14px] font-bold shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300"
        >
          <Plus size={20} strokeWidth={3} />
          Submit Request
        </button>
      </header>

      {/* Request Types Overview */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-wrap justify-between items-center gap-8 mb-10 overflow-x-auto no-scrollbar">
        {dashboard?.summary?.types && Object.entries(dashboard.summary.types).map(([type, count]) => (
          <TypeCircle key={type} label={type} count={count as number} color={typeColors[type] || '#cbd5e1'} />
        ))}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatusOverviewCard label="Pending Approval" count={dashboard?.summary?.statuses?.pending || 0} color="text-amber-500" bg="bg-amber-50" icon={Clock} />
        <StatusOverviewCard label="Approved" count={dashboard?.summary?.statuses?.approved || 0} color="text-green-500" bg="bg-green-50" icon={CheckCircle2} />
        <StatusOverviewCard label="Rejected" count={dashboard?.summary?.statuses?.rejected || 0} color="text-red-500" bg="bg-red-50" icon={XCircle} />
        <StatusOverviewCard label="Total Requests" count={dashboard?.summary?.statuses?.total || 0} color="text-blue-500" bg="bg-blue-50" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Pending Requests Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-amber-400 rounded-full" />
              Pending Requests
            </h2>
            <Tag className="rounded-full bg-amber-50 text-amber-600 border-none px-4 font-bold">
              {dashboard?.pending?.length || 0} New
            </Tag>
          </div>

          {dashboard?.pending?.length ? (
            <div className="grid grid-cols-1 gap-6">
              {dashboard.pending.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[32px] border border-dashed border-gray-200 flex flex-col items-center text-center">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-400 font-bold">No pending requests at the moment</span>} />
              <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-bold hover:underline">Create your first request</button>
            </div>
          )}
        </section>

        {/* History Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-blue-500 rounded-full" />
              Recent History
            </h2>
            <History size={24} className="text-slate-300" />
          </div>

          {dashboard?.history?.length ? (
            <div className="grid grid-cols-1 gap-6">
              {dashboard.history.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50/50 p-12 rounded-[32px] border border-dashed border-gray-200 flex flex-col items-center text-center">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-400 font-bold text-sm">Request history is empty</span>} />
            </div>
          )}
        </section>
      </div>

      <SubmitRequestModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
