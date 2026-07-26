import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboardResponse, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-8 flex items-center justify-center">
        <p className="text-red-500 font-medium">Failed to load dashboard data.</p>
      </div>
    );
  }

  const data = dashboardResponse?.data;

  const chartData = {
    labels: data?.sessionsPerDay?.map((d: any) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })) || [],
    datasets: [
      {
        fill: true,
        label: 'Sessions',
        data: data?.sessionsPerDay?.map((d: any) => d.count) || [],
        borderColor: '#5e5ce6',
        backgroundColor: 'rgba(94, 92, 230, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#5e5ce6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 1,
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const totalStudents = data?.activeUsers?.students || 0;
  const totalInstructors = data?.activeUsers?.instructors || 0;
  const maxUsers = Math.max(totalStudents, totalInstructors, 1);
  const totalUsers = totalStudents + totalInstructors || 1;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8 font-sans" dir="ltr">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Good Morning, Admin</h1>
          <p className="text-sm text-gray-500">Here's what's happening in the club kit today.</p>
        </div>

      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
              +15%
            </span>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-wider uppercase">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-900">{data?.stats?.totalStudents || 0}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-[#5e5ce6]">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
              Active
            </span>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-wider uppercase">Total Instructors</p>
            <h3 className="text-2xl font-bold text-gray-900">{data?.stats?.totalTeachers || 0}</h3>
          </div>
        </div>

        {/* Card 3 - Purple Background */}
        <div className="bg-[#5e5ce6] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden text-white hover:shadow-md transition-shadow">
          <div className="absolute right-0 top-0 opacity-10">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 100C0 100 20 80 50 80C80 80 100 60 100 60L100 0L0 0L0 100Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">
              <Clock className="w-4 h-4" />
            </div>
            <span className="px-2 py-1 bg-white/20 text-white text-[10px] font-semibold rounded-md">
              Attention Required
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-indigo-200 font-bold mb-1 tracking-wider uppercase">Pending Requests</p>
            <h3 className="text-2xl font-bold">{data?.stats?.pendingRequests || 0}</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex -space-x-2">
              <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="" />
              <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="" />
              <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-wider uppercase">Today's Sessions</p>
            <h3 className="text-2xl font-bold text-gray-900">{data?.stats?.todaySessions || 0}</h3>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Line Chart Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sessions per Day</h3>
              <p className="text-sm text-gray-500">Weekly tracking of educational engagement</p>
            </div>

          </div>
          
          <div className="h-64 w-full relative mt-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold text-gray-900">Active Users</h3>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-center items-end gap-6 h-32 mb-8 mt-4">
              <div className="relative group w-12 h-full flex items-end justify-center cursor-pointer">
                <div 
                  className="w-full bg-blue-500 rounded-t-lg shadow-sm transition-all duration-500 group-hover:bg-blue-400 group-hover:shadow-md"
                  style={{ height: `${(totalStudents / maxUsers) * 100}%`, minHeight: '10%' }}
                ></div>
                <div className="absolute -top-10 bg-gray-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                  {totalStudents.toLocaleString()} Students
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
              
              <div className="relative group w-12 h-full flex items-end justify-center cursor-pointer">
                <div 
                  className="w-full bg-[#5e5ce6] rounded-t-lg shadow-sm transition-all duration-500 group-hover:bg-[#4b49b8] group-hover:shadow-md"
                  style={{ height: `${(totalInstructors / maxUsers) * 100}%`, minHeight: '10%' }}
                ></div>
                <div className="absolute -top-10 bg-gray-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                  {totalInstructors.toLocaleString()} Instructors
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">Students</span>
                  <span className="font-bold text-gray-900">{totalStudents}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(totalStudents / totalUsers) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">Instructors</span>
                  <span className="font-bold text-gray-900">{totalInstructors}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#5e5ce6] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(totalInstructors / totalUsers) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Activity Feed</h3>
          </div>
          
          <div className="space-y-6">
            {data?.activityFeed && data.activityFeed.length > 0 ? (
              data.activityFeed.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  {activity.type === 'request' ? (
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random`} alt={activity.user} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#5e5ce6] shadow-sm shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${activity.type === 'request' ? 'bg-orange-400' : 'bg-[#5e5ce6]'}`}></span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleDateString()} {new Date(activity.time).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* District Report Ready */}
          <div className="bg-[#2a286b] rounded-2xl p-6 text-white relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute right-0 bottom-0 opacity-10">
              <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="80" r="50" stroke="currentColor" strokeWidth="15"/>
                <circle cx="80" cy="80" r="20" stroke="currentColor" strokeWidth="10"/>
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3 text-white">District Report Ready</h3>
              <p className="text-sm text-indigo-100/80 mb-6 leading-relaxed">
                The monthly performance audit for Q2 is now available for review and signature.
              </p>
              <button className="px-5 py-2.5 bg-white text-[#2a286b] rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"
              onClick={() => navigate("/dashboard/reports")}
              >
                Review Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Sessions</h3>
            
            <div className="space-y-3 mb-4">
              {data?.upcomingSessions && data.upcomingSessions.length > 0 ? (
                data.upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors group">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{session.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(session.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic p-3">No upcoming sessions.</p>
              )}
            </div>
            
            <button className="w-full text-center text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors mt-2"
            onClick={() => navigate("/dashboard/teacher-availability")}
            >
              See Full Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


