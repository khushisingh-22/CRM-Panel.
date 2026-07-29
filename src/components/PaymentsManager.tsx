/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Search,
  Sliders,
  CheckCircle,
  AlertCircle,
  Trash2,
  Calendar,
  X,
  FileText,
  Printer,
  ChevronRight
} from 'lucide-react';
import { Appointment } from '../types/crm';

interface PaymentsManagerProps {
  appointments: Appointment[];
  onUpdateAppointment: (updated: Appointment) => void;
}

export default function PaymentsManager({
  appointments,
  onUpdateAppointment
}: PaymentsManagerProps) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const paymentRecords = appointments
    .filter(apt => apt.status !== 'cancelled')
    .filter(apt => {
      const matchesSearch = apt.customerName.toLowerCase().includes(search.toLowerCase()) || 
                            apt.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                            apt.serviceName.toLowerCase().includes(search.toLowerCase());
      
      const matchesMethod = methodFilter === 'all' || apt.paymentMethod === methodFilter;
      return matchesSearch && matchesMethod;
    });

  const totalCollected = appointments
    .filter(apt => apt.paymentStatus === 'paid')
    .reduce((sum, apt) => sum + apt.price, 0);

  const pendingCollection = appointments
    .filter(apt => apt.paymentStatus !== 'paid')
    .reduce((sum, apt) => sum + apt.price, 0);

  const methodColors: Record<string, string> = {
    stripe: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    apple_pay: 'bg-slate-200/10 text-slate-100 border-slate-500/20',
    cash: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    card: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    bank_transfer: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const methodLabels: Record<string, string> = {
    stripe: 'Stripe Direct',
    apple_pay: 'Apple Pay',
    cash: 'Cash Register',
    card: 'Terminal Card',
    bank_transfer: 'Bank Wire'
  };

  return (
    <div className="space-y-6" id="payments-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Payment Ledgers & Receipts</h1>
          <p className="text-xs text-slate-400">Review revenue collections, transaction payment methods, and pending deposits</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-1">
          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Revenue Deposited</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-black text-emerald-400 font-mono">${totalCollected.toFixed(2)}</strong>
            <span className="text-4xs text-emerald-500 font-bold">Cleared Cash</span>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-1">
          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Accounts Receivable</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-black text-rose-400 font-mono">${pendingCollection.toFixed(2)}</strong>
            <span className="text-4xs text-rose-500 font-bold">Unpaid Invoices</span>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-1">
          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Transaction Entries</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-black text-white">{paymentRecords.length}</strong>
            <span className="text-4xs text-slate-500 font-bold">Matching Filters</span>
          </div>
        </div>
      </div>

      {/* Main Ledger card */}
      <div className="bg-[#131D35] border border-slate-800/40 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client or invoice number..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setMethodFilter('all')}
              className={`px-3 py-1 text-4xs font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap border ${
                methodFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Channels
            </button>
            {Object.entries(methodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMethodFilter(key)}
                className={`px-3 py-1 text-4xs font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap border ${
                  methodFilter === key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-3xs font-extrabold uppercase tracking-wider bg-slate-950">
                <th className="py-3 px-4">Invoice Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Treatment Package</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4">Settlement Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Settled Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {paymentRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                    <Sliders size={28} className="mx-auto mb-2 text-slate-600" />
                    No payments match criteria. Ensure jobs are marked as Paid.
                  </td>
                </tr>
              ) : (
                paymentRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-900/30 transition-all">
                    <td className="py-3.5 px-4 font-mono text-3xs font-bold text-white">
                      {record.invoiceNumber || 'INV-TEMP'}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-100 font-bold block">{record.customerName}</strong>
                      <span className="text-3xs text-slate-500 font-mono block">{record.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-3xs font-semibold text-slate-300 block truncate max-w-xs">{record.serviceName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {record.paymentMethod ? (
                        <span className={`px-2 py-0.5 rounded-full text-4xs font-extrabold uppercase border ${methodColors[record.paymentMethod]}`}>
                          {methodLabels[record.paymentMethod] || record.paymentMethod.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-4xs text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-3xs text-slate-400">
                      {record.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-4xs font-bold uppercase ${
                        record.paymentStatus === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white">
                      ${record.price.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
