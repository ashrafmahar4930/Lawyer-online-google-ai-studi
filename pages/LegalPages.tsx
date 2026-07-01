import React, { useEffect, useState } from 'react';
import { CheckCircle2, PenTool } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

// Fix: Make children optional in type definition to prevent TS error about missing children prop
const LegalLayout = ({ title, children }: { title: string, children?: React.ReactNode }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 font-serif border-b pb-4">{title}</h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy = () => {
  const [activeTab, setActiveTab] = React.useState<'general' | 'lawyers' | 'clients' | 'donors'>('general');

  return (
    <LegalLayout title="Privacy Policy">
      <p className="mb-6">Last Updated: {new Date().toLocaleDateString('en-GB')}</p>
      
      <p className="mb-8">
        Welcome to <BrandLogo />. This policy explains what information we collect, how we use it, and how we protect it. 
        Because our platform serves different types of users, we have separated our privacy guidelines to ensure absolute clarity.
      </p>

      <div className="flex flex-wrap border-b border-slate-200 mb-6 gap-2">
        {(['general', 'lawyers', 'clients', 'donors'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold capitalize rounded-t-lg transition-colors ${
              activeTab === tab 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab === 'general' ? 'General Policy' : `For ${tab}`}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">General Privacy Guidelines</h3>
            
            <div>
              <h4 className="text-xl font-bold mb-2">1. Data Security & Encryption</h4>
              <p>We use industry-standard encryption protocols to protect all data transmitted between your device and our servers. We do not sell your personal data to any third-party marketing companies.</p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">2. Cookies & Local Storage</h4>
              <p>We use cookies and local storage to keep you logged in across sessions and to remember your preferences. We may also use standard analytics tools to monitor website performance and improve user experience.</p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">3. Legal Compliance</h4>
              <p>We may disclose your information if required to do so by law, or in response to a valid request from law enforcement or government authorities (e.g., cybercrime investigations related to fraud).</p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-2">4. Contact Us</h4>
              <p>If you have any questions about this privacy policy, or wish to request data deletion, please contact us at adittamahar@gmail.com.</p>
            </div>
          </div>
        )}

        {activeTab === 'lawyers' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">Privacy Policy for Lawyers (Advocates)</h3>
            
            <div>
              <h4 className="text-xl font-bold mb-2">1. Private Data (Strictly Confidential)</h4>
              <p>To ensure our platform remains secure and fraud-free, we require specific verification data. We collect your National Identity Card (CNIC) or Passport number, state/national Bar Council License Number, Court Enrollment Year, University Roll Number, personal email, and private mobile numbers.</p>
              <p className="mt-2 text-blue-700 font-semibold bg-blue-50 p-3 rounded-lg border border-blue-100">
                This private information is never sold or displayed publicly. It is used strictly by our administrative team to verify your identity on online Bar Council and University portals.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">2. Public Data (Displayed to Users)</h4>
              <p>To help you acquire clients, we display your Name, Chamber Address, Practicing City/Court, Profile Picture, Specialties, and generic contact methods upon your approval.</p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">3. Verification & Auto-Deletion Protocol</h4>
              <p>Once your profile is successfully verified by our administration, highly sensitive verification documents (like ID numbers and exact roll numbers) are flagged and securely managed. We only retain the "Verified Status" to protect you from data breaches.</p>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">Privacy Policy for Clients (Citizens)</h3>
            
            <div>
              <h4 className="text-xl font-bold mb-2">1. Information We Collect</h4>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Account Details:</strong> Name, Email, and Phone number to facilitate your booking and communication with lawyers.</li>
                <li><strong>Case Information:</strong> Information you voluntarily share in the Q&A section or in direct messages with lawyers.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">2. Q&A Forum Anonymity</h4>
              <p>When you post a question in the public Q&A forum, please do not share highly sensitive ID, financial, or specific case details. If you wish to remain anonymous, you can use a generic display name in your profile settings.</p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">3. Absolute Attorney-Client Privilege</h4>
              <p>To preserve absolute confidentiality, LawyerOnline <strong>does not record, monitor, or store</strong> any audio or video data from private consultation meetings hosted through our platform. All discussions are strictly between you and the advocate.</p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">4. Right to Deletion</h4>
              <p>You have the absolute right to delete your account and profile data at any time from your Dashboard Settings. This action permanently removes your personal data from our active servers.</p>
            </div>
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">Privacy Policy for Blood Donors</h3>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-900">
              <strong>Your Privacy is our Priority:</strong> We do NOT publicly display your WhatsApp number, and we do NOT share it with patients or anyone else on the platform.
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">1. Minimal Data Collection</h4>
              <p>When you register as a blood donor, we collect only the absolute minimum information required: <strong>Your Name, WhatsApp Number, Country, City, and Blood Group</strong>. We do NOT require an email address, and we do NOT create a complex user account for you.</p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">2. How the Donation Flow Works</h4>
              <ul className="list-disc ml-6 space-y-2">
                <li>When someone in need creates an appeal for blood, the appeal is routed to our administrative team.</li>
                <li>Our administration filters the database to find donors matching the required blood group and city.</li>
                <li>Our administration then sends a pre-formatted WhatsApp message containing the patient's appeal to your WhatsApp number using an automated link.</li>
                <li><strong>Your Choice:</strong> You have the complete freedom to review the appeal and decide whether you want to contact the patient. If you choose to help, you contact them directly. If not, you simply ignore the message.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">3. Current Limitations on Donor Deletion & Verification</h4>
              <p>Because we do not require donors to create standard login accounts with passwords (to keep the process fast and frictionless), there is currently no automated way for a donor to log in and delete their own record.</p>
              <p className="mt-2"><strong>How to remove yourself:</strong> If you wish to be removed from the blood donor registry, you can simply reply to any WhatsApp message you receive from our admin, or contact us directly, and we will manually delete your record immediately.</p>
            </div>
          </div>
        )}
      </div>
    </LegalLayout>
  );
};

