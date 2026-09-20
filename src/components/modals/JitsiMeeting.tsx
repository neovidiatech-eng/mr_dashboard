import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { JitsiMeeting as JitsiSDKMeeting } from '@jitsi/react-sdk';
import { X, Radio, Loader2, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface JitsiMeetingProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  token: string;
  sessionTitle?: string;
  onEndSession?: () => void;
  isStudent?: boolean;
}

export default function JitsiMeeting({
  isOpen,
  onClose,
  roomName,
  sessionTitle,
  token,
  onEndSession,
  isStudent = false,
}: JitsiMeetingProps) {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const isAr = language === 'ar';
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Proactively request browser camera & microphone permissions for the page
  useEffect(() => {
    if (isOpen) {
      console.log({
        userAgent: navigator.userAgent,
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
      });

      if (navigator?.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true, video: true })
          .then((stream) => {
            // Release stream tracks immediately so Jitsi can bind to them
            stream.getTracks().forEach((track) => track.stop());
          })
          .catch((err) => {
            console.warn('Camera/Microphone permission prompt:', err);
          });
      }
    }
  }, [isOpen]);

  // Lock background body scroll while meeting is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const userRole = (localStorage.getItem('role') || sessionStorage.getItem('role') || '').toLowerCase();
  const isActualStudent = isStudent || userRole === 'student';

  const handleEnd = async () => {
    try {
      if (jitsiApi) {
        jitsiApi.executeCommand('hangup');
        try {
          jitsiApi.dispose();
        } catch {
        }
      }
      if (!isActualStudent && onEndSession) {
        await onEndSession();
      }
    } catch (err) {
      console.warn('Live session close/end error:', err);
    } finally {
      onClose();
    }
  };

  const displayName = localStorage.getItem('name') || (isAr ? (isActualStudent ? 'طالب' : 'المحاضر') : (isActualStudent ? 'Student' : 'Moderator'));
  const email = localStorage.getItem('email') || '';

  return createPortal(
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999999] bg-slate-950 flex flex-col w-screen h-screen m-0 p-0 overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Bar Navigation inside System */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 text-white shrink-0 shadow-lg">
        {/* Left: Live Session Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              {sessionTitle || roomName}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {roomName}
            </span>
          </div>
        </div>

        {/* Right: End / Leave Button */}
        <button
          onClick={handleEnd}
          type="button"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer text-white ${
            isActualStudent
              ? 'bg-slate-700 hover:bg-slate-600'
              : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          {isActualStudent ? <LogOut className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>
            {isActualStudent
              ? (isAr ? 'مغادرة البث' : 'Leave Stream')
              : (isAr ? 'إنهاء البث للجميع والعودة' : 'End For All & Return')}
          </span>
        </button>
      </div>

      {/* Jitsi SDK */}
      <div className="flex-1 w-full h-full bg-slate-950 relative overflow-hidden">
        {/* Dark loading overlay */}
        {!isReady && (
          <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              {isAr ? 'جاري الاتصال بالبث المباشر...' : 'Connecting to live session...'}
            </p>
          </div>
        )}

        <JitsiSDKMeeting
          domain="meet.mr-mahmoud-academy.net"
          roomName={roomName}
          jwt={token}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableThirdPartyRequests: true,
            disableDesktopSharing: false,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            disableDeepLinking: true,
            disableInviteFunctions: true,
            
            disableEndConference: isActualStudent,
            disableHangupMenu: isActualStudent,
            hideEndConferenceButton: isActualStudent,
            enableFeaturesBasedOnToken: !isActualStudent,
            disableRemoteMute: isActualStudent,
            remoteVideoMenu: {
              disableKick: isActualStudent,
              disableGrantModerator: isActualStudent,
            },
            ...(isActualStudent
              ? {
                  toolbarButtons: [
                    'microphone',
                    'camera',
                    'desktop',
                    'chat',
                    'raisehand',
                    'tileview',
                    'fullscreen',
                  ],
                }
              : {}),
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DISABLE_FOCUS_INDICATOR: isActualStudent,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: isActualStudent,
            ...(isActualStudent
              ? {
                  TOOLBAR_BUTTONS: [
                    'microphone',
                    'camera',
                    'desktop',
                    'chat',
                    'raisehand',
                    'tileview',
                    'fullscreen',
                  ],
                }
              : {}),
          }}
          userInfo={{
            displayName,
            email,
          }}
          onApiReady={(externalApi) => {
            setJitsiApi(externalApi);
            setIsReady(true);
            externalApi.addEventListener('videoConferenceLeft', () => {
              handleEnd();
            });
          }}
          onReadyToClose={handleEnd}
          getIFrameRef={(parentNode) => {
            if (parentNode) {
              parentNode.style.height = '100%';
              parentNode.style.width = '100%';
              parentNode.style.border = '0';
              parentNode.style.background = '#020617';

              const setIframeAttributes = () => {
                const iframe = parentNode.querySelector('iframe');
                if (iframe) {
                  iframe.allow = 'camera *; microphone *; display-capture *; autoplay *; clipboard-write *; fullscreen *';
                  iframe.setAttribute('allow', 'camera *; microphone *; display-capture *; autoplay *; clipboard-write *; fullscreen *');
                  iframe.setAttribute('allowfullscreen', 'true');
                  iframe.style.height = '100%';
                  iframe.style.width = '100%';
                  iframe.style.border = '0';
                }
              };

              setIframeAttributes();
              const observer = new MutationObserver(() => setIframeAttributes());
              observer.observe(parentNode, { childList: true, subtree: true });
            }
          }}
        />
      </div>
    </div>,
    document.body
  );
}