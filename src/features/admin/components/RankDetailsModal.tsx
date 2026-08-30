import { X, Trophy, Plus, GraduationCap, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { RankItem } from '../../../types/rank';
import { useAddStage, useDeleteStage, useUpdateStage } from '../hooks/useStage';
import ConfirmModal from '../../../components/modals/ConfirmModal';

interface RankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: RankItem | null;
}

export default function RankDetailsModal({ isOpen, onClose, rank }: RankDetailsModalProps) {
  const {i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const isArabic = language === 'ar';
  const addStage = useAddStage();
  const deleteStage = useDeleteStage();
  const updateStage = useUpdateStage();

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);

  if (!isOpen || !rank) return null;

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    try {
      if (editingStageId) {
        await updateStage.mutateAsync({
          id: editingStageId,
          stage: {
            name_ar: nameAr,
            name_en: nameEn,
            rankId: rank.id
          }
        });
      } else {
        await addStage.mutateAsync({
          name_ar: nameAr,
          name_en: nameEn,
          rankId: rank.id
        });
      }
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setIsAdding(false);
    setEditingStageId(null);
  };

  const handleEditClick = (stage: any) => {
    setNameAr(stage.name_ar || stage.name || '');
    setNameEn(stage.name_en ||stage.slug||'');
    setEditingStageId(stage.id);
    setIsAdding(true);
  };

  const handleDeleteClick = (stageId: string) => {
    setStageToDelete(stageId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (stageToDelete) {
      try {
          await deleteStage.mutateAsync(stageToDelete);
          setIsDeleteModalOpen(false);
          setStageToDelete(null);
      } catch (error) {
          console.error(error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] !mt-0 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4 border-b border-gray-100 flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: rank.color, boxShadow: `0 8px 16px -4px ${rank.color}40` }}
              >
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isArabic ? (rank.name_ar || rank.name) : (rank.name_en || rank.name)}
                </h2>
                <p className="text-sm text-gray-400 font-medium">
                  {isArabic ? 'تفاصيل المستوى والمراحل' : 'Level Details and Stages'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto no-scrollbar flex-1 bg-gray-50/50">
           {/* Stages Section */}
           <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    {isArabic ? 'المراحل التابعة' : 'Associated Stages'}
                </h3>
                <button
                    onClick={() => { resetForm(); setIsAdding(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 text-gray-600 rounded-xl transition-all shadow-sm text-sm font-bold"
                >
                    <Plus className="w-4 h-4" />
                    {isArabic ? 'إضافة مرحلة' : 'Add Stage'}
                </button>
           </div>

           {isAdding && (
               <form onSubmit={handleSaveStage} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm mb-6 space-y-4 animate-in slide-in-from-top-2">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-700">{isArabic ? 'اسم المرحلة (بالعربية)*' : 'Stage Name (Arabic)*'}</label>
                           <input
                               type="text"
                               dir="rtl"
                               value={nameAr}
                               onChange={(e) => setNameAr(e.target.value)}
                               className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                               placeholder={isArabic ? 'مثال: الصف الأول' : 'e.g. Grade 1'}
                               required
                           />
                       </div>
                       <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-700">{isArabic ? 'اسم المرحلة (بالإنجليزية)' : 'Stage Name (English)'}</label>
                           <input
                               type="text"
                               dir="ltr"
                               value={nameEn}
                               onChange={(e) => setNameEn(e.target.value)}
                               className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                               placeholder="e.g. Grade 1"
                           />
                       </div>
                   </div>
                   <div className="flex justify-end gap-2 pt-2">
                       <button
                           type="button"
                           onClick={resetForm}
                           className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-xl text-sm"
                       >
                           {isArabic ? 'إلغاء' : 'Cancel'}
                       </button>
                       <button
                           type="submit"
                           disabled={addStage.isPending || updateStage.isPending}
                           className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 text-sm"
                       >
                           {addStage.isPending || updateStage.isPending ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (editingStageId ? (isArabic ? 'تحديث' : 'Update') : (isArabic ? 'حفظ' : 'Save'))}
                       </button>
                   </div>
               </form>
           )}

           {rank.stages && rank.stages.length > 0 ? (
               <div className="space-y-3">
                   {rank.stages.map((stage: any) => (
                       <div key={stage.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                   <GraduationCap className="w-5 h-5 text-indigo-600" />
                               </div>
                               <div>
                                   <p className="font-bold text-gray-900">{isArabic ? (stage.name_ar || stage.name) : (stage.name_en || stage.name)}</p>
                                   {((isArabic && stage.name_en) || (!isArabic && stage.name_ar)) && (
                                       <p className="text-xs text-gray-400 font-medium">{isArabic ? stage.name_en : stage.name_ar}</p>
                                   )}
                               </div>
                           </div>
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                               <button 
                                    onClick={() => handleEditClick(stage)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    title={isArabic ? 'تعديل' : 'Edit'}
                                >
                                   <Edit2 className="w-4 h-4" />
                               </button>
                               <button 
                                    onClick={() => handleDeleteClick(stage.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    title={isArabic ? 'حذف' : 'Delete'}
                                >
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           </div>
                       </div>
                   ))}
               </div>
           ) : (
               <div className="text-center py-10">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <GraduationCap className="w-8 h-8 text-gray-400" />
                   </div>
                   <p className="text-gray-500 font-medium">
                       {isArabic ? 'لا توجد مراحل مضافة لهذا المستوى بعد.' : 'No stages added to this level yet.'}
                   </p>
               </div>
           )}
        </div>
      </div>
      
      <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={isArabic ? 'هل أنت متأكد من حذف هذه المرحلة؟' : 'Are you sure you want to delete this stage?'}
      />
    </div>
  );
}