export const TermsOfService = () => {
  const [activeTab, setActiveTab] = React.useState<'general' | 'lawyers' | 'clients'>('general');
  const [isSigned, setIsSigned] = React.useState(false);
  const [signatureName, setSignatureName] = React.useState('');
  const [signatureDate, setSignatureDate] = React.useState<Date | null>(null);

  const handleSign = () => {
    if (signatureName.trim().length < 3) {
      alert("Please enter your full legal name to sign.");
      return;
    }
    setIsSigned(true);
    setSignatureDate(new Date());
  };

  return (
    <LegalLayout title="Terms of Service & Conditions">
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-GB')}</p>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
        <p className="text-amber-900 font-bold mb-1">Difference Between Privacy Policy & Terms of Service:</p>
        <p className="text-amber-800 text-sm">
          Our <strong>Privacy Policy</strong> explains <em>what personal data we collect</em> and <em>how we protect it</em>. 
          Our <strong>Terms of Service</strong> act as a legal contract explaining the <em>rules, liabilities, and obligations</em> you must follow when using our platform. By registering or using our services, you digitally agree to these terms.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-800 font-bold mb-1">IMPORTANT LEGAL DISCLAIMER:</p>
        <p className="text-red-700 text-sm">LawyerOnline.live is strictly a technology platform and directory. We are NOT a law firm, we DO NOT provide legal advice, and we DO NOT guarantee the outcome of any legal case. By using this platform, you agree to hold the founders and management completely harmless from any legal or financial liability.</p>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 mb-6 gap-2">
        {(['general', 'lawyers', 'clients'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold capitalize rounded-t-lg transition-colors ${
              activeTab === tab 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab === 'general' ? 'General Terms' : `Terms for ${tab}`}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">1. Minimum Age Requirement</h3>
              <p>You must be at least 18 years old to create an account, seek legal counsel, or interact with advocates on this platform. By using LawyerOnline.live, you represent and warrant that you are of legal age to form a binding contract.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">2. Nature of the Platform</h3>
              <p><BrandLogo /> acts solely as a bridge connecting the public with independent legal professionals globally. We do not participate in your legal representation. Any agreement, payment, or legal strategy discussed between you and the lawyer is entirely between you and the independent lawyer.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">3. Limitation of Liability and Non-Responsibility</h3>
              <p>Under no circumstances, including negligence, shall the founders, owners, or administrators of <BrandLogo /> be liable for any direct, indirect, incidental, or consequential damages. This includes, but is not limited to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Loss of a court case or legal battle.</li>
                <li>Financial losses, fines, or penalties imposed by any court or authority.</li>
                <li>Poor or incorrect legal advice provided by any lawyer found on this platform.</li>
                <li>Payment disputes, fee refunds, or unrendered services by the lawyer.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">4. Digital Signatures and Acceptance</h3>
              <p>When you register an account, submit a blood donation form, or book a consultation, you are digitally accepting these Terms of Service. This electronic acceptance carries the same legal weight as a physical signature.</p>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">1. Client Obligations & Conduct</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Respectful Communication:</strong> You must communicate respectfully with advocates. Abusive language will result in an immediate permanent ban.</li>
                <li><strong>Direct Payments:</strong> You pay the lawyer directly for their services. LawyerOnline does not hold escrow or facilitate lawyer-client fee transfers. We are not responsible for refunds.</li>
                <li><strong>Q&A Forum Rules:</strong> Do not post personal, sensitive, or identifiable information (like ID numbers, exact addresses, or banking details) in the public Q&A sections. Ask generic legal questions.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">2. Verification is Not a Guarantee</h3>
              <p>While we make reasonable efforts to verify checking the National ID and Bar Council License numbers, we cannot 100% guarantee the absolute continuous standing of any lawyer. Licenses can be suspended by Bar Councils at any time. It is your ultimate responsibility to perform your own due diligence before hiring and paying any legal professional.</p>
            </div>
          </div>
        )}

        {activeTab === 'lawyers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">1. Absolute Truthfulness & Representation</h3>
              <p>You agree to provide 100% accurate information regarding your Bar Council registration, degrees, and identity. Submitting fake licenses, expired IDs, or misrepresenting your court level is a strict violation of these terms and will result in a permanent ban.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">2. Profile Updates Trigger Re-Verification</h3>
              <p>For security reasons, if you edit critical fields in your profile (such as your Name, Bar Council Number, or Practice City), your profile will automatically revert to "Unverified" status until our administration reviews and approves the new details.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">3. Professional Conduct</h3>
              <p>You must maintain the highest standards of professional ethics as prescribed by your local or national Bar Council. We reserve the right to suspend any advocate reported for fraud, fee extortion, or severe professional misconduct.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">4. Q&A and Direct Messaging Policy</h3>
              <p>The public Q&A platform is for educational and general guidance only. Answers provided by you do NOT constitute a formal Attorney-Client relationship. You must clearly state this limitation when answering public queries.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-xl font-bold mb-4">Digital Signature & Acceptance</h3>
        {isSigned ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-900 font-bold text-lg">Terms Digitally Signed</p>
              <p className="text-green-800 text-sm mt-1">
                You have successfully accepted and digitally signed the Terms of Service. This action has been securely recorded.
              </p>
              <p className="text-green-700 text-xs mt-3 font-mono bg-green-100/50 px-3 py-1.5 inline-block rounded-md border border-green-200/50">
                Signed by: <strong>{signatureName}</strong> <br/>
                Date: {signatureDate?.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              By typing your full legal name below and clicking the "Digitally Sign & Accept" button, you acknowledge that you have read, understood, and agree to be bound by the Terms of Service, Privacy Policy, and all other platform guidelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Type your full legal name..." 
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-slate-800 placeholder-slate-400"
              />
              <button 
                onClick={handleSign}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
              >
                <PenTool className="w-5 h-5" />
                Digitally Sign & Accept
              </button>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              * This electronic signature carries the exact same legal weight as a physical handwritten signature under national and international electronic transactions laws.
            </p>
          </div>
        )}
      </div>
    </LegalLayout>
  );
};

export const Disclaimer = () => {
  return (
    <LegalLayout title="Disclaimer">
      <p className="mb-4">Last Updated: {new Date().getFullYear()}</p>

      <h3 className="text-xl font-bold mt-6 mb-3">1. No Legal Advice</h3>
      <p>The information provided on <BrandLogo /> is for general informational purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information on the Site.</p>
      <p className="mt-2"><strong>Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.</strong></p>

      <h3 className="text-xl font-bold mt-6 mb-3">2. No Attorney-Client Relationship</h3>
      <p>Use of <BrandLogo /> does not create an attorney-client relationship between you and <BrandLogo />, or between you and any lawyer listed on the site, until you have explicitly entered into a representation agreement with that lawyer. Information exchanged via this platform may not be privileged.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">3. External Links Disclaimer</h3>
      <p>The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness by us.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">4. Professional Disclaimer</h3>
      <p>The Site cannot and does not contain legal advice. The legal information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals.</p>
    </LegalLayout>
  );
};

export const ContactUs = () => {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <LegalLayout title="Contact Us">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Contact Info Col */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold mb-4 font-serif text-slate-800">Get in Touch with <BrandLogo /></h3>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Have questions about finding a lawyer, verifying your profile, or utilizing our lawyer fee ledger wallets? Fill out the contact form or reach us directly.
          </p>
          
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </span>
              <div>
                <p className="font-semibold text-slate-900">Email Address</p>
                <p className="text-slate-600">support@lawyeronline.live</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              </span>
              <div>
                <p className="font-semibold text-slate-900">Phone & WhatsApp Help</p>
                <p className="text-slate-600">+1 555 0199 000</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </span>
              <div>
                <p className="font-semibold text-slate-900">Central Office</p>
                <p className="text-slate-600">Corporate Enclave, Global Center, New York</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Col */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h4 className="text-lg font-bold mb-1">Message Sent Successfully!</h4>
              <p className="text-xs text-emerald-700">Thank you for writing to us. Our support team will get back to you within 2-4 hours to assist you.</p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-650 text-white rounded-lg text-xs font-bold hover:bg-emerald-750 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Adv. Muhammad Ali"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="name@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Message</label>
                <textarea 
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="How can we help you today with standard legal operations?"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white text-sm font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition duration-300"
              >
                Send Secure Message
              </button>
            </form>
          )}
        </div>
      </div>
    </LegalLayout>
  );
};

