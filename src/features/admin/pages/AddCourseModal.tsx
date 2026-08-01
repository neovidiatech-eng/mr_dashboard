import { Modal, Button, Upload, Select } from 'antd';
import { useCreateCourse, useUpdateCourse } from '../../../hooks/useCourses';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, AlignLeft, Trophy, Image as ImageIcon, Upload as UploadIcon, Tag, DollarSign, Globe, Hash } from 'lucide-react';
import { useGetRanks } from '../hooks/useRank';
import { useCategories } from '../hooks/useCategories';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCourseSchema, CourseFormData } from '../../../lib/schemas/CourseSchema';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AddCourseModalProps {
    visible: boolean;
    onClose: () => void;
    course?: any;
}

export default function AddCourseModal({ visible, onClose, course }: AddCourseModalProps) {
    const { t } = useLanguage();
    const [fileList, setFileList] = useState<any[]>([]);
    const queryClient = useQueryClient();
    const { mutate: createCourse, isPending: isCreating } = useCreateCourse();
    const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
    const { data: ranksData, isLoading: ranksLoading } = useGetRanks();
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

    const isEditMode = !!course;

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CourseFormData>({
        resolver: zodResolver(getCourseSchema(t)) as any,
        defaultValues: {
            title_ar: '',
            title_en: '',
            description_ar: '',
            description_en: '',
            rankId: '',
            categoryId: '',
            price: '',
            keywords: [],
        }
    });

    useEffect(() => {
        if (visible) {
            if (course) {
                let parsedKeywords: string[] = [];
                if (course.keywords) {
                    if (Array.isArray(course.keywords)) {
                        parsedKeywords = course.keywords;
                    } else if (typeof course.keywords === 'string') {
                        try {
                            const parsed = JSON.parse(course.keywords);
                            if (Array.isArray(parsed)) parsedKeywords = parsed;
                            else parsedKeywords = [course.keywords];
                        } catch {
                            parsedKeywords = course.keywords.split(',').map((s: string) => s.trim()).filter(Boolean);
                        }
                    }
                }

                reset({
                    title_ar: course.title_ar || course.title || '',
                    title_en: course.title_en || course.title || '',
                    description_ar: course.description_ar || course.description || '',
                    description_en: course.description_en || course.description || '',
                    rankId: course.rankId || '',
                    categoryId: course.categoryId || '',
                    price: course.price !== undefined && course.price !== null ? String(course.price) : '',
                    keywords: parsedKeywords,
                });

                if (course.image) {
                    const imgUrl = course.image.startsWith('http') 
                        ? course.image 
                        : `https://agro-plus.net/${course.image.replace(/^\//, '')}`;
                    setFileList([{
                        uid: '-1',
                        name: course.image,
                        status: 'done',
                        url: imgUrl,
                    }]);
                } else {
                    setFileList([]);
                }
            } else {
                reset({
                    title_ar: '',
                    title_en: '',
                    description_ar: '',
                    description_en: '',
                    rankId: '',
                    categoryId: '',
                    price: '',
                    keywords: [],
                });
                setFileList([]);
            }
        }
    }, [visible, course, reset]);

    const onSubmit = (values: CourseFormData) => {
        const hasNewImage = fileList.length > 0 && fileList[0]?.originFileObj;

        const appendKeywords = (fd: FormData, keywords?: string[]) => {
            if (Array.isArray(keywords) && keywords.length > 0) {
                keywords.forEach((kw) => {
                    fd.append('keywords', kw);
                });
            }
        };

        if (isEditMode) {
            if (hasNewImage) {
                const formData = new FormData();
                formData.append('title_ar', values.title_ar);
                formData.append('title_en', values.title_en);
                formData.append('description_ar', values.description_ar);
                formData.append('description_en', values.description_en);
                formData.append('rankId', values.rankId);
                if (values.categoryId) formData.append('categoryId', values.categoryId);
                if (values.price !== undefined && values.price !== '') formData.append('price', String(values.price));
                appendKeywords(formData, values.keywords);
                formData.append('image', fileList[0].originFileObj);

                updateCourse({ id: course.id, data: formData as any }, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['courses'] });
                        onClose();
                    }
                });
            } else {
                const updatePayload: any = {
                    title_ar: values.title_ar,
                    title_en: values.title_en,
                    description_ar: values.description_ar,
                    description_en: values.description_en,
                    rankId: values.rankId,
                    keywords: Array.isArray(values.keywords) ? values.keywords : [],
                };
                if (values.categoryId) updatePayload.categoryId = values.categoryId;
                if (values.price !== undefined && values.price !== '') updatePayload.price = Number(values.price);

                updateCourse({ id: course.id, data: updatePayload }, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['courses'] });
                        onClose();
                    }
                });
            }
        } else {
            const formData = new FormData();
            formData.append('title_ar', values.title_ar);
            formData.append('title_en', values.title_en);
            formData.append('description_ar', values.description_ar);
            formData.append('description_en', values.description_en);
            formData.append('rankId', values.rankId);

            if (values.categoryId) formData.append('categoryId', values.categoryId);
            if (values.price !== undefined && values.price !== '') formData.append('price', String(values.price));
            appendKeywords(formData, values.keywords);
            if (hasNewImage) formData.append('image', fileList[0].originFileObj);

            createCourse(formData, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                    reset();
                    setFileList([]);
                }
            });
        }
    };

    const handleUploadChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Course' : 'Create New Course'}</h3>
                        <p className="text-xs font-medium text-gray-400">
                            {isEditMode ? 'Modify existing course details and bilingual fields' : 'Add a new academic course with bilingual support'}
                        </p>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={680}
            className="premium-modal"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4 text-start">
                {/* Titles Section (Bilingual) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Globe size={14} className="text-indigo-500" /> Title (Arabic) / العنوان (بالعربية)
                        </label>
                        <input
                            {...register('title_ar')}
                            dir="rtl"
                            placeholder="مثال: مقدمة في الجبر"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.title_ar && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title_ar.message}</p>}
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <BookOpen size={14} className="text-indigo-500" /> Title (English)
                        </label>
                        <input
                            {...register('title_en')}
                            dir="ltr"
                            placeholder="e.g. Introduction to Algebra"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.title_en && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title_en.message}</p>}
                    </div>
                </div>

                {/* Descriptions Section (Bilingual) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <AlignLeft size={14} className="text-indigo-500" /> Description (Arabic) / الوصف (بالعربية)
                        </label>
                        <textarea
                            {...register('description_ar')}
                            dir="rtl"
                            placeholder="اكتب وصفاً شاملاً للكورس بالعربية..."
                            rows={3}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-sm"
                        />
                        {errors.description_ar && <p className="text-red-500 text-xs mt-1 font-bold">{errors.description_ar.message}</p>}
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <AlignLeft size={14} className="text-indigo-500" /> Description (English)
                        </label>
                        <textarea
                            {...register('description_en')}
                            dir="ltr"
                            placeholder="Enter a comprehensive description in English..."
                            rows={3}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-sm"
                        />
                        {errors.description_en && <p className="text-red-500 text-xs mt-1 font-bold">{errors.description_en.message}</p>}
                    </div>
                </div>

                {/* Classification & Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Trophy size={14} className="text-indigo-500" /> Academic Rank
                        </label>
                        <Controller
                            name="rankId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    placeholder="Select rank"
                                    loading={ranksLoading}
                                    className="w-full h-11 rounded-xl"
                                    options={ranksData?.data?.items?.map((rank: any) => ({
                                        label: (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rank.color }}></div>
                                                <span>{rank.name}</span>
                                            </div>
                                        ),
                                        value: rank.id
                                    }))}
                                />
                            )}
                        />
                        {errors.rankId && <p className="text-red-500 text-xs mt-1 font-bold">{errors.rankId.message}</p>}
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Tag size={14} className="text-indigo-500" /> Category
                        </label>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    allowClear
                                    placeholder="Select category"
                                    loading={categoriesLoading}
                                    className="w-full h-11 rounded-xl"
                                    options={categoriesData?.categories?.map((cat: any) => ({
                                        label: cat.name_ar || cat.name,
                                        value: cat.id,
                                    }))}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <DollarSign size={14} className="text-indigo-500" /> Price
                        </label>
                        <input
                            type="number"
                            min={0}
                            {...register('price')}
                            placeholder="e.g. 100"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Keywords / Tags */}
                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                        <Hash size={14} className="text-indigo-500" /> Keywords / الكلمات المفتاحية
                    </label>
                    <Controller
                        name="keywords"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                mode="tags"
                                placeholder="Type keywords and press Enter (e.g. متوسط, algebra, رياضيات)"
                                className="w-full min-h-[44px] rounded-xl"
                                tokenSeparators={[',']}
                                options={[]}
                            />
                        )}
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                        <ImageIcon size={14} className="text-indigo-500" /> Course Image
                    </label>
                    <Upload.Dragger
                        listType="picture"
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        maxCount={1}
                        className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-400 transition-all overflow-hidden"
                    >
                        {fileList.length < 1 ? (
                            <div className="py-4">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-2">
                                    <UploadIcon size={20} className="text-indigo-500" />
                                </div>
                                <p className="text-sm font-bold text-gray-700 mb-0.5">Click or drag image to upload</p>
                                <p className="text-[10px] text-gray-400 font-medium">PNG, JPG or JPEG up to 5MB</p>
                            </div>
                        ) : null}
                    </Upload.Dragger>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Button
                        onClick={onClose}
                        className="h-11 px-6 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isCreating || isUpdating}
                        className="h-11 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-100"
                    >
                        {isEditMode ? 'Update Course' : 'Create Course'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
