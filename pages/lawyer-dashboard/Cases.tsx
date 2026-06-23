
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Case, LedgerEntry } from '../../types';
import * as db from '../../services/mockDataService';
import { useNavigate } from 'react-router-dom';
import CaseDetailsModal from '../../components/CaseDetailsModal';

export default function Cases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isCaseDetailsModalOpen, setIsCaseDetailsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [newCase, setNewCase] = useState<Partial<Case>>({ 
    stage: 'Filing', 
    status: 'Open', 
    importantDates: [], 
    caseFiles: [] 
  });

  useEffect(() => {
    if (user) {
      loadCases();
    }
  }, [user]);

  const loadCases = async () => {
    if (!user) return;
    const c = await db.getLawyerCases(user.uid);
    setCases(c);
    
    let allLedger: LedgerEntry[] = [];
    const ledgerPromises = c.map(kase => db.getCaseLedger(kase.id));
    const ledgerResults = await Promise.all(ledgerPromises);
    ledgerResults.forEach(entries => {
        allLedger = [...allLedger, ...entries];
    });
    setLedgerEntries(allLedger);
  };

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.caseTitle || !newCase.clientName) return;
    
    const c: Case = {
        id: `case_${Date.now()}`,
        lawyerId: user!.uid,
        clientName: newCase.clientName!,
        caseTitle: newCase.caseTitle!,
        courtName: newCase.courtName || '',
        nextHearingDate: newCase.nextHearingDate || '',
        stage: newCase.stage || 'Filing',
        notes: newCase.notes || '',
        description: newCase.description || '',
        opposingCounsel: newCase.opposingCounsel || '',
        status: newCase.status || 'Open',
        importantDates: [],
        caseFiles: []
    };
    await db.addCase(c);
    setCases([...cases, c]);
    setNewCase({ stage: 'Filing', status: 'Open', importantDates: [], caseFiles: [] });
  };

  const handleUpdateCaseInState = (updatedCase: Case) => {
    setCases(cases.map(c => (c.id === updatedCase.id ? updatedCase : c)));
  };

  const handleDeleteCaseInState = (caseId: string) => {
    setCases(cases.filter(c => c.id !== caseId));
  };

  const handleDeleteLedger = async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this Ledger entry?")) {
        await db.deleteLedgerEntry(entryId);
        setLedgerEntries(prev => prev.filter(k => k.id !== entryId));
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 font-serif">Case Manager</h1>
            <div className="flex gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">{cases.length} Total Cases</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">{cases.filter(c => c.status === 'Open').length} Open</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Case Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 sticky top-20">
                    <h3 className="font-bold text-xl mb-4 text-slate-800">Add New Case</h3>
                    <form onSubmit={handleAddCase} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Case Title</label>
                            <input placeholder="e.g. State vs Ali" className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newCase.caseTitle || ''} onChange={e => setNewCase({...newCase, caseTitle: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client Name</label>
                            <input placeholder="Client Name" className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newCase.clientName || ''} onChange={e => setNewCase({...newCase, clientName: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Court Name</label>
                            <input placeholder="e.g. District Court" className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newCase.courtName || ''} onChange={e => setNewCase({...newCase, courtName: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Next Hearing</label>
                                <input type="date" className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newCase.nextHearingDate || ''} onChange={e => setNewCase({...newCase, nextHearingDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stage</label>
                                <select className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newCase.stage} onChange={e => setNewCase({...newCase, stage: e.target.value})}>
                                    <option value="Filing">Filing</option>
                                    <option value="Hearing">Hearing</option>
                                    <option value="Evidence">Evidence</option>
                                    <option value="Verdict">Verdict</option>
                                    <option value="Appeal">Appeal</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95 shadow-lg">Create Case File</button>
                    </form>
                </div>
            </div>

            {/* Cases List */}
            <div className="lg:col-span-2 space-y-4">
                {cases.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No cases yet</h3>
                        <p className="text-slate-500 text-sm">Start by adding your first case using the form on the left.</p>
                    </div>
                ) : (
                    cases.map(c => (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-slate-800">{c.caseTitle}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        c.status === 'Open' ? 'bg-green-100 text-green-700' :
                                        c.status === 'On Hold' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {c.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-sm">
                                    <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> {c.clientName}</span>
                                    <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> {c.courtName || 'N/A'}</span>
                                    <span className="flex items-center text-blue-600 font-semibold"><svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {c.nextHearingDate || 'No hearing set'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                                <div className="text-right hidden md:block mr-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Stage</p>
                                    <p className="text-sm font-bold text-blue-700">{c.stage}</p>
                                </div>
                                <button 
                                    onClick={() => { setSelectedCase(c); setIsCaseDetailsModalOpen(true); }}
                                    className="flex-grow md:flex-grow-0 bg-blue-50 text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-100 transition whitespace-nowrap"
                                >
                                    Manage Case
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {isCaseDetailsModalOpen && selectedCase && (
            <CaseDetailsModal 
                isOpen={isCaseDetailsModalOpen} 
                onClose={() => setIsCaseDetailsModalOpen(false)} 
                caseData={selectedCase} 
                onUpdateCase={handleUpdateCaseInState}
                onDeleteCase={handleDeleteCaseInState}
                lawyerId={user!.uid}
                ledgerEntries={ledgerEntries.filter(k => k.caseId === selectedCase.id)}
                onDeleteLedger={handleDeleteLedger}
            />
        )}
      </div>
    );
}
