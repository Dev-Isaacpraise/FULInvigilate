import React from 'react';
import { Printer, Download, ArrowLeft, GraduationCap } from 'lucide-react';
import { EnrichedAllocation } from '../types';

interface PrintableRosterProps {
  allocations: EnrichedAllocation[];
  onBack: () => void;
}

export const PrintableRoster: React.FC<PrintableRosterProps> = ({
  allocations,
  onBack,
}) => {
  const safeAllocations = Array.isArray(allocations) ? allocations : [];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Time Slot',
      'Course Code',
      'Course Title',
      'Venue',
      'Invigilator Name',
      'Rank',
      'Department',
      'Role',
      'Status',
      'Notes',
    ];

    const rows = safeAllocations.map((a) => [
      `"${a.exam?.date || ''}"`,
      `"${a.exam?.start_time || ''} - ${a.exam?.end_time || ''}"`,
      `"${a.course?.code || ''}"`,
      `"${a.course?.title || ''}"`,
      `"${a.venue?.name || ''}"`,
      `"${a.staff?.name || ''}"`,
      `"${a.staff?.rank || ''}"`,
      `"${a.staff?.department || ''}"`,
      `"${a.role?.toUpperCase() || ''}"`,
      `"${a.status?.toUpperCase() || ''}"`,
      `"${a.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'FUL_Official_Exam_Invigilation_Roster.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group allocations by Exam & Venue
  const groupedSlots = React.useMemo(() => {
    const map = new Map<string, {
      exam: any;
      course: any;
      venue: any;
      chiefs: EnrichedAllocation[];
      assistants: EnrichedAllocation[];
    }>();

    for (const a of safeAllocations) {
      if (!a.exam || !a.venue) continue;
      const key = `${a.exam.id}-${a.venue.id}`;
      if (!map.has(key)) {
        map.set(key, {
          exam: a.exam,
          course: a.course,
          venue: a.venue,
          chiefs: [],
          assistants: [],
        });
      }
      const item = map.get(key)!;
      if (a.role === 'chief') {
        item.chiefs.push(a);
      } else {
        item.assistants.push(a);
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.exam?.date !== b.exam?.date) return (a.exam?.date || '').localeCompare(b.exam?.date || '');
      return (a.exam?.start_time || '').localeCompare(b.exam?.start_time || '');
    });
  }, [safeAllocations]);

  return (
    <div className="space-y-6">
      {/* Control bar (hidden during print) */}
      <div className="print:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Interactive Roster</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Roster</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-sm max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Letterhead */}
        <div className="text-center border-b-2 border-emerald-900 pb-4 mb-6">
          <div className="flex justify-center items-center gap-2 mb-1">
            <GraduationCap className="w-8 h-8 text-emerald-900" />
            <h1 className="text-2xl font-black tracking-tight text-emerald-950 uppercase">
              Federal University Lokoja
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
            Kogi State, Nigeria • Directorate of Academic Planning & Quality Assurance
          </p>
          <div className="mt-3 bg-emerald-900 text-white py-1 px-4 rounded-md inline-block">
            <h2 className="text-sm font-bold tracking-wide">
              OFFICIAL EXAMINATION INVIGILATION DUTY ROSTER
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            2025/2026 Academic Session • Second Semester Examinations
          </p>
        </div>

        {/* Timetable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                <th className="p-2.5 border-r border-slate-300 font-bold w-24">Date</th>
                <th className="p-2.5 border-r border-slate-300 font-bold w-24">Time</th>
                <th className="p-2.5 border-r border-slate-300 font-bold w-24">Course</th>
                <th className="p-2.5 border-r border-slate-300 font-bold">Venue</th>
                <th className="p-2.5 border-r border-slate-300 font-bold">Chief Invigilator</th>
                <th className="p-2.5 font-bold">Assistant Invigilators</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {groupedSlots.map((slot, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-2.5 border-r border-slate-200 font-medium whitespace-nowrap">
                    {slot.exam?.date}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                    {slot.exam?.start_time} - {slot.exam?.end_time}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 font-bold text-emerald-900 whitespace-nowrap">
                    {slot.course?.code}
                    <span className="block text-[10px] font-normal text-slate-500">
                      {slot.course?.title}
                    </span>
                  </td>
                  <td className="p-2.5 border-r border-slate-200 font-medium">
                    {slot.venue?.name}
                    <span className="block text-[10px] text-slate-500">{slot.venue?.location}</span>
                  </td>
                  <td className="p-2.5 border-r border-slate-200">
                    {(slot.chiefs || []).length > 0 ? (
                      (slot.chiefs || []).map((c) => (
                        <div key={c.id} className="font-semibold text-slate-900">
                          {c.staff?.name}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            {c.staff?.rank} ({c.staff?.department})
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-rose-600 italic">Unassigned Chief</span>
                    )}
                  </td>
                  <td className="p-2.5">
                    {(slot.assistants || []).length > 0 ? (
                      <div className="space-y-1">
                        {(slot.assistants || []).map((a) => (
                          <div key={a.id} className="text-slate-800">
                            • {a.staff?.name}{' '}
                            <span className="text-[10px] text-slate-500">
                              ({a.staff?.rank})
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Endorsement and Sign-off */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="font-bold text-slate-800">Instructions to Invigilators:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 mt-1 text-[11px]">
              <li>All invigilators must report to assigned venues 30 minutes prior to exam commencement.</li>
              <li>Attendance register must be signed in ink before and after examination scripts collection.</li>
              <li>Strict adherence to the Course Exclusion Rule is verified by the Central Examination Board.</li>
            </ol>
          </div>

          <div className="text-right flex flex-col justify-end space-y-4">
            <div className="border-b border-slate-400 w-48 ml-auto pb-1">
              <span className="text-[10px] text-slate-400 italic">Authorized Signature</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">Prof. A. S. Mallam</p>
              <p className="text-[11px] text-slate-600">
                Chairman, Senate Examination Committee
              </p>
              <p className="text-[10px] text-slate-500">Federal University Lokoja</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
