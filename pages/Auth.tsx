import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { auth, googleProvider } from '../services/firebase';
import { setUserRole, getLawyerProfile } from '../services/mockDataService';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useAuth } from '../App'; // Import useAuth to listen to global auth state

interface AuthProps {
  isLogin: boolean;
}

export default function Auth({ isLogin }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // CHANGED: Role is now initially null/empty to force selection
  const [role, setRole] = useState<UserRole | ''>(''); 
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user: authUser, isLoading: authLoading } = useAuth(); // Global auth state

  // Effect to handle navigation after global auth state is updated
  useEffect(() => {
    let active = true;
    if (!authLoading && authUser) {
      const determineRedirectAndNavigate = async () => {
        let redirectTo = '/';
        if (authUser.role === 'admin') {
          redirectTo = '/dashboard/lawyer';
        } else if (authUser.role === 'lawyer') {
          try {
            const profile = await getLawyerProfile(authUser.uid);
            // Profile is considered incomplete if they have no mobile or city set
            if (!profile || !profile.contactMobile || !profile.city) {
              redirectTo = '/dashboard/lawyer/profile';
            } else {
              redirectTo = '/dashboard/lawyer';
            }
          } catch (e) {
            console.error("Error reading lawyer profile: ", e);
            redirectTo = '/dashboard/lawyer/profile'; // fallback to edit profile
          }
        } else if (authUser.role === 'client') {
          redirectTo = '/'; // Send Clients to homepage instead of dashboard
        } else if (authUser.role === 'pending') {
          redirectTo = '/select-role';
        }
        if (active) {
          navigate(redirectTo, { replace: true });
        }
      };

      determineRedirectAndNavigate();
    }
    return () => {
      active = false;
    };
  }, [authUser, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // VALIDATION: Check if role is selected for SignUp
    if (!isLogin && !role) {
        alert('Notice: Please select your account type (Lawyer or Client) before proceeding.');
        setError('Please select whether you are a Client or a Lawyer.');
        return;
    }

    setLoading(true);

    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccessMessage('Logged in successfully!');
            // The useEffect above will handle navigation once authUser is updated.
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update to use requested admin domain
            const userRole = (email === 'admin@jurisconnect.com' || email === 'ashrafmahar4930@gmail.com') ? 'admin' : (role as UserRole);
            await setUserRole(user.uid, userRole, email, '');
            setSuccessMessage('Account created successfully!');
            // The useEffect above will handle navigation once authUser is updated.
        }
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Authentication failed');
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    
    // VALIDATION: Check if role is selected for Google Sign Up (if not logging in)
    // Note: For Google, we can't easily know if it's login or signup beforehand without checking DB.
    // But based on your requirement to force selection, we apply it if the user is on the "Sign Up" tab.
    if (!isLogin && !role) {
        alert('Notice: Please select your account type (Lawyer or Client) before proceeding with Google Sign-Up.');
        setError('Please select whether you are a Client or a Lawyer before signing up with Google.');
        return;
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // If on Signup page, we enforce the selected role for new users.
      // If on Login page, logic in App.tsx handles fetching existing role.
      if (!isLogin && role) {
          await setUserRole(user.uid, role as UserRole, user.email || '', user.displayName || undefined);
      }
      
      setSuccessMessage('Google Sign-In successful!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        
        <div className="mt-8 space-y-6">
          {!isLogin && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <p className="text-center font-bold text-slate-700 mb-4">I want to join as a:</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-2">
                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'lawyer' ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'}`}>
                        <input 
                            type="radio" 
                            name="accountRole" 
                            value="lawyer" 
                            checked={role === 'lawyer'}
                            onChange={() => { setRole('lawyer'); setError(''); }}
                            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-bold text-slate-800">Lawyer</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'client' ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'}`}>
                        <input 
                            type="radio" 
                            name="accountRole" 
                            value="client" 
                            checked={role === 'client'}
                            onChange={() => { setRole('client'); setError(''); }}
                            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-bold text-slate-800">Client / User</span>
                    </label>
                </div>
                {/* Explicit error message if role is missing during signup attempt */}
                {!role && error && error.includes('select') && (
                    <p className="text-center text-red-600 text-sm font-bold mt-3 animate-pulse">{error}</p>
                )}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {error && !error.includes('select') && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
            {successMessage && <div className="text-green-600 text-sm text-center mt-2">{successMessage}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500`}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </div>
          </form>
          
          <div className="text-center text-sm">
             <span className="text-slate-500">
               {isLogin ? "Don't have an account? " : "Already have an account? "}
             </span>
             <button 
               type="button" 
               className="text-blue-600 hover:text-blue-500 font-medium"
               onClick={() => { navigate(isLogin ? '/signup' : '/login'); setError(''); setSuccessMessage(''); }}
             >
               {isLogin ? 'Sign Up' : 'Sign In'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}