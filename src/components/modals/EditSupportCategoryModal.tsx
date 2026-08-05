import { X, Edit2 } from 'lucide-react';
import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SupportCategoryFormData, getSupportCategorySchema } from '../../lib/schemas/SupportSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SupportCategory } from '../../types/support';

interface EditSupportCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SupportCategoryFormData) => boolean | Promise<boolean>;
    category: SupportCategory | null;
}

export default function EditSupportCategoryModal({ isOpen, onClose, onSubmit, category }: EditSupportCategoryModalProps) {
    const { t } = useLanguage();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SupportCategoryFormData>({
        resolver: zodResolver(getSupportCategorySchema(t)) as any
    });

    useEffect(() => {
        if (category) {
            reset({
                title_ar: category.title_ar || category.title || '',
                title_en: category.title_en || '',
                active: category.active
            });
        }
    }, [category, reset]);

    const handleOnSubmit = async (data: SupportCategoryFormData) => {
        const payload = {
            ...data,
            title: data.title_ar,
        };
        const isSuccess = await onSubmit(payload);
        if (isSuccess) {
            onClose();
        }
    };

    if (!isOpen || !category) return null;

    return (
        <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Edit2 className="w-6 h-6 text-primary" />
                            <span>{t('editCategory')}</span>
                        </h2>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{t('updateSection')}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleOnSubmit)} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                        <div>
                            <label className="text-xs font-black text-slate-500 mb-2 uppercase tracking-wider block">
                                {t('categoryTitleArabic')} *
                            </label>
                            <input
                                type="text"
                                dir="rtl"
                                placeholder={t('categoryTitleArabicPlaceholder')}
                                {...register('title_ar')}
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            />
                            {errors.title_ar && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.title_ar.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-black text-slate-500 mb-2 uppercase tracking-wider block">
                                {t('categoryTitleEnglish')}
                            </label>
                            <input
                                type="text"
                                dir="ltr"
                                placeholder={t('categoryTitleEnglishPlaceholder')}
                                {...register('title_en')}
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <input
                            type="checkbox"
                            id="category-active"
                            {...register('active')}
                            className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                        />
                        <label htmlFor="category-active" className="text-sm font-bold text-slate-600 cursor-pointer">
                            {t('activeCategory')}
                        </label>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            {t('saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
