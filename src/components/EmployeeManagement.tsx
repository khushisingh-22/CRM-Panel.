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
  DollarSign,
  Calendar,
  UserPlus,
  Receipt,
  Phone,
  Tag,
  Check,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  X
} from 'lucide-react';
import { Staff, StaffLedgerEntry } from '../types/crm';

interface EmployeeManagementProps {
  staffList: Staff[];
  onUpdateStaffList: (updated: Staff[]) => void;
}

export default function EmployeeManagement({
  staffList,
  onUpdateStaffList
}: EmployeeManagementProps) {
  // Selected employee for tracking details and ledger
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  
  // Forms & Modal states
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<Staff['role']>('detailer');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState<number>(18000); // default Indian standard base salary
  
  // Add payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payReason, setPayReason] = useState('Monthly Salary');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedStaff = staffList.find(stf => stf.id === selectedStaffId) || staffList[0] || null;

  // Handler to register a new employee
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const newStaff: Staff = {
      id: `stf-${Date.now()}`,
      name: newEmpName.trim(),
      role: newEmpRole,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
      activeJobsCount: 0,
      phone: newEmpPhone.trim() || '7078408264',
      salary: Number(newEmpSalary) || 15000,
      ledger: []
    };

    const updated = [...staffList, newStaff];
    onUpdateStaffList(updated);
    setSelectedStaffId(newStaff.id);
    
    // Reset fields
    setNewEmpName('');
    setNewEmpRole('detailer');
    setNewEmpPhone('');
    setNewEmpSalary(18000);
    setShowAddEmployeeModal(false);

    // Show custom toast notification
    triggerSuccess('Employee registered successfully!');
  };

  // Handler to add a payment ledger transaction for the selected staff member
  const handleAddPaymentEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    if (payAmount <= 0) return;

    const newEntry: StaffLedgerEntry = {
      id: `led-${Date.now()}`,
      amount: payAmount,
      date: payDate,
      reason: payReason.trim()
    };

    const updated = staffList.map(stf => {
      if (stf.id === selectedStaff.id) {
        const currentLedger = stf.ledger || [];
        return {
          ...stf,
          ledger: [newEntry, ...currentLedger]
        };
      }
      return stf;
    });

    onUpdateStaffList(updated);
    setPayAmount(0);
    setPayReason('Monthly Salary');
    triggerSuccess(`Recorded payment of ₹${payAmount} for ${selectedStaff.name}!`);
  };

  const handleDeleteLedgerEntry = (entryId: string) => {
    if (!selectedStaff) return;
    if (!confirm('Are you sure you want to delete this payment entry from the ledger?')) return;

    const updated = staffList.map(stf => {
      if (stf.id === selectedStaff.id) {
        const currentLedger = stf.ledger || [];
        return {
          ...stf,
          ledger: currentLedger.filter(entry => entry.id !== entryId)
        };
      }
      return stf;
    });

    onUpdateStaffList(updated);
    triggerSuccess('Payment record deleted.');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const roleLabels: Record<Staff['role'], string> = {
    owner: 'Studio Owner',
    manager: 'Car Washer',
    detailer: 'Employee'
  };

  const roleColors: Record<Staff['role'], string> = {
    owner: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    manager: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    detailer: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
  };

  return (
    <div className="space-y-6 animate-fade-in" id="employee-ledger-root">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 bg-emerald-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce">
          <Check size={16} className="stroke-[3]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header section matches design system perfectly */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl flex items-center gap-2.5">
            <Users className="text-indigo-400" size={24} />
            <span>Employee Management & Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">Track employee details, base salaries, and payment transactions ("Hisab-Kitab")</p>
        </div>

        <button
          onClick={() => setShowAddEmployeeModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Create Employee</span>
        </button>
      </div>

      {staffList.length === 0 ? (
        <div className="h-64 bg-[#131D35] border border-slate-800/40 rounded-xl flex flex-col items-center justify-center text-center p-6">
          <Users className="text-slate-600 mb-2 animate-pulse" size={40} />
          <p className="text-sm font-semibold text-slate-400">No employees registered yet</p>
          <p className="text-xs text-slate-500 mt-1">Click Create Employee above to register your first team member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Area: Employees List */}
          <div className="space-y-4">
            <h3 className="text-3xs text-slate-500 font-extrabold uppercase tracking-wider block px-1">Staff Roster</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {staffList.map((emp) => {
                const isSelected = selectedStaff?.id === emp.id;
                const totalPaid = (emp.ledger || []).reduce((acc, entry) => acc + entry.amount, 0);

                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedStaffId(emp.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-lg'
                        : 'bg-[#0B1329] border-slate-800/50 hover:bg-slate-800/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold truncate text-white">{emp.name}</h4>
                        <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md mt-1 ${roleColors[emp.role]}`}>
                          {roleLabels[emp.role]}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Total Paid</span>
                      <strong className="text-xs font-extrabold font-mono text-emerald-400">₹{totalPaid}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Area: Employee Details & Ledger Ledger (2/3 width) */}
          {selectedStaff && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Card details */}
              <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-md flex items-center justify-center text-lg font-black text-slate-300 uppercase shrink-0">
                      {selectedStaff.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white">{selectedStaff.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${roleColors[selectedStaff.role]}`}>
                          {roleLabels[selectedStaff.role]}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          selectedStaff.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {selectedStaff.status === 'active' ? 'ACTIVE' : 'OFF-DUTY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-right sm:min-w-[150px]">
                    <span className="text-4xs text-slate-500 font-black uppercase tracking-wider block">Monthly Salary</span>
                    <strong className="text-lg font-black text-white font-mono">₹{selectedStaff.salary || 18000}</strong>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Phone size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Mobile Number</span>
                      <strong>{selectedStaff.phone || '7078408264'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-300">
                    <TrendingUp size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Total Payments Sent</span>
                      <strong className="text-emerald-400 font-mono">₹{(selectedStaff.ledger || []).reduce((acc, entry) => acc + entry.amount, 0)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ledger (Hisab-Kitab) & Add Payment Entry Section */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Left side of section (Form for adding entry - 2/5 width) */}
                <div className="md:col-span-2 bg-[#0B1329]/80 border border-slate-800 p-4 rounded-xl space-y-4">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt size={14} className="text-indigo-400" />
                    <span>Add Payment Entry</span>
                  </h3>

                  <form onSubmit={handleAddPaymentEntry} className="space-y-3.5">
                    <div>
                      <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Amount Paid (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={payAmount || ''}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        placeholder="e.g. 5000"
                        className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Payment Date *</label>
                      <input
                        type="date"
                        required
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Reason / Remarks *</label>
                      <input
                        type="text"
                        required
                        value={payReason}
                        onChange={(e) => setPayReason(e.target.value)}
                        placeholder="e.g. Advance, Salary, Diesel allowance"
                        className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={payAmount <= 0}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md"
                    >
                      Record Payment
                    </button>
                  </form>
                </div>

                {/* Right side of section (Ledger list - 3/5 width) */}
                <div className="md:col-span-3 bg-[#0B1329]/80 border border-slate-800 p-4 rounded-xl space-y-4">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider block">Payment Ledger Transactions</h3>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {(!selectedStaff.ledger || selectedStaff.ledger.length === 0) ? (
                      <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        <AlertCircle className="mx-auto text-slate-600 mb-2" size={24} />
                        <p className="text-2xs font-semibold">No payment entries in ledger</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Use the payment form on the left to add a transaction.</p>
                      </div>
                    ) : (
                      selectedStaff.ledger.map((entry) => (
                        <div key={entry.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <strong className="text-white block font-bold">{entry.reason}</strong>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold font-mono">
                              <Calendar size={10} />
                              <span>{entry.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <strong className="text-emerald-400 font-extrabold font-mono text-sm">₹{entry.amount}</strong>
                            <button
                              onClick={() => handleDeleteLedgerEntry(entry.id)}
                              className="p-1 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 rounded transition-all"
                              title="Delete transaction entry"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* Create Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddEmployeeModal(false)}
              className="absolute right-4 top-4 p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-base font-extrabold text-white">Create Employee</h3>
              <p className="text-3xs text-slate-400 mt-1">Register a new team member to start managing their salary accounts and ledger history.</p>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="e.g. 7078408264"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Base Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newEmpSalary || ''}
                    onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                    placeholder="e.g. 18000"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Job Role *</label>
                <select
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value as Staff['role'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer font-semibold"
                >
                  <option value="detailer">Employee</option>
                  <option value="manager">Car Washer</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
