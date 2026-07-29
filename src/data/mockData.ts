/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServicePackage, Customer, Appointment, Staff, ShopSettings } from '../types/crm';

export const DEFAULT_SERVICES: ServicePackage[] = [
  {
    id: 'pkg-express',
    name: 'Express Clean & Shine',
    description: 'High-foaming premium hand wash, wheel de-dusting, thorough interior vacuuming, glass polishing, and high-gloss tire dressing.',
    durationMin: 45,
    pricing: {
      sedan: 75,
      suv: 95,
      truck_large: 115
    },
    category: 'full_detail',
    features: [
      'Foam Bath Hand Wash',
      'Wheel & Tire Cleaning',
      'Interior Vacuum (Seats & Carpets)',
      'Dashboard & Trim Wipedown',
      'Streak-free Window Cleaning',
      'High-Gloss Tire Dressing'
    ]
  },
  {
    id: 'pkg-interior',
    name: 'Deep Interior Sanitization',
    description: 'Full interior deep-cleaning featuring carpet hot-water extraction, detailed steam sanitizing, leather conditioning, and headliner detailed wipe.',
    durationMin: 180,
    pricing: {
      sedan: 175,
      suv: 195,
      truck_large: 225
    },
    category: 'interior',
    features: [
      'Upholstery Shampoo & Hot Water Extraction',
      'Deep Steam Sanitizing of Vent Grills',
      'Leather Cleaning & Premium Conditioning',
      'Stain & Odor Neutralization Treatment',
      'All Vinyl & Trim Detailed UV Protection',
      'Inside Glass & Mirror Detailing'
    ]
  },
  {
    id: 'pkg-full',
    name: 'Showroom Signature Detail',
    description: 'The ultimate bumper-to-bumper reset. Combines deep interior decontamination with advanced paint cleansing, clay bar, and hybrid paint sealant coating.',
    durationMin: 240,
    pricing: {
      sedan: 295,
      suv: 345,
      truck_large: 395
    },
    category: 'full_detail',
    features: [
      'Full Deep Interior Sanitization Package',
      'Engine Bay Clean & Dressing',
      'Iron Decontamination & Clay Bar Treatment',
      'Single-Stage Gloss Polish Enhancer',
      '6-Month Graphene Wax/Sealant Coat',
      'Wheel Well Cleansing & Coating'
    ]
  },
  {
    id: 'pkg-ceramic',
    name: 'Ultimate Ceramic Coating',
    description: 'Full multi-stage paint correction to remove swirls, finished with a professional 3-year ultra-hydrophobic ceramic glass coating.',
    durationMin: 360,
    pricing: {
      sedan: 795,
      suv: 895,
      truck_large: 995
    },
    category: 'ceramic',
    features: [
      '2-Stage Precision Paint Correction (85%+ Swirl Removal)',
      '3-Year Hydrophobic Nano Ceramic Shield',
      'Ceramic Trim, Wheel Face, & Windshield Protection',
      'Curing Oven Inspection & Gloss Meter Certification',
      'Complementary Maintenance Kit Included',
      'Premium Interior Conditioning Accent'
    ]
  },
  {
    id: 'addon-engine',
    name: 'Engine Bay Detailing',
    description: 'Degrease, steam clean, and apply high-heat trim dressing to restore factory sheen.',
    durationMin: 30,
    pricing: {
      sedan: 50,
      suv: 50,
      truck_large: 60
    },
    category: 'add_on',
    features: ['Degrease Engine Block', 'Steam Purge Grime', 'Plastics Matte Protection']
  },
  {
    id: 'addon-headlight',
    name: 'Headlight Restoration',
    description: 'Wet-sand, compound, polish, and apply a premium UV-blocking ceramic coat to foggy lenses.',
    durationMin: 45,
    pricing: {
      sedan: 80,
      suv: 80,
      truck_large: 80
    },
    category: 'add_on',
    features: ['Wet Sand Oxidized Layer', 'Micro Polish Gloss', 'UV Ceramic Clear Coat']
  },
  {
    id: 'addon-pethair',
    name: 'Severe Pet Hair Extraction',
    description: 'Heavy duty extraction of embedded hair using specialized static tools and rubber sweeps.',
    durationMin: 60,
    pricing: {
      sedan: 60,
      suv: 75,
      truck_large: 90
    },
    category: 'add_on',
    features: ['Deep Carpet Static Treatment', 'Serrated Hair Sweepers', 'HEPA Anti-Microbial Vacuum']
  }
];

export const DEFAULT_STAFF: Staff[] = [
  {
    id: 'stf-1',
    name: 'Alex Rivera',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    activeJobsCount: 1
  },
  {
    id: 'stf-2',
    name: 'Marcus Chen',
    role: 'detailer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    activeJobsCount: 1
  },
  {
    id: 'stf-3',
    name: 'Sarah Jenkins',
    role: 'detailer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    activeJobsCount: 1
  },
  {
    id: 'stf-4',
    name: 'Dave Kincaid',
    role: 'detailer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'off-duty',
    activeJobsCount: 0
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
  shopName: 'drwashit Pro Studio',
  phone: '800-555-WASH',
  email: 'info@drwashit.com',
  address: '100 Detailing Way, Suite A, Oceanside, CA 92054',
  taxRate: 8.25,
  currencySymbol: '₹',
  smsTemplates: {
    bookingConfirmed: 'Hi {customer_name}! Your booking for {service_name} on {booking_date} at {booking_time} has been confirmed. See you soon! - {shop_name}',
    workStarted: 'Hi {customer_name}, we are starting on your {vehicle_year} {vehicle_model}! Technician {tech_name} has checked the vehicle into the wash bay. - {shop_name}',
    readyForPickup: 'Hi {customer_name}! Great news! Your {vehicle_model} is ready for pick up. Total amount due is {total_price}. See you soon! - {shop_name}',
    reviewRequest: 'Thank you for choosing {shop_name}, {customer_name}! We would love to hear your feedback. Please leave us a review here: https://g.page/drwashit - Thank you!'
  }
};
