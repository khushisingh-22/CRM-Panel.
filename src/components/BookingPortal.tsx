/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Car,
  User,
  Check,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  MessageSquare,
  X
} from 'lucide-react';
import { ServicePackage, ShopSettings } from '../types/crm';

interface BookingPortalProps {
  services: ServicePackage[];
  settings: ShopSettings;
  onAddLead: (lead: any) => void;
}

export default function BookingPortal({
  services,
  settings,
  onAddLead
}: BookingPortalProps) {
  const [success, setSuccess] = useState(false);

  // Form states
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  
  const [vehYear, setVehYear] = useState('2023');
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehSize, setVehSize] = useState<'sedan' | 'suv' | 'truck_large'>('sedan');

  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [bookingNotes, setBookingNotes] = useState('');

  // Computations
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

  const calculateSubtotal = () => {
    return getSelectedServicePrice() + getAddOnsTotal();
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * (settings.taxRate / 100) * 100) / 100;
  };

  const calculateTotal = () => {
    return Math.round((calculateSubtotal() + calculateTax()) * 100) / 100;
  };

  const getSelectedServiceDuration = () => {
    const pkg = services.find(s => s.id === selectedServiceId);
    if (!pkg) return 0;
    let sum = pkg.durationMin;
    selectedAddOnIds.forEach(id => {
      const addon = services.find(s => s.id === id);
      if (addon) sum += addon.durationMin;
    });
    return sum;
  };

  const handleToggleAddOn = (addonId: string) => {
    if (selectedAddOnIds.includes(addonId)) {
      setSelectedAddOnIds(selectedAddOnIds.filter(id => id !== addonId));
    } else {
      setSelectedAddOnIds([...selectedAddOnIds, addonId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedService = services.find(s => s.id === selectedServiceId);
    const selectedAddons = selectedAddOnIds.map(id => {
      const item = services.find(s => s.id === id);
      return { id: item!.id, name: item!.name, price: item!.pricing[vehSize] };
    });

    const newLead = {
      id: `lead-${Date.now()}`,
      name: custName,
      phone: custPhone,
      email: custEmail,
      vehicle: {
        year: vehYear,
        make: vehMake,
        model: vehModel,
        size: vehSize
      },
      serviceId: selectedServiceId,
      serviceName: selectedService ? selectedService.name : 'Treatment Wash',
      addOns: selectedAddons,
      date: bookingDate,
      time: bookingTime,
      totalPrice: calculateSubtotal(), // Using pre-tax price for appointments price, taxes are added on invoices
      notes: bookingNotes,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    onAddLead(newLead);
    setSuccess(true);
  };

  const handleReset = () => {
    setSuccess(false);
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setVehMake('');
    setVehModel('');
    setVehYear('2023');
    setSelectedAddOnIds([]);
    setBookingNotes('');
  };

  return (
    <div className="space-y-6" id="booking-portal-root">
      {/* Simulation Banner Notice */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-center gap-3 shrink-0">
        <MessageSquare size={20} className="text-amber-500 shrink-0" />
        <div className="text-xs">
          <strong className="font-bold">Public Embed Simulator:</strong> This simulates what a customer sees when visiting your website booking landing page. Submitting a reservation creates a <strong className="font-bold">Pending Booking Request Lead</strong> on your admin board instantly!
        </div>
      </div>

      {success ? (
        <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-md space-y-6 animate-zoom-in" id="booking-success-container">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle size={36} className="stroke-[2.5]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Booking Requested Successfully!</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Your detailing request for the <strong className="text-slate-800">{vehYear} {vehMake} {vehModel}</strong> has been submitted to <strong className="text-slate-800">{settings.shopName}</strong>. Our studio manager will review open bay slots and confirm via text confirmation.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-left divide-y divide-slate-100 max-w-sm mx-auto text-xs">
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Service Selected:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                {services.find(s => s.id === selectedServiceId)?.name}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Scheduled Date:</span>
              <span className="font-mono font-bold text-slate-800">{bookingDate}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Arrival Time:</span>
              <span className="font-semibold text-slate-800">{bookingTime} AM</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Estimated Price:</span>
              <span className="font-mono font-extrabold text-indigo-600">{settings.currencySymbol || '₹'}{calculateTotal()}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Create Another Reservation
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row w-full">
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Book Professional Detailing</h2>
              <p className="text-xs text-slate-500">Choose vehicle specifications, package treatments, and select your slot</p>
            </div>

            {/* Vehicle Sizing */}
            <div className="space-y-3">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">1. Vehicle Specification</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'sedan', name: 'Sedan / Coupe', sub: '2-4 Doors' },
                  { id: 'suv', name: 'Crossover / SUV', sub: 'Compact & Mid' },
                  { id: 'truck_large', name: 'Truck / Large SUV', sub: 'Extended Cab' }
                ].map(sizeOpt => {
                  const active = vehSize === sizeOpt.id;
                  return (
                    <div
                      key={sizeOpt.id}
                      onClick={() => setVehSize(sizeOpt.id as any)}
                      className={`border p-3 rounded-xl text-center cursor-pointer transition-all ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/10 text-indigo-950 font-bold'
                          : 'border-slate-100 hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      <Car size={16} className={`mx-auto mb-1 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-xs block leading-tight">{sizeOpt.name}</span>
                      <span className="text-4xs text-slate-400 font-medium">{sizeOpt.sub}</span>
                    </div>
                  );
                })}
              </div>

              {/* Vehicle specific input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <input
                  type="text"
                  required
                  value={vehYear}
                  onChange={(e) => setVehYear(e.target.value)}
                  placeholder="Year (e.g. 2023)"
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                />
                <input
                  type="text"
                  required
                  value={vehMake}
                  onChange={(e) => setVehMake(e.target.value)}
                  placeholder="Make (e.g. BMW)"
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                />
                <input
                  type="text"
                  required
                  value={vehModel}
                  onChange={(e) => setVehModel(e.target.value)}
                  placeholder="Model (e.g. X5)"
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                />
              </div>
            </div>

            {/* Core Treatments Catalog */}
            <div className="space-y-3">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">2. Select Core Treatment Package</label>
              
              <div className="space-y-2">
                {services
                  .filter(s => s.category !== 'add_on')
                  .map(pkg => {
                    const active = selectedServiceId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedServiceId(pkg.id)}
                        className={`border rounded-xl p-3.5 cursor-pointer flex items-start gap-4 transition-all ${
                          active
                            ? 'border-indigo-600 bg-indigo-50/10'
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/10'
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}>
                          {active && <Check size={11} className="stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <strong className="text-xs font-bold text-slate-900 block">{pkg.name}</strong>
                            <span className="text-xs font-mono font-extrabold text-slate-950 shrink-0">
                              {settings.currencySymbol || '₹'}{pkg.pricing[vehSize]}
                            </span>
                          </div>
                          <p className="text-3xs text-slate-500 mt-0.5 leading-relaxed">{pkg.description}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Premium Add-ons */}
            <div className="space-y-3">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">3. Choose Premium Add-ons</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
                            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 font-bold'
                            : 'border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="text-3xs truncate">{addon.name}</span>
                        <span className="text-3xs font-bold font-mono text-slate-900 shrink-0">
                          +{settings.currencySymbol || '₹'}{addon.pricing[vehSize]}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Date/Time and Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">4. Pick Date & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white"
                  />
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">5. Contact Information</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Full Name"
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                />
              </div>

              <div className="space-y-3">
                <input
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="Mobile Phone Number"
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                />
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="Email Address (Optional)"
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Submit Detailing Reservation
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Pricing Quote side column */}
          <div className="w-full md:w-80 bg-slate-900 text-white p-4 sm:p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 shrink-0">
            <div className="space-y-6">
              <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Itemized Quote breakdown</span>

              {/* Selected package items details */}
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-3xs block">Core Package:</span>
                  <div className="flex justify-between items-center mt-0.5">
                    <strong className="font-semibold text-white truncate max-w-[150px]">
                      {services.find(s => s.id === selectedServiceId)?.name}
                    </strong>
                    <span className="font-mono font-bold">{settings.currencySymbol || '₹'}{getSelectedServicePrice()}</span>
                  </div>
                </div>

                {/* Add-ons list if selected */}
                {selectedAddOnIds.length > 0 && (
                  <div className="border-b border-slate-800 pb-3 space-y-2">
                    <span className="text-slate-400 text-3xs block">Premium Add-ons:</span>
                    {selectedAddOnIds.map(addonId => {
                      const item = services.find(s => s.id === addonId);
                      return (
                        <div key={addonId} className="flex justify-between items-center text-3xs">
                          <span className="text-slate-300 truncate max-w-[150px]">{item?.name}</span>
                          <span className="font-mono text-slate-300">+{settings.currencySymbol || '₹'}{item?.pricing[vehSize]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Service parameters estimation */}
                <div className="space-y-1.5 text-3xs text-slate-400 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-500 shrink-0" />
                    <span>Est. Treatment Duration: <strong className="text-white font-medium">{getSelectedServiceDuration()} mins</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-slate-500 shrink-0" />
                    <span>Hydrophobic Warranty Shield Protection</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals panel */}
            <div className="border-t border-slate-800 pt-6 space-y-4 mt-6">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-medium text-slate-400 text-2xs">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">{settings.currencySymbol || '₹'}{calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-400 text-2xs">
                  <span>Est. Sales Tax ({settings.taxRate}%):</span>
                  <span className="font-mono">{settings.currencySymbol || '₹'}{calculateTax()}</span>
                </div>
              </div>

              <hr className="border-slate-800" />

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Quote:</span>
                <strong className="text-xl font-mono font-black text-indigo-400">{settings.currencySymbol || '₹'}{calculateTotal()}</strong>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
