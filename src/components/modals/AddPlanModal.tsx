import { X, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlanFormData, getPlanSchema } from '../../lib/schemas/PlanSchema';
import { Resolver, useForm, Controller } from 'react-hook-form';
import CustomSelect from '../ui/CustomSelect';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Currency } from '../../types/currency';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PlanFormData & { id?: string }) => boolean | Promise<boolean>;
  initialData?: (PlanFormData & { id: string }) | null;
  currencies: Currency[];
}

export default function AddPlanModal({ isOpen, onClose, onSave, initialData, currencies }: AddPlanModalProps) {
  const { language, t } = useLanguage();

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<PlanFormData>({
    resolver: zodResolver(getPlanSchema(t)) as Resolver<PlanFormData>,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currencyId: '',
      duration: 1,
      sessionsCount: 0,
      sessionTime: 60,
      type: 'quarterly',
      features: [''],
      status: 'active',
    },
  });

  const features = watch('features');
  
  const addFeature = () => {
    setValue('features', [...features, '']);
  };

  const removeFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    setValue('features', updated.length > 0 ? updated : ['']);
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setValue('features', updated);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          currencyId: currencies.find(c => c.default)?.id || currencies[0]?.id || '',
          duration: 1,
          sessionsCount: 0,
          sessionTime: 60,
          type: 'quarterly',
          features: [''],
          status: 'active',
        });
      }
    }
  }, [initialData, reset, isOpen, currencies]);

  const onSubmit = async (data: PlanFormData) => {
    const isSuccess = await onSave({
      ...data,
      id: initialData?.id
    });
    if (isSuccess) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-6 h-6 text-indigo-600" />
              <span>{initialData ? t('editPlan') : t('addPlan')}</span>
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Subscription Package</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="p-8">
            <div className="space-y-8 text-start" dir={language === "ar" ? "rtl" : "ltr"}>
              
              {/* Identity Section */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Plan Identity</h3>
                
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                    Name
                  </label>
                  <input 
                    {...register('name')} 
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                    placeholder="Plan Name"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea 
                    {...register('description')} 
                    rows={3} 
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none" 
                    placeholder="Short description of this plan..."
                  />
                  {errors.description && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.description.message}</p>}
                </div>
              </div>

              {/* Pricing & Structure */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Pricing & Structure</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Price
                    </label>
                    <input 
                      type="number"
                      {...register('price', { valueAsNumber: true })} 
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                    />
                    {errors.price && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Currency
                    </label>
                    <Controller
                      name="currencyId"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          {...field}
                          options={currencies.map((curr) => ({
                            value: curr.id,
                            label: `${curr.code} - ${language === 'ar' ? curr.name_ar : curr.name_en}`
                          }))}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Duration (Months)
                    </label>
                    <input 
                      type="number"
                      {...register('duration', { valueAsNumber: true })} 
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                    />
                    {errors.duration && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.duration.message}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Sessions Count
                    </label>
                    <input 
                      type="number"
                      {...register('sessionsCount', { valueAsNumber: true })} 
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                    />
                    {errors.sessionsCount && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.sessionsCount.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Session Time (Minutes)
                    </label>
                    <input 
                      type="number"
                      {...register('sessionTime', { valueAsNumber: true })} 
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                    />
                    {errors.sessionTime && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.sessionTime.message}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Plan Type
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          {...field}
                          options={[
                            { value: 'quarterly',    label: language === 'ar' ? 'ربع سنوي'   : 'Quarterly'    },
                            { value: 'halfAnnually', label: language === 'ar' ? 'نصف سنوي'   : 'Half-Annually' },
                            { value: 'annually',     label: language === 'ar' ? 'سنوي'       : 'Annually'     },
                          ]}
                        />
                      )}
                    />
                    {errors.type && <p className="text-red-500 text-[10px] font-black mt-2 ml-1 uppercase">{errors.type.message}</p>}
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Features & Benefits</h3>
                  <button 
                    type="button" 
                    onClick={addFeature}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('addFeature')}
                  </button>
                </div>

                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="group flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
                      <div className="flex-1">
                        <input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Ex: 24/7 Support"
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 px-3 py-1.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        disabled={features.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration Section */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-slate-50 rounded-2xl px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">Plan Status</p>
                    </div>
                  </div>

                  <div>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          {...field}
                          options={[
                            { value: 'active', label: t('active') },
                            { value: 'inactive', label: t('inactive') }
                          ]}
                        />
                      )}
                    />
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
            form="plan-form"
            type="submit"
            className="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
