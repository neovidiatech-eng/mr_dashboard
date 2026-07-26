import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Table } from 'antd';
import { useGetRequests, useUpdateRequestStatus } from '../hooks/useRequests';
import { UnifiedRequest } from '../../../types/requests';

export default function Requests() {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading } = useGetRequests();
  const updateStatus = useUpdateRequestStatus();

  const requestsData = data?.data;
  const studentRequests = !Array.isArray(requestsData) ? (requestsData?.student_requests || []) : [];
  const teacherRequests = !Array.isArray(requestsData) ? (requestsData?.teachers_requests || []) : [];
  const currentData = activeTab === 'student' ? studentRequests : teacherRequests;

  // Helper styles

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'pending': return { text: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' };
      case 'approved': return { text: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
      case 'rejected': return { text: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' };
      case 'canceled': return { text: 'text-gray-600', bg: 'bg-gray-50', dot: 'bg-gray-500' };
      default: return { text: 'text-gray-600', bg: 'bg-gray-50', dot: 'bg-gray-500' };
    }
  };

  const columns = [
    {
      title: 'USER',
      key: 'user',
      render: (_: any, req: UnifiedRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {req.requester?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{req.requester?.name}</div>
            <div className="text-[10px] font-bold text-gray-400">{req.requesterRole?.toUpperCase() || 'USER'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <span className="text-sm font-bold text-gray-700 whitespace-nowrap capitalize">{text.replace('_', ' ')}</span>,
    },
    {
      title: 'DATE SUBMITTED',
      dataIndex: 'createdAt',
      key: 'date',
      render: (text: string) => <span className="text-[13px] font-bold text-gray-500 whitespace-nowrap">{new Date(text).toLocaleDateString()}</span>,
    },
    {
      title: 'REASON',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string) => (
        <span className="text-[13px] font-medium text-gray-600 line-clamp-1 max-w-[200px]">
          {text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        const style = getStatusStyle(text);
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></div>
            <span className="text-[11px] font-bold capitalize">{text}</span>
          </div>
        );
      },
    },
    {
      title: 'ACTION',
      key: 'action',
      align: 'center' as const,
      render: (_: any, req: UnifiedRequest) => (
        selectedRequest?.id === req.id && isSidebarOpen ? (
          <span className="text-[10px] font-bold text-[#6366f1] tracking-widest uppercase">SELECTED</span>
        ) : (
          <button className="p-1 text-gray-400 hover:text-[#6366f1] rounded-full hover:bg-indigo-50 transition-colors inline-flex">
            <ChevronRight className="w-5 h-5" />
          </button>
        )
      ),
    },
  ];

  const handleAction = async (status: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedRequest.id,
        status,
        adminNotes
      });
      setIsSidebarOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-90px)] bg-[#f8fafc] overflow-hidden" dir="ltr">
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'mr-[400px]' : ''}`}>
        
        <div className="px-6 pt-6 pb-0 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="mb-3 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Requests Management</h1>
            <p className="text-sm font-medium text-gray-500">Review and handle all student and instructor administrative actions.</p>
          </div>

          <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 pt-4 border-b border-gray-100 flex items-center justify-between">
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setActiveTab('student')}
                  className={`text-sm font-bold pb-4 -mb-[1px] border-b-2 transition-all ${activeTab === 'student' ? 'text-[#6366f1] border-[#6366f1]' : 'text-gray-400 border-transparent hover:text-gray-700'}`}
                >
                  Student Requests ({studentRequests.length})
                </button>
                <button 
                  onClick={() => setActiveTab('teacher')}
                  className={`text-sm font-bold pb-4 -mb-[1px] border-b-2 transition-all ${activeTab === 'teacher' ? 'text-[#6366f1] border-[#6366f1]' : 'text-gray-400 border-transparent hover:text-gray-700'}`}
                >
                  Instructor Requests ({teacherRequests.length})
                </button>
              </div>

            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <Table 
                columns={columns} 
                dataSource={currentData} 
                loading={isLoading}
                rowKey="id" 
                pagination={false} 
                className="w-full"
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedRequest(record);
                    setIsSidebarOpen(true);
                  },
                })}
                rowClassName={(record) => 
                  `hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedRequest?.id === record.id && isSidebarOpen ? 'bg-indigo-50/30' : ''}`
                }
              />
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
              .ant-table-thead > tr > th {
                background-color: #fcfcfd !important;
                color: #667085 !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                border-bottom: 1px solid #eaecf0 !important;
                padding: 12px 24px !important;
                white-space: nowrap !important;
              }
              .ant-table-tbody > tr > td {
                border-bottom: 1px solid #eaecf0 !important;
                padding: 20px 24px !important;
              }
              /* Selected row border logic using pseudo element to avoid layout shift */
              .ant-table-tbody > tr.bg-indigo-50\\/30 > td:first-child {
                position: relative;
              }
              .ant-table-tbody > tr.bg-indigo-50\\/30 > td:first-child::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 3px;
                background-color: #6366f1;
              }
              .ant-table-tbody > tr:last-child > td {
                border-bottom: none !important;
              }
            `}} />

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
              <span className="text-xs font-bold text-gray-400">Showing {currentData.length} records</span>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Previous</button>
                <button className="w-7 h-7 flex items-center justify-center text-xs font-bold text-white bg-[#6366f1] rounded-lg shadow-sm">1</button>
                <button className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Next</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Sidebar (Details) */}
      <div className={`fixed right-0 top-[90px] h-[calc(100vh-90px)] w-[400px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 z-30 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-gray-900">Request Details</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {selectedRequest ? (
            <>
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {selectedRequest.requester?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedRequest.requester?.name}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-0.5">{selectedRequest.requester?.email}</p>
                </div>
              </div>
              
              <div className="inline-flex px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 shadow-sm capitalize">
                Request Type: <span className="ml-1 text-gray-900">{selectedRequest.type.replace('_', ' ')}</span>
              </div>

              {/* Message Box */}
              <div className="relative mt-2">
                <div className="absolute left-4 -top-4 text-5xl text-gray-200 font-serif leading-none h-4 overflow-visible select-none">"</div>
                <div className="bg-gray-50/80 rounded-2xl p-5 pt-7 text-sm font-semibold text-gray-600 leading-relaxed border border-gray-100/80 shadow-inner">
                  {selectedRequest.reason || 'No reason provided.'}
                </div>
              </div>

              {/* Details */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3 shadow-sm">
                 <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Submitted On</div>
                      <div className="text-xs font-bold text-gray-900">
                        {new Date(selectedRequest.createdAt).toLocaleDateString()} at {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${getStatusStyle(selectedRequest.status).bg} ${getStatusStyle(selectedRequest.status).text}`}>
                      <div className={`w-1 h-1 rounded-full ${getStatusStyle(selectedRequest.status).dot}`}></div>
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        {selectedRequest.status}
                      </span>
                    </div>
                 </div>
              </div>

              {/* Admin Notes */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-900 mb-2">Internal Admin Notes:</label>
                <div className="relative">
                  <textarea 
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 pr-12 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] transition-all resize-none h-28 shadow-sm placeholder:text-gray-400"
                    placeholder="Add notes for this action..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Footer Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => handleAction('approve')}
                    disabled={updateStatus.isPending}
                    className="flex-1 py-3 text-xs font-bold text-white bg-[#10b981] hover:bg-[#059669] rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {updateStatus.isPending ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    onClick={() => handleAction('reject')}
                    disabled={updateStatus.isPending}
                    className="flex-1 py-3 text-xs font-bold text-red-500 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {updateStatus.isPending ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ChevronRight className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-400">Select a request to view details</p>
            </div>
          )}
        </div>


      </div>

    </div>
  );
}
