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
  UserCheck,
  BookOpen
} from 'lucide-react';
import { Staff } from '../types/crm';
import EmployeeManagement from './EmployeeManagement';

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
  const [mode, setMode] = useState<'shifts' | 'ledger'>('shifts');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newStaff: Staff = {
      id: `stf-${Date.now()}`,
      name,
      role,
      avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
      activeJobsCount: 0,
      phone: '8510002780',
      salary: 18000,
      ledger: []
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
    manager: 'Car Washer',
    detailer: 'Employee'
  };

  const roleBadges: Record<Staff['role'], string> = {
    owner: 'bg-rose-50 text-rose-700 border-rose-200',
    manager: 'bg-cyan-50 text-[#0E7490] border-cyan-200',
    detailer: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="space-y-6 text-left" id="team-manager-root">
      {/* Tab Selectors for Shift vs Ledger */}
      <div className="flex border-b border-[#E5EDF3]">
        <button
          onClick={() => setMode('shifts')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            mode === 'shifts'
              ? 'border-[#0891B2] text-[#0891B2] font-extrabold'
              : 'border-transparent text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <UserCheck size={14} />
          <span>Active Shifts & Roster</span>
        </button>
        <button
          onClick={() => setMode('ledger')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            mode === 'ledger'
              ? 'border-[#0891B2] text-[#0891B2] font-extrabold'
              : 'border-transparent text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <BookOpen size={14} />
          <span>Salary Ledger & Leaves</span>
        </button>
      </div>

      {mode === 'ledger' ? (
        <EmployeeManagement staffList={staffList} onUpdateStaffList={onUpdateStaffList} />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#E5EDF3] shadow-xs">
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight md:text-2xl flex items-center gap-2">
                <Users className="text-[#0891B2]" size={22} />
                <span>Team Status</span>
              </h1>
              <p className="text-xs text-[#475569]">Control active detailer shifts, assignments, and studio access roles</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Team Member</span>
            </button>
          </div>

          {/* Roster overview banner stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="h-10 w-10 bg-cyan-50 text-[#0891B2] rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <span className="text-3xs text-[#475569] font-bold uppercase tracking-wider block">Total Recruited Staff</span>
                <strong className="text-lg font-black text-[#0F172A]">{staffList.length} Team Members</strong>
              </div>
            </div>

            <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="h-10 w-10 bg-emerald-50 text-[#16A34A] rounded-xl flex items-center justify-center">
                <UserCheck size={20} />
              </div>
              <div>
                <span className="text-3xs text-[#475569] font-bold uppercase tracking-wider block">On Duty Currently</span>
                <strong className="text-lg font-black text-[#16A34A]">{staffList.filter(s => s.status === 'active').length} Active</strong>
              </div>
            </div>

            <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="h-10 w-10 bg-cyan-50 text-[#0E7490] rounded-xl flex items-center justify-center">
                <Activity size={20} />
              </div>
              <div>
                <span className="text-3xs text-[#475569] font-bold uppercase tracking-wider block">Total Workload Jobs</span>
                <strong className="text-lg font-black text-[#0F172A]">{staffList.reduce((sum, s) => sum + s.activeJobsCount, 0)} Active Bays</strong>
              </div>
            </div>
          </div>

          {/* Staff Flat Cards Roster List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map(stf => (
              <div key={stf.id} className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center justify-between gap-4 hover:shadow-md transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 border border-[#E5EDF3] flex items-center justify-center text-sm font-bold text-[#334155] uppercase shrink-0 overflow-hidden">
                    {stf.avatar ? (
                      <img src={stf.avatar} alt={stf.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      stf.name.charAt(0)
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-extrabold text-[#0F172A]">{stf.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-4xs font-bold uppercase border ${roleBadges[stf.role]}`}>
                        {roleLabels[stf.role]}
                      </span>
                      <span className="text-4xs text-[#475569] font-bold uppercase">
                        {stf.activeJobsCount} Active Jobs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleDuty(stf.id)}
                    className={`px-2.5 py-1.5 text-4xs font-extrabold rounded-xl uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer ${
                      stf.status === 'active'
                        ? 'bg-emerald-50 text-[#16A34A] border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-[#475569] border-[#CBD5E1] hover:bg-slate-100'
                    }`}
                  >
                    {stf.status === 'active' ? 'On Duty' : 'Off Shift'}
                  </button>

                  {stf.role !== 'owner' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this team member?')) {
                          handleDeleteStaff(stf.id);
                        }
                      }}
                      className="p-2 bg-white hover:bg-rose-50 text-[#EF4444] hover:text-rose-600 border border-[#E5EDF3] rounded-xl transition-all cursor-pointer shadow-2xs"
                      title="Remove team member"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-[#E5EDF3] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in text-slate-800 text-left">
            <div className="p-5 border-b border-[#E5EDF3] flex items-center justify-between bg-white text-[#0F172A]">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <UserCheck size={16} className="text-[#0891B2]" />
                <span>Add Team Member</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Job Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/20 cursor-pointer font-bold"
                >
                  <option value="detailer">Employee</option>
                  <option value="manager">Car Washer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Avatar Photo URL (Optional)</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] focus:outline-none"
                />
              </div>

              <div className="border-t border-[#E5EDF3] pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
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
