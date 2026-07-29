/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  User,
  Sliders,
  Sparkles,
  RefreshCw,
  Search,
  X,
  CreditCard
} from 'lucide-react';

export interface RecurringMembership {
  id: string;
  customerName: string;
  customerPhone: string;
  planName: string;
  frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly';
  pricePerCycle: number;
  nextServiceDate: string;
  status: 'active' | 'paused' | 'cancelled';
  notes?: string;
}

interface RecurringManagerProps {
  recurringList: RecurringMembership[];
  onUpdateRecurringList: (updated: RecurringMembership[]) => void;
}

export default function RecurringManager({
  recurringList,
  onUpdateRecurringList
}: RecurringManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [planName, setPlanName] = useState('Silver Weekly Maintenance Wash');
  const [frequency, setFrequency] = useState<RecurringMembership['frequency']>('weekly');
  const [pricePerCycle, setPricePerCycle] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !pricePerCycle) return;

    const newMembership: RecurringMembership = {
      id: `recur-${Date.now()}`,
      customerName,
      customerPhone,
      planName,
      frequency,
      pricePerCycle: Number(pricePerCycle),
      nextServiceDate,
      status: 'active',
      notes
    };

    onUpdateRecurringList([newMembership, ...recurringList]);
    setShowAddModal(false);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setPlanName('Silver Weekly Maintenance Wash');
    setFrequency('weekly');
    setPricePerCycle('');
    setNextServiceDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    onUpdateRecurringList(recurringList.filter(item => item.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    const updated = recurringList.map(item => {
      if (item.id === id) {
        const nextStatus: RecurringMembership['status'] = item.status === 'active' ? 'paused' : 'active';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    onUpdateRecurringList(updated);
  };

  const filteredMemberships = recurringList.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          item.planName.toLowerCase().includes(search.toLowerCase());
    const matchesFreq = frequencyFilter === 'all' || item.frequency === frequencyFilter;
    return matchesSearch && matchesFreq;
  });

  const frequencyLabels: Record<RecurringMembership['frequency'], string> = {
    weekly: 'Every Week',
    bi_weekly: 'Every 2 Weeks',
    monthly: 'Every Month',
    quarterly: 'Every 3 Months'
  };

  const frequencyColors: Record<RecurringMembership['frequency'], string> = {
    weekly: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    bi_weekly: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    monthly: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    quarterly: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const activeMembershipsCount = recurringList.filter(m => m.status === 'active').length;
  const recurringRevenueSum = recurringList
    .filter(m => m.status === 'active')
    .reduce((sum, m) => {
      // Normalize to monthly estimates
      let multiplier = 1;
      if (m.frequency === 'weekly') multiplier = 4;
      else if (m.frequency === 'bi_weekly') multiplier = 2;
      else if (m.frequency === 'quarterly') multiplier = 0.33;
      return sum + (m.pricePerCycle * multiplier);
    }, 0);

  return (
    <div className="space-y-6" id="recurring-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Recurring Memberships</h1>
          <p className="text-xs text-slate-400">Configure VIP auto-scheduling detailing plans and monthly subscription agreements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Create VIP Membership
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <RefreshCw size={20} className="animate-spin-slow" />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Active Subscriptions</span>
            <strong className="text-lg font-black text-white">{activeMembershipsCount}</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Estimated Monthly MRR</span>
            <strong className="text-lg font-black text-emerald-400 font-mono">${recurringRevenueSum.toFixed(2)}</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Next Scheduled Visits</span>
            <strong className="text-lg font-black text-white">{filteredMemberships.length} plans</strong>
          </div>
        </div>
      </div>

      {/* Table List Card */}
      <div className="bg-[#131D35] border border-slate-800/40 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search VIP plans or clients..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFrequencyFilter('all')}
              className={`px-3 py-1 text-4xs font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap border ${
                frequencyFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Frequencies
            </button>
            {Object.entries(frequencyLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFrequencyFilter(key)}
                className={`px-3 py-1 text-4xs font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap border ${
                  frequencyFilter === key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {label.split(' ')[1] || label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Memberships list table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-3xs font-extrabold uppercase tracking-wider bg-slate-950">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Membership Plan Name</th>
                <th className="py-3 px-4 text-center">Frequency</th>
                <th className="py-3 px-4 text-right">Cycle Price</th>
                <th className="py-3 px-4">Next Service Visit</th>
                <th className="py-3 px-4">Agreement Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filteredMemberships.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                    <RefreshCw size={28} className="mx-auto mb-2 text-slate-600" />
                    No recurring plans logged. Create VIP subscriptions above.
                  </td>
                </tr>
              ) : (
                filteredMemberships.map(member => (
                  <tr key={member.id} className="hover:bg-slate-900/30 transition-all">
                    <td className="py-3.5 px-4">
                      <strong className="text-white font-bold block">{member.customerName}</strong>
                      <span className="text-3xs text-slate-500 font-mono block">{member.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      {member.planName}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-4xs font-extrabold uppercase border ${frequencyColors[member.frequency]}`}>
                        {frequencyLabels[member.frequency]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400">
                      ${member.pricePerCycle.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-3xs text-slate-400">
                      {member.nextServiceDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase cursor-pointer ${
                        member.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`} onClick={() => handleToggleStatus(member.id)}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-1 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Membership Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <RefreshCw size={16} className="text-indigo-400 animate-spin-slow" />
                Enroll Recurring Member
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rachel Zane"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Customer Phone</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 555-0143"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Cycle Price ($)</label>
                  <input
                    type="number"
                    required
                    value={pricePerCycle}
                    onChange={(e) => setPricePerCycle(e.target.value)}
                    placeholder="120"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">VIP Detailing Plan</label>
                  <select
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                  >
                    <option value="Silver Weekly Maintenance Wash">Silver Weekly Maintenance Wash</option>
                    <option value="Gold Bi-Weekly Gloss Plan">Gold Bi-Weekly Gloss Plan</option>
                    <option value="Platinum Monthly Showroom Reset">Platinum Monthly Showroom Reset</option>
                    <option value="Elite Quarterly Protection Plan">Elite Quarterly Protection Plan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Service Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                  >
                    <option value="weekly">Every Week</option>
                    <option value="bi_weekly">Every 2 Weeks</option>
                    <option value="monthly">Every Month</option>
                    <option value="quarterly">Every 3 Months</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Next Service Date</label>
                  <input
                    type="date"
                    required
                    value={nextServiceDate}
                    onChange={(e) => setNextServiceDate(e.target.value)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Internal VIP Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Prefers Sunday mornings"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                  />
                </div>
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
                  Confirm VIP Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
