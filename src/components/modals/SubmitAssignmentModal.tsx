import { useState } from 'react';
import { X, Upload, File } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSubmitAssignment } from '../../hooks/useAssignment';

interface SubmitAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  assignmentTitle: string;
}

export default function SubmitAssignmentModal({ isOpen, onClose, assignmentId, assignmentTitle }: SubmitAssignmentModalProps) {
  const { language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const submitMutation = useSubmitAssignment();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('attachments', selectedFile);

    submitMutation.mutate({ id: assignmentId, data: formData }, {
      onSuccess: () => {
        onClose();
        setSelectedFile(null);
      }
    });
  };

  if (!isOpen) return null;

  const text = {
    title: { ar: 'تسليم الواجب', en: 'Submit Assignment' },
    subtitle: { ar: `تسليم الحل لواجب: ${assignmentTitle}`, en: `Submit answer for: ${assignmentTitle}` },
    uploadLabel: { ar: 'اختر ملف الحل', en: 'Choose solution file' },
    dragLabel: { ar: 'اسحب الملف هنا أو انقر للاختيار', en: 'Drag file here or click to browse' },
    submit: { ar: 'تسليم الآن', en: 'Submit Now' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    loading: { ar: 'جاري التسليم...', en: 'Submitting...' },
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans transition-all duration-300">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-lg overflow-hidden animate-in zoom-in-100 duration-300">
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#6366f1]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{text.title[language]}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5 truncate max-w-[250px]">{text.subtitle[language]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-start">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
                {text.uploadLabel[language]}
              </label>

              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-[24px] p-6 flex flex-col items-center justify-center transition-all ${selectedFile ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 group-hover:bg-white group-hover:border-indigo-100'
                  }`}>
                  {selectedFile ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-indigo-500">
                        <File className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-1">{selectedFile.name}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-300">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-1 text-center">{text.dragLabel[language]}</p>
                      <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Supports all files</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-7 py-3.5 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all"
              >
                {text.cancel[language]}
              </button>
              <button
                type="submit"
                disabled={!selectedFile || submitMutation.isPending}
                className="flex-[2] px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                {submitMutation.isPending ? text.loading[language] : text.submit[language]}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
