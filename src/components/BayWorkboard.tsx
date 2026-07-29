/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  Car,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Play,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { Appointment, Staff, ShopSettings } from '../types/crm';

interface BayWorkboardProps {
  appointments: Appointment[];
  staff: Staff[];
  settings: ShopSettings;
  onUpdateAppointment: (updated: Appointment) => void;
  selectedJobId: string | null;
  onSelectJob: (jobId: string | null) => void;
}

export default function BayWorkboard({
  appointments,
  staff,
  settings,
  onUpdateAppointment,
  selectedJobId,
  onSelectJob
}: BayWorkboardProps) {
  const [phoneSimMsg, setPhoneSimMsg] = useState<string | null>(null);
  const [phoneSimType, setPhoneSimType] = useState<'sms' | 'email' | null>(null);

  // Columns filter
  const getJobsByStatus = (status: 'scheduled' | 'in_progress' | 'quality_check' | 'ready') => {
    return appointments.filter(a => a.status === status);
  };

  const columns = [
    { id: 'scheduled', name: 'Scheduled / Queued', bg: 'bg-slate-50', border: 'border-slate-200' },
    { id: 'in_progress', name: 'In Progress (Active Bay)', bg: 'bg-indigo-50/20', border: 'border-indigo-100' },
    { id: 'quality_check', name: 'Quality Check', bg: 'bg-amber-50/20', border: 'border-amber-100' },
    { id: 'ready', name: 'Ready / Done', bg: 'bg-emerald-50/20', border: 'border-emerald-100' }
  ] as const;

  const activeJob = appointments.find(a => a.id === selectedJobId);

  // Status transitions helper
  const updateJobStatus = (job: Appointment, newStatus: Appointment['status']) => {
    // Generate empty checklist if it doesn't exist
    let checklist = job.checklist || {};
    if (Object.keys(checklist).length === 0) {
      if (job.serviceId === 'pkg-ceramic') {
        checklist = {
          'Pre-Wash Hand Cleanse': false,
          'Iron Decontamination Purge': false,
          'Clay Bar Surface Smoothing': false,
          '2-Stage Compounding & Swirl Elimination': false,
          'Isopropanol Wipe-down Inspection': false,
          'Apply Primary Nano-Ceramic Liquid': false,
          'Curing Inspection with Gloss Lamp': false,
          'Glass Restorative Buffing & Coat': false,
          'Check-off Door Jamb Edges': false,
          'Final Inspection Audit Checklist': false
        };
      } else {
        checklist = {
          'Interior Trash Removal': false,
          'Thorough Cabin Vacuum': false,
          'Carpet Steam Extraction': false,
          'Leather Cleansing & Conditioning': false,
          'Exterior Wash & Dry': false,
          'Clay Bar Decontamination': false,
          'Wax / Sealant Protective Coat': false,
          'Streak-free Window Cleaning': false,
          'Tire High-Gloss Dressing': false
        };
      }
    }

    onUpdateAppointment({
      ...job,
      status: newStatus,
      checklist
    });
  };

  // Checklist toggle
  const toggleChecklistItem = (job: Appointment, item: string) => {
    const checklist = { ...job.checklist, [item]: !job.checklist?.[item] };
    onUpdateAppointment({
      ...job,
      checklist
    });
  };

  const getProgressPercent = (job: Appointment) => {
    if (!job.checklist) return 0;
    const keys = Object.keys(job.checklist);
    if (keys.length === 0) return 0;
    const checked = keys.filter(k => job.checklist?.[k]).length;
    return Math.round((checked / keys.length) * 100);
  };

  // Staff assign
  const assignStaff = (job: Appointment, staffId: string) => {
    onUpdateAppointment({
      ...job,
      assignedTo: staffId
    });
  };

  // Message template replacer
  const simulateNotification = (job: Appointment, type: 'bookingConfirmed' | 'workStarted' | 'readyForPickup' | 'reviewRequest') => {
    const template = settings.smsTemplates[type];
    const tech = staff.find(s => s.id === job.assignedTo);
    
    let message = template
      .replace(/{customer_name}/g, job.customerName)
      .replace(/{service_name}/g, job.serviceName)
      .replace(/{booking_date}/g, job.date)
      .replace(/{booking_time}/g, job.time)
      .replace(/{vehicle_year}/g, job.vehicle.year)
      .replace(/{vehicle_model}/g, job.vehicle.model)
      .replace(/{tech_name}/g, tech ? tech.name : 'Your Service Team')
      .replace(/{total_price}/g, `$${job.price}`)
      .replace(/{shop_name}/g, settings.shopName);

    setPhoneSimMsg(message);
    setPhoneSimType(type === 'bookingConfirmed' || type === 'reviewRequest' ? 'sms' : 'sms');
  };

  return (
    <div className="space-y-6" id="bay-workboard-root">
      {/* Header and Details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight md:text-2xl">Service Bay Workboard</h1>
          <p className="text-xs text-slate-500">Track real-time progress and manage active detailing checklists</p>
        </div>
      </div>

      {/* Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kanban-board-layout">
        {columns.map(col => {
          const colJobs = getJobsByStatus(col.id);
          return (
            <div key={col.id} className={`flex flex-col h-[650px] rounded-xl border ${col.border} ${col.bg} p-4 space-y-3`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
                <span className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    col.id === 'scheduled' ? 'bg-slate-400' :
                    col.id === 'in_progress' ? 'bg-indigo-600 animate-pulse' :
                    col.id === 'quality_check' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                  {col.name}
                </span>
                <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-mono">
                  {colJobs.length}
                </span>
              </div>

              {/* Scrollable cards container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colJobs.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-200/50 rounded-lg flex flex-col items-center justify-center text-center p-3 text-slate-400">
                    <Car size={20} className="stroke-[1.5] mb-1" />
                    <span className="text-2xs font-medium">Bay Empty</span>
                  </div>
                ) : (
                  colJobs.map(job => {
                    const percent = getProgressPercent(job);
                    const tech = staff.find(s => s.id === job.assignedTo);
                    return (
                      <div
                        key={job.id}
                        onClick={() => onSelectJob(job.id)}
                        className={`group border rounded-xl p-4 bg-white hover:shadow-sm cursor-pointer transition-all duration-200 ${
                          selectedJobId === job.id 
                            ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-xs' 
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Title */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
                            </span>
                            <span className="text-2xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                              {job.vehicle.licensePlate || 'No Plate'}
                            </span>
                          </div>

                          {/* Client / Package */}
                          <div className="space-y-0.5">
                            <span className="text-xs text-slate-600 font-semibold block">{job.customerName}</span>
                            <span className="text-3xs text-indigo-600 font-semibold uppercase tracking-wider block">
                              {job.serviceName}
                            </span>
                          </div>

                          {/* Footer with detailer/time */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-3xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> {job.time}
                            </span>
                            <span className="flex items-center gap-1 font-medium bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">
                              <User size={11} /> {tech ? tech.name.split(' ')[0] : 'Unassigned'}
                            </span>
                          </div>

                          {/* Progress micro-bar (only if started) */}
                          {col.id !== 'scheduled' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-3xs text-slate-400 font-medium">
                                <span>Checklist</span>
                                <span>{percent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    col.id === 'ready' ? 'bg-emerald-500' : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Detail Bay Job Details Panel */}
      {activeJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in" id="workboard-slideover">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-slide-left overflow-hidden">
            
            {/* Slide Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-500 text-slate-950 text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Active Job
                  </span>
                  <span className="text-slate-400 text-xs font-mono">{activeJob.invoiceNumber}</span>
                </div>
                <h2 className="text-lg font-bold">
                  {activeJob.vehicle.year} {activeJob.vehicle.make} {activeJob.vehicle.model}
                </h2>
                <p className="text-slate-300 text-xs">
                  Customer: <span className="text-white font-semibold">{activeJob.customerName}</span> ({activeJob.customerPhone})
                </p>
              </div>
              <button
                onClick={() => onSelectJob(null)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Slide Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Quick Actions Row */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3">
                <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Change Status State</span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => updateJobStatus(activeJob, 'scheduled')}
                    className={`px-2 py-1.5 rounded-lg text-3xs font-bold uppercase tracking-wider border transition-all ${
                      activeJob.status === 'scheduled'
                        ? 'bg-slate-200 text-slate-800 border-slate-300'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Queued
                  </button>
                  <button
                    onClick={() => updateJobStatus(activeJob, 'in_progress')}
                    className={`px-2 py-1.5 rounded-lg text-3xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1 ${
                      activeJob.status === 'in_progress'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white hover:bg-indigo-50 text-indigo-600 border-slate-200'
                    }`}
                  >
                    <Play size={10} /> Start
                  </button>
                  <button
                    onClick={() => updateJobStatus(activeJob, 'quality_check')}
                    className={`px-2 py-1.5 rounded-lg text-3xs font-bold uppercase tracking-wider border transition-all ${
                      activeJob.status === 'quality_check'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white hover:bg-amber-50 text-amber-600 border-slate-200'
                    }`}
                  >
                    Check
                  </button>
                  <button
                    onClick={() => updateJobStatus(activeJob, 'ready')}
                    className={`px-2 py-1.5 rounded-lg text-3xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1 ${
                      activeJob.status === 'ready'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white hover:bg-emerald-50 text-emerald-600 border-slate-200'
                    }`}
                  >
                    <Check size={10} /> Ready
                  </button>
                </div>
              </div>

              {/* Assignment & Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Assigned Technician</label>
                  <select
                    value={activeJob.assignedTo || ''}
                    onChange={(e) => assignStaff(activeJob, e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2 bg-white"
                  >
                    <option value="">Choose tech...</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Est. Completion</label>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 p-2.5 rounded-lg text-xs font-semibold text-slate-700">
                    <Clock size={14} className="text-slate-400" />
                    <span>Today around {activeJob.time}</span>
                  </div>
                </div>
              </div>

              {/* Detailing Checklist Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ClipboardList size={16} className="text-slate-400" />
                    Detailer Work Checklist
                  </span>
                  <span className="text-2xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {getProgressPercent(activeJob)}% Done
                  </span>
                </div>

                {!activeJob.checklist || Object.keys(activeJob.checklist).length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center p-4">
                    <Play size={20} className="text-slate-400 mb-1" />
                    <p className="text-xs text-slate-500 font-semibold">Checklist is currently locked</p>
                    <p className="text-3xs text-slate-400 mt-0.5">Move this job to "In Progress" status to initialize checkoff work sheets.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(activeJob.checklist).map(([item, checked]) => (
                      <div
                        key={item}
                        onClick={() => toggleChecklistItem(activeJob, item)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border hover:bg-slate-50 transition-all cursor-pointer ${
                          checked 
                            ? 'border-emerald-100 bg-emerald-50/10 text-slate-500' 
                            : 'border-slate-100 text-slate-800 font-medium'
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                          checked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {checked && <Check size={11} className="stroke-[3]" />}
                        </div>
                        <span className={`text-xs ${checked ? 'line-through' : ''}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Automated Communications Simulator */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                  <MessageSquare size={16} className="text-indigo-400" />
                  SMS Updates Dispatcher
                </span>
                <p className="text-3xs text-slate-400">Trigger automated alerts using current booking variables</p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => simulateNotification(activeJob, 'bookingConfirmed')}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 justify-center transition-all"
                  >
                    <Send size={12} className="text-slate-400" />
                    Booking Confirm
                  </button>
                  <button
                    onClick={() => simulateNotification(activeJob, 'workStarted')}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 justify-center transition-all"
                  >
                    <Play size={12} className="text-indigo-500" />
                    Start Wash Alert
                  </button>
                  <button
                    onClick={() => simulateNotification(activeJob, 'readyForPickup')}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 justify-center transition-all"
                  >
                    <CheckCircle size={12} className="text-emerald-500" />
                    Ready for Pickup
                  </button>
                  <button
                    onClick={() => simulateNotification(activeJob, 'reviewRequest')}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 justify-center transition-all"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    Request Review
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Simulated Phone Message Alert Overlays */}
      {phoneSimMsg && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-[310px] aspect-[9/18.5] relative border-[12px] border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-zoom-in">
            {/* Speaker bar */}
            <div className="h-6 shrink-0 flex justify-center items-center relative">
              <div className="w-16 h-4 bg-black rounded-b-xl absolute top-0"></div>
            </div>

            {/* Phone Screen body */}
            <div className="flex-1 bg-slate-950 p-3 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between text-slate-400 text-2xs px-1 border-b border-slate-800 pb-2">
                  <span className="font-semibold">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full scale-90">SMS Chat</span>
                </div>

                {/* Message bubble */}
                <div className="space-y-1">
                  <span className="text-3xs text-slate-500 font-bold uppercase tracking-wider ml-2">{settings.shopName}</span>
                  <div className="bg-indigo-600 text-white text-xs p-3 rounded-2xl rounded-tl-sm max-w-[85%] leading-relaxed shadow-md animate-slide-up">
                    {phoneSimMsg}
                  </div>
                  <span className="text-3xs text-slate-500 ml-2">Now • Sent via CRM Router</span>
                </div>
              </div>

              {/* Close simulated phone */}
              <button
                onClick={() => {
                  setPhoneSimMsg(null);
                  setPhoneSimType(null);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl text-center shadow transition-all"
              >
                Close Simulation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
