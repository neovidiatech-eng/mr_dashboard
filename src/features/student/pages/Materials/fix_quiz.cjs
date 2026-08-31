const fs = require('fs'); 
let code = fs.readFileSync('c:\\\\My Work\\\\mr_dashboard\\\\src\\\\components\\\\modals\\\\TakeQuizModal.tsx', 'utf8');

code = code.replace(/import \{ useLanguage \} from "\.\.\/\.\.\/contexts\/LanguageContext";/g, 'import { useLanguage } from "../../../../contexts/LanguageContext";'); 
code = code.replace(/import \{ useQuizById, useSubmitQuiz \} from "\.\.\/\.\.\/hooks\/useQuizzes";/g, 'import { useQuizById, useSubmitQuiz } from "../../../../hooks/useQuizzes";'); 
code = code.replace(/import ErrorService from "\.\.\/\.\.\/utils\/ErrorService";/g, 'import ErrorService from "../../../../utils/ErrorService";'); 

code = code.replace('import { useState, useMemo } from "react";', 'import { useState } from "react";'); 
code = code.replace('import { X, Clock, CheckCircle2, XCircle, AlertTriangle, Award, RotateCcw } from "lucide-react";', 'import { ArrowLeft, CheckCircle2, XCircle, Award, RotateCcw } from "lucide-react";\nimport { useParams, useNavigate } from "react-router-dom";'); 

code = code.replace(/interface TakeQuizModalProps \{[\s\S]*?\}/, ''); 
code = code.replace(/export default function TakeQuizModal[^{]*\{/g, 'export default function TakeQuizPage() {\n  const { quizId } = useParams();\n  const navigate = useNavigate();'); 
code = code.replace('if (!isOpen || !quizId) return null;', 'if (!quizId) return null;'); 

code = code.replace(/const q = \(quiz\.questions \|\| \[\]\)\.find\(\(q\) =>/g, 'const q = (quiz.questions || []).find((q: any) =>'); 
code = code.replace(/const selectedOpt = \(q\?\.options \|\| \[\]\)\.find\(\(o\) =>/g, 'const selectedOpt = (q?.options || []).find((o: any) =>'); 
code = code.replace(/const correctOpt = \(q\?\.options \|\| \[\]\)\.find\(\(o\) =>/g, 'const correctOpt = (q?.options || []).find((o: any) =>'); 
code = code.replace(/\(quiz\.questions \|\| \[\]\)\.map\(\(q, qIndex\)/g, '(quiz.questions || []).map((q: any, qIndex: number)'); 
code = code.replace(/\(q\.options \|\| \[\]\)\.map\(\(opt\)/g, '(q.options || []).map((opt: any)'); 
code = code.replace(/\(quiz\.questions \|\| \[\]\)\.map\(\(q\) =>/g, '(quiz.questions || []).map((q: any) =>'); 

code = code.replace(/<div className="fixed inset-0 bg-black\/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">/, '<div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">\n      <button\n        onClick={() => navigate(-1)}\n        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-6">\n        <ArrowLeft size={16} />\n        {isAr ? "الرجوع للكورس" : "Back to Course"}\n      </button>'); 
code = code.replace(/<div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-\[90vh\] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">/, '<div className="bg-white rounded-3xl shadow-xl w-full flex flex-col overflow-hidden border border-slate-100">'); 
code = code.replace(/<button[\s\S]*?onClick=\{[\s\S]*?onClose\(\);[\s\S]*?\}[\s\S]*?<X className="w-5 h-5" \/>\s*<\/button>/, ''); 
code = code.replace(/if \(onSubmitted\) onSubmitted\(\);/, ''); 
code = code.replace(/<button\s+type="button"\s+onClick=\{onClose\}[\s\S]*?<\/button>/, '<button\n              type="button"\n              onClick={() => navigate(-1)}\n              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"\n            >\n              {isAr ? "الرجوع" : "Go Back"}\n            </button>'); 

fs.writeFileSync('c:\\\\My Work\\\\mr_dashboard\\\\src\\\\features\\\\student\\\\pages\\\\Materials\\\\TakeQuizPage.tsx', code);
