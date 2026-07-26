import { useEffect } from 'react';
import { Modal, Button, Switch, ColorPicker } from 'antd';
import { Shield, Edit3, Type, Palette, Activity, FileText, Info } from 'lucide-react';
import { Policy } from '../../../types/polices';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getPolicySchema, PolicyFormData } from '../../../lib/schemas/PolicySchema';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Typography } from 'antd';

const { Text } = Typography;

interface AddPolicyModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: any) => boolean | Promise<boolean>;
  loading: boolean;
  editingPolicy?: Policy | null;
  isNotice?: boolean;
}

export default function AddPolicyModal({ visible, onClose, onSave, loading, editingPolicy, isNotice }: AddPolicyModalProps) {
  const { t } = useLanguage();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<PolicyFormData>({
    resolver: zodResolver(getPolicySchema(t)) as any,
    defaultValues: {
      title: '',
      description: '',
      content: '',
      icon: 'shield',
      color: '#4f46e5',
      active: true,
    }
  });

  useEffect(() => {
    if (visible) {
      if (editingPolicy) {
        reset({
          title: editingPolicy.title,
          description: editingPolicy.description || '',
          content: editingPolicy.content || '',
          icon: editingPolicy.icon || 'shield',
          color: editingPolicy.color || '#4f46e5',
          active: editingPolicy.active,
        });
      } else {
        reset({
          title: '',
          description: '',
          content: '',
          icon: 'shield',
          color: '#4f46e5',
          active: true,
        });
      }
    }
  }, [visible, editingPolicy, reset]);

  const onSubmit = async (values: PolicyFormData) => {
    const formattedValues = {
      ...values,
      color: typeof values.color === 'string' ? values.color : (values.color as any)?.toHexString?.() || '#4f46e5',
    };
    
    if (isNotice) {
      const noticeData = {
        title: formattedValues.title,
        content: formattedValues.content || formattedValues.description,
        active: formattedValues.active
      };
      await onSave(noticeData);
    } else {
      const { content, ...policyData } = formattedValues;
      await onSave(policyData);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            {isNotice ? <FileText size={20} /> : <Shield size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isNotice ? 'Edit Important Notice' : (editingPolicy ? 'Edit Policy' : 'Create New Policy')}
            </h3>
            <p className="text-xs font-medium text-gray-400">
              {isNotice ? 'This notice is visible to all instructors' : 'Manage academic guidelines and rules'}
            </p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={540}
      className="premium-modal"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 text-start">
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <Type size={14} className="text-indigo-500" /> Title
          </label>
          <input 
            {...register('title')}
            placeholder="e.g. Attendance Policy" 
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
          />
          {errors.title && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.title.message}</p>}
        </div>

        {!isNotice && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Info size={14} className="text-indigo-500" /> Icon Name
              </label>
              <input 
                {...register('icon')}
                placeholder="shield, clock, book" 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
              />
              {errors.icon && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.icon.message}</p>}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Palette size={14} className="text-indigo-500" /> Theme Color
              </label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <ColorPicker 
                    value={field.value} 
                    onChange={(val) => field.onChange(val.toHexString())} 
                    showText 
                    className="w-full h-11" 
                  />
                )}
              />
            </div>
          </div>
        )}

        {isNotice ? (
          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Edit3 size={14} className="text-indigo-500" /> Notice Content
            </label>
            <textarea 
              {...register('content')}
              placeholder="Enter the message for teachers..." 
              rows={6} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" 
            />
            {errors.content && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.content.message}</p>}
          </div>
        ) : (
          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Edit3 size={14} className="text-indigo-500" /> Policy Description
            </label>
            <textarea 
              {...register('description')}
              placeholder="Enter the details of the policy..." 
              rows={6} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" 
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.description.message}</p>}
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-8">
          <Text className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Activity size={14} className="text-indigo-500" /> Visible & Active
          </Text>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-gray-600">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-11 px-10 rounded-xl font-bold bg-indigo-600 border-none shadow-lg shadow-indigo-200"
          >
            {isNotice ? 'Update Notice' : (editingPolicy ? 'Update Policy' : 'Create Policy')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
