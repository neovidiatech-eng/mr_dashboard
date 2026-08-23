import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  FileText, 
  BookOpen, 
  Video, 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  Download, 
  PlayCircle, 
  Globe, 
  LogOut, 
  ArrowLeft,
  FileCheck,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type PortalTab = 'exams' | 'homework' | 'sessions' | 'courses' | 'attendance';

export default function StudentPortalView() {
  const { language, toggleLanguage } = useLanguage();
  const locale = language;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<PortalTab>('exams');
  const [examFilter, setExamFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [hwFilter, setHwFilter] = useState<'all' | 'pending' | 'submitted'>('all');

  // Student Info
  const student = {
    name: locale === 'ar' ? 'أحمد محمد عبد الله' : 'Ahmed Mohamed Abdallah',
    code: 'STU-8842',
    grade: locale === 'ar' ? 'الصف الثاني الثانوي - لغات' : '2nd Secondary Grade - Languages',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    gpa: '96.5%',
    attendanceRate: '98%',
    completedHw: '18/20',
    activeCoursesCount: 4,
  };

  // Mock Data: Exams
  const exams = [
    {
      id: 1,
      title: locale === 'ar' ? 'اختبار منتصف الفصل - الرياضيات (Calculus)' : 'Midterm Exam - Mathematics (Calculus)',
      subject: locale === 'ar' ? 'ماث وریاضیات' : 'Mathematics',
      date: '10 أغسطس 2026',
      time: '04:00 PM',
      duration: '60 دقيقة',
      totalQuestions: 30,
      score: '48 / 50',
      percentage: '96%',
      status: 'completed',
    },
    {
      id: 2,
      title: locale === 'ar' ? 'امتحان الفيزياء الشهري - الكهربية والمغناطيسية' : 'Monthly Physics Exam - Electricity & Magnetism',
      subject: locale === 'ar' ? 'فيزياء' : 'Physics',
      date: 'غداً - 11 أغسطس 2026',
      time: '05:30 PM',
      duration: '45 دقيقة',
      totalQuestions: 25,
      score: null,
      percentage: null,
      status: 'upcoming',
    },
    {
      id: 3,
      title: locale === 'ar' ? 'كويز الساينس والأحياء - الخلية الجينية' : 'Science & Biology Quiz - Cell Genetics',
      subject: locale === 'ar' ? 'ساينس وعلوم' : 'Science',
      date: '05 أغسطس 2026',
      time: '03:00 PM',
      duration: '30 دقيقة',
      totalQuestions: 20,
      score: '19 / 20',
      percentage: '95%',
      status: 'completed',
    },
    {
      id: 4,
      title: locale === 'ar' ? 'اختبار مهارات قواعد اللغة الإنجليزية' : 'English Grammar & Vocabulary Assessment',
      subject: locale === 'ar' ? 'لغة إنجليزية' : 'English',
      date: '15 أغسطس 2026',
      time: '06:00 PM',
      duration: '50 دقيقة',
      totalQuestions: 35,
      score: null,
      percentage: null,
      status: 'upcoming',
    },
  ];

  // Mock Data: Homework
  const homeworks = [
    {
      id: 1,
      title: locale === 'ar' ? 'واجب التفاضل والتكامل - تمارين التزايد والتناقص' : 'Calculus Homework - Derivatives & Monotonicity',
      subject: locale === 'ar' ? 'ماث وریاضیات' : 'Math',
      dueDate: '12 أغسطس 2026',
      status: 'pending',
      note: locale === 'ar' ? 'يرجى كتابة خطوات الحل التفصيلية وتوضيح قوانين الاشتقاق' : 'Please provide step-by-step solutions with derivative formulas.',
    },
    {
      id: 2,
      title: locale === 'ar' ? 'حل مسألة قوانين نيوتن ومقاومة الهواء' : 'Newton’s Laws & Air Resistance Problems',
      subject: locale === 'ar' ? 'فيزياء' : 'Physics',
      dueDate: '08 أغسطس 2026',
      status: 'submitted',
      score: '10 / 10',
      note: locale === 'ar' ? 'إجابة نموذجية وخط ممتاز! أحسنت يا أحمد' : 'Excellent answer and clear steps! Well done Ahmed.',
    },
    {
      id: 3,
      title: locale === 'ar' ? 'موضوع تعبير وترجمة النص العلمي' : 'English Translation & Essay Writing',
      subject: locale === 'ar' ? 'لغة إنجليزية' : 'English',
      dueDate: '14 أغسطس 2026',
      status: 'pending',
      note: locale === 'ar' ? 'كتابة مقال من 150 كلمة عن التكنولوجيا الحيوية' : 'Write a 150-word essay about biotechnology.',
    },
    {
      id: 4,
      title: locale === 'ar' ? 'حل نماذج الامتحانات الاسترشادية - الوحدة الأولى' : 'Sample Exam Worksheets - Unit 1',
      subject: locale === 'ar' ? 'ساينس وعلوم' : 'Science',
      dueDate: '04 أغسطس 2026',
      status: 'submitted',
      score: '9.5 / 10',
      note: locale === 'ar' ? 'ممتاز، انتبه للتحويلات بين الوحدات في السؤال الأخير' : 'Great job, pay attention to unit conversions in the last question.',
    },
  ];

  // Mock Data: Live Sessions
  const sessions = [
    {
      id: 1,
      title: locale === 'ar' ? 'حصة مراجعة الجبر والهندسة الفضائية 1:1' : '1:1 Live Review: Algebra & Solid Geometry',
      subject: locale === 'ar' ? 'ماث وریاضیات' : 'Mathematics',
      tutor: locale === 'ar' ? 'أستاذ محمود' : 'Mr. Mahmoud',
      date: locale === 'ar' ? 'اليوم - 10 أغسطس' : 'Today - Aug 10',
      time: '06:00 PM - 07:30 PM',
      isLive: true,
      zoomUrl: 'https://zoom.us',
    },
    {
      id: 2,
      title: locale === 'ar' ? 'حل الأسئلة الصعبة في الحركة والتسارع' : 'Solving Advanced Motion & Acceleration Problems',
      subject: locale === 'ar' ? 'فيزياء' : 'Physics',
      tutor: locale === 'ar' ? 'أستاذ محمود' : 'Mr. Mahmoud',
      date: locale === 'ar' ? 'الأربعاء - 12 أغسطس' : 'Wednesday - Aug 12',
      time: '05:00 PM - 06:30 PM',
      isLive: false,
      zoomUrl: 'https://zoom.us',
    },
    {
      id: 3,
      title: locale === 'ar' ? 'تسجيل حصة التأسيس الأكاديمي والتحليل الرياضياتي' : 'Recorded Class: Academic Foundation & Mathematical Analysis',
      subject: locale === 'ar' ? 'ماث وریاضیات' : 'Mathematics',
      tutor: locale === 'ar' ? 'أستاذ محمود' : 'Mr. Mahmoud',
      date: '07 أغسطس 2026',
      time: 'ساعة و20 دقيقة',
      isRecorded: true,
      videoUrl: '#',
    },
  ];

  // Mock Data: Courses
  const courses = [
    {
      id: 1,
      title: locale === 'ar' ? 'كورس الرياضيات الشامل (Calculus & Algebra)' : 'Comprehensive Mathematics (Calculus & Algebra)',
      instructor: locale === 'ar' ? 'أستاذ محمود' : 'Mr. Mahmoud',
      progress: 85,
      completedLessons: 24,
      totalLessons: 28,
      category: locale === 'ar' ? 'ماث وریاضیات' : 'Math',
      pdfWorksheet: 'math_unit2_summary.pdf',
    },
    {
      id: 2,
      title: locale === 'ar' ? 'كورس الفيزياء الحديثة والتأسيس المعملي' : 'Modern Physics & Lab Foundation',
      instructor: locale === 'ar' ? 'أستاذ محمود' : 'Mr. Mahmoud',
      progress: 70,
      completedLessons: 14,
      totalLessons: 20,
      category: locale === 'ar' ? 'فيزياء' : 'Physics',
      pdfWorksheet: 'physics_laws_sheet.pdf',
    },
    {
      id: 3,
      title: locale === 'ar' ? 'كورس مهارات الساينس والمفاهيم العلمية' : 'Science Skills & Scientific Concepts',
      instructor: locale === 'ar' ? 'أستاذ محمود' : 'Mr. Mahmoud',
      progress: 92,
      completedLessons: 22,
      totalLessons: 24,
      category: locale === 'ar' ? 'ساينس وعلوم' : 'Science',
      pdfWorksheet: 'science_review_notes.pdf',
    },
  ];

  // Mock Data: Attendance
  const attendanceLogs = [
    { id: 1, date: '10 أغسطس 2026', session: 'حصة الرياضيات 1:1', status: 'present', note: 'حضور في الموعد وتفاعل ممتاز' },
    { id: 2, date: '08 أغسطس 2026', session: 'حصة الفيزياء المباشرة', status: 'present', note: 'التزام تام وإجابة جميع الأسئلة' },
    { id: 3, date: '05 أغسطس 2026', session: 'حصة الساينس والمراجعة', status: 'present', note: 'حضور منظم' },
    { id: 4, date: '02 أغسطس 2026', session: 'حصة اللغة الإنجليزية 1:1', status: 'excused', note: 'تأجيل بإذن سابق مسبق من ولي الأمر' },
    { id: 5, date: '30 يوليو 2026', session: 'حصة مراجعة ماث قبل الكويز', status: 'present', note: 'حضور متميز' },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-burgundy selection:text-white pb-20" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Standalone Student Portal Header */}
      <header className="bg-gradient-to-r from-burgundy-dark via-burgundy to-burgundy-light text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Student Info & Portal Branding */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={student.avatar} 
                  alt={student.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-burgundy-dark rounded-full" title="Online" />
              </div>

              <div className="space-y-0.5 text-start">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{student.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30">
                    {student.code}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200 font-light flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-300 inline-block" />
                  <span>{student.grade}</span>
                </p>
              </div>
            </div>

            {/* Top Action Buttons (Language, Back to Site, Logout) */}
            <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center">
              
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold transition backdrop-blur-md"
              >
                <Globe className="w-4 h-4 text-amber-300" />
                <span>{locale === 'ar' ? 'English' : 'عربي'}</span>
              </button>

              <Link
                to="/"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold transition backdrop-blur-md"
              >
                <ArrowLeft className={`w-4 h-4 text-amber-300 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                <span>{locale === 'ar' ? 'الموقع الرئيسي' : 'Public Site'}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs sm:text-sm font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{locale === 'ar' ? 'خروج' : 'Logout'}</span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Main Student Portal Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Quick Performance Overview KPI Cards Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-start">
              <p className="text-xs text-gray-500 font-medium">{locale === 'ar' ? 'المعدل الأكاديمي' : 'Academic GPA'}</p>
              <h3 className="text-xl font-black text-gray-900">{student.gpa}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="text-start">
              <p className="text-xs text-gray-500 font-medium">{locale === 'ar' ? 'الواجبات المكتملة' : 'Completed HW'}</p>
              <h3 className="text-xl font-black text-gray-900">{student.completedHw}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
              <Video className="w-6 h-6" />
            </div>
            <div className="text-start">
              <p className="text-xs text-gray-500 font-medium">{locale === 'ar' ? 'الكورسات الحالية' : 'Active Courses'}</p>
              <h3 className="text-xl font-black text-gray-900">{student.activeCoursesCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
            <div className="p-3.5 rounded-2xl bg-burgundy-light text-burgundy">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="text-start">
              <p className="text-xs text-gray-500 font-medium">{locale === 'ar' ? 'نسبة الحضور' : 'Attendance'}</p>
              <h3 className="text-xl font-black text-gray-900">{student.attendanceRate}</h3>
            </div>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100/90 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            
            {/* Tab 1: Exams */}
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'exams'
                  ? 'bg-gradient-to-r from-burgundy-dark to-burgundy text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{locale === 'ar' ? 'امتحانات' : 'Exams'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'exams' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {exams.length}
              </span>
            </button>

            {/* Tab 2: Homework */}
            <button
              onClick={() => setActiveTab('homework')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'homework'
                  ? 'bg-gradient-to-r from-burgundy-dark to-burgundy text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{locale === 'ar' ? 'واجبات' : 'Homework'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'homework' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {homeworks.filter(h => h.status === 'pending').length} معلق
              </span>
            </button>

            {/* Tab 3: Live Sessions */}
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'sessions'
                  ? 'bg-gradient-to-r from-burgundy-dark to-burgundy text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{locale === 'ar' ? 'حصص' : 'Sessions'}</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </button>

            {/* Tab 4: Courses */}
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'courses'
                  ? 'bg-gradient-to-r from-burgundy-dark to-burgundy text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{locale === 'ar' ? 'كورسات' : 'Courses'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'courses' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {courses.length}
              </span>
            </button>

            {/* Tab 5: Attendance */}
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-burgundy-dark to-burgundy text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{locale === 'ar' ? 'حضور' : 'Attendance'}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {student.attendanceRate}
              </span>
            </button>

          </div>
        </div>

        {/* Tab 1 Content: EXAMS */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            
            {/* Filter Pills Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-burgundy" />
                <span>{locale === 'ar' ? 'جدول ونتائج الامتحانات' : 'Exams & Results'}</span>
              </h2>

              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-200 text-xs font-bold">
                <button
                  onClick={() => setExamFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${examFilter === 'all' ? 'bg-burgundy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {locale === 'ar' ? 'الكل' : 'All'}
                </button>
                <button
                  onClick={() => setExamFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-xl transition ${examFilter === 'upcoming' ? 'bg-burgundy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {locale === 'ar' ? 'القادمة' : 'Upcoming'}
                </button>
                <button
                  onClick={() => setExamFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl transition ${examFilter === 'completed' ? 'bg-burgundy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {locale === 'ar' ? 'المكتملة' : 'Completed'}
                </button>
              </div>
            </div>

            {/* Exam Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams
                .filter(e => examFilter === 'all' || e.status === examFilter)
                .map((exam) => (
                  <div 
                    key={exam.id}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition space-y-4 text-start"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-burgundy-light text-burgundy border border-burgundy/10">
                        {exam.subject}
                      </span>

                      {exam.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'تم الاختبار' : 'Completed'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'موعد قادم' : 'Upcoming'}</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 text-lg">{exam.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-3">
                        <span>🗓️ {exam.date}</span>
                        <span>⏰ {exam.time}</span>
                        <span>⏱️ {exam.duration}</span>
                      </p>
                    </div>

                    {exam.status === 'completed' ? (
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">{locale === 'ar' ? 'الدرجة الحاصل عليها:' : 'Score:'}</p>
                          <p className="text-lg font-black text-emerald-600">{exam.score} ({exam.percentage})</p>
                        </div>
                        <button 
                          onClick={() => alert(`تقرير إجابات ${exam.title}:\nالدرجة: ${exam.score}\nالتقدير: ممتاز`)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
                        >
                          {locale === 'ar' ? 'عرض التقرير التفصيلي' : 'View Breakdown'}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {exam.totalQuestions} {locale === 'ar' ? 'سؤال تفاعلي' : 'Questions'}
                        </span>
                        <button 
                          onClick={() => alert(`بدء اختبار: ${exam.title}`)}
                          className="px-5 py-2.5 bg-burgundy hover:bg-burgundy-dark text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                        >
                          {locale === 'ar' ? 'بدء الامتحان الآن' : 'Start Exam Now'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* Tab 2 Content: HOMEWORK */}
        {activeTab === 'homework' && (
          <div className="space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-burgundy" />
                <span>{locale === 'ar' ? 'الواجبات والتكليفات الدراسية' : 'Homework & Tasks'}</span>
              </h2>

              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-200 text-xs font-bold">
                <button
                  onClick={() => setHwFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${hwFilter === 'all' ? 'bg-burgundy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {locale === 'ar' ? 'الكل' : 'All'}
                </button>
                <button
                  onClick={() => setHwFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl transition ${hwFilter === 'pending' ? 'bg-burgundy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {locale === 'ar' ? 'المعلقة' : 'Pending'}
                </button>
                <button
                  onClick={() => setHwFilter('submitted')}
                  className={`px-3 py-1.5 rounded-xl transition ${hwFilter === 'submitted' ? 'bg-burgundy text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {locale === 'ar' ? 'تم التسليم' : 'Submitted'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {homeworks
                .filter(h => hwFilter === 'all' || h.status === hwFilter)
                .map((hw) => (
                  <div 
                    key={hw.id}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition space-y-4 text-start"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${hw.status === 'submitted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-burgundy">{hw.subject}</span>
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg">{hw.title}</h3>
                        </div>
                      </div>

                      {hw.status === 'submitted' ? (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1 self-start sm:self-center">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{locale === 'ar' ? 'تم التسليم والتصحيح' : 'Submitted'}</span>
                        </span>
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1 self-start sm:self-center">
                          <AlertCircle className="w-4 h-4" />
                          <span>{locale === 'ar' ? 'آخر موعد:' : 'Due:'} {hw.dueDate}</span>
                        </span>
                      )}
                    </div>

                    {/* Note Box */}
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-600">
                      <span className="font-bold text-gray-800">{locale === 'ar' ? 'ملاحظة المعلم:' : 'Teacher Note:'} </span>
                      <span>{hw.note}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {hw.score && (
                        <span className="text-sm font-bold text-emerald-600">
                          {locale === 'ar' ? 'الدرجة:' : 'Score:'} {hw.score}
                        </span>
                      )}

                      {hw.status === 'pending' ? (
                        <button
                          onClick={() => alert(`تسليم الواجب: ${hw.title}`)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-burgundy hover:bg-burgundy-dark text-white font-bold rounded-xl text-xs sm:text-sm transition active:scale-95 ms-auto"
                        >
                          <Download className="w-4 h-4" />
                          <span>{locale === 'ar' ? 'رفع وإرسال الحل' : 'Upload Assignment'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`تنزيل النموذج المصحح للواجب ${hw.id}`)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                        >
                          <Download className="w-4 h-4" />
                          <span>{locale === 'ar' ? 'تنزيل التقرير' : 'Download Report'}</span>
                        </button>
                      )}
                    </div>

                  </div>
                ))}
            </div>

          </div>
        )}

        {/* Tab 3 Content: SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-start">
              <Video className="w-5 h-5 text-burgundy" />
              <span>{locale === 'ar' ? 'الحصص المباشرة والدرس الفردي 1:1' : 'Live & Recorded Sessions'}</span>
            </h2>

            {/* Live Upcoming Session Hero Card */}
            {sessions.filter(s => s.isLive).map(session => (
              <div key={session.id} className="relative overflow-hidden bg-gradient-to-r from-burgundy-dark via-burgundy to-burgundy-light text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 text-start">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>{locale === 'ar' ? 'حصة مباشرة اليوم' : 'Live Today'}</span>
                  </span>
                  <span className="text-xs text-amber-300 font-bold">{session.subject}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black">{session.title}</h3>
                  <p className="text-sm text-gray-200 flex items-center gap-4">
                    <span>👨‍🏫 {session.tutor}</span>
                    <span>⏰ {session.time}</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-200">
                    {locale === 'ar' ? 'رابط الدعم المباشر للحصة جاهز' : 'Room is ready for entry'}
                  </span>
                  <a
                    href={session.zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg transition active:scale-95 text-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'دخول الحصة الآن 🔴' : 'Join Class Now'}</span>
                  </a>
                </div>
              </div>
            ))}

            {/* Session Schedule List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4 text-start">
              <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">
                {locale === 'ar' ? 'أرشيف وجدول الحصص' : 'Sessions Archive & Schedule'}
              </h3>

              <div className="space-y-3">
                {sessions.map(s => (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-burgundy">{s.subject}</span>
                        <span className="text-xs text-gray-400">• {s.date}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-base">{s.title}</h4>
                      <p className="text-xs text-gray-500">{s.time} | {s.tutor}</p>
                    </div>

                    <div>
                      {s.isRecorded ? (
                        <button
                          onClick={() => alert(`تشغيل فيديو التسجيل للحصة: ${s.title}`)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-burgundy-light text-burgundy font-bold rounded-xl text-xs hover:bg-burgundy/20 transition"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>{locale === 'ar' ? 'مشاهدة التسجيل' : 'Watch Recording'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-gray-500 px-3 py-1.5 rounded-xl bg-white border border-gray-200">
                          {s.isLive ? 'جارية الآن' : 'مجدولة'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4 Content: COURSES */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-start">
              <GraduationCap className="w-5 h-5 text-burgundy" />
              <span>{locale === 'ar' ? 'الكورسات والمناهج المسجلة' : 'Enrolled Courses & Curricula'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map(c => (
                <div key={c.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition space-y-4 text-start flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-burgundy-light text-burgundy">
                      {c.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug">{c.title}</h3>
                    <p className="text-xs text-gray-500">👨‍🏫 {c.instructor}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-600">{locale === 'ar' ? 'نسبة الإنجاز:' : 'Progress:'}</span>
                        <span className="text-burgundy">{c.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-burgundy-light to-burgundy rounded-full transition-all duration-500" 
                          style={{ width: `${c.progress}%` } as React.CSSProperties}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-end">{c.completedLessons} من {c.totalLessons} درس</p>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`تحميل ملخص المذكرة ${c.pdfWorksheet}`)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-2xl text-xs transition border border-gray-200"
                  >
                    <Download className="w-4 h-4 text-burgundy" />
                    <span>{locale === 'ar' ? 'تنزيل المذكرة والملخص PDF' : 'Download PDF Summary'}</span>
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 5 Content: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-start">
                <CalendarCheck className="w-5 h-5 text-burgundy" />
                <span>{locale === 'ar' ? 'سجل الحضور والانضباط الأكاديمي' : 'Attendance & Discipline Record'}</span>
              </h2>
            </div>

            {/* Attendance Summary Banner */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs text-emerald-700 font-bold">{locale === 'ar' ? 'الحصص المحضورة' : 'Attended Sessions'}</p>
                <h4 className="text-2xl font-black text-emerald-800 mt-1">24 حصة</h4>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs text-amber-700 font-bold">{locale === 'ar' ? 'غياب بعذر' : 'Excused Absences'}</p>
                <h4 className="text-2xl font-black text-amber-800 mt-1">1 حصة</h4>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-xs text-rose-700 font-bold">{locale === 'ar' ? 'غياب بدون عذر' : 'Unexcused Absences'}</p>
                <h4 className="text-2xl font-black text-rose-800 mt-1">0</h4>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden text-start">
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                {locale === 'ar' ? 'تفاصيل السجل التاريخي' : 'Attendance History'}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-start">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-3 px-3 font-bold">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                      <th className="pb-3 px-3 font-bold">{locale === 'ar' ? 'الحصة الدراسية' : 'Session'}</th>
                      <th className="pb-3 px-3 font-bold">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="pb-3 px-3 font-bold">{locale === 'ar' ? 'ملاحظات المعلم' : 'Teacher Notes'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3.5 px-3 font-semibold text-gray-900">{log.date}</td>
                        <td className="py-3.5 px-3 text-gray-700 font-medium">{log.session}</td>
                        <td className="py-3.5 px-3">
                          {log.status === 'present' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{locale === 'ar' ? 'حاضر' : 'Present'}</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{locale === 'ar' ? 'بعذر' : 'Excused'}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-gray-600 text-xs">{log.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
