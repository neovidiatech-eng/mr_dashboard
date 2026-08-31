import { Video } from 'lucide-react';
import ReactPlayer from 'react-player';
import { useLanguage } from '../../contexts/LanguageContext';
import { baseURL } from '../../consts';

const Player = ReactPlayer as any;

interface UniversalVideoPlayerProps {
  url?: string | null;
  className?: string;
}

export default function UniversalVideoPlayer({ url: rawUrl, className = '' }: UniversalVideoPlayerProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return (
      <div className={`aspect-video rounded-2xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 ${className}`}>
        <Video size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-400 font-medium">
          {isAr ? 'لا يوجد فيديو مرفوع لهذه المحاضرة' : 'No video uploaded for this lecture'}
        </p>
      </div>
    );
  }

  const url = rawUrl.trim();

  // 1. YouTube Regex Match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return (
      <div className={`relative aspect-video rounded-2xl bg-gray-900 overflow-hidden shadow-lg group ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0`}
          width="100%"
          height="100%"
          className="w-full h-full border-0 absolute top-0 left-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="YouTube Video"
        />
      </div>
    );
  }

  // 2. Google Drive Links
  if (url.includes('drive.google.com')) {
    const driveMatch = url.match(/\/file\/d\/([^\/\?]+)/) || url.match(/id=([^\&]+)/);
    const driveId = driveMatch ? driveMatch[1] : null;
    const driveEmbedUrl = driveId
      ? `https://drive.google.com/file/d/${driveId}/preview`
      : url.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');

    return (
      <div className={`relative aspect-video rounded-2xl bg-gray-900 overflow-hidden shadow-lg group ${className}`}>
        <iframe
          src={driveEmbedUrl.includes('/preview') ? driveEmbedUrl : `${driveEmbedUrl}/preview`}
          width="100%"
          height="100%"
          className="w-full h-full border-0 absolute top-0 left-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Google Drive Video"
        />
      </div>
    );
  }

  // 3. Vimeo Match
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return (
      <div className={`relative aspect-video rounded-2xl bg-gray-900 overflow-hidden shadow-lg group ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          width="100%"
          height="100%"
          className="w-full h-full border-0 absolute top-0 left-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo Video"
        />
      </div>
    );
  }

  // 4. Direct video files or uploads
  const isDirectFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes('/uploads/');
  if (isDirectFile) {
    const fullVideoUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `${baseURL}/${url.replace(/^\//, '')}`;
    return (
      <div className={`relative aspect-video rounded-2xl bg-gray-900 overflow-hidden shadow-lg group ${className}`}>
        <video
          src={fullVideoUrl}
          controls
          controlsList="nodownload"
          className="w-full h-full object-contain absolute top-0 left-0"
        />
      </div>
    );
  }

  // 5. Fallback ReactPlayer
  return (
    <div className={`relative aspect-video rounded-2xl bg-gray-900 overflow-hidden shadow-lg group ${className}`}>
      <Player
        url={url}
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
        controls
      />
    </div>
  );
}
