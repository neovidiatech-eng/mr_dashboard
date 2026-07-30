import { Bell, LogOut, Menu } from "lucide-react";

import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../features/student/hooks/useProfile";
import { useTeacherProfile } from "../../features/teacher/hooks/useTeacherProfile";
import { disconnectSocket } from "../../lib/socket";
import MiniHeaderTimer from "../ui/Counter";

interface HeaderProps {
  onMenuClick?: () => void;
  userRole: "admin" | "teacher" | "student";
  userName?: string;
  userEmail?: string;
  isCollapsed?: boolean;
}

export default function Header({
  onMenuClick,
  userRole,
  userName,
  isCollapsed,
}: HeaderProps) {

  const isStudent = userRole === "student";
  const isTeacher = userRole === "teacher";

  const { data: profileResponse } = useProfile({
    enabled: isStudent
  });

  const { data: teacherProfileResponse } = useTeacherProfile({
    enabled: isTeacher
  });

  const profileData = profileResponse?.data;
  const teacherData = teacherProfileResponse?.data?.teacher;

  const marginClass = useMemo(() => {
    if (userRole === "student") return "";
    return isCollapsed ? "lg:ml-20" : "lg:ml-72";
  }, [userRole, isCollapsed]);

  const isTeacherOrStudent = isTeacher || isStudent;
  const navigate = useNavigate();

  const userInfo = useMemo(() => {
    if (isStudent) {
      return {
        name: profileData?.user?.name || userName || "---",
        subtext: profileData?.plan?.name || "Free Plan",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.user?.name || userName || "U")}&background=800020&color=fff&bold=true`,
        path: "/student-dashboard/profile"
      };
    }
    if (isTeacher) {
      return {
        name: teacherData?.name || userName || "---",
        subtext: "Teacher",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherData?.name || userName || "T")}&background=800020&color=fff&bold=true`,
        path: "/teacher-dashboard/profile"
      };
    }

    const rawRole = localStorage.getItem("role") || userRole;
    const roleDisplayName = rawRole
      ? rawRole
          .split(/[-_]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Admin";

    return {
      name: userName || "---",
      subtext: roleDisplayName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "U")}&background=800020&color=fff&bold=true`,
      path: "/dashboard"
    };
  }, [isStudent, isTeacher, profileData, teacherData, userName, userRole]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    disconnectSocket();
    navigate("/");
  }, [navigate]);

  return (
    <header className={`bg-white sticky top-0 z-40 transition-all duration-300 border-b border-gray-100 ${marginClass}`}>
      <div className="flex flex-row items-center justify-between px-4 sm:px-8 h-[70px] md:h-[90px] gap-2">
        {/* 1. Left Side: Logo / Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {!isStudent && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div
            className="flex items-center relative hover:cursor-pointer"
            onClick={() => {
              const role = localStorage.getItem('role') || userRole;
              if (role === 'admin' || role === 'super_admin') navigate("/dashboard");
              else if (role === 'teacher') navigate("/teacher-dashboard");
              else if (role === 'student') navigate("/student-dashboard");
              else navigate("/");
            }}
          >
          </div>
        </div>

        {isTeacherOrStudent && (
          <div className="flex-1 flex justify-center px-4">
            <MiniHeaderTimer />
          </div>
        )}

        {/* 2. Right Side: Profile / Actions */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          {isTeacherOrStudent ? (
            <div className="flex items-center gap-2 md:gap-4">
              <DesktopProfile
                navigate={navigate}
                name={userInfo.name}
                subtext={userInfo.subtext}
                avatar={userInfo.avatar}
                targetPath={userInfo.path}
                compact={true}
              />
              {isStudent && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 md:gap-6">
              {/* <div className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                <Bell className="w-5 h-5" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              </div> */}

              <div
                className="flex items-center gap-2 cursor-pointer md:pl-4 md:border-l border-gray-100 group"
              >
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-gray-900 leading-none group-hover:text-primary transition-colors">{userInfo.name}</p>
                  <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">{userInfo.subtext}</p>
                </div>
                <img
                  src={userInfo.avatar}
                  alt="User"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const DesktopProfile = ({
  className = "",
  navigate,
  name,
  subtext,
  avatar,
  targetPath,
  compact = false,
}: {
  className?: string;
  navigate: any;
  name: string;
  subtext: string;
  avatar: string;
  targetPath: string;
  compact?: boolean;
}) => (
  <div className={`flex items-center gap-2 md:gap-4 ${className}`}>
    {!compact && (
      <button className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-2xl text-slate-400 hover:text-primary hover:bg-primary-light transition-all border border-slate-100 relative">
        <Bell size={18} className="md:w-5 md:h-5" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full border-2 border-white" />
      </button>
    )}

    <div
      className="flex items-center gap-2 md:gap-3 hover:cursor-pointer hover:bg-gray-50 rounded-xl p-1 md:p-1.5 transition-all"
      onClick={() => navigate(targetPath)}
    >
      <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
        <img
          src={avatar}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="hidden sm:block text-right">
        <p className="text-xs md:text-sm font-bold text-slate-800 leading-none">
          {name}
        </p>
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
          {subtext}
        </p>
      </div>
    </div>
  </div>
);
