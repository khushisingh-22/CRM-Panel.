/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  Check,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Briefcase,
  X,
  FileText
} from 'lucide-react';
import { ServicePackage } from '../types/crm';

interface ServicesCatalogProps {
  services: ServicePackage[];
  onUpdateService: (updated: ServicePackage) => void;
  onAddService: (newService: ServicePackage) => void;
}

export default function ServicesCatalog({
  services,
  onUpdateService,
  onAddService
}: ServicesCatalogProps) {
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDuration, setEditDuration] = useState(60);
  const [editPriceSedan, setEditPriceSedan] = useState(100);
  const [editPriceSUV, setEditPriceSUV] = useState(120);
  const [editPriceTruck, setEditPriceTruck] = useState(150);

  const handleOpenEdit = (pkg: ServicePackage) => {
    setSelectedService(pkg);
    setEditName(pkg.name);
    setEditDesc(pkg.description);
    setEditDuration(pkg.durationMin);
    setEditPriceSedan(pkg.pricing.sedan);
    setEditPriceSUV(pkg.pricing.suv);
    setEditPriceTruck(pkg.pricing.truck_large);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const updated: ServicePackage = {
      ...selectedService,
      name: editName,
      description: editDesc,
      durationMin: editDuration,
      pricing: {
        sedan: Number(editPriceSedan),
        suv: Number(editPriceSUV),
        truck_large: Number(editPriceTruck)
      }
    };

    onUpdateService(updated);
    setShowEditModal(false);
    setSelectedService(null);
  };

  // Organize by categories
  const categories = {
    full_detail: 'Full Detail Packages',
    interior: 'Interior Only Specials',
    ceramic: 'Ceramic Coatings & Coatings',
    add_on: 'A la Carte Add-ons'
  };

  return (
    <div className="space-y-6" id="services-catalog-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight md:text-2xl">Service Catalog & Tier Pricing</h1>
          <p className="text-xs text-slate-500">Configure core detailing packages and modify multi-vehicle tiered prices</p>
        </div>
      </div>

      {/* Catalog lists grouped by category */}
      <div className="space-y-10">
        {Object.entries(categories).map(([catKey, catName]) => {
          const catServices = services.filter(s => s.category === catKey);
          return (
            <div key={catKey} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{catName}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catServices.map(pkg => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-xl border border-slate-150 p-5 flex flex-col justify-between shadow-xs hover:border-indigo-100 hover:shadow-xs transition-all relative group"
                  >
                    {/* Action Button */}
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Edit tier prices"
                    >
                      <Edit3 size={14} />
                    </button>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors pr-6">
                          {pkg.name}
                        </h4>
                        <span className="text-3xs text-slate-400 font-semibold flex items-center gap-1 mt-1">
                          <Clock size={11} /> Est. Duration: {pkg.durationMin} mins
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">{pkg.description}</p>

                      {/* Included Features list */}
                      {pkg.features.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">Treatments Included:</span>
                          <ul className="space-y-1">
                            {pkg.features.slice(0, 4).map((feat, i) => (
                              <li key={i} className="text-3xs text-slate-600 flex items-center gap-1.5 font-medium">
                                <Check size={10} className="text-emerald-500 shrink-0 stroke-[3]" />
                                <span className="truncate">{feat}</span>
                              </li>
                            ))}
                            {pkg.features.length > 4 && (
                              <li className="text-3xs text-indigo-500 font-semibold pl-4">
                                + {pkg.features.length - 4} more treatments
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Pricing Tiers box */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Tiered Price Specs</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-50 border border-slate-200/40 p-2 rounded-lg">
                          <span className="text-4xs text-slate-500 font-bold uppercase block tracking-wider">Sedan</span>
                          <strong className="text-xs font-mono font-extrabold text-slate-900">₹{pkg.pricing.sedan}</strong>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/40 p-2 rounded-lg">
                          <span className="text-4xs text-slate-500 font-bold uppercase block tracking-wider">Mid SUV</span>
                          <strong className="text-xs font-mono font-extrabold text-slate-900">₹{pkg.pricing.suv}</strong>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/40 p-2 rounded-lg">
                          <span className="text-4xs text-slate-500 font-bold uppercase block tracking-wider">Truck/Lrg</span>
                          <strong className="text-xs font-mono font-extrabold text-slate-900">₹{pkg.pricing.truck_large}</strong>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Tier Pricing Modal */}
      {showEditModal && selectedService && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="edit-prices-modal">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                <h2 className="text-base font-bold">Edit Catalog Service Package</h2>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedService(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Service Title</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Description Details</label>
                <textarea
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 h-20 leading-relaxed text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Duration Requirement (Minutes)</label>
                <input
                  type="number"
                  required
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 font-semibold"
                />
              </div>

              {/* Price Editing fields */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Modify Tiered Prices (₹)</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-4xs text-slate-500 font-bold uppercase block mb-1">Sedan</label>
                    <input
                      type="number"
                      required
                      value={editPriceSedan}
                      onChange={(e) => setEditPriceSedan(Number(e.target.value))}
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-center font-mono font-extrabold"
                    />
                  </div>
                  <div>
                    <label className="text-4xs text-slate-500 font-bold uppercase block mb-1">Mid SUV</label>
                    <input
                      type="number"
                      required
                      value={editPriceSUV}
                      onChange={(e) => setEditPriceSUV(Number(e.target.value))}
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-center font-mono font-extrabold"
                    />
                  </div>
                  <div>
                    <label className="text-4xs text-slate-500 font-bold uppercase block mb-1">Truck/Lrg</label>
                    <input
                      type="number"
                      required
                      value={editPriceTruck}
                      onChange={(e) => setEditPriceTruck(Number(e.target.value))}
                      className="text-xs p-2.5 border border-slate-200 rounded-lg w-full bg-slate-50/50 text-center font-mono font-extrabold"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedService(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all cursor-pointer"
                >
                  Save Tier Specs
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
