import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  Calculator as CalcIcon,
  ExternalLink,
  Store,
  Folder,
  User,
  UserPlus,
  Check,
  ArrowRight
} from 'lucide-react';
import { 
  Deal, 
  Task, 
  Contact, 
  Franchise, 
  LibraryItem, 
  DealStage,
  ChecklistItem
} from '../types';
import { 
  STAGES, 
  CONTACT_CATEGORIES, 
  FRANCHISE_CATEGORIES, 
  LIBRARY_CATEGORIES 
} from '../constants';
import { Modal } from './Modal';
import { formatCurrency, cn } from '../utils';

// --- Deal Modal ---
interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Deal>) => void;
  deal?: Deal | null;
  franchises: Franchise[];
}

export const DealModal: React.FC<DealModalProps> = ({ isOpen, onClose, onSave, deal, franchises }) => {
  const [formData, setFormData] = useState<Partial<Deal>>({
    name: '',
    address: '',
    value: '',
    stage: 'prospect',
    franchiseId: null,
    salePrice: '',
    commencementDate: '',
    saleDate: ''
  });

  useEffect(() => {
    if (deal) {
      setFormData({
        name: deal.name,
        address: deal.address,
        value: deal.value,
        stage: deal.stage,
        franchiseId: deal.franchiseId,
        salePrice: deal.salePrice || '',
        commencementDate: deal.commencementDate || '',
        saleDate: deal.saleDate || ''
      });
    } else {
      setFormData({
        name: '',
        address: '',
        value: '',
        stage: 'prospect',
        franchiseId: null,
        salePrice: '',
        commencementDate: '',
        saleDate: ''
      });
    }
  }, [deal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={deal ? "Edit Deal" : "Add New Deal"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Link Franchise Profile (Optional)</label>
          <select 
            value={formData.franchiseId || ''}
            onChange={(e) => setFormData({ ...formData, franchiseId: e.target.value || null })}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">-- None (Generic Deal) --</option>
            {franchises.map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.category})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deal Name / Tenant</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="e.g. Starbucks - Greenwood" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
          <input 
            type="text" 
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="123 Main St" 
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Est. Value / Purchase ($)</label>
            <input 
              type="text" 
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="1,200,000" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
            <select 
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price ($) <span className="text-xs text-slate-400 font-normal">(If Sold)</span></label>
            <input 
              type="text" 
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="0" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4 border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lease Start (Optional)</label>
            <input 
              type="date" 
              value={formData.commencementDate}
              onChange={(e) => setFormData({ ...formData, commencementDate: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sale Date (Optional)</label>
            <input 
              type="date" 
              value={formData.saleDate}
              onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 text-sm" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 mt-4 transition-colors"
        >
          {deal ? "Update Deal" : "Create Deal"}
        </button>
      </form>
    </Modal>
  );
};

// --- Task Modal ---
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
  task?: Task | null;
  deals: Deal[];
  initialDealId?: string | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, deals, initialDealId }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    date: '',
    time: '',
    location: '',
    dealId: '',
    notes: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        date: task.date,
        time: task.time || '',
        location: task.location || '',
        dealId: task.dealId || '',
        notes: task.notes || ''
      });
    } else {
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        dealId: initialDealId || '',
        notes: ''
      });
    }
  }, [task, isOpen, initialDealId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={task ? "Edit Task" : "New Task"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Task / Action</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="e.g. Sign Purchase Agreement" 
            required 
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              required 
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
            <input 
              type="time" 
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="e.g. 123 Main St, City, ST or Zoom Link" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Related Deal</label>
          <select 
            value={formData.dealId || ''}
            onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value="">-- General Task --</option>
            {deals.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea 
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3} 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 mt-4 transition-colors"
        >
          {task ? "Update Task" : "Save Task"}
        </button>
      </form>
    </Modal>
  );
};

