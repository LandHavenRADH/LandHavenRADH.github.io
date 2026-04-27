import React, { useState } from 'react';
import { Plus, Search, X, Mail, Phone, Briefcase, Building } from 'lucide-react';
import { Contact, Deal } from '../types';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ContactsView({ contacts, deals, openModal }: { contacts: Contact[], deals: Deal[], openModal: (name: string, params?: any) => void }) {
  const [search, setSearch] = useState('');

  const deleteContact = async (id: string) => {
    if(window.confirm('Delete contact?')) {
      await deleteDoc(doc(db, 'gc_contacts', id));
    }
  };

  const filteredContacts = contacts.filter(c => 
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.role && c.role.toLowerCase().includes(search.toLowerCase()))
  );

  const groups: { [key: string]: Contact[] } = { 'Brokers': [], 'Seller': [], 'Franchisor': [], 'Franchisee': [], 'Lender': [], 'Due Diligence': [], 'Development': [], 'Other': [] };
  
  filteredContacts.forEach(c => {
    const category = c.category || 'Other';
    if (groups[category]) groups[category].push(c); else groups['Other'].push(c);
  });

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full">
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
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
        </div>

        <button onClick={() => openModal('contact')} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition">
          <Plus size={18} /> Add Contact
        </button>
      </div>

      <div className="overflow-y-auto pb-4 space-y-6">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No contacts found.</div>
        ) : (
          Object.entries(groups).map(([category, groupContacts]) => {
            if (groupContacts.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">{category} ({groupContacts.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupContacts.map(c => {
                    const initial = (c.name && c.name.length > 0) ? c.name.charAt(0).toUpperCase() : '?';
                    let dealDisplay = 'General Contact';
                    const linkedDealIds = c.dealIds || (c.dealId ? [c.dealId] : []);
                    if (linkedDealIds.length > 0) {
                      const firstDeal = deals.find(d => d.id === linkedDealIds[0]);
                      if (firstDeal) dealDisplay = linkedDealIds.length > 1 ? `${firstDeal.name} + ${linkedDealIds.length - 1} more` : firstDeal.name;
                    }

                    return (
                      <div key={c.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition relative group cursor-pointer" onClick={() => openModal('contact', { id: c.id })}>
                        <button onClick={(e) => { e.stopPropagation(); deleteContact(c.id); }} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                          <X size={16} />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">{initial}</div>
                          <div>
                            <h4 className="font-bold text-slate-800">{c.name || 'No Name'}</h4>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{c.role || 'No Role'}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> <span className="truncate hover:text-emerald-600">{c.email || 'No Email'}</span></div>
                          <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> <span>{c.phone || 'No Phone'}</span></div>
                          <div className="flex items-center gap-2"><Briefcase size={14} className="text-slate-400" /> <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{dealDisplay}</span></div>
                          {c.company && <div className="flex items-center gap-2"><Building size={14} className="text-slate-400" /> <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{c.company}</span></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
