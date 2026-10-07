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
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-rose-100 text-[#EF4444] border-rose-200' };
    if (isLowStock(item)) return { label: 'Low Stock', color: 'bg-amber-100 text-[#D97706] border-amber-250' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-[#16A34A] border-emerald-200' };
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
          <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight md:text-2xl">Inventory & Stock Tracking</h1>
          <p className="text-xs text-[#475569]">Manage essential car washing supplies: shampoo, paper mats, and air fresheners</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Alert Reminders for Low Stock Items */}
      {inventory.some(isLowStock) && (
        <div className="bg-[#FEF08A] border border-[#FACC15] p-4 rounded-xl flex items-start gap-3 text-[#854D0E] animate-fade-in" id="low-stock-alert-reminder">
          <AlertTriangle className="shrink-0 mt-0.5 text-[#D97706]" size={16} />
          <div className="text-xs space-y-1">
            <strong className="font-extrabold block uppercase tracking-wide">⚠️ Low Stock Alert Warning</strong>
            <p className="text-[#854D0E] font-medium leading-relaxed">
              The following inventory items have fallen below their minimum stock threshold limit:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {inventory.filter(isLowStock).map(item => {
                const thresh = item.minThreshold ?? 5;
                return (
                  <span key={item.id} className="bg-white border border-[#FACC15] text-[#854D0E] font-bold text-4xs px-2.5 py-1 rounded-md uppercase shadow-xs">
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
        <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center gap-4 shadow-md border-t-[3px] border-t-[#0891B2] hover:-translate-y-0.5 transition-all duration-200">
          <div className="h-10 w-10 bg-[#ECFEFF] text-[#0891B2] rounded-xl flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Total Items</span>
            <strong className="text-lg font-black text-[#0F172A]">{inventory.length}</strong>
          </div>
        </div>

        <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center gap-4 shadow-md border-t-[3px] border-t-[#FACC15] hover:-translate-y-0.5 transition-all duration-200">
          <div className="h-10 w-10 bg-amber-50 text-[#FACC15] rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Low Stock Alerts</span>
            <strong className={`text-lg font-black ${lowStockCount > 0 ? 'text-[#D97706]' : 'text-slate-500'}`}>{lowStockCount}</strong>
          </div>
        </div>

        <div className="bg-white border border-[#E5EDF3] p-5 rounded-2xl flex items-center gap-4 shadow-md border-t-[3px] border-t-[#16A34A] hover:-translate-y-0.5 transition-all duration-200">
          <div className="h-10 w-10 bg-[#DCFCE7] text-[#16A34A] rounded-xl flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Total Estimated Value</span>
            <strong className="text-lg font-black text-[#16A34A]">
              ₹{inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Table & Filtering */}
      <div className="bg-white border border-[#E5EDF3] rounded-2xl shadow-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E5EDF3] flex gap-3 justify-between items-center bg-[#F4F8FB]">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#1E293B] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
            />
          </div>
        </div>

        {/* Inventory List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E5EDF3] text-[#334155] text-xs font-bold uppercase tracking-wider bg-[#F4F8FB]">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EDF3] text-[#1E293B]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 font-medium">
                    <Package size={28} className="mx-auto mb-2 text-[#CBD5E1]" />
                    No supply items found in database.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-[#F4F8FB] transition-all">
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {isLowStock(item) && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full border border-amber-200">Low</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleAdjustQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-slate-50 rounded-lg border border-[#CBD5E1] text-[#334155] cursor-pointer transition-colors"
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
                              className="w-14 text-center font-bold text-[#0F172A] bg-white border border-[#CBD5E1] rounded-lg py-1 focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                            />
                            <span className="text-[#475569] text-xs font-semibold">{item.unit}</span>
                            <button
                              onClick={() => handleAdjustQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-slate-50 rounded-lg border border-[#CBD5E1] text-[#334155] cursor-pointer transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Threshold limit: {item.minThreshold ?? 5}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        ₹{item.costPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1 bg-[#ECFEFF] hover:bg-[#CFFAFE] text-[#0E7490] rounded-lg border border-[#0891B2]/15 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="Edit Item"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                handleDeleteItem(item.id);
                              }
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-[#EF4444] rounded-lg border border-rose-200 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="Delete Item"
                          >
                            <Trash2 size={12} />
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E5EDF3] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in text-[#1E293B]">
            <div className="p-5 border-b border-[#E5EDF3] flex items-center justify-between bg-white text-[#0F172A]">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-[#0E7490]">
                <Package size={16} className="text-[#0891B2]" />
                Add Stock Item
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#1E293B] font-medium block">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hydrophobic Ceramic Pro 50ml"
                  className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#1E293B] font-medium block">Stock Level Quantity *</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 15"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#1E293B] font-medium block">Alert Threshold</label>
                  <input
                    type="number"
                    required
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    placeholder="e.g. 5"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#1E293B] font-medium block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. litres, sheets, pieces"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] text-center placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#1E293B] font-medium block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] text-center placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="border-t border-[#E5EDF3] pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#334155] text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-[#E5EDF3] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in text-[#1E293B]">
            <div className="p-5 border-b border-[#E5EDF3] flex items-center justify-between bg-white text-[#0F172A]">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-[#0E7490]">
                <Edit3 size={16} className="text-[#0891B2]" />
                Edit Inventory Item
              </h2>
              <button onClick={() => { setShowEditModal(false); setEditingItem(null); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#1E293B] font-medium block">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Hydrophobic Ceramic Pro 50ml"
                  className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#1E293B] font-medium block">Stock Level Quantity *</label>
                  <input
                    type="number"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    placeholder="e.g. 15"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#1E293B] font-medium block">Alert Threshold</label>
                  <input
                    type="number"
                    required
                    value={editMinThreshold}
                    onChange={(e) => setEditMinThreshold(e.target.value)}
                    placeholder="e.g. 5"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#1E293B] font-medium block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="e.g. litres, sheets, pieces"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] text-center placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#1E293B] font-medium block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="text-xs p-2.5 border border-[#CBD5E1] rounded-lg w-full bg-white text-[#1E293B] text-center placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0891B2]/20 focus:border-[#0891B2] focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="border-t border-[#E5EDF3] pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingItem(null); }}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#334155] text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
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
