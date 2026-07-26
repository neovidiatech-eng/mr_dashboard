import  { useMemo, useState } from 'react';
import { Search, Book, Video, FileQuestion, MessageCircle } from 'lucide-react';
import { useSupport } from '../../../hooks/useSupport';

export default function SupportPage() {
  const [search ,setSearch] = useState("")
  const { teacherSupports, isLoadingTeacherSupports } = useSupport();


  // Define static visual assets for categories
  const categoryStyles = [
    { icon: Book, color: 'blue' },
    { icon: Video, color: 'purple' },
    { icon: FileQuestion, color: 'green' },
    { icon: MessageCircle, color: 'orange' },
  ];

  // Flatten and get top 5 popular articles across all categories

 const filteredCategories = useMemo(() => {
  if (!search.trim()) return teacherSupports;

  return teacherSupports.filter((category) => {
    const categoryTitle = category.category.title.toLowerCase();

    const hasMatchingPopularArticle = category.popular.some((article) =>
      article.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
      categoryTitle.includes(search.toLowerCase()) ||
      hasMatchingPopularArticle
    );
  });
}, [teacherSupports, search]);

const popularArticles = useMemo(() => {
  const allArticles = teacherSupports.flatMap((cat) => cat.popular);

  if (!search.trim()) {
    return allArticles.slice(0, 5);
  }

  return allArticles.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase())
  );
}, [teacherSupports, search]);

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-12 p-7">
      {/* Header & Search */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-4 font-['Inter']">How can we help you?</h1>
        <p className="text-slate-400 font-medium mb-10">Search our knowledge base or browse categories below</p>
        
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={22} />
          </div>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search for help articles..." 
            className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-lg"
          />
        </div>
      </header>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {isLoadingTeacherSupports ? (
           <p className="text-center col-span-full text-slate-500">Loading support categories...</p>
        ) : (
          filteredCategories.map((supportCategory, i) => {
            const style = categoryStyles[i % categoryStyles.length];
            const Icon = style.icon;
            return (
              <div key={supportCategory.category.id} className="bg-white p-10 rounded-3xl border border-gray-100/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group cursor-pointer">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110
                  ${style.color === 'blue' ? 'bg-blue-50 text-blue-500' : 
                    style.color === 'purple' ? 'bg-purple-50 text-purple-500' :
                    style.color === 'green' ? 'bg-green-50 text-green-500' : 
                    'bg-orange-50 text-orange-500'}`}
                >
                  <Icon size={30} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{supportCategory.category.title}</h3>
                <p className="text-slate-400 text-sm font-medium">{supportCategory._count.id} articles</p>
              </div>
            );
          })
        )}
      </div>

      {/* Popular Articles Section */}
      <div className="bg-white rounded-3xl border border-gray-100/50 shadow-sm p-10 mb-16">
        <h2 className="text-xl font-bold text-slate-800 mb-8 px-2">Popular Articles</h2>
        <div className="space-y-2">
          {isLoadingTeacherSupports ? (
             <p className="text-slate-500 px-4">Loading popular articles...</p>
          ) : (
            popularArticles.map((article) => (
              <a 
                key={article.id} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-left p-4 rounded-xl flex items-center justify-between group hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-4 text-slate-500 group-hover:text-blue-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                     <FileQuestion size={20} className='text-blue-500' />
                  </div>
                  <span className="text-[15px] font-medium transition-colors">{article.title}</span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* Still need help Banner */}
      <div className="bg-[#E3EAF9] rounded-3xl border border-blue-100/30 p-12 text-center">
         <h2 className="text-2xl font-bold text-[#2563EB] mb-3">Still need help?</h2>
         <p className="text-gray-600/70 font-medium mb-8">Our support team is available 24/7 to assist you</p>
         <button className="bg-[#2563eb] text-white px-10 py-4 rounded-3xl font-bold flex items-center gap-3 mx-auto shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all translate-y-2 text-[12px] lg:text-[16px]">
            <MessageCircle size={25} />
            Contact Support
         </button>
      </div>
    </div>
  );
}