import React, { useEffect, useState } from 'react';
import { Bell, Mail, MessageSquare, Send, CheckCircle2, Search, Filter } from 'lucide-react';
import { NotificationRecord } from '../types';
import { api } from '../services/api';

interface NotificationCenterProps {
  onOpenDispatchModal: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onOpenDispatchModal,
}) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = notifications.filter((n) => {
    const channelPass = channelFilter === 'all' || n.channel === channelFilter;
    const q = search.toLowerCase();
    const searchPass =
      !search ||
      n.staff_name.toLowerCase().includes(q) ||
      n.course_code.toLowerCase().includes(q) ||
      n.venue_name.toLowerCase().includes(q);
    return channelPass && searchPass;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Invigilator Duty Call Slips & Notification Center</span>
          </h2>
          <p className="text-xs text-slate-500">
            Audit log of official examination notices dispatched to faculty via institutional email and SMS alerts.
          </p>
        </div>
        <button
          onClick={onOpenDispatchModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-2xs"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch Duty Slips</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff, course, venue..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Channel:</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="in_app">In-App Portal</option>
          </select>
        </div>
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
          <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-600">No duty call slips dispatched yet.</p>
          <p className="mt-1">
            Once you approve allocations on the roster, click &quot;Dispatch Duty Slips&quot; to send official email/SMS notices to invigilators.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((n) => (
            <div
              key={n.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-all space-y-2.5"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                    {n.channel === 'email' ? (
                      <Mail className="w-4 h-4" />
                    ) : n.channel === 'sms' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{n.staff_name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {n.channel} • {n.status}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                {n.message}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                <span>
                  Delivered to: {n.channel === 'email' ? n.staff_email : n.staff_phone}
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Delivery
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
