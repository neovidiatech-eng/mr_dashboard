import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];

  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      <button
        onClick={toggleLanguage}
        title={currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        className="flex items-center gap-2 px-3.5 py-2 bg-white/90 backdrop-blur-sm border border-gray-200
                   rounded-xl shadow-md hover:shadow-lg hover:border-primary/40 hover:bg-white
                   transition-all duration-200 group"
      >
        <Globe
          className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors duration-200"
        />
        <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors duration-200">
          {currentLang === 'ar' ? 'English' : 'عربي'}
        </span>
      </button>
    </div>
  );
}
