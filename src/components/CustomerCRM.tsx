/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Car,
  FileText,
  Briefcase,
  User,
  X,
  Trash2,
  Calendar,
  RefreshCw,
  Info,
  AlertCircle,
  Check
} from 'lucide-react';
import { Customer, Appointment, Staff } from '../types/crm';

const formatDateTimeFriendly = (dateStr: string, timeStr: string) => {
  if (!dateStr) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = dateStr.split('-');
  let datePart = dateStr;
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (monthIndex >= 0 && monthIndex < 12) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      datePart = `${dayStr} ${months[monthIndex]} ${year}`;
    }
  }
  
  let timePart = timeStr || '';
  if (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) {
    let [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    timePart = `${hours}:${minutesStr} ${ampm}`;
  } else if (timeStr && /^\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?$/i.test(timeStr)) {
    timePart = timeStr.toUpperCase();
  }
  
  return timePart ? `${datePart}, ${timePart}` : datePart;
};

interface CustomerCRMProps {
  customers: Customer[];
  appointments: Appointment[];
  staff?: Staff[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer?: (id: string) => void;
  onNavigate?: (tab: string) => void;
}

export default function CustomerCRM({
  customers,
  appointments,
  staff = [],
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onNavigate
}: CustomerCRMProps) {
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'history'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRecurringMsg, setShowRecurringMsg] = useState<string | null>(null);

  // New Customer Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custVehicleType, setCustVehicleType] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Check if there is a conflict: same phone number but different name
  const crmPhoneConflict = (() => {
    const cleanPhone = custPhone.replace(/\D/g, '');
    if (cleanPhone.length < 5) return null;
    return customers.find(c => {
      const cPhoneNorm = c.phone ? c.phone.replace(/\D/g, '') : '';
      if (cPhoneNorm.length < 5) return false;
      const phoneMatch = cPhoneNorm === cleanPhone || cPhoneNorm.endsWith(cleanPhone) || cleanPhone.endsWith(cPhoneNorm);
      const nameMismatch = c.name.trim().toLowerCase() !== custName.trim().toLowerCase();
      return phoneMatch && nameMismatch;
    });
  })();

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      c.vehicles.some(v => 
        v.make.toLowerCase().includes(search.toLowerCase()) || 
        v.model.toLowerCase().includes(search.toLowerCase())
      );
    return matchesSearch;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the phone number is already registered under a different name
    if (crmPhoneConflict) {
      alert(`⚠️ Alert: The mobile number "${custPhone}" is already registered under the name "${crmPhoneConflict.name}".\n\nYou cannot create a client with the same number but a different name ("${custName}"). Please correct the name or edit the existing client.`);
      return;
    }

    // Check if the customer with the exact same name and phone number already exists
    const exactMatch = customers.find(c => {
      const cleanPhone = custPhone.replace(/\D/g, '');
      const cPhoneNorm = c.phone ? c.phone.replace(/\D/g, '') : '';
      return cleanPhone.length >= 5 && cPhoneNorm === cleanPhone && c.name.trim().toLowerCase() === custName.trim().toLowerCase();
    });

    if (exactMatch) {
      alert(`⚠️ Alert: A client with the name "${custName}" and mobile number "${custPhone}" already exists.\n\nYou cannot create a duplicate client.`);
      return;
    }

