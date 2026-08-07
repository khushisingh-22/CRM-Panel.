/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  X,
  CheckCircle,
  AlertTriangle,
  Search,
  Check,
  Percent
} from 'lucide-react';

export interface BusinessPackage {
  id: string;
  name: string;
  originalPrice: number;
  packagePrice: number;
  duration: string;
  status: boolean;
}

interface PackagesManagerProps {
  packages: BusinessPackage[];
  onUpdatePackages: (updated: BusinessPackage[]) => void;
}

export default function PackagesManager({
  packages,
  onUpdatePackages
}: PackagesManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form states for creating/editing
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [duration, setDuration] = useState('0h');
  const [status, setStatus] = useState(true);

  const handleOpenAddModal = () => {
    setName('');
    setOriginalPrice('');
    setPackagePrice('');
    setDuration('0h');
    setStatus(true);
    setEditingPackageId(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (pkg: BusinessPackage) => {
    setName(pkg.name);
    setOriginalPrice(pkg.originalPrice.toString());
    setPackagePrice(pkg.packagePrice.toString());
    setDuration(pkg.duration);
    setStatus(pkg.status);
    setEditingPackageId(pkg.id);
    setShowEditModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !originalPrice) return;

    const newPkg: BusinessPackage = {
      id: `pkg-${Date.now()}`,
      name,
      originalPrice: Number(originalPrice),
      packagePrice: Number(originalPrice),
      duration,
      status
    };

    onUpdatePackages([newPkg, ...packages]);
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackageId || !name || !originalPrice) return;

    const updated = packages.map(pkg => {
      if (pkg.id === editingPackageId) {
        return {
          ...pkg,
          name,
          originalPrice: Number(originalPrice),
          packagePrice: Number(originalPrice),
          duration,
          status
        };
      }
      return pkg;
    });

    onUpdatePackages(updated);
    setShowEditModal(false);
    setEditingPackageId(null);
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this package?');
    if (confirm) {
      onUpdatePackages(packages.filter(p => p.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = packages.map(pkg => {
      if (pkg.id === id) {
        return { ...pkg, status: !pkg.status };
      }
      return pkg;
    });
    onUpdatePackages(updated);
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(search.toLowerCase())
  );

  const calculateDiscount = (orig: number, pack: number) => {
    if (!orig || orig <= 0) return '0%';
    const pct = Math.round((1 - pack / orig) * 100);
    if (pct <= 0) return '0% off';
    return `${pct}% off`;
  };

  return (
    <div className="space-y-6 select-none animate-fade-in" id="packages-manager-panel">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Service Packages</h1>
          <p className="text-slate-400 text-2xs font-medium mt-1">Bundle services with discounts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          New Package
        </button>
      </div>

      {/* Info Card / Total KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Active Packages</span>
            <strong className="text-lg font-black text-white">{packages.filter(p => p.status).length}</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
            <Search size={20} />
          </div>
          <div className="w-full">
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Search Packages</span>
            <input
              type="text"
              placeholder="Filter by package name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-2 py-1 text-2xs text-white rounded-md w-full focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Your Packages Grid Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="packages-table-card">
        <div className="px-6 py-5 border-b border-slate-800/60 flex items-center gap-2 bg-slate-900/40">
          <Package className="text-indigo-400 shrink-0" size={16} />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">Your Packages</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-3xs font-extrabold uppercase tracking-widest text-slate-400 bg-slate-950/40">
                <th className="px-6 py-4">Package Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-medium">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-semibold">
                    No service packages found. Click "New Package" to create one.
                  </td>
                </tr>
              ) : (
                filteredPackages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-slate-800/10 transition-colors group">
                    <td className="px-6 py-4 font-black text-white">{pkg.name}</td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">₹{pkg.originalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-300">{pkg.duration}</td>
                    <td className="px-6 py-4">
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(pkg.id)}
                        className={`w-9 h-5 rounded-full transition-all relative outline-none flex items-center px-0.5 cursor-pointer ${
                          pkg.status ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow-sm transition-all" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end opacity-85 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(pkg)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-white">
                <Package size={16} className="text-indigo-400" />
                Add Package
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-4xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Wash In a Month"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-4xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="1399"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-4xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 0h or 1 month"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-4xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Active Status</label>
                  <div className="flex items-center h-9">
                    <button
                      type="button"
                      onClick={() => setStatus(!status)}
                      className={`w-9 h-5 rounded-full transition-all relative outline-none flex items-center px-0.5 cursor-pointer ${
                        status ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                    <span className="text-3xs text-slate-400 font-bold ml-2.5 uppercase tracking-wider">
                      {status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-white">
                <Package size={16} className="text-indigo-400" />
                Edit Package
              </h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-4xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Wash In a Month"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-4xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="1399"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-4xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 0h or 1 month"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-4xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Active Status</label>
                  <div className="flex items-center h-9">
                    <button
                      type="button"
                      onClick={() => setStatus(!status)}
                      className={`w-9 h-5 rounded-full transition-all relative outline-none flex items-center px-0.5 cursor-pointer ${
                        status ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                    <span className="text-3xs text-slate-400 font-bold ml-2.5 uppercase tracking-wider">
                      {status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
