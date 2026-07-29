/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  Edit3,
  Trash2,
  AlertTriangle,
  Search,
  Check,
  X,
  Layers,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'chemicals' | 'towels' | 'pads' | 'coatings' | 'other';
  quantity: number;
  unit: string;
  minThreshold: number;
  costPrice: number;
  location?: string;
}

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onUpdateInventory: (updated: InventoryItem[]) => void;
}

export default function InventoryManager({
  inventory,
  onUpdateInventory
}: InventoryManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add Item states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('chemicals');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('bottles');
  const [minThreshold, setMinThreshold] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [location, setLocation] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name,
      category,
      quantity: Number(quantity),
      unit,
      minThreshold: Number(minThreshold || 5),
      costPrice: Number(costPrice || 0),
      location
    };

    onUpdateInventory([newItem, ...inventory]);
    setShowAddModal(false);

    // Reset Form
    setName('');
    setCategory('chemicals');
    setQuantity('');
    setUnit('bottles');
    setMinThreshold('');
    setCostPrice('');
    setLocation('');
  };

  const handleDeleteItem = (id: string) => {
    onUpdateInventory(inventory.filter(item => item.id !== id));
  };

  const handleAdjustQuantity = (id: string, delta: number) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    onUpdateInventory(updated);
  };

  const getStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-rose-500/15 text-rose-400 border-rose-500/20' };
    if (item.quantity <= item.minThreshold) return { label: 'Low Stock', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
    return { label: 'In Stock', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = inventory.filter(item => item.quantity <= item.minThreshold).length;

  const categoryLabels: Record<InventoryItem['category'], string> = {
    chemicals: 'Soaps & Cleaners',
    towels: 'Microfibers & Cloths',
    pads: 'Polishing Pads',
    coatings: 'Ceramic Coatings',
    other: 'General Supplies'
  };

  return (
    <div className="space-y-6" id="inventory-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Inventory & Stock Tracking</h1>
          <p className="text-xs text-slate-400">Manage detailing chemicals, towels, buffing pads, and coatings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Add Supply Item
        </button>
      </div>

      {/* Grid Overview Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Supply Items</span>
            <strong className="text-lg font-black text-white">{inventory.length}</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Low Stock Alerts</span>
            <strong className={`text-lg font-black ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{lowStockCount}</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Estimated Value</span>
            <strong className="text-lg font-black text-emerald-400 font-mono">
              ₹{inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Table & Filtering */}
      <div className="bg-[#131D35] border border-slate-800/40 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800/40 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/10">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 text-4xs font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap border ${
                categoryFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-3 py-1 text-4xs font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap border ${
                  categoryFilter === key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-3xs font-extrabold uppercase tracking-wider bg-slate-950">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Storage Bay</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                    <Package size={28} className="mx-auto mb-2 text-slate-600" />
                    No supply items found in database.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/30 transition-all">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-3xs font-semibold text-slate-400">
                          {categoryLabels[item.category]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAdjustQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-800 rounded bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-mono font-bold text-white min-w-8 text-center">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => handleAdjustQuantity(item.id, 1)}
                            className="p-1 hover:bg-slate-800 rounded bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold">{item.minThreshold}</span>
                          <span className={`px-1.5 py-0.5 rounded text-4xs font-extrabold border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">
                        ₹{item.costPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-3xs font-medium">
                        {item.location || 'Aisle A'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supply Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Package size={16} className="text-indigo-400" />
                Add Supply Item
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hydrophobic Ceramic Pro 50ml"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                  >
                    {Object.entries(categoryLabels).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Stock Level Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 15"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Unit Typology</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. bottles"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    required
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    placeholder="e.g. 5"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Storage Shelf Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Aisle B, Shelf 3"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
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
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
