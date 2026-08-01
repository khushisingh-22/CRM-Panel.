/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServicePackage, Customer, Appointment, Staff, ShopSettings } from '../types/crm';

export const DEFAULT_SERVICES: ServicePackage[] = [
  {
    id: 'pkg-monthly-wash',
    name: 'Car Wash Monthly Package',
    description: 'Unlimited or structured premium monthly washing subscriptions with priority bay access.',
    durationMin: 45,
    pricing: {
      sedan: 1499,
      suv: 1999,
      truck_large: 2499
    },
    category: 'full_detail',
    features: [
      '4 Hand Washes per Month',
      'Vacuuming & Dusting',
      'Tire Dressing & Polish',
      'Priority Scheduling'
    ]
  },
  {
    id: 'pkg-dry-cleaning',
    name: 'Dry Cleaning',
    description: 'Complete deep-extraction shampooing and dry clean for seats, mats, carpets, roof headliner, and door pads.',
    durationMin: 180,
    pricing: {
      sedan: 1999,
      suv: 2499,
      truck_large: 2999
    },
    category: 'interior',
    features: [
      'Upholstery Stain Removal',
      'Hot-Water Soil Extraction',
      'Anti-Bacterial Dry Polish',
      'Odor Neutralizer'
    ]
  },
  {
    id: 'pkg-special-care',
    name: 'Special Car Care',
    description: 'Comprehensive premium detailing treatment including paint correction, high-gloss sealant glaze, and engine-bay conditioning.',
    durationMin: 240,
    pricing: {
      sedan: 2999,
      suv: 3999,
      truck_large: 4999
    },
    category: 'ceramic',
    features: [
      'Single-stage Machine Glazing',
      'Teflon/Ceramic Spray Shield',
      'Engine Dress & Guard',
      'Chassis Underwash'
    ]
  },
  {
    id: 'pkg-bike-scooty',
    name: 'Bike and Scooty',
    description: 'Complete foaming, degreasing, detail wash, and polishing for two-wheelers.',
    durationMin: 30,
    pricing: {
      sedan: 199,
      suv: 249,
      truck_large: 299
    },
    category: 'full_detail',
    features: [
      'Foam Jet Body Wash',
      'Chain Cleaning & Lube',
      'Chrome & Paint Polish',
      'Tire Gloss'
    ]
  },
  {
    id: 'pkg-shine-cost',
    name: 'Shine and Cost',
    description: 'Quick wax application and external spray wax booster for maximum gloss at budget-friendly cost.',
    durationMin: 30,
    pricing: {
      sedan: 499,
      suv: 699,
      truck_large: 899
    },
    category: 'exterior',
    features: [
      'Gloss-Enhancing Hand Wax',
      'Glass Water Repellent Coating',
      'Tire Edge Restoration',
      'Budget-Optimized Value'
    ]
  },
  {
    id: 'pkg-interior-basic',
    name: 'Interior',
    description: 'Deep detailing of interior cabin including dusting, vacuuming, dashboard dressing, and door cleaning.',
    durationMin: 60,
    pricing: {
      sedan: 799,
      suv: 999,
      truck_large: 1199
    },
    category: 'interior',
    features: [
      'Full Cabin High-Power Vacuum',
      'Dashboard Clean & Protect',
      'Console & Cup Holder Scrub',
      'Windows Streak-Free Polish'
    ]
  },
  {
    id: 'pkg-exterior-basic',
    name: 'Exterior',
    description: 'Thorough exterior foam washing, microfiber hand drying, windshield care, and wheel de-griming.',
    durationMin: 45,
    pricing: {
      sedan: 499,
      suv: 599,
      truck_large: 699
    },
    category: 'exterior',
    features: [
      'Active Foam Pressure Wash',
      'Underbody Spray Rinse',
      'Microfiber Touchless Drying',
      'Rim Grime Treatment'
    ]
  },
  {
    id: 'pkg-interior-exterior-wash',
    name: 'Interior+Exterior Wash',
    description: 'Complete detailing package including premium vacuuming, dashboard restoration, foam body washing, and tire glazing.',
    durationMin: 75,
    pricing: {
      sedan: 999,
      suv: 1299,
      truck_large: 1599
    },
    category: 'full_detail',
    features: [
      'Foam Jet Exterior Wash',
      'Underbody Mud Flush',
      'Interior Cabin Dusting & Vacuum',
      'Dashboard & Console Detailing',
      'Streak-free Glass Polishing'
    ]
  },
  {
    id: 'pkg-basic-wash',
    name: 'Basic Wash',
    description: 'Essential outer body wash with premium car shampoo and gentle micro-drying.',
    durationMin: 20,
    pricing: {
      sedan: 299,
      suv: 399,
      truck_large: 499
    },
    category: 'exterior',
    features: [
      'Exterior Water Spray Wash',
      'Foam Shampoo Wipe',
      'Clean Water Rinse',
      'Microfiber Wipe Dry'
    ]
  }
];

export const DEFAULT_STAFF: Staff[] = [
  {
    id: 'stf-shailu',
    name: 'Shailu',
    role: 'detailer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    activeJobsCount: 0,
    phone: '9219099704',
    salary: 10000,
    ledger: []
  },
  {
    id: 'stf-ashu',
    name: 'Ashu',
    role: 'detailer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    activeJobsCount: 0,
    phone: '9810516620',
    salary: 10000,
    ledger: []
  }
];

export const DEFAULT_CUSTOMERS: Customer[] = [];

// Helper to get formatted dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_APPOINTMENTS: Appointment[] = [];

export const DEFAULT_LEADS: any[] = [];

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Dr Washit',
  phone: '8510002780',
  email: 'support@drwashit.com',
  address: 'B-129, Pocket B, Sector-omicron 3rd, omicron III, Greater Noida, Mathurapur, Uttar Pradesh - 201310',
  taxRate: 0,
  currencySymbol: '₹',
  smsTemplates: {
    bookingConfirmed: 'Hi {customer_name}! Your booking for {service_name} on {booking_date} at {booking_time} has been confirmed. See you soon! - {shop_name}',
    workStarted: 'Hi {customer_name}, we are starting on your {vehicle_year} {vehicle_model}! Technician {tech_name} has checked the vehicle into the wash bay. - {shop_name}',
    readyForPickup: 'Hi {customer_name}! Great news! Your {vehicle_model} is ready for pick up. Total amount due is {total_price}. See you soon! - {shop_name}',
    reviewRequest: 'Thank you for choosing {shop_name}, {customer_name}! We would love to hear your feedback. Please leave us a review here: https://g.page/drwashit - Thank you!'
  },
  theme: 'dark',
  fontSize: 'medium'
};
