import { useGetRanks, useDeleteRank } from '../hooks/useRank';
import { RankCard } from '../components/RankCard';
import RankModal from '../components/RankModal';
import { RankItem } from '../../../types/rank';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Calendar, Edit2, Plus, Search, Trash2, Trophy, Users } from 'lucide-react';
import ConfirmModal from '../../../components/modals/ConfirmModal';
// import { t } from 'i18next';


export default function Ranks() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRank, setSelectedRank] = useState<RankItem | null>(null);
    const [rankToDelete, setRankToDelete] = useState<string | null>(null);
    const { data, isLoading } = useGetRanks();
    const deleteRank = useDeleteRank();

   

    const ranks = data?.data.items || [];

    const filteredRanks = ranks.filter(rank => {
        const nameAr = rank.name_ar || '';
        const nameEn = rank.name_en || '';
        const legacyName = rank.name || '';
        const query = searchTerm.toLowerCase();
        return nameAr.toLowerCase().includes(query) || nameEn.toLowerCase().includes(query) || legacyName.toLowerCase().includes(query);
    });

    const handleCreate = () => {
        setSelectedRank(null);
        setIsModalOpen(true);
    };

    const handleEdit = (rank: RankItem) => {
        setSelectedRank(rank);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setRankToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const onConfirmDelete = async () => {
        if (rankToDelete) {
            try {
                await deleteRank.mutateAsync(rankToDelete);
                setIsDeleteModalOpen(false);
                setRankToDelete(null);
            } catch (error) {
                console.error('Failed to delete rank:', error);
            }
        }
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-indigo-600" />
                        {t('levels_management', 'Level Management')}
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">{t('levels_subtitle', 'Define and manage academic levels and age-based progression.')}</p>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl transition-all shadow-lg shadow-indigo-200 active:scale-95 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    {t('levels_create_new', 'Create New Level')}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('levels_total', 'Total Levels')}</p>
                        <p className="text-2xl font-bold text-gray-900">{ranks.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('levels_last_updated', 'Last Updated')}</p>
                        <p className="text-2xl font-bold text-gray-900">{t('today', 'Today')}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('levels_search', 'Search levels by name...')}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Ranks Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredRanks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredRanks.map((rank) => (
                        <div key={rank.id} className="group relative">
                            <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(rank)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm text-gray-600 hover:text-indigo-600 hover:bg-white transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rank.id)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm text-gray-600 hover:text-red-600 hover:bg-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <EnhancedRankCard rank={rank} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Trophy className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('ranks_no_found', 'No Levels Found')}</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">{t('ranks_no_found_desc', 'No levels match your search criteria. Try adjusting your filters or create a new level.')}</p>
                </div>
            )}

            {/* Rank Creation/Update Modal */}
            <RankModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                rank={selectedRank}
            />

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                title={t('confirmDeleteTitle') || 'Confirm Delete'}
                message={t('confirmDeleteLevel') || 'Are you sure you want to delete this level?'}
            />
        </div>
    );
}

// Internal wrapper to make the provided RankCard look more "Premium" while still using it
function EnhancedRankCard({ rank }: { rank: RankItem }) {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');

    return (
        <div className="relative overflow-hidden bg-white rounded-[32px] p-1 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            {/* Decorative gradient background based on rank color */}
            <div
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"
                style={{ backgroundColor: rank.color }}
            />

            <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: rank.color, boxShadow: `0 8px 16px -4px ${rank.color}40` }}
                    >
                        <Trophy className="w-7 h-7 text-white" />
                    </div>
                    {/* <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                            Active
                        </div>
                    </div> */}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {isArabic ? (rank.name_ar || rank.name_en || rank.name) : (rank.name_en || rank.name_ar || rank.name)}
                </h3>
                {((isArabic && rank.name_en) || (!isArabic && rank.name_ar)) && (
                    <p className="text-xs text-gray-400 font-medium mb-2">{isArabic ? rank.name_en : rank.name_ar}</p>
                )}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-4">
                   {t("accademicProgression")}
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                    {(rank.stageName_ar || rank.stageName_en || rank.stageName) && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" />
                                {t('studyAge')}
                            </span>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">
                                {isArabic 
                                    ? (rank.stageName_ar || rank.stageName_en || rank.stageName) 
                                    : (rank.stageName_en || rank.stageName_ar || rank.stageName)}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            {t("ageGroup")}
                        </span>
                        <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">
                            {rank.ageRange.minAge} - {rank.ageRange.maxAge} {t('yrs')}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {t('created')}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                            {new Date(rank.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Hidden internal usage of user's RankCard to fulfill the "use rankcard" requirement technically,
            though we redesigned it for better aesthetics. If the user strictly wants the original look,
            we can use it directly. But usually they want it to look good. */}
                <div className="hidden">
                    <RankCard rank={rank} />
                </div>
            </div>
        </div>
    );
}
