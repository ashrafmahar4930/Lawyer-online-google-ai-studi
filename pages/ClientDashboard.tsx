import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getClientCases, getCaseLedger } from '../services/mockDataService';
import { Case, LedgerEntry } from '../types';
import { Calendar, CreditCard, FolderOpen, Video } from 'lucide-react';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [ledgers, setLedgers] = useState<Record<string, LedgerEntry[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const myCases = await getClientCases(user.uid);
        setCases(myCases);
        
        const ledgerMap: Record<string, LedgerEntry[]> = {};
        for (const c of myCases) {
            const caseLedger = await getCaseLedger(c.id);
            ledgerMap[c.id] = caseLedger;
        }
        setLedgers(ledgerMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif text-slate-900">Client Dashboard</h1>
        <div className="relative cursor-pointer">
            <svg className="w-8 h-8 text-slate-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        </div>
      </div>

      {/* Instant Video Consultation Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-indigo-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px]">P2P Feature</span>
          <h2 className="text-xl font-bold font-serif">Instant secure Video Consultation</h2>
          <p className="text-indigo-200 text-sm leading-relaxed">Join a fully encrypted, browser-based peer-to-peer audio and video session with your legal advisor instantly. No installations or downloads required.</p>
        </div>
        <button 
          onClick={() => navigate('/meeting/lobby')}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow transition-transform hover:scale-105 active:scale-95 text-xs uppercase tracking-widest shrink-0 flex items-center gap-2"
        >
          <Video className="w-4 h-4" /> Enter Meeting Lobby
        </button>
      </div>

      <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 font-serif border-b pb-2">My Active Cases & Billing Ledgers</h2>
          
          {loading ? (
             <div className="flex justify-center p-8">
                 <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
             </div>
          ) : cases.length === 0 ? (
             <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
                 <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p className="font-semibold">No active cases assigned to your account yet.</p>
                 <p className="text-sm mt-1">When a lawyer creates a case for you and records billing entries, they will appear here securely.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {cases.map(c => (
                     <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                         <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-start">
                             <div>
                                 <h3 className="font-bold text-slate-800 line-clamp-1" title={c.caseTitle}>{c.caseTitle}</h3>
                                 <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                     <FolderOpen className="w-3 h-3" /> {c.courtName} ({c.type})
                                 </p>
                             </div>
                             <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide shrink-0 ${
                                 c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                             }`}>
                                 {c.status}
                             </span>
                         </div>
                         
                         <div className="p-4 flex-grow">
                             <div className="flex items-center gap-2 text-sm text-slate-700 mb-4 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                                 <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                                 <div>
                                     <span className="font-semibold block text-xs uppercase tracking-wider text-blue-800">Next Hearing</span>
                                     <span>{c.nextHearingDate || 'Not scheduled'}</span>
                                 </div>
                             </div>

                             <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b pb-1">Billing Ledger (Ledger)</h4>
                             
                             {!ledgers[c.id] || ledgers[c.id].length === 0 ? (
                                 <p className="text-xs text-slate-400 italic">No ledger entries recorded yet.</p>
                             ) : (
                                 <div className="space-y-3">
                                     {ledgers[c.id].map(k => (
                                         <div key={k.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                                             <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                                                 <CreditCard className="w-4 h-4" />
                                             </div>
                                             <div className="w-full">
                                                 <div className="flex justify-between items-start mb-1">
                                                     <p className="text-xs font-bold text-slate-700">{k.description}</p>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase">Agreed Total</span>
                                                        <span className="font-semibold">Rs. {k.totalAmount}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] uppercase">Paid</span>
                                                        <span className="font-semibold text-emerald-600">Rs. {k.paidAmount}</span>
                                                    </div>
                                                 </div>
                                                 {k.remainingAmount > 0 && (
                                                     <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex justify-between items-center">
                                                         <div>
                                                             <span className="text-red-400 block text-[10px] uppercase">Remaining Due</span>
                                                             <span className="font-bold text-red-600">Rs. {k.remainingAmount}</span>
                                                         </div>
                                                         {k.nextPaymentDueDate && (
                                                            <div className="text-right">
                                                                <span className="text-amber-500 block text-[10px] uppercase">Due By</span>
                                                                <span className="font-medium text-amber-700">{k.nextPaymentDueDate}</span>
                                                            </div>
                                                         )}
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>
                 ))}
             </div>
          )}
      </div>
    </div>
  );
}