
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { setUserRole } from '../services/mockDataService';
import { motion } from 'motion/react';
import { UserCheck, Shield, Scale } from 'lucide-react';
import AnimatedLogo from '../components/AnimatedLogo';

export default function SelectRole() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSelectRole = async (role: 'client' | 'lawyer') => {
    setIsSubmitting(true);
    try {
      await setUserRole(user.uid, role, user.email, user.displayName || undefined);
      await refreshUser();
      if (role === 'lawyer') {
        navigate('/dashboard/lawyer/profile');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Error setting role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">Welcome to <AnimatedLogo /></h1>
          <p className="text-slate-600 text-lg">To provide you with the best experience, please tell us how you plan to use the platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lawyer Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectRole('lawyer')}
            disabled={isSubmitting}
            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all text-left flex flex-col items-center group"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <Scale size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">I am a Lawyer</h2>
            <p className="text-slate-600 text-center mb-6">
              I want to offer legal services, find new clients, and manage my professional practice.
            </p>
            <div className="mt-auto px-6 py-2 bg-slate-100 text-slate-700 rounded-full font-semibold group-hover:bg-slate-800 group-hover:text-white transition-colors">
              Select Lawyer Account
            </div>
          </motion.button>

          {/* Client Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectRole('client')}
            disabled={isSubmitting}
            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all text-left flex flex-col items-center group"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <UserCheck size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">I am a Client</h2>
            <p className="text-slate-600 text-center mb-6">
              I am looking for legal advice, searching for lawyers, or managing my legal cases.
            </p>
            <div className="mt-auto px-6 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
              Select Client Account
            </div>
          </motion.button>
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-4 text-slate-400 text-sm">
          <Shield size={16} />
          <span>Your information is secure and private.</span>
        </div>
      </div>
    </div>
  );
}
