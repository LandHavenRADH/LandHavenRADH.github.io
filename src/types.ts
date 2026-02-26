export type DealStage = 'prospect' | 'loi' | 'dd' | 'closing' | 'marketing' | 'development' | 'leased' | 'sold' | 'cancelled';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
  cost?: number;
  documentUrls?: { name: string; url: string }[];
  contactName?: string;
}

export interface CalcParams {
  ltv?: number;
  rate?: number;
  term?: number;
  dscr?: number;
  cap?: number;
  marketLtv?: number;
  useContractRent?: boolean;
  contractRent?: number;
  interestOnly?: boolean;
  taxes?: number;
  insurance?: number;
}

export interface Deal {
  id: string;
  name: string;
  address: string;
  value: number | string;
  stage: DealStage;
  previousStage?: DealStage;
  salePrice?: number | string;
  saleDate?: string;
  commencementDate?: string;
  franchiseId?: string | null;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
  checklist?: ChecklistItem[];
  devChecklist?: ChecklistItem[];
  ddStatus?: 'not_started' | 'in_progress' | 'completed';
  devStatus?: 'not_started' | 'in_progress' | 'completed';
  calcParams?: CalcParams;
  documentUrls?: { name: string; url: string }[];
}

export interface Franchise {
  id: string;
  name: string;
  category: string;
  minSqFt?: string;
  maxSqFt?: string;
  lotSize?: string;
  traffic?: string;
  income?: string;
  population?: string;
  markets?: string;
  notes?: string;
  logoUrl?: string;
  userId: string;
  documentUrls?: { name: string; url: string }[];
}

export interface Task {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  dealId?: string;
  notes?: string;
  completed: boolean;
  userId: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  category: 'Seller' | 'Franchisor' | 'Franchisee' | 'Lender' | 'Due Diligence' | 'Development' | 'Other';
  dealIds?: string[];
  userId: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  url: string;
  description?: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}
