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
  DollarSign,
  Briefcase,
  ChevronRight,
  User,
  X
} from 'lucide-react';
import { Customer, Appointment } from '../types/crm';

interface CustomerCRMProps {
  customers: Customer[];
  appointments: Appointment[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

export default function CustomerCRM({
  customers,
  appointments,
  onAddCustomer,
  onUpdateCustomer
}: CustomerCRMProps) {
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');
  
  // New Customer Vehicle State
  const [vehYear, setVehYear] = useState('2023');
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehSize, setVehSize] = useState<'sedan' | 'suv' | 'truck_large'>('sedan');
  const [vehColor, setVehColor] = useState('');
  const [vehPlate, setVehPlate] = useState('');

  const filteredCustomers = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicles.some(v => v.make.toLowerCase().includes(search.toLowerCase()) || v.model.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // History for selected client
  const customerHistory = appointments.filter(a => a.customerId === selectedCustomerId);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: custName,
      phone: custPhone,
      email: custEmail,
      address: custAddress || undefined,
      notes: custNotes || undefined,
      vehicles: [
        {
          year: vehYear,
          make: vehMake,
          model: vehModel,
          size: vehSize,
          color: vehColor || undefined,
          licensePlate: vehPlate || undefined
        }
      ],
      createdAt: new Date().toISOString(),
      lifetimeSpend: 0,
      totalJobs: 0
    };

    onAddCustomer(newCust);
    setShowAddModal(false);
    setSelectedCustomerId(newCust.id);

    // Reset fields
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustAddress('');
    setCustNotes('');
    setVehMake('');
    setVehModel('');
    setVehPlate('');
    setVehColor('');
  };

