import { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, ListChecks } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import Pagination from '../../../components/ui/Pagination';
import AddExamModal from '../../../components/modals/ExamModal';
import ExamQuestionsModal from '../../../components/modals/ExamQuestionsModal';
import { useConfirm } from '../../../hooks/useConfirm';
import { useExams, useCreateExam, useUpdateExam, useDeleteExam } from '../../../hooks/useExams';
import { Exam } from '../../../types/exam';
import { ExamFormData } from '../../../lib/schemas/ExamSchema';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';

export default function Exams() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [questionsExam, setQuestionsExam] = useState<Exam | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();
  const [filters, setFilters] = useState({ status: '' });
  const itemsPerPage = 10;

  const { data, isLoading } = useExams({ status: filters.status || undefined });
  const { mutateAsync: createExam } = useCreateExam();
  const { mutateAsync: updateExam } = useUpdateExam();
  const { mutate: deleteExam } = useDeleteExam();

  const exams: Exam[] = data?.items ?? [];

  const text = {
    title: { ar: 'الامتحانات', en: 'Exams' },
    search: { ar: 'بحث بالعنوان أو المادة...', en: 'Search by title or subject...' },
    addExam: { ar: 'إضافة امتحان', en: 'Add Exam' },
    filters: { ar: 'الفلاتر الشائعة', en: 'Common filters' },
    columnTitle: { ar: 'العنوان', en: 'Title' },
    columnSubject: { ar: 'المادة', en: 'Subject' },
    columnTeacher: { ar: 'المعلم', en: 'Teacher' },
    columnStudent: { ar: 'الطالب', en: 'Student' },
    columnDueDate: { ar: 'تاريخ', en: 'Due Date' },
    columnDuration: { ar: 'المدة (دقيقة)', en: 'Duration (min)' },
    columnGrade: { ar: 'الدرجة', en: 'Grade' },
    columnStatus: { ar: 'الحالة', en: 'Status' },
    columnActions: { ar: 'الإجراءات', en: 'Actions' },
    pending: { ar: 'لسه ما بدأش', en: 'Pending' },
    in_progress: { ar: 'جاري الآن', en: 'In Progress' },
    graded: { ar: 'مصحّح', en: 'Graded' },
    submitted: { ar: 'مُسلّم', en: 'Submitted' },
    manageQuestions: { ar: 'إدارة الأسئلة', en: 'Manage Questions' },
    edit: { ar: 'تعديل', en: 'Edit' },
    delete: { ar: 'حذف', en: 'Delete' },
    deleteConfirmTitle: { ar: 'حذف امتحان', en: 'Delete Exam' },
    deleteConfirmMsg: { ar: 'هل أنت متأكد من حذف هذا الامتحان؟', en: 'Are you sure you want to delete this exam?' },
  };

  const filteredExams = exams.filter((exam) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      exam.title.toLowerCase().includes(term) ||
      (exam.subject || '').toLowerCase().includes(term) ||
      exam.student?.user?.name?.toLowerCase().includes(term) ||
      exam.teacher?.user?.name?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  const statusStyle = (status: string) =>
    status === 'graded'
      ? 'bg-green-100 text-green-800'
      : status === 'in_progress'
      ? 'bg-blue-100 text-blue-800'
      : status === 'submitted'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-yellow-100 text-yellow-800';

  const handleSaveExam = async (formData: ExamFormData) => {
    try {
      if (editingExam) {
        await updateExam({ id: editingExam.id, data: formData });
      } else {
        await createExam({ ...formData, dueDate: new Date(formData.dueDate).toISOString() });
      }
      setEditingExam(null);
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteExam = async (examId: string) => {
    const confirmed = await confirm({
      title: text.deleteConfirmTitle[language],
      message: text.deleteConfirmMsg[language],
    });
    if (confirmed) deleteExam(examId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{text.title[language]}</h1>
        <button
          onClick={() => { setEditingExam(null); setShowAddModal(true); }}
          className="flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {text.addExam[language]}
        </button>
      </div>

      <AddExamModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingExam(null); }}
        onAdd={handleSaveExam}
        initialData={editingExam}
      />

      {questionsExam && (
        <ExamQuestionsModal
          isOpen={!!questionsExam}
          onClose={() => setQuestionsExam(null)}
          examId={questionsExam.id}
          examTitle={questionsExam.title}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={text.search[language]}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                dir="rtl"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              {text.filters[language]}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              >
                <option value="">{text.columnStatus[language]}</option>
                <option value="pending">{text.pending[language]}</option>
                <option value="in_progress">{text.in_progress[language]}</option>
                <option value="graded">{text.graded[language]}</option>
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={itemsPerPage} columns={7} />
            </div>
          ) : (
            <table className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnStudent[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnTitle[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnSubject[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnTeacher[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnDueDate[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnGrade[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnStatus[language]}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">{text.columnActions[language]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-start text-gray-900 font-medium">{exam.student?.user?.name || '—'}</td>
                    <td className="px-6 py-4 text-start text-gray-900">{exam.title}</td>
                    <td className="px-6 py-4 text-start">
                      <span className="text-primary font-medium">{exam.subject || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-start text-gray-900">{exam.teacher?.user?.name || '—'}</td>
                    <td className="px-6 py-4 text-start text-gray-600">{exam.dueDate?.substring(0, 10)}</td>
                    <td className="px-6 py-4 text-start text-gray-900 font-medium">
                      {['graded', 'submitted'].includes(exam.status) ? `${exam.grade.toFixed(1)} / ${exam.totalMarks}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-start">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle(exam.status)}`}>
                        {text[exam.status]?.[language] || exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-start">
                      <div className="flex items-center gap-2 justify-start">
                        <button
                          onClick={() => setQuestionsExam(exam)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title={text.manageQuestions[language]}
                        >
                          <ListChecks className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { setEditingExam(exam); setShowAddModal(true); }}
                          className="p-2 icon-btn-primary rounded-lg transition-colors"
                          title={text.edit[language]}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={text.delete[language]}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredExams.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {ConfirmDialog}
    </div>
  );
}
