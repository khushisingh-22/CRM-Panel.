/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { Appointment, ShopSettings, Customer } from '../types/crm';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { DrWashitLogo } from './DrWashitLogo';

interface BillingManagerProps {
  appointments: Appointment[];
  settings: ShopSettings;
  onUpdateAppointment: (updated: Appointment) => void;
  customers?: Customer[];
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

export default function BillingManager({
  appointments,
  settings,
  onUpdateAppointment,
  customers = [],
  ownerUid = ''
}: BillingManagerProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    appointments.filter(a => a.status !== 'cancelled')[0]?.id || null
  );

  const activeInvoice = appointments.find(a => a.id === selectedInvoiceId);

  const [billingSending, setBillingSending] = useState(false);
  const [billingResult, setBillingResult] = useState<{ success: boolean; text: string } | null>(null);

  // Billing Math
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

  // Trigger print simulator
  const handlePrintMock = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="billing-tab-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Invoicing & Billing Hub</h1>
          <p className="text-xs text-slate-400">Generate itemized job invoices, track transaction payments, and print customer receipts</p>
        </div>
        
        {/* Dropdown Selector instead of full sidebar */}
        {appointments.filter(a => a.status !== 'cancelled').length > 0 && (
          <div className="flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-lg border border-slate-800 shadow-3xs shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Invoice:</span>
            <select
              value={selectedInvoiceId || ''}
              onChange={(e) => setSelectedInvoiceId(e.target.value || null)}
              className="text-xs font-bold text-white bg-transparent border-0 focus:ring-0 p-0 cursor-pointer outline-hidden [&>option]:bg-[#111827] [&>option]:text-white"
            >
              {appointments
                .filter(a => a.status !== 'cancelled')
                .map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber || 'INV-0000'} - {invoice.customerName} ({invoice.vehicle.year} {invoice.vehicle.make} {invoice.vehicle.model})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      <div className="w-full" id="billing-grid-container">
        {/* Detailed Printable Invoice Template Visual */}
        <div className="w-full bg-[#111827] rounded-xl border border-slate-800/80 shadow-xs min-h-[650px] flex flex-col overflow-hidden">
          {activeInvoice ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Payment Actions header */}
              <div className="p-4 bg-[#0B1329] border-b border-slate-800 shrink-0 flex flex-wrap gap-2 items-center justify-between no-print">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xs font-black text-slate-400 uppercase tracking-wider block">Admin Controls:</span>
                  <button
                    onClick={() => handleTogglePaymentStatus(activeInvoice)}
                    className={`px-2.5 py-1 rounded text-3xs font-extrabold uppercase tracking-wider border transition-all ${
                      activeInvoice.paymentStatus === 'paid'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {activeInvoice.paymentStatus === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                  </button>
                  
                  {activeInvoice.paymentStatus !== 'paid' && (
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-1">
                      <span className="text-[9px] text-slate-400 font-bold px-1 uppercase">Method:</span>
                      {['cash', 'card'].map(method => (
                        <button
                          key={method}
                          onClick={() => handleSetPaymentMethod(activeInvoice, method as any)}
                          className="px-1.5 py-0.5 text-4xs font-bold bg-slate-900 hover:bg-sky-950 hover:text-sky-400 text-slate-300 rounded uppercase transition-all border border-slate-800"
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {billingResult && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${billingResult.success ? 'bg-emerald-950/85 text-emerald-400 border border-emerald-900/40' : 'bg-rose-950/85 text-rose-400 border border-rose-900/40'}`}>
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
                          setBillingResult({ success: true, text: 'Sent successfully from Business No (8510002780)!' });
                          setTimeout(() => setBillingResult(null), 5000);
                        } else {
                          setBillingResult({ success: false, text: `API Failed: ${res.error || 'Error'}` });
                        }
                      } else {
                        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedMsg)}`, '_blank');
                      }
                    }}
                    disabled={billingSending}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    title={settings.whatsappMode === 'api' ? "Send Invoice via Background WhatsApp Gateway" : "Send Invoice details directly on WhatsApp"}
                  >
                    <MessageSquare size={10} />
                    <span>{billingSending ? 'Sending...' : settings.whatsappMode === 'api' ? 'Send Background WhatsApp' : 'Send WhatsApp'}</span>
                  </button>

                  {/* SMS Message Box button */}
                  <a
                    href={`sms:${activeInvoice.customerPhone}?body=${encodeURIComponent(
                      `Dear ${activeInvoice.customerName}, your booking invoice (INV No: ${activeInvoice.invoiceNumber || 'N/A'}) from Dr Washit for ₹${activeInvoice.price} has been generated. View details on www.drwashit.com. Thank you!`
                    )}`}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    title="Open SMS message box on phone"
                  >
                    <Send size={10} />
                    <span>Send SMS</span>
                  </a>

                  {/* Print / Save PDF button */}
                  <button
                    onClick={handlePrintMock}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer size={10} />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet Visual */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 font-sans print:p-0 bg-slate-950/40" id="printable-invoice-sheet">
                {/* Print layout injects a dynamic style only when printed */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    #printable-invoice-sheet, #printable-invoice-sheet * {
                      visibility: visible;
                    }
                    #printable-invoice-sheet {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      padding: 0 !important;
                      margin: 0 !important;
                      background: white !important;
                      border: none !important;
                      box-shadow: none !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}} />

                {/* Main layout card with sleek, professional design */}
                <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md print:border-0 print:shadow-none print:rounded-none">
                  
                  {/* Top Branding Banner: Clean Executive style with company logo */}
                  <div className="bg-slate-900 p-6 md:p-8 text-white flex justify-between items-center relative overflow-hidden border-b border-slate-800">
                    <div className="relative z-10 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">PREMIUM DOORSTEP CAR DETAILING</span>
                      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-none uppercase">
                        DR WASHIT
                      </h2>
                      <p className="text-[9px] text-slate-300 leading-normal max-w-sm pt-1.5 font-medium">
                        B-129.PocketB,Sector-omicron 3rd,omicron|||,greaternoida,mathurapur,uttarpradesh201310
                        <br />
                        Phone: 8510002780 | Email: info.drwashit@gmail.com
                        <br />
                        <span className="font-extrabold text-white tracking-wider">GSTIN: 09DRWSH8510M1Z5</span>
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-end gap-2 shrink-0">
                      <DrWashitLogo size={64} className="shadow-md" />
                      <div className="text-right">
                        <span className="text-3xs font-extrabold bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-mono uppercase tracking-wider block border border-slate-700">
                          EST. 2024
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Details Area */}
                  <div className="p-6 md:p-8 space-y-6">
                    
                    {/* Metadata block: Invoice Nº, Date, Vehicle Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100 text-xs">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">INVOICE NUMBER</span>
                        <strong className="text-sm font-mono font-bold text-slate-800">{activeInvoice.invoiceNumber || 'INV-000000'}</strong>
                        <span className="text-[9px] text-slate-400 block pt-0.5">Issue Date: {formatDate(activeInvoice.date)}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">INVOICE TO</span>
                        <strong className="text-xs font-black text-slate-900 block">{activeInvoice.customerName}</strong>
                        {(() => {
                          const matchedCustomer = customers.find(c => c.id === activeInvoice.customerId || c.name.toLowerCase() === activeInvoice.customerName.toLowerCase());
                          const phone = matchedCustomer?.phone || activeInvoice.customerPhone;
                          const email = matchedCustomer?.email || activeInvoice.customerEmail;
                          const address = matchedCustomer?.address || activeInvoice.customerAddress;

                          return (
                            <>
                              <p className="text-3xs text-slate-500 font-medium">Mob: {phone}</p>
                              {email && <p className="text-3xs text-slate-500 truncate">Email: {email}</p>}
                              {address && (
                                <p className="text-3xs text-slate-500 font-medium mt-1 bg-slate-50 p-1 px-1.5 rounded border border-slate-100/80 leading-tight">
                                  <strong>Address:</strong> {address}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      <div className="space-y-1 bg-slate-50 border border-slate-100/80 p-2.5 rounded-lg">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">VEHICLE PROFILE</span>
                        <strong className="text-xs font-black text-slate-800 block">
                          {activeInvoice.vehicle.year} {activeInvoice.vehicle.make} {activeInvoice.vehicle.model}
                        </strong>
                      </div>
                    </div>

                    {/* Table of items: PRODUCT, PRICE, QTY, TOTAL */}
                    <div className="overflow-hidden rounded-lg border border-slate-100 font-sans">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
                            <th className="py-2.5 px-4">PRODUCT TREATMENT</th>
                            <th className="py-2.5 px-3 text-center w-20">PRICE</th>
                            <th className="py-2.5 px-3 text-center w-16">QTY</th>
                            <th className="py-2.5 px-4 text-right w-24">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700 bg-white">
                          {/* Core Package Row */}
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4">
                              <strong className="font-extrabold text-slate-900 block">{activeInvoice.serviceName}</strong>
                              <span className="text-3xs text-slate-400 block pt-0.5">Core doorstep detailing package tailored for vehicle size ({activeInvoice.vehicle.size.replace('_', ' ')})</span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-medium">
                              ₹{activeInvoice.price - activeInvoice.addOns.reduce((s, a) => s + a.price, 0)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono">1</td>
                            <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                              ₹{activeInvoice.price - activeInvoice.addOns.reduce((s, a) => s + a.price, 0)}
                            </td>
                          </tr>

                          {/* Add-ons Rows */}
                          {activeInvoice.addOns.map(addon => (
                            <tr key={addon.id} className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                              <td className="py-3 px-4">
                                <strong className="font-bold text-slate-800 block">+ {addon.name}</strong>
                                <span className="text-3xs text-slate-400 block pt-0.5">Premium specialized treatment add-on</span>
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-medium">₹{addon.price}</td>
                              <td className="py-3 px-3 text-center font-mono">1</td>
                              <td className="py-3 px-4 text-right font-mono font-black text-slate-900">₹{addon.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer Area: Terms & Calculations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      
                      {/* Fine print & Authorised signature */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">TERMS AND CONDITIONS</span>
                          <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                            This receipt acknowledges digital billing via the Dr Washit detailing network. Hydrophobic coating services include product verification. For inquiries, please reach out to our customer support desk.
                          </p>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-3">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">AUTHORISED SIGNATORY</span>
                          <div className="h-10 flex items-center justify-start py-1">
                            {/* Hand-drawn elegant D signature SVG */}
                            <svg width="110" height="40" viewBox="0 0 100 40" fill="none" className="text-slate-700 opacity-90">
                              <path d="M20 8 C15 15, 12 35, 22 35 C32 35, 45 15, 38 8 C32 2, 22 5, 22 18 C22 28, 38 32, 50 30 C65 28, 80 25, 92 24 M42 22 C55 20, 68 18, 82 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="text-xs font-black text-slate-800 block font-sans uppercase tracking-wider">Dr Washit</span>
                        </div>
                      </div>

                      {/* Mathematical computations */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/80 space-y-3 self-start text-xs">
                        <div className="flex justify-between font-medium text-slate-500 text-3xs uppercase tracking-wider">
                           <span>Net Subtotal:</span>
                           <span className="font-mono font-bold text-slate-700">₹{getSubtotal(activeInvoice.price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-slate-500 text-3xs uppercase tracking-wider">
                           <span>Sales Tax ({settings.taxRate || 0}%):</span>
                           <span className="font-mono font-bold text-slate-700">₹{getTaxAmount(activeInvoice.price).toFixed(2)}</span>
                        </div>
                        
                        <hr className="border-slate-200" />
                        
                        <div className="flex justify-between items-center text-slate-900">
                          <span className="text-xs font-black uppercase tracking-wider">TOTAL DUE:</span>
                          <span className="text-base font-black text-slate-900 font-mono">₹{activeInvoice.price.toFixed(2)}</span>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Brand Contact Footer Bar */}
                  <div className="bg-slate-900 text-slate-400 px-6 py-4 text-3xs flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800">
                    <span className="font-bold uppercase tracking-widest text-sky-400">THANK YOU FOR YOUR TRUST!</span>
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                      <span className="flex items-center gap-1">
                        <Phone size={10} className="text-sky-400" />
                        <span>8510002780</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={10} className="text-sky-400" />
                        <span>info.drwashit@gmail.com</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe size={10} className="text-sky-400" />
                        <span>www.drwashit.com</span>
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <FileText size={48} className="text-slate-200 mb-2" />
              <p className="text-sm font-semibold text-slate-500">No active invoices recorded</p>
              <p className="text-xs text-slate-400 mt-1">Please log doorstep appointments to automatically formulate printable receipts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
