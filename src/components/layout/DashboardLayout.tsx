import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { DashboardLayoutProps } from '../../types/dashboardLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language } = useLanguage();

  const isRtl = language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="teacher"
        isCollapsed={isCollapsed}
      />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ${isCollapsed ? 'lg:ms-20' : 'lg:ms-72'}`}>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
