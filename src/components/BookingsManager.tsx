/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Minus,
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
  ChevronDown,
  Trash2,
  Upload,
  MessageSquare,
  Send,
  ExternalLink
} from 'lucide-react';
import { Appointment, Customer, ServicePackage, Staff, ShopSettings } from '../types/crm';
import { sendWhatsAppMessage } from '../utils/whatsapp';

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
  settings: ShopSettings;
  ownerUid?: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    if (isNaN(hours)) return timeStr;
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

const getFormattedMessage = (
  aptOrName: Appointment | string,
  date?: string,
  time?: string,
  phone?: string,
  ownerUid?: string
) => {
  let customerName = '';
  let bookingDate = '';
  let bookingTime = '';
  let invoiceNo = 'N/A';
  let vehicleInfo = 'N/A';
  let serviceName = 'N/A';
  let totalAmount = '0';
  let payStatus = 'Unpaid';

  if (typeof aptOrName === 'object' && aptOrName !== null) {
    const apt = aptOrName as Appointment;
    customerName = apt.customerName;
    bookingDate = apt.date;
    bookingTime = apt.time;
    invoiceNo = apt.invoiceNumber || 'N/A';
    vehicleInfo = `${apt.vehicle.year || ''} ${apt.vehicle.make || ''} ${apt.vehicle.model || ''}`.trim() || 'N/A';
    serviceName = apt.serviceName;
    totalAmount = `₹${apt.price}`;
    
    if (apt.paymentStatus === 'paid') {
      payStatus = 'Paid (नकद / ऑनलाइन प्राप्त)';
    } else if (apt.paymentStatus === 'partially_paid') {
      payStatus = `Partially Paid (₹${apt.paidAmount || 0} received)`;
    } else {
      payStatus = 'Unpaid (धोने के बाद भुगतान करें)';
    }
  } else {
    customerName = aptOrName || 'sir';
    bookingDate = date || '';
    bookingTime = time || '';
  }

  const cleanTime = formatTime(bookingTime);
  const cleanDate = formatDate(bookingDate);

  let invoiceLink = '';
  if (typeof aptOrName === 'object' && aptOrName !== null && ownerUid) {
    const apt = aptOrName as Appointment;
    invoiceLink = `\n\n📄 *VIEW & DOWNLOAD DIGITAL INVOICE* ⬇️\n${window.location.origin}/?view_invoice=${apt.id}&owner=${ownerUid}\n`;
  }

  return `Dear ${customerName}, 

Your Slot has been booked successfully! 🎉${invoiceLink}

📄 *INVOICE & BILLING DETAILS (बिल विवरण)* 📄
-----------------------------------------
*Invoice No:* ${invoiceNo}
*Date:* ${cleanDate}
*Time:* ${cleanTime}
*Vehicle:* ${vehicleInfo}
*Service:* ${serviceName}
-----------------------------------------
*Total Amount:* ${totalAmount}
*Payment Status:* ${payStatus}
-----------------------------------------

Customer Support ⬇️
Mobile Num - 8510002780
Email - info.drwashit@gmail.com
Website - www.drwashit.com

Download the Dr Washit - Doorstep Car Care App Now 

For Android User ⬇️
https://play.google.com/store/apps/details?id=com.app.buntywash&pcampaignid=web_share

For Apple User⬇️
https://apps.apple.com/in/app/dr-washit/id6756914622

Let your car sparkle at your doorstep🚗💦✨ & thankyou for choosing *Dr Washit*`;
};

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
  onClearAutoOpenNewBooking,
  settings,
  ownerUid = ''
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
  const [custType, setCustType] = useState<'existing' | 'new'>('new');
  const [selectedCustId, setSelectedCustId] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  
  const [vehSize, setVehSize] = useState<'sedan' | 'suv' | 'truck_large'>('sedan');
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  // Monthly Package fields for new booking
  const [isMonthlyPkg, setIsMonthlyPkg] = useState(false);
  const [monthlyPkgName, setMonthlyPkgName] = useState('Silver Weekly Maintenance Wash');
  const [monthlyPkgWashNum, setMonthlyPkgWashNum] = useState(1);
  const [monthlyPkgTotalWashes, setMonthlyPkgTotalWashes] = useState(4);

  // Form State for Screenshot 1 Booking Creation
  const [priceInput, setPriceInput] = useState<number>(0);
  const [paidAmountInput, setPaidAmountInput] = useState<number>(0);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<string>('');

  // Look up existing customer dynamically based on Name or Mobile input
  const trimmedPhoneInput = newCustPhone.replace(/\D/g, '');
  const trimmedNameInput = newCustName.trim().toLowerCase();

  const matchedClient = (trimmedNameInput.length >= 3 || trimmedPhoneInput.length >= 5)
    ? customers.find(c => {
        const cPhoneNorm = c.phone ? c.phone.replace(/\D/g, '') : '';
        const cNameNorm = c.name ? c.name.trim().toLowerCase() : '';

        const phoneMatch = trimmedPhoneInput.length >= 5 && (cPhoneNorm === trimmedPhoneInput || cPhoneNorm.endsWith(trimmedPhoneInput) || trimmedPhoneInput.endsWith(cPhoneNorm));
        const nameMatch = trimmedNameInput.length >= 3 && (cNameNorm === trimmedNameInput || cNameNorm.includes(trimmedNameInput) || trimmedNameInput.includes(cNameNorm));

        return phoneMatch || nameMatch;
      })
    : null;

  // Check if current form inputs are already fully matching the found client
  const isAlreadyFilled = matchedClient &&
    newCustName.trim().toLowerCase() === matchedClient.name.trim().toLowerCase() &&
    newCustPhone.trim().replace(/\D/g, '') === (matchedClient.phone || '').trim().replace(/\D/g, '') &&
    (!matchedClient.address || newCustAddress.trim().toLowerCase() === matchedClient.address.trim().toLowerCase());

  // Check if there is an existing customer with the same phone but a different name (conflict)
  const isPhoneConflict = (() => {
    const cleanInputPhone = newCustPhone.replace(/\D/g, '');
    if (cleanInputPhone.length < 5) return null;
    return customers.find(c => {
      const cPhoneNorm = c.phone ? c.phone.replace(/\D/g, '') : '';
      if (cPhoneNorm.length < 5) return false;
      const phoneMatch = cPhoneNorm === cleanInputPhone || cPhoneNorm.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(cPhoneNorm);
      const nameMismatch = c.name.trim().toLowerCase() !== newCustName.trim().toLowerCase();
      return phoneMatch && nameMismatch;
    });
  })();

  // Simulated Client SMS notification popup state
  const [smsAlert, setSmsAlert] = useState<{
    show: boolean;
    clientName: string;
    phone: string;
    message: string;
  } | null>(null);

  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState<{ success: boolean; text: string } | null>(null);

  // Form State for editing customer/booking info
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editPaidAmount, setEditPaidAmount] = useState(0);

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

  // Handle preselected client from CRM tab
  useEffect(() => {
    const preselectedId = localStorage.getItem('preselected_client_id');
    if (preselectedId) {
      localStorage.removeItem('preselected_client_id');
      const client = customers.find(c => c.id === preselectedId);
      if (client) {
        setNewCustName(client.name);
        setNewCustPhone(client.phone || '');
        setNewCustEmail(client.email || '');
        setNewCustAddress(client.address || '');
        if (client.vehicles && client.vehicles[0]) {
          setVehMake(client.vehicles[0].make);
        }
        setShowNewModal(true);
      }
    }
  }, [customers]);

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

    let clientName = newCustName.trim();
    let clientPhone = newCustPhone.trim() || '7078408264';
    let clientEmail = newCustEmail.trim();

    // Check if the phone number is already registered under a different name
    if (isPhoneConflict) {
      alert(`⚠️ Alert: The mobile number "${clientPhone}" is already registered under the name "${isPhoneConflict.name}".\n\nYou cannot create a client/booking with the same number but a different name ("${clientName}"). Please correct the name or use the existing client.`);
      return;
    }

    let clientId = `cust-${Date.now()}`;

    // Check if there is an existing customer with this exact name
    const existingClient = customers.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    let clientAddress = newCustAddress.trim();
    if (existingClient) {
      clientId = existingClient.id;
      if (!clientPhone && existingClient.phone) clientPhone = existingClient.phone;
      if (!clientEmail && existingClient.email) clientEmail = existingClient.email;
      if (!clientAddress && existingClient.address) clientAddress = existingClient.address;
    }

    const matchedService = services.find(s => s.id === selectedServiceId);
    let serviceNameStr = isMonthlyPkg ? monthlyPkgName : (matchedService ? matchedService.name : 'Custom Detailing');

    let vehicleYear = '2024';
    let vehicleMake = vehMake;
    const parts = vehMake.split(' ');
    if (parts.length > 0 && /^\d{4}$/.test(parts[0])) {
      vehicleYear = parts[0];
      vehicleMake = parts.slice(1).join(' ');
    }

    const vehicleObj = {
      year: vehicleYear,
      make: vehicleMake || 'Not specified',
      model: '',
      size: vehSize,
      licensePlate: 'PENDING'
    };

    // Split scheduledDateTime
    const [datePart, timePart] = scheduledDateTime.split('T');

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: clientId,
      customerName: clientName,
      customerPhone: clientPhone,
      customerEmail: clientEmail,
      customerAddress: clientAddress || undefined,
      vehicle: vehicleObj,
      serviceId: isMonthlyPkg ? 'monthly-package' : selectedServiceId,
      serviceName: serviceNameStr,
      addOns: [],
      date: datePart || new Date().toISOString().split('T')[0],
      time: timePart || '09:00',
      status: 'scheduled',
      price: priceInput || (isMonthlyPkg ? 0 : 150),
      notes: bookingNotes,
      assignedTo: assignedStaffId || undefined,
      paymentStatus: isMonthlyPkg ? 'paid' : (paidAmountInput >= (priceInput || 0) ? 'paid' : paidAmountInput > 0 ? 'partially_paid' : 'unpaid'),
      paidAmount: isMonthlyPkg ? (priceInput || 0) : paidAmountInput,
      invoiceNumber: `INV-2026-0${Math.floor(Math.random() * 900) + 100}`,
      createdAt: new Date().toISOString(),
      isMonthlyPackage: isMonthlyPkg,
      packageName: isMonthlyPkg ? monthlyPkgName : undefined,
      packageWashNumber: isMonthlyPkg ? monthlyPkgWashNum : undefined,
      packageTotalWashes: isMonthlyPkg ? monthlyPkgTotalWashes : undefined
    };

    onAddAppointment(newAppointment);

    // Trigger Client WhatsApp simulated notification
    setSmsAlert({
      show: true,
      clientName: clientName,
      phone: clientPhone,
      message: getFormattedMessage(newAppointment, undefined, undefined, undefined, ownerUid)
    });

    // Reset fields
    setShowNewModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
    setVehMake('');
    setSelectedServiceId('');
    setBookingNotes('');
    setPriceInput(0);
    setPaidAmountInput(0);
    setUploadedPhotos('');
    setIsMonthlyPkg(false);
    setMonthlyPkgName('Silver Weekly Maintenance Wash');
    setMonthlyPkgWashNum(1);
    setMonthlyPkgTotalWashes(4);

    // Select the newly created booking
    setSelectedAptId(newAppointment.id);
  };

  const handleSendBackgroundWhatsApp = async (phone: string, message: string) => {
    setWhatsappSending(true);
    setWhatsappResult(null);
    const res = await sendWhatsAppMessage(settings, phone, message);
    setWhatsappSending(false);
    if (res.success) {
      setWhatsappResult({ success: true, text: 'Sent successfully from Business Number (8510002780)!' });
    } else {
      setWhatsappResult({ success: false, text: `API Failed: ${res.error || 'Gateway Error'}` });
    }
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
    setEditPaidAmount(apt.paidAmount ?? (apt.paymentStatus === 'paid' || apt.status === 'completed' ? apt.price : 0));
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
      paidAmount: editPaidAmount,
      paymentStatus: editPaidAmount >= (editPrice || 0) ? 'paid' : editPaidAmount > 0 ? 'partially_paid' : 'unpaid',
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApts.map((apt) => {
            let borderClass = "border-slate-800";
            let badgeClass = "bg-sky-500/10 text-sky-400 border border-sky-500/15";
            let glowClass = "";

            if (apt.status === 'completed') {
              borderClass = "border-emerald-500/80";
              badgeClass = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25";
              glowClass = "shadow-lg shadow-emerald-500/5";
            } else if (apt.status === 'in_progress') {
              borderClass = "border-indigo-500";
              badgeClass = "bg-indigo-550/20 text-indigo-300 border border-indigo-500/25";
              glowClass = "shadow-lg shadow-indigo-500/5";
            } else if (apt.status === 'cancelled') {
              borderClass = "border-rose-500/60";
              badgeClass = "bg-rose-500/15 text-rose-400 border border-rose-500/25";
              glowClass = "shadow-lg shadow-rose-500/5";
            }

            const tech = staff.find(s => s.id === apt.assignedTo);

            return (
              <div key={apt.id} className={`bg-[#131D35]/95 p-5 rounded-xl border ${borderClass} ${glowClass} transition-all space-y-4 text-left relative flex flex-col justify-between`}>
                <div className="space-y-4">
                  
                  {/* Header section of the Card */}
                  <div className="flex justify-between items-start border-b border-slate-800/40 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          <User size={13} className="shrink-0 text-indigo-400" />
                          <span>{apt.customerName}</span>
                        </h3>
                        <button
                          onClick={() => handleOpenEdit(apt)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Client Info"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{apt.customerPhone}</p>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Trash icon for completed/cancelled bookings */}
                      {(apt.status === 'completed' || apt.status === 'cancelled') && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this booking?')) {
                              onDeleteAppointment(apt.id);
                            }
                          }}
                          className="p-1 bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/20 transition-all border border-rose-500/20 cursor-pointer"
                          title="Delete Booking"
                        >
                          <Trash2 size={11} className="stroke-[2.5]" />
                        </button>
                      )}
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeClass}`}>
                        {apt.status === 'in_progress' ? 'IN PROGRESS' : apt.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Notes/Service description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black text-indigo-400 block">{apt.serviceName}</span>
                      {apt.isMonthlyPackage && (
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                          VIP Package
                        </span>
                      )}
                    </div>

                    {apt.isMonthlyPackage && (
                      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-900/40 space-y-2.5 animate-fade-in shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-indigo-300 uppercase tracking-wider">Wash Progress Tracker</span>
                          <span className="text-[10px] font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-950 border border-indigo-900/40">
                            {apt.packageWashNumber ?? 1} / {apt.packageTotalWashes ?? 4}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                          <div
                            className={`h-full transition-all duration-300 ${
                              (apt.packageWashNumber ?? 1) >= (apt.packageTotalWashes ?? 4)
                                ? 'bg-emerald-500'
                                : 'bg-indigo-500 animate-pulse'
                            }`}
                            style={{
                              width: `${Math.min(
                                ((((apt.packageWashNumber ?? 1) / (apt.packageTotalWashes ?? 4)) * 100)),
                                100
                              )}%`
                            }}
                          />
                        </div>
                        {/* Increment/Decrement Buttons */}
                        <div className="flex items-center justify-between gap-2 border-t border-indigo-900/25 pt-2">
                          <span className="text-[9px] text-slate-400 font-semibold">Update Wash Count:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const current = apt.packageWashNumber ?? 1;
                                if (current > 0) {
                                  onUpdateAppointment({
                                    ...apt,
                                    packageWashNumber: current - 1
                                  });
                                }
                              }}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                              title="Decrease wash number"
                            >
                              <Minus size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = apt.packageWashNumber ?? 1;
                                onUpdateAppointment({
                                  ...apt,
                                  packageWashNumber: current + 1
                                });
                              }}
                              className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                              title="Increase wash number"
                            >
                              <Plus size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Reset this wash cycle to 1?')) {
                                  onUpdateAppointment({
                                    ...apt,
                                    packageWashNumber: 1
                                  });
                                }
                              }}
                              className="text-[9px] text-indigo-400 hover:text-rose-400 transition-colors uppercase font-black pl-1 cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {apt.notes && (
                      <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/20 p-2 rounded-lg border border-slate-850 font-medium">
                        {apt.notes}
                      </p>
                    )}
                  </div>

                  {/* Timing block inside the card */}
                  <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-850/80 space-y-2 text-[10px] font-medium text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Started:</span>
                      <span className="font-mono font-bold text-slate-300">{(apt as any).startedAt || `${apt.date}, ${apt.time}:00`}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Ended:</span>
                      <span className="font-mono font-bold text-slate-300">{(apt as any).endedAt || `${apt.date}, ${parseInt(apt.time.split(':')[0]) + 1}:${apt.time.split(':')[1]}:00`}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5 mt-1.5">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-mono font-bold text-slate-300">{(apt as any).durationHours || '1.5'} hours</span>
                    </div>
                    <button
                      onClick={() => handleOpenTimes(apt)}
                      className="w-full mt-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-bold rounded-md border border-slate-800/80 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={10} />
                      <span>Edit Times</span>
                    </button>
                  </div>

                  {/* Customer Details info block inside the card */}
                  <div className="space-y-2 text-[10px] font-medium text-slate-300 border-t border-slate-800/40 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Mobile:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{apt.customerPhone}</span>
                        <div className="flex gap-1">
                          <a
                            href={`sms:${apt.customerPhone}?body=${encodeURIComponent(getFormattedMessage(apt, undefined, undefined, undefined, ownerUid))}`}
                            className="p-1 hover:bg-slate-800 rounded text-sky-400 hover:text-sky-300 transition-colors"
                            title="Send Free SMS (Message Box)"
                          >
                            <Send size={10} />
                          </a>
                          {settings.whatsappMode === 'api' ? (
                            <button
                              onClick={() => {
                                const msg = getFormattedMessage(apt, undefined, undefined, undefined, ownerUid);
                                handleSendBackgroundWhatsApp(apt.customerPhone, msg);
                              }}
                              disabled={whatsappSending}
                              className="p-1 hover:bg-slate-800 rounded text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                              title="Send Background WhatsApp via API"
                            >
                              <MessageSquare size={10} />
                            </button>
                          ) : (
                            <a
                              href={`https://wa.me/${apt.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getFormattedMessage(apt, undefined, undefined, undefined, ownerUid))}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 hover:bg-slate-800 rounded text-emerald-400 hover:text-emerald-300 transition-colors"
                              title="Send Free WhatsApp Chat (Direct Redirect)"
                            >
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    {apt.customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="truncate max-w-[150px]">{apt.customerEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vehicle Type:</span>
                      <span className="capitalize">{apt.vehicle.year} {apt.vehicle.make} {apt.vehicle.model}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400 font-sans">Date & Slot:</span>
                      <span>{apt.date} @ {apt.time}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800/30 pt-2">
                      <span className="text-slate-400">Price Details:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-400">₹{apt.price}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Customer Paid:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₹{apt.paidAmount ?? (apt.paymentStatus === 'paid' || apt.status === 'completed' || apt.paymentStatus === 'discount' ? apt.price : 0)}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Footer section inside the Card */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/60 space-y-3 shrink-0">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Update Status</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleQuickStatusChange(apt, 'in_progress')}
                      className={`py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        apt.status === 'in_progress'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Play size={10} />
                      <span>Progress</span>
                    </button>
                    <button
                      onClick={() => handleQuickStatusChange(apt, 'completed')}
                      className={`py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        apt.status === 'completed'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Check size={10} />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => handleQuickStatusChange(apt, 'cancelled')}
                      className={`py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        apt.status === 'cancelled'
                          ? 'bg-rose-900 text-rose-200 border border-rose-850'
                          : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <X size={10} />
                      <span>Cancel</span>
                    </button>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => onNavigate('billing')}
                      className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="Invoice"
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
      )}

      {/* Book Appointment Modal matching Screenshot 1 layout */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-start justify-center sm:items-center z-50 p-2 sm:p-4 overflow-y-auto animate-fade-in" id="appointment-modal">
          <div className="bg-white rounded-2xl w-full max-w-xl my-4 sm:my-8 shadow-2xl flex flex-col overflow-hidden animate-zoom-in text-slate-800">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#0ea5e9]" />
                <h2 className="text-base font-bold">Create New Booking</h2>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form matching screenshot 1 perfectly */}
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              
              {/* Row 1: Client Name * and Client Mobile Number * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="Enter client name"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Client Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                  />
                </div>
              </div>

              {/* Dynamic Existing Client Alert & Auto-Fill option */}
              {isPhoneConflict ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in shadow-xs transition-all">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                    <AlertCircle size={16} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <span>Duplicate Mobile Number Alert!</span>
                      <span className="bg-rose-200/60 text-rose-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Conflict</span>
                    </h4>
                    <p className="text-2xs text-rose-800 leading-relaxed font-medium">
                      The mobile number <strong className="font-bold">{newCustPhone}</strong> is already registered under the name <strong className="font-bold">{isPhoneConflict.name}</strong>. You cannot register the same mobile number under a different name.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewCustName(isPhoneConflict.name);
                          if (isPhoneConflict.phone) setNewCustPhone(isPhoneConflict.phone);
                          if (isPhoneConflict.email) setNewCustEmail(isPhoneConflict.email);
                          if (isPhoneConflict.address) setNewCustAddress(isPhoneConflict.address);
                          if (isPhoneConflict.vehicles && isPhoneConflict.vehicles.length > 0) {
                            const mainVehicle = isPhoneConflict.vehicles[0];
                            setVehMake(`${mainVehicle.year ? mainVehicle.year + ' ' : ''}${mainVehicle.make}${mainVehicle.model ? ' ' + mainVehicle.model : ''}`.trim());
                            setVehSize(mainVehicle.size || 'sedan');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:shadow-sm"
                      >
                        <Check size={12} className="stroke-[2.5]" />
                        <span>Use existing client '{isPhoneConflict.name}'</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : matchedClient && !isAlreadyFilled ? (
                <div className="bg-sky-50 border border-sky-250 rounded-xl p-4 flex items-start gap-3 animate-fade-in shadow-xs transition-all">
                  <div className="p-2 bg-sky-100 text-sky-600 rounded-lg shrink-0 mt-0.5">
                    <User size={16} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <span>Existing Client Found!</span>
                      <span className="bg-sky-200/60 text-sky-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">CRM Match</span>
                    </h4>
                    <p className="text-2xs text-sky-800 leading-relaxed font-medium">
                      We found an existing client named <strong className="font-bold">{matchedClient.name}</strong> with phone <strong className="font-bold">{matchedClient.phone || 'N/A'}</strong>. Would you like to auto-fill their number, address, and vehicle details?
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewCustName(matchedClient.name);
                          if (matchedClient.phone) setNewCustPhone(matchedClient.phone);
                          if (matchedClient.email) setNewCustEmail(matchedClient.email);
                          if (matchedClient.address) setNewCustAddress(matchedClient.address);
                          if (matchedClient.vehicles && matchedClient.vehicles.length > 0) {
                            const mainVehicle = matchedClient.vehicles[0];
                            setVehMake(`${mainVehicle.year ? mainVehicle.year + ' ' : ''}${mainVehicle.make}${mainVehicle.model ? ' ' + mainVehicle.model : ''}`.trim());
                            setVehSize(mainVehicle.size || 'sedan');
                          }
                        }}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:shadow-sm hover:scale-[1.01]"
                      >
                        <Check size={12} className="stroke-[2.5]" />
                        <span>Yes, Auto-Fill Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Service Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Enter doorstep detailing service address"
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                />
              </div>

              {/* VIP Monthly Package Option */}
              <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-xl space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMonthlyPkg}
                    onChange={(e) => {
                      setIsMonthlyPkg(e.target.checked);
                      if (e.target.checked) {
                        setSelectedServiceId('');
                        setPriceInput(0);
                        setPaidAmountInput(0);
                      }
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-indigo-950">Book under Active VIP Monthly Package / Membership</span>
                </label>

                {isMonthlyPkg && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-indigo-200/50 animate-fade-in">
                    <div>
                      <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">Select VIP Plan</label>
                      <select
                        value={monthlyPkgName}
                        onChange={(e) => setMonthlyPkgName(e.target.value)}
                        className="text-xs p-2.5 border border-indigo-200 rounded-lg w-full bg-white text-slate-800 focus:outline-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="Silver Weekly Maintenance Wash">Silver Weekly Wash</option>
                        <option value="Gold Bi-Weekly Gloss Plan">Gold Bi-Weekly Gloss</option>
                        <option value="Platinum Monthly Showroom Reset">Platinum Monthly Reset</option>
                        <option value="Elite Quarterly Protection Plan">Elite Quarterly Protection</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">Current Wash</label>
                      <select
                        value={monthlyPkgWashNum}
                        onChange={(e) => setMonthlyPkgWashNum(Number(e.target.value))}
                        className="text-xs p-2.5 border border-indigo-200 rounded-lg w-full bg-white text-slate-800 focus:outline-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="1">1st Wash</option>
                        <option value="2">2nd Wash</option>
                        <option value="3">3rd Wash</option>
                        <option value="4">4th Wash</option>
                        <option value="5">5th Wash</option>
                        <option value="6">6th Wash</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">Total Cycle Washes</label>
                      <input
                        type="number"
                        min="1"
                        value={monthlyPkgTotalWashes}
                        onChange={(e) => setMonthlyPkgTotalWashes(Number(e.target.value))}
                        className="text-xs p-2.5 border border-indigo-200 rounded-lg w-full bg-white text-slate-800 focus:outline-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Vehicle Type * and Service Type * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Type *</label>
                  <input
                    type="text"
                    required
                    value={vehMake}
                    onChange={(e) => setVehMake(e.target.value)}
                    placeholder="e.g., 2020 Toyota Camry"
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Service Type *</label>
                  <select
                    required={!isMonthlyPkg}
                    disabled={isMonthlyPkg}
                    value={isMonthlyPkg ? 'monthly-package' : selectedServiceId}
                    onChange={(e) => {
                      const svcId = e.target.value;
                      setSelectedServiceId(svcId);
                      const svc = services.find(s => s.id === svcId);
                      if (svc) {
                        setPriceInput(svc.pricing.sedan || 150);
                      }
                    }}
                    className={`w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-sky-500 ${isMonthlyPkg ? 'bg-indigo-50 text-indigo-900 border-indigo-250 cursor-not-allowed opacity-90' : 'bg-slate-50/50 text-slate-800'}`}
                  >
                    {isMonthlyPkg ? (
                      <option value="monthly-package" className="bg-white text-slate-800">{monthlyPkgName} (VIP)</option>
                    ) : (
                      <>
                        <option value="" className="bg-white text-slate-800">Select service</option>
                        {services
                          .filter(s => s.category !== 'add_on')
                          .map(pkg => (
                            <option key={pkg.id} value={pkg.id} className="bg-white text-slate-800">{pkg.name}</option>
                          ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 3: Price * and Customer Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      required
                      value={priceInput || ''}
                      onChange={(e) => setPriceInput(Number(e.target.value))}
                      placeholder="0"
                      className="text-xs pl-7 pr-2.5 py-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Customer Paid (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      value={paidAmountInput || ''}
                      onChange={(e) => setPaidAmountInput(Number(e.target.value))}
                      placeholder="0"
                      className="text-xs pl-7 pr-2.5 py-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Scheduled Date & Time * and Assign Employee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assign Employee</label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-slate-800 focus:outline-sky-500 cursor-pointer h-[38px] overflow-y-auto font-semibold"
                  >
                    <option value="" className="bg-white text-slate-800">Not Assigned</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id} className="bg-white text-slate-800">
                        {s.name} ({s.role === 'detailer' ? 'Employee' : s.role === 'manager' ? 'Car Washer' : s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any special instructions or details..."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-slate-50/50 text-slate-800 h-20 focus:outline-sky-500"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Photos</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-semibold text-slate-700">
                    <Upload size={14} />
                    <span>Choose files</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          setUploadedPhotos(files.map(f => f.name).join(', '));
                        }
                      }}
                    />
                  </label>
                  <span className="text-3xs text-slate-500 truncate max-w-xs">{uploadedPhotos || 'No file chosen'}</span>
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer text-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-xs font-extrabold rounded-lg shadow-md transition-all cursor-pointer text-center"
                >
                  Create Booking
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Info Modal */}
      {showEditModal && editingApt && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-start justify-center sm:items-center z-50 p-2 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md my-4 sm:my-8 shadow-2xl overflow-hidden animate-zoom-in">
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
              <div className="grid grid-cols-3 gap-3">
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
                <div>
                  <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Customer Paid (₹)</label>
                  <input
                    type="number"
                    value={editPaidAmount}
                    onChange={(e) => setEditPaidAmount(Number(e.target.value))}
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
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-start justify-center sm:items-center z-50 p-2 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm my-4 sm:my-8 shadow-2xl overflow-hidden animate-zoom-in">
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

      {/* Simulated Client WhatsApp notification popup */}
      {smsAlert && smsAlert.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-emerald-500/30 rounded-xl shadow-2xl p-4 overflow-hidden animate-slide-in text-slate-100">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800 mb-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare size={12} className="stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">Booking Confirmed!</span>
              <span className="text-xs font-black text-white">{smsAlert.clientName} ({smsAlert.phone})</span>
            </div>
            <button 
              onClick={() => {
                setSmsAlert(null);
                setWhatsappResult(null);
              }}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-900 text-xs font-medium text-emerald-400 leading-relaxed font-mono mb-3">
            "{smsAlert.message}"
          </div>

          {/* WhatsApp Action Result */}
          {whatsappResult && (
            <div className={`p-2.5 rounded-lg text-xs font-bold mb-3 ${whatsappResult.success ? 'bg-emerald-950 border border-emerald-800/40 text-emerald-400' : 'bg-rose-950 border border-rose-800/40 text-rose-400'}`}>
              {whatsappResult.text}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {settings.whatsappMode === 'api' ? (
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={whatsappSending}
                  onClick={() => handleSendBackgroundWhatsApp(smsAlert.phone, smsAlert.message)}
                  className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/60 text-[10px] font-bold uppercase tracking-wider rounded text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  {whatsappSending ? (
                    <span>Sending from Business Line...</span>
                  ) : (
                    <>
                      <Send size={10} />
                      <span>Send from Business No ({settings.whatsappBusinessPhone || '8510002780'})</span>
                    </>
                  )}
                </button>
                <div className="text-[9px] text-slate-400 text-center font-medium">
                  Dispatches in background from official business line.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <a
                  href={`https://wa.me/${smsAlert.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(smsAlert.message)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <ExternalLink size={10} />
                  <span>Open in WhatsApp (Real Chat)</span>
                </a>
                <div className="text-[9px] text-slate-400 text-center font-semibold leading-normal p-2 bg-amber-500/5 rounded-lg border border-amber-500/20 mt-1 text-left">
                  <span className="text-amber-400 font-bold block mb-0.5">⚠️ Important Note:</span>
                  Direct mode opens WhatsApp Web using your own browser account. To send messages automatically from the company's official business line (<span className="text-emerald-400">8510002780</span>), please go to <strong className="text-indigo-400">Settings</strong> and change the Dispatch Mode to <strong className="text-emerald-400">"Automated API Gateway"</strong>.
                </div>
              </div>
            )}

            <div className="flex gap-1.5 pt-1.5 border-t border-slate-800/60 mt-1">
              <a
                href={`sms:${smsAlert.phone}?body=${encodeURIComponent(smsAlert.message)}`}
                className="flex-1 text-center py-1.5 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/20 text-[9px] font-bold uppercase tracking-wider rounded text-sky-400 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Send size={9} />
                <span>Backup SMS</span>
              </a>
              {settings.whatsappMode === 'api' && (
                <a
                  href={`https://wa.me/${smsAlert.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(smsAlert.message)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center py-1.5 px-2 bg-slate-800/40 hover:bg-slate-800 text-[9px] font-bold uppercase tracking-wider rounded text-slate-400 transition-colors cursor-pointer border border-slate-800 flex items-center gap-1"
                >
                  <ExternalLink size={9} />
                  <span>Manual Link</span>
                </a>
              )}
              <button
                onClick={() => {
                  setSmsAlert(null);
                  setWhatsappResult(null);
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-[9px] font-bold uppercase tracking-wider rounded text-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
