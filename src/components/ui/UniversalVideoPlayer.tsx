import { useState } from 'react';
import { Video, AlertCircle, ExternalLink } from 'lucide-react';
import ReactPlayer from 'react-player';
import { useLanguage } from '../../contexts/LanguageContext';
import { baseURL } from '../../consts';

const Player = ReactPlayer as any;

interface UniversalVideoPlayerProps {
  url?: string | null;
  className?: string;
  autoPlay?: boolean;
}

export default function UniversalVideoPlayer({
  url: rawUrl,
  className = '',
  autoPlay = false,
}: UniversalVideoPlayerProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [hasError, setHasError] = useState(false);

  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return (
      <div
        className={`aspect-video rounded-2xl bg-slate-900/90 flex flex-col items-center justify-center border border-slate-800 text-center p-6 ${className}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mb-3">
          <Video size={32} />
        </div>
        <p className="text-slate-300 font-bold text-sm">
          {isAr ? 'لا يوجد فيديو مرفوع لهذه المحاضرة' : 'No video uploaded for this lecture'}
        </p>
        <p className="text-slate-500 text-xs mt-1">
          {isAr
            ? 'سيقوم المعلم بإرفاق تسجيل الفيديو قريباً.'
            : 'The instructor will attach the video recording soon.'}
        </p>
      </div>
    );
  }

  // Normalize slashes
  const normalizedUrl = rawUrl.trim().replace(/\\/g, '/');

  // 1. YouTube Regex Match
  const ytMatch = normalizedUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return (
      <div
        className={`relative aspect-video rounded-2xl bg-black overflow-hidden shadow-xl group ${className}`}
      >
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&autoplay=${autoPlay ? 1 : 0}`}
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
  if (normalizedUrl.includes('drive.google.com')) {
    const driveMatch =
      normalizedUrl.match(/\/file\/d\/([^\/\?]+)/) || normalizedUrl.match(/id=([^\&]+)/);
    const driveId = driveMatch ? driveMatch[1] : null;
    const driveEmbedUrl = driveId
      ? `https://drive.google.com/file/d/${driveId}/preview`
      : normalizedUrl
          .replace(/\/view(\?.*)?$/, '/preview')
          .replace(/\/edit(\?.*)?$/, '/preview');

    return (
      <div
        className={`relative aspect-video rounded-2xl bg-black overflow-hidden shadow-xl group ${className}`}
      >
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
  const vimeoMatch = normalizedUrl.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return (
      <div
        className={`relative aspect-video rounded-2xl bg-black overflow-hidden shadow-xl group ${className}`}
      >
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${autoPlay ? 1 : 0}`}
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

  // Build direct encoded URL
  let directMediaUrl = normalizedUrl;
  if (
    !normalizedUrl.startsWith('http://') &&
    !normalizedUrl.startsWith('https://') &&
    !normalizedUrl.startsWith('blob:') &&
    !normalizedUrl.startsWith('data:')
  ) {
    const cleanPath = normalizedUrl.replace(/^\/+/, '');
    const encodedSegments = cleanPath
      .split('/')
      .map((seg) => encodeURIComponent(seg))
      .join('/');
    directMediaUrl = `${baseURL}/${encodedSegments}`;
  }

  // 4. Direct video files or uploads
  const isDirectFile =
    /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp|flv|ts)(\?.*)?$/i.test(normalizedUrl) ||
    normalizedUrl.includes('/uploads/') ||
    normalizedUrl.includes('/storage/') ||
    normalizedUrl.includes('/videos/') ||
    normalizedUrl.includes('/materials/');

  if (isDirectFile && !hasError) {
    return (
      <div
        className={`relative aspect-video rounded-2xl bg-black overflow-hidden shadow-xl group ${className}`}
      >
        <video
          key={directMediaUrl}
          src={directMediaUrl}
          controls
          autoPlay={autoPlay}
          playsInline
          controlsList="nodownload"
          onError={() => setHasError(true)}
          className="w-full h-full object-contain absolute top-0 left-0"
        />
      </div>
    );
  }

  // If direct <video> failed or non-standard format, fallback to ReactPlayer with fallback card
  return (
    <div
      className={`relative aspect-video rounded-2xl bg-black overflow-hidden shadow-xl group ${className}`}
    >
      <Player
        url={directMediaUrl}
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
        controls
        playing={autoPlay}
        onError={() => setHasError(true)}
      />

      {hasError && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <p className="text-sm font-bold text-slate-200">
            {isAr
              ? 'تعذر تشغيل الفيديو داخل المشغل المباشر'
              : 'Unable to stream this video directly'}
          </p>
          <a
            href={directMediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md"
          >
            <span>{isAr ? 'فتح الفيديو في نافذة خارجية' : 'Open in New Window'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
