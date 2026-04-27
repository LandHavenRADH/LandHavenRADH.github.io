import React, { useState } from 'react';
import { X, ExternalLink, ListChecks, User, Link as LinkIcon, DollarSign, Plus, UserPlus, Trash2, Check } from 'lucide-react';
import { Deal } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function DDModal({ closeModal, dealId, deals, openModal, setCurrentView }: { closeModal: () => void, dealId: string | null, deals: Deal[], openModal: (name: string, params?: any) => void, setCurrentView: (v: string) => void }) {
  const [newItemText, setNewItemText] = useState('');

  if (!dealId) return null;
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return null;

  const checklist = deal.checklist || [];
  const totalCost = checklist.reduce((sum, item) => sum + (parseFloat(item.cost as any) || 0), 0);
  const totalCostStr = totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const toggleItem = async (itemId: string, completed: boolean) => {
    const updated = checklist.map(item => item.id === itemId ? { ...item, completed } : item);
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
  };

  const assignTask = async (itemId: string, assignee: string) => {
    const updated = checklist.map(item => item.id === itemId ? { ...item, assignee } : item);
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
  };

  const removeItem = async (itemId: string) => {
    const updated = checklist.filter(item => item.id !== itemId);
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
  };

  const removeContact = async (itemId: string) => {
    const updated = checklist.map(item => {
      if (item.id === itemId) {
        const { contactName, ...rest } = item;
        return rest;
      }
      return item;
    });
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
  };

  const removeLink = async (itemId: string, urlIndex: number) => {
    const updated = checklist.map(item => {
      if (item.id === itemId) {
        let urls = item.documentUrls || [];
        if (item.documentUrl && urls.length === 0) urls = [{ name: 'Document', url: item.documentUrl }];
        const newUrls = urls.filter((_, idx) => idx !== urlIndex);
        return { ...item, documentUrls: newUrls, documentUrl: undefined };
      }
      return item;
    });
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
  };

  const assignLink = async (itemId: string, name: string, url: string) => {
    if (!name || !url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    const updated = checklist.map(item => {
      if (item.id === itemId) {
        let urls = item.documentUrls || [];
        if (item.documentUrl && urls.length === 0) urls = [{ name: 'Document', url: item.documentUrl }];
        return { ...item, documentUrls: [...urls, { name, url }], documentUrl: undefined };
      }
      return item;
    });
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
  };

  const removeCost = async (itemId: string) => {
    const updated = checklist.map(item => {
      if (item.id === itemId) {
        const { cost, ...rest } = item;
        return rest;
      }
      return item;
    });
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
  };

  const assignCost = async (itemId: string, costStr: string) => {
    const cost = parseFloat(costStr.replace(/[^0-9.-]+/g, ''));
    if (isNaN(cost)) return;
    const updated = checklist.map(item => item.id === itemId ? { ...item, cost } : item);
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
  };

  const addItem = async () => {
    if (!newItemText.trim()) return;
    const newItem = { id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 5), text: newItemText, completed: false };
    const updated = [...checklist, newItem];
    await updateDoc(doc(db, 'gc_deals', dealId), { checklist: updated });
    setNewItemText('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{deal.name}</h3>
            <p className="text-sm text-slate-500">Due Diligence Checklist</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => { closeModal(); setCurrentView('pipeline'); openModal('dealDetail', { id: dealId }); }} className="flex items-center gap-1 text-xs font-bold bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 transition text-slate-700">
              <ExternalLink size={14} /> Deal Details
            </button>
            <button onClick={closeModal} className="text-slate-400 hover:text-red-500 ml-2"><X size={24} /></button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto bg-slate-50">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <ListChecks className="text-emerald-600" size={18} /> Action Items
              </h4>
              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                Total DD Cost: <span className="text-amber-600">{totalCostStr}</span>
              </div>
            </div>
            
            <div className="mb-4">
              {checklist.length === 0 ? (
                <div className="text-slate-400 text-sm italic py-1">No checklist items. Add one below.</div>
              ) : (
                checklist.map(item => {
                  let urls = item.documentUrls || [];
                  if (item.documentUrl && urls.length === 0) urls = [{ name: 'Document', url: item.documentUrl }];

                  return (
                    <div key={item.id} className="flex flex-col group bg-white p-3 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors shadow-sm mb-2 gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2">
                          <input type="checkbox" checked={item.completed} onChange={e => toggleItem(item.id, e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0" />
                          <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'} transition-all truncate`}>{item.text}</span>
                        </label>
                        <div className="flex items-center gap-2 shrink-0">
                          <select value={item.assignee || ''} onChange={e => assignTask(item.id, e.target.value)} onClick={e => e.stopPropagation()} className={`text-[10px] uppercase tracking-wider ${item.assignee ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'} rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer transition-colors border`}>
                            <option value="">Unassigned</option>
                            <option value="DH">DH</option>
                            <option value="RA">RA</option>
                          </select>
                          <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1.5 rounded hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 pl-8">
                        {item.contactName ? (
                          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1.5 rounded-md flex items-center gap-1 max-w-[140px]" title={item.contactName}>
                            <User size={12} /> <span className="truncate">{item.contactName}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeContact(item.id); }} className="hover:text-red-500 ml-1"><X size={10} /></button>
                          </span>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); openModal('contact', { dealId, ddItemId: item.id }); }} className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded-md border border-blue-200 transition flex items-center gap-1 opacity-0 group-hover:opacity-100 whitespace-nowrap shrink-0">
                            <UserPlus size={14} /> Add Contact
                          </button>
                        )}
                        
                        {urls.map((fileObj, idx) => (
                          <span key={idx} className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-1.5 rounded-md flex items-center gap-1 max-w-[140px] mb-1">
                            <a href={fileObj.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:underline truncate" title={fileObj.url}>
                              <LinkIcon size={12} /> <span className="truncate">{fileObj.name}</span>
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); removeLink(item.id, idx); }} className="hover:text-red-500 ml-1"><X size={10} /></button>
                          </span>
                        ))}
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-1 flex-wrap" onClick={e => e.stopPropagation()}>
                          <input type="text" id={`dd-link-name-${item.id}`} placeholder="File Name..." className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-purple-500 w-20" />
                          <input type="url" id={`dd-link-url-${item.id}`} placeholder="Drive URL..." className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-purple-500 w-32" 
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const nameInput = document.getElementById(`dd-link-name-${item.id}`) as HTMLInputElement;
                                const urlInput = e.target as HTMLInputElement;
                                assignLink(item.id, nameInput.value, urlInput.value);
                                nameInput.value = '';
                                urlInput.value = '';
                              }
                            }}
                          />
                          <button onClick={() => {
                              const nameInput = document.getElementById(`dd-link-name-${item.id}`) as HTMLInputElement;
                              const urlInput = document.getElementById(`dd-link-url-${item.id}`) as HTMLInputElement;
                              assignLink(item.id, nameInput.value, urlInput.value);
                              nameInput.value = '';
                              urlInput.value = '';
                            }} className="text-slate-500 hover:text-purple-600 p-1.5 bg-slate-100 rounded hover:bg-purple-50 transition border border-slate-200" title="Add Link">
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        {item.cost ? (
                          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1.5 rounded-md flex items-center gap-1 max-w-[140px]" title={`Cost: $${item.cost}`}>
                            <DollarSign size={12} /> <span>{parseFloat(item.cost as any).toLocaleString('en-US', {maximumFractionDigits:0})}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeCost(item.id); }} className="hover:text-red-500 ml-1"><X size={10} /></button>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-1" onClick={e => e.stopPropagation()}>
                            <DollarSign size={14} className="text-slate-400" />
                            <input type="text" id={`dd-cost-${item.id}`} placeholder="Cost..." className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-amber-500 w-20" 
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  assignCost(item.id, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                            <button onClick={() => {
                                const input = document.getElementById(`dd-cost-${item.id}`) as HTMLInputElement;
                                assignCost(item.id, input.value);
                                input.value = '';
                              }} className="text-slate-500 hover:text-amber-600 p-1.5 bg-slate-100 rounded hover:bg-amber-50 transition border border-slate-200" title="Save Cost">
                              <Check size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)} onKeyPress={e => e.key === 'Enter' && addItem()} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Add custom task..." />
              <button onClick={addItem} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition flex items-center gap-1">
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
