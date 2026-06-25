
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { LawyerProfile } from '../types';
import * as db from '../services/mockDataService';
import { useNavigate, Link } from 'react-router-dom';
import { compressImage } from '../utils/imageUtils';
import { Plus, Briefcase, FileText, Wallet } from 'lucide-react';

export default function LawyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LawyerProfile | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const p = await db.getLawyerProfile(user.uid);
    setProfile(p);
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && user) {
          try {
              setUploading(true);
              const originalFile = e.target.files[0];
              
              setPreviewUrl(URL.createObjectURL(originalFile));

              const compressedFile = await compressImage(originalFile, 800, 800, 0.7);
              const path = `profile-pictures/${user.uid}/${Date.now()}_${compressedFile.name}`;
              const oldPictureUrl = profile?.picture;
              const url = await db.uploadFile(compressedFile, path, oldPictureUrl);
              
              if (profile) {
                  const updated = { ...profile, picture: url };
                  await db.updateLawyerProfile(updated);
                  setProfile(updated);
              }
          } catch (error) {
              alert("Failed to upload profile picture");
              console.error(error);
          } finally {
              setUploading(false);
          }
      }
  };

  if (!user) return null;

  const menuItems = [
    { title: 'My Profile', description: 'Update your professional bio, contact info and specialties', icon: '👤', path: '/dashboard/lawyer/profile', color: 'bg-blue-50 text-blue-600' },
    { title: 'Case Manager', description: 'Manage your active cases, clients, and hearing dates', icon: '📁', path: '/dashboard/lawyer/cases', color: 'bg-slate-50 text-slate-700' },
    { title: 'Ledger (Financials)', description: 'Track legal fees, payments and client balances', icon: '💰', path: '/dashboard/lawyer/ledger', color: 'bg-green-50 text-green-700' },
    { title: 'P2P Meetings', description: 'Launch instant, encrypted browser-based audio/video conferences', icon: '🤝', path: '/meeting/lobby', color: 'bg-teal-50 text-teal-700' },
    { title: 'Verification', description: 'Submit and check your professional licensing status', icon: '✓', path: '/dashboard/lawyer/verification', color: 'bg-purple-50 text-purple-700' },
    { title: 'AI Tools', description: 'Generate legal drafts and use advanced AI assistants', icon: '⚡', path: '/dashboard/lawyer/tools', color: 'bg-orange-50 text-orange-700' },
    { title: 'Blood Donation', description: 'Register as life-saving donor', icon: '❤️', path: '/blood-donation', color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-8">
      {/* Admin Switcher */}
      {user.role === 'admin' && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
            <div>
                <h3 className="font-bold text-red-800">Administrator Access</h3>
                <p className="text-sm text-red-600">You are viewing the Lawyer Portal. You can manage everything from the Admin Portal.</p>
            </div>
            <button onClick={() => navigate('/dashboard/admin')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-sm">Admin Portal</button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-8 flex flex-col items-center">
            <div className="relative group cursor-pointer w-28 h-28 mb-4">
                <div className="w-28 h-28 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100 shadow">
                    <img 
                         src={previewUrl || profile?.picture || `https://picsum.photos/seed/${user.uid}/200`} 
                         alt="Profile" 
                         className="w-full h-full object-cover"
                    />
                </div>
                <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition cursor-pointer">
                     <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                     <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </label>
                {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"><div className="animate-spin h-6 w-6 border-2 border-white rounded-full border-t-transparent"></div></div>}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 font-serif">{profile?.fullName || 'Welcome Back!'}</h1>
            <p className="text-slate-500 text-sm mt-1">{profile?.city ? `${profile.city}, ${profile.country}` : user.email}</p>
            {profile?.isVerified && (
                <span className="bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mt-3 flex items-center shadow-sm border border-green-200">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    Verified Professional
                </span>
            )}
        </div>

        <div className="grid grid-cols-1 gap-4">
            {menuItems.map((item, idx) => (
                <Link 
                    key={idx} 
                    to={item.path}
                    className="flex items-center p-6 rounded-2xl border border-transparent hover:border-slate-200 bg-white shadow-sm hover:shadow-md transition group"
                >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mr-6 ${item.color.split(' ')[0]} group-hover:scale-110 transition`}>
                        {item.icon}
                    </div>
                    <div className="flex-grow">
                        <h3 className={`font-bold text-lg ${item.color.split(' ')[1]}`}>{item.title}</h3>
                        <p className="text-slate-500 text-sm mt-1">{item.description}</p>
                    </div>
                    <div className="text-slate-300 group-hover:text-blue-500 transition translate-x-0 group-hover:translate-x-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </Link>
            ))}
        </div>

    </div>
  );
}
