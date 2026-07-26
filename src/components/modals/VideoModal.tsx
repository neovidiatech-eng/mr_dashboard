import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ReactPlayer from "react-player";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionName: string;
  videoUrl: string;
  onEnded?: () => void;
}

export default function VideoModal({
  isOpen,
  onClose,
  sessionName,
  videoUrl,
  onEnded,
}: VideoModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">

      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg md:text-xl font-bold text-slate-800">
            {sessionName}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video */}
        <div className="bg-black aspect-video relative">
          {videoUrl.includes('drive.google.com') ? (
            <iframe
              src={videoUrl.replace('/view', '/preview')}
              width="100%"
              height="100%"
              className="w-full h-full border-0 absolute top-0 left-0"
              allowFullScreen
              title="Google Drive Video"
            />
          ) : (
            /* @ts-ignore */
            <ReactPlayer
              url={videoUrl}
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
              controls
              playing
              onEnded={onEnded}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}