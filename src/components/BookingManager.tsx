/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Play,
  Check,
  X,
  FileText,
  Clock,
  Car,
  User,
  Mail,
  Edit2,
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { Appointment, Customer, ServicePackage, Staff } from '../types/crm';

interface BookingsManagerProps {
  appointments: Appointment[];
  customers: Customer[];
  services: ServicePackage[];
  staff: Staff[];
  onAddAppointment: (apt: Appointment) => void;
  onUpdateAppointment: (updated: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onNavigate: (tab: string) => void;
  autoOpenNewBooking?: boolean;
  onClearAutoOpenNewBooking?: () => void;
}

export default function BookingsManager({
  appointments,
  customers,
  services,
  staff,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onNavigate,
  autoOpenNewBooking = false,
  onClearAutoOpenNewBooking
}: BookingsManagerProps) {
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTimesModal, setShowTimesModal] = useState(false);

  // Selected Booking (for the detail sidebar panel on the right)
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);

  // Form State for Booking Creation
  const [custType, setCustType] = useState<'existing' | 'new'>('existing');
  const [selectedCustId, setSelectedCustId] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  
  const [vehSize, setVehSize] = useState<'sedan' | 'suv' | 'truck_large'>('sedan');
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  // Form State for editing customer/booking info
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editPrice, setEditPrice] = useState(0);

  // Form State for editing start/end times
  const [timesApt, setTimesApt] = useState<Appointment | null>(null);
  const [startedAtStr, setStartedAtStr] = useState('');
  const [endedAtStr, setEndedAtStr] = useState('');
  const [durationStr, setDurationStr] = useState('');

  // Trigger auto open if requested
  useEffect(() => {
    if (autoOpenNewBooking) {
      setShowNewModal(true);
      if (onClearAutoOpenNewBooking) {
        onClearAutoOpenNewBooking();
      }
    }
  }, [autoOpenNewBooking, onClearAutoOpenNewBooking]);

  // Set default selected appointment on mount or when lists change
  useEffect(() => {
    if (appointments.length > 0 && !selectedAptId) {
      setSelectedAptId(appointments[0].id);
    }
  }, [appointments, selectedAptId]);

  // Filtered Appointments
  const filteredApts = appointments.filter(apt => {
    const matchesSearch =
      apt.customerName.toLowerCase().includes(search.toLowerCase()) ||
      apt.customerPhone.includes(search) ||
      apt.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      (apt.vehicle.make && apt.vehicle.make.toLowerCase().includes(search.toLowerCase())) ||
      (apt.vehicle.model && apt.vehicle.model.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedApt = appointments.find(a => a.id === selectedAptId) || filteredApts[0] || null;

  // Handler for creating a new booking
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();

    let clientId = selectedCustId;
    let clientName = '';
    let clientPhone = '';
    let clientEmail = '';

    if (custType === 'new') {
      clientId = `cust-${Date.now()}`;
      clientName = newCustName;
      clientPhone = newCustPhone;
      clientEmail = newCustEmail;
    } else {
      const match = customers.find(c => c.id === selectedCustId);
      if (match) {
        clientName = match.name;
        clientPhone = match.phone;
        clientEmail = match.email;
      }
    }

    const matchedService = services.find(s => s.id === selectedServiceId);
    let calculatedPrice = 150;
    let serviceNameStr = 'Standard Detailing';

    if (matchedService) {
      serviceNameStr = matchedService.name;
      if (vehSize === 'sedan' && matchedService.pricing?.sedan) {
        calculatedPrice = matchedService.pricing.sedan;
      } else if (vehSize === 'suv' && matchedService.pricing?.suv) {
        calculatedPrice = matchedService.pricing.suv;
      } else if (vehSize === 'truck_large' && matchedService.pricing?.truck_large) {
        calculatedPrice = matchedService.pricing.truck_large;
      }
    }

    const vehicleObj = {
      year: '2024',
      make: vehMake || 'Not specified',
      model: vehModel || 'Not specified',
      size: vehSize,
      licensePlate: vehPlate || 'NOTAG'
    };

    // Auto-generate some started/ended times if creating as completed
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: clientId,
      customerName: clientName,
      customerPhone: clientPhone,
      customerEmail: clientEmail,
      vehicle: vehicleObj,
      serviceId: selectedServiceId,
      serviceName: serviceNameStr,
      addOns: [],
      date: bookingDate,
      time: bookingTime,
      status: 'scheduled',
      price: calculatedPrice,
      notes: bookingNotes,
      assignedTo: assignedStaffId || undefined,
      paymentStatus: 'unpaid',
      invoiceNumber: `INV-2026-0${Math.floor(Math.random() * 900) + 100}`,
      createdAt: new Date().toISOString()
    };

    onAddAppointment(newAppointment);

    // Reset fields
    setShowNewModal(false);
    setSelectedCustId('');
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setVehMake('');
    setVehModel('');
    setVehPlate('');
    setSelectedServiceId('');
    setBookingNotes('');
    setAssignedStaffId('');

    // Select the newly created booking
    setSelectedAptId(newAppointment.id);
  };

  // Open Edit Customer/Booking Info modal
  const handleOpenEdit = (apt: Appointment) => {
    setEditingApt(apt);
    setEditName(apt.customerName);
    setEditPhone(apt.customerPhone);
    setEditEmail(apt.customerEmail || '');
    setEditMake(apt.vehicle.make || '');
    setEditModel(apt.vehicle.model || '');
    setEditPlate(apt.vehicle.licensePlate || '');
    setEditPrice(apt.price);
    setShowEditModal(true);
  };

  // Save edited customer/booking info
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt) return;

    const updated: Appointment = {
      ...editingApt,
      customerName: editName,
      customerPhone: editPhone,
      customerEmail: editEmail,
      price: editPrice,
      vehicle: {
        ...editingApt.vehicle,
        make: editMake,
        model: editModel,
        licensePlate: editPlate
      }
    };

    onUpdateAppointment(updated);
    setShowEditModal(false);
    setEditingApt(null);
  };

  // Open Times editing modal
  const handleOpenTimes = (apt: Appointment) => {
    setTimesApt(apt);
    
    // Default fallback values if not set
    const defaultStart = (apt as any).startedAt || `${apt.date}, ${apt.time}:00`;
    const defaultEnd = (apt as any).endedAt || `${apt.date}, ${parseInt(apt.time.split(':')[0]) + 1}:${apt.time.split(':')[1]}:00`;
    const defaultDur = (apt as any).durationHours ? String((apt as any).durationHours) : '1.5';

    setStartedAtStr(defaultStart);
    setEndedAtStr(defaultEnd);
    setDurationStr(defaultDur);
    setShowTimesModal(true);
  };

  // Save edited times
  const handleSaveTimes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timesApt) return;

    const updated: Appointment = {
      ...timesApt,
      ...({
        startedAt: startedAtStr,
        endedAt: endedAtStr,
        durationHours: parseFloat(durationStr) || 1.5
      } as any)
    };

    onUpdateAppointment(updated);
    setShowTimesModal(false);
    setTimesApt(null);
  };

  // Quick Status change
  const handleQuickStatusChange = (apt: Appointment, newStatus: any) => {
    const updated: Appointment = {
      ...apt,
      status: newStatus
    };

    // Set auto Started/Ended times when changed to in_progress or completed
    if (newStatus === 'in_progress' && !(apt as any).startedAt) {
      const nowStr = new Date().toLocaleString('en-GB', { hour12: false }).replace(/\//g, '/');
      (updated as any).startedAt = nowStr;
    } else if (newStatus === 'completed') {
      if (!(apt as any).startedAt) {
        (updated as any).startedAt = new Date(Date.now() - 3600000 * 1.5).toLocaleString('en-GB', { hour12: false }).replace(/\//g, '/');
      }
      if (!(apt as any).endedAt) {
        (updated as any).endedAt = new Date().toLocaleString('en-GB', { hour12: false }).replace(/\//g, '/');
      }
      if (!(apt as any).durationHours) {
        (updated as any).durationHours = 1.5;
      }
    }

    onUpdateAppointment(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="bookings-management-panel">
      
      {/* Header section matches screen layout perfectly */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            &larr; Back
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Bookings</h1>
            <p className="text-xs text-slate-400">View and update vehicle detailing service status</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Analytics shortcut */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-slate-800/80 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <TrendingUp size={14} className="text-cyan-400" />
            <span>Analytics</span>
          </button>

          {/* New Booking Button */}
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Filters row with Search and Dropdown Statuses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-xs">
        <div className="relative md:col-span-2">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, vehicle, or service..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-700/50 bg-slate-950 text-white focus:bg-slate-900 focus:outline-hidden"
          />
        </div>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-3 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2.5 rounded-lg border border-slate-700/50 bg-slate-950 text-white focus:bg-slate-900 focus:outline-hidden appearance-none cursor-pointer font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="quality_check">Quality Check</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Grid of lists & details */}
      {filteredApts.length === 0 ? (
        <div className="h-64 bg-[#131D35] border border-slate-800/40 rounded-xl flex flex-col items-center justify-center text-center p-6">
          <Calendar className="text-slate-600 mb-2" size={40} />
          <p className="text-sm font-semibold text-slate-400">No bookings match search or filters</p>
          <p className="text-xs text-slate-500 mt-1">Book a new appointment to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Area: 2 Columns of Cards on big screens */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApts.map((apt) => {
              const isSelected = selectedAptId === apt.id;
              return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAptId(apt.id)}
                  className={`bg-[#131D35] p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-emerald-500 shadow-lg scale-[1.01]'
                      : 'border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/20'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Customer Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-white truncate max-w-[120px]">{apt.customerName}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(apt);
                          }}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        apt.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                          : apt.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                          : apt.status === 'in_progress'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/15'
                      }`}>
                        {apt.status === 'in_progress' ? 'IN PROGRESS' : apt.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Service Subtitle */}
                    <p className="text-xs font-bold text-slate-300 block">{apt.serviceName}</p>

                    {/* Customer Info rows */}
                    <div className="space-y-1.5 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-slate-500 shrink-0" />
                        <span>{apt.customerPhone}</span>
                      </div>
                      {apt.customerEmail && (
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-slate-500 shrink-0" />
                          <span className="truncate">{apt.customerEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Car size={13} className="text-slate-500 shrink-0" />
                        <span className="capitalize">{apt.vehicle.size === 'truck_large' ? 'Truck / Large SUV' : apt.vehicle.size === 'suv' ? 'Mid-Size SUV' : apt.vehicle.make || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <Clock size={13} className="text-slate-500 shrink-0" />
                        <span>{apt.date}, {apt.time}</span>
                      </div>
                    </div>

                    {/* Price and Details */}
                    <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-extrabold text-white font-mono">₹{apt.price}</span>
                        {apt.paymentStatus === 'unpaid' ? (
                          <span className="text-[9px] text-slate-500 font-medium">unpaid</span>
                        ) : (
                          <span className="text-[9px] text-emerald-500 font-medium font-semibold">({apt.paymentStatus})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Update Status Buttons & Action Buttons inside card */}
                  <div className="mt-4 pt-3 border-t border-slate-800/40 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Update Status</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickStatusChange(apt, 'in_progress');
                          }}
                          className={`py-1 rounded text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            apt.status === 'in_progress'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <Play size={10} />
                          <span>In Progress</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickStatusChange(apt, 'completed');
                          }}
                          className={`py-1 rounded text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            apt.status === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <Check size={10} />
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickStatusChange(apt, 'cancelled');
                          }}
                          className={`py-1 rounded text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            apt.status === 'cancelled'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <X size={10} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAptId(apt.id);
                        }}
                        className="flex-1 py-1.5 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('billing');
                        }}
                        className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white text-[10px] font-semibold rounded border border-slate-800 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <FileText size={10} />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Right Side Panel: Detail Sidebar for Selected card */}
          {selectedApt && (
            <div className="bg-[#131D35] p-5 rounded-xl border-2 border-emerald-500 shadow-xl flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Panel Header */}
                <div className="flex justify-between items-start border-b border-slate-800/40 pb-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-extrabold text-white">{selectedApt.customerName}</h2>
                      <button
                        onClick={() => handleOpenEdit(selectedApt)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-300 mt-1">{selectedApt.serviceName}</p>
                  </div>

                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    selectedApt.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                      : selectedApt.status === 'cancelled'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                  }`}>
                    {selectedApt.status === 'in_progress' ? 'IN PROGRESS' : selectedApt.status.toUpperCase()}
                  </span>
                </div>

                {/* Timeline Box with Green card styling from screenshot */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-3.5">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300 font-semibold">
                        <Clock size={13} className="text-emerald-400 shrink-0" />
                        <span>Started:</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">{(selectedApt as any).startedAt || `${selectedApt.date}, ${selectedApt.time}:00`}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300 font-semibold">
                        <Clock size={13} className="text-emerald-400 shrink-0" />
                        <span>Ended:</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">{(selectedApt as any).endedAt || `${selectedApt.date}, ${parseInt(selectedApt.time.split(':')[0]) + 1}:${selectedApt.time.split(':')[1]}:00`}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-emerald-500/15 pt-2">
                      <div className="flex items-center gap-2 text-slate-300 font-semibold">
                        <Clock size={13} className="text-emerald-400 shrink-0" />
                        <span>Duration:</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">{(selectedApt as any).durationHours || '1.5'} hours</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenTimes(selectedApt)}
                    className="w-full py-1.5 bg-transparent hover:bg-emerald-500/10 text-white hover:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Edit Times</span>
                  </button>
                </div>

                {/* Patient Information details from image */}
                <div className="space-y-4">
                  <h4 className="text-3xs text-slate-500 font-bold uppercase tracking-wider">Customer Details</h4>
                  
                  <div className="space-y-2 text-xs font-medium text-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded bg-slate-950 flex items-center justify-center text-slate-500">
                        <User size={14} />
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mobile</span>
                        <span>{selectedApt.customerPhone}</span>
                      </div>
                    </div>

                    {selectedApt.customerEmail && (
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded bg-slate-950 flex items-center justify-center text-slate-500">
                          <Mail size={14} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-slate-400 block text-[10px]">Email</span>
                          <span className="truncate block">{selectedApt.customerEmail}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded bg-slate-950 flex items-center justify-center text-slate-500">
                        <Car size={14} />
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Vehicle Specification</span>
                        <span className="capitalize">{selectedApt.vehicle.year} {selectedApt.vehicle.make} {selectedApt.vehicle.model} ({selectedApt.vehicle.licensePlate})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <div className="h-7 w-7 rounded bg-slate-950 flex items-center justify-center text-slate-500">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans">Date & Appointment Slot</span>
                        <span>{selectedApt.date} @ {selectedApt.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded bg-slate-950 flex items-center justify-center text-slate-500 font-bold">
                        ₹
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Price Details</span>
                        <span className="font-mono font-bold">₹{selectedApt.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom status trigger panels */}
              <div className="mt-8 pt-4 border-t border-slate-800/40 space-y-3">
                <span className="text-3xs text-slate-500 font-bold uppercase tracking-wider block">Update Status</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickStatusChange(selectedApt, 'in_progress')}
                    className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      selectedApt.status === 'in_progress'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Play size={12} />
                    <span>In Progress</span>
                  </button>
                  <button
                    onClick={() => handleQuickStatusChange(selectedApt, 'completed')}
                    className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      selectedApt.status === 'completed'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Check size={12} />
                    <span>Complete</span>
                  </button>
                  <button
                    onClick={() => handleQuickStatusChange(selectedApt, 'cancelled')}
                    className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      selectedApt.status === 'cancelled'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <X size={12} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Book Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="appointment-modal">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-cyan-400" />
                <h2 className="text-base font-bold">Schedule New Detailing Session</h2>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateBooking} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Customer selection toggle */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Customer Association</span>
                <div className="flex gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCustType('existing')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      custType === 'existing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Select Existing Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustType('new')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white text-slate-800"
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
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-indigo-600"
                    />
                    <input
                      type="tel"
                      required={custType === 'new'}
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="Mobile Number"
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-indigo-600"
                    />
                    <input
                      type="email"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      placeholder="Email (Optional)"
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-indigo-600"
                    />
                  </div>
                )}
              </div>

              {/* Vehicle Specifications */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Vehicle Specifications</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1 font-semibold">Vehicle Size</label>
                    <select
                      value={vehSize}
                      onChange={(e) => setVehSize(e.target.value as any)}
                      className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2 bg-white text-slate-800"
                    >
                      <option value="sedan">Sedan / Coupe</option>
                      <option value="suv">Mid-Size SUV / CUV</option>
                      <option value="truck_large">Truck / Large SUV</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1 font-semibold">Make</label>
                    <input
                      type="text"
                      required
                      value={vehMake}
                      onChange={(e) => setVehMake(e.target.value)}
                      placeholder="e.g. Tesla"
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full text-slate-800 focus:outline-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1 font-semibold">Model</label>
                    <input
                      type="text"
                      required
                      value={vehModel}
                      onChange={(e) => setVehModel(e.target.value)}
                      placeholder="e.g. Model S"
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full text-slate-800 focus:outline-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1 font-semibold">License Plate</label>
                    <input
                      type="text"
                      value={vehPlate}
                      onChange={(e) => setVehPlate(e.target.value)}
                      placeholder="e.g. CA-XYZ"
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full font-mono text-slate-800 focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Services & Core Packages */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Select Treatment Package</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services
                    .filter(s => s.category !== 'add_on')
                    .map(pkg => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedServiceId(pkg.id)}
                        className={`border rounded-xl p-3 cursor-pointer transition-all ${
                          selectedServiceId === pkg.id
                            ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <strong className="text-xs font-bold text-slate-900 block">{pkg.name}</strong>
                          <span className="text-xs font-extrabold text-indigo-600 font-mono shrink-0">
                            ₹{vehSize === 'sedan' ? pkg.pricing.sedan : vehSize === 'suv' ? pkg.pricing.suv : pkg.pricing.truck_large}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Slot Scheduling Details */}
              <div className="space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Scheduling Specifications</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1 font-semibold">Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1 font-semibold">Start Time</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="text-xs p-2 border border-slate-200 rounded-lg w-full text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-500 block mb-1 font-semibold">Assign Staff</label>
                    <select
                      value={assignedStaffId}
                      onChange={(e) => setAssignedStaffId(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2 bg-white text-slate-800"
                    >
                      <option value="">Auto-Assign (FIFO)</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Comments */}
              <div className="space-y-1.5">
                <label className="text-3xs text-slate-500 block font-semibold">Detailer Briefing Notes</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Scratches on front hood, leather conditioner requested..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-indigo-600 h-20"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-500 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={custType === 'existing' ? !selectedCustId || !selectedServiceId : !newCustName || !newCustPhone || !selectedServiceId}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Create Appointment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Info Modal */}
      {showEditModal && editingApt && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 bg-slate-900 text-white border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Booking Info</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    value={editMake}
                    onChange={(e) => setEditMake(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">License Plate</label>
                  <input
                    type="text"
                    value={editPlate}
                    onChange={(e) => setEditPlate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 hover:bg-slate-50 text-slate-500 text-xs font-semibold rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Times Modal */}
      {showTimesModal && timesApt && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 bg-slate-900 text-white border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Service Timeline</h3>
              <button onClick={() => setShowTimesModal(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveTimes} className="p-5 space-y-4">
              <div>
                <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Started Time</label>
                <input
                  type="text"
                  required
                  value={startedAtStr}
                  onChange={(e) => setStartedAtStr(e.target.value)}
                  placeholder="DD/MM/YYYY, HH:MM:SS"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Ended Time</label>
                <input
                  type="text"
                  required
                  value={endedAtStr}
                  onChange={(e) => setEndedAtStr(e.target.value)}
                  placeholder="DD/MM/YYYY, HH:MM:SS"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Duration (Hours)</label>
                <input
                  type="text"
                  required
                  value={durationStr}
                  onChange={(e) => setDurationStr(e.target.value)}
                  placeholder="e.g. 1.65"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowTimesModal(false)} className="px-4 py-2 hover:bg-slate-50 text-slate-500 text-xs font-semibold rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer">Save Times</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
