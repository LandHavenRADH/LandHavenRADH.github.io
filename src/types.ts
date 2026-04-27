export interface Deal {
  id: string;
  name: string;
  address: string;
  value?: number;
  stage: string;
  salePrice?: number;
  commencementDate?: string;
  saleDate?: string;
  franchiseId?: string;
  ddStatus?: string;
  devStatus?: string;
  checklist?: ChecklistItem[];
  devChecklist?: ChecklistItem[];
  documentUrls?: DocumentUrl[];
  calcParams?: any;
  previousStage?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
  contactName?: string;
  cost?: number;
  documentUrls?: DocumentUrl[];
  documentUrl?: string; // legacy
}

export interface DocumentUrl {
  name: string;
  url: string;
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
  documentUrls?: DocumentUrl[];
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
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  category: string;
  dealIds?: string[];
  dealId?: string; // legacy
}

export interface LibraryItem {
  id: string;
  title: string;
  category: string;
  tags?: string[];
  url: string;
  description?: string;
}

export interface ConstructionCost {
  id: string;
  franchiseId: string;
  address?: string;
  buildingSizeSqFt: number;
  siteWork: number;
  buildingShell: number;
  interiorBuildout: number;
  softCosts: number;
  ffAndE: number;
  contingency: number;
  totalCost: number;
  dateAdded: string;
  userId?: string;
  documents?: { title: string; url: string }[];
}
