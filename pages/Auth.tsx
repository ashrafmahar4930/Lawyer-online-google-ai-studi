import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { auth, googleProvider } from '../services/firebase';
import { setUserRole, getLawyerProfile } from '../services/mockDataService';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect, signInWithPopup, getRedirectResult, sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../App'; // Import useAuth to listen to global auth state
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();

  const { user: authUser, isLoading: authLoading } = useAuth(); // Global auth state

  // Handle redirect result from Google Sign-In
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const savedRole = localStorage.getItem('intended_signup_role');
          if (savedRole) {
            await setUserRole(user.uid, savedRole as UserRole, user.email || '', user.displayName || undefined);
            localStorage.removeItem('intended_signup_role');
          }
          setSuccessMessage('Google Sign-In successful!');
        }
      } catch (err: any) {
        console.error("Redirect Sign-In Error:", err);
        setError(err.message || 'Google Sign-In failed');
      } finally {
        setLoading(false);
      }
    };
    handleRedirectResult();
  }, []);

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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('A password reset link has been sent to your email! Please check your inbox.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email. Please verify the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    
    // VALIDATION: Check if role is selected for Google Sign Up (if not logging in)
    if (!isLogin && !role) {
        alert('Notice: Please select your account type (Lawyer or Client) before proceeding with Google Sign-Up.');
        setError('Please select whether you are a Client or a Lawyer before signing up with Google.');
        return;
    }

    setLoading(true);
    try {
      // Use popup for a seamless, fast experience on direct browsers
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        const user = result.user;
        const savedRole = !isLogin ? role : '';
        if (savedRole) {
          await setUserRole(user.uid, savedRole as UserRole, user.email || '', user.displayName || undefined);
        }
        setSuccessMessage('Google Sign-In successful!');
      }
    } catch (err: any) {
      console.error("Google Popup Sign-In Error:", err);
      // Fallback to redirect if popup is blocked (e.g., inside an iframe or some in-app webviews)
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup')) {
        try {
          if (!isLogin && role) {
              localStorage.setItem('intended_signup_role', role);
          }
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: any) {
          console.error("Fallback Redirect Sign-In Error:", redirectErr);
          setError(redirectErr.message || 'Google Sign-In failed');
          setLoading(false);
        }
      } else {
        setError(err.message || 'Google Sign-In failed');
        setLoading(false);
      }
    }
  };

  if (isResetMode) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleForgotPasswordSubmit}>
            <div>
              <label htmlFor="reset-email" className="sr-only">Email address</label>
              <input
                id="reset-email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {successMessage && <div className="text-green-600 text-sm text-center">{successMessage}</div>}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none z-20"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            {isLogin && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-500 focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with Google</span>
            </div>
          </div>

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

          {/* Note about iframe constraints */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-left space-y-1">
            <span className="font-black uppercase tracking-wider block text-[10px] text-amber-900">⚠️ Iframe Alert for Google Sign-In</span>
            <p>
              If Google sign-in shows a blank screen or fails, it is because <strong>browsers block Google redirects inside standard iframes (security policy)</strong>. 
            </p>
            <p className="font-bold">
              Please open this application in a <u>New Tab</u> (button at top right) to use Google Sign-In, or use the Email form above.
            </p>
          </div>
          
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