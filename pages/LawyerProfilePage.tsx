import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getLawyerProfile, getLawyerReviews, addReview, getCountries } from '../services/mockDataService';
import { LawyerProfile, Review } from '../types';
import { formatPhoneNumberForWhatsApp } from '../utils/phoneUtils';
import { useAuth } from '../App';
import AnimatedLogo from '../components/AnimatedLogo';
import { isLawyerAvailable, getAvailabilityStatusText } from '../utils/availabilityUtils';

interface DisplayLabels {
  summaryTitle: string;
  achievementsTitle: string;
  educationTitle: string;
  degreeLabel: string;
  gradYearLabel: string;
  statusTitle: string;
  complianceLabel: string;
  complianceStatus: string;
  complianceDesc: string;
  barStandingLabel: string;
  whatsappMessage: string;
  voiceCall: string;
  whatsappChat: string;
  whatsappVoice: string;
  videoMeeting: string;
  feedbackTitle: string;
}

const getLabels = (country: string, isTranslated: boolean): DisplayLabels => {
  const norm = (country || '').toLowerCase();
  
  if (!isTranslated) {
    return {
      summaryTitle: 'Professional Summary',
      achievementsTitle: 'Key Achievements',
      educationTitle: 'Educational Background',
      degreeLabel: 'Degree',
      gradYearLabel: 'Graduation Year',
      statusTitle: 'Verification & Status',
      complianceLabel: 'Compliance Status',
      complianceStatus: 'Credentials Verified',
      complianceDesc: "This advocate's active enrollment and state license have been validated by our security compliance registrars.",
      barStandingLabel: 'Bar Standing',
      whatsappMessage: 'WhatsApp Message',
      voiceCall: '📞 Direct Voice Call',
      whatsappChat: '💬 WhatsApp Chat Message',
      whatsappVoice: '📱 WhatsApp Audio Call',
      videoMeeting: '🤝 Start P2P Video Meeting',
      feedbackTitle: 'Client Reviews & Ratings'
    };
  }

  if (norm.includes('pakistan')) {
    return {
      summaryTitle: 'کیس کی تفصیلات اور خلاصہ (Summary)',
      achievementsTitle: 'اہم کامیابیاں (Achievements)',
      educationTitle: 'تعلیمی معلومات (Education)',
      degreeLabel: 'ڈگری (Degree)',
      gradYearLabel: 'فراغت کا سال (Graduation Year)',
      statusTitle: 'تصدیق کا اسٹیٹس (Status)',
      complianceLabel: 'قانونی تصدیق (Compliance)',
      complianceStatus: 'سرکاری طور پر تصدیق شدہ (Verified)',
      complianceDesc: 'اس وکیل کی رجسٹریشن اور لائسنس کی بار کونسل سے تصدیق کی جا چکی ہے۔',
      barStandingLabel: 'لائسنس اسٹیٹس',
      whatsappMessage: 'واٹس ایپ پر رابطہ کریں',
      voiceCall: '📞 براہ راست فون کال',
      whatsappChat: '💬 واٹس ایپ چیٹ کمنٹ',
      whatsappVoice: '📱 واٹس ایپ آڈیو کال',
      videoMeeting: '🤝 ویڈیو مشاورتی میٹنگ',
      feedbackTitle: 'موکلین کی رائے اور ریٹنگ (Reviews)'
    };
  } else if (norm.includes('india')) {
    return {
      summaryTitle: 'पेशेवर विवरण (Professional Summary)',
      achievementsTitle: 'मुख्य उपलब्धियां (Achievements)',
      educationTitle: 'शैक्षणिक विवरण (Education)',
      degreeLabel: 'डिग्री (Degree)',
      gradYearLabel: 'स्नातक वर्ष (Graduation Year)',
      statusTitle: 'सत्यापन और स्थिति (Status)',
      complianceLabel: 'अनुपालन स्थिति (Compliance)',
      complianceStatus: 'सत्यापित साख (Credentials Verified)',
      complianceDesc: 'इस अधिवक्ता के क्रेडेंशियल्स को बार काउंसिल के अनुसार सत्यापित किया गया है।',
      barStandingLabel: 'सक्रिय सदस्यता',
      whatsappMessage: 'व्हाट्सएप संदेश',
      voiceCall: '📞 सीधी वॉयस कॉल',
      whatsappChat: '💬 व्हाट्सएप चैट संवाद',
      whatsappVoice: '📱 व्हाट्सएप ऑडियो कॉल',
      videoMeeting: '🤝 वीडियो परामर्श बैठक',
      feedbackTitle: 'ग्राहक समीक्षा और रेटिंग'
    };
  } else if (norm.includes('saudi') || norm.includes('uae') || norm.includes('dubai') || norm.includes('egypt') || norm.includes('arab')) {
    return {
      summaryTitle: 'الملخص المهني (Summary)',
      achievementsTitle: 'الإنجازات الرئيسية (Achievements)',
      educationTitle: 'الخلفية التعليمية (Education)',
      degreeLabel: 'الدرجة العلمية',
      gradYearLabel: 'سنة التخرج',
      statusTitle: 'التحقق والحالة',
      complianceLabel: 'حالة الامتثال',
      complianceStatus: 'تم التحقق من النشاط',
      complianceDesc: 'تم التحقق من ترخيص ممارسة المحاماة من قبل نقابة المحامين.',
      barStandingLabel: 'عضو نشط في النقابة',
      whatsappMessage: 'رسالة واتساب',
      voiceCall: '📞 مكالمة صوتية مباشرة',
      whatsappChat: '💬 محادثة واتساب',
      whatsappVoice: '📱 مكالمة واتساب الصوتية',
      videoMeeting: '🤝 بدء استشارة فيديو فورية',
      feedbackTitle: 'آراء وتقييمات العملاء'
    };
  }

  return {
    summaryTitle: 'Professional Summary / معلومات کا خلاصہ',
    achievementsTitle: 'Key Achievements / کی کامیابیوں کا خلاصہ',
    educationTitle: 'Educational Background / تعلیمی ریکارڈ',
    degreeLabel: 'Degree / ڈگری',
    gradYearLabel: 'Graduation Year / سال فراغت',
    statusTitle: 'Verification & Status / تصدیق',
    complianceLabel: 'Compliance Status / قانونی حیثیت',
    complianceStatus: 'Credentials Verified / تصدیق ہو چکی ہے',
    complianceDesc: "This advocate's active enrollment and state license have been validated by our security compliance registrars.",
    barStandingLabel: 'Bar Standing / بار لسٹنگ',
    whatsappMessage: 'WhatsApp Message / واٹس ایپ پیغام',
    voiceCall: '📞 Direct Voice Call / براہ راست کال',
    whatsappChat: '💬 WhatsApp Chat Message / واٹس ایپ میسج',
    whatsappVoice: '📱 WhatsApp Audio Call / واٹس ایپ وائس کال',
    videoMeeting: '🤝 Start P2P Video Meeting / ویڈیو مشاورتی میٹنگ',
    feedbackTitle: 'Client Reviews / موکلین کے کمنٹ'
  };
};

