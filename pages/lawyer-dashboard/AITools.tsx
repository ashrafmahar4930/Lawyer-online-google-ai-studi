
import React, { useState } from 'react';
import { useAuth } from '../../App';
import { generateLegalDocument } from '../../services/geminiService';
import { useNavigate } from 'react-router-dom';

export default function AITools() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docType, setDocType] = useState('Legal Notice');
  const [docDetails, setDocDetails] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleGenerateDoc = async () => {
      if(!docDetails) return;
      setAiLoading(true);
      const res = await generateLegalDocument(docType, docDetails);
      setGeneratedDoc(res);
      setAiLoading(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 font-serif">Legal AI Assistant</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Drafting Assistant</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Document Type</label>
                            <select className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={docType} onChange={e => setDocType(e.target.value)}>
                                <option value="Legal Notice">Legal Notice</option>
                                <option value="Power of Attorney">Power of Attorney</option>
                                <option value="Lease Agreement">Lease Agreement</option>
                                <option value="Partnership Deed">Partnership Deed</option>
                                <option value="Affidavit">Affidavit</option>
                                <option value="Case Argument Summary">Case Argument Summary</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specific Details</label>
                            <textarea 
                                rows={6} 
                                className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                placeholder="Describe the parties involved, the dispute details, or the terms you want to include..."
                                value={docDetails}
                                onChange={e => setDocDetails(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleGenerateDoc}
                            disabled={aiLoading || !docDetails}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                        >
                            {aiLoading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                                    Thinking...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                    Generate Draft
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-blue-950 mb-2">How it works</h4>
                    <p className="text-sm text-blue-800 leading-relaxed opacity-80">Our AI uses advanced language models to generate professional legal drafts. Always review and edit the generated content to ensure it fits your specific legal requirements.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col min-h-[500px]">
                <div className="p-4 border-b bg-slate-50 rounded-t-2xl flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generated Draft</span>
                    {generatedDoc && (
                        <button 
                            onClick={() => { navigator.clipboard.writeText(generatedDoc); alert("Copied to clipboard!"); }}
                            className="text-xs text-blue-600 font-bold hover:underline"
                        >
                            Copy text
                        </button>
                    )}
                </div>
                <div className="p-6 flex-grow overflow-auto">
                    {generatedDoc ? (
                        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-serif leading-relaxed">
                            {generatedDoc}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                           <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           <p className="text-sm font-medium">Your draft will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
}
