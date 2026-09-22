import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, ShieldAlert } from 'lucide-react';
import { Course, Staff } from '../types';
import { api } from '../services/api';

interface CourseManagementProps {
  courses: Course[];
  staffList: Staff[];
  onRefresh: () => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  courses,
  staffList,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    department: 'Computer Science',
    lecturer_id: staffList[0]?.id || '',
  });

  const staffMap = new Map<string, Staff>(staffList.map((s) => [s.id, s]));

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      title: '',
      department: 'Computer Science',
      lecturer_id: staffList[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      department: course.department,
      lecturer_id: course.lecturer_id,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, formData);
      } else {
        await api.createCourse(formData);
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert('Error saving course.');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to remove ${code}?`)) {
      await api.deleteCourse(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Courses & Lecturer Assignments
          </h2>
          <p className="text-xs text-slate-500">
            Assign primary course lecturers. The <strong>Course Exclusion Rule</strong> automatically blocks the assigned lecturer from invigilating their own exam.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0d4b8f] text-white text-xs font-bold rounded-lg hover:bg-[#0b3f7a] transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const lecturer = staffMap.get(course.lecturer_id);

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-mono font-black text-sm text-[#0d4b8f] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {course.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="p-1 text-slate-400 hover:text-[#0d4b8f] rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.code)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-xs text-slate-900 mt-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{course.department}</p>
              </div>

              {/* Exclusion Rule Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#0d4b8f]" />
                  <span>Course Lecturer (Excluded from Invigilation)</span>
                </div>
                {lecturer ? (
                  <div className="mt-1 text-slate-800">
                    <span className="font-semibold">{lecturer.name}</span>
                    <span className="block text-[10px] text-slate-500">
                      {lecturer.rank} • {lecturer.department}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-rose-600 italic">No lecturer assigned</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0d4b8f] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-blue-100 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC 301"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 uppercase focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures and Algorithms"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Designated Course Lecturer (FK → Staff)
                </label>
                <select
                  value={formData.lecturer_id}
                  onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none bg-white"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rank} - {s.department})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-600 mt-1">
                  * Exclusion Rule: This faculty member will not be allocated to invigilate this exam.
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
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
