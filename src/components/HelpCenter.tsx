/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Shield,
  Zap,
  CheckCircle,
  Database,
  ArrowRight
} from 'lucide-react';

export default function HelpCenter() {
  const faqs = [
    {
      q: 'How do I check a vehicle into a specific detailing bay?',
      a: 'Navigate to the Wash Board. Locate the customer appointment card in the "Scheduled" list. Drag the status dropdown to "In Progress" or "Ready" to advance their status. The assigned specialist and check-in times are logged automatically.'
    },
    {
      q: 'Where do I manage and edit my service package offerings?',
      a: 'Go to the Packages section. Here you can edit prices for Sedans, SUVs, and Trucks on existing packages, or click "Create Service" to launch a brand new detailing offering with custom checklists.'
    },
    {
      q: 'How do automated SMS notifications work?',
      a: 'Under the Automation Center tab, you can customize your SMS template scripts and toggle auto-sending. Our background simulator simulates sending SMS confirmation texts, start-work updates, and ready-for-pickup alerts.'
    },
    {
      q: 'Is my data saved offline?',
      a: 'Yes! drwashit Pro CRM utilizes native localStorage. All invoices, client profiles, inventory levels, waitlists, and custom business expense records persist securely in your browser cache.'
    }
  ];

  return (
    <div className="space-y-6" id="help-center-root">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight md:text-2xl">Help Center & FAQ</h1>
        <p className="text-xs text-slate-400">Find guidance on managing bays, scheduling, automating client communications, and configuring services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-3">
          <BookOpen className="text-indigo-400" size={24} />
          <h3 className="text-xs font-extrabold text-white">Interactive Guides</h3>
          <p className="text-3xs text-slate-400">Step-by-step documentation detailing paint correction settings, ceramic curing ovens tracking, and automatic dispatch algorithms.</p>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-3">
          <Zap className="text-cyan-400" size={24} />
          <h3 className="text-xs font-extrabold text-white">Trigger Workflows</h3>
          <p className="text-3xs text-slate-400">Learn how to wire state-based notifications such as auto-sending review invitations once customers settle outstanding invoices.</p>
        </div>

        <div className="bg-[#131D35] border border-slate-800/40 p-5 rounded-xl space-y-3">
          <Shield className="text-emerald-400" size={24} />
          <h3 className="text-xs font-extrabold text-white">Data Preservation</h3>
          <p className="text-3xs text-slate-400">drwashit Pro encrypts and stores all client profiles and ledgers locally. You can trigger clean manual backups via Settings.</p>
        </div>
      </div>

      {/* FAQs Panel */}
      <div className="bg-[#131D35] border border-slate-800/40 p-6 rounded-xl space-y-6">
        <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/60 pb-3">
          <HelpCircle size={15} className="text-indigo-400" />
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1.5">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span className="text-indigo-400 font-mono">Q:</span>
                {faq.q}
              </h4>
              <p className="text-3xs text-slate-400 pl-4 border-l border-indigo-500/20 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
