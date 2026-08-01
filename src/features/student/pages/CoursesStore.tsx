import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, ShoppingCart, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCourses } from '../../../hooks/useCourses';
import { requestCoursePurchase, getMyCoursePurchaseRequests } from '../services/CoursePurchaseServices';
import ErrorService from '../../../utils/ErrorService';

export default function CoursesStore() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: coursesData, isLoading } = useCourses(page, 50, undefined, searchQuery);
  const { data: myRequests } = useQuery({
    queryKey: ['my-course-purchase-requests'],
    queryFn: getMyCoursePurchaseRequests,
  });

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: (courseId: string) => requestCoursePurchase(courseId),
    onSuccess: () => {
      ErrorService.success(language === 'ar' ? 'اتبعت طلبك، هيتم التواصل معاك قريبًا' : 'Your request has been sent, we will contact you soon');
      queryClient.invalidateQueries({ queryKey: ['my-course-purchase-requests'] });
    },
    onError: (err: any) => {
      ErrorService.error(err?.response?.data?.message || (language === 'ar' ? 'حصل خطأ' : 'Something went wrong'));
    },
  });

  const courses = coursesData?.items ?? [];
  const requestItems = myRequests?.data?.items ?? [];

  const getRequestForCourse = (courseId: string) =>
    requestItems.find((r: any) => r.courseId === courseId);

  const text = {
    title: { ar: 'متجر الكورسات', en: 'Courses Store' },
    subtitle: { ar: 'اطلب شراء أي كورس منفرد، وهيتم التواصل معاك لإتمام العملية', en: 'Request to buy any individual course, and we will reach out to complete the purchase' },
    searchPlaceholder: { ar: 'ابحث عن كورس بالاسم أو الوصف أو الكلمات المفتاحية...', en: 'Search course by name, description, or keywords...' },
    request: { ar: 'اطلب الكورس', en: 'Request Course' },
    pending: { ar: 'طلبك قيد المراجعة', en: 'Request pending' },
    approved: { ar: 'متاح لك بالفعل', en: 'Already unlocked' },
    rejected: { ar: 'اتم رفض الطلب', en: 'Request rejected' },
    noPrice: { ar: 'السعر عند التواصل', en: 'Price on request' },
  };

  return (
    <div className="p-6 lg:p-8 space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{text.title[language]}</h1>
          <p className="text-gray-500 text-sm mt-1">{text.subtitle[language]}</p>
        </div>
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={text.searchPlaceholder[language]}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course: any) => {
            const existingRequest = getRequestForCourse(course.id);
            return (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                {course.category && (
                  <span className="inline-block text-[10px] font-bold px-2 py-1 rounded-lg mb-2" style={{ backgroundColor: `${course.category.color}20`, color: course.category.color }}>
                    {language === 'ar' ? course.category.name_ar : (course.category.name_en || course.category.name_ar)}
                  </span>
                )}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-gray-900">
                    {course.price ? `${course.price}` : text.noPrice[language]}
                  </span>

                  {existingRequest?.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle className="w-4 h-4" /> {text.approved[language]}
                    </span>
                  ) : existingRequest?.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                      <Clock className="w-4 h-4" /> {text.pending[language]}
                    </span>
                  ) : existingRequest?.status === 'rejected' ? (
                    <button
                      onClick={() => sendRequest(course.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline"
                    >
                      <XCircle className="w-4 h-4" /> {text.rejected[language]}
                    </button>
                  ) : (
                    <button
                      onClick={() => sendRequest(course.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {text.request[language]}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
