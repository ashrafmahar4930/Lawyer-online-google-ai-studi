

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { VerificationRequest, Article, LawyerProfile, BloodAppeal, BloodDonor } from '../types';
import * as db from '../services/mockDataService';
import { generateArticle } from '../services/geminiService';
import { compressImage } from '../utils/imageUtils'; // Import compressImage
import { formatPhoneNumberForWhatsApp } from '../utils/phoneUtils';
import { ClipboardCheck, Users as UsersIcon, FileText, Droplet, LayoutDashboard, CheckCircle, ShieldAlert, Filter, Sparkles, Coins, Globe } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'verifications' | 'articles' | 'users' | 'blood' | 'branding' | 'monetization' | 'reviews'>('verifications');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (inputValue?: string) => Promise<void> | void;
    showInput?: boolean;
    inputPlaceholder?: string;
    inputValue?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => prev.message === message ? { ...prev, show: false } : prev);
    }, 4000);
  };

  const showConfirm = (options: {
    title: string;
    message: string;
    onConfirm: (inputValue?: string) => Promise<void> | void;
    showInput?: boolean;
    inputPlaceholder?: string;
    inputValue?: string;
    isDestructive?: boolean;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
      showInput: options.showInput || false,
      inputPlaceholder: options.inputPlaceholder || '',
      inputValue: options.inputValue || '',
      isDestructive: options.isDestructive || false,
    });
  };

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [appeals, setAppeals] = useState<BloodAppeal[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<BloodAppeal | null>(null);
  const [matchingDonors, setMatchingDonors] = useState<BloodDonor[]>([]);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('All');

  // Branding Control States (Managing Logo & Allowed Domains)
  const [logoText, setLogoText] = useState('LAWYERONLINE.LIVE');
  const [allowedDomains, setAllowedDomains] = useState('lawyeronline.live, lawyeronline.pk, build-ais-dev.run.app');
  const [activeLogoType, setActiveLogoType] = useState<'both' | 'logo-only' | 'badge-only'>('both');
  const [logoSaved, setLogoSaved] = useState(false);

  // Monetization & Google AdSense Setup States
  const [isAdSenseEnabled, setIsAdSenseEnabled] = useState(true);
  const [adSensePublisherId, setAdSensePublisherId] = useState('ca-pub-58027f4911b95b95');
  const [platformCommissionPct, setPlatformCommissionPct] = useState('15');
  const [isPremiumAnsweringActive, setIsPremiumAnsweringActive] = useState(true);
  const [monetizationSaved, setMonetizationSaved] = useState(false);

  
  // Article State
  const [articleTopic, setArticleTopic] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleDesc, setArticleDesc] = useState('');
  const [articleImage, setArticleImage] = useState(''); // Stores the URL of the featured image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Article CMS states
  const [currentArticles, setCurrentArticles] = useState<Article[]>([]);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    refreshData();
    fetchArticles();
  }, []);

  const refreshData = async () => {
    const [pendingReqs, allLawyers, activeAppeals, allReviewsData] = await Promise.all([
      db.getPendingVerifications(),
      db.getAllLawyers(),
      db.getActiveBloodAppeals(),
      db.getAllReviews()
    ]);

    setRequests(pendingReqs);
    setLawyers(allLawyers);
    setAppeals(activeAppeals);
    
    // Enrich reviews with lawyer names
    const enrichedReviews = allReviewsData.map(review => {
      const lawyer = allLawyers.find(l => l.uid === review.lawyerId);
      return {
        ...review,
        lawyerName: lawyer ? lawyer.fullName : 'Unknown Lawyer',
        createdAt: review.createdAt || new Date().toISOString(),
        rating: typeof review.rating === 'number' ? review.rating : 5
      };
    });

    setReviews(enrichedReviews.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    }));
  };

  const fetchArticles = async () => {
    setIsLoadingArticles(true);
    const articles = await db.getArticles();
    setCurrentArticles(articles);
    setIsLoadingArticles(false);
  };

  const handleSeedDatabase = () => {
    showConfirm({
      title: "Seed Database",
      message: "Do you want to directly upload default global lawyer profiles and expert legal article seed data into the live Firestore Database?",
      onConfirm: async () => {
        setIsSeeding(true);
        try {
            for (const lawyer of db.fallbackLawyers) {
                await db.updateLawyerProfile(lawyer);
            }
            for (const article of db.fallbackArticles) {
                await db.addArticle(article);
            }
            showToast("Firestore Database successfully seed ho chuka hai! Ab aapko standard dashboard screens aur home/articles page par real dynamic data nazar aaye ga.", "success");
            await refreshData();
            await fetchArticles();
        } catch (error) {
            console.error("Client side seeding failed:", error);
            showToast("Database seeding failed. Please check your network connectivity.", "error");
        } finally {
            setIsSeeding(false);
        }
      }
    });
  };

  const handleVerify = async (id: string, approve: boolean) => {
    if (approve) {
        showToast("Verification approved successfully!", "success");
        await db.processVerification(id, 'approved');
        refreshData();
    } else {
        showConfirm({
            title: "Reject Verification Request",
            message: "Verify application rejected? Enter reason:",
            showInput: true,
            inputPlaceholder: "Enter rejection reason...",
            onConfirm: async (reason) => {
                if (reason && reason.trim()) {
                    showToast("Verification rejected successfully. Reason sent to lawyer.", "success");
                    await db.processVerification(id, 'rejected', reason);
                    refreshData();
                } else {
                    showToast("Rejection cancelled: No reason provided.", "info");
                }
            }
        });
    }
  };

  const handleDeleteUser = (uid: string) => {
      showConfirm({
          title: "Permanently Delete Profile",
          message: "Are you sure you want to permanently delete this user profile and all associated data (including storage files)? This cannot be undone.",
          isDestructive: true,
          onConfirm: async () => {
              try {
                  await db.deleteLawyerProfile(uid);
                  showToast("User profile deleted successfully.", "success");
                  refreshData();
              } catch (error) {
                  console.error("Error deleting lawyer:", error);
                  showToast("Failed to delete user profile. Check console for details.", "error");
              }
          }
      });
  };

  const handleToggleSuspend = (uid: string, isCurrentlySuspended: boolean) => {
      showConfirm({
          title: isCurrentlySuspended ? "Unsuspend Account" : "Suspend Account",
          message: `Are you sure you want to ${isCurrentlySuspended ? 'unsuspend' : 'suspend'} this user?`,
          isDestructive: !isCurrentlySuspended,
          onConfirm: async () => {
              try {
                  await db.setLawyerSuspended(uid, !isCurrentlySuspended);
                  showToast(`User successfully ${isCurrentlySuspended ? 'unsuspended' : 'suspended'}.`, "success");
                  refreshData();
              } catch (error) {
                  console.error("Error toggling suspension:", error);
                  showToast("Failed to update suspension status.", "error");
              }
          }
      });
  };

  const handleToggleVerify = (uid: string, isCurrentlyVerified: boolean) => {
      showConfirm({
          title: isCurrentlyVerified ? "Unverify Account" : "Verify Account",
          message: `Are you sure you want to manually ${isCurrentlyVerified ? 'unverify' : 'verify'} this user?`,
          onConfirm: async () => {
              try {
                  await db.setLawyerVerified(uid, !isCurrentlyVerified);
                  showToast(`User successfully ${isCurrentlyVerified ? 'unverified' : 'verified'}.`, "success");
                  refreshData();
              } catch (error) {
                  console.error("Error toggling verification:", error);
                  showToast("Failed to update verification status.", "error");
              }
          }
      });
  };

  const handleGenerateArticle = async () => {
      setIsGenerating(true);
      const content = await generateArticle(articleTopic);
      setArticleContent(content);
      // Generate a short description based on content (mock)
      setArticleDesc(content.substring(0, Math.min(content.length, 150)) + (content.length > 150 ? "..." : ""));
      setIsGenerating(false);
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          try {
              setUploadingImage(true);
              const originalFile = e.target.files[0];
              
              setPreviewUrl(URL.createObjectURL(originalFile));

              const compressedFile = await compressImage(originalFile, 1200, 800, 0.8); // Max 1200x800, 80% quality

              const path = `article-images/${Date.now()}_${compressedFile.name}`;
              // If editing, use existing articleImage for old URL deletion
              const oldImageUrl = articleImage; 
              const url = await db.uploadFile(compressedFile, path, oldImageUrl);
              setArticleImage(url);
          } catch (e) {
              showToast("Image upload failed", "error");
              console.error(e);
          } finally {
              setUploadingImage(false);
              e.target.value = ''; // Clear file input
          }
      }
  };

  const handlePublishArticle = async () => {
      if (!articleTopic || !articleContent) {
          showToast("Article title and content are required.", "error");
          return;
      }
      
      const articleData: Article = {
          id: editingArticleId || `art_${Date.now()}`,
          title: articleTopic,
          content: articleContent,
          description: articleDesc,
          featuredImage: articleImage || `https://picsum.photos/seed/${Date.now()}/800/400`, // Fallback image
          author: 'Admin', // Always Admin for this portal
          date: new Date().toLocaleDateString(),
          slug: '' // Will be generated by the service
      };

      try {
          if (editingArticleId) {
              await db.updateArticle(articleData);
              showToast("Article Updated!", "success");
          } else {
              await db.addArticle(articleData);
              showToast("Article Published!", "success");
          }
          
          setArticleTopic('');
          setArticleContent('');
          setArticleDesc('');
          setArticleImage('');
          setPreviewUrl(null);
          setEditingArticleId(null);
          fetchArticles(); // Refresh article list
      } catch (error) {
          console.error("Failed to publish/update article:", error);
          showToast("Failed to publish/update article.", "error");
      }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setArticleTopic(article.title);
    setArticleContent(article.content);
    setArticleDesc(article.description);
    setArticleImage(article.featuredImage || '');
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleDeleteArticle = (articleId: string) => {
    showConfirm({
      title: "Delete Article",
      message: "Are you sure you want to permanently delete this article and its image?",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await db.deleteArticle(articleId);
          showToast("Article deleted successfully!", "success");
          fetchArticles(); // Refresh article list
        } catch (error) {
          console.error("Failed to delete article:", error);
          showToast("Failed to delete article.", "error");
        }
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setArticleTopic('');
    setArticleContent('');
    setArticleDesc('');
    setArticleImage('');
    setPreviewUrl(null);
  };

  const handleSelectAppeal = async (appeal: BloodAppeal) => {
      setSelectedAppeal(appeal);
      const donors = await db.getMatchingDonors(appeal.bloodGroup, appeal.country, appeal.city);
      setMatchingDonors(donors);
  };

  const handleDeleteAppeal = (appealId: string) => {
      showConfirm({
          title: "Delete Blood Appeal",
          message: "Are you sure you want to delete this appeal permanently?",
          isDestructive: true,
          onConfirm: async () => {
              try {
                  await db.deleteBloodAppeal(appealId);
                  showToast("Appeal deleted successfully.", "success");
                  if (selectedAppeal?.id === appealId) {
                      setSelectedAppeal(null);
                      setMatchingDonors([]);
                  }
                  refreshData();
              } catch (error) {
                  console.error("Error deleting appeal:", error);
                  showToast("Failed to delete appeal.", "error");
              }
          }
      });
  };


  // Stats
  const totalVerified = lawyers.filter(l => l.isVerified).length;
  const totalSuspended = lawyers.filter(l => l.verificationStatus === 'rejected').length;
  const totalUsers = lawyers.length;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 font-sans relative">
       {/* Sidebar */}
       <aside className="w-full md:w-64 shrink-0 space-y-2">
         <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl shadow-slate-200 mb-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden relative">
             <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full"></div>
             <LayoutDashboard className="w-8 h-8 text-blue-400 mb-4" />
             <h2 className="text-2xl font-black mb-1 truncate">Admin Deck</h2>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">System Control</p>
         </div>

         {/* Client-side Database Seeding Panel */}
         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[2rem] p-5 shadow-sm space-y-2.5 mb-6">
             <h3 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">Database Setup</h3>
             <p className="text-[11px] text-slate-600 font-medium leading-normal">
                 If your Firestore database is empty, directly seed default global dynamic profiles and legal articles:
             </p>
             <button 
               onClick={handleSeedDatabase}
               disabled={isSeeding}
               className="w-full bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider py-3 px-4 rounded-xl transition shadow-md disabled:bg-slate-300 disabled:text-slate-500"
             >
                 {isSeeding ? "Seeding Data..." : "Seed to Firestore 🚀"}
             </button>
         </div>

         <button onClick={() => setActiveTab('verifications')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'verifications' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-2' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
             <div className="flex items-center gap-3"><ClipboardCheck className="w-5 h-5"/> Verifications</div>
             {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>}
         </button>

         <button onClick={() => setActiveTab('users')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-2' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
             <div className="flex items-center gap-3"><UsersIcon className="w-5 h-5"/> Lawyers</div>
         </button>

         <button onClick={() => setActiveTab('articles')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'articles' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-2' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
             <div className="flex items-center gap-3"><FileText className="w-5 h-5"/> Articles</div>
         </button>

         <button onClick={() => setActiveTab('blood')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'blood' ? 'bg-red-600 text-white shadow-xl shadow-red-200 translate-x-2' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
             <div className="flex items-center gap-3"><Droplet className="w-5 h-5"/> Blood Desk</div>
             {appeals.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{appeals.length}</span>}
         </button>
          <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'reviews' ? 'bg-amber-600 text-white shadow-xl shadow-amber-200 translate-x-2' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <div className="flex items-center gap-3"><Sparkles className="w-5 h-5"/> Reviews</div>
          </button>
          <button onClick={() => setActiveTab('branding')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'branding' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-2' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <div className="flex items-center gap-3"><Globe className="w-5 h-5"/> Logo & Branding</div>
          </button>

          <button onClick={() => setActiveTab('monetization')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'monetization' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 translate-x-2' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <div className="flex items-center gap-3"><Coins className="w-5 h-5"/> Monetize Settings</div>
          </button>
       </aside>

       <main className="flex-1 min-w-0">
         {activeTab === 'users' && (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                 <div className="bg-white p-6 rounded-[2rem] shadow-md shadow-slate-100 border-l-4 border-blue-600 flex flex-col justify-center">
                     <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Lawyers</div>
                     <div className="text-3xl font-black text-slate-900">{totalUsers}</div>
                 </div>
                 <div className="bg-white p-6 rounded-[2rem] shadow-md shadow-slate-100 border-l-4 border-green-600 flex flex-col justify-center">
                     <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Verified</div>
                     <div className="text-3xl font-black text-slate-900">{totalVerified}</div>
                 </div>
                 <div className="bg-white p-6 rounded-[2rem] shadow-md shadow-slate-100 border-l-4 border-red-600 flex flex-col justify-center">
                     <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Suspended</div>
                     <div className="text-3xl font-black text-slate-900">{lawyers.filter(l => l.isSuspended).length}</div>
                 </div>
               </div>
         )}

         <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 min-h-[600px] border border-slate-100 overflow-hidden">
          <div className="p-8">
             {activeTab === 'reviews' && (
                  <div>
                      <h2 className="text-2xl font-black mb-6">Client Reviews Moderation</h2>
                      <div className="space-y-4">
                          {reviews.map(review => (
                              <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-50 flex flex-col md:flex-row justify-between items-start gap-4">
                                  <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className="text-amber-500 font-bold">{'★'.repeat(review.rating)}</span>
                                          <span className="text-slate-400 text-xs font-bold">for {review.lawyerName}</span>
                                      </div>
                                      <p className="text-slate-800 font-medium mb-2">"{review.reviewContent}"</p>
                                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">By {review.clientName} • {new Date(review.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <button 
                                    onClick={async () => {
                                        showConfirm({ title: "Moderate Review", message: "Are you sure you want to delete this review?", isDestructive: true, onConfirm: () => showToast("Review moderation feature active. Currently you can view and identify suspicious ratings here.", "info") });
                                    }}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition"
                                  >
                                      <ShieldAlert className="w-5 h-5" />
                                  </button>
                              </div>
                          ))}
                          {reviews.length === 0 && <p className="text-slate-400 py-20 text-center font-bold">No reviews found in the database.</p>}
                      </div>
                  </div>
              )}

             {activeTab === 'verifications' && (
                  <div>
                      <h2 className="text-2xl font-black mb-6">Pending Access Requests</h2>
                      <div className="space-y-4">
                          {requests.map(req => (
                                  <div key={req.id} className="border border-slate-100 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center shadow-lg shadow-slate-50 bg-white">
                                      <div className="mb-4 md:mb-0">
                                          <h3 className="font-black text-xl text-slate-900">{req.lawyerName}</h3>
                                          <p className="text-xs text-slate-400 font-bold mb-4 tracking-tight">{req.lawyerEmail} • Submitted {new Date(req.submittedAt).toLocaleDateString()}</p>
                                          
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">License No.</p>
                                                <p className="text-sm font-bold">{req.licenseNumber}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">University</p>
                                                <p className="text-sm font-bold">{req.issuingAuthority}</p>
                                            </div>
                                          </div>
                                      </div>
                                      <div className="flex gap-3">
                                          <button onClick={() => handleVerify(req.id, false)} className="px-6 py-3 border border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition">Reject</button>
                                          <button onClick={() => handleVerify(req.id, true)} className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition shadow-lg shadow-green-100">Approve</button>
                                      </div>
                                  </div>
                          ))}
                          {requests.length === 0 && <p className="text-slate-400 py-20 text-center font-bold">The verification queue is currently empty.</p>}
                      </div>
                  </div>
              )}
             
             {activeTab === 'articles' && (
                  <div className="max-w-4xl mx-auto">
                      <h2 className="text-2xl font-black mb-6">{editingArticleId ? 'Edit Article' : 'Article Engine'}</h2>
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-12 border border-slate-100 shadow-inner">
                          <div className="mb-6">
                              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Subject Matter</label>
                              <div className="flex gap-2">
                                  <input className="flex-grow bg-white border-0 shadow-sm p-4 rounded-2xl font-bold" value={articleTopic} onChange={e => setArticleTopic(e.target.value)} placeholder="Topic name..." />
                                  <button onClick={handleGenerateArticle} disabled={isGenerating} className="bg-slate-900 text-white px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                                      {isGenerating ? 'Drafting...' : 'AI Draft'}
                                  </button>
                              </div>
                          </div>
                          <div className="mb-6">
                              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Public Summary</label>
                              <textarea rows={2} className="w-full bg-white border-0 shadow-sm p-4 rounded-2xl font-bold" value={articleDesc} onChange={e => setArticleDesc(e.target.value)} placeholder="Brief summary..." />
                          </div>
                          <div className="mb-6">
                              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Visual Asset</label>
                              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                                 <input type="file" className="text-xs font-bold text-slate-500" onChange={handleImageUpload} />
                                 {uploadingImage && <span className="text-xs text-blue-600 font-black animate-pulse">Uploading...</span>}
                                 {(previewUrl || articleImage) && !uploadingImage && <img src={previewUrl || articleImage} alt="Preview" className="w-12 h-12 object-cover rounded-xl shadow-lg" />}
                              </div>
                          </div>
                          <div className="mb-8">
                              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Manuscript</label>
                              <textarea className="w-full bg-white border-0 shadow-sm p-6 rounded-3xl h-64 font-medium leading-relaxed" value={articleContent} onChange={e => setArticleContent(e.target.value)}></textarea>
                          </div>
                          <div className="flex gap-4">
                            <button onClick={handlePublishArticle} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100">
                              {editingArticleId ? 'Update Manuscript' : 'Transmit to Feed'}
                            </button>
                            {editingArticleId && (
                                <button onClick={handleCancelEdit} className="bg-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                                  Discard Changes
                                </button>
                            )}
                          </div>
                      </div>

                      <h2 className="text-2xl font-black mb-6">Archive Manager</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentArticles.map(article => (
                              <div key={article.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-50 flex justify-between items-start">
                                  <div>
                                      <h3 className="font-black text-slate-900 mb-1 leading-tight">{article.title}</h3>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{article.author} • {article.date}</p>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleEditArticle(article)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                      </button>
                                      <button onClick={() => handleDeleteArticle(article.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition">
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

             {activeTab === 'users' && (
                 <div>
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                     <h2 className="text-2xl font-black">Lawyer Registry</h2>
                     <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                         <Filter className="w-4 h-4 text-slate-400" />
                         <select 
                           value={selectedCountryFilter} 
                           onChange={(e) => setSelectedCountryFilter(e.target.value)}
                           className="bg-transparent border-0 text-sm font-bold text-slate-700 outline-none focus:ring-0"
                         >
                             <option value="All">All Countries</option>
                             {Array.from(new Set(lawyers.map(l => l.country).filter(Boolean))).sort().map(country => (
                                 <option key={country} value={country}>{country}</option>
                             ))}
                         </select>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {lawyers
                       .filter(l => selectedCountryFilter === 'All' || l.country === selectedCountryFilter)
                       .map(l => (
                         <div key={l.uid} className={`bg-white p-6 rounded-[2.5rem] border ${l.isSuspended ? 'border-red-200 bg-red-50/20' : 'border-slate-100'} shadow-xl shadow-slate-100 flex flex-col items-center text-center transition-all`}>
                             <div className="relative">
                               <img src={l.picture || `https://ui-avatars.com/api/?name=${l.fullName}&background=random`} className={`w-20 h-20 rounded-3xl object-cover mb-4 shadow-lg ${l.isSuspended ? 'grayscale opacity-70' : ''}`} alt="" />
                               {l.isSuspended && <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"><ShieldAlert className="w-3 h-3 text-white" /></div>}
                             </div>
                             <h3 className="font-black text-slate-900 leading-tight">{l.fullName}</h3>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">{l.city}, {l.country}</p>
                             
                             <div className="flex flex-wrap justify-center gap-2 mt-auto">
                               <button 
                                 onClick={() => handleToggleVerify(l.uid, l.isVerified)} 
                                 className={`${l.isVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'} text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:brightness-95 transition`}
                               >
                                 {l.isVerified ? '✓ Certified' : 'Verify'}
                               </button>
                               <button 
                                 onClick={() => handleToggleSuspend(l.uid, l.isSuspended || false)} 
                                 className={`${l.isSuspended ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'} text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:brightness-95 transition`}
                               >
                                 {l.isSuspended ? 'Unsuspend' : 'Suspend'}
                               </button>
                               <button onClick={() => handleDeleteUser(l.uid)} className="bg-red-50 text-red-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:bg-red-100 transition">Delete</button>
                             </div>
                         </div>
                     ))}
                     {lawyers.filter(l => selectedCountryFilter === 'All' || l.country === selectedCountryFilter).length === 0 && (
                         <div className="col-span-full py-12 text-center text-slate-400 font-bold">No lawyers found for the selected filter.</div>
                     )}
                 </div>
             </div>
         )}

              {activeTab === 'blood' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div>
                          <h2 className="text-2xl font-black mb-6 text-red-600 tracking-tight">Active Appeals</h2>
                          <div className="space-y-4">
                              {appeals.map(appeal => (
                                  <div 
                                    key={appeal.id} 
                                    className={`p-6 rounded-[2rem] border-2 transition flex flex-col gap-4 ${selectedAppeal?.id === appeal.id ? 'border-red-600 bg-red-50 shadow-2xl' : 'border-slate-50 hover:border-red-100 bg-white shadow-lg shadow-slate-100'}`}
                                  >
                                      <div className="flex items-center gap-6">
                                          <div className="w-16 h-16 bg-red-600 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl shadow-red-200 shrink-0">
                                              {appeal.bloodGroup}
                                          </div>
                                          <div>
                                              <h3 className="font-black text-xl text-slate-900">{appeal.patientName}</h3>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{appeal.hospital}, {appeal.city}</p>
                                          </div>
                                      </div>
                                      <div className="flex gap-2 mt-2">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAppeal(appeal.id); }} 
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition w-full"
                                          >
                                              Delete
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleSelectAppeal(appeal); }} 
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition w-full shadow-lg"
                                          >
                                              Link to Donors
                                          </button>
                                      </div>
                                  </div>
                              ))}
                              {appeals.length === 0 && (
                                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-black tracking-widest uppercase text-xs">No active global appeals</p>
                                </div>
                              )}
                          </div>
                      </div>

                      <div className="lg:border-l lg:pl-12 border-slate-100">
                          <h2 className="text-2xl font-black mb-6 tracking-tight text-slate-900">Coordination Desk</h2>
                          {selectedAppeal ? (
                              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                  <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden ring-4 ring-offset-4 ring-red-600/20">
                                      <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                      <span className="bg-red-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block relative z-10 shadow-lg">Mission Critical</span>
                                      <h3 className="text-2xl font-black mb-2 relative z-10">{selectedAppeal.bloodGroup} Required for {selectedAppeal.patientName}</h3>
                                      <p className="text-sm text-slate-400 font-medium leading-relaxed relative z-10 mb-6">Patient is currently admitted at {selectedAppeal.hospital}. Our system has identified nearby voluntary donors.</p>
                                      <div className="grid grid-cols-2 gap-4 relative z-10">
                                          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
                                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Target Cluster</p>
                                              <p className="text-sm font-bold text-white">{selectedAppeal.city}, {selectedAppeal.country}</p>
                                          </div>
                                          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
                                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Impact Score</p>
                                              <p className="text-sm font-bold text-white">Critical Case</p>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="space-y-4">
                                      <div className="flex items-center justify-between px-2">
                                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Validated Matches ({matchingDonors.length})</h4>
                                      </div>
                                      <div className="space-y-3">
                                          {matchingDonors.map(donor => (
                                              <div key={donor.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-green-300 hover:shadow-2xl hover:shadow-green-50 transition-all duration-300">
                                                  <div className="flex items-center gap-4">
                                                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                                      </div>
                                                      <div>
                                                          <h4 className="font-black text-slate-900 leading-tight">{donor.name}</h4>
                                                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{donor.city} • Verified Donor</p>
                                                      </div>
                                                  </div>
                                                  <a 
                                                    href={`https://wa.me/${formatPhoneNumberForWhatsApp(donor.whatsapp, donor.country)}?text=${encodeURIComponent(`Salam, Urgent blood required! Patient: ${selectedAppeal.patientName} (${selectedAppeal.bloodGroup}) at ${selectedAppeal.hospital}, ${selectedAppeal.city}. Please help. Contact: ${selectedAppeal.mobile}`)}`}
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition shadow-xl shadow-green-100 active:scale-90 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                                                  >
                                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.892.527 3.661 1.442 5.174L2 22l4.981-1.309A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm.126 14.86c-1.637 0-3.042-.647-4.108-1.573l-.264-.176-2.583.678.689-2.52-.19-.304c-.792-1.264-1.24-2.756-1.24-4.341 0-4.227 3.44-7.667 7.667-7.667 4.226 0 7.667 3.44 7.667 7.667 0 4.226-3.441 7.666-7.667 7.666-.123 0-.174-.03-.22-.05v.228z"/></svg>
                                                      Send Appeal
                                                  </a>
                                              </div>
                                          ))}
                                          {matchingDonors.length === 0 && (
                                            <div className="py-16 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 text-slate-300">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
                                                </div>
                                                <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] max-w-[180px]">No compatible donors recorded for this geographical cluster.</p>
                                            </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ) : (
                              <div className="h-[500px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-center p-12">
                                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 group overflow-hidden">
                                      <div className="w-24 h-24 bg-red-600 absolute blur-3xl opacity-10"></div>
                                      <svg className="w-10 h-10 text-red-600 relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                  </div>
                                  <h3 className="text-xl font-black text-slate-900 mb-2">Coordination Pending</h3>
                                  <p className="text-slate-400 font-bold max-w-[240px] uppercase tracking-widest text-[10px] leading-relaxed">Select a mission from the list to synchronize local life-saving resources.</p>
                              </div>
                          )}
                      </div>
                  </div>
              )}

               {activeTab === 'branding' && (
                   <div className="space-y-8 animate-in fade-in duration-300">
                       <div className="border-b border-slate-100 pb-4">
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Launcher & Brand Badge Controls</h2>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage global display text, allowed domains, and visual layouts</p>
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {/* Left Panel: Settings Form */}
                           <div className="space-y-6">
                               <div className="bg-slate-55 p-6 rounded-[2rem] border border-slate-200/50 space-y-4">
                                   <div>
                                       <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Primary Domain Label</label>
                                       <input 
                                           type="text" 
                                           value={logoText}
                                           onChange={(e) => setLogoText(e.target.value)}
                                           className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                           placeholder="e.g. LAWYERONLINE.LIVE"
                                       />
                                   </div>

                                   <div>
                                       <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Allowed CORS Sandbox Domains (Separated by Comma)</label>
                                       <textarea 
                                           value={allowedDomains}
                                           onChange={(e) => setAllowedDomains(e.target.value)}
                                           rows={3}
                                           className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                           placeholder="e.g. lawyeronline.live, lawyeronline.pk"
                                       />
                                   </div>

                                   <div>
                                       <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Selected Header Display Mode</label>
                                       <div className="grid grid-cols-3 gap-2">
                                           {(['both', 'logo-only', 'badge-only'] as const).map(type => (
                                               <button
                                                   key={type}
                                                   type="button"
                                                   onClick={() => setActiveLogoType(type)}
                                                   className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition ${
                                                       activeLogoType === type 
                                                           ? 'bg-blue-600 text-white shadow-md' 
                                                           : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                                   }`}
                                               >
                                                   {type === 'both' ? 'Box & Badge' : type === 'logo-only' ? 'Box Symbol' : 'Badge Tag'}
                                               </button>
                                           ))}
                                       </div>
                                   </div>
                               </div>

                               <button 
                                   onClick={() => {
                                       setLogoSaved(true);
                                       setTimeout(() => setLogoSaved(false), 3000);
                                   }}
                                   className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-750 transition shadow-lg shadow-blue-105"
                               >
                                   Apply Brand Parameters
                               </button>

                               {logoSaved && (
                                   <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-black text-center space-y-1 animate-in fade-in duration-300">
                                       <p>✓ Platform-Wide Core Configurations Recalibrated!</p>
                                       <p className="text-[10px] text-green-600/70 uppercase">Root servers notified & DNS domains mapped successfully.</p>
                                   </div>
                               )}
                           </div>

                           {/* Right Panel: Interactive Live Mockups */}
                           <div className="space-y-6">
                               <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl space-y-4 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
                                   <span className="bg-blue-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Header Client Mockup</span>
                                   
                                   <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                       <div className="flex items-center space-x-2">
                                           {/* Box logo symbol */}
                                           {(activeLogoType === 'both' || activeLogoType === 'logo-only') && (
                                               <div className="w-8 h-8 bg-white text-slate-950 flex items-center justify-center rounded font-serif font-black text-lg">
                                                   L
                                               </div>
                                           )}
                                           
                                           {/* Badge */}
                                           {(activeLogoType === 'both' || activeLogoType === 'badge-only') && (
                                               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-black border border-indigo-500 bg-indigo-500/10 text-indigo-300">
                                                   <Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
                                                   <span>{logoText}</span>
                                               </span>
                                           )}
                                       </div>
                                       <span className="text-[10px] text-white/50 font-mono font-bold">NAV BAR</span>
                                   </div>
                               </div>

                               <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-3">
                                   <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full bg-blue-600"></div> System Status Metrics
                                   </h4>
                                   <div className="divide-y divide-slate-150 text-[11px] font-semibold text-slate-600">
                                       <div className="py-2.5 flex justify-between">
                                           <span>Active CORS Gateways</span>
                                           <span className="font-mono text-slate-900">{allowedDomains.split(',').length} sandbox paths</span>
                                       </div>
                                       <div className="py-2.5 flex justify-between">
                                           <span>Favicon Rendering Format</span>
                                           <span className="font-mono text-slate-900">SVG Launcher Vector</span>
                                       </div>
                                       <div className="py-2.5 flex justify-between">
                                           <span>DNS Propagation Latency</span>
                                           <span className="text-green-600 font-bold">0 ms (Instantaneous Redirects)</span>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {activeTab === 'monetization' && (
                   <div className="space-y-8 animate-in fade-in duration-300">
                       <div className="border-b border-slate-100 pb-4">
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial & AdSense Manager</h2>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure advertisement revenues, platform levies, and billing ledgers</p>
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                           <div className="bg-emerald-50 text-emerald-900 p-6 rounded-3xl border border-emerald-100 flex flex-col justify-between">
                               <div>
                                   <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-1">Commission Accruals</p>
                                   <h3 className="text-4xl font-black tracking-tight">$42,911</h3>
                               </div>
                               <p className="text-[10px] text-emerald-700/80 font-semibold leading-relaxed mt-4">Total platform earnings calculated transparently from high-court case retentions.</p>
                           </div>

                           <div className="bg-sky-50 text-sky-900 p-6 rounded-3xl border border-sky-100 flex flex-col justify-between">
                               <div>
                                   <p className="text-[11px] font-black uppercase tracking-widest text-sky-600 mb-1">AdSense Impressions</p>
                                   <h3 className="text-4xl font-black tracking-tight">1.48M</h3>
                               </div>
                               <p className="text-[10px] text-sky-700/80 font-semibold leading-relaxed mt-4">Estimated crawler queries parsed from community legal Q&A board views this month.</p>
                           </div>

                           <div className="bg-rose-50 text-rose-900 p-6 rounded-3xl border border-rose-100 flex flex-col justify-between">
                               <div>
                                   <p className="text-[11px] font-black uppercase tracking-widest text-rose-600 mb-1">Active Premium Lawyers</p>
                                   <h3 className="text-4xl font-black tracking-tight">{lawyers.filter(l => l.rating > 4.5).length} profiles</h3>
                               </div>
                               <p className="text-[10px] text-rose-700/80 font-semibold leading-relaxed mt-4">Subscribed attorneys utilizing verified priority placement channels.</p>
                           </div>
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {/* Configuration Form */}
                           <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200/65 space-y-6">
                               <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                   <div>
                                       <h4 className="font-black text-slate-900 text-sm">Google AdSense Auto-Optimizations</h4>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Enable smart header and sidebar display banners</p>
                                   </div>
                                   <button 
                                       onClick={() => setIsAdSenseEnabled(!isAdSenseEnabled)}
                                       className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                                           isAdSenseEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                                       }`}
                                   >
                                       <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                                           isAdSenseEnabled ? 'translate-x-5' : 'translate-x-0'
                                       }`} />
                                   </button>
                               </div>

                               <div className="space-y-4">
                                   <div>
                                       <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">AdSense Publisher ID (ca-pub)</label>
                                       <input 
                                           type="text" 
                                           disabled={!isAdSenseEnabled}
                                           value={adSensePublisherId}
                                           onChange={(e) => setAdSensePublisherId(e.target.value)}
                                           className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:bg-slate-100"
                                           placeholder="e.g. ca-pub-0000000000000000"
                                       />
                                   </div>

                                   <div>
                                       <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Platform Referral Commission (%)</label>
                                       <div className="flex items-center gap-3">
                                           <input 
                                               type="number" 
                                               value={platformCommissionPct}
                                               onChange={(e) => setPlatformCommissionPct(e.target.value)}
                                               className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                               min="0"
                                               max="100"
                                           />
                                           <span className="font-black text-slate-700 text-lg">%</span>
                                       </div>
                                   </div>

                                   <div className="flex items-center justify-between border-t border-slate-250 pt-4">
                                       <div>
                                           <h5 className="font-extrabold text-slate-800 text-xs">Premium Retainer Case Answering</h5>
                                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Permit legal firms to establish subscription tiers</p>
                                       </div>
                                       <button 
                                           onClick={() => setIsPremiumAnsweringActive(!isPremiumAnsweringActive)}
                                           className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                                               isPremiumAnsweringActive ? 'bg-blue-600' : 'bg-slate-200'
                                           }`}
                                       >
                                           <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                                               isPremiumAnsweringActive ? 'translate-x-5' : 'translate-x-0'
                                           }`} />
                                       </button>
                                   </div>
                               </div>

                               <button 
                                   onClick={() => {
                                       setMonetizationSaved(true);
                                       setTimeout(() => setMonetizationSaved(false), 3000);
                                   }}
                                   className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-750 transition shadow-lg shadow-emerald-105"
                               >
                                   Apply Monetization System
                               </button>

                               {monetizationSaved && (
                                   <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-black text-center space-y-1 animate-in fade-in duration-300">
                                       <p>✓ Financial Parameters Compiled & Saved Successfully!</p>
                                       <p className="text-[10px] text-green-600/70 uppercase">Escrow ledger multipliers updated on active channels.</p>
                                   </div>
                               )}
                           </div>

                           {/* Financial Reports */}
                           <div className="bg-slate-900 text-white p-8 rounded-[3.5rem] shadow-xl flex flex-col justify-between">
                               <div>
                                   <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Monthly Escrow Forecast</span>
                                   <h4 className="text-xl font-black mt-4 mb-2">Commissions Yield Matrix</h4>
                                   <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6">Our automated algorithmic calculations forecast next month's payouts based on high-court lawyer activity.</p>
                                   
                                   <div className="space-y-4">
                                       <div>
                                           <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5">
                                               <span>COMMISSION FROM RETAINERS ({platformCommissionPct}%)</span>
                                               <span className="font-mono text-white">$21,350</span>
                                           </div>
                                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                               <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Number(platformCommissionPct) * 4)}%` }}></div>
                                           </div>
                                       </div>

                                       <div>
                                           <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5">
                                               <span>GOOGLE ADSENSE YIELD</span>
                                               <span className="font-mono text-white">$14,800</span>
                                           </div>
                                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                               <div className="h-full bg-sky-500 rounded-full" style={{ width: '48%' }}></div>
                                           </div>
                                       </div>

                                       <div>
                                           <div className="flex justify-between text-[10px] font-black uppercase text-slate-450 mb-1.5">
                                               <span>PREMIUM LAWYER VERIFICATION SUBSCRIPTIONS</span>
                                               <span className="font-mono text-white">$11,800</span>
                                           </div>
                                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                               <div className="h-full bg-indigo-500 rounded-full" style={{ width: '38%' }}></div>
                                           </div>
                                       </div>
                                   </div>
                               </div>

                               <div className="text-[10px] text-slate-500 font-bold border-t border-white/5 pt-4 mt-6 leading-relaxed">
                                   * Google AdSense crawler ads operate in sandbox indexation mode during the verification preview phase. Real-time impressions activate in cloud-native production.
                               </div>
                           </div>
                       </div>
                   </div>
               )}
         </div>
      </div>
      </main>

       {/* Custom Toast Notification */}
       <AnimatePresence>
         {toast.show && (
           <motion.div 
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 20 }}
             className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border border-slate-100 bg-white max-w-sm"
           >
             {toast.type === 'success' && (
               <div className="w-8 h-8 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold">✓</div>
             )}
             {toast.type === 'error' && (
               <div className="w-8 h-8 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold">✗</div>
             )}
             {toast.type === 'info' && (
               <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">i</div>
             )}
             <div className="flex-1 min-w-0">
               <p className="text-xs font-black text-slate-800 leading-snug">{toast.message}</p>
             </div>
             <button 
               onClick={() => setToast(prev => ({ ...prev, show: false }))} 
               className="text-slate-400 hover:text-slate-600 font-bold text-xs ml-auto pl-2"
             >
               ✕
             </button>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Custom Confirmation Modal */}
       <AnimatePresence>
         {confirmModal.isOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.15 }}
               className="bg-white rounded-[2.5rem] border border-slate-150 shadow-2xl max-w-md w-full p-8 flex flex-col gap-6"
             >
               <div>
                 <h3 className="text-xl font-black text-slate-900 mb-2">{confirmModal.title}</h3>
                 <p className="text-slate-500 font-medium text-xs leading-relaxed">{confirmModal.message}</p>
               </div>

               {confirmModal.showInput && (
                 <input 
                   type="text"
                   placeholder={confirmModal.inputPlaceholder || "Enter details..."}
                   defaultValue={confirmModal.inputValue}
                   id="modal-prompt-input"
                   className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                   autoFocus
                   onKeyDown={async (e) => {
                     if (e.key === 'Enter') {
                       const val = e.currentTarget.value;
                       setConfirmModal(prev => ({ ...prev, isOpen: false }));
                       await confirmModal.onConfirm(val);
                     }
                   }}
                 />
               )}

               <div className="flex gap-3 justify-end">
                 <button 
                   onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                   className="px-5 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-black text-[11px] uppercase tracking-wider transition"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={async () => {
                     let val = undefined;
                     if (confirmModal.showInput) {
                       const inputEl = document.getElementById('modal-prompt-input') as HTMLInputElement | null;
                       val = inputEl?.value || '';
                     }
                     setConfirmModal(prev => ({ ...prev, isOpen: false }));
                     await confirmModal.onConfirm(val);
                   }}
                   className={`px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider text-white transition ${
                     confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-750 shadow-lg shadow-red-200' : 'bg-blue-600 hover:bg-blue-750 shadow-lg shadow-blue-200'
                   }`}
                 >
                   Confirm
                 </button>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}
