import React from 'react';
import { MapPin, Store } from 'lucide-react';
import { Deal, Franchise } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEV_STAGES = [
  { id: 'not_started', label: 'Not Started', color: 'border-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-amber-500' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-500' }
];

export default function DevelopmentView({ deals, franchises, openModal }: { deals: Deal[], franchises: Franchise[], openModal: (name: string, params?: any) => void }) {
  
  const moveDevStage = async (id: string, devStatus: string) => {
    await updateDoc(doc(db, 'gc_deals', id), { devStatus });
  };

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Site Development</h2>
          <p className="text-slate-500 text-sm">Manage construction and "pad ready" tasks per deal.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {DEV_STAGES.map(stage => {
            const stageDeals = deals.filter(d => (d.devStatus || 'not_started') === stage.id && d.stage !== 'cancelled' && d.stage !== 'sold');
            return (
              <div key={stage.id} className="w-80 flex flex-col h-full shrink-0">
                <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${stage.color} font-semibold text-slate-700`}>
                  <span className="flex-1">{stage.label}</span>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{stageDeals.length}</span>
                </div>
                <div className="flex-1 bg-slate-200/50 rounded-lg p-2 space-y-3 overflow-y-auto no-scrollbar">
                  {stageDeals.map(deal => {
                    const totalTasks = deal.devChecklist ? deal.devChecklist.length : 0;
                    const completedTasks = deal.devChecklist ? deal.devChecklist.filter(t => t.completed).length : 0;
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
                      <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition group cursor-pointer relative" onClick={() => openModal('dev', { id: deal.id })}>
                        <div className="flex items-center mb-1 pr-6">
                          {logoUrl ? (
                            <img src={logoUrl} className="w-6 h-6 rounded-full object-contain border border-slate-200 bg-white shrink-0 mr-2" alt={displayTitle} />
                          ) : deal.franchiseId ? (
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0 mr-2"><Store size={12} /></div>
                          ) : null}
                          <h4 className="font-bold text-slate-800 leading-tight truncate">{displayTitle}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 truncate"><MapPin size={10} className="inline" /> {deal.address || 'No Address'}</p>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium">
                            <span>{completedTasks}/{totalTasks} Tasks</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Dev Status</span>
                          <select onClick={e => e.stopPropagation()} onChange={e => moveDevStage(deal.id, e.target.value)} value={deal.devStatus || 'not_started'} className="text-xs bg-slate-100 border-none rounded px-2 py-1 cursor-pointer hover:bg-slate-200 focus:ring-0 font-medium text-slate-700">
                            {DEV_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
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
