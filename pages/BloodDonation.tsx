import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { getCountries, getCitiesByCountry, registerBloodDonor, submitBloodAppeal, getLawyerProfile, getBloodDonorProfile, getActiveBloodAppeals } from '../services/mockDataService';
import { Country, BloodDonor, BloodAppeal, LawyerProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Share2, Clipboard } from 'lucide-react';

export default function BloodDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'register' | 'appeal'>('register');
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDonorSuccess, setShowDonorSuccess] = useState(false);
  const [showAppealSuccess, setShowAppealSuccess] = useState(false);

  // Shared Appeal States & Dynamic Redirection System
  const [sharedAppeal, setSharedAppeal] = useState<BloodAppeal | null>(null);
  const [isShiftedToNewAppeal, setIsShiftedToNewAppeal] = useState(false);
  const [didCheckSharedAppeal, setDidCheckSharedAppeal] = useState(false);
  const [copiedTextShared, setCopiedTextShared] = useState(false);

  useEffect(() => {
    const processSharedAppeal = async () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'appeal') {
        setActiveTab('appeal');
      }

      const sharedId = params.get('appealId');
      if (sharedId) {
        try {
          const activeList = await getActiveBloodAppeals();
          const matches = activeList.find(a => a.id === sharedId);
          if (matches) {
            setSharedAppeal(matches);
            setIsShiftedToNewAppeal(false);
          } else {
            // Expired or Deleted! Let's shift to the newest active appeal dynamically
            if (activeList.length > 0) {
              setSharedAppeal(activeList[0]);
              setIsShiftedToNewAppeal(true);
            } else {
              setSharedAppeal(null);
              setIsShiftedToNewAppeal(true); // Flag is true but no appeal means queue is empty
            }
          }
        } catch (err) {
          console.warn("Failed to retrieve shared blood appeals:", err);
        }
      }
      setDidCheckSharedAppeal(true);
    };
    processSharedAppeal();
  }, [message, showAppealSuccess]);

  const getSharedPageInfo = (appeal: BloodAppeal) => {
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

  const handleSharedSocialShare = (type: 'whatsapp' | 'facebook' | 'twitter' | 'copy', appeal: BloodAppeal) => {
    const { shareUrl, shareText } = getSharedPageInfo(appeal);

    if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Emergency Blood Appeal: Patient ${appeal.patientName} requires ${appeal.bloodGroup} group. Help save a life!`)}`, '_blank');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(shareText);
      setCopiedTextShared(true);
      setTimeout(() => setCopiedTextShared(false), 2000);
    }
  };

  // Forms
  const [donorForm, setDonorForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    bloodGroup: '',
    country: '',
    city: ''
  });

  const [appealForm, setAppealForm] = useState({
    patientName: '',
    bloodGroup: '',
    hospital: '',
    country: '',
    city: '',
    mobile: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      const countryList = await getCountries();
      setCountries(countryList);

      if (user) {
        // Base info from auth
        let initialName = user.displayName || '';
        let initialEmail = user.email || '';
        let initialWhatsapp = '';
        let initialCountry = '';
        let initialCity = '';
        let initialBloodGroup = '';

        // Try getting blood donor profile first
        const donorProfile = await getBloodDonorProfile(user.uid);
        if (donorProfile) {
          initialName = donorProfile.name || initialName;
          initialEmail = donorProfile.email || initialEmail;
          initialWhatsapp = donorProfile.whatsapp || '';
          initialCountry = donorProfile.country || '';
          initialCity = donorProfile.city || '';
          initialBloodGroup = donorProfile.bloodGroup || '';
        } else if (user.role === 'lawyer' || user.role === 'admin') {
          // Try getting lawyer profile
          const lawyerProfile = await getLawyerProfile(user.uid);
          if (lawyerProfile) {
            initialName = lawyerProfile.fullName || initialName;
            initialEmail = lawyerProfile.contactEmail || initialEmail;
            initialWhatsapp = lawyerProfile.contactWhatsapp || lawyerProfile.contactMobile || '';
            initialCountry = lawyerProfile.country || '';
            initialCity = lawyerProfile.city || '';
            initialBloodGroup = lawyerProfile.bloodGroup || '';
          }
        }

        setDonorForm({
          name: initialName,
          email: initialEmail,
          whatsapp: initialWhatsapp,
          bloodGroup: initialBloodGroup,
          country: initialCountry,
          city: initialCity
        });

        setAppealForm(prev => ({
          ...prev,
          country: initialCountry,
          city: initialCity,
          mobile: initialWhatsapp
        }));

        // Load cities if country is available
        if (initialCountry) {
          const loadedCities = await getCitiesByCountry(initialCountry);
          setCities(loadedCities);
        }
      }
    };
    loadInitialData();
  }, [user]);

  const handleCountryChange = async (countryName: string, type: 'donor' | 'appeal') => {
    if (type === 'donor') {
      setDonorForm(prev => ({ ...prev, country: countryName, city: '' }));
    } else {
      setAppealForm(prev => ({ ...prev, country: countryName, city: '' }));
    }
    if (countryName) {
      const loadedCities = await getCitiesByCountry(countryName);
      setCities(loadedCities);
    } else {
      setCities([]);
    }
  };

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      await registerBloodDonor({
        ...donorForm,
        isLoggedInUser: !!user
      });
      setShowDonorSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to register. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      await submitBloodAppeal(appealForm);
      if (!donorForm.bloodGroup) {
          setShowAppealSuccess(true);
      } else {
          setMessage({ type: 'success', text: 'Your appeal has been posted successfully! Admin is notifying donors.' });
          setTimeout(() => {
              navigate('/');
          }, 4000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit appeal. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          {/* Animated Heartbeat Blood Droplet Logo */}
          <div className="animate-heartbeat w-16 h-16 bg-gradient-to-br from-red-600 via-red-500 to-rose-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/40 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl rotate-45 border border-white/30 relative">
             <svg className="-rotate-45 w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
             </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Life Saver Network</h1>
          <p className="text-slate-500 font-medium">Connecting generous donors with emergency blood appeals instantly.</p>
        </div>

        {/* Shared Appeal Spotlight Section */}
        {didCheckSharedAppeal && (sharedAppeal || isShiftedToNewAppeal) && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-6 duration-500">
            {isShiftedToNewAppeal ? (
              // Shifted Alert Card (Fulfill / Expired Case)
              <div className="bg-amber-50 rounded-[2rem] border border-amber-200 p-6 md:p-8 shadow-md relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full translate-x-8 -translate-y-8 opacity-45 pointer-events-none"></div>
                <div className="flex items-start gap-4 z-10 relative">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-amber-900 tracking-tight flex items-center gap-2 uppercase">
                      Appeal Expired or Fulfilled (پُرانی اپیل ختم ہو چکی ہے)
                    </h3>
                    <p className="text-xs text-amber-850 font-bold leading-relaxed">
                      یہ خون کی اپیل پوری ہو چکی ہے یا پُرانی ہونے کی وجہ سے خودکار طریقے سے ختم کر دی گئی ہے۔ آپ کے جذبے کا بے حد شکریہ! ہم نے آپ کو سب سے تازہ ترین فعال اپیل پر شفٹ کر دیا ہے تاکہ آپ کی مدد کرنے کی صلاحیت ضائع نہ ہو۔
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed italic">
                      This emergency blood request was either successfully completed or automatically expired after its 24-hour cycle. Thank you so much for your support! We have moved you to the newest active appeal so your life-saving efforts are directed where they are needed most.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Active Direct Target Spotlight Card
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-[2rem] border border-red-200 p-6 shadow-md md:flex md:items-center md:justify-between gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                    Shared Rescue Link Active (تصدیق شدہ فعال اپیل)
                  </span>
                </div>
                <p className="text-slate-500 font-bold text-xs mt-1 md:mt-0 italic">
                  Direct verified page for this request. Please call or share to help.
                </p>
              </div>
            )}

            {/* Displaying the Target/Shifted Appeal Card */}
            {sharedAppeal ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden text-white">
                {/* Backside ECG lines */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none select-none z-0">
                  <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" preserveAspectRatio="none">
                    <path 
                      d="M 0 100 L 100 100 L 115 80 L 130 120 L 145 100 L 200 100 L 215 50 L 230 160 L 245 10 L 260 170 L 275 120 L 290 100 L 500 100" 
                      stroke="#ef4444" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-4">
                    {/* Patient and Hospital details */}
                    <div className="flex items-center gap-4">
                      {/* Blood drop icon with heartbeat animation */}
                      <div className="w-16 h-16 bg-gradient-to-br from-red-650 via-red-500 to-rose-650 text-white flex items-center justify-center rounded-tr-full rounded-br-full rounded-bl-full rotate-45 shadow-[0_6px_16px_rgba(239,68,68,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] border border-red-500 relative shrink-0">
                        <span className="-rotate-45 text-white font-sans font-black text-xl tracking-tight drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.55)]">
                          {sharedAppeal.bloodGroup}
                        </span>
                      </div>
                      <div>
                        <span className="bg-red-950/40 text-red-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-500/20 shadow-sm leading-none">
                          Urgent Appeal
                        </span>
                        <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                          {sharedAppeal.patientName}
                        </h2>
                        <p className="text-xs text-red-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mt-0.5 leading-none">
                          <span className="w-3.5 h-3.5 bg-red-950/20 text-red-500 rounded flex items-center justify-center font-bold">🏥</span>
                          {sharedAppeal.hospital}
                        </p>
                      </div>
                    </div>

                    {/* Meta info list */}
                    <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Location (مقام)</span>
                        <span className="font-extrabold text-white text-sm">{sharedAppeal.city}, {sharedAppeal.country}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact (رابطہ نمبر)</span>
                        <span className="font-mono font-black text-sky-400 text-sm tracking-widest">{sharedAppeal.mobile}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-col gap-3">
                    {/* Call Direct */}
                    <a 
                      href={`tel:${sharedAppeal.mobile}`}
                      className="w-full py-3.5 bg-gradient-to-b from-red-500 to-red-650 hover:from-red-450 hover:to-red-550 border border-red-400 border-t-red-300 shadow-[0_5px_15px_rgba(239,68,68,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)] text-white font-black rounded-2xl transition hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>📞 Call Patient Now</span>
                    </a>

                    {/* Copy Info details */}
                    <button 
                      onClick={() => handleSharedSocialShare('copy', sharedAppeal)}
                      className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest text-[9.5px] flex items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${copiedTextShared ? 'bg-green-950/40 text-green-400 border-green-500/40' : 'bg-white/10 hover:bg-white/20 text-white border-white/10'}`}
                    >
                      <Clipboard className="w-4 h-4 text-slate-350 shrink-0" />
                      {copiedTextShared ? '✓ Details Copied' : '📄 Copy Entire Info'}
                    </button>

                    {/* Quick WhatsApp Share option */}
                    <button 
                      onClick={() => handleSharedSocialShare('whatsapp', sharedAppeal)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white font-black rounded-2xl transition hover:scale-[1.02] active:scale-95 text-[9.5px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
                
                {/* Dynamically update standard message */}
                <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                  <span>📅 Posted: {new Date(sharedAppeal.createdAt).toLocaleDateString()}</span>
                  <span className="text-[#0ea5e9] flex items-center gap-1">
                     24-Hour Active Cycle (خون کی مدد کیلئے فوری رابطہ کریں)
                  </span>
                </div>
              </div>
            ) : (
              // Empty database queue fallback
              <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl text-center space-y-4 text-white relative overflow-hidden">
                <div className="w-16 h-16 bg-red-950/40 rounded-full flex items-center justify-center mx-auto border border-red-500/20 relative animate-heartbeat">
                  <span className="text-2xl">❤️</span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase select-none">No Active Appeals Exist in Jail/Queue</h3>
                <p className="text-xs text-slate-350 max-w-md mx-auto leading-relaxed">
                   Currently there are no other emergency appeals in the system. But you can still register as a life-saving donor right below to support future patients!
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold italic">
                   اس وقت سسٹم میں کوئی دوسری فعال اپیل موجود نہیں ہے۔ لیکن آپ مستقبل کے مریضوں کے لیے نیچے خون کا عطیہ دہندہ بن کر رجسٹریشن کر سکتے ہیں۔
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100 px-8 pt-8">
            <button 
              onClick={() => { setActiveTab('register'); setMessage(null); }}
              className={`flex-1 py-4 font-black uppercase tracking-widest text-xs transition border-b-4 ${activeTab === 'register' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Donor Registration
            </button>
            <button 
              onClick={() => { setActiveTab('appeal'); setMessage(null); }}
              className={`flex-1 py-4 font-black uppercase tracking-widest text-xs transition border-b-4 ${activeTab === 'appeal' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Submit Appeal
            </button>
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-8 p-6 rounded-2xl flex items-center gap-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {message.type === 'success' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <p className="font-bold text-sm">{message.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {showDonorSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">You Are A Hero!</h2>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">Thank you for registering. Every drop counts. You will now be redirected to the homepage...</p>
              </motion.div>
            ) : showAppealSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Appeal Submitted</h2>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">Your appeal is active. Would you also like to help others by registering as a donor?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => { setShowAppealSuccess(false); setActiveTab('register'); }} className="px-8 h-12 bg-gradient-to-b from-red-500 to-red-650 hover:from-red-400 hover:to-red-550 border border-red-400 border-t-red-300 shadow-[0_6px_15px_rgba(239,68,68,0.45),inset_0_2px_4px_rgba(255,255,255,0.5)] text-white font-black rounded-[1.25rem] transition-transform hover:scale-105 active:scale-95 text-xs uppercase tracking-widest">
                    Yes, Register Me
                  </button>
                  <button onClick={() => navigate('/')} className="px-8 h-12 bg-gradient-to-b from-slate-150 to-slate-250 hover:from-white hover:to-slate-105 border border-slate-300 border-t-slate-200 shadow-[0_6px_15px_rgba(15,23,42,0.15),inset_0_2px_4px_rgba(255,255,255,0.5)] text-slate-700 font-black rounded-[1.25rem] transition-transform hover:scale-105 active:scale-95 text-xs uppercase tracking-widest">
                    No Thanks
                  </button>
                </div>
              </motion.div>
            ) : activeTab === 'register' ? (
              <form onSubmit={handleDonorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input required placeholder="Your Name" className="w-full bg-slate-50 border-slate-100 border p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-semibold outline-none transition" value={donorForm.name} onChange={e => setDonorForm({...donorForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input required type="email" placeholder="email@example.com" className="w-full bg-slate-50 border-slate-100 border p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-semibold outline-none transition" value={donorForm.email} onChange={e => setDonorForm({...donorForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">WhatsApp / Contact</label>
                  <input required placeholder="+92 300 1234567" className="w-full bg-slate-50 border-slate-100 border p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-semibold outline-none transition" value={donorForm.whatsapp} onChange={e => setDonorForm({...donorForm, whatsapp: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Blood Group</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-extrabold outline-none transition cursor-pointer appearance-none" value={donorForm.bloodGroup} onChange={e => setDonorForm({...donorForm, bloodGroup: e.target.value})}>
                    <option value="" className="text-slate-550 bg-white font-bold">Select Group...</option>
                    <option value="A+" className="text-slate-900 bg-white font-black">A+</option>
                    <option value="A-" className="text-slate-900 bg-white font-black">A-</option>
                    <option value="B+" className="text-slate-900 bg-white font-black">B+</option>
                    <option value="B-" className="text-slate-900 bg-white font-black">B-</option>
                    <option value="AB+" className="text-slate-900 bg-white font-black">AB+</option>
                    <option value="AB-" className="text-slate-900 bg-white font-black">AB-</option>
                    <option value="O+" className="text-slate-900 bg-white font-black">O+</option>
                    <option value="O-" className="text-slate-900 bg-white font-black">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Country</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-extrabold outline-none transition cursor-pointer" value={donorForm.country} onChange={e => handleCountryChange(e.target.value, 'donor')}>
                    <option value="" className="text-slate-550 bg-white font-bold">Select Country...</option>
                    {countries.map(c => <option key={c.code} value={c.name} className="text-slate-900 bg-white font-black">{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">City</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-extrabold outline-none transition cursor-pointer" value={donorForm.city} onChange={e => setDonorForm({...donorForm, city: e.target.value})}>
                    <option value="" className="text-slate-550 bg-white font-bold">Select City...</option>
                    {cities.map(city => <option key={city} value={city} className="text-slate-900 bg-white font-black">{city}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button disabled={isLoading} type="submit" className="w-full h-14 bg-gradient-to-b from-red-500 to-red-650 hover:from-red-450 hover:to-red-550 border border-red-400 border-t-red-300 shadow-[0_6px_15px_rgba(239,68,68,0.45),inset_0_2px_4px_rgba(255,255,255,0.5)] text-white font-black rounded-[1.25rem] transition-transform hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                    {isLoading ? 'Processing...' : 'Register as Donor'}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">Helping others is a great humanitarian act.</p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAppealSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Patient Name</label>
                  <input required placeholder="Enter Patient Name" className="w-full bg-slate-50 border-slate-100 border p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-semibold outline-none transition" value={appealForm.patientName} onChange={e => setAppealForm({...appealForm, patientName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Blood Group Required</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-extrabold outline-none transition cursor-pointer" value={appealForm.bloodGroup} onChange={e => setAppealForm({...appealForm, bloodGroup: e.target.value})}>
                    <option value="" className="text-slate-550 bg-white font-bold">Select Group...</option>
                    <option value="A+" className="text-slate-900 bg-white font-black">A+</option>
                    <option value="A-" className="text-slate-900 bg-white font-black">A-</option>
                    <option value="B+" className="text-slate-900 bg-white font-black">B+</option>
                    <option value="B-" className="text-slate-900 bg-white font-black">B-</option>
                    <option value="AB+" className="text-slate-900 bg-white font-black">AB+</option>
                    <option value="AB-" className="text-slate-900 bg-white font-black">AB-</option>
                    <option value="O+" className="text-slate-900 bg-white font-black">O+</option>
                    <option value="O-" className="text-slate-900 bg-white font-black">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Hospital Name</label>
                  <input required placeholder="e.g. Civil Hospital" className="w-full bg-slate-50 border-slate-100 border p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-semibold outline-none transition" value={appealForm.hospital} onChange={e => setAppealForm({...appealForm, hospital: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact Number</label>
                  <input required placeholder="Mobile for donors to call" className="w-full bg-slate-50 border-slate-100 border p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-semibold outline-none transition" value={appealForm.mobile} onChange={e => setAppealForm({...appealForm, mobile: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Country</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-extrabold outline-none transition cursor-pointer" value={appealForm.country} onChange={e => handleCountryChange(e.target.value, 'appeal')}>
                    <option value="" className="text-slate-550 bg-white font-bold">Select Country...</option>
                    {countries.map(c => <option key={c.code} value={c.name} className="text-slate-900 bg-white font-black">{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">City</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-red-500 text-slate-900 font-extrabold outline-none transition cursor-pointer" value={appealForm.city} onChange={e => setAppealForm({...appealForm, city: e.target.value})}>
                    <option value="" className="text-slate-550 bg-white font-bold">Select City...</option>
                    {cities.map(city => <option key={city} value={city} className="text-slate-900 bg-white font-black">{city}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button disabled={isLoading} type="submit" className="w-full h-14 bg-gradient-to-b from-red-500 to-red-650 hover:from-red-450 hover:to-red-550 border border-red-400 border-t-red-300 shadow-[0_6px_15px_rgba(239,68,68,0.45),inset_0_2px_4px_rgba(255,255,255,0.5)] text-white font-black rounded-[1.25rem] transition-transform hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                    {isLoading ? 'Submitting...' : 'Submit Emergency Appeal'}
                  </button>
                  <div className="bg-blue-50 mt-6 p-4 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">Important</p>
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">After submission, your appeal will be live on the homepage marquee. Admin will immediately notify matching donors via WhatsApp.</p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-50">
            {/* Simple footer for the page */}
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Connect</span>
            </div>
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Notify</span>
            </div>
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Save Life</span>
            </div>
        </div>
      </div>
    </div>
  );
}