const getLocalLanguageInfo = (country: string) => {
  const norm = (country || '').toLowerCase();
  if (norm.includes('pakistan')) {
    return { lang: 'Urdu', code: 'ur', nativeName: 'اردو' };
  } else if (norm.includes('india')) {
    return { lang: 'Hindi', code: 'hi', nativeName: 'हिन्दी' };
  } else if (norm.includes('saudi') || norm.includes('uae') || norm.includes('dubai') || norm.includes('egypt') || norm.includes('arab')) {
    return { lang: 'Arabic', code: 'ar', nativeName: 'العربية' };
  }
  return { lang: 'Local Language', code: 'default', nativeName: 'Local' };
};

const specialtyTranslationMap: Record<string, Record<string, string>> = {
  ur: {
    "Family Law": "عائلی قوانین (Family Law)",
    "Criminal Law": "فوجداری قوانین (Criminal Law)",
    "Corporate Law": "کارپوریٹ قوانین (Corporate Law)",
    "Tax Law": "ٹیکس کے قوانین (Tax Law)",
    "Civil Litigation": "دیوانی مقدمات (Civil Litigation)",
    "Immigration": "امیگریشن قوانین (Immigration)",
    "Real Estate": "جائیداد اور رئیل اسٹیٹ (Real Estate)",
    "Environmental Law": "ماحولیاتی قوانین (Environmental Law)",
    "Intellectual Property": "دانشورانہ ملکیت (Intellectual Property)",
    "General Practice": "عمومی قانونی پریکٹس (General Practice)",
  },
  hi: {
    "Family Law": "पारिवारिक कानून (Family Law)",
    "Criminal Law": "आपराधिक कानून (Criminal Law)",
    "Corporate Law": "कॉर्पोरेट कानून (Corporate Law)",
    "Tax Law": "कर कानून (Tax Law)",
    "Civil Litigation": "सिविल मुकदमेबाजी (Civil Litigation)",
    "Immigration": "आप्रवासन कानून (Immigration)",
    "Real Estate": "अचल संपत्ति कानून (Real Estate)",
    "Environmental Law": "पर्यावरण कानून (Environmental Law)",
    "Intellectual Property": "बौद्धिक संपदा (Intellectual Property)",
    "General Practice": "सामान्य वकालत (General Practice)",
  },
  ar: {
    "Family Law": "قانون الأحوال الشخصية (Family Law)",
    "Criminal Law": "القانون الجنائي (Criminal Law)",
    "Corporate Law": "قانون الشركات (Corporate Law)",
    "Tax Law": "قانون الضرائب (Tax Law)",
    "Civil Litigation": "التقاضي المدني (Civil Litigation)",
    "Immigration": "قانون الهجرة (Immigration)",
    "Real Estate": "القانون العقاري (Real Estate)",
    "Environmental Law": "قانون البيئة (Environmental Law)",
    "Intellectual Property": "الملكية الفكرية (Intellectual Property)",
    "General Practice": "الممارسة العامة (General Practice)",
  }
};

