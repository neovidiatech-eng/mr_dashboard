import { Modal, Button, InputNumber } from 'antd';
import { useCreateLecture, useUpdateLecture } from '../../../hooks/useLectures';
import { useQueryClient } from '@tanstack/react-query';
import { Video, AlignLeft, Type, Hash, Presentation, Globe } from 'lucide-react';
import { useEffect } from 'react';
import { Lecture } from '../../../types/lectures';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLectureSchema, LectureFormData } from '../../../lib/schemas/LectureSchema';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AddLectureModalProps {
    visible: boolean;
    onClose: () => void;
    courseId: string;
    lecture?: Lecture;
}

export default function AddLectureModal({ visible, onClose, courseId, lecture }: AddLectureModalProps) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const { mutate: createLecture, isPending: isCreating } = useCreateLecture();
    const { mutate: updateLecture, isPending: isUpdating } = useUpdateLecture();

    const isEditMode = !!lecture;

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<LectureFormData>({
        resolver: zodResolver(getLectureSchema(t)) as any,
        defaultValues: {
            title_ar: '',
            title_en: '',
            content_ar: '',
            content_en: '',
            videoUrl: '',
            pdfUrl: '',
            slidesUrl: '',
            order: 1,
            courseId: courseId,
        }
    });

    useEffect(() => {
        if (visible) {
            if (lecture) {
                reset({
                    title_ar: lecture.title_ar || lecture.title || '',
                    title_en: lecture.title_en || lecture.title || '',
                    content_ar: lecture.content_ar || lecture.content || '',
                    content_en: lecture.content_en || lecture.content || '',
                    videoUrl: lecture.videoUrl || '',
                    pdfUrl: lecture.pdfUrl || '',
                    slidesUrl: lecture.slidesUrl || '',
                    order: lecture.order || 1,
                    courseId: courseId,
                });
            } else {
                reset({
                    title_ar: '',
                    title_en: '',
                    content_ar: '',
                    content_en: '',
                    videoUrl: '',
                    pdfUrl: '',
                    slidesUrl: '',
                    order: 1,
                    courseId: courseId,
                });
            }
        }
    }, [visible, lecture, courseId, reset]);

    const onSubmit = (values: LectureFormData) => {
        const payload: any = {
            courseId,
            title_ar: values.title_ar,
            title_en: values.title_en,
            content_ar: values.content_ar || '',
            content_en: values.content_en || '',
            order: values.order,
        };

        if (values.videoUrl) payload.videoUrl = values.videoUrl;
        if (values.pdfUrl) payload.pdfUrl = values.pdfUrl;
        if (values.slidesUrl) payload.slidesUrl = values.slidesUrl;

        if (isEditMode && lecture) {
            updateLecture({ id: lecture.id, data: payload }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                }
            });
        } else {
            createLecture(payload, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    onClose();
                    reset();
                }
            });
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Video size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{isEditMode ? t('editLecture') : t('addNewLectureModal')}</h3>
                        <p className="text-xs font-medium text-gray-400">
                            {isEditMode ? t('editLectureDesc') : t('addNewLectureDesc')}
                        </p>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={640}
            className="premium-modal"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4 text-start">
                {/* Titles Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Globe size={14} className="text-indigo-500" /> {t('titleArLabel')}
                        </label>
                        <input
                            {...register('title_ar')}
                            dir="rtl"
                            placeholder={t('lectureTitleArPlaceholder')}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.title_ar && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title_ar.message}</p>}
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Type size={14} className="text-indigo-500" /> {t('titleEnLabel')}
                        </label>
                        <input
                            {...register('title_en')}
                            dir="ltr"
                            placeholder={t('lectureTitleEnPlaceholder')}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.title_en && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title_en.message}</p>}
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <AlignLeft size={14} className="text-indigo-500" /> {t('contentArLabel')}
                        </label>
                        <textarea
                            {...register('content_ar')}
                            dir="rtl"
                            placeholder={t('contentArPlaceholder')}
                            rows={3}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-sm"
                        />
                        {errors.content_ar && <p className="text-red-500 text-xs mt-1 font-bold">{errors.content_ar.message}</p>}
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <AlignLeft size={14} className="text-indigo-500" /> {t('contentEnLabel')}
                        </label>
                        <textarea
                            {...register('content_en')}
                            dir="ltr"
                            placeholder={t('contentEnPlaceholder')}
                            rows={3}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-sm"
                        />
                        {errors.content_en && <p className="text-red-500 text-xs mt-1 font-bold">{errors.content_en.message}</p>}
                    </div>
                </div>

                {/* Video URL & Order */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Video size={14} className="text-indigo-500" /> {t('videoUrl')}
                        </label>
                        <input
                            {...register('videoUrl')}
                            placeholder="https://youtube.com/watch?v=xxxx"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.videoUrl && <p className="text-red-500 text-xs mt-1 font-bold">{errors.videoUrl.message}</p>}
                    </div>
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Hash size={14} className="text-indigo-500" /> {t('orderLabel')}
                        </label>
                        <Controller
                            name="order"
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    min={1}
                                    className="w-full h-11 rounded-xl border-gray-200 flex items-center"
                                />
                            )}
                        />
                        {errors.order && <p className="text-red-500 text-xs mt-1 font-bold">{errors.order.message}</p>}
                    </div>
                </div>

                {/* PDF & Slides URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Type size={14} className="text-indigo-500" /> {t('pdfUrl')}
                        </label>
                        <input
                            {...register('pdfUrl')}
                            placeholder="https://example.com/lesson1.pdf"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.pdfUrl && <p className="text-red-500 text-xs mt-1 font-bold">{errors.pdfUrl.message}</p>}
                    </div>
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Presentation size={14} className="text-indigo-500" /> {t('slidesUrl')}
                        </label>
                        <input
                            {...register('slidesUrl')}
                            placeholder="https://example.com/lesson1.pptx"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.slidesUrl && <p className="text-red-500 text-xs mt-1 font-bold">{errors.slidesUrl.message}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Button
                        onClick={onClose}
                        className="h-11 px-6 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                        {t('cancelBtn')}
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isCreating || isUpdating}
                        className="h-11 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-100"
                    >
                        {isEditMode ? t('updateLectureBtn') : t('addLectureBtn')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
