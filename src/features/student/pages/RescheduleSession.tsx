import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMyRequests } from "../../../hooks/useRequests";
import { useStudentAgenda } from "../hooks/useStudentAgenda";
import { useAgenda } from "../../admin/hooks/useAgenda";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRequest } from "../../../services/RequestServices";
import { CreateRequestType } from "../../../types/requests";
import ErrorService from "../../../utils/ErrorService";

export default function RescheduleSession() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [suggestedNotes, setSuggestedNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: submitReschedule } = useMutation({
    mutationFn: (data: CreateRequestType) => createRequest(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      setSelectedSessionId(null);
      setSelectedSlot(null);
      setRescheduleReason("");
      setSuggestedNotes("");
      ErrorService.success(data.message || "Reschedule request submitted successfully!");
    },
    onError: (error: any) => {
      // Repetition removed: axios interceptor already handles error toasts via ErrorService.error
      console.error("Reschedule request failed:", error);
    },
    onSettled: () => setIsSubmitting(false)
  });

  const handleRescheduleSubmit = () => {
    if (!selectedSessionId || !selectedSlot || !selectedDate || !rescheduleReason) {
      ErrorService.warning("Please select a session, a new time, and provide a reason.");
      return;
    }

    const [hours, minutes] = selectedSlot.split(':').map(Number);
    const newStartTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate, hours, minutes);

    // Assume 1 hour duration
    const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);

    setIsSubmitting(true);
    submitReschedule({
      sessionId: selectedSessionId,
      type: 'reschedule',
      reason: rescheduleReason,
      requestedData: {
        new_start_time: newStartTime.toISOString(),
        new_end_time: newEndTime.toISOString(),
        suggested_notes: suggestedNotes
      }
    });
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startDateStr = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return formatLocalDate(start);
  }, [currentDate]);

  const endDateStr = useMemo(() => {
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return formatLocalDate(end);
  }, [currentDate]);

  const selectedDateStr = useMemo(() => {
    if (!selectedDate) return startDateStr;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
    return formatLocalDate(date);
  }, [currentDate, selectedDate, startDateStr]);

  const { data: agendaData, isLoading: isAgendaLoading } = useStudentAgenda(startDateStr, endDateStr);
  const { sessions: allSystemSessions, loading: isAllLoading } = useAgenda(selectedDateStr, selectedDateStr);
  const { data: requestsData, isLoading } = useMyRequests();

  const sessionsByDay = useMemo(() => {
    const map = new Map<number, any[]>();
    if (agendaData?.data?.sessions) {
      agendaData.data.sessions.forEach((session) => {
        const date = new Date(session.start_time);
        if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
          const day = date.getDate();
          if (!map.has(day)) {
            map.set(day, []);
          }
          map.get(day)!.push(session);
        }
      });
    }
    return map;
  }, [agendaData, currentDate]);

  const allSessionsByDay = useMemo(() => {
    const map = new Map<number, any[]>();
    if (allSystemSessions) {
      allSystemSessions.forEach((session) => {
        const date = new Date(session.start_time);
        if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
          const day = date.getDate();
          if (!map.has(day)) {
            map.set(day, []);
          }
          map.get(day)!.push(session);
        }
      });
    }
    return map;
  }, [allSystemSessions, currentDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots = [];
    // Standard working hours 9 AM to 9 PM
    for (let h = 9; h <= 21; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    const sessionsThisDay = allSessionsByDay.get(selectedDate) || [];

    return slots.filter(slotTime => {
      const [sh, sm] = slotTime.split(':').map(Number);
      const slotStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate, sh, sm);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour slot

      return !sessionsThisDay.some(session => {
        const sStart = new Date(session.start_time);
        const sEnd = new Date(session.end_time);
        return (slotStart < sEnd && slotEnd > sStart);
      });
    });
  }, [selectedDate, allSessionsByDay, currentDate]);

  const history = useMemo(() => {
    // 1. Safely extract the raw requests array from various possible structures
    let rawRequests: any[] = [];
    const dataObj = requestsData as any;
    if (dataObj) {
      if (Array.isArray(dataObj)) {
        rawRequests = dataObj;
      } else if (dataObj.data) {
        if (Array.isArray(dataObj.data)) {
          rawRequests = dataObj.data;
        } else if (dataObj.data.student_requests) {
          rawRequests = dataObj.data.student_requests;
        } else if (dataObj.data.requests) {
          rawRequests = dataObj.data.requests;
        }
      }
    }

    if (rawRequests.length === 0) return [];

    console.log("My Requests Raw Data:", rawRequests);

    return rawRequests
      .filter(req => req.type?.toLowerCase().includes('reschedule'))
      .map(req => {
        const requestedData = req.requestedData;
        const formatDate = (dateString: string) => {
          if (!dateString) return "N/A";
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          } catch (e) {
            return "Invalid Date";
          }
        };

        return {
          id: req.id,
          original: req.schedule?.start_time ? formatDate(req.schedule.start_time) : "N/A",
          new: requestedData?.new_start_time ? formatDate(requestedData.new_start_time) :
            requestedData?.newStartTime ? formatDate(requestedData.newStartTime) : "N/A",
          reason: req.reason || "No reason provided",
          status: req.status ? (req.status.charAt(0).toUpperCase() + req.status.slice(1)) : "Pending",
        };
      });
  }, [requestsData]);

  // Calendar Logic
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear();
  };

  const isPast = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Back Button */}
      <div className="space-y-4">
        <button
          onClick={() => navigate("/student-dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          Reschedule Session
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Card */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">
              {monthName} {year}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-6">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-slate-400 font-bold text-sm py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty boxes for days of previous month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate === day;
              const disabled = isPast(day);
              const hasStudentSessions = (sessionsByDay.get(day) || []).length > 0;

              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    h-14 md:h-20 rounded-2xl flex flex-col items-center justify-center font-bold transition-all relative
                    ${isSelected
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 z-10"
                      : hasStudentSessions
                        ? "bg-blue-50 text-blue-600 border-2 border-blue-100 hover:bg-blue-100"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                    ${disabled ? "opacity-20 cursor-not-allowed grayscale" : ""}
                  `}
                >
                  <span className="text-lg">{day}</span>
                  <div className="flex gap-1 absolute bottom-2">
                    {isToday(day) && !isSelected && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    )}
                    {hasStudentSessions && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Unified Add Request Card */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-md flex flex-col space-y-8">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <h4 className="text-2xl font-bold text-slate-800">
              Create Reschedule Request
            </h4>
            <p className="text-slate-400 text-sm font-medium">
              Fill in the details below to request a new time.
            </p>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2">

            {/* 1. Select Session */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">1. Select a Session</label>
              <div className="max-h-[180px] overflow-y-auto no-scrollbar space-y-2 border border-slate-100 p-2 rounded-2xl bg-slate-50/50">
                {isAgendaLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (agendaData?.data?.sessions || []).length > 0 ? (
                  (agendaData?.data?.sessions || []).map((session, idx) => {
                    const sessionDate = new Date(session.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const isSelected = selectedSessionId === session.id;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                          } flex flex-col gap-1`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-800'}`}>{session.title}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>{sessionDate}</span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-slate-400 text-xs text-center py-4">No sessions available.</p>
                )}
              </div>
            </div>

            {/* 2. Select Time Slot */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">
                2. Select New Time <span className="text-slate-400 font-normal">({selectedDate ? `${monthName} ${selectedDate}` : 'Please select a date from the calendar'})</span>
              </label>

              <div className="max-h-[160px] overflow-y-auto no-scrollbar border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                {!selectedDate ? (
                  <p className="text-center text-slate-400 py-4 text-xs">Select a date from the calendar to see availability.</p>
                ) : isAllLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot, idx) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 active:scale-95 font-bold text-sm ${isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                            }`}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-4 text-xs">No free slots available for this date.</p>
                )}
              </div>
            </div>

            {/* 3. Reason & Notes */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">3. Reason for Reschedule</label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Ex: I have an emergency..."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none min-h-[80px] text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">4. Suggested Notes (Optional)</label>
                <textarea
                  value={suggestedNotes}
                  onChange={(e) => setSuggestedNotes(e.target.value)}
                  placeholder="Ex: Delay from Sunday to Monday morning."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none min-h-[80px] text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleRescheduleSubmit}
              disabled={isSubmitting || !selectedSessionId || !selectedSlot || !rescheduleReason}
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Add Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reschedule History Table */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-md overflow-hidden">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">
          Reschedule History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 font-bold text-sm border-b border-slate-200">
                <th className="pb-4 font-bold">Original Date</th>
                <th className="pb-4 font-bold">New Date</th>
                <th className="pb-4 font-bold">Reason</th>
                <th className="pb-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-medium">Loading history...</p>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400 font-medium">
                    No reschedule history found
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-6 font-bold text-slate-600">
                      {item.original}
                    </td>
                    <td className="py-6 font-bold text-slate-600">{item.new}</td>
                    <td className="py-6 text-slate-500 font-medium">
                      {item.reason}
                    </td>
                    <td className="py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${item.status.toLowerCase() === 'approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : item.status.toLowerCase() === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                        <CheckCircle2 size={12} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
