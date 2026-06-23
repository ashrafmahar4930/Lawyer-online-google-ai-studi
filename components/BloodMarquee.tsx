import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getActiveBloodAppeals } from '../services/mockDataService';
import { BloodAppeal } from '../types';
import { ChevronLeft, ChevronRight, Phone, Heart, MapPin, Hospital, Clipboard, X, Droplet, Share2 } from 'lucide-react';

export default function BloodMarquee() {
  const [appeals, setAppeals] = useState<BloodAppeal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAppeal, setSelectedAppeal] = useState<BloodAppeal | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const getShareInfo = (appeal: BloodAppeal) => {
    const shareUrl = `${window.location.origin}/blood-donation?appealId=${appeal.id}`;
    const shareText = `🩸 EMERGENCY BLOOD APPEAL (خون کی ارجنٹ اپیل) 🩸

Patient: ${appeal.patientName} (مریض کا نام)
Blood Group Required: ${appeal.bloodGroup} (خون کا گروپ)
Hospital: ${appeal.hospital} (ہسپتال کا نام)
Location: ${appeal.city}, ${appeal.country} (مقام)
Contact Mobile: ${appeal.mobile} (موبائل نمبر)

🙏 Please coordinate or share to save a life! (خون عطیہ کر کے یا شیئر کر کے ایک قیمتی جان بچائیں!)

🔗 Complete Appeal Info & Active Verification Check (تصدیق شدہ لنک):
👉 ${shareUrl}`;
    return { shareUrl, shareText };
  };

  const handleShareClick = (e: React.MouseEvent, appeal: BloodAppeal) => {
    e.stopPropagation();
    if (activeShareId === appeal.id) {
      setActiveShareId(null);
    } else {
      setActiveShareId(appeal.id);
    }
  };

  const handleSocialShare = (type: 'whatsapp' | 'facebook' | 'twitter' | 'copy', appeal: BloodAppeal, e: React.MouseEvent) => {
    e.stopPropagation();
    const { shareUrl, shareText } = getShareInfo(appeal);

    if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Emergency Blood Appeal: Patient ${appeal.patientName} requires ${appeal.bloodGroup} at ${appeal.hospital}. Help save a life!`)}`, '_blank');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const data = await getActiveBloodAppeals();
        setAppeals(data);
      } catch (error) {
        console.warn("Could not load blood appeals:", error);
      }
    };
    fetchAppeals();
    const interval = setInterval(fetchAppeals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-play interval to slide cards automatically
  useEffect(() => {
    if (appeals.length <= 1) return;
    const slideTimer = setInterval(() => {
      handleNext();
    }, 4500); // Shift every 4.5 seconds
    return () => clearInterval(slideTimer);
  }, [appeals.length, currentIndex]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? appeals.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === appeals.length - 1 ? 0 : prev + 1));
  };

  const handleCopyDetails = (appeal: BloodAppeal) => {
    const textToCopy = `🩸 EMERGENCY BLOOD APPEAL 🩸\nPatient: ${appeal.patientName}\nBlood Group: ${appeal.bloodGroup}\nHospital: ${appeal.hospital}\nLocation: ${appeal.city}, ${appeal.country}\nContact: ${appeal.mobile}\nPlease share and save a life!`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (appeals.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-2 relative select-none">
        <div className="text-center mb-1">
          <span className="inline-flex items-center gap-1.5 bg-white/80 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-500/25 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 animate-pulse"></span>
            </span>
            Active Lifeline Queue
          </span>
        </div>
        
        <div className="mt-3 flex-1 w-full max-w-sm mx-auto">
          <div className="bg-white/90 backdrop-blur-md border border-red-500/15 rounded-[2.25rem] p-5 shadow-[0_12px_28px_rgba(239,68,68,0.06),inset_0_2px_4px_rgba(255,255,255,0.75)] h-[142px] flex flex-col justify-center items-center text-center font-sans relative overflow-hidden group">
            
            {/* ECG trace line in fallback */}
            <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden select-none z-0">
              <svg className="w-full h-full" viewBox="0 0 350 140" fill="none" preserveAspectRatio="none">
                <path 
                  d="M 0 70 L 100 70 L 110 60 L 120 80 L 130 70 L 170 70 L 180 40 L 190 115 L 200 10 L 210 120 L 220 85 L 230 70 L 280 70 M 350 70" 
                  stroke="rgba(239, 68, 68, 0.70)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="animate-ecg-path"
                />
              </svg>
            </div>

            <div className="animate-heartbeat mb-2 z-10">
              <Droplet className="w-8 h-8 text-red-500 fill-red-500" />
            </div>
            <p className="text-xs text-slate-900 font-extrabold uppercase tracking-widest z-10">No Active Appeals</p>
            <p className="text-[10px] text-red-650 font-black mt-1 leading-normal uppercase z-10">
              The 24h queue is clear. Register as donor to help!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentAppeal = appeals[currentIndex];

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-2 relative select-none">
      <div className="text-center mb-1">
        <span className="inline-flex items-center gap-1.5 bg-white/10 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/15 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Emergency Appeals
        </span>
      </div>

      {/* Slide Container */}
      <div className="relative flex items-center justify-between gap-2 mt-3">
        {/* Prev Button */}
        {appeals.length > 1 && (
          <button 
            onClick={handlePrev}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-md transition-all shrink-0 active:scale-90 cursor-pointer"
            aria-label="Previous Appeal"
          >
            <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        )}

        {/* Central Display Card */}
        <div className="flex-1 w-full max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAppeal.id}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={() => setSelectedAppeal(currentAppeal)}
              className="bg-blue-950/70 backdrop-blur-md border border-white/20 rounded-[2.25rem] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.08)] relative overflow-hidden group hover:shadow-[0_18px_36px_rgba(14,165,233,0.22)] hover:border-sky-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-[142px] flex flex-col justify-between font-sans"
            >
              {/* High-Tech ECG Trace machine lines glimpse */}
              <div className="absolute inset-0 opacity-[0.25] pointer-events-none overflow-hidden select-none z-0">
                <svg className="w-full h-full" viewBox="0 0 350 140" fill="none" preserveAspectRatio="none">
                  <path 
                    d="M 0 70 L 60 70 L 70 58 L 80 82 L 90 70 L 130 70 L 140 35 L 150 118 L 160 5 L 170 125 L 180 82 L 190 70 L 250 70 L 260 58 L 270 82 L 280 70 L 350 70" 
                    stroke="#ef4444" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="stroke-red-500 animate-ecg-path [filter:drop-shadow(0_0_3px_rgba(239,68,68,0.4))]"
                  />
                </svg>
              </div>

              {/* Backside Glow Watermark */}
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity pointer-events-none duration-300">
                <Droplet strokeWidth={1} className="w-24 h-24 text-red-400 fill-red-500/10" />
              </div>

              {/* Upper Header Row */}
              <div className="flex justify-between items-start z-10 relative">
                <div className="flex items-center gap-3">
                  {/* Blood Group Droplet design with heartbeat scale pulse */}
                  <div className="animate-heartbeat shrink-0 relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 via-red-500 to-rose-600 text-white flex items-center justify-center rounded-tr-full rounded-br-full rounded-bl-full rotate-45 shadow-[0_5px_15px_rgba(239,68,68,0.4),inset_0_1.5px_3px_rgba(255,255,255,0.55)] border border-red-405 border-t-white group-hover:scale-105 transition-transform">
                      <span className="-rotate-45 text-white font-sans font-black text-sm tracking-tight drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.55)]">
                        {currentAppeal.bloodGroup || 'O+'}
                      </span>
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 z-20">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-405 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-white"></span>
                    </div>
                  </div>

                  {/* Patient Name */}
                  <div className="text-left">
                    <h3 className="font-extrabold text-sm text-white tracking-tight line-clamp-1 group-hover:text-red-405 transition-colors">
                      {currentAppeal.patientName}
                    </h3>
                    <p className="text-[10px] text-red-405 font-black flex items-center gap-1 uppercase mt-0.5 tracking-wide">
                      <Hospital className="w-3.5 h-3.5 text-red-500 shrink-0" /> <span className="truncate max-w-[150px]">{currentAppeal.hospital || 'Hospital'}</span>
                    </p>
                  </div>
                </div>

                {/* Tag & Share */}
                <div className="flex flex-col items-end gap-1.5 z-20">
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-red-400 px-2 py-0.5 bg-red-950/20 border border-red-500/30 rounded-md shadow-sm">
                    Emergency
                  </span>
                  <button 
                    onClick={(e) => handleShareClick(e, currentAppeal)}
                    className="p-1 px-1.5 text-[8px] font-black uppercase tracking-wider text-sky-400 hover:text-white bg-white/5 hover:bg-sky-600 rounded-md border border-sky-505/20 hover:border-sky-500 transition flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Share this appeal on social media"
                  >
                    <Share2 className="w-2.5 h-2.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Bottom Details Row */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-slate-300 text-[11.5px] font-bold z-10 relative">
                <div className="flex items-center gap-1 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{currentAppeal.city || 'City'}</span>
                </div>
                
                {/* Micro CALL Trigger CTA */}
                <span className="text-[9.5px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Help Now <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-red-400" strokeWidth={3} />
                </span>
              </div>

              {/* Multi-channel Share overlay when active */}
              {activeShareId === currentAppeal.id && (
                <div 
                  className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 p-4 rounded-[2.25rem] flex flex-col justify-between border border-[#0ea5e9]/40 shadow-[0_0_25px_rgba(14,165,233,0.25)] animate-in fade-in zoom-in-95 duration-250 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center pb-1 border-b border-white/10">
                    <span className="text-[9px] uppercase font-black tracking-widest text-[#0ea5e9] flex items-center gap-1">
                      📢 Social Rescue Share
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveShareId(null); }}
                      className="w-5 h-5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-white/10 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="py-1 text-center">
                    <p className="text-[9px] text-slate-300 font-bold leading-normal">
                      Spread on WhatsApp/Social Media. Expired links dynamically redirect to new active appeals!
                    </p>
                    {copiedLink && (
                      <p className="text-[8.5px] text-green-400 font-extrabold uppercase tracking-widest mt-0.5 animate-pulse">
                        ✓ Copy Completed!
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {/* WhatsApp */}
                    <button 
                      onClick={(e) => handleSocialShare('whatsapp', currentAppeal, e)}
                      className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-400 hover:bg-emerald-900/40 text-emerald-400 transition cursor-pointer"
                    >
                      <span className="text-sm">💬</span>
                      <span className="text-[7.5px] font-black uppercase mt-0.5 tracking-wider">WhatsApp</span>
                    </button>

                    {/* Facebook */}
                    <button 
                      onClick={(e) => handleSocialShare('facebook', currentAppeal, e)}
                      className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-blue-950/30 border border-blue-500/20 hover:border-blue-400 hover:bg-blue-900/40 text-blue-400 transition cursor-pointer"
                    >
                      <span className="text-sm">📘</span>
                      <span className="text-[7.5px] font-black uppercase mt-0.5 tracking-wider">Facebook</span>
                    </button>

                    {/* Twitter */}
                    <button 
                      onClick={(e) => handleSocialShare('twitter', currentAppeal, e)}
                      className="flex flex-col items-center justify-center py-1.5 src-theme rounded-lg bg-black/50 border border-slate-750 hover:border-white hover:bg-black text-white transition cursor-pointer"
                    >
                      <span className="text-xs font-sans font-black">𝕏</span>
                      <span className="text-[7.5px] font-black uppercase mt-0.5 tracking-wider">Twitter</span>
                    </button>

                    {/* Copy Link */}
                    <button 
                      onClick={(e) => handleSocialShare('copy', currentAppeal, e)}
                      className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/15 text-white transition cursor-pointer"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-[7.5px] font-black uppercase mt-0.5 tracking-wider">Copy</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        {appeals.length > 1 && (
          <button 
            onClick={handleNext}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-md transition-all shrink-0 active:scale-90 cursor-pointer"
            aria-label="Next Appeal"
          >
            <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Progress Dots indicators */}
      {appeals.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {appeals.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentIndex ? 'w-5 bg-red-500' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Modal - Popup Detail of Selected Card */}
      <AnimatePresence>
        {selectedAppeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur - Sheshe ki tarha bilkul saf */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppeal(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Glowing Detailed Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-slate-950/95 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_40px_rgba(14,165,233,0.15)] relative w-full max-w-sm overflow-hidden z-10 text-white"
            >
              {/* Top gradient blood shine */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-[#0ea5e9] to-red-600"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedAppeal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center shadow-sm cursor-pointer border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="text-center mt-2 mb-6">
                {/* Bloop Icon drop pulsing */}
                <div className="w-16 h-16 bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/20 relative animate-heartbeat">
                  <Droplet className="w-8 h-8 text-red-500 fill-red-500" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border border-white"></span>
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 bg-red-950/50 px-3 py-1 rounded-full border border-red-500/30">
                  CRITICAL APPEAL
                </span>
              </div>

              {/* Patient Details list */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3.5 mb-6 text-left">
                {/* Blood Group */}
                <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/15 shadow-inner">
                  <span className="text-xs font-black uppercase text-slate-300 tracking-wider">Required Group</span>
                  <div className="animate-heartbeat">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-650 via-red-500 to-rose-650 text-white flex items-center justify-center rounded-tr-full rounded-br-full rounded-bl-full rotate-45 shadow-[0_6px_16px_rgba(239,68,68,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] border border-red-400 border-t-white relative">
                      <span className="-rotate-45 text-white font-black text-sm tracking-tighter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.55)]">
                        {selectedAppeal.bloodGroup || 'O+'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Name */}
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                  <span className="text-[11px] font-bold text-slate-400">PATIENT NAME</span>
                  <span className="font-black text-white">{selectedAppeal.patientName}</span>
                </div>

                {/* Hospital */}
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                  <span className="text-[11px] font-bold text-slate-400">HOSPITAL</span>
                  <span className="font-extrabold text-slate-200 truncate max-w-[180px] text-right" title={selectedAppeal.hospital}>
                    {selectedAppeal.hospital}
                  </span>
                </div>

                {/* City & Country */}
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                  <span className="text-[11px] font-bold text-slate-400">LOCATION</span>
                  <span className="font-extrabold text-slate-200">
                    {selectedAppeal.city}, {selectedAppeal.country}
                  </span>
                </div>

                {/* Phone Contact */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[11px] font-bold text-slate-400">CONTACT</span>
                  <span className="font-mono font-black text-sky-300 text-sm tracking-widest">{selectedAppeal.mobile}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Copy Text Info */}
                <button 
                  onClick={() => handleCopyDetails(selectedAppeal)}
                  className={`py-3 px-4 rounded-xl font-black uppercase tracking-widest text-[9.5px] flex items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${copied ? 'bg-green-950/40 text-green-400 border-green-500/40 shadow-[0_4px_12px_rgba(34,197,94,0.2)]' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'}`}
                >
                  <Clipboard className={`w-4 h-4 shrink-0 ${copied ? 'text-green-400' : 'text-slate-400'}`} />
                  {copied ? 'Copied' : 'Copy Details'}
                </button>

                {/* Call directly */}
                <a 
                  href={`tel:${selectedAppeal.mobile}`}
                  className="geli-btn-sky py-3 h-12 rounded-xl text-white font-black uppercase tracking-widest text-[9.5px] flex items-center justify-center gap-1.5 transition text-center cursor-pointer"
                >
                  <Phone className="w-4 h-4 shrink-0 text-white" />
                  Call Patient
                </a>
              </div>

              {/* Share On Social Media Section */}
              <div className="border-t border-white/10 mt-4 pt-3.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-405 text-center mb-2 flex items-center justify-center gap-1">
                  <span>📱 Share Appeal On Social Networks (سوشل میڈیا پر شیئر کریں)</span>
                </p>
                {copiedLink && (
                  <p className="text-[8.5px] text-green-400 font-extrabold uppercase tracking-widest text-center mb-1.5 animate-pulse">
                    ✓ Link copied! Redirects users dynamically.
                  </p>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {/* WhatsApp */}
                  <button 
                    onClick={(e) => handleSocialShare('whatsapp', selectedAppeal, e)}
                    className="flex flex-col items-center justify-center py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-400 hover:bg-emerald-900/40 text-emerald-450 transition active:scale-95 cursor-pointer"
                  >
                    <span className="text-lg leading-none">💬</span>
                    <span className="text-[7.5px] font-black uppercase mt-1 tracking-wider text-emerald-400">WhatsApp</span>
                  </button>

                  {/* Facebook */}
                  <button 
                    onClick={(e) => handleSocialShare('facebook', selectedAppeal, e)}
                    className="flex flex-col items-center justify-center py-2 rounded-xl bg-blue-950/30 border border-blue-500/20 hover:border-blue-400 hover:bg-blue-900/40 text-blue-450 transition active:scale-95 cursor-pointer"
                  >
                    <span className="text-lg leading-none">📘</span>
                    <span className="text-[7.5px] font-black uppercase mt-1 tracking-wider text-blue-400">Facebook</span>
                  </button>

                  {/* Twitter */}
                  <button 
                    onClick={(e) => handleSocialShare('twitter', selectedAppeal, e)}
                    className="flex flex-col items-center justify-center py-2 rounded-xl bg-slate-900 border border-slate-755 hover:border-white hover:bg-black text-white transition active:scale-95 cursor-pointer"
                  >
                    <span className="text-xs font-sans font-black leading-none">𝕏</span>
                    <span className="text-[7.5px] font-black uppercase mt-1 tracking-wider text-white">Twitter</span>
                  </button>

                  {/* Copy link */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const { shareUrl } = getShareInfo(selectedAppeal);
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex flex-col items-center justify-center py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white transition active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-slate-350" />
                    <span className="text-[7.5px] font-black uppercase mt-1 tracking-wider text-slate-350">
                      {copiedLink ? 'Copied' : 'Copy'}
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 mt-4 leading-normal text-center font-bold uppercase tracking-wider">
                Please coordinate with the patient instantly.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
