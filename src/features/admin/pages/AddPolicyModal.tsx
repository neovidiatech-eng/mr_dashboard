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
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      content_ar: '',
      content_en: '',
      icon: 'shield',
      color: '#800020',
      active: true,
    }
  });

  useEffect(() => {
    if (visible) {
      if (editingPolicy) {
        reset({
          title_ar: editingPolicy.title_ar || editingPolicy.title || '',
          title_en: editingPolicy.title_en || '',
          description_ar: editingPolicy.description_ar || editingPolicy.description || '',
          description_en: editingPolicy.description_en || '',
          content_ar: editingPolicy.content_ar || editingPolicy.content || '',
          content_en: editingPolicy.content_en || '',
          icon: editingPolicy.icon || 'shield',
          color: editingPolicy.color || '#800020',
          active: editingPolicy.active,
        });
      } else {
        reset({
          title_ar: '',
          title_en: '',
          description_ar: '',
          description_en: '',
          content_ar: '',
          content_en: '',
          icon: 'shield',
          color: '#800020',
          active: true,
        });
      }
    }
  }, [visible, editingPolicy, reset]);

  const onSubmit = async (values: PolicyFormData) => {
    const colorHex = typeof values.color === 'string' ? values.color : (values.color as any)?.toHexString?.() || '#800020';
    
    if (isNotice) {
      const noticeData: any = {
        title_ar: values.title_ar,
        active: values.active,
      };
      if (values.title_en) noticeData.title_en = values.title_en;
      if (values.content_ar || values.description_ar) {
        noticeData.content_ar = values.content_ar || values.description_ar;
      }
      if (values.content_en || values.description_en) {
        noticeData.content_en = values.content_en || values.description_en;
      }
      await onSave(noticeData);
    } else {
      const policyData: any = {
        title_ar: values.title_ar,
        color: colorHex,
        active: values.active,
      };
      if (values.title_en) policyData.title_en = values.title_en;
      if (values.description_ar) policyData.description_ar = values.description_ar;
      if (values.description_en) policyData.description_en = values.description_en;
      if (values.icon) policyData.icon = values.icon;
      await onSave(policyData);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            {isNotice ? <FileText size={20} /> : <Shield size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isNotice ? t('editImportantNotice') : (editingPolicy ? t('editPolicy') : t('createNewPolicy'))}
            </h3>
            <p className="text-xs font-medium text-gray-400">
              {isNotice ? t('noticeVisibleToAll') : t('manageAcademicGuidelines')}
            </p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={580}
      className="premium-modal"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 text-start max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Type size={14} className="text-primary" /> {t('titleArabic')} *
            </label>
            <input 
              {...register('title_ar')}
              placeholder={t('titleArabicPlaceholder')} 
              dir="rtl"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20" 
            />
            {errors.title_ar && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.title_ar.message}</p>}
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Type size={14} className="text-primary" /> {t('titleEnglish')}
            </label>
            <input 
              {...register('title_en')}
              placeholder={t('titleEnglishPlaceholder')} 
              dir="ltr"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
        </div>

        {!isNotice && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Info size={14} className="text-primary" /> {t('iconName')}
              </label>
              <input 
                {...register('icon')}
                placeholder={t('iconNamePlaceholder')} 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20" 
              />
              {errors.icon && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.icon.message}</p>}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Palette size={14} className="text-primary" /> {t('themeColor')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Edit3 size={14} className="text-primary" /> {t('noticeContentArabic')}
              </label>
              <textarea 
                {...register('content_ar')}
                placeholder={t('noticeContentArabicPlaceholder')} 
                rows={4} 
                dir="rtl"
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Edit3 size={14} className="text-primary" /> {t('noticeContentEnglish')}
              </label>
              <textarea 
                {...register('content_en')}
                placeholder={t('noticeContentEnglishPlaceholder')} 
                rows={4} 
                dir="ltr"
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Edit3 size={14} className="text-primary" /> {t('descriptionArabic')}
              </label>
              <textarea 
                {...register('description_ar')}
                placeholder={t('descriptionArabicPlaceholder')} 
                rows={4} 
                dir="rtl"
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Edit3 size={14} className="text-primary" /> {t('descriptionEnglish')}
              </label>
              <textarea 
                {...register('description_en')}
                placeholder={t('descriptionEnglishPlaceholder')} 
                rows={4} 
                dir="ltr"
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-8">
          <Text className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Activity size={14} className="text-primary" /> {t('visibleAndActive')}
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
            {t('cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-11 px-10 rounded-xl font-bold bg-primary hover:!bg-primary-dark border-none shadow-lg shadow-primary/20"
          >
            {isNotice ? t('updateNotice') : (editingPolicy ? t('updatePolicy') : t('createPolicy'))}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
