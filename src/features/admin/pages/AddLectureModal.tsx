import { Modal, Button, InputNumber } from 'antd';
import { useCreateLecture, useUpdateLecture } from '../../../hooks/useLectures';
import { useQueryClient } from '@tanstack/react-query';
import { Video, AlignLeft, Type, Hash, Presentation } from 'lucide-react';
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
        resolver: zodResolver(getLectureSchema(t)),
        defaultValues: {
            title: '',
            content: '',
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
                    title: lecture.title,
                    content: lecture.content,
                    videoUrl: lecture.videoUrl || '',
                    pdfUrl: lecture.pdfUrl || '',
                    order: lecture.order,
                    courseId: courseId,
                });
            } else {
                reset({
                    title: '',
                    content: '',
                    videoUrl: '',
                    pdfUrl: '',
                    order: 1,
                    courseId: courseId,
                });
            }
        }
    }, [visible, lecture, courseId, reset]);

    const onSubmit = (values: LectureFormData) => {
        const payload = { ...values, courseId };

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
                <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Video size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Lecture' : 'Add New Lecture'}</h3>
                        <p className="text-xs font-medium text-gray-400">
                            {isEditMode ? 'Update existing lecture content' : 'Add a new lecture to this course curriculum'}
                        </p>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={520}
            className="premium-modal"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 text-start">
                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <Type size={14} className="text-indigo-500" /> Lecture Title
                    </label>
                    <input
                        {...register('title')}
                        placeholder="e.g. Introduction to React Hooks"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <AlignLeft size={14} className="text-indigo-500" /> Content / Description
                    </label>
                    <textarea
                        {...register('content')}
                        placeholder="Enter lecture details or transcript..."
                        rows={4}
                        className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                    />
                    {errors.content && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.content.message}</p>}
                </div>
                                <div className="grid grid-cols-2 gap-4">

                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <Type size={14} className="text-indigo-500" /> PDF URL
                    </label>
                    <input
                        {...register('pdfUrl')}
                        placeholder="e.g. https://example.com/pdf"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    {errors.pdfUrl && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.pdfUrl.message}</p>}
                </div>
                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <Presentation size={14} className="text-indigo-500" /> Slide URL
                    </label>
                    <input
                        {...register('slidesUrl')}
                        placeholder="e.g. https://example.com/pdf"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    {errors.slidesUrl && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.slidesUrl.message}</p>}
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                            <Video size={14} className="text-indigo-500" /> Video URL
                        </label>
                        <input
                            {...register('videoUrl')}
                            placeholder="YouTube, Vimeo, etc."
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        {errors.videoUrl && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.videoUrl.message}</p>}
                    </div>
                    <div>
                        <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                            <Hash size={14} className="text-indigo-500" /> Order
                        </label>
                        <Controller
                            name="order"
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    min={1}
                                    className="w-full h-12 rounded-xl border-gray-200 flex items-center"
                                />
                            )}
                        />
                        {errors.order && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.order.message}</p>}
                    </div>
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
                        {isEditMode ? 'Update Lecture' : 'Add Lecture'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