    // Map the combined "Vehicle Type" to make/model
    const vehicleTypeStr = custVehicleType.trim() || 'Toyota';
    
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: custName,
      phone: custPhone,
      email: custEmail,
      address: custAddress || undefined,
      notes: custNotes || undefined,
      vehicles: [
        {
          year: '2024',
          make: vehicleTypeStr,
          model: '',
          size: 'sedan',
          color: 'Not Specified',
          licensePlate: 'PENDING'
        }
      ],
      createdAt: new Date().toISOString(),
      lifetimeSpend: 0,
      totalJobs: 0
    };

    onAddCustomer(newCust);
    setShowAddModal(false);

    // Reset fields
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustVehicleType('');
    setCustAddress('');
    setCustNotes('');
  };

  const handleBookClient = (client: Customer) => {
    // Store in localStorage to let BookingsManager select it
    localStorage.setItem('preselected_client_id', client.id);
    if (onNavigate) {
      onNavigate('bookings_new');
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedCustHistory = appointments.filter(a => a.customerId === selectedCustomerId);

  return (
    <div className="space-y-6 animate-fade-in" id="crm-tab-root">
      
      {/* Header with high contrast light layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#E5EDF3] shadow-md">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight md:text-2xl">Clients</h1>
          <p className="text-xs text-[#475569]">Manage client information, contact logs, and history</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Plus size={16} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Sub Tabs: Active Clients & Past JobsHistory */}
      <div className="flex justify-center">
        <div className="flex bg-white p-1 rounded-2xl border border-[#E5EDF3] shadow-md w-full max-w-md">
          <button
            type="button"
            onClick={() => setActiveSubTab('active')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              activeSubTab === 'active'
                ? 'bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Active Clients
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              activeSubTab === 'history'
                ? 'bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Past JobsHistory
          </button>
        </div>
      </div>

      {/* Search Input Container */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EDF3] shadow-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none placeholder-[#94A3B8]"
          />
        </div>
      </div>

      {/* Active Clients Grid */}
      {activeSubTab === 'active' ? (
        filteredCustomers.length === 0 ? (
          <div className="h-64 bg-white border border-[#E5EDF3] rounded-2xl shadow-md flex flex-col items-center justify-center text-center p-6">
            <Users className="text-[#CBD5E1] mb-2" size={40} />
            <p className="text-sm font-semibold text-[#475569]">No clients registered yet</p>
            <p className="text-xs text-[#64748B] mt-1">Click "Add Client" above to register your first profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((client) => {
              const primaryVehicle = client.vehicles[0];
              return (
                <div
                  key={client.id}
                  className="bg-white p-5 rounded-2xl border border-[#E5EDF3] shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative group border-t-[3px] border-t-[#0891B2]"
                >
                  {/* Delete Client Action Button (Trash Can) */}
                  {onDeleteCustomer && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${client.name}?`)) {
                          onDeleteCustomer(client.id);
                        }
                      }}
                      className="absolute top-4 right-4 p-1.5 hover:bg-rose-50 text-[#EF4444] rounded-lg border border-rose-100 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Delete Client"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  {/* Card Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{client.name}</h3>
                      <p className="text-xs text-[#0891B2] font-semibold mt-0.5">
                        {primaryVehicle ? `${primaryVehicle.make} ${primaryVehicle.model || ''}`.trim() : 'No Vehicle Registered'}
                      </p>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-2 text-xs text-[#1E293B] font-medium text-left">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-[#64748B]" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-[#64748B]" />
                        <span className="truncate block max-w-[200px]">{client.email || 'No email registered'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-[#64748B]" />
                        <span className="truncate block max-w-[200px]">{client.address || 'No address registered'}</span>
                      </div>
                    </div>

                    <hr className="border-[#E5EDF3]" />

                    {/* Brief Stats */}
                    <div className="flex justify-between items-center text-xs font-bold text-[#475569]">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-[#64748B]" />
                        <span>{client.totalJobs} Wash</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#64748B]">Earn:</span>
                        <span className="text-[#16A34A] font-bold">₹{client.lifetimeSpend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row (Details, Book, Recurring) */}
                  <div className="grid grid-cols-3 gap-1.5 mt-5 pt-4 border-t border-[#E5EDF3]">
                    <button
                      onClick={() => {
                        setSelectedCustomerId(client.id);
                        setShowDetailsModal(true);
                      }}
                      className="py-1.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[10px] font-bold rounded-lg text-[#334155] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <User size={10} />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleBookClient(client)}
                      className="py-1.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Calendar size={10} />
                      <span>Book</span>
                    </button>
                    <button
                      onClick={() => setShowRecurringMsg(client.name)}
                      className="py-1.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[10px] font-bold rounded-lg text-[#334155] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw size={10} />
                      <span>Recurring</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Jobs History Tab view */
        <div className="bg-white border border-[#E5EDF3] rounded-2xl p-5 shadow-md text-left">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-1.5">
            <FileText size={16} className="text-[#0891B2]" />
            <span>Complete Jobs History log</span>
          </h3>

          {/* Desktop/Laptop Table (Hidden on screens below 768px / md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E5EDF3] text-[#334155] font-bold">
                  <th className="py-2.5">Client</th>
                  <th className="py-2.5">Vehicle</th>
                  <th className="py-2.5">Service</th>
                  <th className="py-2.5">Date & Time</th>
                  <th className="py-2.5 text-right">Price</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EDF3] text-[#1E293B]">
                {appointments
                  .filter(a => a.status === 'completed')
                  .map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#F4F8FB]">
                      <td className="py-3 font-semibold text-[#0F172A]">{apt.customerName}</td>
                      <td className="py-3 capitalize">{apt.vehicle.make} {apt.vehicle.model}</td>
                      <td className="py-3 font-semibold text-[#0E7490]">{apt.serviceName}</td>
                      <td className="py-3 font-sans text-[#475569] whitespace-nowrap">{formatDateTimeFriendly(apt.date, apt.time)}</td>
                      <td className="py-3 text-right font-semibold text-[#16A34A]">₹{apt.price}</td>
                      <td className="py-3 text-right">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  ))}
                {appointments.filter(a => a.status === 'completed').length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#64748B] italic">
                      No completed jobs logged in the system yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Job Cards View (Only visible on screens below 768px / md) */}
          <div className="block md:hidden space-y-3">
            {appointments
              .filter(a => a.status === 'completed')
              .map((apt) => (
                <div
                  key={apt.id}
                  className={`bg-white border border-[#E5EDF3] rounded-2xl p-4 shadow-sm text-left flex flex-col gap-3 border-l-[4px] ${
                    apt.status === 'completed'
                      ? 'border-l-[#16A34A]'
                      : apt.status === 'scheduled'
                      ? 'border-l-[#0891B2]'
                      : apt.status === 'pending'
                      ? 'border-l-[#FACC15]'
                      : apt.status === 'cancelled'
                      ? 'border-l-[#EF4444]'
                      : 'border-l-slate-300'
                  }`}
                >
                  {/* Top row: Client Name and Status Pill */}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-base font-bold text-[#0F172A] truncate">{apt.customerName}</span>
                    {apt.status === 'completed' ? (
                      <span className="bg-emerald-50 text-[#16A34A] border border-emerald-100 text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
                        Completed
                      </span>
                    ) : apt.status === 'scheduled' ? (
                      <span className="bg-cyan-50 text-[#0891B2] border border-cyan-100 text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
                        Scheduled
                      </span>
                    ) : apt.status === 'pending' ? (
                      <span className="bg-amber-50 text-[#F59E0B] border border-amber-100 text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
                        Pending
                      </span>
                    ) : apt.status === 'cancelled' ? (
                      <span className="bg-rose-50 text-[#EF4444] border border-rose-100 text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
                        Cancelled
                      </span>
                    ) : (
                      <span className="bg-slate-50 text-slate-600 border border-slate-100 text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
                        {apt.status}
                      </span>
                    )}
                  </div>

                  {/* Second row: Service Name and Vehicle Model */}
                  <div className="space-y-1">
                    <h4 className="text-[15px] font-semibold text-[#0E7490] leading-snug">{apt.serviceName}</h4>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#64748B]">
                      <Car size={13} className="shrink-0 text-[#64748B]" />
                      <span className="capitalize truncate">{apt.vehicle.make} {apt.vehicle.model}</span>
                    </div>
                  </div>

                  {/* Third row: Date and Time */}
                  <div className="flex items-center gap-1.5 text-[14px] text-[#334155] font-normal whitespace-nowrap">
                    <Calendar size={14} className="shrink-0 text-[#64748B]" />
                    <span>{formatDateTimeFriendly(apt.date, apt.time)}</span>
                  </div>

                  {/* Bottom row: Divider + Amount & Price */}
                  <div className="pt-2.5 border-t border-[#E5EDF3] flex justify-between items-center">
                    <span className="text-[13px] text-[#64748B]">Amount</span>
                    <span className="text-[18px] font-bold text-[#0F172A]">₹{apt.price}</span>
                  </div>
                </div>
              ))}

            {appointments.filter(a => a.status === 'completed').length === 0 && (
              <div className="text-center py-8 text-[#64748B] italic bg-slate-50/50 rounded-2xl border border-dashed border-[#E5EDF3] p-4">
                No completed jobs logged in the system yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="add-client-modal">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-zoom-in text-[#1E293B] border border-[#E5EDF3]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E5EDF3] flex items-center justify-between bg-white text-[#0F172A] shrink-0">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#0891B2]" />
                <h2 className="text-base font-bold text-[#0E7490]">Add New Client</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              
              {/* Row 1: Name * & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#1E293B] block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Enter full name"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#1E293B] block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                  />
                </div>
              </div>

              {crmPhoneConflict && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in shadow-xs transition-all text-left">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                    <AlertCircle size={16} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-[#EF4444] flex items-center gap-1.5">
                      <span>Duplicate Mobile Number Alert!</span>
                      <span className="bg-rose-200/60 text-[#EF4444] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Conflict</span>
                    </h4>
                    <p className="text-2xs text-[#EF4444] leading-relaxed font-medium">
                      The mobile number <strong className="font-bold">{custPhone}</strong> is already registered under the name <strong className="font-bold">{crmPhoneConflict.name}</strong>. You cannot register the same mobile number under a different name.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCustName(crmPhoneConflict.name);
                          if (crmPhoneConflict.phone) setCustPhone(crmPhoneConflict.phone);
                          if (crmPhoneConflict.email) setCustEmail(crmPhoneConflict.email);
                          if (crmPhoneConflict.address) setCustAddress(crmPhoneConflict.address);
                          if (crmPhoneConflict.notes) setCustNotes(crmPhoneConflict.notes);
                          if (crmPhoneConflict.vehicles && crmPhoneConflict.vehicles.length > 0) {
                            setCustVehicleType(crmPhoneConflict.vehicles[0].make);
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:shadow-sm"
                      >
                        <Check size={12} className="stroke-[2.5]" />
                        <span>Use existing client name '{crmPhoneConflict.name}'</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 2: Email & Vehicle Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#1E293B] block mb-1">Email</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#1E293B] block mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    required
                    value={custVehicleType}
                    onChange={(e) => setCustVehicleType(e.target.value)}
                    placeholder="e.g., Toyota Camry"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Address */}
              <div>
                <label className="text-xs font-medium text-[#1E293B] block mb-1">Address</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Enter full address"
                  className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                />
              </div>

              {/* Row 4: Notes */}
              <div>
                <label className="text-xs font-medium text-[#1E293B] block mb-1">Notes</label>
                <textarea
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="Any important details about this client..."
                  className="w-full text-xs rounded-lg border border-[#CBD5E1] p-2.5 bg-white text-[#1E293B] placeholder-[#94A3B8] h-24 focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#E5EDF3] flex gap-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer text-center"
                >
                  Add Client
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in text-[#1E293B] border border-[#E5EDF3]">
            <div className="p-5 bg-white border-b border-[#E5EDF3] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#0891B2]" />
                <h3 className="font-bold text-sm text-[#0E7490]">Client Information Profile</h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-[#E5EDF3] text-left">
                <div className="h-10 w-10 rounded-full bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center text-sm font-bold border border-[#0891B2]/10">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#0F172A]">{selectedCustomer.name}</h4>
                  <p className="text-3xs text-[#64748B]">Created: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-left">
                <div className="flex justify-between py-1 border-b border-[#E5EDF3]">
                  <span className="text-[#64748B]">Phone:</span>
                  <span className="font-bold text-[#1E293B]">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EDF3]">
                  <span className="text-[#64748B]">Email:</span>
                  <span className="font-bold text-[#1E293B]">{selectedCustomer.email || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EDF3]">
                  <span className="text-[#64748B]">Address:</span>
                  <span className="font-bold text-[#1E293B]">{selectedCustomer.address || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5EDF3]">
                  <span className="text-[#64748B]">Total Wash:</span>
                  <span className="font-bold text-[#1E293B]">{selectedCustomer.totalJobs}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Total Cost Earn:</span>
                  <span className="font-bold text-[#16A34A]">₹{selectedCustomer.lifetimeSpend}</span>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 bg-[#F4F8FB] rounded-lg border border-[#E5EDF3] text-xs text-left">
                  <strong className="text-[10px] text-[#64748B] block mb-1 uppercase tracking-wider">Client Notes / Specifications</strong>
                  <p className="text-[#334155] italic">"{selectedCustomer.notes}"</p>
                </div>
              )}

              {selectedCustHistory.length > 0 ? (
                <div className="space-y-3 pt-2 text-left">
                  <strong className="text-[10px] text-[#64748B] block uppercase tracking-wider font-extrabold">
                    Car Wash & Detailing History ({selectedCustHistory.length})
                  </strong>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {selectedCustHistory.map(job => {
                      const staffMember = job.assignedTo ? staff.find(s => s.id === job.assignedTo) : null;
                      const staffName = staffMember ? staffMember.name : 'Not Assigned';
                      
                      // Status styling
                      let statusBadge = '';
                      if (job.status === 'completed') {
                        statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-250';
                      } else if (job.status === 'in_progress') {
                        statusBadge = 'bg-amber-100 text-amber-850 border-amber-200';
                      } else if (job.status === 'scheduled') {
                        statusBadge = 'bg-[#CFFAFE] text-[#0E7490] border-[#0891B2]/20';
                      } else if (job.status === 'cancelled') {
                        statusBadge = 'bg-rose-100 text-[#EF4444] border-rose-200';
                      } else {
                        statusBadge = 'bg-slate-100 text-slate-800 border-slate-200';
                      }

                      return (
                        <div key={job.id} className="p-3 bg-[#F4F8FB] rounded-xl border border-[#E5EDF3] text-xs flex flex-col gap-2 hover:border-[#0891B2]/20 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-[#0F172A] text-xs block">{job.serviceName}</span>
                              <div className="flex items-center gap-1.5 mt-1 text-[#64748B] text-[10px]">
                                <Calendar size={10} className="text-[#0891B2]" />
                                <span className="font-semibold">{job.date}</span>
                                {job.time && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-semibold">{job.time}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-[#16A34A] font-bold text-xs">₹{job.price}</span>
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusBadge}`}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-[#E5EDF3] text-[10px] text-[#334155]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#64748B] font-semibold">Cleaner:</span>
                              <span className="font-bold text-[#0E7490] bg-[#ECFEFF] px-2 py-0.5 rounded border border-[#0891B2]/10">{staffName}</span>
                            </div>
                            {job.vehicle && (
                              <div className="text-[10px] font-bold text-[#475569]">
                                🚗 {job.vehicle.make} {job.vehicle.model || ''}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center p-5 bg-[#F4F8FB] rounded-xl border border-dashed border-[#E5EDF3] text-[#64748B] text-xs font-semibold">
                  No detailing/wash history logged for this client yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recurring Client notification Toast */}
      {showRecurringMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-white border-2 border-[#0891B2] rounded-xl shadow-2xl text-[#1E293B] max-w-sm animate-zoom-in text-left">
          <div className="flex gap-2.5 items-start">
            <Info className="text-[#0891B2] shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="text-xs font-bold text-[#0F172A]">Recurring Detailing Active</h4>
              <p className="text-[11px] text-[#475569] mt-1">
                Automated monthly scheduling is active for <strong>{showRecurringMsg}</strong>. Reminder alerts are configured via SMS notifications.
              </p>
              <button
                onClick={() => setShowRecurringMsg(null)}
                className="mt-2.5 text-[10px] font-bold text-[#0891B2] hover:text-[#0E7490] uppercase cursor-pointer block"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
