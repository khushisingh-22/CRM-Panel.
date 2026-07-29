/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  ChevronRight,
  Clock,
  Car,
  User,
  Check,
  X,
  CreditCard,
  FileText
} from 'lucide-react';
import { Appointment, Customer, ServicePackage, Staff } from '../types/crm';

interface AppointmentsListProps {
  appointments: Appointment[];
  customers: Customer[];
  services: ServicePackage[];
  staff: Staff[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
}

export default function AppointmentsList({
  appointments,
  customers,
  services,
  staff,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment
}: AppointmentsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // New Appointment Form State
  const [custType, setCustType] = useState<'existing' | 'new'>('existing');
  const [selectedCustId, setSelectedCustId] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const [vehYear, setVehYear] = useState('2022');
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehSize, setVehSize] = useState<'sedan' | 'suv' | 'truck_large'>('sedan');
  const [vehColor, setVehColor] = useState('');
  const [vehPlate, setVehPlate] = useState('');

  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  // Filtering
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch =
      apt.customerName.toLowerCase().includes(search.toLowerCase()) ||
      apt.vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
      apt.vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
      apt.invoiceNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate price dynamically for form
  const getSelectedServicePrice = () => {
    const pkg = services.find(s => s.id === selectedServiceId);
    if (!pkg) return 0;
    return pkg.pricing[vehSize];
  };

  const getAddOnsTotal = () => {
    let sum = 0;
    selectedAddOnIds.forEach(id => {
      const addon = services.find(s => s.id === id);
      if (addon) {
        sum += addon.pricing[vehSize];
      }
    });
    return sum;
  };

  const calculateTotalPrice = () => {
    return getSelectedServicePrice() + getAddOnsTotal();
  };

  const handleToggleAddOn = (addonId: string) => {
    if (selectedAddOnIds.includes(addonId)) {
      setSelectedAddOnIds(selectedAddOnIds.filter(id => id !== addonId));
    } else {
      setSelectedAddOnIds([...selectedAddOnIds, addonId]);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    let customerId = selectedCustId;
    let customerName = '';
    let customerPhone = '';
    let customerEmail = '';

    if (custType === 'new') {
      customerId = `cust-${Date.now()}`;
      customerName = newCustName;
      customerPhone = newCustPhone;
      customerEmail = newCustEmail;
    } else {
      const existing = customers.find(c => c.id === selectedCustId);
      if (existing) {
        customerName = existing.name;
        customerPhone = existing.phone;
        customerEmail = existing.email;
      } else {
        alert('Please select an existing customer or choose "New Customer".');
        return;
      }
    }

    const selectedService = services.find(s => s.id === selectedServiceId);
    const addons = selectedAddOnIds.map(id => {
      const item = services.find(s => s.id === id);
      return { id: item!.id, name: item!.name, price: item!.pricing[vehSize] };
    });

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      vehicle: {
        year: vehYear,
        make: vehMake,
        model: vehModel,
        size: vehSize,
        color: vehColor,
        licensePlate: vehPlate
      },
      serviceId: selectedServiceId,
      serviceName: selectedService ? selectedService.name : 'Custom Service',
      addOns: addons,
      date: bookingDate,
      time: bookingTime,
      status: 'scheduled',
      price: calculateTotalPrice(),
      notes: bookingNotes,
      assignedTo: assignedStaffId || undefined,
      paymentStatus: 'unpaid',
      invoiceNumber: `INV-2026-0${Math.floor(Math.random() * 900) + 100}`,
      createdAt: new Date().toISOString()
    };

    onAddAppointment(newApt);
    setShowModal(false);

    // Reset Form fields
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setVehMake('');
    setVehModel('');
    setVehPlate('');
    setSelectedAddOnIds([]);
    setBookingNotes('');
  };

