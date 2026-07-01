import React from 'react';
import { Users, Target, ShieldCheck, MapPin, Phone, Mail, Coffee, Lightbulb } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6">
          About <span className="text-blue-600">LawyerOnline.live</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          A comprehensive global digital platform designed to bridge the gap between the public and legal professionals worldwide, making justice accessible for everyone.
        </p>
      </div>

      {/* Our Story Section */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden mb-16 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-6">
              <Coffee className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">How It All Started</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The idea for LawyerOnline was born not in a corporate boardroom, but at a local tea shop in Lahore. Our founder, <strong>Allah Ditta Mahar</strong>, and his close friend <strong>Rana Khurram Shahzad</strong> were having a routine discussion about Artificial Intelligence and emerging business ideas.
            </p>
            <p className="text-slate-600 leading-relaxed">
              During their conversation, Allah Ditta realized a glaring gap in the market: while everything was moving online, finding reliable legal help and advice was still a daunting, traditional process. There was no dedicated, tech-driven platform to connect people with lawyers easily. That "eureka" moment led to the creation of LawyerOnline.
            </p>
          </div>
          <div className="bg-slate-50 border-l border-slate-100 p-8 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-6">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">The Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              Serving as a Traffic Warden in the Lahore Traffic Police, Allah Ditta interacts with the public daily. He understands the real problems common people face when navigating legal complexities.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              LawyerOnline is built to empower citizens by providing instant access to legal experts, Q&A forums, and secure consultations—all from the comfort of their homes.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Meet the Team</h2>
          <p className="text-slate-600 mt-2">The minds behind LawyerOnline</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Founder */}
          <div className="bg-white p-8 border border-slate-200 rounded-3xl text-center shadow-sm hover:shadow-md transition">
            {/* Replace src with your actual image path when available */}
            <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto mb-6 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              <span className="text-4xl text-slate-400 font-bold">AD</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Allah Ditta Mahar</h3>
            <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-4 inline-block">Founder & Sole Owner</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Serving as a Traffic Warden (equivalent to SI) in Lahore Traffic Police. His dedication to public service and keen interest in modern technology drove him to conceptualize and establish LawyerOnline.
            </p>
          </div>

          {/* Helper/Partner */}
          <div className="bg-white p-8 border border-slate-200 rounded-3xl text-center shadow-sm hover:shadow-md transition">
            {/* Replace src with your actual image path when available */}
            <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto mb-6 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              <span className="text-4xl text-slate-400 font-bold">RK</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Rana Khurram Shahzad</h3>
            <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-4 border-b border-slate-100 pb-4 inline-block">Strategic Advisor</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              A close friend, confidant, and strategic helper. Rana played a pivotal role in brainstorming the core concepts of the platform during its inception over a cup of tea.
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Location Section */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-blue-100 leading-relaxed mb-8 max-w-md">
              We are constantly working to improve LawyerOnline. If you have questions, feedback, or want to collaborate, feel free to reach out directly to our management.
            </p>
          </div>
          
          <div className="space-y-6 bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-400 font-medium">Cell Phone</p>
                <p className="font-bold">0300-0653541</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-400 font-medium">Email Address</p>
                <p className="font-bold">adittamahar@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-400 font-medium">Headquarters</p>
                <p className="font-bold leading-relaxed">
                  Sabir Chok, Pak Colony,<br />Kamahan Road, Lahore
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
