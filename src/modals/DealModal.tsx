import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Deal, Franchise } from '../types';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function DealModal({ closeModal, dealId, deals, franchises }: { closeModal: () => void, dealId: string | null, deals: Deal[], franchises: Franchise[] }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('prospect');
  const [salePrice, setSalePrice] = useState('');
  const [commencementDate, setCommencementDate] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [franchiseId, setFranchiseId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dealId) {
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        setName(deal.name || '');
        setAddress(deal.address || '');
        setValue(deal.value?.toString() || '');
        setStage(deal.stage || 'prospect');
        setSalePrice(deal.salePrice?.toString() || '');
        setCommencementDate(deal.commencementDate || '');
        setSaleDate(deal.saleDate || '');
        setFranchiseId(deal.franchiseId || '');
      }
    }
  }, [dealId, deals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dealData: any = {
        name,
        address,
        value: parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0,
        stage,
        salePrice: parseFloat(salePrice.replace(/[^0-9.-]+/g, '')) || 0,
        commencementDate,
        saleDate,
        franchiseId: franchiseId || null,
        userId: auth.currentUser?.uid,
        updatedAt: serverTimestamp()
      };

      if (dealId) {
        await updateDoc(doc(db, 'gc_deals', dealId), dealData);
      } else {
        dealData.createdAt = serverTimestamp();
        dealData.ddStatus = 'not_started';
        dealData.devStatus = 'not_started';
        dealData.checklist = [
            { id: 'dd-1', text: 'Survey (ALTA/NSPS)', completed: false },
            { id: 'dd-2', text: 'Environmental Phase I (ESA)', completed: false },
            { id: 'dd-3', text: 'Geotechnical/Soils Report', completed: false },
            { id: 'dd-4', text: 'Title Commitment & Exception Review', completed: false },
            { id: 'dd-5', text: 'Zoning Approval / Entitlements', completed: false },
            { id: 'dd-6', text: 'Utility Availability Verification', completed: false },
            { id: 'dd-7', text: 'Site Plan Approval', completed: false },
            { id: 'dd-8', text: 'Permitting', completed: false },
            { id: 'dd-9', text: 'Site Clearing / Demolition', completed: false }
        ];
        dealData.devChecklist = [
            { id: 'dev-1', text: 'Site Clearing & Grubbing', completed: false },
            { id: 'dev-2', text: 'Rough Grading', completed: false },
            { id: 'dev-3', text: 'Utility Main Extensions (Water/Sewer)', completed: false },
            { id: 'dev-4', text: 'Electric & Gas Routing', completed: false },
            { id: 'dev-5', text: 'Stormwater / Retention Installation', completed: false },
            { id: 'dev-6', text: 'Driveway & Curb Cut Installation', completed: false },
            { id: 'dev-7', text: 'Final Pad Grading', completed: false }
        ];
        await addDoc(collection(db, 'gc_deals'), dealData);
      }
      closeModal();
    } catch (error) {
      console.error("Deal save error:", error);
      alert("Error saving deal.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{dealId ? 'Edit Deal' : 'Add New Deal'}</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Link Franchise Profile (Optional)</label>
            <select value={franchiseId} onChange={e => setFranchiseId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="">-- None (Generic Deal) --</option>
              {franchises.map(f => <option key={f.id} value={f.id}>{f.name} ({f.category})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deal Name / Tenant</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Starbucks - Greenwood" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="123 Main St" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Est. Value / Purchase ($)</label>
              <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="1,200,000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="prospect">Prospecting</option>
                <option value="loi">LOI / Offer</option>
                <option value="dd">Due Diligence</option>
                <option value="closing">Closing</option>
                <option value="marketing">Marketing</option>
                <option value="development">Development</option>
                <option value="leased">Active Lease</option>
                <option value="sold">Properties Sold</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price ($) <span className="text-xs text-slate-400 font-normal">(If Sold)</span></label>
              <input type="text" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lease Start (Optional)</label>
              <input type="date" value={commencementDate} onChange={e => setCommencementDate(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sale Date (Optional)</label>
              <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 text-sm" />
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 mt-4 transition-colors">
            {isSaving ? 'Saving...' : (dealId ? 'Update Deal' : 'Create Deal')}
          </button>
        </form>
      </div>
    </div>
  );
}
