/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  DollarSign,
  Sliders,
  X,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

export interface Expense {
  id: string;
  title: string;
  category?: 'chemicals' | 'equipment' | 'rent' | 'utilities' | 'wages' | 'marketing' | 'other';
  amount: number;
  date: string;
  vendor: string;
  notes?: string;
  name?: string;
}

interface ExpensesManagerProps {
  expenses: Expense[];
  onAddExpense: (exp: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpensesManager({
  expenses = [],
  onAddExpense,
  onDeleteExpense
}: ExpensesManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  // Local date helper
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      name: title.trim(), // sync name with title
      category: 'other',
      amount: Number(amount),
      date,
      vendor: vendor.trim(),
      notes: notes.trim()
    };

    onAddExpense(newExpense);
    setShowAddModal(false);
    
    // Reset Form
    setTitle('');
    setAmount('');
    setDate(getLocalDateString());
    setVendor('');
    setNotes('');
  };

  const filteredExpenses = expenses.filter(exp => {
    const titleVal = exp.title || exp.name || '';
    const vendorVal = exp.vendor || '';
    const matchesSearch = titleVal.toLowerCase().includes(search.toLowerCase()) || 
                          vendorVal.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const todayStr = getLocalDateString();
  const thisMonthPrefix = todayStr.substring(0, 7); // "YYYY-MM"

  // Calculation metrics
  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  const todayExpenseSum = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);
  const thisMonthExpenseSum = expenses
    .filter(e => e.date && e.date.startsWith(thisMonthPrefix))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6" id="expenses-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Expenses & Shop Costs</h1>
          <p className="text-xs text-slate-400">Log and monitor business overhead, utilities, and wash supplies</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Log Shop Expense
        </button>
      </div>

      {/* Grid Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-2">
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Total Expenses</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-black text-rose-400 font-mono">₹{totalExpenseSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            <span className="text-4xs text-slate-500 font-bold">All Time</span>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-2">
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Today's Expenses</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-lg font-black text-white font-mono">₹{todayExpenseSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            <span className="text-4xs text-cyan-400 font-bold">Today</span>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-2">
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">This Month's Expenses</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-lg font-black text-white font-mono">₹{thisMonthExpenseSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            <span className="text-4xs text-emerald-400 font-bold">Month view</span>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-2">
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Total Logs Count</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-lg font-black text-white font-mono">{expenses.length}</strong>
            <span className="text-4xs text-amber-400 font-bold">Log entries</span>
          </div>
        </div>
      </div>

      {/* Control filters & table */}
      <div className="bg-[#131D35] border border-slate-800/40 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by title or vendor..."
              className="text-xs px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white w-full focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Expenses List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-3xs font-extrabold uppercase tracking-wider bg-slate-950">
                <th className="py-3 px-4">Title / Description</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Logged Date</th>
                <th className="py-3 px-4 text-right">Amount Cost</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                    <Sliders size={28} className="mx-auto mb-2 text-slate-600" />
                    No expense logs found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-900/30 transition-all">
                    <td className="py-3.5 px-4">
                      <strong className="text-white font-bold block">{exp.title || exp.name}</strong>
                      {exp.notes && <span className="text-3xs text-slate-500 block truncate max-w-xs">{exp.notes}</span>}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-400">
                      {exp.vendor || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-3xs">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white">
                      ₹{exp.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 rounded transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cost Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={16} className="text-rose-400" />
                Log Business Expense
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Expense Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bulk microfibers, Car shampoo"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Cost Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Vendor / Payee</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Chemical Guys"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Receipt saved on drive"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white h-16 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Confirm Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
