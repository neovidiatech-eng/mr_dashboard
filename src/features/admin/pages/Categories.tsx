import { useState } from 'react';
import { Layers, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import CategoryForm, { COLORS } from '../../../components/modals/CategoryModal';
import { Category } from '../../../types/category';
import { useCategories, useAddCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { CategoryFormData } from '../../../lib/schemas/CategorySchema';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { useConfirm } from '../../../hooks/useConfirm';

function getColorClasses(colorId: string) {
  return COLORS.find(c => c.id === colorId) || COLORS[0];
}

export default function Categories() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const { data, isLoading, isError, error, isFetching } = useCategories();
  const { mutate: addCategory } = useAddCategory();
  const { mutate: updateCategory } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { confirm, ConfirmDialog } = useConfirm();

  const categories = data?.categories ?? [];

  const filtered = categories.filter(c => {
    const matchesSearch = !searchQuery || c.name_ar.includes(searchQuery) || (c.name_en || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterActive === 'all') return true;
    return c.active === (filterActive === 'active');
  });

  const handleAdd = (formData: CategoryFormData) =>
    new Promise<boolean>((resolve) => {
      addCategory(formData, {
        onSuccess: () => resolve(true),
        onError: () => resolve(false),
      });
    });

  const handleEdit = (formData: CategoryFormData) =>
    new Promise<boolean>((resolve) => {
      if (!editingCategory) {
        resolve(false);
        return;
      }

      updateCategory(
        { id: editingCategory.id, data: formData },
        {
          onSuccess: () => resolve(true),
          onError: () => resolve(false),
        }
      );
    });

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id);
    const name = category ? (language === 'ar' ? category.name_ar : category.name_en) : '';
    const confirmed = await confirm({
      title: language === 'ar' ? 'حذف تصنيف' : 'Delete Category',
      message: language === 'ar' ? `هل أنت متأكد من حذف "${name}"؟` : `Are you sure you want to delete "${name}"?`,
    });
    if (confirmed) {
      deleteCategory(id);
    }
  };

  const toggleStatus = (category: Category) => {
    updateCategory({ id: category.id, data: { active: !category.active } });
  };

  if (isError) {
    return (
      <div className="p-6 lg:p-8 text-center text-red-500" dir="rtl">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error instanceof Error ? error.message : 'Something went wrong'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{language === 'ar' ? 'تصنيفات الكورسات' : 'Course Categories'}</h1>
          <p className="text-gray-500 text-sm mt-1">{language === 'ar' ? 'إضافة وتعديل تصنيفات الكورسات (رياضيات، فيزياء...)' : 'Add and manage course categories (Math, Physics...)'}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة تصنيف جديد' : 'Add Category'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث في التصنيفات...' : 'Search categories...'}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              className={`w-full px-4 py-3 ${language === 'ar' ? 'pr-12' : 'pl-12'} border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-start`}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterActive(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterActive === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {s === 'all' ? (language === 'ar' ? 'الكل' : 'All') : s === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(isLoading || isFetching) ? (
        <TableSkeleton rows={6} columns={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <Layers className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">{language === 'ar' ? 'لا توجد تصنيفات' : 'No categories found'}</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">{language === 'ar' ? 'اضغط على "إضافة تصنيف جديد" للبدء' : 'Click "Add Category" to get started'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(category => {
            const colorClasses = getColorClasses(category.color);
            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`w-14 h-14 ${colorClasses.bg} rounded-2xl flex items-center justify-center border ${colorClasses.border}`}>
                      <Layers className={`w-7 h-7 ${colorClasses.icon}`} />
                    </div>
                  </div>

                  <div className="text-start">
                    <h3 className="text-lg font-bold text-gray-900 mb-0.5">{category.name_ar}</h3>
                    {category.name_en && <p className="text-sm text-gray-400 mb-3">{category.name_en}</p>}
                    <div className="flex items-center justify-start gap-2">
                      <button
                        onClick={() => toggleStatus(category)}
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${category.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                      >
                        {category.active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <CategoryForm
          title={language === 'ar' ? 'إضافة تصنيف جديد' : 'Add New Category'}
          onSave={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {editingCategory && (
        <CategoryForm
          title={language === 'ar' ? 'تعديل التصنيف' : 'Edit Category'}
          initial={editingCategory}
          onSave={handleEdit}
          onCancel={() => setEditingCategory(null)}
        />
      )}
      {ConfirmDialog}
    </div>
  );
}
