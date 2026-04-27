import React from 'react';
import { X, Edit2, Store, ArrowRight, Calculator, Folder, Link as LinkIcon, Plus } from 'lucide-react';
import { Deal, Franchise, Task, Contact } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const STAGES = [
  { id: 'prospect',    label: 'Prospecting' },
  { id: 'loi',         label: 'LOI / Offer' },
  { id: 'dd',          label: 'Due Diligence' },
  { id: 'closing',     label: 'Closing' },
  { id: 'marketing',   label: 'Marketing' },
  { id: 'development', label: 'Development' },
  { id: 'leased',      label: 'Active Lease' },
  { id: 'sold',        label: 'Properties Sold' }
];

const DD_STAGES = [
  { id: 'not_started', label: 'Not Started' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' }
];

const DEV_STAGES = [
  { id: 'not_started', label: 'Not Started' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' }
];

export default function DealDetailModal({ closeModal, dealId, deals, franchises, tasks, contacts, openModal, setCurrentView }: { closeModal: () => void, dealId: string | null, deals: Deal[], franchises: Franchise[], tasks: Task[], contacts: Contact[], openModal: (name: string, params?: any) => void, setCurrentView: (v: string) => void }) {
  if (!dealId) return null;
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return null;

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const stageLabel = STAGES.find(s => s.id === deal.stage)?.label || deal.stage;
  const ddStageLabel = DD_STAGES.find(s => s.id === (deal.ddStatus || 'not_started'))?.label || 'Not Started';
  const devStageLabel = DEV_STAGES.find(s => s.id === (deal.devStatus || 'not_started'))?.label || 'Not Started';

  const fran = deal.franchiseId ? franchises.find(f => f.id === deal.franchiseId) : null;

  const relatedTasks = tasks.filter(t => t.dealId === dealId);
  const relatedContacts = contacts.filter(c => {
    if (c.dealIds && Array.isArray(c.dealIds)) return c.dealIds.includes(dealId);
    return c.dealId === dealId;
  });

  const assignDealLink = async (name: string, url: string) => {
    if (!name || !url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    const urls = deal.documentUrls || [];
    await updateDoc(doc(db, 'gc_deals', dealId), { documentUrls: [...urls, { name, url }] });
  };

  const removeDealLink = async (urlIndex: number) => {
    const urls = deal.documentUrls || [];
    const newUrls = urls.filter((_, idx) => idx !== urlIndex);
    await updateDoc(doc(db, 'gc_deals', dealId), { documentUrls: newUrls });
  };

  const archiveDeal = async (status: string) => {
    const update: any = { previousStage: deal.stage || "prospect", stage: status };
    if (status === "cancelled") { update.salePrice = null; update.saleDate = null; }
    await updateDoc(doc(db, "gc_deals", dealId), update);
    closeModal();
  };

  // Calc Summary
  const params = deal.calcParams || {};
  const purchasePrice = Number(deal.value) || 0;
  const purchaseLtv = params.ltv !== undefined ? parseFloat(params.ltv) : 100;
  const interestRate = params.rate !== undefined ? parseFloat(params.rate) : 6.0;
  const amortization = params.term !== undefined ? parseFloat(params.term) : 300;
  const dscr = params.dscr !== undefined ? parseFloat(params.dscr) : 1.20;
  const capRate = params.cap !== undefined ? parseFloat(params.cap) : 6.0;
  const taxes = params.taxes !== undefined ? parseFloat(params.taxes) : 0;
  const insurance = params.insurance !== undefined ? parseFloat(params.insurance) : 0;
  
  const ddCost = (deal.checklist || []).reduce((sum, item) => sum + (parseFloat(item.cost as any) || 0), 0);
  const devCost = (deal.devChecklist || []).reduce((sum, item) => sum + (parseFloat(item.cost as any) || 0), 0);
  const landlordWork = ddCost + devCost;
  
  const interestOnly = params.interestOnly || false;
  const useContractRent = params.useContractRent || false;
  const contractRentValue = params.contractRent !== undefined ? parseFloat(params.contractRent) : 0;

  const loanAmount = purchasePrice * (purchaseLtv / 100);
  let annualService = 0;
  if (interestOnly) {
      annualService = loanAmount * (interestRate / 100);
  } else {
      const r = (interestRate / 100) / 12;
      const n = amortization;
      if (r > 0 && n > 0 && loanAmount > 0) {
          const pmt = (loanAmount * r) / (1 - Math.pow(1 + r, -n));
          annualService = pmt * 12;
      } else if (n > 0 && loanAmount > 0) annualService = (loanAmount / n) * 12;
  }

  let rentalRate = (annualService * dscr) + taxes + insurance + (landlordWork * 0.10);
  if (deal.stage === 'leased' && contractRentValue > 0) rentalRate = contractRentValue;
  else if (useContractRent) rentalRate = contractRentValue;

  let marketValue = 0;
  if (capRate > 0) marketValue = rentalRate / (capRate / 100);

  const totalCosts = purchasePrice + taxes + insurance + annualService + landlordWork;
  const profit = marketValue - totalCosts;
  const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
  const marketLtv = params.marketLtv || 70;
  const impliedLtv = marketValue > 0 ? purchasePrice / marketValue : 0;
  const isFinancable = impliedLtv < (marketLtv / 100);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{deal.name}</h3>
            <p className="text-sm text-slate-500">{deal.address}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { closeModal(); openModal('deal', { id: dealId }); }} className="text-slate-500 hover:text-blue-600"><Edit2 size={20} /></button>
            <button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          
          {fran && (
            <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Store size={16} /> Franchise Requirements
              </h4>
              <div className="text-sm text-purple-800 grid grid-cols-2 gap-2">
                <div className="col-span-2 flex items-center mb-3 border-b border-purple-200 pb-3">
                  {fran.logoUrl ? (
                    <img src={fran.logoUrl} className="w-12 h-12 rounded-lg object-contain border border-purple-200 bg-white mr-3 p-0.5" alt={fran.name} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-purple-200 text-purple-700 flex items-center justify-center font-bold mr-3"><Store size={20} /></div>
                  )}
                  <div>
                    <span className="block text-xs text-purple-600 opacity-70">Linked Profile</span>
                    <span className="font-bold text-lg leading-none">{fran.name}</span>
                    <span className="text-xs text-purple-600 ml-1">({fran.category})</span>
                  </div>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="block text-xs text-purple-600 opacity-70">Sq Ft:</span> {fran.minSqFt || '?'} - {fran.maxSqFt || '?'}</div>
                  <div><span className="block text-xs text-purple-600 opacity-70">VPD:</span> {fran.traffic || '-'}</div>
                  <div><span className="block text-xs text-purple-600 opacity-70">Population:</span> {fran.population || '-'}</div>
                  <div><span className="block text-xs text-purple-600 opacity-70">Income:</span> {fran.income || '-'}</div>
                </div>
                <div className="col-span-2 border-t border-purple-200 mt-2 pt-2">
                  <span className="block text-xs text-purple-600 opacity-70">Target Markets:</span> {fran.markets || 'Not specified'}
                </div>
                <div className="col-span-2 mt-1">
                  <span className="block text-xs text-purple-600 opacity-70">Notes:</span> 
                  <span className="italic text-purple-800">{fran.notes || 'None'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 uppercase font-bold">Value</span>
              <div className="text-lg font-bold text-slate-800 truncate">{formatCurrency(Number(deal.value) || 0)}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 uppercase font-bold">Stage</span>
              <div className="text-lg font-bold text-emerald-600 truncate">{stageLabel}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition shadow-sm group" onClick={() => { setCurrentView('duediligence'); closeModal(); openModal('dd', { id: dealId }); }}>
              <span className="text-xs text-slate-500 uppercase font-bold flex justify-between items-center">
                Due Diligence <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-500 transition" />
              </span>
              <div className="text-lg font-bold text-blue-600 truncate">{ddStageLabel}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition shadow-sm group" onClick={() => { setCurrentView('development'); closeModal(); openModal('dev', { id: dealId }); }}>
              <span className="text-xs text-slate-500 uppercase font-bold flex justify-between items-center">
                Development <ArrowRight size={12} className="text-slate-300 group-hover:text-amber-500 transition" />
              </span>
              <div className="text-lg font-bold text-amber-600 truncate">{devStageLabel}</div>
            </div>
          </div>
          
          {deal.value && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><Calculator size={16} /> Investment Analysis</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-blue-700">{useContractRent ? "Contract Rent (Override):" : "Required Rent (NOI):"}</div>
                <div className="font-bold text-blue-900 text-right">{formatCurrency(rentalRate)}</div>
                
                <div className="text-blue-700">Projected Value:</div>
                <div className="font-bold text-blue-900 text-right">{formatCurrency(marketValue)}</div>
                
                <div className="text-blue-700">Profit:</div>
                <div className="font-bold text-emerald-700 text-right">{formatCurrency(profit)}</div>
                
                <div className="text-blue-700">ROI:</div>
                <div className="font-bold text-blue-900 text-right">{Math.round(roi)}%</div>

                <div className="text-blue-700 font-bold pt-2 border-t border-blue-200">100% Finance?</div>
                <div className={`text-right pt-2 border-t border-blue-200 font-bold ${isFinancable ? 'text-emerald-600' : 'text-red-600'}`}>{isFinancable ? 'YES' : 'NO'}</div>
              </div>
            </div>
          )}
          
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Folder className="text-purple-600" size={18} /> Deal Documents
            </h4>
            <div className="flex flex-col gap-2">
              {(deal.documentUrls || []).map((fileObj, idx) => (
                <span key={idx} className="text-sm bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 mb-2">
                  <a href={fileObj.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline font-medium truncate">
                    <LinkIcon size={14} className="shrink-0" /> <span className="truncate">{fileObj.name}</span>
                  </a>
                  <button onClick={() => removeDealLink(idx)} className="hover:text-red-500 ml-2 shrink-0"><X size={14} /></button>
                </span>
              ))}
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 w-full">
                <input type="text" placeholder="File Name..." className="text-sm p-2 border border-slate-200 rounded-md outline-none focus:border-purple-500 w-32" id={`deal-link-name-${deal.id}`} />
                <input type="url" placeholder="Drive URL..." className="flex-1 text-sm p-2 border border-slate-200 rounded-md outline-none focus:border-purple-500 min-w-[200px]" id={`deal-link-url-${deal.id}`} 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const nameInput = document.getElementById(`deal-link-name-${deal.id}`) as HTMLInputElement;
                      const urlInput = e.target as HTMLInputElement;
                      assignDealLink(nameInput.value, urlInput.value);
                      nameInput.value = '';
                      urlInput.value = '';
                    }
                  }}
                />
                <button onClick={() => {
                    const nameInput = document.getElementById(`deal-link-name-${deal.id}`) as HTMLInputElement;
                    const urlInput = document.getElementById(`deal-link-url-${deal.id}`) as HTMLInputElement;
                    assignDealLink(nameInput.value, urlInput.value);
                    nameInput.value = '';
                    urlInput.value = '';
                  }} className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-md font-medium transition flex items-center gap-1 border border-purple-200 shrink-0">
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-700">Linked Tasks</h4>
                <button onClick={() => openModal('task', { dealId })} className="text-xs text-blue-600 hover:underline">+ Add</button>
              </div>
              <div className="space-y-2">
                {relatedTasks.length === 0 ? (
                  <div className="text-slate-400 text-sm italic py-2">No tasks linked to this deal.</div>
                ) : (
                  relatedTasks.map(t => (
                    <div key={t.id} className="bg-white p-3 rounded border border-slate-200 hover:shadow-sm transition flex justify-between items-center cursor-pointer group" onClick={() => openModal('task', { id: t.id })}>
                      <div>
                        <div className={`font-medium text-sm text-slate-800 ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.title}</div>
                        <div className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-700">Contacts</h4>
                <button onClick={() => openModal('contact', { dealId })} className="text-xs text-blue-600 hover:underline">+ Add</button>
              </div>
              <div className="space-y-2">
                {relatedContacts.length === 0 ? (
                  <div className="text-slate-400 text-sm italic py-2">No contacts linked to this deal.</div>
                ) : (
                  relatedContacts.map(c => (
                    <div key={c.id} className="bg-white p-3 rounded border border-slate-200 hover:shadow-sm transition cursor-pointer" onClick={() => openModal('contact', { id: c.id })}>
                      <div className="font-medium text-sm text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-500 uppercase font-semibold">{c.role || 'No Role'}</div>
                      {c.company && <div className="text-xs text-slate-400 font-medium">{c.company}</div>}
                      {c.email && <div className="text-xs text-slate-400 mt-1 truncate">{c.email}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 shrink-0">
          <button onClick={() => { closeModal(); setCurrentView('calculator'); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition">
            <Calculator size={16} /> Run Numbers
          </button>
          <button onClick={() => archiveDeal('cancelled')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition text-red-600">Cancelled</button>
          <button onClick={() => { closeModal(); openModal('sold', { dealId }); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition text-emerald-700">Sold</button>
          <button onClick={closeModal} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">Close</button>
        </div>
      </div>
    </div>
  );
}
