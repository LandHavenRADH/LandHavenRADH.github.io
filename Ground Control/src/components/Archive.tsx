import React, { useMemo } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { Deal } from '../types';
import { formatCurrency } from '../utils';

interface ArchiveProps {
  deals: Deal[];
  onOpenDeal: (id: string) => void;
  onRestoreDeal: (id: string) => void;
}

const DealCard: React.FC<{ 
  deal: Deal; 
  onOpenDeal: (id: string) => void; 
  onRestoreDeal: (id: string) => void; 
}> = ({ deal, onOpenDeal, onRestoreDeal }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <h4 className="font-bold text-slate-800 truncate">{deal.name || "Unnamed Deal"}</h4>
        <p className="text-xs text-slate-500 truncate">{deal.address || ""}</p>
      </div>
      <button 
        className="text-slate-300 hover:text-blue-500" 
        onClick={() => onOpenDeal(deal.id)}
      >
        <ExternalLink size={16} />
      </button>
    </div>
    
    {deal.stage === 'sold' && (
      <div className="mt-2 text-xs text-slate-600">
        <div>Sale Price: <span className="font-mono font-semibold">{formatCurrency(deal.salePrice)}</span></div>
        {deal.saleDate && <div>Sale Date: <span className="font-medium">{deal.saleDate}</span></div>}
      </div>
    )}
    
    <div className="mt-3">
      <button 
        onClick={() => onRestoreDeal(deal.id)} 
        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
      >
        <RotateCcw size={12} /> Restore
      </button>
    </div>
  </div>
);

export const Archive: React.FC<ArchiveProps> = ({ deals, onOpenDeal, onRestoreDeal }) => {
  const cancelledDeals = useMemo(() => deals.filter(d => d.stage === 'cancelled'), [deals]);
  const soldDeals = useMemo(() => deals.filter(d => d.stage === 'sold'), [deals]);

  return (
    <div className="p-8 flex flex-col h-full overflow-y-auto no-scrollbar">
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
              cancelledDeals.map(deal => (
                <DealCard 
                  key={deal.id} 
                  deal={deal} 
                  onOpenDeal={onOpenDeal} 
                  onRestoreDeal={onRestoreDeal} 
                />
              ))
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3 text-slate-700">Properties Sold</h3>
          <div className="space-y-4">
            {soldDeals.length === 0 ? (
              <div className="text-slate-400 italic">No sold properties.</div>
            ) : (
              soldDeals.map(deal => (
                <DealCard 
                  key={deal.id} 
                  deal={deal} 
                  onOpenDeal={onOpenDeal} 
                  onRestoreDeal={onRestoreDeal} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
