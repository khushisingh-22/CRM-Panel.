/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
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
  X,
  Shield
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newEmpFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'selected' | 'new') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (target === 'selected' && selectedStaff) {
          const updated = staffList.map(stf => stf.id === selectedStaff.id ? { ...stf, avatar: base64String } : stf);
          onUpdateStaffList(updated);
          triggerSuccess(`Profile photo updated successfully for ${selectedStaff.name}!`);
        } else if (target === 'new') {
          setNewEmpAvatar(base64String);
          triggerSuccess(`Profile photo loaded for new employee!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Forms & Modal states
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<Staff['role']>('detailer');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState<number>(18000); // default Indian standard base salary
  const [newEmpAvatar, setNewEmpAvatar] = useState('');
  
  // Add payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payReason, setPayReason] = useState('Monthly Salary');
  const [successMsg, setSuccessMsg] = useState('');

  // Leave & Salary Cut form states
  const [formTab, setFormTab] = useState<'payment' | 'leave'>('payment');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('Absent without permission');
  const [leaveRemarks, setLeaveRemarks] = useState('');
  const [leaveDeduction, setLeaveDeduction] = useState<number>(0);

  const selectedStaff = staffList.find(stf => stf.id === selectedStaffId) || staffList[0] || null;
  const selectedStaffLedger = selectedStaff ? (selectedStaff.ledger || []) : [];
  const selectedStaffTotalPaid = selectedStaffLedger.filter(e => e.amount > 0).reduce((acc, entry) => acc + entry.amount, 0);
  const selectedStaffTotalDeductions = Math.abs(selectedStaffLedger.filter(e => e.amount < 0).reduce((acc, entry) => acc + entry.amount, 0));
  const selectedStaffNetRemaining = selectedStaff ? Math.max(0, (selectedStaff.salary || 18000) - selectedStaffTotalPaid - selectedStaffTotalDeductions) : 0;

  // Handler to register a new employee
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const newStaff: Staff = {
      id: `stf-${Date.now()}`,
      name: newEmpName.trim(),
      role: newEmpRole,
      avatar: newEmpAvatar.trim() || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
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
    setNewEmpAvatar('');
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

  // Handler to add a leave / salary cut deduction
  const handleAddLeaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    if (leaveDeduction <= 0) return;

    const newEntry: StaffLedgerEntry = {
      id: `led-${Date.now()}`,
      amount: -leaveDeduction,
      date: leaveDate,
      reason: `Leave: ${leaveReason}${leaveRemarks.trim() ? ` (${leaveRemarks.trim()})` : ''}`
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
    setLeaveDeduction(0);
    setLeaveRemarks('');
    triggerSuccess(`Salary cut of ₹${leaveDeduction} recorded for ${selectedStaff.name}!`);
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
                const empLedger = emp.ledger || [];
                const totalPaid = empLedger.filter(e => e.amount > 0).reduce((acc, entry) => acc + entry.amount, 0);
                const totalDeductions = Math.abs(empLedger.filter(e => e.amount < 0).reduce((acc, entry) => acc + entry.amount, 0));
                const netRemaining = Math.max(0, (emp.salary || 18000) - totalPaid - totalDeductions);

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
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase shrink-0 overflow-hidden">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          emp.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold truncate text-white">{emp.name}</h4>
                        <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md mt-1 ${roleColors[emp.role]}`}>
                          {roleLabels[emp.role]}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-indigo-400 block font-black uppercase tracking-wider">Remaining</span>
                      <strong className="text-xs font-black font-mono text-indigo-300 font-bold">₹{netRemaining}</strong>
                      <div className="text-[9px] text-slate-500 block font-semibold mt-0.5">Paid: ₹{totalPaid}</div>
                      {totalDeductions > 0 && (
                        <div className="text-[9px] text-rose-500 font-bold">Cut: ₹{totalDeductions}</div>
                      )}
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
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-16 w-16 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-md flex items-center justify-center text-lg font-black text-slate-300 uppercase shrink-0 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all group relative"
                      title="Click to upload profile photo"
                    >
                      {selectedStaff.avatar ? (
                        <img src={selectedStaff.avatar} alt={selectedStaff.name} className="h-full w-full object-cover group-hover:opacity-75 transition-opacity" referrerPolicy="no-referrer" />
                      ) : (
                        selectedStaff.name.charAt(0)
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                        Upload 📷
                      </div>
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
                        
                        <input
                           type="file"
                           ref={fileInputRef}
                           onChange={(e) => handleFileChange(e, 'selected')}
                           accept="image/*"
                           className="hidden"
                        />

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded-full border border-slate-700 transition-all cursor-pointer font-bold"
                        >
                          Change Photo 📷
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Salary Deductions Display */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full xl:w-auto">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 text-center min-w-[85px] flex-1">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Base Salary</span>
                      <strong className="text-xs font-black text-white font-mono block mt-0.5">₹{selectedStaff.salary || 18000}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 text-center min-w-[85px] flex-1">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Paid</span>
                      <strong className="text-xs font-black text-emerald-400 font-mono block mt-0.5">₹{selectedStaffTotalPaid}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-rose-950/40 text-center min-w-[85px] flex-1">
                      <span className="text-[9px] text-rose-400 font-extrabold uppercase tracking-wider block">Salary Cuts</span>
                      <strong className="text-xs font-black text-rose-500 font-mono block mt-0.5">₹{selectedStaffTotalDeductions}</strong>
                    </div>
                    <div className="bg-[#111c15] p-2 rounded-xl border border-emerald-500/30 text-center min-w-[85px] flex-1 ring-1 ring-emerald-500/10">
                      <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block">Remaining</span>
                      <strong className="text-xs font-black text-emerald-300 font-mono block mt-0.5">₹{selectedStaffNetRemaining}</strong>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Phone size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Mobile Number</span>
                      <strong>{selectedStaff.phone || '8510002780'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-300">
                    <TrendingUp size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Ledger Status</span>
                      <span className="text-slate-300 font-medium">Automatic balance deduction active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ledger (Hisab-Kitab) & Add Payment/Leave Entry Section */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Left side of section (Form for adding entry - 2/5 width) */}
                <div className="md:col-span-2 bg-[#0B1329]/80 border border-slate-800 p-4 rounded-xl space-y-4">
                  {/* Tab Selectors */}
                  <div className="flex border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFormTab('payment')}
                      className={`flex-1 pb-2.5 text-3xs font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                        formTab === 'payment'
                          ? 'border-indigo-500 text-white font-extrabold'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Record Payment 💳
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormTab('leave');
                        if (leaveDeduction === 0) {
                          setLeaveDeduction(Math.round((selectedStaff?.salary || 18000) / 30));
                        }
                      }}
                      className={`flex-1 pb-2.5 text-3xs font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                        formTab === 'leave'
                          ? 'border-rose-500 text-white font-extrabold'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Mark Leave 🛑
                    </button>
                  </div>

                  {formTab === 'payment' ? (
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
                  ) : (
                    <form onSubmit={handleAddLeaveEntry} className="space-y-3.5">
                      <div>
                        <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Leave Date *</label>
                        <input
                          type="date"
                          required
                          value={leaveDate}
                          onChange={(e) => setLeaveDate(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Reason for Leave *</label>
                        <select
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-rose-500 cursor-pointer font-semibold"
                        >
                          <option value="Absent without permission">Absent without permission</option>
                          <option value="Sick Leave">Sick Leave</option>
                          <option value="Personal Leave">Personal Leave</option>
                          <option value="Holiday / Festival">Holiday / Festival</option>
                          <option value="Other Reason">Other Reason</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Custom Remarks / Notes</label>
                        <input
                          type="text"
                          value={leaveRemarks}
                          onChange={(e) => setLeaveRemarks(e.target.value)}
                          placeholder="e.g. Urgent home visit, family function"
                          className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Salary Cut Amount (₹) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={leaveDeduction || ''}
                          onChange={(e) => setLeaveDeduction(Number(e.target.value))}
                          placeholder="e.g. 500"
                          className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-rose-500"
                        />
                        <button
                          type="button"
                          onClick={() => setLeaveDeduction(Math.round((selectedStaff?.salary || 18000) / 30))}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold mt-1 block hover:underline cursor-pointer"
                        >
                          💡 Suggest 1-day cut (₹{Math.round((selectedStaff?.salary || 18000) / 30)})
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={leaveDeduction < 0}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md"
                      >
                        Deduct Salary & Log Leave
                      </button>
                    </form>
                  )}
                </div>

                {/* Right side of section (Ledger list - 3/5 width) */}
                <div className="md:col-span-3 bg-[#0B1329]/80 border border-slate-800 p-4 rounded-xl space-y-4">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider block">Payment & Leave Ledger Transactions</h3>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {(!selectedStaff.ledger || selectedStaff.ledger.length === 0) ? (
                      <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        <AlertCircle className="mx-auto text-slate-600 mb-2" size={24} />
                        <p className="text-2xs font-semibold">No transactions in ledger</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Use the ledger form on the left to add a transaction or leave.</p>
                      </div>
                    ) : (
                      selectedStaff.ledger.map((entry) => {
                        const isDeduction = entry.amount < 0;
                        return (
                          <div key={entry.id} className={`p-3 border rounded-lg flex justify-between items-center text-xs transition-colors ${
                            isDeduction 
                              ? 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/30' 
                              : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900/40'
                          }`}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <strong className="text-white block font-bold">{entry.reason}</strong>
                                {isDeduction && (
                                  <span className="text-[8px] bg-rose-500/20 text-rose-400 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                    Salary Cut
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold font-mono">
                                <Calendar size={10} />
                                <span>{entry.date}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <strong className={`font-extrabold font-mono text-sm ${
                                isDeduction ? 'text-rose-400' : 'text-emerald-400'
                              }`}>
                                {isDeduction ? `-₹${Math.abs(entry.amount)}` : `₹${entry.amount}`}
                              </strong>
                              <button
                                onClick={() => handleDeleteLedgerEntry(entry.id)}
                                className="p-1 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 rounded transition-all cursor-pointer"
                                title="Delete transaction entry"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
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
                <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Profile Photo (Optional - Image URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEmpAvatar.startsWith('data:') ? 'Local Image Selected 📷' : newEmpAvatar}
                    onChange={(e) => setNewEmpAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <input
                    type="file"
                    ref={newEmpFileInputRef}
                    onChange={(e) => handleFileChange(e, 'new')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => newEmpFileInputRef.current?.click()}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-all whitespace-nowrap cursor-pointer"
                  >
                    Upload File 📁
                  </button>
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
