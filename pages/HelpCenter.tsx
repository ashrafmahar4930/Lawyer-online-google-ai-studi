import React from 'react';
import { HelpCircle, ChevronDown, MessageCircle, FileText, Settings, Shield } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I find a lawyer on the platform?',
    answer: 'You can use our "Find a Lawyer" directory to search by location, specialty, and experience. Once you find a suitable lawyer, you can view their profile and book a consultation directly.'
  },
  {
    question: 'Is it free to use LawyerOnline?',
    answer: 'Yes! Currently, our platform is completely free to use. You only pay for the actual legal services or consultation fees negotiated directly with your hired lawyer.'
  },
  {
    question: 'How are video consultations conducted?',
    answer: 'We provide a secure, encrypted in-browser video meeting room. Once a meeting is scheduled, you will receive a unique link to join the room securely without needing to download external software.'
  },
  {
    question: 'How do I add the Web App to my phone?',
    answer: 'LawyerOnline is a Progressive Web App. On Android, open Chrome menu and tap "Install app" or "Add to Home Screen". On iOS Safari, tap the Share icon and select "Add to Home Screen".'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption protocols. Your data, case details, and communication remain strictly confidential between you and your legal representative.'
  }
];

export default function HelpCenter() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 flex justify-center items-center gap-3">
          <HelpCircle className="w-10 h-10 text-blue-600" />
          Help Center & FAQ
        </h1>
        <p className="text-slate-600 mt-4 text-lg">
          Find answers to common questions about using LawyerOnline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition">
          <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">General</h3>
          <p className="text-sm text-slate-500 mt-1">Platform basics</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition">
          <Settings className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">Account</h3>
          <p className="text-sm text-slate-500 mt-1">Managing your profile</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition">
          <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">Privacy</h3>
          <p className="text-sm text-slate-500 mt-1">Data security details</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="text-xl font-bold p-6 border-b border-slate-100 bg-slate-50/50">Frequently Asked Questions</h2>
        <div className="flex flex-col">
          {FAQS.map((faq, idx) => (
            <details key={idx} className="group border-b border-slate-100 last:border-0">
              <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-slate-800 hover:text-blue-600 transition">
                {faq.question}
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </span>
              </summary>
              <div className="text-slate-600 px-6 pb-6 pt-0 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-slate-600 mb-4">Still need help?</p>
        <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
          <FileText className="w-5 h-5" /> Contact Support
        </a>
      </div>
    </div>
  );
}
