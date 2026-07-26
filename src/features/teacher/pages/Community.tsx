import { useMystudents } from "../hooks/useMystudents";
import { TeacherStudent } from "../../../types/teacherStudents";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../../../store/chatSlice";

import { format } from "date-fns";
import { useCreateConversation, useMessages } from "../../../hooks/useMessages";
// import { sendMessage } from "../../../services/chatServices";
import { useChatSocket } from "../../../hooks/useChat";
import { useTyping } from "../../../hooks/useTyping";
import { useTeacherProfile } from "../hooks/useTeacherProfile";
import { RootState } from "../../../store/store";
import { Users, MessageSquare, Smile, Send, MoreVertical } from "lucide-react";

export default function CommunityPage() {
  const dispatch = useDispatch();
  const { data: students } = useMystudents();
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Read from Redux
  const { messages: allMessages, onlineUsers, typingUsers } = useSelector((rootState: RootState) => rootState.chat);
  const { data: teacherData } = useTeacherProfile()
  const teacherId = teacherData?.data.teacher.id;
  const teacherUserId = teacherData?.data.teacher.user_id;
  const currentMessages = conversationId ? allMessages[conversationId] || [] : [];
  const studentUserId = selectedStudent?.user_id;

  // Initialize socket for the conversation (also returns the socket)
  const socket = useChatSocket(conversationId || undefined);

  const { mutate: openChat } = useCreateConversation();

  const { data: historyData, isLoading: isHistoryLoading } = useMessages(conversationId || undefined);

  useEffect(() => {
    if (historyData?.messages && conversationId) {
      dispatch(setMessages({ conversationId, messages: historyData.messages }));
    }
  }, [historyData, dispatch, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId) return;

    // const tempId = Date.now().toString();
    const messageData = {
      conversationId,
      content: messageText,
    };

    setMessageText("");

    try {
      if (socket) {
        socket.emit("message:send", messageData);
      } else {
        console.error("Socket not connected, cannot send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const emitTyping = useTyping(socket, conversationId || undefined);

  const handleTyping = () => {
    if (socket && conversationId) {
      emitTyping();
    }
  };

  const isStudentOnline = studentUserId ? onlineUsers[studentUserId] === "online" : false;
  const isStudentTyping = conversationId && studentUserId ? typingUsers[conversationId]?.includes(studentUserId) : false;

  useEffect(() => {
    if (conversationId) {
      console.log(`🔍 [Community] Conversation: ${conversationId}`);
      console.log(`👤 [Community] Student ID: ${studentUserId}`);
      console.log(`⌨️ [Community] Typing Users for this convo:`, typingUsers[conversationId]);
    }
  }, [conversationId, studentUserId, typingUsers]);



  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-12 p-7">
      {/* Page Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 font-['Inter']">
          Instructor Community
        </h1>
        <p className="text-slate-400 font-medium">
          Connect, share, and learn with fellow instructors
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col h-[700px] bg-white rounded-3xl border border-gray-100/50 shadow-sm overflow-hidden content-chat pt-8">
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="px-8 pb-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-500 uppercase italic border-2 border-white shadow-sm">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {isStudentOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedStudent.name}</h3>
                    <p className="text-xs font-medium text-slate-400">
                      {isStudentTyping ? (
                        <div className="flex items-center gap-1">
                          <span className="text-blue-500 font-bold animate-pulse">Typing...</span>
                          <div className="flex gap-0.5">
                            <span className="w-0.5 h-0.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-0.5 h-0.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-0.5 h-0.5 rounded-full bg-blue-500 animate-bounce" />
                          </div>
                        </div>
                      ) : (
                        isStudentOnline ? (
                          <span className="text-emerald-500 font-bold">Online</span>
                        ) : (
                          <span className="text-slate-300 font-bold uppercase tracking-wider">Offline</span>
                        )
                      )}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-50/30">
                {currentMessages.length === 0 && !isHistoryLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-60">
                    <MessageSquare size={48} />
                    <p className="font-medium">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  currentMessages.map((msg: any) => {
                    const isMe = msg.senderId === teacherUserId || msg.senderId === "me" || msg.sender?.role === "teacher";
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] space-y-1`}>
                          <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${isMe
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-slate-600 rounded-tl-none border border-slate-100'
                            }`}>
                            {msg.content}
                          </div>
                          <p className={`text-[10px] font-bold text-slate-300 uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                            {msg.createdAt ? format(new Date(msg.createdAt), 'hh:mm a') : 'Just now'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                {isStudentTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] space-y-1">
                      <div className="bg-white text-slate-600 rounded-2xl rounded-tl-none border border-slate-100 p-4 shadow-sm flex items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-400 italic">typing</span>
                        <div className="flex gap-1">
                          <span className="w-1 h-1 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1 h-1 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1 h-1 rounded-full bg-slate-300 animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-slate-50">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type your message..."
                      className="w-full px-6 py-4 bg-slate-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    />
                    <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <Smile size={20} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6 animate-pulse">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <Users size={40} className="text-slate-200" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Student</h3>
                <p className="text-sm font-medium">Choose a student from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Students Sidebar */}
        <div className="h-[700px] bg-white rounded-3xl border border-gray-100/50 shadow-sm p-8 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-8 h-fit">
            Students Chat
          </h3>
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
            {students?.map((student: TeacherStudent) => (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  if (teacherId) {
                    openChat({ teacherId, studentId: student.id }, {
                      onSuccess: (data) => {
                        setConversationId(data.id);
                      }
                    });
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group border ${selectedStudent?.id === student.id
                    ? "bg-blue-50/50 border-blue-100 shadow-sm"
                    : "hover:bg-slate-50 border-transparent"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedStudent?.id === student.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                      }`}>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {student.user_id && onlineUsers[student.user_id] === "online" && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold transition-colors ${selectedStudent?.id === student.id ? "text-blue-600" : "text-slate-800"
                      }`}>
                      {student.name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {student.code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
