import { DealStage } from "./types";

export const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'prospect', label: 'Prospecting', color: 'border-blue-500' },
  { id: 'loi', label: 'LOI / Offer', color: 'border-yellow-500' },
  { id: 'dd', label: 'Due Diligence', color: 'border-orange-500' },
  { id: 'closing', label: 'Closing', color: 'border-purple-500' },
  { id: 'marketing', label: 'Marketing', color: 'border-pink-500' },
  { id: 'development', label: 'Development', color: 'border-teal-500' },
  { id: 'leased', label: 'Active Lease', color: 'border-emerald-500' },
  { id: 'sold', label: 'Properties Sold', color: 'border-slate-500' }
];

export const DD_STAGES = [
  { id: 'not_started', label: 'Not Started', color: 'border-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-500' }
];

export const DEV_STAGES = [
  { id: 'not_started', label: 'Not Started', color: 'border-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-amber-500' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-500' }
];

export const LIBRARY_CATEGORIES = [
  'Corporate Documents',
  'Accounts & Finance',
  'Legal',
  'Insurance',
  'Correspondence',
  'Website & Branding',
  'Policies & Templates',
  'Vendor Contracts',
  'Marketing',
  'Other'
];

export const CONTACT_CATEGORIES = [
  'Seller',
  'Franchisor',
  'Franchisee',
  'Lender',
  'Due Diligence',
  'Development',
  'Other'
];

export const FRANCHISE_CATEGORIES = [
  'QSR',
  'Coffee',
  'Fast Casual',
  'Bank',
  'Auto',
  'Retail'
];
