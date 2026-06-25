
import React, { useState, useEffect, createContext, useContext, Component, ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { User, UserRole } from './types';
import { auth } from './services/firebase';
import { getUserRole } from './services/mockDataService';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { seedDataIfEmpty } from './services/seeder';

import { logService } from './services/logService';
// import { DebugOverlay } from './components/DebugOverlay';

// Pages
import Home from './pages/Home';
import AuthPage from './pages/Auth';
import LawyerDashboard from './pages/LawyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import FindLawyers from './pages/FindLawyers';
import SelectRole from './pages/SelectRole';
import ArticleDetails from './pages/ArticleDetails';
import LawyerProfilePage from './pages/LawyerProfilePage';
import BloodDonation from './pages/BloodDonation';
import MeetingRoom from './pages/MeetingRoom';
import LegalQA from './pages/LegalQA';
import JobsPortal from './pages/JobsPortal';

import DownloadApp from './pages/DownloadApp';
import Sitemap from './pages/Sitemap';
import HelpCenter from './pages/HelpCenter';
import AboutUs from './pages/AboutUs';

// Sub-pages for Lawyer Dashboard
import LawyerDashboardLayout from './components/LawyerDashboardLayout';
import LawyerProfile from './pages/lawyer-dashboard/Profile';
import LawyerCases from './pages/lawyer-dashboard/Cases';
import LawyerLedger from './pages/lawyer-dashboard/Ledger';
import LawyerVerification from './pages/lawyer-dashboard/Verification';
import LawyerAITools from './pages/lawyer-dashboard/AITools';

import { PrivacyPolicy, TermsOfService, Disclaimer, HowWeWork, ContactUs, SubmitComplaint } from './pages/LegalPages';
import Navbar from './components/Navbar';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import AIChatBox from './components/AIChatBox';

// Auth Context
interface AuthContextType {
  user: User | null;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
    logService.error("Uncaught Error reached Boundary", { error: error.toString(), info: errorInfo }, 'App');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4 font-sans">
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-blue-100 max-w-lg text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Something went wrong</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">We encountered an unexpected error. This has been logged and we are looking into it. Please try refreshing the page.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Refresh Page</button>
              <Link to="/" className="text-slate-400 hover:text-blue-600 font-medium text-sm transition" onClick={() => this.setState({ hasError: false })}>Back to Home</Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'pending' && window.location.hash !== '#/select-role') return <Navigate to="/select-role" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [seoConfig, setSeoConfig] = useState({ title: '', desc: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Dynamic SEO Metadata updates based on active path
    let title = "lawyeronline.live - Verified Advocates, Fee Ledgers & Legal Q&A";
    let desc = "The premier global directory connecting verified advocates with transparent fee ledgers and free legal public Q&A boards.";
    
    if (pathname === '/find-lawyers') {
      title = "Find Verified Court Advocates | lawyeronline.live Directory";
      desc = "Lookup authorized High Court advocates filtered by location and legal specialties with complete license ID checks.";
    } else if (pathname === '/qa') {
      title = "Ask Free Legal Q&A | Community LG boards | lawyeronline.live";
      desc = "Submit your legal query anonymously in digital boards. Receive reliable opinions from real accredited legal consultants.";
    } else if (pathname === '/blood-donation') {
      title = "Emergency Blood Lifelife SOS | lawyeronline.live Support Network";
      desc = "Need blood urgently? Request emergency donations of raw plasma, whole cells or white cells across all major city wards.";
    } else if (pathname === '/how-we-work') {
      title = "How It Works | lawyeronline.live Legal Matching Platform";
      desc = "Understand our biometric license verification checkpoints, commission-free case agreements, and fee tracking ledgers.";
    } else if (pathname === '/contact') {
      title = "Contact Us | Help Desk";
      desc = "Write directly to our 24/7 central support enclave located across global hubs.";
    } else if (pathname === '/complaint') {
      title = "Submit Grievance Dispute Ticket | lawyeronline.live Quality Desk";
      desc = "File high-priority reports against counterfeit advocates, fee misunderstandings, or courtroom violations.";
    } else if (pathname === '/privacy') {
      title = "Privacy Policy - Data Security";
    } else if (pathname === '/terms') {
      title = "Terms & Conditions of Service";
    } else if (pathname === '/disclaimer') {
      title = "Professional Legal Representation Disclaimer";
    }
    
    setSeoConfig({ title, desc });
  }, [pathname]);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "lawyeronline.live",
    "url": "https://lawyeronline.live",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://lawyeronline.live/find-lawyers?specialty={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgSchema = {
     "@context": "https://schema.org",
     "@type": "Organization",
     "name": "lawyeronline.live",
     "url": "https://lawyeronline.live",
     "logo": "https://lawyeronline.live/logo.png"
  };

  return (
    <Helmet>
      <title>{seoConfig.title}</title>
      <meta name="description" content={seoConfig.desc} />
      <script type="application/ld+json">
         {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
         {JSON.stringify(orgSchema)}
      </script>
    </Helmet>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = await getUserRole(firebaseUser.uid, true);
        
        // Admin check: using the requested admin email
        const userEmailLower = firebaseUser.email?.toLowerCase();
        if (userEmailLower === 'admin@jurisconnect.com' || userEmailLower === 'ashrafmahar4930@gmail.com') {
          role = 'admin';
          // Seed data if admin logs in and data is missing
          seedDataIfEmpty();
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: (role as UserRole) || 'pending',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL || undefined
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      setIsLoading(true);
      const firebaseUser = auth.currentUser;
      let role = await getUserRole(firebaseUser.uid, true);
      
      const userEmailLower = firebaseUser.email?.toLowerCase();
      if (userEmailLower === 'admin@jurisconnect.com' || userEmailLower === 'ashrafmahar4930@gmail.com') {
        role = 'admin';
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: (role as UserRole) || 'pending',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined
      });
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthContext.Provider value={{ user, logout, refreshUser, isLoading }}>
          <ScrollToTop />
          <div className="min-h-screen bg-blue-50 text-slate-900 flex flex-col font-sans">
            <PwaInstallPrompt />
            <AIChatBox />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<AuthPage isLogin={true} />} />
                <Route path="/signup" element={<AuthPage isLogin={false} />} />
                <Route path="/select-role" element={
                  user?.role === 'pending' ? <SelectRole /> : <Navigate to="/" replace />
                } />
                <Route path="/find-lawyers" element={<FindLawyers />} />
                <Route path="/article/:slug" element={<ArticleDetails />} />
                <Route path="/lawyer/:uid" element={<LawyerProfilePage />} />
                <Route path="/blood-donation" element={<BloodDonation />} />
                <Route path="/meeting/:roomId" element={<MeetingRoom />} />
                <Route path="/qa" element={<LegalQA />} />
                <Route path="/jobs" element={<JobsPortal />} />
                <Route path="/download-app" element={<DownloadApp />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/sitemap" element={<Sitemap />} />
                
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/how-we-work" element={<HowWeWork />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/complaint" element={<SubmitComplaint />} />
                
                <Route path="/dashboard/lawyer" element={
                  <ProtectedRoute allowedRoles={['lawyer', 'admin']}>
                    <LawyerDashboardLayout>
                       <LawyerDashboard />
                    </LawyerDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/lawyer/profile" element={
                  <ProtectedRoute allowedRoles={['lawyer', 'admin']}>
                    <LawyerDashboardLayout>
                       <LawyerProfile />
                    </LawyerDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/lawyer/cases" element={
                  <ProtectedRoute allowedRoles={['lawyer', 'admin']}>
                    <LawyerDashboardLayout>
                       <LawyerCases />
                    </LawyerDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/lawyer/ledger" element={
                  <ProtectedRoute allowedRoles={['lawyer', 'admin']}>
                    <LawyerDashboardLayout>
                       <LawyerLedger />
                    </LawyerDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/lawyer/verification" element={
                  <ProtectedRoute allowedRoles={['lawyer', 'admin']}>
                    <LawyerDashboardLayout>
                       <LawyerVerification />
                    </LawyerDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/lawyer/tools" element={
                  <ProtectedRoute allowedRoles={['lawyer', 'admin']}>
                    <LawyerDashboardLayout>
                       <LawyerAITools />
                    </LawyerDashboardLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/client" element={
                  <ProtectedRoute allowedRoles={['client', 'admin']}>
                    <ClientDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <footer className="bg-blue-950 text-blue-200 py-6 border-t border-blue-900">
              <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 text-xs">
                <div className="col-span-2 md:col-span-1">
                  <h3 className="text-sm font-extrabold text-white mb-2 tracking-wider uppercase">lawyeronline<span className="text-cyan-400">.live</span></h3>
                  <p className="opacity-80 leading-relaxed max-w-xs">Connecting justice seekers with legal experts worldwide effectively and securely.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2 uppercase tracking-wider text-[10px]">Platform</h4>
                  <ul className="space-y-1.5 opacity-80">
                    <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                    <li><Link to="/find-lawyers" className="hover:text-white transition">Find Lawyers</Link></li>
                    <li><Link to="/qa" className="hover:text-white transition">Ask Legal Q&A</Link></li>
                    <li><Link to="/jobs" className="hover:text-white transition">Careers & Jobs</Link></li>
                    <li><Link to="/how-we-work" className="hover:text-white transition font-semibold text-blue-300">How We Work</Link></li>
                    <li><Link to="/download-app" className="hover:text-white transition font-bold text-emerald-400">Install Web App</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2 uppercase tracking-wider text-[10px]">Legal & Access</h4>
                  <ul className="space-y-1.5 opacity-80">
                    <li><Link to="/help" className="hover:text-white transition">Help Center & FAQ</Link></li>
                    <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                    <li><Link to="/disclaimer" className="hover:text-white transition">Disclaimer</Link></li>
                    <li><Link to="/sitemap" className="hover:text-white transition">Sitemap</Link></li>
                    <li><Link to="/complaint" className="hover:text-red-300 text-red-100 transition font-medium">Submit Complaint</Link></li>
                    <li><Link to="/dashboard/admin" className="hover:text-white transition mt-2 inline-block text-[10px] text-blue-400">Admin Portal</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2 uppercase tracking-wider text-[10px]">Support & Contact</h4>
                  <div className="opacity-80 space-y-1.5 text-[11px]">
                    <p><Link to="/contact" className="hover:text-white transition font-semibold text-blue-300">Contact Us Form</Link></p>
                    <p>support@lawyeronline.live</p>
                    <p>+92 300 1234567</p>
                    <p>Global Legal Search Platform</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6 pt-4 border-t border-blue-900/50 text-[10px] opacity-60 flex flex-col md:flex-row justify-center gap-2 md:gap-6">
                <span>&copy; {new Date().getFullYear()} lawyeronline.live. All rights reserved.</span>
                <span className="hidden md:inline">|</span>
                <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                <span className="hidden md:inline">|</span>
                <Link to="/terms" className="hover:text-white">Terms</Link>
              </div>
            </footer>
          </div>
        </AuthContext.Provider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
