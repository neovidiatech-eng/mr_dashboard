import { useState } from "react";
import { Star, EyeOff, Eye, User, Calendar, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "../../../contexts/LanguageContext";
import Pagination from "../../../components/ui/Pagination";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import { getReviews, toggleReviewVisibility } from "../services/ReviewsServices";
import { useConfirm } from "../../../hooks/useConfirm";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();

  const text = {
    title: { ar: "آراء وتقييمات الجلسات", en: "Session Reviews" },
    subtitle: { ar: "مراجعة كل التقييمات بين المعلمين والطلاب، وإخفاء أي تقييم غير لائق", en: "Review all ratings between teachers and students, and hide any inappropriate review" },
    reviewer: { ar: "المُقيِّم", en: "Reviewer" },
    reviewee: { ar: "المُقيَّم", en: "Reviewee" },
    session: { ar: "الجلسة", en: "Session" },
    rating: { ar: "التقييم", en: "Rating" },
    comment: { ar: "التعليق", en: "Comment" },
    date: { ar: "التاريخ", en: "Date" },
    actions: { ar: "الإجراءات", en: "Actions" },
    hide: { ar: "إخفاء", en: "Hide" },
    show: { ar: "إظهار", en: "Show" },
    hidden: { ar: "مخفي", en: "Hidden" },
    noReviews: { ar: "لا توجد تقييمات بعد", en: "No reviews yet" },
    confirmTitle: { ar: "تغيير حالة التقييم", en: "Change review visibility" },
    confirmMsg: { ar: "متأكد من تغيير حالة عرض هذا التقييم؟", en: "Are you sure you want to change this review's visibility?" },
  };

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", currentPage],
    queryFn: () => getReviews(currentPage, itemsPerPage),
  });

  const { mutate: toggleVisibility } = useMutation({
    mutationFn: toggleReviewVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const reviews = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const handleToggle = async (id: string) => {
    const confirmed = await confirm({
      title: text.confirmTitle[language],
      message: text.confirmMsg[language],
    });
    if (confirmed) toggleVisibility(id);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className={`${language === 'ar' ? 'text-right' : 'text-left'} space-y-2`}>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {text.title[language]}
        </h1>
        <p className="text-slate-500 font-medium">{text.subtitle[language]}</p>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          {isLoading ? (
            <div className="p-8">
              <TableSkeleton rows={8} columns={6} />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <MessageSquare size={40} />
              </div>
              <p className="text-slate-500 text-lg font-bold">{text.noReviews[language]}</p>
            </div>
          ) : (
            <table className="w-full border-collapse" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {[
                    { label: text.reviewer[language], icon: User },
                    { label: text.reviewee[language], icon: User },
                    { label: text.session[language], icon: null },
                    { label: text.rating[language], icon: null },
                    { label: text.comment[language], icon: null },
                    { label: text.date[language], icon: Calendar },
                    { label: text.actions[language], icon: null },
                  ].map((head, i) => (
                    <th key={i} className="px-6 py-5 text-start">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                        {head.icon && <head.icon size={14} />}
                        {head.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviews.map((review) => (
                  <tr key={review.id} className={`hover:bg-blue-50/30 transition-colors group ${review.isHidden ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-800">{review.reviewer?.name}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-800">{review.reviewee?.name}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-500 font-medium">{review.schedule?.title || '—'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500 font-medium max-w-[200px] truncate block">{review.comment || '—'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-500 font-medium">{review.createdAt.substring(0, 10)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {review.isHidden && (
                          <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                            {text.hidden[language]}
                          </span>
                        )}
                        <button
                          onClick={() => handleToggle(review.id)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                          title={review.isHidden ? text.show[language] : text.hide[language]}
                        >
                          {review.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 bg-slate-50/10">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      {ConfirmDialog}
    </div>
  );
}
