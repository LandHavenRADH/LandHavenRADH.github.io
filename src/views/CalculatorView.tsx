import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Deal, Franchise } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function CalculatorView({ deals, franchises }: { deals: Deal[], franchises: Franchise[] }) {
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [price, setPrice] = useState('500000');
  const [ltv, setLtv] = useState('100');
  const [rate, setRate] = useState('6.0');
  const [term, setTerm] = useState('300');
  const [dscr, setDscr] = useState('1.20');
  const [taxes, setTaxes] = useState('0');
  const [insurance, setInsurance] = useState('0');
  const [landlordWork, setLandlordWork] = useState('0');
  const [useContractRent, setUseContractRent] = useState(false);
  const [contractRent, setContractRent] = useState('0');
  const [cap, setCap] = useState('6.0');
  const [marketLtv, setMarketLtv] = useState('70');
  const [interestOnly, setInterestOnly] = useState(false);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const parseNum = (s: string) => parseFloat(s.replace(/[^0-9.-]+/g, '')) || 0;

  useEffect(() => {
    if (!selectedDealId) {
      setPrice('500000');
      setLandlordWork('0');
      return;
    }
    const deal = deals.find(d => d.id === selectedDealId);
    if (deal) {
      if (deal.value) setPrice(deal.value.toString());
      const params = deal.calcParams || {};
      setLtv(params.ltv !== undefined ? params.ltv.toString() : '100');
      setRate(params.rate !== undefined ? params.rate.toString() : '6.0');
      setTerm(params.term !== undefined ? params.term.toString() : '300');
      setDscr(params.dscr !== undefined ? params.dscr.toString() : '1.20');
      setCap(params.cap !== undefined ? params.cap.toString() : '6.0');
      setMarketLtv(params.marketLtv !== undefined ? params.marketLtv.toString() : '70');
      setTaxes(params.taxes !== undefined ? params.taxes.toString() : '0');
      setInsurance(params.insurance !== undefined ? params.insurance.toString() : '0');
      setUseContractRent(params.useContractRent || false);
      setContractRent(params.contractRent !== undefined ? params.contractRent.toString() : '0');
      setInterestOnly(params.interestOnly || false);

      const ddCost = (deal.checklist || []).reduce((sum, item) => sum + (parseFloat(item.cost as any) || 0), 0);
      const devCost = (deal.devChecklist || []).reduce((sum, item) => sum + (parseFloat(item.cost as any) || 0), 0);
      setLandlordWork((ddCost + devCost).toString());
    }
  }, [selectedDealId, deals]);

  const handleSave = async () => {
    if (!selectedDealId) return;
    const paramsToSave = {
      ltv: parseNum(ltv), rate: parseNum(rate), term: parseNum(term), dscr: parseNum(dscr),
      cap: parseNum(cap), marketLtv: parseNum(marketLtv), useContractRent,
      contractRent: parseNum(contractRent), interestOnly,
      taxes: parseNum(taxes), insurance: parseNum(insurance)
    };
    await updateDoc(doc(db, 'gc_deals', selectedDealId), {
      value: parseNum(price),
      calcParams: paramsToSave
    });
  };

  const pPrice = parseNum(price);
  const pLtv = parseNum(ltv);
  const pRate = parseNum(rate);
  const pTerm = parseNum(term);
  const pDscr = parseNum(dscr);
  const pCap = parseNum(cap);
  const pMarketLtv = parseNum(marketLtv);
  const pTaxes = parseNum(taxes);
  const pInsurance = parseNum(insurance);
  const pLandlordWork = parseNum(landlordWork);
  const pContractRent = parseNum(contractRent);

  const loanAmount = pPrice * (pLtv / 100);
  let annualService = 0, pmt = 0;
  if (interestOnly) {
    annualService = loanAmount * (pRate / 100);
    pmt = annualService / 12;
  } else {
    const r = (pRate / 100) / 12;
    const n = pTerm;
    if (r > 0 && n > 0 && loanAmount > 0) {
      pmt = (loanAmount * r) / (1 - Math.pow(1 + r, -n));
    } else if (n > 0 && loanAmount > 0) {
      pmt = loanAmount / n;
    }
    annualService = pmt * 12;
  }

  const totalHoldingCosts = pTaxes + pInsurance + annualService;
  let rentalRate = (annualService * pDscr) + pTaxes + pInsurance + (pLandlordWork * 0.10);
  if (useContractRent) rentalRate = pContractRent;

  let marketValue = 0;
  if (pCap > 0) marketValue = rentalRate / (pCap / 100);
  let impliedLtv = marketValue > 0 ? pPrice / marketValue : 0;
  const totalProjectCost = pPrice + totalHoldingCosts + pLandlordWork;
  const isFinancable = impliedLtv < (pMarketLtv / 100);
  const profit = marketValue - totalProjectCost;
  const roi = totalProjectCost > 0 ? (profit / totalProjectCost) * 100 : 0;

  let logoUrl = '';
  if (selectedDealId) {
    const deal = deals.find(d => d.id === selectedDealId);
    if (deal && deal.franchiseId) {
      const fran = franchises.find(f => f.id === deal.franchiseId);
      if (fran && fran.logoUrl) logoUrl = fran.logoUrl;
    }
  }

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-4">
          {logoUrl && <img src={logoUrl} className="w-16 h-16 rounded-lg object-contain border border-slate-200 bg-white shadow-sm p-1" alt="Franchise Logo" />}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Investment Financing Calculator</h2>
            <p className="text-slate-500 text-sm">Calculate required rental rates and market valuation.</p>
          </div>
        </div>
        <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <span className="text-sm text-slate-600 font-medium">Load Deal:</span>
          <select value={selectedDealId} onChange={e => setSelectedDealId(e.target.value)} className="p-2 border rounded-lg text-sm min-w-[200px] outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50">
            <option value="">-- Select a Deal --</option>
            {deals.filter(d => d.stage !== 'cancelled' && d.stage !== 'sold').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} /> Input Parameters
            </h2>
            
            <div className="space-y-4" onBlur={handleSave}>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Purchase Price (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <DollarSign size={16} />
                  </div>
                  <input type="text" value={price} onChange={e => setPrice(e.target.value)} className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 text-sm transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Purchase LTV %</label>
                  <input type="text" value={ltv} onChange={e => setLtv(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Interest Rate %</label>
                  <input type="text" value={rate} onChange={e => setRate(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Amortization (Mo)</label>
                  <input type="text" value={term} onChange={e => setTerm(e.target.value)} disabled={interestOnly} className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed" />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={interestOnly} onChange={e => setInterestOnly(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3" />
                    <span className="text-xs text-slate-500 font-medium">Interest Only</span>
                  </label>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">DSCR Target</label>
                  <input type="text" value={dscr} onChange={e => setDscr(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Holding Costs (Year 1) & Capex</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">RE Taxes ($)</label>
                    <input type="text" value={taxes} onChange={e => setTaxes(e.target.value)} className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Insurance ($)</label>
                    <input type="text" value={insurance} onChange={e => setInsurance(e.target.value)} className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">Landlord's Work ($)</label>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">From DD & Dev</span>
                  </div>
                  <input type="text" value={formatCurrency(pLandlordWork)} disabled className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed font-medium disabled:bg-slate-100 disabled:text-slate-500" />
                </div>
                <div className="mt-3 flex justify-between items-center text-xs bg-amber-50 p-2 rounded border border-amber-100">
                  <span className="text-amber-800 font-medium">Total Holding (Inc. Debt):</span>
                  <span className="font-bold text-amber-900">{formatCurrency(totalHoldingCosts)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Contract Rent (Override)</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={useContractRent} onChange={e => setUseContractRent(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    <span className="text-xs text-slate-500">Use Contract Rent?</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <DollarSign size={16} />
                  </div>
                  <input type="text" value={contractRent} onChange={e => setContractRent(e.target.value)} disabled={!useContractRent} className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 text-sm transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Market Cap Rate %</label>
                  <input type="text" value={cap} onChange={e => setCap(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Market LTV Limit %</label>
                  <input type="text" value={marketLtv} onChange={e => setMarketLtv(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm" />
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-sm text-blue-800 font-medium mb-1">Loan Summary</div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-sm">Principal Amount</span>
                  <span className="text-blue-900 font-bold">{formatCurrency(loanAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={20} /> Financial Analysis
            </h2>

            <div className="space-y-1 flex-grow">
              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium pt-0.5">Annual Debt Service</span>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">{formatCurrency(annualService)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(pmt)} / month</div>
                </div>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-slate-100 bg-slate-50 -mx-4 px-4">
                <span className="text-sm text-slate-600 font-medium pt-0.5">Required Net Rental Rate</span>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">{formatCurrency(rentalRate)}</div>
                  <div className={`text-xs mt-0.5 ${useContractRent ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                    {useContractRent ? 'Using Contract Rent (Override)' : 'Inc. Debt(DSCR) + Tax/Ins + 10% Work'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium pt-0.5">Projected Market Value</span>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">{formatCurrency(marketValue)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">@ {pCap}% Cap Rate</div>
                </div>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-medium pt-0.5">Implied LTV (Price / Market Value)</span>
                <div className="text-right">
                  <div className={`text-base font-bold ${isFinancable ? 'text-emerald-600' : 'text-red-600'}`}>{(impliedLtv * 100).toFixed(2)}%</div>
                  <div className="text-xs text-slate-500 mt-0.5">Target: &lt; {pMarketLtv}%</div>
                </div>
              </div>

              <div className="my-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">100% Financing Viable?</h3>
                    <p className="text-sm text-slate-500 mt-1">Is Implied LTV &lt; Market LTV?</p>
                  </div>
                  <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-lg border ${isFinancable ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {isFinancable ? 'YES' : 'NO'}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                  <div className="flex justify-between mb-1">
                    <span>Lender Max Loan Amount:</span>
                    <span className="font-semibold">{formatCurrency(marketValue * (pMarketLtv/100))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Price:</span>
                    <span className="font-semibold">{formatCurrency(pPrice)}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 border-t border-slate-200 pt-2">
                    {isFinancable ? "Since the lender's max loan on the new Market Value exceeds your Purchase Price, you can likely finance the entire purchase." : "The lender's max loan on the Market Value is less than the Purchase Price. Down payment required."}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Investor Return</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <div className="text-sm text-emerald-800 font-medium mb-1">Potential Profit</div>
                    <div className="text-2xl font-bold text-emerald-700">{formatCurrency(profit)}</div>
                    <div className="text-xs text-emerald-600 mt-1">After Holding & Work</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-sm text-blue-800 font-medium mb-1">ROI (On Total Cost)</div>
                    <div className="text-2xl font-bold text-blue-700">{Math.round(roi)}%</div>
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
}
