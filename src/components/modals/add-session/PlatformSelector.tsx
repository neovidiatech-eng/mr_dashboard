import { Video, MonitorPlay } from 'lucide-react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface PlatformSelectorProps {
  watchPlatform: string;
  setValue: UseFormSetValue<any>;
}

export default function PlatformSelector({
  watchPlatform,
  setValue,
}: PlatformSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-6">
      <label className="label mb-3">{t('meetingPlatform')}</label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setValue('platform', 'zoom')}
          className={`platform-btn ${
            watchPlatform === 'zoom' ? 'active-platform' : ''
          }`}
        >
          <Video className="w-4 h-4" />
          Zoom
        </button>

        <button
          type="button"
          onClick={() => setValue('platform', 'google')}
          className={`platform-btn ${
            watchPlatform === 'google' ? 'active-platform' : ''
          }`}
        >
          <MonitorPlay className="w-4 h-4" />
          Google Meet
        </button>
      </div>
    </div>
  );
}
