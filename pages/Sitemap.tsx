import React from 'react';
import { Network, FileText, Users, Building, ShieldCheck, Mail, Map, MonitorSmartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sitemap() {
  const sections = [
    {
      title: 'Platform',
      icon: <MonitorSmartphone className="w-5 h-5 text-blue-600" />,
      links: [
        { label: 'Home Page', path: '/' },
        { label: 'Find a Lawyer', path: '/find-lawyers' },
        { label: 'Ask Legal Q&A', path: '/qa' },
        { label: 'Careers & Jobs', path: '/jobs' },
        { label: 'Donate Blood', path: '/blood-donation' },
        { label: 'How We Work', path: '/how-we-work' }
      ]
    },
    {
      title: 'Accounts & Dashboards',
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      links: [
        { label: 'User Login & Signup', path: '/login' },
        { label: 'Lawyer Dashboard', path: '/dashboard/lawyer' },
        { label: 'Client Dashboard', path: '/dashboard/client' },
        { label: 'Admin Portal', path: '/dashboard/admin' }
      ]
    },
    {
      title: 'Legal & Compliance',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Disclaimer', path: '/disclaimer' }
      ]
    },
    {
      title: 'Support & Contact',
      icon: <Mail className="w-5 h-5 text-rose-600" />,
      links: [
        { label: 'Contact Us', path: '/contact' },
        { label: 'Submit Complaint', path: '/complaint' }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 flex justify-center items-center gap-3">
          <Map className="w-10 h-10 text-blue-600" />
          Sitemap
        </h1>
        <p className="text-slate-600 mt-4 text-lg max-w-2xl mx-auto">
          Overview of all accessible pages and directories on LawyerOnline.live. 
          Use this map to quickly navigate through our global legal platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <h2 className="flex items-center gap-2 font-bold text-lg text-slate-800 mb-6 pb-4 border-b border-slate-100">
              {section.icon} {section.title}
            </h2>
            <ul className="space-y-3">
              {section.links.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <Link 
                    to={link.path} 
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
        <Network className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700 mb-2">Can't find what you're looking for?</h3>
        <p className="text-slate-500 text-sm mb-4">Our support team is available 24/7 to help you navigate your legal journey.</p>
        <Link to="/contact" className="inline-block px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition text-sm">
          Contact Support
        </Link>
      </div>
    </div>
  );
}
