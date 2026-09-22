import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, AlertOctagon, UserCheck, Shield, Sparkles } from 'lucide-react';
import { EnrichedAllocation, Staff } from '../types';
import { api } from '../services/api';

interface SwapStaffModalProps {
  allocation: EnrichedAllocation;
  allStaff?: Staff[];
  staffList?: Staff[];
  onClose: () => void;
  onSave?: (updatedAlloc: any) => void;
  onSuccess?: () => void;
}

export const SwapStaffModal: React.FC<SwapStaffModalProps> = ({
  allocation,
  allStaff,
  staffList,
  onClose,
  onSave,
  onSuccess,
}) => {
  const staffArray = Array.isArray(allStaff) ? allStaff : Array.isArray(staffList) ? staffList : [];
  const [selectedStaffId, setSelectedStaffId] = useState<string>(allocation.staff_id);
  const [selectedRole, setSelectedRole] = useState<'chief' | 'assistant'>(allocation.role);
  const [notes, setNotes] = useState<string>(allocation.notes || '');
  const [conflictCheck, setConflictCheck] = useState<{
    valid: boolean;
    issues: string[];
    currentLoad: number;
    maxLoad: number;
  } | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [saving, setSaving] = useState(false);

  // Run conflict check whenever selected staff changes
  useEffect(() => {
    let isMounted = true;
    async function check() {
      if (!allocation.exam_id || !selectedStaffId) return;
      setLoadingCheck(true);
      try {
        const res = await api.checkConflicts(allocation.exam_id, selectedStaffId, allocation.id);
        if (isMounted) {
          setConflictCheck(res);
        }
      } catch (err) {
        console.error('Failed to check conflicts:', err);
      } finally {
        if (isMounted) setLoadingCheck(false);
      }
    }
    check();
    return () => {
      isMounted = false;
    };
  }, [selectedStaffId, allocation.exam_id, allocation.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateAllocation(allocation.id, {
        staff_id: selectedStaffId,
        role: selectedRole,
        notes,
        status: 'edited', // Mark as edited so engine protects it
      });
      if (onSave) onSave(res);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to update allocation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedStaff = staffArray.find((s) => s.id === selectedStaffId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0b3f7a] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-slate-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Manual Invigilator Assignment & Override</h3>
              <p className="text-[11px] text-blue-100">
                {allocation.course?.code} • {allocation.venue?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-slate-800">
          {/* Exam Context Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Exam Date & Time:</span>
              <span className="font-semibold text-slate-800">
                {allocation.exam?.date} ({allocation.exam?.start_time} - {allocation.exam?.end_time})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Course Lecturer:</span>
              <span className="font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                {allocation.lecturer?.name || 'Assigned Lecturer'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Venue:</span>
              <span className="font-semibold text-slate-800">
                {allocation.venue?.name} ({allocation.venue?.location})
              </span>
            </div>
          </div>

          {/* Select Staff */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Invigilator (Staff)
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none bg-white text-slate-900"
            >
              {staffArray.map((s) => {
                const isLecturer = s.id === allocation.course?.lecturer_id;
                return (
                  <option key={s.id} value={s.id} disabled={!s.is_active}>
                    {s.name} ({s.rank} - {s.department}) {isLecturer ? '⛔ [Lecturer - Excluded]' : ''} {!s.is_active ? '⚠️ [Inactive]' : ''}
                  </option>
                );
              })}
            </select>
            {selectedStaff && (
              <p className="text-[11px] text-slate-500 mt-1">
                Dept: {selectedStaff.department} • Phone: {selectedStaff.phone} • Max Allowed Load: {selectedStaff.max_load}
              </p>
            )}
          </div>

          {/* Conflict Analysis Live Feedback */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700">Constraint Validation Check</span>
              {loadingCheck && <span className="text-[10px] text-slate-400">Validating...</span>}
            </div>

            {conflictCheck && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  conflictCheck.valid
                    ? 'bg-blue-50 border-blue-200 text-slate-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {conflictCheck.valid ? (
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#0d4b8f] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#0d4b8f]">Eligible Assignment</span>
                      <p className="text-[11px] text-[#0d4b8f] mt-0.5">
                        No exclusion rule conflicts, no timetable overlaps. Current workload: {conflictCheck.currentLoad ?? 0} of {conflictCheck.maxLoad ?? 0}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>Constraint Warnings Detected</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700 pl-1">
                      {(conflictCheck.issues || []).map((iss, i) => (
                        <li key={i}>{iss}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-rose-600 italic mt-1">
                      Note: You can still save this override if authorized by Senate Examination Board.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Select Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designated Invigilation Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('chief')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedRole === 'chief'
                    ? 'bg-slate-50 border-slate-500 text-slate-900 ring-2 ring-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-slate-600" />
                <span>Chief Invigilator</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('assistant')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedRole === 'assistant'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Assistant Invigilator</span>
              </button>
            </div>
          </div>

          {/* Admin Override Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Override Justification / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Swapped per Faculty Board approval"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
            />
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-md p-2 text-[11px] text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>
              Saving will change status to <strong>"edited"</strong>. Future automated suggestions will preserve this human choice.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0d4b8f] hover:bg-[#0b3f7a] transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