export const SubmitComplaint = () => {
  const [complaintSubmitted, setComplaintSubmitted] = React.useState(false);
  const [complainDetail, setComplainDetail] = React.useState({ caseId: '', type: 'financial', text: '' });

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintSubmitted(true);
  };

  return (
    <LegalLayout title="Submit Complaint & Grievance">
      <p className="mb-4 text-slate-600">
        At <BrandLogo />, we maintain strict code-of-conduct standards. If a registered advocate or client breaches financial escrow trust, exhibits unprofessional behavior, or provides counterfeit credentials, file a high-priority complain below.
      </p>

      <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        {complaintSubmitted ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h4 className="text-lg font-bold mb-1">Grievance Ticket Generated!</h4>
            <p className="text-xs text-red-700 font-semibold">Complaint logged reference: #TKT-{Math.floor(100000 + Math.random() * 900000)}. Our legal audit and verification desk will assess with bar databases immediately.</p>
            <button 
              onClick={() => setComplaintSubmitted(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-705 transition"
            >
              Submit Ticket Page
            </button>
          </div>
        ) : (
          <form onSubmit={handleComplaintSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Related Case ID / Wallet ID (Optional)</label>
              <input 
                type="text" 
                value={complainDetail.caseId}
                onChange={(e) => setComplainDetail({...complainDetail, caseId: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="e.g. CASE-48291"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Grievance Category</label>
              <select 
                value={complainDetail.type}
                onChange={(e) => setComplainDetail({...complainDetail, type: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-1.5 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium"
              >
                <option value="financial">Financial Escrow or Wallet Ledger Dispute</option>
                <option value="fake_doc">Counterfeit Or Fake Advocate License Verification</option>
                <option value="delay">Extreme Delay / No Response on Court Dates</option>
                <option value="harassment">Misbehavior / Unethical Code of Counsel</option>
                <option value="other">Other System Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Detailed Grievance & Proof References</label>
              <textarea 
                rows={5}
                required
                value={complainDetail.text}
                onChange={(e) => setComplainDetail({...complainDetail, text: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Please provide complete timestamps, chat logs, or fake license claims."
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-[11px] flex items-start gap-2.5">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p className="leading-relaxed font-semibold">
                Attention: Filing fake profile complaints in bad faith is a system violation and may terminate user authority instantly.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-750 text-white font-black uppercase text-sm py-3.5 rounded-xl shadow-lg shadow-red-100 transition-all duration-250"
            >
              Submit High-Priority Ticket
            </button>
          </form>
        )}
      </div>
    </LegalLayout>
  );
};

export const HowWeWork = () => {
  return (
    <LegalLayout title="How We Work">
      <div className="space-y-8 mt-4">
        <p className="text-slate-600 leading-relaxed text-base">
          <BrandLogo /> is a modern legal platform linking citizens directly with professional legal support, transparent digital Ledger registries, and verified advocates without broker commissions.
        </p>

        {/* Bento Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-400 transition">
            <span className="text-3xl font-extrabold text-blue-500">01</span>
            <h4 className="text-lg font-bold text-slate-900 mt-2">Filter and Find</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Find court advocates filtered by Country, City, and Legal Specialty. Evaluate verified license IDs and client-submitted rating stars securely.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-400 transition">
            <span className="text-3xl font-extrabold text-blue-500">02</span>
            <h4 className="text-lg font-bold text-slate-900 mt-2">Legal Q&A Forums</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Post public legal queries in dedicated Legal Groups (LG-Specialties). Registered advocates answer queries, demonstrating expertise directly.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-400 transition">
            <span className="text-3xl font-extrabold text-blue-500">03</span>
            <h4 className="text-lg font-bold text-slate-900 mt-2">Transparent Ledgers</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Track case wallets, deposits, and pending bar invoices seamlessly. Eliminates fee misunderstandings between client and advocate.
            </p>
          </div>
        </div>

        {/* Verification and standards */}
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mt-8">
          <h3 className="text-xl font-bold font-serif text-blue-900 mb-2">Our Absolute Quality Standard</h3>
          <p className="text-xs text-blue-950 mb-4 leading-relaxed">
            Every advocate on <BrandLogo /> submits government-issued Bar Council ID proof. Our audit administrators carefully verify registration indexes to construct a reputable shield against courtroom fraud.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-blue-800">
            <span className="bg-blue-100/80 px-3 py-1.5 rounded-full border border-blue-200">✓ Biometric Bar ID Validation</span>
            <span className="bg-blue-100/80 px-3 py-1.5 rounded-full border border-blue-200">✓ Commission-Free Transactions</span>
            <span className="bg-blue-100/80 px-3 py-1.5 rounded-full border border-blue-200">✓ 24-Hr Crisis Blood Lifeline</span>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};