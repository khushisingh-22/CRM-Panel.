/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Check,
  CreditCard,
  Printer,
  DollarSign,
  Briefcase,
  User,
  Trash2,
  X,
  TrendingUp,
  Sliders,
  Send,
  AlertCircle,
  ExternalLink,
  Download,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { Appointment, ShopSettings, Customer } from '../types/crm';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { DrWashitLogo } from './DrWashitLogo';
import logoImg from '../assets/dr_washit_logo.jpg';

interface BillingManagerProps {
  appointments: Appointment[];
  settings: ShopSettings;
  onUpdateAppointment: (updated: Appointment) => void;
  customers?: Customer[];
  ownerUid?: string;
  initialInvoiceId?: string | null;
  onNavigate?: (tab: string, paramId?: string) => void;
  onBack?: () => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

// Robust helper to convert numeric amount to Indian English Words format
const numberToWords = (num: number): string => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const numToString = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numToString(n % 100) : '');
    return '';
  };

  const convertIndianStyle = (n: number): string => {
    let str = '';
    if (n >= 10000000) {
      str += numToString(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += numToString(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += numToString(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n > 0) {
      str += numToString(n);
    }
    return str.trim();
  };

  const intPart = Math.floor(num);
  const paisaPart = Math.round((num - intPart) * 100);
  
  let result = convertIndianStyle(intPart);
  if (!result) result = 'Zero';
  result += ' Rupees';
  
  if (paisaPart > 0) {
    result += ' and ' + numToString(paisaPart) + ' Paisa';
  }
  result += ' Only';
  return result;
};

export default function BillingManager({
  appointments,
  settings,
  onUpdateAppointment,
  customers = [],
  ownerUid = '',
  initialInvoiceId = null,
  onNavigate,
  onBack
}: BillingManagerProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    initialInvoiceId || appointments.filter(a => a.status !== 'cancelled')[0]?.id || appointments[0]?.id || null
  );

  useEffect(() => {
    if (initialInvoiceId) {
      setSelectedInvoiceId(initialInvoiceId);
    }
  }, [initialInvoiceId]);

  const activeInvoice = appointments.find(a => 
    a.id === selectedInvoiceId || 
    a.invoiceNumber === selectedInvoiceId || 
    (selectedInvoiceId && String(a.id).trim() === String(selectedInvoiceId).trim())
  ) 
    || appointments.filter(a => a.status !== 'cancelled')[0] 
    || appointments[0];

  const isUnsplashPlaceholder = settings?.logoUrl && (settings.logoUrl.includes('unsplash.com') || settings.logoUrl === 'logo_url');
  const resolvedLogo = (!settings?.logoUrl || isUnsplashPlaceholder) ? logoImg : settings.logoUrl;

  const [billingSending, setBillingSending] = useState(false);
  const [billingResult, setBillingResult] = useState<{ success: boolean; text: string } | null>(null);

  // Billing Math (CGST and SGST splits)
  const getSubtotal = (price: number) => {
    return Math.round((price / (1 + settings.taxRate / 100)) * 100) / 100;
  };

  const getTaxAmount = (price: number) => {
    const sub = getSubtotal(price);
    return Math.round((price - sub) * 100) / 100;
  };

  // Toggle paid status
  const handleTogglePaymentStatus = (invoice: Appointment) => {
    const isPaid = invoice.paymentStatus === 'paid';
    onUpdateAppointment({
      ...invoice,
      paymentStatus: isPaid ? 'unpaid' : 'paid',
      paymentMethod: isPaid ? undefined : 'card'
    });
  };

  // Set specific payment method
  const handleSetPaymentMethod = (invoice: Appointment, method: Appointment['paymentMethod']) => {
    onUpdateAppointment({
      ...invoice,
      paymentStatus: 'paid',
      paymentMethod: method
    });
  };

  // Trigger print native dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="billing-tab-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-white p-4 sm:p-5 rounded-2xl border border-[#E5EDF3] shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {(onBack || onNavigate) && (
            <button
              onClick={() => {
                if (onBack) onBack();
                else if (onNavigate) onNavigate('bookings');
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#ECFEFF] hover:bg-[#CFFAFE] text-[#0891B2] hover:text-[#0E7490] rounded-xl text-xs font-bold border border-[#0891B2]/40 transition-all cursor-pointer shadow-xs shrink-0"
              title="Go Back to Bookings / Previous Screen"
              id="billing-back-btn"
            >
              <ArrowLeft size={16} className="stroke-[2.5]" />
              <span>Back</span>
            </button>
          )}
          <div className="text-left min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight md:text-2xl truncate">Invoicing & Billing Hub</h1>
            <p className="text-xs text-[#475569] truncate sm:whitespace-normal">Generate itemized job invoices, track transaction payments, and print customer receipts</p>
          </div>
        </div>
        
        {/* Dropdown Selector instead of full sidebar */}
        {appointments.filter(a => a.status !== 'cancelled').length > 0 && (
          <div className="flex items-center gap-2 bg-[#F4F8FB] px-3 py-2 rounded-xl border border-[#CBD5E1] shadow-xs shrink-0 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider shrink-0">Select Invoice:</span>
            <select
              value={activeInvoice?.id || ''}
              onChange={(e) => setSelectedInvoiceId(e.target.value || null)}
              className="text-xs font-bold text-[#0F172A] bg-transparent border-0 focus:ring-0 p-0 cursor-pointer outline-none w-full sm:w-auto"
            >
              {appointments
                .filter(a => a.status !== 'cancelled')
                .map(invoice => (
                  <option key={invoice.id} value={invoice.id} className="text-[#1E293B] bg-white">
                    {invoice.invoiceNumber || 'INV-0000'} - {invoice.customerName} (₹{invoice.price})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      <div className="w-full text-left" id="billing-grid-container">
        {/* Detailed Printable Invoice Template Visual */}
        <div className="w-full bg-white rounded-2xl border border-[#E5EDF3] shadow-md min-h-[650px] flex flex-col overflow-hidden">
          {activeInvoice ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Payment Actions header */}
              <div className="p-4 bg-[#F4F8FB] border-b border-[#E5EDF3] shrink-0 flex flex-wrap gap-3 items-center justify-between no-print">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider block">Admin Controls:</span>
                  <button
                    onClick={() => handleTogglePaymentStatus(activeInvoice)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      activeInvoice.paymentStatus === 'paid'
                        ? 'bg-rose-50 text-[#EF4444] border border-rose-200 hover:bg-rose-100'
                        : 'bg-[#16A34A] text-white border border-[#16A34A] hover:bg-[#15803D]'
                    }`}
                  >
                    {activeInvoice.paymentStatus === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                  </button>
                  
                  {activeInvoice.paymentStatus !== 'paid' && (
                    <div className="flex items-center gap-1.5 bg-white border border-[#E5EDF3] rounded-xl p-1 shadow-2xs">
                      <span className="text-[10px] text-[#64748B] font-bold px-2 uppercase">Method:</span>
                      {['cash', 'card', 'upi'].map(method => (
                        <button
                          key={method}
                          onClick={() => handleSetPaymentMethod(activeInvoice, method as any)}
                          className="px-3 py-1 text-xs font-bold bg-[#F4F8FB] hover:bg-[#ECFEFF] hover:text-[#0891B2] text-[#334155] rounded-lg uppercase transition-all border border-[#E5EDF3]"
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {billingResult && (
                    <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${billingResult.success ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200' : 'bg-rose-50 text-[#EF4444] border border-rose-200'}`}>
                      {billingResult.text}
                    </span>
                  )}

                  {/* WhatsApp send button */}
                  <button
                    onClick={async () => {
                      let cleanPhone = activeInvoice.customerPhone.replace(/[^0-9]/g, '');
                      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
                      
                      const invoiceLink = ownerUid 
                        ? `\n\n📄 *VIEW & DOWNLOAD DIGITAL INVOICE* ⬇️\n${window.location.origin}/?view_invoice=${activeInvoice.id}&owner=${ownerUid}`
                        : '';

                      const formattedMsg = `Dear ${activeInvoice.customerName}, 

Your Booking Invoice from *Dr Washit* has been generated successfully.${invoiceLink}

*Invoice No* - ${activeInvoice.invoiceNumber || 'N/A'}
*Date* - ${activeInvoice.date}
*Vehicle* - ${activeInvoice.vehicle.year} ${activeInvoice.vehicle.make} ${activeInvoice.vehicle.model}
*Service* - ${activeInvoice.serviceName}
*Total Amount* - ₹${activeInvoice.price}

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
                      
                      if (settings.whatsappMode === 'api') {
                        setBillingSending(true);
                        setBillingResult(null);
                        const res = await sendWhatsAppMessage(settings, activeInvoice.customerPhone, formattedMsg);
                        setBillingSending(false);
                        if (res.success) {
                          setBillingResult({ success: true, text: 'Sent from Business No!' });
                          setTimeout(() => setBillingResult(null), 5000);
                        } else {
                          setBillingResult({ success: false, text: `API Failed: ${res.error || 'Error'}` });
                        }
                      } else {
                        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedMsg)}`, '_blank');
                      }
                    }}
                    disabled={billingSending}
                    className="px-3 py-2 bg-white border border-[#16A34A] text-[#16A34A] hover:bg-emerald-50 disabled:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <MessageSquare size={13} />
                    <span>{billingSending ? 'Sending...' : 'Send WhatsApp'}</span>
                  </button>

                  {/* SMS Message Box button */}
                  <a
                    href={`sms:${activeInvoice.customerPhone}?body=${encodeURIComponent(
                      `Dear ${activeInvoice.customerName}, your booking invoice (INV No: ${activeInvoice.invoiceNumber || 'N/A'}) from Dr Washit for ₹${activeInvoice.price} has been generated. View details on www.drwashit.com. Thank you!`
                    )}`}
                    className="px-3 py-2 bg-white border border-[#0891B2] text-[#0891B2] hover:bg-[#ECFEFF] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send size={13} />
                    <span>Send SMS</span>
                  </a>

                  {/* Print / Save PDF button */}
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Printer size={13} />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet Visual */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F4F8FB] text-[#334155]" id="printable-invoice-sheet">
                {/* Print layout injects a dynamic style only when printed */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    /* Hide sidebar and main headers specifically */
                    aside, header, #drwashit-sidebar, #view-tabs-router > *:not(#billing-tab-root), #billing-tab-root > .no-print, .no-print {
                      display: none !important;
                    }
                    body {
                      background-color: white !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    #printable-invoice-sheet {
                      background-color: white !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      border: none !important;
                      box-shadow: none !important;
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100% !important;
                      visibility: visible !important;
                      print-color-adjust: exact;
                      -webkit-print-color-adjust: exact;
                    }
                    #printable-invoice-sheet * {
                      visibility: visible !important;
                    }
                    /* Remove rounded corners and shadows for printing */
                    #printable-invoice-sheet > div {
                      border: none !important;
                      box-shadow: none !important;
                      padding: 0 !important;
                      max-width: 100% !important;
                      width: 100% !important;
                    }
                  }
                `}} />

                {/* Main Invoice Card (Inter font, 1px border, soft shadow, centered) */}
                <div className="max-w-[800px] mx-auto bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 sm:p-6 md:p-10 print:border-0 print:shadow-none print:p-0 print:max-w-full relative space-y-6 sm:space-y-8 overflow-hidden text-left font-sans">
                  
                  {/* Aqua Gradient Strip at the very top */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0891B2] to-[#22D3EE]" />
                  
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-[#E2E8F0] pb-6">
                    <div className="space-y-3">
                      {/* Brand Logo & Name */}
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-xl bg-white border border-[#E5EDF3] flex items-center justify-center shrink-0 shadow-sm overflow-hidden relative">
                          <img 
                            src={resolvedLogo}
                            alt="Dr. Washit Logo" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              if (e.currentTarget.src !== logoImg) {
                                e.currentTarget.src = logoImg;
                              } else {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.className = "h-12 w-12 rounded-xl bg-gradient-to-br from-[#0891B2] to-[#06B6D4] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 border-0";
                                  parent.innerHTML = "<span>DW</span>";
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[#0F172A] leading-tight">Dr Washit</h2>
                          <p className="text-[13px] text-[#0891B2] font-semibold">Premium Doorstep Car Care</p>
                        </div>
                      </div>

                      {/* Studio Contacts (Neatly in two lines) */}
                      <p className="text-xs text-[#475569] leading-relaxed max-w-xl font-medium">
                        B-129, Pocket B, Sector-omicron 3rd, Greater Noida, Uttar Pradesh 201310 | Phone: +91 8510002780
                        <br />
                        Email: info.drwashit@gmail.com | Website: www.drwashit.com | <span className="font-bold text-[#0F172A]">GSTIN: 09DRWSH8510M1Z5</span>
                      </p>
                    </div>

                    {/* Tax Invoice Header & Status Badge */}
                    <div className="text-left md:text-right space-y-2 shrink-0 md:self-end">
                      <div className="space-y-0.5">
                        <h1 className="text-[28px] font-bold text-[#0891B2] tracking-tight leading-none uppercase">Tax Invoice</h1>
                        <div className="text-xs text-[#64748B] pt-2 space-y-0.5 md:right-align">
                          <div><span className="font-semibold text-[#64748B]">Invoice No:</span> <span className="font-medium text-[#0F172A]">{activeInvoice.invoiceNumber || 'INV-000000'}</span></div>
                          <div><span className="font-semibold text-[#64748B]">Issue Date:</span> <span className="font-medium text-[#0F172A]">{formatDate(activeInvoice.date)}</span></div>
                          <div><span className="font-semibold text-[#64748B]">Due Date:</span> <span className="font-medium text-[#0F172A]">{formatDate(activeInvoice.date)}</span></div>
                        </div>
                      </div>

                      {/* Payment Status Outlined Pill Badge */}
                      <div className="flex md:justify-end items-center gap-1.5 pt-1">
                        {activeInvoice.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 bg-[#16A34A]/5 text-[#16A34A] border border-[#16A34A]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Check size={12} className="stroke-[2.5]" />
                            <span>Paid</span>
                          </span>
                        ) : activeInvoice.paymentStatus === 'partially_paid' ? (
                          <span className="inline-flex items-center gap-1 bg-[#F59E0B]/5 text-[#F59E0B] border border-[#F59E0B]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <span>Partial</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-[#EF4444]/5 text-[#EF4444] border border-[#EF4444]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <span>Unpaid</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Billing Information Section (3 equal columns, 24px gap) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Billed To */}
                    <div className="bg-[#F8FAFC] border border-[#E5EDF3] rounded-xl p-4 flex-1 text-left min-w-0">
                      <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2.5">Billed To</span>
                      <strong className="text-sm font-bold text-[#0F172A] block mb-1">{activeInvoice.customerName}</strong>
                      <p className="text-xs text-[#334155] font-medium">Mob: {activeInvoice.customerPhone}</p>
                      {activeInvoice.customerEmail && <p className="text-xs text-[#334155] truncate font-medium mt-0.5">{activeInvoice.customerEmail}</p>}
                      <p className="text-xs text-[#334155] mt-1.5 leading-snug font-medium">
                        {activeInvoice.customerAddress || 'Doorstep Detailing Customer'}
                      </p>
                    </div>

                    {/* Vehicle Details */}
                    <div className="bg-[#F8FAFC] border border-[#E5EDF3] rounded-xl p-4 flex-1 text-left min-w-0">
                      <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2.5">Vehicle Details</span>
                      <strong className="text-sm font-bold text-[#0F172A] block mb-1 capitalize">
                        {activeInvoice.vehicle.year} {activeInvoice.vehicle.make} {activeInvoice.vehicle.model}
                      </strong>
                      <p className="text-xs text-[#0891B2] uppercase font-bold text-[10px] tracking-wider mb-1">
                        Size: {activeInvoice.vehicle.size.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-[#334155] mt-1.5 leading-tight font-medium">
                        <span className="font-semibold text-[#64748B]">Service slot:</span> {formatDate(activeInvoice.date)} @ {activeInvoice.time}
                      </p>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-[#F8FAFC] border border-[#E5EDF3] rounded-xl p-4 flex-1 text-left min-w-0">
                      <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2.5">Payment Info</span>
                      <div className="space-y-1 text-xs text-[#334155] font-medium">
                        <div>
                          <span className="font-semibold text-[#64748B]">Method:</span>{' '}
                          <span className="font-bold text-[#0F172A] uppercase">{activeInvoice.paymentMethod || 'UPI'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#64748B]">Status:</span>{' '}
                          <span className={`font-bold uppercase ${activeInvoice.paymentStatus === 'paid' ? 'text-[#16A34A]' : activeInvoice.paymentStatus === 'partially_paid' ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                            {activeInvoice.paymentStatus || 'UNPAID'}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-[#E5EDF3] mt-1.5">
                          <span className="font-semibold text-[#64748B]">Amount Paid:</span>{' '}
                          <strong className="text-sm font-bold text-[#16A34A] block mt-0.5">
                            ₹{(activeInvoice.paidAmount ?? (activeInvoice.paymentStatus === 'paid' ? activeInvoice.price : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto rounded-xl border border-[#E5EDF3]">
                    <table className="w-full min-w-[500px] sm:min-w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0891B2] text-white text-xs font-semibold">
                          <th className="py-3 px-4 w-12 text-center">#</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4 text-right w-28">Price</th>
                          <th className="py-3 px-4 text-right w-16">Qty</th>
                          <th className="py-3 px-4 text-right w-32">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5EDF3] text-xs text-[#334155] bg-white">
                        {/* Core Package Row */}
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-center text-[#64748B] font-semibold">1</td>
                          <td className="py-4 px-4 text-left">
                            <strong className="font-bold text-[#0F172A] block">{activeInvoice.serviceName}</strong>
                            <span className="text-xs text-[#64748B] block pt-0.5">
                              Core doorstep detailing treatment package custom-suited for your vehicle size ({activeInvoice.vehicle.size.replace('_', ' ')})
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right tabular-nums font-medium">
                            ₹{(activeInvoice.price - activeInvoice.addOns.reduce((s, a) => s + a.price, 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-right font-medium">1</td>
                          <td className="py-4 px-4 text-right font-bold text-[#0F172A] tabular-nums">
                            ₹{(activeInvoice.price - activeInvoice.addOns.reduce((s, a) => s + a.price, 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>

                        {/* Add-ons Rows */}
                        {activeInvoice.addOns.map((addon, index) => (
                          <tr key={addon.id} className="hover:bg-slate-50 transition-colors bg-[#F8FAFC]">
                            <td className="py-4 px-4 text-center text-[#64748B] font-semibold">{index + 2}</td>
                            <td className="py-4 px-4 text-left">
                              <strong className="font-bold text-[#0F172A] block">+ {addon.name}</strong>
                              <span className="text-xs text-[#64748B] block pt-0.5">Premium specialized detailing add-on treatment</span>
                            </td>
                            <td className="py-4 px-4 text-right tabular-nums font-medium">
                              ₹{addon.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-4 text-right font-medium">1</td>
                            <td className="py-4 px-4 text-right font-bold text-[#0F172A] tabular-nums">
                              ₹{addon.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations and Fine Print Section */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4">
                    {/* Left Side: Terms and UPI Payment Details */}
                    <div className="flex-1 space-y-5 max-w-md w-full">
                      {/* Terms & Conditions list */}
                      <div className="space-y-1.5 text-left">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Terms & Conditions</span>
                        <ol className="list-decimal pl-4 text-xs text-[#64748B] space-y-1 font-medium leading-relaxed">
                          <li>All doorstep detailing service payments must be verified on spot.</li>
                          <li>Treatments incorporate premium specialized ceramic and hydrophobic coating consumables.</li>
                          <li>For any disputes or inquiries, contact customer support desk within 24 hours.</li>
                          <li>UPI payment transfers must be credited successfully to our bank account.</li>
                        </ol>
                      </div>
                      
                      {/* Payment Details */}
                      <div className="bg-[#F8FAFC] border border-[#E5EDF3] p-4 rounded-xl space-y-1 text-left shadow-2xs">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Payment Details</span>
                        <p className="text-xs text-[#334155] font-medium"><strong>UPI ID:</strong> drwashit@ybl</p>
                        <p className="text-xs text-[#334155] font-medium leading-normal mt-0.5">
                          <strong>Bank:</strong> HDFC Bank Ltd | <strong>A/C:</strong> 50100045618290
                          <br />
                          <strong>IFSC:</strong> HDFC0000281
                        </p>
                      </div>
                    </div>

                    {/* Right Side: GST math table and Totals */}
                    <div className="w-[320px] shrink-0 text-right space-y-4">
                      {(() => {
                        const subtotal = getSubtotal(activeInvoice.price);
                        const taxTotal = getTaxAmount(activeInvoice.price);
                        const halfTax = taxTotal / 2;
                        const halfTaxRate = (settings.taxRate || 18) / 2;
                        const paidAmountValue = activeInvoice.paidAmount ?? (activeInvoice.paymentStatus === 'paid' ? activeInvoice.price : 0);
                        const balanceDueValue = Math.max(0, activeInvoice.price - paidAmountValue);

                        return (
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-xs text-[#475569] font-medium px-1">
                              <span>Subtotal:</span>
                              <span className="font-bold text-[#0F172A] tabular-nums">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            
                            {settings.taxRate > 0 && (
                              <>
                                <div className="flex justify-between items-center text-xs text-[#475569] font-medium px-1">
                                  <span>CGST ({halfTaxRate}%):</span>
                                  <span className="font-bold text-[#0F172A] tabular-nums">₹{halfTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-[#475569] font-medium px-1">
                                  <span>SGST ({halfTaxRate}%):</span>
                                  <span className="font-bold text-[#0F172A] tabular-nums">₹{halfTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              </>
                            )}

                            <div className="w-full border-b border-[#E2E8F0] my-2" />

                            {/* Total Amount Row highlighted */}
                            <div className="flex justify-between items-center p-3.5 bg-[#ECFEFF] text-[#0E7490] rounded-xl shadow-3xs">
                              <span className="text-sm font-black uppercase tracking-wider">Total Amount:</span>
                              <span className="text-xl font-bold tabular-nums">₹{activeInvoice.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            {/* Amount Paid & Balance Due */}
                            <div className="flex justify-between items-center text-xs text-[#475569] font-medium pt-1 px-1">
                              <span>Amount Paid:</span>
                              <span className="font-bold text-[#16A34A] tabular-nums">
                                ₹{paidAmountValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-[#475569] font-medium px-1">
                              <span>Balance Due:</span>
                              <span className={`font-bold tabular-nums ${balanceDueValue > 0 ? 'text-[#EF4444]' : 'text-[#16A34A]'}`}>
                                ₹{balanceDueValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Amount in words */}
                            <p className="text-xs italic text-[#475569] text-left pt-3 border-t border-[#CBD5E1]/20 font-medium">
                              <strong>Amount in words:</strong> {numberToWords(activeInvoice.price)}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Signatory and Terms Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#E2E8F0]">
                    <div className="text-left font-medium text-xs text-[#64748B] flex items-end">
                      <p className="italic">Let your car sparkle at your doorstep🚗💦✨</p>
                    </div>

                    <div className="flex flex-col items-end justify-end h-full">
                      <div className="text-right space-y-2">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Authorised Signatory</span>
                        <div className="h-14 flex items-center justify-end py-1">
                          {/* Hand-drawn elegant D signature SVG */}
                          <svg width="120" height="48" viewBox="0 0 100 40" fill="none" className="text-slate-800 opacity-95">
                            <path d="M20 8 C15 15, 12 35, 22 35 C32 35, 45 15, 38 8 C32 2, 22 5, 22 18 C22 28, 38 32, 50 30 C65 28, 80 25, 92 24 M42 22 C55 20, 68 18, 82 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="w-48 border-b border-[#CBD5E1] ml-auto" />
                        <span className="text-xs font-bold text-[#0F172A] block font-sans uppercase tracking-wider mt-1.5">DR WASHIT</span>
                      </div>
                    </div>
                  </div>

                  {/* Brand Contact Footer Bar */}
                  <div className="bg-[#ECFEFF] text-[#475569] p-6 rounded-b-xl flex flex-col justify-center items-center gap-2 border-t border-[#E5EDF3]">
                    <span className="text-base font-semibold text-[#0E7490]">Thank you for your business!</span>
                    <div className="flex items-center gap-4 flex-wrap justify-center text-xs">
                      <span className="flex items-center gap-1.5">
                        <Phone size={11} className="text-[#0891B2]" />
                        <span>+91 8510002780</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail size={11} className="text-[#0891B2]" />
                        <span>info.drwashit@gmail.com</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Globe size={11} className="text-[#0891B2]" />
                        <span>www.drwashit.com</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-[#94A3B8] text-center mt-1.5 block">
                      This is a computer-generated invoice and does not require a physical signature.
                    </span>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-[#64748B]">
              <FileText size={48} className="text-[#CBD5E1] mb-2 animate-pulse" />
              <p className="text-sm font-semibold text-[#475569]">No active invoices recorded</p>
              <p className="text-xs text-[#64748B] mt-1">Please log doorstep appointments to automatically formulate printable receipts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
