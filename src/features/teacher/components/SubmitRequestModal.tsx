import { Modal, Button } from 'antd';
import { Layout, Send } from 'lucide-react';
import { useCreateRequest } from '../../../hooks/useRequests';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUnifiedRequestSchema, UnifiedRequestFormData } from '../../../lib/schemas/UnifiedRequestSchema';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SubmitRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SubmitRequestModal({ visible, onClose }: SubmitRequestModalProps) {
  const { t } = useLanguage();
  const { mutate: createRequest, isPending } = useCreateRequest();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnifiedRequestFormData>({
    resolver: zodResolver(getUnifiedRequestSchema(t)) as any,
    defaultValues: {
      priority: 'medium',
      type: 'others',
      title: '',
      reason: ''
    }
  });

  const onSubmit = (values: UnifiedRequestFormData) => {
    createRequest(values, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const typeOptions = [
    { label: 'Vacation', value: 'vacation' },
    { label: 'Sick Leave', value: 'sick_leave' },
    { label: 'Technical Issue', value: 'technical_issue' },
    { label: 'Reschedule', value: 'reschedule' },
    { label: 'Excuse', value: 'excuse' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Others', value: 'others' },
  ];

  const priorityOptions = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Layout size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Submit New Request</h3>
            <p className="text-xs font-medium text-gray-400">Our team will review your request shortly</p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      className="premium-modal"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-start">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Request Type</label>
            <select
              {...register('type')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Priority Level</label>
            <select
              {...register('priority')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.priority && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.priority.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Request Title</label>
          <input
            {...register('title')}
            placeholder="e.g. Vacation Request for next week"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Reason / Details</label>
          <textarea
            {...register('reason')}
            placeholder="Explain the reason for your request..."
            rows={4}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
          {errors.reason && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.reason.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 mt-8">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-gray-600">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            icon={<Send size={16} />}
            className="h-11 px-10 rounded-xl font-bold bg-blue-600 border-none shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
