import { X, HelpCircle, Link, FileText, Layout } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SupportItemFormData, getSupportItemSchema } from '../../lib/schemas/SupportSchema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SupportCategory } from '../../types/support';
import CustomSelect from '../ui/CustomSelect';

interface AddSupportItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SupportItemFormData) => boolean | Promise<boolean>;
    categories: SupportCategory[];
}

export default function AddSupportItemModal({ isOpen, onClose, onSubmit, categories }: AddSupportItemModalProps) {
    const { t } = useLanguage();

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<SupportItemFormData>({
        resolver: zodResolver(getSupportItemSchema(t)) as any,
        defaultValues: {
            title_ar: '',
            title_en: '',
            url: '',
            description_ar: '',
            description_en: '',
            categoryId: '',
            active: true
        }
    });

    const categoryOptions = categories.map(cat => ({
        value: cat.id,
        label: cat.title
    }));

    const handleOnSubmit = async (data: SupportItemFormData) => {
        const payload = {
            ...data,
            title: data.title_ar,
            description: data.description_ar || '',
        };
        const isSuccess = await onSubmit(payload);
        if (isSuccess) {
            reset();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-primary" />
                            <span>Create Resource</span>
                        </h2>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Add New Help Item</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <form id="add-support-item-form" onSubmit={handleSubmit(handleOnSubmit)} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                                    <FileText className="w-3.5 h-3.5" />
                                    Resource Title (Arabic) *
                                </label>
                                <input
                                    type="text"
                                    dir="rtl"
                                    placeholder="كيفية الانضمام للجلسة"
                                    {...register('title_ar')}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                />
                                {errors.title_ar && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.title_ar.message}</p>}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                                    <FileText className="w-3.5 h-3.5" />
                                    Resource Title (English)
                                </label>
                                <input
                                    type="text"
                                    dir="ltr"
                                    placeholder="How to join a session"
                                    {...register('title_en')}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="text-start">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                                <Layout className="w-3.5 h-3.5" />
                                Category
                            </label>
                            <Controller
                                name="categoryId"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        value={field.value}
                                        options={categoryOptions}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.categoryId && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.categoryId.message}</p>}
                        </div>

                        <div className="text-start">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                                <Link className="w-3.5 h-3.5" />
                                Resource URL
                            </label>
                            <input
                                type="text"
                                placeholder="https://example.com/guide"
                                {...register('url')}
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                            />
                            {errors.url && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.url.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                                    <FileText className="w-3.5 h-3.5" />
                                    Description (Arabic)
                                </label>
                                <textarea
                                    rows={3}
                                    dir="rtl"
                                    placeholder="وصف مختصر بالمصدر بالعربية..."
                                    {...register('description_ar')}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                                    <FileText className="w-3.5 h-3.5" />
                                    Description (English)
                                </label>
                                <textarea
                                    rows={3}
                                    dir="ltr"
                                    placeholder="Brief summary of resource in English..."
                                    {...register('description_en')}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        form="add-support-item-form"
                        type="submit"
                        className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
                    >
                        Create Resource
                    </button>
                </div>
            </div>
        </div>
    );
}
