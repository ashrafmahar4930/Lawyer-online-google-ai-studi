import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  getLegalQuestions, 
  addLegalQuestion, 
  getQuestionAnswers, 
  addLegalAnswer, 
  getLawyerProfile,
  voteLegalQuestion,
  voteLegalAnswer
} from '../services/mockDataService';
import { LegalQuestion, LegalAnswer, LawyerProfile } from '../types';
import { useAuth } from '../App';
import { 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Share2, 
  CheckCircle2, 
  BookOpen, 
  Info, 
  Scale, 
  MessageSquare, 
  Plus,
  Users,
  Building,
  Shield,
  Search,
  Eye,
  BadgeAlert,
  ClipboardCheck,
  ChevronRight
} from 'lucide-react';
import AnimatedLogo from '../components/AnimatedLogo';

// Supported languages list for global translation
const TARGET_LANGUAGES = [
  { code: 'Auto', name: '🧠 Intelligent Auto-Detect' },
  { code: 'English', name: '🇺🇸 English (US/UK)' },
  { code: 'Urdu', name: '🇵🇰 Urdu (اردو)' },
  { code: 'Spanish', name: '🇪🇸 Spanish (Español)' },
  { code: 'Arabic', name: '🇸🇦 Arabic (العربية)' },
  { code: 'French', name: '🇫🇷 French (Français)' },
  { code: 'German', name: '🇩🇪 German (Deutsch)' },
  { code: 'Hindi', name: '🇮🇳 Hindi (हिन्दी)' }
];

const getGeliClassByTheme = (theme: string) => {
  switch (theme) {
    case 'emerald': return 'geli-btn-emerald text-white font-extrabold';
    case 'rose': return 'geli-btn-rose text-white font-extrabold';
    case 'amber': return 'geli-btn-amber text-slate-900 font-extrabold';
    case 'indigo': return 'geli-btn-indigo text-white font-extrabold';
    case 'violet': return 'geli-btn-indigo text-white font-extrabold';
    case 'pink': return 'geli-btn-rose text-white font-extrabold';
    case 'teal': return 'geli-btn-emerald text-white font-extrabold';
    case 'cyan': return 'geli-btn-primary text-white font-extrabold';
    default: return 'geli-btn-primary text-white font-extrabold';
  }
};

// LQ Group specific metadata mapping
interface LQGroupInfo {
  name: string;
  handle: string;
  description: string;
  icon: string;
  members: string;
  activeOnline: string;
  colorTheme: string;
  bgGradient: string;
  bgWallpaper: string;
  rules: string[];
}

const LQ_GROUP_MAP: Record<string, LQGroupInfo> = {
  'All': {
    name: 'Unified Jurisdictions Feed',
    handle: 'lq/All_Specialties',
    description: 'Trending legal disputes, bail filings, pro-bono inquiries, and active verified attorney replies globally.',
    icon: '⚖️',
    members: '24.8K members',
    activeOnline: '512 active advocates online',
    colorTheme: 'blue',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'Maintain client anonymity in fact descriptions.',
      'No hate speech or disrespect to legal partners.',
      'Only registered legal practitioners can publish formal opinions.'
    ]
  },
  'Family Law': {
    name: 'Family Court Procedures',
    handle: 'lq/FamilyLaw',
    description: 'Discussion on child custody, guardianship registrations, dower/maintenance claims, marital separations, and mediation filings worldwide.',
    icon: '👨‍👩‍👧‍👦',
    members: '12.4K members',
    activeOnline: '184 family consultants',
    colorTheme: 'emerald',
    bgGradient: 'from-emerald-950 via-slate-950 to-emerald-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'Prioritize minor welfare and security in dispute summaries.',
      'Cite regional statutory provisions or relevant family codes.',
      'Answers are for educational awareness, not a formal legal retainer.'
    ]
  },
  'Corporate Law': {
    name: 'Corporate & Business Filings',
    handle: 'lq/CorporateLaw',
    description: 'Company incorporations, partnership structures, commercial regulations, advisory compliance, and international trademark protections.',
    icon: '🏢',
    members: '18.1K members',
    activeOnline: '240 tax & corporate counsels',
    colorTheme: 'indigo',
    bgGradient: 'from-indigo-950 via-slate-950 to-indigo-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'No publication of trade secrets or actual corporate IDs.',
      'Specify federal, regional, or international jurisdictional context.',
      'Refer to compliance guidelines or business statutory codes.'
    ]
  },
  'Criminal Law': {
    name: 'Criminal Defense Guidelines',
    handle: 'lq/CriminalLaw',
    description: 'Police report procedures, statutory defense rules, protective bail petitions, investigative rights, and judicial custody standards.',
    icon: '🚨',
    members: '21.2K members',
    activeOnline: '310 criminal trial lawyers',
    colorTheme: 'rose',
    bgGradient: 'from-rose-950 via-slate-950 to-rose-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1505664194779-8bebcb95c557?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'Strictly avoid listing active judicial branch case numbers.',
      'Differentiate minor infractions from severe felony procedures.',
      'Provide general pathways for pre-trial or bail processing.'
    ]
  },
  'Civil Disputes': {
    name: 'Civil Procedure & Specific Relief',
    handle: 'lq/CivilDisputes',
    description: 'Partition suit procedures, civil injunctions, stay order requests, registry verifications, and power of attorney disputes.',
    icon: '🤝',
    members: '14.9K members',
    activeOnline: '195 registry advocates',
    colorTheme: 'amber',
    bgGradient: 'from-amber-950 via-slate-950 to-amber-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'Identify localized registry authority (Land assessor/Recorder of deeds context).',
      'Describe historical ownership duration when requesting status stays.',
      'Include procedural timelines for specific trial actions.'
    ]
  },
  'Cyber Law & IT': {
    name: 'Digital Defense & Cyber Crimes',
    handle: 'lq/CyberLaw',
    description: 'Identity theft, unauthorized hacking/scraping, online financial scams, and content removal procedures under international digital defense standards.',
    icon: '💻',
    members: '9.5K members',
    activeOnline: '112 digital defense lawyers',
    colorTheme: 'cyan',
    bgGradient: 'from-cyan-950 via-slate-950 to-cyan-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'File complaints with verified digital forensic or regional cyber offices.',
      'Advise users to preserve electronic metadata and communication logs.',
      'Ensure standard definitions (e.g. spoofing, phishing) match digital codes.'
    ]
  },
  'Taxation & Custom': {
    name: 'Global Taxation Standards',
    handle: 'lq/Taxation',
    description: 'Corporate and personal taxation, corporate customs, revenue audits, transactional taxes, and official audit responses.',
    icon: '📈',
    members: '8.9K members',
    activeOnline: '95 revenue auditors',
    colorTheme: 'violet',
    bgGradient: 'from-violet-950 via-slate-950 to-violet-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'Distinguish income/direct taxes from regional sales or value-added taxes.',
      'Provide realistic deadlines for formal custom review appeals.',
      'Tax advice is structural; verify with certified local CPAs.'
    ]
  },
  'Property & Rent': {
    name: 'Property Tenancy & Possession',
    handle: 'lq/PropertyRent',
    description: 'Landlord-tenant disputes, eviction proceedings, lease agreements, commercial tenancy defaults, and title deed validations.',
    icon: '🏠',
    members: '11.6K members',
    activeOnline: '142 rental tribunal executives',
    colorTheme: 'teal',
    bgGradient: 'from-teal-950 via-slate-950 to-teal-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'Review localized tenancy statutes or rent restriction codes.',
      'Detail appropriate notice timelines (such as standard 30-day notifications).',
      'Handle security deposit deposits as escrow items.'
    ]
  },
  'Intellectual Property': {
    name: 'Trademark & Copy Protection',
    handle: 'lq/IntellectualProperty',
    description: 'Logo trademark stages, utility patents, cross-border copy violations, trade secrets, and digital asset protections under global standards.',
    icon: '💡',
    members: '7.7K members',
    activeOnline: '89 patent agents',
    colorTheme: 'pink',
    bgGradient: 'from-pink-950 via-slate-950 to-pink-900',
    bgWallpaper: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    rules: [
      'Do not publish unregistered trade secrets or design files.',
      'Highlight territorial limitation limits of copyright/trademark filings.',
      'Differentiate designs, utility patents, and trade secrets.'
    ]
  }
};

