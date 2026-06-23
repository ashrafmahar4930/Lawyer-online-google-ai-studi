import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getArticles, getCountries, getCitiesByCountry, getAllLawyers } from '../services/mockDataService';
import { Article, LawyerProfile, Country } from '../types';
import { logService } from '../services/logService';
import BloodMarquee from '../components/BloodMarquee';
import SearchableSelect from '../components/SearchableSelect';
import { 
  Search, 
  Heart, 
  Bot, 
  HelpCircle, 
  BookOpen, 
  Briefcase, 
  ChevronRight, 
  Users, 
  Flag, 
  FileText, 
  TrendingUp, 
  PhoneCall, 
  UserPlus, 
  Clipboard,
  ShieldAlert,
  Layers,
  Sparkles,
  Droplet,
  MoveHorizontal
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const totalUsers = lawyers.length;
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Dropdown Data
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    const loadInitData = async () => {
        setIsDataLoading(true);
        try {
            // Fetch Articles
            try {
                const fetchedArticles = await getArticles();
                setArticles(fetchedArticles);
            } catch (error) {
                logService.error("Failed to load articles", error, 'Home');
            }
            
            // Fetch Lawyers for Marquee
            try {
                const fetchedLawyers = await getAllLawyers();
                // Prioritize verified, then shuffle so they look dynamic each load
                fetchedLawyers.sort((a, b) => {
                  if (a.isVerified !== b.isVerified) {
                      return a.isVerified ? -1 : 1;
                  }
                  return 0.5 - Math.random();
                });
                setLawyers(fetchedLawyers);
            } catch (error) {
                logService.error("Failed to load lawyers", error, 'Home');
            }

            // Fetch Countries
            try {
                const countries = await getCountries();
                setAvailableCountries(countries);
            } catch (error) {
                logService.error("Failed to load countries", error, 'Home');
            }

        } catch (error) {
            logService.error("Error loading home data", error, 'Home');
        } finally {
            setIsDataLoading(false);
        }
    };
    loadInitData();
  }, []);

  // Update cities when country changes
  useEffect(() => {
      const loadCities = async () => {
          if (country) {
              const cities = await getCitiesByCountry(country);
              setAvailableCities(cities);
              setCity(''); // Reset city selection
          } else {
              setAvailableCities([]);
              setCity('');
          }
      };
      loadCities();
  }, [country]);

  const handleSearch = () => {
    navigate(`/find-lawyers?specialty=${specialty}&country=${country}&city=${city}`);
  };

  // Helper to get flag code
  const getFlagUrl = (countryName?: string) => {
      const map: Record<string, string> = {
          'Pakistan': 'pk', 'United States': 'us', 'USA': 'us', 'United Kingdom': 'gb', 'UK': 'gb',
          'Canada': 'ca', 'Australia': 'au', 'India': 'in', 'UAE': 'ae',
          'Saudi Arabia': 'sa', 'Turkey': 'tr', 'Germany': 'de', 'France': 'fr',
          'Malaysia': 'my', 'Singapore': 'sg', 'South Africa': 'za', 'Bangladesh': 'bd'
      };
      const code = map[countryName || ''] || 'pk'; 
      return `https://flagcdn.com/w320/${code}.png`;
  };

  return (
    <div className="flex flex-col font-sans bg-slate-50 min-h-screen">
      
      {/* 1. COMPACT HERO HEADER WITH BACKGROUND WALLPAPER */}
      <div className="border-b border-slate-800 pt-5 pb-4 px-4 relative overflow-hidden bg-slate-950">
        <img 
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=60" 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-55 pointer-events-none"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/65 to-slate-950/90 pointer-events-none"></div>
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left relative z-10">
          <div className="flex flex-col items-center md:items-start -mt-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">
              Legal Portal & <span className="text-amber-400">Human Life Network</span>
            </h1>
            <p className="text-slate-100 text-xs md:text-sm mt-1 max-w-xl font-bold drop-shadow-lg">
              Your Trusted Gateway to Premium Legal Counsel, Smart Ledger Wallets, and Immediate Crisis Blood Lifelines.
            </p>
          </div>
          <div className="flex flex-row gap-3 items-center">
            <Link to="/qa" className="geli-btn-sky text-center rounded-2xl py-3 px-5 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-white" /> Ask Law Question
            </Link>
            <Link to="/blood-donation" className="geli-btn-rose text-center rounded-2xl py-3 px-5 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Droplet className="w-4 h-4 fill-current text-white animate-heartbeat" /> Save a Life
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN BENTO GRID CONTROL PANEL (VISIBLE WITHOUT SCROLLING!) */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* BOX A: SMART ADVOCATE SEARCH DESK WITH PREMIUM WALLPAPER (lg:col-span-4) */}
          <div className="lg:col-span-4 text-white rounded-[2rem] p-5 shadow-2xl border border-white/35 flex flex-col justify-between relative overflow-hidden group bg-slate-950 shadow-blue-500/20">
            <img 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=40" 
              alt="Advocate Finder" 
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 to-slate-950/75 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full pointer-events-none"></div>
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Advocate Finder</span>
                <Search className="w-4 h-4 text-blue-400" />
              </div>
              
              <p className="text-xs text-slate-350 mb-4 font-semibold leading-relaxed">
                Choose location and legal specialty to retrieve verified court lawyers instantly.
              </p>

              {/* Input selects */}
              <div className="space-y-3.5 relative z-20">
                <div>
                  <label className="block text-[9.5px] font-black text-sky-300 uppercase tracking-widest mb-1.5 ml-1">1. Select Country</label>
                  <SearchableSelect 
                    isDark={false}
                    className="geli-select-sky-wrapper"
                    options={availableCountries.map(c => ({ value: c.name, label: c.name }))}
                    value={country}
                    onChange={(val) => setCountry(val)}
                    placeholder="Select Country"
                  />
                </div>

                <div className="relative z-10">
                  <label className="block text-[9.5px] font-black text-sky-300 uppercase tracking-widest mb-1.5 ml-1">2. Select City</label>
                  <SearchableSelect 
                    isDark={false}
                    disabled={!country}
                    options={availableCities.map(c => ({ value: c, label: c }))}
                    value={city}
                    onChange={(val) => setCity(val)}
                    placeholder="Select City"
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] font-black text-sky-300 uppercase tracking-widest mb-1.5 ml-1">3. Select Specialty</label>
                  <SearchableSelect 
                    isDark={false}
                    options={[
                      { value: "Family Law", label: "Family Law" },
                      { value: "Criminal Law", label: "Criminal Law" },
                      { value: "Corporate Law", label: "Corporate Law" },
                      { value: "Tax Law", label: "Tax Law" },
                      { value: "Civil Litigation", label: "Civil Litigation" },
                      { value: "Immigration", label: "Immigration" },
                      { value: "Real Estate", label: "Real Estate" },
                    ]}
                    value={specialty}
                    onChange={(val) => setSpecialty(val)}
                    placeholder="Select Specialty"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="w-full h-12 geli-btn-sky uppercase tracking-widest flex items-center justify-center gap-1.5 mt-5 cursor-pointer rounded-2xl"
            >
              <Search className="w-4 h-4 mr-1 animate-pulse text-white" /> Find Advocate
            </button>

            {/* COMPACT VERIFIED ADVOCATES SCROLLING MARQUEE */}
            <div className="relative w-full overflow-hidden bg-slate-950/40 py-3 rounded-2xl border border-white/5 mt-4 shadow-inner">
              <div className="flex animate-scroll whitespace-nowrap hover:pause-animation items-center" style={{ animation: `scroll 30s linear infinite` }}>
                 {[...lawyers, ...lawyers].slice(0, 8).map((lawyer, idx) => (
                     <div key={`${lawyer.uid}-${idx}`} className="flex items-center shrink-0 w-[240px] h-[76px] bg-slate-900 border border-white/10 rounded-xl p-3 mx-1.5 relative group overflow-hidden text-left hover:border-blue-500/40 transition-all">
                         <div className="flex gap-3 items-center w-full">
                             <img 
                                  src={lawyer.picture || `https://ui-avatars.com/api/?name=${lawyer.fullName}&background=random`} 
                                  alt={lawyer.fullName} 
                                  className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0 shadow-sm"
                             />
                             <div className="min-w-0 flex-grow">
                                  <h4 className="font-extrabold text-xs text-white truncate font-serif" title={lawyer.fullName}>{lawyer.fullName}</h4>
                                  <p className="text-[10px] text-blue-400 font-bold truncate uppercase tracking-tight">{lawyer.specialty}</p>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{lawyer.city || 'City'}</p>
                             </div>
                             <img src={getFlagUrl(lawyer.country)} alt="flag" className="w-5 h-auto opacity-80 shrink-0 shadow" />
                          </div>
                          {/* Visual overlay trigger */}
                          <Link to={`/lawyer/${lawyer.uid}`} className="absolute inset-0 z-10" aria-label={`View ${lawyer.fullName}`}></Link>
                      </div>
                  ))}
              </div>
            </div>
          </div>

          {/* BOX B: EMERGENCY BLOOD DESK WITH VISUAL BACKGROUND WALLPAPER (lg:col-span-4) */}
          <div className="lg:col-span-4 text-white rounded-[2rem] p-5 shadow-2xl border border-white/25 flex flex-col justify-between relative overflow-hidden group bg-slate-950 shadow-blue-900/40 transition-all duration-350">
            <img 
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=40" 
              alt="Lifeline BG" 
              className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-950/90 pointer-events-none"></div>
            <div className="absolute -right-6 -bottom-6 opacity-[0.06] pointer-events-none animate-heartbeat">
              <Droplet className="w-48 h-48 text-red-500 fill-red-500" />
            </div>
            
            <div>
              <div className="flex justify-between items-center border-b border-white/20 pb-3 mb-4">
                <span className="text-lg font-black uppercase text-white tracking-wider drop-shadow-md">Human Lifeline Desk</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              </div>

              <p className="text-[13px] text-sky-100/95 mb-4 font-semibold leading-relaxed drop-shadow-sm">
                Connect live to urgent hospital appeals. System auto-deletes details after 24 hours to secure user privacy.
              </p>

              {/* Miniature actions */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <Link 
                  to="/blood-donation" 
                  className="geli-btn-sky rounded-xl text-center py-2.5 px-2 uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <UserPlus className="w-4 h-4 text-white" /> Join Donor
                </Link>
                <Link 
                  to="/blood-donation" 
                  className="geli-btn-sky rounded-xl text-center py-2.5 px-2 uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Clipboard className="w-4 h-4 text-white" /> Submit Appeal
                </Link>
              </div>
            </div>

            {/* LIVE APPEALS IN-BOX MARQUEE */}
            <div className="bg-sky-500/[0.06] backdrop-blur-md rounded-3xl p-1 border border-white/15 mt-1 flex flex-col justify-center items-center w-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
              <BloodMarquee />
            </div>
          </div>

          {/* BOX C: SMART AI ASSISTANT WITH HIGH-TECH GRAPHIC WALLPAPER (lg:col-span-4) */}
          <div className="lg:col-span-4 text-white rounded-[2rem] p-5 shadow-2xl border border-white/35 flex flex-col justify-between relative overflow-hidden group bg-slate-950 shadow-indigo-550/20">
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=40" 
              alt="AI Copilot" 
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/25 to-slate-950/75 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none"></div>
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">AI Copilot & Legal Consult</span>
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>

              <p className="text-xs text-slate-350 mb-4 leading-relaxed font-semibold">
                Access server-side Gemini intelligence for active case preparation, mock courtroom simulation, and expert drafts.
              </p>

              <div className="space-y-2 mb-5">
                <Link to="/dashboard/lawyer/tools" className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-950/40 to-indigo-900/20 hover:from-indigo-950/60 hover:to-indigo-900/35 rounded-xl border border-indigo-500/15 hover:border-indigo-500/35 transition-all text-xs text-indigo-300 hover:scale-[1.012] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
                  <span className="font-extrabold text-indigo-300">Lawyer AI Tools Suite</span>
                  <ChevronRight className="w-4 h-4 text-indigo-455 text-indigo-400 font-bold" />
                </Link>
                <Link to="/qa" className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-950/40 to-blue-900/20 hover:from-blue-950/60 hover:to-blue-900/35 rounded-xl border border-blue-500/15 hover:border-blue-500/35 transition-all text-xs text-blue-300 hover:scale-[1.012] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
                  <span className="font-extrabold text-blue-300">Free Public Legal Q&A Forum</span>
                  <ChevronRight className="w-4 h-4 text-blue-400 font-bold" />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-white/10">
              <span className="text-[9px] font-black uppercase text-slate-400">Fast Advice</span>
              <Link to="/qa" className="geli-btn-sky text-center rounded-lg py-2 px-4 uppercase tracking-widest text-xs flex items-center justify-center">
                Ask Question
              </Link>
            </div>
          </div>

          {/* BOX D: THE DIGITAL LEDGER LEDGER & DASHBOARD SHORTCUTS WITH LEDGER WALLPAPER (lg:col-span-4) */}
          <div className="lg:col-span-4 border border-white/35 text-white rounded-[2rem] p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden group bg-slate-950 shadow-amber-550/20">
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=40" 
              alt="Ledger Wallpaper" 
              className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-950/95 pointer-events-none"></div>
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Bookkeeping Wallet</span>
                <FileText className="w-4 h-4 text-amber-400" />
              </div>

              <p className="text-xs text-slate-350 mb-4 leading-relaxed font-semibold">
                Track lawyer services, retainers, and client ledger histories. Eliminate transaction disputes transparently.
              </p>

              <div className="space-y-2 mb-4">
                <Link to="/dashboard/client" className="flex items-center justify-between p-2.5 bg-gradient-to-r from-indigo-950/20 to-indigo-900/10 hover:from-indigo-950/40 hover:to-indigo-900/25 rounded-xl border border-indigo-500/10 hover:border-indigo-400/30 transition text-[11px] font-bold shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] hover:scale-[1.01]">
                  <span>Client Dashboard</span>
                  <span className="text-[9px] bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">Access</span>
                </Link>
                <Link to="/dashboard/lawyer" className="flex items-center justify-between p-2.5 bg-gradient-to-r from-amber-950/20 to-amber-900/10 hover:from-amber-950/40 hover:to-amber-900/25 rounded-xl border border-amber-500/10 hover:border-amber-400/30 transition text-[11px] font-bold shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] hover:scale-[1.01]">
                  <span>Lawyer Dashboard</span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">Access</span>
                </Link>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between gap-1 mt-3">
              <span className="text-[9px] font-black text-slate-500 uppercase">Trust Shield Protected</span>
              <span className="text-[9px] text-green-400 font-extrabold">Active SSL 256bit</span>
            </div>
          </div>

          {/* BOX E: SEAMLESS LEGAL MARQUEE WITH GRAND COURT/LIBRARY WALLPAPER (lg:col-span-8) */}
          <div className="lg:col-span-8 border border-slate-350 rounded-[2rem] p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden group bg-slate-50">
            <img 
              src="https://images.unsplash.com/photo-1505664194779-8bebcb95c557?auto=format&fit=crop&w=800&q=50" 
              alt="Legal Marquee" 
              className="absolute inset-0 w-full h-full object-cover opacity-12 group-hover:scale-105 transition-transform duration-1000 pointer-events-none"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-slate-50/70 to-slate-100/90 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center border-b border-slate-200/50 pb-3 mb-4">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Verified Supreme Court Advocates</span>
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded border border-green-200 uppercase tracking-widest leading-none">Online Network</span>
              </div>
              
              <p className="text-xs text-slate-500 mb-3.5 leading-relaxed font-semibold">
                Click on any verified practitioner card below to consult via secure local language chats and instant direct video consult meetings.
              </p>
            </div>

            {/* Beautiful, responsive grid of Verified Supreme Court Advocates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3 relative z-10">
                 {lawyers.slice(0, 3).map((lawyer) => (
                     <div key={lawyer.uid} className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl p-4 relative group transition-all duration-300 hover:shadow-md text-left flex flex-col justify-between h-[130px] shadow-sm">
                         <div className="flex gap-3 items-start">
                             <img 
                                  src={lawyer.picture || `https://ui-avatars.com/api/?name=${lawyer.fullName}&background=random`} 
                                  alt={lawyer.fullName} 
                                  className="w-11 h-11 rounded-full object-cover border border-white shadow-sm shrink-0"
                             />
                             <div className="min-w-0 flex-grow">
                                  <h4 className="font-extrabold text-xs text-slate-900 truncate font-serif" title={lawyer.fullName}>{lawyer.fullName}</h4>
                                  <p className="text-[9px] text-blue-600 font-extrabold truncate uppercase tracking-wider mt-0.5">{lawyer.specialty}</p>
                                  <p className="text-[10px] text-slate-500 font-medium truncate mt-1">{lawyer.city || 'City'}</p>
                             </div>
                             <img src={getFlagUrl(lawyer.country)} alt="flag" className="w-4.5 h-auto shadow-sm shrink-0 mt-0.5" />
                          </div>
                          
                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-blue-600 mt-2">
                            <span>Consult Now</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                          {/* Visual overlay trigger */}
                          <Link to={`/lawyer/${lawyer.uid}`} className="absolute inset-0 z-10" aria-label={`View ${lawyer.fullName}`}></Link>
                      </div>
                  ))}
            </div>

            {/* Old slider wrapped safely */}
            <div className="hidden">
              <div className="flex animate-scroll whitespace-nowrap hover:pause-animation" style={{ animation: `scroll 35s linear infinite` }}>
                 {[...lawyers, ...lawyers].slice(0, 8).map((lawyer, idx) => (
                     <div key={`${lawyer.uid}-${idx}`} className="inline-block shrink-0 w-[240px] bg-white rounded-xl shadow-sm hover:shadow-md mx-2.5 relative group border border-slate-200 overflow-hidden text-left">
                         <div className="flex p-2.5 gap-2.5 items-center">
                             <img 
                                 src={lawyer.picture || `https://ui-avatars.com/api/?name=${lawyer.fullName}&background=random`} 
                                 alt={lawyer.fullName} 
                                 className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                             />
                             <div className="min-w-0 flex-grow">
                                 <h4 className="font-bold text-xs text-slate-900 truncate font-serif" title={lawyer.fullName}>{lawyer.fullName}</h4>
                                 <p className="text-[9px] text-blue-600 font-bold truncate uppercase tracking-tight">{lawyer.specialty}</p>
                                 <p className="text-[8px] text-slate-400 truncate mt-0.5">{lawyer.city || 'City'}, {lawyer.country || 'Country'}</p>
                             </div>
                             <img src={getFlagUrl(lawyer.country)} alt="flag" className="w-4 h-auto shadow-sm shrink-0" />
                         </div>
                         {/* Visual overlay trigger */}
                         <Link to={`/lawyer/${lawyer.uid}`} className="absolute inset-0 z-10" aria-label={`View ${lawyer.fullName}`}></Link>
                     </div>
                 ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest pt-3.5 border-t border-slate-100 relative z-10">
               <span>Interactive Cards</span>
               <Link to="/find-lawyers" className="bg-gradient-to-b from-white to-slate-100 hover:from-white hover:to-slate-50 text-slate-900 border border-slate-200 border-t-white border-b-slate-300 shadow-[inset_0_1.5px_2px_white,0_2px_5px_rgba(0,0,0,0.05)] rounded-lg py-1.5 px-3.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all hover:scale-105 active:scale-95">
                  View All <ChevronRight className="w-3.5 h-3.5" />
               </Link>
            </div>
          </div>

        </div>
      </div>

      {/* 3. EXPERT LEGAL GUIDES & ARTICLES */}
      <div className="py-12 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 max-w-7xl">
              <div className="flex justify-between items-end mb-8 gap-4 border-b border-slate-100 pb-5">
                  <div className="text-left">
                      <h2 className="text-xl md:text-2xl font-black text-slate-950 leading-none">Legal Library & Guidelines</h2>
                      <p className="text-slate-500 text-xs mt-1.5 font-medium">Read professional documents, guides, and constitutional knowledge base articles.</p>
                  </div>
                  <Link to="/legal-guides" className="text-blue-600 font-black text-[11px] uppercase tracking-wider hover:underline leading-none">View All guides →</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {articles.slice(0, 3).map(article => (
                      <Link to={`/article/${article.slug}`} key={article.id} className="group bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-300">
                          <div className="h-32 overflow-hidden relative">
                              <img 
                                src={article.featuredImage || `https://picsum.photos/seed/${article.id}/800/400`} 
                                alt={article.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                          </div>
                          <div className="p-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded leading-none shrink-0 border border-amber-100">Manual</span>
                                  <span className="text-[9px] text-slate-400 font-bold">{article.date}</span>
                              </div>
                              <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{article.title}</h3>
                              <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed mb-3">{article.description}</p>
                              <div className="flex items-center text-blue-600 font-black text-[9px] uppercase tracking-widest">
                                  Read Full Guide
                                  <ChevronRight className="ml-0.5 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                          </div>
                      </Link>
                  ))}
                  {articles.length === 0 && !isDataLoading && (
                      <p className="col-span-full text-center py-6 text-slate-400 text-xs">Knowledge base is being updated dynamically. Please check back.</p>
                  )}
              </div>
          </div>
      </div>

      {/* 3.5 VISUAL PRACTICE SPECIALTIES WITH WALLPAPERS */}
      <div className="py-12 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden">
          {/* Subtle decoration blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-800 pb-5">
                  <div className="text-left">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest bg-blue-950/60 px-2.5 py-1 rounded border border-blue-900">Explore Channels</span>
                      <div className="flex items-center gap-3 mt-2">
                          <h2 className="text-xl md:text-2xl font-black text-white leading-none">Practice Specialty Subforums</h2>
                          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 mt-1">
                              <MoveHorizontal className="w-3 h-3 text-slate-400" />
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Swipe</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto">
                      <div className="sm:hidden flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                          <MoveHorizontal className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Swipe</span>
                      </div>
                      <Link to="/qa" className="text-amber-400 font-extrabold text-[11px] uppercase tracking-wider hover:underline leading-none flex items-center gap-1">
                          Enter Q&A Forum Floor <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                  </div>
              </div>

              <div className="flex overflow-x-auto pb-6 gap-6 hover:pause-animation snap-x scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 px-1">
                {[
                  { name: 'Family Law', handle: 'r/FamilyLaw', icon: '👨‍👩‍👧‍👦', bg: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80', description: 'Child custody, dower/maintenance claims, separation mediation.' },
                  { name: 'Corporate Law', handle: 'r/CorporateLaw', icon: '🏢', bg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', description: 'Company incorporations, corporate structures, partnership filings.' },
                  { name: 'Criminal Law', handle: 'r/CriminalLaw', icon: '🚨', bg: 'https://images.unsplash.com/photo-1505664194779-8bebcb95c557?auto=format&fit=crop&w=600&q=80', description: 'Bail petitions, right to protective counsel, criminal trials.' },
                  { name: 'Civil Disputes', handle: 'r/CivilDisputes', icon: '🤝', bg: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80', description: 'Eviction stays, registry verifications, property assessors.' },
                  { name: 'Cyber Law & IT', handle: 'r/CyberLaw', icon: '💻', bg: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80', description: 'Digital identity theft, financial web scams, cyber crimes.' },
                  { name: 'Property & Rent', handle: 'r/PropertyRent', icon: '🏠', bg: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80', description: 'Eviction notices, lease agreements, tenant dispute settlements.' }
                ].map((area, idx) => (
                    <Link 
                      key={idx} 
                      to={`/qa?category=${encodeURIComponent(area.name)}`}
                      className="group relative rounded-3xl p-6 h-[160px] min-w-[280px] md:min-w-[320px] snap-start overflow-hidden border border-white/20 flex flex-col justify-between shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-400 bg-slate-950 shrink-0"
                    >
                      <img 
                        src={area.bg} 
                        alt={area.name} 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/50 to-slate-950/85 pointer-events-none" />
                      
                      {/* Frosted shine trigger */}
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <span className="text-2xl filter drop-shadow select-none">{area.icon}</span>
                        <span className="text-[9px] font-black tracking-widest uppercase bg-slate-950/70 border border-white/10 rounded-full px-3 py-1 text-slate-350">{area.handle}</span>
                      </div>
                      
                      <div className="relative z-10">
                        <h3 className="text-white font-extrabold text-sm group-hover:text-blue-400 transition-colors tracking-wide drop-shadow mb-1">
                          {area.name}
                        </h3>
                        <p className="text-slate-400 text-[10.5px] leading-snug line-clamp-2">{area.description}</p>
                      </div>
                    </Link>
                ))}
              </div>
          </div>
      </div>

      {/* 4. PLATFORM STATISTICS & LAWYER SIGNUP PORTAL */}
      <div className="py-12 bg-slate-50 border-t border-slate-150">
          <div className="container mx-auto px-4 max-w-7xl">
              
              {/* Stats widgets grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">👥</div>
                      <div>
                          <div className="text-lg font-black text-slate-900 leading-none">{totalUsers}+</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Lawyers Verified</div>
                      </div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">🌐</div>
                      <div>
                          <div className="text-lg font-black text-slate-900 leading-none">{availableCountries.length > 0 ? `${availableCountries.length}+` : '15+'}</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Countries Covered</div>
                      </div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm shrink-0">✓</div>
                      <div>
                          <div className="text-lg font-black text-slate-900 leading-none">98%</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">User Satisfaction</div>
                      </div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">🩸</div>
                      <div>
                          <div className="text-lg font-black text-slate-900 leading-none">Active</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Blood Rescue Desk</div>
                      </div>
                  </div>
              </div>

              {/* Recruitment card */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden text-white border border-slate-800 shadow-lg">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-blue-600 opacity-20 filter blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
                  
                  <h2 className="text-xl md:text-3xl font-black text-white mb-3 tracking-tight">Are you a qualified legal practitioner?</h2>
                  <p className="text-slate-400 text-xs max-w-xl mx-auto mb-6">Create your verified counselor desk. Gain clients globally, utilize AI drafting utilities, and manage legal case fees transparently.</p>
                  <Link to="/signup" className="inline-block bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] font-black uppercase tracking-widest text-[11px] py-4 px-8 rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95">
                     Create Advocate Profile
                  </Link>
              </div>

          </div>
      </div>

    </div>
  );
}

