import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Check,
  Zap,
  Star,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  UserCircle,
  Globe,
  Receipt,
  Upload,
  X,
  FileCheck
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { ConfigProvider, DatePicker, Input, Select } from "antd";
import localeAr from 'antd/es/locale/ar_EG';
import localeEn from 'antd/es/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { usePlans } from "../features/admin/hooks/usePlans";
import { useGetRanks } from "../features/admin/hooks/useRank";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRegisterSchema, RegisterInput } from "../lib/schemas/RegisterSchema";
import { register as registerService } from "../services/AuthServices";
import ErrorService from "../utils/ErrorService";

interface RegisterProps {
  onRegisterSuccess: () => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { data: plansData } = usePlans();
  const { data: ranksResponse } = useGetRanks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(getRegisterSchema(t)),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      codeCountry: "+20",
      parentNumber: "",
      rankId: "",
      stageId: "",
      birth_date: "",
      gender: "",
      country: "",
      password: "",
      plan_id: "",
      image: undefined,
    },
  });


  const selectedPackage = watch("plan_id");
  const rankIdValue = watch("rankId");

  useEffect(() => {
    setValue('stageId', '');
  }, [rankIdValue, setValue]);

  const countries = [
    { value: "egypt", label: t("egypt") },
    { value: "saudi", label: t("saudiArabia") },
    { value: "uae", label: t("uae") },
    { value: "kuwait", label: t("kuwait") },
  ];

  const genders = [
    { value: "male", label: t("male") },
    { value: "female", label: t("female") },
  ];

  const ranks = ranksResponse?.data.items || [];
  const rankOptions = ranks.map((r: any) => ({
    value: r.id,
    label: r.name || (language === 'ar' ? r.name_ar : r.name_en),
  }));

  const selectedRank = ranks.find((r: any) => r.id === rankIdValue);
  const stages = selectedRank?.stages || [];
  const stageOptions = stages.map((s: any) => ({
    value: s.id,
    label: s.name,
  }));

  const countryCodes = [
    { value: "+20", label: "+20", country: language === "ar" ? "مصر" : "Egypt", countryEn: "Egypt" },
    { value: "+966", label: "+966", country: language === "ar" ? "السعودية" : "Saudi Arabia", countryEn: "Saudi Arabia" },
    { value: "+971", label: "+971", country: language === "ar" ? "الإمارات" : "UAE", countryEn: "UAE" },
    { value: "+965", label: "+965", country: language === "ar" ? "الكويت" : "Kuwait", countryEn: "Kuwait" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      setImagePreview(URL.createObjectURL(file));
      setSelectedFileName(file.name);
      setSelectedFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
    }
  };

  const handleRemoveImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setValue("image", undefined, { shouldValidate: true });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedFileName(null);
    setSelectedFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      const result = await registerService(formData);
      if (result.status === 201 || result.status === 200) {
        ErrorService.success(t("registeredSuccess"));
        sessionStorage.setItem("verify_email", data.email);
        onRegisterSuccess();
        navigate("/verify-account");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
    }
  };

