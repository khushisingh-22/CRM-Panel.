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
  ClipboardCheck,
  ArrowLeft
} from 'lucide-react';

const TAB_NAMES: Record<string, string> = {
  dashboard: 'Overview',
  appointments: 'Calendar',
  bookings: 'Bookings',
  workboard: 'Bay Workboard',
  crm: 'Clients',
  employee_ledger: 'Employee Ledger',
  services: 'Services Catalog',
  billing: 'Invoices & Billing',
  'booking-portal': 'Online Portal',
  settings: 'Settings',
  expenses: 'Expenses Log',
  inventory: 'Stock & Inventory',
  packages: 'Packages',
  team: 'Team Status',
  help: 'Help Desk',
  profile: 'Profile'
};

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
import { loadFirebaseUserData, saveFirebaseUserField, loadPublicInvoiceData } from './utils/firebaseSync';
import LoginScreen from './components/LoginScreen';
import PublicInvoiceView from './components/PublicInvoiceView';
import CarIntroLoader from './components/CarIntroLoader';
import { DrWashitLogo } from './components/DrWashitLogo';

// Helper to dynamically calculate customer stats
const recalculateCustomerStats = (customerList: Customer[], appointmentList: Appointment[]): Customer[] => {
  // Enforce unique appointment objects by ID to eliminate any double-counting bugs
  const uniqueApts = Array.from(new Map(appointmentList.map(item => [item.id, item])).values());
  return customerList.map(c => {
    // We count all active non-cancelled appointments in history
    const clientApts = uniqueApts.filter(a => a.customerId === c.id && a.status !== 'cancelled');
    return {
      ...c,
      totalJobs: clientApts.length,
      lifetimeSpend: clientApts.reduce((sum, a) => sum + (a.price || 0), 0)
    };
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl && tabFromUrl !== 'dashboard') return tabFromUrl;
    }
    return 'dashboard';
  });
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('id');
    }
    return null;
  });
  const [navHistory, setNavHistory] = useState<Array<{ tab: string; paramId?: string }>>([{ tab: 'dashboard' }]);
  const [autoOpenNewBooking, setAutoOpenNewBooking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showNotifications, setShowNotifications] = useState(false);

  // Synchronize browser history and trap Android / iOS / Browser Back button to prevent exiting CRM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialTab = new URLSearchParams(window.location.search).get('tab') || 'dashboard';
    const initialId = new URLSearchParams(window.location.search).get('id') || undefined;
    
    // Replace current state with app baseline
    window.history.replaceState({ tab: initialTab, paramId: initialId, crmApp: true }, '', window.location.href);
    // Push a buffer entry so mobile swipe back or hardware back doesn't immediately close/exit the website
    window.history.pushState({ tab: initialTab, paramId: initialId, crmApp: true }, '', window.location.href);

    const handlePopState = () => {
      // Intercept back gesture on Android / iOS / browser
      setNavHistory(prev => {
        if (prev.length > 1) {
          const updated = [...prev];
          updated.pop(); // pop current screen
          const target = updated[updated.length - 1];
          if (target) {
            setActiveTab(target.tab);
            if (target.tab === 'billing') {
              setSelectedInvoiceId(target.paramId || null);
            }
            // Update URL cleanly without leaving page
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set('tab', target.tab);
            if (target.paramId) searchParams.set('id', target.paramId);
            else searchParams.delete('id');
            window.history.replaceState({ tab: target.tab, paramId: target.paramId, crmApp: true }, '', `${window.location.pathname}?${searchParams.toString()}`);
            return updated;
          }
        }

        // Already at root or dashboard: stay in CRM safely!
        setActiveTab('dashboard');
        setSelectedInvoiceId(null);
        // Push a safety state so next back gesture also keeps user in CRM
        window.history.pushState({ tab: 'dashboard', crmApp: true }, '', window.location.pathname);
        return [{ tab: 'dashboard' }];
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Public customer invoice viewing state
  const [publicInvoice, setPublicInvoice] = useState<{ settings: ShopSettings; appointment: Appointment } | null>(null);
  const [loadingPublicInvoice, setLoadingPublicInvoice] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.has('view_invoice') && urlParams.has('owner');
    }
    return false;
  });

  // Load public invoice if viewing via link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('view_invoice');
    const owner = urlParams.get('owner');
    
    if (invoiceId && owner) {
      setLoadingPublicInvoice(true);
      loadPublicInvoiceData(owner, invoiceId).then((data) => {
        if (data && data.appointment) {
          setPublicInvoice({
            settings: data.settings as ShopSettings,
            appointment: data.appointment as Appointment
          });
        }
        setLoadingPublicInvoice(false);
      });
    }
  }, []);

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

    // Apply theme (Redesigned with Premium LIGHT Theme as requested)
    const theme = 'light';
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');

    // Apply font size class
    const fontSize = settings.fontSize || 'medium';
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${fontSize}`);
  }, [settings]);

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Premium Car Detailing Boot Animation state
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);

  // Premium Car Detailing Intro trigger when transitioning to logged-in
  useEffect(() => {
    // Disabled fake multi-step progress bar as requested
    setShowIntro(false);
    setIntroStep(0);
  }, [currentUser]);

  const fetchAndSetUserData = async (user: any) => {
    try {
      const targetUid = user.adminUid || user.uid;
      const data = await loadFirebaseUserData(targetUid);
      const localData = getStoredData();

      const defaultAutomation = {
        autoAssignStaff: true,
        autoSMSOnReady: true,
        autoSMSOnConfirm: true,
        autoInvoiceOnComplete: false,
        reminderHours: 24
      };

      const defaultProfile = {
        name: 'John Doe',
        role: 'Studio Owner',
        email: 'owner@drwashit.online',
        phone: '800-555-WASH',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };

      const firstMigrationDone = localStorage.getItem('is_first_migration_completed') === 'true';

      let mergedServices = data.services || [];
      let mergedCustomers = data.customers || [];
      let mergedAppointments = data.appointments || [];
      let mergedStaff = data.staff || [];
      let mergedSettings = data.settings;
      let mergedLeads = data.leads || [];
      let mergedExpenses = data.expenses || [];
      let mergedInventory = data.inventory || [];
      let mergedRecurring = data.recurring || [];
      let mergedWaitlist = data.waitlist || [];
      let mergedWorkflows = data.workflows || [];
      let mergedPackages = data.packages || [];

      // Only migrate local guest-mode data if the cloud account is completely fresh/uninitialized.
      // This prevents stale or deleted mock bookings in local storage from ever polluting an active cloud account.
      const isCloudEmpty = !data.settings || (data.appointments && data.appointments.length === 0 && data.services && data.services.length === 0);

      if (!firstMigrationDone && isCloudEmpty) {
        // Run Union-Merge once to import any guest-mode local data
        // 1. Services
        if (localData.services && localData.services.length > 0) {
          const existingIds = new Set(mergedServices.map((x: any) => x.id));
          const newLocal = localData.services.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedServices = [...mergedServices, ...newLocal];
            saveFirebaseUserField(targetUid, 'services', mergedServices);
          }
        }

        // 2. Customers
        if (localData.customers && localData.customers.length > 0) {
          const existingIds = new Set(mergedCustomers.map((x: any) => x.id));
          const newLocal = localData.customers.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedCustomers = [...mergedCustomers, ...newLocal];
            saveFirebaseUserField(targetUid, 'customers', mergedCustomers);
          }
        }

        // 3. Appointments
        if (localData.appointments && localData.appointments.length > 0) {
          const existingIds = new Set(mergedAppointments.map((x: any) => x.id));
          const newLocal = localData.appointments.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedAppointments = [...mergedAppointments, ...newLocal];
            saveFirebaseUserField(targetUid, 'appointments', mergedAppointments);
          }
        }

        // 4. Staff
        if (localData.staff && localData.staff.length > 0) {
          const existingIds = new Set(mergedStaff.map((x: any) => x.id));
          const newLocal = localData.staff.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedStaff = [...mergedStaff, ...newLocal];
            saveFirebaseUserField(targetUid, 'staff', mergedStaff);
          }
        }

        // 5. Settings
        if (!mergedSettings && localData.settings && localData.settings.shopName) {
          mergedSettings = localData.settings;
          saveFirebaseUserField(targetUid, 'shop', mergedSettings);
        }

        // 6. Leads
        if (localData.leads && localData.leads.length > 0) {
          const existingIds = new Set(mergedLeads.map((x: any) => x.id));
          const newLocal = localData.leads.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedLeads = [...mergedLeads, ...newLocal];
            saveFirebaseUserField(targetUid, 'leads', mergedLeads);
          }
        }

        // 7. Expenses
        if (localData.expenses && localData.expenses.length > 0) {
          const existingIds = new Set(mergedExpenses.map((x: any) => x.id));
          const newLocal = localData.expenses.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedExpenses = [...mergedExpenses, ...newLocal];
            saveFirebaseUserField(targetUid, 'expenses', mergedExpenses);
          }
        }

        // 8. Inventory
        if (localData.inventory && localData.inventory.length > 0) {
          const existingIds = new Set(mergedInventory.map((x: any) => x.id));
          const newLocal = localData.inventory.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedInventory = [...mergedInventory, ...newLocal];
            saveFirebaseUserField(targetUid, 'inventory', mergedInventory);
          }
        }

        // 9. Recurring
        if (localData.recurring && localData.recurring.length > 0) {
          const existingIds = new Set(mergedRecurring.map((x: any) => x.id));
          const newLocal = localData.recurring.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedRecurring = [...mergedRecurring, ...newLocal];
            saveFirebaseUserField(targetUid, 'recurring', mergedRecurring);
          }
        }

        // 10. Waitlist
        if (localData.waitlist && localData.waitlist.length > 0) {
          const existingIds = new Set(mergedWaitlist.map((x: any) => x.id));
          const newLocal = localData.waitlist.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedWaitlist = [...mergedWaitlist, ...newLocal];
            saveFirebaseUserField(targetUid, 'waitlist', mergedWaitlist);
          }
        }

        // 11. Workflows
        if (localData.workflows && localData.workflows.length > 0) {
          const existingIds = new Set(mergedWorkflows.map((x: any) => x.id));
          const newLocal = localData.workflows.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedWorkflows = [...mergedWorkflows, ...newLocal];
            saveFirebaseUserField(targetUid, 'workflows', mergedWorkflows);
          }
        }

        // 12. Packages
        if (localData.packages && localData.packages.length > 0) {
          const existingIds = new Set(mergedPackages.map((x: any) => x.id));
          const newLocal = localData.packages.filter((x: any) => !existingIds.has(x.id));
          if (newLocal.length > 0) {
            mergedPackages = [...mergedPackages, ...newLocal];
            saveFirebaseUserField(targetUid, 'packages', mergedPackages);
          }
        }
      }

      // Mark migration as completed so it never runs again
      localStorage.setItem('is_first_migration_completed', 'true');

      // Fallback to defaults where appropriate
      if (mergedServices.length === 0) {
        mergedServices = DEFAULT_SERVICES;
        saveFirebaseUserField(targetUid, 'services', DEFAULT_SERVICES);
      }
      if (mergedStaff.length === 0) {
        mergedStaff = DEFAULT_STAFF;
        saveFirebaseUserField(targetUid, 'staff', DEFAULT_STAFF);
      }
      if (!mergedSettings) {
        mergedSettings = DEFAULT_SETTINGS;
        saveFirebaseUserField(targetUid, 'shop', DEFAULT_SETTINGS);
      }
      if (mergedInventory.length === 0) {
        const defaultInv = [
          { id: 'inv-1', name: 'Premium Shampoo', category: 'shampoo', quantity: 25, unit: 'litres', minThreshold: 60, costPrice: 450, location: 'Bay 1' },
          { id: 'inv-2', name: 'Disposable Paper Mats', category: 'papermats', quantity: 150, unit: 'sheets', minThreshold: 30, costPrice: 5, location: 'Shelf B2' },
          { id: 'inv-3', name: 'Paper Air Freshener', category: 'paperAirFreshner', quantity: 80, unit: 'pieces', minThreshold: 20, costPrice: 15, location: 'Counter' }
        ];
        mergedInventory = defaultInv;
        saveFirebaseUserField(targetUid, 'inventory', defaultInv);
      }
      if (mergedWorkflows.length === 0) {
        const defaultWorkflows = [
          { id: 'wf-1', name: 'Auto-Notify on Completed', trigger: 'ready_for_pickup' as const, action: 'send_sms_notification' as const, status: 'active' as const, executionsCount: 0 },
          { id: 'wf-2', name: 'Booking Confirmation Alert', trigger: 'appointment_created' as const, action: 'send_sms_notification' as const, status: 'active' as const, executionsCount: 0 }
        ];
        mergedWorkflows = defaultWorkflows;
        saveFirebaseUserField(targetUid, 'workflows', defaultWorkflows);
      }

      const initialPackages = mergedPackages.length > 0 ? mergedPackages.map((p: any) => {
        if (p.id === 'pkg-default-1' && p.originalPrice === 34234) {
          return { ...p, originalPrice: 1399, packagePrice: 1399 };
        }
        return p;
      }) : [
        { id: 'pkg-default-1', name: '4 Wash In a Month', originalPrice: 1399, packagePrice: 1399, duration: '0h', status: true }
      ];

      if (mergedPackages.length === 0 || mergedPackages.some((p: any) => p.id === 'pkg-default-1' && p.originalPrice === 34234)) {
        saveFirebaseUserField(targetUid, 'packages', initialPackages);
      }

      // Recalculate customer statistics to correct any past stale or double counted values
      const cleanedCustomers = recalculateCustomerStats(mergedCustomers, mergedAppointments);

      // Set all reactive states
      setServices(mergedServices);
      setCustomers(cleanedCustomers);
      setAppointments(mergedAppointments);
      setStaff(mergedStaff);
      setSettings(mergedSettings);
      setLeads(mergedLeads);
      setExpenses(mergedExpenses);
      setInventory(mergedInventory);
      setRecurringList(mergedRecurring);
      setWaitlist(mergedWaitlist);
      setWorkflows(mergedWorkflows);
      setPackages(initialPackages);

      // Update local storage to match exactly
      saveStoredData({
        services: mergedServices,
        customers: cleanedCustomers,
        appointments: mergedAppointments,
        staff: mergedStaff,
        settings: mergedSettings,
        leads: mergedLeads,
        expenses: mergedExpenses,
        inventory: mergedInventory,
        recurring: mergedRecurring,
        waitlist: mergedWaitlist,
        workflows: mergedWorkflows,
        packages: initialPackages,
        automationSettings: data.automationSettings || localData.automationSettings || defaultAutomation,
        profile: data.profile || localData.profile || defaultProfile
      });

      // Also save the cleaned list back to Firebase Firestore to correct database
      saveFirebaseUserField(targetUid, 'customers', cleanedCustomers);

      setAutomationSettings(data.automationSettings || localData.automationSettings || defaultAutomation);
      setProfile(data.profile || localData.profile || defaultProfile);

    } catch (e) {
      console.error("Error setting up data on login/sync:", e);
    }
  };

  // Monitor auth state and load data
  useEffect(() => {
    const unsubscribe = customAuth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.role === 'employee') {
          setActiveTab('dashboard');
        }
        setAuthLoading(true);
        await fetchAndSetUserData(user);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync/refresh database when window visibility changes to prevent stale overwrites across tabs
  useEffect(() => {
    if (!currentUser) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await fetchAndSetUserData(currentUser);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  // Save to Storage when modified (sync with Local & Firebase)
  const syncServices = (updated: ServicePackage[]) => {
    setServices(updated);
    saveStoredData({ services: updated });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'services', updated);
    }
  };

  const syncCustomers = (updated: Customer[]) => {
    const unique = Array.from(new Map(updated.map(item => [item.id, item])).values());
    setCustomers(unique);
    saveStoredData({ customers: unique });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'customers', unique);
    }
  };

  const syncAppointments = (updated: Appointment[]) => {
    const unique = Array.from(new Map(updated.map(item => [item.id, item])).values());
    setAppointments(unique);
    saveStoredData({ appointments: unique });
    if (currentUser) {
      saveFirebaseUserField(currentUser.adminUid || currentUser.uid, 'appointments', unique);
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

    let updatedCustomers = [...customers];
    const client = customers.find(c => c.id === apt.customerId);
    if (!client) {
      const newC: Customer = {
        id: apt.customerId,
        name: apt.customerName,
        phone: apt.customerPhone,
        email: apt.customerEmail,
        vehicles: [apt.vehicle],
        createdAt: new Date().toISOString(),
        lifetimeSpend: 0,
        totalJobs: 0
      };
      updatedCustomers = [newC, ...customers];
    }
    const recalculated = recalculateCustomerStats(updatedCustomers, list);
    syncCustomers(recalculated);
  };

  const handleUpdateAppointment = (updated: Appointment) => {
    const list = appointments.map(a => (a.id === updated.id ? updated : a));
    syncAppointments(list);

    const recalculated = recalculateCustomerStats(customers, list);
    syncCustomers(recalculated);
  };

  const handleDeleteAppointment = (id: string) => {
    const list = appointments.filter(a => a.id !== id);
    syncAppointments(list);

    const recalculated = recalculateCustomerStats(customers, list);
    syncCustomers(recalculated);
  };

  // Lead approval / self booking accept handler
  const handleApproveLead = (lead: any) => {
    // Generate new client if needed
    let client = customers.find(c => c.phone === lead.phone);
    let clientId = client ? client.id : `cust-${Date.now()}`;

    let updatedCustomers = [...customers];
    if (!client) {
      const newC: Customer = {
        id: clientId,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        vehicles: [lead.vehicle],
        createdAt: new Date().toISOString(),
        lifetimeSpend: 0,
        totalJobs: 0
      };
      updatedCustomers = [newC, ...customers];
    } else {
      // Add vehicle to client if not exist
      const hasVeh = client.vehicles.some(v => v.model === lead.vehicle.model);
      updatedCustomers = customers.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            vehicles: hasVeh ? c.vehicles : [...c.vehicles, lead.vehicle]
          };
        }
        return c;
      });
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

    const list = [newApt, ...appointments];
    syncAppointments(list);

    const recalculated = recalculateCustomerStats(updatedCustomers, list);
    syncCustomers(recalculated);

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

    let updatedCustomers = [...customers];
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
      updatedCustomers = [newC, ...customers];
    } else {
      const hasVeh = client.vehicles.some(v => v.model === item.vehicleModel);
      if (!hasVeh) {
        updatedCustomers = customers.map(c => {
          if (c.id === clientId) {
            return {
              ...c,
              vehicles: [...c.vehicles, vehicleObj]
            };
          }
          return c;
        });
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

    const list = [newApt, ...appointments];
    syncAppointments(list);

    const recalculated = recalculateCustomerStats(updatedCustomers, list);
    syncCustomers(recalculated);

    const updatedWaitlist = waitlist.filter(w => w.id !== item.id);
    syncWaitlist(updatedWaitlist);
    setActiveTab('workboard');
    setSelectedJobId(newApt.id);
  };

  // Nav support helper with browser history integration
  const handleNavigate = (tabId: string, paramId?: string, addToHistory: boolean = true) => {
    // Admin only views list
    const adminOnlyTabs = ['employee_ledger', 'billing', 'settings', 'expenses', 'inventory', 'packages', 'services', 'workflows', 'automations'];
    if (currentUser?.role === 'employee' && adminOnlyTabs.includes(tabId)) {
      console.warn(`Blocked unauthorized navigation to: ${tabId}`);
      return;
    }

    if (tabId === 'billing') {
      setSelectedInvoiceId(paramId || null);
    }

    const targetTab = tabId === 'bookings_new' ? 'bookings' : tabId;

    if (addToHistory && targetTab !== activeTab) {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('tab', targetTab);
        if (paramId) {
          searchParams.set('id', paramId);
        } else {
          searchParams.delete('id');
        }
        window.history.pushState({ tab: targetTab, paramId, crmApp: true }, '', `${window.location.pathname}?${searchParams.toString()}`);
      }
      setNavHistory(prev => [...prev, { tab: targetTab, paramId }]);
    }

    if (tabId === 'bookings_new') {
      setActiveTab('bookings');
      setAutoOpenNewBooking(true);
    } else {
      setActiveTab(targetTab);
    }

    // Auto-close sidebar on mobile/tablet after navigating
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleGoBack = () => {
    if (navHistory.length > 1) {
      const updatedHistory = [...navHistory];
      updatedHistory.pop(); // remove current active page
      const previous = updatedHistory[updatedHistory.length - 1];
      setNavHistory(updatedHistory);
      if (previous) {
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          searchParams.set('tab', previous.tab);
          if (previous.paramId) {
            searchParams.set('id', previous.paramId);
          } else {
            searchParams.delete('id');
          }
          window.history.replaceState({ tab: previous.tab, paramId: previous.paramId, crmApp: true }, '', `${window.location.pathname}?${searchParams.toString()}`);
        }
        if (previous.tab === 'billing') {
          setSelectedInvoiceId(previous.paramId || null);
        }
        setActiveTab(previous.tab);
        return;
      }
    }
    // If only 1 item in navHistory or at root, stay on dashboard safely without leaving the app!
    setActiveTab('dashboard');
    setSelectedInvoiceId(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState({ tab: 'dashboard', crmApp: true }, '', window.location.pathname);
    }
  };

  const handleSelectJobFromOutside = (jobId: string | null) => {
    setActiveTab('workboard');
    setSelectedJobId(jobId);
  };

  const pendingLeads = leads.filter(l => l.status === 'new');

  // 0. Guard against Public Customer Invoice View
  const isViewingPublicInvoice = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('view_invoice');

  if (isViewingPublicInvoice) {
    if (loadingPublicInvoice) {
      return (
        <div className="h-screen bg-[#070A13] flex items-center justify-center text-slate-400 font-medium select-none">
          <div className="flex flex-col items-center gap-3">
            <span className="h-9 w-9 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-500 animate-pulse">Loading Digital Invoice...</span>
          </div>
        </div>
      );
    }

    if (publicInvoice) {
      return <PublicInvoiceView appointment={publicInvoice.appointment} settings={publicInvoice.settings} />;
    }

    // Customer is viewing invoice, but loading completed and publicInvoice is null
    return (
      <div className="min-h-screen bg-[#070A13] flex items-center justify-center px-4 py-12 select-none text-slate-300">
        <div className="max-w-md w-full text-center space-y-6 bg-[#0B1329] border border-slate-800/60 rounded-2xl p-8 shadow-2xl">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-2">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">
            Invoice Not Found
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested invoice could not be located or may have expired. Please verify the link or contact customer support.
          </p>
          <div className="pt-4 border-t border-slate-800/60 space-y-2 text-2xs font-semibold text-slate-400">
            <p>Dr Washit Support: <span className="text-sky-400 font-mono">8510002780</span></p>
            <p>Email: <span className="text-sky-400 font-mono">info.drwashit@gmail.com</span></p>
          </div>
        </div>
      </div>
    );
  }

  // 1. Guard against Auth Loading state
  if (authLoading) {
    return (
      <div className="h-screen bg-[#F4F8FB] flex flex-col items-center justify-center select-none font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <DrWashitLogo size={64} className="shadow-md border border-[#E5EDF3]" />
          
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="h-6 w-6 rounded-full border-[3px] border-[#0891B2]/20 border-t-[#0891B2] animate-spin"></span>
            <span className="text-sm font-medium text-[#64748B] mt-1">Checking secure session...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Guard against No Authenticated User
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  // 2.5 Show Premium Detailing Intro sequence
  if (showIntro) {
    return <CarIntroLoader step={introStep} />;
  }

  // 3. Guard against unmounted defaults when logged in but data still fetching
  if (!settings || !settings.shopName) {
    return (
      <div className="h-screen bg-[#F4F8FB] flex flex-col items-center justify-center select-none font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <DrWashitLogo size={64} className="shadow-md border border-[#E5EDF3]" />
          
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="h-6 w-6 rounded-full border-[3px] border-[#0891B2]/20 border-t-[#0891B2] animate-spin"></span>
            <span className="text-sm font-medium text-[#64748B] mt-1">Loading your workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FB] flex text-slate-900 font-sans" id="drwashit-crm-app">
      
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
        } fixed lg:sticky lg:top-0 lg:h-screen lg:self-start inset-y-0 left-0 bg-white border-r border-[#E5EDF3] text-[#334155] flex flex-col justify-between transition-all duration-300 z-50 lg:z-30 select-none`}
        id="side-navigation-panel"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo brand */}
          <div className="h-16 border-b border-[#E5EDF3] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {settings.logoUrl ? (
                <div className="h-7 w-7 rounded-lg overflow-hidden border border-[#E5EDF3] flex items-center justify-center shrink-0 shadow-sm">
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                </div>
              ) : (
                <span className="h-7 w-7 bg-[#0891B2] hover:bg-[#0E7490] transition-colors rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <Car className="text-white shrink-0 stroke-[2.5]" size={16} />
                </span>
              )}
              {sidebarOpen && (
                <div className="min-w-0">
                  <strong className="text-sm font-black text-[#0F172A] block tracking-tight truncate">{settings.shopName || 'Dr Washit'}</strong>
                  <span className="text-4xs text-[#0891B2] font-bold uppercase tracking-wider block">CRM Panel</span>
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
              className="p-1.5 hover:bg-[#F4F8FB] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer text-[#64748B]"
              id="sidebar-toggle-btn"
            >
              <X size={16} className="block lg:hidden" />
              <Menu size={16} className="hidden lg:block" />
            </button>
          </div>

          {/* Scrollable Navigation links */}
          <nav className="flex-1 px-2 pt-6 pb-6 space-y-5 overflow-y-auto scrollbar-thin">
            {/* Core Operation Section */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5 px-2.5">Operations</span>}
              {([
                { id: 'dashboard', name: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'appointments', name: 'Calendar', icon: Calendar },
                { id: 'bookings', name: 'Bookings', icon: ClipboardCheck },
                { id: 'crm', name: 'Clients', icon: Users },
                { id: 'employee_ledger', name: 'Employee Ledger', icon: ClipboardList, adminOnly: true },
                { id: 'billing', name: 'Invoices & Billing', icon: CreditCard, adminOnly: true },
                { id: 'expenses', name: 'Expenses Log', icon: DollarSign, adminOnly: true },
              ] as Array<{ id: string; name: string; icon: any; badge?: number; adminOnly?: boolean }>)
                .filter(tab => !tab.adminOnly || currentUser?.role !== 'employee')
                .map(tab => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white shadow-md'
                        : 'text-[#64748B] hover:bg-[#ECFEFF] hover:text-[#0891B2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={15} className="shrink-0" stroke={active ? '#FFFFFF' : '#64748B'} />
                      {sidebarOpen && <span className={`truncate ${active ? 'font-semibold text-white' : 'text-[#64748B] font-medium'}`}>{tab.name}</span>}
                    </div>
                    {sidebarOpen && tab.badge && tab.badge > 0 ? (
                      <span className="text-4xs bg-[#EF4444] text-white px-1.5 py-0.5 rounded-full font-extrabold animate-pulse">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Business & Inventory Section */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5 px-2.5">Business</span>}
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white shadow-md'
                        : 'text-[#64748B] hover:bg-[#ECFEFF] hover:text-[#0891B2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={15} className="shrink-0" stroke={active ? '#FFFFFF' : '#64748B'} />
                      {sidebarOpen && <span className={`truncate ${active ? 'font-semibold text-white' : 'text-[#64748B] font-medium'}`}>{tab.name}</span>}
                    </div>
                    {sidebarOpen && tab.badge && tab.badge > 0 ? (
                      <span className="text-4xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-extrabold">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Resources / Settings */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5 px-2.5">Resources</span>}
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white shadow-md'
                        : 'text-[#64748B] hover:bg-[#ECFEFF] hover:text-[#0891B2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={15} className="shrink-0" stroke={active ? '#FFFFFF' : '#64748B'} />
                      {sidebarOpen && <span className={`truncate ${active ? 'font-semibold text-white' : 'text-[#64748B] font-medium'}`}>{tab.name}</span>}
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
        
        {/* Top Navbar with light layout */}
        <header className="h-16 border-b border-[#E5EDF3] bg-white px-2.5 sm:px-4 md:px-6 flex items-center justify-between shrink-0 select-none overflow-x-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-[#F4F8FB] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer text-[#64748B] lg:hidden shrink-0"
              title="Toggle Menu"
            >
              <Menu size={18} />
            </button>

            {/* In-app Back Arrow Button whenever on any inner page */}
            {activeTab !== 'dashboard' && (
              <button
                onClick={handleGoBack}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#ECFEFF] hover:bg-[#CFFAFE] text-[#0891B2] hover:text-[#0E7490] rounded-xl text-xs font-extrabold border border-[#0891B2]/40 transition-all cursor-pointer shadow-xs shrink-0 mr-1"
                title={`Go Back to ${TAB_NAMES[navHistory[navHistory.length - 2]?.tab || 'dashboard'] || 'Previous'}`}
                id="header-back-button"
              >
                <ArrowLeft size={15} className="stroke-[2.5]" />
                <span className="font-extrabold text-xs">Back</span>
                {navHistory.length > 1 && navHistory[navHistory.length - 2]?.tab && (
                  <span className="hidden md:inline font-medium text-[#0E7490]/75">
                    to {TAB_NAMES[navHistory[navHistory.length - 2].tab] || 'Overview'}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center gap-1.5 min-w-0 shrink">
              <span className="text-sm font-extrabold text-[#0F172A] truncate max-w-[80px] sm:max-w-none">{settings.shopName || 'Dr Washit'}</span>
              {activeTab !== 'dashboard' && (
                <div className="hidden sm:flex items-center gap-1 min-w-0 text-xs">
                  <span className="text-[#CBD5E1]">/</span>
                  <span className="font-bold text-[#0891B2] truncate max-w-[110px] sm:max-w-[200px]">
                    {TAB_NAMES[activeTab] || activeTab}
                  </span>
                </div>
              )}
            </div>

            {activeTab === 'dashboard' && (
              <span className="bg-[#CFFAFE] text-[#0E7490] text-4xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-[#CFFAFE] hidden sm:inline-block shrink-0">
                Active Workspace
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 relative shrink-0">
            
            {/* Help Button */}
            <button
              onClick={() => handleNavigate('help')}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 hover:bg-[#F4F8FB] rounded-lg text-[#334155] hover:text-[#0891B2] text-xs font-bold transition-all cursor-pointer"
              title="Help"
            >
              <HelpCircle size={15} className="text-[#64748B]" />
              <span className="hidden sm:inline">Help</span>
            </button>

            {/* Settings Button */}
            {currentUser?.role !== 'employee' && (
              <button
                onClick={() => handleNavigate('settings')}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 hover:bg-[#F4F8FB] rounded-lg text-[#334155] hover:text-[#0891B2] text-xs font-bold transition-all cursor-pointer"
                title="Settings"
              >
                <Settings size={15} className="text-[#64748B]" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}

            {/* Sign Out Button */}
            <button
              onClick={async () => {
                await customAuth.signOut();
                window.location.reload();
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 hover:bg-rose-50 rounded-lg text-[#334155] hover:text-[#EF4444] text-xs font-bold transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} className="text-[#64748B]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            <span className="h-6 w-px bg-[#E5EDF3] my-auto"></span>

            {/* Notification triggers - only render if pending leads exist */}
            {pendingLeads.length > 0 && (
              <>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-[#F4F8FB] hover:bg-[#E5EDF3] border border-[#CBD5E1] rounded-xl text-[#334155] relative transition-all cursor-pointer"
                  id="top-notification-bell"
                >
                  <Bell size={16} />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#EF4444] border-2 border-white text-white text-4xs font-black rounded-full flex items-center justify-center animate-bounce">
                    {pendingLeads.length}
                  </span>
                </button>
              </>
            )}

            {/* Notifications self booking requests dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-11 bg-white border border-[#E5EDF3] w-80 rounded-2xl shadow-xl p-4 space-y-3 z-40 animate-fade-in" id="leads-notifications-dropdown">
                <div className="flex items-center justify-between border-b border-[#E5EDF3] pb-2">
                  <span className="text-xs font-black text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#0891B2]" />
                    Online Booking Requests
                  </span>
                  <span className="text-3xs font-semibold bg-[#ECFEFF] text-[#0E7490] px-2 py-0.5 rounded-full font-sans border border-[#CFFAFE]">
                    {pendingLeads.length} new
                  </span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {pendingLeads.length === 0 ? (
                    <div className="py-8 text-center text-[#64748B]">
                      <p className="text-2xs font-semibold">No pending self-bookings</p>
                      <p className="text-4xs text-[#94A3B8] mt-0.5">Simulate self-bookings inside the Public Portal.</p>
                    </div>
                  ) : (
                    pendingLeads.map(lead => (
                      <div key={lead.id} className="border border-[#E5EDF3] p-3 rounded-xl bg-[#F4F8FB] text-xs space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <strong className="font-bold text-[#0F172A] block">{lead.name}</strong>
                            <span className="text-3xs text-[#64748B] block font-sans">{lead.phone}</span>
                          </div>
                          <span className="font-sans font-extrabold text-[#0891B2] text-3xs">₹{lead.totalPrice}</span>
                        </div>

                        <div className="flex gap-1.5 items-center bg-white border border-[#E5EDF3] px-2 py-1 rounded text-3xs text-[#334155]">
                          <Car size={12} className="text-[#64748B]" />
                          <span className="truncate">{lead.vehicle.year} {lead.vehicle.make} {lead.vehicle.model}</span>
                        </div>

                        <div className="text-3xs text-[#64748B] flex justify-between items-center">
                          <span>Req: {lead.date} @ {lead.time}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleDismissLead(lead.id)}
                            className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-[#CBD5E1] text-[#64748B] hover:text-[#EF4444] text-3xs font-bold rounded cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleApproveLead(lead)}
                            className="px-2.5 py-1 bg-[#0891B2] hover:bg-[#0E7490] text-white text-3xs font-bold rounded flex items-center gap-0.5 cursor-pointer"
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
                className="h-8 w-8 rounded-full object-cover border border-[#E5EDF3] bg-[#F4F8FB]"
              />
              <div className="hidden sm:block text-left select-none">
                <span className="text-xs font-bold text-[#0F172A] block leading-tight">{currentUser?.name || profile.name}</span>
                <span className="text-4xs text-[#0891B2] font-semibold block uppercase tracking-wider">{currentUser?.role === 'employee' ? 'Employee' : profile.role}</span>
              </div>
            </div>

          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 md:p-8 bg-[#F4F8FB]" id="view-tabs-router">
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
              onUpdateExpenses={syncExpenses}
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
              ownerUid={currentUser?.adminUid || currentUser?.uid || ''}
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
              staff={staff}
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
              onNavigate={handleNavigate}
              onBack={handleGoBack}
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
              key={selectedInvoiceId || 'billing-latest'}
              appointments={appointments}
              settings={settings}
              onUpdateAppointment={handleUpdateAppointment}
              customers={customers}
              ownerUid={currentUser?.adminUid || currentUser?.uid || ''}
              initialInvoiceId={selectedInvoiceId}
              onNavigate={handleNavigate}
              onBack={handleGoBack}
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
