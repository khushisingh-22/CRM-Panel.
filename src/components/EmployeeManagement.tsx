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
  Shield,
  Edit2
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

  // Salary & Employee Edit states
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [editedSalary, setEditedSalary] = useState<number>(18000);

  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpRole, setEditEmpRole] = useState<Staff['role']>('detailer');
  const [editEmpPhone, setEditEmpPhone] = useState('');
  const [editEmpSalary, setEditEmpSalary] = useState<number>(18000);

  const selectedStaff = staffList.find(stf => stf.id === selectedStaffId) || staffList[0] || null;
  const selectedStaffLedger = selectedStaff ? (selectedStaff.ledger || []) : [];
  const selectedStaffTotalPaid = selectedStaffLedger.filter(e => e.amount > 0).reduce((acc, entry) => acc + entry.amount, 0);
  const selectedStaffTotalDeductions = Math.abs(selectedStaffLedger.filter(e => e.amount < 0).reduce((acc, entry) => acc + entry.amount, 0));
  const selectedStaffNetRemaining = selectedStaff ? Math.max(0, (selectedStaff.salary || 18000) - selectedStaffTotalPaid - selectedStaffTotalDeductions) : 0;

  // Handler to quickly update employee salary
  const handleSaveSalary = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedStaff) return;
    if (editedSalary <= 0) return;

    const updated = staffList.map(stf => {
      if (stf.id === selectedStaff.id) {
        return {
          ...stf,
          salary: Number(editedSalary)
        };
      }
      return stf;
    });

    onUpdateStaffList(updated);
    setIsEditingSalary(false);
    triggerSuccess(`Base salary updated to ₹${Number(editedSalary).toLocaleString('en-IN')} for ${selectedStaff.name}!`);
  };

  // Handler to open full employee edit modal
  const handleOpenEditEmployee = () => {
    if (!selectedStaff) return;
    setEditEmpName(selectedStaff.name);
    setEditEmpRole(selectedStaff.role);
    setEditEmpPhone(selectedStaff.phone || '');
    setEditEmpSalary(selectedStaff.salary || 18000);
    setShowEditEmployeeModal(true);
  };

  // Handler to save full employee details
  const handleSaveEmployeeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    if (!editEmpName.trim()) return;

    const updated = staffList.map(stf => {
      if (stf.id === selectedStaff.id) {
        return {
          ...stf,
          name: editEmpName.trim(),
          role: editEmpRole,
          phone: editEmpPhone.trim() || stf.phone,
          salary: Number(editEmpSalary) || stf.salary
        };
      }
      return stf;
    });

    onUpdateStaffList(updated);
    setShowEditEmployeeModal(false);
    triggerSuccess(`Employee details updated successfully for ${editEmpName.trim()}!`);
  };

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
    owner: 'bg-rose-50 text-rose-700 border border-rose-200',
    manager: 'bg-cyan-50 text-[#0E7490] border border-cyan-200',
    detailer: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  };

  return (
    <div className="space-y-6 animate-fade-in text-left" id="employee-ledger-root">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 bg-[#16A34A] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce">
          <Check size={16} className="stroke-[3]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5EDF3] pb-5 bg-white p-5 rounded-2xl border">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight md:text-2xl flex items-center gap-2.5">
            <Users className="text-[#0891B2]" size={24} />
            <span>Employee Management & Ledger</span>
          </h1>
          <p className="text-xs text-[#475569]">Track employee details, base salaries, and payment transactions ("Hisab-Kitab")</p>
        </div>

        <button
          onClick={() => setShowAddEmployeeModal(true)}
          className="px-4 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Create Employee</span>
        </button>
      </div>

      {staffList.length === 0 ? (
        <div className="h-64 bg-white border border-[#E5EDF3] rounded-2xl flex flex-col items-center justify-center text-center p-6 shadow-md">
          <Users className="text-[#CBD5E1] mb-2 animate-pulse" size={40} />
          <p className="text-sm font-semibold text-[#475569]">No employees registered yet</p>
          <p className="text-xs text-[#475569] mt-1">Click Create Employee above to register your first team member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Area: Employees List */}
          <div className="space-y-4">
            <h3 className="text-xs text-[#475569] font-extrabold uppercase tracking-wider block px-1">Staff Roster</h3>
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
                        ? 'bg-[#ECFEFF] border-2 border-[#0891B2] text-[#0F172A] shadow-md'
                        : 'bg-white border-[#E5EDF3] hover:bg-[#F4F8FB] text-[#334155]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 text-left">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-[#E5EDF3] flex items-center justify-center text-xs font-bold text-[#334155] uppercase shrink-0 overflow-hidden">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          emp.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate text-[#0F172A]">{emp.name}</h4>
                        <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-1 ${roleColors[emp.role]}`}>
                          {roleLabels[emp.role]}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[9px] text-[#0891B2] block font-bold uppercase tracking-wider">Remaining</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaffId(emp.id);
                            setEditedSalary(emp.salary || 18000);
                            setIsEditingSalary(true);
                          }}
                          className="p-0.5 hover:bg-[#CFFAFE] text-[#0891B2] rounded transition-colors"
                          title={`Edit ${emp.name}'s Salary`}
                        >
                          <Edit2 size={9} />
                        </button>
                      </div>
                      <strong className="text-xs font-bold text-[#0F172A]">₹{netRemaining}</strong>
                      <div className="text-[9px] text-[#475569] block font-semibold mt-0.5">Paid: ₹{totalPaid}</div>
                      {totalDeductions > 0 && (
                        <div className="text-[9px] text-[#EF4444] font-bold">Cut: ₹{totalDeductions}</div>
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
              <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl shadow-md">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-[#E5EDF3] pb-5">
                  <div className="flex items-center gap-4 text-left">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-16 w-16 rounded-2xl bg-slate-50 border-2 border-[#E5EDF3] shadow-sm flex items-center justify-center text-lg font-black text-[#334155] uppercase shrink-0 overflow-hidden cursor-pointer hover:border-[#0891B2] transition-all group relative"
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
                      <h2 className="text-base font-bold text-[#0F172A]">{selectedStaff.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${roleColors[selectedStaff.role]}`}>
                          {roleLabels[selectedStaff.role]}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          selectedStaff.status === 'active'
                            ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                            : 'bg-slate-100 text-[#475569] border-slate-200'
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
                          className="text-[10px] bg-white hover:bg-slate-50 text-[#0891B2] hover:text-[#0E7490] px-2.5 py-0.5 rounded-full border border-[#CBD5E1] transition-all cursor-pointer font-bold shadow-2xs"
                        >
                          Change Photo 📷
                        </button>

                        <button
                          onClick={handleOpenEditEmployee}
                          className="text-[10px] bg-white hover:bg-slate-50 text-[#0891B2] hover:text-[#0E7490] px-2.5 py-0.5 rounded-full border border-[#CBD5E1] transition-all cursor-pointer font-bold shadow-2xs flex items-center gap-1"
                        >
                          <Edit2 size={10} />
                          <span>Edit Details</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditedSalary(selectedStaff.salary || 18000);
                            setIsEditingSalary(true);
                          }}
                          className="text-[10px] bg-[#ECFEFF] hover:bg-[#CFFAFE] text-[#0891B2] hover:text-[#0E7490] px-2.5 py-0.5 rounded-full border border-[#0891B2]/40 transition-all cursor-pointer font-extrabold shadow-2xs flex items-center gap-1"
                          title="Quick Edit Base Salary"
                        >
                          <DollarSign size={10} className="stroke-[2.5]" />
                          <span>Edit Salary (₹{(selectedStaff.salary || 18000).toLocaleString('en-IN')})</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Salary Deductions Display */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full xl:w-auto">
                    <div 
                      onClick={() => {
                        setEditedSalary(selectedStaff.salary || 18000);
                        setIsEditingSalary(true);
                      }}
                      className="bg-white hover:bg-[#ECFEFF]/60 hover:border-[#0891B2] p-2 rounded-xl border-2 border-[#0891B2]/40 text-center min-w-[85px] flex-1 cursor-pointer transition-all group relative shadow-2xs hover:shadow-xs"
                      title="Click to edit Base Salary"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[9px] text-[#0891B2] font-black uppercase tracking-wider block">Base Salary</span>
                        <Edit2 size={9} className="text-[#0891B2]" />
                      </div>
                      <strong className="text-xs font-bold text-[#0F172A] block mt-0.5">₹{(selectedStaff.salary || 18000).toLocaleString('en-IN')}</strong>
                      <span className="text-[8px] bg-[#CFFAFE] text-[#0E7490] px-1.5 py-0.5 rounded font-extrabold inline-block mt-0.5">Edit ✎</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-[#E5EDF3] text-center min-w-[85px] flex-1">
                      <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Paid</span>
                      <strong className="text-xs font-bold text-[#16A34A] block mt-0.5">₹{selectedStaffTotalPaid}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-[#E5EDF3] text-center min-w-[85px] flex-1">
                      <span className="text-[9px] text-[#EF4444] font-bold uppercase tracking-wider block">Salary Cuts</span>
                      <strong className="text-xs font-bold text-[#EF4444] block mt-0.5">₹{selectedStaffTotalDeductions}</strong>
                    </div>
                    {/* Beautiful green Remaining box */}
                    <div className="bg-[#ECFDF5] p-2 rounded-xl border border-[#A7F3D0] text-center min-w-[85px] flex-1">
                      <span className="text-[9px] text-[#047857] font-bold uppercase tracking-wider block">Remaining</span>
                      <strong className="text-xs font-bold text-[#065F46] block mt-0.5">₹{selectedStaffNetRemaining}</strong>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-left">
                  <div className="flex items-center gap-2.5 text-[#1E293B]">
                    <Phone size={14} className="text-[#64748B] shrink-0" />
                    <div>
                      <span className="text-[#475569] text-[10px] block font-semibold uppercase">Mobile Number</span>
                      <strong className="text-[#0F172A]">{selectedStaff.phone || '8510002780'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-[#1E293B]">
                    <TrendingUp size={14} className="text-[#64748B] shrink-0" />
                    <div>
                      <span className="text-[#475569] text-[10px] block font-semibold uppercase font-bold">Ledger Status</span>
                      <span className="text-[#0E7490] font-medium block">Automatic balance deduction active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prominent Active Salary Bar with One-Click Edit Button */}
              <div className="bg-[#ECFEFF] border border-[#CFFAFE] p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0891B2] to-[#06B6D4] text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                    <DollarSign size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#0E7490] font-black uppercase tracking-wider block">Monthly Base Salary</span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-lg font-black text-[#0F172A]">₹{(selectedStaff.salary || 18000).toLocaleString('en-IN')}</strong>
                      <span className="text-xs text-[#64748B] font-semibold">per month</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditedSalary(selectedStaff.salary || 18000);
                    setIsEditingSalary(true);
                  }}
                  className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
                >
                  <Edit2 size={13} />
                  <span>Edit Salary (₹{(selectedStaff.salary || 18000).toLocaleString('en-IN')})</span>
                </button>
              </div>

              {/* Ledger (Hisab-Kitab) & Add Payment/Leave Entry Section */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
                
                {/* Left side of section (Form for adding entry - 2/5 width) */}
                <div className="md:col-span-2 bg-white border border-[#E5EDF3] p-4 rounded-2xl space-y-4 shadow-sm">
                  {/* Tab Selectors */}
                  <div className="flex border-b border-[#E5EDF3]">
                    <button
                      type="button"
                      onClick={() => setFormTab('payment')}
                      className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                        formTab === 'payment'
                          ? 'border-[#0891B2] text-[#0891B2] font-bold'
                          : 'border-transparent text-[#334155] hover:text-[#0F172A]'
                      }`}
                    >
                      Add Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormTab('leave');
                        if (leaveDeduction === 0) {
                          setLeaveDeduction(Math.round((selectedStaff?.salary || 18000) / 30));
                        }
                      }}
                      className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                        formTab === 'leave'
                          ? 'border-[#0891B2] text-[#0891B2] font-bold'
                          : 'border-transparent text-[#334155] hover:text-[#0F172A]'
                      }`}
                    >
                      Mark Leave
                    </button>
                  </div>

                  {formTab === 'payment' ? (
                    <form onSubmit={handleAddPaymentEntry} className="space-y-3.5 text-left">
                      <div>
                        <label className="text-xs text-[#1E293B] font-medium block mb-1">Amount Paid (₹) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={payAmount || ''}
                          onChange={(e) => setPayAmount(Number(e.target.value))}
                          placeholder="e.g. 5000"
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#1E293B] font-medium block mb-1">Payment Date *</label>
                        <input
                          type="date"
                          required
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#1E293B] font-medium block mb-1">Reason / Remarks *</label>
                        <input
                          type="text"
                          required
                          value={payReason}
                          onChange={(e) => setPayReason(e.target.value)}
                          placeholder="e.g. Advance, Salary, Diesel allowance"
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={payAmount <= 0}
                        className="w-full py-2.5 bg-[#0891B2] hover:bg-[#0E7490] disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        Record Payment
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleAddLeaveEntry} className="space-y-3.5 text-left">
                      <div>
                        <label className="text-xs text-[#1E293B] font-medium block mb-1">Leave Date *</label>
                        <input
                          type="date"
                          required
                          value={leaveDate}
                          onChange={(e) => setLeaveDate(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#1E293B] font-medium block mb-1">Reason for Leave *</label>
                        <select
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none cursor-pointer font-bold"
                        >
                          <option value="Absent without permission">Absent without permission</option>
                          <option value="Sick Leave">Sick Leave</option>
                          <option value="Personal Leave">Personal Leave</option>
                          <option value="Holiday / Festival">Holiday / Festival</option>
                          <option value="Other Reason">Other Reason</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-[#1E293B] font-medium block mb-1">Custom Remarks / Notes</label>
                        <input
                          type="text"
                          value={leaveRemarks}
                          onChange={(e) => setLeaveRemarks(e.target.value)}
                          placeholder="e.g. Urgent home visit, family function"
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#1E293B] font-medium block mb-1">Salary Cut Amount (₹) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={leaveDeduction || ''}
                          onChange={(e) => setLeaveDeduction(Number(e.target.value))}
                          placeholder="e.g. 500"
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setLeaveDeduction(Math.round((selectedStaff?.salary || 18000) / 30))}
                          className="text-[11px] text-[#0891B2] hover:text-[#0E7490] font-bold mt-1.5 block hover:underline cursor-pointer"
                        >
                          💡 Suggest 1-day cut (₹{Math.round((selectedStaff?.salary || 18000) / 30)})
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={leaveDeduction < 0}
                        className="w-full py-2.5 bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        Deduct Salary & Log Leave
                      </button>
                    </form>
                  )}
                </div>

                {/* Right side of section (Ledger list - 3/5 width) */}
                <div className="md:col-span-3 bg-white border border-[#E5EDF3] p-4 rounded-2xl space-y-4 shadow-sm text-left">
                  <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider block">Payment & Leave Ledger Transactions</h3>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {(!selectedStaff.ledger || selectedStaff.ledger.length === 0) ? (
                      <div className="py-12 text-center text-slate-500 border border-dashed border-[#CBD5E1] rounded-xl bg-slate-50/50">
                        <AlertCircle className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-2xs font-semibold text-[#475569]">No transactions in ledger</p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">Use the ledger form on the left to add a transaction or leave.</p>
                      </div>
                    ) : (
                      selectedStaff.ledger.map((entry) => {
                        const isDeduction = entry.amount < 0;
                        return (
                          <div key={entry.id} className={`p-3 border rounded-xl flex justify-between items-center text-xs transition-colors ${
                            isDeduction 
                              ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/50 text-[#334155]' 
                              : 'bg-slate-50/50 border-[#E5EDF3] hover:bg-slate-100/40 text-[#334155]'
                          }`}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <strong className="text-[#0F172A] block font-bold">{entry.reason}</strong>
                                {isDeduction && (
                                  <span className="text-[8px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Salary Cut
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] font-bold">
                                <Calendar size={10} className="text-[#0891B2]" />
                                <span>{entry.date}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <strong className={`font-bold text-sm ${
                                isDeduction ? 'text-[#EF4444]' : 'text-[#16A34A]'
                              }`}>
                                {isDeduction ? `-₹${Math.abs(entry.amount)}` : `₹${entry.amount}`}
                              </strong>
                              <button
                                onClick={() => handleDeleteLedgerEntry(entry.id)}
                                className="p-1.5 hover:bg-rose-50 text-[#EF4444] rounded-lg transition-all cursor-pointer"
                                title="Delete transaction entry"
                              >
                                <Trash2 size={13} />
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E5EDF3] rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 text-left text-[#1E293B]">
            <button
              onClick={() => setShowAddEmployeeModal(false)}
              className="absolute right-4 top-4 p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">Create Employee</h3>
              <p className="text-3xs text-[#64748B] mt-1">Register a new team member to start managing their salary accounts and ledger history.</p>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#1E293B] font-medium block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="e.g. 7078408264"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#1E293B] font-medium block mb-1">Base Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newEmpSalary || ''}
                    onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                    placeholder="e.g. 18000"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Profile Photo (Optional - Image URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEmpAvatar.startsWith('data:') ? 'Local Image Selected 📷' : newEmpAvatar}
                    onChange={(e) => setNewEmpAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
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
                    className="px-3 py-2.5 bg-white hover:bg-slate-50 text-[#334155] text-xs font-bold rounded-lg border border-[#CBD5E1] transition-all whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    Upload File 📁
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Job Role *</label>
                <select
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value as Staff['role'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none cursor-pointer font-bold"
                >
                  <option value="detailer">Employee</option>
                  <option value="manager">Car Washer</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Edit Base Salary Modal */}
      {isEditingSalary && selectedStaff && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="edit-salary-modal">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-2xl space-y-4 border border-[#E5EDF3] animate-zoom-in text-left">
            <div className="flex justify-between items-center border-b border-[#E5EDF3] pb-3">
              <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                <DollarSign size={16} className="text-[#0891B2]" />
                <span>Edit Monthly Base Salary</span>
              </h3>
              <button
                onClick={() => setIsEditingSalary(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E5EDF3] p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Staff Member</span>
              <strong className="text-xs text-[#0F172A] block font-bold">{selectedStaff.name} ({roleLabels[selectedStaff.role]})</strong>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">New Monthly Base Salary (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#64748B]">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={editedSalary}
                    onChange={(e) => setEditedSalary(Number(e.target.value))}
                    placeholder="e.g. 18000"
                    className="w-full text-sm font-bold pl-8 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-[#64748B] mt-1.5 leading-relaxed">
                  Salary updates automatically recalculate ledger deductions and net remaining balance.
                </p>
              </div>

              {/* Quick salary preset chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Quick Presets:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[12000, 15000, 18000, 20000, 22000, 25000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEditedSalary(amt)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                        editedSalary === amt
                          ? 'bg-[#0891B2] text-white border-[#0891B2]'
                          : 'bg-[#F4F8FB] hover:bg-[#ECFEFF] text-[#0891B2] border-[#CFFAFE]'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSalary(false)}
                  className="flex-1 py-2.5 bg-[#F4F8FB] hover:bg-[#E5EDF3] text-[#475569] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Save Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Full Employee Details Modal */}
      {showEditEmployeeModal && selectedStaff && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="edit-employee-modal">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 border border-[#E5EDF3] animate-zoom-in text-left">
            <div className="flex justify-between items-center border-b border-[#E5EDF3] pb-3">
              <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                <Edit2 size={16} className="text-[#0891B2]" />
                <span>Edit Employee Details</span>
              </h3>
              <button
                onClick={() => setShowEditEmployeeModal(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEmployeeEdit} className="space-y-3.5">
              <div>
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editEmpName}
                  onChange={(e) => setEditEmpName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Job Role *</label>
                <select
                  value={editEmpRole}
                  onChange={(e) => setEditEmpRole(e.target.value as Staff['role'])}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none cursor-pointer font-bold"
                >
                  <option value="detailer">Employee</option>
                  <option value="manager">Car Washer</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={editEmpPhone}
                  onChange={(e) => setEditEmpPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#1E293B] font-medium block mb-1">Monthly Base Salary (₹) *</label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={editEmpSalary}
                  onChange={(e) => setEditEmpSalary(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-bold"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditEmployeeModal(false)}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
