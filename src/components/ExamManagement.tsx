import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Calendar, Users, MapPin } from 'lucide-react';
import { Exam, Course, Venue, ExamVenue } from '../types';
import { api } from '../services/api';

interface ExamManagementProps {
  exams: Exam[];
  courses: Course[];
  venues: Venue[];
  examVenues: ExamVenue[];
  onRefresh: () => void;
}

export const ExamManagement: React.FC<ExamManagementProps> = ({
  exams,
  courses,
  venues,
  examVenues,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [formData, setFormData] = useState({
    course_id: courses[0]?.id || '',
    date: '2026-10-15',
    start_time: '09:00',
    end_time: '12:00',
    expected_students: 250,
    venue_ids: [venues[0]?.id || ''],
  });

  const courseMap = new Map<string, Course>(courses.map((c) => [c.id, c]));
  const venueMap = new Map<string, Venue>(venues.map((v) => [v.id, v]));

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      course_id: courses[0]?.id || '',
      date: '2026-10-15',
      start_time: '09:00',
      end_time: '12:00',
      expected_students: 250,
      venue_ids: [venues[0]?.id || ''],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    const assignedVenues = examVenues
      .filter((ev) => ev.exam_id === exam.id)
      .map((ev) => ev.venue_id);

    setFormData({
      course_id: exam.course_id,
      date: exam.date,
      start_time: exam.start_time,
      end_time: exam.end_time,
      expected_students: exam.expected_students,
      venue_ids: assignedVenues.length > 0 ? assignedVenues : [venues[0]?.id || ''],
    });
    setShowModal(true);
  };

  const handleToggleVenue = (venueId: string) => {
    const current = [...formData.venue_ids];
    const index = current.indexOf(venueId);
    if (index > -1) {
      if (current.length > 1) {
        current.splice(index, 1);
      } else {
        alert('An exam must have at least one assigned venue.');
        return;
      }
    } else {
      current.push(venueId);
    }
    setFormData({ ...formData, venue_ids: current });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await api.updateExam(editingExam.id, formData);
      } else {
        await api.createExam(formData);
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert('Error saving exam slot.');
    }
  };

  const handleDelete = async (id: string, courseCode: string) => {
    if (confirm(`Are you sure you want to delete exam for ${courseCode}?`)) {
      await api.deleteExam(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Examination Timetable & Multi-Venue Scheduling
          </h2>
          <p className="text-xs text-slate-500">
            Defines dates, time slots, expected student counts, and assigned venues (supporting split exams).
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0d4b8f] text-white text-xs font-bold rounded-lg hover:bg-[#0b3f7a] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Exam Slot</span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => {
          const course = courseMap.get(exam.course_id);
          const assignedVenues = examVenues
            .filter((ev) => ev.exam_id === exam.id)
            .map((ev) => venueMap.get(ev.venue_id))
            .filter(Boolean);

          const totalRequiredInvigilators = assignedVenues.reduce(
            (acc, v) => acc + (v?.fixed_invigilator_count || 1),
            0
          );

          return (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {course?.code || 'EXAM'}
                  </span>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 leading-snug">
                      {course?.title || 'Unknown Course'}
                    </h3>
                    <p className="text-[10px] text-slate-500">{course?.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(exam)}
                    className="p-1 text-slate-400 hover:text-[#0d4b8f] rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id, course?.code || '')}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Time & Students Bar */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#0d4b8f]" />
                  <span>{exam.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#0d4b8f]" />
                  <span>
                    {exam.start_time} - {exam.end_time}
                  </span>
                </div>
              </div>

              {/* Assigned Venues (ExamVenue Join table) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">
                    Assigned Venues ({assignedVenues.length})
                  </span>
                  <span className="text-slate-700 font-bold">
                    Requires {totalRequiredInvigilators} Invigilators
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {assignedVenues.map((v) => (
                    <span
                      key={v?.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 border border-slate-300 text-slate-800"
                    >
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{v?.name}</span>
                      <span className="text-[10px] text-[#0d4b8f] font-semibold">
                        ({v?.fixed_invigilator_count} staff)
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0b3f7a] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingExam ? 'Edit Exam Timetable Slot' : 'Schedule Examination'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-blue-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-800">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Course</label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none bg-white font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} ({c.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expected Candidate Count
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  required
                  value={formData.expected_students}
                  onChange={(e) =>
                    setFormData({ ...formData, expected_students: Number(e.target.value) })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                />
              </div>

              {/* Multi-venue selector (Join table ExamVenue) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Allocated Venues (Select all halls hosting this exam)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50">
                  {venues.map((v) => {
                    const isSelected = formData.venue_ids.includes(v.id);
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleToggleVenue(v.id)}
                        className={`p-2 rounded border cursor-pointer flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-[#0d4b8f] text-slate-900 font-bold ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span>{v.name}</span>
                          <span className="block text-[10px] text-slate-500 font-normal">
                            Cap: {v.capacity} • Staff: {v.fixed_invigilator_count}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded text-[#0d4b8f] pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  * Split exam feature: Candidates will be distributed across selected venues.
                </p>
              </div>

              <div className="bg-slate-50 -mx-5 -mb-5 px-5 py-3 border-t border-slate-200 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-bold text-white bg-[#0d4b8f] hover:bg-[#0b3f7a]"
                >
                  {editingExam ? 'Save Timetable Slot' : 'Create Exam Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
