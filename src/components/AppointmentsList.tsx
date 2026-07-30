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

  // Calendar states
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 6 is July (0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState('2026-07-09');

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const prevDaysInMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const gridCells = [];

  // Previous month padding days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevDaysInMonth - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    gridCells.push({
      dayNum,
      isCurrentMonth: false,
      dateStr
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    gridCells.push({
      dayNum: i,
      isCurrentMonth: true,
      dateStr
    });
  }

  // Next month padding days
  const remaining = 42 - gridCells.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    gridCells.push({
      dayNum: i,
      isCurrentMonth: false,
      dateStr
    });
  }

  const selectedDayBookings = appointments.filter(apt => apt.date === selectedDateStr);

  const formatSelectedDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  // Synchronize bookingDate form field with selectedDateStr
  React.useEffect(() => {
    setBookingDate(selectedDateStr);
  }, [selectedDateStr]);

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
    <div className="space-y-6 animate-fade-in" id="appointments-tab-root">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Calendar</h1>
          <p className="text-xs text-slate-400">Manage customer detailing appointments and schedules</p>
        </div>
        
        {/* New Booking button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 animate-fade-in" id="ai-calendar-view-panel">
        {/* Calendar page structure */}
        <div className="flex flex-col xl:flex-row gap-6">
            
            {/* Left Card: Calendar Month Grid (approx 2/3 width) */}
            <div className="bg-[#131D35] p-5 rounded-xl border border-slate-800/40 shadow-xs flex-1">
              
              {/* Calendar Controls header inside the card */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-extrabold text-white font-mono">{monthNames[currentMonth]} {currentYear}</h2>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-all"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-all"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day names row */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <span key={day} className="text-4xs text-slate-400 font-extrabold uppercase tracking-wider py-1.5">
                    {day}
                  </span>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {gridCells.map((cell, idx) => {
                  const dayBookings = appointments.filter(apt => apt.date === cell.dateStr);
                  const isSelected = selectedDateStr === cell.dateStr;
                  const isTodayStr = new Date().toISOString().split('T')[0] === cell.dateStr;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`h-24 p-2 rounded-xl flex flex-col justify-between items-start border cursor-pointer relative transition-all ${
                        isSelected
                          ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white shadow-lg shadow-sky-500/10'
                          : cell.isCurrentMonth
                            ? 'bg-[#18223c] border-slate-800/40 text-slate-200 hover:bg-slate-800/60 hover:border-slate-700'
                            : 'bg-[#111827]/60 border-slate-900/60 text-slate-650 hover:bg-slate-800/20'
                      }`}
                    >
                      <span className={`text-xs font-bold ${
                        isSelected 
                          ? 'text-white' 
                          : isTodayStr 
                            ? 'text-sky-400 font-extrabold bg-sky-500/10 px-1.5 py-0.5 rounded-md border border-sky-500/20' 
                            : cell.isCurrentMonth 
                              ? 'text-slate-200' 
                              : 'text-slate-600'
                      }`}>
                        {cell.dayNum}
                      </span>

                      {/* Render indicators of appointments in the cell */}
                      {dayBookings.length > 0 && (
                        <div className="w-full space-y-1">
                          {dayBookings.slice(0, 2).map(apt => (
                            <div
                              key={apt.id}
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md truncate text-left w-full ${
                                isSelected
                                  ? 'bg-slate-900/35 text-white border border-white/10'
                                  : 'bg-indigo-550/15 text-indigo-300 border border-indigo-500/15'
                              }`}
                              title={`${apt.customerName} (${apt.time})`}
                            >
                              {apt.customerName}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className={`text-[8px] font-black text-right pr-1 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                              + {dayBookings.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Day Bookings Detail Panel (approx 1/3 width) */}
            <div className="bg-[#131D35] p-5 rounded-xl border border-slate-800/40 shadow-xs w-full xl:w-80 shrink-0 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono">{formatSelectedDate(selectedDateStr)}</h3>
                <p className="text-[10px] text-slate-400">Detailed agenda & technician assignments</p>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
                {selectedDayBookings.length === 0 ? (
                  <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center">
                    <CalendarIcon className="text-slate-700 mb-2" size={32} />
                    <p className="text-xs font-semibold">No bookings for this day</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Use the + New Booking button to schedule a client.</p>
                  </div>
                ) : (
                  selectedDayBookings.map(apt => {
                    const tech = staff.find(s => s.id === apt.assignedTo);
                    return (
                      <div key={apt.id} className="bg-[#18223c] p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-left relative group">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase font-mono tracking-wider">{apt.time}</span>
                            <h4 className="text-xs font-extrabold text-white mt-1.5 leading-tight">{apt.customerName}</h4>
                            <p className="text-4xs text-slate-400 font-mono mt-0.5">{apt.customerPhone}</p>
                          </div>
                          <span className="text-xs font-mono font-black text-emerald-400">₹{apt.price}</span>
                        </div>
                        
                        <div className="text-[10px] text-slate-300 flex items-center gap-1.5 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                          <Car size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{apt.vehicle.year} {apt.vehicle.make} {apt.vehicle.model}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/40 text-3xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-indigo-400 font-bold">{apt.serviceName}</span>
                            {tech && <span className="text-slate-500">Tech: {tech.name}</span>}
                          </div>
                          <span className={`px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide text-[8px] ${
                            apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            apt.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}>
                            {apt.status}
                          </span>
                        </div>

                        {/* Quick complete / update buttons directly from the card */}
                        <div className="flex gap-1.5 justify-end pt-1">
                          {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => onUpdateAppointment({ ...apt, status: 'completed', paymentStatus: 'paid' })}
                              className="px-2 py-1 bg-emerald-650 hover:bg-emerald-550 text-white font-extrabold text-[8px] rounded-md transition-all cursor-pointer flex items-center gap-0.5"
                            >
                              <Check size={8} /> Complete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const confirm = window.confirm("Are you sure you want to cancel this booking?");
                              if (confirm) {
                                onUpdateAppointment({ ...apt, status: 'cancelled' });
                              }
                            }}
                            className="px-2 py-1 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-slate-400 hover:text-rose-400 font-bold text-[8px] rounded-md transition-all cursor-pointer"
                          >
                            Cancel
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