// --- Contact Modal ---
interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Contact>) => void;
  contact?: Contact | null;
  deals: Deal[];
  initialDealId?: string | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  contact, 
  deals, 
  initialDealId 
}) => {
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    role: '',
    company: '',
    email: '',
    phone: '',
    category: 'Other',
    dealIds: []
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        role: contact.role || '',
        company: contact.company || '',
        email: contact.email || '',
        phone: contact.phone || '',
        category: contact.category,
        dealIds: contact.dealIds || []
      });
    } else {
      setFormData({
        name: '',
        role: '',
        company: '',
        email: '',
        phone: '',
        category: 'Other',
        dealIds: initialDealId ? [initialDealId] : []
      });
    }
  }, [contact, isOpen, initialDealId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleDeal = (dealId: string) => {
    const currentIds = formData.dealIds || [];
    if (currentIds.includes(dealId)) {
      setFormData({ ...formData, dealIds: currentIds.filter(id => id !== dealId) });
    } else {
      setFormData({ ...formData, dealIds: [...currentIds, dealId] });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={contact ? "Edit Contact" : "Add Contact"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {CONTACT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role/Title</label>
            <input 
              type="text" 
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="e.g. Zoning Attorney" 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
          <input 
            type="text" 
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="e.g. Acme Corp" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Associated Deals</label>
          <div className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white h-32 overflow-y-auto space-y-1 no-scrollbar">
            {deals.map(d => (
              <div key={d.id} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id={`contact-deal-${d.id}`} 
                  checked={formData.dealIds?.includes(d.id)}
                  onChange={() => toggleDeal(d.id)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                />
                <label htmlFor={`contact-deal-${d.id}`} className="text-sm text-slate-700">{d.name}</label>
              </div>
            ))}
          </div>
        </div>
        <button 
          type="submit" 
          className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 mt-4 transition-colors"
        >
          {contact ? "Update Contact" : "Save Contact"}
        </button>
      </form>
    </Modal>
  );
};

// --- Franchise Modal ---
interface FranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Franchise>) => void;
  franchise?: Franchise | null;
}

export const FranchiseModal: React.FC<FranchiseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  franchise 
}) => {
  const [formData, setFormData] = useState<Partial<Franchise>>({
    name: '',
    category: 'QSR',
    minSqFt: '',
    maxSqFt: '',
    lotSize: '',
    traffic: '',
    income: '',
    population: '',
    markets: '',
    notes: '',
    logoUrl: ''
  });

  useEffect(() => {
    if (franchise) {
      setFormData({
        name: franchise.name,
        category: franchise.category,
        minSqFt: franchise.minSqFt || '',
        maxSqFt: franchise.maxSqFt || '',
        lotSize: franchise.lotSize || '',
        traffic: franchise.traffic || '',
        income: franchise.income || '',
        population: franchise.population || '',
        markets: franchise.markets || '',
        notes: franchise.notes || '',
        logoUrl: franchise.logoUrl || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'QSR',
        minSqFt: '',
        maxSqFt: '',
        lotSize: '',
        traffic: '',
        income: '',
        population: '',
        markets: '',
        notes: '',
        logoUrl: ''
      });
    }
  }, [franchise, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={franchise ? "Edit Franchise" : "Add Franchise"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Franchise Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="e.g. McDonald's" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {FRANCHISE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL (Optional)</label>
          <input 
            type="url" 
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
            placeholder="https://example.com/logo.png" 
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Site Requirements</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Min Sq Ft</label>
              <input 
                type="text" 
                value={formData.minSqFt}
                onChange={(e) => setFormData({ ...formData, minSqFt: e.target.value })}
                className="w-full p-2 border rounded-md text-sm outline-none" 
                placeholder="2,000" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max Sq Ft</label>
              <input 
                type="text" 
                value={formData.maxSqFt}
                onChange={(e) => setFormData({ ...formData, maxSqFt: e.target.value })}
                className="w-full p-2 border rounded-md text-sm outline-none" 
                placeholder="2,500" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Min Lot Size (Acres)</label>
              <input 
                type="text" 
                value={formData.lotSize}
                onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                className="w-full p-2 border rounded-md text-sm outline-none" 
                placeholder="0.75" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Traffic Count (VPD)</label>
              <input 
                type="text" 
                value={formData.traffic}
                onChange={(e) => setFormData({ ...formData, traffic: e.target.value })}
                className="w-full p-2 border rounded-md text-sm outline-none" 
                placeholder="25,000+" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Population (Trade Area)</label>
              <input 
                type="text" 
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                className="w-full p-2 border rounded-md text-sm outline-none" 
                placeholder="50,000+ (3mi)" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Household Income Req ($)</label>
              <input 
                type="text" 
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                className="w-full p-2 border rounded-md text-sm outline-none" 
                placeholder="60,000+" 
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Markets</label>
          <input 
            type="text" 
            value={formData.markets}
            onChange={(e) => setFormData({ ...formData, markets: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="e.g. Phoenix, Denver, Austin" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">General Notes / Specifics</label>
          <textarea 
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3} 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="Needs drive-thru, AM side of road, etc."
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-700 mt-2 transition-colors"
        >
          {franchise ? "Update Franchise" : "Save Franchise Profile"}
        </button>
      </form>
    </Modal>
  );
};

// --- Library Modal ---
interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<LibraryItem>) => void;
  item?: LibraryItem | null;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  item 
}) => {
  const [formData, setFormData] = useState<Partial<LibraryItem>>({
    title: '',
    category: LIBRARY_CATEGORIES[0],
    tags: [],
    url: '',
    description: ''
  });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        category: item.category,
        tags: item.tags,
        url: item.url,
        description: item.description || ''
      });
      setTagsInput(item.tags.join(', '));
    } else {
      setFormData({
        title: '',
        category: LIBRARY_CATEGORIES[0],
        tags: [],
        url: '',
        description: ''
      });
      setTagsInput('');
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    onSave({ ...formData, tags });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={item ? "Edit Library Item" : "New Library Item"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="e.g., Operating Agreement" 
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {LIBRARY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
            <input 
              type="text" 
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="e.g., 2026, board, audit" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Google Drive URL</label>
          <input 
            type="url" 
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="https://drive.google.com/..." 
            required 
          />
          <p className="text-[10px] text-slate-400 mt-1">Paste a valid Google Drive share link (Viewer access recommended).</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3} 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="Brief summary of the document."
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 mt-2 transition-colors"
        >
          {item ? "Update Item" : "Save Item"}
        </button>
      </form>
    </Modal>
  );
};