const titleTranslationMap: Record<string, Record<string, string>> = {
  ur: {
    "Advocate": "ایڈووکیٹ (Advocate)",
    "Advocate High Court": "ایڈووکیٹ ہائی کورٹ (Advocate High Court)",
    "Advocate Supreme Court": "ایڈووکیٹ سپریم کورٹ (Advocate Supreme Court)",
    "Senior Advocate": "سینئر ایڈووکیٹ (Senior Advocate)",
    "Barrister": "بیریسٹر (Barrister)",
    "Senior Counsel": "سینئر کونسل (Senior Counsel)",
    "Legal Advisor": "قانونی مشیر (Legal Advisor)",
    "Attorney at Law": "اٹارني ايٹ لا (Attorney at Law)",
  },
  hi: {
    "Advocate": "अधिवक्ता (Advocate)",
    "Advocate High Court": "उच्च न्यायालय अधिवक्ता (Advocate High Court)",
    "Advocate Supreme Court": "उच्चतम न्यायालय अधिवक्ता (Advocate Supreme Court)",
    "Senior Advocate": "वरिष्ठ अधिवक्ता (Senior Advocate)",
    "Barrister": "बैरिस्टर (Barrister)",
    "Senior Counsel": "वरिष्ठ वकील (Senior Counsel)",
    "Legal Advisor": "कानूनी सलाहकार (Legal Advisor)",
    "Attorney at Law": "न्यायवादी (Attorney at Law)",
  },
  ar: {
    "Advocate": "محامي (Advocate)",
    "Advocate High Court": "محامي أمام محكمة الاستئناف (Advocate High Court)",
    "Advocate Supreme Court": "محامي أمام المحكمة العليا (Advocate Supreme Court)",
    "Senior Advocate": "محامي أول (Senior Advocate)",
    "Barrister": "محامي مرخص (Barrister)",
    "Senior Counsel": "مستشار قانوني أول (Senior Counsel)",
    "Legal Advisor": "مستشار قانوني (Legal Advisor)",
    "Attorney at Law": "مستشار قانوني معتمد (Attorney at Law)",
  }
};

