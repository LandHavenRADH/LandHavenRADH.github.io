import React, { useState } from 'react';
import { Building, Plus, Calculator, History, Trash2, Edit2, X, Link as LinkIcon } from 'lucide-react';
import { Franchise, ConstructionCost } from '../types';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function CostEstimatorView({ franchises, constructionCosts }: { franchises: Franchise[], constructionCosts: ConstructionCost[] }) {
  const [activeTab, setActiveTab] = useState<'estimate' | 'history'>('estimate');
  
  // Estimate State
  const [estFranchiseId, setEstFranchiseId] = useState('');
  const [estSqFt, setEstSqFt] = useState('');

  // History State
  const [histFranchiseId, setHistFranchiseId] = useState('');
  const [histAddress, setHistAddress] = useState('');
  const [histSqFt, setHistSqFt] = useState('');
  const [histSiteWork, setHistSiteWork] = useState('');
  const [histBuildingShell, setHistBuildingShell] = useState('');
  const [histInterior, setHistInterior] = useState('');
  const [histSoftCosts, setHistSoftCosts] = useState('');
  const [histFFandE, setHistFFandE] = useState('');
  const [histContingency, setHistContingency] = useState('');
  const [histDocuments, setHistDocuments] = useState<{title: string, url: string}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCostId, setEditingCostId] = useState<string | null>(null);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const parseNum = (s: string) => parseFloat(s.replace(/[^0-9.-]+/g, '')) || 0;

  // Calculate Averages for Estimate
  const getAverages = (franchiseId: string) => {
    const costs = constructionCosts.filter(c => c.franchiseId === franchiseId);
    if (costs.length === 0) return null;

    let totalSqFt = 0;
    let totalSiteWork = 0;
    let totalBuildingShell = 0;
    let totalInterior = 0;
    let totalSoftCosts = 0;
    let totalFFandE = 0;
    let totalContingency = 0;

    costs.forEach(c => {
      totalSqFt += c.buildingSizeSqFt;
      totalSiteWork += c.siteWork;
      totalBuildingShell += c.buildingShell;
      totalInterior += c.interiorBuildout;
      totalSoftCosts += c.softCosts;
      totalFFandE += c.ffAndE;
      totalContingency += c.contingency;
    });

    return {
      siteWorkPerSqFt: totalSiteWork / totalSqFt,
      buildingShellPerSqFt: totalBuildingShell / totalSqFt,
      interiorPerSqFt: totalInterior / totalSqFt,
      softCostsPerSqFt: totalSoftCosts / totalSqFt,
      ffAndEPerSqFt: totalFFandE / totalSqFt,
      contingencyPerSqFt: totalContingency / totalSqFt,
      totalPerSqFt: (totalSiteWork + totalBuildingShell + totalInterior + totalSoftCosts + totalFFandE + totalContingency) / totalSqFt,
      sampleSize: costs.length
    };
  };

  const handleSaveHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!histFranchiseId || !histSqFt) return;
    
    setIsSaving(true);
    try {
      const pSiteWork = parseNum(histSiteWork);
      const pBuildingShell = parseNum(histBuildingShell);
      const pInterior = parseNum(histInterior);
      const pSoftCosts = parseNum(histSoftCosts);
      const pFFandE = parseNum(histFFandE);
      const pContingency = parseNum(histContingency);
      
      const totalCost = pSiteWork + pBuildingShell + pInterior + pSoftCosts + pFFandE + pContingency;

      const costData = {
        franchiseId: histFranchiseId,
        address: histAddress,
        buildingSizeSqFt: parseNum(histSqFt),
        siteWork: pSiteWork,
        buildingShell: pBuildingShell,
        interiorBuildout: pInterior,
        softCosts: pSoftCosts,
        ffAndE: pFFandE,
        contingency: pContingency,
        totalCost,
        documents: histDocuments.filter(d => d.url.trim() !== ''),
        userId: auth.currentUser?.uid || ''
      };

      if (editingCostId) {
        await updateDoc(doc(db, 'gc_construction_costs', editingCostId), {
          ...costData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'gc_construction_costs'), {
          ...costData,
          dateAdded: new Date().toISOString()
        });
      }

      // Reset form
      resetForm();
    } catch (err: any) {
      console.error('Error saving cost data:', err);
      alert('Failed to save cost data: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setEditingCostId(null);
    setHistFranchiseId('');
    setHistAddress('');
    setHistSqFt('');
    setHistSiteWork('');
    setHistBuildingShell('');
    setHistInterior('');
    setHistSoftCosts('');
    setHistFFandE('');
    setHistContingency('');
    setHistDocuments([]);
  };

  const handleEditHistory = (cost: ConstructionCost) => {
    setEditingCostId(cost.id);
    setHistFranchiseId(cost.franchiseId);
    setHistAddress(cost.address || '');
    setHistSqFt(cost.buildingSizeSqFt.toString());
    setHistSiteWork(cost.siteWork.toString());
    setHistBuildingShell(cost.buildingShell.toString());
    setHistInterior(cost.interiorBuildout.toString());
    setHistSoftCosts(cost.softCosts.toString());
    setHistFFandE(cost.ffAndE.toString());
    setHistContingency(cost.contingency.toString());
    setHistDocuments(cost.documents || []);
    setActiveTab('history');
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteDoc(doc(db, 'gc_construction_costs', id));
  };

  const addDocument = () => {
    setHistDocuments([...histDocuments, { title: '', url: '' }]);
  };

  const updateDocument = (index: number, field: 'title' | 'url', value: string) => {
    const newDocs = [...histDocuments];
    newDocs[index][field] = value;
    setHistDocuments(newDocs);
  };

  const removeDocument = (index: number) => {
    setHistDocuments(histDocuments.filter((_, i) => i !== index));
  };

  const averages = estFranchiseId ? getAverages(estFranchiseId) : null;
  const targetSqFt = parseNum(estSqFt);

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building className="text-emerald-600" /> Construction Cost Estimator
          </h2>
          <p className="text-slate-500 text-sm">Estimate new development costs based on historical data.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('estimate')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'estimate' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Calculator size={16} /> New Development
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <History size={16} /> Historical Data
          </button>
        </div>
      </div>

      {activeTab === 'estimate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Development Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Select Franchise</label>
                  <select 
                    value={estFranchiseId} 
                    onChange={e => setEstFranchiseId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  >
                    <option value="">-- Select Franchise --</option>
                    {franchises.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Building Size (Sq. Ft.)</label>
                  <input 
                    type="number" 
                    value={estSqFt} 
                    onChange={e => setEstSqFt(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>

              {averages && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-800 font-medium mb-1">Data Confidence</div>
                  <div className="text-xs text-blue-600">Based on {averages.sampleSize} historical project{averages.sampleSize !== 1 ? 's' : ''}.</div>
                  <div className="mt-2 text-lg font-bold text-blue-900">{formatCurrency(averages.totalPerSqFt)} / sq ft</div>
                </div>
              )}
              {!averages && estFranchiseId && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800">
                  No historical data available for this franchise. Please add historical costs first.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Estimated Construction Costs</h3>
              
              {averages && targetSqFt > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 py-2 border-b border-slate-200 font-semibold text-sm text-slate-500">
                    <div className="col-span-5">Line Item</div>
                    <div className="col-span-3 text-right">Avg Cost / SqFt</div>
                    <div className="col-span-4 text-right">Estimated Total</div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 items-center">
                    <div className="col-span-5 font-medium text-slate-800">Site Work</div>
                    <div className="col-span-3 text-right text-slate-500 text-sm">{formatCurrency(averages.siteWorkPerSqFt)}</div>
                    <div className="col-span-4 text-right font-bold text-slate-900">{formatCurrency(averages.siteWorkPerSqFt * targetSqFt)}</div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 items-center">
                    <div className="col-span-5 font-medium text-slate-800">Building Shell</div>
                    <div className="col-span-3 text-right text-slate-500 text-sm">{formatCurrency(averages.buildingShellPerSqFt)}</div>
                    <div className="col-span-4 text-right font-bold text-slate-900">{formatCurrency(averages.buildingShellPerSqFt * targetSqFt)}</div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 items-center">
                    <div className="col-span-5 font-medium text-slate-800">Interior Buildout</div>
                    <div className="col-span-3 text-right text-slate-500 text-sm">{formatCurrency(averages.interiorPerSqFt)}</div>
                    <div className="col-span-4 text-right font-bold text-slate-900">{formatCurrency(averages.interiorPerSqFt * targetSqFt)}</div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 items-center">
                    <div className="col-span-5 font-medium text-slate-800">Soft Costs (Arch/Eng/Permits)</div>
                    <div className="col-span-3 text-right text-slate-500 text-sm">{formatCurrency(averages.softCostsPerSqFt)}</div>
                    <div className="col-span-4 text-right font-bold text-slate-900">{formatCurrency(averages.softCostsPerSqFt * targetSqFt)}</div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 items-center">
                    <div className="col-span-5 font-medium text-slate-800">FF&E</div>
                    <div className="col-span-3 text-right text-slate-500 text-sm">{formatCurrency(averages.ffAndEPerSqFt)}</div>
                    <div className="col-span-4 text-right font-bold text-slate-900">{formatCurrency(averages.ffAndEPerSqFt * targetSqFt)}</div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 items-center">
                    <div className="col-span-5 font-medium text-slate-800">Contingency</div>
                    <div className="col-span-3 text-right text-slate-500 text-sm">{formatCurrency(averages.contingencyPerSqFt)}</div>
                    <div className="col-span-4 text-right font-bold text-slate-900">{formatCurrency(averages.contingencyPerSqFt * targetSqFt)}</div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 py-4 mt-4 bg-emerald-50 rounded-lg px-4 items-center border border-emerald-100">
                    <div className="col-span-5 font-bold text-emerald-900 text-lg">Total Estimated Cost</div>
                    <div className="col-span-3 text-right text-emerald-700 font-medium">{formatCurrency(averages.totalPerSqFt)}</div>
                    <div className="col-span-4 text-right font-extrabold text-emerald-700 text-xl">{formatCurrency(averages.totalPerSqFt * targetSqFt)}</div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <Calculator size={48} className="mb-4 text-slate-300" />
                  <p>Select a franchise and enter building size to see estimates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {editingCostId ? <Edit2 size={20} className="text-emerald-600" /> : <Plus size={20} className="text-emerald-600" />} 
                  {editingCostId ? 'Edit Historical Cost' : 'Add Historical Cost'}
                </h3>
                {editingCostId && (
                  <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveHistory} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Franchise</label>
                  <select 
                    value={histFranchiseId} 
                    onChange={e => setHistFranchiseId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  >
                    <option value="">-- Select Franchise --</option>
                    {franchises.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Property Address</label>
                  <input 
                    type="text" 
                    value={histAddress} 
                    onChange={e => setHistAddress(e.target.value)}
                    placeholder="e.g. 123 Main St, City, ST"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Building Size (Sq. Ft.)</label>
                  <input 
                    type="number" 
                    value={histSqFt} 
                    onChange={e => setHistSqFt(e.target.value)}
                    required
                    placeholder="e.g. 2500"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Itemized Costs</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Site Work ($)</label>
                      <input type="text" value={histSiteWork} onChange={e => setHistSiteWork(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Building Shell ($)</label>
                      <input type="text" value={histBuildingShell} onChange={e => setHistBuildingShell(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Interior Buildout ($)</label>
                      <input type="text" value={histInterior} onChange={e => setHistInterior(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Soft Costs ($)</label>
                      <input type="text" value={histSoftCosts} onChange={e => setHistSoftCosts(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">FF&E ($)</label>
                      <input type="text" value={histFFandE} onChange={e => setHistFFandE(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Contingency ($)</label>
                      <input type="text" value={histContingency} onChange={e => setHistContingency(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-slate-800">Reference Documents</h4>
                    <button 
                      type="button" 
                      onClick={addDocument}
                      className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Plus size={14} /> Add Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {histDocuments.map((doc, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            value={doc.title} 
                            onChange={e => updateDocument(index, 'title', e.target.value)} 
                            placeholder="Document Title (e.g. Budget PDF)" 
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" 
                          />
                          <input 
                            type="url" 
                            value={doc.url} 
                            onChange={e => updateDocument(index, 'url', e.target.value)} 
                            placeholder="Google Drive URL" 
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeDocument(index)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {histDocuments.length === 0 && (
                      <div className="text-xs text-slate-500 italic text-center py-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        No documents added.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : (editingCostId ? 'Update Cost' : 'Save Historical Cost')}
                  </button>
                  {editingCostId && (
                    <button 
                      type="button" 
                      onClick={resetForm}
                      className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Historical Data Records</h3>
              
              {constructionCosts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="pb-3 font-semibold">Franchise</th>
                        <th className="pb-3 font-semibold">Address</th>
                        <th className="pb-3 font-semibold">Docs</th>
                        <th className="pb-3 font-semibold text-right">SqFt</th>
                        <th className="pb-3 font-semibold text-right">Total Cost</th>
                        <th className="pb-3 font-semibold text-right">Cost/SqFt</th>
                        <th className="pb-3 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {constructionCosts.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map(cost => {
                        const franchise = franchises.find(f => f.id === cost.franchiseId);
                        const costPerSqFt = cost.totalCost / cost.buildingSizeSqFt;
                        return (
                          <tr key={cost.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 font-medium text-slate-800">{franchise?.name || 'Unknown'}</td>
                            <td className="py-3 text-slate-600 text-sm">{cost.address || '-'}</td>
                            <td className="py-3">
                              {cost.documents && cost.documents.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {cost.documents.map((doc, i) => (
                                    <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1" title={doc.title || doc.url}>
                                      <LinkIcon size={12} /> {doc.title || 'Link'}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 text-right text-slate-600">{cost.buildingSizeSqFt.toLocaleString()}</td>
                            <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(cost.totalCost)}</td>
                            <td className="py-3 text-right text-slate-500">{formatCurrency(costPerSqFt)}</td>
                            <td className="py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEditHistory(cost)}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Record"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteHistory(cost.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Record"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <History size={48} className="mb-4 text-slate-300" />
                  <p>No historical cost data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
