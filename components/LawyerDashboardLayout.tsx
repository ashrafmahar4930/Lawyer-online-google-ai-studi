
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import * as db from '../services/mockDataService';
import { LawyerProfile } from '../types';
import AnimatedLogo from './AnimatedLogo';

interface LawyerDashboardLayoutProps {
  children: React.ReactNode;
}

export default function LawyerDashboardLayout({ children }: LawyerDashboardLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);

  useEffect(() => {
    if (user?.uid) {
      db.getLawyerProfile(user.uid)
        .then((p) => {
          if (p) setProfile(p);
        })
        .catch((err) => console.warn('Could not load profile for dashboard subtitle localization:', err));
    }
  }, [user]);

  // Global Roman localized subtitles mapping dictionaries
  const localizationMap = {
    pakistan: {
      overviewSub: 'Tafseelat',
      profileSub: 'Shakhsi Maloomat',
      casesSub: 'Muqadmat',
      ledgerSub: 'Ledger Ledger',
      verificationSub: 'Sarkari Tasdeeq',
      toolsSub: 'AI Sahooliat',
      bloodSub: 'Atia-e-Khoon',
    },
    india: {
      overviewSub: 'Sankshipt Vivaran',
      profileSub: 'Mera Profile',
      casesSub: 'Kanooni Mamle',
      ledgerSub: 'Bahi Ledger',
      verificationSub: 'Sarkari Satyapan',
      toolsSub: 'AI Upkaran',
      bloodSub: 'Raktadan Seva',
    },
    arabic: {
      overviewSub: 'Mulakhas',
      profileSub: 'Al-Malaf Al-Shakhsi',
      casesSub: 'Idarat Al-Qadaya',
      ledgerSub: 'Daftar Al-Hisab',
      verificationSub: 'Al-Tawtheeq',
      toolsSub: 'Adawat Al-Aqli',
      bloodSub: 'Tabarru Dam',
    },
    default: {
      overviewSub: 'General Overview',
      profileSub: 'Personal Profile',
      casesSub: 'Docket & Case Files',
      ledgerSub: 'Financial Ledger',
      verificationSub: 'Roll Council Lic',
      toolsSub: 'Advocate AI Co-pilot',
      bloodSub: 'Civic Help Desk',
    },
  };

  const getSub = (title: string) => {
    const normCountry = (profile?.country || '').toLowerCase().trim();
    let dict = localizationMap.default;

    if (normCountry.includes('pakistan') || normCountry.includes('pk')) {
      dict = localizationMap.pakistan;
    } else if (normCountry.includes('india') || normCountry.includes('in')) {
      dict = localizationMap.india;
    } else if (
      normCountry.includes('saudi') ||
      normCountry.includes('uae') ||
      normCountry.includes('dubai') ||
      normCountry.includes('arab') ||
      normCountry.includes('egypt')
    ) {
      dict = localizationMap.arabic;
    }

    switch (title) {
      case 'Overview':
        return dict.overviewSub;
      case 'My Profile':
        return dict.profileSub;
      case 'Case Manager':
        return dict.casesSub;
      case 'Ledger (Financials)':
        return dict.ledgerSub;
      case 'Verification':
        return dict.verificationSub;
      case 'AI Tools':
        return dict.toolsSub;
      case 'Blood Donation':
        return dict.bloodSub;
      default:
        return '';
    }
  };

  const menuItems = [
    { title: 'Overview', icon: '🏠', path: '/dashboard/lawyer', color: 'bg-slate-50 text-slate-700' },
    { title: 'My Profile', icon: '👤', path: '/dashboard/lawyer/profile', color: 'bg-blue-50 text-blue-600' },
    { title: 'Case Manager', icon: '📁', path: '/dashboard/lawyer/cases', color: 'bg-slate-100 text-slate-800' },
    { title: 'Ledger (Financials)', icon: '💰', path: '/dashboard/lawyer/ledger', color: 'bg-green-50 text-green-700' },
    { title: 'Verification', icon: '✓', path: '/dashboard/lawyer/verification', color: 'bg-purple-50 text-purple-700' },
    { title: 'AI Tools', icon: '⚡', path: '/dashboard/lawyer/tools', color: 'bg-orange-50 text-orange-700' },
    { title: 'Blood Donation', icon: '❤️', path: '/blood-donation', color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-blue-50/10">
      {/* Sidebar for Desktop / Header for Mobile */}
      <aside className="w-full md:w-72 bg-white shadow-xl md:shadow-lg z-20 flex-shrink-0 flex flex-col">
        <div className="p-5 md:p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-serif">Lawyer Portal</h2>
            <div className="mt-1"><AnimatedLogo /></div>
          </div>
          {/* Mobile menu indicator or simple badge */}
          <div className="md:hidden bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
            Dashboard
          </div>
        </div>

        {/* Navigation - horizontal scroll on mobile, vertical list on desktop */}
        <nav className="p-3 md:p-4 flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar space-x-2 md:space-x-0 md:space-y-1.5">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const subtitle = getSub(item.title);
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center p-2.5 md:p-3 rounded-xl transition-all duration-200 group flex-shrink-0 md:flex-shrink ${
                  isActive
                    ? `${item.color} shadow-sm font-bold ring-1 ring-inset ring-slate-100`
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <span
                  className={`mr-2.5 md:mr-3 text-xl transition-transform group-hover:scale-110 ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col text-left leading-normal">
                  <span className="text-sm whitespace-nowrap">{item.title}</span>
                  {subtitle && (
                    <span className="text-[10px] font-normal text-slate-400 group-hover:text-slate-500 transition-colors leading-none mt-0.5 whitespace-nowrap">
                      {subtitle}
                    </span>
                  )}
                </div>
                {isActive && <span className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-100 hidden md:block">
          <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              {user?.displayName?.[0] || 'L'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
