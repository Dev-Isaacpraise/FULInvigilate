import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Users, Shield } from 'lucide-react';
import { Venue } from '../types';
import { api } from '../services/api';

interface VenueManagementProps {
  venues: Venue[];
  onRefresh: () => void;
}

export const VenueManagement: React.FC<VenueManagementProps> = ({
  venues,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    capacity: 250,
    location: 'Felele Permanent Site',
    fixed_invigilator_count: 2,
  });

  const handleOpenAdd = () => {
    setEditingVenue(null);
    setFormData({
      name: '',
      capacity: 250,
      location: 'Felele Permanent Site',
      fixed_invigilator_count: 2,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      capacity: venue.capacity,
      location: venue.location,
      fixed_invigilator_count: venue.fixed_invigilator_count,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await api.updateVenue(editingVenue.id, formData);
      } else {
        await api.createVenue(formData);
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert('Error saving venue.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove venue "${name}"?`)) {
      await api.deleteVenue(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-emerald-950">
            Examination Venues & Fixed Invigilator Capacity
          </h2>
          <p className="text-xs text-slate-500">
            Rule: Each venue has a <strong>fixed number of invigilators required</strong> (1 Chief, remainder Assistants) regardless of student count.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam Venue</span>
        </button>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 text-sm">
                  {venue.name}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(venue)}
                    className="p-1 text-slate-400 hover:text-emerald-700 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(venue.id, venue.name)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{venue.location}</span>
              </div>
            </div>

            {/* Capacity & Fixed Invigilator Metric */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Student Capacity</span>
                <span className="font-bold text-slate-900 text-sm">{venue.capacity} seats</span>
              </div>

              <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block font-semibold">
                  Required Invigilators
                </span>
                <span className="font-black text-emerald-950 text-sm flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  {venue.fixed_invigilator_count} Staff
                </span>
                <span className="text-[9px] text-emerald-700 block">
                  (1 Chief + {Math.max(0, venue.fixed_invigilator_count - 1)} Asst)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingVenue ? 'Edit Venue' : 'Register New Exam Venue'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-800">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture Theatre 1 (LT-1)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="Felele Permanent Site">Felele Permanent Site</option>
                  <option value="Adankolo Campus">Adankolo Campus</option>
                  <option value="College of Health Sciences">College of Health Sciences</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Capacity</label>
                  <input
                    type="number"
                    min="20"
                    max="3000"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fixed Invigilator Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.fixed_invigilator_count}
                    onChange={(e) =>
                      setFormData({ ...formData, fixed_invigilator_count: Number(e.target.value) })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[11px] text-emerald-900">
                Notice: The allocation engine will always allocate exactly{' '}
                <strong>{formData.fixed_invigilator_count}</strong> staff members to this hall whenever it is scheduled.
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
                  className="px-4 py-1.5 rounded-lg font-bold text-white bg-emerald-800 hover:bg-emerald-900"
                >
                  {editingVenue ? 'Save Venue' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
