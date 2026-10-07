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

  return (
    <div className="space-y-6 select-none animate-fade-in" id="packages-manager-panel">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight md:text-2xl">Service Packages</h1>
          <p className="text-xs text-[#475569]">Bundle services with special promotional rates</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Package</span>
        </button>
      </div>

      {/* Info Card / Total KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center gap-4 shadow-md border-t-[3px] border-t-[#0891B2] hover:-translate-y-0.5 transition-all duration-200">
          <div className="p-3 bg-[#ECFEFF] text-[#0891B2] rounded-xl flex items-center justify-center">
            <Package size={20} />
          </div>
          <div className="text-left">
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Total Active Packages</span>
            <strong className="text-lg font-black text-[#0F172A]">{packages.filter(p => p.status).length}</strong>
          </div>
        </div>

        <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center gap-4 shadow-md border-t-[3px] border-t-[#FACC15] hover:-translate-y-0.5 transition-all duration-200 text-left">
          <div className="p-3 bg-[#FEF9C3] text-[#D97706] rounded-xl flex items-center justify-center">
            <Search size={20} />
          </div>
          <div className="w-full">
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block mb-1">Search Packages</span>
            <input
              type="text"
              placeholder="Filter by package name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-[#CBD5E1] px-3 py-1.5 text-xs text-[#1E293B] rounded-lg w-full focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none placeholder-[#94A3B8]"
            />
          </div>
        </div>
      </div>

      {/* Your Packages Grid Table */}
      <div className="bg-white border border-[#E5EDF3] rounded-2xl overflow-hidden shadow-md text-left" id="packages-table-card">
        <div className="px-6 py-5 border-b border-[#E5EDF3] flex items-center gap-2 bg-[#F4F8FB]">
          <Package className="text-[#0891B2] shrink-0" size={16} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Your Packages</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E5EDF3] text-xs font-bold uppercase tracking-wider text-[#334155] bg-[#F4F8FB]">
                <th className="px-6 py-4">Package Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EDF3] text-[#1E293B]">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-semibold">
                    No service packages found. Click "New Package" to create one.
                  </td>
                </tr>
              ) : (
                filteredPackages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-[#F4F8FB] transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0F172A]">{pkg.name}</td>
                    <td className="px-6 py-4 font-semibold text-[#16A34A]">₹{pkg.originalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-[#475569]">{pkg.duration}</td>
                    <td className="px-6 py-4">
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(pkg.id)}
                        className={`w-9 h-5 rounded-full transition-all relative outline-none flex items-center px-0.5 cursor-pointer ${
                          pkg.status ? 'bg-[#16A34A] justify-end' : 'bg-slate-300 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow-sm transition-all" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end opacity-85 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(pkg)}
                          className="p-1.5 text-[#64748B] hover:text-[#0891B2] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-1.5 text-[#64748B] hover:text-[#EF4444] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E5EDF3] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in text-[#1E293B]">
            <div className="px-6 py-4 border-b border-[#E5EDF3] flex items-center justify-between bg-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-[#0E7490]">
                <Package size={16} className="text-[#0891B2]" />
                Add Package
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-650 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Wash In a Month"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none placeholder-[#94A3B8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="1399"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none placeholder-[#94A3B8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1E293B] block mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 0h or 1 month"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none placeholder-[#94A3B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1E293B] block mb-1">Active Status</label>
                  <div className="flex items-center h-9">
                    <button
                      type="button"
                      onClick={() => setStatus(!status)}
                      className={`w-9 h-5 rounded-full transition-all relative outline-none flex items-center px-0.5 cursor-pointer ${
                        status ? 'bg-[#16A34A] justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                    <span className="text-xs text-[#475569] font-medium ml-2.5 uppercase tracking-wider">
                      {status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-[#E5EDF3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#334155] text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-lg shadow-md cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E5EDF3] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in text-[#1E293B]">
            <div className="px-6 py-4 border-b border-[#E5EDF3] flex items-center justify-between bg-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-[#0E7490]">
                <Package size={16} className="text-[#0891B2]" />
                Edit Package
              </h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-650 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Wash In a Month"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none placeholder-[#94A3B8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="1399"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none placeholder-[#94A3B8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1E293B] block mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 0h or 1 month"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none placeholder-[#94A3B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1E293B] block mb-1">Active Status</label>
                  <div className="flex items-center h-9">
                    <button
                      type="button"
                      onClick={() => setStatus(!status)}
                      className={`w-9 h-5 rounded-full transition-all relative outline-none flex items-center px-0.5 cursor-pointer ${
                        status ? 'bg-[#16A34A] justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                    <span className="text-xs text-[#475569] font-medium ml-2.5 uppercase tracking-wider">
                      {status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-[#E5EDF3]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#334155] text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-lg shadow-md cursor-pointer"
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