export default function LegalQA() {
  const { user } = useAuth();
  
  // State variables
  const [questions, setQuestions] = useState<LegalQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<LegalQuestion | null>(null);
  const [answers, setAnswers] = useState<LegalAnswer[]>([]);
  
  // Create Question form state
  const [showAskForm, setShowAskForm] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askDesc, setAskDesc] = useState('');
  const [askCategory, setAskCategory] = useState('Family Law');
  const [askName, setAskName] = useState('');
  const [askCountry, setAskCountry] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [askSuccess, setAskSuccess] = useState('');
  const [askError, setAskError] = useState('');

  // Location and filtering state
  const [filterCountry, setFilterCountry] = useState('All');

  // Create Answer form state
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerSuccess, setAnswerSuccess] = useState('');
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'qa' | 'strategy'>('qa');

  // Sorting System (LQ Logarithmic Style)
  // Options: 'hot' | 'top' | 'new'
  const [sortOption, setSortOption] = useState<'hot' | 'top' | 'new'>('hot');

  // Infinite Scroll limit controllers
  const [visibleCount, setVisibleCount] = useState(4);
  const [isFeedLoadingMore, setIsFeedLoadingMore] = useState(false);

  // Translation states (Facebook style context toggle)
  const [translatedText, setTranslatedText] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [targetLanguage, setTargetLanguage] = useState<string>('Auto');

  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
    setTranslatedText({});
    setShowTranslation({});
  };

  // Voting states (LQ style upvote/downvote persistent tracking)
  const [userQuestionVotes, setUserQuestionVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [userAnswerVotes, setUserAnswerVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  // Copy share transient status hud
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);

  const categories = Object.keys(LQ_GROUP_MAP).filter(cat => cat !== 'All');

  // Synchronize category selection with URL search parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam && LQ_GROUP_MAP[catParam]) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory(''); // Shows Directory initially if no valid category query parameter
    }
  }, [window.location.search]);

  // Lock selected category inside the "Ask Question" form when browsing a specific category page
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      setAskCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Load questions
  useEffect(() => {
    const fetchQuestions = async () => {
      const dbQuestions = await getLegalQuestions();
      setQuestions(dbQuestions);
    };
    fetchQuestions();
  }, []);

  // Auto-detect user's country
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.country_name) {
          setAskCountry(data.country_name);
          setFilterCountry(data.country_name);
        }
      } catch (err) {
        console.warn('Could not auto-detect location', err);
      }
    };
    detectLocation();
  }, []);

  // Fetch lawyer profile details if logged in as lawyer
  useEffect(() => {
    const fetchLawyerProfile = async () => {
      if (user && user.role === 'lawyer') {
        const profile = await getLawyerProfile(user.uid);
        setLawyerProfile(profile || null);
      }
    };
    fetchLawyerProfile();
  }, [user]);

  // Reset infinite load count on category switch or sort change
  useEffect(() => {
    setVisibleCount(4);
  }, [selectedCategory, sortOption]);

  // Infinite scrolling handler (Window Scroll Listener)
  useEffect(() => {
    const handleScroll = () => {
      if (selectedQuestion) return; // Disable on detail drilldown view

      const threshold = 180;
      const totalHeight = document.documentElement.scrollHeight;
      const currentScroll = window.innerHeight + window.scrollY;

      if (currentScroll >= totalHeight - threshold && !isFeedLoadingMore) {
        // Evaluate if more results are remaining
        if (visibleCount < filteredQuestions.length) {
          setIsFeedLoadingMore(true);
          // Simulate dynamic block generation/processing delays
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + 4, filteredQuestions.length));
            setIsFeedLoadingMore(false);
          }, 600);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, questions, selectedCategory, sortOption, selectedQuestion]);

  // Load answers when question is clicked
  const handleQuestionSelect = async (question: LegalQuestion) => {
    setSelectedQuestion(question);
    const qAnswers = await getQuestionAnswers(question.id);
    setAnswers(qAnswers);
    
    // Increment local view count for realism
    setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, views: (q.views || 0) + 1 } : q));
  };

  // Submit new Question with content moderation & auto-answering
  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askTitle.trim() || !askDesc.trim()) return;
    setSubmittingQuestion(true);
    setAskError('');
    setAskSuccess('');
    try {
      const response = await fetch('/api/qa/moderate-and-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: askTitle,
          description: askDesc,
          category: askCategory,
          country: askCountry || 'Global',
          clientName: askName.trim() || user?.displayName || 'Anonymous Client',
          clientId: user?.uid || 'anonymous',
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned internal error during AI Moderation.');
      }

      const data = await response.json();

      if (data.approved) {
        setAskTitle('');
        setAskDesc('');
        setAskName('');
        setAskSuccess('Approved & Posted! Our AI Admin has also generated an instant draft answer below.');
        setAskError('');
        setTimeout(() => {
          setAskSuccess('');
          setShowAskForm(false);
        }, 4000);

        // Refresh list
        const dbQuestions = await getLegalQuestions();
        setQuestions(dbQuestions);
      } else {
        setAskError(data.rejectionReason || 'Content flagged by security. Please check for offensive language, scams, links or inappropriate non-legal content.');
        setAskSuccess('');
      }
    } catch (err) {
      console.error(err);
      setAskError('Connection lost or failed to reach AI Admin Bot.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Submit new Answer (Lawyers only)
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !newAnswerContent.trim() || !user) return;
    setSubmittingAnswer(true);
    try {
      const lName = lawyerProfile?.fullName || user.displayName || 'Advocate';
      const lTitle = lawyerProfile?.title || 'Registered Advocate';
      const lPic = lawyerProfile?.picture || undefined;

      await addLegalAnswer(
        selectedQuestion.id,
        newAnswerContent,
        user.uid,
        lName,
        lTitle,
        lPic
      );

      setNewAnswerContent('');
      setAnswerSuccess('Professional legal opinion published successfully!');
      setTimeout(() => setAnswerSuccess(''), 3000);

      // Refresh answers list
      const updatedAnswers = await getQuestionAnswers(selectedQuestion.id);
      setAnswers(updatedAnswers);

      // Refresh parent questions count
      const dbQuestions = await getLegalQuestions();
      setQuestions(dbQuestions);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Dynamic Toggle AI Translation (detects language & flips to English/Urdu)
  const handleToggleTranslation = async (id: string, text: string) => {
    if (showTranslation[id]) {
      setShowTranslation(prev => ({ ...prev, [id]: false }));
      return;
    }
    
    if (translatedText[id]) {
      setShowTranslation(prev => ({ ...prev, [id]: true }));
      return;
    }

    setIsTranslating(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: targetLanguage }),
      });
      const data = await response.json();
      if (data.text) {
        setTranslatedText(prev => ({ ...prev, [id]: data.text }));
        setShowTranslation(prev => ({ ...prev, [id]: true }));
      }
    } catch (err) {
      console.error("Translation Error: ", err);
    } finally {
      setIsTranslating(prev => ({ ...prev, [id]: false }));
    }
  };

  // LQ-style vote handler for Questions
  const handleQuestionVote = async (questionId: string, type: 'up' | 'down') => {
    const currentVote = userQuestionVotes[questionId];
    if (currentVote === type) return; // Voted same direction already

    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const upDiff = type === 'up' ? 1 : (currentVote === 'up' ? -1 : 0);
        const downDiff = type === 'down' ? 1 : (currentVote === 'down' ? -1 : 0);
        return {
          ...q,
          upvotes: (q.upvotes || 0) + upDiff,
          downvotes: (q.downvotes || 0) + downDiff,
        };
      }
      return q;
    }));

    if (selectedQuestion && selectedQuestion.id === questionId) {
      setSelectedQuestion(prev => {
        if (!prev) return null;
        const upDiff = type === 'up' ? 1 : (currentVote === 'up' ? -1 : 0);
        const downDiff = type === 'down' ? 1 : (currentVote === 'down' ? -1 : 0);
        return {
          ...prev,
          upvotes: (prev.upvotes || 0) + upDiff,
          downvotes: (prev.downvotes || 0) + downDiff,
        };
      });
    }

    setUserQuestionVotes(prev => ({ ...prev, [questionId]: type }));

    try {
      await voteLegalQuestion(questionId, type);
    } catch (err) {
      console.error(err);
    }
  };

  // LQ-style vote handler for Answers
  const handleAnswerVote = async (answerId: string, type: 'up' | 'down') => {
    const currentVote = userAnswerVotes[answerId];
    if (currentVote === type) return;

    setAnswers(prev => prev.map(a => {
      if (a.id === answerId) {
        const upDiff = type === 'up' ? 1 : (currentVote === 'up' ? -1 : 0);
        const downDiff = type === 'down' ? 1 : (currentVote === 'down' ? -1 : 0);
        return {
          ...a,
          upvotes: (a.upvotes || 0) + upDiff,
          downvotes: (a.downvotes || 0) + downDiff,
        };
      }
      return a;
    }));

    setUserAnswerVotes(prev => ({ ...prev, [answerId]: type }));

    try {
      await voteLegalAnswer(answerId, type);
    } catch (err) {
      console.error(err);
    }
  };

  // Link copy sharing event handler
  const handleShareClick = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    const mockURL = `${window.location.origin}/qa?question=${questionId}`;
    navigator.clipboard.writeText(mockURL).then(() => {
      setCopiedQuestionId(questionId);
      setTimeout(() => setCopiedQuestionId(null), 2000);
    }).catch(err => console.error("Clipboard copy error:", err));
  };

  // Custom LQ Logarithmic Sorting Logic
  // Formula: Score = (upvotes - downvotes) * 5 + (views * 0.2) - (ageInHours * 0.5)
  const sortQuestions = (list: LegalQuestion[], option: 'hot' | 'top' | 'new') => {
    return [...list].sort((a, b) => {
      const aUp = a.upvotes || 0;
      const aDown = a.downvotes || 0;
      const aNet = aUp - aDown;
      const aViews = a.views || 0;
      const aAgeInHours = (Date.now() - new Date(a.createdAt || Date.now()).getTime()) / (1000 * 60 * 60);

      const bUp = b.upvotes || 0;
      const bDown = b.downvotes || 0;
      const bNet = bUp - bDown;
      const bViews = b.views || 0;
      const bAgeInHours = (Date.now() - new Date(b.createdAt || Date.now()).getTime()) / (1000 * 60 * 60);

      if (option === 'new') {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }

      if (option === 'top') {
        return bNet - aNet;
      }

      // 'hot' -> Sort by dynamic algorithmic metrics
      const aHotScore = (aNet * 8) + (aViews * 0.4) - (aAgeInHours * 0.6);
      const bHotScore = (bNet * 8) + (bViews * 0.4) - (bAgeInHours * 0.6);
      return bHotScore - aHotScore;
    });
  };

  // Filtering + Sorting Sequence
  const filteredQuestions = sortQuestions(
    questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            q.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesCountry = filterCountry === 'All' || !q.country || q.country.toLowerCase() === filterCountry.toLowerCase();
      
      return matchesSearch && matchesCat && matchesCountry;
    }),
    sortOption
  );

  // Take portion according to dynamic feed visible items limits
  const visibleQuestions = filteredQuestions.slice(0, visibleCount);

  // Active LQ Group Info card metadata
  const activeGroup = LQ_GROUP_MAP[selectedCategory] || LQ_GROUP_MAP['All'];

  if (selectedCategory === '') {
    return (
      <div className="min-h-screen py-10 font-sans animate-in fade-in duration-300 text-slate-100 select-text relative overflow-x-hidden bg-slate-950">
        {/* Ambient premium blurred wallpaper background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 scale-100"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80)` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/20 to-slate-950 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10 space-y-10 mt-4">
          <div className="text-center space-y-4 max-w-2xl mx-auto py-6">
            <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-blue-500/30 bg-blue-500/10 text-blue-300 uppercase">
              🏛️ Open Jurisdictions Index
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none font-serif drop-shadow-md">
              Select a Legal Q&A Group
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed font-semibold">
              To browse public disputes, read community terms, or ask an anonymous legal question, select one of the specialized legal community boards below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Unified Feed Card */}
            <div 
              onClick={() => setSelectedCategory('All')}
              className="group relative rounded-[2.2rem] p-6 h-[230px] overflow-hidden border border-white/10 hover:border-sky-400 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-2xl hover:scale-[1.02] shadow-black/90"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.40)), url(${LQ_GROUP_MAP['All']?.bgWallpaper})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-transparent duration-300" />
              
              <div className="flex justify-between items-start relative z-10">
                <span className="text-3xl select-none filter drop-shadow">⚖️</span>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-600 border border-blue-400 text-white shadow font-mono">
                  {questions.length} cases
                </span>
              </div>
              
              <div className="relative z-10 space-y-1.5">
                <span className="text-[10.5px] text-sky-450 font-black uppercase tracking-wider font-mono">lq/All_Specialties</span>
                <h3 className="text-base md:text-lg font-black text-white leading-tight font-serif group-hover:text-sky-300 transition-colors">
                  {LQ_GROUP_MAP['All']?.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 font-semibold leading-normal">
                  {LQ_GROUP_MAP['All']?.description}
                </p>
              </div>
            </div>

            {/* Specialized group cards */}
            {categories.map((cat, i) => {
              const sub = LQ_GROUP_MAP[cat];
              const count = questions.filter(q => q.category === cat).length;
              return (
                <div 
                  key={i}
                  onClick={() => setSelectedCategory(cat)}
                  className="group relative rounded-[2.2rem] p-6 h-[230px] overflow-hidden border border-white/10 hover:border-indigo-400 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-2xl hover:scale-[1.02] shadow-black/90"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.40)), url(${sub.bgWallpaper})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-transparent duration-300" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-3xl select-none filter drop-shadow">{sub.icon}</span>
                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-900 border border-white/15 text-slate-200 shadow font-mono">
                      {count} cases
                    </span>
                  </div>
                  
                  <div className="relative z-10 space-y-1.5">
                    <span className="text-[10.5px] text-indigo-300 font-black uppercase tracking-wider font-mono">{sub.handle}</span>
                    <h3 className="text-base md:text-lg font-black text-white leading-tight font-serif group-hover:text-indigo-300 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 font-semibold leading-normal">
                      {sub.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center text-slate-500 text-xs font-bold font-mono py-6">
            🔒 Fully Encrypted & Confidential. Community boards operate under strict professional confidentiality frameworks.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 font-sans animate-in fade-in duration-300 text-slate-900 select-text relative overflow-x-hidden bg-slate-950">
      {/* Background atmospheric wallpaper - made extremely sharp, bright, and fully vibrant */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-100 opacity-95"
        style={{ backgroundImage: `url(${activeGroup.bgWallpaper})` }}
      />
      {/* Soft color overlay to keep text fully readable but keep images fully vivid */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/5 via-slate-950/15 to-slate-950/70 pointer-events-none" />

      <div className="container mx-auto px-2 md:px-4 max-w-6xl relative z-10">
        
        {/* LQ Group Header Banner */}
        <div 
          className="w-full rounded-3xl p-4 md:p-8 text-white border border-white/30 shadow-xl mb-6 relative overflow-hidden bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.40)), url(${activeGroup.bgWallpaper})` }}
        >
          {/* Light Glass overlay for rich high-contrast readability without blur */}
          <div className="absolute inset-0 bg-slate-950/5 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl filter drop-shadow">{activeGroup.icon}</span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-1.5 font-serif drop-shadow-md">
                    {activeGroup.name}
                  </h1>
                  <p className="text-xs font-mono font-bold text-slate-350 uppercase tracking-widest mt-0.5">
                    {activeGroup.handle}
                  </p>
                </div>
              </div>
              <p className="text-slate-150 max-w-3xl text-xs md:text-sm leading-relaxed font-semibold drop-shadow-sm">
                {activeGroup.description}
              </p>
            </div>

            {/* LQ Group Quick stats with Glassmorphism overlay */}
            <div className="bg-slate-950/45 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-center min-w-[200px] text-center md:text-left shadow-lg">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
                <Users className="w-3.5 h-3.5 text-blue-400" /> Community stats
              </div>
              <div className="text-lg font-black text-white">{activeGroup.members}</div>
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-[10px] text-green-400 font-bold mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                {activeGroup.activeOnline}
              </div>
            </div>
          </div>

          {/* Tab Sub-Selector with premium reflective active modes */}
          <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-white/10 relative z-10">
            <button
              onClick={() => { setActiveTab('qa'); setSelectedQuestion(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'qa' 
                  ? 'bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 text-white shadow-[0_6px_18px_rgba(14,165,233,0.7),inset_0_1.5px_3px_rgba(255,255,255,0.4)] border border-sky-400 font-black scale-103 text-[13px]' 
                  : 'bg-white/15 backdrop-blur-md text-white border border-white/10 hover:bg-white/25 hover:scale-102'
              }`}
            >
              🌐 Explore Subforum Threads
            </button>
            <button
              onClick={() => setActiveTab('strategy')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'strategy' 
                  ? 'bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 text-white shadow-[0_6px_18px_rgba(14,165,233,0.7),inset_0_1.5px_3px_rgba(255,255,255,0.4)] border border-sky-400 font-black scale-103 text-[13px]' 
                  : 'bg-white/15 backdrop-blur-md text-white border border-white/10 hover:bg-white/25 hover:scale-102'
              }`}
            >
              📖 LQ Group Guide & Legal Rules
            </button>
          </div>
        </div>

        {activeTab === 'qa' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sidebar Left: LQ Groups directories & Guidelines */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
              
              <button
                onClick={() => setShowAskForm(!showAskForm)}
                className="w-full h-12 geli-btn-sky hover:scale-[1.02] text-white font-black rounded-2xl transition-all shadow-md text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Ask a Public Legal Question
              </button>

              {/* Ask Question Form - Elevated with Glassmorphism */}
              {showAskForm && (
                <div className="glass-shesha rounded-3xl p-5 border border-white/30 shadow-2xl space-y-4 animate-in slide-in-from-top duration-300">
                  <div className="flex justify-between items-center border-b border-black/10 pb-2">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                      <Scale className="w-4 h-4 text-indigo-700" /> New Thread Form
                    </h3>
                    <button 
                      onClick={() => setShowAskForm(false)} 
                      className="text-slate-400 hover:text-slate-600 text-xs font-black p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAskSubmit} className="space-y-4">
                    {askSuccess && (
                      <div className="p-3 bg-green-50/80 border border-green-200 text-green-800 text-xs font-bold rounded-xl">
                        {askSuccess}
                      </div>
                    )}
                    {askError && (
                      <div className="p-4 bg-red-50/90 border border-red-300 text-red-900 text-xs font-semibold rounded-2xl space-y-1 shadow-md">
                        <div className="font-extrabold text-[10px] uppercase text-red-700 tracking-wider flex items-center gap-1">
                          ⚠️ Policy violation blocked (سیکیورٹی بلاک)
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{askError}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider mb-1">Your Alias</label>
                      <input 
                        type="text"
                        className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white/60 focus:bg-white font-semibold"
                        placeholder="Anonymous or Full Name"
                        value={askName}
                        onChange={(e) => setAskName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider mb-1">Country (Auto-detected)</label>
                      <input 
                        type="text"
                        className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white/60 focus:bg-white font-semibold"
                        placeholder="e.g. Pakistan, UK, Global"
                        value={askCountry}
                        onChange={(e) => setAskCountry(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider mb-1">Target Sub-Jurisdiction</label>
                      <select
                        className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white/60 focus:bg-white font-bold text-slate-700"
                        value={askCategory}
                        onChange={(e) => setAskCategory(e.target.value)}
                      >
                        {categories.map((cat, i) => (
                           <option key={i} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider mb-1">Brief Descriptive Title</label>
                      <input 
                        type="text"
                        className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white/60 focus:bg-white font-semibold"
                        placeholder="e.g. Arbitration validity in arbitrary rental security withholding"
                        value={askTitle}
                        onChange={(e) => setAskTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider mb-1">Factual Case Background</label>
                      <textarea 
                        className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-28 bg-white/60 focus:bg-white font-medium text-slate-800"
                        placeholder="Provide details about dates, documents, prior actions, or specific rental/family laws..."
                        value={askDesc}
                        onChange={(e) => setAskDesc(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingQuestion}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                    >
                      {submittingQuestion ? 'Publishing...' : 'Publish to Subforum'}
                    </button>
                  </form>
                </div>
              )}

              {/* Advanced Translation Explanation Card with Glassmorphism */}
              <div className="hidden lg:block glass-shesha rounded-3xl p-5 border border-white/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  Global Translation Settings
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  Translate questions or replies into any language. Gemini handles complex legal jargon, cultural idioms, or colloquial Roman Urdu phonetics instantly.
                </p>
                
                {/* Target Language Dropdown Selector in a sleek glass container */}
                <div className="space-y-1.5">
                  <label htmlFor="target-lang-select" className="text-[10px] font-black uppercase tracking-wider text-indigo-950 block">My Preferred Target Language</label>
                  <select
                    id="target-lang-select"
                    value={targetLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm focus:bg-white"
                  >
                    {TARGET_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[10px] text-indigo-950 leading-relaxed font-bold bg-indigo-100/40 p-2.5 rounded-xl border border-indigo-200">
                  💡 **Smart Dual Detect:** Translates English posts to standard Urdu script, and non-English/Roman Urdu content directly to polished court-standard English!
                </p>
              </div>

              {/* LQ Group Rules Checklist with Glassmorphism */}
              <div className="hidden lg:block glass-shesha rounded-3xl p-5 border border-white/30 shadow-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                  <Shield className="w-4 h-4 text-emerald-700 font-black" />
                  <h4 className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                    {activeGroup.handle} Community Rules
                  </h4>
                </div>
                <ol className="space-y-2 text-xs text-slate-700 list-decimal pl-4 font-bold leading-relaxed">
                  {activeGroup.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ol>
              </div>

            </div>

            {/* Content Area Right: Questions feed or Question detail */}
            <div className="lg:col-span-8 space-y-4 relative z-10">
              
              {!selectedQuestion ? (
                // --- LQ/LQ Feed View ---
                <div className="space-y-4">
                  
                  {/* Back to Directories Selector Breadcrumb link */}
                  <div className="flex items-center justify-between pb-1">
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        const newUrl = window.location.pathname;
                        window.history.pushState(null, '', newUrl);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-indigo-200 hover:text-white transition duration-200 bg-white/10 hover:bg-white/15 px-4.5 py-2 rounded-2xl border border-white/10 active:scale-95 shadow-sm cursor-pointer"
                    >
                      ← Back to All Groups Directory
                    </button>
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-mono">
                      Active: {activeGroup.handle}
                    </span>
                  </div>
                  
                  {/* Search bar with Glassmorphism */}
                  <div className="glass-shesha p-3.5 rounded-2xl border border-white/30 flex flex-col sm:flex-row items-center gap-3 shadow-xl">
                    <div className="flex items-center gap-3 w-full">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        className="flex-grow text-xs outline-none text-slate-800 font-bold placeholder-slate-450 bg-transparent/5"
                        placeholder={`Search threads or keywords inside ${activeGroup.handle}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-300/30 w-full sm:w-auto pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Location:</span>
                      <input 
                        type="text"
                        className="w-full sm:w-32 bg-transparent/5 text-xs outline-none text-slate-800 font-bold placeholder-slate-450"
                        placeholder="All / Country"
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* LQ-style Sorting Controller Tab Bar with Glassmorphism */}
                  <div className="glass-shesha rounded-2xl p-1.5 border border-white/30 shadow-xl flex flex-wrap items-center justify-between gap-1.5 animate-in fade-in duration-300">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-500 px-3 tracking-widest hidden sm:inline-block">
                        Sort By:
                      </span>
                      <button
                        onClick={() => setSortOption('hot')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          sortOption === 'hot' 
                            ? 'bg-orange-500/25 text-orange-800 border border-orange-400 font-extrabold scale-102 shadow-sm' 
                            : 'text-slate-600 hover:bg-white/40 hover:text-slate-900'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> 🔥 Hot Forum Items
                      </button>
                      <button
                        onClick={() => setSortOption('top')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          sortOption === 'top' 
                            ? 'bg-blue-500/25 text-blue-900 border border-blue-400 font-extrabold scale-102 shadow-sm' 
                            : 'text-slate-600 hover:bg-white/40 hover:text-slate-900'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" /> 🏆 Top Voted
                      </button>
                      <button
                        onClick={() => setSortOption('new')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          sortOption === 'new' 
                            ? 'bg-indigo-500/25 text-indigo-900 border border-indigo-400 font-extrabold scale-102 shadow-sm' 
                            : 'text-slate-600 hover:bg-white/40 hover:text-slate-900'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> 🕒 Latest Activity
                      </button>
                    </div>

                    {/* Compact translation dropdown for mobile & general use */}
                    <div className="ml-auto pr-1">
                      <select
                        value={targetLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-white/50 hover:bg-white/80 border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm transition-colors"
                        title="Translate Feed"
                      >
                        {TARGET_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Threads List */}
                  {visibleQuestions.length > 0 ? (
                    <div className="space-y-3.5">
                      {visibleQuestions.map((q) => {
                        const score = (q.upvotes || 0) - (q.downvotes || 0);
                        const isUpvoted = userQuestionVotes[q.id] === 'up';
                        const isDownvoted = userQuestionVotes[q.id] === 'down';
                        const isTransl = isTranslating[q.id];
                        const showTransl = showTranslation[q.id];
                        const textContent = q.description;
                        const currentText = showTransl ? (translatedText[q.id] || textContent) : textContent;
                        const subInfo = LQ_GROUP_MAP[q.category] || LQ_GROUP_MAP['All'];

                        return (
                          <div 
                            key={q.id}
                            onClick={() => handleQuestionSelect(q)}
                            className="glass-shesha rounded-3xl border border-white/25 hover:border-blue-400/40 transition-all cursor-pointer shadow-lg hover:shadow-2xl flex items-stretch overflow-hidden group backdrop-blur-md"
                          >
                            {/* Left LQ-style Vote Pill Column (visible on screens larger than sm) */}
                            <div 
                              className="hidden sm:flex flex-col items-center justify-start py-4 px-2.5 bg-slate-950/5 border-r border-black/5 text-center w-11 select-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleQuestionVote(q.id, 'up')}
                                className={`p-1.5 rounded-lg transition-transform active:scale-125 ${isUpvoted ? 'text-orange-500 bg-orange-100/50' : 'text-slate-400 hover:text-orange-500 hover:bg-white/40'}`}
                                title="Upvote"
                              >
                                <ArrowUp className="w-4 h-4 stroke-[3px]" />
                              </button>
                              <span className={`text-[11px] font-black leading-none py-1.5 ${score > 0 ? 'text-orange-600' : score < 0 ? 'text-blue-600' : 'text-slate-500'}`}>
                                {score > 0 ? `+${score}` : score}
                              </span>
                              <button
                                onClick={() => handleQuestionVote(q.id, 'down')}
                                className={`p-1.5 rounded-lg transition-transform active:scale-125 ${isDownvoted ? 'text-indigo-600 bg-indigo-100/50' : 'text-slate-400 hover:text-indigo-500 hover:bg-white/40'}`}
                                title="Downvote"
                              >
                                <ArrowDown className="w-4 h-4 stroke-[3px]" />
                              </button>
                            </div>

                            {/* Main Content Area */}
                            <div className="p-5 flex-grow space-y-3 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-wider font-mono">
                                  <span className="bg-slate-950/10 text-slate-700 px-2.5 py-1 rounded-md text-[9px] hover:bg-slate-950/15 transition-all">
                                    {subInfo.handle}
                                  </span>
                                  {q.country && (
                                    <>
                                      <span>•</span>
                                      <span className="bg-indigo-950/5 text-indigo-700 px-2.5 py-1 rounded-md text-[9px] border border-indigo-500/15">
                                        📍 {q.country}
                                      </span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span>Client: <strong className="text-slate-700 font-sans normal-case">{q.clientName}</strong></span>
                                  <span>•</span>
                                  <span>{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Recent'}</span>
                                </div>

                                <h3 className="text-base md:text-lg font-bold text-slate-900 font-serif leading-snug group-hover:text-blue-700 transition-colors">
                                  {q.title}
                                </h3>

                                <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-bold line-clamp-2">
                                  {currentText}
                                </p>
                              </div>

                              {/* Footer Block */}
                              <div className="pt-3 border-t border-dashed border-black/10 flex flex-wrap items-center justify-between gap-3 text-[10px] font-black uppercase tracking-wider text-slate-455">
                                
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-500" /> {q.views || 0} views</span>
                                  <span>|</span>
                                  <span className="flex items-center gap-1 font-bold text-slate-700">
                                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> {q.answersCount || 0} expert answers
                                  </span>
                                </div>

                                {/* Interactive tools */}
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  {/* Mobile vote buttons */}
                                  <div className="sm:hidden flex items-center bg-white/50 rounded-lg p-0.5 border border-slate-300">
                                    <button 
                                      onClick={() => handleQuestionVote(q.id, 'up')}
                                      className={`p-1 rounded-md ${isUpvoted ? 'text-orange-550' : 'text-slate-500'}`}
                                    >
                                      ▲
                                    </button>
                                    <span className="px-1 text-[10px] font-bold">{score}</span>
                                    <button 
                                      onClick={() => handleQuestionVote(q.id, 'down')}
                                      className={`p-1 rounded-md ${isDownvoted ? 'text-indigo-550' : 'text-slate-500'}`}
                                    >
                                      ▼
                                    </button>
                                  </div>

                                  {/* Translate button */}
                                  <button
                                    onClick={() => handleToggleTranslation(q.id, textContent)}
                                    className={`flex items-center gap-1.5 py-1 px-3.5 rounded-xl transition-all border font-bold cursor-pointer ${
                                      showTransl 
                                        ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/25 border-blue-400 text-blue-800 scale-[1.01]' 
                                        : 'bg-white/40 hover:bg-white/70 text-indigo-700 border-slate-350 hover:border-indigo-400'
                                    }`}
                                    title="Automatic AI Translate"
                                  >
                                    🌐 {isTransl ? "Translating..." : showTransl ? "Original" : "Translate"}
                                  </button>

                                  {/* Copy Link Share */}
                                  <button
                                    onClick={(e) => handleShareClick(e, q.id)}
                                    className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/40 hover:bg-white/70 text-slate-650 border border-slate-300 transition-colors cursor-pointer"
                                    title="Copy Thread Link"
                                  >
                                    {copiedQuestionId === q.id ? (
                                      <span className="text-emerald-700 flex items-center gap-0.5 text-[9px] font-black">
                                        <ClipboardCheck className="w-3 h-3 text-emerald-600" /> Copied!
                                      </span>
                                    ) : (
                                      <>
                                        <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share
                                      </>
                                    )}
                                  </button>

                                  <button className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 pl-1.5">
                                    View Thread <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-300 p-12 text-center text-slate-400 space-y-4 shadow-sm">
                      <div className="text-4xl filter grayscale">⚖️</div>
                      <p className="text-xs font-bold text-slate-550">
                        No active legal questions under {activeGroup.handle}. Switch lq groups or submit a fresh inquiry above!
                      </p>
                    </div>
                  )}

                  {/* Infinite Scrolling Auto-Load Indicator HUD at bottom */}
                  {filteredQuestions.length > visibleCount && (
                    <div className="pt-6 pb-2 text-center">
                      <button 
                        disabled={isFeedLoadingMore}
                        onClick={() => {
                          setIsFeedLoadingMore(true);
                          setTimeout(() => {
                            setVisibleCount(prev => Math.min(prev + 4, filteredQuestions.length));
                            setIsFeedLoadingMore(false);
                          }, 500);
                        }}
                        className="px-6 py-2.5 border border-slate-300 text-slate-650 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                      >
                        {isFeedLoadingMore ? (
                          <div className="flex items-center gap-2 justify-center">
                            <span className="w-2.5 h-2.5 rounded-full border-t-2 border-indigo-600 animate-spin"></span>
                            Fetching dynamic log results...
                          </div>
                        ) : (
                          "Load More Legal Queries"
                        )}
                      </button>
                      <p className="text-[10px] text-slate-450 mt-2.5 font-bold tracking-wide">
                        💡 Automatically loading and matching threads as you scroll down (LQ style infinity feed)
                      </p>
                    </div>
                  )}

                  {filteredQuestions.length > 0 && visibleCount >= filteredQuestions.length && (
                    <div className="p-6 bg-slate-950/15 border border-white/10 rounded-xl text-center text-[10px] text-indigo-150 font-black uppercase tracking-widest leading-relaxed">
                      🍁 You have reached the absolute beginning of the {activeGroup.handle} public registry.
                    </div>
                  )}

                </div>
              ) : (
                // --- Detailed Drilldown view ---
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* JSON-LD Schema for SEO Q&A snippet */}
                  <Helmet>
                    <script type="application/ld+json">
                      {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "QAPage",
                        "mainEntity": {
                          "@type": "Question",
                          "name": selectedQuestion.title,
                          "text": selectedQuestion.description,
                          "answerCount": selectedQuestion.answersCount || 0,
                          "upvoteCount": (selectedQuestion.upvotes || 0) - (selectedQuestion.downvotes || 0),
                          "dateCreated": selectedQuestion.createdAt || new Date().toISOString(),
                          "author": {
                            "@type": "Person",
                            "name": selectedQuestion.clientName
                          },
                          "acceptedAnswer": currentAnswers.length > 0 ? {
                            "@type": "Answer",
                            "text": currentAnswers[0].content,
                            "upvoteCount": (currentAnswers[0].upvotes || 0) - (currentAnswers[0].downvotes || 0),
                            "dateCreated": currentAnswers[0].createdAt || new Date().toISOString(),
                            "url": window.location.href,
                            "author": {
                              "@type": "Person",
                              "name": currentAnswers[0].lawyerName
                            }
                          } : undefined,
                          "suggestedAnswer": currentAnswers.slice(1).map(a => ({
                            "@type": "Answer",
                            "text": a.content,
                            "upvoteCount": (a.upvotes || 0) - (a.downvotes || 0),
                            "dateCreated": a.createdAt || new Date().toISOString(),
                            "url": window.location.href,
                            "author": {
                              "@type": "Person",
                              "name": a.lawyerName
                            }
                          }))
                        }
                      })}
                    </script>
                  </Helmet>

                  {/* Return tab link */}
                  <button 
                    onClick={() => setSelectedQuestion(null)}
                    className="flex items-center gap-1.5 text-xs font-black uppercase text-indigo-100 hover:text-white transition p-1 cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/5 active:scale-95 duration-200"
                  >
                    ← Back to {LQ_GROUP_MAP[selectedQuestion.category]?.handle || 'lq/All_Specialties'} Forum
                  </button>

                  {/* Full detailed Question card with Glassmorphism */}
                  <div className="glass-shesha rounded-3xl border border-white/30 shadow-2xl flex items-stretch overflow-hidden backdrop-blur-md">
                    {/* Votes sidebar pill */}
                    <div className="hidden sm:flex flex-col items-center justify-start py-5 px-3 bg-slate-950/5 border-r border-black/5 w-12 select-none">
                      <button
                        onClick={() => handleQuestionVote(selectedQuestion.id, 'up')}
                        className={`p-1 rounded-lg ${userQuestionVotes[selectedQuestion.id] === 'up' ? 'text-orange-555 bg-orange-100/50' : 'text-slate-400 hover:text-orange-555 hover:bg-white/40'}`}
                      >
                        <ArrowUp className="w-5 h-5 stroke-[3.5]" />
                      </button>
                      <span className="text-[13px] font-black py-2 text-slate-800 font-mono">
                        {(selectedQuestion.upvotes || 0) - (selectedQuestion.downvotes || 0)}
                      </span>
                      <button
                        onClick={() => handleQuestionVote(selectedQuestion.id, 'down')}
                        className={`p-1 rounded-lg ${userQuestionVotes[selectedQuestion.id] === 'down' ? 'text-indigo-650 bg-indigo-100/50' : 'text-slate-400 hover:text-indigo-650 hover:bg-white/40'}`}
                      >
                        <ArrowDown className="w-5 h-5 stroke-[3.5]" />
                      </button>
                    </div>

                    {/* Factual Information Content Column */}
                    <div className="p-6 flex-grow space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                        <span className="bg-slate-950/10 text-slate-700 px-2.5 py-1 rounded-md text-[9px] font-black">
                          {LQ_GROUP_MAP[selectedQuestion.category]?.handle}
                        </span>
                        {selectedQuestion.country && (
                          <>
                            <span>•</span>
                            <span className="bg-indigo-950/5 text-indigo-700 px-2.5 py-1 rounded-md text-[9px] font-black border border-indigo-500/15">
                              📍 {selectedQuestion.country}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>Factual inquiry posted by: <strong className="text-slate-700">{selectedQuestion.clientName}</strong></span>
                        <span>•</span>
                        <span>{selectedQuestion.createdAt ? new Date(selectedQuestion.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>

                      <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900 leading-snug border-none p-0">
                        {selectedQuestion.title}
                      </h2>

                      <p className="text-[13px] md:text-sm text-slate-755 leading-relaxed whitespace-pre-wrap font-semibold">
                        {showTranslation[selectedQuestion.id] ? (translatedText[selectedQuestion.id] || selectedQuestion.description) : selectedQuestion.description}
                      </p>

                      <div className="pt-4 border-t border-black/5 flex flex-wrap gap-3 items-center justify-between text-[10px] text-slate-455 font-black uppercase tracking-wider">
                        <span className="flex items-center gap-1">👁 {selectedQuestion.views || 0} views</span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTranslation(selectedQuestion.id, selectedQuestion.description)}
                            className={`flex items-center gap-1.5 py-1 px-3.5 rounded-xl text-[10px] font-black transition-all border cursor-pointer ${
                              showTranslation[selectedQuestion.id] 
                                ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/25 border-blue-400 text-blue-800 scale-[1.01]' 
                                : 'bg-white/40 hover:bg-white/70 text-indigo-700 border-slate-350 hover:border-indigo-450'
                            }`}
                            title="Interactive Translation Toggle"
                          >
                            🌐 {isTranslating[selectedQuestion.id] ? "Translating..." : showTranslation[selectedQuestion.id] ? "Original Text" : "See Translation"}
                          </button>

                          <button
                            onClick={(e) => handleShareClick(e, selectedQuestion.id)}
                            className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/40 hover:bg-white/70 text-slate-655 border border-slate-200"
                          >
                            {copiedQuestionId === selectedQuestion.id ? (
                              <span className="text-emerald-700 flex items-center gap-0.5 text-[9px] font-black">
                                <ClipboardCheck className="w-3 h-3 text-emerald-600" /> Copied!
                              </span>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5 text-slate-500" /> Copy Link
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answers Title block */}
                  <div className="pt-2">
                    <h3 className="text-[10px] font-black uppercase text-indigo-250 tracking-wider">
                      💬 Verified Advocates Counsel Opinions ({answers.length})
                    </h3>
                  </div>

                  {/* Answers lists (LQ Style structured cards with upvote ratings) with Glassmorphism */}
                  {answers.length > 0 ? (
                    <div className="space-y-4">
                      {answers.map((ans) => {
                        const ansScore = (ans.upvotes || 0) - (ans.downvotes || 0);
                        const isAnsUpvoted = userAnswerVotes[ans.id] === 'up';
                        const isAnsDownvoted = userAnswerVotes[ans.id] === 'down';
                        const isAnsTransl = isTranslating[ans.id];
                        const showAnsTransl = showTranslation[ans.id];
                        const currentAnsText = showAnsTransl ? (translatedText[ans.id] || ans.content) : ans.content;

                        return (
                          <div key={ans.id} className={`glass-shesha rounded-3xl border shadow-xl p-6 space-y-4 backdrop-blur-md ${ans.lawyerId === 'ai_admin_bot' ? 'border-purple-300/60 bg-gradient-to-br from-white/90 via-purple-50/25 to-white/90 shadow-purple-500/5' : 'border-white/25'}`}>
                            
                            {/* LQ Style Lawyer Profile signature card */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={ans.lawyerPicture || `https://ui-avatars.com/api/?name=${ans.lawyerName}&background=random`} 
                                  alt={ans.lawyerName}
                                  className={`w-11 h-11 rounded-full object-cover shrink-0 border-2 ${ans.lawyerId === 'ai_admin_bot' ? 'border-purple-400 animate-pulse' : 'border-slate-300'}`}
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm leading-tight flex flex-wrap items-center gap-1.5">
                                    {ans.lawyerName}
                                    {ans.lawyerId === 'ai_admin_bot' ? (
                                      <span className="bg-purple-100 text-purple-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-purple-200">
                                        <Sparkles className="w-2.5 h-2.5 text-purple-600 inline" /> AI Admin Bot
                                      </span>
                                    ) : (
                                      <span className="bg-blue-100 text-blue-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-blue-200">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 inline" /> Enrolled Partner
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-[10.5px] text-slate-500 font-bold font-sans mt-0.5">{ans.lawyerTitle}</p>
                                </div>
                              </div>

                              <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest hidden sm:block ${ans.lawyerId === 'ai_admin_bot' ? 'bg-purple-950/10 border border-purple-300 text-purple-700' : 'bg-slate-950/10 border border-slate-350 text-slate-600'}`}>
                                {ans.lawyerId === 'ai_admin_bot' ? 'Self-acting Helper' : 'Verified Advisory'}
                              </div>
                            </div>

                            {/* AdSense Compliance Disclosure Box */}
                            {ans.lawyerId === 'ai_admin_bot' && (
                              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1.5 pl-1.5 text-left">
                                <p className="text-[10px] font-black uppercase text-indigo-700 flex items-center gap-1 pl-1">
                                  💡 Automated Evaluation Disclosure (دستبرداری)
                                </p>
                                <p className="text-[10.5px] text-slate-700 leading-relaxed font-semibold pl-1">
                                  <strong>English:</strong> This preliminary analysis is instantly generated by our legal AI system to help orient your inquiry. It provides generic information and is not formal, certified court representation. For professional advice, consult/hire a human legal advocate in our members directory below or submit an offline inquiry.
                                </p>
                                <p className="text-[10.5px] text-slate-700 leading-relaxed font-semibold pl-1 mb-1">
                                  <strong>اردو:</strong> یہ معلوماتی ابتدائی خاکہ ہمارے اے آئی اسسٹنٹ بوٹ کے ذریعے تیار کیا گیا ہے۔ سیکیورٹی اور خود کار رہنمائی کیلئے بنایا گیا یہ جواب حتمی یا سرکار درج کرنے والے عدالتی مشورے کے برابر نہیں۔ عدالت کیلئے نیچے دیے گئے مستند وکلاء کی لسٹ سے مشورہ کریں۔
                                </p>
                              </div>
                            )}

                            {/* Answer statutory background content */}
                            <p className="text-slate-800 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-semibold tracking-wide pl-1">
                              {currentAnsText}
                            </p>

                            {/* Answer footer */}
                            <div className="pt-3.5 border-t border-black/5 flex flex-wrap gap-3 items-center justify-between text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                              <span>Advisory published {ans.createdAt ? new Date(ans.createdAt).toLocaleDateString() : 'Recent'}</span>
                              
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleToggleTranslation(ans.id, ans.content)}
                                  className={`flex items-center gap-1.5 py-1 px-3.5 rounded-xl text-[10px] font-black transition-all border cursor-pointer ${
                                    showAnsTransl 
                                      ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/25 border-blue-400 text-blue-800 scale-[1.01]' 
                                      : 'bg-white/40 hover:bg-white/70 text-indigo-700 border-slate-350 hover:border-indigo-400'
                                  }`}
                                >
                                  🌐 {isAnsTransl ? "Translating..." : showAnsTransl ? "Original" : "See Translation"}
                                </button>

                                {/* LQ style Upvote Pill nested in answer */}
                                <div className="flex items-center gap-0.5 bg-white/40 border border-slate-300 rounded-lg p-0.5 select-none shadow-sm">
                                  <button 
                                    onClick={() => handleAnswerVote(ans.id, 'up')}
                                    className={`p-1 rounded-md transition-colors ${isAnsUpvoted ? 'text-orange-555 bg-orange-100/50 font-black' : 'text-slate-500 hover:text-orange-600'}`}
                                    title="Upvote helpful advisory"
                                  >
                                    ▲
                                  </button>
                                  <span className={`text-[10px] font-mono font-black px-1.5 ${ansScore > 0 ? 'text-orange-600' : ansScore < 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                                    {ansScore > 0 ? `+${ansScore}` : ansScore}
                                  </span>
                                  <button 
                                    onClick={() => handleAnswerVote(ans.id, 'down')}
                                    className={`p-1 rounded-md transition-colors ${isAnsDownvoted ? 'text-indigo-600 bg-indigo-100/50 font-black' : 'text-slate-500 hover:text-indigo-650'}`}
                                    title="Downvote bad advisory"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass-shesha rounded-3xl border border-dashed border-white/35 p-8 text-center text-slate-500 text-xs font-bold shadow-lg">
                      No matching statutory analyses published yet. Verified advocates are reviewing this thread.
                    </div>
                  )}

                  {/* Submission form response area: Only if user role is lawyer */}
                  {user && user.role === 'lawyer' ? (
                    <div className="glass-shesha p-6 rounded-3xl border border-white/30 shadow-2xl space-y-4">
                      <div>
                        <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-1">
                          <Scale className="w-4 h-4 text-indigo-650" /> Draft Verified Advisory Opinion
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 font-semibold leading-relaxed">
                          Provide pro-bono opinions referencing CPC/PPC codes, timelines, or local Rent restriction Acts. High-quality answers automatically improve your directory standing!
                        </p>
                      </div>

                      <form onSubmit={handleAnswerSubmit} className="space-y-4">
                        {answerSuccess && (
                          <div className="p-3 bg-green-50/80 border border-green-200 text-green-800 text-xs font-bold rounded-xl animate-bounce">
                            {answerSuccess}
                          </div>
                        )}
                        <textarea
                          className="w-full border border-slate-350 rounded-xl p-4 text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32 bg-white/70 text-slate-900 focus:bg-white font-medium shadow-inner"
                          placeholder="Reference statutory precedents, procedure rules, or specific court filing steps to guide this client profile..."
                          value={newAnswerContent}
                          onChange={(e) => setNewAnswerContent(e.target.value)}
                          required
                        />

                        <button
                          type="submit"
                          disabled={submittingAnswer}
                          className="geli-btn-sky px-5 h-12 hover:scale-[1.02] disabled:bg-slate-350 text-white rounded-xl uppercase tracking-widest cursor-pointer shadow transition-all truncate"
                        >
                          {submittingAnswer ? 'Publishing counsel...' : 'Publish Legal Opinion'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/20 border border-white/10 rounded-xl text-center text-[10px] uppercase text-indigo-150 font-black font-sans tracking-widest leading-relaxed">
                      🔒 Only authenticated and verified advocates are authorized to submit professional advisories.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // --- How It Works & Legal Framework Details ---
          <div className="glass-shesha rounded-3xl p-6 md:p-8 border border-white/30 shadow-2xl space-y-8 font-sans backdrop-blur-md">
            
            <div className="border-b border-black/5 pb-4 space-y-2">
              <h2 className="text-2xl font-bold font-serif text-slate-950">lq/All_Specialties Platform Guidelines & Architecture</h2>
              <p className="text-xs md:text-sm text-slate-650 font-semibold leading-relaxed">
                <AnimatedLogo /> functions as a dual pro-bono community pipeline and directory search network, optimizing client onboarding while maintaining strict professional integrity standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Clients info */}
              <div className="p-6 bg-white/40 border border-slate-300 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-lg font-bold shadow-md">👤</div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">For the General Public</h3>
                    <p className="text-[10px] text-orange-655 font-black uppercase tracking-wider">Free Pro-Bono Legal Advice</p>
                  </div>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 list-disc pl-4 font-semibold leading-relaxed">
                  <li><strong>Completely anonymous postings:</strong> Submit case outlines securely without publishing full National ID details or true physical addresses.</li>
                  <li><strong>Verified High Court Advices:</strong> Tap into a national network of verified attorneys specialized in civil codes, family law, and corporate setup regulations.</li>
                  <li><strong>Logarithmic relevance matching:</strong> Your questions are organized automatically by rating algorithms, ensuring lawyers find your thread instantly.</li>
                  <li><strong>Seamless offline onboarding:</strong> Connect with responding advocates and hire them directly for official physical chamber representation and litigation procedures.</li>
                </ul>
              </div>

              {/* Advocates info */}
              <div className="p-6 bg-white/40 border border-slate-300 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md">⚖️</div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">For Registered Advocates</h3>
                    <p className="text-[10px] text-blue-755 font-black uppercase tracking-wider">Expand Practice Reach & Client Pipelines</p>
                  </div>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 list-disc pl-4 font-semibold leading-relaxed">
                  <li><strong>Publish insightful legal analyses:</strong> Review user outlines, draft structured breakdowns, and reference relevant statutory and rent restriction codes.</li>
                  <li><strong>Boost rating metrics automatically:</strong> Excellent answers receive public upvotes, raising your ranking index across our public advocate directory listings.</li>
                  <li><strong>SEO optimized search indexing:</strong> Public threads index across search networks, allowing clients searching active keywords to locate your contacts directly.</li>
                  <li><strong>Secure legal leads:</strong> Translate free pro-bono advice threads directly into paid case retainers, stay order drafting, or registry deed filings.</li>
                </ul>
              </div>

            </div>

            {/* Strategic Workflow diagram */}
            <div className="p-6 bg-white/45 rounded-2xl border border-slate-300 space-y-4">
              <h4 className="text-xs font-black text-slate-500 text-center uppercase tracking-wider">Case Processing Funnel</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch text-center text-[11px] font-bold">
                <div className="p-4 bg-white/80 border border-slate-300 rounded-xl text-orange-650 flex items-center justify-center leading-relaxed shadow-sm">
                  1. Client submits inquiry anonymously
                </div>
                <div className="flex items-center justify-center text-slate-400 text-lg hidden md:flex">➔</div>
                <div className="p-4 bg-orange-100/50 border border-orange-250 text-orange-750 flex items-center justify-center leading-relaxed shadow-sm">
                  2. Verified advocates submit structured codes response
                </div>
                <div className="flex items-center justify-center text-slate-400 text-lg hidden md:flex">➔</div>
                <div className="p-4 bg-white/80 border border-slate-300 rounded-xl text-blue-750 flex items-center justify-center leading-relaxed shadow-sm">
                  3. Community members upvote high-quality threads
                </div>
                <div className="flex items-center justify-center text-slate-400 text-lg hidden md:flex">➔</div>
                <div className="p-4 bg-indigo-950 text-white rounded-xl flex items-center justify-center leading-relaxed shadow-md">
                  4. Client directly hires lawyer for paid litigation
                </div>
              </div>
            </div>

            {/* Helpline Connection Info */}
            <div className="bg-white/40 p-5 rounded-2xl border border-dashed border-slate-350 text-slate-700 flex flex-wrap gap-4 justify-between items-center text-xs">
              <div>
                <h4 className="font-extrabold text-slate-950">Database Connection Active</h4>
                <p className="text-slate-600 mt-0.5">Community help registry is synchronized with persistent secure database standards.</p>
              </div>
              <div className="bg-white border text-slate-700 border-slate-300 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
                📋 Live Count: {questions.length} Inquiries | {categories.length} Specialty Subforums
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
