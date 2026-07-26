import { Eye, EyeOff, X, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UpdateProfile } from '../../types/profile';

const UpdateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional().or(z.literal('')),
  username: z.string().min(3, "Username must be at least 3 characters").optional().or(z.literal('')),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  phone_code: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  age: z.string().optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
});

type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

const emptyProfileFormData: UpdateProfileFormData = {
  name: '',
  username: '',
  password: '',
  phone: '',
  phone_code: '',
  country: '',
  age: '',
  birth_date: '',
  gender: '',
  timezone: '',
};

const toUpdateProfilePayload = (data: UpdateProfileFormData): UpdateProfile => {
  const payload: UpdateProfile = {};

  Object.entries(data).forEach(([key, value]) => {
    if (!value) return;

    if (key === 'age') {
      payload.age = Number(value);
      return;
    }

    payload[key as keyof Omit<UpdateProfile, 'age'>] = value;
  });

  return payload;
};

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProfile) => boolean | Promise<boolean>;
  initialData: UpdateProfile | null;
  isLoading?: boolean;
}

export default function UpdateProfileModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: UpdateProfileModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: { ...emptyProfileFormData, ...initialData, age: initialData?.age?.toString() || '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ ...emptyProfileFormData, ...initialData, age: initialData?.age?.toString() || '' });
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0  bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-blue-50 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Edit Profile</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">Update your personal information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 overflow-y-auto">
          <form onSubmit={handleSubmit(async (data) => {
            await onSubmit(toUpdateProfilePayload(data));
          })} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Your Name"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.name ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-blue-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.name.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  {...register('username')}
                  placeholder="Username"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.username ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-blue-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.username && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.username.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Leave empty to keep current password"
                    className={`w-full px-4 py-3 pr-12 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.password ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-blue-500/10 transition-all placeholder:text-gray-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.password.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Code
                </label>
                <input
                  type="text"
                  {...register('phone_code')}
                  placeholder="+20"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Phone
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="01012345678"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Country
                </label>
                <input
                  type="text"
                  {...register('country')}
                  placeholder="Egypt"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Age
                </label>
                <input
                  type="text"
                  {...register('age')}
                  placeholder="e.g. 25"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.age ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-blue-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.age && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.age.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Birth Date
                </label>
                <input
                  type="date"
                  {...register('birth_date')}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Timezone
                </label>
                <input
                  type="text"
                  {...register('timezone')}
                  placeholder="Africa/Cairo"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100 bg-white/80 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
