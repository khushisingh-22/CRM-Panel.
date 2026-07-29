/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GitFork,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Sparkles,
  Layers,
  MessageSquare,
  Mail,
  Zap,
  X,
  Play
} from 'lucide-react';

export interface CRMWorkflow {
  id: string;
  name: string;
  trigger: 'appointment_created' | 'job_started' | 'ready_for_pickup' | 'payment_completed' | 'lead_captured';
  action: 'send_sms_notification' | 'send_invoice_email' | 'request_customer_review' | 'assign_idle_staff';
  status: 'active' | 'inactive';
  executionsCount: number;
}

interface WorkflowsManagerProps {
  workflows: CRMWorkflow[];
  onUpdateWorkflows: (updated: CRMWorkflow[]) => void;
}

export default function WorkflowsManager({
  workflows,
  onUpdateWorkflows
}: WorkflowsManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<CRMWorkflow['trigger']>('appointment_created');
  const [action, setAction] = useState<CRMWorkflow['action']>('send_sms_notification');

  const handleAddWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newWorkflow: CRMWorkflow = {
      id: `wf-${Date.now()}`,
      name,
      trigger,
      action,
      status: 'active',
      executionsCount: 0
    };

    onUpdateWorkflows([newWorkflow, ...workflows]);
    setShowAddModal(false);
    setName('');
    setTrigger('appointment_created');
    setAction('send_sms_notification');
  };

  const handleDelete = (id: string) => {
    onUpdateWorkflows(workflows.filter(wf => wf.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    const updated = workflows.map(wf => {
      if (wf.id === id) {
        return {
          ...wf,
          status: wf.status === 'active' ? 'inactive' as const : 'active' as const
        };
      }
      return wf;
    });
    onUpdateWorkflows(updated);
  };

  const handleRunManual = (id: string) => {
    const updated = workflows.map(wf => {
      if (wf.id === id) {
        return {
          ...wf,
          executionsCount: wf.executionsCount + 1
        };
      }
      return wf;
    });
    onUpdateWorkflows(updated);
    alert('Workflow dry-run complete! Triggers fired.');
  };

  const triggerLabels: Record<CRMWorkflow['trigger'], string> = {
    appointment_created: 'When Appointment Scheduled',
    job_started: 'When Detailer Begins Washing',
    ready_for_pickup: 'When Car Passes QC / Ready',
    payment_completed: 'When Invoice Marked Paid',
    lead_captured: 'When Booking Lead Captured'
  };

  const actionLabels: Record<CRMWorkflow['action'], string> = {
    send_sms_notification: 'Send SMS Alert to Customer',
    send_invoice_email: 'Email Digital Invoice Receipt',
    request_customer_review: 'Send Automated Review Link SMS',
    assign_idle_staff: 'Assign Free Bay Technician'
  };

  const triggerIcons: Record<CRMWorkflow['trigger'], React.ReactNode> = {
    appointment_created: <Zap size={15} className="text-cyan-400" />,
    job_started: <Play size={15} className="text-amber-400" />,
    ready_for_pickup: <CheckCircle size={15} className="text-emerald-400" />,
    payment_completed: <CheckCircle size={15} className="text-indigo-400" />,
    lead_captured: <GitFork size={15} className="text-purple-400" />
  };

  return (
    <div className="space-y-6" id="workflows-manager-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Studio CRM Workflows</h1>
          <p className="text-xs text-slate-400">Map custom event triggers to direct message channels for hands-free client nurture</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Create Trigger Rule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <GitFork size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Configured Rules</span>
            <strong className="text-lg font-black text-white">{workflows.length} workflows</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Active Triggers</span>
            <strong className="text-lg font-black text-emerald-400">{workflows.filter(w => w.status === 'active').length} Active</strong>
          </div>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Total Trigger Executions</span>
            <strong className="text-lg font-black text-white">{workflows.reduce((sum, w) => sum + w.executionsCount, 0)} sent</strong>
          </div>
        </div>
      </div>

      {/* Workflows interactive list */}
      <div className="grid grid-cols-1 gap-4">
        {workflows.map(wf => (
          <div key={wf.id} className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-white flex items-center justify-center">
                <Zap size={18} className="text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-white">{wf.name}</h3>
                <div className="flex flex-wrap items-center gap-1.5 text-3xs text-slate-400">
                  <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                    {triggerIcons[wf.trigger]}
                    {triggerLabels[wf.trigger]}
                  </span>
                  <ArrowRight size={10} className="text-slate-600" />
                  <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-400 font-bold">
                    {actionLabels[wf.action]}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t md:border-t-0 border-slate-800/40 pt-3 md:pt-0">
              <span className="text-4xs text-slate-500 font-bold uppercase font-mono">
                {wf.executionsCount} triggers fired
              </span>

              <button
                onClick={() => handleRunManual(wf.id)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:text-white text-slate-400 rounded-lg transition-all text-3xs font-bold cursor-pointer"
                title="Test run trigger rule"
              >
                Test Run
              </button>

              <button
                onClick={() => handleToggleStatus(wf.id)}
                className={`p-1.5 rounded-lg border transition-all text-4xs font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer ${
                  wf.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                {wf.status === 'active' ? 'Live' : 'Paused'}
              </button>

              <button
                onClick={() => handleDelete(wf.id)}
                className="p-1.5 bg-slate-950 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Workflow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <GitFork size={16} className="text-indigo-400" />
                Create Trigger Rule
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddWorkflow} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Rule/Workflow Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Completed Review Ask, Immediate Booking SMS"
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Trigger Event</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as any)}
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                >
                  <option value="appointment_created">When Appointment is Confirmed/Scheduled</option>
                  <option value="job_started">When Bay Tech Starts Detailing</option>
                  <option value="ready_for_pickup">When Bay Tech Finishes Detail (Ready for pick up)</option>
                  <option value="payment_completed">When Invoice Receipt is Paid</option>
                  <option value="lead_captured">When Booking Simulator Lead is Logged</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Automated Action</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="text-xs p-2.5 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden"
                >
                  <option value="send_sms_notification">Send Customized SMS Notification</option>
                  <option value="send_invoice_email">Email Digital Receipt Statement</option>
                  <option value="request_customer_review">Send Automated Google Business Review Link SMS</option>
                  <option value="assign_idle_staff">Auto-assign to available shift technician</option>
                </select>
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
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
