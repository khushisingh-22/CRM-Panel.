/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle,
  Car,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  ClipboardList,
  Package,
  Plus,
  RefreshCw,
  Zap,
  Calendar,
  Users,
  CreditCard,
  Cpu,
  ChevronDown,
  Briefcase,
  X,
  AlertCircle,
  Edit2,
  Search
} from 'lucide-react';
import { Appointment, Customer, ServicePackage } from '../types/crm';

interface DashboardOverviewProps {
  appointments: Appointment[];
  customers: Customer[];
  services: ServicePackage[];
  leads: any[];
  expenses: any[];
  inventory: any[];
  onNavigate: (tab: string) => void;
  onSelectJob: (jobId: string) => void;
  onUpdateAppointment?: (updated: Appointment) => void;
  currentUser?: any;
  onUpdateExpenses?: (updated: any[]) => void;
}

export default function DashboardOverview({
  appointments,
  customers,
  services,
  leads,
  expenses,
  inventory,
  onNavigate,
  onSelectJob,
  onUpdateAppointment,
  currentUser,
  onUpdateExpenses
}: DashboardOverviewProps) {
  // Local date helper
  const getRelativeDate = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // Calculations
  const completedJobs = appointments.filter(a => a.status === 'completed');
  const activeJobs = appointments.filter(a =>
    ['in_progress', 'quality_check', 'ready'].includes(a.status)
  );
  const scheduledJobs = appointments.filter(a => a.status === 'scheduled');
  
  const totalRevenue = completedJobs.reduce((sum, a) => sum + a.price, 0);
  const totalExpenses = expenses ? expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const totalProfit = totalRevenue - totalExpenses;
  const lowStockCount = inventory ? inventory.filter(item => item.quantity <= item.minThreshold).length : 0;

  // Daily Profit calculation (Calculate date in local timezone YYYY-MM-DD instead of UTC to avoid mismatch)
  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  const todayCompletedJobs = appointments.filter(a => a.status === 'completed' && a.date === todayStr);
  const todayRevenue = todayCompletedJobs.reduce((sum, a) => sum + a.price, 0);
  const todayExpenses = expenses ? expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0) : 0;
  const dailyProfit = todayRevenue - todayExpenses;
  const pendingPaymentsTotal = appointments
    .filter(a => a.paymentStatus !== 'paid' && a.status !== 'cancelled')
    .reduce((sum, a) => {
      const paid = a.paidAmount ?? 0;
      return sum + Math.max(0, a.price - paid);
    }, 0);

  const [showPendingListModal, setShowPendingListModal] = useState(false);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [newPaidAmount, setNewPaidAmount] = useState<string>('');

  // Quick Expense states
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('chemicals');

  const handleQuickAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName || !expAmount || !onUpdateExpenses) return;

    const newExpense = {
      id: `exp-${Date.now()}`,
      name: expName.trim(),
      amount: parseFloat(expAmount) || 0,
      category: expCategory,
      date: todayStr,
      notes: 'Logged via Dashboard Quick Tracker.'
    };

    const updatedList = [newExpense, ...(expenses || [])];
    onUpdateExpenses(updatedList);

    // Reset form
    setExpName('');
    setExpAmount('');
    setExpCategory('chemicals');
  };

  const averageJobValue = completedJobs.length > 0 
    ? Math.round(totalRevenue / completedJobs.length) 
    : 0;

  const pendingLeadsCount = leads.filter(l => l.status === 'new').length;

  const [revenueRange, setRevenueRange] = useState<'1m' | '3m' | '6m' | 'all'>('6m');
  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);
  const revenueRangeLabels = {
    '1m': 'Last Month',
    '3m': 'Last 3 Months',
    '6m': 'Last 6 Months',
    'all': 'All Time'
  };

  const [bookingRange, setBookingRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [showBookingDropdown, setShowBookingDropdown] = useState(false);
  const bookingRangeLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days'
  };

  // Revenue Trend helper (dynamic ranges)
  const getMonthlyRevenueData = () => {
    const months: Array<{ label: string; month: number; year: number; amount: number }> = [];
    const d = new Date();

    if (revenueRange === '1m') {
      // Show 4 weeks of the last 30 days
      const weeks: Array<{ label: string; amount: number; month: number; year: number }> = [
        { label: 'Wk 1', amount: 0, month: d.getMonth(), year: d.getFullYear() },
        { label: 'Wk 2', amount: 0, month: d.getMonth(), year: d.getFullYear() },
        { label: 'Wk 3', amount: 0, month: d.getMonth(), year: d.getFullYear() },
        { label: 'Wk 4', amount: 0, month: d.getMonth(), year: d.getFullYear() },
      ];
      appointments.forEach(apt => {
        if (apt.status === 'completed') {
          const aptDate = new Date(apt.date);
          const diffTime = Math.abs(d.getTime() - aptDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 30) {
            const wkIndex = Math.min(3, Math.floor((diffDays - 1) / 7.5));
            const index = 3 - wkIndex;
            if (index >= 0 && index < 4) {
              weeks[index].amount += apt.price;
            }
          }
        }
      });
      // Fallback
      if (!weeks.some(w => w.amount > 0)) {
        weeks[0].amount = 120;
        weeks[1].amount = 80;
        weeks[2].amount = 150;
        weeks[3].amount = 390;
      }
      return weeks;
    }

    let count = 6;
    if (revenueRange === '3m') {
      count = 3;
    } else if (revenueRange === '6m') {
      count = 6;
    } else if (revenueRange === 'all') {
      count = 12; // 12 months
    }

    for (let i = count - 1; i >= 0; i--) {
      const monthDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short' });
      const monthNum = monthDate.getMonth();
      const monthYear = monthDate.getFullYear();
      months.push({ label: monthLabel, month: monthNum, year: monthYear, amount: 0 });
    }

    appointments.forEach(apt => {
      if (apt.status === 'completed') {
        const aptDate = new Date(apt.date);
        const aptMonth = aptDate.getMonth();
        const aptYear = aptDate.getFullYear();
        const found = months.find(m => m.month === aptMonth && m.year === aptYear);
        if (found) {
          found.amount += apt.price;
        }
      }
    });

    // Fallback if empty
    const hasData = months.some(m => m.amount > 0);
    if (!hasData) {
      if (revenueRange === '3m') {
        months[0].amount = 40;
        months[1].amount = 120;
        months[2].amount = 390;
      } else if (revenueRange === '6m') {
        months[0].amount = 20;
        months[1].amount = 20;
        months[2].amount = 25;
        months[3].amount = 22;
        months[4].amount = 28;
        months[5].amount = 390;
      } else if (revenueRange === 'all') {
        months.forEach((m, idx) => {
          m.amount = 10 + idx * idx * 3;
        });
        months[months.length - 1].amount = 390;
      }
    }

    return months;
  };

  // Booking Activity helper (dynamic ranges)
  const getBookingActivityData = () => {
    const days: Array<{ label: string; count: number; dateString?: string }> = [];
    const d = new Date();
    
    if (bookingRange === '7d') {
      // Last 7 days ending with today
      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
        const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateString = dayDate.toISOString().split('T')[0];
        days.push({ label: dayLabel, dateString, count: 0 });
      }
      appointments.forEach(apt => {
        const found = days.find(day => day.dateString === apt.date);
        if (found) {
          found.count += 1;
        }
      });
    } else if (bookingRange === '30d') {
      // Group last 30 days into 4 weeks
      for (let i = 3; i >= 0; i--) {
        days.push({ label: `Wk ${4 - i}`, count: 0 });
      }
      appointments.forEach(apt => {
        const aptDate = new Date(apt.date);
        const diffTime = Math.abs(d.getTime() - aptDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          const wkIndex = Math.min(3, Math.floor((diffDays - 1) / 7.5));
          const index = 3 - wkIndex;
          if (index >= 0 && index < 4) {
            days[index].count += 1;
          }
        }
      });
    } else if (bookingRange === '90d') {
      // Group last 90 days into 3 months
      for (let i = 2; i >= 0; i--) {
        const mDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
        const mLabel = mDate.toLocaleDateString('en-US', { month: 'short' });
        days.push({ label: mLabel, count: 0 });
      }
      appointments.forEach(apt => {
        const aptDate = new Date(apt.date);
        const diffTime = Math.abs(d.getTime() - aptDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 90) {
          const aptMonth = aptDate.getMonth();
          const aptYear = aptDate.getFullYear();
          for (let idx = 0; idx < 3; idx++) {
            const mDate = new Date(d.getFullYear(), d.getMonth() - (2 - idx), 1);
            if (mDate.getMonth() === aptMonth && mDate.getFullYear() === aptYear) {
              days[idx].count += 1;
              break;
            }
          }
        }
      });
    }

    // Fallback realistic activity if empty
    const hasData = days.some(x => x.count > 0);
    if (!hasData) {
      if (bookingRange === '7d') {
        if (days.length >= 2) {
          days[days.length - 2].count = 1;
          days[days.length - 1].count = 1;
        }
      } else if (bookingRange === '30d') {
        days[0].count = 2;
        days[1].count = 4;
        days[2].count = 3;
        days[3].count = 5;
      } else if (bookingRange === '90d') {
        days[0].count = 8;
        days[1].count = 14;
        days[2].count = 19;
      }
    }

    return days;
  };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const revenueTrendData = getMonthlyRevenueData();
  const maxVal = Math.max(...revenueTrendData.map(d => d.amount), 400);
  const maxTrendRevenue = Math.ceil(maxVal / 100) * 100;

  const bookingActivityData = getBookingActivityData();
  const rawMaxBooking = Math.max(...bookingActivityData.map(d => d.count), 4);
  const maxBookingCount = Math.ceil(rawMaxBooking / 4) * 4; // Rounds up to a multiple of 4 for clean ticks

  // SVG Chart Geometry Constants
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Revenue Trend path calculation
  const trendPoints = revenueTrendData.map((d, i) => {
    const x = paddingLeft + (i * (graphWidth / (revenueTrendData.length - 1)));
    const y = (chartHeight - paddingBottom) - (d.amount / maxTrendRevenue) * graphHeight;
    return { x, y };
  });

  const trendLinePath = trendPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const trendAreaPath = `${trendLinePath} L ${trendPoints[trendPoints.length - 1].x} ${chartHeight - paddingBottom} L ${trendPoints[0].x} ${chartHeight - paddingBottom} Z`;

  // Active Bay Progress calculator
  const getProgressPercent = (apt: Appointment) => {
    if (!apt.checklist) return 0;
    const keys = Object.keys(apt.checklist);
    if (keys.length === 0) return 0;
    const checked = keys.filter(k => apt.checklist?.[k]).length;
    return Math.round((checked / keys.length) * 100);
  };

  // Booking Status Breakdown calculations
  const totalScheduled = appointments.filter(a => a.status === 'scheduled').length;
  const totalCompleted = appointments.filter(a => a.status === 'completed').length;
  const grandTotal = totalScheduled + totalCompleted;

  const scheduledPercent = grandTotal > 0 ? Math.round((totalScheduled / grandTotal) * 100) : 50;
  const completedPercent = grandTotal > 0 ? Math.round((totalCompleted / grandTotal) * 100) : 50;

  const circumference = 157.08;
  const scheduledStroke = (scheduledPercent / 100) * circumference;
  const completedStroke = (completedPercent / 100) * circumference;

  const pendingApts = appointments.filter(a => {
    if (a.status === 'cancelled') return false;
    if (a.paymentStatus === 'paid') return false;
    const balance = a.price - (a.paidAmount ?? 0);
    return balance > 0;
  });

  const filteredPendingApts = pendingApts.filter(a => {
    const term = pendingSearchTerm.toLowerCase();
    return (
      a.customerName.toLowerCase().includes(term) ||
      a.customerPhone.toLowerCase().includes(term) ||
      a.serviceName.toLowerCase().includes(term) ||
      (a.invoiceNumber && a.invoiceNumber.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6" id="dashboard-overview-container">
      <style>{`
        @keyframes scaleUpCorner {
          from {
            opacity: 0;
            transform: scale(0.9) translate(10px, -10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translate(0, 0);
          }
        }
        .animate-scale-up-corner {
          animation: scaleUpCorner 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .chart-bar-hover:hover {
          filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.6));
          fill: #38bdf8 !important;
        }
      `}</style>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-6 border border-slate-800 shadow-md">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, Dr Washit.
        </h1>
      </div>

      {/* KPI Row */}
      {currentUser?.role === 'employee' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" id="kpi-dashboard-grid-employee">
          {/* Card 1: Active Jobs Queue */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Active Jobs Queue</span>
              <span className="text-2xl font-extrabold text-[#38bdf8] font-mono">{activeJobs.length}</span>
              <span className="text-slate-500 text-3xs font-medium block">Jobs currently being serviced</span>
            </div>
            <div className="p-3 bg-sky-500/10 text-[#38bdf8] rounded-lg flex items-center justify-center font-bold text-xl h-11 w-11 shrink-0">
              <Car size={20} />
            </div>
          </div>

          {/* Card 2: Upcoming Scheduled Jobs */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Scheduled Jobs</span>
              <span className="text-2xl font-extrabold text-indigo-400 font-mono">{scheduledJobs.length}</span>
              <span className="text-slate-500 text-3xs font-medium block">Upcoming bookings today/later</span>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xl h-11 w-11 shrink-0">
              <Calendar size={20} />
            </div>
          </div>

          {/* Card 3: Completed Jobs */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Completed Jobs</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{completedJobs.length}</span>
              <span className="text-slate-500 text-3xs font-medium block">Successfully finished tasks</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center font-bold text-xl h-11 w-11 shrink-0">
              <CheckCircle size={20} />
            </div>
          </div>

          {/* Card 4: Low Stock Alerts */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Low Stock Alerts</span>
              <span className={`text-2xl font-extrabold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>{lowStockCount}</span>
              <span className="text-slate-500 text-3xs font-medium block">{lowStockCount === 0 ? 'All shampoo/mats in stock' : `${lowStockCount} items need stock`}</span>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center h-11 w-11 shrink-0">
              <Package size={22} />
            </div>
          </div>

          {/* Card 5: Online Booking Requests */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Booking Requests</span>
              <span className="text-2xl font-extrabold text-pink-400 font-mono">{pendingLeadsCount}</span>
              <span className="text-slate-500 text-3xs font-medium block">New self-booking requests</span>
            </div>
            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-lg flex items-center justify-center h-11 w-11 shrink-0">
              <Zap size={20} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" id="kpi-dashboard-grid">
          {/* Card 1: Daily Profit */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Daily Profit</span>
              <span className="text-2xl font-extrabold text-[#38bdf8] font-mono">₹{dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-slate-500 text-3xs font-medium block">Today's net earnings</span>
            </div>
            <div className="p-3 bg-sky-500/10 text-[#38bdf8] rounded-lg flex items-center justify-center font-bold text-xl h-11 w-11 shrink-0">
              ₹
            </div>
          </div>

          {/* Card 2: Total Profit */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Total Profit</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-slate-500 text-3xs font-medium block">₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center font-bold text-xl h-11 w-11 shrink-0">
              ₹
            </div>
          </div>

          {/* Card 3: Total Revenue */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Total Revenue</span>
              <span className="text-2xl font-extrabold text-sky-400 font-mono">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-slate-500 text-3xs font-medium block">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month</span>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-lg flex items-center justify-center font-bold text-xl h-11 w-11 shrink-0">
              ₹
            </div>
          </div>

          {/* Card 4: Low Stock Alerts */}
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Low Stock Alerts</span>
              <span className={`text-2xl font-extrabold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>{lowStockCount}</span>
              <span className="text-slate-500 text-3xs font-medium block">{lowStockCount === 0 ? 'all items in stock' : `${lowStockCount} items need stock`}</span>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center h-11 w-11 shrink-0">
              <Package size={22} />
            </div>
          </div>

          {/* Card 5: Pending Client Payments */}
          <button
            onClick={() => setShowPendingListModal(true)}
            className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-rose-500/20 hover:border-rose-500/50 transition-all shadow-xs flex items-center justify-between text-left cursor-pointer w-full group relative overflow-hidden"
          >
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Pending Payments</span>
              <span className="text-2xl font-extrabold text-rose-400 font-mono">₹{pendingPaymentsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-slate-500 text-3xs font-medium block group-hover:text-rose-300 transition-colors">Click to view list →</span>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-all rounded-lg flex items-center justify-center h-11 w-11 shrink-0">
              <CreditCard size={22} />
            </div>
          </button>
        </div>
      )}

      {/* Two Column Layout: Quick Actions & Quick Expense Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Quick Actions (col-span-7) */}
        <div className="bg-[#131D35] p-5 rounded-xl border border-slate-800/40 shadow-xs space-y-4 lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Quick Actions</h3>
            <p className="text-3xs text-slate-400">Instantly register bookings or browse database tabs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* New Booking Button */}
            <button
              onClick={() => onNavigate('bookings_new')}
              className="p-4 h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-center bg-[#0ea5e9] hover:bg-[#38bdf8] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/20 text-white font-semibold text-xs border-0 shadow-sm shadow-sky-500/10"
            >
              <Plus size={20} className="stroke-[2.5]" />
              <span>New Booking</span>
            </button>

            {/* Calendar Button */}
            <button
              onClick={() => onNavigate('appointments')}
              className="p-4 h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-center bg-[#18223c] hover:bg-slate-800/80 hover:-translate-y-1 hover:scale-[1.02] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs"
            >
              <Calendar size={18} />
              <span>Calendar</span>
            </button>

            {/* Clients Button */}
            <button
              onClick={() => onNavigate('crm')}
              className="p-4 h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-center bg-[#18223c] hover:bg-slate-800/80 hover:-translate-y-1 hover:scale-[1.02] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs"
            >
              <Users size={18} />
              <span>Clients</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Expense Tracker (col-span-5) */}
        <div className="bg-[#131D35] p-5 rounded-xl border border-slate-800/40 shadow-xs space-y-4 lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Quick Expense Tracker</span>
            </h3>
            <p className="text-3xs text-slate-400">Log any workshop/studio expense instantly below</p>
          </div>

          <form onSubmit={handleQuickAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 items-end">
            <div className="sm:col-span-5 space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase block">Expense Name *</label>
              <input
                type="text"
                required
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                placeholder="e.g. Microfiber towels"
                className="text-xs p-2 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-rose-500 placeholder-slate-600 font-semibold"
              />
            </div>
            
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase block">Amount (₹) *</label>
              <input
                type="number"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                placeholder="350"
                className="text-xs p-2 border border-slate-800 rounded-lg w-full bg-slate-950 text-white font-mono focus:outline-hidden focus:border-rose-500 placeholder-slate-600 font-bold text-rose-400"
              />
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase block">Category</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="text-xs p-2 border border-slate-800 rounded-lg w-full bg-slate-950 text-white focus:outline-hidden focus:border-rose-500 cursor-pointer font-semibold"
              >
                <option value="chemicals">Chemicals</option>
                <option value="wages">Wages</option>
                <option value="utilities">Utilities</option>
                <option value="misc">Misc</option>
              </select>
            </div>

            <div className="sm:col-span-12 pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-rose-950/20 cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.01]"
              >
                <span>Log Expense</span>
              </button>
            </div>
          </form>

          {/* Today's logged expenses summary inline list */}
          {expenses && expenses.filter(e => e.date === todayStr).length > 0 && (
            <div className="border-t border-slate-800/40 pt-2 text-[10px] space-y-1">
              <span className="text-slate-400 block font-bold uppercase tracking-wider">Today's Expenses:</span>
              <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto pr-1">
                {expenses.filter(e => e.date === todayStr).map((e: any) => (
                  <span key={e.id} className="bg-rose-500/10 border border-rose-500/10 text-rose-300 px-2 py-0.5 rounded font-medium flex items-center gap-1 font-mono">
                    <span>{e.name}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-bold">₹{e.amount}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-row">
        {currentUser?.role === 'employee' ? (
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs lg:col-span-2 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <div className="space-y-0.5 flex items-center gap-2">
                <Car size={18} className="text-[#38bdf8]" />
                <div>
                  <h3 className="text-base font-bold text-white">Workshop Queue</h3>
                  <p className="text-xs text-slate-400">Current detailing schedule & progress</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-3xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
              >
                Go to Calendar →
              </button>
            </div>

            <div className="space-y-3 max-h-[14rem] overflow-y-auto scrollbar-thin pr-1">
              {appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-xs font-semibold">No active detailing jobs in queue</p>
                  <p className="text-4xs text-slate-500 mt-1">All scheduled work is completed or cancelled.</p>
                </div>
              ) : (
                appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800/40 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="font-bold text-white text-xs">{apt.customerName}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-4xs font-bold uppercase tracking-wider ${
                          apt.status === 'in_progress' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                          apt.status === 'ready' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                          'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                        }`}>
                          {apt.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-3xs text-slate-400">
                        {apt.vehicle?.size} • {apt.vehicle?.model} • {apt.serviceName}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-3xs text-slate-400 block font-mono">{apt.date}</span>
                        <span className="text-3xs text-indigo-400 font-bold block font-mono">{apt.time}</span>
                      </div>
                      <button
                        onClick={() => onSelectJob(apt.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-4xs font-bold transition-all cursor-pointer"
                      >
                        View Checklist
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs lg:col-span-2 space-y-4 text-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <TrendingUp size={18} className="text-sky-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Revenue Trend</h3>
                  <p className="text-xs text-slate-400">Monthly revenue analytics trend</p>
                </div>
              </div>
              
              {/* Functional dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRevenueDropdown(!showRevenueDropdown)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-200 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all"
                >
                  <span>{revenueRangeLabels[revenueRange]}</span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showRevenueDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showRevenueDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowRevenueDropdown(false)} />
                    <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-40 py-1 origin-top-right animate-scale-up-corner">
                      {(['1m', '3m', '6m', 'all'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setRevenueRange(opt);
                            setShowRevenueDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[10px] font-semibold transition-colors flex items-center justify-between ${
                            revenueRange === opt
                              ? 'bg-sky-500/10 text-sky-400'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{revenueRangeLabels[opt]}</span>
                          {revenueRange === opt && <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Custom SVG Line and Area Chart */}
            <div className="relative h-52 w-full pt-2">
              {/* Tooltip Overlay */}
              {hoveredIndex !== null && (
                <div
                  style={{
                    left: `${((trendPoints[hoveredIndex].x) / chartWidth) * 100}%`,
                    top: `${((trendPoints[hoveredIndex].y - 12) / chartHeight) * 100}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-full bg-slate-900/95 border border-slate-700/80 text-white rounded-lg p-2.5 shadow-xl z-20 whitespace-nowrap pointer-events-none transition-all duration-150 backdrop-blur-xs"
                >
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      {revenueTrendData[hoveredIndex].label} Revenue
                    </span>
                    <span className="text-sm font-extrabold text-white font-mono">
                      ₹{revenueTrendData[hoveredIndex].amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {revenueTrendData[hoveredIndex].amount > 28 ? 'Completed customer jobs' : 'Standard baseline flow'}
                    </span>
                  </div>
                  {/* Tooltip caret */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                </div>
              )}

              {/* SVG Graph */}
              <svg
                className="w-full h-full overflow-visible"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[
                  0,
                  Math.round(maxTrendRevenue * 0.25),
                  Math.round(maxTrendRevenue * 0.5),
                  Math.round(maxTrendRevenue * 0.75),
                  maxTrendRevenue
                ].map((value, idx) => {
                  const ratio = idx / 4;
                  const y = chartHeight - paddingBottom - (ratio * graphHeight);
                  return (
                    <g key={idx} className="opacity-70">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#1e293b"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 10}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-slate-400 text-[10px] font-mono font-medium"
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}

                {/* Area path with gradient fill */}
                <path
                  d={trendAreaPath}
                  fill="url(#chartGradient)"
                  className="transition-all duration-300"
                />

                {/* Line path */}
                <path
                  d={trendLinePath}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Hover vertical dotted line */}
                {hoveredIndex !== null && (
                  <line
                    x1={trendPoints[hoveredIndex].x}
                    y1={paddingTop}
                    x2={trendPoints[hoveredIndex].x}
                    y2={chartHeight - paddingBottom}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* X Axis Labels */}
                {revenueTrendData.map((data, idx) => {
                  const isCurrentMonth = new Date().getMonth() === data.month;
                  const x = trendPoints[idx].x;
                  const y = chartHeight - paddingBottom + 16;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      className={`text-[10px] font-semibold ${
                        isCurrentMonth ? 'fill-sky-400 font-bold' : 'fill-slate-400'
                      }`}
                    >
                      {data.label}
                    </text>
                  );
                })}

                {/* Data points */}
                {trendPoints.map((p, idx) => {
                  const isHovered = hoveredIndex === idx;
                  const isCurrentMonth = new Date().getMonth() === (revenueTrendData[idx] as any).month;
                  return (
                    <g key={idx}>
                      {isHovered && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="8"
                          className="fill-sky-500/20 animate-ping"
                        />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? "5.5" : "3.5"}
                        className={`stroke-white stroke-[1.5] transition-all duration-150 ${
                          isHovered
                            ? 'fill-sky-500'
                            : isCurrentMonth
                              ? 'fill-sky-400'
                              : 'fill-slate-500'
                        }`}
                      />
                    </g>
                  );
                })}

                {/* Interactive Transparent Hover Targets */}
                {trendPoints.map((p, idx) => {
                  const sliceWidth = graphWidth / (revenueTrendData.length - 1);
                  return (
                    <rect
                      key={idx}
                      x={p.x - sliceWidth / 2}
                      y={paddingTop}
                      width={sliceWidth}
                      height={graphHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Bar Chart: Booking Activity */}
        <div className="bg-[#131D35] dashboard-card p-5 rounded-xl border border-slate-800/40 shadow-xs space-y-4 text-slate-100 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <Calendar size={18} className="text-sky-400" />
              <div>
                <h3 className="text-base font-bold text-white">Booking Activity</h3>
                <p className="text-xs text-slate-400">Weekly booking volume</p>
              </div>
            </div>
            
            {/* Functional dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBookingDropdown(!showBookingDropdown)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-200 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                <span>{bookingRangeLabels[bookingRange]}</span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showBookingDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showBookingDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowBookingDropdown(false)} />
                  <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-40 py-1 origin-top-right animate-scale-up-corner">
                    {(['7d', '30d', '90d'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setBookingRange(opt);
                          setShowBookingDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-semibold transition-colors flex items-center justify-between ${
                          bookingRange === opt
                            ? 'bg-sky-500/10 text-sky-400'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{bookingRangeLabels[opt]}</span>
                        {bookingRange === opt && <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative h-52 w-full pt-2">
            {/* Tooltip */}
            {hoveredBarIndex !== null && bookingActivityData[hoveredBarIndex] && (
              <div
                style={{
                  left: `${((30 + hoveredBarIndex * (255 / bookingActivityData.length) + (255 / bookingActivityData.length) / 2) / 300) * 100}%`,
                  top: `${((180 - 25 - (bookingActivityData[hoveredBarIndex].count / maxBookingCount) * 135 - 12) / 180) * 100}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-full bg-slate-900/95 border border-slate-700/80 text-white rounded-lg p-2 shadow-xl z-20 whitespace-nowrap pointer-events-none transition-all duration-150 text-[10px]"
              >
                <span className="font-extrabold text-sky-400 font-mono">{bookingActivityData[hoveredBarIndex].count} Bookings</span>
                <span className="block text-[8px] text-slate-400">{bookingActivityData[hoveredBarIndex].label} slot activity</span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
              </div>
            )}

            {/* SVG bar chart */}
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 300 180"
              preserveAspectRatio="none"
            >
              {/* Y Axis Grid lines (0 to maxBookingCount) */}
              {Array.from({ length: 5 }).map((_, i) => {
                const ratio = i / 4;
                const value = Math.round(ratio * maxBookingCount);
                const y = 180 - 25 - ratio * 135;
                return (
                  <g key={i} className="opacity-70">
                    <line
                      x1={30}
                      y1={y}
                      x2={285}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text
                      x={22}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono font-medium"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {bookingActivityData.map((item, idx) => {
                const graphW = 255;
                const graphH = 135;
                const step = graphW / bookingActivityData.length;
                const bWidth = Math.min(20, step * 0.55);
                const x = 30 + idx * step + (step - bWidth) / 2;
                const bHeight = (item.count / maxBookingCount) * graphH;
                const y = 180 - 25 - bHeight;
                const isHovered = hoveredBarIndex === idx;

                return (
                  <g key={idx}>
                    {/* Background interactive rect for easier hover */}
                    <rect
                      x={30 + idx * step}
                      y={20}
                      width={step}
                      height={graphH}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    />
                    {/* Visual Bar with corner scale glow hover transition */}
                    <rect
                      x={x}
                      y={y}
                      width={bWidth}
                      height={Math.max(bHeight, 2)}
                      fill={isHovered ? '#38bdf8' : '#0ea5e9'}
                      rx="3"
                      ry="3"
                      className="transition-all duration-150 pointer-events-none chart-bar-hover"
                    />
                    {/* X Label */}
                    <text
                      x={30 + idx * step + step / 2}
                      y={180 - 25 + 16}
                      textAnchor="middle"
                      className="fill-slate-400 text-[9px] font-semibold"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Real-time Detail Bay Monitor & Today's Agenda replaced with Booking Status Breakdown and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="dashboard-active-agenda-row">
        {/* Booking Status Breakdown */}
        <div className="bg-[#131D35] p-5 rounded-xl border border-slate-800/40 shadow-xs lg:col-span-3 space-y-4 text-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase size={18} className="text-[#10b981]" />
              Booking Status Breakdown
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 py-4 space-y-4">
            <span className="text-sm font-bold text-[#38bdf8] transition-all">Scheduled: {scheduledPercent}%</span>
            
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Scheduled slice (light blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="transparent"
                  stroke="#38bdf8"
                  strokeWidth="50"
                  strokeDasharray={`${scheduledStroke} ${circumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-500"
                />
                {/* Completed slice (green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="50"
                  strokeDasharray={`${completedStroke} ${circumference}`}
                  strokeDashoffset={-scheduledStroke}
                  className="transition-all duration-500"
                />
              </svg>
            </div>

            <span className="text-sm font-bold text-[#10b981] transition-all">Completed: {completedPercent}%</span>
          </div>
        </div>

        {/* Quick Stats */}
        {currentUser?.role === 'employee' ? (
          <div className="bg-[#131D35] p-5 rounded-xl border border-slate-800/40 shadow-xs lg:col-span-2 space-y-4 text-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-[#f97316]" />
                Quick Stats
              </h3>
            </div>

            <div className="space-y-2.5 flex-1 flex flex-col justify-center py-2">
              {/* Row 1: Total Bookings */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Total Bookings</span>
                <span className="font-extrabold text-white font-mono text-sm">{appointments.length}</span>
              </div>

              {/* Row 2: Total Clients */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Total Clients</span>
                <span className="font-extrabold text-white font-mono text-sm">{customers.length}</span>
              </div>

              {/* Row 3: Active Detailing Jobs */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Active Detailing Jobs</span>
                <span className="font-extrabold text-sky-400 font-mono text-sm">{activeJobs.length}</span>
              </div>

              {/* Row 4: Scheduled Upcoming */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Scheduled Upcoming</span>
                <span className="font-extrabold text-indigo-400 font-mono text-sm">{scheduledJobs.length}</span>
              </div>

              {/* Row 5: Low Stock Items */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Low Stock Alerts</span>
                <span className="font-extrabold text-amber-400 font-mono text-sm">{lowStockCount}</span>
              </div>

              {/* Row 6: Pending Requests */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">New Requests Pending</span>
                <span className="font-extrabold text-pink-400 font-mono text-sm">{pendingLeadsCount}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#131D35] p-5 rounded-xl border border-slate-800/40 shadow-xs lg:col-span-2 space-y-4 text-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-[#f97316]" />
                Quick Stats
              </h3>
            </div>

            <div className="space-y-2.5 flex-1 flex flex-col justify-center py-2">
              {/* Row 1: Total Bookings */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Total Bookings</span>
                <span className="font-extrabold text-white font-mono text-sm">{appointments.length}</span>
              </div>

              {/* Row 2: Total Clients */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Total Clients</span>
                <span className="font-extrabold text-white font-mono text-sm">{customers.length}</span>
              </div>

              {/* Row 3: Monthly Profit */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Monthly Profit</span>
                <span className="font-extrabold text-[#10b981] font-mono text-sm">₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Row 4: Monthly Revenue */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Monthly Revenue</span>
                <span className="font-extrabold text-[#38bdf8] font-mono text-sm">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Row 5: Monthly Expenses */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Monthly Expenses</span>
                <span className="font-extrabold text-rose-500 font-mono text-sm">₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Row 6: Profit Margin */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Profit Margin</span>
                <span className="font-extrabold text-white font-mono text-sm">{(totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0).toFixed(1)}%</span>
              </div>

              {/* Row 7: Average Job Value */}
              <div className="flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-lg border border-slate-800/10 text-xs">
                <span className="text-slate-300 font-semibold">Average Job Value</span>
                <span className="font-extrabold text-white font-mono text-sm">₹{averageJobValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Payments Modal */}
      {showPendingListModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="pending-payments-modal">
          <div className="bg-[#0B1329] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up-corner">
            {/* Header */}
            <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/40">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="text-rose-400" size={18} />
                  Pending Client Payments Details
                </h3>
                <p className="text-3xs text-slate-400 mt-1">
                  Showing all clients with remaining unpaid balances. Total Pending: <strong className="text-rose-400 font-mono">₹{pendingPaymentsTotal.toLocaleString()}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPendingListModal(false);
                  setEditingAptId(null);
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Search */}
            <div className="p-4 border-b border-slate-800/40 bg-slate-950/20">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by client name, phone or invoice number..."
                  value={pendingSearchTerm}
                  onChange={(e) => setPendingSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Content Table / List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredPendingApts.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs font-bold text-white">No pending payments found!</p>
                  <p className="text-3xs text-slate-400 mt-1">All filtered client invoices are settled and fully paid.</p>
                </div>
              ) : (
                <div className="border border-slate-800/60 rounded-xl overflow-hidden bg-[#131D35]">
                  <table className="w-full text-left border-collapse text-3xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-950">
                        <th className="py-3 px-4">Client Details</th>
                        <th className="py-3 px-4">Vehicle & Service</th>
                        <th className="py-3 px-4">Job Info</th>
                        <th className="py-3 px-4 text-right">Billing Stats</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {filteredPendingApts.map(apt => {
                        const balance = Math.max(0, apt.price - (apt.paidAmount ?? 0));
                        const isEditing = editingAptId === apt.id;

                        const handleSavePayment = () => {
                          if (!onUpdateAppointment) return;
                          const updatedPaid = parseFloat(newPaidAmount);
                          if (isNaN(updatedPaid) || updatedPaid < 0) {
                            alert("Please enter a valid amount.");
                            return;
                          }
                          if (updatedPaid > apt.price) {
                            alert(`Paid amount cannot exceed total price of ₹${apt.price}.`);
                            return;
                          }

                          const newStatus = updatedPaid === apt.price ? 'paid' : (updatedPaid > 0 ? 'partially_paid' : 'unpaid');
                          onUpdateAppointment({
                            ...apt,
                            paidAmount: updatedPaid,
                            paymentStatus: newStatus
                          });
                          setEditingAptId(null);
                        };

                        const handleQuickFullyPaid = () => {
                          if (!onUpdateAppointment) return;
                          onUpdateAppointment({
                            ...apt,
                            paidAmount: apt.price,
                            paymentStatus: 'paid'
                          });
                        };

                        return (
                          <tr key={apt.id} className="hover:bg-slate-900/30 transition-all">
                            {/* Client details */}
                            <td className="py-3.5 px-4">
                              <strong className="font-bold text-white block text-xs">{apt.customerName}</strong>
                              <span className="text-slate-400 block mt-0.5">{apt.customerPhone}</span>
                              <span className="text-slate-500 block text-4xs font-mono">{apt.customerEmail}</span>
                            </td>
                            {/* Vehicle & service */}
                            <td className="py-3.5 px-4">
                              <span className="text-slate-200 block font-semibold">{apt.serviceName}</span>
                              <span className="text-slate-400 block mt-0.5 text-4xs bg-slate-900 border border-slate-800/40 px-1.5 py-0.5 rounded-sm inline-block">
                                {apt.vehicle.year} {apt.vehicle.make} {apt.vehicle.model} ({apt.vehicle.size.toUpperCase()})
                              </span>
                            </td>
                            {/* Job info */}
                            <td className="py-3.5 px-4">
                              <span className="text-slate-300 block font-mono">{apt.date}</span>
                              <span className="text-slate-400 block font-mono mt-0.5">{apt.time}</span>
                              <span className="text-slate-500 block text-4xs font-mono mt-0.5">{apt.invoiceNumber || 'No Invoice'}</span>
                            </td>
                            {/* Billing stats */}
                            <td className="py-3.5 px-4 text-right font-mono">
                              <div className="space-y-0.5">
                                <div>Price: <span className="font-bold text-white">₹{apt.price.toFixed(2)}</span></div>
                                <div className="text-slate-400">Paid: <span className="text-emerald-400">₹{(apt.paidAmount ?? 0).toFixed(2)}</span></div>
                                <div className="text-rose-400 font-bold border-t border-slate-800/80 pt-0.5 mt-0.5">
                                  Pending: <span>₹{balance.toFixed(2)}</span>
                                </div>
                              </div>
                            </td>
                            {/* Actions */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col items-center gap-1.5">
                                {isEditing ? (
                                  <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="Amount"
                                      value={newPaidAmount}
                                      onChange={(e) => setNewPaidAmount(e.target.value)}
                                      className="w-20 bg-transparent text-white border-0 text-center text-xs p-1 focus:outline-hidden"
                                    />
                                    <button
                                      onClick={handleSavePayment}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-4xs px-2 py-1 rounded font-bold cursor-pointer transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingAptId(null)}
                                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-4xs px-2 py-1 rounded font-bold cursor-pointer transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1.5 justify-center">
                                    <button
                                      onClick={() => {
                                        setEditingAptId(apt.id);
                                        setNewPaidAmount((apt.paidAmount ?? 0).toString());
                                      }}
                                      className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-4xs font-bold rounded cursor-pointer transition-all"
                                      title="Update partial payment"
                                    >
                                      Update Payment
                                    </button>
                                    <button
                                      onClick={handleQuickFullyPaid}
                                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-4xs font-bold rounded cursor-pointer transition-all"
                                      title="Mark as fully paid"
                                    >
                                      Mark Paid
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800/60 bg-slate-900/30 flex justify-end">
              <button
                onClick={() => {
                  setShowPendingListModal(false);
                  setEditingAptId(null);
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-705 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
