import { Modal, Button } from 'antd';
import { useState } from 'react';
import { LiveSessions as LiveSessionType } from '../../types/liveSessions';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../ui/CustomSelect';

export interface SelectSessionModalProps {
  open: boolean;
  onClose: () => void;
  sessions: LiveSessionType[] | any;
  onConfirm: (sessionId: string) => void;
}

export default function SelectSessionModal({ open, onClose, sessions, onConfirm }: SelectSessionModalProps) {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const sessionArray: LiveSessionType[] = Array.isArray(sessions)
    ? sessions
    : (sessions?.data?.items || []);

  const handleOk = () => {
    if (selectedId) {
      onConfirm(selectedId);
      setSelectedId(undefined);
    }
  };

  const options = sessionArray.map((session) => ({
    value: session.id,
    label: session.title,
  }));

  return (
    <Modal
      open={open}
      onCancel={() => {
        onClose();
        setSelectedId(undefined);
      }}
      title={language === 'ar' ? 'اختر جلسة للبث' : 'Select Session to Start'}
      footer={[
        <Button key="back" onClick={() => {
          onClose();
          setSelectedId(undefined);
        }}>
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!selectedId}
          onClick={handleOk}
        >
          {language === 'ar' ? 'ابدأ البث' : 'Start Live'}
        </Button>,
      ]}
    >
      <div className="py-4">
        <CustomSelect
          label={language === 'ar' ? 'اسم الجلسة' : 'Session Name'}
          placeholder={language === 'ar' ? 'اختر الجلسة للبث' : 'Select session to start'}
          value={selectedId}
          onChange={(val) => setSelectedId(val as string)}
          options={options}
        />
      </div>
    </Modal>
  );
}
