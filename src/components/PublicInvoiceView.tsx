/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Printer,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Appointment, ShopSettings } from '../types/crm';
import { DrWashitLogo } from './DrWashitLogo';

interface PublicInvoiceViewProps {
  appointment: Appointment;
  settings: ShopSettings;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export default function PublicInvoiceView({ appointment, settings }: PublicInvoiceViewProps) {
  const getSubtotal = (price: number) => {
    return Math.round((price / (1 + (settings.taxRate || 0) / 100)) * 100) / 100;
  };

  const getTaxAmount = (price: number) => {
    const sub = getSubtotal(price);
    return Math.round((price - sub) * 100) / 100;
  };

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = appointment.customerPhone.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col justify-start items-center p-4 md:p-8 font-sans">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          #public-invoice-sheet {
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
        }
      `}} />

      {/* Top Banner Notice for Customers */}
      <div className="max-w-2xl w-full bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl mb-6 text-center no-print space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">DR WASHIT DIGITAL PORTAL</span>
        </div>
        <h1 className="text-sm font-extrabold text-white">Hello, {appointment.customerName}! Here is your digital invoice.</h1>
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
          We have generated your doorstep car detailing receipt. You can download or print it as a physical PDF below.
        </p>
        
        {/* Quick Action Controls */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Printer size={13} />
            <span>Print / Save PDF</span>
          </button>
          
          <a
            href={`https://wa.me/918510002780?text=${encodeURIComponent(`Hi Dr Washit, I have an inquiry regarding my invoice *${appointment.invoiceNumber || 'INV-000000'}*`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700/80"
          >
            <MessageSquare size={13} className="text-emerald-400" />
            <span>Contact Support</span>
          </a>
        </div>
      </div>

      {/* Printable Invoice Card */}
      <div 
        id="public-invoice-sheet" 
        className="max-w-2xl w-full bg-white text-slate-900 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl print:border-0 print:shadow-none print:rounded-none"
      >
        {/* Top Branding Banner */}
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
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">INVOICE NUMBER</span>
              <strong className="text-sm font-mono font-bold text-slate-800">{appointment.invoiceNumber || 'INV-000000'}</strong>
              <span className="text-[9px] text-slate-400 block pt-0.5">Issue Date: {formatDate(appointment.date)}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">INVOICE TO</span>
              <strong className="text-xs font-black text-slate-900 block">{appointment.customerName}</strong>
              <p className="text-3xs text-slate-500 font-medium">Mob: {appointment.customerPhone}</p>
              {appointment.customerEmail && <p className="text-3xs text-slate-500 truncate">Email: {appointment.customerEmail}</p>}
            </div>

            <div className="space-y-1 bg-slate-50 border border-slate-100/80 p-2.5 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">VEHICLE PROFILE</span>
                <strong className="text-xs font-black text-slate-800 block">
                  {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                </strong>
              </div>
              
              {/* Payment status pill in the header */}
              <div className="pt-2">
                {appointment.paymentStatus === 'paid' ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <CheckCircle size={10} className="text-emerald-600" />
                    <span>PAID</span>
                  </span>
                ) : appointment.paymentStatus === 'partially_paid' ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <AlertCircle size={10} className="text-sky-600" />
                    <span>PARTIALLY PAID (₹{appointment.paidAmount || 0})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Clock size={10} className="text-amber-600 animate-pulse" />
                    <span>UNPAID</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Table of Items */}
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
                    <strong className="font-extrabold text-slate-900 block">{appointment.serviceName}</strong>
                    <span className="text-3xs text-slate-400 block pt-0.5">Core doorstep detailing package tailored for vehicle size ({appointment.vehicle.size.replace('_', ' ')})</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    ₹{appointment.price - (appointment.addOns || []).reduce((s, a) => s + a.price, 0)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">1</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                    ₹{appointment.price - (appointment.addOns || []).reduce((s, a) => s + a.price, 0)}
                  </td>
                </tr>

                {/* Add-ons Rows */}
                {(appointment.addOns || []).map(addon => (
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

          {/* Calculations Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">TERMS AND CONDITIONS</span>
                <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                  This receipt acknowledges digital billing via the Dr Washit detailing network. Hydrophobic coating services include product verification. For inquiries, please reach out to our customer support desk.
                </p>
              </div>
              
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">AUTHORISED SIGNATORY</span>
                <div className="h-10 flex items-center justify-start py-1">
                  <svg width="110" height="40" viewBox="0 0 100 40" fill="none" className="text-slate-700 opacity-90">
                    <path d="M20 8 C15 15, 12 35, 22 35 C32 35, 45 15, 38 8 C32 2, 22 5, 22 18 C22 28, 38 32, 50 30 C65 28, 80 25, 92 24 M42 22 C55 20, 68 18, 82 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-xs font-black text-slate-800 block font-sans uppercase tracking-wider">Dr Washit</span>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/80 space-y-3 self-start text-xs">
              <div className="flex justify-between font-medium text-slate-500 text-3xs uppercase tracking-wider">
                 <span>Net Subtotal:</span>
                 <span className="font-mono font-bold text-slate-700">₹{getSubtotal(appointment.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-500 text-3xs uppercase tracking-wider">
                 <span>Sales Tax ({settings.taxRate || 0}%):</span>
                 <span className="font-mono font-bold text-slate-700">₹{getTaxAmount(appointment.price).toFixed(2)}</span>
              </div>
              
              <hr className="border-slate-200" />
              
              <div className="flex justify-between items-center text-slate-900">
                <span className="text-xs font-black uppercase tracking-wider">TOTAL DUE:</span>
                <span className="text-base font-black text-slate-900 font-mono">₹{appointment.price.toFixed(2)}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
