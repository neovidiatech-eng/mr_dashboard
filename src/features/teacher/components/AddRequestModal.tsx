import { Modal, Button, DatePicker, TimePicker } from 'antd';
import { MessageSquare, Calendar, Clock } from 'lucide-react';
import { useCreateRequest } from '../../../hooks/useRequests';
import { RequestType } from '../../../types/requests';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSessionRequestSchema, SessionRequestFormData } from '../../../lib/schemas/SessionRequestSchema';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AddRequestModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
}

export default function AddRequestModal({ visible, onClose, sessionId, sessionTitle }: AddRequestModalProps) {
  const { t } = useLanguage();
  const { mutate: createRequest, isPending } = useCreateRequest();

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<SessionRequestFormData>({
    resolver: zodResolver(getSessionRequestSchema(t)) as any,
    defaultValues: {
      type: 'reschedule',
      reason: ''
    }
  });

  const requestType = watch('type');

  const onSubmit = (values: SessionRequestFormData) => {
    let newStartTime = '';

    if (values.type === 'reschedule' && values.date && values.time) {
      const date = dayjs(values.date);
      const time = dayjs(values.time);
      newStartTime = date
        .hour(time.hour())
        .minute(time.minute())
        .second(0)
        .toISOString();
    }

    const requestData = {
      sessionId,
      type: values.type as RequestType,
      reason: values.reason,
      requestedData: values.type === 'reschedule' ? {
        new_start_time: newStartTime,
      } : {}
    };

    createRequest(requestData, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Session Request</h3>
            <p className="text-xs font-medium text-slate-400">Request changes for: {sessionTitle}</p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      className="premium-modal"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 text-start">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Request Type</label>
          <select
            {...register('type')}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="reschedule">Reschedule Session</option>
            <option value="cancel">Cancel Session</option>
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.type.message}</p>}
        </div>

        {requestType === 'reschedule' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><Calendar size={14} /> Date</label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full h-11 rounded-xl"
                    placeholder="Pick date"
                  />
                )}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{String(errors.date.message)}</p>}
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><Clock size={14} /> Time</label>
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    format="HH:mm"
                    className="w-full h-11 rounded-xl"
                    placeholder="Pick time"
                  />
                )}
              />
               {errors.time && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{String(errors.time.message)}</p>}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Reason / Details</label>
          <textarea
            {...register('reason')}
            placeholder="Explain why you are making this request..."
            rows={4}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
          {errors.reason && <p className="text-red-500 text-xs mt-1 font-bold uppercase">{errors.reason.message}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-slate-600">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="h-11 px-8 rounded-xl font-bold bg-blue-600 border-none shadow-lg shadow-blue-200"
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
