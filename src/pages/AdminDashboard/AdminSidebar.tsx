import { useState } from 'react';
import {
  X,
  LogOut,
  LayoutDashboard,
  UserPlus,
  PlayCircle,
  BookOpen,
  Settings,
  HelpCircle,
  User,
  Clock,
  Trophy,
  Layers,
  ShieldCheck,
  File,
  DollarSign,
  Coins,
  CreditCard,
  Repeat,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Box,
  Users,
  FolderOpen,
  FileText
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SidebarToggle from '../../components/layout/SidebarToggle';
import { filterAdminRoutesByPermissions } from '../../utils/auth';
import { adminDashboardRoutes } from './adminDashboardRoutes';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const visibleRoutes = filterAdminRoutesByPermissions(adminDashboardRoutes);

  const hasRouteAccess = (routeId: string) => {
    const role = localStorage.getItem('role');
    if (role === 'super_admin' || role === 'admin') return true;

    return visibleRoutes.some(route => {
      if (route.id === routeId) return true;
      if (route.subItems) {
        return route.subItems.some(subItem => subItem.id === routeId);
      }
      return false;
    });
  };

  const toggleExpanded = (item: string) => {
    setExpandedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full bg-white border-${language === 'ar' ? 'l' : 'r'} border-gray-200 ${isCollapsed ? 'w-20' : 'w-72'} transform transition-all duration-300 z-50 lg:translate-x-0 ${isOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full' : '-translate-x-full'
          }`}
      >
        {/* Toggle Button for Desktop */}
        <div className="hidden lg:block">
          <SidebarToggle
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className={`p-6 mb-2 flex items-center gap-3 transition-all ${isCollapsed ? 'px-4 justify-center' : ''}`}>
          <div className={`text-left transition-all duration-300 ${isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100'}`}>
            <h2 className="text-xl font-black text-gray-900 tracking-tight whitespace-nowrap">Mr Mahmoud</h2>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col h-[calc(100vh-100px)]">
          <nav className="p-4 flex-1 overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              {hasRouteAccess('dashboard') && (
                <NavLink
                  to="/dashboard"
                  end
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Dashboard" : ''}
                >
                  <LayoutDashboard className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_dashboard', 'Dashboard')}</span>}
                </NavLink>
              )}
              {hasRouteAccess('sessions') && (
                <NavLink
                  to="/dashboard/sessions"
                  onClick={onClose}
                  className={({ isActive }) => `
                                  w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                                  ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                                `}
                  title={isCollapsed ? "Sessions" : ''}
                >
                  <PlayCircle className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_sessions', 'Sessions')}</span>}
                </NavLink>
              )}

              {hasRouteAccess('curriculum') && (
                <NavLink
                  to="/dashboard/curriculum"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Curriculum" : ''}
                >
                  <BookOpen className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_courses', 'Curriculum')}</span>}
                </NavLink>
              )}
              {hasRouteAccess('students') && (
                <NavLink
                  to="/dashboard/students"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Students" : ''}
                >
                  <User className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_students', 'Students')}</span>}
                </NavLink>
              )}
              {hasRouteAccess('requests') && (
                <NavLink
                  to="/dashboard/requests"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Requests" : ''}
                >
                  <UserPlus className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_requests', 'Requests')}</span>}
                </NavLink>
              )}
              {hasRouteAccess('teachers') && (
                <NavLink
                  to="/dashboard/teachers"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Teachers" : ''}
                >
                  <User className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_teachers', 'Teachers')}</span>}
                </NavLink>
              )}

              {hasRouteAccess('teacher-availability') && (
                <NavLink
                  to="/dashboard/teacher-availability"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Teacher Availability" : ''}
                >
                  <Clock className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_teacher_availability', 'Teacher Availability')}</span>}
                </NavLink>
              )}

              {hasRouteAccess('plans') && (
                <NavLink
                  to="/dashboard/plans"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Plans" : ''}
                >
                  <Box className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_plans', 'Plans')}</span>}
                </NavLink>
              )}

              {hasRouteAccess('posts') && (
                <NavLink
                  to="/dashboard/posts"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Posts" : ''}
                >
                  <FileText className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>Posts</span>}
                </NavLink>
              )}

              {hasRouteAccess('ranks') && (
                <NavLink
                  to="/dashboard/ranks"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Ranks" : ''}
                >
                  <Trophy className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_ranks', 'Ranks')}</span>}
                </NavLink>
              )}




              {hasRouteAccess('assignments') && (
                <NavLink
                  to="/dashboard/assignments"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Assignments" : ''}
                >
                  <FolderOpen className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_assignments', 'Assignments')}</span>}
                </NavLink>
              )}
              {hasRouteAccess('admins') && (
                <NavLink
                  to="/dashboard/admins"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Stuff" : ''}
                >
                  <Users className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_admins', 'Staff')}</span>}
                </NavLink>
              )}
              {hasRouteAccess('roles') && (
                <NavLink
                  to="/dashboard/roles"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Roles" : ''}
                >
                  <Users className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_roles', 'Roles')}</span>}
                </NavLink>
              )}
              {hasRouteAccess('all-subscriptions') && (
                <NavLink
                  to="/dashboard/all-subscriptions"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Library" : ''}
                >
                  <Layers className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_all_subscriptions', 'All subscriptions')}</span>}
                </NavLink>
              )}

              {hasRouteAccess('subscription-requests') && (
                <NavLink
                  to="/dashboard/subscription-requests"
                  onClick={onClose}
                  className={({ isActive }) => `
                    w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                    ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                  title={isCollapsed ? "Library" : ''}
                >
                  <Layers className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_subscription_requests', 'Subscription Requests')}</span>}
                </NavLink>
              )}



              {/* Finance Dropdown */}
              {(hasRouteAccess('currencies') ||
                hasRouteAccess('expenses') ||
                hasRouteAccess('transactions') ||
                hasRouteAccess('transaction-requests')) && (
                <div>
                  <button
                    onClick={() => {
                      toggleExpanded('finance');
                      if (isCollapsed) setIsCollapsed(false);
                    }}
                    className={`
                      w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                      ${expandedItems.includes('finance') ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                    `}
                    title={isCollapsed ? "Finance" : ''}
                  >
                    <DollarSign className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                    {!isCollapsed && (
                      <>
                        <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_finance', 'Finance')}</span>
                        {expandedItems.includes('finance') ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          language === 'ar' ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Sub Items */}
                  {!isCollapsed && expandedItems.includes('finance') && (
                    <div className={`mt-1 space-y-1 ${language === 'ar' ? 'pr-11' : 'pl-11'}`}>
                      {hasRouteAccess('currencies') && (
                        <NavLink
                          to="/dashboard/currencies"
                          onClick={onClose}
                          className={({ isActive }) => `
                            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                          `}
                        >
                          <Coins className="w-4 h-4" />
                          <span>{t('sidebar_currencies', 'Currencies')}</span>
                        </NavLink>
                      )}
                      {hasRouteAccess('expenses') && (
                        <NavLink
                          to="/dashboard/expenses"
                          onClick={onClose}
                          className={({ isActive }) => `
                            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                          `}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>{t('sidebar_expenses', 'Expenses')}</span>
                        </NavLink>
                      )}
                      {hasRouteAccess('transactions') && (
                        <NavLink
                          to="/dashboard/transactions"
                          onClick={onClose}
                          className={({ isActive }) => `
                            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                          `}
                        >
                          <Repeat className="w-4 h-4" />
                          <span>{t('sidebar_transactions', 'Transactions')}</span>
                        </NavLink>
                      )}
                      {hasRouteAccess('transaction-requests') && (
                        <NavLink
                          to="/dashboard/transaction-requests"
                          onClick={onClose}
                          className={({ isActive }) => `
                            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                          `}
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{t('sidebar_transaction_requests', 'Transaction Requests')}</span>
                        </NavLink>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </nav>

          {/* Sidebar Footer Section */}
          <div className="p-4 mt-auto space-y-2 border-t border-gray-100">

            {/* Reports */}

            {hasRouteAccess('teacher-reports') && (
              <NavLink
                to="/dashboard/reports"
                onClick={onClose}
                className={({ isActive }) => `
                w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
              `}
                title={isCollapsed ? "Reports" : ''}
              >
                <File className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_reports', 'Reports')}</span>}
              </NavLink>
            )}

            {/* Policies */}
            {hasRouteAccess('policies') && (
              <NavLink
                to="/dashboard/policies"
                onClick={onClose}
                className={({ isActive }) => `
                  w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                  ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                `}
                title={isCollapsed ? "Policies" : ''}
              >
                <ShieldCheck className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_policies', 'Policies')}</span>}
              </NavLink>
            )}


            {/* Settings */}
            {hasRouteAccess('settings') && (
              <NavLink
                to="/dashboard/settings"
                onClick={onClose}
                className={({ isActive }) => `
                  w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                  ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                `}
                title={isCollapsed ? "Settings" : ''}
              >
                <Settings className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_settings', 'Settings')}</span>}
              </NavLink>
            )}

            {/* Support */}
            {hasRouteAccess('support') && (
              <NavLink
                to="/dashboard/support"
                onClick={onClose}
                className={({ isActive }) => `
                  w-full flex items-center gap-4 ${isCollapsed ? 'justify-center px-2' : 'px-5'} py-3.5 rounded-xl font-bold transition-all
                  ${isActive ? 'bg-primary-light text-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                `}
                title={isCollapsed ? "Support" : ''}
              >
                <HelpCircle className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className={`text-sm flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('sidebar_support', 'Support')}</span>}
              </NavLink>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 py-3.5 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all mt-2 ${isCollapsed ? 'justify-center px-2' : 'px-5'}`}
              title={isCollapsed ? t('logout') : ''}
            >
              <LogOut className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && <span className="text-sm">{t('logout')}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
