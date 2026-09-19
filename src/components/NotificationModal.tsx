import React, { useState } from 'react';
import { X, Bell, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface NotificationModalProps {
  approvedCount?: number;
  allocations?: any[];
  onClose: () => void;
  onSuccess: (sentCount: number) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  approvedCount,
  allocations,
  onClose,
  onSuccess,
}) => {
  const effectiveApprovedCount =
    approvedCount !== undefined
      ? approvedCount
      : Array.isArray(allocations)
      ? allocations.filter((a) => a?.status === 'approved').length
      : 0;

  const [channel, setChannel] = useState<'email' | 'sms' | 'in_app'>('email');
  const [onlyApproved, setOnlyApproved] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await api.dispatchNotifications(channel, onlyApproved);
      setResult({ count: res.count });
      onSuccess(res.count);
    } catch (err) {
      alert('Failed to dispatch notifications.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Dispatch Invigilation Duty Slips</h3>
              <p className="text-[11px] text-emerald-200">
                Official Senate Examination Notices to Staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-slate-800 text-xs">
          {result ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Duty Notifications Dispatched!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Successfully delivered {result.count} official duty call slips to faculty via{' '}
                <span className="font-semibold text-emerald-800 uppercase">{channel}</span>.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900"
              >
                Close & View Log
              </button>
            </div>
          ) : (
            <>
              {/* Channel Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Dispatch Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      channel === 'email'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-400 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-emerald-700" />
                    <span>Official Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      channel === 'sms'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-400 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    <span>SMS Alert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('in_app')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      channel === 'in_app'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-400 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-emerald-700" />
                    <span>Staff Portal</span>
                  </button>
                </div>
              </div>

              {/* Target options */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyApproved}
                    onChange={(e) => setOnlyApproved(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Only notify staff with <strong>"Approved"</strong> status ({effectiveApprovedCount} currently approved)
                  </span>
                </label>
              </div>

              {/* Preview Box */}
              <div>
                <span className="block font-semibold text-slate-700 mb-1">
                  Sample Message Template Preview
                </span>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {channel === 'sms' ? (
                    `[FUL EXAM OFFICE] Dear Dr. Fatima Bello, you are assigned as Chief Invigilator for CSC 301 at LT-1 on 2026-10-12 (09:00-12:00). Report 30m prior.`
                  ) : (
                    `FEDERAL UNIVERSITY LOKOJA - EXAMINATION DUTY CALL SLIP\nDear Prof. / Dr. [Staff Name],\nYou have been officially allocated as Chief/Assistant Invigilator for:\nCourse: CSC 301 - Data Structures\nDate: 2026-10-12 | Time: 09:00 - 12:00\nVenue: Lecture Theatre 1 (Felele Campus)\nPlease report at the venue 30 minutes before commencement.\nSigned: Senate Examination Committee, FUL.`
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-800">
                Notice: Dispatched slips are logged in the <strong>Duty Slips</strong> repository for record-keeping and audit compliance.
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || (onlyApproved && approvedCount === 0)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Dispatch Notifications'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