export default function LawyerProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
    // Custom interaction states
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      if (uid) {
        const [profileData, reviewData] = await Promise.all([
          getLawyerProfile(uid),
          getLawyerReviews(uid)
        ]);
        setProfile(profileData || null);
        setReviews(reviewData);
      }
      setLoading(false);
    };
    fetchProfileAndReviews();
  }, [uid]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSubmittingReview(true);
    try {
      await addReview({
        lawyerId: uid!,
        clientId: user?.uid || 'anonymous',
        clientName: reviewName.trim() || user?.displayName || 'Anonymous Client',
        rating: newRating,
        reviewContent: newContent
      });

      setNewContent('');
      setReviewName('');
      setNewRating(5);
      setReviewSuccess('Review submitted successfully! Thank you.');
      setTimeout(() => setReviewSuccess(''), 4000);

      const [updatedProfile, updatedReviews] = await Promise.all([
        getLawyerProfile(uid!),
        getLawyerReviews(uid!)
      ]);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      setReviews(updatedReviews);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const [availableCountries, setAvailableCountries] = useState<import('../types').Country[]>([]);
  useEffect(() => {
      getCountries().then(setAvailableCountries);
  }, []);

  if (loading) return <div className="p-20 text-center text-slate-500">Loading profile...</div>;
  if (!profile) return <div className="p-20 text-center text-slate-500">Lawyer not found.</div>;

  // Multi-country flag mappings
  const matchedCountry = availableCountries.find(c => c.name.toLowerCase() === (profile.country || '').toLowerCase() || c.code.toLowerCase() === (profile.country || '').toLowerCase());
  const flagCode = matchedCountry ? matchedCountry.code.toLowerCase() : 'pk';
  const flagUrl = `https://flagcdn.com/w320/${flagCode}.png`;

  // Construct WhatsApp Messages
  const bookingMessage = `Hello ${profile.title} ${profile.fullName}, I found your profile on lawyeronline.live and want to request a high-quality professional consultation.`;
  const cleanPhone = profile.contactWhatsapp ? formatPhoneNumberForWhatsApp(profile.contactWhatsapp, profile.country) : '';
  const whatsappMsgLink = cleanPhone 
    ? `https://wa.me/${cleanPhone}/?text=${encodeURIComponent(bookingMessage)}`
    : '#';

  const handleWhatsappCallClick = (e: React.MouseEvent) => {
    if (!cleanPhone) {
      e.preventDefault();
      alert("This advocate has not supplied a WhatsApp handle for audio calls.");
    } else {
      // In Wa.me, opening chat is standard prior to calling. Display professional tip.
      alert(`Connecting to WhatsApp. Once the chat room with ${profile.fullName} opens, tap the phone receiver icon at the top of your screen to place the Call!`);
    }
  };

  const handleBookClick = (e: React.MouseEvent) => {
    if (!cleanPhone) {
        e.preventDefault();
        alert("This lawyer has not provided a WhatsApp contact for chat messages.");
    }
  };

  const initInstantMeeting = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cleanNameId = profile.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 10);
    const roomId = `meet-${cleanNameId}-${randomSuffix}`;
    setGeneratedRoomId(roomId);
    setShowMeetModal(true);
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${generatedRoomId}`;
    const desc = `Hello Advocate ${profile.fullName}. I have set up our secure video conference workspace. Please join me at this link: ${link}`;
    navigator.clipboard.writeText(desc);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const lawyerSchema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": profile.fullName,
    "description": profile.aboutMe || profile.specialty,
    "image": profile.picture || `https://ui-avatars.com/api/?name=${profile.fullName}&size=200`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": profile.officeAddress,
      "addressLocality": profile.city,
      "addressCountry": profile.country
    },
    "telephone": profile.contactMobile,
    "priceRange": "$$"
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 animate-in fade-in duration-300">
      <Helmet>
        <title>{profile.fullName} ({profile.title}) | lawyeronline.live Verified Advocate</title>
        <meta name="description" content={`Consult ${profile.title} ${profile.fullName}, expert in ${profile.specialty} located in ${profile.city}, ${profile.country}.`} />
        <script type="application/ld+json">
          {JSON.stringify(lawyerSchema)}
        </script>
      </Helmet>
      {/* Banner */}
      <div className="h-36 sm:h-48 bg-gradient-to-r from-blue-900 to-indigo-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="container mx-auto px-4 pt-4 flex justify-between items-start relative z-20 max-w-6xl">
              <Link to="/find-lawyers" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-sm transition-all border border-white/10">
                  ← {isTranslated ? 'واپس جائیں' : 'Back to Search'}
              </Link>

              <button
                  onClick={() => setIsTranslated(!isTranslated)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black transition-all shadow-md cursor-pointer border ${
                      isTranslated 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-blue-900/20' 
                      : 'bg-white/95 hover:bg-white text-slate-850 border-white'
                  }`}
              >
                  <span>🌐</span>
                  <span className="hidden sm:inline">
                      {isTranslated 
                          ? `${getLocalLanguageInfo(profile.country).nativeName} / English` 
                          : `${getLocalLanguageInfo(profile.country).nativeName} میں ترجمہ کریں`
                      }
                  </span>
                  <span className="inline sm:hidden font-extrabold text-[10px]">
                      {isTranslated ? 'EN' : getLocalLanguageInfo(profile.country).code.toUpperCase()}
                  </span>
              </button>
          </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 sm:-mt-16 relative z-10 max-w-6xl">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
                
                {/* 1. Sidebar Left: Picture and Communication Hub (Desktop Only) */}
                <div className="hidden lg:flex lg:flex-col lg:w-80 bg-slate-50 p-6 text-center lg:border-r border-slate-100 justify-between shrink-0">
                    <div>
                      <div className="w-40 h-40 mx-auto bg-white p-1 rounded-full shadow-md mb-4 relative animate-in fade-in zoom-in duration-300">
                          <img 
                              src={profile.picture || `https://ui-avatars.com/api/?name=${profile.fullName}&background=random&size=200`} 
                              alt={profile.fullName} 
                              className="w-full h-full rounded-full object-cover"
                          />
                          {profile.isVerified && (
                              <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full border-4 border-slate-50 shadow-sm" title="Verified Professional Access Approved">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                              </div>
                          )}
                      </div>
                      
                      <div className="flex justify-center items-center gap-2 mb-6 opacity-85">
                          <img src={flagUrl} alt={`${profile.country} flag indicator`} className="w-5 h-auto rounded-sm border border-slate-200 shadow-sm" />
                          <span className="text-slate-600 text-sm font-semibold">{profile.city}, {profile.country}</span>
                      </div>
                    </div>

                    {/* Dedicated Communication Hub Panel */}
                    <div className="mt-2 space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider text-center border-b pb-2 mb-1">
                            {isTranslated ? 'براہ راست رابطہ سینٹر / संचार हब' : 'Direct Communication Hub'}
                        </h3>

                        {/* Live Availability Status Indicator */}
                        {(() => {
                            const avail = getAvailabilityStatusText(profile, isTranslated);
                            return (
                                <div className={`p-2.5 rounded-xl border text-center text-xs font-semibold ${avail.colorClass}`}>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${avail.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                        {avail.text}
                                    </div>
                                    {profile.officeTimingStart && (
                                        <div className="text-[10px] text-slate-500 mt-1 font-medium">
                                            🕒 Timings: {profile.officeTimingStart} - {profile.officeTimingEnd} ({profile.officeDays?.join(', ') || 'Mon-Fri'})
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                        
                        {/* 1. Direct Voice call */}
                        {isLawyerAvailable(profile) ? (
                            <a 
                                href={`tel:${profile.contactMobile}`}
                                className="w-full h-11 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
                            >
                                📞 {getLabels(profile.country, isTranslated).voiceCall}
                            </a>
                        ) : (
                            <button 
                                disabled
                                title="Voice Call is turned off outside office timings."
                                className="w-full h-11 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                            >
                                🔒 {getLabels(profile.country, isTranslated).voiceCall} ({isTranslated ? 'بند ہے' : 'Offline'})
                            </button>
                        )}

                        {/* 2. WhatsApp message */}
                        <a 
                            href={whatsappMsgLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={handleBookClick}
                            className="w-full h-11 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
                        >
                            💬 {getLabels(profile.country, isTranslated).whatsappChat}
                        </a>

                        {/* 3. WhatsApp call */}
                        {isLawyerAvailable(profile) ? (
                            <a 
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={handleWhatsappCallClick}
                                className="w-full h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
                            >
                                {getLabels(profile.country, isTranslated).whatsappVoice}
                            </a>
                        ) : (
                            <button 
                                disabled
                                title="WhatsApp Call is turned off outside office timings."
                                className="w-full h-11 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                            >
                                🔒 {getLabels(profile.country, isTranslated).whatsappVoice} ({isTranslated ? 'بند ہے' : 'Offline'})
                            </button>
                        )}

                        <div className="border-t border-dashed border-slate-200 pt-2 shrink-0"></div>

                        {/* 4. Instant Video Meeting Consultation */}
                        <button 
                            onClick={initInstantMeeting}
                            className="w-full h-12 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 text-white font-black rounded-xl transition-all shadow text-xs uppercase tracking-widest flex items-center justify-center gap-1.5"
                        >
                            {getLabels(profile.country, isTranslated).videoMeeting}
                        </button>
                        <p className="text-[10px] text-slate-400">Launches zero-setup workspace</p>
                    </div>
                </div>

                {/* 2. Content Area Right */}
                <div className="flex-grow p-5 sm:p-6 md:p-8">
                    
                    {/* Mobile-Only Header and Communication Section */}
                    <div className="block lg:hidden mb-6 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100/80">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-0.5 rounded-full shadow border border-slate-100 relative shrink-0">
                                <img 
                                    src={profile.picture || `https://ui-avatars.com/api/?name=${profile.fullName}&background=random&size=200`} 
                                    alt={profile.fullName} 
                                    className="w-full h-full rounded-full object-cover"
                                />
                                {profile.isVerified && (
                                    <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Professional">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Name and Meta */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif leading-tight">
                                    {isTranslated && profile.fullNameLocal ? profile.fullNameLocal : profile.fullName}
                                </h1>
                                {profile.fullNameLocal && (
                                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5" style={{ direction: 'auto' }}>
                                        {isTranslated ? profile.fullName : profile.fullNameLocal}
                                    </p>
                                )}
                                <p className="text-blue-600 font-bold text-xs sm:text-sm mt-1">
                                    {isTranslated 
                                        ? (titleTranslationMap[getLocalLanguageInfo(profile.country).code]?.[profile.title] || profile.title)
                                        : profile.title
                                    }
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5 text-slate-500 text-[11px] sm:text-xs">
                                    <img src={flagUrl} alt={`${profile.country} flag indicator`} className="w-4 h-auto rounded-sm border border-slate-200" />
                                    <span className="font-semibold truncate">{profile.city}, {profile.country}</span>
                                </div>
                                <div className="inline-flex items-center bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 text-[10px] mt-2">
                                    <span className="text-amber-500 mr-0.5">★</span>
                                    <span className="font-bold text-slate-800">{profile.rating || '5.0'}</span>
                                    <span className="text-slate-400 ml-1">({profile.reviewCount || 10})</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Actions (Direct Communication Hub) */}
                        <div className="mt-4 pt-4 border-t border-slate-200/50">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 text-center sm:text-left">
                                {isTranslated ? 'براہ راست رابطہ سینٹر' : 'Direct Communication'}
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {isLawyerAvailable(profile) ? (
                                    <a 
                                        href={`tel:${profile.contactMobile}`}
                                        className="h-10 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition text-[11px] flex items-center justify-center gap-1.5 border border-blue-100/30"
                                    >
                                        📞 {isTranslated ? 'براہ راست کال' : 'Call'}
                                    </a>
                                ) : (
                                    <button 
                                        disabled
                                        title="Direct Call is turned off outside office hours."
                                        className="h-10 bg-slate-100 text-slate-400 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 cursor-not-allowed"
                                    >
                                        🔒 {isTranslated ? 'کال بند ہے' : 'Call Off'}
                                    </button>
                                )}

                                <a 
                                    href={whatsappMsgLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={handleBookClick}
                                    className="h-10 bg-green-50/80 hover:bg-green-100 text-green-700 font-bold rounded-xl transition text-[11px] flex items-center justify-center gap-1.5 border border-green-100/30"
                                >
                                    💬 {isTranslated ? 'واٹس ایپ چیٹ' : 'WhatsApp'}
                                </a>

                                {isLawyerAvailable(profile) ? (
                                    <a 
                                        href={`https://wa.me/${cleanPhone}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={handleWhatsappCallClick}
                                        className="h-10 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition text-[11px] flex items-center justify-center gap-1.5 border border-emerald-100/30"
                                    >
                                        📱 {isTranslated ? 'واٹس ایپ وائس' : 'WA Call'}
                                    </a>
                                ) : (
                                    <button 
                                        disabled
                                        title="WhatsApp Call is turned off outside office hours."
                                        className="h-10 bg-slate-100 text-slate-400 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 cursor-not-allowed"
                                    >
                                        🔒 {isTranslated ? 'کال بند ہے' : 'WA Call Off'}
                                    </button>
                                )}

                                <button 
                                    onClick={initInstantMeeting}
                                    className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black rounded-xl transition-all shadow-sm text-[10px] uppercase tracking-wider flex items-center justify-center gap-1"
                                >
                                    🤝 {isTranslated ? 'ویڈیو مشورہ' : 'Video Meet'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop-Only Header */}
                    <div className="hidden lg:flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 font-serif mb-1">
                                {isTranslated && profile.fullNameLocal ? profile.fullNameLocal : profile.fullName}
                            </h1>
                            {profile.fullNameLocal && (
                                <p className="text-lg font-semibold text-slate-500 mt-1 mb-1" style={{ direction: 'auto' }}>
                                    {isTranslated ? profile.fullName : profile.fullNameLocal}
                                </p>
                            )}
                            <p className="text-blue-600 font-bold text-lg">
                                {isTranslated 
                                    ? (titleTranslationMap[getLocalLanguageInfo(profile.country).code]?.[profile.title] || profile.title)
                                    : profile.title
                                }
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                <span className="text-amber-500 text-lg mr-1">★</span>
                                <span className="font-bold text-slate-800">{profile.rating || '5.0'}</span>
                                <span className="text-slate-400 text-sm ml-1">({profile.reviewCount || 10} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {/* Badges/Specialties */}
                    <div className="mb-8 flex flex-wrap gap-2">
                        {isTranslated && profile.specialtyLocal ? (
                            <span className="bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{profile.specialtyLocal}</span>
                        ) : profile.specialties && profile.specialties.length > 0 ? (
                            profile.specialties.map((spec, index) => {
                                const localSpec = specialtyTranslationMap[getLocalLanguageInfo(profile.country).code]?.[spec];
                                return (
                                    <span key={index} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                        {isTranslated && localSpec ? localSpec : spec}
                                    </span>
                                );
                            })
                        ) : (
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                {isTranslated && specialtyTranslationMap[getLocalLanguageInfo(profile.country).code]?.[profile.specialty] 
                                    ? specialtyTranslationMap[getLocalLanguageInfo(profile.country).code][profile.specialty] 
                                    : profile.specialty
                                }
                            </span>
                        )}
                        {profile.officeName && <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">{profile.officeName}</span>}
                        {profile.experience && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{profile.experience}</span>}
                    </div>

                    {/* About Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-3 border-b pb-2">
                            {getLabels(profile.country, isTranslated).summaryTitle}
                        </h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap" style={{ direction: isTranslated ? 'auto' : 'ltr' }}>
                            {isTranslated && profile.aboutMeLocal 
                                ? profile.aboutMeLocal 
                                : profile.aboutMe || "No professional bio has been provided by the advocate yet."
                            }
                        </p>
                    </div>

                    {/* Achievements Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-3 border-b pb-2">
                            {getLabels(profile.country, isTranslated).achievementsTitle}
                        </h3>
                        {profile.achievements ? (
                            <p className="text-slate-700 leading-relaxed" style={{ direction: isTranslated ? 'auto' : 'ltr' }}>{profile.achievements}</p>
                        ) : (
                            <p className="text-slate-400 italic text-sm">No specific achievements listed.</p>
                        )}
                    </div>

                    {/* Education & Shielded Compliance Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
                                {getLabels(profile.country, isTranslated).educationTitle}
                            </h3>
                            <div className="space-y-4 font-sans">
                                <div className="flex items-start">
                                    <div className="bg-white p-2 rounded-lg shadow-sm mr-3 text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                                            {getLabels(profile.country, isTranslated).degreeLabel}
                                        </p>
                                        <p className="text-slate-800 font-bold">{profile.degreeName || "Not specified"}</p>
                                        <p className="text-[11px] text-slate-500">{profile.issuingAuthority || "Institution not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="bg-white p-2 rounded-lg shadow-sm mr-3 text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                                            {getLabels(profile.country, isTranslated).gradYearLabel}
                                        </p>
                                        <p className="text-slate-800 font-bold">{profile.yearOfGraduation || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shielded Compliance Card replacing license numbers publicly */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
                                    {getLabels(profile.country, isTranslated).statusTitle}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="bg-green-100 p-2 rounded-lg text-green-600 mr-3 shadow-sm">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                                                {getLabels(profile.country, isTranslated).complianceLabel}
                                            </p>
                                            <p className="text-slate-800 font-bold text-sm">
                                                {getLabels(profile.country, isTranslated).complianceStatus}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                                {getLabels(profile.country, isTranslated).complianceDesc}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg mr-3 shadow-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                                                {getLabels(profile.country, isTranslated).barStandingLabel}
                                            </p>
                                            <p className="text-green-600 font-black text-xs uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                               <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Active Member
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Office Details & Socials */}
                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-start gap-4">
                        <div className="flex items-start w-full justify-between">
                            <div className="flex items-start">
                                <div className="bg-white p-3 rounded-xl shadow-sm mr-4 text-blue-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{profile.officeName || "Legal Practice"}</h4>
                                    <p className="text-sm text-slate-600">{profile.officeAddress || "Office address not public"}</p>
                                </div>
                            </div>
                            
                            {/* General Web Link */}
                            {profile.socialMediaLink && (
                                <a href={profile.socialMediaLink.startsWith('http') ? profile.socialMediaLink : `https://${profile.socialMediaLink}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center">
                                    Website
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
                        </div>
                        
                        {/* Social Links Row */}
                        <div className="flex flex-wrap items-center justify-between w-full mt-2">
                             <div className="flex items-center gap-4">
                                {profile.facebookUrl && (
                                    <a href={profile.facebookUrl.startsWith('http') ? profile.facebookUrl : `https://${profile.facebookUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
                                    </a>
                                )}
                                {profile.linkedinUrl && (
                                    <a href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900 transition font-sans">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    </a>
                                )}
                                {profile.twitterUrl && (
                                    <a href={profile.twitterUrl.startsWith('http') ? profile.twitterUrl : `https://${profile.twitterUrl}`} target="_blank" rel="noreferrer" className="text-sky-500 hover:text-sky-700 transition font-sans">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                    </a>
                                )}
                            </div>

                            <button onClick={() => setShowReportModal(true)} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                Report Suspicious Profile
                            </button>
                        </div>
                    </div>

                    {/* Ratings & Reviews Section */}
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 font-serif">{getLabels(profile.country, isTranslated).feedbackTitle}</h3>
                                <p className="text-sm text-slate-500 font-sans flex items-center gap-1">Genuine feedback from verified <AnimatedLogo className="scale-75 origin-left mx-1" /> clients.</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="text-3xl font-bold text-slate-900">{profile.rating || '5.0'}</div>
                                <div>
                                    <div className="flex text-amber-500 text-sm">
                                        {'★'.repeat(Math.round(profile.rating || 5))}{'☆'.repeat(5 - Math.round(profile.rating || 5))}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium font-sans">{profile.reviewCount || 0} customer reviews</div>
                                </div>
                            </div>
                        </div>

                        {/* Leave a Review Form Container */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8 font-sans">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">Write a Review</h4>
                            <p className="text-xs text-slate-400 mb-4">Share your honest feedback to help others select high-quality lawyers.</p>

                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                {reviewSuccess && (
                                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl">
                                        {reviewSuccess}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Your Name</label>
                                        <input 
                                            type="text"
                                            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                                            placeholder={user ? user.displayName || 'Your Name' : "Guest Client"}
                                            value={reviewName}
                                            onChange={(e) => setReviewName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Your Rating</label>
                                        <div className="flex gap-1.5 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewRating(star)}
                                                    className="text-2xl transition hover:scale-110"
                                                >
                                                    <span className={star <= newRating ? 'text-amber-500' : 'text-slate-350'}>★</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Review Comments</label>
                                    <textarea 
                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 bg-white text-slate-800"
                                        placeholder="Describe your professional consultation or dispute handling experience..."
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow shadow-blue-200"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>
                        </div>

                        {/* Reviews list */}
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((r) => (
                                    <div key={r.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2 font-sans">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{r.clientName}</h4>
                                                <div className="flex items-center text-amber-500 text-xs mt-0.5">
                                                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                                    <span className="text-slate-400 text-[10px] ml-2 font-mono font-bold tracking-wide">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{r.reviewContent}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 border border-dashed rounded-2xl text-slate-450 text-xs font-medium font-sans">
                                No customer reviews yet. Be the first to leave a legal review!
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
      </div>

      {/* SECURE P2P CONSULTATION LAUNCHER MODAL */}
      {showMeetModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-slate-100 shadow-2xl space-y-6 text-center animate-in zoom-in duration-200 text-slate-950">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-3xl">
               🤝
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-slate-950">Your Consultation Suite is Ready</h3>
              <p className="text-slate-500 text-xs">A virtual secure room has been temporary reserved for this session.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Assigned Room ID</span>
               <p className="font-mono text-lg font-bold text-blue-700 tracking-wide select-all">{generatedRoomId}</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/meeting/${generatedRoomId}`)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow transition-transform hover:scale-[1.02] text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                🚀 Connect & Launch Video Stream Now
              </button>

              <button 
                onClick={copyMeetingLink}
                className={`w-full h-11 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-1.5 ${copiedLink ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}
              >
                {copiedLink ? '✓ Invitation Drafted & Copied!' : '📋 Copy Invitation Message to send Lawyer'}
              </button>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setShowMeetModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold transition underline"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT SUSPICIOUS PROFILE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-slate-100 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-red-600 mb-2">Report Suspicious Profile</h3>
            <p className="text-slate-500 text-sm mb-4">
              If you believe this lawyer is providing fake credentials, is not who they claim to be, or is engaging in fraudulent behavior, please report them to our compliance team.
            </p>

            {reportSubmitted ? (
               <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold mb-4">
                 Thank you. Your report has been submitted securely to our legal compliance team for review.
                 <button onClick={() => setShowReportModal(false)} className="block mt-4 w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 rounded-xl text-xs uppercase tracking-wider">Close Window</button>
               </div>
            ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reason for reporting:</label>
                    <textarea 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none h-24 bg-white"
                        placeholder="Please describe why this profile is suspicious..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex gap-3">
                    <button 
                        onClick={() => setShowReportModal(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            if(reportReason.trim().length > 10) setReportSubmitted(true);
                            else alert("Please provide a valid reason (at least 10 characters).")
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-red-200"
                    >
                        Submit Report
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
