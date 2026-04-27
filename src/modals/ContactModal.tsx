import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Contact, Deal } from '../types';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function ContactModal({ closeModal, contactId, dealId, ddItemId, devItemId, deals, contacts }: { closeModal: () => void, contactId: string | null, dealId: string | null, ddItemId: string | null, devItemId: string | null, deals: Deal[], contacts: Contact[] }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contactId) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        setName(contact.name || '');
        setCategory(contact.category || 'Other');
        setRole(contact.role || '');
        setCompany(contact.company || '');
        setEmail(contact.email || '');
        setPhone(contact.phone || '');
        setSelectedDealIds(contact.dealIds || (contact.dealId ? [contact.dealId] : []));
      }
    } else {
      if (dealId) setSelectedDealIds([dealId]);
      if (ddItemId) {
        setCategory('Due Diligence');
        const deal = deals.find(d => d.id === dealId);
        const item = deal?.checklist?.find(i => i.id === ddItemId);
        if (item) setRole(item.text);
      }
      if (devItemId) {
        setCategory('Development');
        const deal = deals.find(d => d.id === dealId);
        const item = deal?.devChecklist?.find(i => i.id === devItemId);
        if (item) setRole(item.text);
      }
    }
  }, [contactId, dealId, ddItemId, devItemId, contacts, deals]);

  const handleDealToggle = (id: string) => {
    setSelectedDealIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const contactData = {
        name, role, company, email, phone, category, dealIds: selectedDealIds,
        userId: auth.currentUser?.uid
      };

      if (contactId) {
        await updateDoc(doc(db, 'gc_contacts', contactId), contactData);
      } else {
        await addDoc(collection(db, 'gc_contacts'), contactData);
      }

      if (ddItemId && dealId) {
        const dealToUpdate = deals.find(d => d.id === dealId);
        if (dealToUpdate) {
          const updatedChecklist = (dealToUpdate.checklist || []).map(item => 
            item.id === ddItemId ? { ...item, contactName: name } : item
          );
          await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updatedChecklist });
        }
      }

      if (devItemId && dealId) {
        const dealToUpdate = deals.find(d => d.id === dealId);
        if (dealToUpdate) {
          const updatedChecklist = (dealToUpdate.devChecklist || []).map(item => 
            item.id === devItemId ? { ...item, contactName: name } : item
          );
          await updateDoc(doc(db, 'gc_deals', dealId), { devChecklist: updatedChecklist });
        }
      }

      closeModal();
    } catch (error) {
      console.error("Contact save error:", error);
      alert("Error saving contact.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{contactId ? 'Edit Contact' : 'Add Contact'}</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="Seller">Seller</option>
                <option value="Broker">Broker</option>
                <option value="Franchisor">Franchisor</option>
                <option value="Franchisee">Franchisee</option>
                <option value="Lender">Lender</option>
                <option value="Due Diligence">Due Diligence</option>
                <option value="Development">Development</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role/Title</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Zoning Attorney" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Acme Corp" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Associated Deals</label>
            <div className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white h-32 overflow-y-auto space-y-1">
              {deals.map(d => (
                <div key={d.id} className="flex items-center gap-2">
                  <input type="checkbox" id={`contact-deal-${d.id}`} checked={selectedDealIds.includes(d.id)} onChange={() => handleDealToggle(d.id)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <label htmlFor={`contact-deal-${d.id}`} className="text-sm text-slate-700">{d.name}</label>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 mt-4 transition-colors">
            {isSaving ? 'Saving...' : (contactId ? 'Update Contact' : 'Save Contact')}
          </button>
        </form>
      </div>
    </div>
  );
}
