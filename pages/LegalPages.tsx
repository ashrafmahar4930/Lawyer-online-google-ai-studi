import React, { useEffect } from 'react';
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
  return (
    <LegalLayout title="Privacy Policy">
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-GB')}</p>
      
      <h3 className="text-xl font-bold mt-6 mb-3">1. Introduction</h3>
      <p>Welcome to <BrandLogo />. Because our platform connects citizens with legal professionals (Advocates) globally, we take your privacy and data security very seriously. This policy explains the difference between the public information we show and the private information we securely hold.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">2. Information We Collect from Lawyers (Advocates)</h3>
      <p>To ensure our platform remains secure and fraud-free, we require specific verification data from lawyers. This data is split into two categories:</p>
      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li><strong>Private Data (Kept Secure & Hidden):</strong> We collect your National Identity Card or Passport number, state/national Bar Council License Number, Court Enrollment Year, University Roll Number (for degree validation), personal email, and private mobile numbers. <strong>This information is never sold or displayed publicly.</strong> It is used strictly by our team to verify your identity on online Bar Council and University portals.</li>
        <li><strong>Public Data (Displayed to Users):</strong> To help you get clients, we display your Name, Chamber Address, Practicing City/Court, Profile Picture, Specialties, and generic contact methods upon your approval.</li>
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-3">3. Information We Collect from Users/Clients</h3>
      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li><strong>Account Details:</strong> Name, Email, and Phone number to facilitate your booking and communication with lawyers.</li>
        <li><strong>Case Information:</strong> Information you share in the Q&A section or direct messages. (Note: Please do not share highly sensitive ID or financial details publicly in the Q&A forum).</li>
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-3">4. Blood Donation Directory</h3>
      <p>If you optionally choose to register as a Blood Donor, your Name, Blood Group, City, and Phone Number will be displayed publicly in the Emergency Blood Donation portal to help those in medical emergencies. You can remove yourself from this directory at any time from your dashboard.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">5. How We Use and Protect Your Data</h3>
      <p>We use your personal data strictly to connect you with legal professionals, verify the authenticity of users, facilitate emergency blood donations, and maintain our platform's security. We use industry-standard encryption. We do not sell your data to any third-party marketing companies.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">6. Verification Workflow & Data Auto-Deletion</h3>
      <p>We actively utilize publicly available government and university verification portals (such as the Bar Council directories) to cross-check the ID and License Numbers provided by lawyers. <strong>Important Security Protocol:</strong> Once a lawyer's profile is successfully verified and approved by our administration, highly sensitive verification documents (like ID numbers and exact roll numbers) are automatically flagged for deletion from our active database. We only retain the "Verified Status" flag to protect our advocates from data breaches.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">7. Video/Audio Meetings and Attorney-Client Privilege</h3>
      <p>To preserve absolute Attorney-Client privilege and confidentiality, LawyerOnline <strong>does not record, monitor, or store</strong> any audio or video data from private consultation meetings hosted through our platform. All discussions in these rooms are strictly confidential between the client and the advocate.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">8. Account Deletion and Data Removal</h3>
      <p>You have the absolute right to delete your account and profile data from our platform at any time. Both Clients and Advocates can go to their <strong>Dashboard &gt; Settings</strong> and click on <strong>"Delete My Account"</strong>. This action is irreversible and permanently removes your profile, personal data, and listings from our active servers.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">9. Cookies, Local Storage, and Analytics</h3>
      <p>We use cookies and local storage to distinguish you from other users and keep you logged in across different browsers and sessions. We may also use services like Google Analytics and Google AdSense to display advertisements, which use tracking mechanisms to serve personalized ads based on your visit history across the web.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">10. Device Permissions (Location & Notifications)</h3>
      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li><strong>Location Services:</strong> We may request access to your device's geolocation to help you find nearby lawyers or to verify the city for Blood Donation requests. You can deny this permission in your browser or device settings at any time, though some location-based features may not function optimally.</li>
        <li><strong>Push Notifications & Alerts:</strong> With your consent, we send browser notifications (e.g., for case hearing updates, new messages, or emergency blood requests). You can manage or revoke these notification permissions directly from your browser settings.</li>
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-3">11. Contact Us</h3>
      <p>If you have any questions about this privacy policy, please contact us at adittamahar@gmail.com.</p>
    </LegalLayout>
  );
};

