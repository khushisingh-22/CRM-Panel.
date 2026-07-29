/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Check,
  Search,
  X,
  Sliders,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export interface WaitlistItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleSize: 'sedan' | 'suv' | 'truck_large';
  desiredServiceId: string;
  desiredServiceName: string;
  priority: 'high' | 'medium' | 'low';
  requestDate: string;
  notes?: string;
}

interface WaitlistManagerProps {
  waitlist: WaitlistItem[];
  services: { id: string; name: string }[];
  onUpdateWaitlist: (updated: WaitlistItem[]) => void;
  onPromoteToBooking: (item: WaitlistItem) => void;
}

export default function WaitlistManager({
  waitlist,
  services,
  onUpdateWaitlist,
  onPromoteToBooking
}: WaitlistManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleSize, setVehicleSize] = useState<'sedan' | 'suv' | 'truck_large'>('sedan');
  const [desiredServiceId, setDesiredServiceId] = useState(services[0]?.id || '');
  const [priority, setPriority] = useState<WaitlistItem['priority']>('medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const matchedService = services.find(s => s.id === desiredServiceId);

    const newItem: WaitlistItem = {
      id: `wait-${Date.now()}`,
      name,
      phone,
      email,
      vehicleMake,
      vehicleModel,
      vehicleSize,
      desiredServiceId,
      desiredServiceName: matchedService ? matchedService.name : 'Express Clean & Shine',
      priority,
      requestDate: new Date().toISOString().split('T')[0],
      notes
    };

    onUpdateWaitlist([newItem, ...waitlist]);
    setShowAddModal(false);

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleSize('sedan');
    setDesiredServiceId(services[0]?.id || '');
    setPriority('medium');
    setNotes('');
  };

  const handleDelete = (id: string) => {
    onUpdateWaitlist(waitlist.filter(item => item.id !== id));
  };

  const filteredWaitlist = waitlist.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.vehicleModel.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const priorityLabels: Record<WaitlistItem['priority'], string> = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Standard Reservation'
  };

  const priorityColors: Record<WaitlistItem['priority'], string> = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  return (
    <div className="space-y-6" id="waitlist-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Reservation Waitlist</h1>
          <p className="text-xs text-slate-400">Queue peak season requests and instantly convert waitlist leads to fully booked appointments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Add Waitlist Queue
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Queued Customers</span>
            <strong className="text-lg font-black text-white">{waitlist.length} in queue</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">High Priority Waiters</span>
            <strong className="text-lg font-black text-rose-400">{waitlist.filter(w => w.priority === 'high').length} urgency</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Avg Waiting Time</span>
            <strong className="text-lg font-black text-white">1.5 Days</strong>
          </div>
        </div>
      </div>

      {/* Main card list */}
      <div className="bg-[#131D35] border border-slate-800/40 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search queue name or car model..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-3 py-1 text-4xs font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap border ${
                priorityFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Priorities
            </button>
            {Object.entries(priorityLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPriorityFilter(key)}
                className={`px-3 py-1 text-4xs font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap border ${
                  priorityFilter === key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Waitlist list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-3xs font-extrabold uppercase tracking-wider bg-slate-950">
                <th className="py-3 px-4">Waiting Client</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Preferred Package</th>
                <th className="py-3 px-4 text-center">Urgency</th>
                <th className="py-3 px-4">Logged Date</th>
                <th className="py-3 px-4 text-center">Promote</th>
                <th className="py-3 px-4 text-center">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filteredWaitlist.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                    <Clock size={28} className="mx-auto mb-2 text-slate-600" />
                    No customers on waitlist queue.
                  </td>
                </tr>
              ) : (
                filteredWaitlist.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/30 transition-all">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <strong className="block">{item.name}</strong>
                      <span className="text-3xs text-slate-500 font-mono block">{item.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-100 font-semibold block">{item.vehicleMake} {item.vehicleModel}</strong>
                      <span className="text-4xs text-slate-500 font-bold uppercase block">{item.vehicleSize}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {item.desiredServiceName}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-4xs font-extrabold uppercase border ${priorityColors[item.priority]}`}>
                        {priorityLabels[item.priority]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-3xs text-slate-400">
                      {item.requestDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onPromoteToBooking(item)}
                        className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-400 text-4xs font-extrabold uppercase tracking-wider rounded-lg border border-emerald-500/20 transition-all flex items-center gap-1 mx-auto cursor-pointer"
                        title="Convert waitlist to live scheduled booking"
                      >
                        Book
                        <ArrowRight size={10} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
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

      {/* Add Waitlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-indigo-400 animate-pulse" />
                Queue Waitlist Client
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mike Ross"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Customer Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 555-0199"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Customer Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mross@pearson.com"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    required
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="Tesla"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Model 3"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Size Bracket</label>
                  <select
                    value={vehicleSize}
                    onChange={(e) => setVehicleSize(e.target.value as any)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="truck_large">Truck / Large</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Preferred Package</label>
                  <select
                    value={desiredServiceId}
                    onChange={(e) => setDesiredServiceId(e.target.value)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Waitlist Urgency</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                  >
                    <option value="high">High Priority (Urgent)</option>
                    <option value="medium">Medium Priority (Flexible)</option>
                    <option value="low">Standard Reservation List</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Additional Waitlist Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Needs pick up service, has holiday deadline"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white h-16 focus:outline-hidden focus:border-indigo-500"
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
                  Queue Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
