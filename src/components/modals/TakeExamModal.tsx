import { useState, useEffect } from 'react';
import { X, Clock, ArrowRight, ArrowLeft, Send } from 'lucide-react';

interface TakeExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle?: string;
}

export default function TakeExamModal({ isOpen, onClose, examTitle = "JavaScript Basics Quiz" }: TakeExamModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(24 * 60 + 35); // 24:35 in seconds
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const totalQuestions = 10;
  
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-[#800020] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ClipboardListIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{examTitle}</h2>
              <div className="flex items-center gap-3 text-white/80 text-xs mt-1 font-medium">
                <span>Duration: 30 Minutes</span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <span>Total Questions: {totalQuestions}</span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <span>Total Points: 10</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* Left Panel: Question & Timer */}
          <div className="flex-1 flex flex-col border-r border-slate-100 overflow-y-auto">
            {/* Top Bar */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#800020]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Time Remaining</p>
                  <p className="text-xl font-black text-[#800020]">{formatTime(timeLeft)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Question</p>
                <p className="text-lg font-bold text-slate-800">
                  <span className="text-[#800020] text-xl font-black">{currentQuestion}</span> of {totalQuestions}
                </p>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-red-50 text-[#800020] rounded-full text-xs font-bold tracking-wide">
                  Multiple Choice (MCQ)
                </span>
                <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold tracking-wide border border-slate-100">
                  1 Point
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-2">What is React?</h3>
              <p className="text-slate-500 mb-8 text-sm">Choose the correct answer from the options below.</p>

              <div className="space-y-4">
                {[
                  "A JavaScript library for building user interfaces",
                  "A database management system",
                  "A programming language",
                  "An operating system",
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(currentQuestion, idx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      answers[currentQuestion] === idx 
                        ? 'border-[#800020] bg-red-50/30' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[currentQuestion] === idx ? 'border-[#800020]' : 'border-slate-300'
                    }`}>
                      {answers[currentQuestion] === idx && <div className="w-2.5 h-2.5 rounded-full bg-[#800020]" />}
                    </div>
                    <span className={`text-base font-medium ${answers[currentQuestion] === idx ? 'text-[#800020]' : 'text-slate-700'}`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <button 
                onClick={() => setCurrentQuestion(prev => Math.max(1, prev - 1))}
                disabled={currentQuestion === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button 
                onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions, prev + 1))}
                disabled={currentQuestion === totalQuestions}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[#800020] text-white hover:bg-[#600018] disabled:opacity-50 transition-all shadow-lg shadow-red-900/20"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Panel: Navigation & Instructions */}
          <div className="w-full lg:w-[320px] bg-slate-50/50 flex flex-col shrink-0">
            {/* Question Grid */}
            <div className="p-6 border-b border-slate-200">
              <h4 className="text-sm font-bold text-[#800020] mb-4">Question Navigation</h4>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }).map((_, i) => {
                  const qNum = i + 1;
                  const isCurrent = currentQuestion === qNum;
                  const isAnswered = answers[qNum] !== undefined;
                  
                  return (
                    <button
                      key={qNum}
                      onClick={() => setCurrentQuestion(qNum)}
                      className={`relative h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all border ${
                        isCurrent 
                          ? 'bg-[#800020] text-white border-[#800020] shadow-md' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-[#800020]'
                      }`}
                    >
                      {qNum}
                      {!isCurrent && isAnswered && (
                        <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#800020]" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-slate-300 bg-white" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Not Answered</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-6 flex-1">
              <h4 className="text-sm font-bold text-[#800020] mb-4">Exam Instructions</h4>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#800020] shrink-0 mt-1.5" />
                  Read each question carefully.
                </li>
                <li className="flex gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#800020] shrink-0 mt-1.5" />
                  You can navigate between questions using the numbers above.
                </li>
                <li className="flex gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#800020] shrink-0 mt-1.5" />
                  Your progress is automatically saved.
                </li>
                <li className="flex gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#800020] shrink-0 mt-1.5" />
                  Click "Submit Exam" when you are finished.
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="p-6 pt-0">
              <button 
                onClick={() => {
                  alert("Exam submitted!");
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-[#800020] hover:bg-[#600018] transition-all shadow-lg shadow-red-900/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClipboardListIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}
