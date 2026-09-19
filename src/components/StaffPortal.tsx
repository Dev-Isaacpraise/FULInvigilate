import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  UserCheck,
  RefreshCw,
  Send,
  HelpCircle,
  ChevronRight,
  User,
  LogOut,
  Sparkles,
  Info,
  Phone,
  Mail,
  Building,
  GraduationCap,
  Award,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import { Staff, Course, EnrichedAllocation, AppUser } from '../types';
import { api } from '../services/api';

interface StaffPortalProps {
  currentUser: AppUser;
  staffList: Staff[];
  courses: Course[];
  allocations: EnrichedAllocation[];
  onLogout: () => void;
  onSwitchToAdmin: () => void;
  onRefreshData: () => Promise<void>;
  onSelectOtherStaff?: (staff: Staff) => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  currentUser,
  staffList,
  courses,
  allocations,
  onLogout,
  onSwitchToAdmin,
  onRefreshData,
  onSelectOtherStaff,
}) => {
  const staffMember = currentUser.staffData || staffList.find((s) => s.id === currentUser.id);

  // Sub-tabs in Staff Portal
  const [activeTab, setActiveTab] = useState<'schedule' | 'call_slip' | 'guidelines'>('schedule');

  // Swap / Relief Request Modal
  const [swapModalAlloc, setSwapModalAlloc] = useState<EnrichedAllocation | null>(null);
  const [swapReason, setSwapReason] = useState('');
  const [swapTargetStaffId, setSwapTargetStaffId] = useState('');
  const [swapType, setSwapType] = useState<'swap' | 'relief'>('swap');
  const [submittingSwap, setSubmittingSwap] = useState(false);
  const [swapSuccessMsg, setSwapSuccessMsg] = useState('');

  // Acknowledging State
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  // Filter this staff's allocations
  const staffId = staffMember?.id || currentUser.id;
  const myAllocations = allocations.filter(
    (a) => a.staff_id === staffId && a.status !== 'rejected'
  );

  // Courses lectured by this staff (Exclusions)
  const myCourses = courses.filter((c) => c.lecturer_id === staffId);

  // Metrics
  const maxLoad = staffMember?.max_load || 4;
  const allocatedCount = myAllocations.length;
  const chiefCount = myAllocations.filter((a) => a.role === 'chief').length;
  const assistantCount = myAllocations.filter((a) => a.role === 'assistant').length;
  const utilizationPct = Math.min(100, Math.round((allocatedCount / maxLoad) * 100));

  // Sort allocations chronologically
  const sortedAllocations = [...myAllocations].sort((a, b) => {
    const dateA = a.exam?.date || '';
    const dateB = b.exam?.date || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.exam?.start_time || '').localeCompare(b.exam?.start_time || '');
  });

  // Handle duty acknowledgment
  const handleAcknowledgeDuty = async (allocId: string) => {
    setAcknowledgingId(allocId);
    try {
      await api.acknowledgeDuty(allocId, staffId);
      await onRefreshData();
    } catch (err) {
      alert('Failed to acknowledge duty. Please try again.');
    } finally {
      setAcknowledgingId(null);
    }
  };

  // Submit duty swap or relief request
  const handleSubmitSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapModalAlloc) return;
    setSubmittingSwap(true);
    try {
      const res = await api.submitSwapRequest({
        allocation_id: swapModalAlloc.id,
        staff_id: staffId,
        proposed_staff_id: swapTargetStaffId || undefined,
        reason: swapReason,
        type: swapType,
      });
      setSwapSuccessMsg(res.message || 'Request submitted successfully.');
      await onRefreshData();
      setTimeout(() => {
        setSwapModalAlloc(null);
        setSwapSuccessMsg('');
        setSwapReason('');
        setSwapTargetStaffId('');
      }, 2000);
    } catch (err) {
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmittingSwap(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800/80 border-2 border-amber-400/40 flex items-center justify-center shadow-lg shrink-0">
                <GraduationCap className="w-9 h-9 text-amber-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-white">
                    {staffMember?.name || currentUser.name}
                  </h1>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {staffMember?.rank || currentUser.rank || 'Academic Staff'}
                  </span>
                  <span className="bg-emerald-800 text-emerald-200 text-[11px] font-medium px-2 py-0.5 rounded-full">
                    Invigilator Portal
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-200/90 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    Dept. of {staffMember?.department || currentUser.department || 'Science'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    {staffMember?.email || currentUser.email}
                  </span>
                  {staffMember?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      {staffMember.phone}
                    </span>
                  )}
                  <span className="text-emerald-400 font-mono text-[11px]">
                    Staff ID: {staffMember?.id || currentUser.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Testing and Role Switch */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              {/* Change Staff Switcher (useful for demo testing other lecturers) */}
              {staffList.length > 1 && (
                <div className="relative">
                  <select
                    value={staffId}
                    onChange={(e) => {
                      const selected = staffList.find((s) => s.id === e.target.value);
                      if (selected && onSelectOtherStaff) {
                        onSelectOtherStaff(selected);
                      }
                    }}
                    title="Switch staff profile for testing"
                    aria-label="Switch staff profile for testing"
                    className="bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/80 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Switch Faculty Profile...</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name} ({s.rank})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={onSwitchToAdmin}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                title="Switch to Examination Officer Admin View"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Officer Admin View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Load & Role Summary Row */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Workload Allocated</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900">{allocatedCount}</span>
              <span className="text-xs text-slate-500 font-medium">of {maxLoad} max</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all ${
                  allocatedCount >= maxLoad
                    ? 'bg-amber-500'
                    : allocatedCount > 0
                    ? 'bg-emerald-600'
                    : 'bg-slate-300'
                }`}
                style={{ width: `${utilizationPct}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Chief Invigilator
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-amber-950">{chiefCount}</span>
              <span className="text-xs text-slate-500">session(s)</span>
            </div>
            <span className="text-[10px] text-amber-700 block mt-1">Lead Hall Authority</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-blue-800 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Assistant Invigilator
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-blue-950">{assistantCount}</span>
              <span className="text-xs text-slate-500">session(s)</span>
            </div>
            <span className="text-[10px] text-blue-700 block mt-1">Support & Verification</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Status Compliance</span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900">
                {allocatedCount === 0 ? 'No Duties Yet' : 'Duties Allocated'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Senate Approved Roster
            </span>
          </div>
        </div>

        {/* Course Conflict Exclusions Banner */}
        {myCourses.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-amber-50/80 border-t border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">
                Academic Integrity & Conflict-of-Interest Exclusion:
              </span>{' '}
              You are the designated lecturer for{' '}
              {myCourses.map((c, i) => (
                <span key={c.id}>
                  <strong className="font-mono bg-amber-200/60 px-1.5 py-0.5 rounded text-amber-950">
                    {c.code} ({c.title})
                  </strong>
                  {i < myCourses.length - 1 ? ', ' : ''}
                </span>
              ))}
              . As required by Federal University Lokoja regulations, you are strictly exempted from
              invigilating your own course examination sessions.
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Duty Schedule ({myAllocations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('call_slip')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'call_slip'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Official Duty Call Slip</span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'guidelines'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Invigilator Guidelines</span>
          </button>
        </div>

        {activeTab === 'call_slip' && (
          <button
            onClick={handlePrintSlip}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Call Slip</span>
          </button>
        )}
      </div>

      {/* TAB 1: MY SCHEDULE & DUTIES */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {sortedAllocations.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Invigilation Duties Allocated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The Examination Officer has not assigned any duties to you in the current draft roster,
                or the automated allocation engine has not been executed yet.
              </p>
              <button
                onClick={onSwitchToAdmin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
              >
                <span>Go to Officer View to Run Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedAllocations.map((alloc) => {
                const isAcknowledged =
                  alloc.notes && alloc.notes.includes('Confirmed & Acknowledged');
                const hasPendingSwap =
                  alloc.notes && alloc.notes.includes('[SWAP/RELIEF REQUEST');

                // Find co-invigilators assigned to the exact same exam & venue
                const coInvigilators = allocations.filter(
                  (a) =>
                    a.exam_id === alloc.exam_id &&
                    a.venue_id === alloc.venue_id &&
                    a.staff_id !== staffId &&
                    a.status !== 'rejected'
                );

                return (
                  <div
                    key={alloc.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Left: Date & Timing Badge */}
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center min-w-[85px] shrink-0">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block tracking-wider">
                          {alloc.exam?.date
                            ? new Date(alloc.exam.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                              })
                            : 'EXAM'}
                        </span>
                        <span className="text-lg font-black text-emerald-950 block leading-tight">
                          {alloc.exam?.date
                            ? new Date(alloc.exam.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono">
                          {alloc.exam?.date ? alloc.exam.date.split('-')[0] : '2026'}
                        </span>
                      </div>

                      {/* Middle: Course & Venue Details */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {alloc.course?.code || 'COURSE'}
                          </span>
                          <h2 className="text-sm font-bold text-slate-800">
                            {alloc.course?.title || 'Examination Session'}
                          </h2>

                          {alloc.role === 'chief' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-full">
                              <Award className="w-3 h-3 text-amber-600" />
                              Chief Invigilator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                              <UserCheck className="w-3 h-3 text-blue-600" />
                              Assistant Invigilator
                            </span>
                          )}

                          {alloc.status === 'approved' && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              Approved Roster
                            </span>
                          )}
                        </div>

                        {/* Timing and Venue info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-medium text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-emerald-700" />
                            {alloc.exam?.start_time} - {alloc.exam?.end_time}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-800">
                            <MapPin className="w-3.5 h-3.5 text-rose-600" />
                            {alloc.venue?.name} ({alloc.venue?.location})
                          </span>
                          <span className="text-slate-500">
                            Venue Capacity: {alloc.venue?.capacity} students
                          </span>
                        </div>

                        {/* Co-invigilators in this venue */}
                        <div className="pt-1 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-slate-700">Team on Duty:</span>
                          <span className="text-emerald-800 font-medium">You ({alloc.role})</span>
                          {coInvigilators.length > 0 ? (
                            coInvigilators.map((co) => (
                              <span
                                key={co.id}
                                className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700"
                                title={`Phone: ${co.staff?.phone || 'N/A'}`}
                              >
                                {co.staff?.name} ({co.role})
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">No other staff assigned</span>
                          )}
                        </div>

                        {/* Notice or status if swap submitted */}
                        {hasPendingSwap && (
                          <div className="mt-1 bg-amber-50 border border-amber-200 p-1.5 rounded text-[11px] text-amber-900 font-medium">
                            {alloc.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Duty Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {isAcknowledged ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Duty Confirmed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcknowledgeDuty(alloc.id)}
                          disabled={acknowledgingId === alloc.id}
                          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                        >
                          {acknowledgingId === alloc.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Acknowledge Duty</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSwapModalAlloc(alloc);
                          setSwapReason('');
                          setSwapTargetStaffId('');
                          setSwapSuccessMsg('');
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Request Swap / Relief</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OFFICIAL DUTY CALL SLIP */}
      {activeTab === 'call_slip' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 print:p-0 print:border-none print:shadow-none space-y-6 max-w-4xl mx-auto">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-emerald-900 pb-5 space-y-1">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-900 text-amber-400 flex items-center justify-center font-black text-xl mb-1 shadow-sm">
              FUL
            </div>
            <h1 className="text-xl font-black text-emerald-950 uppercase tracking-wide">
              Federal University Lokoja
            </h1>
            <p className="text-xs font-semibold text-slate-700 uppercase">
              Office of the Registrar • Senate Examination Committee
            </p>
            <p className="text-[11px] font-serif text-slate-600 italic">
              P.M.B. 1154, Lokoja, Kogi State, Nigeria
            </p>
            <div className="pt-2">
              <span className="inline-block bg-emerald-900 text-white font-bold text-xs uppercase px-4 py-1 rounded tracking-wider">
                Official Examination Invigilation Call Slip (2025/2026 Session)
              </span>
            </div>
          </div>

          {/* Invigilator Meta Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                Invigilator Name
              </span>
              <span className="font-bold text-slate-900 text-sm">{staffMember?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                Academic Rank
              </span>
              <span className="font-semibold text-slate-800">{staffMember?.rank}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                Department
              </span>
              <span className="font-semibold text-slate-800">{staffMember?.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                Staff ID / Contact
              </span>
              <span className="font-mono text-slate-800 text-[11px] block">{staffMember?.id}</span>
              <span className="text-slate-600 text-[11px]">{staffMember?.phone}</span>
            </div>
          </div>

          {/* Formal Letter text */}
          <div className="text-xs text-slate-700 leading-relaxed space-y-2">
            <p>
              Dear <strong>{staffMember?.name}</strong>,
            </p>
            <p>
              You are hereby officially appointed by the Senate Examination Committee as an invigilator
              for the upcoming semester examinations. Below are the designated sessions, roles, and
              hall allocations assigned to you:
            </p>
          </div>

          {/* Official Schedule Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold text-[11px]">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Time Range</th>
                  <th className="p-2.5">Course Code & Title</th>
                  <th className="p-2.5">Assigned Venue</th>
                  <th className="p-2.5">Invigilation Role</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedAllocations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                      No invigilation sessions assigned at this time.
                    </td>
                  </tr>
                ) : (
                  sortedAllocations.map((a, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-900">{a.exam?.date}</td>
                      <td className="p-2.5 font-mono text-slate-700">
                        {a.exam?.start_time} - {a.exam?.end_time}
                      </td>
                      <td className="p-2.5">
                        <span className="font-bold text-slate-900">{a.course?.code}</span>
                        <span className="block text-[11px] text-slate-600">{a.course?.title}</span>
                      </td>
                      <td className="p-2.5 text-slate-800">
                        <span className="font-semibold">{a.venue?.name}</span>
                        <span className="block text-[10px] text-slate-500">{a.venue?.location}</span>
                      </td>
                      <td className="p-2.5">
                        {a.role === 'chief' ? (
                          <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                            CHIEF INVIGILATOR
                          </span>
                        ) : (
                          <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                            ASSISTANT
                          </span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          CONFIRMED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Statutory Directives */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-950 space-y-1.5">
            <span className="font-bold flex items-center gap-1 text-amber-950">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              Statutory Invigilator Directives (FUL Senate Regulations):
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                Report at the Central Examination Strongroom <strong>30 minutes before</strong> commencement to collect question papers and answer booklets.
              </li>
              <li>
                Ensure no candidate is admitted into the hall without their valid University Student ID Card and Examination Docket.
              </li>
              <li>
                Strictly enforce prohibition of mobile phones, smartwatches, and programmable devices.
              </li>
              <li>
                In the event of suspected examination malpractice, immediately issue the standard Senate Examination Malpractice Form and confiscate unauthorized materials.
              </li>
            </ul>
          </div>

          {/* Signature Block */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs border-t border-slate-200">
            <div>
              <div className="border-b border-slate-400 w-48 mb-1"></div>
              <span className="font-bold text-slate-900 block">Prof. A. S. Mallam</span>
              <span className="text-slate-500 text-[11px]">Chief Examination Officer, FUL</span>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-48 ml-auto mb-1"></div>
              <span className="font-bold text-slate-900 block">{staffMember?.name}</span>
              <span className="text-slate-500 text-[11px]">Invigilator Acknowledgment Signature</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GUIDELINES & CODE OF CONDUCT */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <GraduationCap className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Federal University Lokoja — Code of Conduct for Examination Invigilators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  1. Punctuality & Attendance
                </h3>
                <p>
                  Invigilators must arrive at the examination hall at least 30 minutes prior to the
                  scheduled start time. Chief Invigilators are responsible for script collection and
                  admitting candidates into the venue in an orderly queue.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  2. Conflict of Interest Exclusions
                </h3>
                <p>
                  Under no circumstance may a course lecturer invigilate their own course examination.
                  The automated allocation engine enforces this exclusion automatically. If an accidental
                  assignment occurs, report to the Chief Exam Officer immediately.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  3. Candidate Verification
                </h3>
                <p>
                  Verify each candidate's Student Identity Card and Exam Clearance Slip. Candidates
                  without valid identification must be escorted to the Faculty Security desk.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  4. Examination Malpractice Procedure
                </h3>
                <p>
                  Do not engage in physical altercation. Confiscate the unauthorized material, issue
                  the candidate a new answer booklet, record the time and nature of the offense, and
                  have the candidate complete and sign the Malpractice Report Form at the end of the session.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  5. Chief Invigilator Responsibilities
                </h3>
                <p>
                  The Chief Invigilator leads the examination session, makes formal announcements,
                  monitors the clock, verifies the final script headcount matches attendance sheets,
                  and seals the script envelopes in the presence of assistant invigilators.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                  6. Emergency Swaps & Relief
                </h3>
                <p>
                  If an invigilator cannot attend due to documented medical emergency or official duty,
                  they must submit a Swap/Relief Request through this portal at least 24 hours prior
                  to the exam session.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SWAP / RELIEF REQUEST MODAL */}
      {swapModalAlloc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">Request Invigilation Swap or Relief</h3>
                  <span className="text-[11px] text-emerald-300">
                    Senate Examination Committee Notification Form
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSwapModalAlloc(null)}
                className="text-emerald-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSwap} className="p-6 space-y-4 text-xs">
              {swapSuccessMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">{swapSuccessMsg}</p>
                  <p className="text-[11px] text-emerald-700">
                    Your request has been logged and the Examination Officer will review it.
                  </p>
                </div>
              ) : (
                <>
                  {/* Session Overview */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block">Duty Session:</span>
                    <p>
                      <strong>{swapModalAlloc.course?.code}:</strong> {swapModalAlloc.course?.title}
                    </p>
                    <p className="text-slate-600">
                      Date: {swapModalAlloc.exam?.date} | Time: {swapModalAlloc.exam?.start_time} - {swapModalAlloc.exam?.end_time}
                    </p>
                    <p className="text-slate-600">
                      Venue: {swapModalAlloc.venue?.name} ({swapModalAlloc.role.toUpperCase()} INVIGILATOR)
                    </p>
                  </div>

                  {/* Request Type */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Request Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSwapType('swap')}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          swapType === 'swap'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span>Colleague Swap</span>
                        <span className="block text-[10px] text-slate-500 font-normal">
                          Propose a replacement colleague
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSwapType('relief')}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          swapType === 'relief'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span>Duty Relief</span>
                        <span className="block text-[10px] text-slate-500 font-normal">
                          Request committee relief / emergency
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* If Swap, select proposed replacement colleague */}
                  {swapType === 'swap' && (
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Proposed Replacement Faculty Member
                      </label>
                      <select
                        value={swapTargetStaffId}
                        onChange={(e) => setSwapTargetStaffId(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      >
                        <option value="">-- Propose a Colleague (Optional) --</option>
                        {staffList
                          .filter((s) => s.id !== staffId && s.is_active)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.rank} • {s.department})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Reason for Request <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={swapReason}
                      onChange={(e) => setSwapReason(e.target.value)}
                      placeholder="e.g. Attending mandatory academic conference, documented medical appointment, departmental emergency..."
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSwapModalAlloc(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingSwap || !swapReason.trim()}
                      className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-1.5"
                    >
                      {submittingSwap ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Submit to Exam Officer</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
