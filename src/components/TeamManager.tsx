/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Shield,
  Activity,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { Staff } from '../types/crm';

interface TeamManagerProps {
  staffList: Staff[];
  onUpdateStaffList: (updated: Staff[]) => void;
}

export default function TeamManager({
  staffList,
  onUpdateStaffList
}: TeamManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Staff['role']>('detailer');
  const [avatar, setAvatar] = useState('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newStaff: Staff = {
      id: `stf-${Date.now()}`,
      name,
      role,
      avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
      activeJobsCount: 0
    };

    onUpdateStaffList([...staffList, newStaff]);
    setShowAddModal(false);
    setName('');
    setRole('detailer');
    setAvatar('');
  };

  const handleToggleDuty = (id: string) => {
    const updated = staffList.map(stf => {
      if (stf.id === id) {
        return {
          ...stf,
          status: stf.status === 'active' ? 'off-duty' as const : 'active' as const
        };
      }
      return stf;
    });
    onUpdateStaffList(updated);
  };

  const handleDeleteStaff = (id: string) => {
    onUpdateStaffList(staffList.filter(stf => stf.id !== id));
  };

  const roleLabels: Record<Staff['role'], string> = {
    owner: 'Studio Owner',
    manager: 'Studio Manager',
    detailer: 'Detailing Specialist'
  };

  const roleBadges: Record<Staff['role'], string> = {
    owner: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    manager: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    detailer: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  };

  return (
    <div className="space-y-6" id="team-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Team & Roster Management</h1>
          <p className="text-xs text-slate-400">Control active detailer shifts, assignments, and studio access roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Add Staff Specialist
        </button>
      </div>

      {/* Roster overview banner stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Recruited Staff</span>
            <strong className="text-lg font-black text-white">{staffList.length} Team Members</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">On Duty Currently</span>
            <strong className="text-lg font-black text-emerald-400">{staffList.filter(s => s.status === 'active').length} Active</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Workload Jobs</span>
            <strong className="text-lg font-black text-white">{staffList.reduce((sum, s) => sum + s.activeJobsCount, 0)} Active Bays</strong>
          </div>
        </div>
      </div>

      {/* Staff Flat Cards Roster List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList.map(stf => (
          <div key={stf.id} className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700/60 transition-all">
            <div className="flex items-center gap-3">
              <img
                src={stf.avatar}
                alt={stf.name}
                className="h-12 w-12 rounded-full object-cover border border-slate-700"
              />
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-white">{stf.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-4xs font-bold uppercase border ${roleBadges[stf.role]}`}>
                    {roleLabels[stf.role]}
                  </span>
                  <span className="text-4xs text-slate-500 font-semibold uppercase">
                    {stf.activeJobsCount} Active Jobs
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleDuty(stf.id)}
                className={`px-2.5 py-1 text-4xs font-extrabold rounded-lg uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer ${
                  stf.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                {stf.status === 'active' ? 'On Duty' : 'Off Shift'}
              </button>

              {stf.role !== 'owner' && (
                <button
                  onClick={() => handleDeleteStaff(stf.id)}
                  className="p-1.5 bg-slate-950 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 rounded-lg transition-all cursor-pointer"
                  title="Remove from roster"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <UserCheck size={16} className="text-indigo-400" />
                Add Staff Specialist
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Zane"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Studio Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="detailer">Detailing Specialist (Bay tech)</option>
                  <option value="manager">Studio Manager (Bay lead)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Avatar Photo URL (Optional)</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                />
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Enlist Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
