import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Video,
  AlertCircle,
  Calendar,
  MonitorPlay,
  AlertTriangle,
  BookOpen,
  Layers,
} from 'lucide-react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  getSessionSchema,
  getMultipleSessionsSchema,
  SessionFormData,
  MultipleSessionsPayload,
  MultipleSessionsFormData,
} from '../../lib/schemas/SessionSchema';

import CustomSelect from '../ui/CustomSelect';


import { useTeacher } from '../../features/admin/hooks/useTeacher';
import { useCourses } from '../../hooks/useCourses';

import { Student } from '../../types/student';
import { Teacher, DayOfWeek } from '../../types/scheduales';
import { Course } from '../../types/courses';

import { useTranslation } from 'react-i18next';

// Sub-components
import StudentPlanCard from './add-session/StudentPlanCard';
import SchedulingSettings from './add-session/SchedulingSettings';
import PlatformSelector from './add-session/PlatformSelector';
import SessionPreview from './add-session/SessionPreview';
import ModalStyles from './add-session/ModalStyles';
import { getStudents } from '../../features/admin/services/StudentServices';
import { useQuery } from '@tanstack/react-query';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: SessionFormData | MultipleSessionsPayload) => boolean | Promise<boolean>;
}

const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function AddSessionModal({
  isOpen,
  onClose,
  onAdd,
}: AddSessionModalProps) {
  const { t, i18n } = useTranslation();

  const language = i18n.language.split('-')[0];

  const [schedulingMode, setSchedulingMode] = useState<'single' | 'batch'>(
    'batch'
  );

  // Fetch all students (no pagination limit) for select dropdown
  const { data: allStudents } = useQuery({
    queryKey: ['allStudents'],
    queryFn: async () => {
      let page = 1;
      const aggregated: any[] = [];
      while (true) {
        const response = await getStudents(page, 1000);
        const { studentsData, pagination } = response.data;
        aggregated.push(...studentsData);
        if (!pagination?.hasNextPage) break;
        page++;
      }
      return aggregated;
    },
  });
  const { data: instructors } = useTeacher({search: "", page: 1, limit: 1000});
  const { data: coursesdata } = useCourses(1, 1000);

  const singleSchema = getSessionSchema(t);
  const batchSchema = getMultipleSessionsSchema(t);

  const courses: Course[] = coursesdata?.items || [];



  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    mode: 'onBlur',
    resolver: zodResolver(
      schedulingMode === 'single' ? singleSchema : batchSchema
    ),
    defaultValues: {
      type: 'full',
      notification_Time: '10',
      studentId: '',
      teacherId: '',
      courseId: '',
      title: '',
      description: '',
      notes: '',
      platform: 'zoom',
      link: '',
      videoUrl: '',
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      duration: '60',
      monthYear: new Date().toISOString().substring(0, 7),
      selectedDays: [],
      language: language === 'ar' ? 'ar' : 'en',
    },
  });

  const watchTitle = watch('title');
  const watchCourse = watch('courseId');
  const watchStudent = watch('studentId');
  const watchType = watch('type');
  const watchStartTime = watch('startTime');
  const watchPlatform = watch('platform');

  const watchSelectedDays =
    (watch('selectedDays') as DayOfWeek[]) || [];

  useEffect(() => {
    if (!watchStartTime || !watchType) return;

    const durationMinutes = watchType === 'full' ? 60 : 30;

    setValue('duration', String(durationMinutes));

    const [hours, minutes] = watchStartTime
      .split(':')
      .map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    date.setMinutes(date.getMinutes() + durationMinutes);

    const endHours = String(date.getHours()).padStart(2, '0');

    const endMinutes = String(date.getMinutes()).padStart(2, '0');

    setValue('endTime', `${endHours}:${endMinutes}`);
  }, [watchStartTime, watchType, setValue]);

  const selectedStudentData = useMemo(() => {
    if (!watchStudent || !allStudents) return null;

    return (
      allStudents.find(
        (s: Student) => String(s.id) === String(watchStudent)
      ) || null
    );
  }, [watchStudent, allStudents]);

  const filteredCourses = useMemo(() => {
    if (!selectedStudentData?.rankId) return courses;
    return courses.filter(
      (course) => String(course.rankId) === String(selectedStudentData.rankId)
    );
  }, [courses, selectedStudentData]);

  const courseOptions = filteredCourses.map((course: Course) => ({
    value: String(course.id),
    label: course.title,
  }));

  const studentPlanInfo = useMemo(() => {
    if (!selectedStudentData) return null;

    return {
      planName: selectedStudentData.plan?.name || null,
      totalSessions: selectedStudentData.sessions || 0,
      sessionsAttended:
        selectedStudentData.sessions_attended || 0,
      sessionsRemaining:
        selectedStudentData.sessions_remaining || 0,
    };
  }, [selectedStudentData]);

  const selectedCourse = useMemo(() => {
    return (
      courses.find(
        (course: Course) =>
          String(course.id) === String(watchCourse)
      ) || null
    );
  }, [courses, watchCourse]);

  const previewSessions = useMemo(() => {
    if (schedulingMode === 'single') {
      return [
        {
          date: watch('sessionDate'),
          available: true,
        },
      ];
    }

    const sessions: {
      date: string;
      available: boolean;
    }[] = [];

    const startDateStr = watch('batchStartDate');
    const endDateStr = watch('batchEndDate');

    if (!startDateStr || !endDateStr || !watchSelectedDays.length) return sessions;

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const currentDay = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      }) as DayOfWeek;

      if (watchSelectedDays.includes(currentDay)) {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');

        sessions.push({
          date: `${y}-${m}-${d}`,
          available: true,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  }, [
    schedulingMode,
    watchSelectedDays,
    watch('batchStartDate'),
    watch('batchEndDate'),
    watch('sessionDate'),
  ]);

  const formatDateCard = (date: string) => {
    if (!date) return { month: '---', day: 0 };
    // Handle both YYYY-MM-DD and ISO strings safely
    const datePart = date.includes('T') ? date.split('T')[0] : date;
    const [year, month, day] = datePart.split('-').map(Number);
    const d = new Date(year, month - 1, day);

    return {
      month: d.toLocaleDateString('en-US', {
        month: 'short',
      }),
      day: d.getDate(),
    };
  };

  const onSubmit = async (data: any) => {
    let isSuccess: boolean;
    if (schedulingMode === 'single') {
      isSuccess = await onAdd(data as SessionFormData);
    } else {
      const batchData: MultipleSessionsPayload = {
        formData: data as MultipleSessionsFormData,
        selectedDays: watchSelectedDays,
        sessions: previewSessions.map((session) => ({
          date: session.date,
          day: new Date(session.date + 'T00:00:00').toLocaleDateString(
            'en-US',
            {
              weekday: 'long',
            }
          ) as DayOfWeek,
          time: data.startTime,
        })),
      };

      isSuccess = await onAdd(batchData);
    }

    if (isSuccess) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] max-h-[92vh] overflow-hidden bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Create New Session
              </h2>

              <p className="text-sm text-gray-400">
                Configure and schedule sessions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row overflow-hidden"
        >

          {/* LEFT */}
          <div className="w-full lg:w-[58%] p-8 overflow-y-auto custom-scrollbar">

            {/* Student + Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              {/* Student */}
              <div>
                <label className="label">
                  <Search className="w-3.5 h-3.5" />
                  Student
                </label>

                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={
                        (allStudents || []).map((student: Student) => ({
                          value: String(student.id),
                          label: student.user.name,
                        }))
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Student"
                    />
                  )}
                />

                {errors.studentId && (
                  <p className="error-text">
                    {errors.studentId.message as string}
                  </p>
                )}
              </div>

              {/* Teacher */}
              <div>
                <label className="label">
                  <Search className="w-3.5 h-3.5" />
                  Instructor
                </label>

                <Controller
                  name="teacherId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={
                        instructors?.teachers?.map(
                          (teacher: Teacher) => ({
                            value: String(teacher.id),
                            label: teacher.user.name,
                          })
                        ) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Instructor"
                    />
                  )}
                />

                {errors.teacherId && (
                  <p className="error-text">
                    {errors.teacherId.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Plan Card */}
            <StudentPlanCard studentPlanInfo={studentPlanInfo} />

            {/* Title */}
            {schedulingMode === 'single' && (
              <div className="mb-6">
                <label className="label">
                  <Video className="w-3.5 h-3.5" />
                  Session Title
                </label>


                <input
                  type="text"
                  {...register('title')}
                  placeholder="Session Title"
                  className="input"
                />

                {errors.title && (
                  <p className="error-text">
                    {errors.title.message as string}
                  </p>
                )}
              </div>
            )}


            {/* Description */}
            <div className="mb-6">
              <label className="label">
                <AlertCircle className="w-3.5 h-3.5" />
                Description
              </label>

              <textarea
                {...register('description')}
                placeholder="Description..."
                className="textarea"
              />

              {errors.description && (
                <p className="error-text">
                  {errors.description.message as string}
                </p>
              )}
            </div>

            {/* Subject + Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              {/* Subject */}
              <div>
                <label className="label">
                  <BookOpen className="w-3.5 h-3.5" />
                  course
                </label>

                <Controller
                  name="courseId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={courseOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Subject"
                    />
                  )}
                />

                {errors.courseId && (
                  <p className="error-text">
                    {errors.courseId.message as string}
                  </p>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="label">
                  <Layers className="w-3.5 h-3.5" />
                  Language
                </label>

                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'ar', label: 'Arabic' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* Notification Time */}
            <div className="mb-6">
              <label className="label">
                <AlertCircle className="w-3.5 h-3.5" />
                Notification Time
              </label>

              <Controller
                name="notification_Time"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    options={[
                      { value: '10', label: '10 Minutes before' },
                      { value: '30', label: '30 Minutes before' },
                      { value: '60', label: '60 Minutes before' },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <SchedulingSettings
              schedulingMode={schedulingMode}
              setSchedulingMode={setSchedulingMode}
              register={register}
              watchSelectedDays={watchSelectedDays}
              setValue={setValue}
              DAYS={DAYS}
              control={control}
              errors={errors}
            />

            {/* Link + Video + Slides */}
            <div className="grid grid-cols-1 gap-5 mb-6">
              {/* Link */}
              <div>
                <label className="label">
                  <MonitorPlay className="w-3.5 h-3.5" />
                  Meeting Link
                </label>

                <input
                  type="url"
                  {...register('link')}
                  placeholder="https://zoom.us/j/..."
                  className="input"
                />

                {errors.link && (
                  <p className="error-text">
                    {errors.link.message as string}
                  </p>
                )}
              </div>

              {schedulingMode === 'single' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Video URL */}
                  <div>
                    <label className="label">
                      <Video className="w-3.5 h-3.5" />
                      Video URL
                    </label>

                    <input
                      type="url"
                      {...register('videoUrl')}
                      placeholder="Recording URL..."
                      className="input"
                    />

                    {errors.videoUrl && (
                      <p className="error-text">
                        {errors.videoUrl.message as string}
                      </p>
                    )}
                  </div>

                  {/* Slides URL */}
                  <div>
                    <label className="label">
                      <Layers className="w-3.5 h-3.5" />
                      Slides URL
                    </label>

                    <input
                      type="url"
                      // {...register('slidesUrl')}
                      placeholder="Presentation URL..."
                      className="input"
                    />

                    {/* {errors.slidesUrl && (
                      <p className="error-text">
                        {errors.slidesUrl.message as string}
                      </p>
                    )} */}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="label">
                <AlertTriangle className="w-3.5 h-3.5" />
                Notes
              </label>

              <textarea
                {...register('notes')}
                placeholder="Private notes..."
                className="textarea"
              />

              {errors.notes && (
                <p className="error-text">
                  {errors.notes.message as string}
                </p>
              )}
            </div>

            <PlatformSelector
              watchPlatform={watchPlatform}
              setValue={setValue}
            />

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-4">

              <button
                type="button"
                onClick={onClose}
                className="secondary-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
              >
                {schedulingMode === 'single'
                  ? 'Create Session'
                  : 'Schedule Batch'}
              </button>
            </div>
          </div>

          <SessionPreview
            previewSessions={previewSessions}
            formatDateCard={formatDateCard}
            watchTitle={watchTitle}
            selectedCourse={selectedCourse}
            watchStartTime={watchStartTime}
          />
        </form>

        <ModalStyles />
      </div>
    </div>
  );
}
