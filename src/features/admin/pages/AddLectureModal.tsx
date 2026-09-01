import { Modal, Button, InputNumber } from 'antd';
import { useCreateLecture, useUpdateLecture } from '../../../hooks/useLectures';
import { useAddItemsToSection } from '../../../hooks/useSections';
import { createSection } from '../../../services/SectionServices';
import { useQueryClient } from '@tanstack/react-query';
import { Video, AlignLeft, Hash, Presentation, Globe, Upload, FileText, X, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Lecture } from '../../../types/lectures';
import { Section } from '../../../types/courses';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLectureSchema, LectureFormData } from '../../../lib/schemas/LectureSchema';
import { useLanguage } from '../../../contexts/LanguageContext';
import ErrorService from '../../../utils/ErrorService';

interface AddLectureModalProps {
    visible: boolean;
    onClose: () => void;
    courseId: string;
    lecture?: Lecture;
    sections?: Section[];
    defaultSectionId?: string;
}

export default function AddLectureModal({ visible, onClose, courseId, lecture, sections, defaultSectionId }: AddLectureModalProps) {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const queryClient = useQueryClient();
    const { mutateAsync: createLectureAsync, isPending: isCreating } = useCreateLecture();
    const { mutate: updateLecture, isPending: isUpdating } = useUpdateLecture();
    const { mutateAsync: addItemsToSection } = useAddItemsToSection();

    const isEditMode = !!lecture;
    const [selectedSectionId, setSelectedSectionId] = useState<string>(defaultSectionId || sections?.[0]?.id || '');

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<LectureFormData>({
        resolver: zodResolver(getLectureSchema(t)) as any,
        defaultValues: {
            title_ar: '',
            title_en: '',
            content_ar: '',
            content_en: '',
            video: null,
            pdf: null,
            slides: null,
            order: 1,
            courseId: courseId,
        }
    });

    const pdfFile = watch('pdf');
    const slizesFile = watch('slides');

    useEffect(() => {
        if (visible) {
            if (defaultSectionId) {
                setSelectedSectionId(defaultSectionId);
            } else if (sections && sections.length > 0) {
                setSelectedSectionId(sections[0].id);
            }

            if (lecture) {
                reset({
                    title_ar: lecture.title_ar || lecture.title || '',
                    title_en: lecture.title_en || lecture.title || '',
                    content_ar: lecture.content_ar || lecture.content || '',
                    content_en: lecture.content_en || lecture.content || '',
                    video: null,
                    pdf: lecture.pdf_path || lecture.pdfUrl || null,
                    slides: lecture.slides_path || lecture.slidesUrl || null,
                    order: lecture.order || 1,
                    courseId: courseId,
                });
            } else {
                reset({
                    title_ar: '',
                    title_en: '',
                    content_ar: '',
                    content_en: '',
                    video: null,
                    pdf: null,
                    slides: null,
                    order: 1,
                    courseId: courseId,
                });
            }
        }
    }, [visible, lecture, courseId, defaultSectionId, sections, reset]);

    const onSubmit = async (values: LectureFormData) => {
        const payload: any = {
            courseId,
            title_ar: values.title_ar,
            title_en: values.title_en,
            content_ar: values.content_ar || '',
            content_en: values.content_en || '',
            order: values.order,
        };

        if (values.pdf) payload.pdf = values.pdf;
        if (values.slides) payload.slides = values.slides;

        const isValidUUID = (id?: string) =>
            !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let targetSecId = selectedSectionId;
        if ((!targetSecId || !isValidUUID(targetSecId)) && courseId) {
            try {
                const newSec = await createSection({
                    course_id: courseId,
                    name_ar: 'محتوى الكورس',
                    name_en: 'Course Content',
                });
                targetSecId = newSec.id;
            } catch (secErr) {
                console.error('Failed auto-creating section for lecture', secErr);
            }
        }
        if (values.video && values.video.length > 0) payload.video = values.video[0];

        if (isEditMode && lecture) {
            updateLecture({ id: lecture.id, data: payload }, {
                onSuccess: async () => {
                    if (courseId) {
                        queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
                        queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
                    }
                    queryClient.invalidateQueries({ queryKey: ['sections'] });
                    queryClient.invalidateQueries({ queryKey: ['courses'] });
                    queryClient.invalidateQueries({ queryKey: ['lectures'] });
                    onClose();
                }
            });
        } else {
            try {
                const res: any = await createLectureAsync(payload);
                const createdLectureId = res?.id || res?.data?.id;

                if (createdLectureId && targetSecId && isValidUUID(targetSecId)) {
                    try {
                        await addItemsToSection({
                            sectionId: targetSecId,
                            items: [{ item_id: createdLectureId, item_type: 'LECTURE', order: values.order }],
                            courseId,
                        });
                    } catch (err) {
                        console.error('Failed linking lecture to section', err);
                    }
                }
                queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
                queryClient.invalidateQueries({ queryKey: ['sections'] });
                queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
                queryClient.invalidateQueries({ queryKey: ['courses'] });
                onClose();
                reset();
            } catch (err: any) {
                console.error('Failed creating lecture', err);
                ErrorService.error(
                    err?.response?.data?.message || (isAr ? 'حدث خطأ أثناء إضافة المحاضرة' : 'Failed to create lecture')
                );
            }
        }
    };

    return (
        <Modal
            title={<span className="text-lg font-bold text-gray-800">{isEditMode ? t('editLectureTitle') : t('addLectureTitle')}</span>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={720}
            className="custom-modal"
            centered
        >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                    <div className="p-2 bg-indigo-500 rounded-xl text-white">
                        <Layers size={18} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 block mb-0.5 uppercase tracking-wider">{t('targetSection')}</label>
                        <select
                            value={selectedSectionId}
                            onChange={(e) => setSelectedSectionId(e.target.value)}
                            className="bg-transparent font-bold text-gray-800 text-sm focus:outline-none w-full"
                        >
                            {sections?.map((sec) => (
                                <option key={sec.id} value={sec.id}>
                                    {isAr ? sec.name_ar : sec.name_en || sec.name_ar}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Globe size={14} className="text-indigo-500" /> {t('titleArLabel')}
                        </label>
                        <input
                            {...register('title_ar')}
                            placeholder={t('titleArPlaceholder')}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.title_ar && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title_ar.message}</p>}
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Globe size={14} className="text-indigo-500" /> {t('titleEnLabel')}
                        </label>
                        <input
                            {...register('title_en')}
                            dir="ltr"
                            placeholder={t('titleEnPlaceholder')}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.title_en && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title_en.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <AlignLeft size={14} className="text-indigo-500" /> {t('contentArLabel')}
                        </label>
                        <textarea
                            {...register('content_ar')}
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
                            placeholder={t('contentEnPlaceholder')}
                            rows={3}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-sm"
                        />
                        {errors.content_en && <p className="text-red-500 text-xs mt-1 font-bold">{errors.content_en.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Video size={14} className="text-indigo-500" /> {t('video')}
                        </label>
                        <input
                            type="file"
                            accept="video/*"
                            {...register('video')}
                            className="w-full h-11 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                        {errors.video && <p className="text-red-500 text-xs mt-1 font-bold">{errors.video.message as string}</p>}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <FileText size={14} className="text-indigo-500" /> {t('pdf')}
                        </label>
                        {!pdfFile ? (
                            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-indigo-50/20 transition-all group">
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setValue('pdf', file, { shouldValidate: true });
                                    }}
                                />
                                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-indigo-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm mb-2 transition-all">
                                    <Upload size={18} />
                                </div>
                                <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600">{t('uploadPdf')}</span>
                            </label>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl">
                                <div className="truncate text-xs font-bold text-gray-800">
                                    {typeof pdfFile === 'string' ? pdfFile.split('/').pop() : pdfFile.name}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setValue('pdf', null, { shouldValidate: true })}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        {errors.pdf && <p className="text-red-500 text-xs mt-1 font-bold">{errors.pdf.message as string}</p>}
                    </div>

                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-1.5 text-sm">
                            <Presentation size={14} className="text-indigo-500" /> {t('slides')}
                        </label>
                        {!slizesFile ? (
                            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-indigo-50/20 transition-all group">
                                <input
                                    type="file"
                                    accept=".ppt,.pptx,.pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setValue('slides', file, { shouldValidate: true });
                                    }}
                                />
                                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-indigo-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm mb-2 transition-all">
                                    <Upload size={18} />
                                </div>
                                <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600">{t('uploadSlides')}</span>
                            </label>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl">
                                <div className="truncate text-xs font-bold text-gray-800">
                                    {typeof slizesFile === 'string' ? slizesFile.split('/').pop() : slizesFile.name}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setValue('slides', null, { shouldValidate: true })}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        {errors.slides && <p className="text-red-500 text-xs mt-1 font-bold">{errors.slides.message as string}</p>}
                    </div>
                </div>

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

