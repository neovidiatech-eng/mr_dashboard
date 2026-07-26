import { useState } from 'react';
import { 
    Plus, 
    Search, 
    HelpCircle, 
    Edit2, 
    Trash2, 
    ExternalLink, 
    FolderPlus,
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSupport } from '../../../hooks/useSupport';
import { useConfirm } from '../../../hooks/useConfirm';
import AddSupportCategoryModal from '../../../components/modals/AddSupportCategoryModal';
import EditSupportCategoryModal from '../../../components/modals/EditSupportCategoryModal';
import AddSupportItemModal from '../../../components/modals/AddSupportItemModal';
import EditSupportItemModal from '../../../components/modals/EditSupportItemModal';
import { SupportCategoryFormData, SupportItemFormData } from '../../../lib/schemas/SupportSchema';
import { SupportCategory, SupportItem } from '../../../types/support';

export default function Support() {
    const { language } = useLanguage();
    const { 
        categories, 
        isLoadingCategories, 
        createSupport,
        updateSupport,
        deleteSupport, 
        createCategory,
        updateCategory,
        deleteCategory 
    } = useSupport();
    const { confirm, ConfirmDialog } = useConfirm();
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [isEditItemOpen, setIsEditItemOpen] = useState(false);

    // Selection States
    const [selectedCategory, setSelectedCategory] = useState<SupportCategory | null>(null);
    const [selectedItem, setSelectedItem] = useState<SupportItem | null>(null);

    const filteredCategories = categories.filter(cat => 
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.supports.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleDeleteSupport = async (id: string) => {
        const confirmed = await confirm({
            title: language === 'ar' ? 'حذف الدعم' : 'Delete Support',
            message: language === 'ar' ? 'هل أنت متأكد من حذف هذا العنصر؟' : 'Are you sure you want to delete this item?'
        });
        if (confirmed) {
            await deleteSupport(id);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        const confirmed = await confirm({
            title: language === 'ar' ? 'حذف القسم' : 'Delete Category',
            message: language === 'ar' ? 'هل أنت متأكد من حذف هذا القسم بجميع محتوياته؟' : 'Are you sure you want to delete this category and all its content?'
        });
        if (confirmed) {
            await deleteCategory(id);
        }
    };

    // Handler Functions
    const handleAddCategory = async (data: SupportCategoryFormData) => {
        try {
            await createCategory(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleEditCategory = async (data: SupportCategoryFormData) => {
        if (selectedCategory) {
          try {
            await updateCategory({ id: selectedCategory.id, data });
            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        }
        return false;
    };

    const handleAddSupport = async (data: SupportItemFormData) => {
        try {
            await createSupport(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleEditSupport = async (data: SupportItemFormData) => {
        if (selectedItem) {
          try {
            await updateSupport({ id: selectedItem.id, data });
            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        }
        return false;
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 rounded-2xl">
                        <HelpCircle className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support Management</h1>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Help Center & Resources</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsAddCategoryOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-slate-100"
                    >
                        <FolderPlus className="w-4 h-4" />
                        Add Category
                    </button>
                    <button 
                        onClick={() => setIsAddItemOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" />
                        Create Resource
                    </button>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search categories or resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-200 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Categories</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{categories.length}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            {isLoadingCategories ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Resources...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-10">
                    {filteredCategories.map((category) => (
                        <div key={category.id} className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">{category.title}</h2>
                                    <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-widest">
                                        {category.supports.length} Resources
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setIsEditCategoryOpen(true);
                                        }}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-indigo-600"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.supports.map((support) => (
                                    <div 
                                        key={support.id}
                                        className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-2xl ${support.active ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                                                {support.active ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedItem(support);
                                                        setIsEditItemOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteSupport(support.id)}
                                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="font-black text-slate-900 mb-2 line-clamp-1">{support.title}</h3>
                                        <p className="text-xs font-bold text-slate-400 leading-relaxed line-clamp-2 mb-6">
                                            {support.description}
                                        </p>

                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                    {support.readingCount} Views
                                                </span>
                                            </div>
                                            <a 
                                                href={support.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:gap-3 transition-all"
                                            >
                                                Visit Resource
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                
                                <button 
                                    onClick={() => setIsAddItemOpen(true)}
                                    className="flex flex-col items-center justify-center p-8 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                                >
                                    <div className="p-3 bg-slate-50 group-hover:bg-indigo-50 rounded-2xl transition-colors">
                                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                                    </div>
                                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">Add Resource</p>
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="p-6 bg-slate-50 rounded-full mb-6">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">No results found</h3>
                            <p className="text-sm font-bold text-slate-400 mt-2">Try adjusting your search query</p>
                        </div>
                    )}
                </div>
            )}

            {ConfirmDialog}

            {/* Modals */}
            <AddSupportCategoryModal
                isOpen={isAddCategoryOpen}
                onClose={() => setIsAddCategoryOpen(false)}
                onSubmit={handleAddCategory}
            />
            <EditSupportCategoryModal
                isOpen={isEditCategoryOpen}
                onClose={() => {
                    setIsEditCategoryOpen(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleEditCategory}
                category={selectedCategory}
            />
            <AddSupportItemModal
                isOpen={isAddItemOpen}
                onClose={() => setIsAddItemOpen(false)}
                onSubmit={handleAddSupport}
                categories={categories}
            />
            <EditSupportItemModal
                isOpen={isEditItemOpen}
                onClose={() => {
                    setIsEditItemOpen(false);
                    setSelectedItem(null);
                }}
                onSubmit={handleEditSupport}
                categories={categories}
                support={selectedItem}
            />
        </div>
    );
}
