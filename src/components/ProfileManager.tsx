/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Shield,
  Mail,
  Phone,
  Camera,
  Check,
  AlertCircle,
  Briefcase
} from 'lucide-react';

export interface OwnerProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
}

interface ProfileManagerProps {
  profile: OwnerProfile;
  onUpdateProfile: (updated: OwnerProfile) => void;
}

export default function ProfileManager({
  profile,
  onUpdateProfile
}: ProfileManagerProps) {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      role,
      email,
      phone,
      avatar
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="profile-manager-root">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Owner Profile Settings</h1>
          <p className="text-xs text-slate-400">Edit your display credentials, contact channels, and system avatar</p>
        </div>
        {saveSuccess && (
          <span className="text-3xs text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
            <Check size={12} />
            Profile Saved Successfully
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Avatar Preview */}
        <div className="bg-[#131D35] border border-slate-800/40 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={name}
              className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500/40 bg-slate-900"
            />
            <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white border border-slate-900 shadow-lg">
              <Camera size={14} />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-extrabold text-white">{name}</h2>
            <span className="text-4xs font-bold text-slate-400 uppercase tracking-wider block">
              {role || 'Studio Owner'}
            </span>
          </div>

          <p className="text-3xs text-slate-500 max-w-xs">
            This card represents the studio owner profile. Changes made here will instantly reflect in the navbar, side panels, and automatic SMS signatures.
          </p>
        </div>

        {/* Right Form: Details */}
        <div className="bg-[#131D35] border border-slate-800/40 p-6 rounded-xl lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <User size={15} className="text-indigo-400" />
              Personal Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Professional Role</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Studio Owner"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Owner Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@studio.com"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Direct Business Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0143"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Profile Photo Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
