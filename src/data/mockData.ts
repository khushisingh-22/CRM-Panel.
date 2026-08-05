/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServicePackage, Customer, Appointment, Staff, ShopSettings } from '../types/crm';

export const DEFAULT_SERVICES: ServicePackage[] = [
  {
    id: 'pkg-basic-ext-int',
    name: 'Basic (Exterior + Interior)',
    description: 'Essential outer body wash with premium foam shampoo and clean cabin vacuuming & dusting.',
    durationMin: 45,
    pricing: {
      sedan: 499,
      suv: 499,
      truck_large: 499
    },
    category: 'full_detail',
    features: [
      'Active Foam Pressure Wash',
      'Underbody Mud Flush',
      'Interior Cabin Vacuum & Dusting',
      'Dashboard & Console Wipe',
      'Tire Gloss'
    ]
  },
  {
    id: 'pkg-exterior-wash',
    name: 'Exterior Wash',
    description: 'Thorough external foam washing, microfiber hand drying, windshield care, and wheel de-griming.',
    durationMin: 30,
    pricing: {
      sedan: 399,
      suv: 399,
      truck_large: 399
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
    id: 'pkg-dry-cleaning',
    name: 'Dry Cleaning',
    description: 'Complete deep-extraction shampooing and dry clean for seats, mats, carpets, roof headliner, and door pads.',
    durationMin: 180,
    pricing: {
      sedan: 1999,
      suv: 1999,
      truck_large: 1999
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
    id: 'pkg-deep-clean',
    name: 'Deep Clean',
    description: 'Comprehensive detailed treatment for the entire car, both inside and out, restoring it to pristine condition.',
    durationMin: 120,
    pricing: {
      sedan: 999,
      suv: 999,
      truck_large: 999
    },
    category: 'full_detail',
    features: [
      'Engine Bay Detailing',
      'Rubbing & Buffing Wax',
      'Deep Carpet Shampooing',
      'Dashboard Dressing & Polish',
      'AC Vents Disinfection'
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
  fontSize: 'medium',
  logoUrl: 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=150&auto=format&fit=crop&q=80'
};
