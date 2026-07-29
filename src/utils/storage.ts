/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DEFAULT_SERVICES,
  DEFAULT_CUSTOMERS,
  DEFAULT_APPOINTMENTS,
  DEFAULT_STAFF,
  DEFAULT_SETTINGS,
  DEFAULT_LEADS
} from '../data/mockData';
import { ServicePackage, Customer, Appointment, Staff, ShopSettings } from '../types/crm';

const KEYS = {
  SERVICES: 'df_services',
  CUSTOMERS: 'df_customers',
  APPOINTMENTS: 'df_appointments',
  STAFF: 'df_staff',
  SETTINGS: 'df_settings',
  LEADS: 'df_leads',
  EXPENSES: 'df_expenses',
  INVENTORY: 'df_inventory',
  RECURRING: 'df_recurring',
  WAITLIST: 'df_waitlist',
  WORKFLOWS: 'df_workflows',
  AUTOMATION_SETTINGS: 'df_automation_settings',
  PROFILE: 'df_owner_profile'
};

const DEFAULT_INVENTORY = [
  { id: 'inv-1', name: 'Ceramic Nano Coating 50ml', category: 'coatings' as const, quantity: 12, unit: 'bottles', minThreshold: 3, costPrice: 45, location: 'Shelf A3' },
  { id: 'inv-2', name: 'Premium High-Foam Suds', category: 'chemicals' as const, quantity: 5, unit: 'gallons', minThreshold: 2, costPrice: 28, location: 'Chemical Rack' },
  { id: 'inv-3', name: 'Microfiber Towels 40x40 (10pk)', category: 'towels' as const, quantity: 20, unit: 'packs', minThreshold: 5, costPrice: 15, location: 'Towel Bin' },
  { id: 'inv-4', name: 'Medium Foam Polishing Pads', category: 'pads' as const, quantity: 15, unit: 'units', minThreshold: 4, costPrice: 8, location: 'Pad Box 1' }
];

const DEFAULT_WORKFLOWS = [
  { id: 'wf-1', name: 'Auto-Notify on Completed', trigger: 'ready_for_pickup' as const, action: 'send_sms_notification' as const, status: 'active' as const, executionsCount: 0 },
  { id: 'wf-2', name: 'Booking Confirmation Alert', trigger: 'appointment_created' as const, action: 'send_sms_notification' as const, status: 'active' as const, executionsCount: 0 }
];

const DEFAULT_AUTOMATION_SETTINGS = {
  autoAssignStaff: true,
  autoSMSOnReady: true,
  autoSMSOnConfirm: true,
  autoInvoiceOnComplete: false,
  reminderHours: 24
};

const DEFAULT_PROFILE = {
  name: 'John Doe',
  role: 'Studio Owner',
  email: 'owner@drwashit.online',
  phone: '800-555-WASH',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const getStoredData = () => {
  try {
    const servicesStr = localStorage.getItem(KEYS.SERVICES);
    const customersStr = localStorage.getItem(KEYS.CUSTOMERS);
    const appointmentsStr = localStorage.getItem(KEYS.APPOINTMENTS);
    const staffStr = localStorage.getItem(KEYS.STAFF);
    const settingsStr = localStorage.getItem(KEYS.SETTINGS);
    const leadsStr = localStorage.getItem(KEYS.LEADS);
    const expensesStr = localStorage.getItem(KEYS.EXPENSES);
    const inventoryStr = localStorage.getItem(KEYS.INVENTORY);
    const recurringStr = localStorage.getItem(KEYS.RECURRING);
    const waitlistStr = localStorage.getItem(KEYS.WAITLIST);
    const workflowsStr = localStorage.getItem(KEYS.WORKFLOWS);
    const automationSettingsStr = localStorage.getItem(KEYS.AUTOMATION_SETTINGS);
    const profileStr = localStorage.getItem(KEYS.PROFILE);

    return {
      services: servicesStr ? JSON.parse(servicesStr) as ServicePackage[] : DEFAULT_SERVICES,
      customers: customersStr ? JSON.parse(customersStr) as Customer[] : DEFAULT_CUSTOMERS,
      appointments: appointmentsStr ? JSON.parse(appointmentsStr) as Appointment[] : DEFAULT_APPOINTMENTS,
      staff: staffStr ? JSON.parse(staffStr) as Staff[] : DEFAULT_STAFF,
      settings: settingsStr ? JSON.parse(settingsStr) as ShopSettings : DEFAULT_SETTINGS,
      leads: leadsStr ? JSON.parse(leadsStr) as typeof DEFAULT_LEADS : DEFAULT_LEADS,
      expenses: expensesStr ? JSON.parse(expensesStr) : [],
      inventory: inventoryStr ? JSON.parse(inventoryStr) : DEFAULT_INVENTORY,
      recurring: recurringStr ? JSON.parse(recurringStr) : [],
      waitlist: waitlistStr ? JSON.parse(waitlistStr) : [],
      workflows: workflowsStr ? JSON.parse(workflowsStr) : DEFAULT_WORKFLOWS,
      automationSettings: automationSettingsStr ? JSON.parse(automationSettingsStr) : DEFAULT_AUTOMATION_SETTINGS,
      profile: profileStr ? JSON.parse(profileStr) : DEFAULT_PROFILE
    };
  } catch (e) {
    console.error('Error loading from localStorage, using defaults', e);
    return {
      services: DEFAULT_SERVICES,
      customers: DEFAULT_CUSTOMERS,
      appointments: DEFAULT_APPOINTMENTS,
      staff: DEFAULT_STAFF,
      settings: DEFAULT_SETTINGS,
      leads: DEFAULT_LEADS,
      expenses: [],
      inventory: DEFAULT_INVENTORY,
      recurring: [],
      waitlist: [],
      workflows: DEFAULT_WORKFLOWS,
      automationSettings: DEFAULT_AUTOMATION_SETTINGS,
      profile: DEFAULT_PROFILE
    };
  }
};

export const saveStoredData = (data: {
  services?: ServicePackage[];
  customers?: Customer[];
  appointments?: Appointment[];
  staff?: Staff[];
  settings?: ShopSettings;
  leads?: typeof DEFAULT_LEADS;
  expenses?: any[];
  inventory?: any[];
  recurring?: any[];
  waitlist?: any[];
  workflows?: any[];
  automationSettings?: any;
  profile?: any;
}) => {
  try {
    if (data.services) localStorage.setItem(KEYS.SERVICES, JSON.stringify(data.services));
    if (data.customers) localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data.customers));
    if (data.appointments) localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
    if (data.staff) localStorage.setItem(KEYS.STAFF, JSON.stringify(data.staff));
    if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.leads) localStorage.setItem(KEYS.LEADS, JSON.stringify(data.leads));
    if (data.expenses) localStorage.setItem(KEYS.EXPENSES, JSON.stringify(data.expenses));
    if (data.inventory) localStorage.setItem(KEYS.INVENTORY, JSON.stringify(data.inventory));
    if (data.recurring) localStorage.setItem(KEYS.RECURRING, JSON.stringify(data.recurring));
    if (data.waitlist) localStorage.setItem(KEYS.WAITLIST, JSON.stringify(data.waitlist));
    if (data.workflows) localStorage.setItem(KEYS.WORKFLOWS, JSON.stringify(data.workflows));
    if (data.automationSettings) localStorage.setItem(KEYS.AUTOMATION_SETTINGS, JSON.stringify(data.automationSettings));
    if (data.profile) localStorage.setItem(KEYS.PROFILE, JSON.stringify(data.profile));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};