  return (
    <div className="space-y-6" id="appointments-tab-root">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight md:text-2xl">Scheduling & Bookings</h1>
          <p className="text-xs text-slate-500">Manage customer detailing appointments, dates, and technicians</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus size={16} />
          Schedule Detailing Job
        </button>
      </div>

      {/* Filtering Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div className="w-full md:w-80 relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, plate, make..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          {['all', 'scheduled', 'in_progress', 'quality_check', 'ready', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-3xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List Display */}
      {filteredAppointments.length === 0 ? (
        <div className="h-64 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center p-6">
          <CalendarIcon className="text-slate-300 mb-2" size={40} />
          <p className="text-sm font-semibold text-slate-500">No scheduled appointments match filters</p>
          <p className="text-xs text-slate-400 mt-1">Book a detailing appointment or modify your search filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-3xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Customer & Car</th>
                  <th className="p-4">Service Details</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Price / Billing</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments
                  .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
                  .map((apt) => {
                    const tech = staff.find(s => s.id === apt.assignedTo);
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-900 block">{apt.customerName}</span>
                            <span className="text-3xs text-slate-500 block">{apt.customerPhone}</span>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                              <Car size={13} className="text-slate-400" />
                              <span>{apt.vehicle.year} {apt.vehicle.make} {apt.vehicle.model}</span>
                              <span className="text-3xs bg-slate-100 text-slate-500 px-1 rounded-sm font-mono">{apt.vehicle.licensePlate}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-600 block">{apt.serviceName}</span>
                            {apt.addOns.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {apt.addOns.map(addon => (
                                  <span key={addon.id} className="text-3xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-sm font-medium">
                                    + {addon.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 block font-mono">{apt.date}</span>
                            <span className="text-3xs text-slate-400 block font-semibold uppercase">{apt.time}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200/50 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                            <User size={12} className="text-slate-400" />
                            {tech ? tech.name : 'Not Assigned'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`text-3xs font-extrabold uppercase tracking-wide px-2 py-1 rounded-full ${
                            apt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            apt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                            apt.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                            apt.status === 'quality_check' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {apt.status}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="text-sm font-extrabold text-slate-900 block font-mono">${apt.price}</span>
                            <span className={`text-3xs font-bold px-1.5 py-0.5 rounded ${
                              apt.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {apt.paymentStatus}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                              <button
                                onClick={() => onUpdateAppointment({ ...apt, status: 'cancelled' })}
                                title="Cancel booking"
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this scheduled block?')) {
                                  onDeleteAppointment(apt.id);
                                }
                              }}
                              title="Delete permanently"
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="appointment-modal">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-cyan-400" />
                <h2 className="text-base font-bold">Schedule New Detailing Session</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBookAppointment} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Customer selection toggle */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Customer Association</span>
                <div className="flex gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCustType('existing')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      custType === 'existing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Select Existing Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustType('new')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      custType === 'new' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create New Client
                  </button>
                </div>

                {custType === 'existing' ? (
                  <select
                    value={selectedCustId}
                    onChange={(e) => setSelectedCustId(e.target.value)}
                    required={custType === 'existing'}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white"
                  >
                    <option value="">Choose existing client...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required={custType === 'new'}
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="Client Full Name"
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                    />
                    <input
                      type="tel"
                      required={custType === 'new'}
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="Mobile Number"
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                    />
                    <input
                      type="email"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      placeholder="Email (Optional)"
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                    />
                  </div>
                )}
              </div>

              {/* Vehicle Specifications */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Vehicle Specifications</span>
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
                      placeholder="e.g. Model S"
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1">License Plate</label>
                    <input
                      type="text"
                      value={vehPlate}
                      onChange={(e) => setVehPlate(e.target.value)}
                      placeholder="e.g. CA-XYZ"
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Services & Core Packages */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Select Core Treatment Package</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services
                    .filter(s => s.category !== 'add_on')
                    .map(pkg => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedServiceId(pkg.id)}
                        className={`border rounded-xl p-3 cursor-pointer transition-all ${
                          selectedServiceId === pkg.id
                            ? 'border-indigo-600 bg-indigo-50/10 shadow-xs'
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/20'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <strong className="text-xs font-bold text-slate-900 block">{pkg.name}</strong>
                          <span className="text-xs font-extrabold text-indigo-600 font-mono shrink-0">
                            ${pkg.pricing[vehSize]}
                          </span>
                        </div>
                        <p className="text-3xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{pkg.description}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Add-ons List */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Choose Premium Add-ons</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {services
                    .filter(s => s.category === 'add_on')
                    .map(addon => {
                      const active = selectedAddOnIds.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => handleToggleAddOn(addon.id)}
                          className={`border p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                            active
                              ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900 font-semibold'
                              : 'border-slate-100 hover:border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-xs truncate">{addon.name}</span>
                          <span className="text-xs font-extrabold text-slate-900 font-mono shrink-0">
                            +${addon.pricing[vehSize]}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Scheduling Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Time Slot</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Assign Tech</label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2 bg-white"
                  >
                    <option value="">Not assigned</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Studio Work Notes</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Matte paint! No polish. Customer is very detail-oriented."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white h-20"
                />
              </div>

              {/* Subtotal Footer */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between shrink-0">
                <div className="space-y-0.5">
                  <span className="text-3xs text-slate-500 font-bold uppercase tracking-wider block">Estimated Quote</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">${calculateTotalPrice()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all cursor-pointer"
                  >
                    Schedule Job
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
