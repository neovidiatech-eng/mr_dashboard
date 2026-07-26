import React, { useEffect, useMemo, useState } from "react";
import {
  Video,
  Eye,
  Award,
  Crown,
  Gem,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCourses } from "../../../hooks/useCourses";
import { useRanks } from "../../../hooks/useRanks";
import { useNavigate } from "react-router-dom";

const LMSContent: React.FC = () => {
  const navigate = useNavigate();

  const [selectedRank, setSelectedRank] = useState("All Ranks");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Fetch all courses
  const { data: ranksData, isLoading: ranksLoading } = useRanks();
  const rankObj = ranksData?.items?.find((r: any) => r.name === selectedRank);
  const rankId = rankObj?.id;
  const { data: coursesData, isLoading: coursesLoading } = useCourses(currentPage, itemsPerPage, rankId);

  const rankIcons: Record<string, any> = {
    SILVER: Award,
    GOLD: Crown,
    PLATINUM: Gem,
    TITAN: Shield,
  };

  const ranks = useMemo(() => {
    const ranksList = ranksData?.items || (Array.isArray(ranksData) ? ranksData : []);
    const fetchedRanks =
      ranksList?.map((rank: any) => ({
        label: rank.name,
        icon: rankIcons[rank.name.toUpperCase()] || Award,
        color: rank.color || "#2563eb",
      })) || [];

    return [
      {
        label: "All Ranks",
        icon: Award,
        color: "#2563eb",
      },
      ...fetchedRanks,
    ];
  }, [ranksData]);

  const courses = coursesData?.items || [];

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(
      (item: any) =>
        selectedRank === "All Ranks" ||
        item.rank?.name?.toLowerCase() ===
        selectedRank.toLowerCase()
    );
  }, [courses, selectedRank]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRank]);

  // Pagination
  const totalPages = coursesData?.pagination?.totalPages || 1;
  const totalCourses = coursesData?.pagination?.totalItems || 0;

  const paginatedCourses = filteredCourses;

  const handleViewLectures = (courseId: string) => {
    navigate(`/teacher-dashboard/courses/${courseId}/lectures`);
  };

  if (coursesLoading || ranksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto p-4 sm:p-8">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          Learning Management System
        </h1>

        <p className="text-slate-400 font-medium">
          Upload and manage course materials and recordings
        </p>
      </header>

      {/* Ranks Filter */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
        {ranks.map((rank, index) => {
          const Icon = rank.icon;

          const isLast = index === ranks.length - 1;

          const centerClasses = `
            ${isLast && ranks.length % 2 === 1
              ? "col-span-2 justify-center"
              : ""
            }
            ${isLast && ranks.length % 3 === 1
              ? "md:col-span-3 md:justify-center"
              : ""
            }
            ${isLast && ranks.length % 5 === 1
              ? "lg:col-span-5 lg:justify-center"
              : "lg:col-span-1"
            }
          `;

          return (
            <button
              key={rank.label}
              onClick={() => setSelectedRank(rank.label)}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-4 rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 ${rank.label === selectedRank
                  ? "bg-[#2563eb] text-white shadow-xl shadow-blue-500/20 scale-[1.02]"
                  : "bg-white text-[#2563eb] border border-gray-100 hover:bg-blue-50 shadow-sm"
                } ${centerClasses}`}
            >
              <Icon size={22} />
              <span>{rank.label}</span>
            </button>
          );
        })}
      </div>

      {/* Courses Grid */}
      {paginatedCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedCourses.map((item: any) => {
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div
                    className="h-52 relative bg-cover bg-center"
                    style={{
                      backgroundImage: item.image
                        ? `url("https://agro-plus.net/${item.image}")`
                        : "linear-gradient(to bottom right, #2563eb, #7c3aed)",
                    }}
                  >
                    {item.image && (
                      <img
                        src={`https://agro-plus.net/${item.image}`}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/20" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-blue-600 shadow-lg">
                        <Video size={34} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider">
                        {item.rank?.name}
                      </span>

                      <span className="text-xs text-slate-400 font-medium">
                        {item.lectures?.length || 0} Lectures
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1 mb-3">
                      {item.title}
                    </h3>

                    <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                      {item.description || "No description available"}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                      <span>
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleViewLectures(item.id)
                      }
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2563eb] text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      <Eye size={18} />
                      View Lectures
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-slate-500 font-medium text-sm">
                Showing page{" "}
                <span className="text-slate-900 font-bold">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="text-slate-900 font-bold">
                  {totalPages}
                </span>

                <span className="ml-3">
                  ({totalCourses} total courses)
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${currentPage === 1
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white border border-gray-100 text-slate-700 hover:bg-slate-50 shadow-sm"
                    }`}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    )
                  }
                  disabled={currentPage >= totalPages}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${currentPage >= totalPages
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-[#2563eb] text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                    }`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Video size={40} className="text-slate-400" />
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            No Courses Found
          </h3>

          <p className="text-slate-400">
            Try selecting another rank
          </p>
        </div>
      )}
    </div>
  );
};

export default LMSContent;
