import React from 'react';
import { MapPin, ListChecks, HardHat, ExternalLink } from 'lucide-react';
import { Deal, Franchise } from '../types';
import { cn } from '../utils';

interface ChecklistBoardProps {
  title: string;
  description: string;
  deals: Deal[];
  franchises: Franchise[];
  stages: { id: string; label: string; color: string }[];
  statusKey: 'ddStatus' | 'devStatus';
  checklistKey: 'checklist' | 'devChecklist';
  icon: React.ElementType;
  accentColor: string;
  onOpenDetail: (id: string) => void;
  onMoveStage: (id: string, stage: string) => void;
}

export const ChecklistBoard: React.FC<ChecklistBoardProps> = ({
  title,
  description,
  deals,
  franchises,
  stages,
  statusKey,
  checklistKey,
  icon: Icon,
  accentColor,
  onOpenDetail,
  onMoveStage
}) => {
  return (
    <div className="p-8 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {stages.map(stage => {
            const stageDeals = deals.filter(d => (d[statusKey] || 'not_started') === stage.id);
            return (
              <div key={stage.id} className="w-80 flex flex-col h-full shrink-0">
                <div className={cn(
                  "flex items-center gap-2 mb-3 pb-2 border-b-2 font-semibold text-slate-700",
                  stage.color
                )}>
                  <span className="flex-1">{stage.label}</span>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="flex-1 bg-slate-200/50 rounded-lg p-2 space-y-3 overflow-y-auto no-scrollbar">
                  {stageDeals.map(deal => {
                    const checklist = deal[checklistKey] || [];
                    const totalTasks = checklist.length;
                    const completedTasks = checklist.filter(t => t.completed).length;
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    const franchise = franchises.find(f => f.id === deal.franchiseId);
                    const displayTitle = franchise ? franchise.name : deal.name;

                    return (
                      <div 
                        key={deal.id}
                        onClick={() => onOpenDetail(deal.id)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition group cursor-pointer relative"
                      >
                        <div className="flex items-center mb-1 pr-6">
                          {franchise?.logoUrl ? (
                            <img 
                              src={franchise.logoUrl} 
                              className="w-6 h-6 rounded-full object-contain border border-slate-200 bg-white shrink-0 mr-2" 
                              alt={franchise.name}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0 mr-2">
                              <Icon size={12} />
                            </div>
                          )}
                          <h4 className="font-bold text-slate-800 leading-tight truncate">{displayTitle}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 truncate">
                          <MapPin size={10} className="inline mr-1" /> {deal.address || 'No Address'}
                        </p>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium">
                            <span>{completedTasks}/{totalTasks} Tasks</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={cn("h-1.5 rounded-full transition-all duration-500", accentColor)} 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status</span>
                          <select 
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onMoveStage(deal.id, e.target.value)}
                            value={deal[statusKey] || 'not_started'}
                            className="text-xs bg-slate-100 border-none rounded px-2 py-1 cursor-pointer hover:bg-slate-200 focus:ring-0 font-medium text-slate-700"
                          >
                            {stages.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
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
};
