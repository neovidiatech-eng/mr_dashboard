import { Modal, Button, Upload, Select } from 'antd';
import { useCreateCourse, useUpdateCourse } from '../../../hooks/useCourses';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, AlignLeft, Trophy, Image, Upload as UploadIcon } from 'lucide-react';
import { useGetRanks } from '../hooks/useRank';
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

    const isEditMode = !!course;

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CourseFormData>({
        resolver: zodResolver(getCourseSchema(t)),
        defaultValues: {
            title: '',
            description: '',
            rankId: '',
        }
    });

    useEffect(() => {
        if (visible) {
            if (course) {
                reset({
                    title: course.title,
                    description: course.description,
                    rankId: course.rankId,
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
                    title: '',
                    description: '',
                    rankId: '',
                });
                setFileList([]);
            }
        }
    }, [visible, course, reset]);

    const onSubmit = (values: CourseFormData) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('rankId', values.rankId);

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
            width={520}
            className="premium-modal"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-start">
                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <BookOpen size={14} className="text-indigo-500" /> Course Title
                    </label>
                    <input 
                        {...register('title')}
                        placeholder="e.g. Backend Development Basics" 
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                        <AlignLeft size={14} className="text-indigo-500" /> Description
                    </label>
                    <textarea 
                        {...register('description')}
                        placeholder="Enter a comprehensive description of the course content..." 
                        rows={4} 
                        className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" 
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.description.message}</p>}
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
