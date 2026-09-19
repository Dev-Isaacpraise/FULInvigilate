import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  UserCheck,
  Shield,
  Trash2,
  Edit3,
  CheckCheck,
  Sparkles,
  Lock,
  Calendar,
} from 'lucide-react';
import { EnrichedAllocation, Staff } from '../types';

interface RosterTableProps {
  allocations: EnrichedAllocation[];
  allStaff: Staff[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onBulkApprove: (ids?: string[]) => void;
  onOpenSwapModal: (allocation: EnrichedAllocation) => void;
  onToggleRole: (allocation: EnrichedAllocation) => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  allocations,
  allStaff,
  onApprove,
  onReject,
  onDelete,
  onBulkApprove,
  onOpenSwapModal,
  onToggleRole,
}) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Unique dates for filter
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    safeAllocations.forEach((a) => {
      if (a.exam?.date) dates.add(a.exam.date);
    });
    return Array.from(dates).sort();
  }, [safeAllocations]);

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    return safeAllocations.filter((a) => {
      // Search
      const q = searchQuery.toLowerCase();
      const staffMatch = a.staff?.name.toLowerCase().includes(q) || false;
      const courseMatch =
        a.course?.code.toLowerCase().includes(q) ||
        a.course?.title.toLowerCase().includes(q) ||
        false;
      const venueMatch = a.venue?.name.toLowerCase().includes(q) || false;
      const searchPass = !searchQuery || staffMatch || courseMatch || venueMatch;

      // Status
      const statusPass = statusFilter === 'all' || a.status === statusFilter;

      // Role
      const rolePass = roleFilter === 'all' || a.role === roleFilter;

      // Date
      const datePass = dateFilter === 'all' || a.exam?.date === dateFilter;

      return searchPass && statusPass && rolePass && datePass;
    });
  }, [safeAllocations, searchQuery, statusFilter, roleFilter, dateFilter]);

  // Selection helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredAllocations.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const suggestedCount = safeAllocations.filter((a) => a.status === 'suggested').length;

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff, course code, venue..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Exam Dates</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  Date: {d}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="suggested">Suggested (Pending Review)</option>
              <option value="approved">Approved</option>
              <option value="edited">Manually Edited</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="chief">Chief Invigilator</option>
              <option value="assistant">Assistant Invigilator</option>
            </select>

            {/* Quick Bulk Approve Button */}
            {selectedIds.size > 0 ? (
              <button
                onClick={() => onBulkApprove(Array.from(selectedIds))}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-2xs"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Approve Selected ({selectedIds.size})</span>
              </button>
            ) : suggestedCount > 0 ? (
              <button
                onClick={() => onBulkApprove()}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-colors shadow-2xs"
              >
                <CheckCheck className="w-4 h-4 text-amber-300" />
                <span>Approve All Suggested ({suggestedCount})</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Active filters status counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <strong>{filteredAllocations.length}</strong> of{' '}
            <strong>{safeAllocations.length}</strong> invigilation allocations
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              Suggested: {safeAllocations.filter((a) => a.status === 'suggested').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              Approved: {safeAllocations.filter((a) => a.status === 'approved').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              Manually Edited: {safeAllocations.filter((a) => a.status === 'edited').length}
            </span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredAllocations.length > 0 &&
                      selectedIds.size === filteredAllocations.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-3 font-bold">Exam Date & Time</th>
                <th className="p-3 font-bold">Course</th>
                <th className="p-3 font-bold">Venue</th>
                <th className="p-3 font-bold">Assigned Invigilator</th>
                <th className="p-3 font-bold">Role</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No allocations match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((alloc) => {
                  const isSelected = selectedIds.has(alloc.id);
                  const isChief = alloc.role === 'chief';

                  return (
                    <tr
                      key={alloc.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(alloc.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Date & Time */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {alloc.exam?.date}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {alloc.exam?.start_time} - {alloc.exam?.end_time}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="p-3">
                        <div className="font-bold text-emerald-950">
                          {alloc.course?.code}
                        </div>
                        <div className="text-[11px] text-slate-500 max-w-[160px] truncate">
                          {alloc.course?.title}
                        </div>
                        <div className="text-[10px] text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-amber-200/50">
                          Lecturer: {alloc.lecturer?.name || 'Unassigned'}
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">
                          {alloc.venue?.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {alloc.venue?.location}
                        </div>
                      </td>

                      {/* Invigilator Staff */}
                      <td className="p-3">
                        {alloc.staff ? (
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{alloc.staff.name}</span>
                              {alloc.course?.lecturer_id === alloc.staff.id && (
                                <span
                                  title="CRITICAL: Staff is assigned to their own course exam!"
                                  className="px-1.5 py-0.2 rounded text-[10px] bg-red-100 text-red-800 font-black border border-red-300"
                                >
                                  EXCLUSION BREACH
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {alloc.staff.rank} • {alloc.staff.department}
                            </div>
                            {alloc.notes && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">
                                Note: {alloc.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-rose-600 font-semibold italic">Unassigned Slot</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => onToggleRole(alloc)}
                          title="Click to toggle Chief / Assistant role"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            isChief
                              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
                          }`}
                        >
                          {isChief ? (
                            <Shield className="w-3 h-3 text-amber-600" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-blue-600" />
                          )}
                          <span>{isChief ? 'Chief' : 'Assistant'}</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="p-3 whitespace-nowrap">
                        {alloc.status === 'suggested' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Suggested</span>
                          </span>
                        )}
                        {alloc.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        )}
                        {alloc.status === 'edited' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                            <Lock className="w-3 h-3 text-blue-600" />
                            <span>Manually Edited</span>
                          </span>
                        )}
                        {alloc.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Swap button */}
                          <button
                            onClick={() => onOpenSwapModal(alloc)}
                            title="Swap staff or override assignment"
                            className="p-1.5 rounded-md text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Single Approve */}
                          {alloc.status !== 'approved' && (
                            <button
                              onClick={() => onApprove(alloc.id)}
                              title="Approve this allocation"
                              className="p-1.5 rounded-md text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Single Reject */}
                          {alloc.status !== 'rejected' && (
                            <button
                              onClick={() => onReject(alloc.id)}
                              title="Reject allocation"
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => onDelete(alloc.id)}
                            title="Remove allocation record"
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
