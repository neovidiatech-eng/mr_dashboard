import { useState, useEffect } from 'react';
import { X, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { StudentFormData, getStudentSchema } from '../../lib/schemas/StudentSchema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlans } from '../../features/admin/hooks/usePlans';
import { useGetRanks } from '../../features/admin/hooks/useRank';
import { useCourses } from '../../hooks/useCourses';
import { FaBuilding, FaComputer, FaPerson, FaPersonDress } from "react-icons/fa6";



interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentFormData) => boolean | Promise<boolean>;
}

export default function AddStudentModal({ isOpen, onClose, onSubmit }: AddStudentModalProps) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { data: plansData } = usePlans();
  const { data: ranksResponse } = useGetRanks();
  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(getStudentSchema(t)) as any,
    defaultValues: {
      phone_code: '+20',
      status: 'approved',
      gender: 'male',
      type: 'online',
      country: 'Egypt',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  });

  const rankIdValue = watch('rankId');
  const { data: coursesData } = useCourses(1, 20, rankIdValue);
  const startingCourseIdValue = watch('startingCourseId');

  const onFormSubmit = async (data: StudentFormData) => {
    const isSuccess = await onSubmit(data);
    if (isSuccess) {
      reset();
      onClose();
    }
  };

  const ranks = ranksResponse?.data.items || [];

  // Set first rank as default once loaded
  useEffect(() => {
    if (ranks.length > 0) {
      setValue('rankId', ranks[0].id);
    }
  }, [ranks.length, setValue]);

  const nameValue = watch('name');
  const birthDateValue = watch('birthDate');

  useEffect(() => {
    if (nameValue) {
      const formattedName = nameValue.toLowerCase().replace(/\s+/g, '.');
      setValue('email', `${formattedName}@mr-mahmoud.com`, { shouldValidate: true });
    } else {
      setValue('email', '');
    }
  }, [nameValue, setValue]);

  // Auto-calculate rank based on age
  useEffect(() => {
    if (birthDateValue && ranks.length > 0) {
      const birth = new Date(birthDateValue);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      const matchingRank = ranks.find((r: any) =>
        age >= (r.ageRange?.minAge ?? 0) && age <= (r.ageRange?.maxAge ?? 100)
      );

      if (matchingRank) {
        setValue('rankId', matchingRank.id, { shouldValidate: true });
      }
    }
  }, [birthDateValue, ranks, setValue]);

  if (!isOpen) return null;

  const countryCodes = [
    { code: '+20', country: t('egypt') },
    { code: '+966', country: t('saudiArabia') },
    { code: '+971', country: t('uae') },
    { code: '+965', country: t('kuwait') },
  ];

  const plans = plansData || [];
  const planOptions = [
    { value: '', label: '' },
    ...plans.map((p: any) => ({
      value: p.id,
      label: p.name,
    }))
  ];

  const rankOptions = ranks.map((r: any) => ({
    value: r.id,
    label: r.name,
  }));

  const courses = coursesData?.items || [];
  const courseOptions = [
    { value: '', label: t('selectCourse') || 'Select Course' },
    ...courses.map((c: any) => ({
      value: c.id,
      label: c.title,
    }))
  ];

  const selectedCourse = courses.find(c => c.id === startingCourseIdValue);
  const lectures = selectedCourse?.lectures || [];
  const lectureOptions = [
    { value: '', label: t('selectLecture') || 'Select Lecture' },
    ...lectures.map((l: any) => ({
      value: l.id,
      label: l.title,
    }))
  ];

  const genderOptions = [
    { value: 'male', label: t('male'), icon: FaPerson },
    { value: 'female', label: t('female'), icon: FaPersonDress },
  ];

  const typeOptions = [
    { value: 'online', label: t('online'), icon: FaComputer },
    { value: 'onsite', label: t('onsite'), icon: FaBuilding },
  ];

  const countryOptions = [
    { value: 'egypt', label: t('egypt') },
    { value: 'saudi', label: t('saudiArabia') },
    { value: 'uae', label: t('uae') },
    { value: 'kuwait', label: t('kuwait') },
  ];

  const statusOptions = [
    { value: 'approved', label: t('active') },
    { value: 'pending', label: t('pending') },
    { value: 'rejected', label: t('rejected') },
  ];

  const countryCodeOptions = countryCodes.map((c) => ({
    value: c.code,
    searchText: `${c.country} ${c.code}`,
    label: (
      <div className="flex justify-between items-center w-full">
        <span className="font-mono">{c.code}</span>
        <span className="text-gray-500 text-xs">{c.country}</span>
      </div>
    ),
  }));

  return (
    <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#800020]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('addNewStudent')}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">{t('manageStudentsDescription')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="ex :- Mohamed"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.name ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.name.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t('email')}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={nameValue ? nameValue.toLowerCase().replace(/\s+/g, '.') : ''}
                    disabled
                    className={`w-full px-4 py-3 bg-gray-100 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-500 outline-none ring-2 ${errors.email ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 pr-24 ltr:pr-24 rtl:pl-24 cursor-not-allowed`}
                    dir="ltr"
                  />
                  <input type="hidden" {...register('email')} />
                  <span className="absolute right-4 text-gray-400 font-medium text-sm pointer-events-none select-none ltr:right-4 rtl:left-4">
                    @mr-mahmoud.com
                  </span>
                </div>
                {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="ex :- 01091536978"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.phone ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                  dir="ltr"
                />
                {errors.phone && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.phone.message}</p>}
              </div>

              <Controller
                name="phone_code"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('countryCode')}</label>
                    <CustomSelect
                      value={field.value}
                      options={countryCodeOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                    {errors.phone_code && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.phone_code.message}</p>}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <div className="text-start md:col-span-2">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('birthDate')}</label>
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                    {errors.birthDate && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.birthDate.message}</p>}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('type')}</label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <div className='grid grid-cols-2 gap-3'>
                      {typeOptions.map((option) => {
                        const isSelected = field.value === option.value;
                        return (
                          <div
                            key={option.value}
                            role="button"
                            tabIndex={0}
                            onClick={() => field.onChange(option.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                field.onChange(option.value);
                              }
                            }}
                            className={`
                              group flex cursor-pointer flex-row items-center justify-center
                              gap-2.5 rounded-xl border-2 py-2 px-2
                              transition-all duration-200 ease-out
                              hover:-translate-y-0.5 hover:shadow-md
                              focus:outline-none focus:ring-2 focus:ring-[#800020]/30
                              ${isSelected
                                ? "border-[#800020] bg-[#800020] shadow-lg shadow-[#800020]/20"
                                : "border-[#800020]/20 bg-white hover:border-[#800020]/50 hover:bg-[#800020]/5"
                              }
                            `}
                          >
                            <div
                              className={`
                                flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                                transition-colors duration-200
                                ${isSelected
                                  ? "bg-white/15"
                                  : "bg-[#800020]/10 group-hover:bg-[#800020]/15"
                                }
                              `}
                            >
                              <option.icon
                                size={16}
                                strokeWidth={2}
                                className={isSelected ? "text-white" : "text-[#800020]"}
                              />
                            </div>
                            <p
                              className={`
                                text-xs font-bold transition-colors
                                ${isSelected ? "text-white" : "text-[#800020]"}
                              `}
                            >
                              {option.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.type && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.type.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('gender')}</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div className='grid grid-cols-2 gap-3'>
                      {genderOptions.map((option) => {
                        const isSelected = field.value === option.value;
                        return (
                          <div
                            key={option.value}
                            role="button"
                            tabIndex={0}
                            onClick={() => field.onChange(option.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                field.onChange(option.value);
                              }
                            }}
                            className={`
                              group flex cursor-pointer flex-row items-center justify-center
                              gap-2.5 rounded-xl border-2 py-2 px-2
                              transition-all duration-200 ease-out
                              hover:-translate-y-0.5 hover:shadow-md
                              focus:outline-none focus:ring-2 focus:ring-[#800020]/30
                              ${isSelected
                                ? "border-[#800020] bg-[#800020] shadow-lg shadow-[#800020]/20"
                                : "border-[#800020]/20 bg-white hover:border-[#800020]/50 hover:bg-[#800020]/5"
                              }
                            `}
                          >
                            <div
                              className={`
                                flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                                transition-colors duration-200
                                ${isSelected
                                  ? "bg-white/15"
                                  : "bg-[#800020]/10 group-hover:bg-[#800020]/15"
                                }
                              `}
                            >
                              <option.icon
                                size={16}
                                strokeWidth={2}
                                className={isSelected ? "text-white" : "text-[#800020]"}
                              />
                            </div>
                            <p
                              className={`
                                text-xs font-bold transition-colors
                                ${isSelected ? "text-white" : "text-[#800020]"}
                              `}
                            >
                              {option.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.gender && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.gender.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('country')}</label>
                    <CustomSelect
                      value={field.value}
                      options={countryOptions}
                      placeholder={t('selectCountry')}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                    {errors.country && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.country.message}</p>}
                  </div>
                )}
              />
              <Controller
                name="plan"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('studyPlan')}</label>
                    <CustomSelect
                      value={field.value}
                      options={planOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                    {errors.plan && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.plan.message}</p>}
                  </div>
                )}
              />
            </div>

            <Controller
              name="rankId"
              control={control}
              render={({ field }) => (
                <div className="text-start">
                  <label className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    <span>{t('rank')}</span>
                    {birthDateValue && <span className="text-indigo-600 normal-case font-bold">{t('autoSelectedByAge')}</span>}
                  </label>
                  <CustomSelect
                    value={field.value}
                    options={rankOptions}
                    placeholder={t('selectRank')}
                    onChange={field.onChange}
                    disabled={true}
                    className="rounded-2xl border-none bg-gray-100 cursor-not-allowed opacity-80"
                  />
                  {errors.rankId && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.rankId.message}</p>}
                </div>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="startingCourseId"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('startingCourse') || 'Starting Course'}</label>
                    <CustomSelect
                      value={field.value || ''}
                      options={courseOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                    {errors.startingCourseId && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.startingCourseId.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="startingLectureId"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('startingLecture') || 'Starting Lecture'}</label>
                    <CustomSelect
                      value={field.value || ''}
                      options={lectureOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                      disabled={!startingCourseIdValue}
                    />
                    {errors.startingLectureId && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.startingLectureId.message}</p>}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-start relative">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t('password')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full pl-4 pr-12 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.password ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.password.message}</p>}
              </div>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('status')}</label>
                    <CustomSelect
                      value={field.value}
                      options={statusOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                    {errors.status && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.status.message}</p>}
                  </div>
                )}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100 bg-white/80 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] active:scale-95"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
