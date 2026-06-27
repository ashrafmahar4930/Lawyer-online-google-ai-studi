
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Case, LedgerEntry } from '../../types';
import * as db from '../../services/mockDataService';
import { useNavigate } from 'react-router-dom';
import InvoiceModal from '../../components/InvoiceModal';

export default function Ledger() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [newLedger, setNewLedger] = useState<Partial<LedgerEntry>>({});

  const [selectedLedger, setSelectedLedger] = useState<LedgerEntry | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Editing states
  const [editingLedger, setEditingLedger] = useState<LedgerEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedTotal, setEditedTotal] = useState(0);
  const [editedPaid, setEditedPaid] = useState(0);
  const [editedDesc, setEditedDesc] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');

  const handleEditLedgerClick = (entry: LedgerEntry) => {
    setEditingLedger(entry);
    setEditedDesc(entry.description);
    setEditedTotal(entry.totalAmount);
    setEditedPaid(entry.paidAmount);
    setEditedDueDate(entry.nextPaymentDueDate || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLedger) return;

    const remaining = Number(editedTotal) - Number(editedPaid);
    const updated: LedgerEntry = {
      ...editingLedger,
      description: editedDesc,
      totalAmount: Number(editedTotal),
      paidAmount: Number(editedPaid),
      remainingAmount: remaining,
      nextPaymentDueDate: editedDueDate,
    };

    try {
      await db.addLedgerEntry(updated); // setDoc overwrites
      setLedgerEntries(prev => prev.map(k => k.id === updated.id ? updated : k));
      setIsEditModalOpen(false);
      setEditingLedger(null);
      alert("Ledger transaction updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update ledger transaction.");
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
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

  const handleAddLedger = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newLedger.caseId || !newLedger.totalAmount) return;
      
      const entry: LedgerEntry = {
          id: `ledger_${Date.now()}`,
          caseId: newLedger.caseId,
          totalAmount: Number(newLedger.totalAmount),
          paidAmount: Number(newLedger.paidAmount || 0),
          remainingAmount: Number(newLedger.totalAmount) - Number(newLedger.paidAmount || 0),
          nextPaymentDueDate: newLedger.nextPaymentDueDate || '',
          description: newLedger.description || 'Legal Fees'
      };
      await db.addLedgerEntry(entry);
      setLedgerEntries([...ledgerEntries, entry]);
      setNewLedger({});
      alert("Ledger entry added!");
  };

  const handleDeleteLedger = async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this Ledger entry?")) {
        await db.deleteLedgerEntry(entryId);
        setLedgerEntries(prev => prev.filter(k => k.id !== entryId));
    }
  };

  if (!user) return null;

  const totalReceivable = ledgerEntries.reduce((sum, entry) => sum + entry.remainingAmount, 0);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-slate-800 font-serif">Financial Ledger</h1>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center shadow-sm">
               <div className="bg-orange-500 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <div>
                  <p className="text-xs font-bold text-orange-600 uppercase">Total Receivable</p>
                  <p className="text-2xl font-black text-orange-700">Rs. {totalReceivable.toLocaleString()}</p>
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 sticky top-20">
                    <h3 className="font-bold text-xl mb-4 text-slate-800">New Transaction</h3>
                    <form onSubmit={handleAddLedger} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Case</label>
                            <select className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newLedger.caseId || ''} onChange={e => setNewLedger({...newLedger, caseId: e.target.value})} required>
                                <option value="">Select Case</option>
                                {cases.map(c => <option key={c.id} value={c.id}>{c.caseTitle} ({c.clientName})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fee Description</label>
                            <input placeholder="e.g. Filing Fee, Consultation" className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newLedger.description || ''} onChange={e => setNewLedger({...newLedger, description: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total (Rs)</label>
                                <input type="number" placeholder="0" className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newLedger.totalAmount || ''} onChange={e => setNewLedger({...newLedger, totalAmount: Number(e.target.value)})} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paid (Rs)</label>
                                <input type="number" placeholder="0" className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newLedger.paidAmount || ''} onChange={e => setNewLedger({...newLedger, paidAmount: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Due Date</label>
                            <input type="date" className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newLedger.nextPaymentDueDate || ''} onChange={e => setNewLedger({...newLedger, nextPaymentDueDate: e.target.value})} />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg active:scale-95">Record Transaction</button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
                {cases.length > 0 ? cases.map(c => {
                    const entries = ledgerEntries.filter(k => k.caseId === c.id);
                    if(entries.length === 0) return null;
                    
                    const caseRemaining = entries.reduce((sum, e) => sum + e.remainingAmount, 0);

                    return (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-slate-800">{c.caseTitle}</h4>
                                    <p className="text-xs text-slate-500">Client: {c.clientName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Case Balance</p>
                                    <p className="font-bold text-red-600">Rs. {caseRemaining.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-slate-400 text-[10px] uppercase tracking-wider bg-slate-50/50">
                                        <tr>
                                            <th className="text-left py-3 px-6">Description</th>
                                            <th className="text-right py-3 px-2">Total</th>
                                            <th className="text-right py-3 px-2 text-green-600">Paid</th>
                                            <th className="text-right py-3 px-2 text-red-600">Remaining</th>
                                            <th className="text-right py-3 px-6 text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {entries.map(e => (
                                            <tr key={e.id} className="hover:bg-slate-50/50 transition font-medium">
                                                <td className="py-4 px-6 text-slate-700">{e.description}</td>
                                                <td className="text-right py-4 px-2">Rs. {e.totalAmount}</td>
                                                <td className="text-right py-4 px-2 text-green-600">Rs. {e.paidAmount}</td>
                                                <td className="text-right py-4 px-2 text-red-600 font-bold">Rs. {e.remainingAmount}</td>
                                                <td className="text-right py-4 px-6">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedLedger(e);
                                                                setSelectedCase(c);
                                                                setIsInvoiceModalOpen(true);
                                                            }} 
                                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-55/10 p-1.5 rounded-lg transition cursor-pointer"
                                                            title="Generate PDF Invoice"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEditLedgerClick(e)}
                                                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1.5 rounded-lg transition cursor-pointer"
                                                            title="Edit / Record Payment"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleDeleteLedger(e.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer" title="Delete record">
                                                            <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 3h7" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }) : (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
                        <h3 className="text-lg font-bold text-slate-700">No transactions recorded</h3>
                        <p className="text-slate-500 text-sm">Use the form to record your first fee entry.</p>
                    </div>
                )}
                {ledgerEntries.length === 0 && cases.length > 0 && (
                     <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
                        <h3 className="text-lg font-bold text-slate-700">No transactions recorded</h3>
                        <p className="text-slate-500 text-sm">Use the form to record your first fee entry.</p>
                    </div>
                )}
            </div>
        </div>

        {selectedLedger && selectedCase && (
            <InvoiceModal 
                isOpen={isInvoiceModalOpen}
                onClose={() => {
                    setIsInvoiceModalOpen(false);
                    setSelectedLedger(null);
                    setSelectedCase(null);
                }}
                entry={selectedLedger}
                caseData={selectedCase}
            />
        )}

        {isEditModalOpen && editingLedger && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b">
                        <h3 className="font-bold text-xl text-slate-800 font-serif">Update Transaction</h3>
                        <button 
                            onClick={() => { setIsEditModalOpen(false); setEditingLedger(null); }}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form onSubmit={handleUpdateLedger} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fee Description</label>
                            <input 
                                type="text"
                                className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editedDesc}
                                onChange={e => setEditedDesc(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total (Rs)</label>
                                <input 
                                    type="number"
                                    className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editedTotal}
                                    onChange={e => setEditedTotal(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paid (Rs)</label>
                                <input 
                                    type="number"
                                    className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editedPaid}
                                    onChange={e => setEditedPaid(Number(e.target.value))}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Due Date</label>
                            <input 
                                type="date"
                                className="w-full border-slate-200 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editedDueDate}
                                onChange={e => setEditedDueDate(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button 
                                type="button"
                                onClick={() => { setIsEditModalOpen(false); setEditingLedger(null); }}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition text-center text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition text-center text-sm cursor-pointer shadow-lg animate-pulse"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    );
}
