import { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import { Send, Users, Search, Check, X, ChevronDown, User } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "../../contexts/LanguageContext";
import { useStudents } from "../../features/admin/hooks/useStudents";
import {
  getNotificationSchema,
  NotificationFormData,
} from "../../lib/schemas/NotificationSchema";
import { CreateNotification } from "../../types/notification";

interface AddNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNotification) => void;
  isLoading?: boolean;
}

export default function AddNotificationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddNotificationModalProps) {
  const { language, t } = useLanguage();
  const isAr = language === "ar";

  // Fetch students
  const { data: studentsResponse, isLoading: isLoadingStudents } = useStudents(1, 1000);
  const students = studentsResponse?.data?.studentsData || [];

  // Students select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(getNotificationSchema(t)) as Resolver<NotificationFormData>,
    defaultValues: {
      title_ar: "",
      title_en: "",
      message_ar: "",
      message_en: "",
      type: "",
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        title_ar: "",
        title_en: "",
        message_ar: "",
        message_en: "",
        type: "",
      });
      setSelectedIds([]);
      setIsSelectOpen(false);
      setSearchQuery("");
    }
  }, [isOpen, reset]);

  // Handle student toggle
  const toggleStudent = (targetUserId: string) => {
    if (selectedIds.includes(targetUserId)) {
      setSelectedIds(selectedIds.filter((id) => id !== targetUserId));
    } else {
      setSelectedIds([...selectedIds, targetUserId]);
    }
  };

  // Handle Select All (Broadcast)
  const handleSelectAll = () => {
    setSelectedIds([]);
    setIsSelectOpen(false);
  };

  // Filter students based on search
  const filteredStudents = students.filter((s) => {
    const name = s.user?.name?.toLowerCase() || "";
    const phone = s.user?.phone || "";
    const email = s.user?.email?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || phone.includes(q) || email.includes(q);
  });

  const onFormSubmit = (data: NotificationFormData) => {
    const payload: CreateNotification = {
      title_ar: data.title_ar,
      title_en: data.title_en,
      message_ar: data.message_ar,
      message_en: data.message_en,
      type: data.type,
    };

    if (selectedIds.length === 1) {
      payload.userId = selectedIds[0];
    } else if (selectedIds.length > 1) {
      payload.userIds = selectedIds;
    } else {
      // Broadcast to all: send list of all student IDs to satisfy backend validation
      const allStudentUserIds = Array.from(
        new Set(
          students
            .map((s) => s.user_id || s.user?.id || s.id)
            .filter((id): id is string => Boolean(id))
        )
      );

      if (allStudentUserIds.length === 1) {
        payload.userId = allStudentUserIds[0];
      } else if (allStudentUserIds.length > 1) {
        payload.userIds = allStudentUserIds;
      }
    }

    onSubmit(payload);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={580}
      centered
    >
      <div className="p-2 md:p-4 space-y-6" dir={isAr ? "rtl" : "ltr"}>
        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {isAr ? "بث إشعار فوري جديد" : "Broadcast New Notification"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isAr
                ? "إرسال إشعارات فورية تظهر على تطبيقات وموقع الطلاب والمعلمين"
                : "Push instant notification to web & mobile apps"}
            </p>
          </div>
        </div>

        {/* Form Column */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Custom Student Select Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? "المستلمون / الطلاب المستهدفون" : "Target Recipients / Students"}
            </label>

            {/* Select Trigger Box */}
            <div
              onClick={() => setIsSelectOpen((prev) => !prev)}
              className="min-h-[48px] px-3.5 py-2 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-2 cursor-pointer hover:border-slate-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all select-none"
            >
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {selectedIds.length === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100">
                    <Users className="w-3.5 h-3.5" />
                    <span>{isAr ? "جميع الطلاب (بث عام للكل)" : "All Students (Broadcast to All)"}</span>
                  </span>
                ) : (
                  selectedIds.map((id) => {
                    const student = students.find(
                      (s) => (s.user_id || s.user?.id || s.id) === id
                    );
                    const name = student?.user?.name || student?.user?.phone || (isAr ? "طالب" : "Student");

                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary font-bold text-xs rounded-xl border border-primary/20 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <User className="w-3 h-3" />
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStudent(id);
                          }}
                          className="p-0.5 hover:bg-primary/20 rounded-full text-primary hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              <div className="flex items-center gap-1 text-slate-400 shrink-0">
                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAll();
                    }}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-50 transition-colors"
                  >
                    {isAr ? "مسح التحديد" : "Clear"}
                  </button>
                )}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isSelectOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isSelectOpen && (
              <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Search Bar inside Dropdown */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="relative">
                    <Search
                      className={`w-4 h-4 absolute ${
                        isAr ? "right-3" : "left-3"
                      } top-1/2 -translate-y-1/2 text-slate-400`}
                    />
                    <input
                      type="text"
                      placeholder={isAr ? "بحث باسم الطالب أو الهاتف..." : "Search student name or phone..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full ${
                        isAr ? "pr-9 pl-3" : "pl-9 pr-3"
                      } py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary transition-colors`}
                    />
                  </div>
                </div>

                {/* Dropdown Options List */}
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 p-1.5">
                  {/* "All Students" Option */}
                  <div
                    onClick={handleSelectAll}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      selectedIds.length === 0
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "hover:bg-slate-50 text-slate-700 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedIds.length === 0
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">
                          {isAr ? "جميع الطلاب (بث عام)" : "All Students (Broadcast)"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isAr ? "إرسال الإشعار لجميع مستخدمي المنصة" : "Send to all registered platform users"}
                        </div>
                      </div>
                    </div>

                    {selectedIds.length === 0 && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </div>

                  {/* Individual Students */}
                  {isLoadingStudents ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {isAr ? "جاري تحميل الطلاب..." : "Loading students..."}
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {isAr ? "لا يوجد طلاب مطابقون للبحث" : "No students found"}
                    </div>
                  ) : (
                    filteredStudents.map((student) => {
                      const studentUserId =
                        student.user_id || student.user?.id || student.id;
                      const isSelected = selectedIds.includes(studentUserId);
                      const name = student.user?.name || (isAr ? "طالب" : "Student");
                      const phone = student.user?.phone || student.user?.email || "";

                      return (
                        <div
                          key={studentUserId}
                          onClick={() => toggleStudent(studentUserId)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/5 text-primary font-bold"
                              : "hover:bg-slate-50 text-slate-700 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">{name}</div>
                              {phone && (
                                <div className="text-[10px] text-slate-400">{phone}</div>
                              )}
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Count in Dropdown */}
                {selectedIds.length > 0 && (
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {isAr
                        ? `تم اختيار ${selectedIds.length} طالب`
                        : `${selectedIds.length} student(s) selected`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSelectOpen(false)}
                      className="px-3 py-1 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary-dark transition-colors"
                    >
                      {isAr ? "تم" : "Done"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? "نوع وتصنيف الإشعار (اختياري)" : "Notification Type "}
            </label>
            <input
              type="text"
              placeholder={
                isAr
                  ? "مثال: إعلان عام، عاجل، تذكير، أكاديمي..."
                  : "e.g., Announcement, Urgent, Reminder..."
              }
              {...register("type")}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Title Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "عنوان الإشعار (بالعربية) *" : "Title (Arabic) *"}
              </label>
              <input
                type="text"
                placeholder={
                  isAr ? "مثال: تذكير بموعد الحصة القادمة" : "e.g., Reminder: Next Live Session"
                }
                {...register("title_ar")}
                className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all ${
                  errors.title_ar ? "border-rose-500 focus:border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.title_ar && (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.title_ar.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "عنوان الإشعار (بالإنجليزية) *" : "Title (English)*"}
              </label>
              <input
                type="text"
                placeholder="e.g., Live Session Reminder"
                {...register("title_en")}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Message Body Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "نص الإشعار والتفاصيل (بالعربية) *" : "Message (Arabic) *"}
              </label>
              <textarea
                rows={3}
                placeholder={
                  isAr
                    ? "اكتب نص الرسالة التي ستصل للطلاب على هواتفهم وحساباتهم..."
                    : "Enter notification message details..."
                }
                {...register("message_ar")}
                className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none ${
                  errors.message_ar
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200"
                }`}
              />
              {errors.message_ar && (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.message_ar.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "نص الإشعار (بالإنجليزية) *" : "Message (English)*"}
              </label>
              <textarea
                rows={2}
                placeholder="Enter English description if needed..."
                {...register("message_en")}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isLoading
                  ? isAr
                    ? "جاري الإرسال..."
                    : "Sending..."
                  : isAr
                  ? "إرسال وبث الآن"
                  : "Send Broadcast Now"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
