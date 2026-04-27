import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Franchise } from '../types';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function FranchiseModal({ closeModal, franchiseId, franchises }: { closeModal: () => void, franchiseId: string | null, franchises: Franchise[] }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('QSR');
  const [minSqFt, setMinSqFt] = useState('');
  const [maxSqFt, setMaxSqFt] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [traffic, setTraffic] = useState('');
  const [income, setIncome] = useState('');
  const [population, setPopulation] = useState('');
  const [markets, setMarkets] = useState('');
  const [notes, setNotes] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (franchiseId) {
      const fran = franchises.find(f => f.id === franchiseId);
      if (fran) {
        setName(fran.name || '');
        setCategory(fran.category || 'QSR');
        setMinSqFt(fran.minSqFt || '');
        setMaxSqFt(fran.maxSqFt || '');
        setLotSize(fran.lotSize || '');
        setTraffic(fran.traffic || '');
        setIncome(fran.income || '');
        setPopulation(fran.population || '');
        setMarkets(fran.markets || '');
        setNotes(fran.notes || '');
        setLogoUrl(fran.logoUrl || '');
      }
    }
  }, [franchiseId, franchises]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const franData = {
        name, category, minSqFt, maxSqFt, lotSize, traffic, income, population, markets, notes, logoUrl,
        userId: auth.currentUser?.uid
      };
      if (franchiseId) {
        await updateDoc(doc(db, 'gc_franchises', franchiseId), franData);
      } else {
        await addDoc(collection(db, 'gc_franchises'), franData);
      }
      closeModal();
    } catch (error) {
      console.error("Franchise save error:", error);
      alert("Error saving franchise.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{franchiseId ? 'Edit Franchise' : 'Add Franchise'}</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Franchise Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. McDonald's" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="QSR">QSR (Fast Food)</option>
                <option value="Coffee">Coffee</option>
                <option value="Fast Casual">Fast Casual</option>
                <option value="Bank">Bank</option>
                <option value="Auto">Auto Service</option>
                <option value="Retail">General Retail</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL (Optional)</label>
            <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" placeholder="https://..." />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Site Requirements</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Min Sq Ft</label>
                <input type="text" value={minSqFt} onChange={e => setMinSqFt(e.target.value)} className="w-full p-2 border rounded-md text-sm outline-none" placeholder="2,000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Max Sq Ft</label>
                <input type="text" value={maxSqFt} onChange={e => setMaxSqFt(e.target.value)} className="w-full p-2 border rounded-md text-sm outline-none" placeholder="2,500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Min Lot Size (Acres)</label>
                <input type="text" value={lotSize} onChange={e => setLotSize(e.target.value)} className="w-full p-2 border rounded-md text-sm outline-none" placeholder="0.75" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Traffic Count (VPD)</label>
                <input type="text" value={traffic} onChange={e => setTraffic(e.target.value)} className="w-full p-2 border rounded-md text-sm outline-none" placeholder="25,000+" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Population (Trade Area)</label>
                <input type="text" value={population} onChange={e => setPopulation(e.target.value)} className="w-full p-2 border rounded-md text-sm outline-none" placeholder="50,000+ (3mi)" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Household Income Req ($)</label>
                <input type="text" value={income} onChange={e => setIncome(e.target.value)} className="w-full p-2 border rounded-md text-sm outline-none" placeholder="60,000+" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Markets</label>
            <input type="text" value={markets} onChange={e => setMarkets(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Phoenix, Denver, Austin" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">General Notes / Specifics</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Needs drive-thru, AM side of road, etc."></textarea>
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-700 mt-2 transition-colors">
            {isSaving ? 'Saving...' : (franchiseId ? 'Update Franchise' : 'Save Franchise Profile')}
          </button>
        </form>
      </div>
    </div>
  );
}
