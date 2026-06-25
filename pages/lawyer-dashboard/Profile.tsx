
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { LawyerProfile } from '../../types';
import * as db from '../../services/mockDataService';
import { compressImage } from '../../utils/imageUtils';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LawyerProfile | undefined>(undefined);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<Partial<LawyerProfile>>({});
  const [uploading, setUploading] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [countries, setCountries] = useState<import('../../types').Country[]>([]);

  useEffect(() => {
    db.getCountries().then(setCountries);
  }, []);

  const generateAIBio = async () => {
    if (!tempProfile.fullName) {
      alert("Please enter your Full Name first before generating an AI bio.");
      return;
    }
    
    setIsGeneratingBio(true);
    try {
      const response = await fetch('/api/gemini/generate-bio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: tempProfile.fullName,
          title: tempProfile.title || 'Advocate',
          experience: tempProfile.experience || '',
          specialties: tempProfile.specialties || (tempProfile.specialty ? [tempProfile.specialty] : []),
          achievements: tempProfile.achievements || '',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTempProfile(prev => ({
          ...prev,
          aboutMe: data.text || prev.aboutMe
        }));
      } else {
        console.error("Failed to generate bio with AI");
        alert("Failed to generate bio with AI. Please try again.");
      }
    } catch (error) {
      console.error("AI Generation Error", error);
      alert("An error occurred during AI bio generation.");
    } finally {
      setIsGeneratingBio(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const p = await db.getLawyerProfile(user.uid);
    setProfile(p);
    if (p) {
      setTempProfile(p);
    } else {
      setIsEditingProfile(true);
      setTempProfile({ uid: user.uid, contactEmail: user.email } as any);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempProfile.fullName) return;
    
    const savedProfile = {
      ...tempProfile,
      uid: user!.uid,
      verificationStatus: tempProfile.verificationStatus || 'none',
      isVerified: tempProfile.isVerified || false,
      contactEmail: user!.email
    } as LawyerProfile;

    await db.updateLawyerProfile(savedProfile);
    setProfile(savedProfile);
    setIsEditingProfile(false);
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && user) {
          try {
              setUploading(true);
              const originalFile = e.target.files[0];
              
              // Set local preview instantly
              setPreviewUrl(URL.createObjectURL(originalFile));

              const compressedFile = await compressImage(originalFile, 800, 800, 0.7);

              const path = `profile-pictures/${user.uid}/${Date.now()}_${compressedFile.name}`;
              const oldPictureUrl = profile?.picture;
              const url = await db.uploadFile(compressedFile, path, oldPictureUrl);
              
              setTempProfile(prev => ({ ...prev, picture: url }));
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

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
          <div className="bg-blue-950 p-8 text-white flex flex-col md:flex-row items-center gap-6">
            <div className="relative group cursor-pointer w-32 h-32 flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden border-4 border-white/20 shadow-xl">
                    <img 
                         src={previewUrl || tempProfile.picture || profile?.picture || `https://picsum.photos/seed/${user.uid}/200`} 
                         alt="Profile" 
                         className="w-full h-full object-cover"
                    />
                </div>
                <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition cursor-pointer">
                     <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                     <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </label>
                {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"><div className="animate-spin h-8 w-8 border-4 border-white rounded-full border-t-transparent"></div></div>}
            </div>
            <div className="text-center md:text-left flex-grow">
               <h1 className="text-3xl font-bold font-serif">{profile?.fullName || 'My Profile'}</h1>
               {profile?.fullNameLocal && (
                  <p className="text-lg text-blue-200 mt-1 font-medium">{profile.fullNameLocal}</p>
               )}
               <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                 <span className="bg-blue-900/50 text-blue-100 px-3 py-1 rounded-full text-sm border border-blue-800">{profile?.title || 'Advocate'}</span>
                 {profile?.specialties && profile.specialties.length > 0 ? (
                     profile.specialties.map((spec, idx) => (
                         <span key={idx} className="bg-blue-900/50 text-blue-100 px-3 py-1 rounded-full text-sm border border-blue-800">{spec}</span>
                     ))
                 ) : (
                     <span className="bg-blue-900/50 text-blue-100 px-3 py-1 rounded-full text-sm border border-blue-800">{profile?.specialty || 'General Practice'}</span>
                 )}
                 {profile?.isVerified && (
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        Verified Profile
                    </span>
                 )}
               </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Profile Details</h2>
              {!isEditingProfile && (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Section: Basic Identity */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2 mb-4">Basic Identity & Local Language Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name (English)</label>
                          <input required className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" value={tempProfile.fullName || ''} onChange={e => setTempProfile({...tempProfile, fullName: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name (Local Language - Urdu/Hindi/Arabic/etc.)</label>
                          <input className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. اشرف مہر / अशोक कुमार" value={tempProfile.fullNameLocal || ''} onChange={e => setTempProfile({...tempProfile, fullNameLocal: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Specialty (Local Language - Urdu/Hindi/Arabic/etc.)</label>
                          <input className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. فوجداری یا خاندانی قانون / सिविल मुकदमेबाजी" value={tempProfile.specialtyLocal || ''} onChange={e => setTempProfile({...tempProfile, specialtyLocal: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Professional Title</label>
                          <select 
                            className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white" 
                            value={['Advocate', 'Advocate High Court', 'Advocate Supreme Court', 'Senior Advocate', 'Barrister', 'Senior Counsel', 'Legal Advisor', 'Attorney at Law'].includes(tempProfile.title || '') ? tempProfile.title : (tempProfile.title ? 'Other' : '')}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'Other') {
                                setTempProfile({...tempProfile, title: ''});
                              } else {
                                setTempProfile({...tempProfile, title: val});
                              }
                            }}
                          >
                            <option value="">Select Title...</option>
                            <option value="Advocate">Advocate</option>
                            <option value="Advocate High Court">Advocate High Court</option>
                            <option value="Advocate Supreme Court">Advocate Supreme Court</option>
                            <option value="Senior Advocate">Senior Advocate</option>
                            <option value="Barrister">Barrister</option>
                            <option value="Senior Counsel">Senior Counsel</option>
                            <option value="Legal Advisor">Legal Advisor</option>
                            <option value="Attorney at Law">Attorney at Law</option>
                            <option value="Other">Other (Custom Title)</option>
                          </select>
                          
                          {(!['Advocate', 'Advocate High Court', 'Advocate Supreme Court', 'Senior Advocate', 'Barrister', 'Senior Counsel', 'Legal Advisor', 'Attorney at Law', ''].includes(tempProfile.title || '')) && (
                            <div className="mt-2 animate-in fade-in duration-200">
                              <input 
                                placeholder="Enter Custom Title..." 
                                className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                value={tempProfile.title || ''} 
                                onChange={e => setTempProfile({...tempProfile, title: e.target.value})} 
                              />
                            </div>
                          )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Specialties / Areas of Expertise (Select all that apply)</label>
                          <p className="text-xs text-slate-500 mb-3">You can be an expert in multiple fields. Check all that apply to highlight them on your public profile:</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                              {[
                                "Family Law",
                                "Criminal Law",
                                "Corporate Law",
                                "Tax Law",
                                "Civil Litigation",
                                "Immigration",
                                "Real Estate",
                                "Environmental Law",
                                "Intellectual Property"
                              ].map((spec) => {
                                  const isChecked = (tempProfile.specialties || []).includes(spec) || tempProfile.specialty === spec;
                                  return (
                                      <label 
                                          key={spec} 
                                          className={`flex items-center gap-2.5 p-3 rounded-lg border-2 text-sm font-semibold transition cursor-pointer select-none ${
                                              isChecked 
                                                  ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-sm' 
                                                  : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                          }`}
                                      >
                                          <input 
                                              type="checkbox" 
                                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                              checked={isChecked} 
                                              onChange={(e) => {
                                                  const checked = e.target.checked;
                                                  let updatedSpecs = [...(tempProfile.specialties || [])];
                                                  
                                                  if (checked) {
                                                      if (!updatedSpecs.includes(spec)) {
                                                          updatedSpecs.push(spec);
                                                      }
                                                  } else {
                                                      updatedSpecs = updatedSpecs.filter(s => s !== spec);
                                                  }
                                                  
                                                  const primarySpec = updatedSpecs[0] || '';
                                                  
                                                  setTempProfile({
                                                      ...tempProfile,
                                                      specialty: primarySpec,
                                                      specialties: updatedSpecs
                                                  });
                                              }} 
                                          />
                                          {spec}
                                      </label>
                                  );
                              })}
                          </div>
                        </div>
                    </div>
                </div>

                {/* Section: Contact & Location */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2 mb-4">Contact & Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Country</label>
                          <select 
                            className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white" 
                            value={countries.some(c => c.name === tempProfile.country) || !tempProfile.country ? tempProfile.country || '' : 'Other'}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'Other') {
                                setTempProfile({...tempProfile, country: ''});
                              } else {
                                setTempProfile({...tempProfile, country: val});
                              }
                            }}
                          >
                            <option value="">Select Country...</option>
                            {countries.map(c => (
                              <option key={c.code} value={c.name}>{c.name}</option>
                            ))}
                            <option value="Other">Other (Custom Country)</option>
                          </select>
                          
                          {(!countries.some(c => c.name === tempProfile.country) && tempProfile.country !== '' && tempProfile.country !== undefined) && (
                            <div className="mt-2 animate-in fade-in duration-200">
                              <input 
                                placeholder="Enter Custom Country..." 
                                className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                value={tempProfile.country || ''} 
                                onChange={e => setTempProfile({...tempProfile, country: e.target.value})} 
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
                          <input className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" value={tempProfile.city || ''} onChange={e => setTempProfile({...tempProfile, city: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                           <input readOnly className="w-full border-slate-100 bg-slate-200/50 border p-3 rounded-lg text-slate-500 cursor-not-allowed" value={user?.email || ''} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Office Name</label>
                          <input className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" value={tempProfile.officeName || ''} onChange={e => setTempProfile({...tempProfile, officeName: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Office Address</label>
                          <input className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" value={tempProfile.officeAddress || ''} onChange={e => setTempProfile({...tempProfile, officeAddress: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile Number</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.contactMobile || ''} onChange={e => setTempProfile({...tempProfile, contactMobile: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp Number</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.contactWhatsapp || ''} onChange={e => setTempProfile({...tempProfile, contactWhatsapp: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Website / General Link</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.socialMediaLink || ''} onChange={e => setTempProfile({...tempProfile, socialMediaLink: e.target.value})} /></div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2 mb-4">Social Media Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Facebook URL</label><input className="w-full border-slate-200 border p-3 rounded-lg" placeholder="https://facebook.com/..." value={tempProfile.facebookUrl || ''} onChange={e => setTempProfile({...tempProfile, facebookUrl: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">LinkedIn URL</label><input className="w-full border-slate-200 border p-3 rounded-lg" placeholder="https://linkedin.com/in/..." value={tempProfile.linkedinUrl || ''} onChange={e => setTempProfile({...tempProfile, linkedinUrl: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Twitter URL</label><input className="w-full border-slate-200 border p-3 rounded-lg" placeholder="https://twitter.com/..." value={tempProfile.twitterUrl || ''} onChange={e => setTempProfile({...tempProfile, twitterUrl: e.target.value})} /></div>
                    </div>
                </div>

                {/* Section: Professional Bio */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2 mb-4">Professional Bio</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Years of Experience</label>
                           <input className="w-full md:w-1/3 border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. 15 Years" value={tempProfile.experience || ''} onChange={e => setTempProfile({...tempProfile, experience: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase">About Me / Experience</label>
                            <button
                              type="button"
                              onClick={generateAIBio}
                              disabled={isGeneratingBio}
                              className="flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-full transition border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
                            >
                              {isGeneratingBio ? (
                                <>
                                  <div className="animate-spin h-3.5 w-3.5 border-2 border-purple-700 rounded-full border-t-transparent"></div>
                                  Generating SEO Bio...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={14} className="text-purple-600" />
                                  Write & Optimize with AI (SEO)
                                </>
                              )}
                            </button>
                        </div>
                        <textarea rows={5} className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Tell potential clients about your experience..." value={tempProfile.aboutMe || ''} onChange={e => setTempProfile({...tempProfile, aboutMe: e.target.value})} />
                        <p className="text-[11px] text-slate-400 mt-1">Use the AI helper to automatically draft an expert bio highlighting your specialties, experience, and achievements optimized for search engine visibility.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">About Me / Biography (Local Language - Urdu/Hindi/Arabic/etc.)</label>
                        <textarea rows={5} className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="مقامی زبان میں اپنے بارے میں لکھیں..." value={tempProfile.aboutMeLocal || ''} onChange={e => setTempProfile({...tempProfile, aboutMeLocal: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Key Achievements</label>
                        <textarea rows={2} className="w-full border-slate-200 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="List your major case wins or awards..." value={tempProfile.achievements || ''} onChange={e => setTempProfile({...tempProfile, achievements: e.target.value})} />
                    </div>
                </div>

                {/* Section: Verification Information */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6 opacity-80 hover:opacity-100 transition-opacity">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2 mb-4">Verification Details</h3>
                    <p className="text-[10px] text-slate-500 -mt-2 mb-4 italic">These fields are used for professional verification and are visible on your public profile.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">License Number</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.licenseNumber || ''} onChange={e => setTempProfile({...tempProfile, licenseNumber: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Degree Name</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.degreeName || ''} onChange={e => setTempProfile({...tempProfile, degreeName: e.target.value})} /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Issuing Authority</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.issuingAuthority || ''} onChange={e => setTempProfile({...tempProfile, issuingAuthority: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enrollment Number</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.enrollmentOrRollNumber || ''} onChange={e => setTempProfile({...tempProfile, enrollmentOrRollNumber: e.target.value})} /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bar Council Name</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.barCouncilName || ''} onChange={e => setTempProfile({...tempProfile, barCouncilName: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Graduation Year</label><input className="w-full border-slate-200 border p-3 rounded-lg" value={tempProfile.yearOfGraduation || ''} onChange={e => setTempProfile({...tempProfile, yearOfGraduation: e.target.value})} /></div>
                    </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t border-slate-100">
                   <button type="submit" className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95">Save Profile</button>
                   <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-slate-100 text-slate-700 px-10 py-3 rounded-xl font-bold hover:bg-slate-200 transition">Discard Changes</button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Information</span>
                            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                               <div className="flex items-center text-slate-700">
                                  <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                  {profile?.contactMobile || 'Not set'}
                               </div>
                               <div className="flex items-center text-slate-700">
                                  <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.069-.543c.965.527 1.91.801 3.21.801 3.12 0 5.658-2.52 5.658-5.632.001-3.111-2.531-5.675-5.649-5.695zm3.323 8.016c-.146.415-.83 1.012-1.127 1.077-.311.066-.662.052-1.378-.222-1.031-.383-1.89-1.299-2.345-1.921-.046-.062-.383-.509-.383-1.002 0-.492.257-.734.348-.838.09-.1.219-.13.311-.13h.111c.094 0 .222-.036.341.246.126.301.428 1.043.468 1.121.039.079.066.172.014.275-.053.104-.213.236-.312.339-.098.103-.205.216-.089.418a3.52 3.52 0 001.328 1.033c.319.141.564.218.847.218.283 0 .524-.044.739-.214.215-.169.248-.443.327-.557.079-.115.228-.093.38-.036.152.057.962.453 1.126.536.164.083.274.125.319.2.046.074.046.43-.1.844z"/></svg>
                                  {profile?.contactWhatsapp || 'Not set'}
                               </div>
                               <div className="flex items-center text-slate-700 truncate">
                                  <svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 012 2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 012 2z" /></svg>
                                  {user.email}
                               </div>
                            </div>
                         </div>
                         <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Office Location</span>
                            <div className="bg-slate-50 p-4 rounded-xl">
                               <p className="font-bold text-slate-800">{profile?.officeName || 'Independent Practice'}</p>
                               <p className="text-slate-600 text-sm mt-1">{profile?.officeAddress || 'No office address provided'}</p>
                               <p className="text-blue-600 text-sm font-semibold mt-2">{profile?.city}, {profile?.country}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About Me (English)</span>
                            <div className="bg-slate-50 p-4 rounded-xl min-h-[80px]">
                               <p className="text-slate-700 leading-relaxed italic">{profile?.aboutMe || 'No description provided yet. Click edit to add your professional bio.'}</p>
                            </div>
                        </div>
                        {profile?.aboutMeLocal && (
                          <div>
                              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About Me (Local Language)</span>
                              <div className="bg-slate-50 p-4 rounded-xl min-h-[80px]">
                                 <p className="text-slate-700 leading-relaxed italic">{profile.aboutMeLocal}</p>
                              </div>
                          </div>
                        )}
                        <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Licensing</span>
                            <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                               <div>
                                  <p className="text-slate-500 text-xs">License Number</p>
                                  <p className="font-mono font-bold text-slate-800">{profile?.licenseNumber || 'Not verified'}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-slate-500 text-xs">Status</p>
                                  <p className={`font-bold ${profile?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {profile?.isVerified ? 'Active & Verified' : 'Unverified'}
                                  </p>
                               </div>
                            </div>
                        </div>
                      </div>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
