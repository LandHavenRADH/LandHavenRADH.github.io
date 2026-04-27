import React, { useEffect, useRef } from 'react';
import { CalendarClock, BarChart3 } from 'lucide-react';
import { Deal, Task } from '../types';
import Chart from 'chart.js/auto';

export default function DashboardView({ deals, tasks, setCurrentView }: { deals: Deal[], tasks: Task[], setCurrentView: (v: string) => void }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const activeLeases = deals.filter(d => d.stage === 'leased').length;
  const soldProps = deals.filter(d => d.stage === 'sold').length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  const upcomingTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  let totalEstProfit = 0, totalEstMarketValue = 0, totalRealizedProfit = 0;
  const annualData: any = {};

  deals.filter(d => d.stage !== 'cancelled').forEach(deal => {
    const purchasePrice = Number(deal.value) || 0;
    const salePrice = Number(deal.salePrice) || 0;
    
    // Simplified calculation for dashboard
    const params = deal.calcParams || {};
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

    if (deal.stage === 'sold') {
      const profit = salePrice - totalCosts;
      if (salePrice > 0) {
        totalRealizedProfit += profit;
        const year = deal.saleDate ? new Date(deal.saleDate).getFullYear() : new Date().getFullYear();
        if(!annualData[year]) annualData[year] = { realized: 0, potential: 0 };
        annualData[year].realized += profit;
      }
    } else {
      if (marketValue > 0) {
        totalEstMarketValue += marketValue;
        const profit = marketValue - totalCosts;
        if(purchasePrice > 0) totalEstProfit += profit;
        let year = deal.commencementDate ? new Date(deal.commencementDate).getFullYear() : (deal.createdAt?.toDate ? deal.createdAt.toDate().getFullYear() : new Date().getFullYear());
        if(!annualData[year]) annualData[year] = { realized: 0, potential: 0 };
        if(purchasePrice > 0) annualData[year].potential += profit;
      }
    }
  });

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      const years = Object.keys(annualData).sort();
      const realizedData = years.map(y => annualData[y].realized);
      const potentialData = years.map(y => annualData[y].potential);

      chartInstance.current = new Chart(chartRef.current, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                { label: 'Realized Profit', data: realizedData, backgroundColor: '#2563eb', borderRadius: 4 },
                { label: 'Potential Profit', data: potentialData, backgroundColor: '#10b981', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                y: { beginAtZero: true, ticks: { callback: function(value: any) {
                    if(value >= 1000000 || value <= -1000000) return '$' + (value/1000000).toFixed(1) + 'M';
                    if(value >= 1000 || value <= -1000) return '$' + (value/1000).toFixed(0) + 'k';
                    return '$' + value;
                }}}
            }
        }
      });
    }
  }, [deals]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 text-sm">Welcome back. Here is your portfolio overview.</p>
        </div>
        <div className="text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Properties</div>
          <div className="text-2xl font-bold text-slate-800">{deals.filter(d => d.stage !== 'cancelled').length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Active Leases</div>
          <div className="text-2xl font-bold text-emerald-700">{activeLeases}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Properties Sold</div>
          <div className="text-2xl font-bold text-slate-800">{soldProps}</div>
        </div>
        <div onClick={() => setCurrentView('tasks')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Pending Actions</div>
          <div className="text-2xl font-bold text-blue-700">{pendingTasks}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarClock className="text-blue-500" size={18} /> Upcoming Schedule
            </h3>
            <button onClick={() => setCurrentView('tasks')} className="text-xs text-blue-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="text-slate-400 text-sm italic">No upcoming tasks.</div>
            ) : (
              upcomingTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition cursor-pointer">
                  <div className="bg-blue-100 text-blue-600 rounded p-1.5 shrink-0"><CalendarClock size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{t.title}</div>
                    <div className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <span className="block text-xs text-slate-500 uppercase">Est. Market Value (Current)</span>
              <span className="block text-xl font-bold text-slate-800 mt-1">{formatCurrency(totalEstMarketValue)}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <span className="block text-xs text-emerald-600 uppercase font-bold">Total Potential Profit</span>
              <span className="block text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalEstProfit)}</span>
              <span className="text-[10px] text-slate-400">Unrealized (Current Portfolio)</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <span className="block text-xs text-blue-600 uppercase font-bold">Realized Profit (Sold)</span>
              <span className="block text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalRealizedProfit)}</span>
              <span className="text-[10px] text-slate-400">Closed & Sold</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <BarChart3 className="text-indigo-500" size={18} /> Financial Performance (Annual)
            </h3>
            <div className="h-64 w-full">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