export const TermsOfService = () => {
  return (
    <LegalLayout title="Terms of Service & Conditions">
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-GB')}</p>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-800 font-bold mb-1">IMPORTANT LEGAL DISCLAIMER:</p>
        <p className="text-red-700 text-sm">LawyerOnline.live is strictly a technology platform and directory. We are NOT a law firm, we DO NOT provide legal advice, and we DO NOT guarantee the outcome of any legal case. By using this platform, you agree to hold the founders and management completely harmless from any legal or financial liability.</p>
      </div>

      <h3 className="text-xl font-bold mt-6 mb-3">1. Minimum Age Requirement</h3>
      <p>You must be at least 18 years old to create an account, seek legal counsel, or interact with advocates on this platform. By using LawyerOnline.live, you represent and warrant that you are of legal age to form a binding contract.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">2. Nature of the Platform</h3>
      <p><BrandLogo /> acts solely as a bridge connecting the public with independent legal professionals globally. We do not participate in your legal representation. Any agreement, payment, or legal strategy discussed between you and the lawyer is entirely between you and the independent lawyer.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">3. Limitation of Liability and Non-Responsibility</h3>
      <p>Under no circumstances, including negligence, shall the founders, owners (Allah Ditta Mahar, Rana Khurram Shahzad), or administrators of <BrandLogo /> be liable for any direct, indirect, incidental, or consequential damages. This includes, but is not limited to:</p>
      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li>Loss of a court case or legal battle.</li>
        <li>Financial losses, fines, or penalties imposed by any court or authority.</li>
        <li>Poor or incorrect legal advice provided by any lawyer found on this platform.</li>
        <li>Payment disputes, fee refunds, or unrendered services by the lawyer.</li>
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-3">4. Verification Limitations</h3>
      <p>While <BrandLogo /> makes reasonable efforts to verify checking the National ID, Bar Council License numbers, and University Degrees of the lawyers joining our platform, we cannot 100% guarantee the absolute continuous standing of any lawyer. Licenses can be suspended by Bar Councils at any time. It is the user’s ultimate responsibility to perform their own due diligence before hiring and paying any legal professional.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">5. Rules for Clients (Citizens)</h3>
      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li><strong>Respectful Communication:</strong> You must communicate respectfully with advocates. Abusive language will result in an immediate permanent ban.</li>
        <li><strong>Direct Payments:</strong> You pay the lawyer directly for their services. LawyerOnline does not hold escrow or facilitate lawyer-client fee transfers. We are not responsible for refunds.</li>
        <li><strong>Q&A Forum Rules:</strong> Do not post personal, sensitive, or identifiable information (like ID numbers, exact addresses, or banking details) in the public Q&A sections. Ask generic legal questions.</li>
        <li><strong>Anonymity:</strong> If you post a question in the Q&A section, your display name will be public. If you wish to remain anonymous, please use a generic display name in your profile settings.</li>
        <li><strong>Verification is Not a Guarantee:</strong> Our verified badge means we checked their credentials at the time of signup. You are still responsible for assessing the lawyer's competence and current standing before paying them.</li>
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-3">6. Rules for Advocates (Lawyers)</h3>
      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li><strong>Absolute Truthfulness:</strong> You agree to provide 100% accurate information regarding your Bar Council registration, degrees, and identity. Submitting fake licenses or misrepresenting your court level is a strict violation.</li>
        <li><strong>Profile Updates Trigger Re-Verification:</strong> For security reasons, if you edit critical fields in your profile (such as your Name, Bar Council Number, or Practice City), your profile will automatically revert to "Unverified" status until our administration reviews and approves the new details.</li>
        <li><strong>Professional Conduct:</strong> You must maintain the highest standards of professional ethics as prescribed by your local or national Bar Council. We reserve the right to suspend any advocate reported for fraud or severe professional misconduct.</li>
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-3">7. Q&A and Direct Messaging Policy</h3>
      <p>The public Q&A platform is for educational and general guidance only. Answers provided by lawyers do NOT constitute a formal Attorney-Client relationship. For confidential and specific advice, you must book a private direct consultation (via WhatsApp, Phone Call, or Video Meeting) with the lawyer.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">8. Reporting Suspicious Profiles & Fraud</h3>
      <p>We rely on community vigilance to keep LawyerOnline completely secure. If you encounter a profile that appears fake, a person who is not a registered advocate, or someone engaging in scam/fraudulent behavior:</p>
      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li>Do NOT send them any money or share sensitive documents.</li>
        <li>Navigate to their profile page and click the red <strong>"Report Suspicious Profile"</strong> button.</li>
        <li>Provide a brief reason for your suspicion.</li>
      </ul>
      <p>Our administrative team will temporarily suspend the profile and investigate the claim by cross-checking Bar Council records. Profiles found guilty of fraud will be permanently deleted and reported to the relevant cybercrime authorities.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">9. Intellectual Property</h3>
      <p>The Site and its original content, features, and functionality are owned by <BrandLogo /> and are protected by intellectual property laws. You cannot scrape, copy, or steal data from our directories.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">10. Governing Law and Jurisdiction</h3>
      <p>These Terms shall be governed and construed in accordance with international administrative policies, though primarily based out of our founding operations. Any dispute arising from the use of this platform or these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>our major operational jurisdictions globally.</strong>.</p>

      <h3 className="text-xl font-bold mt-6 mb-3">11. Modifications and Termination</h3>
      <p>We reserve the right to modify these terms at any time. We also reserve the right to terminate or suspend any user or lawyer account without prior notice if we detect suspicious activity, fraud, or violations of our community standards.</p>
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