import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import NotificationCenter from './NotificationCenter';
import AnimatedLogo from './AnimatedLogo';
import * as db from '../services/mockDataService';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');

  const fetchBranding = async () => {
    // Quick load from local storage first for speed
    const localLogo = localStorage.getItem('customBrandLogo');
    if (localLogo) setLogoUrl(localLogo);

    // Sync with DB
    const branding = await db.getSystemBranding();
    if (branding && branding.logoUrl) {
      setLogoUrl(branding.logoUrl);
      localStorage.setItem('customBrandLogo', branding.logoUrl);
    }
  };

  useEffect(() => {
    fetchBranding();

    const handleUpdate = () => fetchBranding();
    window.addEventListener('brand_logo_updated', handleUpdate);
    return () => window.removeEventListener('brand_logo_updated', handleUpdate);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin' || user.role === 'lawyer') return '/dashboard/lawyer';
    if (user.role === 'pending') return '/select-role';
    return '/dashboard/client';
  };

  const getInitials = (name?: string) => {
      if (!name) return 'U';
      return name.charAt(0).toUpperCase();
  }

  return (
    // Updated: Navy Blue Background, Height h-12 (48px)
    <nav className="bg-blue-950 shadow-md sticky top-0 z-50 font-sans h-12 flex items-center">
      <div className="container mx-auto px-4 w-full">
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="flex items-center space-x-2 group">
            {/* Logo Image */}
            <div className="group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <img 
                 src={logoUrl} 
                 alt="LawyerOnline Logo" 
                 className="w-12 h-12 object-contain"
              />
            </div>

            {/* Highly dynamic rotating domain brand badge in header */}
            <div className="flex flex-col">
              <AnimatedLogo />
              <div className="flex items-center gap-1 -mt-0.5 ml-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[7px] text-blue-400 font-black uppercase tracking-[0.1em]">System Active</span>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <Link to="/" className="text-blue-200 hover:text-white font-medium transition">Home</Link>
            <Link to="/find-lawyers" className="text-blue-200 hover:text-white font-medium transition">Find Lawyers</Link>
            <Link to="/qa" className="text-blue-200 hover:text-white font-medium transition">Ask Legal Q&A</Link>
            <Link to="/jobs" className="text-blue-200 hover:text-white font-medium transition">Jobs</Link>
            <Link to="/blood-donation" className="flex items-center gap-1.5 text-red-200 hover:text-white font-black uppercase tracking-widest text-[10px] transition">
               <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               Donate Blood
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                {user.role === 'admin' && (
                  <Link 
                    to="/dashboard/admin"
                    className="text-red-400 font-semibold border border-red-900 bg-red-950/50 px-2 py-1 rounded hover:bg-red-900 transition text-xs"
                  >
                    Admin Panel
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold overflow-hidden text-xs">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                getInitials(user.displayName)
                            )}
                        </div>
                    </button>

                    {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-slate-100 animate-in fade-in zoom-in duration-200">
                             <div className="px-4 py-2 border-b border-slate-50">
                                <p className="text-sm font-semibold text-slate-800 truncate">{user.displayName || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate">{user.role}</p>
                             </div>
                             <Link 
                                to={getDashboardLink()} 
                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                onClick={() => setIsProfileDropdownOpen(false)}
                            >
                                Dashboard
                            </Link>
                             <button 
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-3 py-1.5 text-blue-200 font-medium hover:text-white transition">
                  Login
                </Link>
                <Link to="/signup" className="px-3 py-1.5 bg-white text-blue-950 rounded hover:bg-blue-100 transition shadow-sm font-semibold">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button + Notification */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationCenter />}
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-900 border-t border-blue-800 absolute top-12 left-0 w-full shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-blue-100 hover:bg-blue-800 rounded">Home</Link>
            <Link to="/find-lawyers" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-blue-100 hover:bg-blue-800 rounded">Find Lawyers</Link>
            <Link to="/qa" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-blue-100 hover:bg-blue-800 rounded">Ask Legal Q&A</Link>
            <Link to="/jobs" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-blue-100 hover:bg-blue-800 rounded">Careers & Jobs</Link>
            <Link to="/blood-donation" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-red-300 font-bold hover:bg-blue-800 rounded flex items-center gap-2">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               Donate Blood
            </Link>
            {user ? (
              <>
                 {user.role === 'admin' && (
                    <Link to="/dashboard/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-red-300 font-medium hover:bg-red-900/50 rounded">Admin Panel</Link>
                 )}
                 <div className="border-t border-blue-800 my-2 pt-2">
                     <div className="px-3 flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-2 text-xs">
                            {getInitials(user.displayName)}
                        </div>
                        <span className="font-semibold text-white">{user.displayName}</span>
                     </div>
                     <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-blue-300 font-medium hover:bg-blue-800 rounded">Go to Dashboard</Link>
                     <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-300 hover:bg-blue-800 rounded">Logout</button>
                 </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center px-3 py-2 text-white border border-blue-700 rounded hover:bg-blue-800">Login</Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="block text-center px-3 py-2 bg-white text-blue-950 rounded hover:bg-blue-100 font-bold">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}