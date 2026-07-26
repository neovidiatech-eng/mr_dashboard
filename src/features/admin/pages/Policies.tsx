import React, { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, Card, Typography } from 'antd';
import { Shield, Plus, Edit2, Trash2, Megaphone, Info } from 'lucide-react';
import { usePolicies, useNotice, useCreatePolicy, useUpdatePolicy, useDeletePolicy, useCreateNotice } from '../../../hooks/usePolicies';
import AddPolicyModal from './AddPolicyModal';
import { Policy } from '../../../types/polices';

const { Title, Text } = Typography;

export default function AdminPoliciesPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isEditingNotice, setIsEditingNotice] = useState(false);

  const { data: policiesData, isLoading: policiesLoading } = usePolicies();
  const { data: noticeData, isLoading: noticeLoading } = useNotice();
  
  const { mutate: createPolicy, isPending: isCreating } = useCreatePolicy();
  const { mutate: updatePolicy, isPending: isUpdating } = useUpdatePolicy();
  const { mutate: deletePolicy, isPending: isDeleting } = useDeletePolicy();
  const { mutate: updateNotice, isPending: isUpdatingNotice } = useCreateNotice();

  const policies = policiesData?.data || [];
  const notice = noticeData?.data;

  const handleSave = (values: any) =>
    new Promise<boolean>((resolve) => {
      if (isEditingNotice) {
        updateNotice(values, {
          onSuccess: () => {
            setModalVisible(false);
            setIsEditingNotice(false);
            resolve(true);
          },
          onError: () => resolve(false),
        });
      } else if (editingPolicy) {
        updatePolicy({ id: editingPolicy.id, data: values }, {
          onSuccess: () => {
            setModalVisible(false);
            setEditingPolicy(null);
            resolve(true);
          },
          onError: () => resolve(false),
        });
      } else {
        createPolicy(values, {
          onSuccess: () => {
            setModalVisible(false);
            resolve(true);
          },
          onError: () => resolve(false),
        });
      }
    });

  const columns = [
    {
      title: 'POLICY',
      key: 'policy',
      render: (record: Policy) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${record.color}15`, color: record.color }}
          >
            <Shield size={20} />
          </div>
          <div>
            <div className="font-bold text-gray-900">{record.title}</div>
            <div className="text-xs text-gray-400 line-clamp-1">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'ICON',
      dataIndex: 'icon',
      key: 'icon',
      render: (icon: string) => <Tag className="rounded-full border-none bg-gray-100 font-bold text-gray-500">{icon}</Tag>,
    },
    {
      title: 'STATUS',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'} className="rounded-full font-bold uppercase text-[10px] px-3">
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'LAST UPDATED',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => (
        <div className="text-xs font-medium text-gray-500">
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (record: Policy) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Edit2 size={16} className="text-indigo-600" />} 
            onClick={() => {
              setIsEditingNotice(false);
              setEditingPolicy(record);
              setModalVisible(true);
            }}
            className="hover:bg-indigo-50"
          />
          <Popconfirm
            title="Delete Policy"
            description="Are you sure you want to delete this policy?"
            onConfirm={() => deletePolicy(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              icon={<Trash2 size={16} className="text-red-500" />} 
              danger
              className="hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-fade-in font-['Outfit']">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-1 !font-bold">Policies Management</Title>
          <Text className="text-gray-400 font-medium">Create and manage institutional guidelines and teacher notices</Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          className="h-12 px-6 rounded-xl font-bold bg-indigo-600 border-none shadow-lg shadow-indigo-100 flex items-center gap-2"
          onClick={() => {
            setIsEditingNotice(false);
            setEditingPolicy(null);
            setModalVisible(true);
          }}
        >
          Add New Policy
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <Table 
              columns={columns} 
              dataSource={policies} 
              loading={policiesLoading || isDeleting}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              className="premium-table"
            />
          </Card>
        </div>

        <div className="xl:col-span-1">
          <Card 
            className="rounded-3xl border-indigo-100 bg-indigo-50/30 shadow-sm"
            title={
              <div className="flex items-center gap-2 py-2">
                <Megaphone size={20} className="text-indigo-600" />
                <span className="font-bold text-gray-900">Important Notice</span>
              </div>
            }
          >
            {noticeLoading ? (
              <div className="py-10 text-center text-gray-400">Loading notice...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notice Title</label>
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-800">
                    {notice?.title || 'No title set'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notice Content</label>
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl text-sm text-gray-500 leading-relaxed min-h-[100px]">
                    {notice?.content || 'No content set'}
                  </div>
                </div>
                <Button 
                  className="w-full h-12 rounded-2xl font-bold text-indigo-600 border-indigo-200 bg-white hover:bg-indigo-50 flex items-center justify-center gap-2"
                  onClick={() => {
                    setIsEditingNotice(true);
                    setEditingPolicy(notice as any);
                    setModalVisible(true);
                  }}
                >
                  <Edit2 size={16} /> Edit Public Notice
                </Button>
                
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                  <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-amber-700/80 leading-relaxed">
                    Changes to the public notice will be visible to all teachers immediately on their dashboard.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <AddPolicyModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        loading={isCreating || isUpdating || isUpdatingNotice}
        editingPolicy={editingPolicy}
        isNotice={isEditingNotice}
      />
    </div>
  );
}
