import React, { useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Shield,
  UserCheck,
  Sparkles,
  Lock,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { EnrichedAllocation } from '../types';

interface RosterCalendarProps {
  allocations: EnrichedAllocation[];
  onOpenSwapModal: (allocation: EnrichedAllocation) => void;
  onApprove: (id: string) => void;
}

export const RosterCalendar: React.FC<RosterCalendarProps> = ({
  allocations,
  onOpenSwapModal,
  onApprove,
}) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];

  // Group by Date -> Time Slot -> Exam
  const groupedSchedule = useMemo(() => {
    const datesMap = new Map<
      string,
      Map<
        string,
        Array<{
          exam: any;
          course: any;
          venue: any;
          allocations: EnrichedAllocation[];
        }>
      >
    >();

    // First group by unique exam + venue
    const slotMap = new Map<string, {
      exam: any;
      course: any;
      venue: any;
      allocations: EnrichedAllocation[];
    }>();

    for (const a of safeAllocations) {
      if (!a.exam || !a.venue) continue;
      const key = `${a.exam.id}-${a.venue.id}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, {
          exam: a.exam,
          course: a.course,
          venue: a.venue,
          allocations: [],
        });
      }
      slotMap.get(key)!.allocations.push(a);
    }

    // Now group by date, then time slot
    for (const item of slotMap.values()) {
      const date = item.exam.date;
      const timeSlot = `${item.exam.start_time} - ${item.exam.end_time}`;

      if (!datesMap.has(date)) {
        datesMap.set(date, new Map());
      }
      const timesMap = datesMap.get(date)!;
      if (!timesMap.has(timeSlot)) {
        timesMap.set(timeSlot, []);
      }
      timesMap.get(timeSlot)!.push(item);
    }

    // Sort dates
    const sortedDates = Array.from(datesMap.keys()).sort();
    return sortedDates.map((date) => {
      const timesMap = datesMap.get(date)!;
      const sortedTimes = Array.from(timesMap.keys()).sort();
      return {
        date,
        timeSlots: sortedTimes.map((timeSlot) => ({
          timeSlot,
          venues: timesMap.get(timeSlot)!,
        })),
      };
    });
  }, [safeAllocations]);

  if (groupedSchedule.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
        No examinations or allocations scheduled.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedSchedule.map(({ date, timeSlots }) => {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return (
          <div
            key={date}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
          >
            {/* Day Header */}
            <div className="bg-emerald-950 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold tracking-wide">{formattedDate}</h3>
                <span className="text-[11px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-mono">
                  {date}
                </span>
              </div>
              <span className="text-xs text-emerald-300">
                {(timeSlots || []).reduce((acc, ts) => acc + (ts.venues?.length || 0), 0)} Venue Sessions
              </span>
            </div>

            {/* Time slots */}
            <div className="p-4 space-y-4 divide-y divide-slate-100">
              {(timeSlots || []).map(({ timeSlot, venues }) => (
                <div key={timeSlot} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>SESSION TIME: {timeSlot}</span>
                  </div>

                  {/* Venues Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(venues || []).map((vItem, vIdx) => {
                      const chiefs = (vItem.allocations || []).filter((a) => a.role === 'chief');
                      const assistants = (vItem.allocations || []).filter((a) => a.role === 'assistant');

                      return (
                        <div
                          key={vIdx}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5 hover:border-emerald-300 transition-all"
                        >
                          {/* Venue & Course title */}
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                                <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-mono text-[11px]">
                                  {vItem.course?.code}
                                </span>
                                <span className="truncate max-w-[140px] text-slate-800 font-semibold">
                                  {vItem.venue?.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {vItem.venue?.location} • Cap: {vItem.venue?.capacity}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                                Fixed: {vItem.venue?.fixed_invigilator_count} Staff
                              </span>
                            </div>
                          </div>

                          {/* Chief Invigilator Section */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1 uppercase tracking-wider">
                              <Shield className="w-3 h-3 text-amber-600" />
                              Chief Invigilator
                            </span>
                            {chiefs.length > 0 ? (
                              chiefs.map((chief) => (
                                <div
                                  key={chief.id}
                                  className="bg-white border border-slate-200 rounded p-2 text-xs flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {chief.staff?.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {chief.staff?.rank} ({chief.staff?.department})
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      {chief.status === 'suggested' && (
                                        <span className="text-[9px] px-1 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200">
                                          Suggested
                                        </span>
                                      )}
                                      {chief.status === 'approved' && (
                                        <span className="text-[9px] px-1 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-semibold">
                                          Approved
                                        </span>
                                      )}
                                      {chief.status === 'edited' && (
                                        <span className="text-[9px] px-1 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                                          Manually Edited
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onOpenSwapModal(chief)}
                                      title="Swap Chief Invigilator"
                                      className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {chief.status !== 'approved' && (
                                      <button
                                        onClick={() => onApprove(chief.id)}
                                        title="Approve"
                                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-1.5 rounded text-center italic">
                                Chief unallocated
                              </div>
                            )}
                          </div>

                          {/* Assistant Invigilators Section */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-blue-800 flex items-center gap-1 uppercase tracking-wider">
                              <UserCheck className="w-3 h-3 text-blue-600" />
                              Assistant Invigilators
                            </span>
                            {assistants.length > 0 ? (
                              assistants.map((ast) => (
                                <div
                                  key={ast.id}
                                  className="bg-white border border-slate-200 rounded p-1.5 text-xs flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-medium text-slate-800">
                                      {ast.staff?.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {ast.staff?.rank}
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      {ast.status === 'suggested' && (
                                        <span className="text-[9px] px-1 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200">
                                          Suggested
                                        </span>
                                      )}
                                      {ast.status === 'approved' && (
                                        <span className="text-[9px] px-1 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-semibold">
                                          Approved
                                        </span>
                                      )}
                                      {ast.status === 'edited' && (
                                        <span className="text-[9px] px-1 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                                          Manually Edited
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onOpenSwapModal(ast)}
                                      title="Swap Assistant Invigilator"
                                      className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {ast.status !== 'approved' && (
                                      <button
                                        onClick={() => onApprove(ast.id)}
                                        title="Approve"
                                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-[10px] text-slate-400 italic">
                                No assistant required / allocated
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
