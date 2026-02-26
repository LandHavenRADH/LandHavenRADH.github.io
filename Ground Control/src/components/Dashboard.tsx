import React, { useMemo } from 'react';
import { 
  CalendarClock, 
  BarChart3, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Deal, Task } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface DashboardProps {
  deals: Deal[];
  tasks: Task[];
  onSwitchView: (view: string) => void;
  onEditTask: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ deals, tasks, onSwitchView, onEditTask }) => {
  const stats = useMemo(() => {
    const activeLeases = deals.filter(d => d.stage === 'leased').length;
    const soldProps = deals.filter(d => d.stage === 'sold').length;
    const pendingTasks = tasks.filter(t => !t.completed).length;

    let totalEstMarketValue = 0;
    let totalEstProfit = 0;
    let totalRealizedProfit = 0;

    deals.forEach(deal => {
      const value = typeof deal.value === 'string' ? parseFloat(deal.value.replace(/[^0-9.-]+/g, "")) : deal.value;
      const salePrice = typeof deal.salePrice === 'string' ? parseFloat(deal.salePrice.replace(/[^0-9.-]+/g, "")) : (deal.salePrice || 0);
      
      // Simple profit calculation for dashboard overview
      // In a real app, this would use the full calculator logic
      if (deal.stage === 'sold') {
        totalRealizedProfit += (salePrice - (value || 0));
      } else if (deal.stage !== 'cancelled') {
        totalEstMarketValue += (value || 0);
        // Assuming 20% potential profit for estimation if not sold
        totalEstProfit += (value || 0) * 0.2;
      }
    });

    return {
      totalProps: deals.length,
      activeLeases,
      soldProps,
      pendingTasks,
      totalEstMarketValue,
      totalEstProfit,
      totalRealizedProfit
    };
  }, [deals, tasks]);

  const chartData = useMemo(() => {
    const years: Record<string, { realized: number; potential: number }> = {};
    
    deals.forEach(deal => {
      const year = deal.saleDate 
        ? new Date(deal.saleDate).getFullYear().toString() 
        : new Date().getFullYear().toString();
      
      if (!years[year]) years[year] = { realized: 0, potential: 0 };
      
      const value = typeof deal.value === 'string' ? parseFloat(deal.value.replace(/[^0-9.-]+/g, "")) : (deal.value || 0);
      const salePrice = typeof deal.salePrice === 'string' ? parseFloat(deal.salePrice.replace(/[^0-9.-]+/g, "")) : (deal.salePrice || 0);

      if (deal.stage === 'sold') {
        years[year].realized += (salePrice - value);
      } else if (deal.stage !== 'cancelled') {
        years[year].potential += value * 0.2;
      }
    });

    return Object.entries(years)
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [deals]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => !t.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="p-8 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 text-sm">Welcome back. Here is your portfolio overview.</p>
        </div>
        <div className="text-sm text-slate-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Properties</div>
          <div className="text-2xl font-bold text-slate-800">{stats.totalProps}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Active Leases</div>
          <div className="text-2xl font-bold text-emerald-700">{stats.activeLeases}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Properties Sold</div>
          <div className="text-2xl font-bold text-slate-800">{stats.soldProps}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Pending Actions</div>
          <div className="text-2xl font-bold text-blue-700">{stats.pendingTasks}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarClock className="text-blue-500" size={18} /> Upcoming Schedule
            </h3>
            <button onClick={() => onSwitchView('tasks')} className="text-xs text-blue-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="text-slate-400 text-sm italic">No upcoming tasks.</div>
            ) : (
              upcomingTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => onEditTask(task.id)}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition cursor-pointer"
                >
                  <div className="bg-blue-100 text-blue-600 rounded p-1.5 shrink-0">
                    <CalendarClock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{task.title}</div>
                    <div className="text-xs text-slate-500">{formatDate(task.date)}</div>
                    {task.location && (
                      <div className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {task.location}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financial Summary & Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <span className="block text-xs text-slate-500 uppercase">Est. Market Value (Current)</span>
              <span className="block text-xl font-bold text-slate-800 mt-1">{formatCurrency(stats.totalEstMarketValue)}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <span className="block text-xs text-emerald-600 uppercase font-bold">Total Potential Profit</span>
              <span className="block text-xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalEstProfit)}</span>
              <span className="text-[10px] text-slate-400">Unrealized (Current Portfolio)</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <span className="block text-xs text-blue-600 uppercase font-bold">Realized Profit (Sold)</span>
              <span className="block text-xl font-bold text-blue-600 mt-1">{formatCurrency(stats.totalRealizedProfit)}</span>
              <span className="text-[10px] text-slate-400">Closed & Sold</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <BarChart3 className="text-indigo-500" size={18} /> Financial Performance (Annual)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis 
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                      return `$${value}`;
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                  <Bar name="Realized Profit" dataKey="realized" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar name="Potential Profit" dataKey="potential" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
