import React, { useState, useEffect } from 'react';
import { Case, ImportantDate, CaseFile, LedgerEntry } from '../types';
import * as db from '../services/mockDataService';
import { compressImage } from '../utils/imageUtils';

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case;
  onUpdateCase: (updatedCase: Case) => void;
  onDeleteCase: (caseId: string) => void;
  lawyerId: string;
  ledgerEntries: LedgerEntry[];
  onDeleteLedger: (entryId: string) => void;
}

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({ isOpen, onClose, caseData, onUpdateCase, onDeleteCase, lawyerId, ledgerEntries, onDeleteLedger }) => {
  const [editedCase, setEditedCase] = useState<Case>(caseData);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newImportantDate, setNewImportantDate] = useState<Partial<ImportantDate>>({});

  useEffect(() => {
    setEditedCase(caseData);
  }, [caseData]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedCase(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.updateCase(editedCase);
      onUpdateCase(editedCase);
      alert("Case updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to save case:", error);
      alert("Failed to save case.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCase = async () => {
    if (window.confirm("Are you sure you want to permanently delete this case and all associated files and ledger entries? This cannot be undone.")) {
      try {
        await db.deleteCase(editedCase.id);
        onDeleteCase(editedCase.id);
        alert("Case deleted successfully.");
        onClose();
      } catch (error) {
        console.error("Failed to delete case:", error);
        alert("Failed to delete case.");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingFile(true);
      try {
        const originalFile = e.target.files[0];
        const compressedFile = await compressImage(originalFile, 1500, 1500, 0.85); // Moderate compression for case docs

        const path = `case-files/${lawyerId}/${editedCase.id}/${Date.now()}_${compressedFile.name}`;
        const url = await db.uploadFile(compressedFile, path); // No oldFileUrl for new case files

        const newFile: CaseFile = {
          id: `file_${Date.now()}`,
          name: originalFile.name,
          url: url,
          uploadedAt: new Date().toISOString(),
        };
        const updatedCase = { ...editedCase, caseFiles: [...editedCase.caseFiles, newFile] };
        setEditedCase(updatedCase); // Update local state
        await db.updateCase(updatedCase); // Persist immediately
        onUpdateCase(updatedCase); // Update parent state
        alert("File uploaded successfully!");
      } catch (error) {
        console.error("File upload failed:", error);
        alert("File upload failed.");
      } finally {
        setUploadingFile(false);
        e.target.value = ''; // Clear file input
      }
    }
  };

  const handleDeleteFile = async (fileToDelete: CaseFile) => {
    if (window.confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) {
      try {
        await db.deleteFile(fileToDelete.url);
        const updatedCase = { ...editedCase, caseFiles: editedCase.caseFiles.filter(f => f.id !== fileToDelete.id) };
        setEditedCase(updatedCase); // Update local state
        await db.updateCase(updatedCase); // Persist immediately
        onUpdateCase(updatedCase); // Update parent state
        alert("File deleted successfully!");
      } catch (error) {
        console.error("Failed to delete file:", error);
        alert("Failed to delete file.");
      }
    }
  };

  const handleAddImportantDate = () => {
    if (!newImportantDate.title || !newImportantDate.date) {
      alert("Please enter title and date for the important date.");
      return;
    }
    const dateToAdd: ImportantDate = {
      id: `date_${Date.now()}`,
      title: newImportantDate.title,
      date: newImportantDate.date,
      notes: newImportantDate.notes || '',
    };
    const updatedCase = { ...editedCase, importantDates: [...editedCase.importantDates, dateToAdd] };
    setEditedCase(updatedCase);
    setNewImportantDate({}); // Reset form
  };

  const handleDeleteImportantDate = (dateId: string) => {
    if (window.confirm("Are you sure you want to delete this important date?")) {
      const updatedCase = { ...editedCase, importantDates: editedCase.importantDates.filter(d => d.id !== dateId) };
      setEditedCase(updatedCase);
    }
  };

  // Sort important dates
  const sortedImportantDates = [...editedCase.importantDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-900">Edit Case: {caseData.caseTitle}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8 flex-grow">
          {/* General Case Details */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold text-xl mb-4 text-slate-800">General Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Case Title</label>
                <input type="text" name="caseTitle" value={editedCase.caseTitle} onChange={handleInputChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input type="text" name="clientName" value={editedCase.clientName} onChange={handleInputChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Court Name</label>
                <input type="text" name="courtName" value={editedCase.courtName} onChange={handleInputChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opposing Counsel / Party</label>
                <input type="text" name="opposingCounsel" value={editedCase.opposingCounsel || ''} onChange={handleInputChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Next Hearing Date</label>
                <input type="date" name="nextHearingDate" value={editedCase.nextHearingDate} onChange={handleInputChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Stage</label>
                <select name="stage" value={editedCase.stage} onChange={handleInputChange} className="w-full border p-2 rounded">
                  <option value="Filing">Filing</option>
                  <option value="Hearing">Hearing</option>
                  <option value="Evidence">Evidence</option>
                  <option value="Verdict">Verdict</option>
                  <option value="Appeal">Appeal</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Overall Case Status</label>
                <select name="status" value={editedCase.status} onChange={handleInputChange} className="w-full border p-2 rounded">
                  <option value="Open">Open</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Short Description / Summary</label>
                <textarea name="description" rows={2} value={editedCase.description || ''} onChange={handleInputChange} className="w-full border p-2 rounded" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Internal Notes</label>
                <textarea name="notes" rows={2} value={editedCase.notes || ''} onChange={handleInputChange} className="w-full border p-2 rounded" />
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Important Dates</h3>
            <div className="space-y-4 mb-6">
              {sortedImportantDates.length === 0 ? (
                <p className="text-slate-500 italic">No important dates added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {sortedImportantDates.map(date => (
                    <li key={date.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-slate-100">
                      <div>
                        <span className="font-semibold">{date.title}</span> - <span className="text-blue-600">{date.date}</span>
                        {date.notes && <p className="text-xs text-slate-600 italic">{date.notes}</p>}
                      </div>
                      <button onClick={() => handleDeleteImportantDate(date.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-lg mb-2">Add New Date</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Title (e.g., Next Hearing)" value={newImportantDate.title || ''} onChange={e => setNewImportantDate(prev => ({ ...prev, title: e.target.value }))} className="border p-2 rounded" />
                <input type="date" value={newImportantDate.date || ''} onChange={e => setNewImportantDate(prev => ({ ...prev, date: e.target.value }))} className="border p-2 rounded" />
                <input type="text" placeholder="Notes (optional)" value={newImportantDate.notes || ''} onChange={e => setNewImportantDate(prev => ({ ...prev, notes: e.target.value }))} className="border p-2 rounded" />
              </div>
              <button onClick={handleAddImportantDate} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Add Date</button>
            </div>
          </div>

          {/* Case Documents */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Case Documents</h3>
            <div className="space-y-4 mb-6">
              {editedCase.caseFiles.length === 0 ? (
                <p className="text-slate-500 italic">No documents uploaded for this case yet.</p>
              ) : (
                <ul className="space-y-2">
                  {editedCase.caseFiles.map(file => (
                    <li key={file.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-slate-100">
                      <div>
                        <a href={file.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">{file.name}</a>
                        <p className="text-xs text-slate-600">Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleDeleteFile(file)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-lg mb-2">Upload New Document</h4>
              <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700" />
              {uploadingFile && <div className="text-xs text-blue-600 mt-1">Uploading...</div>}
            </div>
          </div>

          {/* Ledger Entries for this Case */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Ledger Entries for This Case</h3>
            {ledgerEntries.length === 0 ? (
              <p className="text-slate-500 italic">No Ledger entries for this case yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-500 text-xs uppercase bg-white">
                    <tr>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">Paid</th>
                      <th className="text-right p-2 text-red-600">Remaining</th>
                      <th className="text-right p-2">Due Date</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map(e => (
                      <tr key={e.id} className="border-b last:border-0 bg-white">
                        <td className="p-2">{e.description}</td>
                        <td className="text-right p-2">{e.totalAmount}</td>
                        <td className="text-right p-2">{e.paidAmount}</td>
                        <td className="text-right p-2 text-red-600 font-bold">{e.remainingAmount}</td>
                        <td className="text-right p-2">{e.nextPaymentDueDate}</td>
                        <td className="text-right p-2">
                          <button onClick={() => onDeleteLedger(e.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4 text-sm text-slate-600">To add new Ledger entries, please go to the 'Ledger (Financials)' tab.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t flex justify-between items-center bg-slate-100">
          <div>
            <button onClick={handleDeleteCase} className="bg-red-500 text-white px-5 py-2 rounded-md hover:bg-red-600 mr-4" disabled={isSaving}>
              Delete Case
            </button>
            <button onClick={onClose} className="bg-slate-200 text-slate-700 px-5 py-2 rounded-md hover:bg-slate-300">
              Close
            </button>
          </div>
          <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;