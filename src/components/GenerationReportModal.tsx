import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { GenerationReport } from '../types';

interface GenerationReportModalProps {
  report: GenerationReport | any;
  onClose: () => void;
  onViewRoster: () => void;
}

export const GenerationReportModal: React.FC<GenerationReportModalProps> = ({
  report: rawReport,
  onClose,
  onViewRoster,
}) => {
  // Normalize if raw report is nested inside API response wrapper e.g. { success: true, report: {...} }
  const report: Partial<GenerationReport> = (rawReport as any)?.report || rawReport || {};
  const warnings = Array.isArray(report?.warnings) ? report.warnings : [];
  const totalSlots = report.total_required_slots ?? 0;
  const newSuggestions = report.new_suggestions_count ?? 0;
  const preservedCount = report.preserved_approved_count ?? 0;
  const unfulfilledSlots = report.unfulfilled_slots ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg border border-emerald-700">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">
                Allocation Engine Run Complete
              </h3>
              <p className="text-xs text-emerald-300 mt-1">
                Federal University Lokoja Suggestion Generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 block">Total Slots</span>
              <span className="text-xl font-black text-emerald-950">{totalSlots}</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <span className="text-[11px] font-semibold text-blue-700 block">New Suggestions</span>
              <span className="text-xl font-black text-blue-950">{newSuggestions}</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <span className="text-[11px] font-semibold text-amber-700 block">Preserved Decisions</span>
              <span className="text-xl font-black text-amber-950">{preservedCount}</span>
            </div>

            <div className={`rounded-lg p-3 text-center border ${
              unfulfilledSlots > 0
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <span className={`text-[11px] font-semibold block ${
                unfulfilledSlots > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                Unfulfilled Slots
              </span>
              <span className="text-xl font-black">{unfulfilledSlots}</span>
            </div>
          </div>

          {/* Engine Logic Confirmation */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Applied University Allocation Constraints
            </h4>
            <ul className="space-y-1 text-slate-600 pl-5 list-disc">
              <li>
                <strong>Course Exclusion Rule:</strong> Course lecturers strictly excluded from invigilating their own exams.
              </li>
              <li>
                <strong>No Double-Booking:</strong> Validated time overlaps across all concurrent exam sessions.
              </li>
              <li>
                <strong>Individual Load Cap:</strong> Enforced max_load ceiling per academic staff member.
              </li>
              <li>
                <strong>Fairness Distribution:</strong> Sorted by current invigilation count ascending to balance faculty workload.
              </li>
              <li>
                <strong>Human-in-the-Loop:</strong> All {preservedCount} manually edited/approved slots were locked and untouched.
              </li>
            </ul>
          </div>

          {/* Warnings / Unfulfilled slots details if any */}
          {warnings.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Unfulfilled Slot Diagnostics ({warnings.length})</span>
              </div>
              <p className="text-[11px] text-rose-700">
                The following slots could not be filled automatically because all eligible staff have reached their load cap, have time overlaps, or lecture the course:
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] bg-white border border-rose-200 p-2 rounded text-rose-900 shadow-2xs"
                  >
                    <span className="font-bold">{w.course_code}</span> at{' '}
                    <span className="font-medium">{w.venue_name}</span> (Slot #{w.slot_index}):
                    <p className="text-slate-600 mt-0.5">{w.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onClose();
              onViewRoster();
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Review & Approve Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
