/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building,
  Globe,
  Sliders,
  Eye,
  Check,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  Volume2,
  Type,
  Save,
  Percent,
  MessageSquare,
  Shield,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ShopSettings } from '../types/crm';

interface SettingsPanelProps {
  settings: ShopSettings;
  onUpdateSettings: (updated: ShopSettings) => void;
}

interface WebsiteItem {
  id: string;
  domain: string;
  title: string;
  status: 'connected' | 'pending';
  ssl: boolean;
  createdAt: string;
}

export default function SettingsPanel({
  settings,
  onUpdateSettings
}: SettingsPanelProps) {
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'websites' | 'invoices' | 'whatsapp' | 'security' | 'accessibility'>('business');

  // --- Business Info States ---
  const [shopName, setShopName] = useState(settings.shopName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [currency, setCurrency] = useState(settings.currencySymbol === '₹' ? 'INR (₹)' : 'USD ($)');
  const [depositRate, setDepositRate] = useState('10');
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 30 days');
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=150&auto=format&fit=crop&q=80');

  // --- WhatsApp Gateway States ---
  const [whatsappMode, setWhatsappMode] = useState<'direct' | 'api'>(settings.whatsappMode || 'direct');
  const [whatsappProvider, setWhatsappProvider] = useState<'ultramsg' | 'custom'>(settings.whatsappProvider || 'ultramsg');
  const [whatsappInstanceId, setWhatsappInstanceId] = useState(settings.whatsappInstanceId || '');
  const [whatsappToken, setWhatsappToken] = useState(settings.whatsappToken || '');
  const [whatsappBusinessPhone, setWhatsappBusinessPhone] = useState(settings.whatsappBusinessPhone || '8510002780');

  // --- SMS Templates (Tags Tab) ---
  const [bookingConfirmed, setBookingConfirmed] = useState(settings.smsTemplates.bookingConfirmed);
  const [workStarted, setWorkStarted] = useState(settings.smsTemplates.workStarted);
  const [readyForPickup, setReadyForPickup] = useState(settings.smsTemplates.readyForPickup);
  const [reviewRequest, setReviewRequest] = useState(settings.smsTemplates.reviewRequest);

  // --- Website Tab States ---
  const [websites, setWebsites] = useState<WebsiteItem[]>([
    { id: 'web-1', domain: 'drwashit.online', title: 'Main Booking Portal', status: 'connected', ssl: true, createdAt: '2026-05-12' },
    { id: 'web-2', domain: 'detailflow.online', title: 'Self-Service Booking Webapp', status: 'connected', ssl: true, createdAt: '2026-07-28' }
  ]);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newWebTitle, setNewWebTitle] = useState('');

  // --- Accessibility States ---
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(settings.theme || 'dark');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>((settings.fontSize as any) || 'medium');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [enhancedFocus, setEnhancedFocus] = useState(true);
  const [notificationSounds, setNotificationSounds] = useState(true);

  // --- Accessibility Live Application ---
  React.useEffect(() => {
    const theme = selectedTheme || 'dark';
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      // System
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [selectedTheme]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${fontSize}`);
  }, [fontSize]);

  // --- Save Handler ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSymbol = currency.includes('₹') ? '₹' : '$';

    const updated: ShopSettings = {
      shopName,
      phone,
      email,
      address,
      taxRate: Number(taxRate),
      currencySymbol: selectedSymbol,
      smsTemplates: {
        bookingConfirmed,
        workStarted,
        readyForPickup,
        reviewRequest
      },
      theme: selectedTheme,
      fontSize: fontSize as any,
      logoUrl,
      whatsappMode,
      whatsappProvider,
      whatsappInstanceId,
      whatsappToken,
      whatsappBusinessPhone
    };

    onUpdateSettings(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // --- Add Website Handler ---
  const handleAddWebsiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;

    const domainName = newDomain.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase();
    const newWeb: WebsiteItem = {
      id: `web-${Date.now()}`,
      domain: domainName,
      title: newWebTitle || 'Custom Portal',
      status: 'connected',
      ssl: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setWebsites([...websites, newWeb]);
    setNewDomain('');
    setNewWebTitle('');
    setShowAddWebsite(false);
  };

  const handleDeleteWebsite = (id: string) => {
    setWebsites(websites.filter(w => w.id !== id));
  };

  return (
    <div className="space-y-6" id="settings-management-root">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Settings</h1>
        <p className="text-xs text-slate-400">Configure business information, manage domains, and customize interface accessibility settings</p>
      </div>

      {/* Tabs Row Header */}
      <div className="border-b border-slate-800/80 overflow-x-auto">
        <div className="flex gap-1 pb-px min-w-max">
          {([
            { id: 'business', name: 'Business Info' },
            { id: 'whatsapp', name: 'WhatsApp Gateway' },
            { id: 'websites', name: 'Websites' },
            { id: 'invoices', name: 'Invoices' },
            { id: 'security', name: 'Security' },
            { id: 'accessibility', name: 'Accessibility' }
          ] as const).map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  active
                    ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/25'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Settings Panel View */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* --- TAB 1: BUSINESS INFO --- */}
        {activeTab === 'business' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="settings-tab-business">
            {/* Left columns: Form fields */}
            <div className="lg:col-span-2 bg-[#0B1329] border border-slate-800/60 rounded-xl p-6 space-y-6 shadow-md">
              <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Building className="text-sky-500" size={18} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Business Settings</h3>
              </div>

              {/* Logo Selector Box */}
              <div className="space-y-2">
                <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Business Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative border border-slate-800 bg-slate-950/40 p-3.5 rounded-lg flex items-center justify-between w-full group hover:border-slate-700 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <Building className="text-slate-500" size={16} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">Choose file</span>
                        <span className="text-4xs text-slate-500">PNG, JPG up to 2MB. Recommended size: 500x500px</span>
                      </div>
                    </div>
                    <span className="text-4xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-bold uppercase tracking-wider group-hover:bg-slate-700 transition-colors">Browse</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setLogoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Website</label>
                  <input
                    type="text"
                    value={paymentTerms ? "https://drwashit.online" : "https://yourbusiness.com"}
                    disabled
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950/55 text-slate-400 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Business Address</label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50 h-20"
                  />
                </div>
              </div>
            </div>

            {/* Right column: Financial Settings */}
            <div className="bg-[#0B1329] border border-slate-800/60 rounded-xl p-6 space-y-6 shadow-md flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                  <Percent className="text-indigo-400" size={18} />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">Currency & Rates</h3>
                </div>

                <div className="space-y-4">
                  {/* Currency Selection */}
                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50 cursor-pointer"
                    >
                      <option value="INR (₹)">INR (₹)</option>
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="GBP (£)">GBP (£)</option>
                    </select>
                  </div>

                  {/* Tax Rate */}
                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Default Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50"
                    />
                  </div>

                  {/* Deposit rate */}
                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Default Deposit (%)</label>
                    <input
                      type="number"
                      required
                      value={depositRate}
                      onChange={(e) => setDepositRate(e.target.value)}
                      className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50"
                    />
                  </div>

                  {/* Default Payment Terms */}
                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Default Payment Terms</label>
                    <input
                      type="text"
                      required
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button Row inside tab */}
              <div className="border-t border-slate-800/60 pt-5 mt-6 flex items-center justify-between">
                <div>
                  {success && (
                    <span className="text-emerald-500 text-3xs font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> Info saved successfully!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  Save Information
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: WHATSAPP GATEWAY --- */}
        {activeTab === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="settings-tab-whatsapp">
            {/* Left Column: Core Setup & Info */}
            <div className="lg:col-span-2 bg-[#0B1329] border border-slate-800/60 rounded-xl p-6 space-y-6 shadow-md">
              <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <MessageSquare className="text-emerald-500 animate-pulse" size={18} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">WhatsApp Delivery Settings</h3>
              </div>

              {/* Explanatory Info Card */}
              <div className="bg-slate-950/55 border border-slate-800/70 p-4.5 rounded-xl space-y-3">
                <span className="text-[10px] bg-slate-850 text-slate-300 border border-slate-800 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">How WhatsApp Delivery Works</span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  By default, clicking <strong className="text-white">"Open in WhatsApp"</strong> triggers a direct link redirect (<code className="text-cyan-400 font-mono text-[10px] bg-slate-950 px-1 py-0.5 rounded">wa.me/...</code>) which opens WhatsApp on the device currently logged into the CRM (such as an employee's mobile phone). This naturally uses that employee's personal WhatsApp account.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  This manual redirect system is <strong className="text-emerald-400">100% FREE</strong> and requires no expensive API gateway subscriptions. Message templates are prepared automatically, allowing you to send client updates and billing invoices in just one tap.
                </p>
              </div>

              {/* Direct Info and Business Phone input */}
              <div className="space-y-4 pt-2 border-t border-slate-850/50">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Official Business WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    value={whatsappBusinessPhone}
                    onChange={(e) => setWhatsappBusinessPhone(e.target.value)}
                    placeholder="e.g. 8510002780"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white font-semibold focus:outline-hidden focus:border-sky-500/50"
                  />
                  <span className="text-[10px] text-slate-500 block">The default business contact number used for test messages.</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-slate-850 pt-5 flex items-center justify-between">
                <div>
                  {success && (
                    <span className="text-emerald-500 text-3xs font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> WhatsApp Settings saved successfully!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  Save WhatsApp Settings
                </button>
              </div>
            </div>

            {/* Right Column: Testing Console */}
            <div className="bg-[#0B1329] border border-slate-800/60 rounded-xl p-6 space-y-5 shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                  <Sparkles className="text-yellow-500" size={16} />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Test Messaging</h3>
                </div>

                <div className="space-y-3.5">
                  <p className="text-3xs text-slate-400 leading-normal font-medium">
                    Test the direct browser-based WhatsApp redirect to verify communication is properly configured.
                  </p>

                  <div className="space-y-2">
                    <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Recipient Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 918510002780"
                      value={settings.phone || '8510002780'}
                      disabled
                      className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950/60 text-slate-400 font-mono"
                    />
                    <span className="text-[9px] text-slate-500 block">Sends a test manual message to the registered shop phone number.</span>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappBusinessPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello! Direct WhatsApp test from Dr Washit CRM.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-[10px] font-bold uppercase tracking-wider rounded text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={12} />
                    <span>Test Manual Redirect Link</span>
                  </a>
                </div>
              </div>

              {/* Status Alert Badge */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">System Status</span>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-bold">
                    Manual Redirect Active (100% Free - Sends from your device)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Removed Branding, Pricing, and Tags & SMS per user request */}

        {/* --- TAB 5: WEBSITES --- */}
        {activeTab === 'websites' && (
          <div className="space-y-6 animate-fade-in" id="settings-tab-websites">
            {/* Header with "+ Add Website" button at the top */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0B1329] border border-slate-800/60 rounded-xl p-5 shadow-md">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="text-sky-500" size={16} />
                  Customer-Facing Portals & Websites
                </h3>
                <p className="text-xs text-slate-400">Configure custom landing pages, client scheduling interfaces, and booking widgets for your studio.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddWebsite(!showAddWebsite)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={15} />
                Add Website
              </button>
            </div>

            {/* Inline "Add Website" Form Block */}
            {showAddWebsite && (
              <div className="bg-[#111C36] border border-sky-500/30 rounded-xl p-6 shadow-lg max-w-xl space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure New Website</h4>
                  <button type="button" onClick={() => setShowAddWebsite(false)} className="text-slate-400 hover:text-white font-bold">X</button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Website Name / Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr Washit Main Portal"
                      value={newWebTitle}
                      onChange={(e) => setNewWebTitle(e.target.value)}
                      className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Domain URL / Subdomain *</label>
                    <div className="flex">
                      <span className="bg-slate-950 border border-r-0 border-slate-800 text-slate-400 text-xs px-3 py-2.5 rounded-l-lg flex items-center">https://</span>
                      <input
                        type="text"
                        placeholder="e.g. drwashit.online"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="text-xs p-2.5 border border-slate-800 rounded-r-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50"
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddWebsite(false)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddWebsiteSubmit}
                      className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg shadow-md cursor-pointer"
                    >
                      Create Website
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List of Websites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {websites.map(web => (
                <div key={web.id} className="bg-[#0B1329] border border-slate-800/60 p-5 rounded-xl space-y-4 shadow-md flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{web.title}</h4>
                        <span className="text-3xs font-mono text-slate-400 block mt-0.5">https://{web.domain}</span>
                      </div>
                      <span className="text-4xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-3xs text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                      <Lock size={12} className="text-emerald-400 shrink-0" />
                      <span>SSL Certificate Connected & Secured (Let's Encrypt)</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800/40 pt-3 text-3xs text-slate-500">
                    <span>Created on: {web.createdAt}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteWebsite(web.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove Website"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 6: INVOICES --- */}
        {activeTab === 'invoices' && (
          <div className="bg-[#0B1329] border border-slate-800/60 rounded-xl p-6 shadow-md max-w-3xl space-y-4 animate-fade-in" id="settings-tab-invoices">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Invoice Template & Format Settings
            </h3>
            <p className="text-xs text-slate-400">Configure physical details that populate on generated billing sheets, including automatic numbering rules and footers.</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Invoice Number Prefix Prefix</label>
                <input
                  type="text"
                  defaultValue="INV-2026-"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Invoice footer declaration notes</label>
                <textarea
                  defaultValue="Thank you for trusting Dr Washit. All detailing jobs carry a 48-hour satisfaction warranty. Contact support at info@drwashit.online"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white h-20 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 7: SECURITY --- */}
        {activeTab === 'security' && (
          <div className="bg-[#0B1329] border border-slate-800/60 rounded-xl p-6 shadow-md max-w-3xl space-y-4 animate-fade-in" id="settings-tab-security">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Workspace Access Control
            </h3>
            <p className="text-xs text-slate-400">Manage API keys, Twilio gateway auth, and grant specific role-based permissions to detailing technicians.</p>
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-950/40 text-xs text-slate-300">
              <span className="font-bold text-slate-200 block mb-1">Two-Factor Authentication</span>
              <p className="text-slate-400 text-3xs mb-3">Enforce mandatory mobile verification codes for managers attempting ledger payouts.</p>
              <span className="text-4xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Recommended Setup</span>
            </div>
          </div>
        )}

        {/* --- TAB 8: ACCESSIBILITY --- */}
        {activeTab === 'accessibility' && (
          <div className="bg-[#0B1329] border border-slate-800/60 rounded-xl p-6 shadow-md space-y-6 shadow-lg max-w-4xl animate-fade-in" id="settings-tab-accessibility">
            
            {/* Header info */}
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="text-sky-500 animate-pulse" size={16} />
                Accessibility Settings
              </h3>
              <p className="text-xs text-slate-400">Customize the interface to better suit your needs</p>
            </div>

            {/* Theme Toggle Buttons */}
            <div className="space-y-2">
              <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Theme</label>
              <p className="text-3xs text-slate-500">Choose how the interface appears</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'system', label: 'System' }
                ] as const).map(th => {
                  const active = selectedTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSelectedTheme(th.id)}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        active
                          ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-md'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950'
                      }`}
                    >
                      <Eye size={14} className={active ? 'text-slate-950' : 'text-slate-500'} />
                      <span>{th.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Selector */}
            <div className="space-y-1">
              <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-wider block">Font Size</label>
              <p className="text-3xs text-slate-500">Adjust text size across the interface</p>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-sky-500/50 cursor-pointer max-w-xs"
              >
                <option value="small">Small</option>
                <option value="medium">Medium (Default)</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Accessibility Toggle Switches */}
            <div className="space-y-4 pt-2">
              
              {/* Reduce Motion Switch */}
              <div className="flex items-center justify-between p-3.5 border border-slate-800/80 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 transition-all">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Reduce Motion</span>
                  <span className="text-3xs text-slate-500 block mt-0.5">Minimize animations and transitions</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReduceMotion(!reduceMotion)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-hidden ${
                    reduceMotion ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                      reduceMotion ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast Mode Switch */}
              <div className="flex items-center justify-between p-3.5 border border-slate-800/80 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 transition-all">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">High Contrast Mode</span>
                  <span className="text-3xs text-slate-500 block mt-0.5">Increase contrast for better visibility</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-hidden ${
                    highContrast ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                      highContrast ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Enhanced Focus Indicators Switch */}
              <div className="flex items-center justify-between p-3.5 border border-slate-800/80 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 transition-all">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Enhanced Focus Indicators</span>
                  <span className="text-3xs text-slate-500 block mt-0.5">Show prominent outlines when navigating with keyboard</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnhancedFocus(!enhancedFocus)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-hidden ${
                    enhancedFocus ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                      enhancedFocus ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notification Sounds Switch */}
              <div className="flex items-center justify-between p-3.5 border border-slate-800/80 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 transition-all">
                <div>
                  <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
                    <Volume2 size={13} className="text-slate-400" />
                    Notification Sounds
                  </span>
                  <span className="text-3xs text-slate-500 block mt-0.5">Play audio alerts when new notifications arrive</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationSounds(!notificationSounds)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-hidden ${
                    notificationSounds ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                      notificationSounds ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* Keyboard Navigation Block */}
            <div className="p-4 border border-slate-800 rounded-xl bg-slate-950/40 space-y-2.5">
              <span className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 block">Keyboard Navigation</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0"></span>
                  <span>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-3xs font-mono border border-slate-700 text-slate-200 font-extrabold shadow-sm">Tab</kbd> to navigate between elements</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0"></span>
                  <span>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-3xs font-mono border border-slate-700 text-slate-200 font-extrabold shadow-sm">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-3xs font-mono border border-slate-700 text-slate-200 font-extrabold shadow-sm">Space</kbd> to activate buttons</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0"></span>
                  <span>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-3xs font-mono border border-slate-700 text-slate-200 font-extrabold shadow-sm">Esc</kbd> to close dialogs and menus</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0"></span>
                  <span>Use arrow keys to navigate within menus and dropdowns</span>
                </li>
              </ul>
            </div>

          </div>
        )}

      </form>
    </div>
  );
}
