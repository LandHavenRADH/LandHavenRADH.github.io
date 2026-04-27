import React from 'react';
import { Plus, MapPin, Trash2, Store } from 'lucide-react';
import { Deal, Franchise } from '../types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const STAGES = [
  { id: 'prospect',    label: 'Prospecting',     color: 'border-blue-500' },
  { id: 'loi',         label: 'LOI / Offer',     color: 'border-yellow-500' },
  { id: 'dd',          label: 'Due Diligence',   color: 'border-orange-500' },
  { id: 'closing',     label: 'Closing',         color: 'border-purple-500' },
  { id: 'marketing',   label: 'Marketing',       color: 'border-pink-500' },
  { id: 'development', label: 'Development',     color: 'border-teal-500' },
  { id: 'leased',      label: 'Active Lease',    color: 'border-emerald-500' },
  { id: 'sold',        label: 'Properties Sold', color: 'border-slate-500' }
];

export default function PipelineView({ deals, franchises, openModal }: { deals: Deal[], franchises: Franchise[], openModal: (name: string, params?: any) => void }) {
  
  const moveStage = async (id: string, stage: string) => {
    await updateDoc(doc(db, 'gc_deals', id), { stage });
  };

  const deleteDeal = async (id: string) => {
    if (window.confirm('Delete this deal? This action cannot be undone.')) {
      await deleteDoc(doc(db, 'gc_deals', id));
    }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Deal Pipeline</h2>
          <p className="text-slate-500 text-sm">Track retail site acquisitions from lead to lease to sale.</p>
        </div>
        <button onClick={() => openModal('deal')} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition">
          <Plus size={18} /> New Deal
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            return (
              <div key={stage.id} className="w-80 flex flex-col h-full shrink-0">
                <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${stage.color} font-semibold text-slate-700`}>
                  <span className="flex-1">{stage.label}</span>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{stageDeals.length}</span>
                </div>
                <div className="flex-1 bg-slate-200/50 rounded-lg p-2 space-y-3 overflow-y-auto no-scrollbar">
                  {stageDeals.map(deal => {
                    let displayTitle = deal.name;
                    let logoUrl = '';
                    if (deal.franchiseId) {
                      const fran = franchises.find(f => f.id === deal.franchiseId);
                      if (fran) {
                        displayTitle = fran.name;
                        logoUrl = fran.logoUrl || '';
                      }
                    }

                    return (
                      <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition group relative cursor-pointer" onClick={() => openModal('dealDetail', { id: deal.id })}>
                        <div className="flex justify-between items-start mb-2 pr-6">
                          <div className="flex items-center">
                            {logoUrl ? (
                              <img src={logoUrl} className="w-8 h-8 rounded-full object-contain border border-slate-200 bg-white shrink-0 mr-2" alt={displayTitle} />
                            ) : deal.franchiseId ? (
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mr-2"><Store size={14} /></div>
                            ) : null}
                            <h4 className="font-bold text-slate-800 leading-tight">{displayTitle}</h4>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); deleteDeal(deal.id); }} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition absolute top-2 right-2">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                          <MapPin size={12} /> {deal.address || 'No Address'}
                        </p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                          <span className="text-xs font-mono font-medium text-emerald-600">{formatCurrency(Number(deal.value) || 0)}</span>
                          <select onClick={e => e.stopPropagation()} onChange={e => moveStage(deal.id, e.target.value)} value={deal.stage} className="text-xs bg-slate-100 border-none rounded px-2 py-1 cursor-pointer hover:bg-slate-200 focus:ring-0">
                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
