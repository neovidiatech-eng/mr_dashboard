import { Message } from "../../../../../types/chat";
import EmptyChat from "./EmptyChat";


interface Props {
  conversationId?: string;
  teacherUserId?: string;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isTyping?: boolean;
}

export default function ChatMessages({
  conversationId,
  teacherUserId,
  messages,
  messagesEndRef,
  isTyping,
}: Props) {

  if (!conversationId) {

    return (
      <EmptyChat
        title="No Conversation Selected"
        description="Please select an instructor to start chatting."
      />
    );
  }

  if (messages.length === 0) {

    return (
      <EmptyChat
        title="Start the Conversation"
        description="Send a message to break the ice!"
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

      {messages.map((msg) => {

        const isStudent = teacherUserId ? msg.senderId !== teacherUserId : false;

        const timeString =
          new Date(
            msg.createdAt
          ).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${
              isStudent
                ? "items-end"
                : "items-start"
            } max-w-[70%] ${
              isStudent
                ? "ml-auto"
                : "mr-auto"
            }`}
          >

            <div
              className={`
                px-4 py-3 text-[14px]
                leading-relaxed
                max-w-full break-words

                ${
                  isStudent
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                    : "bg-[#F3F4F6] text-slate-800 rounded-2xl rounded-tl-sm"
                }
              `}
            >
              {msg.content}
            </div>

            <span className="text-[11px] text-slate-400 mt-1 px-1 font-medium">
              {timeString}
            </span>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex flex-col items-start max-w-[70%] mr-auto">
          <div className="bg-[#F3F4F6] text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-slate-500">typing</span>
            <div className="flex gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div
        ref={messagesEndRef}
        className="h-1"
      />
    </div>
  );
}