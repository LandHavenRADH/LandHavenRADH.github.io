import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  Calculator as CalcIcon
} from 'lucide-react';
import { Deal, Franchise, CalcParams } from '../types';
import { formatCurrency, cn } from '../utils';

interface CalculatorProps {
  deals: Deal[];
  franchises: Franchise[];
  selectedDealId: string | null;
  onDealSelect: (id: string) => void;
  onSaveParams: (dealId: string, params: CalcParams, purchasePrice: number) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  deals,
  franchises,
  selectedDealId,
  onDealSelect,
  onSaveParams
}) => {
  const selectedDeal = useMemo(() => deals.find(d => d.id === selectedDealId), [deals, selectedDealId]);
  const linkedFranchise = useMemo(() => 
    franchises.find(f => f.id === selectedDeal?.franchiseId), 
    [franchises, selectedDeal]
  );

  const [params, setParams] = useState<CalcParams>({
    ltv: 100,
    rate: 6.0,
    term: 300,
    dscr: 1.20,
    cap: 6.0,
    marketLtv: 70,
    useContractRent: false,
    contractRent: 0,
    interestOnly: false,
    taxes: 0,
    insurance: 0
  });

  const [purchasePrice, setPurchasePrice] = useState(500000);

  useEffect(() => {
    if (selectedDeal) {
      const p = selectedDeal.calcParams || {};
      setParams({
        ltv: p.ltv ?? 100,
        rate: p.rate ?? 6.0,
        term: p.term ?? 300,
        dscr: p.dscr ?? 1.20,
        cap: p.cap ?? 6.0,
        marketLtv: p.marketLtv ?? 70,
        useContractRent: p.useContractRent ?? false,
        contractRent: p.contractRent ?? 0,
        interestOnly: p.interestOnly ?? false,
        taxes: p.taxes ?? 0,
        insurance: p.insurance ?? 0
      });
      
      const price = typeof selectedDeal.value === 'string' 
        ? parseFloat(selectedDeal.value.replace(/[^0-9.-]+/g, "")) 
        : (selectedDeal.value || 500000);
      setPurchasePrice(price);
    }
  }, [selectedDeal]);

  const landlordWork = useMemo(() => {
    if (!selectedDeal) return 0;
    const ddCost = (selectedDeal.checklist || []).reduce((sum, item) => sum + (item.cost || 0), 0);
    const devCost = (selectedDeal.devChecklist || []).reduce((sum, item) => sum + (item.cost || 0), 0);
    return ddCost + devCost;
  }, [selectedDeal]);

  const results = useMemo(() => {
    const loanAmount = purchasePrice * ((params.ltv || 0) / 100);
    let annualService = 0;
    let monthlyPmt = 0;

    if (params.interestOnly) {
      annualService = loanAmount * ((params.rate || 0) / 100);
      monthlyPmt = annualService / 12;
    } else {
      const r = ((params.rate || 0) / 100) / 12;
      const n = params.term || 1;
      if (r > 0 && n > 0 && loanAmount > 0) {
        monthlyPmt = (loanAmount * r) / (1 - Math.pow(1 + r, -n));
      } else if (n > 0 && loanAmount > 0) {
        monthlyPmt = loanAmount / n;
      }
      annualService = monthlyPmt * 12;
    }

    const totalHoldingCosts = (params.taxes || 0) + (params.insurance || 0) + annualService;
    let rentalRate = (annualService * (params.dscr || 1)) + (params.taxes || 0) + (params.insurance || 0) + (landlordWork * 0.10);
    
    if (params.useContractRent) {
      rentalRate = params.contractRent || 0;
    }

    const marketValue = (params.cap || 0) > 0 ? rentalRate / ((params.cap || 0) / 100) : 0;
    const impliedLtv = marketValue > 0 ? purchasePrice / marketValue : 0;
    const totalProjectCost = purchasePrice + totalHoldingCosts + landlordWork;
    const isFinancable = impliedLtv < ((params.marketLtv || 0) / 100);
    const profit = marketValue - totalProjectCost;
    const roi = totalProjectCost > 0 ? (profit / totalProjectCost) * 100 : 0;
    const maxLoan = marketValue * ((params.marketLtv || 0) / 100);

    return {
      loanAmount,
      annualService,
      monthlyPmt,
      totalHoldingCosts,
      rentalRate,
      marketValue,
      impliedLtv,
      totalProjectCost,
      isFinancable,
      profit,
      roi,
      maxLoan
    };
  }, [purchasePrice, params, landlordWork]);

  const handleParamChange = (key: keyof CalcParams, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    if (selectedDealId) {
      onSaveParams(selectedDealId, newParams, purchasePrice);
    }
  };

  const handlePriceChange = (value: number) => {
    setPurchasePrice(value);
    if (selectedDealId) {
      onSaveParams(selectedDealId, params, value);
    }
  };

  return (
    <div className="p-8 flex flex-col h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-4">
          {linkedFranchise?.logoUrl && (
            <img 
              src={linkedFranchise.logoUrl} 
              className="w-16 h-16 rounded-lg object-contain border border-slate-200 bg-white shadow-sm p-1" 
              alt="Franchise Logo" 
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Investment Financing Calculator</h2>
            <p className="text-slate-500 text-sm">Calculate required rental rates and market valuation.</p>
          </div>
        </div>
        <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <span className="text-sm text-slate-600 font-medium">Load Deal:</span>
          <select 
            value={selectedDealId || ''} 
            onChange={(e) => onDealSelect(e.target.value)}
            className="p-2 border rounded-lg text-sm min-w-[200px] outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          >
            <option value="">-- Select a Deal --</option>
            {deals.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} /> Input Parameters
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Purchase Price (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <DollarSign size={16} />
                  </div>
                  <input 
                    type="number" 
                    value={purchasePrice}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Purchase LTV %</label>
                  <input 
                    type="number" 
                    value={params.ltv}
                    onChange={(e) => handleParamChange('ltv', parseFloat(e.target.value) || 0)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Interest Rate %</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={params.rate}
                    onChange={(e) => handleParamChange('rate', parseFloat(e.target.value) || 0)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Amortization (Mo)</label>
                  <input 
                    type="number" 
                    value={params.term}
                    disabled={params.interestOnly}
                    onChange={(e) => handleParamChange('term', parseInt(e.target.value) || 0)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm disabled:bg-slate-100 disabled:text-slate-400" 
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={params.interestOnly}
                      onChange={(e) => handleParamChange('interestOnly', e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3" 
                    />
                    <span className="text-xs text-slate-500 font-medium">Interest Only</span>
                  </label>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">DSCR Target</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={params.dscr}
                    onChange={(e) => handleParamChange('dscr', parseFloat(e.target.value) || 0)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Holding Costs (Year 1) & Capex</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">RE Taxes ($)</label>
                    <input 
                      type="number" 
                      value={params.taxes}
                      onChange={(e) => handleParamChange('taxes', parseFloat(e.target.value) || 0)}
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Insurance ($)</label>
                    <input 
                      type="number" 
                      value={params.insurance}
                      onChange={(e) => handleParamChange('insurance', parseFloat(e.target.value) || 0)}
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" 
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">Landlord's Work ($)</label>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">From DD & Dev</span>
                  </div>
                  <input 
                    type="text" 
                    value={formatCurrency(landlordWork)}
                    disabled
                    className="block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm font-medium" 
                  />
                </div>
                <div className="mt-3 flex justify-between items-center text-xs bg-amber-50 p-2 rounded border border-amber-100">
                  <span className="text-amber-800 font-medium">Total Holding (Inc. Debt):</span>
                  <span className="font-bold text-amber-900">{formatCurrency(results.totalHoldingCosts)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Contract Rent (Override)</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={params.useContractRent}
                      onChange={(e) => handleParamChange('useContractRent', e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
                    />
                    <span className="text-xs text-slate-500">Use Contract Rent?</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <DollarSign size={16} />
                  </div>
                  <input 
                    type="number" 
                    value={params.contractRent}
                    disabled={!params.useContractRent}
                    onChange={(e) => handleParamChange('contractRent', parseFloat(e.target.value) || 0)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm disabled:bg-slate-100 disabled:text-slate-400" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Market Cap Rate %</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={params.cap}
                    onChange={(e) => handleParamChange('cap', parseFloat(e.target.value) || 0)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Market LTV Limit %</label>
                  <input 
                    type="number" 
                    value={params.marketLtv}
                    onChange={(e) => handleParamChange('marketLtv', parseFloat(e.target.value) || 0)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" 
                  />
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-sm text-blue-800 font-medium mb-1">Loan Summary</div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-sm">Principal Amount</span>
                  <span className="text-blue-900 font-bold">{formatCurrency(results.loanAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={20} /> Financial Analysis
            </h2>

            <div className="space-y-1 flex-grow">
              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium pt-0.5">Annual Debt Service</span>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">{formatCurrency(results.annualService)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(results.monthlyPmt)} / month</div>
                </div>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-slate-100 bg-slate-50 -mx-4 px-4">
                <span className="text-sm text-slate-600 font-medium pt-0.5">Required Net Rental Rate</span>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">{formatCurrency(results.rentalRate)}</div>
                  <div className={cn(
                    "text-xs mt-0.5",
                    params.useContractRent ? "text-blue-600 font-bold" : "text-slate-500"
                  )}>
                    {params.useContractRent ? "Using Contract Rent (Override)" : "Inc. Debt(DSCR) + Tax/Ins + 10% Work"}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium pt-0.5">Projected Market Value</span>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">{formatCurrency(results.marketValue)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">@ {params.cap}% Cap Rate</div>
                </div>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium pt-0.5">Implied LTV (Price / Market Value)</span>
                <div className="text-right">
                  <div className={cn(
                    "text-base font-bold",
                    results.isFinancable ? "text-emerald-600" : "text-red-600"
                  )}>
                    {(results.impliedLtv * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Target: &lt; {params.marketLtv}%</div>
                </div>
              </div>

              <div className="my-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">100% Financing Viable?</h3>
                    <p className="text-sm text-slate-500 mt-1">Is Implied LTV &lt; Market LTV?</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-lg border",
                    results.isFinancable 
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                      : "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {results.isFinancable ? (
                      <>
                        <CheckCircle2 size={20} /> YES
                      </>
                    ) : (
                      <>
                        <XCircle size={20} /> NO
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                  <div className="flex justify-between mb-1">
                    <span>Lender Max Loan Amount:</span>
                    <span className="font-semibold">{formatCurrency(results.maxLoan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Price:</span>
                    <span className="font-semibold">{formatCurrency(purchasePrice)}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 border-t border-slate-200 pt-2">
                    {results.isFinancable 
                      ? "Since the lender's max loan on the new Market Value exceeds your Purchase Price, you can likely finance the entire purchase."
                      : "The lender's max loan on the Market Value is less than the Purchase Price. Down payment required."}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Investor Return</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <div className="text-sm text-emerald-800 font-medium mb-1">Potential Profit</div>
                    <div className="text-2xl font-bold text-emerald-700">{formatCurrency(results.profit)}</div>
                    <div className="text-xs text-emerald-600 mt-1">After Holding & Work</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-sm text-blue-800 font-medium mb-1">ROI (On Total Cost)</div>
                    <div className="text-2xl font-bold text-blue-700">{Math.round(results.roi)}%</div>
                    <div className="text-xs text-blue-600 mt-1">Basis: Price + Holding + Work</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