return (
  <ConfigProvider
    theme={{
      token: {
        borderRadius: 16,
        colorPrimary: "#2563eb",
        colorPrimaryHover: "#1d4ed8",
        controlOutline: "rgba(37, 99, 235, 0.1)",
      },
      components: {
        Select: {
          controlHeight: 56,
          optionSelectedBg: "#eff6ff",
          colorTextPlaceholder: "#9ca3af",
        },
        Input: {
          controlHeight: 56,
        },
        DatePicker: {
          controlHeight: 56,
        },
      },
    }}
    locale={language === "ar" ? localeAr : localeEn}
    direction={language === "ar" ? "rtl" : "ltr"}
  >
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("registerNewStudent")}
        </h2>
        <p className="text-gray-500 font-medium">{t("joinAcademy")}</p>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4 py-4 px-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-bold text-blue-900">
            {t("registerDataToStart")}
          </p>
        </div>

        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {t("fullName")} *
              </label>
              <div className="relative group">
                <div className={`absolute ${language === "ar" ? "right" : "left"}-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors`}>
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  {...register("name")}
                  placeholder={language === "ar" ? "أحمد محمد" : "Ahmed Mohamed"}
                  className={`w-full ${language === "ar" ? "pr-14 pl-5" : "pl-14 pr-5"} py-4 bg-gray-50/50 border ${errors.name ? "border-red-400" : "border-gray-200"
                    } rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {t("email")} *
              </label>
              <div className="relative group">
                <div className={`absolute ${language === "ar" ? "right" : "left"}-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="admin@example.com"
                  className={`w-full ${language === "ar" ? "pr-14 pl-5" : "pl-14 pr-5"} py-4 bg-gray-50/50 border ${errors.email ? "border-red-400" : "border-gray-200"
                    } rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400`}
                  dir="ltr"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone and Country Code */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {t("phoneNumber")} *
              </label>
              <div className="flex gap-3" dir="ltr">
                <Controller
                  name="codeCountry"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={countryCodes}
                      className="w-28 shadow-sm"
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="tel"
                      prefix={<Phone className="w-4 h-4 text-gray-400" />}
                      placeholder="01069441989"
                      status={errors.phone ? "error" : ""}
                      className="flex-1 shadow-sm"
                    />
                  )}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {t("birthDate")} *
              </label>
              <Controller
                name="birth_date"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    className="w-full shadow-sm"
                    status={errors.birth_date ? "error" : ""}
                    prefix={<Calendar className="w-4 h-4 text-gray-400" />}
                    placeholder={t("selectDate")}
                    value={value ? dayjs(value) : null}
                    onChange={(date) => onChange(date ? date.format("YYYY-MM-DD") : "")}
                  />
                )}
              />
              {errors.birth_date && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.birth_date.message}
                </p>
              )}
            </div>

            {/* Parent Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {language === "ar" ? "رقم هاتف ولي الأمر" : "Parent Phone Number"} *
              </label>
              <Controller
                name="parentNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="tel"
                    prefix={<Phone className="w-4 h-4 text-gray-400" />}
                    placeholder="01069441989"
                    status={errors.parentNumber ? "error" : ""}
                    className="shadow-sm"
                  />
                )}
              />
              {errors.parentNumber && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.parentNumber.message}
                </p>
              )}
            </div>

            {/* Rank */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {language === "ar" ? "المرحلة الدراسية" : "Academic Level"} *
              </label>
              <Controller
                name="rankId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={language === "ar" ? "اختر المرحلة الدراسية" : "Select Academic Level"}
                    options={rankOptions}
                    className="w-full shadow-sm"
                    status={errors.rankId ? "error" : ""}
                    placement={language === "ar" ? "bottomRight" : "bottomLeft"}
                  />
                )}
              />
              {errors.rankId && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.rankId.message}
                </p>
              )}
            </div>

            {/* Stage */}
            {stages.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mx-1">
                  {language === "ar" ? "السنة الدراسية" : "Academic Year"} *
                </label>
                <Controller
                  name="stageId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={language === "ar" ? "اختر السنة الدراسية" : "Select Academic Year"}
                      options={stageOptions}
                      className="w-full shadow-sm"
                      status={errors.stageId ? "error" : ""}
                      placement={language === "ar" ? "bottomRight" : "bottomLeft"}
                    />
                  )}
                />
                {errors.stageId && (
                  <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                    {errors.stageId.message}
                  </p>
                )}
              </div>
            )}

            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {t("gender")} *
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={t("selectGender")}
                    suffixIcon={<UserCircle className="w-4 h-4 text-gray-400" />}
                    options={genders}
                    className="w-full shadow-sm"
                    status={errors.gender ? "error" : ""}
                    placement={language === "ar" ? "bottomRight" : "bottomLeft"}
                  />
                )}
              />
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {t("country")} *
              </label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder={t("selectCountry")}
                    suffixIcon={<Globe className="w-4 h-4 text-gray-400" />}
                    options={countries}
                    className="w-full shadow-sm"
                    status={errors.country ? "error" : ""}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                )}
              />
              {errors.country && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.country.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-bold text-gray-700 mx-1">
                {t("password")} *
              </label>
              <div className="relative group">
                <div className={`absolute ${language === "ar" ? "right-5" : "left-5"} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full ${language === "ar" ? "pr-14 pl-12" : "pl-14 pr-12"} py-4 bg-gray-50/50 border ${errors.password ? "border-red-400" : "border-gray-200"
                    } rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${language === "ar" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-all p-2 rounded-xl hover:bg-gray-100/50 flex items-center justify-center`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium mx-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Plans Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mx-1">
              <label className="text-lg font-black text-gray-900">
                {t("choosePackage")} *
              </label>
              {plansData && (
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {plansData.length} {t("plansAvailable")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {!plansData && (
                <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">{t("loadingPlans")}</p>
                </div>
              )}

              {plansData?.length === 0 && (
                <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold">{t("noPlansAvailable")}</p>
                </div>
              )}

              {plansData?.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setValue("plan_id", pkg.id, { shouldValidate: true })}
                  className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-500 text-right flex flex-col items-start h-full ${selectedPackage === pkg.id
                    ? "border-primary bg-primary/[0.02] shadow-2xl shadow-primary/10 scale-[1.02]"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50"
                    }`}
                >
                  {pkg.bestSeller && (
                    <div className="absolute -top-3 right-6 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-500/20 z-10 flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-current" />
                      {t("mostPopular")}
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedPackage === pkg.id
                      ? "bg-primary text-white rotate-6 shadow-lg shadow-primary/30"
                      : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-primary group-hover:rotate-6"
                      }`}>
                      <Zap size={28} />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${selectedPackage === pkg.id
                      ? "bg-primary border-primary"
                      : "border-gray-200"
                      }`}>
                      {selectedPackage === pkg.id && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 mb-6">
                    <h3 className={`text-xl font-black transition-colors ${selectedPackage === pkg.id ? "text-primary" : "text-gray-900"
                      }`}>
                      {pkg.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${selectedPackage === pkg.id ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}>
                        {pkg.sessionsCount} {t("sessionsCount")}
                      </span>
                    </div>
                  </div>

                  <div className="w-full pt-6 border-t border-gray-50 flex items-end gap-1">
                    <span className="text-3xl font-black text-gray-900">{pkg.price}</span>
                    <span className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{pkg.currency?.symbol || "EGP"}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.plan_id && (
              <p className="text-red-500 text-xs mt-3 font-medium mx-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" />
                {errors.plan_id.message}
              </p>
            )}
          </div>

          {/* Payment Receipt Upload Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between mx-1">
              <div className="space-y-1">
                <label className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  <span>{t("paymentReceipt")}</span>
                  <span className="text-xs font-bold text-gray-400">({t("optional")})</span>
                </label>
                <p className="text-xs text-gray-500 font-medium">
                  {t("uploadReceiptSubtitle")}
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={handleImageChange}
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center p-8 bg-gray-50/50 hover:bg-blue-50/30 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-primary transition-all duration-300 cursor-pointer text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white group-hover:bg-primary/10 shadow-sm flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                  <Upload className="w-7 h-7 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors mb-1">
                  {t("dragOrClickReceipt")}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {t("receiptFileLimits")}
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-5 bg-blue-50/30 rounded-[2rem] border-2 border-primary/20 flex flex-col sm:flex-row items-center gap-4 justify-between transition-all">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-blue-100 flex-shrink-0 shadow-sm">
                    <img
                      src={imagePreview}
                      alt="Receipt Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-1">
                      <FileCheck className="w-4 h-4 flex-shrink-0" />
                      <span>{t("receiptAttached")}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                      {selectedFileName || "receipt.jpg"}
                    </p>
                    {selectedFileSize && (
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {selectedFileSize}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold transition-colors"
                  >
                    {t("changeReceipt")}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    title={t("removeReceipt")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {errors.image && (
              <p className="text-red-500 text-xs mt-2 font-medium mx-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" />
                {errors.image.message as string}
              </p>
            )}
          </div>

          {/* Submit Section */}
          <div className="space-y-6 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-[2rem] py-5 px-8 font-bold text-lg shadow-2xl shadow-primary/20 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>{t("registerNow")}</span>
                </>
              )}
            </button>

            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <p className="text-xs font-medium text-gray-500 leading-relaxed max-w-md mx-auto">
                {t("afterRegistration")}
              </p>
            </div>

            {/* <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm font-bold uppercase tracking-wider">
                  <span className="bg-white px-4 text-gray-400">{t("or")}</span>
                </div>
              </div> */}

            {/* Google Register */}
            {/* <div className="flex justify-center pb-4">
                <div className="w-full max-w-md rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      const idToken = credentialResponse.credential;
                      if (idToken) {
                        try {
                          const result = await googleRegister({ idToken });
                          const token = result.data?.accessToken || result.accessToken;

                          if (token) {
                            localStorage.setItem("token", token);
                            onRegisterSuccess();
                            ErrorService.success(t('registeredSuccess'));
                            navigate("/login");
                          }
                        } catch (error) {
                          console.error("Google Login failed:", error);
                        }
                      }
                    }}
                    onError={() => console.log("Login Failed")}
                    useOneTap
                    theme="outline"
                    size="large"
                    shape="pill"
                    width="100%"
                  />
                </div>
              </div> */}
          </div>
        </form>
      </div>
    </div>
  </ConfigProvider>
);
}
