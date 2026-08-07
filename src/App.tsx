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
  Percent,
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
import { DEFAULT_SERVICES, DEFAULT_STAFF, DEFAULT_SETTINGS } from './data/mockData';
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
import EmployeeManagement from './components/EmployeeManagement';
import WaitlistManager from './components/WaitlistManager';
import WorkflowsManager from './components/WorkflowsManager';
import AutomationsManager from './components/AutomationsManager';
import ProfileManager from './components/ProfileManager';
import HelpCenter from './components/HelpCenter';
import PackagesManager, { BusinessPackage } from './components/PackagesManager';

// Firebase Authentication and Firestore Syncing
import { customAuth } from './lib/customAuth';
import { loadFirebaseUserData, saveFirebaseUserField } from './utils/firebaseSync';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [autoOpenNewBooking, setAutoOpenNewBooking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showNotifications, setShowNotifications] = useState(false);

  // Resize listener to auto close sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    // Initial sync
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const [packages, setPackages] = useState<BusinessPackage[]>([]);
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

  // Apply accessibility settings globally
  useEffect(() => {
    if (!settings || !settings.shopName) return;

    // Apply theme
    const theme = settings.theme || 'dark';
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      // System
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }

    // Apply font size class
    const fontSize = settings.fontSize || 'medium';
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${fontSize}`);
  }, [settings]);

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor auth state and load data
  useEffect(() => {
    const unsubscribe = customAuth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.role === 'employee') {
          setActiveTab('dashboard');
        }
        try {
          const targetUid = user.adminUid || user.uid;
          const data = await loadFirebaseUserData(targetUid);
          
          // Verify & migrate services
          if (!data.services || data.services.length === 0) {
            setServices(DEFAULT_SERVICES);
            saveFirebaseUserField(targetUid, 'services', DEFAULT_SERVICES);
          } else {
            setServices(data.services);
          }
          
          setCustomers(data.customers || []);
          setAppointments(data.appointments || []);
          
          // Verify staff
          if (!data.staff || data.staff.length === 0) {
            setStaff(DEFAULT_STAFF);
            saveFirebaseUserField(targetUid, 'staff', DEFAULT_STAFF);
          } else {
            setStaff(data.staff);
          }
          
          // Verify settings
          if (!data.settings) {
            setSettings(DEFAULT_SETTINGS);
            saveFirebaseUserField(targetUid, 'shop', DEFAULT_SETTINGS);
          } else {
            setSettings(data.settings);
          }
          
          setLeads(data.leads || []);
          setExpenses(data.expenses || []);
          
          // Verify inventory
          if (!data.inventory || data.inventory.length === 0) {
            const defaultInv = [
              { id: 'inv-1', name: 'Premium Shampoo', category: 'shampoo', quantity: 25, unit: 'litres', minThreshold: 60, costPrice: 450, location: 'Bay 1' },
              { id: 'inv-2', name: 'Disposable Paper Mats', category: 'papermats', quantity: 150, unit: 'sheets', minThreshold: 30, costPrice: 5, location: 'Shelf B2' },
              { id: 'inv-3', name: 'Paper Air Freshener', category: 'paperAirFreshner', quantity: 80, unit: 'pieces', minThreshold: 20, costPrice: 15, location: 'Counter' }
            ];
            setInventory(defaultInv);
            saveFirebaseUserField(targetUid, 'inventory', defaultInv);
          } else {
            setInventory(data.inventory);
          }
          
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
          const initialPackages = data.packages && data.packages.length > 0 ? data.packages.map((p: any) => {
            if (p.id === 'pkg-default-1' && p.originalPrice === 34234) {
              return { ...p, originalPrice: 1399, packagePrice: 1399 };
            }
            return p;
          }) : [
            { id: 'pkg-default-1', name: '4 Wash In a Month', originalPrice: 1399, packagePrice: 1399, duration: '0h', status: true }
          ];
          setPackages(initialPackages);
          if (!data.packages || data.packages.length === 0 || data.packages.some((p: any) => p.id === 'pkg-default-1' && p.originalPrice === 34234)) {
            saveFirebaseUserField(targetUid, 'packages', initialPackages);
          }
          
        } catch (e) {
          console.error("Error setting up data on login:", e);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save to Storage when modified (sync with Local & Firebase)
  const syncServices = (updated: ServicePackage[]) => {
    setServices(updated);
    saveStoredData({ services: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'services', updated);
    }
  };

  const syncCustomers = (updated: Customer[]) => {
    setCustomers(updated);
    saveStoredData({ customers: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'customers', updated);
    }
  };

  const syncAppointments = (updated: Appointment[]) => {
    setAppointments(updated);
    saveStoredData({ appointments: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'appointments', updated);
    }
  };

  const syncSettings = (updated: ShopSettings) => {
    setSettings(updated);
    saveStoredData({ settings: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'shop', updated);
    }
  };

  const syncExpenses = (updated: any[]) => {
    setExpenses(updated);
    saveStoredData({ expenses: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'expenses', updated);
    }
  };

  const syncInventory = (updated: any[]) => {
    setInventory(updated);
    saveStoredData({ inventory: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'inventory', updated);
    }
  };

  const syncRecurring = (updated: any[]) => {
    setRecurringList(updated);
    saveStoredData({ recurring: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'recurring', updated);
    }
  };

  const syncWaitlist = (updated: any[]) => {
    setWaitlist(updated);
    saveStoredData({ waitlist: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'waitlist', updated);
    }
  };

  const syncWorkflows = (updated: any[]) => {
    setWorkflows(updated);
    saveStoredData({ workflows: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'workflows', updated);
    }
  };

  const syncAutomationSettings = (updated: any) => {
    setAutomationSettings(updated);
    saveStoredData({ automationSettings: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'automation', updated);
    }
  };

  const syncProfile = (updated: any) => {
    setProfile(updated);
    saveStoredData({ profile: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'profile', updated);
    }
  };

  const syncStaff = (updated: Staff[]) => {
    setStaff(updated);
    saveStoredData({ staff: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'staff', updated);
    }
  };

  const syncLeads = (updated: any[]) => {
    setLeads(updated);
    saveStoredData({ leads: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'leads', updated);
    }
  };

  const syncPackages = (updated: BusinessPackage[]) => {
    setPackages(updated);
    saveStoredData({ packages: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'packages', updated);
    }
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
    // Admin only views list
    const adminOnlyTabs = ['employee_ledger', 'billing', 'settings', 'expenses', 'inventory', 'packages', 'services', 'workflows', 'automations'];
    if (currentUser?.role === 'employee' && adminOnlyTabs.includes(tabId)) {
      console.warn(`Blocked unauthorized navigation to: ${tabId}`);
      return;
    }

    if (tabId === 'bookings_new') {
      setActiveTab('bookings');
      setAutoOpenNewBooking(true);
    } else {
      setActiveTab(tabId);
    }

    // Auto-close sidebar on mobile/tablet after navigating
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSelectJobFromOutside = (jobId: string | null) => {
    setActiveTab('workboard');
    setSelectedJobId(jobId);
  };

  const pendingLeads = leads.filter(l => l.status === 'new');

  // 1. Guard against Auth Loading state
  if (authLoading) {
    return (
      <div className="h-screen bg-[#070A13] flex items-center justify-center text-slate-400 font-medium select-none">
        <div className="flex flex-col items-center gap-3">
          <span className="h-9 w-9 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></span>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500 animate-pulse">Checking Secure Session...</span>
        </div>
      </div>
    );
  }

  // 2. Guard against No Authenticated User
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  // 3. Guard against unmounted defaults when logged in but data still fetching
  if (!settings || !settings.shopName) {
    return (
      <div className="h-screen bg-[#070A13] flex items-center justify-center text-slate-400 font-medium select-none">
        <div className="flex flex-col items-center gap-3">
          <span className="h-9 w-9 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></span>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500 animate-pulse">Syncing Workshop Database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A13] flex text-slate-100 font-sans" id="drwashit-crm-app">
      
      {/* Sidebar Overlay Backdrop for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}
      
      {/* Navigation Sidebar */}
      <aside
        className={`${
          sidebarOpen 
            ? 'w-64 translate-x-0' 
            : 'w-16 lg:translate-x-0 lg:w-16 -translate-x-full'
        } fixed lg:static inset-y-0 left-0 bg-[#0B1329] border-r border-slate-800/60 text-slate-400 flex flex-col justify-between transition-all duration-300 z-50 lg:z-30 select-none`}
        id="side-navigation-panel"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo brand */}
          <div className="h-16 border-b border-slate-800/60 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {settings.logoUrl ? (
                <div className="h-7 w-7 rounded-lg overflow-hidden border border-slate-700/80 flex items-center justify-center shrink-0 shadow-md">
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                </div>
              ) : (
                <span className="h-7 w-7 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg flex items-center justify-center shrink-0 shadow-md">
                  <Car className="text-white shrink-0 stroke-[2.5]" size={16} />
                </span>
              )}
              {sidebarOpen && (
                <div className="min-w-0">
                  <strong className="text-sm font-black text-white block tracking-tight truncate">{settings.shopName || 'Dr. WashIt'}</strong>
                  <span className="text-4xs text-cyan-400 font-bold uppercase tracking-wider block">CRM Panel</span>
                </div>
              )}
            </div>
            
            {/* Collapse toggle */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer text-slate-400"
              id="sidebar-toggle-btn"
            >
              <X size={16} className="block lg:hidden" />
              <Menu size={16} className="hidden lg:block" />
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
                { id: 'employee_ledger', name: 'Employee Ledger', icon: ClipboardList, adminOnly: true },
                { id: 'billing', name: 'Invoices & Billing', icon: CreditCard, adminOnly: true },
              ] as Array<{ id: string; name: string; icon: any; badge?: number; adminOnly?: boolean }>)
                .filter(tab => !tab.adminOnly || currentUser?.role !== 'employee')
                .map(tab => {
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
              {([
                { id: 'inventory', name: 'Stock & Inventory', icon: Package, badge: inventory.filter(item => item.quantity < (item.minThreshold ?? 5)).length, adminOnly: true },
                { id: 'packages', name: 'Packages', icon: Percent, adminOnly: true },
                { id: 'team', name: 'Team Status', icon: Users },
              ] as Array<{ id: string; name: string; icon: any; badge?: number; adminOnly?: boolean }>)
                .filter(tab => !tab.adminOnly || currentUser?.role !== 'employee')
                .map(tab => {
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
              {([
                { id: 'profile', name: currentUser?.role === 'employee' ? 'My Profile' : 'Owner Profile', icon: User },
                { id: 'settings', name: 'Settings', icon: Settings, adminOnly: true },
                { id: 'help', name: 'FAQ & Help Center', icon: HelpCircle },
              ] as Array<{ id: string; name: string; icon: any; adminOnly?: boolean }>)
                .filter(tab => !tab.adminOnly || currentUser?.role !== 'employee')
                .map(tab => {
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
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1329] px-4 md:px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer text-slate-400 lg:hidden"
              title="Toggle Menu"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-extrabold text-white truncate max-w-[120px] sm:max-w-none">{settings.shopName}</span>
            <span className="bg-indigo-500/10 text-indigo-400 text-4xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-500/20 hidden sm:inline-block">Active Workspace</span>
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
            {currentUser?.role !== 'employee' && (
              <button
                onClick={() => handleNavigate('settings')}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800/60 rounded-lg text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Settings size={15} className="text-slate-400" />
                <span>Settings</span>
              </button>
            )}

            {/* Sign Out Button */}
            <button
              onClick={async () => {
                await customAuth.signOut();
                window.location.reload();
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
            <div 
              onClick={() => handleNavigate('profile')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-all duration-200"
              title={currentUser?.role === 'employee' ? 'View My Profile' : 'View Owner Profile'}
            >
              <img
                src={currentUser?.avatar || profile.avatar}
                alt={currentUser?.name || profile.name}
                className="h-8 w-8 rounded-full object-cover border border-indigo-500/20 bg-slate-950"
              />
              <div className="hidden sm:block text-left select-none">
                <span className="text-xs font-bold text-white block leading-tight">{currentUser?.name || profile.name}</span>
                <span className="text-4xs text-indigo-400 font-semibold block uppercase tracking-wider">{currentUser?.role === 'employee' ? 'Employee' : profile.role}</span>
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
              onUpdateAppointment={handleUpdateAppointment}
              currentUser={currentUser}
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
              settings={settings}
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

          {activeTab === 'employee_ledger' && (
            <EmployeeManagement
              staffList={staff}
              onUpdateStaffList={syncStaff}
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
              customers={customers}
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
              key={`${settings.phone || ''}-${settings.logoUrl || ''}`}
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

          {activeTab === 'packages' && (
            <PackagesManager
              packages={packages}
              onUpdatePackages={syncPackages}
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

          {activeTab === 'workflows' && (
            <WorkflowsManager
              workflows={workflows}
              onUpdateWorkflows={syncWorkflows}
            />
          )}

          {activeTab === 'automations' && (
            <AutomationsManager
              key={automationSettings.reminderHours || 'automations'}
              automationSettings={automationSettings}
              onUpdateSettings={syncAutomationSettings}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileManager
              key={profile.email || 'profile'}
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
