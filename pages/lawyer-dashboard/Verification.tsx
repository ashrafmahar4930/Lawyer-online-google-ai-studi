
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { LawyerProfile, VerificationRequest } from '../../types';
import * as db from '../../services/mockDataService';
import { useNavigate } from 'react-router-dom';

export default function Verification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LawyerProfile | undefined>(undefined);
  const [tempProfile, setTempProfile] = useState<Partial<LawyerProfile>>({});

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const p = await db.getLawyerProfile(user.uid);
    setProfile(p);
    if (p) setTempProfile(p);
  };

  const handleVerificationRequest = async () => {
      if (!profile || !user) return;

      if (!tempProfile.degreeName || !tempProfile.issuingAuthority || !tempProfile.licenseNumber ||
          !tempProfile.enrollmentOrRollNumber || !tempProfile.yearOfGraduation || !tempProfile.barCouncilName) {
          alert("Please fill in all required verification details.");
          return;
      }
      
      const req: VerificationRequest = {
          id: `req_${user.uid}_${Date.now()}`,
          lawyerId: user.uid,
          lawyerName: profile.fullName,
          lawyerEmail: user.email,
          submittedAt: new Date().toISOString(),
          status: 'pending',
          degreeName: tempProfile.degreeName!,
          issuingAuthority: tempProfile.issuingAuthority!,
          licenseNumber: tempProfile.licenseNumber!,
          enrollmentOrRollNumber: tempProfile.enrollmentOrRollNumber!,
          yearOfGraduation: tempProfile.yearOfGraduation!,
          barCouncilName: tempProfile.barCouncilName!,
      };
      await db.submitVerification(req);
      const updatedProfile = { ...profile, verificationStatus: 'pending' as const };
      await db.updateLawyerProfile(updatedProfile);
      setProfile(updatedProfile);
      alert("Verification application submitted successfully!");
  };

  if (!user) return null;

  const isSubmitDisabled = 
      !tempProfile.degreeName || 
      !tempProfile.issuingAuthority || 
      !tempProfile.licenseNumber ||
      !tempProfile.enrollmentOrRollNumber || 
      !tempProfile.yearOfGraduation || 
      !tempProfile.barCouncilName ||
      profile?.verificationStatus === 'pending';

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-800 font-serif mb-8">Professional Verification</h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
           {profile?.verificationStatus === 'approved' ? (
                <div className="p-12 text-center">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">You are Verified!</h2>
                    <p className="text-slate-600 max-w-md mx-auto leading-relaxed">Congratulations. Your legal credentials have been verified by our team. You now have the verified badge on your public profile.</p>
                </div>
           ) : profile?.verificationStatus === 'pending' ? (
                <div className="p-12 text-center">
                    <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Review in Progress</h2>
                    <p className="text-slate-600 max-w-md mx-auto leading-relaxed">Our admin team is currently reviewing your professional credentials. This usually takes 24-48 business hours.</p>
                </div>
           ) : (
                <>
                    <div className="bg-blue-950 p-8 text-white">
                        <h2 className="text-2xl font-bold mb-2">Apply for Verification</h2>
                        <p className="text-blue-200 text-sm opacity-80 leading-relaxed">Build trust with potential clients by verifying your legal license. Verified lawyers appear higher in search results and receive more inquiries.</p>
                    </div>
                    <div className="p-8">
                        {profile?.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-8 flex gap-4">
                                <div className="bg-red-500 p-1.5 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-800">Application Rejected</h4>
                                    <p className="text-sm text-red-600">{profile.rejectionReason}</p>
                                </div>
                            </div>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); handleVerificationRequest(); }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Law Degree Name</label>
                                    <input required className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={tempProfile.degreeName || ''} onChange={e => setTempProfile({...tempProfile, degreeName: e.target.value})} placeholder="e.g., LLB, JD" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Issuing Authority</label>
                                    <input required className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={tempProfile.issuingAuthority || ''} onChange={e => setTempProfile({...tempProfile, issuingAuthority: e.target.value})} placeholder="University Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">License Number</label>
                                    <input required className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={tempProfile.licenseNumber || ''} onChange={e => setTempProfile({...tempProfile, licenseNumber: e.target.value})} placeholder="BC-12345" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enrollment/Roll Number</label>
                                    <input required className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={tempProfile.enrollmentOrRollNumber || ''} onChange={e => setTempProfile({...tempProfile, enrollmentOrRollNumber: e.target.value})} placeholder="University ID" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Graduation Year</label>
                                    <input required type="number" className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={tempProfile.yearOfGraduation || ''} onChange={e => setTempProfile({...tempProfile, yearOfGraduation: e.target.value})} placeholder="2015" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bar Council Name</label>
                                    <input required className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={tempProfile.barCouncilName || ''} onChange={e => setTempProfile({...tempProfile, barCouncilName: e.target.value})} placeholder="e.g. Punjab Bar Council" />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 transition active:scale-[0.98] mt-4 shadow-xl"
                            >
                                {profile?.verificationStatus === 'pending' ? 'Application Pending' : 'Submit Review Application'}
                            </button>
                        </form>
                    </div>
                </>
           )}
        </div>
      </div>
    );
}
