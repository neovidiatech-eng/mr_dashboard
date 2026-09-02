import { createPortal } from "react-dom";
import { X } from "lucide-react";
import UniversalVideoPlayer from "../ui/UniversalVideoPlayer";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionName: string;
  videoUrl: string;
  onEnded?: () => void;
  startPosition?: number;
  onProgress?: (playedSeconds: number, durationSeconds: number) => void;
}

export default function VideoModal({
  isOpen,
  onClose,
  sessionName,
  videoUrl,
}: VideoModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-base md:text-lg font-bold text-white truncate max-w-[280px] sm:max-w-md md:max-w-xl">
              {sessionName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Universal Video Player */}
        <div className="bg-black aspect-video relative">
          <UniversalVideoPlayer url={videoUrl} autoPlay={true} />
        </div>
      </div>
    </div>,
    document.body
  );
}