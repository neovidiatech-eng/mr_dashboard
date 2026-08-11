import { useState } from 'react';
import { Modal, Tag, Button, Image, Tabs } from 'antd';
import {
  Eye,
  Calendar,
  Globe,
  Edit2,
  Newspaper,
  FileText,
  Clock,
  BookOpen,
  AlignLeft
} from 'lucide-react';
import { Post } from '../../../types/postss';

interface ViewPostModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  onEdit?: (post: Post) => void;
}

export default function ViewPostModal({
  visible,
  onClose,
  post,
  onEdit,
}: ViewPostModalProps) {
  const [activeLangTab, setActiveLangTab] = useState<'both' | 'ar' | 'en'>('both');

  if (!post) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={780}
      className="premium-modal"
      title={
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 pr-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <Eye size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Post Details</h3>
              <p className="text-xs font-medium text-gray-400">
                View blog post or news announcement content
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tag
              className="rounded-full px-3 py-1 border-none font-bold uppercase text-[11px] flex items-center gap-1.5"
              color={post.type === 'news' ? 'purple' : 'blue'}
            >
              {post.type === 'news' ? <Newspaper size={13} /> : <FileText size={13} />}
              {post.type || 'blog'}
            </Tag>
            <Tag
              color={post.published ? 'green' : 'gold'}
              className="rounded-full font-bold uppercase text-[10px] px-3 py-0.5 border-none"
            >
              {post.published ? 'Published' : 'Draft'}
            </Tag>
          </div>
        </div>
      }
    >
      <div className="mt-4 space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Cover Image Banner */}
        {post.coverImage ? (
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 max-h-64 flex items-center justify-center border border-gray-100 shadow-sm">
            <Image
              src={post.coverImage}
              alt={post.title_en || post.title_ar}
              className="w-full object-cover max-h-64"
              fallback="https://placehold.co/800x400?text=Post+Image"
            />
          </div>
        ) : (
          <div className="w-full h-32 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-300 border border-indigo-100/50">
            <div className="flex items-center gap-2 font-medium text-indigo-400">
              {post.type === 'news' ? <Newspaper size={32} /> : <FileText size={32} />}
              <span>No cover image provided</span>
            </div>
          </div>
        )}

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50/80 rounded-2xl text-xs font-semibold text-gray-500 border border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-primary" />
            <span>Created: <strong className="text-gray-700">{formatDate(post.createdAt)}</strong></span>
          </div>
          {post.updatedAt && (
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-500" />
              <span>Updated: <strong className="text-gray-700">{formatDate(post.updatedAt)}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-indigo-500" />
            <span>Bilingual (AR / EN)</span>
          </div>
        </div>

        {/* Language Tabs Selector */}
        <div className="flex items-center justify-between bg-white pt-2">
          <Tabs
            activeKey={activeLangTab}
            onChange={(key) => setActiveLangTab(key as 'both' | 'ar' | 'en')}
            className="w-full"
            items={[
              {
                key: 'both',
                label: (
                  <span className="flex items-center gap-2 font-bold px-1">
                    <Globe size={15} /> Both Languages
                  </span>
                ),
              },
              {
                key: 'ar',
                label: (
                  <span className="flex items-center gap-2 font-bold px-1">
                    🇦🇪 العربية (Arabic)
                  </span>
                ),
              },
              {
                key: 'en',
                label: (
                  <span className="flex items-center gap-2 font-bold px-1">
                    🇬🇧 English
                  </span>
                ),
              },
            ]}
          />
        </div>

        {/* Content Display Area */}
        <div className="space-y-6">
          {/* Arabic Section */}
          {(activeLangTab === 'both' || activeLangTab === 'ar') && (
            <div className="p-5 rounded-2xl bg-amber-50/30 border border-amber-100/60 space-y-4" dir="rtl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <BookOpen size={15} />
                المحتوى باللغة العربية
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                  {post.title_ar || <span className="text-gray-400 italic">لا يوجد عنوان بالعربية</span>}
                </h2>
              </div>

              {post.excerpt_ar && (
                <div className="p-3.5 bg-white/80 rounded-xl border border-amber-100 text-sm text-gray-600 font-medium italic leading-relaxed">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold not-italic mb-1">
                    <AlignLeft size={13} /> الملخص:
                  </div>
                  {post.excerpt_ar}
                </div>
              )}

              <div className="prose max-w-none text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium pt-1">
                {post.content_ar || <span className="text-gray-400 italic">لا يوجد محتوى بالعربية</span>}
              </div>
            </div>
          )}

          {/* English Section */}
          {(activeLangTab === 'both' || activeLangTab === 'en') && (
            <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100/60 space-y-4" dir="ltr">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <BookOpen size={15} />
                English Content
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                  {post.title_en || <span className="text-gray-400 italic">No English title</span>}
                </h2>
              </div>

              {post.excerpt_en && (
                <div className="p-3.5 bg-white/80 rounded-xl border border-blue-100 text-sm text-gray-600 font-medium italic leading-relaxed">
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold not-italic mb-1">
                    <AlignLeft size={13} /> Summary / Excerpt:
                  </div>
                  {post.excerpt_en}
                </div>
              )}

              <div className="prose max-w-none text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium pt-1">
                {post.content_en || <span className="text-gray-400 italic">No English content</span>}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-gray-600">
            Close
          </Button>

          {onEdit && (
            <Button
              type="primary"
              icon={<Edit2 size={16} />}
              onClick={() => {
                onClose();
                onEdit(post);
              }}
              className="h-11 px-6 rounded-xl font-bold bg-primary hover:!bg-primary-dark border-none shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              Edit Post
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
