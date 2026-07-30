/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Car,
  ClipboardList,
  CreditCard,
  Sparkles,
  Settings,
  Bell,
  Check,
  X,
  AlertCircle,
  Menu,
  CheckCircle,
  CornerDownRight,
  MessageSquare,
  DollarSign,
  Package,
  RefreshCw,
  Clock,
  GitFork,
  Sliders,
  User,
  HelpCircle,
  LogOut,
  ClipboardCheck
} from 'lucide-react';

import { getStoredData, saveStoredData } from './utils/storage';
import { Appointment, Customer, ServicePackage, Staff, ShopSettings } from './types/crm';

import DashboardOverview from './components/DashboardOverview';
import BayWorkboard from './components/BayWorkboard';
import AppointmentsList from './components/AppointmentsList';
import BookingsManager from './components/BookingsManager';
import CustomerCRM from './components/CustomerCRM';
import ServicesCatalog from './components/ServicesCatalog';
import BillingManager from './components/BillingManager';
import BookingPortal from './components/BookingPortal';
import SettingsPanel from './components/SettingsPanel';

// New Business and Automation Modules
import ExpensesManager from './components/ExpensesManager';
import InventoryManager from './components/InventoryManager';
import PaymentsManager from './components/PaymentsManager';
import RecurringManager from './components/RecurringManager';
import TeamManager from './components/TeamManager';
import WaitlistManager from './components/WaitlistManager';
import WorkflowsManager from './components/WorkflowsManager';
import AutomationsManager from './components/AutomationsManager';
import ProfileManager from './components/ProfileManager';
import HelpCenter from './components/HelpCenter';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [autoOpenNewBooking, setAutoOpenNewBooking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Core CRM states
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({} as ShopSettings);
  const [leads, setLeads] = useState<any[]>([]);

  // New CRM states
  const [expenses, setExpenses] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [recurringList, setRecurringList] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [automationSettings, setAutomationSettings] = useState<any>({
    autoAssignStaff: true,
    autoSMSOnReady: true,
    autoSMSOnConfirm: true,
    autoInvoiceOnComplete: false,
    reminderHours: 24
  });
  const [profile, setProfile] = useState<any>({
    name: 'John Doe',
    role: 'Studio Owner',
    email: 'owner@drwashit.online',
    phone: '800-555-WASH',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Load from Storage
  useEffect(() => {
    const data = getStoredData();
    setServices(data.services);
    setCustomers(data.customers);
    setAppointments(data.appointments);
    setStaff(data.staff);
    setSettings(data.settings);
    setLeads(data.leads);
    setExpenses(data.expenses || []);
    setInventory(data.inventory || []);
    setRecurringList(data.recurring || []);
    setWaitlist(data.waitlist || []);
    setWorkflows(data.workflows || []);
    setAutomationSettings(data.automationSettings || {
      autoAssignStaff: true,
      autoSMSOnReady: true,
      autoSMSOnConfirm: true,
      autoInvoiceOnComplete: false,
      reminderHours: 24
    });
    setProfile(data.profile || {
      name: 'John Doe',
      role: 'Studio Owner',
      email: 'owner@drwashit.online',
      phone: '800-555-WASH',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
  }, []);

  // Save to Storage when modified
  const syncServices = (updated: ServicePackage[]) => {
    setServices(updated);
    saveStoredData({ services: updated });
  };

  const syncCustomers = (updated: Customer[]) => {
    setCustomers(updated);
    saveStoredData({ customers: updated });
  };

  const syncAppointments = (updated: Appointment[]) => {
    setAppointments(updated);
    saveStoredData({ appointments: updated });
  };

  const syncSettings = (updated: ShopSettings) => {
    setSettings(updated);
    saveStoredData({ settings: updated });
  };

  const syncExpenses = (updated: any[]) => {
    setExpenses(updated);
    saveStoredData({ expenses: updated });
  };

  const syncInventory = (updated: any[]) => {
    setInventory(updated);
    saveStoredData({ inventory: updated });
  };

  const syncRecurring = (updated: any[]) => {
    setRecurringList(updated);
    saveStoredData({ recurring: updated });
  };

  const syncWaitlist = (updated: any[]) => {
    setWaitlist(updated);
    saveStoredData({ waitlist: updated });
  };

  const syncWorkflows = (updated: any[]) => {
    setWorkflows(updated);
    saveStoredData({ workflows: updated });
  };

  const syncAutomationSettings = (updated: any) => {
    setAutomationSettings(updated);
    saveStoredData({ automationSettings: updated });
  };

  const syncProfile = (updated: any) => {
    setProfile(updated);
    saveStoredData({ profile: updated });
  };

  const syncStaff = (updated: Staff[]) => {
    setStaff(updated);
    saveStoredData({ staff: updated });
  };

  const syncLeads = (updated: any[]) => {
    setLeads(updated);
    saveStoredData({ leads: updated });
  };

  // Appointment CRUD Handlers
  const handleAddAppointment = (apt: Appointment) => {
    const list = [apt, ...appointments];
    syncAppointments(list);

    // Update Customer profile totals
    const client = customers.find(c => c.id === apt.customerId);
    if (client) {
      const updatedCustomers = customers.map(c => {
        if (c.id === apt.customerId) {
          return {
            ...c,
            lifetimeSpend: c.lifetimeSpend + apt.price,
            totalJobs: c.totalJobs + 1
          };
        }
        return c;
      });
      syncCustomers(updatedCustomers);
    } else {
      // Create profile for customer if not existing
      const newC: Customer = {
        id: apt.customerId,
        name: apt.customerName,
        phone: apt.customerPhone,
        email: apt.customerEmail,
        vehicles: [apt.vehicle],
        createdAt: new Date().toISOString(),
        lifetimeSpend: apt.price,
        totalJobs: 1
      };
      syncCustomers([newC, ...customers]);
    }
  };

  const handleUpdateAppointment = (updated: Appointment) => {
    const list = appointments.map(a => (a.id === updated.id ? updated : a));
    syncAppointments(list);

    // If status is changed to completed previously, adjust spend if price modified
    const original = appointments.find(a => a.id === updated.id);
    if (original && original.status !== 'completed' && updated.status === 'completed') {
      const updatedCustomers = customers.map(c => {
        if (c.id === updated.customerId) {
          return {
            ...c,
            lifetimeSpend: c.lifetimeSpend + updated.price,
            totalJobs: c.totalJobs + 1
          };
        }
        return c;
      });
      syncCustomers(updatedCustomers);
    }
  };

  const handleDeleteAppointment = (id: string) => {
    const list = appointments.filter(a => a.id !== id);
    syncAppointments(list);
  };

  // Lead approval / self booking accept handler
  const handleApproveLead = (lead: any) => {
    // Generate new client if needed
    let client = customers.find(c => c.phone === lead.phone);
    let clientId = client ? client.id : `cust-${Date.now()}`;

    if (!client) {
      const newC: Customer = {
        id: clientId,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        vehicles: [lead.vehicle],
        createdAt: new Date().toISOString(),
        lifetimeSpend: lead.totalPrice,
        totalJobs: 1
      };
      syncCustomers([newC, ...customers]);
    } else {
      // Add vehicle to client if not exist
      const hasVeh = client.vehicles.some(v => v.model === lead.vehicle.model);
      const updatedCustomers = customers.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            vehicles: hasVeh ? c.vehicles : [...c.vehicles, lead.vehicle],
            lifetimeSpend: c.lifetimeSpend + lead.totalPrice,
            totalJobs: c.totalJobs + 1
          };
        }
        return c;
      });
      syncCustomers(updatedCustomers);
    }

    // Build appointment block
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: clientId,
      customerName: lead.name,
      customerPhone: lead.phone,
      customerEmail: lead.email,
      vehicle: lead.vehicle,
      serviceId: lead.serviceId,
      serviceName: lead.serviceName,
      addOns: lead.addOns || [],
      date: lead.date,
      time: lead.time,
      status: 'scheduled',
      price: lead.totalPrice,
      notes: lead.notes || 'Submitted via self-booking portal.',
      paymentStatus: 'unpaid',
      invoiceNumber: `INV-2026-0${Math.floor(Math.random() * 900) + 100}`,
      createdAt: new Date().toISOString()
    };

    // Add appointment & clear lead
    syncAppointments([newApt, ...appointments]);
    const updatedLeads = leads.map(l => (l.id === lead.id ? { ...l, status: 'accepted' } : l));
    syncLeads(updatedLeads);
    setShowNotifications(false);
    setActiveTab('workboard');
    setSelectedJobId(newApt.id);
  };

  const handleDismissLead = (leadId: string) => {
    const updated = leads.map(l => (l.id === leadId ? { ...l, status: 'declined' } : l));
    syncLeads(updated);
  };

  const handlePromoteWaitlistToBooking = (item: any) => {
    let client = customers.find(c => c.phone === item.phone);
    let clientId = client ? client.id : `cust-${Date.now()}`;

    const vehicleObj = {
      year: '2024',
      make: item.vehicleMake,
      model: item.vehicleModel,
      size: item.vehicleSize,
      color: 'Not Specified',
      licensePlate: 'PENDING'
    };

    if (!client) {
      const newC: Customer = {
        id: clientId,
        name: item.name,
        phone: item.phone,
        email: item.email,
        vehicles: [vehicleObj],
        createdAt: new Date().toISOString(),
        lifetimeSpend: 0,
        totalJobs: 0
      };
      syncCustomers([newC, ...customers]);
    } else {
      const hasVeh = client.vehicles.some(v => v.model === item.vehicleModel);
      if (!hasVeh) {
        const updatedCustomers = customers.map(c => {
          if (c.id === clientId) {
            return {
              ...c,
              vehicles: [...c.vehicles, vehicleObj]
            };
          }
          return c;
        });
        syncCustomers(updatedCustomers);
      }
    }

    let price = 150;
    const matchedService = services.find(s => s.id === item.desiredServiceId);
    if (matchedService) {
      if (item.vehicleSize === 'sedan' && matchedService.pricing?.sedan) price = matchedService.pricing.sedan;
      else if (item.vehicleSize === 'suv' && matchedService.pricing?.suv) price = matchedService.pricing.suv;
      else if (item.vehicleSize === 'truck_large' && matchedService.pricing?.truck_large) price = matchedService.pricing.truck_large;
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: clientId,
      customerName: item.name,
      customerPhone: item.phone,
      customerEmail: item.email,
      vehicle: vehicleObj,
      serviceId: item.desiredServiceId,
      serviceName: item.desiredServiceName,
      addOns: [],
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      status: 'scheduled',
      price: price,
      notes: item.notes || 'Promoted from Waitlist.',
      paymentStatus: 'unpaid',
      invoiceNumber: `INV-2026-0${Math.floor(Math.random() * 900) + 100}`,
      createdAt: new Date().toISOString()
    };

    syncAppointments([newApt, ...appointments]);
    const updatedWaitlist = waitlist.filter(w => w.id !== item.id);
    syncWaitlist(updatedWaitlist);
    setActiveTab('workboard');
    setSelectedJobId(newApt.id);
  };

  // Nav support helper
  const handleNavigate = (tabId: string) => {
    if (tabId === 'bookings_new') {
      setActiveTab('bookings');
      setAutoOpenNewBooking(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleSelectJobFromOutside = (jobId: string | null) => {
    setActiveTab('workboard');
    setSelectedJobId(jobId);
  };

  const pendingLeads = leads.filter(l => l.status === 'new');

  // Guard against unmounted defaults
  if (!settings.shopName) {
    return (
      <div className="h-screen bg-[#070A13] flex items-center justify-center text-slate-400 font-medium">
        <div className="flex flex-col items-center gap-3">
          <span className="h-9 w-9 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></span>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500 animate-pulse">Initializing CRM Environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A13] flex text-slate-100 font-sans" id="drwashit-crm-app">
      
      {/* Navigation Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } shrink-0 bg-[#0B1329] border-r border-slate-800/60 text-slate-400 flex flex-col justify-between transition-all duration-300 z-30 select-none`}
        id="side-navigation-panel"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo brand */}
          <div className="h-16 border-b border-slate-800/60 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-7 w-7 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg flex items-center justify-center shrink-0 shadow-md">
                <Car className="text-white shrink-0 stroke-[2.5]" size={16} />
              </span>
              {sidebarOpen && (
                <div className="min-w-0">
                  <strong className="text-sm font-black text-white block tracking-tight truncate">drwashit</strong>
                  <span className="text-4xs text-cyan-400 font-bold uppercase tracking-wider block">CRM Pro Edition</span>
                </div>
              )}
            </div>
            
            {/* Collapse toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer text-slate-400"
              id="sidebar-toggle-btn"
            >
              <Menu size={16} />
            </button>
          </div>

          {/* Scrollable Navigation links */}
          <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto scrollbar-thin">
            {/* Core Operation Section */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-4xs text-slate-500 font-extrabold uppercase tracking-widest block mb-1.5 px-2.5">Operations</span>}
              {([
                { id: 'dashboard', name: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'appointments', name: 'Calendar', icon: Calendar },
                { id: 'bookings', name: 'Bookings', icon: ClipboardCheck },
                { id: 'crm', name: 'Clients', icon: Users },
                { id: 'billing', name: 'Invoices & Billing', icon: CreditCard },
              ] as Array<{ id: string; name: string; icon: any; badge?: number }>).map(tab => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={15} className={`shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      {sidebarOpen && <span className="truncate">{tab.name}</span>}
                    </div>
                    {sidebarOpen && tab.badge && tab.badge > 0 ? (
                      <span className="text-4xs bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold animate-pulse">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Business & Inventory Section */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-4xs text-slate-500 font-extrabold uppercase tracking-widest block mb-1.5 px-2.5">Business</span>}
              {[
                { id: 'expenses', name: 'Expenses Ledger', icon: DollarSign },
                { id: 'inventory', name: 'Stock & Inventory', icon: Package, badge: inventory.filter(item => item.quantity <= item.minThreshold).length },
                { id: 'services', name: 'Service Packages', icon: ClipboardList },
                { id: 'team', name: 'Team Roster', icon: Users },
                { id: 'waitlist', name: 'Waitlist Queue', icon: Clock, badge: waitlist.length },
              ].map(tab => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={15} className={`shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      {sidebarOpen && <span className="truncate">{tab.name}</span>}
                    </div>
                    {sidebarOpen && tab.badge && tab.badge > 0 ? (
                      <span className="text-4xs bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Resources / Settings */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-4xs text-slate-500 font-extrabold uppercase tracking-widest block mb-1.5 px-2.5">Resources</span>}
              {[
                { id: 'profile', name: 'Owner Profile', icon: User },
                { id: 'settings', name: 'Shop Settings', icon: Settings },
                { id: 'help', name: 'FAQ & Help Center', icon: HelpCircle },
              ].map(tab => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={15} className={`shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      {sidebarOpen && <span className="truncate">{tab.name}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Panel space */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar with deep dark layout */}
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1329] px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">{settings.shopName}</span>
            <span className="bg-indigo-500/10 text-indigo-400 text-4xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-500/20">Active Workspace</span>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* Help Button */}
            <button
              onClick={() => handleNavigate('help')}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800/60 rounded-lg text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <HelpCircle size={15} className="text-slate-400" />
              <span>Help</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => handleNavigate('settings')}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800/60 rounded-lg text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Settings size={15} className="text-slate-400" />
              <span>Settings</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                const confirm = window.confirm("Are you sure you want to sign out?");
                if (confirm) {
                  window.location.reload();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-rose-950/40 rounded-lg text-slate-300 hover:text-rose-400 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={15} className="text-slate-400" />
              <span>Sign Out</span>
            </button>

            <span className="h-6 w-px bg-slate-800/60 my-auto"></span>

            {/* Notification triggers */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-300 relative transition-all cursor-pointer"
              id="top-notification-bell"
            >
              <Bell size={16} />
              {pendingLeads.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 border-2 border-slate-950 text-white text-4xs font-black rounded-full flex items-center justify-center animate-bounce">
                  {pendingLeads.length}
                </span>
              )}
            </button>

            {/* Notifications self booking requests dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-11 bg-[#111827] border border-slate-800 w-80 rounded-2xl shadow-xl p-4 space-y-3 z-40 animate-fade-in" id="leads-notifications-dropdown">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-400" />
                    Online Booking Requests
                  </span>
                  <span className="text-3xs font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-mono border border-indigo-500/20">
                    {pendingLeads.length} new
                  </span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {pendingLeads.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      <p className="text-2xs font-semibold">No pending self-bookings</p>
                      <p className="text-4xs text-slate-500 mt-0.5">Simulate self-bookings inside the Public Portal.</p>
                    </div>
                  ) : (
                    pendingLeads.map(lead => (
                      <div key={lead.id} className="border border-slate-800 p-3 rounded-xl bg-slate-950 text-xs space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <strong className="font-bold text-white block">{lead.name}</strong>
                            <span className="text-3xs text-slate-400 block font-mono">{lead.phone}</span>
                          </div>
                          <span className="font-mono font-extrabold text-indigo-400 text-3xs">${lead.totalPrice}</span>
                        </div>

                        <div className="flex gap-1.5 items-center bg-slate-900 border border-slate-800 px-2 py-1 rounded text-3xs text-slate-300">
                          <Car size={12} className="text-slate-400" />
                          <span className="truncate">{lead.vehicle.year} {lead.vehicle.make} {lead.vehicle.model}</span>
                        </div>

                        <div className="text-3xs text-slate-400 flex justify-between items-center">
                          <span>Req: {lead.date} @ {lead.time}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleDismissLead(lead.id)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-rose-500/15 border border-slate-800 text-slate-400 hover:text-rose-400 text-3xs font-bold rounded cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleApproveLead(lead)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-3xs font-bold rounded flex items-center gap-0.5 cursor-pointer"
                          >
                            <Check size={10} /> Approve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Profile widget with customizable states */}
            <div className="flex items-center gap-2">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-8 w-8 rounded-full object-cover border border-indigo-500/20 bg-slate-950"
              />
              <div className="hidden sm:block text-left select-none">
                <span className="text-xs font-bold text-white block leading-tight">{profile.name}</span>
                <span className="text-4xs text-indigo-400 font-semibold block uppercase tracking-wider">{profile.role}</span>
              </div>
            </div>

          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#070A13]" id="view-tabs-router">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              appointments={appointments}
              customers={customers}
              services={services}
              leads={leads}
              expenses={expenses}
              inventory={inventory}
              onNavigate={handleNavigate}
              onSelectJob={handleSelectJobFromOutside}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsManager
              appointments={appointments}
              customers={customers}
              services={services}
              staff={staff}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onNavigate={handleNavigate}
              autoOpenNewBooking={autoOpenNewBooking}
              onClearAutoOpenNewBooking={() => setAutoOpenNewBooking(false)}
            />
          )}

          {activeTab === 'workboard' && (
            <BayWorkboard
              appointments={appointments}
              staff={staff}
              settings={settings}
              onUpdateAppointment={handleUpdateAppointment}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsList
              appointments={appointments}
              customers={customers}
              services={services}
              staff={staff}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {activeTab === 'crm' && (
            <CustomerCRM
              customers={customers}
              appointments={appointments}
              onAddCustomer={(newCust) => syncCustomers([newCust, ...customers])}
              onUpdateCustomer={(updated) => syncCustomers(customers.map(c => c.id === updated.id ? updated : c))}
              onDeleteCustomer={(id) => syncCustomers(customers.filter(c => c.id !== id))}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'services' && (
            <ServicesCatalog
              services={services}
              onUpdateService={(updated) => syncServices(services.map(s => s.id === updated.id ? updated : s))}
              onAddService={(newS) => syncServices([...services, newS])}
            />
          )}

          {activeTab === 'billing' && (
            <BillingManager
              appointments={appointments}
              settings={settings}
              onUpdateAppointment={handleUpdateAppointment}
            />
          )}

          {activeTab === 'booking-portal' && (
            <BookingPortal
              services={services}
              settings={settings}
              onAddLead={(newLead) => syncLeads([newLead, ...leads])}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              settings={settings}
              onUpdateSettings={syncSettings}
            />
          )}

          {/* New Tab View Handlers */}
          {activeTab === 'expenses' && (
            <ExpensesManager
              expenses={expenses}
              onAddExpense={(exp) => syncExpenses([exp, ...expenses])}
              onDeleteExpense={(id) => syncExpenses(expenses.filter(e => e.id !== id))}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager
              inventory={inventory}
              onUpdateInventory={syncInventory}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsManager
              appointments={appointments}
              onUpdateAppointment={handleUpdateAppointment}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringManager
              recurringList={recurringList}
              onUpdateRecurringList={syncRecurring}
            />
          )}

          {activeTab === 'team' && (
            <TeamManager
              staffList={staff}
              onUpdateStaffList={syncStaff}
            />
          )}

          {activeTab === 'waitlist' && (
            <WaitlistManager
              waitlist={waitlist}
              services={services}
              onUpdateWaitlist={syncWaitlist}
              onPromoteToBooking={handlePromoteWaitlistToBooking}
            />
          )}

          {activeTab === 'workflows' && (
            <WorkflowsManager
              workflows={workflows}
              onUpdateWorkflows={syncWorkflows}
            />
          )}

          {activeTab === 'automations' && (
            <AutomationsManager
              automationSettings={automationSettings}
              onUpdateSettings={syncAutomationSettings}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileManager
              profile={profile}
              onUpdateProfile={syncProfile}
            />
          )}

          {activeTab === 'help' && (
            <HelpCenter />
          )}
        </main>

      </div>
    </div>
  );
}