  return (
    <div className="space-y-6" id="crm-tab-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight md:text-2xl">Client Relationship Manager (CRM)</h1>
          <p className="text-xs text-slate-500">Track client lifespans, vehicle details, detailing records, and communication logs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus size={16} />
          Register New Client
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="crm-layout-container">
        {/* Left Side: Client Directory Search & List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Directory list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-2 text-slate-300" />
                <span className="text-xs font-semibold">No clients registered</span>
              </div>
            ) : (
              filteredCustomers.map(client => {
                const isSelected = client.id === selectedCustomerId;
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedCustomerId(client.id)}
                    className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/30 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{client.name}</h4>
                      <p className="text-3xs text-slate-500 font-mono">{client.phone}</p>
                      {client.vehicles[0] && (
                        <span className="text-3xs text-indigo-600 font-semibold block truncate">
                          {client.vehicles[0].year} {client.vehicles[0].make} {client.vehicles[0].model}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-950 block font-mono">${client.lifetimeSpend}</span>
                      <span className="text-3xs text-slate-400">{client.totalJobs} jobs</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Profile Inspector */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs h-[650px] overflow-hidden flex flex-col">
          {selectedCustomer ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Profile Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-900 text-white shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center font-extrabold text-white text-lg shadow-inner">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold">{selectedCustomer.name}</h2>
                      <span className="text-3xs text-slate-400 block font-mono">Member since {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-center bg-slate-800 p-2.5 rounded-xl border border-slate-700 min-w-[90px]">
                      <span className="text-3xs text-slate-400 font-bold uppercase block tracking-wider">Total spend</span>
                      <span className="text-base font-extrabold text-white font-mono">${selectedCustomer.lifetimeSpend}</span>
                    </div>
                    <div className="text-center bg-slate-800 p-2.5 rounded-xl border border-slate-700 min-w-[90px]">
                      <span className="text-3xs text-slate-400 font-bold uppercase block tracking-wider">Total visits</span>
                      <span className="text-base font-extrabold text-white font-mono">{selectedCustomer.totalJobs}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Tabs Scroll area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Contact information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex items-center gap-3">
                    <Phone className="text-slate-400 shrink-0" size={16} />
                    <div className="min-w-0">
                      <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Phone</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block font-mono">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex items-center gap-3">
                    <Mail className="text-slate-400 shrink-0" size={16} />
                    <div className="min-w-0">
                      <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Email</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block">{selectedCustomer.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex items-center gap-3">
                    <MapPin className="text-slate-400 shrink-0" size={16} />
                    <div className="min-w-0">
                      <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Address</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block">{selectedCustomer.address || 'No address logged'}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicles Owned */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Car size={16} className="text-slate-400" />
                    Vehicles Registered
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCustomer.vehicles.map((veh, idx) => (
                      <div key={idx} className="border border-slate-150 p-4 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-slate-900 block">
                            {veh.year} {veh.make} {veh.model}
                          </span>
                          <div className="flex gap-2">
                            {veh.color && (
                              <span className="text-3xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                Color: {veh.color}
                              </span>
                            )}
                            <span className="text-3xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium uppercase">
                              Size: {veh.size.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md border border-slate-800 tracking-wide">
                          {veh.licensePlate || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailing History list */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText size={16} className="text-slate-400" />
                    Detailing Services History
                  </span>

                  {customerHistory.length === 0 ? (
                    <div className="border border-dashed border-slate-200 p-6 rounded-xl text-center text-slate-400">
                      <p className="text-xs">No service appointments recorded previously</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {customerHistory.map(hist => (
                        <div key={hist.id} className="border border-slate-100 p-3 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-indigo-600 block">{hist.serviceName}</span>
                            <span className="text-3xs text-slate-400 block font-mono">{hist.date} at {hist.time}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-extrabold text-slate-950 block">${hist.price}</span>
                            <span className={`text-3xs uppercase tracking-wide font-semibold ${
                              hist.status === 'completed' ? 'text-emerald-600' : 'text-slate-500'
                            }`}>{hist.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Profile Notes */}
                {selectedCustomer.notes && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block">Client Specific Instructions</span>
                    <div className="p-4 bg-amber-50/40 border border-amber-100 text-amber-900 text-xs rounded-xl italic">
                      "{selectedCustomer.notes}"
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <User size={48} className="text-slate-200 mb-2" />
              <p className="text-sm font-semibold text-slate-500">No client selected</p>
              <p className="text-xs text-slate-400 mt-1">Select a customer from the directory to review details, history, and notes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="add-customer-modal">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-cyan-400" />
                <h2 className="text-base font-bold">Register New CRM Profile</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-6">
              
              {/* Contact Fields */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Customer Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Full Name"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                  />
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Mobile Number"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                  />
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="Email Address"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 sm:col-span-2"
                  />
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="Service / Billing Address"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 sm:col-span-2"
                  />
                </div>
              </div>

              {/* Primary Vehicle specifications */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Primary Vehicle Specifications</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1">Vehicle Size</label>
                    <select
                      value={vehSize}
                      onChange={(e) => setVehSize(e.target.value as any)}
                      className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2 bg-white"
                    >
                      <option value="sedan">Sedan / Coupe</option>
                      <option value="suv">Mid-Size SUV / CUV</option>
                      <option value="truck_large">Truck / Large SUV</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1">Make</label>
                    <input
                      type="text"
                      required
                      value={vehMake}
                      onChange={(e) => setVehMake(e.target.value)}
                      placeholder="e.g. Tesla"
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1">Model</label>
                    <input
                      type="text"
                      required
                      value={vehModel}
                      onChange={(e) => setVehModel(e.target.value)}
                      placeholder="e.g. Model Y"
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1">License Plate</label>
                    <input
                      type="text"
                      value={vehPlate}
                      onChange={(e) => setVehPlate(e.target.value)}
                      placeholder="License Plate"
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Client Notes */}
              <div>
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Client Specific Instructions</label>
                <textarea
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="e.g. Prefers matte finish on interior plastics, no gloss. Extremely meticulous on chrome rims."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white h-20"
                />
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all cursor-pointer"
                >
                  Register Client
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
