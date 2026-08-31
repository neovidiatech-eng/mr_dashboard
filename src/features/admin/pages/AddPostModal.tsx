import { useEffect } from 'react';
import { Modal, Button, Switch, Select, Typography } from 'antd';
import { FileText, Type, Image as ImageIcon, Globe, Activity, AlignLeft } from 'lucide-react';
import { Post } from '../../../types/postss';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getPostSchema, PostFormData } from '../../../lib/schemas/PostSchema';
import { useLanguage } from '../../../contexts/LanguageContext';

const { Text } = Typography;

interface AddPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: PostFormData) => boolean | Promise<boolean>;
  loading: boolean;
  editingPost?: Post | null;
}

export default function AddPostModal({
  visible,
  onClose,
  onSave,
  loading,
  editingPost,
}: AddPostModalProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(getPostSchema(t)) as any,
    defaultValues: {
      type: 'blog',
      title_ar: '',
      title_en: '',
      excerpt_ar: '',
      excerpt_en: '',
      content_ar: '',
      content_en: '',
      coverImage: undefined,
      published: true,
    },
  });

  useEffect(() => {
    if (visible) {
      if (editingPost) {
        reset({
          type: (editingPost.type as 'blog' | 'news') || 'blog',
          title_ar: editingPost.title_ar || '',
          title_en: editingPost.title_en || '',
          excerpt_ar: editingPost.excerpt_ar || '',
          excerpt_en: editingPost.excerpt_en || '',
          content_ar: editingPost.content_ar || '',
          content_en: editingPost.content_en || '',
          coverImage: undefined,
          published: editingPost.published ?? true,
        });
      } else {
        reset({
          type: 'blog',
          title_ar: '',
          title_en: '',
          excerpt_ar: '',
          excerpt_en: '',
          content_ar: '',
          content_en: '',
          coverImage: undefined,
          published: true,
        });
      }
    }
  }, [visible, editingPost, reset]);

  const onSubmit = async (values: PostFormData) => {
    const payload: any = { ...values };
    if (values.coverImage && values.coverImage.length > 0) {
      payload.coverImage = values.coverImage[0];
    } else {
      delete payload.coverImage;
    }
    await onSave(payload);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {editingPost ? t('edit_post') : t('create_new_post')}
            </h3>
            <p className="text-xs font-medium text-gray-400">
              {t('add_post_subtitle')}
            </p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={720}
      className="premium-modal"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 text-start max-h-[75vh] overflow-y-auto pr-1">
        {/* Post Type & Cover Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Globe size={14} className="text-primary" /> {t('post_type_label')} *
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  className="w-full h-11"
                  options={[
                    { value: 'blog', label: t('blog_article_option') },
                    { value: 'news', label: t('news_announcement_option') },
                  ]}
                />
              )}
            />
            {errors.type && <p className="text-red-500 text-xs mt-1 font-bold">{errors.type.message}</p>}
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">

              <ImageIcon size={14} className="text-primary" /> Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('coverImage')}
              className="w-full h-11 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            {errors.coverImage && (
              <p className="text-red-500 text-xs mt-1 font-bold">{errors.coverImage.message as string}</p>
            )}
          </div>
        </div>

        {/* Titles (Bilingual) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Type size={14} className="text-primary" /> {t('post_title_ar_label')} *
            </label>
            <input
              dir="rtl"
              {...register('title_ar')}
              placeholder={t('post_title_ar_placeholder')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
            />
            {errors.title_ar && (
              <p className="text-red-500 text-xs mt-1 font-bold">{errors.title_ar.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Type size={14} className="text-primary" /> {t('post_title_en_label')} *
            </label>
            <input
              dir="ltr"
              {...register('title_en')}
              placeholder={t('post_title_en_placeholder')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
            />
            {errors.title_en && (
              <p className="text-red-500 text-xs mt-1 font-bold">{errors.title_en.message}</p>
            )}
          </div>
        </div>

        {/* Excerpts (Bilingual) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <AlignLeft size={14} className="text-primary" /> {t('post_excerpt_ar_label')}
            </label>
            <textarea
              dir="rtl"
              rows={3}
              {...register('excerpt_ar')}
              placeholder={t('post_excerpt_ar_placeholder')}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
              <AlignLeft size={14} className="text-primary" /> {t('post_excerpt_en_label')}
            </label>
            <textarea
              dir="ltr"
              rows={3}
              {...register('excerpt_en')}
              placeholder={t('post_excerpt_en_placeholder')}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
            />
          </div>
        </div>

        {/* Content Arabic */}
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <FileText size={14} className="text-primary" /> {t('post_content_ar_label')} *
          </label>
          <textarea
            dir="rtl"
            rows={5}
            {...register('content_ar')}
            placeholder={t('post_content_ar_placeholder')}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
          />
          {errors.content_ar && (
            <p className="text-red-500 text-xs mt-1 font-bold">{errors.content_ar.message}</p>
          )}
        </div>

        {/* Content English */}
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <FileText size={14} className="text-primary" /> {t('post_content_en_label')} *
          </label>
          <textarea
            dir="ltr"
            rows={5}
            {...register('content_en')}
            placeholder={t('post_content_en_placeholder')}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
          />
          {errors.content_en && (
            <p className="text-red-500 text-xs mt-1 font-bold">{errors.content_en.message}</p>
          )}
        </div>

        {/* Published Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <Text className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Activity size={14} className="text-primary" /> {t('publish_immediately')}
          </Text>
          <Controller
            name="published"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-gray-600">
            {t('cancelBtn') || t('cancel') || 'Cancel'}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-11 px-10 rounded-xl font-bold bg-primary hover:!bg-primary-dark border-none shadow-lg shadow-primary/20"
          >
            {editingPost ? t('update_post_btn') : t('create_post_btn')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
