import React from 'react';
import { Plus, Store, Trash2, Link as LinkIcon, X } from 'lucide-react';
import { Franchise } from '../types';
import { cn } from '../utils';

interface FranchisesProps {
  franchises: Franchise[];
  onNewFranchise: () => void;
  onEditFranchise: (id: string) => void;
  onDeleteFranchise: (id: string) => void;
  onRemoveLink: (franchiseId: string, urlIndex: number) => void;
}

export const Franchises: React.FC<FranchisesProps> = ({
  franchises,
  onNewFranchise,
  onEditFranchise,
  onDeleteFranchise,
  onRemoveLink
}) => {
  return (
    <div className="p-8 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Franchise & Retailer Criteria</h2>
          <p className="text-slate-500 text-sm">Manage site requirements and link them to deals.</p>
        </div>
        <button 
          onClick={onNewFranchise}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition"
        >
          <Plus size={18} /> Add Franchise
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-4 no-scrollbar">
        {franchises.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            No franchises added yet. Add your first retail partner.
          </div>
        ) : (
          franchises.map(f => (
            <div 
              key={f.id}
              onClick={() => onEditFranchise(f.id)}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition group relative cursor-pointer flex flex-col h-full"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFranchise(f.id);
                }}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="flex items-center gap-4 mb-4 mt-2">
                {f.logoUrl ? (
                  <img 
                    src={f.logoUrl} 
                    className="w-20 h-20 rounded-lg object-contain border border-slate-200 bg-white shrink-0 shadow-sm p-1" 
                    alt={f.name}
                  />
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
                      <span 
                        key={idx}
                        className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1.5 rounded-md flex items-center gap-1 mb-1 max-w-full"
                      >
                        <a 
                          href={fileObj.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-1 hover:underline font-medium truncate w-full"
                        >
                          <LinkIcon size={12} className="shrink-0" /> <span className="truncate">{fileObj.name}</span>
                        </a>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLink(f.id, idx);
                          }} 
                          className="hover:text-red-500 ml-1 shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
