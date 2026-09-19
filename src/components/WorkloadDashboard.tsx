import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Scale,
  Users,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import { StaffWorkloadStats, EnrichedAllocation } from '../types';
import { api } from '../services/api';

interface WorkloadDashboardProps {
  allocations: EnrichedAllocation[];
}

export const WorkloadDashboard: React.FC<WorkloadDashboardProps> = ({ allocations }) => {
  const [stats, setStats] = useState<StaffWorkloadStats[]>([]);
  const [summary, setSummary] = useState<{
    totalStaff: number;
    activeStaff: number;
    averageLoad: number;
    standardDeviation: number;
    equityIndex: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await api.getWorkloadStats();
        setStats(Array.isArray(res?.staffStats) ? res.staffStats : []);
        setSummary(res?.summary || null);
      } catch (err) {
        console.error('Failed to load workload stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [allocations]);

  const safeAllocations = Array.isArray(allocations) ? allocations : [];
  const safeStats = Array.isArray(stats) ? stats : [];

  const selectedStaffDuties = selectedStaffId
    ? safeAllocations.filter((a) => a.staff_id === selectedStaffId && a.status !== 'rejected')
    : [];

  const selectedStaffObj = safeStats.find((s) => s.staff_id === selectedStaffId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-500" />
              <span>Workload Distribution & Fairness Index</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The engine prioritizes staff with the fewest invigilations so far in the current period to guarantee an equitable division of labor.
            </p>
          </div>
        </div>

        {/* Summary Metrics */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
              <span className="text-[11px] font-semibold text-emerald-800 block">
                Fairness Equity Index
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-emerald-950">
                  {summary.equityIndex}%
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Optimal</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Average Duties / Staff
              </span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                {summary.averageLoad}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Standard Deviation (σ)
              </span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                ±{summary.standardDeviation}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Active Invigilators
              </span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                {summary.activeStaff} / {summary.totalStaff}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Staff workload bars + Selected Staff History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Faculty Load Tracking ({safeStats.length} Staff)
            </h3>
            <span className="text-[11px] text-slate-500">Click a staff member to view duties</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {safeStats.map((s) => {
              const isSelected = selectedStaffId === s.staff_id;
              const isAtCap = s.allocated_count >= s.max_load;
              const isNearCap = s.allocated_count === s.max_load - 1;

              return (
                <div
                  key={s.staff_id}
                  onClick={() => setSelectedStaffId(s.staff_id)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/60 border-l-4 border-emerald-700' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {isAtCap && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">
                            AT CAP
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {s.rank} • {s.department}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">
                        {s.allocated_count} / {s.max_load}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({s.utilization_rate}% utilized)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    {/* Approved portion */}
                    <div
                      style={{
                        width: `${Math.min(100, (s.approved_count / s.max_load) * 100)}%`,
                      }}
                      className="bg-emerald-600 h-full"
                      title={`Approved: ${s.approved_count}`}
                    />
                    {/* Edited portion */}
                    <div
                      style={{
                        width: `${Math.min(100, (s.edited_count / s.max_load) * 100)}%`,
                      }}
                      className="bg-blue-600 h-full"
                      title={`Edited: ${s.edited_count}`}
                    />
                    {/* Suggested portion */}
                    <div
                      style={{
                        width: `${Math.min(100, (s.suggested_count / s.max_load) * 100)}%`,
                      }}
                      className="bg-amber-500 h-full"
                      title={`Suggested: ${s.suggested_count}`}
                    />
                  </div>

                  {/* Status counts pills */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Approved: {s.approved_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Suggested: {s.suggested_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      Manual Overrides: {s.edited_count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Staff Duty History Pane */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">
              Invigilation History Details
            </h3>

            {selectedStaffObj ? (
              <div className="space-y-4 mt-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-xs text-slate-900">{selectedStaffObj.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedStaffObj.rank} • {selectedStaffObj.department}
                  </p>
                  <div className="mt-2 text-xs flex justify-between font-medium">
                    <span className="text-slate-600">Total Allocations:</span>
                    <span className="font-bold text-slate-900">
                      {selectedStaffObj.allocated_count} / {selectedStaffObj.max_load} duties
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Assigned Examination Slots ({selectedStaffDuties.length})
                  </span>

                  {selectedStaffDuties.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No duties currently assigned.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {selectedStaffDuties.map((d) => (
                        <div
                          key={d.id}
                          className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs space-y-1 shadow-2xs"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-black text-emerald-950 font-mono">
                              {d.course?.code}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                d.role === 'chief'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {d.role}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-700">
                            {d.venue?.name}
                          </div>

                          <div className="text-[10px] text-slate-500">
                            {d.exam?.date} • {d.exam?.start_time} - {d.exam?.end_time}
                          </div>

                          <div className="pt-1 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Status:</span>
                            <span className="font-bold text-emerald-700 capitalize">
                              {d.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                Select any academic staff member from the left list to review their exact invigilation assignments and scheduling records.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
