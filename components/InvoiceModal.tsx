import React, { useState, useEffect } from 'react';
import { X, Download, Eye, FileText, Settings, CreditCard, Award, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Case, LedgerEntry, LawyerProfile } from '../types';
import * as db from '../services/mockDataService';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: LedgerEntry;
  caseData: Case;
}

export default function InvoiceModal({ isOpen, onClose, entry, caseData }: InvoiceModalProps) {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Customization states
  const [chamberTitle, setChamberTitle] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [licenseInfo, setLicenseInfo] = useState('');
  const [barCouncil, setBarCouncil] = useState('');
  
  // Invoice items
  const [taxRate, setTaxRate] = useState<number>(0); // e.g. 5% PNT
  const [discount, setDiscount] = useState<number>(0); // discount in Rs
  
  // Additional items to customize details
  const [extraItems, setExtraItems] = useState<{ desc: string; amount: number }[]>([]);
  const [newExtraDesc, setNewExtraDesc] = useState('');
  const [newExtraAmount, setNewExtraAmount] = useState<number | ''>('');

  // Payment Bank detail states
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [bankName, setBankName] = useState('Habib Bank Limited (HBL)');
  const [accountTitle, setAccountTitle] = useState('Advocacy Chamber G-Accounts');
  const [iban, setIban] = useState('PK85 HABB 0012 3456 7890 1234');
  
  // Display Options
  const [showStamp, setShowStamp] = useState(true);
  const [customNotes, setCustomNotes] = useState('Fees are pre-agreed in the litigation retainership agreement and are non-refundable. Shukriya!');

  useEffect(() => {
    if (isOpen && caseData) {
      loadLawyerProfile();
    }
  }, [isOpen, caseData]);

  const loadLawyerProfile = async () => {
    setLoading(true);
    try {
      const p = await db.getLawyerProfile(caseData.lawyerId);
      if (p) {
        setProfile(p);
        setChamberTitle(`CHAMBERS OF ${p.fullName.toUpperCase()}`);
        setOfficeAddress(p.officeAddress || p.city || 'Central Legal District');
        setContactMobile(p.contactMobile || '+1 555 0199');
        setContactEmail(p.contactEmail || p.uid + '@lawyeronline.live');
        setLicenseInfo(p.licenseNumber || 'ROLL-2026-F98');
        setBarCouncil(p.barCouncilName || 'High Court Bar Association');
        setAccountTitle(`${p.fullName} Legal Chamber`);
      } else {
        setChamberTitle('SUPREME LEGAL ADVOCACY CHAMBERS');
        setOfficeAddress('Central Courts Building, Metro District');
        setContactMobile('+1 555 0199');
        setContactEmail('advocate@example.com');
        setLicenseInfo('HCB-89591');
        setBarCouncil('National Bar Association');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalExtra = extraItems.reduce((sum, item) => sum + item.amount, 0);
  const subTotal = entry.totalAmount + totalExtra;
  const taxAmount = Math.round((subTotal * taxRate) / 100);
  const totalPaid = entry.paidAmount;
  const grandTotal = subTotal + taxAmount - discount;
  const netDueBalance = grandTotal - totalPaid;

  const handleAddExtra = () => {
    if (!newExtraDesc || !newExtraAmount) return;
    setExtraItems([...extraItems, { desc: newExtraDesc, amount: Number(newExtraAmount) }]);
    setNewExtraDesc('');
    setNewExtraAmount('');
  };

  const handleRemoveExtra = (idx: number) => {
    setExtraItems(extraItems.filter((_, i) => i !== idx));
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Double Borders (Judicial Letterhead theme)
    doc.setDrawColor(30, 41, 59); // Deep Slate
    doc.setLineWidth(0.4);
    doc.rect(5, 5, 200, 287); // Primary margin border
    doc.setDrawColor(194, 120, 3); // Gold inner accent
    doc.setLineWidth(0.15);
    doc.rect(6.2, 6.2, 197.6, 284.6);

    // 2. Head Band Banner (Deep Slate Blue)
    doc.setFillColor(15, 23, 42); // slate - 900
    doc.rect(10, 10, 190, 42, 'F');
    doc.setFillColor(194, 120, 3); // Gold bottom strip
    doc.rect(10, 10, 190, 3.2, 'F');

    // 3. Chambers Letterhead Info
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14.5);
    doc.text(chamberTitle || 'SUPREME ADVOCACY CHAMBERS', 15, 21);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(212, 163, 89); // Golden yellow accent
    doc.text(`${profile?.title || 'Advocate High Court'} - Specialty in ${profile?.specialty || 'Civil & Criminal Litigation'}`, 15, 26);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240); // slate-200
    doc.text(`Chamber Address: ${officeAddress}`, 15, 31);
    doc.text(`Mobile Support: ${contactMobile}  |  Email: ${contactEmail}`, 15, 36);
    doc.text(`Enrollment Roll: ${licenseInfo}  •  Affiliated body: ${barCouncil}`, 15, 41);

    // 4. Client and Invoice Target details (Bill section banner)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(10, 58, 190, 28, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(10, 58, 190, 28);

    // Left block client details
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text("BILLING TARGET (CLIENT):", 14, 64);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(caseData.clientName.toUpperCase(), 14, 70);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Case ID / Title:  ${caseData.caseTitle}`, 14, 75);
    doc.text(`Hearing Court:   ${caseData.courtName} (Stage: ${caseData.stage})`, 14, 80);

    // Right block invoice metadata
    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text("INVOICE METRIC:", 120, 64);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Statement ID:    INV-${entry.id.substring(5, 13).toUpperCase()}`, 120, 69);
    doc.text(`Date Issued:     ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`, 120, 73);
    doc.text(`Due Target Date: ${entry.nextPaymentDueDate || 'Payable upon Presentation'}`, 120, 77);

    // Status label color coding
    if (netDueBalance <= 0) {
      doc.setFillColor(220, 252, 231); // light green bg
      doc.setTextColor(21, 128, 61); // dark green
      doc.rect(120, 79.5, 34, 4.5, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.text("STATUS: FULLY RESOLVED", 121.5, 83);
    } else {
      doc.setFillColor(254, 243, 199); // light amber bg
      doc.setTextColor(180, 83, 9); // dark amber
      doc.rect(120, 79.5, 34, 4.5, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.text("STATUS: OUTSTANDING DUE", 121.5, 83);
    }

    // 5. Itemized Table of legal service
    doc.setFillColor(30, 41, 59); // headers slate background
    doc.rect(10, 92, 190, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text("DESCRIPTION OF CLIENT SERVICE", 14, 97.2);
    doc.text("ORIGINAL (RS)", 105, 97.2);
    doc.text("PAID CR (RS)", 140, 97.2);
    doc.text("NET DEBIT (RS)", 172, 97.2);

    // Populate rows
    let currentY = 106;
    doc.setTextColor(51, 65, 85);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);

    // Primary row
    doc.text(entry.description, 14, currentY);
    doc.text(`Rs. ${entry.totalAmount.toLocaleString()}`, 105, currentY);
    doc.text(`Rs. ${entry.paidAmount.toLocaleString()}`, 140, currentY);
    doc.text(`Rs. ${(entry.totalAmount - entry.paidAmount).toLocaleString()}`, 172, currentY);

    // Extra custom rows
    extraItems.forEach((item) => {
      currentY += 7;
      doc.line(10, currentY - 5, 200, currentY - 5);
      doc.text(item.desc, 14, currentY);
      doc.text(`Rs. ${item.amount.toLocaleString()}`, 105, currentY);
      doc.text('Rs. 0', 140, currentY);
      doc.text(`Rs. ${item.amount.toLocaleString()}`, 172, currentY);
    });

    currentY += 6;
    doc.setDrawColor(148, 163, 184); // slate-400 double line divider
    doc.setLineWidth(0.3);
    doc.line(10, currentY, 200, currentY);
    doc.line(10, currentY + 0.8, 200, currentY + 0.8);

    // 6. Bank detail box layout
    let detailSectionY = currentY + 8;
    if (showBankDetails) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(10, detailSectionY, 95, 28, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.15);
      doc.rect(10, detailSectionY, 95, 28);

      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text("CHAMBERS INSTANT DEPOSIT ACC:", 14, detailSectionY + 5.5);

      doc.setTextColor(71, 85, 105);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Bank Name:    ${bankName}`, 14, detailSectionY + 11);
      doc.text(`Acct Title:       ${accountTitle}`, 14, detailSectionY + 16);
      doc.text(`IBAN Code:   ${iban}`, 14, detailSectionY + 21);
    }

    // 7. Balance computation blocks (Right aligned)
    let calcX = 115;
    let calcY = detailSectionY + 5;
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);

    doc.text("Professional Subtotal:", calcX, calcY);
    doc.text(`Rs. ${subTotal.toLocaleString()}`, 172, calcY);

    if (taxRate > 0) {
      calcY += 6;
      doc.text(`Duties / Legal Tax (${taxRate}%):`, calcX, calcY);
      doc.text(`Rs. ${taxAmount.toLocaleString()}`, 172, calcY);
    }

    if (discount > 0) {
      calcY += 6;
      doc.text("Relief / Fee Waiver:", calcX, calcY);
      doc.text(`- Rs. ${discount.toLocaleString()}`, 172, calcY);
    }

    calcY += 6;
    doc.setFillColor(241, 245, 249); // slate-100 highlighted net banner
    doc.rect(calcX, calcY - 4.2, 85, 8.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(calcX, calcY - 4.2, 85, 8.5);

    doc.setTextColor(15, 23, 42); // deep slate
    doc.setFont('Helvetica', 'bold');
    doc.text("NET GRAND COMPUTE:", calcX + 3, calcY + 1.2);
    doc.text(`Rs. ${grandTotal.toLocaleString()}`, 172, calcY + 1.2);

    calcY += 10;
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.text("Total Paid Credits (CR):", calcX, calcY);
    doc.setTextColor(21, 128, 61);
    doc.text(`Rs. ${totalPaid.toLocaleString()}`, 172, calcY);

    calcY += 6;
    doc.setFillColor(254, 242, 242); // outstanding light red highlight
    doc.rect(calcX, calcY - 4.2, 85, 8.5, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.rect(calcX, calcY - 4.2, 85, 8.5);

    doc.setTextColor(220, 38, 38); // Red
    doc.setFont('Helvetica', 'bold');
    doc.text("TOTAL OUTSTANDING DUE:", calcX + 3, calcY + 1.2);
    doc.text(`Rs. ${netDueBalance.toLocaleString()}`, 172, calcY + 1.2);

    // 8. Judicial Seal and Stamp representation
    let sealY = detailSectionY + 45;
    if (showStamp) {
      // Draw premium royal ink-blue stamp circle
      doc.setDrawColor(30, 64, 175); // stamp ink blue
      doc.setLineWidth(0.4);
      doc.circle(165, sealY + 12, 11);
      doc.circle(165, sealY + 12, 10);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(4.5);
      doc.setTextColor(30, 64, 175);
      doc.text("LAWYERONLINE", 154.5, sealY + 10.5);
      doc.text("VERIFIED ADVOCATE", 151, sealY + 13);
      doc.text("PRACTICE STAMP", 153.5, sealY + 15.5);

      // Digital signatures lines representation
      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.2);
      doc.line(110, sealY + 12, 145, sealY + 12);
      
      doc.setTextColor(71, 85, 105);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.text("Issuer Signatory / Senior Advocate", 110, sealY + 16);

      doc.setFont('Times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(profile?.fullName || 'Advocate Seals', 112, sealY + 10);
    }

    // 9. Footnote instructions
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text("PROFESSIONAL TERMS & MEMORANDUM OF COUNSEL:", 10, sealY + 34);

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7);
    doc.text(`1. ${customNotes}`, 10, sealY + 38);
    doc.text("2. Delayed retainers are subject to judicial rescheduling at the advocate's discretion under CPC protocol guidelines.", 10, sealY + 42);
    doc.text("3. This dynamic financial file ledger represents real time synchronized entries secure on corporate cloud. No physical signature mandated.", 10, sealY + 46);

    // Save with precise file name styling
    const sanitizeName = caseData.clientName.toLowerCase().replace(/\s+/g, '_');
    doc.save(`invoice_${sanitizeName}_${entry.id.substring(5, 12)}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-100 flex flex-col lg:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Left: Customization Settings */}
        <div className="w-full lg:w-1/2 p-6 border-r border-slate-100 bg-slate-50 overflow-y-auto max-h-[85vh]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-900 text-white rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Pdf Settings & Custom Form</h2>
                <p className="text-xs text-slate-500">Invoice details personalise karein</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition lg:hidden cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Judicial Title Letterhead */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                ⚖️ Chamber Title (Letterhead Core)
              </label>
              <input
                type="text"
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none font-semibold"
                value={chamberTitle}
                onChange={(e) => setChamberTitle(e.target.value)}
              />
            </div>

            {/* Address and Contacts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  📞 Mobile Number
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                  value={contactMobile}
                  onChange={(e) => setContactMobile(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  ✉️ Chamber Email
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                📍 Chamber Physical Address
              </label>
              <input
                type="text"
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  🛡️ Enrollment Roll / Lic No
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                  value={licenseInfo}
                  onChange={(e) => setLicenseInfo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  🏛️ Bar Council Affiliation
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                  value={barCouncil}
                  onChange={(e) => setBarCouncil(e.target.value)}
                />
              </div>
            </div>

            {/* Tax and Waiver customization */}
            <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl">
              <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Duties & Waiver Relief
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Tax / Duties (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 5"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                    value={taxRate || ''}
                    onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Waiver Discount (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1000"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  />
                </div>
              </div>
            </div>

            {/* Extra Billing Items */}
            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                ➕ Add Other Case Expenses
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Drafting Stamp, Transport"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                  value={newExtraDesc}
                  onChange={(e) => setNewExtraDesc(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Amount (Rs)"
                  className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                  value={newExtraAmount}
                  onChange={(e) => setNewExtraAmount(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={handleAddExtra}
                  className="px-3 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition cursor-pointer"
                >
                  Add
                </button>
              </div>

              {extraItems.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1 border-t border-slate-100">
                  {extraItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                      <span className="font-medium text-slate-600">{item.desc}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">Rs. {item.amount}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtra(idx)}
                          className="text-red-500 hover:text-red-700 font-bold px-1 rounded hover:bg-red-50 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Bank transfer details */}
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Bank Deposit Instructions
                </h4>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded text-blue-900 border-slate-200 focus:ring-blue-900 cursor-pointer"
                  checked={showBankDetails}
                  onChange={(e) => setShowBankDetails(e.target.checked)}
                />
              </div>

              {showBankDetails && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-bold">Bank Name</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-600 outline-none"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase font-bold">Account Title</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-600 outline-none"
                        value={accountTitle}
                        onChange={(e) => setAccountTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase font-bold">IBAN/Account Code</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-600 outline-none"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Note & Affix Stamp */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-900 border-slate-200 rounded cursor-pointer"
                    checked={showStamp}
                    onChange={(e) => setShowStamp(e.target.checked)}
                  />
                  <span>Affix Advocate Seal & Round Stamp mock</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  📝 Custom Term Note (Footer text)
                </label>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none h-16 resize-none"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live UI Visual Preview */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 uppercase">
              <Eye className="w-4 h-4 text-slate-500" /> Digital Statement Preview
            </h3>
            <button onClick={onClose} className="hidden lg:block p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive virtual mockup sheet */}
          <div className="flex-1 bg-white border-2 border-slate-200 rounded-xl p-5 shadow-inner text-slate-800 scale-100 origin-top text-left font-sans select-none overflow-y-auto max-h-[60vh] text-[11px] leading-normal">
            
            {/* virtual double borders */}
            <div className="border border-slate-300 p-2 lg:p-4 rounded h-full bg-white flex flex-col justify-between relative overflow-hidden">
              
              {/* Gold ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>

              {/* Virtual Header */}
              <div className="bg-slate-900 text-white p-3 rounded-lg mb-4 text-left shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 float-right">
                  CHAMBERS
                </span>
                <h4 className="text-[12px] font-black tracking-tight leading-none mb-1 text-white">
                  {chamberTitle || 'SUPREME LEGAL PRACTICE'}
                </h4>
                <p className="text-[9px] text-amber-200 font-medium mb-1 truncate">
                  {profile?.title || 'Advocate High Court'} — specialty in Civil litigation
                </p>
                <div className="text-[8px] text-slate-300 space-y-0.5 mt-2 pt-1 border-t border-white/10 font-sans">
                  <p>📍 Address: {officeAddress}</p>
                  <p>📞 Phone: {contactMobile} | ✉️ Support: {contactEmail}</p>
                  <p>🎓 Credentials: {licenseInfo} | {barCouncil}</p>
                </div>
              </div>

              {/* Bill Target & Meta columns */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 grid grid-cols-2 gap-2 mb-4">
                <div>
                  <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1">BILL TO CLIENT</p>
                  <p className="font-extrabold text-slate-800 text-[11px] leading-tight">{caseData.clientName}</p>
                  <p className="text-slate-500 text-[8px] mt-1 space-y-0.5 leading-normal">
                    <span>Case: {caseData.caseTitle}</span> <br/>
                    <span>Court: {caseData.courtName}</span>
                  </p>
                </div>
                <div className="text-right border-l border-slate-200/60 pl-3">
                  <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">BILLING DETAILS</p>
                  <p className="text-slate-700 text-[8px]">INV-ID: <span className="font-mono text-[9px] font-bold">INV-{entry.id.substring(5, 12).toUpperCase()}</span></p>
                  <p className="text-slate-500 text-[8px] mt-0.5">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-slate-500 text-[8px]">Due: <span className="text-slate-700 font-bold">{entry.nextPaymentDueDate || 'Presentation'}</span></p>
                  
                  <span className={`inline-block text-[7px] font-bold px-1.5 py-0.5 rounded mt-1 ${netDueBalance <= 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {netDueBalance <= 0 ? 'STATUS: PAID' : 'STATUS: REMAINING DUE'}
                  </span>
                </div>
              </div>

              {/* Bill Tables preview */}
              <div className="mb-4">
                <table className="w-full text-left text-[9px]">
                  <thead>
                    <tr className="bg-slate-800 text-white text-[8px] uppercase font-bold tracking-wider">
                      <th className="p-1 px-2 rounded-l">Service Details</th>
                      <th className="p-1 text-right">Fee (Rs)</th>
                      <th className="p-1 text-right">Paid CR (Rs)</th>
                      <th className="p-1 text-right px-2 rounded-r">Net (Rs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-slate-50">
                      <td className="p-1.5 px-2 font-semibold text-slate-800">{entry.description}</td>
                      <td className="p-1.5 text-right">{entry.totalAmount.toLocaleString()}</td>
                      <td className="p-1.5 text-right text-green-600">{entry.paidAmount.toLocaleString()}</td>
                      <td className="p-1.5 text-right text-red-600 px-2 font-bold">{(entry.totalAmount - entry.paidAmount).toLocaleString()}</td>
                    </tr>
                    {extraItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5 px-2 font-normal text-slate-500">{item.desc} (Custom Expense)</td>
                        <td className="p-1.5 text-right">{item.amount.toLocaleString()}</td>
                        <td className="p-1.5 text-right text-slate-400">0</td>
                        <td className="p-1.5 text-right text-red-600 px-2 font-semibold">{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grid 2 footer columns */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 mt-auto">
                
                {/* Bank credentials instruction card preview */}
                <div>
                  {showBankDetails ? (
                    <div className="bg-slate-50 border border-slate-100 rounded p-2 text-[8px] leading-relaxed text-slate-600">
                      <p className="font-bold text-slate-800 mb-1 flex items-center gap-0.5">💰 Depositing Guide:</p>
                      <p>Bank: {bankName}</p>
                      <p className="truncate">Title: {accountTitle}</p>
                      <p className="font-mono text-slate-700 truncate">IBAN: {iban}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-[8.5px]">No bank instructions added.</p>
                  )}
                </div>

                {/* Computational results billing balance */}
                <div className="space-y-1 text-right pr-2 text-[8.5px] font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Subtotal:</span>
                    <span className="font-bold text-slate-800">Rs. {subTotal.toLocaleString()}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duties ({taxRate}%):</span>
                      <span className="font-semibold text-slate-800">Rs. {taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Waiver Discount:</span>
                      <span>- Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 border-t border-slate-200 mt-1 pt-1 font-extrabold text-[9px]">
                    <span>Grand Total Bills:</span>
                    <span>Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid Credits:</span>
                    <span>Rs. {totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600 bg-red-50 p-1 rounded font-black text-[9.5px]">
                    <span>Pending Due Amount:</span>
                    <span>Rs. {netDueBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Lawyer stamp seal layout simulated */}
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-150">
                <div className="text-[7.5px] italic text-slate-400 max-w-[65%] leading-tight text-left">
                  Note: {customNotes}
                </div>
                
                {showStamp ? (
                  <div className="relative w-16 h-16 flex items-center justify-center border border-blue-600/40 rounded-full scale-90 mb-1 shrink-0 bg-blue-50/20">
                    <div className="absolute inset-0.5 border border-dashed border-blue-600 rounded-full flex flex-col justify-center items-center text-center text-[4px] text-blue-600 font-extrabold leading-tight">
                      <span>LAWYERONLINE</span>
                      <span className="text-[3px]">VERIFIED</span>
                      <span>STAMP</span>
                    </div>
                    {/* Fake signature script */}
                    <span className="absolute -top-1 left-2 font-serif text-[11px] font-bold text-slate-900/40 select-none italic transform -rotate-12 select-none tracking-widest leading-none pointer-events-none">
                      {profile?.fullName.substring(0, 10) || 'Advocate'}
                    </span>
                  </div>
                ) : (
                  <div className="h-10 text-[8px] flex items-end font-bold text-slate-400">
                    ___________________
                    <p className="text-[6.5px] text-right">Advocate Sign</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Download Action Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 rounded-xl mt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Ready to export</span>
              <p className="text-xs font-bold text-slate-700">Client Statement document compiles instantly</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={generatePDF}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF Invoice
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
