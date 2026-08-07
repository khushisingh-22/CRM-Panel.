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
import { Customer, Appointment } from '../types/crm';

interface CustomerCRMProps {
  customers: Customer[];
  appointments: Appointment[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer?: (id: string) => void;
  onNavigate?: (tab: string) => void;
}

export default function CustomerCRM({
  customers,
  appointments,
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
      
      {/* Header matching image 2 exactly */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Clients</h1>
          <p className="text-xs text-slate-400">Manage client information, contact logs, and history</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Plus size={16} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Sub Tabs: Active Clients & Past JobsHistory */}
      <div className="flex justify-center">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full max-w-md">
          <button
            type="button"
            onClick={() => setActiveSubTab('active')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              activeSubTab === 'active'
                ? 'bg-[#0ea5e9] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Clients
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              activeSubTab === 'history'
                ? 'bg-[#0ea5e9] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Past JobsHistory
          </button>
        </div>
      </div>

      {/* Search Input Container */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-700/50 bg-slate-950 text-white focus:bg-slate-900 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Active Clients Grid */}
      {activeSubTab === 'active' ? (
        filteredCustomers.length === 0 ? (
          <div className="h-64 bg-[#131D35] border border-slate-800/40 rounded-xl flex flex-col items-center justify-center text-center p-6">
            <Users className="text-slate-600 mb-2" size={40} />
            <p className="text-sm font-semibold text-slate-400">No clients registered yet</p>
            <p className="text-xs text-slate-500 mt-1">Click "Add Client" above to register your first profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((client) => {
              const primaryVehicle = client.vehicles[0];
              return (
                <div
                  key={client.id}
                  className="bg-[#131D35] p-5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all flex flex-col justify-between relative group"
                >
                  {/* Delete Client Action Button (Trash Can) */}
                  {onDeleteCustomer && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${client.name}?`)) {
                          onDeleteCustomer(client.id);
                        }
                      }}
                      className="absolute top-4 right-4 p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Delete Client"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  {/* Card Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{client.name}</h3>
                      <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                        {primaryVehicle ? `${primaryVehicle.make} ${primaryVehicle.model || ''}`.trim() : 'No Vehicle Registered'}
                      </p>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-2 text-xs text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-slate-500" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-slate-500" />
                        <span className="truncate block max-w-[200px]">{client.email || 'No email registered'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-slate-500" />
                        <span className="truncate block max-w-[200px]">{client.address || 'No address registered'}</span>
                      </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Brief Stats */}
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-slate-500" />
                        <span>{client.totalJobs} Wash</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Earn:</span>
                        <span className="text-emerald-400 font-mono">₹{client.lifetimeSpend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row (Details, Book, Recurring) */}
                  <div className="grid grid-cols-3 gap-1.5 mt-5 pt-4 border-t border-slate-800/50">
                    <button
                      onClick={() => {
                        setSelectedCustomerId(client.id);
                        setShowDetailsModal(true);
                      }}
                      className="py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] font-bold rounded text-slate-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <User size={10} />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleBookClient(client)}
                      className="py-1.5 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Calendar size={10} />
                      <span>Book</span>
                    </button>
                    <button
                      onClick={() => setShowRecurringMsg(client.name)}
                      className="py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] font-bold rounded text-slate-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
        <div className="bg-[#131D35] border border-slate-850 rounded-xl p-5 shadow-md">
          <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-1.5">
            <FileText size={16} className="text-[#0ea5e9]" />
            <span>Complete Jobs History log</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 font-bold">
                  <th className="py-2.5">Client</th>
                  <th className="py-2.5">Vehicle</th>
                  <th className="py-2.5">Service</th>
                  <th className="py-2.5">Date & Time</th>
                  <th className="py-2.5 text-right">Price</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {appointments
                  .filter(a => a.status === 'completed')
                  .map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-800/20">
                      <td className="py-3 font-semibold text-white">{apt.customerName}</td>
                      <td className="py-3 capitalize">{apt.vehicle.make} {apt.vehicle.model}</td>
                      <td className="py-3 font-semibold text-[#0ea5e9]">{apt.serviceName}</td>
                      <td className="py-3 font-mono text-slate-400">{apt.date} @ {apt.time}</td>
                      <td className="py-3 text-right font-mono text-emerald-400 font-bold">₹{apt.price}</td>
                      <td className="py-3 text-right">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  ))}
                {appointments.filter(a => a.status === 'completed').length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                      No completed jobs logged in the system yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Client Modal matching image 3 layout exactly */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="add-client-modal">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-zoom-in text-slate-800">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#0ea5e9]" />
                <h2 className="text-base font-bold">Add New Client</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              
              {/* Row 1: Name * & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Enter full name"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                  />
                </div>
              </div>

              {crmPhoneConflict && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in shadow-xs transition-all text-left">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                    <AlertCircle size={16} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <span>Duplicate Mobile Number Alert!</span>
                      <span className="bg-rose-200/60 text-rose-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Conflict</span>
                    </h4>
                    <p className="text-2xs text-rose-800 leading-relaxed font-medium">
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    required
                    value={custVehicleType}
                    onChange={(e) => setCustVehicleType(e.target.value)}
                    placeholder="e.g., Toyota Camry"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                  />
                </div>
              </div>

              {/* Row 3: Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Enter full address"
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                />
              </div>

              {/* Row 4: Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes</label>
                <textarea
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="Any important details about this client..."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-slate-50/50 text-slate-800 h-24 focus:outline-sky-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-xs font-extrabold rounded-lg shadow-md transition-all cursor-pointer text-center"
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
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in text-white border border-slate-800">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#0ea5e9]" />
                <h3 className="font-bold text-sm">Client Information Profile</h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-black">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-base">{selectedCustomer.name}</h4>
                  <p className="text-3xs text-slate-400">Created: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-bold text-slate-200">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-bold text-slate-200">{selectedCustomer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Address:</span>
                  <span className="font-bold text-slate-200">{selectedCustomer.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Total Wash:</span>
                  <span className="font-bold text-slate-200">{selectedCustomer.totalJobs}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Total Cost Earn:</span>
                  <span className="font-bold text-emerald-400 font-mono">₹{selectedCustomer.lifetimeSpend}</span>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/60 text-xs">
                  <strong className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Client Notes / Specifications</strong>
                  <p className="text-slate-300 italic">"{selectedCustomer.notes}"</p>
                </div>
              )}

              {selectedCustHistory.length > 0 && (
                <div className="space-y-2">
                  <strong className="text-[10px] text-slate-400 block uppercase tracking-wider">Detaling Jobs Log ({selectedCustHistory.length})</strong>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {selectedCustHistory.map(job => (
                      <div key={job.id} className="p-2 bg-slate-950/50 rounded border border-slate-800 text-[11px] flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-200 block">{job.serviceName}</span>
                          <span className="text-slate-400 font-mono text-[9px]">{job.date}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">₹{job.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recurring Client notification Toast */}
      {showRecurringMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-slate-900 border-2 border-[#0ea5e9] rounded-xl shadow-2xl text-white max-w-sm animate-zoom-in">
          <div className="flex gap-2.5 items-start">
            <Info className="text-[#0ea5e9] shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="text-xs font-extrabold">Recurring Detailing Active</h4>
              <p className="text-[11px] text-slate-300 mt-1">
                Automated monthly scheduling is active for <strong>{showRecurringMsg}</strong>. Reminder alerts are configured via SMS notifications.
              </p>
              <button
                onClick={() => setShowRecurringMsg(null)}
                className="mt-2.5 text-[10px] font-bold text-[#0ea5e9] hover:text-[#38bdf8] uppercase cursor-pointer"
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
