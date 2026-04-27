import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Deal } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function SoldModal({ closeModal, dealId, deals }: { closeModal: () => void, dealId: string | null, deals: Deal[] }) {
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!dealId) return null;
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return null;

  const handleSubmit = async () => {
    const priceRaw = salePrice.replace(/[^0-9.-]+/g, "");
    const price = priceRaw ? parseFloat(priceRaw) : 0;
    
    if (!price || !saleDate) {
      alert("Please enter sale price and date.");
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "gc_deals", dealId), { 
        salePrice: price, 
        saleDate, 
        previousStage: deal.stage || "prospect", 
        stage: "sold" 
      });
      closeModal();
    } catch (e) {
      console.error(e);
      alert("Failed to save sale details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Confirm Sale</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price ($)</label>
            <input type="text" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sale Date</label>
            <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={closeModal} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
              {isSaving ? 'Saving...' : 'Confirm Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
