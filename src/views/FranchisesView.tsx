import React from 'react';
import { Plus, Store, Trash2, Link as LinkIcon, X, Building } from 'lucide-react';
import { Franchise, ConstructionCost } from '../types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function FranchisesView({ franchises, constructionCosts, openModal }: { franchises: Franchise[], constructionCosts: ConstructionCost[], openModal: (name: string, params?: any) => void }) {
  
  const deleteFranchise = async (id: string) => {
    if(window.confirm('Delete franchise profile?')) {
      await deleteDoc(doc(db, 'gc_franchises', id));
    }
  };

  const removeFranchiseLink = async (franchiseId: string, urlIndex: number) => {
    const franchise = franchises.find(f => f.id === franchiseId);
    if (!franchise) return;
    const urls = franchise.documentUrls || [];
    const newUrls = urls.filter((_, idx) => idx !== urlIndex);
    await updateDoc(doc(db, 'gc_franchises', franchiseId), { documentUrls: newUrls });
  };

  const assignFranchiseLink = async (franchiseId: string, name: string, url: string) => {
    if (!name || !url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const franchise = franchises.find(f => f.id === franchiseId);
    if (!franchise) return;
    const urls = franchise.documentUrls || [];
    await updateDoc(doc(db, 'gc_franchises', franchiseId), { documentUrls: [...urls, { name, url }] });
  };

  const getAverageCostPerSqFt = (franchiseId: string) => {
    const costs = constructionCosts.filter(c => c.franchiseId === franchiseId);
    if (costs.length === 0) return null;
    let totalSqFt = 0;
    let totalCost = 0;
    costs.forEach(c => {
      totalSqFt += c.buildingSizeSqFt;
      totalCost += c.totalCost;
    });
    return totalCost / totalSqFt;
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Franchise & Retailer Criteria</h2>
          <p className="text-slate-500 text-sm">Manage site requirements and link them to deals.</p>
        </div>
        <button onClick={() => openModal('franchise')} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition">
          <Plus size={18} /> Add Franchise
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-4">
        {franchises.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No franchises added yet. Add your first retail partner.</div>
        ) : (
          franchises.map(f => (
            <div key={f.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition group relative cursor-pointer flex flex-col h-full" onClick={() => openModal('franchise', { id: f.id })}>
              <button onClick={(e) => { e.stopPropagation(); deleteFranchise(f.id); }} className="absolute top-4 right-4 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={16} />
              </button>
              
              <div className="flex items-center gap-4 mb-4 mt-2">
                {f.logoUrl ? (
                  <img src={f.logoUrl} className="w-20 h-20 rounded-lg object-contain border border-slate-200 bg-white shrink-0 shadow-sm p-1" alt={f.name} />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-3xl shrink-0 shadow-sm">
                    <Store size={32} />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800 text-xl leading-tight">{f.name || 'No Name'}</h4>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">{f.category || 'Retail'}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100 mb-3">
                <div className="flex justify-between border-b border-slate-200 pb-1 mb-1">
                  <span className="text-xs text-slate-400">Sq Ft</span>
                  <span className="font-medium">{f.minSqFt || '?'} - {f.maxSqFt || '?'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1 mb-1">
                  <span className="text-xs text-slate-400">Lot Size</span>
                  <span className="font-medium">{f.lotSize ? f.lotSize + ' ac' : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1 mb-1">
                  <span className="text-xs text-slate-400">Traffic</span>
                  <span className="font-medium">{f.traffic || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1 mb-1">
                  <span className="text-xs text-slate-400">Population</span>
                  <span className="font-medium">{f.population || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Income</span>
                  <span className="font-medium">{f.income || '-'}</span>
                </div>
              </div>

              <div className="mb-3 bg-emerald-50 border border-emerald-100 p-2 rounded-md flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Building size={12} /> Avg Const. Cost</span>
                <span className="text-sm font-bold text-emerald-700">
                  {getAverageCostPerSqFt(f.id) !== null ? `${formatCurrency(getAverageCostPerSqFt(f.id)!)} / sqft` : 'No Data'}
                </span>
              </div>

              {f.markets && (
                <div className="mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Target Markets</span>
                  <p className="text-sm text-slate-700 leading-snug bg-white p-1 rounded border border-transparent">{f.markets}</p>
                </div>
              )}
              
              <div className="mt-auto pt-3 border-t border-slate-100">
                {f.notes && (
                  <div className="mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Notes</span>
                    <p className="text-xs text-slate-500 italic leading-relaxed">"{f.notes}"</p>
                  </div>
                )}
                
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Franchise Documents</span>
                  <div className="flex flex-col gap-1 w-full">
                    {(f.documentUrls || []).map((fileObj, idx) => (
                      <span key={idx} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1.5 rounded-md flex items-center gap-1 mb-1 max-w-full">
                        <a href={fileObj.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:underline font-medium truncate w-full">
                          <LinkIcon size={12} className="shrink-0" /> <span className="truncate">{fileObj.name}</span>
                        </a>
                        <button onClick={(e) => { e.stopPropagation(); removeFranchiseLink(f.id, idx); }} className="hover:text-red-500 ml-1 shrink-0"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity w-full" onClick={e => e.stopPropagation()}>
                    <input type="text" placeholder="Name..." className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-purple-500 flex-1 min-w-[70px]" id={`fran-link-name-${f.id}`} />
                    <input type="url" placeholder="Drive URL..." className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-purple-500 flex-[2] min-w-[100px]" id={`fran-link-url-${f.id}`} 
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const nameInput = document.getElementById(`fran-link-name-${f.id}`) as HTMLInputElement;
                          const urlInput = e.target as HTMLInputElement;
                          assignFranchiseLink(f.id, nameInput.value, urlInput.value);
                          nameInput.value = '';
                          urlInput.value = '';
                        }
                      }}
                    />
                    <button onClick={() => {
                        const nameInput = document.getElementById(`fran-link-name-${f.id}`) as HTMLInputElement;
                        const urlInput = document.getElementById(`fran-link-url-${f.id}`) as HTMLInputElement;
                        assignFranchiseLink(f.id, nameInput.value, urlInput.value);
                        nameInput.value = '';
                        urlInput.value = '';
                      }} className="text-slate-500 hover:text-purple-600 p-1.5 bg-slate-100 rounded hover:bg-purple-50 transition border border-slate-200 shrink-0" title="Add Link">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
