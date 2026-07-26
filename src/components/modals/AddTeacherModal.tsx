import { useState } from 'react';
import { X, Users, Eye, EyeOff, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import { TeacherFormData, getCreateTeacherSchema } from '../../lib/schemas/TeacherSchema';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrency } from '../../features/admin/hooks/useCurrency';
import { useMemo } from 'react';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teacherData: TeacherFormData) => boolean | Promise<boolean>;
}

export default function AddTeacherModal({ isOpen, onClose, onSubmit }: AddTeacherModalProps) {
  const { language, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { data: currenciesData } = useCurrency();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TeacherFormData>({
    resolver: zodResolver(getCreateTeacherSchema(t)) as Resolver<TeacherFormData>,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      hourlyRate: 0,
      currency: '',
      gender: 'male',
      status: 'active',
      age: 0,
    }
  });

  const currencyOptions = useMemo(() => {
    if (!currenciesData?.currencies) return [];
    return currenciesData.currencies.map(c => ({
      value: c.id,
      label: language === 'ar' ? `${c.name_ar} (${c.symbol})` : `${c.name_en} (${c.code})`
    }));
  }, [currenciesData, language]);

  const handleOnSubmit = async (data: TeacherFormData) => {
    const isSuccess = await onSubmit(data);
    if (isSuccess) {
      onClose();
      reset();
    }
  };

  if (!isOpen) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              <span>{t('addTeacher')}</span>
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Instructor Profile</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="add-teacher-form" onSubmit={handleSubmit(handleOnSubmit)} className="p-8">
            <div className="space-y-8" dir={language === "ar" ? "rtl" : "ltr"}>
              
              {/* Basic Info Section */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5" />
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      {...register('name')}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    {errors.name && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.name.message}</p>}
                  </div>

                  <div className="text-start">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5" />
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      placeholder="instructor@example.com"
                      {...register('email')}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    {errors.email && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="text-start relative">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5" />
                      {t('password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.password.message}</p>}
                  </div>

                  <div className="text-start">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      placeholder="+20 123 456 7890"
                      {...register('phone')}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.phone.message}</p>}
                  </div>

                  <div className="text-start">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      Age
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Age"
                      {...register('age', { valueAsNumber: true })}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    {errors.age && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.age.message}</p>}
                  </div>
                </div>
              </div>

              {/* Professional Details Section */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Professional Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="text-start">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      {t('currency')}
                    </label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          value={field.value}
                          options={currencyOptions}
                          onChange={field.onChange}
                          className="w-full"
                        />
                      )}
                    />
                    {errors.currency && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.currency.message}</p>}
                  </div>

                  <div className="text-start">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5" />
                      {t('hourlyRate')}
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      {...register('hourlyRate', { valueAsNumber: true })}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    {errors.hourlyRate && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.hourlyRate.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="text-start">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      {t('status')}
                    </label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          value={field.value}
                          options={[
                            { value: 'active', label: t('active') },
                            { value: 'inactive', label: t('inactive') }
                          ]}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.status && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.status.message}</p>}
                  </div>

                  <div className="text-start">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      {t('gender')}
                    </label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          value={field.value}
                          options={[
                            { value: 'male', label: language === 'ar' ? 'ذكر' : 'Male' },
                            { value: 'female', label: language === 'ar' ? 'أنثى' : 'Female' }
                          ]}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.gender && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.gender.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center gap-4 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
          >
            {t('cancel')}
          </button>
          <button
            form="add-teacher-form"
            type="submit"
            className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
          >
            {t('addTeacher')}
          </button>
        </div>
      </div>
    </div>
  );
}
