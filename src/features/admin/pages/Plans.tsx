import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Package, CheckCircle, Clock } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import AddPlanModal from "../../../components/modals/AddPlanModal";
import ViewPlanModal from "../../../components/modals/ViewPlanModal";
import { useConfirm } from "../../../hooks/useConfirm";
import { useCurrency } from "../hooks/useCurrency";
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "../hooks/usePlans";
import { PlanFormData } from "../../../lib/schemas/PlanSchema";
// Removed CurrencyCode enum as it is no longer used due to dynamic currency IDs
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currencyId: string;
  currencyCode: string;
  duration: number;
  sessionsCount: number;
  sessionTime: number;
  type: "quarterly" | "halfAnnually" | "annually";
  features: string[];
  status: "active" | "inactive";
}

export default function Plans() {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const { mutateAsync: createPlanMutation } = useCreatePlan();
  const { mutateAsync: updatePlanMutation } = useUpdatePlan();
  const { mutateAsync: deletePlanMutation } = useDeletePlan();
  
  const { data: currenciesData } = useCurrency();
  const currencies = currenciesData?.currencies || [];

  const plans = plansData?.map((item: any) => ({
    id: item.id,
    name: item.name_ar || item.name,
    description: item.description || "",
    price: Number(item.price),
    currencyId: item.currencyId || item.currency?.id || "",
    currencyCode: item.currency?.code || "EGP",
    duration: item.duration,
    sessionsCount: item.sessionsCount || 0,
    sessionTime: item.sessionTime || 60,
    type: item.type || 'full',
    features: item.features || [],
    status: (item.active ? "active" : "inactive") as "active" | "inactive",
  })) || [];

  const text = {
    title: { ar: "خطط الاشتراك", en: "Subscription Plans" },
    addPlan: { ar: "إضافة خطة", en: "Add Plan" },
    edit: { ar: "تعديل", en: "Edit" },
    delete: { ar: "حذف", en: "Delete" },
    view: { ar: "عرض", en: "View" },
    active: { ar: "نشط", en: "Active" },
    inactive: { ar: "غير نشط", en: "Inactive" },
    popular: { ar: "الأكثر شعبية", en: "Most Popular" },
    sessions: { ar: "حصة", en: "sessions" },
    month: { ar: "شهر", en: "month" },
    noPlans: { ar: "لا توجد خطط", en: "No plans found" },
    features: { ar: "المميزات", en: "Features" },
    confirmDelete: {
      ar: "هل أنت متأكد من حذف هذه الخطة؟",
      en: "Are you sure you want to delete this plan?",
    },
  };

  // React Query handles fetching automatically via usePlans

  const handleSavePlan = async (planData: PlanFormData & { id?: string }) => {
    try {
      const payload: any = {
        name: planData.name,
        price: Number(planData.price),
        duration: Number(planData.duration),
        sessionsCount: Number(planData.sessionsCount),
        active: planData.status === "active",
        currencyId: planData.currencyId,
        type: planData.type,
      };

      if (planData.description && planData.description.trim() !== "") {
        payload.description = planData.description;
      }

      const validFeatures = planData.features?.filter(f => f.trim() !== "") || [];
      if (validFeatures.length > 0) {
        payload.features = validFeatures;
      }

      if (planData.id) {
        await updatePlanMutation({
          id: planData.id,
          data: payload,
        });
      } else {
        await createPlanMutation(payload);
      }
      setSelectedPlan(null);
      return true;
    } catch (error) { console.error(error); return false; }
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = await confirm({
      title: language === "ar" ? "حذف خطة" : "Delete Plan",
      message: text.confirmDelete[language],
    });
    if (confirmed) {
      try {
        await deletePlanMutation(id);
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="max-w-[1600px] mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-start">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {text.title[language]}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Configure and manage your curriculum subscription tiers.
            </p>
          </div>

          <button
            onClick={() => { setSelectedPlan(null); setIsModalOpen(true); }}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl transition-all font-black text-sm shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            {text.addPlan[language]}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8">
        {plansLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[32px] h-[500px] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-gray-100 p-20 text-center">
            <Package className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <p className="text-xl font-bold text-gray-400">{text.noPlans[language]}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="group bg-white rounded-[32px] border-2 border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col overflow-hidden"
              >
               
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-start">
                      <h3 className="text-2xl font-black text-gray-900 leading-tight">
                        {plan.name}
                      </h3>
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600">
                        {plan.type}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                       <Package className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-8 mb-8 text-center group-hover:bg-indigo-50/50 transition-colors">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-gray-900 tracking-tight">
                        {plan.price}
                      </span>
                      <div className="text-start">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{plan.currencyCode}</p>
                        <p className="text-[10px] font-bold text-gray-400">/{text.month[language]}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-center gap-4 text-sm font-bold text-gray-500">
                       <div className="flex items-center gap-1.5">
                         <Clock className="w-4 h-4" />
                         {plan.duration} Month
                       </div>
                       <div className="w-1 h-1 rounded-full bg-gray-300" />
                       <div className="flex items-center gap-1.5">
                         <Package className="w-4 h-4" />
                         {plan.sessionsCount} {text.sessions[language]}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-start">
                      Included Features
                    </h4>
                    {plan.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 text-start group/feature">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/feature:bg-emerald-100 transition-colors">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-600">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                    <button
                      onClick={() => { setSelectedPlan(plan); setShowViewModal(true); }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary/80 text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest"
                    >
                      <Eye className="w-4 h-4" />
                      {text.view[language]}
                    </button>
                    
                    <button
                      onClick={() => { setSelectedPlan(plan); setIsModalOpen(true); }}
                      className="p-4 bg-gray-50 hover:bg-amber-50 text-gray-400 hover:text-amber-600 rounded-2xl transition-all border border-transparent hover:border-amber-100"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-4 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl transition-all border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddPlanModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedPlan(null); }} 
        onSave={handleSavePlan} 
        initialData={selectedPlan}
        currencies={currencies}
      />
      {selectedPlan && (
        <ViewPlanModal 
          isOpen={showViewModal} 
          onClose={() => { setShowViewModal(false); setSelectedPlan(null); }} 
          plan={{
            ...selectedPlan,
            currency: selectedPlan.currencyCode
          }} 
        />
      )}
      {ConfirmDialog}
    </div>
  );
}
