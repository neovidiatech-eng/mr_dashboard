import { Modal, Button, Upload, Select } from 'antd';
import { useCreateCourse, useUpdateCourse } from '../../../hooks/useCourses';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, AlignLeft, Trophy, Image, Upload as UploadIcon, Tag, DollarSign } from 'lucide-react';
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
        resolver: zodResolver(getCourseSchema(t)),
        defaultValues: {
            title_ar: '',
            title_en: '',
            description_ar: '',
            description_en: '',
            keywords: '',
            rankId: '',
            categoryId: '',
            price: '',
        }
    });

    useEffect(() => {
        if (visible) {
            if (course) {
                reset({
                    title_ar: course.title_ar || course.title || '',
                    title_en: course.title_en || '',
                    description_ar: course.description_ar || course.description || '',
                    description_en: course.description_en || '',
                    keywords: Array.isArray(course.keywords) ? course.keywords.join(', ') : (course.keywords || ''),
                    rankId: course.rankId,
                    categoryId: course.categoryId || '',
                    price: course.price !== undefined && course.price !== null ? String(course.price) : '',
                });
                if (course.image) {
                    setFileList([{
                        uid: '-1',
                        name: course.image,
                        status: 'done',
                        url: `https://agro-plus.net/uploads/${course.image}`,
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
                    keywords: '',
                    rankId: '',
                    categoryId: '',
                    price: '',
                });
                setFileList([]);
            }
        }
    }, [visible, course, reset]);

    const onSubmit = (values: CourseFormData) => {
        const formData = new FormData();
        formData.append('title_ar', values.title_ar);
        if (values.title_en) formData.append('title_en', values.title_en);
        formData.append('title', values.title_ar); // fallback

        if (values.description_ar) formData.append('description_ar', values.description_ar);
        if (values.description_en) formData.append('description_en', values.description_en);
        formData.append('description', values.description_ar || ''); // fallback

        if (values.keywords) {
            const kwArray = typeof values.keywords === 'string'
                ? values.keywords.split(',').map(k => k.trim()).filter(Boolean)
                : values.keywords;
            kwArray.forEach((kw: string) => formData.append('keywords[]', kw));
        }

        formData.append('rankId', values.rankId);

        if (values.categoryId) {
            formData.append('categoryId', values.categoryId);
        }
        if (values.price !== undefined && values.price !== '') {
            formData.append('price', String(values.price));
        }

        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('image', fileList[0].originFileObj);
        }

        if (isEditMode) {
            updateCourse({ id: course.id, data: formData as any }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                }
            });
        } else {
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
                <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Course' : 'Create New Course'}</h3>
                        <p className="text-xs font-medium text-gray-400">
                            {isEditMode ? 'Modify existing course details' : 'Add a new academic course to the curriculum shelf'}
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
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-start max-h-[75vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                            <BookOpen size={14} className="text-indigo-500" /> Title (Arabic) *
                        </label>
                        <input 
                            {...register('title_ar')}
                            placeholder="مثال: مقدمة في الجبر" 
                            dir="rtl"
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                        />
                        {errors.title_ar && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.title_ar.message}</p>}
                    </div>
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                            <BookOpen size={14} className="text-indigo-500" /> Title (English)
                        </label>
                        <input 
                            {...register('title_en')}
                            placeholder="e.g. Introduction to Algebra" 
                            dir="ltr"
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                            <AlignLeft size={14} className="text-indigo-500" /> Description (Arabic)
                        </label>
                        <textarea 
                            {...register('description_ar')}
                            placeholder="أدخل وصف الكورس بالعربية..." 
                            rows={3} 
                            dir="rtl"
                            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" 
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                            <AlignLeft size={14} className="text-indigo-500" /> Description (English)
                        </label>
                        <textarea 
                            {...register('description_en')}
                            placeholder="Enter course description in English..." 
                            rows={3} 
                            dir="ltr"
                            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" 
                        />
                    </div>
                </div>

                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <Tag size={14} className="text-indigo-500" /> Keywords (comma-separated)
                    </label>
                    <input
                        {...register('keywords')}
                        placeholder="e.g. algebra, math, secondary, رياضيات"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>

                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <Trophy size={14} className="text-indigo-500" /> Academic Rank
                    </label>
                    <Controller
                        name="rankId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                placeholder="Select appropriate rank"
                                loading={ranksLoading}
                                className="w-full h-12 rounded-xl"
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
                    {errors.rankId && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.rankId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                            <Tag size={14} className="text-indigo-500" /> Category
                        </label>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    allowClear
                                    placeholder="Select category (optional)"
                                    loading={categoriesLoading}
                                    className="w-full h-12 rounded-xl"
                                    options={categoriesData?.categories?.map((cat: any) => ({
                                        label: cat.name_ar,
                                        value: cat.id,
                                    }))}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                            <DollarSign size={14} className="text-indigo-500" /> Price
                        </label>
                        <input
                            type="number"
                            min={0}
                            {...register('price')}
                            placeholder="Leave empty if included in plans"
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <Image size={14} className="text-indigo-500" /> Course Image
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
                            <div className="py-6">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <UploadIcon size={24} className="text-indigo-500" />
                                </div>
                                <p className="text-sm font-bold text-gray-700 mb-1">Click or drag image to upload</p>
                                <p className="text-[10px] text-gray-400 font-medium">PNG, JPG or JPEG up to 5MB</p>
                            </div>
                        ) : null}
                    </Upload.Dragger>
                </div>

                <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-gray-50">
                    <Button 
                        onClick={onClose} 
                        className="h-12 px-6 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isCreating || isUpdating}
                        className="h-12 px-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-100"
                    >
                        {isEditMode ? 'Update Course' : 'Create Course'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
