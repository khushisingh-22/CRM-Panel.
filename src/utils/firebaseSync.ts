import { 
  db, 
  doc, 
  getDoc, 
  setDoc,
  collection
} from '../lib/firebase';
import { ServicePackage, Customer, Appointment, Staff, ShopSettings } from '../types/crm';
import {
  DEFAULT_SERVICES,
  DEFAULT_CUSTOMERS,
  DEFAULT_APPOINTMENTS,
  DEFAULT_STAFF,
  DEFAULT_SETTINGS,
  DEFAULT_LEADS
} from '../data/mockData';

const DEFAULT_PACKAGES = [
  { id: 'pkg-default-1', name: '4 Wash In a Month', originalPrice: 34234, packagePrice: 2342, duration: '0h', status: true }
];

const DEFAULT_INVENTORY = [
  { id: 'inv-1', name: 'Premium Shampoo', category: 'shampoo' as const, quantity: 25, unit: 'litres', minThreshold: 60, costPrice: 450, location: 'Bay 1' },
  { id: 'inv-2', name: 'Disposable Paper Mats', category: 'papermats' as const, quantity: 150, unit: 'sheets', minThreshold: 30, costPrice: 5, location: 'Shelf B2' },
  { id: 'inv-3', name: 'Paper Air Freshener', category: 'paperAirFreshner' as const, quantity: 80, unit: 'pieces', minThreshold: 20, costPrice: 15, location: 'Counter' }
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

export const loadFirebaseUserData = async (uid: string) => {
  try {
    const shopDocRef = doc(db, 'users', uid, 'settings', 'shop');
    const shopSnap = await getDoc(shopDocRef);

    if (!shopSnap.exists()) {
      // First-time login: Initialize with default template data
      await initializeNewUserFirestoreData(uid);
    }

    // Load all other collections/documents in parallel
    const docsToFetch = [
      { key: 'shopSettings', ref: doc(db, 'users', uid, 'settings', 'shop') },
      { key: 'automationSettings', ref: doc(db, 'users', uid, 'settings', 'automation') },
      { key: 'profile', ref: doc(db, 'users', uid, 'settings', 'profile') },
      { key: 'services', ref: doc(db, 'users', uid, 'collections', 'services') },
      { key: 'customers', ref: doc(db, 'users', uid, 'collections', 'customers') },
      { key: 'appointments', ref: doc(db, 'users', uid, 'collections', 'appointments') },
      { key: 'staff', ref: doc(db, 'users', uid, 'collections', 'staff') },
      { key: 'leads', ref: doc(db, 'users', uid, 'collections', 'leads') },
      { key: 'expenses', ref: doc(db, 'users', uid, 'collections', 'expenses') },
      { key: 'inventory', ref: doc(db, 'users', uid, 'collections', 'inventory') },
      { key: 'recurring', ref: doc(db, 'users', uid, 'collections', 'recurring') },
      { key: 'waitlist', ref: doc(db, 'users', uid, 'collections', 'waitlist') },
      { key: 'workflows', ref: doc(db, 'users', uid, 'collections', 'workflows') },
      { key: 'packages', ref: doc(db, 'users', uid, 'collections', 'packages') }
    ];

    const results = await Promise.all(
      docsToFetch.map(async ({ key, ref }) => {
        try {
          const snap = await getDoc(ref);
          return { key, data: snap.exists() ? snap.data().items || snap.data() : null };
        } catch (e) {
          console.error(`Error loading key ${key}:`, e);
          return { key, data: null };
        }
      })
    );

    const dataMap: { [key: string]: any } = {};
    results.forEach(({ key, data }) => {
      dataMap[key] = data;
    });

    return {
      settings: dataMap.shopSettings || DEFAULT_SETTINGS,
      automationSettings: dataMap.automationSettings || DEFAULT_AUTOMATION_SETTINGS,
      profile: dataMap.profile || DEFAULT_PROFILE,
      services: dataMap.services || DEFAULT_SERVICES,
      customers: dataMap.customers || DEFAULT_CUSTOMERS,
      appointments: dataMap.appointments || DEFAULT_APPOINTMENTS,
      staff: dataMap.staff || DEFAULT_STAFF,
      leads: dataMap.leads || DEFAULT_LEADS,
      expenses: dataMap.expenses || [],
      inventory: dataMap.inventory || DEFAULT_INVENTORY,
      recurring: dataMap.recurring || [],
      waitlist: dataMap.waitlist || [],
      workflows: dataMap.workflows || DEFAULT_WORKFLOWS,
      packages: dataMap.packages || DEFAULT_PACKAGES
    };

  } catch (error) {
    console.error("Error loading user data from Firebase:", error);
    throw error;
  }
};

export const saveFirebaseUserField = async (uid: string, category: string, data: any) => {
  try {
    let ref;
    if (['shop', 'automation', 'profile'].includes(category)) {
      ref = doc(db, 'users', uid, 'settings', category);
      await setDoc(ref, data, { merge: true });
    } else {
      ref = doc(db, 'users', uid, 'collections', category);
      await setDoc(ref, { items: data }, { merge: true });
    }
  } catch (error) {
    console.error(`Error saving user field ${category} to Firebase:`, error);
  }
};

const initializeNewUserFirestoreData = async (uid: string) => {
  const initialDocs = [
    { ref: doc(db, 'users', uid, 'settings', 'shop'), data: DEFAULT_SETTINGS },
    { ref: doc(db, 'users', uid, 'settings', 'automation'), data: DEFAULT_AUTOMATION_SETTINGS },
    { ref: doc(db, 'users', uid, 'settings', 'profile'), data: DEFAULT_PROFILE },
    { ref: doc(db, 'users', uid, 'collections', 'services'), data: { items: DEFAULT_SERVICES } },
    { ref: doc(db, 'users', uid, 'collections', 'customers'), data: { items: DEFAULT_CUSTOMERS } },
    { ref: doc(db, 'users', uid, 'collections', 'appointments'), data: { items: DEFAULT_APPOINTMENTS } },
    { ref: doc(db, 'users', uid, 'collections', 'staff'), data: { items: DEFAULT_STAFF } },
    { ref: doc(db, 'users', uid, 'collections', 'leads'), data: { items: DEFAULT_LEADS } },
    { ref: doc(db, 'users', uid, 'collections', 'expenses'), data: { items: [] } },
    { ref: doc(db, 'users', uid, 'collections', 'inventory'), data: { items: DEFAULT_INVENTORY } },
    { ref: doc(db, 'users', uid, 'collections', 'recurring'), data: { items: [] } },
    { ref: doc(db, 'users', uid, 'collections', 'waitlist'), data: { items: [] } },
    { ref: doc(db, 'users', uid, 'collections', 'workflows'), data: { items: DEFAULT_WORKFLOWS } },
    { ref: doc(db, 'users', uid, 'collections', 'packages'), data: { items: DEFAULT_PACKAGES } }
  ];

  await Promise.all(
    initialDocs.map(({ ref, data }) => setDoc(ref, data, { merge: true }))
  );
};
