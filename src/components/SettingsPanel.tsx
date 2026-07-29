/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  MessageSquare,
  Sparkles,
  ClipboardCheck,
  Save,
  CheckCircle,
  Building,
  DollarSign
} from 'lucide-react';
import { ShopSettings } from '../types/crm';

interface SettingsPanelProps {
  settings: ShopSettings;
  onUpdateSettings: (updated: ShopSettings) => void;
}

export default function SettingsPanel({
  settings,
  onUpdateSettings
}: SettingsPanelProps) {
  const [success, setSuccess] = useState(false);

  // Shop details
  const [shopName, setShopName] = useState(settings.shopName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [taxRate, setTaxRate] = useState(settings.taxRate);

  // SMS Templates
  const [bookingConfirmed, setBookingConfirmed] = useState(settings.smsTemplates.bookingConfirmed);
  const [workStarted, setWorkStarted] = useState(settings.smsTemplates.workStarted);
  const [readyForPickup, setReadyForPickup] = useState(settings.smsTemplates.readyForPickup);
  const [reviewRequest, setReviewRequest] = useState(settings.smsTemplates.reviewRequest);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: ShopSettings = {
      shopName,
      phone,
      email,
      address,
      taxRate: Number(taxRate),
      currencySymbol: settings.currencySymbol,
      smsTemplates: {
        bookingConfirmed,
        workStarted,
        readyForPickup,
        reviewRequest
      }
    };

    onUpdateSettings(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="settings-tab-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight md:text-2xl">CRM Settings & Templates</h1>
          <p className="text-xs text-slate-500">Configure studio details, taxation, and modify SMS/Email communication templates</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-form-layout">
        
        {/* Left column: Studio coordinates */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="text-slate-400" size={18} />
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Studio Details & Coordinates</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Shop Name</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                required
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 font-semibold font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Business Mobile</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Contact Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 font-semibold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Physical Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Right column: SMS dispatch templates */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="text-slate-400" size={18} />
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">SMS Blast Templates</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Booking Confirmed</label>
                <textarea
                  required
                  value={bookingConfirmed}
                  onChange={(e) => setBookingConfirmed(e.target.value)}
                  className="text-2xs p-2 border border-slate-200 rounded-lg w-full bg-slate-50/50 h-20 leading-relaxed text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Work bay started alert</label>
                <textarea
                  required
                  value={workStarted}
                  onChange={(e) => setWorkStarted(e.target.value)}
                  className="text-2xs p-2 border border-slate-200 rounded-lg w-full bg-slate-50/50 h-20 leading-relaxed text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Vehicle Ready for Pickup</label>
                <textarea
                  required
                  value={readyForPickup}
                  onChange={(e) => setReadyForPickup(e.target.value)}
                  className="text-2xs p-2 border border-slate-200 rounded-lg w-full bg-slate-50/50 h-20 leading-relaxed text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Review Request</label>
                <textarea
                  required
                  value={reviewRequest}
                  onChange={(e) => setReviewRequest(e.target.value)}
                  className="text-2xs p-2 border border-slate-200 rounded-lg w-full bg-slate-50/50 h-20 leading-relaxed text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-between">
            {success ? (
              <div className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                <CheckCircle size={16} />
                Saved coordinates successfully!
              </div>
            ) : (
              <span className="text-4xs text-slate-400 font-medium">Use tags: &#123;customer_name&#125;, &#123;vehicle_model&#125;</span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={16} />
              Save Coordinates
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
