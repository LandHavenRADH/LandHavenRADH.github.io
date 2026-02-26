import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  X,
  UserPlus
} from 'lucide-react';
import { Contact, Deal } from '../types';
import { CONTACT_CATEGORIES } from '../constants';
import { cn } from '../utils';

interface ContactsProps {
  contacts: Contact[];
  deals: Deal[];
  onNewContact: () => void;
  onEditContact: (id: string) => void;
  onDeleteContact: (id: string) => void;
}

export const Contacts: React.FC<ContactsProps> = ({
  contacts,
  deals,
  onNewContact,
  onEditContact,
  onDeleteContact
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.role?.toLowerCase().includes(query) ||
      c.company?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    CONTACT_CATEGORIES.forEach(cat => groups[cat] = []);
    
    filteredContacts.forEach(c => {
      const cat = c.category || 'Other';
      if (groups[cat]) groups[cat].push(c);
      else {
        if (!groups['Other']) groups['Other'] = [];
        groups['Other'].push(c);
      }
    });
    
    return groups;
  }, [filteredContacts]);

  return (
    <div className="p-8 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Contacts Directory</h2>
          <p className="text-slate-500 text-sm">Franchisees, Attorneys, and Officials.</p>
        </div>
        
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
            />
          </div>
        </div>

        <button 
          onClick={onNewContact}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition"
        >
          <Plus size={18} /> Add Contact
        </button>
      </div>

      <div className="overflow-y-auto pb-4 space-y-6 no-scrollbar">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No contacts found.</div>
        ) : (
          (Object.entries(groupedContacts) as [string, Contact[]][]).map(([category, groupContacts]) => (
            groupContacts.length > 0 && (
              <div key={category}>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
                  {category} ({groupContacts.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupContacts.map(c => {
                    const initial = c.name.charAt(0).toUpperCase();
                    const linkedDealIds = c.dealIds || [];
                    let dealDisplay = 'General Contact';
                    if (linkedDealIds.length > 0) {
                      const firstDeal = deals.find(d => d.id === linkedDealIds[0]);
                      if (firstDeal) {
                        dealDisplay = linkedDealIds.length > 1 
                          ? `${firstDeal.name} + ${linkedDealIds.length - 1} more` 
                          : firstDeal.name;
                      }
                    }

                    return (
                      <div 
                        key={c.id}
                        onClick={() => onEditContact(c.id)}
                        className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition relative group cursor-pointer"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContact(c.id);
                          }}
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={16} />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                            {initial}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{c.name}</h4>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{c.role || 'No Role'}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" /> 
                            <span className="truncate hover:text-emerald-600">{c.email || 'No Email'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" /> 
                            <span>{c.phone || 'No Phone'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase size={14} className="text-slate-400" /> 
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{dealDisplay}</span>
                          </div>
                          {c.company && (
                            <div className="flex items-center gap-2">
                              <Building size={14} className="text-slate-400" /> 
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{c.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
};
