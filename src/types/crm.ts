/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VehicleSize = 'sedan' | 'suv' | 'truck_large';

export interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  size: VehicleSize;
  color?: string;
  licensePlate?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  vehicles: VehicleInfo[];
  notes?: string;
  createdAt: string;
  lifetimeSpend: number;
  totalJobs: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  pricing: {
    sedan: number;
    suv: number;
    truck_large: number;
  };
  category: 'full_detail' | 'interior' | 'exterior' | 'ceramic' | 'add_on';
  features: string[];
}

export type AppointmentStatus =
  | 'pending' // For user-submitted requests requiring admin approval
  | 'scheduled'
  | 'in_progress'
  | 'quality_check'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress?: string;
  vehicle: VehicleInfo;
  serviceId: string;
  serviceName: string;
  addOns: { id: string; name: string; price: number }[];
  date: string;
  time: string;
  status: AppointmentStatus;
  price: number;
  notes?: string;
  assignedTo?: string; // staff ID
  checklist?: { [key: string]: boolean };
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid' | 'discount';
  paidAmount?: number;
  paymentMethod?: 'cash' | 'card' | 'stripe' | 'apple_pay' | 'bank_transfer';
  invoiceNumber?: string;
  createdAt: string;
}

export interface StaffLedgerEntry {
  id: string;
  amount: number;
  date: string;
  reason: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'owner' | 'detailer' | 'manager';
  avatar: string;
  status: 'active' | 'off-duty';
  activeJobsCount: number;
  phone?: string;
  salary?: number;
  ledger?: StaffLedgerEntry[];
}

export interface ShopSettings {
  shopName: string;
  phone: string;
  email: string;
  address: string;
  taxRate: number;
  currencySymbol: string;
  smsTemplates: {
    bookingConfirmed: string;
    workStarted: string;
    readyForPickup: string;
    reviewRequest: string;
  };
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
}
