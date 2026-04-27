import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Deal } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ArchiveView({ deals, openModal }: { deals: Deal[], openModal: (name: string, params?: any) => void }) {
  
  const restoreDeal = async (id: string) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;
    const target = deal.previousStage || "prospect";
    const update = { stage: target, salePrice: null, saleDate: null };
    try { await updateDoc(doc(db, "gc_deals", id), update); } catch(e) { console.error(e); }
  };

  const cancelledDeals = deals.filter(d => d.stage === "cancelled");
  const soldDeals = deals.filter(d => d.stage === "sold");

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const renderCard = (deal: Deal) => {
    const saleInfo = deal.stage === "sold" ? (
      <div className="mt-2 text-xs text-slate-600">
        <div>Sale Price: <span className="font-mono font-semibold">{formatCurrency(Number(deal.salePrice) || 0)}</span></div>
        {deal.saleDate && <div>Sale Date: <span className="font-medium">{deal.saleDate}</span></div>}
      </div>
    ) : null;

    return (
      <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h4 className="font-bold text-slate-800 truncate">{deal.name || "Unnamed Deal"}</h4>
            <p className="text-xs text-slate-500 truncate">{deal.address || ""}</p>
          </div>
          <button className="text-slate-300 hover:text-blue-500" onClick={() => openModal('dealDetail', { id: deal.id })}>
            <ExternalLink size={16} />
          </button>
        </div>
        {saleInfo}
        <div className="mt-3">
          <button onClick={() => restoreDeal(deal.id)} className="text-xs text-blue-600 hover:underline">Restore</button>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Archive</h2>
          <p className="text-slate-500 text-sm">Cancelled and sold deals.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-3 text-slate-700">Cancelled Deals</h3>
          <div className="space-y-4">
            {cancelledDeals.length === 0 ? (
              <div className="text-slate-400 italic">No cancelled deals.</div>
            ) : (
              cancelledDeals.map(renderCard)
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3 text-slate-700">Properties Sold</h3>
          <div className="space-y-4">
            {soldDeals.length === 0 ? (
              <div className="text-slate-400 italic">No sold properties.</div>
            ) : (
              soldDeals.map(renderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
