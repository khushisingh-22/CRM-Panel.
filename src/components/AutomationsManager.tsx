/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sliders,
  Check,
  Zap,
  MessageSquare,
  FileText,
  Clock,
  Shield,
  RefreshCw,
  Bell,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Database
} from 'lucide-react';

interface AutomationsManagerProps {
  automationSettings: {
    autoAssignStaff: boolean;
    autoSMSOnReady: boolean;
    autoSMSOnConfirm: boolean;
    autoInvoiceOnComplete: boolean;
    reminderHours: number;
  };
  onUpdateSettings: (settings: any) => void;
}

export default function AutomationsManager({
  automationSettings,
  onUpdateSettings
}: AutomationsManagerProps) {
  const [successMsg, setSuccessMsg] = useState(false);

  const handleToggle = (key: string, val: boolean) => {
    onUpdateSettings({
      ...automationSettings,
      [key]: val
    });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  const handleChangeHours = (val: number) => {
    onUpdateSettings({
      ...automationSettings,
      reminderHours: val
    });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="space-y-6" id="automations-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Automation Center</h1>
          <p className="text-xs text-slate-400">Configure global triggers, background handlers, and automatic dispatch algorithms</p>
        </div>
        {successMsg && (
          <span className="text-3xs text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
            <Check size={12} />
            Automations Updated
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Dispatch Controls */}
        <div className="bg-[#131D35] border border-slate-800/40 p-6 rounded-xl space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <Sliders size={15} className="text-cyan-400" />
            Automatic Job Dispatch
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-100 block">Auto-Assign Specialists</span>
                <span className="text-3xs text-slate-400 block">Instantly assign new appointments to idle detailers on duty</span>
              </div>
              <button onClick={() => handleToggle('autoAssignStaff', !automationSettings.autoAssignStaff)}>
                {automationSettings.autoAssignStaff ? (
                  <ToggleRight size={38} className="text-indigo-500" />
                ) : (
                  <ToggleLeft size={38} className="text-slate-600" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-100 block">Auto-Invoice Generation</span>
                <span className="text-3xs text-slate-400 block">Automatically compile and generate PDF invoice when detailing is completed</span>
              </div>
              <button onClick={() => handleToggle('autoInvoiceOnComplete', !automationSettings.autoInvoiceOnComplete)}>
                {automationSettings.autoInvoiceOnComplete ? (
                  <ToggleRight size={38} className="text-indigo-500" />
                ) : (
                  <ToggleLeft size={38} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Box 2: Communication Controls */}
        <div className="bg-[#131D35] border border-slate-800/40 p-6 rounded-xl space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <MessageSquare size={15} className="text-emerald-400" />
            SMS Messaging Triggers
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-100 block">Auto-Send Booking Confirmations</span>
                <span className="text-3xs text-slate-400 block">Trigger immediate text notification upon successful reservation</span>
              </div>
              <button onClick={() => handleToggle('autoSMSOnConfirm', !automationSettings.autoSMSOnConfirm)}>
                {automationSettings.autoSMSOnConfirm ? (
                  <ToggleRight size={38} className="text-indigo-500" />
                ) : (
                  <ToggleLeft size={38} className="text-slate-600" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-100 block">Auto-Send Ready SMS Alerts</span>
                <span className="text-3xs text-slate-400 block">Notify customers the second their vehicle passes final QC checks</span>
              </div>
              <button onClick={() => handleToggle('autoSMSOnReady', !automationSettings.autoSMSOnReady)}>
                {automationSettings.autoSMSOnReady ? (
                  <ToggleRight size={38} className="text-indigo-500" />
                ) : (
                  <ToggleLeft size={38} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Box 3: Intervals config */}
        <div className="bg-[#131D35] border border-slate-800/40 p-6 rounded-xl md:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <Clock size={15} className="text-amber-400" />
            Automatic Visit Reminders Interval
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-100 block">Pre-Visit SMS Hours</span>
              <span className="text-3xs text-slate-400 block">Configure timeframe (hours) to dispatch appointment reminders</span>
            </div>

            <div className="flex gap-2">
              {[12, 24, 48].map(hrs => (
                <button
                  key={hrs}
                  onClick={() => handleChangeHours(hrs)}
                  className={`px-4 py-2 text-3xs font-bold rounded-lg uppercase tracking-wider border transition-all cursor-pointer ${
                    automationSettings.reminderHours === hrs
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {hrs} Hours
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
