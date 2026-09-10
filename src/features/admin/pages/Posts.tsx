import { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, Typography, Input, Select, Image } from 'antd';
import { Plus, Edit2, Trash2, Search, FileText, Newspaper, Globe, Sparkles, Eye } from 'lucide-react';
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from '../../../hooks/usePosts';
import AddPostModal from './AddPostModal';
import ViewPostModal from './ViewPostModal';
import { Post } from '../../../types/postss';
import { PostFormData } from '../../../lib/schemas/PostSchema';

import { baseURL } from '../../../consts';
import { useLanguage } from '../../../contexts/LanguageContext';

const { Title, Text } = Typography;

export default function Posts() {
  const { t, language } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // React Query hooks
  const queryParams = {
    page,
    limit,
    ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    ...(search ? { search } : {}),
  };

  const { data: postsResponse, isLoading } = usePosts(queryParams);
  const { mutate: createPost, isPending: isCreating } = useCreatePost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();
  const { mutate: deletePost } = useDeletePost();

  const postsData = postsResponse?.data;
  const postsList = postsData?.items || [];
  const pagination = postsData?.pagination;

  const handleSave = (values: PostFormData) =>
    new Promise<boolean>((resolve) => {
      if (editingPost) {
        updatePost(
          { id: editingPost.id, data: values },
          {
            onSuccess: () => {
              setModalVisible(false);
              setEditingPost(null);
              resolve(true);
            },
            onError: () => resolve(false),
          }
        );
      } else {
        createPost(values, {
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
      title: t('table_post'),
      key: 'post',
      render: (record: Post) => (
        <div className="flex items-center gap-3">
          {record.coverImage ? (
            <Image

              src={`${baseURL}/${record.coverImage}`}
              alt={record.title_en || record.title_ar}
              width={48}
              height={48}
              className="rounded-xl object-cover"
              fallback="https://placehold.co/100x100?text=Post"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary shrink-0 font-bold">
              {record.type === 'news' ? <Newspaper size={22} /> : <FileText size={22} />}
            </div>
          )}
          <div
            className="max-w-md cursor-pointer group"
            onClick={() => {
              setViewingPost(record);
              setViewModalVisible(true);
            }}
          >
            <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
              {language === 'ar' ? (record.title_ar || record.title_en) : (record.title_en || record.title_ar)}
            </div>
            <div className="text-xs text-gray-400 font-medium line-clamp-1">
              {language === 'ar' ? record.title_en : record.title_ar}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t('table_type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag
          className="rounded-full px-3 py-0.5 border-none font-bold uppercase text-[11px] flex items-center gap-1 w-fit"
          color={type === 'news' ? 'purple' : 'blue'}
        >
          {type === 'news' ? <Newspaper size={12} /> : <FileText size={12} />}
          {type === 'news' ? t('post_type_news') : t('post_type_blog')}
        </Tag>
      ),
    },
    {
      title: t('table_status'),
      dataIndex: 'published',
      key: 'published',
      render: (published: boolean) => (
        <Tag
          color={published ? 'green' : 'gold'}
          className="rounded-full font-bold uppercase text-[10px] px-3 border-none"
        >
          {published ? t('post_published') : t('post_draft')}
        </Tag>
      ),
    },
    {
      title: t('table_created_date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div className="text-xs font-medium text-gray-500">
          {date ? new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : 'N/A'}
        </div>
      ),
    },
    {
      title: t('table_actions'),
      key: 'actions',
      render: (record: Post) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Edit2 size={16} />}
            className="text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg"
            onClick={() => {
              setEditingPost(record);
              setModalVisible(true);
            }}
          />
          <Button
            type="text"
            icon={<Eye size={16} />}
            className="text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg"
            onClick={() => {
              setViewingPost(record);
              setViewModalVisible(true);
            }}
          />
          <Popconfirm
            title={t('delete_post_title')}
            description={t('delete_post_confirm')}
            onConfirm={() => deletePost(record.id)}
            okText={t('yes') || 'نعم'}
            cancelText={t('no') || 'لا'}
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              className="hover:bg-red-50 rounded-lg"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-fade-in font-['Outfit']">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={2} className="!mb-1 !font-bold text-gray-900 flex items-center gap-3">
            {t('posts_management')} <Sparkles className="text-amber-500" size={24} />
          </Title>
          <Text className="text-gray-400 font-medium">{t('posts_management_desc')}</Text>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          className="h-12 px-6 rounded-xl font-bold bg-primary hover:!bg-primary-dark border-none shadow-lg shadow-primary/20 flex items-center gap-2"
          onClick={() => {
            setEditingPost(null);
            setModalVisible(true);
          }}
        >
          {t('add_new_post')}
        </Button>
      </header>

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Input
            prefix={<Search size={16} className="text-gray-400" />}
            placeholder={t('search_posts_placeholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-72 h-10 rounded-xl bg-gray-50 border-none"
            allowClear
          />
          <Select
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
            className="w-full sm:w-44 h-10"
            options={[
              { value: 'all', label: t('all_types') },
              { value: 'blog', label: t('blog_articles') },
              { value: 'news', label: t('news_updates') },
            ]}
          />
        </div>

        <div className="text-xs font-bold text-gray-400 flex items-center gap-2">
          <Globe size={14} /> {t('bilingual_posts')}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={postsList}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination?.page || page,
            pageSize: pagination?.limit || limit,
            total: pagination?.totalItems || 0,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
            showSizeChanger: true,
            className: "px-6 py-4",
          }}
        />
      </div>

      {/* Add / Edit Post Modal */}
      <AddPostModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingPost(null);
        }}
        onSave={handleSave}
        loading={isCreating || isUpdating}
        editingPost={editingPost}
      />

      {/* View Post Modal */}
      <ViewPostModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setViewingPost(null);
        }}
        post={viewingPost}
        onEdit={(post) => {
          setEditingPost(post);
          setModalVisible(true);
        }}
      />
    </div>
  );
}

