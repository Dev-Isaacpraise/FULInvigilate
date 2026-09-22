import React, { useState } from 'react';
import { Plus, Edit2, Trash2, UserPlus, Check, X, Shield, Phone, Mail } from 'lucide-react';
import { Staff } from '../types';
import { api } from '../services/api';

interface StaffManagementProps {
  staffList: Staff[];
  onRefresh: () => void;
}

const RANKS = [
  'Professor',
  'Associate Professor',
  'Senior Lecturer',
  'Lecturer I',
  'Lecturer II',
  'Assistant Lecturer',
  'Graduate Assistant',
];

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biological Sciences',
  'English & Literary Studies',
  'Economics',
  'Accounting',
  'Political Science',
  'Business Administration',
];

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staffList,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    department: 'Computer Science',
    rank: 'Senior Lecturer',
    email: '',
    phone: '',
    max_load: 4,
    is_active: true,
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      department: 'Computer Science',
      rank: 'Senior Lecturer',
      email: '',
      phone: '',
      max_load: 4,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      department: staff.department,
      rank: staff.rank,
      email: staff.email,
      phone: staff.phone,
      max_load: staff.max_load,
      is_active: staff.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.updateStaff(editingStaff.id, formData);
      } else {
        await api.createStaff(formData);
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert('Error saving staff record.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the invigilator pool?`)) {
      await api.deleteStaff(id);
      onRefresh();
    }
  };

  const handleToggleActive = async (staff: Staff) => {
    await api.updateStaff(staff.id, { is_active: !staff.is_active });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Academic Staff & Invigilator Directory
          </h2>
          <p className="text-xs text-slate-500">
            Manage faculty eligibility, load caps, ranks, and contact channels for duty slips.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0d4b8f] text-white text-xs font-bold rounded-lg hover:bg-[#0b3f7a] transition-colors shadow-2xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Academic Staff</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3 font-bold">Staff Member</th>
                <th className="p-3 font-bold">Department</th>
                <th className="p-3 font-bold">Rank / Title</th>
                <th className="p-3 font-bold">Contact Details</th>
                <th className="p-3 font-bold text-center">Max Load Cap</th>
                <th className="p-3 font-bold text-center">Active Status</th>
                <th className="p-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">
                    {staff.name}
                  </td>
                  <td className="p-3 text-slate-600">{staff.department}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-slate-900 border border-blue-200">
                      {staff.rank}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{staff.email}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{staff.phone}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                      {staff.max_load} duties
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleActive(staff)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                        staff.is_active
                          ? 'bg-blue-100 text-[#0d4b8f] hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {staff.is_active ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        className="p-1 text-slate-500 hover:text-[#0d4b8f] hover:bg-slate-100 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id, staff.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0b3f7a] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingStaff ? 'Edit Academic Staff Member' : 'Register New Academic Staff'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-800">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Fatima Zahra Bello"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Rank</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none bg-white"
                  >
                    {RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@fulokoja.edu.ng"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone (SMS Alert)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 803 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Load Cap (Per Period)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.max_load}
                    onChange={(e) => setFormData({ ...formData, max_load: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0d4b8f] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Maximum invigilations allowed</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Eligibility Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-slate-300 text-[#0d4b8f] focus:ring-[#0d4b8f]"
                    />
                    <span className="text-xs text-slate-700">Available for Allocation</span>
                  </label>
                </div>
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
                  {editingStaff ? 'Update Staff' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
