import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, Trash2, Plus, Search, X, Download, BookOpen, Layers, Calendar, GraduationCap, CheckSquare, Square } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  useGetOfflineGroups,
  useCreateOfflineGroup,
  useDeleteOfflineGroup
} from '../hooks/useOffline';
import { useGetAllStages } from '../hooks/useStage';
import { useCourses } from '../../../hooks/useCourses';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import { OfflineGroup } from '../../../types/offlineGroup';
import { Stage } from '../../../types/stage';

export default function OfflineGroups() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const isArabic = language === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<OfflineGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  // Form states
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // React Query Hooks
  const { data: offlineGroupsResponse, isLoading: isGroupsLoading } = useGetOfflineGroups();
  const { data: stagesResponse } = useGetAllStages();
  const { data: coursesResponse } = useCourses(1, 1000); // Fetch all courses for multi-select

  const createOfflineGroupMutation = useCreateOfflineGroup();
  const deleteOfflineGroupMutation = useDeleteOfflineGroup();

  const qrRef = useRef<HTMLDivElement>(null);

  const offlineGroups = offlineGroupsResponse?.data?.items || [];
  const stages: Stage[] = stagesResponse?.data?.items || [];
  const courses = coursesResponse?.items || [];

  // Group stages by Rank
  const stagesByRank = useMemo(() => {
    const groups: Record<string, { rankId: string; rankName: string; stages: Stage[] }> = {};

    stages.forEach((stage) => {
      const rankId = stage.rankId || stage.rank?.id || 'other';
      const rankName = isArabic
        ? stage.rank?.name_ar || stage.rank?.name_en || t('other_ranks', 'أخرى')
        : stage.rank?.name_en || stage.rank?.name_ar || t('other_ranks', 'Other');

      if (!groups[rankId]) {
        groups[rankId] = {
          rankId,
          rankName,
          stages: [],
        };
      }
      groups[rankId].stages.push(stage);
    });

    return Object.values(groups);
  }, [stages, isArabic, t]);

  // Filter courses based on selected stage
  const availableCourses = useMemo(() => {
    if (!selectedStageId) return [];
    return courses.filter(
      (course: any) =>
        course.stageId === selectedStageId ||
        course.stage?.id === selectedStageId
    );
  }, [courses, selectedStageId]);

  // Helper to extract course title
  const getCourseTitle = (course: any) => {
    if (!course) return '';
    return isArabic
      ? course.title_ar || course.title_en || course.title || course.name_ar || course.name || ''
      : course.title_en || course.title_ar || course.title || course.name_en || course.name || '';
  };

  // Filter groups for search
  const filteredGroups = offlineGroups.filter((group) => {
    const stageName = isArabic
      ? group.stage?.name_ar || group.stage?.name_en || ''
      : group.stage?.name_en || group.stage?.name_ar || '';

    const foundStage = stages.find((s) => s.id === group.stageId);
    const rankName = isArabic
      ? group.stage?.rank?.name_ar || foundStage?.rank?.name_ar || ''
      : group.stage?.rank?.name_en || foundStage?.rank?.name_en || '';

    const query = searchTerm.toLowerCase();

    // Search by Stage Name, Rank Name, or Group ID
    return (
      stageName.toLowerCase().includes(query) ||
      rankName.toLowerCase().includes(query) ||
      group.id.toLowerCase().includes(query)
    );
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStageId || selectedCourseIds.length === 0) return;

    try {
      await createOfflineGroupMutation.mutateAsync({
        stageId: selectedStageId,
        courseIds: selectedCourseIds,
      });
      // Reset form & close modal
      setSelectedStageId('');
      setSelectedCourseIds([]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create offline group:', error);
    }
  };

  const handleDeleteGroup = (id: string) => {
    setGroupToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (groupToDelete) {
      try {
        await deleteOfflineGroupMutation.mutateAsync(groupToDelete);
        setIsDeleteModalOpen(false);
        setGroupToDelete(null);
      } catch (error) {
        console.error('Failed to delete offline group:', error);
      }
    }
  };

  const openQRModal = (group: OfflineGroup) => {
    setSelectedGroup(group);
    setIsQRModalOpen(true);
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleSelectAllCourses = () => {
    if (selectedCourseIds.length === availableCourses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(availableCourses.map((c) => c.id));
    }
  };

  const downloadQRCode = (format: 'png' | 'jpg' = 'png') => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const qrSize = 300;
      const padding = 30;
      const size = qrSize + padding * 2;
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, size, size);
      context.drawImage(image, padding, padding, qrSize, qrSize);

      const imgType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const imageURL = canvas.toDataURL(imgType, 1.0);

      const downloadLink = document.createElement('a');
      downloadLink.href = imageURL;
      downloadLink.download = `QR-OfflineGroup-${selectedGroup?.id.slice(0, 8)}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URLObject.revokeObjectURL(blobURL);
    };

    image.src = blobURL;
  };

  // Generate URL for scanning
  const getQRLink = (token?: string) => {
    if (!token) return '';
    return `${window.location.origin}/offline-page?token=${token}`;
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-indigo-600" />
            {t('offline_groups_management', 'Offline Groups Management')}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {t('offline_groups_subtitle', 'Generate and manage QR tokens and course links for physical classrooms.')}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedStageId('');
            setSelectedCourseIds([]);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl transition-all shadow-lg shadow-indigo-200 active:scale-95 font-bold"
        >
          <Plus className="w-5 h-5" />
          {t('create_new_group', 'Create New Group')}
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('total_groups', 'Total Offline Groups')}</p>
            <p className="text-2xl font-bold text-gray-900">{offlineGroups.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('total_stages', 'Total Stages Available')}</p>
            <p className="text-2xl font-bold text-gray-900">{stages.length}</p>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
          <input
            type="text"
            placeholder={t('search_groups_placeholder', 'Search groups by stage name or ID...')}
            className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Groups */}
      {isGroupsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const stageName = isArabic
              ? group.stage?.name_ar || group.stage?.name_en || ''
              : group.stage?.name_en || group.stage?.name_ar || '';

            const foundStage = stages.find((s) => s.id === group.stageId);
            const rankName = isArabic
              ? group.stage?.rank?.name_ar || foundStage?.rank?.name_ar || ''
              : group.stage?.rank?.name_en || foundStage?.rank?.name_en || '';

            return (
              <div key={group.id} className="relative overflow-hidden bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400">
                      ID: #{group.id.slice(0, 8)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openQRModal(group)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all"
                        title={t('view_qr_code', 'View QR Code')}
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                        title={t('delete', 'Delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rank Pill Badge */}
                  {rankName && (
                    <div className="mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <GraduationCap className="w-3 h-3" />
                        {rankName}
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {stageName}
                  </h3>

                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {t('linked_courses', 'Linked Courses')}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">
                        {group.courses?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {t('created_date', 'Created Date')}
                      </span>
                      <span className="text-gray-900">
                        {new Date(group.createdAt).toLocaleDateString(language, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {t('courses_list', 'Courses List')}
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
                    {group.courses?.map((c) => {
                      const courseTitle = getCourseTitle(c.course);
                      return (
                        <span key={c.id} className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2 py-1 rounded-md">
                          {courseTitle}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-20 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <QrCode className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('no_groups_found', 'No Offline Groups Found')}</h3>
          <p className="text-gray-500 mt-2 max-w-sm">
            {t('no_groups_found_desc', 'No offline groups match your search criteria or none have been created yet.')}
          </p>
        </div>
      )}

      {/* Create New Group Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] !mt-0 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {t('create_new_offline_group', 'Create New Offline Group')}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium">
                      {t('select_details_for_group', 'Select stage and courses to link')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setSelectedStageId('');
                    setSelectedCourseIds([]);
                  }}
                  className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-6">
                {/* Select Stage Grouped by Rank */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    {t('select_stage_label', 'Academic Stage')}
                  </label>
                  <select
                    required
                    value={selectedStageId}
                    onChange={(e) => {
                      setSelectedStageId(e.target.value);
                      setSelectedCourseIds([]); // reset selection when stage changes
                    }}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-start"
                  >
                    <option value="">{t('select_stage_placeholder', '-- Select Stage --')}</option>
                    {stagesByRank.map((group) => (
                      <optgroup key={group.rankId} label={`🎓 ${group.rankName}`}>
                        {group.stages.map((stage) => {
                          const name = isArabic
                            ? stage.name_ar || stage.name_en || ''
                            : stage.name_en || stage.name_ar || '';
                          return (
                            <option key={stage.id} value={stage.id}>
                              {name}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Multi-Select Courses (Filtered by Selected Stage) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    {t('select_courses_label', 'Select Courses')}
                  </label>

                  {!selectedStageId ? (
                    <div className="text-center py-8 px-4 bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl">
                      <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-400">
                        {t('select_stage_first_hint', 'Please select an academic stage first to view its available courses')}
                      </p>
                    </div>
                  ) : availableCourses.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                      <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-400">
                        {t('no_courses_for_stage', 'No courses available for this stage currently')}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-4 max-h-60 overflow-y-auto space-y-2.5 border border-gray-100">
                      {/* Select All Toggle Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 mb-2">
                        <span className="text-xs font-bold text-gray-500">
                          {t('available_courses_count', 'Available Courses')} ({availableCourses.length})
                        </span>
                        <button
                          type="button"
                          onClick={toggleSelectAllCourses}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          {selectedCourseIds.length === availableCourses.length ? (
                            <>
                              <CheckSquare className="w-3.5 h-3.5" />
                              {t('deselect_all', 'Deselect All')}
                            </>
                          ) : (
                            <>
                              <Square className="w-3.5 h-3.5" />
                              {t('select_all', 'Select All')}
                            </>
                          )}
                        </button>
                      </div>

                      {availableCourses.map((course: any) => {
                        const title = getCourseTitle(course);
                        return (
                          <label key={course.id} className="flex items-center gap-3 cursor-pointer select-none py-1 hover:bg-gray-100/60 px-2 rounded-xl transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedCourseIds.includes(course.id)}
                              onChange={() => toggleCourseSelection(course.id)}
                              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-gray-700">{title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {selectedStageId && availableCourses.length > 0 && selectedCourseIds.length === 0 && (
                    <p className="text-[10px] text-red-500 font-bold px-2">
                      {t('select_at_least_one_course', 'Please select at least one course')}
                    </p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setSelectedStageId('');
                      setSelectedCourseIds([]);
                    }}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={createOfflineGroupMutation.isPending || !selectedStageId || selectedCourseIds.length === 0}
                    className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {createOfflineGroupMutation.isPending ? t('saving', 'Saving...') : t('save', 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View QR Code Modal */}
      {isQRModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-[100] !mt-0 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">{t('offline_group_qr', 'Group QR Code')}</h3>
                <button
                  onClick={() => setIsQRModalOpen(false)}
                  className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div ref={qrRef} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm mb-6 flex justify-center">
                <QRCodeSVG
                  value={getQRLink(selectedGroup.qrToken)}
                  size={200}
                  level="H"
                />
              </div>

              <p className="text-xs font-semibold text-gray-500 text-center mb-6 max-w-xs break-all">
                {getQRLink(selectedGroup.qrToken)}
              </p>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => downloadQRCode('jpg')}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all"
                >
                  <Download className="w-4 h-4" />
                  {t('download_jpg', 'Download JPG')}
                </button>
                <button
                  onClick={() => setIsQRModalOpen(false)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold transition-all"
                >
                  {t('close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        title={t('confirm_delete_group_title', 'Delete Offline Group?')}
        message={t('confirm_delete_group_message', 'Are you sure you want to delete this offline group? All classroom connections and tokens for this group will be destroyed.')}
      />
    </div>
  );
}
