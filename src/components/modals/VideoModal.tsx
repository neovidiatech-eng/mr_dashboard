import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ReactPlayer from "react-player";

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
  onEnded,
  startPosition,
  onProgress,
}: VideoModalProps) {
  const playerRef = useRef<any>(null);
  const seekedRef = useRef(false);

  useEffect(() => {
    if (isOpen) seekedRef.current = false;
  }, [isOpen, videoUrl]);

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
              ref={playerRef}
              url={videoUrl}
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
              controls
              playing
              progressInterval={5000}
              onEnded={onEnded}
              onReady={() => {
                if (!seekedRef.current && startPosition && startPosition > 0) {
                  playerRef.current?.seekTo?.(startPosition, "seconds");
                  seekedRef.current = true;
                }
              }}
              onProgress={((state: any) => {
                const duration = playerRef.current?.getDuration?.() || 0;
                onProgress?.(state.playedSeconds, duration);
              }) as any}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}