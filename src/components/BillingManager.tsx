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
  AlertCircle
} from 'lucide-react';
import { Appointment, ShopSettings } from '../types/crm';

interface BillingManagerProps {
  appointments: Appointment[];
  settings: ShopSettings;
  onUpdateAppointment: (updated: Appointment) => void;
}

export default function BillingManager({
  appointments,
  settings,
  onUpdateAppointment
}: BillingManagerProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    appointments[0]?.id || null
  );

  const filteredInvoices = appointments
    .filter(a => a.status !== 'cancelled')
    .filter(a => {
      const matchesSearch =
        a.customerName.toLowerCase().includes(search.toLowerCase()) ||
        a.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        a.vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
        a.vehicle.model.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterType === 'all' ||
        (filterType === 'paid' && a.paymentStatus === 'paid') ||
        (filterType === 'unpaid' && a.paymentStatus !== 'paid');

      return matchesSearch && matchesStatus;
    });

  const activeInvoice = appointments.find(a => a.id === selectedInvoiceId);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight md:text-2xl">Invoicing & Billing Hub</h1>
          <p className="text-xs text-slate-500">Generate itemized job invoices, track transaction payments, and print customer receipts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="billing-grid-container">
        {/* Left: Invoice Registry List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs flex flex-col h-[650px] overflow-hidden">
          
          {/* Search/filter bar */}
          <div className="p-4 border-b border-slate-100 shrink-0 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or client..."
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 bg-slate-50 border border-slate-200 p-1 rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('paid')}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'paid' ? 'bg-white text-emerald-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setFilterType('unpaid')}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'unpaid' ? 'bg-white text-rose-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Unpaid
              </button>
            </div>
          </div>

          {/* Directory */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                <span className="text-xs font-semibold">No invoices recorded</span>
              </div>
            ) : (
              filteredInvoices.map(invoice => {
                const isSelected = invoice.id === selectedInvoiceId;
                return (
                  <div
                    key={invoice.id}
                    onClick={() => setSelectedInvoiceId(invoice.id)}
                    className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/30 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-3xs font-mono font-bold text-slate-400">{invoice.invoiceNumber || 'INV-TEMP'}</span>
                        <span className={`text-4xs font-bold uppercase px-1 rounded ${
                          invoice.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {invoice.paymentStatus}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{invoice.customerName}</h4>
                      <span className="text-3xs text-slate-500 block truncate">
                        {invoice.vehicle.year} {invoice.vehicle.make} {invoice.vehicle.model}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-950 block font-mono">${invoice.price}</span>
                      <span className="text-3xs text-slate-400">{invoice.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Printable Invoice Template Visual */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs h-[650px] flex flex-col overflow-hidden">
          {activeInvoice ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Payment Actions header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Invoice Actions:</span>
                  <button
                    onClick={() => handleTogglePaymentStatus(activeInvoice)}
                    className={`px-3 py-1.5 rounded-lg text-3xs font-extrabold uppercase tracking-wider border transition-all ${
                      activeInvoice.paymentStatus === 'paid'
                        ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {activeInvoice.paymentStatus === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                  </button>
                </div>

                {activeInvoice.paymentStatus !== 'paid' && (
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                    <span className="text-3xs text-slate-400 font-bold px-1.5 uppercase">Record Cash/Card:</span>
                    {['cash', 'card', 'stripe', 'apple_pay'].map(method => (
                      <button
                        key={method}
                        onClick={() => handleSetPaymentMethod(activeInvoice, method as any)}
                        className="px-2 py-1 text-4xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded uppercase transition-all"
                      >
                        {method.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handlePrintMock}
                  className="p-1.5 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ml-auto cursor-pointer"
                >
                  <Printer size={14} />
                  Print Receipt
                </button>
              </div>

              {/* Printable Invoice Sheet Visual */}
              <div className="flex-1 overflow-y-auto p-8 font-sans print:p-0" id="printable-invoice-sheet">
                <div className="max-w-2xl mx-auto space-y-8 bg-white border border-slate-100 p-8 rounded-xl print:border-0 print:p-0">
                  
                  {/* Top: Branding & Invoice code */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 bg-indigo-600 rounded-md"></span>
                        <strong className="text-base font-extrabold text-slate-900 tracking-tight">{settings.shopName}</strong>
                      </div>
                      <p className="text-2xs text-slate-500 max-w-xs leading-relaxed">
                        {settings.address}
                        <br />
                        Phone: {settings.phone} | Email: {settings.email}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-2xl font-black text-slate-400 uppercase tracking-wide block">INVOICE</span>
                      <span className="text-xs font-mono font-bold text-slate-900 block">Code: {activeInvoice.invoiceNumber || 'N/A'}</span>
                      <span className="text-3xs text-slate-400 block font-medium">Issue Date: {activeInvoice.date}</span>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Mid: Bill to & Car information */}
                  <div className="grid grid-cols-2 gap-6 text-xs">
                    <div className="space-y-2">
                      <span className="text-3xs font-bold uppercase text-slate-400 tracking-wider block">Customer Details</span>
                      <div className="space-y-1">
                        <strong className="text-xs font-bold text-slate-900 block">{activeInvoice.customerName}</strong>
                        <p className="text-2xs text-slate-500">Phone: {activeInvoice.customerPhone}</p>
                        <p className="text-2xs text-slate-500">Email: {activeInvoice.customerEmail || 'No email logged'}</p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <span className="text-3xs font-bold uppercase text-slate-400 tracking-wider block">Vehicle Service Profile</span>
                      <div className="space-y-0.5 text-2xs">
                        <strong className="text-slate-800 font-semibold block">
                          {activeInvoice.vehicle.year} {activeInvoice.vehicle.make} {activeInvoice.vehicle.model}
                        </strong>
                        <span className="text-slate-500 block uppercase">Plate No: <strong className="font-mono text-slate-700">{activeInvoice.vehicle.licensePlate || 'N/A'}</strong></span>
                        <span className="text-slate-500 block">Class Size: <strong className="text-slate-700">{activeInvoice.vehicle.size.replace('_', ' ')}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Table of items */}
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-150 text-slate-500 text-3xs font-bold uppercase tracking-wider">
                        <th className="py-2.5">Treatment Item Description</th>
                        <th className="py-2.5 text-center">Qty</th>
                        <th className="py-2.5 text-right">Price Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-2xs text-slate-700">
                      {/* Core package */}
                      <tr>
                        <td className="py-3">
                          <strong className="font-bold text-slate-900 block">{activeInvoice.serviceName}</strong>
                          <span className="text-3xs text-slate-400 block">Core detailing package customized for {activeInvoice.vehicle.size.replace('_', ' ')}</span>
                        </td>
                        <td className="py-3 text-center font-mono">1</td>
                        <td className="py-3 text-right font-mono font-semibold text-slate-900">
                          ${activeInvoice.price - activeInvoice.addOns.reduce((s, a) => s + a.price, 0)}
                        </td>
                      </tr>

                      {/* Add-ons */}
                      {activeInvoice.addOns.map(addon => (
                        <tr key={addon.id}>
                          <td className="py-3">
                            <strong className="font-semibold text-slate-800 block">+ {addon.name}</strong>
                            <span className="text-3xs text-slate-400 block">Selected premium treatment add-on</span>
                          </td>
                          <td className="py-3 text-center font-mono">1</td>
                          <td className="py-3 text-right font-mono font-semibold text-slate-900">${addon.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Subtotal & Sales Tax computations */}
                  <div className="flex justify-end text-xs">
                    <div className="w-64 space-y-2 border-t border-slate-100 pt-4">
                      <div className="flex justify-between font-medium text-slate-500 text-2xs">
                        <span>Net Subtotal:</span>
                        <span className="font-mono">${getSubtotal(activeInvoice.price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-500 text-2xs">
                        <span>Sales Tax ({settings.taxRate}%):</span>
                        <span className="font-mono">${getTaxAmount(activeInvoice.price).toFixed(2)}</span>
                      </div>
                      <hr className="border-slate-100" />
                      <div className="flex justify-between text-sm font-extrabold text-slate-900">
                        <span>Total Due:</span>
                        <span className="font-mono">${activeInvoice.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Terms */}
                  <div className="text-center text-4xs text-slate-400 space-y-1.5 border-t border-dashed border-slate-200 pt-6">
                    <span className="font-bold block uppercase tracking-wider">Thank you for trusting us with your asset!</span>
                    <p className="max-w-md mx-auto leading-relaxed">
                      All nano-ceramic coating sessions include a 3-year hydrophobic product warranty. For complaints or maintenance washes, please contact us within 7 days of treatment checkout.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <FileText size={48} className="text-slate-200 mb-2" />
              <p className="text-sm font-semibold text-slate-500">No invoice selected</p>
              <p className="text-xs text-slate-400 mt-1">Select an active invoice from the sidebar directory to inspect details.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
