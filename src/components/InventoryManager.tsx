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
  category: string;
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

  // Add Item states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('shampoo');
  const [customCategory, setCustomCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minThreshold, setMinThreshold] = useState('60');
  const [unit, setUnit] = useState('bottles');
  const [costPrice, setCostPrice] = useState('');
  const [location, setLocation] = useState('');

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (newCat === 'shampoo') {
      setMinThreshold('60');
    } else if (newCat === 'papermats') {
      setMinThreshold('30');
    } else if (newCat === 'paperAirFreshner') {
      setMinThreshold('20');
    } else {
      setMinThreshold('5');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;

    const finalCategory = category === 'custom' ? (customCategory.trim() || 'Custom') : category;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name,
      category: finalCategory,
      quantity: Number(quantity),
      unit,
      minThreshold: Number(minThreshold) || 5,
      costPrice: Number(costPrice || 0),
      location
    };

    onUpdateInventory([newItem, ...inventory]);
    setShowAddModal(false);

    // Reset Form
    setName('');
    setCategory('shampoo');
    setCustomCategory('');
    setMinThreshold('60');
    setQuantity('');
    setUnit('bottles');
    setCostPrice('');
    setLocation('');
  };

  // Edit Item states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('shampoo');
  const [editCustomCategory, setEditCustomCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editMinThreshold, setEditMinThreshold] = useState('5');
  const [editUnit, setEditUnit] = useState('bottles');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    
    const isDefaultCat = ['shampoo', 'papermats', 'paperAirFreshner'].includes(item.category);
    if (isDefaultCat) {
      setEditCategory(item.category);
      setEditCustomCategory('');
    } else {
      setEditCategory('custom');
      setEditCustomCategory(item.category);
    }
    
    setEditQuantity(String(item.quantity));
    setEditMinThreshold(String(item.minThreshold ?? 5));
    setEditUnit(item.unit);
    setEditCostPrice(String(item.costPrice));
    setEditLocation(item.location || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName || !editQuantity) return;

    const finalCategory = editCategory === 'custom' ? (editCustomCategory.trim() || 'Custom') : editCategory;

    const updated = inventory.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          name: editName,
          category: finalCategory,
          quantity: Number(editQuantity),
          minThreshold: Number(editMinThreshold) || 5,
          unit: editUnit,
          costPrice: Number(editCostPrice || 0),
          location: editLocation
        };
      }
      return item;
    });

    onUpdateInventory(updated);
    setShowEditModal(false);
    setEditingItem(null);
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

  const isLowStock = (item: InventoryItem) => {
    return item.quantity < (item.minThreshold ?? 5);
  };

  const getStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-rose-500/15 text-rose-400 border-rose-500/20' };
    if (isLowStock(item)) return { label: 'Low Stock', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
    return { label: 'In Stock', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
  };

  const filteredItems = inventory.filter(item => {
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  const lowStockCount = inventory.filter(isLowStock).length;

  const categoryLabels: Record<string, string> = {
    shampoo: 'Shampoo',
    papermats: 'Paper Mats',
    paperAirFreshner: 'Paper Air Freshener'
  };

  return (
    <div className="space-y-6" id="inventory-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Inventory & Stock Tracking</h1>
          <p className="text-xs text-slate-400">Manage essential car washing supplies: shampoo, paper mats, and air fresheners</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Alert Reminders for Low Stock Items */}
      {inventory.some(isLowStock) && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 text-amber-300 animate-fade-in" id="low-stock-alert-reminder">
          <AlertTriangle className="shrink-0 mt-0.5 text-amber-400" size={16} />
          <div className="text-xs space-y-1">
            <strong className="font-extrabold block uppercase tracking-wide">⚠️ Low Stock Alert Warning</strong>
            <p className="text-slate-300 font-medium leading-relaxed">
              The following inventory items have fallen below their minimum stock threshold limit:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {inventory.filter(isLowStock).map(item => {
                const thresh = item.minThreshold ?? 5;
                return (
                  <span key={item.id} className="bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-4xs px-2.5 py-1 rounded-md uppercase">
                    {item.name}: {item.quantity} {item.unit} (Limit: <span className="underline">{thresh}</span>)
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grid Overview Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Items</span>
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
        <div className="p-4 border-b border-slate-800/40 flex gap-3 justify-between items-center bg-slate-900/10">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Inventory List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-3xs font-extrabold uppercase tracking-wider bg-slate-950">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
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
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleAdjustQuantity(item.id, -1)}
                              className="p-1 hover:bg-slate-800 rounded bg-slate-950 text-slate-400 border border-slate-800 cursor-pointer"
                            >
                              <Minus size={10} />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                const updated = inventory.map(it => it.id === item.id ? { ...it, quantity: val } : it);
                                onUpdateInventory(updated);
                              }}
                              className="w-14 text-center font-mono font-bold text-white bg-slate-950 border border-slate-850 rounded py-1 focus:outline-hidden focus:border-indigo-500"
                            />
                            <span className="text-slate-400 text-[10px] ml-1 font-semibold">{item.unit}</span>
                            <button
                              onClick={() => handleAdjustQuantity(item.id, 1)}
                              className="p-1 hover:bg-slate-800 rounded bg-slate-950 text-slate-400 border border-slate-800 cursor-pointer"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                            Threshold: {item.minThreshold ?? 5}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">
                        ₹{item.costPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/20 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            title="Edit Item"
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                handleDeleteItem(item.id);
                              }
                            }}
                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            title="Delete Item"
                          >
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Package size={16} className="text-indigo-400" />
                Add Item
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Product Name *</label>
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
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Stock Level Quantity *</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 15"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Alert Threshold</label>
                  <input
                    type="number"
                    required
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    placeholder="e.g. 5"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. litres, sheets, pieces"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Unit Price (₹)</label>
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

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Edit3 size={16} className="text-indigo-400" />
                Edit Inventory Item
              </h2>
              <button onClick={() => { setShowEditModal(false); setEditingItem(null); }} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Hydrophobic Ceramic Pro 50ml"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Stock Level Quantity *</label>
                  <input
                    type="number"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    placeholder="e.g. 15"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Alert Threshold</label>
                  <input
                    type="number"
                    required
                    value={editMinThreshold}
                    onChange={(e) => setEditMinThreshold(e.target.value)}
                    placeholder="e.g. 5"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="e.g. litres, sheets, pieces"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="text-4xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white text-center focus:outline-hidden font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingItem(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
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
